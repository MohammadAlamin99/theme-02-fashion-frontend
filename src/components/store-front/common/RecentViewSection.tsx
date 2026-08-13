"use client";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import Image from "next/image";
import { recentViewProduct } from "@/services-api/productService";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string | string[];
  total_reviews: number;
  slug?: string;
  avg_rating: number;
  regular_price: number;
}

interface ApiResponse {
  data: Product[];
}

const RecentlyViewed = () => {
  const { language } = useLanguage();
  const t = translations[language];
  // 1. Fetch data using TanStack Query with Types
  const { data: products, isLoading } = useQuery<ApiResponse | null>({
    queryKey: ["recentlyViewed"],
    queryFn: () => recentViewProduct(1, 12),
  });

  if (isLoading)
    return (
      <div className="h-[200px] flex items-center justify-center">
        {t.recentlyViewed.loading}
      </div>
    );

  const productdata = products?.data;

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  if (!productdata || productdata.length === 0) return null;

  return (
    <div className="w-full bg-white">
      <div className="max-w-[1720px] mx-auto px-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="md:text-[32px] text-[20px] font-semibold text-black font-poppins">
            {t.recentlyViewed.title}
          </h2>

          <div className="flex items-center gap-4">
            <button className="recentview-prev cursor-pointer w-10 h-10 rounded-full border border-black flex items-center justify-center bg-white text-black transition-colors duration-200 [&.swiper-button-disabled]:border-[#E2E2E2] [&.swiper-button-disabled]:text-[#E2E2E2] [&.swiper-button-disabled]:cursor-not-allowed">
              <FaChevronLeft className="text-xl" />
            </button>
            <button className="recentview-next cursor-pointer w-10 h-10 rounded-full border border-black flex items-center justify-center bg-white text-black transition-colors duration-200 [&.swiper-button-disabled]:border-[#E2E2E2] [&.swiper-button-disabled]:text-[#E2E2E2] [&.swiper-button-disabled]:cursor-not-allowed">
              <FaChevronRight className="text-xl" />
            </button>
          </div>
        </div>

        {/* Swiper Slider */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={1.2}
          navigation={{
            prevEl: ".recentview-prev",
            nextEl: ".recentview-next",
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1440: { slidesPerView: 4 },
            1720: { slidesPerView: 5 },
          }}
          className="mySwiper"
        >
          {productdata.map((product: Product) => {
            // FIX: Handle if images is an array or a string
            const rawImage = Array.isArray(product?.images)
              ? product.images[0]
              : product?.images;

            const rowImage = rawImage || "";

            const iconUrl = rowImage.startsWith("http")
              ? rowImage
              : `${backendBaseUrl}/${rowImage.replace(/^\/+/, "")}`;

            return (
              <SwiperSlide key={product?._id}>
                <Link href={`/product/${product?.slug}`}>
                  <div className="bg-[#F3F3F3] rounded-lg p-4 flex items-center gap-4 h-[130px]">
                    <div className="relative min-w-[100px] h-[100px] rounded-xl flex items-center justify-center p-2">
                      <Image
                        src={iconUrl}
                        alt={product?.name || "Product"}
                        fill
                        className="w-full h-full object-contain rounded-xl"
                        unoptimized
                      />
                    </div>

                    <div className="flex flex-col justify-center overflow-hidden">
                      <h3 className="text-black font-poppins text-[16px] font-medium leading-[1.2] mb-1.5 line-clamp-2">
                        {product?.name}
                      </h3>

                      <p className="text-[#FF7050] font-poppins text-[12px] font-bold mb-1">
                        {t.product.bdt} {product?.price}
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="flex text-[#FFB800] text-xs gap-[1px]">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < Math.round(product.avg_rating)
                                  ? "text-[#FFB800]"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.total_reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default RecentlyViewed;
