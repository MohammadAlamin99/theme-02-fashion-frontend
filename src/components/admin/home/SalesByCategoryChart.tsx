"use client";
import React, { useSyncExternalStore } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

const emptySubscribe = () => () => {};

export default function SalesByCategoryChart({
  pieData,
}: {
  pieData: PieChartData[];
}) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!isMounted) {
    // Return a placeholder with the same height to prevent layout shift
    return (
      <div className="w-full h-[220px] bg-gray-50 animate-pulse rounded-full" />
    );
  }

  // Handle empty data state
  if (!pieData || pieData.length === 0) {
    return (
      <div className="w-full h-[220px] flex items-center justify-center text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={pieData}
            innerRadius={65} // Slightly larger for a cleaner look
            outerRadius={95}
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
            stroke="none"
            startAngle={90}
            endAngle={-270}
            animationBegin={0}
            animationDuration={800}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="outline-none focus:outline-none"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              fontSize: "12px",
              fontWeight: "bold",
            }}
            formatter={(value: unknown) => [`${value}%`, "Sales Share"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
