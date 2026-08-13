"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface LineData {
    day: string | number;
    placed: number;
    delivered: number;
    cancel: number;
}

export default function SalesPerformenceChart({ lineData }: { lineData: LineData[] }) {
    return (
        <div className="w-full min-w-0 relative">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid vertical={false} stroke="#F1F5F9" />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="placed"
                        stroke="#38BDF8"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="delivered"
                        stroke="#FB923C"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="cancel"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}