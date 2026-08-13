"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MoreVertical, Edit3, Trash2, Loader2 } from "lucide-react";
import DataTable from "../../common/DataTable";
import Pagination from "../../common/Pagination";
import { Blog } from "@/@types/blogpost.type";

interface BlogTableSectionProps {
  blogs: Blog[];
  isLoading: boolean;
  isFetching: boolean;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type RelatedProduct = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  images?: string[];
};

export default function BlogTableSection({
  blogs,
  isLoading,
  isFetching,
  selectedIds,
  setSelectedIds,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: BlogTableSectionProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // Logic to check if all items on the current page are selected
  const isAllSelected =
    blogs.length > 0 && blogs.every((blog) => selectedIds.includes(blog.id));

  // Handler for Select All checkbox in header
  const handleSelectAll = () => {
    if (isAllSelected) {
      const currentIds = blogs.map((b) => b.id);
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      const currentIds = blogs.map((b) => b.id);
      setSelectedIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const columns = [
    {
      header: "",
      headerRender: () => (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={handleSelectAll}
          className="cursor-pointer"
        />
      ),
      key: "select",
      render: (item: Blog) => (
        <input
          type="checkbox"
          className="cursor-pointer"
          checked={selectedIds?.includes(item.id) || false}
          onChange={() =>
            setSelectedIds((prev) =>
              prev.includes(item.id)
                ? prev.filter((i) => i !== item.id)
                : [...prev, item.id],
            )
          }
        />
      ),
    },
    {
      header: "SL",
      key: "sl",
      render: (_: Blog, index: number) => (
        <span className="text-gray-700">{index + 1}</span>
      ),
    },
    {
      header: "Name",
      key: "name",
      render: (item: Blog) => {
        // Safe image URL calculation
        const imageUrl = item.featured_image?.startsWith("http")
          ? item.featured_image
          : `${backendBaseUrl}/${item.featured_image?.replace(/^\/+/, "")}`;

        return (
          <div className="flex items-center gap-3">
            <div className="relative shrink-0 w-12 h-12">
              <Image
                src={imageUrl || "/placeholder.png"}
                alt={item.title || "Blog Image"}
                fill
                className="rounded-lg object-cover border"
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-800 leading-tight text-sm">
                {item.title}
              </span>
              <span className="text-[10px] text-gray-400">{item.slug}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Products",
      key: "products",
      render: (item: Blog) => {
        const products = item?.related_products || [];

        return (
          <div className="flex flex-col gap-2">
            {products && products.length > 0 ? (
              products.map((product: RelatedProduct, index: number) => {
                const imageUrl = product.images?.[0]?.startsWith("http")
                  ? product.images[0]
                  : product.images?.[0]
                    ? `${backendBaseUrl}/${product.images[0].replace(/^\/+/, "")}`
                    : "/placeholder.png";

                return (
                  <div
                    key={product.id ?? product._id ?? index}
                    className="flex items-center gap-3"
                  >
                    <div className="relative shrink-0 w-10 h-10 rounded-md overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={product.name || "Product Image"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <span className="font-medium text-gray-800 text-sm">
                      {product.name || product.title}
                    </span>
                  </div>
                );
              })
            ) : (
              <span className="text-gray-400 text-sm">No products</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Order",
      key: "order",
      render: (item: Blog) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 leading-tight text-sm">
            {item?.order}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (item: Blog) => {
        const isPublished = item.status === "PUBLISHED";
        return (
          <span
            className={`px-3 py-1 rounded-full text-[12px] font-medium font-poppins capitalize ${
              isPublished
                ? "bg-[#C1FFBC] text-[#085E00]"
                : "bg-[#FEDFA6] text-[#5E2400]"
            }`}
          >
            {item.status}
          </span>
        );
      },
    },
    {
      header: "Action",
      key: "action",
      render: (item: Blog) => (
        <div className="relative">
          <button
            onClick={() =>
              setActiveMenu(activeMenu === item.id ? null : item.id)
            }
            className="p-1 cursor-pointer"
          >
            <MoreVertical size={20} />
          </button>
          {activeMenu === item.id && (
            <div className="absolute right-0 mt-1 w-28 bg-white shadow-lg rounded-md z-50 py-1 border border-gray-100">
              <button
                onClick={() => {
                  onEdit(item);
                  setActiveMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                onClick={() => {
                  onDelete(item.id);
                  setActiveMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div
      className={`mt-4 transition-opacity ${isFetching && !isLoading ? "opacity-60" : "opacity-100"}`}
    >
      {isLoading ? (
        <div className="p-10 text-center">
          <Loader2 className="animate-spin inline text-sky-500" size={32} />
        </div>
      ) : (
        <>
          <DataTable
            data={blogs}
            columns={columns}
            rowKey="id"
            gradiant={true}
          />
          <div className="mx-4 mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
