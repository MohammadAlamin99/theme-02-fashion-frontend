
"use client";
import React from "react";
import SalesByCategoryChart from "./SalesByCategoryChart";
import SalesPerformenceChart from "./SalesPerformenceChart";

interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

interface SalesAnalyticsProps {
  performanceData?: {
    label: string;
    placed: number;
    delivered: number;
    canceled: number;
  }[];
  categoryData?: CategoryData[];
  isLoading?: boolean;
}

const CATEGORY_COLORS = ["#5D36FF", "#FAA43F", "#FFBB99", "#F35050", "#AEDF33"];

const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({
  performanceData = [],
  categoryData = [],
  isLoading,
}) => {
  // ⚡ FIX: Mapping backend 'canceled' to component 'cancel'
  const formattedLineData = performanceData.map((item) => ({
    day: item.label,
    placed: item.placed,
    delivered: item.delivered,
    cancel: item.canceled, // 🚀 Corrected key mapping
  }));

  const formattedPieData = categoryData.map((item, index) => ({
    ...item,
    color: item.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2 font-poppins mr-1">
      {/* 1. Sale Performance */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg">
        <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-[18px] font-lato font-bold text-black text-left">
            Sale Performance
          </h2>
          <div className="flex gap-6 text-[12px] font-semibold">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#38BDF8]" /> Placed Order
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FB923C]" /> Order
              Delivered
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#EF4444]" /> Order Cancel
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[250px] flex items-center justify-center text-gray-400">
            Loading charts...
          </div>
        ) : (
          <SalesPerformenceChart lineData={formattedLineData} />
        )}
      </div>

      {/* 2. Sale By Category */}
      <div className="bg-white p-6 rounded-[8px] border border-gray-50 overflow-hidden">
        <h2 className="text-[18px] font-lato font-bold text-black mb-6 text-left">
          Sale By Category
        </h2>

        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center text-gray-400 animate-pulse">
            Calculating...
          </div>
        ) : formattedPieData.length > 0 ? (
          <>
            <SalesByCategoryChart pieData={formattedPieData} />
            <div className="grid grid-cols-2 gap-y-3 mt-4">
              {formattedPieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] font-medium text-gray-800">
                    {item.name}{" "}
                    <span
                      className="font-bold ml-0.5"
                      style={{ color: item.color }}
                    >
                      ({item.value}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-gray-400">
            <p className="text-xs">No sales data for this period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesAnalytics;
