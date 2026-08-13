"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

interface SubCategoryBarProps {
  subcategory?: SubCategory[];
}

export default function SubCategoryBar({ subcategory = [] }: SubCategoryBarProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("category_id") || "";

  if (!subcategory || subcategory.length === 0) return null;

  return (
    <div className="flex items-center w-full gap-4 mt-2">
      {/* Swiper Container */}
      <div className="grow overflow-hidden">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView="auto"
          loop={false}
          navigation={{
            nextEl: ".cat-next",
            prevEl: ".cat-prev",
          }}
          className="mySwiper"
        >
          {subcategory.map((item) => {
            const isActive = activeCategoryId === item.id;
            return (
              <SwiperSlide key={item.id} className="!w-auto">
                <Link
                  href={`/category/${params.slug}?category_id=${item.id}`}
                  className={`flex py-3 px-4 justify-center items-center gap-[10px] 
                             font-poppins xl:text-2xl lg:text-xl md:text-lg text-sm 
                             font-medium leading-normal rounded-xl whitespace-nowrap transition-colors
                             ${
                               isActive
                                 ? "bg-[#FF7050] text-white"
                                 : "bg-[#F5F5F5] text-black hover:bg-[#FF7050] hover:text-white"
                             }`}
                >
                  {item.name}
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Navigation Buttons using React Icons */}
      <div className="hidden items-center gap-2 shrink-0 md:flex">
        <button className="cursor-pointer cat-prev [&:not(.swiper-button-disabled)]:text-[#000000] [&.swiper-button-disabled]:text-[#848484] transition-colors">
          <MdChevronLeft className="text-4xl" />
        </button>
        <button className="cursor-pointer cat-next [&:not(.swiper-button-disabled)]:text-[#000000] [&.swiper-button-disabled]:text-[#848484] transition-colors">
          <MdChevronRight className="text-4xl" />
        </button>
      </div>
    </div>
  );
}
