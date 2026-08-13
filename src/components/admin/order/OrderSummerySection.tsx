"use client";
import { ArrowDown, ArrowUp } from "lucide-react";
import VisitorOrderChart from "./VisitorOrderChart";
import OrderSummaryChart from "./OrderSummaryChart";
import ReturnIcon from "@/components/store-front/svg/svg/ReturnIcon";

const orderSummaryData = [
  { name: "Pending", value: 31, color: "#26007F" },
  { name: "Confirmed", value: 20, color: "#7AD100" },
  { name: "Delivered", value: 14, color: "#1884FF" },
  { name: "Canceled", value: 11, color: "#FAB300" },
  { name: "Paid Returned", value: 15, color: "#C71CB6" },
  { name: "Returned", value: 9, color: "#DA0000" },
];

const areaChartData = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  visitors: Math.floor(Math.random() * 40) + 20 + i * 1.5,
  orders: Math.floor(Math.random() * 30) + 10 + i * 2,
}));

export default function OrderSummerySection() {
  return (
    <div className="w-full font-lato mt-2">
      <div className="bg-[#F9F9F9] rounded-lg">
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mx-2 md:mx-4">
          {/* 1. Order Summary (Left) */}
          <div className="bg-white rounded-lg px-4 py-5 w-full">
            <h3 className="text-[#23272E] text-[18px] font-bold mb-5">
              Order Summary
            </h3>
            <div className="flex items-center justify-between">
              {/* visitor order chart */}
              <OrderSummaryChart orderSummaryData={orderSummaryData} />

              {/* Legend */}
              <div className="flex flex-col gap-2 flex-1 ml-4">
                {orderSummaryData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-1 text-[14px] font-lato"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[#000000] font-medium font-lato text-sm">
                        {item.name}
                      </span>
                    </div>
                    <span
                      className="font-medium font-lato text-sm"
                      style={{ color: item.color }}
                    >
                      ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Visitors/Orders Chart (Middle) */}
          <div className="bg-white rounded-lg p-5 w-full">
            <div className="flex gap-4 mb-8">
              <button className="font-semibold font-poppins border-[#1DA1F2] pb-1 text-sm bg-[linear-gradient(6deg,#38BDF8_4.44%,#1E90FF_94.59%)] bg-clip-text text-transparent">
                Visitors
              </button>
              <button className="font-semibold font-poppins pb-1 text-sm bg-[linear-gradient(180deg,#FF6A00_0%,#FF9F1C_100%)] bg-clip-text text-transparent">
                Orders
              </button>
            </div>
            <VisitorOrderChart areaChartData={areaChartData} />
          </div>

          {/* 3. Stats Cards (Right) */}
          <div className="flex flex-col gap-4 w-full">
            {/* GMV Card */}
            <div className="bg-white rounded-lg p-3 h-full">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[#23272E] font-bold text-lg">G M V</span>
                <span className="text-[#6A717F] font-normal font-lato text-sm">
                  Last 7 days
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[#023337] text-2xl font-bold">240</span>
                <span className="text-[#21C45D] font-lato text-sm font-bold mb-1 flex items-center gap-1">
                  <ArrowUp size={16} color="#1EB564" /> 20%
                </span>
              </div>
            </div>

            {/* AVG Order Card */}
            <div className="bg-white rounded-lg p-3 h-full">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[#1A1A1A] font-bold text-md">
                  AVG Order
                </span>
                <span className="text-[#6A717F] font-normal text-sm">
                  Per customer spend
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[#003032] text-2xl font-bold flex items-center">
                  <span className="mr-1">৳</span> 17865
                </span>
                <span className="text-[#EF4343] text-sm font-medium mb-1 flex items-center gap-1">
                  <ArrowDown size={16} color="#EF4343" /> 5%
                </span>
              </div>
            </div>

            {/* Courier Return Card */}
            <div className="bg-white rounded-lg p-3 h-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-black font-bold text-[18px]">
                  Courier Return (COD)
                </span>
                <ReturnIcon color="#DA0000" />
              </div>
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[#DA0000] text-base font-bold">50</span>
                  <span className="text-[#A1A1A1] text-[12px]">
                    Total Returned
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[#DA0000] text-base font-bold">
                    ৳5,00,000.00
                  </span>
                  <span className="text-[#A1A1A1] text-[12px]">
                    Demurrage charges
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
