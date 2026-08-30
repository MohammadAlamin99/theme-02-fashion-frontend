// "use client";

// import { useState, useMemo, useTransition } from "react";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";
// import {
//   Category,
//   getAllcategoryFlatList,
// } from "@/services-api/categoryService";
// import { Brand } from "@/services-api/brandService";
// import { CategoryTreeNode } from "@/@types/filter.type";
// import CategorySection from "./CategorySection";
// import FilterHeader from "./FilterHeader";
// import PriceSection from "./PriceSection";
// import BrandSection from "./BrandSection";

// interface FilterSidebarProps {
//   brands?: Brand[];
//   activeCategoryName?: string;
//   activeCategorySlug?: string;
//   totalProductCount?: number;
// }

// export default function FilterSidebar({
//   brands = [],
//   activeCategorySlug = "",
// }: FilterSidebarProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const pathname = usePathname();
//   const [isPending, startTransition] = useTransition();

//   const activeBrandId =
//     searchParams.get("brand_slug") ||
//     searchParams.get("brand") ||
//     searchParams.get("brand_id") ||
//     "";
//   const activeMaxPrice = searchParams.get("max") || "100000";
//   const queryCategoryId = searchParams.get("category_id") || "";

//   const [priceValue, setPriceValue] = useState<number>(Number(activeMaxPrice));
//   const [prevMaxPrice, setPrevMaxPrice] = useState<string>(activeMaxPrice);

//   if (activeMaxPrice !== prevMaxPrice) {
//     setPrevMaxPrice(activeMaxPrice);
//     setPriceValue(Number(activeMaxPrice));
//   }

//   const { data: categoryResponse } = useQuery<{ data: Category[] }>({
//     queryKey: ["all-categories"],
//     queryFn: () => getAllcategoryFlatList(),
//   });

//   // Derive target active category ID from slug if no category_id query param
//   const activeCategoryId = useMemo(() => {
//     if (queryCategoryId) return queryCategoryId;
//     if (!activeCategorySlug || !categoryResponse?.data) return "";
//     const matched = categoryResponse.data.find(
//       (c) => c.slug === activeCategorySlug,
//     );
//     return matched?.id || "";
//   }, [queryCategoryId, activeCategorySlug, categoryResponse]);

//   // Build recursive tree structure
//   const categoryTree = useMemo(() => {
//     const list = categoryResponse?.data || [];
//     const build = (parentId: string | null): CategoryTreeNode[] => {
//       return list
//         .filter((item) => item.parent_id === parentId)
//         .map((item) => ({
//           ...item,
//           children: build(item.id),
//         }));
//     };
//     return build(null);
//   }, [categoryResponse]);

//   // Determine which branches of the tree should be open
//   const activePath = useMemo(() => {
//     const path = new Set<string>();
//     if (!activeCategoryId || !categoryResponse?.data) return path;
//     let currentId: string | null = activeCategoryId;
//     while (currentId) {
//       path.add(currentId);
//       const parent = categoryResponse.data.find((c) => c.id === currentId);
//       currentId = parent?.parent_id ?? null;
//     }
//     return path;
//   }, [activeCategoryId, categoryResponse]);

//   // Build full slug path for nested category routing (main/sub/child)
//   const getFullSlugPath = (nodeId: string): string => {
//     if (!categoryResponse?.data) return "";
//     const segments: string[] = [];
//     let current: any = categoryResponse.data.find((c) => c.id === nodeId);
//     while (current) {
//       if (current.slug) segments.unshift(current.slug);
//       current = categoryResponse.data.find((c) => c.id === current.parent_id);
//     }
//     return segments.join("/");
//   };

//   const updateCategoryFilter = (nodeSlug: string, nodeId: string) => {
//     const fullPath = nodeId ? getFullSlugPath(nodeId) : "";

//     startTransition(() => {
//       if (!fullPath) {
//         router.push(`/category`, { scroll: false });
//       } else {
//         router.push(`/category/${fullPath}`, { scroll: false });
//       }
//     });
//   };

//   const updateFilter = (key: string, val: string) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.delete("category_id"); // Ensure residual category_id is cleared

//     if (key === "brand_id" || key === "brand_slug" || key === "brand") {
//       params.delete("brand_id");
//       params.delete("brand_slug");
//       params.delete("brand");

//       if (val) {
//         params.set(key, val);
//       }
//       params.set("page", "1");
//       startTransition(() => {
//         const queryString = params.toString() ? `?${params.toString()}` : "";
//         router.push(`/category${queryString}`, { scroll: false });
//       });
//       return;
//     }

//     if (params.get(key) === val) {
//       params.delete(key);
//     } else {
//       params.set(key, val);
//     }
//     params.set("page", "1");
//     startTransition(() => {
//       router.push(`${pathname}?${params.toString()}`, { scroll: false });
//     });
//   };

//   const handleReset = () => {
//     startTransition(() => {
//       router.push("/category", { scroll: false });
//       setPriceValue(100000);
//     });
//   };

//   return (
//     <div
//       className={`w-full max-w-[420px] rounded-[22px] bg-[#F7F7F7] p-6 font-poppins flex flex-col gap-[10px] transition-opacity ${isPending ? "opacity-70" : ""}`}
//     >
//       <FilterHeader onReset={handleReset} />

//       <CategorySection
//         tree={categoryTree}
//         activeCategoryId={activeCategoryId}
//         activePath={activePath}
//         onUpdate={updateFilter}
//         onSelectCategory={updateCategoryFilter}
//       />

//       <PriceSection
//         value={priceValue}
//         activeMaxPrice={activeMaxPrice}
//         setValue={setPriceValue}
//         onUpdate={updateFilter}
//       />

//       <BrandSection
//         brands={brands}
//         activeBrandId={activeBrandId}
//         onUpdate={updateFilter}
//       />
//     </div>
//   );
// }

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
  activeCategorySlug?: string;
  totalProductCount?: number;
}

export default function FilterSidebar({
  brands = [],
  activeCategorySlug = "",
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeBrandId =
    searchParams.get("brand_slug") ||
    searchParams.get("brand") ||
    searchParams.get("brand_id") ||
    "";
  const activeMaxPrice = searchParams.get("max") || "100000";
  const queryCategoryId = searchParams.get("category_id") || "";

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

  // Derive target active category ID from slug if no category_id query param
  const activeCategoryId = useMemo(() => {
    if (queryCategoryId) return queryCategoryId;
    if (!activeCategorySlug || !categoryResponse?.data) return "";
    const matched = categoryResponse.data.find(
      (c) => c.slug === activeCategorySlug,
    );
    return matched?.id || "";
  }, [queryCategoryId, activeCategorySlug, categoryResponse]);

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

  // Build full slug path for nested category routing (main/sub/child)
  const getFullSlugPath = (nodeId: string): string => {
    if (!categoryResponse?.data) return "";
    const segments: string[] = [];
    let current: Category | undefined = categoryResponse.data.find(
      (c) => c.id === nodeId,
    );
    while (current) {
      if (current.slug) segments.unshift(current.slug);
      current = categoryResponse.data.find((c) => c.id === current!.parent_id);
    }
    return segments.join("/");
  };

  const updateCategoryFilter = (nodeSlug: string, nodeId: string) => {
    const fullPath = nodeId ? getFullSlugPath(nodeId) : "";

    // When switching to a category, clear all brand filters — they are mutually exclusive
    const params = new URLSearchParams();
    params.set("page", "1");

    const queryString = params.toString() ? `?${params.toString()}` : "";

    startTransition(() => {
      if (!fullPath) {
        router.push(`/category${queryString}`, { scroll: false });
      } else {
        router.push(`/category/${fullPath}${queryString}`, { scroll: false });
      }
    });
  };

  const updateFilter = (key: string, val: string) => {
    if (key === "brand_id" || key === "brand_slug" || key === "brand") {
      // When switching to a brand, clear category path — navigate to /category base
      // Brand and category slug path are mutually exclusive
      const params = new URLSearchParams();
      if (val) {
        params.set(key, val);
      }
      params.set("page", "1");
      startTransition(() => {
        const queryString = params.toString() ? `?${params.toString()}` : "";
        router.push(`/category${queryString}`, { scroll: false });
      });
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("category_id");

    if (params.get(key) === val) {
      params.delete(key);
    } else {
      params.set(key, val);
    }
    params.set("page", "1");
    startTransition(() => {
      const queryString = params.toString() ? `?${params.toString()}` : "";
      router.push(`${pathname}${queryString}`, { scroll: false });
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push("/category", { scroll: false });
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
        onSelectCategory={updateCategoryFilter}
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
