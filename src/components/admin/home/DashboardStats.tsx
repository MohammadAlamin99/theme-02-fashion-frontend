"use client";
import React, { useSyncExternalStore } from "react";
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

interface VisitorStats {
  onlineNow: number;
  onlineByDevice?: { mobile: number; desktop: number; tab: number };
  todayVisitors: number;
  totalVisitors: number;
}

interface DashboardStatsProps {
  overview?: {
    onlineNow?: number;
    onlineByDevice?: { mobile: number; desktop: number; tab: number };
    todayVisitors?: number;
    totalVisitors?: number;
    totalOrders?: number;
  };
  visitorStats?: VisitorStats;
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
  deviceViews?: {
    date: string;
    mobile: number;
    desktop: number;
    tab: number;
  }[];
  isLoading: boolean;
}

const emptySubscribe = () => () => {};

const DashboardStats: React.FC<DashboardStatsProps> = ({
  overview,
  visitorStats,
  lifecycle,
  deviceViews = [],
  isLoading,
}) => {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const formatValue = (val?: number) =>
    isLoading ? "..." : (val?.toLocaleString() ?? "0");
  const online = visitorStats?.onlineByDevice ?? overview?.onlineByDevice;

  return (
    <div className="font-poppins">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Stats */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <VisitorStatCard
            icon={<OnlineIcon />}
            label="Online Now"
            subtext="Active visitors on site"
            value={formatValue(visitorStats?.onlineNow ?? overview?.onlineNow)}
            colorClass="text-[#008DFF]"
            bgClass="bg-[#C9E7FF]"
          />

          <VisitorStatCard
            icon={<UsersIcon />}
            label="Today Visitors"
            subtext={`Last 7 days: ${visitorStats?.todayVisitors ?? overview?.todayVisitors ?? 0}`}
            value={formatValue(
              visitorStats?.todayVisitors ?? overview?.todayVisitors,
            )}
            colorClass="text-[#FF5500]"
            bgClass="bg-[#FFDDBD]"
          />
          <VisitorStatCard
            icon={<WorldIcon />}
            label="Total Visitors"
            subtext={`${visitorStats?.totalVisitors ?? overview?.totalVisitors ?? 0} page views`}
            value={formatValue(
              visitorStats?.totalVisitors ?? overview?.totalVisitors,
            )}
            colorClass="text-[#3F34BE]"
            bgClass="bg-[#D3C9F4]"
          />
        </div>

        {/* Right Side: Recharts Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-[8px] p-5">
          {isLoading ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="animate-spin text-blue-400" size={20} />
              <p className="text-xs font-medium">Loading device data...</p>
            </div>
          ) : (
            mounted && (
              <ResponsiveContainer width="100%" height={260} minWidth={0}>
                <BarChart
                  data={deviceViews.map((d) => ({
                    name: d.date,
                    tab: d.tab,
                    desktop: d.desktop,
                    mobile: d.mobile,
                  }))}
                  margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
                  barGap={4}
                >
                  {/* 1. Define the Gradients */}
                  <defs>
                    {/* Tab View Gradient */}
                    <linearGradient
                      id="tabGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="-1.83%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#1E90FF" />
                    </linearGradient>

                    {/* Desktop View Gradient */}
                    <linearGradient
                      id="desktopGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#A08BFF" />
                      <stop offset="100%" stopColor="#5943FF" />
                    </linearGradient>

                    {/* Mobile View Gradient */}
                    <linearGradient
                      id="mobileGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#FF9F1C" />
                      <stop offset="100%" stopColor="#FF6A00" />
                    </linearGradient>
                  </defs>

                  {/* Grid - Set to horizontal only to match image */}
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A7A7A7", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A7A7A7", fontSize: 12 }}
                    domain={[0, 300]}
                    ticks={[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300]}
                  />

                  <Tooltip
                    cursor={{ fill: "#F8FAFC" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: "30px",
                      fontSize: "12px",
                      color: "#64748B",
                    }}
                  />

                  {/* 2. Apply Gradients and 16px bar width */}
                  <Bar
                    dataKey="tab"
                    name="Tab View"
                    fill="url(#tabGradient)"
                    radius={[2, 2, 0, 0]}
                    barSize={16}
                  />
                  <Bar
                    dataKey="desktop"
                    name="Desktop View"
                    fill="url(#desktopGradient)"
                    radius={[2, 2, 0, 0]}
                    barSize={16}
                  />
                  <Bar
                    dataKey="mobile"
                    name="Mobile View"
                    fill="url(#mobileGradient)"
                    radius={[2, 2, 0, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            )
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
