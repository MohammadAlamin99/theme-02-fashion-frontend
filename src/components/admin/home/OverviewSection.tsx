

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef, useEffect, ReactNode } from "react";
import StatCard from "./StatCard";
import NotificationItem from "./NotificationIte";
import ThreeBarIcon from "@/components/store-front/svg/svg/ThreeBarIcon";
import TotalProductIcon from "@/components/store-front/svg/svg/TotalProductIcon";
import DiscountIcon from "@/components/store-front/svg/svg/DiscountIcon";
import FileIcon from "@/components/store-front/svg/svg/FileIcon";
import { TimeFilter } from "@/app/admin/(dashboard)/dashboard/home/HomePageWrapper";

interface OverviewSectionProps {
  stats: any; // This receives stats.overview from the backend
  isLoading: boolean;
  isError: boolean;
  activeFilter: TimeFilter;
  setActiveFilter: (filter: TimeFilter) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  stats,
  isLoading,
  isError,
  activeFilter,
  setActiveFilter,
  selectedDate,
  setSelectedDate,
}) => {
  // Local UI State for the custom calendar popup
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const calendarRef = useRef<HTMLDivElement | null>(null);

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateLabel = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  console.log(stats, "OverviewSection.tsx: stats prop");

  // Calendar Day Generator
  const renderDays = (): ReactNode[] => {
    const days: ReactNode[] = [];
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();

    // Fill empty slots for previous month's trailing days
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Render current month's days
    for (let d = 1; d <= totalDays; d++) {
      const isSelected =
        selectedDate.getDate() === d &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      days.push(
        <button
          key={`day-${d}`}
          type="button"
          onClick={() => {
            const newDate = new Date(year, month, d);
            setSelectedDate(newDate);
            setActiveFilter("Custom");
            setShowCalendar(false);
          }}
          className={`h-8 w-8 text-xs rounded-full flex items-center justify-center transition-all cursor-pointer outline-none ${
            isSelected
              ? "bg-[#38BDF8] text-white font-bold"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {d}
        </button>,
      );
    }
    return days;
  };

  return (
    <div className="px-6 py-2 bg-white rounded-[8px] font-poppins relative border border-gray-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-4">
        <h2 className="text-base font-semibold text-black">Overview</h2>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-[8px] flex-wrap">
          {["Day", "Month", "Year", "All Time"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter as TimeFilter)}
              className={`px-4 py-1.5 text-sm font-medium rounded-[8px] transition-all cursor-pointer outline-none ${
                activeFilter === filter ? "text-white" : "text-[#A7A7A7]"
              }`}
              style={{
                background:
                  activeFilter === filter
                    ? "linear-gradient(180deg, #FF6A00 0%, #FF9F1C 100%)"
                    : "transparent",
              }}
            >
              {filter}
            </button>
          ))}

          {/* Custom Date Picker Toggle */}
          <div className="relative" ref={calendarRef}>
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 ml-2 px-4 py-1.5 text-white text-sm font-medium rounded-[8px] cursor-pointer outline-none shadow-sm"
              style={{
                background: "linear-gradient(90deg, #38BDF8 0%, #1E90FF 100%)",
              }}
            >
              {formatDateLabel(selectedDate)}
              <ThreeBarIcon />
            </button>

            {/* Calendar UI */}
            {showCalendar && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-xl p-4 z-50 w-[280px] animate-in fade-in zoom-in duration-150">
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-sm font-bold text-gray-800">
                    {formatDateLabel(viewDate)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setViewDate(
                          new Date(viewDate.setMonth(viewDate.getMonth() - 1)),
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setViewDate(
                          new Date(viewDate.setMonth(viewDate.getMonth() + 1)),
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 mb-2 text-center">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <span
                      key={`${day}-${i}`}
                      className="text-[10px] font-bold text-gray-400"
                    >
                      {day}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1 text-center">
                  {renderDays()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={
            isLoading ? "..." : stats?.totalProducts?.toLocaleString() || "0"
          }
          icon={<TotalProductIcon />}
        />
        <StatCard
          label="Total Orders"
          value={
            isLoading ? "..." : stats?.totalOrders?.toLocaleString() || "0"
          }
          icon={<FileIcon />}
        />
        <StatCard
          label="Total Amount"
          value={
            isLoading
              ? "..."
              : `৳${Number(stats?.totalRevenue || 0).toLocaleString()}`
          }
          icon={<DiscountIcon />}
        />

        {/* Dynamic Notification Section */}
        <div className="bg-[#F9F9F9] p-4 rounded-[8px] flex flex-col justify-between relative overflow-hidden min-h-[115px]">
          <div className="absolute right-0 top-3 bottom-3 w-[3px] bg-[#FF6A00] rounded-l-full"></div>
          <h3 className="text-sm font-normal text-black font-poppins mb-3">
            System Alerts
          </h3>
          <div className="space-y-1">
            <NotificationItem
              text={
                isLoading
                  ? "Syncing..."
                  : `${stats?.totalProducts || 0} Catalog Items`
              }
            />
            <NotificationItem text="Inventory data updated" />
          </div>
        </div>
      </div>

      {isError && (
        <p className="text-red-500 text-xs mt-2 text-right font-medium">
          ⚠️ Network Error: Unable to fetch live statistics.
        </p>
      )}
    </div>
  );
};

export default OverviewSection;
