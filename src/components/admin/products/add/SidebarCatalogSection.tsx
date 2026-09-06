import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { apiFetch } from "@/utils/api";
import { useMemo } from "react";
import { CatalogSelect } from "./CatalogSelect";

interface CategoryNode {
  id: string | number;
  name: string;
  children?: CategoryNode[];
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
