"use client";

import React from "react";
import { FaClock, FaFire } from "react-icons/fa";
import { HomeTagSection } from "@/services-api/tagService";

export interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

interface FlashSaleBannerProps {
  flashSale: HomeTagSection;
  timeLeft: TimeLeft;
  bannerImgUrl: string;
}

export default function FlashSaleBanner({
  flashSale,
  timeLeft,
  bannerImgUrl,
}: FlashSaleBannerProps) {
  const timeUnits: { label: string; val: string }[] = [
    { label: "Days", val: timeLeft.days },
    { label: "Hours", val: timeLeft.hours },
    { label: "Mins", val: timeLeft.minutes },
    { label: "Secs", val: timeLeft.seconds },
  ];

  return (
    <div
      className="relative overflow-hidden flex flex-col justify-center rounded-lg p-6 sm:p-10 md:p-14 mb-10 text-white transition-all h-[200px]"
      style={{
        backgroundImage: bannerImgUrl ? `url("${bannerImgUrl}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dynamic background lighting elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7CB640]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FF7050]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-12 w-full">
        {/* Text & Meta Information */}
        <div className="w-full lg:flex-1 text-center lg:text-left space-y-4">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-2 bg-[#103060] text-white text-xs md:text-sm font-poppins font-bold px-3.5 py-1.5 rounded-full shadow-md animate-pulse">
              <FaFire className="text-yellow-300" />⚡ FLASH SALE - LIVE NOW
            </span>
          </div>

          <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white drop-shadow-md">
            {flashSale.meta_title || flashSale.title}
          </h1>

          {(flashSale.meta_description || flashSale.description) && (
            <p className="font-poppins text-gray-200 text-sm md:text-base max-w-2xl leading-relaxed">
              {flashSale.meta_description || flashSale.description}
            </p>
          )}
        </div>

        {/* Countdown Timer Block */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold tracking-wider uppercase mb-4">
            <FaClock
              className="animate-spin text-xl"
              style={{ animationDuration: "6s" }}
            />
            Hurry! Ends In
          </div>

          <div className="flex items-start gap-2 sm:gap-5">
            {timeUnits.map((item, idx) => (
              <React.Fragment key={item.label}>
                <div className="flex flex-col items-center">
                  <div className="bg-[#7CB640] text-white font-mono text-xl sm:text-4xl font-extrabold px-2.5 sm:px-5 py-2 sm:py-3 rounded-xl shadow-inner border border-white/10 min-w-[46px] sm:min-w-[70px] text-center">
                    {item.val}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-white mt-2 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
                {idx < timeUnits.length - 1 && (
                  <span className="text-white text-xl sm:text-4xl font-bold opacity-75 mt-2 sm:mt-3">
                    :
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
