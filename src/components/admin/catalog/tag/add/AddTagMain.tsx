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
  uploadTagMedia,
  createTag,
  updateTag,
  fetchSingleTag,
} from "@/services-api/tagService";
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

export default function AddTagMain() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const tagId = searchParams.get("id");
  const isEditMode = !!tagId;

  const [imageUrl, setImageUrl] = useState<string>("");
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [uploadingType, setUploadingType] = useState<"image" | "banner" | null>(
    null,
  );
  const [isSeoExpanded, setIsSeoExpanded] = useState<boolean>(false);

  const baseStorageUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const methods = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      priority: "100",
      display_order: "0",
      status: "active" as "active" | "draft",
      is_flash_sale: false,
      start_date: "",
      end_date: "",
      show_on_home: false,
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
  const isFlashSaleActive = watch("is_flash_sale");

  const { data: existingTag, isLoading: loadingExisting } = useQuery({
    queryKey: ["tag-single-edit", tagId],
    queryFn: () => fetchSingleTag(tagId!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && existingTag) {
      const formatDate = (isoStr: string) =>
        isoStr ? isoStr.split("T")[0] : "";

      reset({
        name: existingTag.name || "",
        slug: existingTag.slug || "",
        description: existingTag.description || "",
        priority: String(existingTag.priority ?? 100),
        display_order: String(existingTag.display_order ?? 0),
        status:
          existingTag.status === "active" || existingTag.status === "PUBLISHED"
            ? "active"
            : "draft",
        is_flash_sale: !!existingTag.is_flash_sale,
        start_date: formatDate(existingTag.start_date),
        end_date: formatDate(existingTag.end_date),
        show_on_home: !!existingTag.show_on_home,
        meta_title: existingTag.meta_title || "",
        meta_tags: existingTag.meta_tags || "",
        meta_description: existingTag.meta_description || "",
        autoSlug: false,
      });
      if (existingTag.image_url) setImageUrl(existingTag.image_url);
      if (existingTag.banner_url) setBannerUrl(existingTag.banner_url);
    }
  }, [existingTag, isEditMode, reset]);

  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "image" | "banner",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingType(target);
      const uploadedPath = await uploadTagMedia(file);
      if (target === "image") setImageUrl(uploadedPath);
      else setBannerUrl(uploadedPath);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Upload Failure: ${err.message}`);
      } else {
        toast.error("Upload Failure: An unknown error occurred");
      }
    } finally {
      setUploadingType(null);
    }
  };

  const tagMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      slug: string;
      description: string | null;
      priority: number;
      display_order: number;
      status: string;
      is_flash_sale: boolean;
      show_on_home: boolean;
      meta_title: string | null;
      meta_tags: string | null;
      meta_description: string | null;
      image_url: string | null;
      banner_url: string | null;
      start_date: string | null;
      end_date: string | null;
    }) => {
      if (isEditMode && tagId) return updateTag(tagId, payload);
      return createTag(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-tags-list"] });
      toast.success(
        isEditMode
          ? "Tag modifications successfully saved!"
          : "Tag created successfully!",
      );
      router.push("/admin/dashboard/tag");
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        toast.error(`Validation Failure: ${err.message}`);
      } else {
        toast.error("Validation Failure: An unknown error occurred");
      }
    },
  });

  const onSubmitFormHandler = (data: {
    name: string;
    slug: string;
    description: string;
    priority: string;
    display_order: string;
    status: "active" | "draft";
    is_flash_sale: boolean;
    show_on_home: boolean;
    start_date: string;
    end_date: string;
    autoSlug: boolean;
    meta_title: string;
    meta_tags: string;
    meta_description: string;
  }) => {
    if (!data.name.trim()) return;

    tagMutation.mutate({
      name: data.name,
      slug:
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      description: data.description || null,
      priority: Number(data.priority) || 100,
      display_order: Number(data.display_order) || 0,
      status: data.status,
      is_flash_sale: !!data.is_flash_sale,
      start_date:
        data.is_flash_sale && data.start_date
          ? new Date(data.start_date).toISOString()
          : null,
      end_date:
        data.is_flash_sale && data.end_date
          ? new Date(data.end_date).toISOString()
          : null,
      show_on_home: !!data.show_on_home,
      image_url: imageUrl || null,
      banner_url: bannerUrl || null,
      meta_title: data.meta_title || null,
      meta_tags: data.meta_tags || null,
      meta_description: data.meta_description || null,
    });
  };

  if (isEditMode && loadingExisting) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-gray-400 gap-2 bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-gray-500" />
        <span className="text-xs">Loading baseline tag profiles...</span>
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
              onClick={() => router.push("/admin/dashboard/tag")}
              className="p-2 hover:bg-gray-100 rounded-full cursor-pointer text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-black sm:text-2xl">
                {isEditMode ? "Edit Tag" : "Add Tag"}
              </h1>
              <p className="text-xs text-gray-400">
                Manage catalog keywords, promotional campaigns, and flash sale
                indexes
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!tagMutation.isPending) handleSubmit(onSubmitFormHandler)();
          }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-8 space-y-4">
            {/* General Information */}
            <div className="bg-white rounded-[8px] p-5 border border-gray-100 space-y-5">
              <h3 className="text-[#003032] font-semibold text-lg border-b border-gray-200 pb-2">
                General Info
              </h3>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label required>Tag Title Name</Label>
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
                    required: "Tag name text index context required",
                    onChange: (e) => {
                      if (autoSlugActive)
                        setValue(
                          "slug",
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, ""),
                        );
                    },
                  })}
                  placeholder="Ex: Black Friday, Summer Deal"
                  className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black border border-transparent focus:border-gray-200"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Link Slug Pathway</Label>
                <input
                  type="text"
                  {...register("slug", {
                    required: "Slug unique token required",
                  })}
                  disabled={autoSlugActive}
                  className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-gray-800 disabled:opacity-60"
                />
              </div>

              <div>
                <Label>Tag Description Summary</Label>
                <textarea
                  {...register("description")}
                  placeholder="Describe the campaign coverage..."
                  className="w-full bg-[#F9F9F9] rounded-[8px] p-4 min-h-[100px] outline-none text-sm text-black resize-none"
                />
              </div>
            </div>

            {/* 🚀 FLASH SALE CAMPAIGN CHANNELS MAPPING */}
            <div className="bg-white rounded-[8px] p-5 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="text-[#003032] font-semibold text-lg">
                  Flash Sale Configuration
                </h3>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => setValue("is_flash_sale", !isFlashSaleActive)}
                >
                  <span className="text-xs font-medium text-gray-500">
                    Enable Promotional Window
                  </span>
                  <input
                    type="checkbox"
                    checked={isFlashSaleActive}
                    readOnly
                    className="w-4 h-4 accent-[#085E00]"
                  />
                </div>
              </div>

              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all ${isFlashSaleActive ? "block" : "hidden opacity-50 pointer-events-none"}`}
              >
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Campaign Start Date
                  </label>
                  <input
                    type="date"
                    {...register("start_date", { required: isFlashSaleActive })}
                    className="w-full bg-[#F9F9F9] rounded-[8px] p-3 text-sm text-black outline-none border focus:border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Campaign End Date
                  </label>
                  <input
                    type="date"
                    {...register("end_date", { required: isFlashSaleActive })}
                    className="w-full bg-[#F9F9F9] rounded-[8px] p-3 text-sm text-black outline-none border focus:border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* SEO Metadata Config */}
            <div className="bg-white rounded-[8px] p-5 border border-gray-100">
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
                    {...register("meta_title", { maxLength: 255 })}
                    placeholder="Meta title snippet line..."
                    className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black border"
                  />
                </div>
                <div>
                  <Label>Meta Keywords</Label>
                  <input
                    type="text"
                    {...register("meta_tags")}
                    placeholder="Keywords list separation via commas..."
                    className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black border"
                  />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <textarea
                    {...register("meta_description")}
                    placeholder="Conclude structural descriptive overview summaries..."
                    className="w-full bg-[#F9F9F9] rounded-[8px] p-4 min-h-[90px] outline-none text-sm text-black border resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANELS CONTROL MATRIX */}
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

              <div className="flex items-center justify-between bg-[#F9FAFB] p-3 rounded-[8px] border border-gray-200">
                <span className="text-xs font-medium text-gray-700">
                  Show On Homepage
                </span>
                <input
                  type="checkbox"
                  {...register("show_on_home")}
                  className="w-4 h-4 accent-[#085E00] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Display Order Sort Index
                </label>
                <input
                  type="number"
                  {...register("display_order")}
                  className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-2.5 text-sm outline-none text-black border border-gray-200"
                />
              </div>

              <div>
                <Label>Priority Value</Label>
                <input
                  type="number"
                  {...register("priority")}
                  className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-2.5 text-sm outline-none text-black border border-gray-200"
                />
              </div>

              <PrimaryButton
                onClick={handleSubmit(onSubmitFormHandler)}
                icon={
                  tagMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )
                }
                label={
                  tagMutation.isPending
                    ? "Saving..."
                    : isEditMode
                      ? "Save Changes"
                      : "Add Tag"
                }
                className={`w-full justify-center bg-[#085E00] hover:bg-[#064400] text-white py-3 font-semibold ${tagMutation.isPending ? "opacity-60 pointer-events-none" : ""}`}
              />
            </div>

            {/* 🚀 MULTI MEDIA MEDIA UPLOAD COMPARTMENTS */}
            <div className="bg-white rounded-[8px] p-5 border border-gray-100 space-y-4">
              <h3 className="text-black font-semibold text-lg border-b pb-2 border-gray-200">
                Media Campaign Files
              </h3>

              {/* Image Icon Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Tag Listing Square Icon
                </label>
                <div className="border-2 border-dashed border-gray-200 bg-[#F9F9F9] rounded-[8px] p-4 text-center relative flex flex-col items-center justify-center min-h-[130px]">
                  {imageUrl ? (
                    <div className="relative group w-20 h-20 rounded-[8px] border overflow-hidden bg-white">
                      <Image
                        src={
                          imageUrl.startsWith("http")
                            ? imageUrl
                            : `${baseStorageUrl}${imageUrl}`
                        }
                        className="w-full h-full object-cover"
                        width={100}
                        height={100}
                        alt="tag image"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => iconInputRef.current?.click()}
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <IamgeIcon size="36" color="#A2A2A2" />
                      <p className="text-[11px] text-[#A2A2A2] mt-1 font-medium">
                        Upload Icon square
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={iconInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleMediaUpload(e, "image")}
                    disabled={!!uploadingType}
                  />
                  {uploadingType === "image" && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-[8px]">
                      <Loader2 className="animate-spin text-sky-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Horizontal Promotional Banner Asset Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Tag Campaign Horizontal Banner
                </label>
                <div className="border-2 border-dashed border-gray-200 bg-[#F9F9F9] rounded-[8px] p-4 text-center relative flex flex-col items-center justify-center min-h-[130px]">
                  {bannerUrl ? (
                    <div className="relative group w-full h-20 rounded-[8px] border overflow-hidden bg-white">
                      <img
                        src={
                          bannerUrl.startsWith("http")
                            ? bannerUrl
                            : `${baseStorageUrl}${bannerUrl}`
                        }
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <button
                        type="button"
                        onClick={() => setBannerUrl("")}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => bannerInputRef.current?.click()}
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <IamgeIcon size="36" color="#A2A2A2" />
                      <p className="text-[11px] text-[#A2A2A2] mt-1 font-medium">
                        Upload Campaign Banner (Landscape)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={bannerInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleMediaUpload(e, "banner")}
                    disabled={!!uploadingType}
                  />
                  {uploadingType === "banner" && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-[8px]">
                      <Loader2 className="animate-spin text-sky-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
