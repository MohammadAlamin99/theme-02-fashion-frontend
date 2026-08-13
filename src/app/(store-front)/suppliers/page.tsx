"use client";

import React, { Suspense, useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getSuppliers,
  Supplier,
  SupplierResponse,
} from "@/services-api/supplierService";
import { filterProducts } from "@/services-api/productService";
import { fetchMohasagorProducts } from "@/services-api/mohasagorService";
import ProductCard from "@/components/store-front/common/ProductCard";
import { Product } from "@/@types/product.type";
import { FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

function SuppliersContent() {
  const { language } = useLanguage();
  const t = translations[language];
  const searchParams = useSearchParams();
  const initialSupplierId = searchParams.get("id");

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const productsRef = useRef<HTMLDivElement>(null);

  // ── 1. Fetch Suppliers ──────────────────────────────────────────────
  const { data: supplierResponse, isLoading: suppliersLoading } =
    useQuery<SupplierResponse>({
      queryKey: ["all-suppliers-page"],
      queryFn: () => getSuppliers(1, 100),
    });

  const backendBaseUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:8082",
    [],
  );

  // Process supplier list
  const suppliers: Supplier[] = useMemo(() => {
    const arr = supplierResponse?.data?.data;
    if (!Array.isArray(arr)) return [];
    return arr.filter((s) => s.status !== "inactive");
  }, [supplierResponse]);

  // Check if selected supplier is Mohasagor
  const isMohasagor = useMemo(() => {
    if (!selectedSupplier) return false;
    const name = selectedSupplier.name?.toLowerCase() || "";
    const slug = selectedSupplier.slug?.toLowerCase() || "";
    return name.includes("mohasagor") || slug.includes("mohasagor");
  }, [selectedSupplier]);

  // Set initial selected supplier if URL param exists
  useEffect(() => {
    if (initialSupplierId && suppliers.length > 0) {
      const matched = suppliers.find(
        (s) => s.id === initialSupplierId || s.slug === initialSupplierId,
      );
      if (matched) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedSupplier(matched);
        setTimeout(() => {
          productsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 300);
      }
    }
  }, [initialSupplierId, suppliers]);

  // ── 2. Fetch Products for Selected Supplier ─────────────────────────
  const {
    data: productsData,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["supplier-products", selectedSupplier?.id, isMohasagor],
    queryFn: ({ pageParam = 1 }) => {
      if (isMohasagor) {
        return fetchMohasagorProducts(pageParam);
      }
      return filterProducts({
        page: pageParam,
        limit: 16,
        supplier_id: selectedSupplier!.id,
        sort: "popularity",
      });
    },
    initialPageParam: 1,
    enabled: !!selectedSupplier,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
  });

  const totalProducts = productsData?.pages[0]?.pagination?.total_items ?? 0;

  const getImageUrl = (rawUrl: string | null | undefined) => {
    if (!rawUrl) return "/images/placeholder.svg";
    return rawUrl.startsWith("http")
      ? rawUrl
      : `${backendBaseUrl}/${rawUrl.replace(/^\/+/, "")}`;
  };

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setTimeout(() => {
      productsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <div className="px-4 md:px-10 mb-20">
      <div className="max-w-[1720px] mx-auto">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <nav className="py-4 font-poppins font-medium text-base flex items-center gap-2">
          <Link href="/" className="text-[#727272]">
            Home
          </Link>
          <FaChevronRight color="#FF7050" size={15} />
          <span className="text-[#FF7050]">{t.suppliers || "Suppliers"}</span>
        </nav>

        {/* ── Page Title ─────────────────────────────────────── */}
        <div className="mb-8 md:mb-10">
          <h1 className="font-poppins text-[28px] md:text-[40px] font-bold text-black">
            {t.suppliers || "Suppliers"}
          </h1>
          {!suppliersLoading && suppliers.length > 0 && (
            <p className="text-[#727272] font-poppins text-base mt-1">
              {suppliers.length} suppliers available
            </p>
          )}
        </div>

        {/* ── Suppliers Grid ─────────────────────────────────── */}
        {suppliersLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-[140px] md:h-[160px] bg-gray-100 animate-pulse rounded-[20px]"
              />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-poppins text-xl text-[#727272]">
              No suppliers found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                imageUrl={getImageUrl(supplier.image_url)}
                isSelected={selectedSupplier?.id === supplier.id}
                onClick={() => handleSupplierClick(supplier)}
              />
            ))}
          </div>
        )}

        {/* ── Products Section ───────────────────────────────── */}
        {selectedSupplier && (
          <div ref={productsRef} className="mt-14 md:mt-20 scroll-mt-24">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative w-[48px] h-[48px] rounded-[10px] overflow-hidden bg-[#F7F7F7] flex-shrink-0">
                  <Image
                    src={getImageUrl(selectedSupplier.image_url)}
                    alt={selectedSupplier.name}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
                <div>
                  <h2 className="font-poppins text-[22px] md:text-[32px] font-semibold text-black leading-tight">
                    {selectedSupplier.name}
                  </h2>
                  {!productsLoading && (
                    <p className="text-[#727272] font-poppins text-sm">
                      {totalProducts} products found
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-sm font-poppins text-[#727272] hover:text-[#FF7050] transition-colors px-4 py-2 rounded-full border border-gray-200 hover:border-[#FF7050] cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Products grid */}
            {productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[280px] bg-gray-100 animate-pulse rounded-[16px]"
                  />
                ))}
              </div>
            ) : totalProducts === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="font-poppins text-lg text-[#727272]">
                  No products found for{" "}
                  <span className="text-[#FF7050] font-medium">
                    {selectedSupplier.name}
                  </span>
                  .
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
                  {productsData?.pages.map((page, i) => (
                    <React.Fragment key={i}>
                      {page.data.map((product: Product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isShowWishlist={false}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>

                {/* Load More */}
                {hasNextPage && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-8 py-3 bg-white border border-gray-200 rounded-full hover:bg-[#FF7050] hover:text-white hover:border-[#FF7050] transition-all font-poppins disabled:opacity-50 cursor-pointer"
                    >
                      {isFetchingNextPage ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Supplier Card Component ──────────────────────────────────────────
function SupplierCard({
  supplier,
  imageUrl,
  isSelected,
  onClick,
}: {
  supplier: Supplier;
  imageUrl: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      title={`Browse ${supplier.name} products`}
      className={`group flex flex-col items-center justify-center gap-3 p-5 md:p-6 rounded-[20px] cursor-pointer transition-all duration-200 active:scale-[0.97] border-2 ${
        isSelected
          ? "bg-white border-[#FF7050] shadow-lg shadow-[#FF7050]/10"
          : "bg-[#F7F7F7] border-transparent hover:border-[#FF7050]/40 hover:shadow-md hover:bg-white"
      }`}
    >
      <div className="relative w-full h-[70px] md:h-[90px]">
        <Image
          src={imageUrl}
          alt={supplier.name}
          fill
          className={`object-contain transition-all duration-300 ${
            isSelected
              ? "grayscale-0 opacity-100"
              : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
          }`}
          unoptimized
        />
      </div>
      <h3
        className={`font-poppins text-sm md:text-[15px] font-medium text-center break-words w-full transition-colors ${
          isSelected ? "text-[#FF7050]" : "text-black"
        }`}
      >
        {supplier.name}
      </h3>
      {isSelected ? (
        <span className="text-[10px] font-poppins bg-[#FF7050] text-white px-2 py-0.5 rounded-full">
          Selected
        </span>
      ) : supplier._count?.products !== undefined ? (
        <span className="text-[11px] font-poppins text-[#727272]">
          {supplier._count.products} products
        </span>
      ) : null}
    </div>
  );
}

export default function AllSuppliersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1720px] mx-auto px-4 md:px-10 py-12 text-center font-poppins text-gray-500">
          Loading suppliers...
        </div>
      }
    >
      <SuppliersContent />
    </Suspense>
  );
}
