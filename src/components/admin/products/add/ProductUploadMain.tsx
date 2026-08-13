// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import {
//   useForm,
//   FormProvider,
//   useFormContext,
//   useFieldArray,
//   Controller,
// } from "react-hook-form";
// import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Plus,
//   Barcode,
//   ChevronDown,
//   CheckCircle2,
//   Circle,
//   Trash2,
//   Loader2,
//   ChevronUp,
//   Save,
//   X,
//   Pencil,
// } from "lucide-react";
// import { apiFetch } from "@/utils/api";
// import {
//   uploadProductMedia,
//   uploadVariantImage,
//   createProduct,
//   updateProduct,
//   fetchSingleProduct,
//   updateVariant,
// } from "@/services-api/productService";

// import EditFileIcon from "@/components/store-front/svg/svg/EditFileIcon";
// import IamgeIcon from "@/components/store-front/svg/svg/IamgeIcon";
// import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
// import PrimaryButton from "../../common/PrimaryButton";
// import RichTextEditor from "./Richtexteditor";
// import Image from "next/image";
// import toast from "react-hot-toast";

// // ── SHARED BASE ATOMIC DESIGN MOLECULES ──
// export const Label = ({
//   children,
//   required,
//   subLabel,
// }: {
//   children: React.ReactNode;
//   required?: boolean;
//   subLabel?: string;
// }) => (
//   <div className="flex justify-between items-center mb-1.5">
//     <label className="text-base font-normal text-black select-none">
//       {children} {required && <span className="text-[#E30000]">*</span>}
//     </label>
//     {subLabel && (
//       <span className="text-[10px] text-gray-400 font-medium">{subLabel}</span>
//     )}
//   </div>
// );

// export const Input = ({
//   placeholder,
//   icon: Icon,
//   type = "text",
//   name,
//   options = {},
// }: {
//   placeholder?: string;
//   icon?: React.ElementType;
//   type?: string;
//   name: string;
//   options?: any;
// }) => {
//   const { register } = useFormContext();
//   return (
//     <div className="relative w-full">
//       <input
//         type={type}
//         placeholder={placeholder}
//         {...register(name, options)}
//         className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none placeholder:text-[#A2A2A2] text-gray-800 border border-transparent focus:border-gray-200 focus:bg-white transition-all"
//       />
//       {Icon && (
//         <Icon
//           size={18}
//           className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//         />
//       )}
//     </div>
//   );
// };

// export const Toggle = ({ name }: { name: string }) => {
//   const { watch, setValue } = useFormContext();
//   const checked = watch(name);
//   return (
//     <div
//       className="flex items-center gap-2 select-none cursor-pointer"
//       onClick={() => setValue(name, !checked)}
//     >
//       <div
//         className={`w-10 h-5 rounded-full relative transition-colors ${checked ? "bg-[#1DA1F2]" : "bg-gray-200"}`}
//       >
//         <div
//           className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-xs ${checked ? "left-5" : "left-0.5"}`}
//         />
//       </div>
//     </div>
//   );
// };

// export const SectionWrapper = ({
//   title,
//   children,
//   description,
// }: {
//   title: string;
//   children: React.ReactNode;
//   description?: string;
// }) => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   return (
//     <div className="bg-white rounded-[8px] px-4 py-5 mb-4 transition-all border border-gray-100">
//       <div
//         className="flex justify-between items-center mb-4 cursor-pointer select-none"
//         onClick={() => setIsCollapsed(!isCollapsed)}
//       >
//         <h3 className="text-[#003032] font-medium text-xl">{title}</h3>
//         <ChevronUp
//           size={24}
//           color="black"
//           strokeWidth={2.5}
//           className={`transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`}
//         />
//       </div>
//       {description && !isCollapsed && (
//         <p className="text-sm text-[#A2A2A2] -mt-3 mb-5 leading-tight">
//           {description}
//         </p>
//       )}
//       <div className={isCollapsed ? "hidden" : "block"}>{children}</div>
//     </div>
//   );
// };

// // ── VARIANT TYPES ──
// type VariantAttribute = {
//   label: string;
//   value: string;
//   type: "text" | "color";
//   hex?: string;
// };
// type VariantRow = {
//   variantId?: string;
//   attributes: VariantAttribute[];
//   stock: number;
//   sku: string;
//   price: number;
//   images: string[];
// };

// // ── UNIFIED APPLICATION FORM CONTAINER ENGINE ──
// export default function ProductUploadMain() {
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [images, setImages] = useState<string[]>([]);
//   const [uploadingMedia, setUploadingMedia] = useState(false);

//   const productId = searchParams.get("id");
//   const isEditMode = !!productId;

//   const methods = useForm({
//     defaultValues: {
//       name: "",
//       slug: "",
//       category_id: "",
//       brand_id: "",
//       unit_id: "",
//       modelName: "",
//       short_description: "",
//       description: "",
//       regular_price: "",
//       sell_price: "",
//       cost_price: "",
//       quantity: "50",
//       unit_name: "Pcs",
//       warranty: "",
//       sku: "",
//       barcode: "",
//       priority: "100",
//       is_variant_mandatory: false,
//       autoSlug: true,
//       status: "DRAFT",
//       condition: "NEW",
//       seoKeywords: "",
//       seoDescription: "",
//       seoTitle: "",
//       tag_ids: [] as string[],
//       supplier_ids: [] as string[],
//       video_urls: [] as string[],
//       specifications: [] as { type: string; desc: string }[],
//       faqs: [] as { q: string; a: string }[],
//       shippingMode: "DEFAULT" as "DEFAULT" | "CUSTOM" | "FREE",
//       customShippingRows: [] as { zone: string; charge: string }[],
//       variants: [] as VariantRow[],
//     },
//   });

//   const watchedValues = methods.watch();

//   const { data: existingProduct, isLoading: loadingExistingProduct } = useQuery(
//     {
//       queryKey: ["product-single-edit-node", productId],
//       queryFn: () => fetchSingleProduct(productId!),
//       enabled: isEditMode,
//     },
//   );

//   // Handles any shape backend might send: ["id1","id2"], [{id:"id1"}], [{tag_id:"id1"}], [{tag:{id:"id1"}}]
//   function extractIds(source: any): string[] {
//     if (!Array.isArray(source)) return [];
//     return source
//       .map((item: any) => {
//         let id = null;
//         if (typeof item === "string" || typeof item === "number") id = item;
//         else if (item?.id) id = item.id;
//         else if (item?.tag_id) id = item.tag_id;
//         else if (item?.tag?.id) id = item.tag.id;

//         return id ? String(id) : null;
//       })
//       .filter(Boolean) as string[];
//   }
//   useEffect(() => {
//     if (isEditMode && existingProduct) {
//       const formattedTags = extractIds(
//         existingProduct.tag_ids ??
//           existingProduct.product_tags ??
//           existingProduct.tags,
//       );
//       methods.reset({
//         name: existingProduct.name || "",
//         slug: existingProduct.slug || "",
//         category_id:
//           existingProduct.category_id || existingProduct.category?.id || "",
//         brand_id: existingProduct.brand_id || existingProduct.brand?.id || "",
//         unit_id: existingProduct.unit_id || existingProduct.unit?.id || "",
//         modelName: existingProduct.modelName || "",
//         short_description: existingProduct.short_description || "",
//         description: existingProduct.description || "",
//         regular_price: String(existingProduct.regular_price ?? 0),
//         sell_price: String(existingProduct.sell_price ?? 0),
//         cost_price: String(existingProduct.cost_price ?? 0),
//         quantity: String(existingProduct.quantity ?? 0),
//         unit_name: existingProduct.unit_name || "Pcs",
//         warranty: existingProduct.warranty || "",
//         sku: existingProduct.sku || "",
//         barcode: existingProduct.barcode || "",
//         priority: String(existingProduct.priority ?? 100),
//         is_variant_mandatory: !!existingProduct.is_variant_mandatory,
//         autoSlug: false,
//         status: existingProduct.status || "DRAFT",
//         condition: existingProduct.condition || "NEW",
//         seoTitle: existingProduct.meta_title || "",
//         seoDescription: existingProduct.meta_description || "",
//         seoKeywords: existingProduct.meta_tags || "",
//         tag_ids: extractIds(
//           existingProduct.tag_ids ??
//             existingProduct.product_tags ??
//             existingProduct.tags,
//         ),
//         supplier_ids: Array.isArray(existingProduct.supplier_ids)
//           ? existingProduct.supplier_ids
//           : Array.isArray(existingProduct.suppliers)
//             ? existingProduct.suppliers.map((s: any) => s.id)
//             : [],
//         video_urls: Array.isArray(existingProduct.video_urls)
//           ? existingProduct.video_urls
//           : [],
//         specifications: Array.isArray(existingProduct.specifications)
//           ? existingProduct.specifications
//           : [],
//         faqs: Array.isArray(existingProduct.faqs) ? existingProduct.faqs : [],
//         shippingMode:
//           existingProduct.shipping_type === "FREE"
//             ? "FREE"
//             : existingProduct.shipping_type === "CUSTOM"
//               ? "CUSTOM"
//               : "DEFAULT",
//         customShippingRows: Array.isArray(existingProduct.shipping_config)
//           ? existingProduct.shipping_config.map((row: any) => ({
//               zone: row.zone || "",
//               charge: String(row.charge ?? 0),
//             }))
//           : [],
//         // 🚀 FIXED: map backend's attributes[] array instead of the old flat `attribute` string
//         variants: Array.isArray(existingProduct.variants)
//           ? existingProduct.variants.map((v: any) => ({
//               variantId: v.id,
//               attributes: Array.isArray(v.attributes) ? v.attributes : [],
//               stock: v.stock ?? 0,
//               sku: v.sku || "",
//               price: v.price ?? 0,
//               images: Array.isArray(v.images) ? v.images : [],
//             }))
//           : [],
//       });
//       if (Array.isArray(existingProduct.images)) {
//         setImages(existingProduct.images);
//       }
//     }
//   }, [existingProduct, isEditMode, methods]);

//   const productMutation = useMutation({
//     mutationFn: async (targetStatus: "DRAFT" | "PUBLISHED") => {
//       const formPayload = methods.getValues();
//       const cleanSlug =
//         formPayload.slug ||
//         formPayload.name
//           .toLowerCase()
//           .replace(/[^a-z0-9]+/g, "-")
//           .replace(/(^-|-$)/g, "");
//       const finalPayload: any = {
//         name: formPayload.name,
//         slug: cleanSlug,
//         category_id: formPayload.category_id || null,
//         brand_id: formPayload.brand_id || null,
//         unit_id: formPayload.unit_id || null,
//         short_description: formPayload.short_description || null,
//         description: formPayload.description,
//         status: isEditMode ? formPayload.status : targetStatus,
//         images: Array.isArray(images)
//           ? images.map((img: any) => String(img))
//           : [],
//         priority: Number(formPayload.priority) || 100,
//         regular_price: Number(formPayload.regular_price) || 0,
//         sell_price: Number(formPayload.sell_price) || 0,
//         cost_price: Number(formPayload.cost_price) || 0,
//         quantity: formPayload.is_variant_mandatory
//           ? 0
//           : Number(formPayload.quantity) || 0,
//         warranty: formPayload.warranty || null,
//         sku: formPayload.sku || null,
//         barcode: formPayload.barcode || null,
//         is_variant_mandatory: formPayload.is_variant_mandatory,
//         meta_title: formPayload.seoTitle || null,
//         meta_description: formPayload.seoDescription || null,
//         meta_tags: formPayload.seoKeywords || null,
//         video_urls: Array.isArray(formPayload.video_urls)
//           ? formPayload.video_urls.filter(Boolean)
//           : [],
//         specifications: Array.isArray(formPayload.specifications)
//           ? formPayload.specifications
//           : [],
//         faqs: Array.isArray(formPayload.faqs) ? formPayload.faqs : [],

//         shipping_type: formPayload.shippingMode,
//         ...(formPayload.shippingMode === "CUSTOM"
//           ? {
//               shipping_config: (formPayload.customShippingRows || [])
//                 .filter((r: any) => r.zone?.trim())
//                 .map((r: any) => ({
//                   zone: r.zone.trim(),
//                   charge: Number(r.charge) || 0,
//                 })),
//             }
//           : formPayload.shippingMode === "FREE"
//             ? { shipping_config: [] }
//             : {}),
//       };

//       // Include tags and suppliers in payload for both Create and Edit mode
//       finalPayload.tag_ids = formPayload.tag_ids || [];
//       finalPayload.supplier_ids = formPayload.supplier_ids || [];

//       // Include variants in payload for both create and edit mode
//       finalPayload.variants = (formPayload.variants as VariantRow[]).map(
//         (v) => ({
//           ...(v.variantId || v.id ? { id: v.variantId || v.id } : {}),
//           attributes: Array.isArray(v.attributes) ? v.attributes : [],
//           stock: Number(v.stock) || 0,
//           sku: v.sku || `SKU-${Date.now()}`,
//           price: Number(v.price) || 0,
//           images: Array.isArray(v.images)
//             ? v.images.map((img: string) => String(img))
//             : [],
//         }),
//       );

//       if (isEditMode && productId) {
//         return updateProduct(productId, finalPayload);
//       }
//       return createProduct(finalPayload);
//     },
//     onSuccess: (data, variables) => {
//       // Wipe out the main products lists query cache
//       queryClient.invalidateQueries({
//         queryKey: ["products-list-panel"],
//         exact: false,
//       });

//       //  Clear out this exact single product item cache row too so it refetches cleanly next time
//       if (isEditMode && productId) {
//         queryClient.invalidateQueries({
//           queryKey: ["product-single-edit-node", productId],
//           exact: true,
//         });
//         queryClient.removeQueries({
//           queryKey: ["product-single-edit-node", productId],
//         });
//       }

//       alert(
//         isEditMode
//           ? "Product updated successfully!"
//           : "Product created successfully!",
//       );

//       methods.reset();
//       setImages([]);

//       // Route back to dashboard and immediately prompt Next.js to sync server component states
//       router.push("/admin/dashboard/products");
//       router.refresh();
//     },
//     onError: (err) => {
//       alert(`Rejection Error: ${err.message}`);
//     },
//   });

//   const completeness =
//     (watchedValues.name ? 25 : 0) +
//     (watchedValues.category_id ? 25 : 0) +
//     (watchedValues.sell_price ? 25 : 0) +
//     (images.length > 0 ? 25 : 0);

//   if (isEditMode && loadingExistingProduct) {
//     return (
//       <div className="h-64 w-full flex items-center justify-center text-gray-400 gap-2 bg-[#F9FAFB]">
//         <Loader2 className="animate-spin text-gray-500" />
//         <span className="text-xs">
//           Synchronizing target product row data from servers...
//         </span>
//       </div>
//     );
//   }

//   return (
//     <FormProvider {...methods}>
//       <form
//         onSubmit={(e) => e.preventDefault()}
//         className="w-full min-h-screen font-lato pb-12"
//       >
//         <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-4 p-4 bg-white border-b border-gray-100 rounded-[8px]">
//           <div>
//             <h1 className="text-xl font-bold text-black sm:text-2xl">
//               {isEditMode ? "Edit Product Workspace" : "Product Upload"}
//             </h1>
//             <p className="text-xs text-gray-400">
//               Integrated server state transactional panel console
//             </p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//             {!isEditMode && (
//               <button
//                 type="button"
//                 disabled={productMutation.isPending}
//                 onClick={() => productMutation.mutate("DRAFT")}
//                 className="flex items-center gap-2 px-6 py-3.5 rounded-[8px] bg-white text-[#070606] font-semibold text-sm justify-center border border-gray-200 cursor-pointer disabled:opacity-50 hover:bg-gray-50 transition-colors"
//               >
//                 {productMutation.isPending ? (
//                   <Loader2 className="animate-spin" size={16} />
//                 ) : (
//                   <EditFileIcon />
//                 )}{" "}
//                 Save Draft
//               </button>
//             )}
//             <PrimaryButton
//               onClick={() => {
//                 if (!productMutation.isPending)
//                   productMutation.mutate("PUBLISHED");
//               }}
//               icon={
//                 productMutation.isPending ? (
//                   <Loader2 className="animate-spin" size={18} />
//                 ) : isEditMode ? (
//                   <Save size={16} />
//                 ) : (
//                   <Plus
//                     size={24}
//                     className="border-2 border-white rounded-full p-0.5"
//                   />
//                 )
//               }
//               label={
//                 productMutation.isPending
//                   ? "Saving..."
//                   : isEditMode
//                     ? "Save Product Changes"
//                     : "Add Product"
//               }
//               className={`w-full sm:w-auto justify-center bg-[#085E00] hover:bg-[#064400] ${productMutation.isPending ? "opacity-60 pointer-events-none" : ""}`}
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//           <div className="lg:col-span-8 flex flex-col gap-4">
//             <GeneralInfoSection
//               images={images}
//               setImages={setImages}
//               uploading={uploadingMedia}
//               setUploading={setUploadingMedia}
//             />

//             <SectionWrapper title="Pricing">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//                 <div>
//                   <Label required>Sell Price (৳)</Label>
//                   <Input
//                     type="number"
//                     name="sell_price"
//                     placeholder="0"
//                     options={{ required: true }}
//                   />
//                 </div>
//                 <div>
//                   <Label required>Regular Price (৳)</Label>
//                   <Input
//                     type="number"
//                     name="regular_price"
//                     placeholder="0"
//                     options={{ required: true }}
//                   />
//                 </div>
//                 <div>
//                   <Label>Cost Price (Optional) (৳)</Label>
//                   <Input type="number" name="cost_price" placeholder="0" />
//                 </div>
//               </div>
//             </SectionWrapper>

//             <InventorySection Barcode={Barcode} />
//             <VariantsSection isEditMode={isEditMode} />
//             <BrandSection />
//             <ShippingSection isEditMode={isEditMode} />
//             <SpecificationsSection />
//             <FaqsSection />
//             <VideoUrlsSection />
//             <SeoSection />
//           </div>

//           <div className="lg:col-span-4 flex flex-col gap-4">
//             <div className="bg-white rounded-[8px] p-5 border border-gray-100">
//               <h3 className="text-black font-medium text-[20px] mb-2">
//                 Ready To Publish
//               </h3>
//               <div className="flex items-center justify-between mb-4">
//                 <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden mr-3">
//                   <div
//                     className="h-full bg-[#085E00] transition-all duration-200"
//                     style={{ width: `${completeness}%` }}
//                   />
//                 </div>
//                 <span className="text-[11px] font-bold text-gray-500">
//                   {completeness}%
//                 </span>
//               </div>
//               <div className="space-y-3">
//                 <div className="flex items-center gap-2.5 text-sm">
//                   {watchedValues.name ? (
//                     <CheckCircle2 size={16} className="text-[#085E00]" />
//                   ) : (
//                     <Circle size={16} className="text-gray-200" />
//                   )}
//                   <span>Item Identification parameters mapped</span>
//                 </div>
//                 <div className="flex items-center gap-2.5 text-sm">
//                   {images.length > 0 ? (
//                     <CheckCircle2 size={16} className="text-[#085E00]" />
//                   ) : (
//                     <Circle size={16} className="text-gray-200" />
//                   )}
//                   <span>Media assets loaded to storage</span>
//                 </div>
//                 <div className="flex items-center gap-2.5 text-sm">
//                   {watchedValues.category_id ? (
//                     <CheckCircle2 size={16} className="text-[#085E00]" />
//                   ) : (
//                     <Circle size={16} className="text-gray-200" />
//                   )}
//                   <span>Target catalog category bound</span>
//                 </div>
//               </div>
//             </div>

//             <SidebarCatalogSection />
//             <SidebarBrandSection />
//             <SidebarSupplierSection isEditMode={isEditMode} />
//             <SidebarTagSection isEditMode={isEditMode} />
//           </div>
//         </div>
//       </form>
//     </FormProvider>
//   );
// }

// function GeneralInfoSection({
//   images,
//   setImages,
//   uploading,
//   setUploading,
// }: {
//   images: string[];
//   setImages: React.Dispatch<React.SetStateAction<string[]>>;
//   uploading: boolean;
//   setUploading: (uploading: boolean) => void;
// }) {
//   const { register, setValue, watch, control } = useFormContext();
//   const fileRef = useRef<HTMLInputElement>(null);
//   const autoSlug = watch("autoSlug");
//   const baseStorageUrl =
//     process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//     "http://localhost:8082";

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;

//     try {
//       setUploading(true);
//       const paths = await uploadProductMedia(files);
//       if (paths.length > 0) {
//         setImages((prev: string[]) => [...prev, ...paths]);
//       }
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         toast.error(`Asset Sync Rejection: ${err.message}`);
//       } else {
//         toast.error(`Asset Sync Rejection: Something went wrong`);
//       }
//     } finally {
//       setUploading(false);
//       if (fileRef.current) fileRef.current.value = "";
//     }
//   };

//   return (
//     <SectionWrapper title="General Information">
//       <div className="space-y-5">
//         <div>
//           <div className="flex justify-between items-end mb-1">
//             <Label required>Item Name</Label>
//             <div
//               className="flex items-center gap-2 cursor-pointer"
//               onClick={() => setValue("autoSlug", !autoSlug)}
//             >
//               <span className="text-xs text-gray-400">Auto Slug</span>
//               <Toggle name="autoSlug" />
//             </div>
//           </div>
//           <input
//             {...register("name", {
//               required: true,
//               onChange: (e) => {
//                 if (autoSlug) {
//                   const computed = e.target.value
//                     .toLowerCase()
//                     .replace(/[^a-z0-9]+/g, "-")
//                     .replace(/(^-|-$)/g, "");
//                   setValue("slug", computed);
//                 }
//               },
//             })}
//             className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none placeholder:text-[#A2A2A2]"
//             placeholder="Ex: Samsung Galaxy S23 Ultra"
//           />
//         </div>

//         <div>
//           <Label required>Slug</Label>
//           <input
//             {...register("slug")}
//             disabled={autoSlug}
//             className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-gray-500 disabled:opacity-60"
//             placeholder="samsung-galaxy-s23-ultra"
//           />
//         </div>

//         <div>
//           <Label required>Media</Label>
//           <div className="bg-[#F9F9F9] rounded-[8px] p-6 text-center relative flex flex-col items-center justify-center min-h-[160px]">
//             {images.length > 0 && (
//               <div className="flex flex-row flex-wrap items-center justify-center gap-3 mb-4">
//                 {images.map((src: string, i: number) => {
//                   const cleanImg = src.trim();
//                   const finalSrc = cleanImg.startsWith("http")
//                     ? cleanImg
//                     : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`;

//                   return (
//                     <div
//                       key={i}
//                       className="relative group w-20 h-20 rounded border border-gray-200 overflow-hidden bg-white shadow-xs shrink-0"
//                     >
//                       <Image
//                         unoptimized
//                         width={100}
//                         height={100}
//                         src={finalSrc}
//                         className="w-full h-full object-cover"
//                         alt={`image ${i + 1}`}
//                       />
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setImages(
//                             images.filter(
//                               (_: string, idx: number) => idx !== i,
//                             ),
//                           )
//                         }
//                         className="absolute inset-0 bg-black/40 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//             <div
//               onClick={() => fileRef.current?.click()}
//               className="cursor-pointer flex flex-col items-center select-none"
//             >
//               <IamgeIcon size="48" color="#999" />
//               <span className="text-[#A2A2A2] text-base font-normal">
//                 Drag image here or click to add.
//               </span>
//               <span className="max-w-[300px] text-xs text-[#A2A2A2] mt-2 font-normal">
//                 Recommended formats: JPG, PNG. Max size: 4MB. Use 1:1 aspect
//                 ratio (1080×1080 px).
//               </span>
//               <button className="cursor-pointer text-sm font-lato font-semibold px-4 py-2 bg-[#FF9F1C] rounded-sm text-white mt-3">
//                 Add Image
//               </button>
//             </div>
//             <input
//               type="file"
//               ref={fileRef}
//               className="hidden"
//               onChange={handleUpload}
//               accept="image/*"
//               multiple
//               disabled={uploading}
//             />
//             {uploading && (
//               <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-[8px]">
//                 <Loader2 className="animate-spin text-orange-500" size={24} />
//               </div>
//             )}
//           </div>
//         </div>

//         <div>
//           <Label>Short Description</Label>
//           <textarea
//             {...register("short_description")}
//             className="w-full bg-[#F9FAFB] rounded-[8px] px-4 py-3 text-sm min-h-[80px] outline-none text-gray-800 resize-none"
//             placeholder="Summary highlights..."
//           />
//         </div>

//         <div>
//           <Label required>Product Description</Label>
//           <Controller
//             name="description"
//             control={control}
//             rules={{ required: true }}
//             render={({ field }) => (
//               <RichTextEditor
//                 value={field.value || ""}
//                 onChange={field.onChange}
//                 placeholder="Ex: Description"
//               />
//             )}
//           />
//         </div>
//       </div>
//     </SectionWrapper>
//   );
// }

// function InventorySection({ Barcode }: { Barcode?: React.ElementType }) {
//   const { register, watch, setValue } = useFormContext();
//   const isVariantMandatory = watch("is_variant_mandatory");
//   const selectedUnitId = watch("unit_id");

//   const { data: unitsRes } = useQuery({
//     queryKey: ["units-list-dropdown"],
//     queryFn: async () => {
//       const res = await apiFetch("/units");
//       return res.json();
//     },
//   });

//   const unitsList = (() => {
//     if (Array.isArray(unitsRes)) return unitsRes;
//     if (unitsRes && Array.isArray(unitsRes.data)) return unitsRes.data;
//     if (unitsRes && Array.isArray(unitsRes.data?.data))
//       return unitsRes.data.data;
//     return [];
//   })();

//   return (
//     <SectionWrapper title="Inventory">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div>
//           <Label>Quantity (Stock)</Label>
//           <input
//             type="number"
//             {...register("quantity")}
//             disabled={isVariantMandatory}
//             className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none placeholder:text-gray-400 disabled:opacity-50"
//             placeholder={isVariantMandatory ? "Derived from attributes" : "50"}
//           />
//         </div>
//         <div>
//           <Label>Unit Selection Mapping</Label>
//           <div className="relative w-full">
//             <select
//               value={selectedUnitId || ""}
//               onChange={(e) => {
//                 setValue("unit_id", e.target.value);
//                 const matchObj = unitsList.find(
//                   (u: any) => u.id === e.target.value,
//                 );
//                 if (matchObj) setValue("unit_name", matchObj.name);
//               }}
//               className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 px-4 py-3 text-sm rounded-[8px] outline-none appearance-none cursor-pointer"
//             >
//               <option value="">Select Package Unit</option>
//               {unitsList.map((unit: any) => (
//                 <option key={unit.id} value={unit.id}>
//                   {unit.name}
//                 </option>
//               ))}
//             </select>
//             <ChevronDown
//               size={14}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//             />
//           </div>
//         </div>
//         <div>
//           <Label>Warranty</Label>
//           <Input name="warranty" placeholder="12 months" />
//         </div>
//         <div>
//           <Label>SKU / Code</Label>
//           <Input name="sku" placeholder="SAM-REF-525" />
//         </div>
//         <div>
//           <Label>Barcode</Label>
//           <Input name="barcode" placeholder="88091..." icon={Barcode} />
//         </div>
//         <div>
//           <Label>Priority Rank</Label>
//           <Input type="number" name="priority" placeholder="100" />
//         </div>
//       </div>
//     </SectionWrapper>
//   );
// }

// // ── VARIANTS SECTION: multi-attribute (Color + Size ...) + per-variant image upload ──

// function VariantsSection({ isEditMode }: { isEditMode: boolean }) {
//   const { control, watch } = useFormContext();
//   const { fields, append, remove, update } = useFieldArray({
//     control,
//     name: "variants",
//   });

//   const baseStorageUrl =
//     process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//     "http://localhost:8082";
//   const variantFileRef = useRef<HTMLInputElement>(null);

//   // draft attribute builder (Color: Black / type: color) etc.
//   const [attrLabel, setAttrLabel] = useState("");
//   const [attrValue, setAttrValue] = useState("");
//   const [attrType, setAttrType] = useState<"text" | "color">("text");
//   const [attrHex, setAttrHex] = useState("#000000");
//   const [draftAttributes, setDraftAttributes] = useState<VariantAttribute[]>(
//     [],
//   );

//   // draft variant core fields
//   const [vStock, setVStock] = useState("");
//   const [vPrice, setVPrice] = useState("");
//   const [vSku, setVSku] = useState("");
//   const [draftImages, setDraftImages] = useState<string[]>([]);
//   const [uploadingVariantImg, setUploadingVariantImg] = useState(false);

//   // 👇 NEW: which row (if any) is currently being edited
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);

//   const resolveImgSrc = (src: string) => {
//     const cleanImg = (src || "").trim();
//     return cleanImg.startsWith("http")
//       ? cleanImg
//       : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`;
//   };

//   const resetDraft = () => {
//     setDraftAttributes([]);
//     setVStock("");
//     setVPrice("");
//     setVSku("");
//     setDraftImages([]);
//     setEditingIndex(null);
//   };

//   const handlePushAttribute = () => {
//     if (!attrLabel || !attrValue) return;
//     setDraftAttributes((prev) => [
//       ...prev,
//       {
//         label: attrLabel,
//         value: attrValue,
//         type: attrType,
//         ...(attrType === "color" ? { hex: attrHex } : {}),
//       },
//     ]);
//     setAttrLabel("");
//     setAttrValue("");
//     setAttrType("text");
//     setAttrHex("#000000");
//   };

//   const handleRemoveDraftAttribute = (idx: number) => {
//     setDraftAttributes((prev) => prev.filter((_, i) => i !== idx));
//   };

//   const handleVariantImageUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;
//     try {
//       setUploadingVariantImg(true);
//       const paths = await uploadVariantImage(files);
//       if (paths.length > 0) {
//         setDraftImages((prev) => [...prev, ...paths]);
//       }
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         toast.error(`Variant Image Sync Rejection: ${err.message}`);
//       } else {
//         toast.error(
//           "An unexpected error occurred while uploading the variant image.",
//         );
//       }
//     } finally {
//       setUploadingVariantImg(false);
//       if (variantFileRef.current) variantFileRef.current.value = "";
//     }
//   };

//   // 👇 NEW: mutation to PATCH an existing variant on the server
//   const updateVariantMutation = useMutation({
//     mutationFn: ({ id, payload }: { id: string; payload: VariantRow }) =>
//       updateVariant(id, payload),
//     onError: (err: unknown) => {
//       if (err instanceof Error) {
//         toast.error(`Variant Update Rejection: ${err.message}`);
//       } else {
//         toast.error("An unexpected error occurred while updating the variant.");
//       }
//     },
//   });

//   const handlePushOption = () => {
//     if (draftAttributes.length === 0 || !vPrice) return;
//     append({
//       attributes: draftAttributes,
//       stock: Number(vStock) || 0,
//       price: Number(vPrice) || 0,
//       sku: vSku || `SKU-${Date.now()}`,
//       images: draftImages,
//     });
//     resetDraft();
//   };

//   // 👇 NEW: load an existing row into the draft fields for editing
//   const handleEditClick = (idx: number) => {
//     const variant = watch(`variants.${idx}`) as VariantRow;
//     setDraftAttributes(variant.attributes || []);
//     setVStock(String(variant.stock ?? ""));
//     setVPrice(String(variant.price ?? ""));
//     setVSku(variant.sku || "");
//     setDraftImages(variant.images || []);
//     setEditingIndex(idx);
//   };

//   // 👇 NEW: commit the edit — PATCH to backend if it has a variantId, else just update local row
//   const handleUpdateOption = () => {
//     if (editingIndex === null) return;
//     if (draftAttributes.length === 0 || !vPrice) return;

//     const existing = watch(`variants.${editingIndex}`) as VariantRow;
//     const payload = {
//       attributes: draftAttributes,
//       stock: Number(vStock) || 0,
//       price: Number(vPrice) || 0,
//       sku: vSku || existing.sku || `SKU-${Date.now()}`,
//       images: draftImages,
//     };

//     const updatedRow: VariantRow = {
//       ...payload,
//       variantId: existing.variantId || existing.id,
//     };

//     if (existing.variantId || existing.id) {
//       const targetId = (existing.variantId || existing.id)!;
//       updateVariantMutation.mutate(
//         { id: targetId, payload },
//         {
//           onSuccess: () => {
//             update(editingIndex, updatedRow);
//             toast.success("Variant updated successfully!");
//             resetDraft();
//           },
//           onError: () => {
//             // fallback local update if server patch handles full form submit
//             update(editingIndex, updatedRow);
//             resetDraft();
//           },
//         },
//       );
//     } else {
//       update(editingIndex, updatedRow);
//       toast.success("Variant updated!");
//       resetDraft();
//     }
//   };

//   const showBuilder = !isEditMode || editingIndex !== null;

//   return (
//     <SectionWrapper
//       title="Product Variants"
//       description={
//         isEditMode
//           ? "Existing variants can be edited individually and synced to the server."
//           : "Combine attributes (e.g. Color + Size) to build a variant row."
//       }
//     >
//       <div className="rounded-lg p-5 space-y-4 border border-[#38BDF8] bg-white">
//         <div className="flex items-center justify-between">
//           <div>
//             <h4 className="text-base font-medium text-black">
//               Make this variant mandatory
//             </h4>
//             <p className="text-sm text-[#A2A2A2]">
//               Forces selection rules onto storefront client checkout lines
//             </p>
//           </div>
//           <Toggle name="is_variant_mandatory" />
//         </div>

//         {/* Committed variant rows */}
//         {fields.map((field, idx) => {
//           const variant = watch(`variants.${idx}`) as VariantRow;
//           const isBeingEdited = editingIndex === idx;
//           return (
//             <div
//               key={field.id}
//               className={`flex justify-between items-center gap-3 text-xs p-2.5 rounded border ${
//                 isBeingEdited ? "bg-sky-50 border-sky-300" : "bg-gray-50"
//               }`}
//             >
//               <div className="flex items-center gap-3 flex-1 flex-wrap">
//                 {Array.isArray(variant?.images) && variant.images[0] && (
//                   <Image
//                     width={36}
//                     height={36}
//                     src={resolveImgSrc(variant.images[0])}
//                     className="w-9 h-9 rounded object-cover border bg-white"
//                     alt="Variant image"
//                     unoptimized
//                   />
//                 )}
//                 <span>
//                   <strong>
//                     {(variant?.attributes || [])
//                       .map((a) => `${a.label}: ${a.value}`)
//                       .join(" / ")}
//                   </strong>{" "}
//                   | ৳{variant?.price} | Stock: {variant?.stock} | SKU:{" "}
//                   {variant?.sku}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2 shrink-0">
//                 <button
//                   type="button"
//                   onClick={() => handleEditClick(idx)}
//                   disabled={updateVariantMutation.isPending}
//                   className="text-sky-600 hover:text-sky-800 cursor-pointer disabled:opacity-50"
//                   title="Edit variant"
//                 >
//                   <Pencil size={14} />
//                 </button>
//                 {!isEditMode && (
//                   <button
//                     type="button"
//                     onClick={() => remove(idx)}
//                     className="text-red-500 hover:text-red-700 cursor-pointer"
//                     title="Remove variant"
//                   >
//                     <Trash2 size={14} />
//                   </button>
//                 )}
//               </div>
//             </div>
//           );
//         })}

//         {showBuilder && (
//           <>
//             {editingIndex !== null && (
//               <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded">
//                 <span>Editing variant row #{editingIndex + 1}</span>
//                 <button
//                   type="button"
//                   onClick={resetDraft}
//                   className="font-semibold underline cursor-pointer"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}

//             {/* Attribute builder (Color, Size, etc.) */}
//             <div className="bg-white rounded-lg space-y-3">
//               <label className="text-sm font-medium block">
//                 Attributes (e.g. Color, Size)
//               </label>
//               <div
//                 className={`grid ${attrType === "color" ? "grid-cols-5" : "grid-cols-4"} gap-2`}
//               >
//                 <input
//                   value={attrLabel}
//                   onChange={(e) => setAttrLabel(e.target.value)}
//                   className="w-full bg-[#F9F9F9] p-2 text-xs rounded outline-none col-span-1"
//                   placeholder="Label (Color)"
//                 />
//                 <input
//                   value={attrValue}
//                   onChange={(e) => setAttrValue(e.target.value)}
//                   className="w-full bg-[#F9F9F9] p-2 text-xs rounded outline-none col-span-1"
//                   placeholder="Value (Black)"
//                 />
//                 <select
//                   value={attrType}
//                   onChange={(e) =>
//                     setAttrType(e.target.value as "text" | "color")
//                   }
//                   className="w-full bg-[#F9F9F9] p-2 text-xs rounded outline-none col-span-1"
//                 >
//                   <option value="text">Text</option>
//                   <option value="color">Color</option>
//                 </select>
//                 {attrType === "color" && (
//                   <input
//                     type="color"
//                     value={attrHex}
//                     onChange={(e) => setAttrHex(e.target.value)}
//                     className="w-full h-full border rounded cursor-pointer col-span-1"
//                   />
//                 )}

//                 <PrimaryButton
//                   label="Add more"
//                   onClick={handlePushAttribute}
//                   icon={<PluseIcon />}
//                 />
//               </div>
//               {draftAttributes.length > 0 && (
//                 <div className="flex flex-wrap gap-2">
//                   {draftAttributes.map((a, i) => (
//                     <span
//                       key={i}
//                       className="flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2.5 py-1 text-[11px] font-semibold"
//                     >
//                       {a.type === "color" && a.hex && (
//                         <span
//                           className="w-3 h-3 rounded-full border"
//                           style={{ backgroundColor: a.hex }}
//                         />
//                       )}
//                       {a.label}: {a.value}
//                       <X
//                         size={12}
//                         className="cursor-pointer"
//                         onClick={() => handleRemoveDraftAttribute(i)}
//                       />
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Core variant fields + image upload */}
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="text-sm font-medium mb-1 block">Price</label>
//                 <input
//                   type="number"
//                   value={vPrice}
//                   onChange={(e) => setVPrice(e.target.value)}
//                   className="w-full bg-[#F9F9F9] py-4 px-2 text-xs rounded outline-none"
//                   placeholder="72000"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium mb-1 block">
//                   Stock Level
//                 </label>
//                 <input
//                   type="number"
//                   value={vStock}
//                   onChange={(e) => setVStock(e.target.value)}
//                   className="w-full bg-[#F9F9F9] py-4 px-2 text-xs rounded outline-none"
//                   placeholder="30"
//                 />
//               </div>
//               <div className="col-span-2">
//                 <label className="text-sm font-medium mb-1 block">
//                   Custom Variant SKU
//                 </label>
//                 <input
//                   value={vSku}
//                   onChange={(e) => setVSku(e.target.value)}
//                   className="w-full bg-g[#F9F9F9] py-4 px-2 text-xs rounded outline-none"
//                   placeholder="POLO-BLK-M"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="text-sm font-medium mb-1 block">
//                 Variant Image
//               </label>
//               <div className="flex items-center gap-2 flex-wrap">
//                 {draftImages.map((src, i) => (
//                   <div
//                     key={i}
//                     className="relative group w-14 h-14 rounded border overflow-hidden bg-white"
//                   >
//                     <Image
//                       width={56}
//                       height={56}
//                       unoptimized
//                       src={resolveImgSrc(src)}
//                       className="w-full h-full object-cover"
//                       alt="Variant image"
//                     />
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setDraftImages((prev) =>
//                           prev.filter((_, idx2) => idx2 !== i),
//                         )
//                       }
//                       className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
//                     >
//                       <Trash2 size={12} />
//                     </button>
//                   </div>
//                 ))}
//                 <div
//                   onClick={() =>
//                     !uploadingVariantImg && variantFileRef.current?.click()
//                   }
//                   className="w-14 h-14 rounded border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer relative"
//                 >
//                   {uploadingVariantImg ? (
//                     <Loader2
//                       className="animate-spin text-orange-500"
//                       size={16}
//                     />
//                   ) : (
//                     <IamgeIcon size="20" color="#999" />
//                   )}
//                 </div>
//                 <input
//                   type="file"
//                   ref={variantFileRef}
//                   className="hidden"
//                   onChange={handleVariantImageUpload}
//                   accept="image/*"
//                   multiple
//                   disabled={uploadingVariantImg}
//                 />
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={
//                 editingIndex !== null ? handleUpdateOption : handlePushOption
//               }
//               disabled={updateVariantMutation.isPending}
//               className="flex items-center gap-1 bg-[#36BAF9] text-white rounded text-sm font-medium  px-3 py-2 cursor-pointer"
//             >
//               {updateVariantMutation.isPending ? (
//                 <Loader2 className="animate-spin" size={14} />
//               ) : (
//                 <PluseIcon />
//               )}{" "}
//               {editingIndex !== null ? "Update Variant" : "Commit Variant"}
//             </button>
//           </>
//         )}
//       </div>
//     </SectionWrapper>
//   );
// }

// function BrandSection() {
//   const { setValue, watch } = useFormContext();
//   const activeBrandId = watch("brand_id");

//   const { data: brandResponse } = useQuery({
//     queryKey: ["brands-list-select"],
//     queryFn: async () => {
//       const res = await apiFetch("/brand");
//       return res.json();
//     },
//   });

//   const brandList = (() => {
//     if (Array.isArray(brandResponse)) return brandResponse;
//     if (brandResponse && Array.isArray(brandResponse.data))
//       return brandResponse.data;
//     if (brandResponse && Array.isArray(brandResponse.data?.data))
//       return brandResponse.data.data;
//     return [];
//   })();

//   return (
//     <SectionWrapper
//       title="Brand Metadata"
//       description="Connect product rows to system brand indexes."
//     >
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <Label>Select Brand</Label>
//           <div className="relative w-full">
//             <select
//               value={activeBrandId || ""}
//               onChange={(e) => setValue("brand_id", e.target.value)}
//               className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 px-4 py-3 text-xs rounded-[8px] outline-none appearance-none cursor-pointer"
//             >
//               <option value="">Select Brand Mapping</option>
//               {brandList.map((brand: any) => (
//                 <option key={brand.id} value={brand.id}>
//                   {brand.name}
//                 </option>
//               ))}
//             </select>
//             <ChevronDown
//               size={14}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//             />
//           </div>
//         </div>
//         <div>
//           <Label>Model Variant Reference String</Label>
//           <Input name="modelName" placeholder="Ex: RT53 Refrigerator" />
//         </div>
//       </div>
//     </SectionWrapper>
//   );
// }
// function ShippingSection({ isEditMode }: { isEditMode: boolean }) {
//   const { control, watch, setValue, register } = useFormContext();
//   const shippingMode = watch("shippingMode") as "DEFAULT" | "CUSTOM" | "FREE";

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "customShippingRows",
//   });

//   const modes: { value: "DEFAULT" | "CUSTOM" | "FREE"; label: string }[] = [
//     { value: "DEFAULT", label: "Default" },
//     { value: "CUSTOM", label: "Custom" },
//     { value: "FREE", label: "Free" },
//   ];

//   return (
//     <SectionWrapper
//       title="Shipping Configuration"
//       description="Choose how delivery charges apply to this product."
//     >
//       <div className="space-y-4">
//         <div className="flex gap-2 flex-wrap">
//           {modes.map((m) => (
//             <button
//               key={m.value}
//               type="button"
//               onClick={() => setValue("shippingMode", m.value)}
//               className={`px-4 py-2 rounded-[8px] text-xs font-semibold border transition-colors cursor-pointer ${
//                 shippingMode === m.value
//                   ? "bg-[#FF9F1C] text-white border-[#FF9F1C]"
//                   : "bg-white text-gray-600 border-gray-300"
//               }`}
//             >
//               {m.label}
//             </button>
//           ))}
//         </div>

//         {shippingMode === "DEFAULT" && (
//           <div className="bg-gray-50 border border-gray-200 text-gray-600 text-xs px-3 py-2.5 rounded-[8px]">
//             This product will use the system&apos;s global default delivery
//             rate.
//           </div>
//         )}

//         {shippingMode === "FREE" && (
//           <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2.5 rounded-[8px]">
//             This product will ship free of charge to all zones (৳0).
//           </div>
//         )}

//         {shippingMode === "CUSTOM" && (
//           <div className="space-y-3">
//             <p className="text-sm text-gray-400">
//               Add as many delivery zones as needed with their own charge.
//             </p>
//             {fields.map((field, idx) => (
//               <div key={field.id} className="flex gap-2 items-center">
//                 <input
//                   {...register(`customShippingRows.${idx}.zone`)}
//                   className="flex-1 bg-[#F9F9F9] px-2.5 py-3 text-xs rounded outline-none"
//                   placeholder="Zone (e.g. Dhaka, Chittagong, Sylhet)"
//                 />
//                 <input
//                   type="number"
//                   {...register(`customShippingRows.${idx}.charge`)}
//                   className="w-32 bg-[#F9F9F9] px-2.5 py-3 text-xs rounded outline-none"
//                   placeholder="Charge (৳)"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => remove(idx)}
//                   className="text-red-500 hover:text-red-700 shrink-0"
//                 >
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             ))}
//             <PrimaryButton
//               label="Add Zone"
//               onClick={() => append({ zone: "", charge: "" })}
//               icon={<PluseIcon />}
//             />
//           </div>
//         )}
//       </div>
//     </SectionWrapper>
//   );
// }
// function SeoSection() {
//   return (
//     <SectionWrapper title="SEO Meta Search Info">
//       <div className="space-y-4">
//         <div>
//           <Label>Meta Search Keywords</Label>
//           <Input
//             name="seoKeywords"
//             placeholder="samsung, refrigerator, 525 litre, home appliance"
//           />
//         </div>
//         <div>
//           <Label>SEO Meta Title</Label>
//           <Input
//             name="seoTitle"
//             placeholder="Samsung 525 Litre Refrigerator - Best Price"
//           />
//         </div>
//         <div>
//           <Label>SEO Meta Description Layout</Label>
//           <Input
//             name="seoDescription"
//             placeholder="Buy original Samsung 525 Litre Refrigerator at the best price..."
//           />
//         </div>
//       </div>
//     </SectionWrapper>
//   );
// }

// // ── SPECIFICATIONS: {type, desc}[] ──
// function SpecificationsSection() {
//   const { control, register } = useFormContext();
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "specifications",
//   });

//   return (
//     <SectionWrapper
//       title="Specifications"
//       description="Key/value technical spec rows (e.g. Origin: Bangladesh)."
//     >
//       <div className="space-y-3">
//         {fields.map((field, idx) => (
//           <div key={field.id} className="flex gap-2 items-center">
//             <input
//               {...register(`specifications.${idx}.type`)}
//               className="flex-1 bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none"
//               placeholder="Type (e.g. Origin)"
//             />
//             <input
//               {...register(`specifications.${idx}.desc`)}
//               className="flex-[2] bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none"
//               placeholder="Description (e.g. Bangladesh)"
//             />
//             <button
//               type="button"
//               onClick={() => remove(idx)}
//               className="text-red-500 hover:text-red-700 shrink-0"
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         ))}

//         <PrimaryButton
//           label="Add Specification"
//           onClick={() => append({ type: "", desc: "" })}
//           icon={<PluseIcon />}
//         />
//       </div>
//     </SectionWrapper>
//   );
// }

// // ── FAQS: {q, a}[] ──
// function FaqsSection() {
//   const { control, register } = useFormContext();
//   const { fields, append, remove } = useFieldArray({ control, name: "faqs" });

//   return (
//     <SectionWrapper
//       title="FAQs"
//       description="Frequently asked questions shown on the product page."
//     >
//       <div className="space-y-4">
//         {fields.map((field, idx) => (
//           <div key={field.id} className="rounded-lg p-3 space-y-2">
//             <div className="flex gap-2 items-center">
//               <input
//                 {...register(`faqs.${idx}.q`)}
//                 className="flex-1 bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none"
//                 placeholder="Question"
//               />
//               <button
//                 type="button"
//                 onClick={() => remove(idx)}
//                 className="text-red-500 hover:text-red-700 shrink-0"
//               >
//                 <Trash2 size={16} />
//               </button>
//             </div>
//             <textarea
//               {...register(`faqs.${idx}.a`)}
//               className="w-full bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none resize-none min-h-[60px]"
//               placeholder="Answer"
//             />
//           </div>
//         ))}

//         <PrimaryButton
//           label="Add FAQ"
//           onClick={() => append({ q: "", a: "" })}
//           icon={<PluseIcon />}
//         />
//       </div>
//     </SectionWrapper>
//   );
// }

// // ── VIDEO URLS: string[] ──
// function VideoUrlsSection() {
//   const { watch, setValue } = useFormContext();
//   const videoUrls: string[] = watch("video_urls") || [];
//   const [draftUrl, setDraftUrl] = useState("");

//   const handleAddUrl = () => {
//     if (!draftUrl.trim()) return;
//     setValue("video_urls", [...videoUrls, draftUrl.trim()]);
//     setDraftUrl("");
//   };

//   const handleRemoveUrl = (idx: number) => {
//     setValue(
//       "video_urls",
//       videoUrls.filter((_, i) => i !== idx),
//     );
//   };

//   return (
//     <SectionWrapper
//       title="Video URLs"
//       description="YouTube or other hosted video links for this product."
//     >
//       <div className="space-y-3">
//         {videoUrls.map((url, idx) => (
//           <div key={idx} className="flex gap-2 items-center">
//             <input
//               value={url}
//               readOnly
//               className="flex-1 bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none text-gray-600"
//             />
//             <button
//               type="button"
//               onClick={() => handleRemoveUrl(idx)}
//               className="text-red-500 hover:text-red-700 shrink-0"
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         ))}
//         <div className="flex gap-2 items-center">
//           <input
//             value={draftUrl}
//             onChange={(e) => setDraftUrl(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 e.preventDefault();
//                 handleAddUrl();
//               }
//             }}
//             className="flex-1 bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none"
//             placeholder="https://www.youtube.com/watch?v=..."
//           />
//           <PrimaryButton
//             label="Add Video URL"
//             onClick={handleAddUrl}
//             icon={<PluseIcon />}
//           />
//         </div>
//       </div>
//     </SectionWrapper>
//   );
// }

// function SidebarCatalogSection() {
//   const { setValue, watch } = useFormContext();
//   const activeCatId = watch("category_id");

//   const { data: treeResponse, isLoading } = useQuery({
//     queryKey: ["categories-nested-tree-upload"],
//     queryFn: async () => {
//       const res = await apiFetch("/categories/tree");
//       if (!res.ok) throw new Error("Tree serialization error");
//       return res.json();
//     },
//   });

//   const unwindTree = (nodes: any[], level = 0) => {
//     if (!Array.isArray(nodes)) return null;
//     return nodes.map((node) => (
//       <React.Fragment key={node.id}>
//         <option value={node.id}>
//           {"\u00A0\u00A0".repeat(level) + (level > 0 ? "├─ " : "") + node.name}
//         </option>
//         {node.children &&
//           node.children.length > 0 &&
//           unwindTree(node.children, level + 1)}
//       </React.Fragment>
//     ));
//   };

//   const parsedTreeNodes = (() => {
//     if (!treeResponse) return [];
//     if (Array.isArray(treeResponse)) return treeResponse;
//     if (treeResponse.data && Array.isArray(treeResponse.data))
//       return treeResponse.data;
//     if (treeResponse.data?.data && Array.isArray(treeResponse.data.data))
//       return treeResponse.data.data;
//     return [];
//   })();

//   return (
//     <div className="bg-white rounded-[8px] p-5 border border-gray-100 shadow-xs">
//       <h3 className="text-black font-medium text-base mb-4">
//         Catalog Selection
//       </h3>
//       <Label required>System Category Tree</Label>
//       <div className="relative w-full">
//         <select
//           value={activeCatId || ""}
//           onChange={(e) => setValue("category_id", e.target.value)}
//           className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 px-4 py-3 text-xs rounded-[8px] outline-none appearance-none cursor-pointer focus:bg-white"
//         >
//           <option value="">
//             {isLoading
//               ? "Synchronizing tree schemas..."
//               : "Select Category Node*"}
//           </option>
//           {parsedTreeNodes.length > 0 && unwindTree(parsedTreeNodes)}
//         </select>
//         <ChevronDown
//           size={14}
//           className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//         />
//       </div>
//     </div>
//   );
// }
// function SidebarBrandSection() {
//   const { setValue, watch } = useFormContext();
//   const activeBrandId = watch("brand_id");

//   const { data: brandResponse, isLoading } = useQuery({
//     queryKey: ["brands-list-select-sidebar"],
//     queryFn: async () => {
//       const res = await apiFetch("/brand");
//       return res.json();
//     },
//   });

//   const brandList = (() => {
//     if (Array.isArray(brandResponse)) return brandResponse;
//     if (brandResponse && Array.isArray(brandResponse.data))
//       return brandResponse.data;
//     if (brandResponse && Array.isArray(brandResponse.data?.data))
//       return brandResponse.data.data;
//     return [];
//   })();

//   return (
//     <div className="bg-white rounded-[8px] p-5 border border-gray-100 shadow-xs">
//       <h3 className="text-black font-medium text-base mb-4">Brand Selection</h3>
//       <Label>Select Brand</Label>
//       <div className="relative w-full">
//         <select
//           value={activeBrandId || ""}
//           onChange={(e) =>
//             setValue("brand_id", e.target.value, {
//               shouldDirty: true,
//               shouldValidate: true,
//             })
//           }
//           className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 px-4 py-3 text-xs rounded-[8px] outline-none appearance-none cursor-pointer focus:bg-white"
//         >
//           <option value="">
//             {isLoading ? "Synchronizing brands..." : "Select Brand Mapping"}
//           </option>
//           {brandList.map((brand: any) => (
//             <option key={brand.id} value={brand.id}>
//               {brand.name}
//             </option>
//           ))}
//         </select>
//         <ChevronDown
//           size={14}
//           className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//         />
//       </div>
//     </div>
//   );
// }

// function SidebarTagSection({ isEditMode }: { isEditMode: boolean }) {
//   const { setValue, watch } = useFormContext();
//   const activeTags = watch("tag_ids") || [];

//   const { data: tagsResponse } = useQuery({
//     queryKey: ["tags-list-upload-select"],
//     queryFn: async () => {
//       const res = await apiFetch("/tags");
//       return res.json();
//     },
//   });

//   const tagsList = (() => {
//     if (Array.isArray(tagsResponse)) return tagsResponse;
//     if (tagsResponse?.data && Array.isArray(tagsResponse.data))
//       return tagsResponse.data;
//     if (tagsResponse?.data?.data && Array.isArray(tagsResponse.data.data))
//       return tagsResponse.data.data;
//     return [];
//   })();

//   const handleToggleTagSelection = (tagId: any) => {
//     const idStr = String(tagId);
//     const updatedTags = activeTags.includes(idStr)
//       ? activeTags.filter((id: string) => id !== idStr)
//       : [...activeTags, idStr];
//     setValue("tag_ids", updatedTags, {
//       shouldDirty: true,
//       shouldValidate: true,
//     });
//   };

//   return (
//     <div className="bg-white rounded-[8px] p-5 border border-gray-100 shadow-xs">
//       <h3 className="text-[#003032] font-medium text-base mb-4">
//         Tags Assignment
//       </h3>
//       <Label>Select Associated Tags</Label>
//       <div className="max-h-[200px] overflow-y-auto border border-gray-100 p-2.5 rounded-[6px] space-y-1.5 bg-[#F9FAFB]">
//         {tagsList.map((tag: any) => {
//           const isSelected = activeTags.includes(String(tag.id));
//           return (
//             <div
//               key={tag.id}
//               onClick={() => handleToggleTagSelection(tag.id)}
//               className={`flex items-center justify-between text-xs p-2 rounded cursor-pointer transition-all border ${
//                 isSelected
//                   ? "bg-sky-100 text-sky-700 border-sky-300 font-semibold"
//                   : "hover:bg-gray-100 text-gray-600 border-transparent"
//               }`}
//             >
//               <span>{tag.name}</span>
//               {isSelected && <span className="font-bold text-sky-600">✓</span>}
//             </div>
//           );
//         })}
//         {tagsList.length === 0 && (
//           <span className="text-[11px] text-gray-400">No tags found.</span>
//         )}
//       </div>
//     </div>
//   );
// }

// function SidebarSupplierSection({ isEditMode }: { isEditMode: boolean }) {
//   const { setValue, watch } = useFormContext();
//   const activeSuppliers = watch("supplier_ids") || [];

//   const { data: supplierResponse } = useQuery({
//     queryKey: ["suppliers-list-upload-select"],
//     queryFn: async () => {
//       const res = await apiFetch("/suppliers");
//       return res.json();
//     },
//   });

//   const supplierList = (() => {
//     if (Array.isArray(supplierResponse)) return supplierResponse;
//     if (supplierResponse && Array.isArray(supplierResponse.data))
//       return supplierResponse.data;
//     if (supplierResponse && Array.isArray(supplierResponse.data?.data))
//       return supplierResponse.data.data;
//     return [];
//   })();

//   const handleToggleSupplier = (supplierId: string) => {
//     const updated = activeSuppliers.includes(supplierId)
//       ? activeSuppliers.filter((id: string) => id !== supplierId)
//       : [...activeSuppliers, supplierId];
//     setValue("supplier_ids", updated, {
//       shouldDirty: true,
//       shouldValidate: true,
//     });
//   };

//   return (
//     <div className="bg-white rounded-[8px] p-5 border border-gray-100 shadow-xs">
//       <h3 className="text-[#003032] font-medium text-base mb-4">
//         Suppliers Assignment
//       </h3>
//       <Label>Select Linked Suppliers</Label>
//       <div className="max-h-[140px] overflow-y-auto border border-gray-100 p-2.5 rounded-[6px] space-y-1.5 bg-[#F9FAFB]">
//         {supplierList.map((supplier: any) => {
//           const isSelected = activeSuppliers.includes(supplier.id);
//           return (
//             <div
//               key={supplier.id}
//               onClick={() => handleToggleSupplier(supplier.id)}
//               className={`flex items-center justify-between text-xs p-2 rounded cursor-pointer transition-colors ${
//                 isSelected
//                   ? "bg-sky-50 text-sky-700 font-semibold"
//                   : "hover:bg-gray-100 text-gray-600"
//               }`}
//             >
//               <span>{supplier.name}</span>
//               {isSelected && <span className="font-bold text-sky-600">✓</span>}
//             </div>
//           );
//         })}
//         {supplierList.length === 0 && (
//           <span className="text-[11px] text-gray-400">No suppliers found.</span>
//         )}
//       </div>
//     </div>
//   );
// }

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
        quantity: formPayload.is_variant_mandatory
          ? 0
          : Number(formPayload.quantity) || 0,
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

      // Route back to dashboard and immediately prompt Next.js to sync server component states
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
                <span className="text-sm font-semibold text-gray-700">Status:</span>
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
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label required>Regular Price (৳)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label>Cost Price (Optional) (৳)</Label>
                  <Input type="number" placeholder="0" />
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
