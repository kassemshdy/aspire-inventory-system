// @ts-nocheck
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'

interface StatusBreakdownChartProps {
  data: Array<{ status: string; count: number; value: number }>
}

const STATUS_COLORS = {
  in_stock: '#10b981',
  low_stock: '#f59e0b',
  ordered: '#3b82f6',
  discontinued: '#6b7280',
}

const STATUS_LABELS = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  ordered: 'Ordered',
  discontinued: 'Discontinued',
}

export function StatusBreakdownChart({ data }: StatusBreakdownChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    name: STATUS_LABELS[item.status] || item.status,
  }))

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Status Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string, props) => {
              if (name === 'count') {
                return [value, 'Items']
              }
              return [`$${value.toLocaleString()}`, 'Total Value']
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#3b82f6" name="Items" radius={[8, 8, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[data[index].status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div key={item.status} className="flex items-center justify-between text-sm border-l-4 pl-3 py-2" style={{ borderColor: STATUS_COLORS[item.status] }}>
            <span className="text-gray-700 font-medium">{STATUS_LABELS[item.status]}</span>
            <span className="text-gray-900 font-semibold">{item.count} items</span>
          </div>
        ))}
      </div>
    </div>
  )
}
