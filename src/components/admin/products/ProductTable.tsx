"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MoreVertical, Trash2, Edit3, Loader2 } from "lucide-react";
import { fetchAllProducts, deleteProduct } from "@/services-api/productService";
import { apiFetch } from "@/utils/api";
import DataTable from "../common/DataTable";
import Pagination from "../common/Pagination";
import Image from "next/image";
import toast from "react-hot-toast";

interface ExtendedTableColumn<T> {
  header: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}
interface TableData {
  id: string;
  name: string;
  images?: string[];
  category?: {
    id?: string;
    name?: string;
  };
  category_id?: string;
  sku?: string;
  priority?: number;
  status?: "PUBLISHED" | "DRAFT" | "active" | string;
}

export default function ProductTable() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL parameters for query synchronization
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const category_id = searchParams.get("category_id") || "";
  const status = searchParams.get("status") || "";

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const baseStorageUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // FETCH WORKFLOW: Synchronizes state updates across all dashboard screens
  const { data: serverPayload, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-list-panel", page, limit, search, category_id, status],
    queryFn: () =>
      fetchAllProducts({ page, limit, search, category_id, status }),
    refetchOnWindowFocus: true, // Forces immediate synchronization when returning to this page
    refetchOnMount: "always", // 🚀 FIXED: Enforce continuous network syncing when this layout section renders
    staleTime: 0, // 🚀 FIXED: Marks local dataset immediately stale to prioritize incoming PATCH responses
  });

  // 🚀 FETCH WORKFLOW: Get the exact categories deep multi-level tree mapping
  const { data: treeResponse } = useQuery({
    queryKey: ["categories-nested-tree-upload"],
    queryFn: async () => {
      const res = await apiFetch("/categories/tree");
      return res.json();
    },
  });

  // 🚀 FIXED RESOLUTION MAP: Deep scan every child node level recursively to build an unambiguous dictionary matching ids to absolute sub/child category names
  const categoryLookupMap = useMemo(() => {
    const lookup: Record<string, string> = {};

    const parsedNodes = (() => {
      if (!treeResponse) return [];
      if (Array.isArray(treeResponse)) return treeResponse;
      if (treeResponse.data && Array.isArray(treeResponse.data))
        return treeResponse.data;
      if (treeResponse.data?.data && Array.isArray(treeResponse.data.data))
        return treeResponse.data.data;
      return [];
    })();

    const traverseDeepTree = (
      nodes: {
        id: string;
        name: string;
        children?: [];
      }[],
    ) => {
      if (!Array.isArray(nodes)) return;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node && node.id && node.name) {
          lookup[node.id] = node.name;
        }
        // Recursively trace through deep subcategories / children branches down to the lowest leaf node
        if (
          node &&
          node.children &&
          Array.isArray(node.children) &&
          node.children.length > 0
        ) {
          traverseDeepTree(node.children);
        }
      }
    };

    traverseDeepTree(parsedNodes);
    return lookup;
  }, [treeResponse]);

  const productList = serverPayload?.data || [];
  const meta = serverPayload?.meta || { totalPages: 1, total: 0 };

  // DELETE MUTATION WORKFLOW
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-list-panel"] });
      toast.success("Product successfully deleted from catalog.");
      setActiveMenuId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const handlePageChange = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === productList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(productList.map((product: { id: string }) => product.id));
    }
  };

  const productColumns: ExtendedTableColumn<TableData>[] = [
    {
      header: "",
      key: "checkbox-selection",
      headerClassName: "w-[40px] px-4 py-3 text-left",
      className: "px-4 py-3 align-middle",
      headerRender: () => (
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-[#023337]/30 accent-[#1DA1F2] cursor-pointer"
          checked={
            selectedIds.length === productList.length && productList.length > 0
          }
          onChange={handleSelectAll}
        />
      ),
      render: (product) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-[#EAF8E7] accent-[#1DA1F2] cursor-pointer"
          checked={selectedIds.includes(product.id)}
          onChange={() => handleSelectRow(product.id)}
        />
      ),
    },
    {
      header: "SL",
      key: "sl",
      headerClassName: "px-4 py-3 text-left",
      className: "px-4 py-3 align-middle",
      render: (_, index) => (
        <span className="text-[15px] text-[#1D1A1A] font-normal">
          {(page - 1) * limit + (index ?? 0) + 1}
        </span>
      ),
    },
    {
      header: "Image",
      key: "image",
      headerClassName: "px-4 py-3 text-left",
      className: "px-4 py-3 align-middle",
      render: (product) => {
        const rawImg = Array.isArray(product.images) ? product.images[0] : null;
        const cleanImg = typeof rawImg === "string" ? rawImg.trim() : "";
        const isValidImg = cleanImg.replace(/^\/+/, "").length > 0;
        const srcUrl = isValidImg
          ? cleanImg.startsWith("http")
            ? cleanImg
            : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`
          : "/images/products/product2.png";
        return (
          <Image
            src={srcUrl}
            alt="Product Image"
            width={50}
            height={50}
            className="rounded-lg object-cover h-11 w-11 bg-gray-50"
            unoptimized
          />
        );
      },
    },
    {
      header: "Name",
      key: "name",
      headerClassName: "px-4 py-3 text-left",
      className: "px-4 py-3 align-middle",
      render: (product) => (
        <span
          className="text-[15px] text-[#1D1A1A] font-normal block max-w-[300px] truncate"
          title={product.name}
        >
          {product.name}
        </span>
      ),
    },
    {
      header: "Category",
      key: "category",
      headerClassName: "px-4 py-3 text-left",
      className: "px-4 py-3 align-middle",
      render: (product) => {
        // 🚀 RESOLVED: Evaluates the specific category_id string value against the deep parsed map dictionary entries
        const targetCategoryString =
          product.category?.name ||
          categoryLookupMap[product.category_id || ""] ||
          "Uncategorized";
        return (
          <span className="text-[13px] xl:text-[15px] text-black font-normal">
            {targetCategoryString}
          </span>
        );
      },
    },
    {
      header: "SKU",
      key: "sku",
      headerClassName: "px-4 py-3 text-left",
      className: "px-4 py-3 align-middle",
      render: (product) => (
        <span className="text-[13px] xl:text-[15px] text-black font-normal">
          {product.sku || "N/A"}
        </span>
      ),
    },
    {
      header: "Priority",
      key: "priority",
      headerClassName: "px-4 py-3 text-left",
      className: "px-4 py-3 align-middle",
      render: (product) => (
        <span className="text-[13px] xl:text-[15px] text-black font-normal">
          {product.priority ?? 100}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      headerClassName: "px-4 py-3 text-left",
      className: "px-4 py-3 align-middle",
      render: (product) => {
        const isPublished =
          product.status === "PUBLISHED" || product.status === "active";
        return (
          <div
            className={`px-3 py-1 rounded-full text-[12px] font-medium w-fit ${isPublished ? "bg-[#C1FFBC] text-[#085E00]" : "bg-gray-100 text-gray-500"}`}
          >
            {isPublished ? "Publish" : product.status}
          </div>
        );
      },
    },
    {
      header: "Action",
      key: "action",
      headerClassName: "px-4 py-3 text-right",
      className: "px-4 py-3 align-middle text-right",
      render: (product) => (
        <div className="relative inline-block text-left">
          <button
            onClick={() =>
              setActiveMenuId(activeMenuId === product.id ? null : product.id)
            }
            className="text-black p-1 cursor-pointer"
          >
            <MoreVertical size={20} />
          </button>
          {activeMenuId === product.id && (
            <div className="absolute right-0 mt-1 w-32 bg-white  rounded-md shadow-lg py-1 z-50 text-left">
              <button
                type="button"
                onClick={() =>
                  router.push(`/admin/dashboard/products/add?id=${product.id}`)
                }
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
              >
                <Edit3 size={12} /> Edit Item
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this product?"))
                    deleteMutation.mutate(product.id);
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Trash2 size={12} /> Delete Item
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (isLoadingProducts) {
    return (
      <div className="h-64 w-full bg-white flex flex-col items-center justify-center text-gray-400 gap-2 font-poppins">
        <Loader2 className="animate-spin text-gray-400" size={24} />
        <span className="text-xs">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white font-poppins">
      <DataTable
        data={productList}
        columns={productColumns}
        rowKey="id"
        gradiant={true}
      />
      {productList.length > 0 && (
        <div className="py-5 md:mx-10 mx-2">
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
