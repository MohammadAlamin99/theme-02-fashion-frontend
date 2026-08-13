"use client";

import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, Tooltip, XAxis, YAxis } from "recharts";

interface AreaChartData {
    day: number | string;
    visitors: number;
    orders: number;
}

export default function VisitorOrderChart({ areaChartData }: { areaChartData: AreaChartData[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            setWidth(entries[0].contentRect.width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full">
            {width > 0 && (
                <AreaChart width={width} height={224} data={areaChartData}>
                    <defs>
                        {/* Blue Gradient - Visitors */}
                        <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#1E90FF" stopOpacity={0} />
                        </linearGradient>

                        {/* Orange Gradient - Orders */}
                        <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FF9F1C" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        interval={0}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    />
                    <Tooltip />
                    {/* Updated Strokes to match your hex codes */}
                    <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="#1E90FF"
                        fillOpacity={1}
                        fill="url(#colorVis)"
                    />
                    <Area
                        type="monotone"
                        dataKey="orders"
                        stroke="#FF6A00"
                        fillOpacity={1}
                        fill="url(#colorOrd)"
                    />
                </AreaChart>
            )}
        </div>
    );
}