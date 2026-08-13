"use client";

import { Ban, Repeat, Star, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { reviewApi } from "@/services-api/reviewService";

import ReviewHead from "@/components/admin/review/ReviewHead";
import { StatCard } from "@/components/admin/common/StatCard";
import CustomersReviewsMainSection from "@/components/admin/review/CustomersReviewsMainSection";
import PermissionGuard from "@/components/admin/common/PermissionGuard";

export default function Page() {
  // 🚀 Fetch live dashboard metric summaries securely via service-api layer
  const { data: metricsPayload, error } = useQuery({
    queryKey: ["admin-customer-review-stats"],
    queryFn: async () => {
      const res = await reviewApi.getMetrics();
      return res;
    },
  });

  // 🛡️ Safe Extraction: Accommodate direct return values or a nested .data envelope shape
  const liveMetrics = metricsPayload?.data || metricsPayload || {};

  const statsData = [
    {
      title: "Customer",
      val: String(liveMetrics.totalUsers ?? "0"),
      sub: "Total user",
      icon: User,
      iconBgColor: "bg-gradient-to-r from-[#38BDF8] to-[#1E90FF]",
      bgColor: "bg-[#F1F9FF]",
      textColor: "text-white",
    },
    {
      title: "Review",
      val: String(liveMetrics.totalReviews ?? "0"),
      sub: "Consumers review",
      icon: Star,
      iconBgColor: "bg-gradient-to-b from-[#FF6A00] to-[#FF9F1C]",
      bgColor: "bg-[#FFF7F1]",
      textColor: "text-white",
    },
    {
      title: "Recurring customers",
      val: String(liveMetrics.recurringUsers ?? "0"),
      sub: "Repeat customers",
      icon: Repeat,
      iconBgColor: "bg-[#085E00]",
      bgColor: "bg-[#F1FFEF]",
      textColor: "text-white",
    },
    {
      title: "Blocked",
      val: String(liveMetrics.blockedUsers ?? "0"),
      sub: "Blocked users",
      icon: Ban,
      iconBgColor: "bg-[#DA0000]",
      bgColor: "bg-[#FFF7F1]",
      textColor: "text-white",
    },
  ];

  if (error) {
    console.error("Dashboard statistics loading exception:", error);
  }

  return (
    <PermissionGuard permission="Customer & Review">
      <div className="flex h-screen">
        <main className="flex-1">
          <div className="p-2 md:p-0">
            <div className="bg-white">
              <ReviewHead />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full p-4 bg-white mb-4">
                {statsData.map((stat, index) => (
                  <StatCard
                    key={index}
                    title={stat.title}
                    val={stat.val}
                    sub={stat.sub}
                    icon={stat.icon}
                    iconBgColor={stat.iconBgColor}
                    bgColor={stat.bgColor}
                    textColor={stat.textColor}
                  />
                ))}
              </div>
              <CustomersReviewsMainSection />
            </div>
          </div>
        </main>
      </div>
    </PermissionGuard>
  );
}
