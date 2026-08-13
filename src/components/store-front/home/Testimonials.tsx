"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import {
  getTestimonials,
  Testimonial,
} from "@/services-api/testimonialService";
import "swiper/css";
import "swiper/css/pagination";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

const Testimonials = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // 1. TanStack Queries for both types
  const { data: facebookRes } = useQuery({
    queryKey: ["testimonials", "FACEBOOK"],
    queryFn: () => getTestimonials("FACEBOOK"),
  });

  const { data: youtubeRes } = useQuery({
    queryKey: ["testimonials", "YOUTUBE"],
    queryFn: () => getTestimonials("YOUTUBE"),
  });

  const backendBaseUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:8082",
    [],
  );

  // 2. Data processing function
  const processImage = (url: string | null) => {
    if (!url) return "/images/placeholder.svg";
    return url.startsWith("http")
      ? url
      : `${backendBaseUrl}/${url.replace(/^\/+/, "")}`;
  };

  const facebookReviews = facebookRes?.data || [];
  const youtubeReviews = youtubeRes?.data || [];

  const PlayIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
    >
      <path
        d="M44.6018 19.4854C45.6024 20.0175 46.4394 20.8118 47.023 21.7833C47.6067 22.7547 47.915 23.8667 47.915 25C47.915 26.1333 47.6067 27.2452 47.023 28.2167C46.4394 29.1881 45.6024 29.9825 44.6018 30.5146L17.9101 45.0292C13.6122 47.3687 8.33301 44.3271 8.33301 39.5167V10.4854C8.33301 5.67291 13.6122 2.63332 17.9101 4.96874L44.6018 19.4854Z"
        fill="white"
        fillOpacity="0.29"
        stroke="#CEB7B5"
      />
    </svg>
  );

  // Youtube Helper: Convert URL to Embed URL
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
    else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1];
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
      : url;
  };

  if (facebookReviews.length === 0 && youtubeReviews.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-20 px-4 md:px-6 lg:px-10 bg-white overflow-x-hidden">
      <div className="max-w-[1720px] mx-auto">
        <h2 className="text-black text-center font-poppins text-2xl md:text-[36px] font-semibold mb-8 md:mb-12">
          {t.testimonials.title}
        </h2>

        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 items-stretch">
          {/* --- FACEBOOK REVIEWS --- */}
          <div className="w-full xl:w-[50%] min-w-0 bg-[#F9F9F9] rounded-[24px] p-6 md:p-8 flex flex-col items-center">
            <h3 className="text-black font-poppins text-2xl md:text-[32px] font-semibold mb-8 md:mb-10">
              {t.testimonials.facebookReviews}
            </h3>

            <div className="w-full">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                autoplay={{ delay: 4000 }}
                breakpoints={{
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 2 },
                  1500: { slidesPerView: 3 },
                }}
                className="testimonial-swiper pb-12"
              >
                {facebookReviews.map((item: Testimonial) => (
                  <SwiperSlide key={item.id}>
                    <div className="flex flex-col items-center">
                      <div className="bg-white md:min-h-[291px] rounded-[16px] p-6 md:p-8 relative min-h-[180px] flex items-center justify-center text-center">
                        <FaQuoteLeft className="absolute top-4 left-4 text-[#F2F2F2] text-4xl md:text-5xl" />
                        <p className="text-black text-start font-inter text-[14px] md:text-[16px] leading-relaxed relative z-10 line-clamp-6">
                          {item.content}
                        </p>
                      </div>

                      <div className="flex flex-col items-center mt-[-30px]">
                        <div className="relative w-14 h-14 md:w-18 md:h-18 rounded-full overflow-hidden mb-3 border-10 border-[#F9F9F9]">
                          <Image
                            src={processImage(item.author_avatar)}
                            alt={item.author_name || t.testimonials.customerAvatar}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h4 className="text-black font-poppins text-lg md:text-[20px] font-medium">
                          {item.author_name}
                        </h4>
                        <div className="flex gap-1 text-[#FF7050] mt-1">
                          {[...Array(item.rating || 5)].map((_, i) => (
                            <FaStar key={i} size={14} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* --- YOUTUBE REVIEWS --- */}
          <div className="w-full xl:flex-1 min-w-0 bg-[#F9F9F9] rounded-[24px] p-6 md:p-8 flex flex-col items-center">
            <h3 className="text-black font-poppins text-2xl md:text-[32px] font-semibold mb-8 md:mb-10 text-center">
              {t.testimonials.youtubeReviews}
            </h3>

            <div className="w-full">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={15}
                slidesPerView={2}
                autoplay={{ delay: 4000 }}
                breakpoints={{
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 2 },
                  1500: { slidesPerView: 3 },
                }}
                className="testimonial-swiper pb-12"
              >
                {youtubeReviews.map((video: Testimonial) => (
                  <SwiperSlide key={video.id}>
                    <div
                      onClick={() => setVideoUrl(getEmbedUrl(video.video_url))}
                      className="group relative aspect-[9/16] rounded-[16px] overflow-hidden cursor-pointer shadow-md"
                    >
                      <Image
                        src={processImage(video.thumbnail)}
                        alt={video.author_name || t.testimonials.videoThumbnail}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                        <div className="transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <PlayIcon />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      {/* --- VIDEO MODAL --- */}
      {videoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={() => setVideoUrl(null)}
            className="absolute top-6 right-6 text-white text-4xl hover:text-[#FF7050] transition-colors"
          >
            <FiX />
          </button>
          <div className="w-full max-w-[1000px] aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
