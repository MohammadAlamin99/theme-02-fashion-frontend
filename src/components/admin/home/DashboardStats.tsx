"use client";
import React, { useEffect, useSyncExternalStore } from "react";
import { Clock, XCircle, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import VisitorStatCard from "./VisitorStatCard";
import OnlineIcon from "@/components/store-front/svg/svg/OnlineIcon";
import UsersIcon from "@/components/store-front/svg/svg/UsersIcon";
import WorldIcon from "@/components/store-front/svg/svg/WorldIcon";
import OrderStatusItem from "./OrderStatusItem";
import ConfirmIcon from "@/components/store-front/svg/svg/ConfirmIcon";
import TruckIcon from "@/components/store-front/svg/svg/TruckIcon";
import DeliverdIcon from "@/components/store-front/svg/svg/DeliverdIcon";
import ReturnIcon from "@/components/store-front/svg/svg/ReturnIcon";

interface DashboardStatsProps {
  overview?: {
    onlineNow: number;
    totalOrders: number;
    totalVisitors: number;
  };
  lifecycle?: {
    PENDING: number;
    CONFIRMED: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELED: number;
    RETURNED: number;
  };
  chartData?: {
    label: string;
    placed: number;
    delivered: number;
    canceled: number;
  }[];
  isLoading: boolean;
}

const emptySubscribe = () => () => {};

const DashboardStats: React.FC<DashboardStatsProps> = ({
  overview,
  lifecycle,
  chartData = [],
  isLoading,
}) => {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (chartData.length > 0) {
      console.log("📊 Chart Data Arrived:", chartData);
    }
  }, [chartData]);

  const formatValue = (val?: number) =>
    isLoading ? "..." : (val?.toLocaleString() ?? "0");

  return (
    <div className="font-poppins">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Stats */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <VisitorStatCard
            icon={<OnlineIcon />}
            label="Online Now"
            subtext="Live users"
            value={formatValue(overview?.onlineNow)}
            colorClass="text-[#008DFF]"
            bgClass="bg-[#C9E7FF]"
          />
          <VisitorStatCard
            icon={<UsersIcon />}
            label="Total Orders"
            subtext="In selected period"
            value={formatValue(overview?.totalOrders)}
            colorClass="text-[#FF5500]"
            bgClass="bg-[#FFDDBD]"
          />
          <VisitorStatCard
            icon={<WorldIcon />}
            label="Total Visitors"
            subtext="All time visits"
            value={formatValue(overview?.totalVisitors)}
            colorClass="text-[#3F34BE]"
            bgClass="bg-[#D3C9F4]"
          />
        </div>

        {/* Right Side: Recharts Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-[8px] p-5 min-h-[320px] min-w-0">
          {mounted && !isLoading ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="placed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#1E90FF" />
                  </linearGradient>
                  <linearGradient id="delivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A08BFF" />
                    <stop offset="100%" stopColor="#5943FF" />
                  </linearGradient>
                  <linearGradient id="canceled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF9F1C" />
                    <stop offset="100%" stopColor="#FF6A00" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="#F1F5F9"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#A7A7A7", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#A7A7A7", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "#F8FAFC" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    paddingBottom: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                />

                {/* ⚡ Ensure these keys match the backend exactly */}
                <Bar
                  dataKey="placed"
                  name="Placed"
                  fill="url(#placed)"
                  radius={[4, 4, 0, 0]}
                  barSize={8}
                />
                <Bar
                  dataKey="delivered"
                  name="Delivered"
                  fill="url(#delivered)"
                  radius={[4, 4, 0, 0]}
                  barSize={8}
                />
                <Bar
                  dataKey="canceled"
                  name="Canceled"
                  fill="url(#canceled)"
                  radius={[4, 4, 0, 0]}
                  barSize={8}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="animate-spin text-blue-400" />
              <p className="text-xs font-medium">
                Generating performance chart...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lifecycle Section */}
      <div className="bg-white px-6 py-4 rounded-[8px] mt-2">
        <h2 className="text-base font-bold text-[#023337] mb-4">
          Order Lifecycle
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <OrderStatusItem
            icon={<Clock color="#D4AA00" size={20} />}
            label="Pending"
            value={formatValue(lifecycle?.PENDING)}
            iconBg="bg-[#FEF3C6]"
          />
          <OrderStatusItem
            icon={<ConfirmIcon />}
            label="Confirmed"
            value={formatValue(lifecycle?.CONFIRMED)}
            iconBg="bg-[#DCFCE7]"
          />
          <OrderStatusItem
            icon={<TruckIcon />}
            label="Shipped"
            value={formatValue(lifecycle?.SHIPPED)}
            iconBg="bg-[#FFEDD5]"
          />
          <OrderStatusItem
            icon={<DeliverdIcon />}
            label="Delivered"
            value={formatValue(lifecycle?.DELIVERED)}
            iconBg="bg-[#FFD9F4]"
          />
          <OrderStatusItem
            icon={<XCircle color="#DF0800" size={20} />}
            label="Canceled"
            value={formatValue(lifecycle?.CANCELED)}
            iconBg="bg-[#FEE2E1]"
          />
          <OrderStatusItem
            icon={<ReturnIcon />}
            label="Returns"
            value={formatValue(lifecycle?.RETURNED)}
            iconBg="bg-[#DBEAFF]"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
