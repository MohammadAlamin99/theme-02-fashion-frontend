"use client";

import Image from "next/image";
import { SectionHeader } from "../common/SectionHeader";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCategoryTree, Category } from "@/services-api/categoryService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

export default function FeaturedCategory() {
  const router = useRouter();
  const { data: categories = [] as Category[], isLoading } = useQuery<
    Category[]
  >({
    queryKey: ["categories-tree"],
    queryFn: getCategoryTree,
    staleTime: 1000 * 60 * 30,
  });

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

    const { language } = useLanguage();
    const t = translations[language];

  return (
    <section className="w-full pb-[40px] md:pb-[80px] px-4 md:px-10">
      <div className="max-w-[1720px] mx-auto">
        <SectionHeader title={t.featuredCategory} link="/category" />

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-2 sm:gap-x-3 md:gap-x-5 xl:gap-x-[35px] gap-y-3 md:gap-y-6">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[80px] md:h-[120px] bg-gray-100 animate-pulse rounded-[16px]"
                />
              ))
            : categories.slice(0, 10).map((category) => {
                const rowImage = category?.image_url || "";
                const iconUrl = rowImage.startsWith("http")
                  ? rowImage
                  : `${backendBaseUrl}/${rowImage.replace(/^\/+/, "")}`;

                return (
                  <div
                    key={category.id}
                    onClick={() => router.push(`/category/${category.slug}`)}
                    className="
                    flex flex-col md:flex-row
                    items-center
                    justify-center md:justify-start
                    text-center md:text-left
                    gap-2 md:gap-3 lg:gap-4
                    p-2 md:p-3 lg:p-4
                    bg-[#F2F2F2]
                    rounded-[16px]
                    cursor-pointer
                    hover:shadow-md
                    hover:bg-[#EAEAEA]
                    transition-all
                    group
                  "
                  >
                    {/* Icon Container */}
                    <div className="relative w-[110px] h-[65px]">
                      <Image
                        src={iconUrl}
                        alt={category.name}
                        fill
                        className="object-cover rounded-[8px]"
                        unoptimized
                      />
                    </div>
                    {/* Category Name */}
                    <h3 className="text-black font-poppins text-[9px] sm:text-[10px] md:text-[15px] lg:text-[15px] xl:text-[17px] 2xl:text-[22px] font-medium leading-tight break-words">
                      {category.name}
                    </h3>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
