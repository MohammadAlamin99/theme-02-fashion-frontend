"use client";
import React, { useRef, ChangeEvent, useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  Loader2,
  UploadCloud,
  ChevronUp,
  Package,
  X,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { uploadBlogImage } from "@/services-api/blogService";
import { searchProducts } from "@/services-api/productService";
import { BlogFormData } from "@/@types/blogpost.type";
import toast from "react-hot-toast";

import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

import Select, { StylesConfig } from "react-select";
import PrimaryButton from "../../common/PrimaryButton";

interface Product {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  featured_image?: string;
  thumbnail?: string;
}

interface Props {
  editingId: string | null;
  formData: BlogFormData;
  setFormData: React.Dispatch<React.SetStateAction<BlogFormData>>;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  products?: Product[];
}

interface UploadResponse {
  image_url?: string;
  data?: {
    image_url?: string;
  };
}

export default function BlogForm({
  editingId,
  formData,
  setFormData,
  onClose,
  onSave,
  isSaving,
  products = [],
}: Props) {
  const blogBannerRef = useRef<HTMLInputElement>(null);
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "blockquote"],
      [{ color: [] }],
      [{ align: [] }, { indent: "-1" }, { indent: "+1" }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
      ["image", "link", "video"],
    ],
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchValue]);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["product-search", debouncedSearch],
    queryFn: () => searchProducts(debouncedSearch),
    enabled: debouncedSearch.length > 1,
  });

  // Available products pool: props + deduped search results (no circular dep)
  const searchAdditions = Array.isArray(searchResults)
    ? searchResults.filter((p) => {
        const pId = p.id || p._id;
        return pId && !products.find((x) => (x.id || x._id) === pId);
      })
    : [];
  const availableProducts: Product[] = [...products, ...searchAdditions];

  // Derive selected products directly from formData.product_ids — no separate state needed
  const selectedProducts = (formData.product_ids ?? []).map(
    (id) => availableProducts.find((p) => (p.id || p._id) === id) ?? { id },
  );

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: isAutoSlug ? generateSlug(newTitle) : prev.slug,
    }));
  };

  const blogImageMutation = useMutation<UploadResponse, Error, File>({
    mutationFn: (file: File) => uploadBlogImage(file),
    onSuccess: (res) => {
      const imageUrl = res?.image_url || res?.data?.image_url;
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, featured_image: imageUrl }));
        toast.success("Image uploaded successfully!");
      }
    },
    onError: () => {
      toast.error("Failed to upload image.");
    },
  });

  const handleRemoveProduct = (idToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      product_ids: (prev.product_ids ?? []).filter((id) => id !== idToRemove),
    }));
  };

  const formatOptionLabel = (option: { value: string; label: string }) => {
    const product = availableProducts.find(
      (p) => (p.id || p._id) === option.value,
    );
    const imgPath = product?.featured_image || product?.thumbnail;
    const imgSrc = imgPath
      ? imgPath.startsWith("http")
        ? imgPath
        : `${backendBaseUrl}/${imgPath.replace(/^\/+/, "")}`
      : null;

    return (
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0 border flex items-center justify-center">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <Package size={14} className="text-gray-400" />
          )}
        </div>
        <span className="text-sm font-medium">{option.label}</span>
      </div>
    );
  };

  const selectOptions = availableProducts.map((p) => ({
    value: (p.id || p._id) as string,
    label: (p.name || p.title) as string,
  }));

  const selectStyles: StylesConfig<{ value: string; label: string }, false> = {
    control: (base) => ({
      ...base,
      background: "#F9FAFB",
      borderColor: "#E5E7EB",
      borderRadius: "0.5rem",
      fontSize: "14px",
      minHeight: "45px",
      boxShadow: "none",
    }),
  };

  if (!formData) return null;

  return (
    <div className="bg-white min-h-screen p-6 font-lato">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white cursor-pointer"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">
            {editingId ? "Edit Blog" : "Create Blog"}
          </h1>
        </div>
        <PrimaryButton
          onClick={onSave}
          label={
            isSaving ? "Saving..." : editingId ? "Update Blog" : "Save Blog"
          }
        />
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="flex items-center justify-between py-5">
            <h3 className="font-bold text-slate-800 text-lg">
              General Information
            </h3>
            <ChevronUp size={20} className="text-gray-400" />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700">
                  Blog Title*
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 font-bold uppercase">
                    Auto Slug
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isAutoSlug}
                      onChange={() => setIsAutoSlug(!isAutoSlug)}
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </div>
              <input
                value={formData.title || ""}
                onChange={handleTitleChange}
                type="text"
                placeholder="Ex: Samsung Galaxy S25 Ultra"
                className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-[#F9FAFB] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Blog Slug
              </label>
              <input
                value={formData.slug || ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, slug: e.target.value }))
                }
                type="text"
                readOnly={isAutoSlug}
                className={`w-full border border-gray-200 rounded-lg p-3 text-sm ${isAutoSlug ? "bg-gray-100 text-gray-400" : "bg-[#F9FAFB]"}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status || "PUBLISHED"}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      status: e.target.value as BlogFormData["status"],
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-[#F9FAFB] outline-none"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Display Order
                </label>
                <input
                  value={formData.order ?? 0}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  type="number"
                  min="0"
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-[#F9FAFB] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Related Products
              </label>
              <Select<{ value: string; label: string }, false>
                options={selectOptions}
                isLoading={isSearching}
                onInputChange={(val) => setSearchValue(val)}
                formatOptionLabel={formatOptionLabel}
                value={null}
                placeholder="Type to search products..."
                styles={selectStyles}
                onChange={(option) => {
                  if (option) {
                    const newId = option.value;
                    if (!formData.product_ids?.includes(newId)) {
                      setFormData((prev) => ({
                        ...prev,
                        product_ids: [...(prev.product_ids || []), newId],
                      }));
                    }
                  }
                }}
              />
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedProducts.map((p, i) => (
                  <div
                    key={(p.id || p._id) ?? i}
                    className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg"
                  >
                    <span className="text-sm text-gray-700 truncate">
                      {p.name || p.title || p.id || p._id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct((p.id || p._id)!)}
                      className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                YouTube Video Link
              </label>
              <input
                type="text"
                placeholder="Paste YouTube Video Link here"
                value={formData.youtube_link || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    youtube_link: e.target.value,
                  }))
                }
                className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-[#F9FAFB] outline-none"
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-slate-700 mb-4 mt-2">
                Blog Banner*
              </label>
              <input
                type="file"
                ref={blogBannerRef}
                className="hidden"
                accept="image/*"
                onChange={(e) =>
                  e.target.files && blogImageMutation.mutate(e.target.files[0])
                }
              />
              <div
                onClick={() => blogBannerRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 bg-[#FAFAFA] flex flex-col items-center justify-center cursor-pointer min-h-[220px]"
              >
                {blogImageMutation.isPending ? (
                  <Loader2 size={32} className="animate-spin text-sky-500" />
                ) : formData.featured_image ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={`${backendBaseUrl}/${formData.featured_image.replace(/^\/+/, "")}`}
                      className="object-contain rounded-lg"
                      alt="Preview"
                      fill
                      unoptimized
                    />
                  </div>
                ) : (
                  <>
                    <UploadCloud size={48} className="text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm font-medium">
                      Click to upload banner
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white">
              <h3 className="font-bold text-slate-800 mb-4">
                Blog Description*
              </h3>
              <ReactQuill
                theme="snow"
                value={formData.content || ""}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, content: val }))
                }
                modules={quillModules}
                placeholder="Write your blog description here..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl py-6">
          <h3 className="font-bold text-slate-900 text-2xl mb-6">Blog SEO</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Meta Title"
              value={formData.meta_title || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
              }
              className="w-full border border-gray-100 rounded-lg p-4 text-sm bg-[#F9FAFB] outline-none text-gray-600"
            />
            <input
              type="text"
              placeholder="Meta Tag"
              value={formData.meta_tag || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, meta_tag: e.target.value }))
              }
              className="w-full border border-gray-100 rounded-lg p-4 text-sm bg-[#F9FAFB] outline-none text-gray-600"
            />
            <textarea
              placeholder="Meta Description"
              value={formData.meta_description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meta_description: e.target.value,
                }))
              }
              rows={3}
              className="w-full border border-gray-100 rounded-lg p-4 text-sm bg-[#F9FAFB] outline-none text-gray-600 resize-none"
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border-radius: 8px 8px 0 0;
          background: #f9fafb;
          border: 1px solid #e5e7eb !important;
          padding: 12px !important;
        }
        .ql-container.ql-snow {
          border-radius: 0 0 8px 8px;
          border: 1px solid #e5e7eb !important;
          min-height: 250px;
        }
        .ql-editor {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
