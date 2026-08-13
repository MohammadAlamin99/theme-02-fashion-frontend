
"use client";

import React, { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Star, Sparkles, Play } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
export interface OfferItem {
  icon?: string;
  title?: string;
  subTitle?: string;
}

export interface FeatureItem {
  icon?: string;
  title?: string;
  subTitle?: string;
}

export interface ReviewItem {
  name?: string;
  quote?: string;
  image?: string;
}

export interface FAQItem {
  question?: string;
  answer?: string;
}

export interface LandingPageData {
  title?: string;
  headline?: string;
  subHeadline?: string;
  topImage?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  videoLink?: string;
  productId?: string;
  productImages?: string[];
  offers?: OfferItem[];
  features?: FeatureItem[];
  reviews?: ReviewItem[];
  faqs?: FAQItem[];
  product?: {
    id?: string;
    name?: string;
    sell_price?: number | string;
    regular_price?: number | string;
    price?: number | string;
    originalPrice?: number | string;
    short_description?: string;
    description?: string;
    avg_rating?: number | string;
    rating?: number | string;
    total_reviews?: number | string;
    images?: string[];
  };
}

interface LandingPageRendererProps {
  liveData: LandingPageData;
  productList?: any[];
}

// ==========================================
// 2. HELPER UTILITIES
// ==========================================
export const getImageUrl = (path?: string | null): string | null => {
  if (!path || path.trim() === "") return null;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  const rawApiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8082/api/v1";

  const baseUrl = rawApiUrl.replace(/\/api(\/v1)?\/?$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const getYoutubeThumbnail = (url?: string | null): string | null => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
  }
  return null;
};

const parseJsonArray = <T,>(data: any): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function LandingPageRenderer({
  liveData,
  productList = [],
}: LandingPageRendererProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const offers = parseJsonArray<OfferItem>(liveData.offers);
  const features = parseJsonArray<FeatureItem>(liveData.features);
  const productImages = parseJsonArray<string>(liveData.productImages);
  const reviews = parseJsonArray<ReviewItem>(liveData.reviews);
  const faqs = parseJsonArray<FAQItem>(liveData.faqs);
  const swiperRef = useRef<SwiperType | null>(null);
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [playVideo, setPlayVideo] = useState(false);

  const productFromList = Array.isArray(productList)
    ? productList.find((p: any) => p.id === liveData.productId)
    : null;

  const selectedProduct = productFromList ?? liveData.product;

  const getYoutubeVideoId = (url?: string) => {
    if (!url) return "";

    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    );

    return match ? match[1] : "";
  };

  return (
    <div
      className="w-full flex flex-col transition-all min-h-screen"
      style={{
        backgroundColor: liveData.backgroundColor || "#ffffff",
        color: liveData.textColor || "#111827",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 🚀 NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-1">
            <span
              className="text-3xl md:text-4xl font-syne font-bold tracking-tight"
              style={{ color: liveData.textColor || "#111827" }}
            >
              {selectedProduct?.name || liveData.title || "N/A"}
            </span>

            <span
              className="text-4xl font-bold"
              style={{ color: liveData.buttonColor || "#38bdf8" }}
            >
              .
            </span>
          </a>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-syne font-medium uppercase tracking-wider">
            <a href="#about" className="hover:text-sky-500 transition-colors">
              {t.landingPage.about}
            </a>

            <a href="#gallery" className="hover:text-sky-500 transition-colors">
              {t.landingPage.gallery}
            </a>

            <a
              href="#features"
              className="hover:text-sky-500 transition-colors"
            >
              {t.landingPage.features}
            </a>

            <a href="#reviews" className="hover:text-sky-500 transition-colors">
              {t.landingPage.reviews}
            </a>

            <a href="#video" className="hover:text-sky-500 transition-colors">
              {t.landingPage.video}
            </a>

            <a href="#faqs" className="hover:text-sky-500 transition-colors">
              {t.landingPage.faqs}
            </a>

            <a href="#order" className="hover:text-sky-500 transition-colors">
              {t.landingPage.order}
            </a>
          </nav>

          {/* CTA Button */}
          <a
            href="#order"
            style={{
              backgroundColor: liveData.buttonColor || "#38bdf8",
            }}
            className="hidden lg:flex items-center justify-center px-6 py-3 rounded-full text-white text-sm font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-transform"
          >
            {t.landingPage.buyNow}
          </a>
        </div>
      </header>

      {/* 🚀 1. HERO SECTION */}
      <section id="about" className="min-h-[80vh] flex items-center px-6 md:px-12 py-10 scroll-mt-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto w-full">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-syne font-bold tracking-tight leading-[1.1]">
              {liveData.headline
                ? liveData.headline.endsWith(".")
                  ? liveData.headline
                  : `${liveData.headline}.`
                : t.landingPage.defaultHeadline}
            </h1>
            <p className="text-sm md:text-base text-zinc-500 font-montserrat leading-relaxed max-w-md">
              {liveData.subHeadline ||
                t.landingPage.defaultSubHeadline}
            </p>
            <button
              style={{
                backgroundColor: liveData.buttonColor || "#38bdf8",
                boxShadow: `0 10px 25px -5px ${liveData.buttonColor || "#38bdf8"}80`,
              }}
              className="px-8 py-3.5 rounded-full text-white font-extrabold text-xs md:text-sm uppercase tracking-widest transition-transform active:scale-95 hover:opacity-90"
            >
              {t.landingPage.purchaseNow}
            </button>
          </div>
          <div className="w-full aspect-[4/4] rounded-[2rem] overflow-hidden bg-slate-100 shadow-xl border border-slate-200/60">
            {liveData.topImage ? (
              <img
                src={getImageUrl(liveData.topImage)!}
                alt="Hero"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">
                {t.landingPage.heroImage}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🚀 2. TRUST BAR */}
      {offers.length > 0 && (
        <div className="px-6 py-4">
          <div className="bg-[#f3f4f6] py-8 px-6 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-full mx-auto rounded-[2rem]">
            {offers.map((off, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center space-y-2"
              >
                {off.icon ? (
                  <img
                    src={getImageUrl(off.icon)!}
                    className="w-10 h-10 object-contain"
                    alt=""
                  />
                ) : (
                  <Sparkles
                    size={28}
                    style={{ color: liveData.buttonColor || "#38bdf8" }}
                  />
                )}
                <p className="text-base font-syne font-medium text-slate-900 tracking-tight">
                  {off.title || "100% High Quality"}
                </p>
                {off.subTitle && (
                  <p className="text-xs text-slate-600 font-montserrat leading-normal max-w-xs">
                    {off.subTitle}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🚀 3. PRODUCT GALLERY SHOWCASE (2x2 GRID TO FIT SCREEN) */}
      <section id="gallery" className="min-h-[80vh] flex items-center px-6 py-12 scroll-mt-28">
        <div className="text-center space-y-8 max-w-5xl mx-auto w-full">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-syne font-bold tracking-tight">
              {t.landingPage.productImage}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-montserrat font-normal">
              {t.landingPage.galleryDescription}
            </p>
          </div>
          {/* Changed to 2 columns in desktop to fit height better */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[16/10] bg-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-200/60"
              >
                {productImages?.[i] ? (
                  <img
                    src={getImageUrl(productImages[i])!}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">
                    Slot {i + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 4. FEATURES SECTION */}
      <section id="features" className="min-h-[70vh] flex items-center py-16 scroll-mt-28">
        <div className="text-center space-y-14 max-w-6xl mx-auto w-full">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-syne font-bold tracking-tight">
              {t.landingPage.whyUse}
            </h2>

            <p className="text-sm md:text-base font-montserrat text-slate-500">
              {t.landingPage.featureDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            {/* LEFT COLUMN */}
            <div className="space-y-14">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-end gap-5 text-right"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-syne font-bold text-slate-900">
                      {features?.[idx]?.title || `Feature ${idx + 1}`}
                    </h3>

                    <p className="text-sm font-montserrat text-slate-500 leading-relaxed max-w-[220px] ml-auto">
                      {features?.[idx]?.subTitle ||
                        "Lorem ipsum dolor sit amet."}
                    </p>
                  </div>

                  <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-slate-50 rounded-xl shadow-sm">
                    {features?.[idx]?.icon ? (
                      <img
                        src={getImageUrl(features[idx].icon)!}
                        className="w-12 h-12"
                        alt=""
                      />
                    ) : (
                      <Sparkles
                        size={28}
                        style={{ color: liveData.buttonColor || "#38bdf8" }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CENTER IMAGE */}
            <div className="aspect-[4/6] rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-xl border-4 border-white max-w-[340px] mx-auto">
              <img
                src={getImageUrl(liveData.topImage || productImages?.[0])!}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-14">
              {[3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-start gap-5 text-left"
                >
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-slate-50 rounded-xl shadow-sm">
                    {features?.[idx]?.icon ? (
                      <img
                        src={getImageUrl(features[idx].icon)!}
                        className="w-12 h-12"
                        alt=""
                      />
                    ) : (
                      <Sparkles
                        size={28}
                        style={{ color: liveData.buttonColor || "#38bdf8" }}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-syne font-bold text-slate-900">
                      {features?.[idx]?.title || `Feature ${idx + 1}`}
                    </h3>

                    <p className="text-sm font-montserrat text-slate-500 leading-relaxed max-w-[220px]">
                      {features?.[idx]?.subTitle ||
                        "Lorem ipsum dolor sit amet."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 5. CUSTOMER REVIEWS SECTION */}
      <section id="reviews" className="min-h-[70vh] flex items-center px-6 py-12 scroll-mt-28">
        <div className="text-center space-y-10 max-w-5xl mx-auto w-full">
          <h2 className="text-2xl md:text-4xl font-syne font-bold tracking-tight">
            {t.landingPage.customerReviews}
          </h2>

          <Swiper
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            loop
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="reviewSwiper"
          >
            {(reviews?.length ? reviews : [{}]).map(
              (review: any, index: number) => (
                <SwiperSlide key={index}>
                  <div className="flex flex-col md:flex-row items-center justify-center max-w-4xl mx-auto">
                    {/* Testimonial Card */}
                    <div className="relative bg-white p-8 md:p-12 rounded-[2rem]  border border-slate-100 text-left max-w-lg w-full">
                      {/* Badge */}
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                          👍
                        </div>

                        <span className="text-xs font-black uppercase tracking-wider">
                          {t.landingPage.testimonial}
                        </span>
                      </div>

                      {/* Quote */}
                      <p className="text-base md:text-lg text-slate-600 italic leading-8 pr-10">
                        {review?.quote || t.landingPage.noReview}
                      </p>

                      {/* Footer */}
                      <div className="flex justify-between items-end mt-8">
                        <div>
                          <h4 className="text-lg font-bold">
                            {review?.name || t.landingPage.customer}
                          </h4>

                          <span className="text-sm text-slate-400">
                            {t.landingPage.verifiedCustomer}
                          </span>
                        </div>

                        {/* Decorative Quote */}
                        <span className="text-[110px] leading-none text-slate-200 font-serif select-none">
                          “
                        </span>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="relative w-[340px] h-[550px] rounded-[2rem] overflow-hidden ">
                      <img
                        src={getImageUrl(review?.image || liveData.topImage)!}
                        alt={review?.name || "Customer"}
                        className="w-full h-full object-cover"
                      />

                      {/* Next Button */}
                      <button
                        onClick={() => swiperRef.current?.slideNext()}
                        className="absolute bottom-5 right-5 bg-black text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 transition cursor-pointer"
                      >
                        {t.landingPage.next}
                        <span className="text-lg">›</span>
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              ),
            )}
          </Swiper>
        </div>
      </section>

      {/* 🚀 6. FAQS SECTION */}
      <section id="faqs" className="min-h-[70vh] flex items-center px-6 py-12 scroll-mt-28">
        <div className="max-w-5xl mx-auto w-full text-center space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-4xl font-syne font-bold tracking-tight">
              {t.landingPage.faqTitle}
            </h2>

            <p className="text-xs text-slate-500">
             {t.landingPage.faqSubtitle}
            </p>
          </div>

          <div className="space-y-4 text-left">
            {(faqs.length > 0
              ? faqs
              : [
                  {
                    question: t.landingPage.defaultQuestion,
                    answer: t.landingPage.defaultAnswer,
                  },
                ]
            ).map((faq, i) => {
              const isOpen = openFaq === i;

              return (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
                >
                  {/* Header */}
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="w-full flex justify-between items-center p-5 text-left"
                  >
                    <h3 className="text-sm md:text-base font-bold text-slate-900">
                      {faq.question}
                    </h3>

                    <span
                      className={`text-2xl font-light transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {/* Content */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 border-t border-slate-100">
                        <p className="pt-4 text-sm text-slate-600 leading-7">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🚀 7. VIDEO BANNER */}
      <section id="video" className="min-h-[60vh] flex items-center py-4 max-w-5xl mx-auto w-full scroll-mt-28">
        <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-slate-200">
          {!playVideo ? (
            <>
              <img
                src={
                  getYoutubeThumbnail(liveData.videoLink) ||
                  getImageUrl(liveData.topImage)!
                }
                alt="Video"
                className="w-full h-full object-cover"
              />

              <div
                onClick={() => setPlayVideo(true)}
                className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer"
              >
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                  <Play
                    size={24}
                    style={{
                      color: liveData.buttonColor || "#38bdf8",
                      fill: "currentColor",
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                liveData.videoLink,
              )}?autoplay=1&rel=0`}
              title="Product Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </section>

      {/* 🚀 8. "ORDER OUR PRODUCT" SECTION */}
      <section id="order" className="min-h-screen flex items-center px-6 py-12 scroll-mt-28">
        <div className="max-w-6xl mx-auto w-full text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-syne font-bold tracking-tight">
              {t.landingPage.orderTitle}
            </h2>
            <p className="text-xs text-slate-500 font-montserrat">
              {t.landingPage.limitedOffer}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start text-left max-w-5xl mx-auto">
            {/* Product Images */}
            <div className="space-y-6">
              <div className="aspect-square bg-slate-50 rounded-[2.5rem] overflow-hidden shadow-md">
                <img
                  src={
                    getImageUrl(
                      selectedProduct?.images?.[0] || liveData.topImage,
                    )!
                  }
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-slate-50 rounded-xl overflow-hidden"
                  >
                    <img
                      src={
                        getImageUrl(
                          productImages[i] || selectedProduct?.images?.[i],
                        )!
                      }
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-5 py-2">
              {/* Rating */}
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={
                      i < Number(selectedProduct?.avg_rating || 5)
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>

              {/* Product Name */}
              <h3 className="text-2xl md:text-3xl font-syne font-bold tracking-tight leading-tight">
                {selectedProduct?.name || liveData.title || t.landingPage.productName}
              </h3>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span
                  className="text-3xl md:text-4xl font-syne font-bold"
                  style={{ color: liveData.buttonColor || "#38bdf8" }}
                >
                  ৳
                  {selectedProduct?.sell_price ||
                    selectedProduct?.price ||
                    "--"}
                </span>

                {(selectedProduct?.regular_price ||
                  selectedProduct?.originalPrice) && (
                  <span className="text-lg text-slate-300 line-through">
                    ৳
                    {selectedProduct?.regular_price ||
                      selectedProduct?.originalPrice}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-sm md:text-[15px] text-slate-600 leading-7 font-montserrat">
                {selectedProduct?.short_description || liveData.subHeadline}
              </p>

              {/* Purchase Button */}
              <button
                style={{
                  backgroundColor: liveData.buttonColor || "#38bdf8",
                }}
                className="w-full py-3.5 rounded-full text-white font-black text-sm uppercase tracking-wider shadow-xl"
              >
                {t.landingPage.purchaseNow}
              </button>

              {/* Description */}
              <div className="border-t pt-5 space-y-3">
                <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-wider">
                  <span
                    style={{
                      color: liveData.buttonColor || "#38bdf8",
                    }}
                  >
                    {t.landingPage.description}
                  </span>

                  <span className="text-slate-400">
                    {t.landingPage.productReviews} ({selectedProduct?.total_reviews || 0})
                  </span>
                </div>

                <p className="text-sm text-slate-500 leading-7 font-montserrat">
                  {selectedProduct?.description || t.landingPage.detailedDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
