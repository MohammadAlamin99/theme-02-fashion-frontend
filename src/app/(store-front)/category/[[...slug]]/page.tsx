"use client";

import { useState } from "react";
import CategoryBanner from "@/components/store-front/category/CategoryBanner";
import FilterSidebar from "@/components/store-front/category/FilterSidebar";
import ProductGridHeader from "@/components/store-front/category/ProductGridHeader";
import SubCategoryBar from "@/components/store-front/category/SubCategoryBar";
import ProductCard from "@/components/store-front/common/ProductCard";
import Link from "next/link";
import { FaChevronRight, FaFilter, FaTimes, FaBoxOpen } from "react-icons/fa";
import RecentlyViewed from "@/components/store-front/common/RecentViewSection";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getCategory } from "@/services-api/categoryService";
import { useParams, useSearchParams } from "next/navigation";
import { filterProducts } from "@/services-api/productService";
import { getBrands } from "@/services-api/brandService";
import { Product } from "@/@types/product.type";
import React from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

const CategoryPage = () => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  const activeSort = searchParams.get("sort") || "popularity";

  const slug = params.slug as string;
  const activeBrandId = searchParams.get("brand_id") || "";
  const activeCategoryId = searchParams.get("category_id") || "";
  const maxPrice = searchParams.get("max") || "100000";
  const { language } = useLanguage();
  const t = translations[language];

  // category data fetch
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => getCategory(slug),
    enabled: !!slug,
  });

  // brand data fetch
  const { data: brandsResponse } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrands(1, 50),
  });

  // product fetch
  const {
    data: filterProductsData,
    isLoading: productsLoading,
    error: productsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "products",
      category?.id,
      activeCategoryId,
      activeBrandId,
      maxPrice,
      activeSort,
    ],
    queryFn: ({ pageParam = 1 }) =>
      filterProducts({
        page: pageParam,
        limit: 16,
        search: "",
        min_price: 0,
        max_price: Number(maxPrice),
        category_id: activeBrandId ? "" : activeCategoryId || category!.id,
        brand_id: activeBrandId,
        sort: activeSort,
      }),
    initialPageParam: 1,
    enabled: !!category?.id,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
  });

  if (categoryLoading || (productsLoading && !filterProductsData)) {
    return (
      <div className="h-screen flex justify-center items-center font-poppins text-xl">
        Loading Products...
      </div>
    );
  }

  if (productsError) {
    return (
      <p className="text-center py-20 font-poppins">
        Something went wrong while fetching products.
      </p>
    );
  }
  return (
    <div className="px-4 md:px-10 mb-20">
      {/* 1. Breadcrumb & Banner */}
      <div className="max-w-[1720px] mx-auto py-4">
        <nav className="mb-4 font-poppins font-medium text-base flex items-center gap-2">
          <Link href="/" className="text-[#727272]">
            Home
          </Link>{" "}
          <FaChevronRight color="#FF7050" size={15} />
          <span className="text-[#FF7050]">{category?.name}</span>
        </nav>
        <CategoryBanner
          bannerImage={category?.background_image_url}
          description={category?.description}
          categoryName={category?.name}
        />
      </div>

      {/* 2. Sub-category */}
      <div className="max-w-[1720px] mx-auto mb-6 md:mb-8">
        <SubCategoryBar subcategory={category?.children} />
      </div>

      {/* 3. Main Content: Sidebar + Grid */}
      <div className="max-w-[1720px] mx-auto pt-6 md:pt-14">
        <ProductGridHeader
          totalProducts={
            filterProductsData?.pages[0]?.pagination?.total_items || 0
          }
          categoryName={category?.name}
        />

        {/* Mobile Filter Trigger Button (Visible only below lg breakpoint) */}
        <div className="lg:hidden mt-6 flex justify-start">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#F2F2F2] rounded-lg text-sm font-poppins font-medium  active:scale-95 transition-all"
          >
            <FaFilter className="text-[#FF7050]" size={14} />
            <span className="text-base font-poppins">Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mt-6 lg:mt-10">
          {/* Desktop Sidebar - Unchanged */}
          <aside className="hidden lg:block w-[390px] shrink-0">
            {/* <FilterSidebar /> */}
            <FilterSidebar
              brands={brandsResponse?.data?.data}
              activeCategoryName={category?.name}
              totalProductCount={
                filterProductsData?.pages[0]?.pagination?.total_items || 0
              }
            />
          </aside>
          <main className="flex-1">
            {filterProductsData?.pages[0]?.pagination?.total_items === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#F9F9F9] rounded-[22px] border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-[#FF7050]/10 rounded-full flex items-center justify-center mb-4 text-[#FF7050]">
                  <FaBoxOpen size={32} />
                </div>
                <h3 className="font-poppins text-xl md:text-2xl font-semibold text-black mb-2">
                  {t.noProductsFound}
                </h3>
                <p className="font-poppins text-sm md:text-base text-[#727272] max-w-md">
                  {t.noProductsFoundDesc}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 md:gap-4 gap-2">
                  {filterProductsData?.pages.map((page, i) => (
                    <React.Fragment key={i}>
                      {page.data.map((product: Product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </React.Fragment>
                  ))}
                </div>

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-8 py-3 bg-white border border-gray-200 rounded-full hover:bg-orange-500 hover:text-white transition-all cursor-pointer font-poppins disabled:opacity-50"
                    >
                      {isFetchingNextPage ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <div className="pt-8 md:pt-16">
        <RecentlyViewed />
      </div>

      {/* 4. Mobile Filter Slide-over Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isMobileFilterOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileFilterOpen(false)}
        />

        {/* Drawer Content Container */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-[min(390px,85vw)] bg-white h-full flex flex-col transition-transform duration-300 ease-out ${
            isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header with Close Action */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <span className="font-poppins font-semibold text-lg">Filters</span>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Scrollable Sidebar Wrapper */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <FilterSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
