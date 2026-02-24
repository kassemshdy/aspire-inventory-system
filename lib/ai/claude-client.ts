import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface SearchFilters {
  text_search: string | null
  categories: string[] | null
  statuses: string[] | null
  quantity_min: number | null
  quantity_max: number | null
  price_min: number | null
  price_max: number | null
}

export interface AISearchResult {
  filters: SearchFilters
  explanation: string
}

export async function interpretSearchQuery(query: string): Promise<AISearchResult> {
  const systemPrompt = `You are an inventory search assistant. Given a natural language query, convert it to structured search parameters.

Database schema:
- name: string (item name)
- description: string
- category: string (e.g., "Electronics", "Office Supplies", "Furniture", "Hardware", "Accessories")
- quantity: number
- status: 'in_stock' | 'low_stock' | 'ordered' | 'discontinued'
- unit_price: number (in USD)
- sku: string

Return JSON in this exact format:
{
  "filters": {
    "text_search": string | null,
    "categories": string[] | null,
    "statuses": string[] | null,
    "quantity_min": number | null,
    "quantity_max": number | null,
    "price_min": number | null,
    "price_max": number | null
  },
  "explanation": "Brief explanation of what you understood from the query"
}

Guidelines:
- text_search: Keywords to search in name, description, SKU
- categories: Match to existing categories (Electronics, Office Supplies, Furniture, Hardware, Accessories)
- statuses: Must be one of: in_stock, low_stock, ordered, discontinued
- Price and quantity ranges should be reasonable
- If something is unclear, make your best interpretation

Examples:
Query: "show me low stock electronics"
Response: {
  "filters": {
    "text_search": null,
    "categories": ["Electronics"],
    "statuses": ["low_stock"],
    "quantity_min": null,
    "quantity_max": null,
    "price_min": null,
    "price_max": null
  },
  "explanation": "Searching for Electronics items with low stock status"
}

Query: "cameras under $500"
Response: {
  "filters": {
    "text_search": "camera",
    "categories": null,
    "statuses": null,
    "quantity_min": null,
    "quantity_max": null,
    "price_min": null,
    "price_max": 500
  },
  "explanation": "Searching for camera-related items priced under $500"
}

Query: "items we need to reorder"
Response: {
  "filters": {
    "text_search": null,
    "categories": null,
    "statuses": ["low_stock", "ordered"],
    "quantity_min": null,
    "quantity_max": null,
    "price_min": null,
    "price_max": null
  },
  "explanation": "Showing items with low stock or already ordered status that need attention"
}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
      system: systemPrompt,
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content.text.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      // Remove ```json or ``` at the start
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '')
      // Remove ``` at the end
      jsonText = jsonText.replace(/\n?```\s*$/, '')
    }

    // Parse the JSON response
    const result = JSON.parse(jsonText.trim()) as AISearchResult

    return result
  } catch (error: any) {
    console.error('Error calling Claude API:', error)
    throw new Error('Failed to interpret search query: ' + error.message)
  }
}
