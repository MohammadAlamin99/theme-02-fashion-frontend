"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useQuery } from "@tanstack/react-query";
import "swiper/css";
import "swiper/css/navigation";
import { getCategoryTree, Category } from "@/services-api/categoryService";
import HeadingText from "@/components/admin/common/HeadingText";
import ThemeButton from "@/components/admin/common/ThemeButton";
import CategoryCard from "@/components/admin/common/CategoryCard";

export default function CategoriesSection() {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // data fetch all
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories-tree"],
    queryFn: getCategoryTree,
    staleTime: 1000 * 60 * 30,
  });

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // category card formet
  const dynamicCategories = categories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    image: cat.image_url?.startsWith("http")
      ? cat.image_url
      : `${backendBaseUrl}/${cat.image_url?.replace(/^\/+/, "")}`,
    slug: cat.slug,
  }));

  // loading skeleton
  if (isLoading && categories.length === 0) {
    return (
      <section className="w-full py-8 md:py-12 bg-white animate-pulse">
        <div className="px-4 sm:px-10">
          <div className="h-8 w-40 bg-gray-200 mb-6 rounded" />
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 flex-1 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-8 md:py-12 bg-white font-inter">
      {/* Heading */}
      <HeadingText text="Category" />

      {/* Slider wrapper */}
      <div className="relative px-4 sm:px-10">
        <Swiper
          modules={[Navigation, A11y]}
          onSwiper={(swiper: SwiperType) => {
            setTimeout(() => {
              if (
                swiper?.params?.navigation &&
                typeof swiper.params.navigation !== "boolean"
              ) {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
                swiper.navigation.init();
                swiper.navigation.update();
              }
            });
          }}
          spaceBetween={12}
          slidesPerView={2}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 12 },
            640: { slidesPerView: 3, spaceBetween: 14 },
            768: { slidesPerView: 5, spaceBetween: 16 },
            1024: { slidesPerView: 6, spaceBetween: 16 },
          }}
          className="!px-1 !py-1"
        >
          {dynamicCategories.map((cat) => (
            <SwiperSlide key={cat.id}>
              <CategoryCard
                category={{
                  ...cat,
                  id: cat.id,
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* View More link */}
      <ThemeButton
        href="/category"
        text="View More"
        className="text-[#3F3F3F]"
      />
    </section>
  );
}
