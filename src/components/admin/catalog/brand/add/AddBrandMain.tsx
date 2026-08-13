"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  uploadBrandImage,
  createBrand,
  updateBrand,
  fetchSingleBrand,
} from "@/services-api/brandService";
import PrimaryButton from "../../../common/PrimaryButton";
import IamgeIcon from "@/components/store-front/svg/svg/IamgeIcon";
import toast from "react-hot-toast";
import Image from "next/image";

const Label = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5 select-none">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

export default function AddBrandMain() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brandId = searchParams.get("id");
  const isEditMode = !!brandId;

  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [isSeoExpanded, setIsSeoExpanded] = useState<boolean>(false);

  const baseStorageUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const methods = useForm({
    defaultValues: {
      name: "",
      slug: "",
      priority: "0",
      status: "active" as "active" | "draft",
      meta_title: "",
      meta_tags: "",
      meta_description: "",
      autoSlug: true,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = methods;
  const autoSlugActive = watch("autoSlug");

  // QUERY: Pre-populate brand information during edit actions
  const { data: existingBrand, isLoading: loadingExisting } = useQuery({
    queryKey: ["brand-single-edit", brandId],
    queryFn: () => fetchSingleBrand(brandId!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && existingBrand) {
      reset({
        name: existingBrand.name || "",
        slug: existingBrand.slug || "",
        priority: String(existingBrand.priority ?? 0),
        status:
          existingBrand.status === "active" ||
          existingBrand.status === "PUBLISHED"
            ? "active"
            : "draft",
        meta_title: existingBrand.meta_title || "",
        meta_tags: existingBrand.meta_tags || "",
        meta_description: existingBrand.meta_description || "",
        autoSlug: false,
      });
      if (existingBrand.logo_url) setLogoUrl(existingBrand.logo_url);
    }
  }, [existingBrand, isEditMode, reset]);

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const data = await uploadBrandImage(file);
      if (data.logo_url) setLogoUrl(data.logo_url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Upload Failure: ${err.message}`);
      } else {
        toast.error("Upload Failure: Unknown error");
      }
    } finally {
      setUploading(false);
    }
  };

  const brandMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      slug: string;
      priority: number;
      status: "active" | "draft";
      meta_title: string | null;
      meta_tags: string | null;
      meta_description: string | null;
      logo_url: string;
    }) => {
      return isEditMode ? updateBrand(brandId!, payload) : createBrand(payload);
    },
    onSuccess: (updatedBrand) => {
      // 🚀 1. INSTANT UPDATE: Manually update the list cache to show change in UI
      queryClient.setQueryData(
        ["catalog-brands-list"],
        (oldData: {
          data: {
            id: string;
          }[];
        }) => {
          if (!oldData || !oldData.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((b: { id: string }) =>
              b.id === brandId ? { ...b, ...updatedBrand } : b,
            ),
          };
        },
      );

      // 2. HARD RESET: Clear all brand-related queries to ensure next fetch is fresh
      queryClient.invalidateQueries({
        queryKey: ["catalog-brands-list"],
        exact: false,
      });

      toast.success("Brand updated successfully!");
      router.push("/admin/dashboard/brand");
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        toast.error(`Validation Failure: ${err.message}`);
      } else {
        toast.error("Validation Failure: Unknown error");
      }
    },
  });

  const onSubmitFormHandler = (data: {
    name: string;
    slug: string;
    priority: string;
    status: "active" | "draft";
    meta_title: string;
    meta_tags: string;
    meta_description: string;
    autoSlug: boolean;
  }) => {
    if (!data.name.trim()) return;

    // 🚀 FIXED: All dynamic Prisma Schema fields attached securely to serialization hooks
    brandMutation.mutate({
      name: data.name,
      slug:
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      priority: Number(data.priority) || 0,
      logo_url: logoUrl || "",
      status: data.status,
      meta_title: data.meta_title || null,
      meta_tags: data.meta_tags || null,
      meta_description: data.meta_description || null,
    });
  };

  if (isEditMode && loadingExisting) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-gray-400 gap-2 bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-gray-500" />
        <span className="text-xs">
          Synchronizing baseline brand state profiles...
        </span>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full min-h-screen font-lato pb-12 bg-[#F9FAFB]">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 p-4 bg-white border border-gray-100 rounded-[8px]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard/brand")}
              className="p-2 hover:bg-gray-100 rounded-full cursor-pointer text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-black sm:text-2xl">
                {isEditMode ? "Edit Brand" : "Add Brand"}
              </h1>
              <p className="text-xs text-gray-400">
                Manage global index identifiers across product listings
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!brandMutation.isPending) handleSubmit(onSubmitFormHandler)();
          }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* LEFT SYSTEM LOGS INTERACTION AREA */}
          <div className="lg:col-span-8 space-y-4">
            {/* Core Generic Information Card */}
            <div className="bg-white rounded-[8px] p-5 border border-gray-100 space-y-5">
              <h3 className="text-[#003032] font-semibold text-lg border-b border-gray-200 pb-2">
                General Info
              </h3>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label required>Brand Name</Label>
                  <div
                    className="flex items-center gap-1.5 cursor-pointer select-none"
                    onClick={() => setValue("autoSlug", !autoSlugActive)}
                  >
                    <span className="text-xs text-gray-400">
                      Auto Generate Slug
                    </span>
                    <input
                      type="checkbox"
                      checked={autoSlugActive}
                      readOnly
                      className="accent-[#1DA1F2]"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  {...register("name", {
                    required: "Brand name context string input required",
                    onChange: (e) => {
                      if (autoSlugActive) {
                        const clean = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "");
                        setValue("slug", clean);
                      }
                    },
                  })}
                  placeholder="Ex: Samsung, Apple, Sony"
                  className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black border border-transparent focus:border-gray-200 focus:bg-white transition-all"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Link Slug (URL Path)</Label>
                <input
                  type="text"
                  {...register("slug", {
                    required: "Unique routing tracking slug token required",
                  })}
                  disabled={autoSlugActive}
                  className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-gray-800 disabled:opacity-60 border border-transparent focus:border-gray-200 focus:bg-white transition-all"
                />
              </div>

              <div>
                <Label>Priority Rank Ordering</Label>
                <input
                  type="number"
                  {...register("priority")}
                  placeholder="0"
                  className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black border border-transparent focus:border-gray-200 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* 🚀 SEO METADATA CARD (MAPS PRISMA SEO ATTRIBUTES PERFECTLY) */}
            <div className="bg-white rounded-[8px] p-5 border border-gray-100 transition-all">
              <div
                className="flex justify-between items-center cursor-pointer select-none"
                onClick={() => setIsSeoExpanded(!isSeoExpanded)}
              >
                <h3 className="text-[#003032] font-semibold text-lg">
                  Search Engine Optimization (SEO)
                </h3>
                {isSeoExpanded ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </div>

              <div
                className={`mt-5 space-y-4 ${isSeoExpanded ? "block" : "hidden"}`}
              >
                <div>
                  <Label>Meta Title</Label>
                  <input
                    type="text"
                    {...register("meta_title", {
                      maxLength: {
                        value: 255,
                        message: "Max length is 255 characters",
                      },
                    })}
                    placeholder="Ex: Buy Samsung Products Online - Creass Mart"
                    className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black border border-transparent focus:border-gray-200 focus:bg-white transition-all"
                  />
                  {errors.meta_title && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.meta_title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Meta Tags / Keywords</Label>
                  <input
                    type="text"
                    {...register("meta_tags")}
                    placeholder="Ex: electronics, smart devices, smartphones, original brand"
                    className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black border border-transparent focus:border-gray-200 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <Label>Meta Description</Label>
                  <textarea
                    {...register("meta_description")}
                    placeholder="Write a concise overview optimizing Google snippet coverage..."
                    className="w-full bg-[#F9F9F9] rounded-[8px] p-4 min-h-[110px] outline-none text-sm text-black border border-transparent focus:border-gray-200 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANELS SYSTEM CONTROLLERS */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-[8px] p-5 border border-gray-100 space-y-4">
              <h3 className="text-black font-semibold text-lg border-b border-gray-200 pb-2">
                Visibility Settings
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Visibility Status
                </label>
                <select
                  {...register("status")}
                  className="w-full bg-[#F9FAFB] border text-sm border-gray-200 px-4 py-3 rounded-[8px] outline-none text-black cursor-pointer"
                >
                  <option value="active">Published</option>
                  <option value="draft">Draft / Inactive</option>
                </select>
              </div>
              <PrimaryButton
                onClick={handleSubmit(onSubmitFormHandler)}
                icon={
                  brandMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )
                }
                label={
                  brandMutation.isPending
                    ? "Saving..."
                    : isEditMode
                      ? "Save Changes"
                      : "Add Brand"
                }
                className={`w-full justify-center bg-[#085E00] hover:bg-[#064400] text-white py-3 font-semibold ${brandMutation.isPending ? "opacity-60 pointer-events-none" : ""}`}
              />
            </div>

            <div className="bg-white rounded-[8px] p-5 border border-gray-100 space-y-4">
              <h3 className="text-black font-semibold text-lg border-b border-gray-200 pb-2">
                Brand Graphic Logo
              </h3>
              <div className="border-2 border-dashed border-gray-200 bg-[#F9F9F9] rounded-[8px] p-6 text-center relative flex flex-col items-center justify-center min-h-[180px]">
                {logoUrl ? (
                  <div className="relative group w-24 h-24 rounded-[8px] border overflow-hidden bg-white shadow-xs">
                    <Image
                      src={
                        logoUrl.startsWith("http")
                          ? logoUrl
                          : `${baseStorageUrl}${logoUrl}`
                      }
                      className="w-full h-full object-contain"
                      alt="Brand Logo"
                      width={100}
                      height={100}
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center cursor-pointer outline-none"
                  >
                    <IamgeIcon size="54" color="#A2A2A2" />
                    <p className="text-xs text-[#A2A2A2] mt-2 font-medium">
                      Click to upload logo image
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-[8px]">
                    <Loader2 className="animate-spin text-sky-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
