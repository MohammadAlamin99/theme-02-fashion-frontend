"use client";
import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import { X, Image as ImageIcon, Search, Loader2, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createCampaign,
  updateCampaign,
  uploadCampaignBanner,
  Campaign,
  CreateCampaignInput,
} from "@/services-api/campaignService";
import { searchProducts } from "@/services-api/productService";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  thumbnail?: string;
  sku?: string;
}

export interface CampaignProduct {
  product_id: string;
  product: Product;
}

export interface ExtendedCampaign extends Omit<Campaign, "campaign_products"> {
  campaign_products?: CampaignProduct[];
}

interface FormDataState {
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  discount_value: string;
  min_order_amount: string;
  is_free_delivery: boolean;
  banner_url: string;
  status: "active" | "draft";
  product_ids: string[];
  selected_products_info: Product[];
}

interface ModalProps {
  mode: "add" | "edit";
  data?: ExtendedCampaign;
  onClose: () => void;
}

interface BannerUploadResponse {
  background_image_url?: string;
  data?: {
    background_image_url?: string;
  };
}

export default function CampaignModal({ mode, data, onClose }: ModalProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getInitialState = (): FormDataState => {
    if (mode === "edit" && data) {
      const rawProducts = data.campaign_products || [];
      const product_ids = rawProducts
        .map((cp) => String(cp.product_id))
        .filter(Boolean);
      const selected_products_info = rawProducts
        .map((cp) => ({
          ...cp.product,
          id: cp.product?.id || String(cp.product_id),
        }))
        .filter((p): p is Product => !!p.name);

      return {
        name: data.name || "",
        slug: data.slug || "",
        start_date: data.start_date?.split("T")[0] || "",
        end_date: data.end_date?.split("T")[0] || "",
        discount_value: String(data.discount_value || ""),
        min_order_amount: String(data.min_order_amount || ""),
        is_free_delivery: data.is_free_delivery || false,
        banner_url: data.banner_url || "",
        status: (data.status as "active" | "draft") || "active",
        product_ids,
        selected_products_info,
      };
    }
    return {
      name: "",
      slug: "",
      start_date: "",
      end_date: "",
      discount_value: "",
      min_order_amount: "",
      is_free_delivery: false,
      banner_url: "",
      status: "active",
      product_ids: [],
      selected_products_info: [],
    };
  };

  const [formData, setFormData] = useState<FormDataState>(getInitialState);

  const { data: searchResults, isLoading: isSearching } = useQuery<Product[]>({
    queryKey: ["product-search", searchTerm],
    queryFn: () => searchProducts(searchTerm),
    enabled: searchTerm.length > 1,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product: Product) => {
    const productId = String(product.id);
    setFormData((prev) => {
      const isSelected = prev.product_ids.includes(productId);
      if (isSelected) {
        return {
          ...prev,
          product_ids: prev.product_ids.filter((id) => id !== productId),
          selected_products_info: prev.selected_products_info.filter(
            (p) => String(p.id) !== productId,
          ),
        };
      } else {
        return {
          ...prev,
          product_ids: [...prev.product_ids, productId],
          selected_products_info: [...prev.selected_products_info, product],
        };
      }
    });
  };

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const handleBannerUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res: BannerUploadResponse = await uploadCampaignBanner(file);
      const imageUrl =
        res.data?.background_image_url || res.background_image_url;
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, banner_url: imageUrl }));
        toast.success("Banner uploaded successfully!");
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (payload: CreateCampaignInput) =>
      mode === "add"
        ? createCampaign(payload)
        : updateCampaign(data!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(
        `Campaign ${mode === "add" ? "created" : "updated"} successfully!`,
      );
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || "Action failed"),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.start_date)
      return toast.error("Required fields missing");
    if (formData.product_ids.length === 0)
      return toast.error("Select at least one product");

    const finalPayload: CreateCampaignInput = {
      ...formData,
      slug:
        formData.slug ||
        formData.name.toLowerCase().trim().replace(/\s+/g, "-"),
      start_date: new Date(formData.start_date).toISOString(),
      end_date: formData.end_date
        ? new Date(formData.end_date).toISOString()
        : null,
      discount_value: Number(formData.discount_value) || 0,
      min_order_amount: Number(formData.min_order_amount) || 0,
    };
    mutation.mutate(finalPayload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 font-poppins">
      <div className="bg-white w-full max-w-[550px] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#023337]">
              {mode === "add" ? "Add Campaign" : "Edit Campaign"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#023337] mb-1.5">
                Campaign Name*
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#023337] mb-1.5">
                  Start Date*
                </label>
                <input
                  required
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#023337] mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#023337] mb-1.5">
                Add Banner
              </label>
              <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/30 relative min-h-[160px]">
                {uploading ? (
                  <Loader2
                    className="animate-spin text-blue-400 mb-2"
                    size={32}
                  />
                ) : formData.banner_url ? (
                  <div className="relative w-full mb-2 flex justify-center">
                    <Image
                      src={
                        formData.banner_url.startsWith("http")
                          ? formData.banner_url
                          : `${backendBaseUrl}/${formData.banner_url.replace(/^\/+/, "")}`
                      }
                      className="h-32 w-auto object-contain rounded-lg border shadow-sm"
                      alt="Banner"
                      width={200}
                      height={128}
                      unoptimized
                    />
                  </div>
                ) : (
                  <ImageIcon size={48} className="text-gray-300 mb-2" />
                )}
                <input
                  type="file"
                  id="banner-upload"
                  className="hidden"
                  onChange={handleBannerUpload}
                  accept="image/*"
                />
                <label
                  htmlFor="banner-upload"
                  className="bg-[#FF9F1C] text-white px-6 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  {formData.banner_url ? "Change Image" : "Add Image"}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#023337] mb-1.5">
                  Discount
                </label>
                <input
                  type="text"
                  value={formData.discount_value}
                  placeholder="10%"
                  onChange={(e) =>
                    setFormData({ ...formData, discount_value: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#023337] mb-1.5">
                  Minimum Order
                </label>
                <input
                  type="text"
                  value={formData.min_order_amount}
                  placeholder="BDT 500"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_order_amount: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-[#023337] mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "draft",
                    })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5">
                <span className="text-sm font-semibold text-[#023337]">
                  Free Delivery
                </span>
                <div
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      is_free_delivery: !prev.is_free_delivery,
                    }))
                  }
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.is_free_delivery ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.is_free_delivery ? "left-[22px]" : "left-0.5"}`}
                  />
                </div>
              </div>
            </div>

            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-semibold text-[#023337] mb-1.5">
                Add Products*
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.selected_products_info.map((product) => (
                  <div
                    key={`selected-${product.id}`}
                    className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium border border-blue-100"
                  >
                    {product.name}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => handleSelectProduct(product)}
                    />
                  </div>
                ))}
              </div>
              <div className="relative flex items-center bg-gray-50 rounded-lg border border-gray-100">
                <Search className="ml-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                />
                {isSearching && (
                  <Loader2
                    className="mr-3 animate-spin text-blue-400"
                    size={16}
                  />
                )}
              </div>
              {showDropdown && searchTerm.length > 1 && (
                <div className="absolute z-[110] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {searchResults?.map((product) => (
                    <div
                      key={`result-${product.id}`}
                      onClick={() => handleSelectProduct(product)}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {product.thumbnail && (
                          <img
                            src={product.thumbnail}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <span className="text-sm text-gray-700">
                          {product.name}
                        </span>
                      </div>
                      {formData.product_ids.includes(String(product.id)) && (
                        <Check size={16} className="text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={mutation.isPending || uploading}
                type="submit"
                className="flex-1 py-2.5 bg-[#2EB1FF] text-white rounded-lg text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {mutation.isPending ? "Saving..." : "Save Campaign"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
