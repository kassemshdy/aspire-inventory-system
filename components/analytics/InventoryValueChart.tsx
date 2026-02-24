// @ts-nocheck
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format } from 'date-fns'

interface InventoryValueChartProps {
  data: Array<{ date: string; value: number }>
}

export function InventoryValueChart({ data }: InventoryValueChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Inventory Value Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
            labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Total Value"
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 mt-4 text-center">
        Total inventory value over the last 30 days
      </p>
    </div>
  )
}
