"use client";
import React, { useState, useRef, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle, Trash2 } from "lucide-react";
import { apiFetch } from "@/utils/api";
import {
  uploadCategoryImage,
  createCategory,
  updateCategory,
  fetchSingleCategory,
} from "@/services-api/categoryService";
import PrimaryButton from "../../../common/PrimaryButton";
import IamgeIcon from "@/components/store-front/svg/svg/IamgeIcon";
import Image from "next/image";
import toast from "react-hot-toast";

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

export default function AddCategoryMain() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If id parameter exists, form instantly shifts into Edit Mode
  const categoryId = searchParams.get("id");
  const isEditMode = !!categoryId;

  const [imageUrl, setImageUrl] = useState<string>("");
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadingBanner, setUploadingBanner] = useState<boolean>(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const baseStorageUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const methods = useForm({
    defaultValues: {
      name: "",
      slug: "",
      parent_id: "",
      description: "",
      priority: 0,
      status: "active" as "active" | "draft",
      autoSlug: true,
      meta_title: "",
      meta_tags: "",
      meta_description: "",
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

  // Fetch target entity values to pre-populate inputs if editing
  const { data: existingCategory, isLoading: loadingExisting } = useQuery({
    queryKey: ["category-single-edit", categoryId],
    queryFn: () => fetchSingleCategory(categoryId!),
    enabled: isEditMode,
  });

  // Effect hook handles applying current values smoothly into input states
  useEffect(() => {
    if (isEditMode && existingCategory) {
      reset({
        name: existingCategory.name || "",
        slug: existingCategory.slug || "",
        parent_id: existingCategory.parent_id || "",
        description: existingCategory.description || "",
        priority: existingCategory.priority || 0,
        status:
          existingCategory.status === "active" ||
          existingCategory.status === "PUBLISHED"
            ? "active"
            : "draft",
        autoSlug: false,
        meta_title: existingCategory.meta_title || "",
        meta_tags: existingCategory.meta_tags || "",
        meta_description: existingCategory.meta_description || "",
      });
      if (existingCategory.image_url) {
        setImageUrl(existingCategory.image_url);
      }
      if (existingCategory.background_image_url) {
        setBannerUrl(existingCategory.background_image_url);
      }
    }
  }, [existingCategory, isEditMode, reset]);

  const { data: treeResponse } = useQuery({
    queryKey: ["categories-parent-tree-select"],
    queryFn: async () => {
      const res = await apiFetch("/categories/tree");
      return res.json();
    },
  });

  const flatCategoriesList = (() => {
    if (!treeResponse) return [];
    if (Array.isArray(treeResponse)) return treeResponse;
    if (treeResponse.data && Array.isArray(treeResponse.data))
      return treeResponse.data;
    return [];
  })();

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const data = await uploadCategoryImage(file);
      if (data.image_url) setImageUrl(data.image_url);
      else if (data.data?.image_url) setImageUrl(data.data.image_url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Upload Failure: ${err.message}`);
      } else {
        toast.error("Upload Failure: An unknown error occurred");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleBannerFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingBanner(true);
      const data = await uploadCategoryImage(file);
      if (data.image_url) setBannerUrl(data.image_url);
      else if (data.data?.image_url) setBannerUrl(data.data.image_url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Upload Failure: ${err.message}`);
      } else {
        toast.error("Upload Failure: An unknown error occurred");
      }
    } finally {
      setUploadingBanner(false);
    }
  };

  // MUTATION WORKFLOW ROUTER: Switches targets cleanly between POST or PATCH methods
  const categoryMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      slug: string;
      parent_id?: string | null;
      image_url?: string | null;
      description?: string | null;
      background_image_url?: string | null;
      priority?: number;
      status: string;
      meta_title?: string;
      meta_tags?: string;
      meta_description?: string;
    }) => {
      if (isEditMode && categoryId) {
        return updateCategory(categoryId, payload);
      }
      return createCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-categories-list"] });
      toast.success(
        isEditMode
          ? "Category changes saved successfully!"
          : "Category created successfully!",
      );
      router.push("/admin/dashboard/category");
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        toast.error(`Execution Rejection: ${err.message}`);
      } else {
        toast.error("Execution Rejection: An unknown error occurred");
      }
    },
  });

  const onSubmitFormHandler = (data: {
    name: string;
    slug: string;
    parent_id: string;
    description: string;
    priority: number;
    status: string;
    autoSlug: boolean;
    meta_title: string;
    meta_tags: string;
    meta_description: string;
  }) => {
    if (!data.name.trim()) return;
    categoryMutation.mutate({
      name: data.name,
      slug:
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      parent_id: data.parent_id || null,
      description: data.description || "",
      priority: Number(data.priority) || 0,
      image_url: imageUrl || "",
      background_image_url: bannerUrl || null,
      status: data.status,
      meta_title: data.meta_title || "",
      meta_tags: data.meta_tags || "",
      meta_description: data.meta_description || "",
    });
  };

  if (isEditMode && loadingExisting) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-gray-400 gap-2 bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-gray-500" />
        <span className="text-xs">Loading baseline data logs...</span>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full min-h-screen font-lato pb-12 bg-[#F9FAFB]">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4 p-4 bg-white border border-gray-100 rounded-lg mt-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full cursor-pointer text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-black sm:text-2xl">
                {isEditMode ? "Edit Category" : "Add Category"}
              </h1>
              <p className="text-xs text-gray-400">
                Configure parameters mapping securely tied to server columns
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmitFormHandler)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4"
        >
          <div className="lg:col-span-8 bg-white rounded-[8px] p-5 border border-gray-100 space-y-5">
            <h3 className="text-[#003032] font-semibold text-lg border-b border-gray-200 pb-2">
              General Info
            </h3>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label required>Category Name</Label>
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
                  required: "Category name input required",
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
                placeholder="Ex: Electronics"
                className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label>Product Link Slug (URL Path)</Label>
              <input
                type="text"
                {...register("slug", { required: "Slug mapping is required" })}
                disabled={autoSlugActive}
                className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-gray-800 disabled:opacity-60"
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                {...register("description")}
                placeholder="Ex: Narrative scopes tracking profiles..."
                className="w-full bg-[#F9F9F9] rounded-[8px] p-4 min-h-[140px] outline-none text-sm text-black resize-none"
              />
            </div>

            <div>
              <Label>Meta Title</Label>
              <input
                type="text"
                {...register("meta_title")}
                placeholder="Ex: Electronics Category"
                className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black"
              />
            </div>

            <div>
              <Label>Meta Tags</Label>
              <input
                type="text"
                {...register("meta_tags")}
                placeholder="Ex: electronics, gadgets, devices"
                className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black"
              />
            </div>

            <div>
              <Label>Meta Description</Label>
              <textarea
                {...register("meta_description")}
                placeholder="Ex: Discover the latest electronics and gadgets..."
                className="w-full bg-[#F9F9F9] rounded-[8px] p-4 min-h-[100px] outline-none text-sm text-black resize-none"
              />
            </div>

            <div>
              <Label>Priority (Higher priority appears first)</Label>
              <input
                type="number"
                {...register("priority", { valueAsNumber: true })}
                placeholder="Ex: 0"
                className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-gray-800"
              />
            </div>

            {/* <div className="pt-2">
              <Label>Parent Category Node Mapping Selection</Label>
              <select
                {...register("parent_id")}
                className="w-full bg-[#F9FAFB] p-3 rounded-[8px] text-sm border border-gray-200 text-black outline-none cursor-pointer"
              >
                <option value="">None (Treat as Top Root Node)</option>
                {flatCategoriesList
                  .filter((c: { id: string }) => c.id !== categoryId)
                  .map((cat: { id: string; name: string }) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div> */}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-[8px] p-5 border border-gray-100 space-y-4">
              <h3 className="text-black font-semibold text-lg border-b border-gray-200 pb-2">
                Visibility Settings
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Category Status
                </label>
                <select
                  {...register("status")}
                  className="w-full bg-[#F9FAFB] border border-gray-200 text-sm px-4 py-3 rounded-[8px] outline-none text-black cursor-pointer"
                >
                  <option value="active">Published</option>
                  <option value="draft">Draft / Inactive</option>
                </select>
              </div>
              <PrimaryButton
                type="submit"
                disabled={categoryMutation.isPending}
                icon={
                  categoryMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )
                }
                label={
                  categoryMutation.isPending
                    ? "Saving..."
                    : isEditMode
                      ? "Save Changes"
                      : "Add Category"
                }
                className="w-full justify-center bg-[#085E00] hover:bg-[#064400] text-white py-3 font-semibold"
              />
            </div>

            <div className="bg-white rounded-[8px] p-5 border border-gray-100 space-y-4">
              <h3 className="text-black font-semibold text-lg border-b pb-2 border-gray-200">
                Category Icon Media
              </h3>
              <div className="border-2 border-dashed border-gray-200 bg-[#F9F9F9] rounded-[8px] p-6 text-center relative flex flex-col items-center justify-center min-h-[180px]">
                {imageUrl ? (
                  <div className="relative group w-24 h-24 rounded-[8px] border overflow-hidden bg-white shadow-xs">
                    <Image
                      src={
                        imageUrl.startsWith("http")
                          ? imageUrl
                          : `${baseStorageUrl}${imageUrl}`
                      }
                      className="w-full h-full object-cover"
                      alt="category image"
                      width={100}
                      height={100}
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-xs"
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
                      Click to select asset photo
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
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <Loader2 className="animate-spin text-sky-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[8px] p-5 border border-gray-100 space-y-4">
              <h3 className="text-black font-semibold text-lg border-b pb-2 border-gray-200">
                Category Banner Media
              </h3>
              <div className="border-2 border-dashed border-gray-200 bg-[#F9F9F9] rounded-[8px] p-6 text-center relative flex flex-col items-center justify-center min-h-[180px]">
                {bannerUrl ? (
                  <div className="relative group w-full h-32 rounded-[8px] border overflow-hidden bg-white shadow-xs">
                    <Image
                      src={
                        bannerUrl.startsWith("http")
                          ? bannerUrl
                          : `${baseStorageUrl}${bannerUrl}`
                      }
                      className="w-full h-full object-cover"
                      alt="banner image"
                      width={400}
                      height={128}
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => setBannerUrl("")}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-xs"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center cursor-pointer outline-none"
                  >
                    <IamgeIcon size="54" color="#A2A2A2" />
                    <p className="text-xs text-[#A2A2A2] mt-2 font-medium">
                      Click to select banner photo
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={bannerFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                  disabled={uploadingBanner}
                />
                {uploadingBanner && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
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
