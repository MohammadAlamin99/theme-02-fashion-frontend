"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { SectionWrapper } from "@/components/admin/products/add/SectionWrapper";
import {
  Plus,
  Barcode,
  CheckCircle2,
  Circle,
  Loader2,
  Save,
} from "lucide-react";
import {
  createProduct,
  updateProduct,
  fetchSingleProduct,
} from "@/services-api/productService";

import EditFileIcon from "@/components/store-front/svg/svg/EditFileIcon";
import PrimaryButton from "../../common/PrimaryButton";
import { Label } from "./Label";
import InventorySection from "./AddInventory";
import VariantsSection from "./VariantsSection";
import BrandSection from "./BrandSection";
import GeneralInfoSection from "./GeneralInfoSection";
import { Input } from "./Input";
import ShippingSection from "./ShippingSection";
import SpecificationsSection from "./SpecificationsSection";
import FaqsSection from "./FaqsSection";
import VideoUrlsSection from "./VideoUrlsSection";
import SeoSection from "./SeoSection";
import SidebarCatalogSection from "./SidebarCatalogSection";
import SidebarSupplierSection from "./SidebarSupplierSection";
import SidebarBrandSection from "./SidebarBrandSection";
import SidebarTagSection from "./SidebarTagSection";
import toast from "react-hot-toast";

type VariantAttribute = {
  label: string;
  value: string;
  type: "text" | "color";
  hex?: string;
};
export type VariantRow = {
  variantId?: string;
  attributes: VariantAttribute[];
  stock: number;
  sku: string;
  price: number;
  images: string[];
};

export default function ProductUploadMain() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [images, setImages] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const productId = searchParams.get("id");
  const isEditMode = !!productId;

  const methods = useForm({
    defaultValues: {
      name: "",
      slug: "",
      category_id: "",
      brand_id: "",
      unit_id: "",
      modelName: "",
      short_description: "",
      description: "",
      regular_price: "",
      sell_price: "",
      cost_price: "",
      quantity: "50",
      unit_name: "Pcs",
      warranty: "",
      sku: "",
      barcode: "",
      priority: "100",
      is_variant_mandatory: false,
      autoSlug: true,
      status: "DRAFT",
      condition: "NEW",
      seoKeywords: "",
      seoDescription: "",
      seoTitle: "",
      tag_ids: [] as string[],
      supplier_ids: [] as string[],
      video_urls: [] as string[],
      specifications: [] as { type: string; desc: string }[],
      faqs: [] as { q: string; a: string }[],
      shippingMode: "DEFAULT" as "DEFAULT" | "CUSTOM" | "FREE",
      customShippingRows: [] as { zone: string; charge: string }[],
      variants: [] as VariantRow[],
    },
  });

  const watchedValues = methods.watch();

  const { data: existingProduct, isLoading: loadingExistingProduct } = useQuery(
    {
      queryKey: ["product-single-edit-node", productId],
      queryFn: () => fetchSingleProduct(productId!),
      enabled: isEditMode,
    },
  );

  // Handles any shape backend might send: ["id1","id2"], [{id:"id1"}], [{tag_id:"id1"}], [{tag:{id:"id1"}}]
  function extractIds(source: string): string[] {
    if (!Array.isArray(source)) return [];
    return source
      .map((item) => {
        let id = null;
        if (typeof item === "string" || typeof item === "number") id = item;
        else if (item?.id) id = item.id;
        else if (item?.tag_id) id = item.tag_id;
        else if (item?.tag?.id) id = item.tag.id;

        return id ? String(id) : null;
      })
      .filter(Boolean) as string[];
  }
  useEffect(() => {
    if (isEditMode && existingProduct) {
      const formattedTags = extractIds(
        existingProduct.tag_ids ??
          existingProduct.product_tags ??
          existingProduct.tags,
      );
      methods.reset({
        name: existingProduct.name || "",
        slug: existingProduct.slug || "",
        category_id:
          existingProduct.category_id || existingProduct.category?.id || "",
        brand_id: existingProduct.brand_id || existingProduct.brand?.id || "",
        unit_id: existingProduct.unit_id || existingProduct.unit?.id || "",
        modelName: existingProduct.modelName || "",
        short_description: existingProduct.short_description || "",
        description: existingProduct.description || "",
        regular_price: String(existingProduct.regular_price ?? 0),
        sell_price: String(existingProduct.sell_price ?? 0),
        cost_price: String(existingProduct.cost_price ?? 0),
        quantity: String(existingProduct.quantity ?? 0),
        unit_name: existingProduct.unit_name || "Pcs",
        warranty: existingProduct.warranty || "",
        sku: existingProduct.sku || "",
        barcode: existingProduct.barcode || "",
        priority: String(existingProduct.priority ?? 100),
        is_variant_mandatory: !!existingProduct.is_variant_mandatory,
        autoSlug: false,
        status: existingProduct.status || "DRAFT",
        condition: existingProduct.condition || "NEW",
        seoTitle: existingProduct.meta_title || "",
        seoDescription: existingProduct.meta_description || "",
        seoKeywords: existingProduct.meta_tags || "",
        tag_ids: extractIds(
          existingProduct.tag_ids ??
            existingProduct.product_tags ??
            existingProduct.tags,
        ),
        supplier_ids: Array.isArray(existingProduct.supplier_ids)
          ? existingProduct.supplier_ids
          : Array.isArray(existingProduct.suppliers)
            ? existingProduct.suppliers.map((s: { id: string }) => s.id)
            : [],
        video_urls: Array.isArray(existingProduct.video_urls)
          ? existingProduct.video_urls
          : [],
        specifications: Array.isArray(existingProduct.specifications)
          ? existingProduct.specifications
          : [],
        faqs: Array.isArray(existingProduct.faqs) ? existingProduct.faqs : [],
        shippingMode:
          existingProduct.shipping_type === "FREE"
            ? "FREE"
            : existingProduct.shipping_type === "CUSTOM"
              ? "CUSTOM"
              : "DEFAULT",
        customShippingRows: Array.isArray(existingProduct.shipping_config)
          ? existingProduct.shipping_config.map(
              (row: { zone: string; charge: string }) => ({
                zone: row.zone || "",
                charge: String(row.charge ?? 0),
              }),
            )
          : [],
        // 🚀 FIXED: map backend's attributes[] array instead of the old flat `attribute` string
        variants: Array.isArray(existingProduct.variants)
          ? existingProduct.variants.map(
              (v: {
                id: string;
                attributes: string[];
                stock: number;
                sku: string;
                price: number;
                images: string[];
              }) => ({
                variantId: v.id,
                attributes: Array.isArray(v.attributes) ? v.attributes : [],
                stock: v.stock ?? 0,
                sku: v.sku || "",
                price: v.price ?? 0,
                images: Array.isArray(v.images) ? v.images : [],
              }),
            )
          : [],
      });
      if (Array.isArray(existingProduct.images)) {
        setImages(existingProduct.images);
      }
    }
  }, [existingProduct, isEditMode, methods]);

  // product create and update mutation
  const productMutation = useMutation({
    mutationFn: async (targetStatus: "DRAFT" | "PUBLISHED") => {
      const formPayload = methods.getValues();
      const cleanSlug =
        formPayload.slug ||
        formPayload.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      const finalPayload: { [key: string]: unknown } = {
        name: formPayload.name,
        slug: cleanSlug,
        category_id: formPayload.category_id || null,
        brand_id: formPayload.brand_id || null,
        unit_id: formPayload.unit_id || null,
        short_description: formPayload.short_description || null,
        description: formPayload.description,
        status: isEditMode ? formPayload.status : targetStatus,
        images: Array.isArray(images) ? images.map((img) => String(img)) : [],
        priority: Number(formPayload.priority) || 100,
        regular_price: Number(formPayload.regular_price) || 0,
        sell_price: Number(formPayload.sell_price) || 0,
        cost_price: Number(formPayload.cost_price) || 0,
        quantity: Number(formPayload.quantity ?? 0),
        warranty: formPayload.warranty || null,
        sku: formPayload.sku || null,
        barcode: formPayload.barcode || null,
        is_variant_mandatory: formPayload.is_variant_mandatory,
        meta_title: formPayload.seoTitle || null,
        meta_description: formPayload.seoDescription || null,
        meta_tags: formPayload.seoKeywords || null,
        video_urls: Array.isArray(formPayload.video_urls)
          ? formPayload.video_urls.filter(Boolean)
          : [],
        specifications: Array.isArray(formPayload.specifications)
          ? formPayload.specifications
          : [],
        faqs: Array.isArray(formPayload.faqs) ? formPayload.faqs : [],

        shipping_type: formPayload.shippingMode,
        ...(formPayload.shippingMode === "CUSTOM"
          ? {
              shipping_config: (formPayload.customShippingRows || [])
                .filter((r: { zone: string; charge: string }) => r.zone?.trim())
                .map((r: { zone: string; charge: string }) => ({
                  zone: r.zone.trim(),
                  charge: Number(r.charge) || 0,
                })),
            }
          : formPayload.shippingMode === "FREE"
            ? { shipping_config: [] }
            : {}),
      };

      // Include tags and suppliers in payload for both Create and Edit mode
      finalPayload.tag_ids = formPayload.tag_ids || [];
      finalPayload.supplier_ids = formPayload.supplier_ids || [];

      // Include variants in payload for both create and edit mode
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalPayload.variants = formPayload.variants.map((v: any) => ({
        ...(v.variantId || v.id ? { id: v.variantId || v.id } : {}),
        attributes: Array.isArray(v.attributes) ? v.attributes : [],
        stock: Number(v.stock) || 0,
        sku: v.sku || `SKU-${Date.now()}`,
        price: Number(v.price) || 0,
        images: Array.isArray(v.images)
          ? v.images.map((img: string) => String(img))
          : [],
      }));

      if (isEditMode && productId) {
        return updateProduct(productId, finalPayload);
      }
      return createProduct(finalPayload);
    },
    onSuccess: () => {
      // Wipe out the main products lists query cache
      queryClient.invalidateQueries({
        queryKey: ["products-list-panel"],
        exact: false,
      });

      //  Clear out this exact single product item cache row too so it refetches cleanly next time
      if (isEditMode && productId) {
        queryClient.invalidateQueries({
          queryKey: ["product-single-edit-node", productId],
          exact: true,
        });
        queryClient.removeQueries({
          queryKey: ["product-single-edit-node", productId],
        });
      }

      toast.success(
        isEditMode
          ? "Product updated successfully!"
          : "Product created successfully!",
      );

      methods.reset();
      setImages([]);
      router.push("/admin/dashboard/products");
      router.refresh();
    },
    onError: (err) => {
      toast.error(`Rejection Error: ${err.message}`);
    },
  });

  const completeness =
    (watchedValues.name ? 25 : 0) +
    (watchedValues.category_id ? 25 : 0) +
    (watchedValues.sell_price ? 25 : 0) +
    (images.length > 0 ? 25 : 0);

  if (isEditMode && loadingExistingProduct) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-gray-400 gap-2 bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-gray-500" />
        <span className="text-xs">
          Synchronizing target product row data from servers...
        </span>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full min-h-screen font-lato pb-12"
      >
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-4 p-4 bg-white border-b border-gray-100 rounded-[8px]">
          <div>
            <h1 className="text-xl font-bold text-black sm:text-2xl">
              {isEditMode ? "Edit Product Workspace" : "Product Upload"}
            </h1>
            <p className="text-xs text-gray-400">
              Integrated server state transactional panel console
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
            {isEditMode && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  Status:
                </span>
                <select
                  {...methods.register("status")}
                  className="px-3 py-3 border border-gray-200 rounded-lg outline-none bg-white text-sm cursor-pointer min-w-[120px]"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            )}
            {!isEditMode && (
              <button
                type="button"
                disabled={productMutation.isPending}
                onClick={() => productMutation.mutate("DRAFT")}
                className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white text-[#070606] font-semibold text-sm justify-center border border-gray-200 cursor-pointer disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                {productMutation.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <EditFileIcon />
                )}{" "}
                Save Draft
              </button>
            )}
            <PrimaryButton
              onClick={() => {
                if (!productMutation.isPending)
                  productMutation.mutate("PUBLISHED");
              }}
              icon={
                productMutation.isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : isEditMode ? (
                  <Save size={16} />
                ) : (
                  <Plus
                    size={24}
                    className="border-2 border-white rounded-full p-0.5"
                  />
                )
              }
              label={
                productMutation.isPending
                  ? "Saving..."
                  : isEditMode
                    ? "Save Product Changes"
                    : "Add Product"
              }
              className={`w-full sm:w-auto justify-center bg-[#085E00] hover:bg-[#064400] ${productMutation.isPending ? "opacity-60 pointer-events-none" : ""}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <GeneralInfoSection
              images={images}
              setImages={setImages}
              uploading={uploadingMedia}
              setUploading={setUploadingMedia}
            />

            <SectionWrapper title="Pricing">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label required>Sell Price (৳)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...methods.register("sell_price", { required: true })}
                  />
                </div>
                <div>
                  <Label required>Regular Price (৳)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...methods.register("regular_price", { required: true })}
                  />
                </div>
                <div>
                  <Label>Cost Price (Optional) (৳)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...methods.register("cost_price")}
                  />
                </div>
              </div>
            </SectionWrapper>

            <InventorySection Barcode={Barcode} />
            <VariantsSection isEditMode={isEditMode} />
            <BrandSection />
            <ShippingSection isEditMode={isEditMode} />
            <SpecificationsSection />
            <FaqsSection />
            <VideoUrlsSection />
            <SeoSection />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-lg p-5 border border-gray-100">
              <h3 className="text-black font-medium text-[20px] mb-2">
                Ready To Publish
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden mr-3">
                  <div
                    className="h-full bg-[#085E00] transition-all duration-200"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-gray-500">
                  {completeness}%
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-sm">
                  {watchedValues.name ? (
                    <CheckCircle2 size={16} className="text-[#085E00]" />
                  ) : (
                    <Circle size={16} className="text-gray-200" />
                  )}
                  <span>Item Identification parameters mapped</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  {images.length > 0 ? (
                    <CheckCircle2 size={16} className="text-[#085E00]" />
                  ) : (
                    <Circle size={16} className="text-gray-200" />
                  )}
                  <span>Media assets loaded to storage</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  {watchedValues.category_id ? (
                    <CheckCircle2 size={16} className="text-[#085E00]" />
                  ) : (
                    <Circle size={16} className="text-gray-200" />
                  )}
                  <span>Target catalog category bound</span>
                </div>
              </div>
            </div>

            <SidebarCatalogSection />
            <SidebarBrandSection />
            <SidebarSupplierSection isEditMode={isEditMode} />
            <SidebarTagSection isEditMode={isEditMode} />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
