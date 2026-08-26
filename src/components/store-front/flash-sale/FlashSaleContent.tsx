"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FaChevronRight, FaBolt } from "react-icons/fa";
import ProductCard from "@/components/store-front/common/ProductCard";
import { Product } from "@/@types/product.type";
import { getHomeTags, HomeTagSection } from "@/services-api/tagService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";
import FlashSaleBanner from "./Flashsalebanner";

interface FlashSaleContentProps {
  slug?: string;
}

interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

interface RawFlashSaleProduct {
  id?: string | number;
  name?: string;
  slug?: string;
  sell_price?: string | number;
  price?: string | number;
  regular_price?: string | number;
  old_price?: string | number;
  images?: string[];
  image?: string;
  quantity_left?: number;
  quantity?: number;
  discount_tag?: string | null;
  avg_rating?: string | number;
  rating?: string | number;
  total_reviews?: string | number;
  review_count?: string | number;
  variants?: Product["variants"];
  campaign_discount?: Product["campaign_discount"];
  final_price?: Product["final_price"];
}

const toNumber = (value: string | number | undefined, fallback = 0): number => {
  if (value === undefined || value === null) return fallback;
  const num = typeof value === "number" ? value : parseFloat(value);
  return Number.isNaN(num) ? fallback : num;
};

const DEFAULT_TIME_LEFT: TimeLeft = {
  days: "00",
  hours: "00",
  minutes: "00",
  seconds: "00",
};

export default function FlashSaleContent({ slug }: FlashSaleContentProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const backendBaseUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:8082",
    [],
  );

  // 1. Fetch home tags (which includes flash sales)
  const {
    data: tagsData,
    isLoading,
    isError,
  } = useQuery<HomeTagSection[]>({
    queryKey: ["home-tags-flash-sale"],
    queryFn: getHomeTags,
    staleTime: 60000,
  });

  // 2. Filter all active flash sales
  const flashSaleList = useMemo(() => {
    if (!Array.isArray(tagsData)) return [];
    return tagsData.filter((tag) => tag.is_flash_sale === true && tag.end_date);
  }, [tagsData]);

  // Selected tag id if multiple flash sales exist
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  // 3. Find active target flash sale
  const activeFlashSale = useMemo(() => {
    if (flashSaleList.length === 0) return null;

    if (selectedTagId) {
      const found = flashSaleList.find((tag) => tag.id === selectedTagId);
      if (found) return found;
    }

    if (slug) {
      const foundBySlug = flashSaleList.find(
        (tag) => tag.slug.toLowerCase() === slug.toLowerCase(),
      );
      if (foundBySlug) return foundBySlug;
    }

    return flashSaleList[0];
  }, [flashSaleList, slug, selectedTagId]);

  // Update page document title for SEO
  useEffect(() => {
    if (activeFlashSale?.meta_title || activeFlashSale?.title) {
      document.title = (activeFlashSale.meta_title ||
        activeFlashSale.title) as string;
    }
  }, [activeFlashSale]);

  // 4. Timer Logic
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(DEFAULT_TIME_LEFT);

  const endDate = activeFlashSale?.end_date;

  const calculateTimeLeft = useCallback((): TimeLeft => {
    if (!endDate) return DEFAULT_TIME_LEFT;
    const targetDate = new Date(endDate).getTime();
    const now = Date.now();
    const difference = targetDate - now;

    if (difference <= 0) return DEFAULT_TIME_LEFT;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return {
      days: days.toString().padStart(2, "0"),
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    };
  }, [endDate]);

  useEffect(() => {
    const immediate = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 0);

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearTimeout(immediate);
      clearInterval(timer);
    };
  }, [calculateTimeLeft]);

  // 5. Convert Flash Sale Products to ProductCard compatibility
  const products: Product[] = useMemo(() => {
    if (!activeFlashSale?.products) return [];

    const rawProducts =
      activeFlashSale.products as unknown as RawFlashSaleProduct[];

    return rawProducts.map((item): Product => {
      const id = String(item.id ?? "");
      const name = item.name ?? "";
      const productSlug = item.slug ?? "";

      const sellPriceNum =
        item.sell_price !== undefined
          ? toNumber(item.sell_price)
          : toNumber(item.price);

      const regularPriceNum =
        item.regular_price !== undefined
          ? toNumber(item.regular_price)
          : item.old_price !== undefined
            ? toNumber(item.old_price)
            : sellPriceNum;

      const imagesArr: { url: string }[] =
        Array.isArray(item.images) && item.images.length > 0
          ? item.images.map((url) => ({ url }))
          : item.image
            ? [{ url: item.image }]
            : [];

      const hasDiscount = regularPriceNum > sellPriceNum;
      const discountPct = hasDiscount
        ? Math.round(((regularPriceNum - sellPriceNum) / regularPriceNum) * 100)
        : 0;

      return {
        id,
        name,
        slug: productSlug,
        images: imagesArr,
        sell_price: String(sellPriceNum),
        regular_price: String(
          regularPriceNum > sellPriceNum ? regularPriceNum : sellPriceNum,
        ),
        quantity:
          item.quantity_left !== undefined
            ? item.quantity_left
            : (item.quantity ?? 10),
        discount_tag:
          item.discount_tag || (hasDiscount ? `${discountPct}% OFF` : null),
        avg_rating:
          item.avg_rating !== undefined
            ? toNumber(item.avg_rating, 5)
            : toNumber(item.rating, 5),
        total_reviews:
          item.total_reviews !== undefined
            ? toNumber(item.total_reviews)
            : toNumber(item.review_count),
        variants: item.variants || [],
        campaign_discount: item.campaign_discount || null,
        final_price: item.final_price || null,
      } as Product;
    });
  }, [activeFlashSale]);

  const bannerUrl = activeFlashSale?.banner_url;

  const bannerImgUrl = useMemo(() => {
    if (!bannerUrl) return "";
    if (bannerUrl.startsWith("http") || bannerUrl.startsWith("/images/"))
      return bannerUrl;
    return `${backendBaseUrl}/${bannerUrl.replace(/^\/+/, "")}`;
  }, [bannerUrl, backendBaseUrl]);

  return (
    <div className="px-4 md:px-10 mb-20 font-poppins min-h-screen bg-white">
      <div className="max-w-[1720px] mx-auto">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <nav className="py-4 font-poppins font-medium text-sm md:text-base flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            className="text-[#727272] hover:text-[#7CB640] transition-colors"
          >
            {t.legal.home || "Home"}
          </Link>
          <FaChevronRight color="#7CB640" size={12} />
          <span className="text-[#727272]">Flash Sale</span>
          {activeFlashSale && (
            <>
              <FaChevronRight color="#7CB640" size={12} />
              <span className="text-[#7CB640] truncate max-w-[200px] md:max-w-none">
                {activeFlashSale.title || activeFlashSale.meta_title}
              </span>
            </>
          )}
        </nav>

        {/* ── Loading Skeleton ────────────────────────────────── */}
        {isLoading && (
          <div className="space-y-8 animate-pulse">
            <div className="w-full h-[250px] md:h-[360px] bg-gray-200 rounded-[24px] md:rounded-[36px]" />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={`flash-sale-skeleton-${i}`}
                  className="h-[360px] bg-gray-100 rounded-[16px]"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Error / No Flash Sale Found ────────────────────── */}
        {(isError || (!isLoading && !activeFlashSale)) && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#FAFAFA] rounded-[24px] border border-[#E3E3E3] my-8 px-4">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-3xl mb-4">
              <FaBolt />
            </div>
            <h2 className="font-poppins text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              No Active Flash Sale Available
            </h2>
            <p className="font-poppins text-gray-500 text-sm md:text-base mb-6 max-w-md">
              There are currently no active flash sales running. Please check
              back later for exciting limited-time discounts!
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-[#7CB640] text-white font-poppins font-medium rounded-full hover:bg-[#6ba234] transition-all shadow-md"
            >
              Back to Home
            </Link>
          </div>
        )}

        {/* ── Main Flash Sale View ────────────────────────────── */}
        {!isLoading && activeFlashSale && (
          <>
            <FlashSaleBanner
              flashSale={activeFlashSale}
              timeLeft={timeLeft}
              bannerImgUrl={bannerImgUrl}
            />

            {/* Multiple Flash Sales Selector Tabs (If more than one exist) */}
            {flashSaleList.length > 1 && (
              <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-sm font-semibold text-gray-500 shrink-0">
                  Select Event:
                </span>
                {flashSaleList.map((fsTag) => {
                  const isActive = fsTag.id === activeFlashSale.id;
                  return (
                    <button
                      key={fsTag.id}
                      type="button"
                      onClick={() => setSelectedTagId(fsTag.id)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 border ${
                        isActive
                          ? "bg-[#7CB640] text-white border-[#7CB640] shadow-sm"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      ⚡ {fsTag.title || fsTag.meta_title}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Header / Product Count Bar */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
              <h2 className="font-poppins text-xl md:text-2xl font-semibold text-gray-900 flex flex-wrap items-center gap-3">
                <span>Flash Sale Deals</span>
                <span className="bg-[#7CB640]/10 text-[#7CB640] text-xs md:text-sm font-bold px-3 py-1 rounded-full">
                  {products.length} Items
                </span>
              </h2>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-[#FAFAFA] rounded-[24px] border border-gray-200">
                <p className="font-poppins text-gray-500 text-base md:text-lg">
                  No products are currently available in this flash sale event.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
