import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { apiFetch } from "@/utils/api";
import React, { useMemo } from "react";

interface CategoryNode {
  id: string | number;
  name: string;
  children?: CategoryNode[];
}

// Custom dropdown chevron icon (matches design)
function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="7"
      viewBox="0 0 10 7"
      fill="none"
      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
    >
      <path
        d="M0.394621 2.28L3.84795 5.73333C3.97131 5.85694 4.11782 5.955 4.27912 6.02191C4.44042 6.08882 4.61333 6.12326 4.78795 6.12326C4.96258 6.12326 5.13549 6.08882 5.29679 6.02191C5.45809 5.955 5.6046 5.85694 5.72795 5.73333L9.18129 2.28C10.008 1.44 9.42129 0 8.23462 0H1.34129C0.141288 0 -0.445378 1.44 0.394621 2.28Z"
        fill="#969696"
      />
    </svg>
  );
}

// Reusable styled select, matches the image design
function CatalogSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options: CategoryNode[];
}) {
  return (
    <div className="mb-4">
      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#F9F9F9] text-gray-800 px-3 py-4 text-sm rounded-lg outline-none appearance-none cursor-pointer focus:bg-white"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
        <ChevronIcon />
      </div>
    </div>
  );
}

export default function SidebarCatalogSection() {
  const { setValue, watch } = useFormContext();

  const categoryId = watch("category_id");
  const subCategoryId = watch("sub_category_id");
  const childCategoryId = watch("child_category_id");

  const { data: treeResponse, isLoading } = useQuery({
    queryKey: ["categories-nested-tree-upload"],
    queryFn: async () => {
      const res = await apiFetch("/categories/tree?limit=200");
      if (!res.ok) throw new Error("Tree serialization error");
      return res.json();
    },
  });

  const rootNodes: CategoryNode[] = useMemo(() => {
    if (!treeResponse) return [];
    if (Array.isArray(treeResponse)) return treeResponse;
    if (treeResponse.data && Array.isArray(treeResponse.data))
      return treeResponse.data;
    if (treeResponse.data?.data && Array.isArray(treeResponse.data.data))
      return treeResponse.data.data;
    return [];
  }, [treeResponse]);

  // Level 2: children of selected category
  const subCategoryNodes: CategoryNode[] = useMemo(() => {
    const selected = rootNodes.find((n) => String(n.id) === String(categoryId));
    return selected?.children ?? [];
  }, [rootNodes, categoryId]);

  // Level 3: children of selected sub category
  const childCategoryNodes: CategoryNode[] = useMemo(() => {
    const selected = subCategoryNodes.find(
      (n) => String(n.id) === String(subCategoryId),
    );
    return selected?.children ?? [];
  }, [subCategoryNodes, subCategoryId]);

  const handleCategoryChange = (val: string) => {
    setValue("category_id", val);
    setValue("sub_category_id", "");
    setValue("child_category_id", "");
  };

  const handleSubCategoryChange = (val: string) => {
    setValue("sub_category_id", val);
    setValue("child_category_id", "");
  };

  const handleChildCategoryChange = (val: string) => {
    setValue("child_category_id", val);
  };

  return (
    <div className="bg-white rounded-lg p-5">
      <h3 className="text-black font-medium text-lg mb-4">Catalog</h3>

      <CatalogSelect
        value={categoryId || ""}
        onChange={handleCategoryChange}
        placeholder={isLoading ? "Loading..." : "Select Category*"}
        options={rootNodes}
      />

      {/* Sub Category shows only after Category is selected */}
      {categoryId && (
        <CatalogSelect
          value={subCategoryId || ""}
          onChange={handleSubCategoryChange}
          placeholder="Select Sub Category*"
          options={subCategoryNodes}
        />
      )}

      {/* Child Category shows only after Sub Category is selected */}
      {categoryId && subCategoryId && (
        <CatalogSelect
          value={childCategoryId || ""}
          onChange={handleChildCategoryChange}
          placeholder="Select Child Category*"
          options={childCategoryNodes}
        />
      )}
    </div>
  );
}
