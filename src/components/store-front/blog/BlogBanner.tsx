"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Swiper CSS
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getMainBanner } from "@/services-api/blogService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

const BlogBanner = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // 1. Fetch data using TanStack Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["mainBanner"],
    queryFn: getMainBanner,
  });

  const banner = data?.data;
  const banners = banner ? [banner] : [];

  // লোডিং স্টেট
  if (isLoading) {
    return (
      <div className="w-full h-[450px] md:h-[600px] bg-gray-200 animate-pulse rounded-[35px] container mx-auto mt-10">
      <span className="text-gray-500">{t.blogBanner.loading}</span>
      </div>
    );
  }

  // এরর বা ডাটা না থাকলে হাইড রাখা
  if (isError || banners.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 px-4 md:px-10 bg-white">
      <div className="max-w-[1720px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-black font-poppins text-[36px] md:text-[48px] font-bold mb-4">
            {t.blogBanner.title}
          </h2>
          <p className="text-black font-poppins text-[16px] md:text-[18px] font-normal mb-4">
            {t.blogBanner.subtitle}
          </p>
        </div>

        {/* Blog Slider Container */}
        <div className="relative group">
          {/* Custom Navigation Arrows */}
          <button className="blog-prev absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-black text-2xl border border-gray-100 hover:bg-[#FF7050] hover:text-white transition-all">
            <FiChevronLeft />
          </button>
          <button className="blog-next absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-black text-2xl border border-gray-100 hover:bg-[#FF7050] hover:text-white transition-all">
            <FiChevronRight />
          </button>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            loop={banners.length > 1}
            autoplay={{ delay: 5000 }}
            navigation={{
              prevEl: ".blog-prev",
              nextEl: ".blog-next",
            }}
            pagination={{ clickable: true }}
            className="rounded-[20px] md:rounded-[35px] overflow-hidden"
          >
            {banners.map((item, index) => {
              // ইমেজ ইউআরএল ফরম্যাট করা
              const imageUrl = item.image_url?.startsWith("http")
                ? item.image_url
                : `${backendBaseUrl}/${item.image_url?.replace(/^\/+/, "")}`;

              return (
                <SwiperSlide key={index}>
                  <div className="relative h-[450px] md:h-[600px] w-full">
                    <Image
                      src={imageUrl}
                      alt="Blog Banner"
                      fill
                      className="object-cover md:object-fill"
                      priority
                      unoptimized
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default BlogBanner;
