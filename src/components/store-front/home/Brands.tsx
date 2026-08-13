"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "../common/SectionHeader";
import { getBrands, Brand, BrandResponse } from "@/services-api/brandService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

const Brands = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const { data: brandResponse, isLoading } = useQuery<BrandResponse>({
    queryKey: ["public-brands"],
    queryFn: () => getBrands(1, 20),
  });

  const backendBaseUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:8082",
    [],
  );

  const brandsList = useMemo(() => {
    // FIX: Accessing nested data (brandResponse.data.data)
    const brandArray = brandResponse?.data?.data;

    if (!Array.isArray(brandArray) || brandArray.length === 0) return [];

    const processed = brandArray.map((brand) => {
      const rowImage = brand.logo_url || ""; // Use logo_url from your JSON
      const usableImage = rowImage.startsWith("http")
        ? rowImage
        : `${backendBaseUrl}/${rowImage.replace(/^\/+/, "")}`;

      return {
        ...brand,
        usableImage: usableImage || "/images/placeholder.svg",
      };
    });

    return [...processed, ...processed, ...processed];
  }, [brandResponse, backendBaseUrl]);

  if (isLoading || brandsList.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .brands-track-left { display: flex; width: max-content; animation: scrollLeft 60s linear infinite; }
        .brands-track-right { display: flex; width: max-content; animation: scrollRight 60s linear infinite; }
        .brands-track-left:hover, .brands-track-right:hover { animation-play-state: paused; }
      `}</style>

      <section className="w-full md:py-20 py-10 px-4 md:px-10 bg-white overflow-hidden">
        <div className="max-w-[1720px] mx-auto">
          <SectionHeader title={t.brands} link="/brands" />

          <div className="relative flex flex-col gap-6 md:gap-10 mt-8">
            <div
              className="absolute left-0 top-0 h-full w-[80px] md:w-[250px] z-20 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%)",
              }}
            />
            <div
              className="absolute right-0 top-0 h-full w-[80px] md:w-[250px] z-20 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to left, #fff 0%, rgba(255,255,255,0) 100%)",
              }}
            />

            {/* ROW 1 */}
            <div className="overflow-hidden w-full">
              <div className="brands-track-left">
                {brandsList.map((brand, index) => (
                  <div
                    key={`row1-${brand.id}-${index}`}
                    className="flex items-center justify-center shrink-0 mx-8 md:mx-14"
                  >
                    <div className="relative w-[120px] md:w-[180px] lg:w-[200px] h-[60px] md:h-[80px] lg:h-[90px] grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-pointer">
                      <Image
                        src={brand.usableImage}
                        alt={brand.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 2 */}
            <div className="overflow-hidden w-full">
              <div className="brands-track-right">
                {brandsList.map((brand, index) => (
                  <div
                    key={`row2-${brand.id}-${index}`}
                    className="flex items-center justify-center shrink-0 mx-8 md:mx-14"
                  >
                    <div className="relative w-[120px] md:w-[180px] lg:w-[200px] h-[60px] md:h-[80px] lg:h-[90px] grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-pointer">
                      <Image
                        src={brand.usableImage}
                        alt={brand.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Brands;
