"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { getPublicBanners } from "@/services-api/bannerService";

export default function BannerSlider() {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const {
    data: banners,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-banners"],
    queryFn: getPublicBanners,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div className="w-full aspect-[16/9] sm:aspect-[12/5] md:aspect-[3/1] bg-gray-100 animate-pulse" />
    );
  }

  if (isError || !banners || banners.length === 0) {
    return (
      <section className="">
        <div className="relative w-full aspect-[16/9] sm:aspect-[12/5] md:aspect-[3/1]">
          <Image
            src="/images/store-front/banner/banner.png"
            alt="Default Banner"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>
    );
  }

  // Calculate total number of images across all banner objects
  const allSlides = banners.flatMap((banner) => {
    return (banner.image_url || []).map((imgUrl, imgIndex) => ({
      ...banner,
      currentImageUrl: imgUrl,
      uniqueKey: `${banner.id}-${imgIndex}`,
    }));
  });

  return (
    <section aria-label="Promotion Slider">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        loop={allSlides.length > 1}
        grabCursor={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        speed={1000}
        className="w-full"
      >
        {allSlides.map((slide, index) => {
          const rawPath = slide.currentImageUrl || "";
          const imageSrc = rawPath.startsWith("http")
            ? rawPath
            : `${backendBaseUrl}/${rawPath.replace(/^\/+/, "")}`;

          return (
            <SwiperSlide key={slide.uniqueKey}>
              <Link
                href={slide.link_url || "#"}
                className={slide.link_url ? "cursor-pointer" : "cursor-default"}
                title={slide.meta_title}
              >
                <div className="relative w-full aspect-[16/9] sm:aspect-[12/5] md:aspect-[3/1]">
                  <Image
                    src={imageSrc}
                    alt={`${slide.meta_title || "Banner"} | ${slide.meta_tags || ""} | ${slide.meta_description || ""}`}
                    fill
                    // Only set priority for the very first image of the entire slider
                    priority={index === 0}
                    sizes="100vw"
                    className="md:object-cover object-fill"
                    unoptimized
                  />
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
