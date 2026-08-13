"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import OverviewSection from "@/components/admin/home/OverviewSection";
import DashboardStats from "@/components/admin/home/DashboardStats";
import ProductAnalytics from "@/components/admin/home/ProductAnalytics";
import SalesAnalytics from "@/components/admin/home/SalesAnalytics";
import { dashboardApi } from "@/services-api/dashboardService";

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
      dashboardApi.getStatistics(activeFilter, selectedDate.toISOString()),
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
          lifecycle={stats?.orderLifecycle}
          chartData={stats?.charts?.performance || []}
          isLoading={isLoading}
        />
      </div>

      <SalesAnalytics
        performanceData={stats?.charts?.performance || []}
        categoryData={stats?.categorySales || []} 
        isLoading={isLoading}
      />

      <div className="mt-2 mr-0 md:mr-1 mb-4">
        <ProductAnalytics
          bestSellingData={stats?.tables?.bestSellers || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
