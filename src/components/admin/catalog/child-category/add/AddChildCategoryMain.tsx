"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle, ChevronDown } from "lucide-react";
import { fetchSingleCategory } from "@/services-api/categoryService";
import {
  fetchSubCategoriesOnly,
  createChildCategory,
  updateChildCategory,
} from "@/services-api/childcategoryService";
import PrimaryButton from "../../../common/PrimaryButton";
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

export default function AddChildCategoryMain() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const childCategoryId = searchParams.get("id");
  const isEditMode = !!childCategoryId;

  const methods = useForm({
    defaultValues: {
      name: "",
      slug: "",
      parent_id: "",
      description: "",
      status: "active" as "active" | "draft",
      autoSlug: true,
      priority: 0,
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

  // QUERY: Pull single category baseline records if editing
  const { data: existingChildCategory, isLoading: loadingExisting } = useQuery({
    queryKey: ["childcategory-single-edit", childCategoryId],
    queryFn: () => fetchSingleCategory(childCategoryId!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && existingChildCategory) {
      reset({
        name: existingChildCategory.name || "",
        slug: existingChildCategory.slug || "",
        parent_id: existingChildCategory.parent_id || "",
        description: existingChildCategory.description || "",
        status:
          existingChildCategory.status === "active" ||
          existingChildCategory.status === "PUBLISHED"
            ? "active"
            : "draft",
        autoSlug: false,
        priority: existingChildCategory.priority || 0,
        meta_title: existingChildCategory.meta_title || "",
        meta_tags: existingChildCategory.meta_tags || "",
        meta_description: existingChildCategory.meta_description || "",
      });
    }
  }, [existingChildCategory, isEditMode, reset]);

  // QUERY: Fetch only genuine level-2 subcategories to display as target selections
  const { data: subCategoriesList } = useQuery({
    queryKey: ["sub-categories-strict-level2-nodes"],
    queryFn: fetchSubCategoriesOnly,
  });

  // Points strictly to updateChildCategory to lock parent relationship constraints
  const childCategoryMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      slug: string;
      description: string | "";
      parent_id: string;
      status: "active" | "draft";
      priority: number;
      meta_title: string;
      meta_tags: string;
      meta_description: string;
    }) => {
      if (isEditMode && childCategoryId) {
        return updateChildCategory(childCategoryId, payload);
      }
      return createChildCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["catalog-childcategories-list"],
      });
      toast.success(
        isEditMode
          ? "Child Category updates saved successfully!"
          : "Child Category created successfully!",
      );
      router.push("/admin/dashboard/child-category");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmitFormHandler = (data: {
    name: string;
    slug: string;
    parent_id: string;
    description: string;
    status: "active" | "draft";
    autoSlug: boolean;
    priority: number;
    meta_title: string;
    meta_tags: string;
    meta_description: string;
  }) => {
    if (!data.name.trim()) return;
    if (!data.parent_id || data.parent_id === "") {
      toast.error(
        "Please designate a parent sub-category mapping for this child node.",
      );
      return;
    }

    childCategoryMutation.mutate({
      name: data.name,
      slug:
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      parent_id: data.parent_id,
      description: data.description || "",
      status: data.status,
      priority: Number(data.priority) || 0,
      meta_title: data.meta_title || "",
      meta_tags: data.meta_tags || "",
      meta_description: data.meta_description || "",
    });
  };

  if (isEditMode && loadingExisting) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-gray-400 gap-2 bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-gray-500" />
        <span className="text-xs">
          Synchronizing active dataset state nodes...
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
              onClick={() => router.push("/admin/dashboard/child-category")}
              className="p-2 hover:bg-gray-100 rounded-full cursor-pointer text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-black sm:text-2xl">
                {isEditMode ? "Edit Child Category" : "Add Child Category"}
              </h1>
              <p className="text-xs text-gray-400">
                Deploy deep third-tier taxonomy leaf nodes mapped inside catalog
                rules
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!childCategoryMutation.isPending)
              handleSubmit(onSubmitFormHandler)();
          }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-8 bg-white rounded-[8px] p-5 border border-gray-100 space-y-5">
            <h3 className="text-[#003032] font-semibold text-lg border-b pb-2 border-gray-200">
              General Info
            </h3>

            {/* Parent Sub-Category Dropdown */}
            <div>
              <Label required>Parent Sub Category Relation</Label>
              <div className="relative w-full">
                <select
                  {...register("parent_id", {
                    required: "Parent sub-category mapping target required",
                  })}
                  className="w-full bg-[#F9F9F9] border-gray-200 rounded-[8px] p-3 text-sm text-black outline-none border  focus:border-gray-200 cursor-pointer appearance-none"
                >
                  <option value="">
                    Select Parent Sub Category Mapping Node*
                  </option>
                  {Array.isArray(subCategoriesList) &&
                    subCategoriesList
                      .filter(
                        (cat: { id: string }) => cat.id !== childCategoryId,
                      )
                      .map((cat: { id: string; name: string }) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              {errors.parent_id && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.parent_id.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label required>Child Category Name</Label>
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
                  required: "Child category tracking name required",
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
                placeholder="Ex: Water Bottles, Action Figures"
                className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black"
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
                  required: "Tracking URL slug parameter is mandatory",
                })}
                disabled={autoSlugActive}
                className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-gray-800 disabled:opacity-60"
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                {...register("description")}
                placeholder="Write specific child scope metadata profile specifications tracking text..."
                className="w-full bg-[#F9F9F9] rounded-[8px] p-4 min-h-[140px] outline-none text-sm text-black resize-none"
              />
            </div>

            <div>
              <Label>Meta Title</Label>
              <input
                type="text"
                {...register("meta_title")}
                placeholder="Ex: Kids Toy Category"
                className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black"
              />
            </div>

            <div>
              <Label>Meta Tags</Label>
              <input
                type="text"
                {...register("meta_tags")}
                placeholder="Ex: toys, kids, games"
                className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-black"
              />
            </div>

            <div>
              <Label>Meta Description</Label>
              <textarea
                {...register("meta_description")}
                placeholder="Ex: Find the best toys and games..."
                className="w-full bg-[#F9F9F9] rounded-[8px] p-4 min-h-[100px] outline-none text-sm text-black resize-none"
              />
            </div>

            <div>
              <Label>Priority (Higher priority appears first)</Label>
              <input
                type="number"
                {...register("priority", { valueAsNumber: true })}
                placeholder="Ex: 1"
                className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-gray-800"
              />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-[8px] p-5 border border-gray-100 space-y-4">
              <h3 className="text-black font-semibold text-lg border-b border-gray-200 pb-2">
                Visibility Settings
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Status Visibility
                </label>
                <select
                  {...register("status")}
                  className="w-full bg-[#F9FAFB] border text-sm border-gray-200 px-4 py-3 rounded-[8px] outline-none text-black cursor-pointer"
                >
                  <option value="active">Published</option>
                  <option value="draft">Draft / Inactive</option>
                </select>
              </div>
              {/* 🚀 FIXED: HTML attributes button pass handled safely inside standard click handlers */}
              <PrimaryButton
                onClick={handleSubmit(onSubmitFormHandler)}
                icon={
                  childCategoryMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )
                }
                label={
                  childCategoryMutation.isPending
                    ? "Saving..."
                    : isEditMode
                      ? "Save Changes"
                      : "Add Child Category"
                }
                className={`w-full justify-center bg-[#085E00] hover:bg-[#064400] text-white py-3 font-semibold ${childCategoryMutation.isPending ? "opacity-60 pointer-events-none" : ""}`}
              />
            </div>

          </div>
        </form>
      </div>
    </FormProvider>
  );
}
