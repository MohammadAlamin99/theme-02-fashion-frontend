"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import {
  MdOutlineKeyboardArrowUp,
  MdOutlineKeyboardArrowDown,
} from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface MediaItem {
  type: "image" | "video";
  src: string;
  videoId?: string;
}

interface GalleryProps {
  items: MediaItem[];
}

export const ProductGallery: React.FC<GalleryProps> = ({ items }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState("");

  const openVideo = (videoUrlOrId: string) => {
    if (!videoUrlOrId) return;

    // Logic to extract ID if a full URL is passed, otherwise use ID
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrlOrId.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : videoUrlOrId;

    setCurrentVideoId(videoId);
    setVideoOpen(true);
  };
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";
  return (
    <div className="productgallery w-full max-w-6xl mx-auto font-poppins">
      <div className="block md:flex gap-4 md:h-[600px]">
        {/* Main Preview */}
        <div className="w-full md:flex-1 h-[350px] sm:h-[450px] md:h-full rounded-2xl md:rounded-3xl bg-white overflow-hidden relative group border border-gray-100 mb-4 md:mb-0">
          <Swiper
            spaceBetween={10}
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            modules={[FreeMode, Navigation, Thumbs]}
            className="w-full h-full"
          >
            {items.map((item, index) => {
              const rowImage = item?.src || "";
              const useAbleImage = rowImage.startsWith("http")
                ? rowImage
                : `${backendBaseUrl}/${rowImage.replace(/^\/+/, "")}`;
              return (
                <SwiperSlide
                  key={index}
                  className="w-full h-full flex items-center justify-center bg-gray-50"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={useAbleImage}
                      alt={`Product view ${index + 1}`}
                      fill
                      priority={index === 0}
                      className="object-contain"
                      unoptimized
                    />
                    {item.type === "video" && (
                      <button
                        onClick={() => openVideo(item.videoId || "")}
                        className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center z-10"
                      >
                        <div className="relative flex items-center justify-center w-[64px] h-[64px]">
                          <div className="absolute inset-0 bg-[#FF0033] rounded-[20%] transform scale-x-110 scale-y-90" />
                          <FaPlay
                            size={20}
                            color="#FFFFFF"
                            className="relative z-10 ml-0.5"
                          />
                        </div>
                      </button>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Thumbnails Sidebar */}
        <div className="w-full md:w-[120px] flex flex-col items-center gap-2">
          <button className="thumb-prev hidden md:flex w-10 h-10 items-center justify-center rounded-[8px] bg-[#F9F9F9] hover:bg-gray-100 shrink-0">
            <MdOutlineKeyboardArrowUp size={28} color="#727272" />
          </button>

          <div className="w-full h-[85px] sm:h-[100px] md:h-full overflow-hidden min-w-0">
            <Swiper
              onSwiper={setThumbsSwiper}
              direction="horizontal"
              spaceBetween={12}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              navigation={{
                prevEl: ".thumb-prev",
                nextEl: ".thumb-next",
              }}
              breakpoints={{
                768: {
                  direction: "vertical",
                  slidesPerView: 5,
                },
              }}
              className="w-full h-full product-thumbs-slider"
            >
              {items.map((item, index) => {
                const rowImage = item?.src || "";
                const useAbleImage = rowImage.startsWith("http")
                  ? rowImage
                  : `${backendBaseUrl}/${rowImage.replace(/^\/+/, "")}`;
                return (
                  <SwiperSlide
                    key={index}
                    className="cursor-pointer rounded-xl border border-transparent overflow-hidden transition-all duration-300"
                  >
                    <div className="relative w-full h-full bg-gray-100">
                      <Image
                        src={useAbleImage}
                        alt={`thumbnail ${index}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {item.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <FaPlay size={12} color="#FFF" />
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          <button className="thumb-next hidden md:flex w-10 h-10 items-center justify-center rounded-[8px] bg-[#F9F9F9] hover:bg-gray-100 shrink-0">
            <MdOutlineKeyboardArrowDown size={28} color="#727272" />
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[999] flex flex-col items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-[#FF7050]"
            >
              <IoClose size={32} />
            </button>
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1`}
              title="Product Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (min-width: 768px) {
          .product-thumbs-slider .swiper-slide {
            height: 100px !important;
            width: 100% !important;
          }
        }
        .product-thumbs-slider .swiper-slide-thumb-active {
          border: 2px solid #ff7050 !important;
        }
      `}</style>
    </div>
  );
};
