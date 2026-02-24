// @ts-nocheck
'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format } from 'date-fns'

interface ActivityTimelineChartProps {
  data: Array<{
    date: string
    creates: number
    updates: number
    deletes: number
  }>
}

export function ActivityTimelineChart({ data }: ActivityTimelineChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Activity Timeline
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCreates" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorDeletes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="creates"
            stackId="1"
            stroke="#10b981"
            fill="url(#colorCreates)"
            name="Creates"
          />
          <Area
            type="monotone"
            dataKey="updates"
            stackId="1"
            stroke="#3b82f6"
            fill="url(#colorUpdates)"
            name="Updates"
          />
          <Area
            type="monotone"
            dataKey="deletes"
            stackId="1"
            stroke="#ef4444"
            fill="url(#colorDeletes)"
            name="Deletes"
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 mt-4 text-center">
        Daily inventory activity for the last 30 days
      </p>
    </div>
  )
}
