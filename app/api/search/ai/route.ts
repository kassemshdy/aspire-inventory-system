import { NextRequest, NextResponse } from 'next/server'
import { interpretSearchQuery } from '@/lib/ai/claude-client'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Interpret the query using Claude
    const result = await interpretSearchQuery(query)

    // Build and execute the database query
    let dbQuery = supabase.from('inventory_items').select('*')

    // Apply text search
    if (result.filters.text_search) {
      const searchTerm = `%${result.filters.text_search}%`
      dbQuery = dbQuery.or(
        `name.ilike.${searchTerm},description.ilike.${searchTerm},sku.ilike.${searchTerm}`
      )
    }

    // Apply category filters
    if (result.filters.categories && result.filters.categories.length > 0) {
      dbQuery = dbQuery.in('category', result.filters.categories)
    }

    // Apply status filters
    if (result.filters.statuses && result.filters.statuses.length > 0) {
      dbQuery = dbQuery.in('status', result.filters.statuses)
    }

    // Apply quantity filters
    if (result.filters.quantity_min !== null) {
      dbQuery = dbQuery.gte('quantity', result.filters.quantity_min)
    }
    if (result.filters.quantity_max !== null) {
      dbQuery = dbQuery.lte('quantity', result.filters.quantity_max)
    }

    // Apply price filters
    if (result.filters.price_min !== null) {
      dbQuery = dbQuery.gte('unit_price', result.filters.price_min)
    }
    if (result.filters.price_max !== null) {
      dbQuery = dbQuery.lte('unit_price', result.filters.price_max)
    }

    const { data: items, error: dbError } = await dbQuery.order('created_at', {
      ascending: false,
    })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      items,
      filters: result.filters,
      explanation: result.explanation,
      count: items?.length || 0,
    })
  } catch (error: any) {
    console.error('AI search error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
