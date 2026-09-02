// import { useFieldArray, useFormContext } from "react-hook-form";
// import { SectionWrapper } from "./SectionWrapper";
// import { Toggle } from "./Toggle";
// import { useMutation } from "@tanstack/react-query";
// import { updateVariant } from "@/services-api/productService";
// import { Trash2, Loader2, Plus } from "lucide-react";
// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { uploadVariantImage } from "@/services-api/productService";
// import { toast } from "react-hot-toast";
// import IamgeIcon from "../../../store-front/svg/svg/IamgeIcon";
// import { VariantAttribute } from "@/app/(store-front)/profile/order/page";
// import { VariantRow } from "./ProductUploadMain";
// import PrimaryButton from "../../common/PrimaryButton";
// import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";

// // ---- local (UI-only) builder types — NOT sent to backend directly ----
// type VariantOptionDraft = { id: string; value: string; hex?: string };
// type VariantTypeDraft = {
//   id: string;
//   title: string;
//   inputType: "text" | "color";
//   options: VariantOptionDraft[];
// };

// const genId = () => Math.random().toString(36).slice(2, 10);

// const keyOfAttributes = (attrs: VariantAttribute[] = []) =>
//   attrs
//     .map((a) => `${a.label}:${a.value}`)
//     .sort()
//     .join("|");

// function buildCombinations(types: VariantTypeDraft[]) {
//   const validTypes = types
//     .map((t) => ({ ...t, options: t.options.filter((o) => o.value.trim()) }))
//     .filter((t) => t.title.trim() && t.options.length > 0);
//   if (validTypes.length === 0) return [];

//   return validTypes.reduce<{ key: string; attributes: VariantAttribute[] }[]>(
//     (acc, type) => {
//       const step = type.options.map((opt) => ({
//         label: type.title.trim(),
//         value: opt.value,
//         type: type.inputType,
//         ...(type.inputType === "color" && opt.hex ? { hex: opt.hex } : {}),
//       }));

//       if (acc.length === 0) {
//         return step.map((attr) => ({
//           key: keyOfAttributes([attr]),
//           attributes: [attr],
//         }));
//       }

//       const next: { key: string; attributes: VariantAttribute[] }[] = [];
//       acc.forEach((combo) => {
//         step.forEach((attr) => {
//           const attributes = [...combo.attributes, attr];
//           next.push({ key: keyOfAttributes(attributes), attributes });
//         });
//       });
//       return next;
//     },
//     [],
//   );
// }

// export default function VariantsSection({
//   isEditMode,
// }: {
//   isEditMode: boolean;
// }) {
//   const { control, watch, setValue } = useFormContext();
//   const { fields, append, remove, update } = useFieldArray({
//     control,
//     name: "variants",
//   });

//   const baseStorageUrl =
//     process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//     "http://localhost:8083";

//   const resolveImgSrc = (src: string) => {
//     const cleanImg = (src || "").trim();
//     return cleanImg.startsWith("http")
//       ? cleanImg
//       : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`;
//   };

//   // ---------------- variant TYPE builders (Color, Size, ...) ----------------
//   const [variantTypes, setVariantTypes] = useState<VariantTypeDraft[]>([
//     {
//       id: genId(),
//       title: "",
//       inputType: "text",
//       options: [{ id: genId(), value: "" }],
//     },
//   ]);

//   // seed builders from already-saved variants (edit mode) — runs once
//   useEffect(() => {
//     const existingVariants = (watch("variants") || []) as VariantRow[];
//     if (!existingVariants.length) return;

//     const map = new Map<string, VariantTypeDraft>();
//     existingVariants.forEach((v) => {
//       (v.attributes || []).forEach((a) => {
//         if (!map.has(a.label)) {
//           map.set(a.label, {
//             id: genId(),
//             title: a.label,
//             inputType: a.type === "color" ? "color" : "text",
//             options: [],
//           });
//         }
//         const t = map.get(a.label)!;
//         if (!t.options.some((o) => o.value === a.value)) {
//           t.options.push({ id: genId(), value: a.value, hex: a.hex });
//         }
//       });
//     });

//     // eslint-disable-next-line react-hooks/set-state-in-effect
//     if (map.size > 0) setVariantTypes(Array.from(map.values()));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const updateType = (id: string, patch: Partial<VariantTypeDraft>) =>
//     setVariantTypes((prev) =>
//       prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
//     );

//   // "Add More" -> appends ONE blank, editable input box to THIS type only.
//   // Other variant-type cards are never touched.
//   const addBlankOptionToType = (typeId: string) =>
//     setVariantTypes((prev) =>
//       prev.map((t) =>
//         t.id === typeId
//           ? {
//               ...t,
//               options: [
//                 ...t.options,
//                 {
//                   id: genId(),
//                   value: "",
//                   hex: t.inputType === "color" ? "#000000" : undefined,
//                 },
//               ],
//             }
//           : t,
//       ),
//     );

//   const updateOptionInType = (
//     typeId: string,
//     optId: string,
//     patch: Partial<VariantOptionDraft>,
//   ) =>
//     setVariantTypes((prev) =>
//       prev.map((t) =>
//         t.id === typeId
//           ? {
//               ...t,
//               options: t.options.map((o) =>
//                 o.id === optId ? { ...o, ...patch } : o,
//               ),
//             }
//           : t,
//       ),
//     );

//   const removeOptionFromType = (typeId: string, optId: string) =>
//     setVariantTypes((prev) =>
//       prev.map((t) =>
//         t.id === typeId
//           ? { ...t, options: t.options.filter((o) => o.id !== optId) }
//           : t,
//       ),
//     );

//   const addVariantType = () =>
//     setVariantTypes((prev) => [
//       ...prev,
//       {
//         id: genId(),
//         title: "",
//         inputType: "text",
//         options: [{ id: genId(), value: "" }],
//       },
//     ]);

//   const removeVariantType = (id: string) =>
//     setVariantTypes((prev) =>
//       prev.length > 1 ? prev.filter((t) => t.id !== id) : prev,
//     );

//   // ---------------- auto-generated combinations -> synced "variants" rows ----------------
//   const combinations = useMemo(
//     () => buildCombinations(variantTypes),
//     [variantTypes],
//   );
//   const comboKeysSignature = combinations.map((c) => c.key).join(",");

//   useEffect(() => {
//     if (combinations.length === 0) return;

//     const currentRows: { idx: number; key: string }[] = fields.map(
//       (_field: Record<string, unknown>, idx: number) => ({
//         idx,
//         key: keyOfAttributes(
//           (watch(`variants.${idx}.attributes`) as VariantAttribute[]) || [],
//         ),
//       }),
//     );

//     // remove rows that no longer match any combination (highest index first)
//     currentRows
//       .filter(
//         (r: { idx: number; key: string }) =>
//           !combinations.some((c) => c.key === r.key),
//       )
//       .sort((a: { idx: number }, b: { idx: number }) => b.idx - a.idx)
//       .forEach((r: { idx: number }) => remove(r.idx));

//     // append rows for new combinations
//     const existingKeys = new Set(
//       fields.map((_field: Record<string, unknown>, idx: number) =>
//         keyOfAttributes(
//           (watch(`variants.${idx}.attributes`) as VariantAttribute[]) || [],
//         ),
//       ),
//     );
//     combinations.forEach((c) => {
//       if (!existingKeys.has(c.key)) {
//         append({
//           attributes: c.attributes,
//           stock: 0,
//           price: 0,
//           sku: `SKU-${Date.now()}-${genId()}`,
//           images: [],
//         });
//       }
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [comboKeysSignature]);

//   // ---------------- per-card image upload ----------------
//   const variantFileRef = useRef<HTMLInputElement>(null);
//   const [activeUploadIdx, setActiveUploadIdx] = useState<number | null>(null);
//   const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

//   const triggerImageUpload = (idx: number) => {
//     if (uploadingIdx !== null) return;
//     setActiveUploadIdx(idx);
//     variantFileRef.current?.click();
//   };

//   const handleVariantImageUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const files = e.target.files;
//     if (!files || files.length === 0 || activeUploadIdx === null) return;
//     const idx = activeUploadIdx;
//     try {
//       setUploadingIdx(idx);
//       const paths = await uploadVariantImage(files);
//       if (paths.length > 0) {
//         const current = (watch(`variants.${idx}.images`) as string[]) || [];
//         setValue(`variants.${idx}.images`, [...current, ...paths]);
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
//       setUploadingIdx(null);
//       setActiveUploadIdx(null);
//       if (variantFileRef.current) variantFileRef.current.value = "";
//     }
//   };

//   const removeComboImage = (idx: number, imgIdx: number) => {
//     const current = (watch(`variants.${idx}.images`) as string[]) || [];
//     setValue(
//       `variants.${idx}.images`,
//       current.filter((_, i) => i !== imgIdx),
//     );
//   };

//   // ---------------- sync a single row to backend (edit mode) ----------------
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

//   // const [syncingIdx, setSyncingIdx] = useState<number | null>(null);

//   // const handleSyncRow = (idx: number) => {
//   //   const row = watch(`variants.${idx}`) as VariantRow;
//   //   const targetId = row.variantId || row.id;
//   //   if (!targetId) return;
//   //   setSyncingIdx(idx);
//   //   updateVariantMutation.mutate(
//   //     { id: targetId, payload: row },
//   //     {
//   //       onSuccess: () => {
//   //         toast.success("Variant updated successfully!");
//   //         setSyncingIdx(null);
//   //       },
//   //       onError: () => setSyncingIdx(null),
//   //     },
//   //   );
//   // };

//   return (
//     <SectionWrapper
//       title="Product Variants"
//       description="You can add multiple variant for a single product here. Like Size, Colour, and Weight etc."
//     >
//       <div className="space-y-4">
//         {/* single, global mandatory toggle */}
//         <div className="flex items-center justify-between rounded-lg border border-[#38BDF8] p-4 bg-white">
//           <div>
//             <h4 className="text-lg font-lato font-medium text-black">
//               Make this variant mandatory
//             </h4>
//             <p className="text-sm text-[#A2A2A2]">
//               Toggle this on if you want your customer to select at least one of
//               the variant options
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-xs text-[#A2A2A2] font-medium">
//               [{watch("is_variant_mandatory") ? "Yes" : "No"}]
//             </span>
//             <Toggle
//               checked={!!watch("is_variant_mandatory")}
//               onChange={(val: boolean) => setValue("is_variant_mandatory", val)}
//             />
//           </div>
//         </div>

//         {/* variant type builder cards */}
//         {variantTypes.map((type) => (
//           <VariantTypeCard
//             key={type.id}
//             type={type}
//             canRemove={variantTypes.length > 1}
//             onTitleChange={(title) => updateType(type.id, { title })}
//             onInputTypeChange={(inputType) =>
//               updateType(type.id, { inputType })
//             }
//             onAddBlankOption={() => addBlankOptionToType(type.id)}
//             onUpdateOption={(optId, patch) =>
//               updateOptionInType(type.id, optId, patch)
//             }
//             onRemoveOption={(optId) => removeOptionFromType(type.id, optId)}
//             onRemoveType={() => removeVariantType(type.id)}
//           />
//         ))}

//         <button
//           type="button"
//           onClick={addVariantType}
//           className="flex items-center gap-2 text-sm font-semibold text-black rounded-lg px-3 py-2 cursor-pointer bg-[#F4F4F4] font-lato"
//         >
//           <span className="w-6 h-6 rounded-full border border-black flex items-center justify-center shrink-0">
//             <Plus size={14} className="text-black" />
//           </span>
//           Add a new variant
//         </button>

//         {/* auto-generated combination cards */}
//         {combinations.length > 0 && (
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
//             {fields.map((field: { id: string }, idx: number) => {
//               const row = watch(`variants.${idx}`) as VariantRow;
//               const label = (row?.attributes || [])
//                 .map((a: VariantAttribute) => a.value)
//                 .join(" + ");
//               const images = row?.images || [];
//               const isUploadingThis = uploadingIdx === idx;

//               return (
//                 <div
//                   key={field.id}
//                   className="rounded-lg bg-[#F9F9F9] p-2.5 space-y-2 relative"
//                 >
//                   <p className="text-[11px] font-semibold text-left truncate">
//                     {label}
//                   </p>

//                   {images[0] ? (
//                     <div className="relative group aspect-square rounded border overflow-hidden bg-white">
//                       <Image
//                         fill
//                         unoptimized
//                         src={resolveImgSrc(images[0])}
//                         className="object-cover"
//                         alt="Variant image"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeComboImage(idx, 0)}
//                         className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </div>
//                   ) : (
//                     <div
//                       onClick={() => triggerImageUpload(idx)}
//                       className="aspect-square rounded-sm bg-white flex flex-col items-center justify-center gap-1 cursor-pointer"
//                     >
//                       {isUploadingThis ? (
//                         <Loader2
//                           className="animate-spin text-orange-500"
//                           size={16}
//                         />
//                       ) : (
//                         <>
//                           <IamgeIcon size="32" color="#999" />
//                           <span className="text-[10px] font-semibold text-white bg-[#FF9F1C] rounded px-2 py-0.5 mt-1">
//                             Add Image
//                           </span>
//                         </>
//                       )}
//                     </div>
//                   )}

//                   {/* value uses `|| ""` (not `?? 0`) so a 0/empty field renders
//               truly empty — the placeholder shows, and backspace can
//               clear the box completely instead of getting stuck on "0" */}
//                   <input
//                     type="number"
//                     value={row?.stock || ""}
//                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//                       const raw = e.target.value;
//                       setValue(
//                         `variants.${idx}.stock`,
//                         raw === "" ? 0 : Number(raw),
//                       );
//                     }}
//                     className="w-full bg-white text-[12px] font-lato rounded outline-none py-1 px-2 border border-[#EFEFEF]"
//                     placeholder="Stock Quantity"
//                   />
//                   <input
//                     value={row?.sku || ""}
//                     onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                       setValue(`variants.${idx}.sku`, e.target.value)
//                     }
//                     className="w-full bg-white text-[12px] font-lato rounded outline-none py-1 px-2 border border-[#EFEFEF]"
//                     placeholder="SKU"
//                   />
//                   <input
//                     type="number"
//                     value={row?.price || ""}
//                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//                       const raw = e.target.value;
//                       setValue(
//                         `variants.${idx}.price`,
//                         raw === "" ? 0 : Number(raw),
//                       );
//                     }}
//                     className="w-full bg-white text-[12px] font-lato rounded outline-none py-1 px-2 border border-[#EFEFEF]"
//                     placeholder="Price"
//                   />
//                 </div>
//               );
//             })}
//           </div>
//         )}
//         <input
//           type="file"
//           ref={variantFileRef}
//           className="hidden"
//           onChange={handleVariantImageUpload}
//           accept="image/*"
//           multiple
//         />
//       </div>
//     </SectionWrapper>
//   );
// }

// // ---------------- single variant-type builder card ----------------
// function VariantTypeCard({
//   type,
//   onTitleChange,
//   onAddBlankOption,
//   onUpdateOption,
// }: {
//   type: VariantTypeDraft;
//   canRemove: boolean;
//   onTitleChange: (v: string) => void;
//   onInputTypeChange: (v: "text" | "color") => void;
//   onAddBlankOption: () => void;
//   onUpdateOption: (optId: string, patch: Partial<VariantOptionDraft>) => void;
//   onRemoveOption: (optId: string) => void;
//   onRemoveType: () => void;
// }) {
//   return (
//     <div className="rounded-lg p-5 space-y-4 border border-[#38BDF8] bg-white relative">
//       <div>
//         <label className="text-sm font-medium mb-1 block">Title</label>
//         <div className="flex items-center gap-2">
//           <input
//             value={type.title}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               onTitleChange(e.target.value)
//             }
//             className="w-full bg-[#F9F9F9] py-3.5 px-4 text-sm rounded-lg outline-none"
//             placeholder="Enter  the name of variant (e.g., Colour, Size, Material)"
//           />
//         </div>
//       </div>
//       <div className="grid grid-cols-4 gap-x-2 gap-y-3">
//         {type.options.map((opt) => (
//           <div key={opt.id} className="space-y-1">
//             <label className="text-xs text-[#A2A2A2] block">Attribute</label>
//             <div className="relative flex items-center gap-1.5">
//               <input
//                 value={opt.value}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                   onUpdateOption(opt.id, { value: e.target.value })
//                 }
//                 className="w-full bg-[#F9F9F9] py-3.5 px-4 text-sm rounded-lg outline-none"
//                 placeholder="Variant Option"
//               />
//             </div>
//           </div>
//         ))}

//         <div className="self-end">
//           <PrimaryButton
//             label="Add More"
//             onClick={onAddBlankOption}
//             icon={<PluseIcon />}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useFieldArray, useFormContext } from "react-hook-form";
// import { SectionWrapper } from "./SectionWrapper";
// import { Toggle } from "./Toggle";
// import { useMutation } from "@tanstack/react-query";
// import { updateVariant } from "@/services-api/productService";
// import { X, Trash2, Loader2, Pencil } from "lucide-react";
// import Image from "next/image";
// import { useRef, useState } from "react";
// import { uploadVariantImage } from "@/services-api/productService";
// import { toast } from "react-hot-toast";
// import IamgeIcon from "../../../store-front/svg/svg/IamgeIcon";
// import { VariantAttribute } from "@/app/(store-front)/profile/order/page";
// import { VariantRow } from "./ProductUploadMain";
// import PrimaryButton from "../../common/PrimaryButton";
// import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";

// export default function VariantsSection({
//   isEditMode,
// }: {
//   isEditMode: boolean;
// }) {
//   const { control, watch, setValue } = useFormContext();
//   const { fields, append, remove, update } = useFieldArray({
//     control,
//     name: "variants",
//   });

//   const baseStorageUrl =
//     process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//     "http://localhost:8083";
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

//     const existing = watch(`variants.${editingIndex}`);
//     const payload = {
//       attributes: draftAttributes,
//       stock: Number(vStock) || 0,
//       price: Number(vPrice) || 0,
//       sku: vSku || existing.sku || `SKU-${Date.now()}`,
//       images: draftImages,
//     };

//     const updatedRow = {
//       ...payload,
//       variantId: existing.variantId || existing.id,
//     };

//     if (existing.variantId || existing.id) {
//       const targetId = (existing.variantId || existing.id)!;
//       updateVariantMutation.mutate(
//         { id: targetId, payload: payload as VariantRow },
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

//   const showBuilder = true;

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
//           <Toggle
//             checked={!!watch("is_variant_mandatory")}
//             onChange={(val) => setValue("is_variant_mandatory", val)}
//           />
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
//                   {draftAttributes.map(
//                     (
//                       a: {
//                         label: string;
//                         value: string;
//                         type: string;
//                         hex?: string;
//                       },
//                       i: number,
//                     ) => (
//                       <span
//                         key={i}
//                         className="flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2.5 py-1 text-[11px] font-semibold"
//                       >
//                         {a.type === "color" && a.hex && (
//                           <span
//                             className="w-3 h-3 rounded-full border"
//                             style={{ backgroundColor: a.hex }}
//                           />
//                         )}
//                         {a.label}: {a.value}
//                         <X
//                           size={12}
//                           className="cursor-pointer"
//                           onClick={() => handleRemoveDraftAttribute(i)}
//                         />
//                       </span>
//                     ),
//                   )}
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

// import { useFieldArray, useFormContext } from "react-hook-form";
// import { SectionWrapper } from "./SectionWrapper";
// import { Toggle } from "./Toggle";
// import { useMutation } from "@tanstack/react-query";
// import { updateVariant } from "@/services-api/productService";
// import { X, Trash2, Loader2, Check } from "lucide-react";
// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { uploadVariantImage } from "@/services-api/productService";
// import { toast } from "react-hot-toast";
// import IamgeIcon from "../../../store-front/svg/svg/IamgeIcon";
// import { VariantAttribute } from "@/app/(store-front)/profile/order/page";
// import { VariantRow } from "./ProductUploadMain";
// import PrimaryButton from "../../common/PrimaryButton";
// import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";

// // ---- local (UI-only) builder types — NOT sent to backend directly ----
// type VariantOptionDraft = { id: string; value: string; hex?: string };
// type VariantTypeDraft = {
//   id: string;
//   title: string;
//   inputType: "text" | "color";
//   options: VariantOptionDraft[];
// };

// const genId = () => Math.random().toString(36).slice(2, 10);

// const keyOfAttributes = (attrs: VariantAttribute[] = []) =>
//   attrs
//     .map((a) => `${a.label}:${a.value}`)
//     .sort()
//     .join("|");

// function buildCombinations(types: VariantTypeDraft[]) {
//   const validTypes = types
//     .map((t) => ({ ...t, options: t.options.filter((o) => o.value.trim()) }))
//     .filter((t) => t.title.trim() && t.options.length > 0);
//   if (validTypes.length === 0) return [];

//   return validTypes.reduce<{ key: string; attributes: VariantAttribute[] }[]>(
//     (acc, type) => {
//       const step = type.options.map((opt) => ({
//         label: type.title.trim(),
//         value: opt.value,
//         type: type.inputType,
//         ...(type.inputType === "color" && opt.hex ? { hex: opt.hex } : {}),
//       }));

//       if (acc.length === 0) {
//         return step.map((attr) => ({
//           key: keyOfAttributes([attr]),
//           attributes: [attr],
//         }));
//       }

//       const next: { key: string; attributes: VariantAttribute[] }[] = [];
//       acc.forEach((combo) => {
//         step.forEach((attr) => {
//           const attributes = [...combo.attributes, attr];
//           next.push({ key: keyOfAttributes(attributes), attributes });
//         });
//       });
//       return next;
//     },
//     [],
//   );
// }

// export default function VariantsSection({
//   isEditMode,
// }: {
//   isEditMode: boolean;
// }) {
//   const { control, watch, setValue } = useFormContext();
//   const { fields, append, remove, update } = useFieldArray({
//     control,
//     name: "variants",
//   });

//   const baseStorageUrl =
//     process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//     "http://localhost:8083";

//   const resolveImgSrc = (src: string) => {
//     const cleanImg = (src || "").trim();
//     return cleanImg.startsWith("http")
//       ? cleanImg
//       : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`;
//   };

//   // ---------------- variant TYPE builders (Color, Size, ...) ----------------
//   const [variantTypes, setVariantTypes] = useState<VariantTypeDraft[]>([
//     {
//       id: genId(),
//       title: "",
//       inputType: "text",
//       options: [{ id: genId(), value: "" }],
//     },
//   ]);

//   // seed builders from already-saved variants (edit mode) — runs once
//   useEffect(() => {
//     const existingVariants = (watch("variants") || []) as VariantRow[];
//     if (!existingVariants.length) return;

//     const map = new Map<string, VariantTypeDraft>();
//     existingVariants.forEach((v) => {
//       (v.attributes || []).forEach((a) => {
//         if (!map.has(a.label)) {
//           map.set(a.label, {
//             id: genId(),
//             title: a.label,
//             inputType: a.type === "color" ? "color" : "text",
//             options: [],
//           });
//         }
//         const t = map.get(a.label)!;
//         if (!t.options.some((o) => o.value === a.value)) {
//           t.options.push({ id: genId(), value: a.value, hex: a.hex });
//         }
//       });
//     });

//     if (map.size > 0) setVariantTypes(Array.from(map.values()));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const updateType = (id: string, patch: Partial<VariantTypeDraft>) =>
//     setVariantTypes((prev) =>
//       prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
//     );

//   // "Add More" -> appends ONE blank, editable input box to THIS type only.
//   // Other variant-type cards are never touched.
//   const addBlankOptionToType = (typeId: string) =>
//     setVariantTypes((prev) =>
//       prev.map((t) =>
//         t.id === typeId
//           ? {
//               ...t,
//               options: [
//                 ...t.options,
//                 { id: genId(), value: "", hex: t.inputType === "color" ? "#000000" : undefined },
//               ],
//             }
//           : t,
//       ),
//     );

//   const updateOptionInType = (
//     typeId: string,
//     optId: string,
//     patch: Partial<VariantOptionDraft>,
//   ) =>
//     setVariantTypes((prev) =>
//       prev.map((t) =>
//         t.id === typeId
//           ? {
//               ...t,
//               options: t.options.map((o) =>
//                 o.id === optId ? { ...o, ...patch } : o,
//               ),
//             }
//           : t,
//       ),
//     );

//   const removeOptionFromType = (typeId: string, optId: string) =>
//     setVariantTypes((prev) =>
//       prev.map((t) =>
//         t.id === typeId
//           ? { ...t, options: t.options.filter((o) => o.id !== optId) }
//           : t,
//       ),
//     );

//   const addVariantType = () =>
//     setVariantTypes((prev) => [
//       ...prev,
//       {
//         id: genId(),
//         title: "",
//         inputType: "text",
//         options: [{ id: genId(), value: "" }],
//       },
//     ]);

//   const removeVariantType = (id: string) =>
//     setVariantTypes((prev) =>
//       prev.length > 1 ? prev.filter((t) => t.id !== id) : prev,
//     );

//   // ---------------- auto-generated combinations -> synced "variants" rows ----------------
//   const combinations = useMemo(() => buildCombinations(variantTypes), [variantTypes]);
//   const comboKeysSignature = combinations.map((c) => c.key).join(",");

//   useEffect(() => {
//     if (combinations.length === 0) return;

//     const currentRows = fields.map((f, idx) => ({
//       idx,
//       key: keyOfAttributes((watch(`variants.${idx}.attributes`) as VariantAttribute[]) || []),
//     }));

//     // remove rows that no longer match any combination (highest index first)
//     currentRows
//       .filter((r) => !combinations.some((c) => c.key === r.key))
//       .sort((a, b) => b.idx - a.idx)
//       .forEach((r) => remove(r.idx));

//     // append rows for new combinations
//     const existingKeys = new Set(
//       fields.map((_, idx) =>
//         keyOfAttributes((watch(`variants.${idx}.attributes`) as VariantAttribute[]) || []),
//       ),
//     );
//     combinations.forEach((c) => {
//       if (!existingKeys.has(c.key)) {
//         append({
//           attributes: c.attributes,
//           stock: 0,
//           price: 0,
//           sku: `SKU-${Date.now()}-${genId()}`,
//           images: [],
//         });
//       }
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [comboKeysSignature]);

//   // ---------------- per-card image upload ----------------
//   const variantFileRef = useRef<HTMLInputElement>(null);
//   const [activeUploadIdx, setActiveUploadIdx] = useState<number | null>(null);
//   const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

//   const triggerImageUpload = (idx: number) => {
//     if (uploadingIdx !== null) return;
//     setActiveUploadIdx(idx);
//     variantFileRef.current?.click();
//   };

//   const handleVariantImageUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const files = e.target.files;
//     if (!files || files.length === 0 || activeUploadIdx === null) return;
//     const idx = activeUploadIdx;
//     try {
//       setUploadingIdx(idx);
//       const paths = await uploadVariantImage(files);
//       if (paths.length > 0) {
//         const current = (watch(`variants.${idx}.images`) as string[]) || [];
//         setValue(`variants.${idx}.images`, [...current, ...paths]);
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
//       setUploadingIdx(null);
//       setActiveUploadIdx(null);
//       if (variantFileRef.current) variantFileRef.current.value = "";
//     }
//   };

//   const removeComboImage = (idx: number, imgIdx: number) => {
//     const current = (watch(`variants.${idx}.images`) as string[]) || [];
//     setValue(
//       `variants.${idx}.images`,
//       current.filter((_, i) => i !== imgIdx),
//     );
//   };

//   // ---------------- sync a single row to backend (edit mode) ----------------
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

//   const [syncingIdx, setSyncingIdx] = useState<number | null>(null);

//   const handleSyncRow = (idx: number) => {
//     const row = watch(`variants.${idx}`) as VariantRow;
//     const targetId = row.variantId || row.id;
//     if (!targetId) return;
//     setSyncingIdx(idx);
//     updateVariantMutation.mutate(
//       { id: targetId, payload: row },
//       {
//         onSuccess: () => {
//           toast.success("Variant updated successfully!");
//           setSyncingIdx(null);
//         },
//         onError: () => setSyncingIdx(null),
//       },
//     );
//   };

//   return (
//     <SectionWrapper
//       title="Product Variants"
//       description="You can add multiple variant for a single product here. Like Size, Colour, and Weight etc."
//     >
//       <div className="space-y-4">
//         {/* single, global mandatory toggle */}
//         <div className="flex items-center justify-between rounded-lg border p-4 bg-white">
//           <div>
//             <h4 className="text-base font-medium text-black">
//               Make this variant mandatory
//             </h4>
//             <p className="text-sm text-[#A2A2A2]">
//               Toggle this on if you want your customer to select at least one
//               of the variant options
//             </p>
//           </div>
//           <Toggle
//             checked={!!watch("is_variant_mandatory")}
//             onChange={(val) => setValue("is_variant_mandatory", val)}
//           />
//         </div>

//         {/* variant type builder cards */}
//         {variantTypes.map((type) => (
//           <VariantTypeCard
//             key={type.id}
//             type={type}
//             canRemove={variantTypes.length > 1}
//             onTitleChange={(title) => updateType(type.id, { title })}
//             onInputTypeChange={(inputType) => updateType(type.id, { inputType })}
//             onAddBlankOption={() => addBlankOptionToType(type.id)}
//             onUpdateOption={(optId, patch) => updateOptionInType(type.id, optId, patch)}
//             onRemoveOption={(optId) => removeOptionFromType(type.id, optId)}
//             onRemoveType={() => removeVariantType(type.id)}
//           />
//         ))}

//         <button
//           type="button"
//           onClick={addVariantType}
//           className="flex items-center gap-2 text-sm font-medium text-[#36BAF9] border border-[#36BAF9] rounded-full px-4 py-2 cursor-pointer w-fit"
//         >
//           <PluseIcon /> Add a new variant
//         </button>

//         {/* auto-generated combination cards */}
//         {combinations.length > 0 && (
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
//             {fields.map((field, idx) => {
//               const row = watch(`variants.${idx}`) as VariantRow;
//               const label = (row?.attributes || [])
//                 .map((a) => a.value)
//                 .join(" + ");
//               const images = row?.images || [];
//               const hasServerId = !!(row?.variantId || row?.id);
//               const isUploadingThis = uploadingIdx === idx;
//               const isSyncingThis = syncingIdx === idx;

//               return (
//                 <div
//                   key={field.id}
//                   className="rounded-lg border bg-gray-50 p-2.5 space-y-2 relative"
//                 >
//                   {isEditMode && hasServerId && (
//                     <button
//                       type="button"
//                       onClick={() => handleSyncRow(idx)}
//                       disabled={isSyncingThis}
//                       title="Sync to server"
//                       className="absolute top-1.5 right-1.5 z-10 bg-white rounded-full p-1 shadow text-sky-600 hover:text-sky-800 cursor-pointer disabled:opacity-50"
//                     >
//                       {isSyncingThis ? (
//                         <Loader2 className="animate-spin" size={12} />
//                       ) : (
//                         <Check size={12} />
//                       )}
//                     </button>
//                   )}

//                   <p className="text-[11px] font-semibold text-center truncate">
//                     {label}
//                   </p>

//                   {images[0] ? (
//                     <div className="relative group aspect-square rounded border overflow-hidden bg-white">
//                       <Image
//                         fill
//                         unoptimized
//                         src={resolveImgSrc(images[0])}
//                         className="object-cover"
//                         alt="Variant image"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeComboImage(idx, 0)}
//                         className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </div>
//                   ) : (
//                     <div
//                       onClick={() => triggerImageUpload(idx)}
//                       className="aspect-square rounded border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer"
//                     >
//                       {isUploadingThis ? (
//                         <Loader2 className="animate-spin text-orange-500" size={16} />
//                       ) : (
//                         <>
//                           <IamgeIcon size="18" color="#999" />
//                           <span className="text-[10px] font-semibold text-white bg-orange-500 rounded px-2 py-0.5">
//                             Add Image
//                           </span>
//                         </>
//                       )}
//                     </div>
//                   )}

//                   <input
//                     type="number"
//                     value={row?.stock ?? 0}
//                     onChange={(e) =>
//                       setValue(`variants.${idx}.stock`, Number(e.target.value) || 0)
//                     }
//                     className="w-full bg-white border p-1.5 text-[11px] rounded outline-none"
//                     placeholder="Stock Quantity"
//                   />
//                   <input
//                     value={row?.sku ?? ""}
//                     onChange={(e) => setValue(`variants.${idx}.sku`, e.target.value)}
//                     className="w-full bg-white border p-1.5 text-[11px] rounded outline-none"
//                     placeholder="SKU"
//                   />
//                   <input
//                     type="number"
//                     value={row?.price ?? 0}
//                     onChange={(e) =>
//                       setValue(`variants.${idx}.price`, Number(e.target.value) || 0)
//                     }
//                     className="w-full bg-white border p-1.5 text-[11px] rounded outline-none"
//                     placeholder="Price"
//                   />
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         <input
//           type="file"
//           ref={variantFileRef}
//           className="hidden"
//           onChange={handleVariantImageUpload}
//           accept="image/*"
//           multiple
//         />
//       </div>
//     </SectionWrapper>
//   );
// }

// // ---------------- single variant-type builder card ----------------
// function VariantTypeCard({
//   type,
//   canRemove,
//   onTitleChange,
//   onInputTypeChange,
//   onAddBlankOption,
//   onUpdateOption,
//   onRemoveOption,
//   onRemoveType,
// }: {
//   type: VariantTypeDraft;
//   canRemove: boolean;
//   onTitleChange: (v: string) => void;
//   onInputTypeChange: (v: "text" | "color") => void;
//   onAddBlankOption: () => void;
//   onUpdateOption: (optId: string, patch: Partial<VariantOptionDraft>) => void;
//   onRemoveOption: (optId: string) => void;
//   onRemoveType: () => void;
// }) {
//   return (
//     <div className="rounded-lg p-5 space-y-4 border border-[#38BDF8] bg-white relative">
//       {canRemove && (
//         <button
//           type="button"
//           onClick={onRemoveType}
//           className="absolute top-3 right-3 text-gray-400 hover:text-red-500 cursor-pointer"
//           title="Remove this variant"
//         >
//           <X size={16} />
//         </button>
//       )}

//       <div>
//         <label className="text-sm font-medium mb-1 block">Title</label>
//         <div className="flex items-center gap-2">
//           <input
//             value={type.title}
//             onChange={(e) => onTitleChange(e.target.value)}
//             className="w-full bg-[#F9F9F9] p-2.5 text-xs rounded outline-none"
//             placeholder="Enter  the name of variant (e.g., Colour, Size, Material)"
//           />
//           <select
//             value={type.inputType}
//             onChange={(e) => onInputTypeChange(e.target.value as "text" | "color")}
//             className="bg-[#F9F9F9] p-2.5 text-xs rounded outline-none shrink-0"
//           >
//             <option value="text">Text</option>
//             <option value="color">Color</option>
//           </select>
//         </div>
//       </div>

//       {/* wrapping grid of editable option boxes — each "Add More" click appends
//           exactly ONE new blank box to THIS card only; nothing else is touched */}
//       <div className="grid grid-cols-4 gap-x-2 gap-y-3">
//         {type.options.map((opt) => (
//           <div key={opt.id} className="space-y-1">
//             <label className="text-xs text-[#A2A2A2] block">Attribute</label>
//             <div className="relative flex items-center gap-1.5">
//               <input
//                 value={opt.value}
//                 onChange={(e) =>
//                   onUpdateOption(opt.id, { value: e.target.value })
//                 }
//                 className="w-full bg-[#F9F9F9] p-2.5 text-xs rounded outline-none"
//                 placeholder="Variant Option"
//               />
//               {type.inputType === "color" && (
//                 <input
//                   type="color"
//                   value={opt.hex || "#000000"}
//                   onChange={(e) => onUpdateOption(opt.id, { hex: e.target.value })}
//                   className="w-7 h-7 shrink-0 border rounded cursor-pointer"
//                 />
//               )}
//               {type.options.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => onRemoveOption(opt.id)}
//                   className="absolute -top-2 -right-1 bg-white rounded-full border text-gray-400 hover:text-red-500 cursor-pointer"
//                   title="Remove option"
//                 >
//                   <X size={11} />
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}

//         <div className="self-end">
//           <PrimaryButton label="Add More" onClick={onAddBlankOption} icon={<PluseIcon />} />
//         </div>
//       </div>
//     </div>
//   );
// }

import { useFieldArray, useFormContext } from "react-hook-form";
import { SectionWrapper } from "./SectionWrapper";
import { Toggle } from "./Toggle";
import { useMutation } from "@tanstack/react-query";
import { updateVariant } from "@/services-api/productService";
import { Trash2, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { uploadVariantImage } from "@/services-api/productService";
import { toast } from "react-hot-toast";
import IamgeIcon from "../../../store-front/svg/svg/IamgeIcon";
import { VariantAttribute } from "@/app/(store-front)/profile/order/page";
import { VariantRow } from "./ProductUploadMain";
import PrimaryButton from "../../common/PrimaryButton";
import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";

// ---- local (UI-only) builder types — NOT sent to backend directly ----
type VariantOptionDraft = { id: string; value: string; hex?: string };
type VariantTypeDraft = {
  id: string;
  title: string;
  inputType: "text" | "color";
  options: VariantOptionDraft[];
};

const genId = () => Math.random().toString(36).slice(2, 10);

const keyOfAttributes = (attrs: VariantAttribute[] = []) =>
  attrs
    .map((a) => `${a.label}:${a.value}`)
    .sort()
    .join("|");

function buildCombinations(types: VariantTypeDraft[]) {
  const validTypes = types
    .map((t) => ({ ...t, options: t.options.filter((o) => o.value.trim()) }))
    .filter((t) => t.title.trim() && t.options.length > 0);
  if (validTypes.length === 0) return [];

  return validTypes.reduce<{ key: string; attributes: VariantAttribute[] }[]>(
    (acc, type) => {
      const step = type.options.map((opt) => ({
        label: type.title.trim(),
        value: opt.value,
        type: type.inputType,
        ...(type.inputType === "color" && opt.hex ? { hex: opt.hex } : {}),
      }));

      if (acc.length === 0) {
        return step.map((attr) => ({
          key: keyOfAttributes([attr]),
          attributes: [attr],
        }));
      }

      const next: { key: string; attributes: VariantAttribute[] }[] = [];
      acc.forEach((combo) => {
        step.forEach((attr) => {
          const attributes = [...combo.attributes, attr];
          next.push({ key: keyOfAttributes(attributes), attributes });
        });
      });
      return next;
    },
    [],
  );
}

export default function VariantsSection({
  isEditMode,
}: {
  isEditMode: boolean;
}) {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "variants",
  });

  const baseStorageUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8083";

  const resolveImgSrc = (src: string) => {
    const cleanImg = (src || "").trim();
    return cleanImg.startsWith("http")
      ? cleanImg
      : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`;
  };

  // ---------------- variant TYPE builders (Color, Size, ...) ----------------
  const [variantTypes, setVariantTypes] = useState<VariantTypeDraft[]>([
    {
      id: genId(),
      title: "",
      inputType: "text",
      options: [{ id: genId(), value: "" }],
    },
  ]);

  // guard: seed only once — after API data actually arrives (fixes production race condition)
  const hasSeeded = useRef(false);
  const variantsValue = watch("variants") as VariantRow[];

  // seed builders from already-saved variants (edit mode)
  // runs whenever variantsValue changes, but seeds only once (hasSeeded guard)
  // this fixes the production race condition where the component mounted before
  // the API response arrived, causing the empty-dep [] effect to always bail out
  useEffect(() => {
    if (hasSeeded.current) return;
    const existingVariants = (variantsValue || []) as VariantRow[];
    if (!existingVariants.length) return;

    hasSeeded.current = true;

    const map = new Map<string, VariantTypeDraft>();
    existingVariants.forEach((v) => {
      (v.attributes || []).forEach((a) => {
        if (!map.has(a.label)) {
          map.set(a.label, {
            id: genId(),
            title: a.label,
            inputType: a.type === "color" ? "color" : "text",
            options: [],
          });
        }
        const t = map.get(a.label)!;
        if (!t.options.some((o) => o.value === a.value)) {
          t.options.push({ id: genId(), value: a.value, hex: a.hex });
        }
      });
    });

    if (map.size > 0) setVariantTypes(Array.from(map.values()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantsValue]);

  const updateType = (id: string, patch: Partial<VariantTypeDraft>) =>
    setVariantTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );

  // "Add More" -> appends ONE blank, editable input box to THIS type only.
  // Other variant-type cards are never touched.
  const addBlankOptionToType = (typeId: string) =>
    setVariantTypes((prev) =>
      prev.map((t) =>
        t.id === typeId
          ? {
              ...t,
              options: [
                ...t.options,
                {
                  id: genId(),
                  value: "",
                  hex: t.inputType === "color" ? "#000000" : undefined,
                },
              ],
            }
          : t,
      ),
    );

  const updateOptionInType = (
    typeId: string,
    optId: string,
    patch: Partial<VariantOptionDraft>,
  ) =>
    setVariantTypes((prev) =>
      prev.map((t) =>
        t.id === typeId
          ? {
              ...t,
              options: t.options.map((o) =>
                o.id === optId ? { ...o, ...patch } : o,
              ),
            }
          : t,
      ),
    );

  const removeOptionFromType = (typeId: string, optId: string) =>
    setVariantTypes((prev) =>
      prev.map((t) =>
        t.id === typeId
          ? { ...t, options: t.options.filter((o) => o.id !== optId) }
          : t,
      ),
    );

  const addVariantType = () =>
    setVariantTypes((prev) => [
      ...prev,
      {
        id: genId(),
        title: "",
        inputType: "text",
        options: [{ id: genId(), value: "" }],
      },
    ]);

  const removeVariantType = (id: string) =>
    setVariantTypes((prev) =>
      prev.length > 1 ? prev.filter((t) => t.id !== id) : prev,
    );

  // ---------------- auto-generated combinations -> synced "variants" rows ----------------
  const combinations = useMemo(
    () => buildCombinations(variantTypes),
    [variantTypes],
  );
  const comboKeysSignature = combinations.map((c) => c.key).join(",");

  useEffect(() => {
    if (combinations.length === 0) return;

    const currentRows: { idx: number; key: string }[] = fields.map(
      (_field: Record<string, unknown>, idx: number) => ({
        idx,
        key: keyOfAttributes(
          (watch(`variants.${idx}.attributes`) as VariantAttribute[]) || [],
        ),
      }),
    );

    // remove rows that no longer match any combination (highest index first)
    currentRows
      .filter(
        (r: { idx: number; key: string }) =>
          !combinations.some((c) => c.key === r.key),
      )
      .sort((a: { idx: number }, b: { idx: number }) => b.idx - a.idx)
      .forEach((r: { idx: number }) => remove(r.idx));

    // append rows for new combinations
    const existingKeys = new Set(
      fields.map((_field: Record<string, unknown>, idx: number) =>
        keyOfAttributes(
          (watch(`variants.${idx}.attributes`) as VariantAttribute[]) || [],
        ),
      ),
    );
    combinations.forEach((c) => {
      if (!existingKeys.has(c.key)) {
        append({
          attributes: c.attributes,
          stock: 0,
          price: 0,
          sku: `SKU-${Date.now()}-${genId()}`,
          images: [],
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comboKeysSignature]);

  // ---------------- per-card image upload ----------------
  const variantFileRef = useRef<HTMLInputElement>(null);
  const [activeUploadIdx, setActiveUploadIdx] = useState<number | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const triggerImageUpload = (idx: number) => {
    if (uploadingIdx !== null) return;
    setActiveUploadIdx(idx);
    variantFileRef.current?.click();
  };

  const handleVariantImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0 || activeUploadIdx === null) return;
    const idx = activeUploadIdx;
    try {
      setUploadingIdx(idx);
      const paths = await uploadVariantImage(files);
      if (paths.length > 0) {
        const current = (watch(`variants.${idx}.images`) as string[]) || [];
        setValue(`variants.${idx}.images`, [...current, ...paths]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Variant Image Sync Rejection: ${err.message}`);
      } else {
        toast.error(
          "An unexpected error occurred while uploading the variant image.",
        );
      }
    } finally {
      setUploadingIdx(null);
      setActiveUploadIdx(null);
      if (variantFileRef.current) variantFileRef.current.value = "";
    }
  };

  const removeComboImage = (idx: number, imgIdx: number) => {
    const current = (watch(`variants.${idx}.images`) as string[]) || [];
    setValue(
      `variants.${idx}.images`,
      current.filter((_, i) => i !== imgIdx),
    );
  };

  // ---------------- sync a single row to backend (edit mode) ----------------
  const updateVariantMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VariantRow }) =>
      updateVariant(id, payload),
    onError: (err: unknown) => {
      if (err instanceof Error) {
        toast.error(`Variant Update Rejection: ${err.message}`);
      } else {
        toast.error("An unexpected error occurred while updating the variant.");
      }
    },
  });

  // const [syncingIdx, setSyncingIdx] = useState<number | null>(null);

  // const handleSyncRow = (idx: number) => {
  //   const row = watch(`variants.${idx}`) as VariantRow;
  //   const targetId = row.variantId || row.id;
  //   if (!targetId) return;
  //   setSyncingIdx(idx);
  //   updateVariantMutation.mutate(
  //     { id: targetId, payload: row },
  //     {
  //       onSuccess: () => {
  //         toast.success("Variant updated successfully!");
  //         setSyncingIdx(null);
  //       },
  //       onError: () => setSyncingIdx(null),
  //     },
  //   );
  // };

  return (
    <SectionWrapper
      title="Product Variants"
      description="You can add multiple variant for a single product here. Like Size, Colour, and Weight etc."
    >
      <div className="space-y-4">
        {/* single, global mandatory toggle */}
        <div className="flex items-center justify-between rounded-lg border border-[#38BDF8] p-4 bg-white">
          <div>
            <h4 className="text-lg font-lato font-medium text-black">
              Make this variant mandatory
            </h4>
            <p className="text-sm text-[#A2A2A2]">
              Toggle this on if you want your customer to select at least one of
              the variant options
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A2A2A2] font-medium">
              [{watch("is_variant_mandatory") ? "Yes" : "No"}]
            </span>
            <Toggle
              checked={!!watch("is_variant_mandatory")}
              onChange={(val: boolean) => setValue("is_variant_mandatory", val)}
            />
          </div>
        </div>

        {/* variant type builder cards */}
        {variantTypes.map((type) => (
          <VariantTypeCard
            key={type.id}
            type={type}
            canRemove={variantTypes.length > 1}
            onTitleChange={(title) => updateType(type.id, { title })}
            onInputTypeChange={(inputType) =>
              updateType(type.id, { inputType })
            }
            onAddBlankOption={() => addBlankOptionToType(type.id)}
            onUpdateOption={(optId, patch) =>
              updateOptionInType(type.id, optId, patch)
            }
            onRemoveOption={(optId) => removeOptionFromType(type.id, optId)}
            onRemoveType={() => removeVariantType(type.id)}
          />
        ))}

        <button
          type="button"
          onClick={addVariantType}
          className="flex items-center gap-2 text-sm font-semibold text-black rounded-lg px-3 py-2 cursor-pointer bg-[#F4F4F4] font-lato"
        >
          <span className="w-6 h-6 rounded-full border border-black flex items-center justify-center shrink-0">
            <Plus size={14} className="text-black" />
          </span>
          Add a new variant
        </button>

        {/* auto-generated combination cards */}
        {combinations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {fields.map((field: { id: string }, idx: number) => {
              const row = watch(`variants.${idx}`) as VariantRow;
              const label = (row?.attributes || [])
                .map((a: VariantAttribute) => a.value)
                .join(" + ");
              const images = row?.images || [];
              const isUploadingThis = uploadingIdx === idx;

              return (
                <div
                  key={field.id}
                  className="rounded-lg bg-[#F9F9F9] p-2.5 space-y-2 relative"
                >
                  <p className="text-[11px] font-semibold text-left truncate">
                    {label}
                  </p>

                  {images[0] ? (
                    <div className="relative group aspect-square rounded border overflow-hidden bg-white">
                      <Image
                        fill
                        unoptimized
                        src={resolveImgSrc(images[0])}
                        className="object-cover"
                        alt="Variant image"
                      />
                      <button
                        type="button"
                        onClick={() => removeComboImage(idx, 0)}
                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => triggerImageUpload(idx)}
                      className="aspect-square rounded-sm bg-white flex flex-col items-center justify-center gap-1 cursor-pointer"
                    >
                      {isUploadingThis ? (
                        <Loader2
                          className="animate-spin text-orange-500"
                          size={16}
                        />
                      ) : (
                        <>
                          <IamgeIcon size="32" color="#999" />
                          <span className="text-[10px] font-semibold text-white bg-[#FF9F1C] rounded px-2 py-0.5 mt-1">
                            Add Image
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* value uses `|| ""` (not `?? 0`) so a 0/empty field renders
              truly empty — the placeholder shows, and backspace can
              clear the box completely instead of getting stuck on "0" */}
                  <input
                    type="number"
                    value={row?.stock || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const raw = e.target.value;
                      setValue(
                        `variants.${idx}.stock`,
                        raw === "" ? 0 : Number(raw),
                      );
                    }}
                    className="w-full bg-white text-[12px] font-lato rounded outline-none py-1 px-2 border border-[#EFEFEF]"
                    placeholder="Stock Quantity"
                  />
                  <input
                    value={row?.sku || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setValue(`variants.${idx}.sku`, e.target.value)
                    }
                    className="w-full bg-white text-[12px] font-lato rounded outline-none py-1 px-2 border border-[#EFEFEF]"
                    placeholder="SKU"
                  />
                  <input
                    type="number"
                    value={row?.price || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const raw = e.target.value;
                      setValue(
                        `variants.${idx}.price`,
                        raw === "" ? 0 : Number(raw),
                      );
                    }}
                    className="w-full bg-white text-[12px] font-lato rounded outline-none py-1 px-2 border border-[#EFEFEF]"
                    placeholder="Price"
                  />
                </div>
              );
            })}
          </div>
        )}
        <input
          type="file"
          ref={variantFileRef}
          className="hidden"
          onChange={handleVariantImageUpload}
          accept="image/*"
          multiple
        />
      </div>
    </SectionWrapper>
  );
}

// ---------------- single variant-type builder card ----------------
function VariantTypeCard({
  type,
  onTitleChange,
  onAddBlankOption,
  onUpdateOption,
}: {
  type: VariantTypeDraft;
  canRemove: boolean;
  onTitleChange: (v: string) => void;
  onInputTypeChange: (v: "text" | "color") => void;
  onAddBlankOption: () => void;
  onUpdateOption: (optId: string, patch: Partial<VariantOptionDraft>) => void;
  onRemoveOption: (optId: string) => void;
  onRemoveType: () => void;
}) {
  return (
    <div className="rounded-lg p-5 space-y-4 border border-[#38BDF8] bg-white relative">
      <div>
        <label className="text-sm font-medium mb-1 block">Title</label>
        <div className="flex items-center gap-2">
          <input
            value={type.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onTitleChange(e.target.value)
            }
            className="w-full bg-[#F9F9F9] py-3.5 px-4 text-sm rounded-lg outline-none"
            placeholder="Enter  the name of variant (e.g., Colour, Size, Material)"
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-x-2 gap-y-3">
        {type.options.map((opt) => (
          <div key={opt.id} className="space-y-1">
            <label className="text-xs text-[#A2A2A2] block">Attribute</label>
            <div className="relative flex items-center gap-1.5">
              <input
                value={opt.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdateOption(opt.id, { value: e.target.value })
                }
                className="w-full bg-[#F9F9F9] py-3.5 px-4 text-sm rounded-lg outline-none"
                placeholder="Variant Option"
              />
            </div>
          </div>
        ))}

        <div className="self-end">
          <PrimaryButton
            label="Add More"
            onClick={onAddBlankOption}
            icon={<PluseIcon />}
          />
        </div>
      </div>
    </div>
  );
}
