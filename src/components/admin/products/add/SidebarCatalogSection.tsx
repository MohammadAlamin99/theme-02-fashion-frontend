import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { apiFetch } from "@/utils/api";
import { ChevronDown } from "lucide-react";
import React from "react";
import { Label } from "./Label";

export default function SidebarCatalogSection() {
  const { setValue, watch } = useFormContext();
  const activeCatId = watch("category_id");

  const { data: treeResponse, isLoading } = useQuery({
    queryKey: ["categories-nested-tree-upload"],
    queryFn: async () => {
      const res = await apiFetch("/categories/tree");
      if (!res.ok) throw new Error("Tree serialization error");
      return res.json();
    },
  });

  const unwindTree = (nodes: any[], level = 0) => {
    if (!Array.isArray(nodes)) return null;
    return nodes.map((node) => (
      <React.Fragment key={node.id}>
        <option value={node.id}>
          {"\u00A0\u00A0".repeat(level) + (level > 0 ? "├─ " : "") + node.name}
        </option>
        {node.children &&
          node.children.length > 0 &&
          unwindTree(node.children, level + 1)}
      </React.Fragment>
    ));
  };

  const parsedTreeNodes = (() => {
    if (!treeResponse) return [];
    if (Array.isArray(treeResponse)) return treeResponse;
    if (treeResponse.data && Array.isArray(treeResponse.data))
      return treeResponse.data;
    if (treeResponse.data?.data && Array.isArray(treeResponse.data.data))
      return treeResponse.data.data;
    return [];
  })();

  return (
    <div className="bg-white rounded-[8px] p-5 border border-gray-100 shadow-xs">
      <h3 className="text-black font-medium text-base mb-4">
        Catalog Selection
      </h3>
      <Label required>System Category Tree</Label>
      <div className="relative w-full">
        <select
          value={activeCatId || ""}
          onChange={(e) => setValue("category_id", e.target.value)}
          className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 px-4 py-3 text-xs rounded-[8px] outline-none appearance-none cursor-pointer focus:bg-white"
        >
          <option value="">
            {isLoading
              ? "Synchronizing tree schemas..."
              : "Select Category Node*"}
          </option>
          {parsedTreeNodes.length > 0 && unwindTree(parsedTreeNodes)}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
