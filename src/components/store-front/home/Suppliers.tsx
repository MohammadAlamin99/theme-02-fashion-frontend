"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "../common/SectionHeader";
import { getSuppliers } from "@/services-api/supplierService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

const Suppliers = () => {
  const { language } = useLanguage();
  const t = translations[language];

  // 1. TanStack Query Fetching (Fetching 5 as per original design grid)
  const { data: supplierResponse, isLoading } = useQuery({
    queryKey: ["public-suppliers"],
    queryFn: () => getSuppliers(1, 5),
  });

  const backendBaseUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:8082",
    [],
  );

  // 2. Process Supplier list and Image URLs
  const supplierList = useMemo(() => {
    const rawData = supplierResponse?.data?.data;

    if (!Array.isArray(rawData)) return [];

    return rawData.map((supplier) => {
      const img = supplier.image_url || "";
      const usableImage = img.startsWith("http")
        ? img
        : `${backendBaseUrl}/${img.replace(/^\/+/, "")}`;

      return {
        ...supplier,
        usableImage,
      };
    });
  }, [supplierResponse, backendBaseUrl]);

  if (isLoading || supplierList.length === 0) return null;

  return (
    <section className="w-full py-12 md:py-16 px-4 md:px-10 bg-white">
      <div className="max-w-[1720px] mx-auto">
        <SectionHeader title={t.suppliers || "Suppliers"} link="/suppliers" />

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-[30px] mt-6 md:mt-8">
          {supplierList.map((item) => (
            <Link
              key={item.id}
              href={`/suppliers?id=${item.id}`}
              style={{ aspectRatio: "78 / 97" }}
              className="flex flex-col items-center gap-2 sm:gap-3 lg:gap-[17px] p-2 sm:p-3 lg:p-[12px_12px_32px_12px] rounded-[12px] lg:rounded-[16px] bg-[#F2F2F2] w-full transition-transform hover:translate-y-[-5px] duration-300 group cursor-pointer"
            >
              {/* Logo Container */}
              <div className="flex flex-col justify-center items-center w-full h-full p-2 sm:p-3 lg:p-[25px_23px] bg-white rounded-[10px] lg:rounded-[12px]">
                <div className="relative w-full h-full min-h-[60px] sm:min-h-[90px] lg:min-h-[150px]">
                  <Image
                    src={item.usableImage}
                    alt={item.name}
                    fill
                    sizes="(max-width:768px) 33vw, (max-width:1024px) 33vw, 20vw"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>

              {/* Supplier Title */}
              <h3 className="text-black group-hover:text-[#FF7050] transition-colors text-center font-poppins text-[10px] sm:text-sm md:text-[18px] lg:text-[24px] font-semibold leading-tight px-1 line-clamp-2">
                {item.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Suppliers;
