import { Database } from '@/lib/types/database.types'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export function exportToCSV(items: InventoryItem[], filename: string = 'inventory-export.csv') {
  // Define CSV headers
  const headers = [
    'Name',
    'Description',
    'SKU',
    'Category',
    'Quantity',
    'Unit Price',
    'Status',
    'Low Stock Threshold',
    'Created At',
  ]

  // Convert items to CSV rows
  const rows = items.map(item => [
    item.name,
    item.description || '',
    item.sku,
    item.category,
    item.quantity.toString(),
    item.unit_price.toString(),
    item.status,
    item.low_stock_threshold.toString(),
    new Date(item.created_at).toISOString(),
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export interface CSVImportRow {
  name: string
  description?: string
  sku: string
  category: string
  quantity: number
  unit_price: number
  status?: 'in_stock' | 'low_stock' | 'ordered' | 'discontinued'
  low_stock_threshold?: number
}

export function parseCSV(csvText: string): CSVImportRow[] {
  const lines = csvText.split('\n').filter(line => line.trim())

  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid')
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

  // Parse rows
  const rows: CSVImportRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))

    if (values.length !== headers.length) {
      console.warn(`Skipping row ${i + 1}: column count mismatch`)
      continue
    }

    const row: any = {}
    headers.forEach((header, index) => {
      const value = values[index]

      // Map CSV headers to object properties
      const headerMap: Record<string, string> = {
        'Name': 'name',
        'Description': 'description',
        'SKU': 'sku',
        'Category': 'category',
        'Quantity': 'quantity',
        'Unit Price': 'unit_price',
        'Status': 'status',
        'Low Stock Threshold': 'low_stock_threshold',
      }

      const key = headerMap[header]
      if (!key) return

      // Convert values to appropriate types
      if (key === 'quantity' || key === 'low_stock_threshold') {
        row[key] = parseInt(value) || 0
      } else if (key === 'unit_price') {
        row[key] = parseFloat(value) || 0
      } else {
        row[key] = value
      }
    })

    // Validate required fields
    if (!row.name || !row.sku || !row.category) {
      console.warn(`Skipping row ${i + 1}: missing required fields`)
      continue
    }

    rows.push(row)
  }

  return rows
}
