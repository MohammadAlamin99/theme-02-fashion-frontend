"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "swiper/css";
import "swiper/css/navigation";
import { FlashSaleData } from "@/@types/flashSale.type";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

interface FlashSaleProps {
  flashSale: FlashSaleData;
}

const FlashSale = ({ flashSale }: FlashSaleProps) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const backendBaseUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:8082",
    [],
  );

  // 1. MEMOIZE THE PRODUCTS: This logic will now only run when flashSale changes,
  // NOT when the timer updates every second.
  const processedProducts = useMemo(() => {
    if (!flashSale?.products) return [];

    return flashSale.products.map((item) => {
      const rowimage = item?.image || "";
      const usableImage = rowimage.startsWith("http")
        ? rowimage
        : `${backendBaseUrl}/${rowimage.replace(/^\/+/, "")}`;

      return {
        ...item,
        usableImage: usableImage || "/images/placeholder.svg",
      };
    });
  }, [flashSale.products, backendBaseUrl]);

  // 2. SEO Title Update
  useEffect(() => {
    if (flashSale.meta_title) document.title = flashSale.meta_title;
  }, [flashSale.meta_title]);

  // 3. Timer Logic
  const calculateTimeLeft = useCallback(() => {
    const targetDate = new Date(flashSale.end_date).getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days: days.toString().padStart(2, "0"),
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      });
    }
  }, [flashSale.end_date]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (processedProducts.length === 0) return null;

  return (
    <section
      className="w-full md:pt-20 pt-10 px-4 md:px-10 bg-white overflow-hidden"
      aria-label={flashSale.meta_title}
    >
      <meta name="description" content={flashSale.meta_description} />
      <meta name="keywords" content={flashSale.meta_tags} />

      <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-0">
        <div className="w-full lg:w-[35%] flex flex-col shrink-0">
          <h2 className="text-black font-poppins text-[32px] md:text-[56px] font-semibold leading-tight mb-3">
            {flashSale.meta_title || flashSale.title}
          </h2>
          <p className="text-[#8C8C8C] font-poppins text-[14px] md:text-[16px] font-normal leading-relaxed mb-6 md:mb-10 max-w-[566px]">
            {flashSale.meta_description || flashSale.description}
          </p>

          <div className="bg-[#32CD32] rounded-[12px] p-3 md:p-4 flex items-center justify-center gap-3 md:gap-6 mb-6 md:mb-8 w-fit">
            {[
              timeLeft.days,
              timeLeft.hours,
              timeLeft.minutes,
              timeLeft.seconds,
            ].map((val, i) => (
              <React.Fragment key={i}>
                <span className="text-white font-poppins text-[22px] md:text-[40px] font-semibold">
                  {val}
                </span>
                {i < 3 && (
                  <span className="text-white font-poppins text-[24px] md:text-[40px] font-semibold opacity-80">
                    :
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <Link
            href={`/flash-sale/${flashSale.slug}`}
            className="flex items-center gap-4 text-[#FF7050] font-poppins text-[16px] md:text-[20px] font-semibold group hover:opacity-80 transition-all"
          >
            {t.flashSale.goToFlashSale}
            <FiArrowRight className="text-xl md:text-2xl transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        <div className="w-full lg:w-[65%] min-w-0">
          <div className="relative overflow-hidden sm:px-8 px-0">
            <button className="flash-prev cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-xl hidden sm:flex items-center justify-center text-black text-2xl border border-gray-100 hover:bg-[#FF7050] hover:text-white transition-all disabled:opacity-0">
              <FiChevronLeft />
            </button>
            <button className="flash-next cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-xl hidden sm:flex items-center justify-center text-black text-2xl border border-gray-100 hover:bg-[#FF7050] hover:text-white transition-all disabled:opacity-0">
              <FiChevronRight />
            </button>

            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={1.2}
              navigation={{ prevEl: ".flash-prev", nextEl: ".flash-next" }}
              breakpoints={{
                480: { slidesPerView: 1.5, spaceBetween: 20 },
                640: { slidesPerView: 2, spaceBetween: 25 },
                1280: { slidesPerView: 3, spaceBetween: 25 },
              }}
            >
              {processedProducts.map((item) => (
                <SwiperSlide key={item.id}>
                  <div
                    className="relative min-h-[380px] sm:min-h-[447px] rounded-[24px] overflow-hidden p-4 sm:p-6 flex flex-col justify-end"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.73) 100%)",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10 mb-28 sm:mb-20">
                      <Image
                        src={item.usableImage}
                        alt={item.name}
                        width={260}
                        height={260}
                        className="object-contain max-h-[180px] sm:max-h-full"
                        priority={false}
                        unoptimized
                      />
                    </div>

                    <div className="relative z-10 space-y-2 sm:space-y-3">
                      <h3 className="text-white font-poppins text-[16px] md:text-[24px] font-semibold leading-tight line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-[#32CD32] font-poppins text-[18px] sm:text-[24px] font-semibold">
                          {t.product.bdt} {item.price}
                        </span>
                        {item.old_price > item.price && (
                          <span className="text-white font-poppins text-[13px] sm:text-[16px] font-semibold line-through">
                            {t.product.bdt} {item.old_price}
                          </span>
                        )}
                      </div>

                      <div className="pt-1 sm:pt-2">
                        <div className="flex justify-end mb-1">
                          <span className="text-white font-poppins text-[12px] sm:text-[14px]">
                            {item.quantity_left} {t.product.itemsLeft}
                          </span>
                        </div>
                        <div className="w-full h-[5px] sm:h-[6px] bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(item.quantity_left, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
