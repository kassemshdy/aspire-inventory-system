// @ts-nocheck
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface TopItemsChartProps {
  data: Array<{ name: string; value: number; quantity: number }>
}

const GRADIENT_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']

export function TopItemsChart({ data }: TopItemsChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top 5 Most Valuable Items
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#6b7280"
            fontSize={12}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number, name, props) => [
              `$${value.toLocaleString()} (${props.payload.quantity} units)`,
              'Total Value'
            ]}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 mt-4 text-center">
        Items ranked by total inventory value (quantity × unit price)
      </p>
    </div>
  )
}
