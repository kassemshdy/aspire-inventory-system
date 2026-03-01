import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Fetch all inventory items
    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (itemsError) {
      console.error('Error fetching inventory:', itemsError)
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: 'No inventory data available for analysis'
      })
    }

    // Prepare inventory summary for AI
    const inventorySummary = {
      totalItems: items.length,
      categories: {} as Record<string, { count: number; lowStock: number; totalValue: number }>,
      lowStockItems: items.filter((item: any) => item.status === 'low_stock'),
      statusBreakdown: {
        in_stock: items.filter((item: any) => item.status === 'in_stock').length,
        low_stock: items.filter((item: any) => item.status === 'low_stock').length,
        ordered: items.filter((item: any) => item.status === 'ordered').length,
        discontinued: items.filter((item: any) => item.status === 'discontinued').length,
      }
    }

    // Build category analysis
    items.forEach((item: any) => {
      if (!inventorySummary.categories[item.category]) {
        inventorySummary.categories[item.category] = { count: 0, lowStock: 0, totalValue: 0 }
      }
      inventorySummary.categories[item.category].count++
      inventorySummary.categories[item.category].totalValue += (item.quantity * item.unit_price)
      if (item.status === 'low_stock') {
        inventorySummary.categories[item.category].lowStock++
      }
    })

    // Call Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const prompt = `You are an inventory management AI assistant. Analyze the following inventory data and provide smart purchasing recommendations.

Inventory Summary:
- Total Items: ${inventorySummary.totalItems}
- Low Stock Items: ${inventorySummary.lowStockItems.length}

Category Breakdown:
${Object.entries(inventorySummary.categories).map(([category, data]) =>
  `- ${category}: ${data.count} items, ${data.lowStock} low stock, $${data.totalValue.toFixed(2)} total value`
).join('\n')}

Status Distribution:
- In Stock: ${inventorySummary.statusBreakdown.in_stock}
- Low Stock: ${inventorySummary.statusBreakdown.low_stock}
- Ordered: ${inventorySummary.statusBreakdown.ordered}
- Discontinued: ${inventorySummary.statusBreakdown.discontinued}

Low Stock Items:
${inventorySummary.lowStockItems.map((item: any) =>
  `- ${item.name} (${item.category}): ${item.quantity} units remaining`
).join('\n') || 'None'}

Based on this inventory analysis, provide 5-7 smart purchasing recommendations. For each recommendation, suggest a specific product that would:
1. Replenish low stock items
2. Fill gaps in underrepresented categories
3. Add complementary products to existing inventory
4. Consider market trends and common business needs

Return your response as a JSON array with this exact structure:
[
  {
    "itemName": "Specific product name",
    "category": "Product category",
    "reason": "Why this purchase makes sense (1-2 sentences)",
    "estimatedPrice": "Price range like $50-$100",
    "priority": "high" | "medium" | "low",
    "type": "replenishment" | "expansion" | "complementary"
  }
]

Important: Return ONLY the JSON array, no other text or explanation.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Parse AI response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let recommendations = []

    try {
      // Extract JSON from response (handle if AI adds extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0])
      } else {
        recommendations = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('Response text:', responseText)
      return NextResponse.json({
        error: 'Failed to parse AI recommendations',
        rawResponse: responseText
      }, { status: 500 })
    }

    return NextResponse.json({
      recommendations,
      generatedAt: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' // Cache for 5 minutes
      }
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
