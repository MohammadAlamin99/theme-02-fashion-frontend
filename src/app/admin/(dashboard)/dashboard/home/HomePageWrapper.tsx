"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import OverviewSection from "@/components/admin/home/OverviewSection";
import DashboardStats from "@/components/admin/home/DashboardStats";
import ProductAnalytics from "@/components/admin/home/ProductAnalytics";
import SalesAnalytics from "@/components/admin/home/SalesAnalytics";
import SalesReport from "@/components/admin/home/SalesReport";
import { dashboardApi } from "@/services-api/dashboardService";
import OrderOriginChart from "@/components/admin/home/OrderOriginChart";

export type TimeFilter = "Day" | "Month" | "Year" | "All Time" | "Custom";

export default function HomePageWrapper() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("Month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const {
    data: serverResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "admin-dashboard-stats",
      activeFilter,
      selectedDate.toDateString(),
    ],
    queryFn: () =>
      dashboardApi.getStatistics(
        activeFilter,
        activeFilter === "Custom" ? selectedDate.toISOString() : undefined,
      ),
  });

  const { data: visitorStats, isLoading: visitorLoading } = useQuery({
    queryKey: ["admin-visitor-stats"],
    queryFn: () => dashboardApi.getVisitorStats(),
    refetchInterval: 30_000, // refresh every 30 seconds for live online count
  });

  const stats = serverResponse?.data || serverResponse;

  return (
    <div className="bg-[#F9F9F9]">
      <div className="mt-2">
        <OverviewSection
          stats={stats?.overview}
          isLoading={isLoading}
          isError={isError}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>

      <div className="mt-2 mr-0 md:mr-1">
        <DashboardStats
          overview={stats?.overview}
          visitorStats={visitorStats}
          lifecycle={stats?.orderLifecycle}
          chartData={stats?.charts?.performance || []}
          deviceViews={stats?.deviceViews || []}
          isLoading={isLoading || visitorLoading}
        />
      </div>

      <SalesAnalytics
        performanceData={stats?.charts?.performance || []}
        categoryData={stats?.categorySales || []}
        orderOrigin={stats?.orderOrigin || []}
        isLoading={isLoading}
      />

      <div className="mt-2 mr-0 md:mr-1 mb-4">
        <ProductAnalytics
          bestSellingData={stats?.tables?.bestSellers || []}
          isLoading={isLoading}
        />
      </div>
      <div className="mt-2 mr-0 md:mr-1 mb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesReport />
        </div>
        <div className="lg:col-span-1 h-full">
          {/* 3. Order Origin */}
          <OrderOriginChart
            data={stats?.orderOrigin || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
