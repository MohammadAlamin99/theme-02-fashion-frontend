"use client";

import { Cell, Pie, PieChart } from 'recharts';

interface VisitorandOrderChartProps {
    orderSummaryData: { name: string; value: number; color: string; percentage?: number }[];
    total: number;
}

export default function OrderSummaryChart({ orderSummaryData, total }: VisitorandOrderChartProps) {
    return (
        <div className="relative w-40 h-40">
            <PieChart width={160} height={160}>
                <Pie
                    data={orderSummaryData}
                    innerRadius={60}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                >
                    {orderSummaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
            </PieChart>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[#939393] text-[14px] font-lato mb-1">Total</span>
                <span className="text-[#000000] text-[32px] font-bold font-lato">{total}</span>
                <span className="text-[#939393] text-[14px] font-lato">Order</span>
            </div>
        </div>
    );
}

