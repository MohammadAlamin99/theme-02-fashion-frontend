"use client";
import React from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import FilterIcon from "../svg/FilterIcon";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

interface ProductGridHeaderProps {
  totalProducts: number;
  categoryName?: string;
}

export default function ProductGridHeader({
  totalProducts,
  categoryName,
}: ProductGridHeaderProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeSort = searchParams.get("sort") || t.productListing.popularity;

  const sortOptions = [
  t.productListing.popularity,
  t.productListing.newest,
  t.productListing.trending,
];

  const handleSort = (option: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", option);
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div
      className={`w-full bg-white transition-opacity ${isPending ? "opacity-60" : ""}`}
    >
      <div className="max-w-[1720px] mx-auto px-4">
        {/* Mobile: title + filter on same row, sort below */}
        {/* Desktop: title left, sort+filter right on same row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          {/* Row 1 (mobile): Title + Filter button side by side */}
          <div className="flex items-center justify-between lg:justify-start lg:items-baseline gap-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-black font-poppins text-xl sm:text-2xl md:text-[32px] font-semibold leading-normal">
                {categoryName || t.productListing.products}
              </h2>
              <span className="text-[#727272] font-poppins text-base sm:text-lg md:text-[24px] font-medium leading-normal">
                ({totalProducts} {t.productListing.productCount})
              </span>
            </div>

            {/* Filter button: visible on mobile here, hidden on desktop */}
            <button className="p-2.5 cursor-pointer bg-[#EAEAEA] rounded-[8px] flex-shrink-0 lg:hidden">
              <FilterIcon />
            </button>
          </div>

          {/* Row 2 (mobile): Sort options */}
          {/* On desktop: merged into right side with filter */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            {/* Sort Section */}
            <div className="flex flex-wrap items-center gap-3 md:gap-[24px]">
              <span className="text-[#828282] font-poppins text-sm sm:text-base md:text-[24px] font-medium whitespace-nowrap">
                {t.productListing.sortBy}:
              </span>

              <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSort(option)}
                    className="flex items-center gap-1.5 group transition-all cursor-pointer"
                  >
                    <IoCheckmarkCircle
                      className={`text-[18px] sm:text-xl md:text-[28px] transition-colors ${
                        activeSort === option
                          ? "text-[#FF7050]"
                          : "text-[#D9D9D9]"
                      }`}
                    />
                    <span
                      className={`font-poppins text-sm sm:text-base md:text-[24px] font-medium transition-colors ${
                        activeSort === option
                          ? "text-[#4F4F4F]"
                          : "text-[#828282]"
                      }`}
                    >
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter button: hidden on mobile (shown above), visible on desktop */}
            <button className="hidden lg:flex p-3 cursor-pointer bg-[#EAEAEA] rounded-[8px]">
              <FilterIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
