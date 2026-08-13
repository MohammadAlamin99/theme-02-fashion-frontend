"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Category,
  getAllcategoryFlatList,
} from "@/services-api/categoryService";
import { Brand } from "@/services-api/brandService";
import { CategoryTreeNode } from "@/@types/filter.type";
import CategorySection from "./CategorySection";
import FilterHeader from "./FilterHeader";
import PriceSection from "./PriceSection";
import BrandSection from "./BrandSection";

interface FilterSidebarProps {
  brands?: Brand[];
  activeCategoryName?: string;
  totalProductCount?: number;
}

export default function FilterSidebar({ brands = [] }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeBrandId = searchParams.get("brand_id") || "";
  const activeMaxPrice = searchParams.get("max") || "100000";
  const activeCategoryId = searchParams.get("category_id") || "";

  const [priceValue, setPriceValue] = useState<number>(Number(activeMaxPrice));
  const [prevMaxPrice, setPrevMaxPrice] = useState<string>(activeMaxPrice);

  if (activeMaxPrice !== prevMaxPrice) {
    setPrevMaxPrice(activeMaxPrice);
    setPriceValue(Number(activeMaxPrice));
  }

  const { data: categoryResponse } = useQuery<{ data: Category[] }>({
    queryKey: ["all-categories"],
    queryFn: () => getAllcategoryFlatList(),
  });

  // Build recursive tree structure
  const categoryTree = useMemo(() => {
    const list = categoryResponse?.data || [];
    const build = (parentId: string | null): CategoryTreeNode[] => {
      return list
        .filter((item) => item.parent_id === parentId)
        .map((item) => ({
          ...item,
          children: build(item.id),
        }));
    };
    return build(null);
  }, [categoryResponse]);

  // Determine which branches of the tree should be open
  const activePath = useMemo(() => {
    const path = new Set<string>();
    if (!activeCategoryId || !categoryResponse?.data) return path;
    let currentId: string | null = activeCategoryId;
    while (currentId) {
      path.add(currentId);
      const parent = categoryResponse.data.find((c) => c.id === currentId);
      currentId = parent?.parent_id ?? null;
    }
    return path;
  }, [activeCategoryId, categoryResponse]);

  const updateFilter = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === val) {
      params.delete(key);
    } else {
      params.set(key, val);
      if (key === "category_id") params.delete("brand_id");
    }
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
      setPriceValue(100000);
    });
  };

  return (
    <div
      className={`w-full max-w-[420px] rounded-[22px] bg-[#F7F7F7] p-6 font-poppins flex flex-col gap-[10px] transition-opacity ${isPending ? "opacity-70" : ""}`}
    >
      <FilterHeader onReset={handleReset} />

      <CategorySection
        tree={categoryTree}
        activeCategoryId={activeCategoryId}
        activePath={activePath}
        onUpdate={updateFilter}
      />

      <PriceSection
        value={priceValue}
        activeMaxPrice={activeMaxPrice}
        setValue={setPriceValue}
        onUpdate={updateFilter}
      />

      <BrandSection
        brands={brands}
        activeBrandId={activeBrandId}
        onUpdate={updateFilter}
      />
    </div>
  );
}
