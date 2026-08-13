import { useFieldArray, useFormContext } from "react-hook-form";
import { SectionWrapper } from "./SectionWrapper";
import { Toggle } from "./Toggle";
import { useMutation } from "@tanstack/react-query";
import { updateVariant } from "@/services-api/productService";
import { X, Trash2, Loader2, Pencil } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { uploadVariantImage } from "@/services-api/productService";
import { toast } from "react-hot-toast";
import IamgeIcon from "../../../store-front/svg/svg/IamgeIcon";
import { VariantAttribute } from "@/app/(store-front)/profile/order/page";
import { VariantRow } from "./ProductUploadMain";
import PrimaryButton from "../../common/PrimaryButton";
import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";

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
    "http://localhost:8082";
  const variantFileRef = useRef<HTMLInputElement>(null);

  // draft attribute builder (Color: Black / type: color) etc.
  const [attrLabel, setAttrLabel] = useState("");
  const [attrValue, setAttrValue] = useState("");
  const [attrType, setAttrType] = useState<"text" | "color">("text");
  const [attrHex, setAttrHex] = useState("#000000");
  const [draftAttributes, setDraftAttributes] = useState<VariantAttribute[]>(
    [],
  );

  // draft variant core fields
  const [vStock, setVStock] = useState("");
  const [vPrice, setVPrice] = useState("");
  const [vSku, setVSku] = useState("");
  const [draftImages, setDraftImages] = useState<string[]>([]);
  const [uploadingVariantImg, setUploadingVariantImg] = useState(false);

  // 👇 NEW: which row (if any) is currently being edited
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const resolveImgSrc = (src: string) => {
    const cleanImg = (src || "").trim();
    return cleanImg.startsWith("http")
      ? cleanImg
      : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`;
  };

  const resetDraft = () => {
    setDraftAttributes([]);
    setVStock("");
    setVPrice("");
    setVSku("");
    setDraftImages([]);
    setEditingIndex(null);
  };

  const handlePushAttribute = () => {
    if (!attrLabel || !attrValue) return;
    setDraftAttributes((prev) => [
      ...prev,
      {
        label: attrLabel,
        value: attrValue,
        type: attrType,
        ...(attrType === "color" ? { hex: attrHex } : {}),
      },
    ]);
    setAttrLabel("");
    setAttrValue("");
    setAttrType("text");
    setAttrHex("#000000");
  };

  const handleRemoveDraftAttribute = (idx: number) => {
    setDraftAttributes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVariantImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingVariantImg(true);
      const paths = await uploadVariantImage(files);
      if (paths.length > 0) {
        setDraftImages((prev) => [...prev, ...paths]);
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
      setUploadingVariantImg(false);
      if (variantFileRef.current) variantFileRef.current.value = "";
    }
  };

  // 👇 NEW: mutation to PATCH an existing variant on the server
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

  const handlePushOption = () => {
    if (draftAttributes.length === 0 || !vPrice) return;
    append({
      attributes: draftAttributes,
      stock: Number(vStock) || 0,
      price: Number(vPrice) || 0,
      sku: vSku || `SKU-${Date.now()}`,
      images: draftImages,
    });
    resetDraft();
  };

  // 👇 NEW: load an existing row into the draft fields for editing
  const handleEditClick = (idx: number) => {
    const variant = watch(`variants.${idx}`) as VariantRow;
    setDraftAttributes(variant.attributes || []);
    setVStock(String(variant.stock ?? ""));
    setVPrice(String(variant.price ?? ""));
    setVSku(variant.sku || "");
    setDraftImages(variant.images || []);
    setEditingIndex(idx);
  };

  // 👇 NEW: commit the edit — PATCH to backend if it has a variantId, else just update local row
  const handleUpdateOption = () => {
    if (editingIndex === null) return;
    if (draftAttributes.length === 0 || !vPrice) return;

    const existing = watch(`variants.${editingIndex}`);
    const payload = {
      attributes: draftAttributes,
      stock: Number(vStock) || 0,
      price: Number(vPrice) || 0,
      sku: vSku || existing.sku || `SKU-${Date.now()}`,
      images: draftImages,
    };

    const updatedRow = {
      ...payload,
      variantId: existing.variantId || existing.id,
    };

    if (existing.variantId || existing.id) {
      const targetId = (existing.variantId || existing.id)!;
      updateVariantMutation.mutate(
        { id: targetId, payload: payload as VariantRow },
        {
          onSuccess: () => {
            update(editingIndex, updatedRow);
            toast.success("Variant updated successfully!");
            resetDraft();
          },
          onError: () => {
            // fallback local update if server patch handles full form submit
            update(editingIndex, updatedRow);
            resetDraft();
          },
        },
      );
    } else {
      update(editingIndex, updatedRow);
      toast.success("Variant updated!");
      resetDraft();
    }
  };

  const showBuilder = !isEditMode || editingIndex !== null;

  return (
    <SectionWrapper
      title="Product Variants"
      description={
        isEditMode
          ? "Existing variants can be edited individually and synced to the server."
          : "Combine attributes (e.g. Color + Size) to build a variant row."
      }
    >
      <div className="rounded-lg p-5 space-y-4 border border-[#38BDF8] bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-black">
              Make this variant mandatory
            </h4>
            <p className="text-sm text-[#A2A2A2]">
              Forces selection rules onto storefront client checkout lines
            </p>
          </div>
          <Toggle
            checked={!!watch("is_variant_mandatory")}
            onChange={(val) => setValue("is_variant_mandatory", val)}
          />
        </div>

        {/* Committed variant rows */}
        {fields.map((field, idx) => {
          const variant = watch(`variants.${idx}`) as VariantRow;
          const isBeingEdited = editingIndex === idx;
          return (
            <div
              key={field.id}
              className={`flex justify-between items-center gap-3 text-xs p-2.5 rounded border ${
                isBeingEdited ? "bg-sky-50 border-sky-300" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                {Array.isArray(variant?.images) && variant.images[0] && (
                  <Image
                    width={36}
                    height={36}
                    src={resolveImgSrc(variant.images[0])}
                    className="w-9 h-9 rounded object-cover border bg-white"
                    alt="Variant image"
                    unoptimized
                  />
                )}
                <span>
                  <strong>
                    {(variant?.attributes || [])
                      .map((a) => `${a.label}: ${a.value}`)
                      .join(" / ")}
                  </strong>{" "}
                  | ৳{variant?.price} | Stock: {variant?.stock} | SKU:{" "}
                  {variant?.sku}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEditClick(idx)}
                  disabled={updateVariantMutation.isPending}
                  className="text-sky-600 hover:text-sky-800 cursor-pointer disabled:opacity-50"
                  title="Edit variant"
                >
                  <Pencil size={14} />
                </button>
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                    title="Remove variant"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {showBuilder && (
          <>
            {editingIndex !== null && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded">
                <span>Editing variant row #{editingIndex + 1}</span>
                <button
                  type="button"
                  onClick={resetDraft}
                  className="font-semibold underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Attribute builder (Color, Size, etc.) */}
            <div className="bg-white rounded-lg space-y-3">
              <label className="text-sm font-medium block">
                Attributes (e.g. Color, Size)
              </label>
              <div
                className={`grid ${attrType === "color" ? "grid-cols-5" : "grid-cols-4"} gap-2`}
              >
                <input
                  value={attrLabel}
                  onChange={(e) => setAttrLabel(e.target.value)}
                  className="w-full bg-[#F9F9F9] p-2 text-xs rounded outline-none col-span-1"
                  placeholder="Label (Color)"
                />
                <input
                  value={attrValue}
                  onChange={(e) => setAttrValue(e.target.value)}
                  className="w-full bg-[#F9F9F9] p-2 text-xs rounded outline-none col-span-1"
                  placeholder="Value (Black)"
                />
                <select
                  value={attrType}
                  onChange={(e) =>
                    setAttrType(e.target.value as "text" | "color")
                  }
                  className="w-full bg-[#F9F9F9] p-2 text-xs rounded outline-none col-span-1"
                >
                  <option value="text">Text</option>
                  <option value="color">Color</option>
                </select>
                {attrType === "color" && (
                  <input
                    type="color"
                    value={attrHex}
                    onChange={(e) => setAttrHex(e.target.value)}
                    className="w-full h-full border rounded cursor-pointer col-span-1"
                  />
                )}

                <PrimaryButton
                  label="Add more"
                  onClick={handlePushAttribute}
                  icon={<PluseIcon />}
                />
              </div>
              {draftAttributes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {draftAttributes.map(
                    (
                      a: {
                        label: string;
                        value: string;
                        type: string;
                        hex?: string;
                      },
                      i: number,
                    ) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      >
                        {a.type === "color" && a.hex && (
                          <span
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: a.hex }}
                          />
                        )}
                        {a.label}: {a.value}
                        <X
                          size={12}
                          className="cursor-pointer"
                          onClick={() => handleRemoveDraftAttribute(i)}
                        />
                      </span>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Core variant fields + image upload */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Price</label>
                <input
                  type="number"
                  value={vPrice}
                  onChange={(e) => setVPrice(e.target.value)}
                  className="w-full bg-[#F9F9F9] py-4 px-2 text-xs rounded outline-none"
                  placeholder="72000"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Stock Level
                </label>
                <input
                  type="number"
                  value={vStock}
                  onChange={(e) => setVStock(e.target.value)}
                  className="w-full bg-[#F9F9F9] py-4 px-2 text-xs rounded outline-none"
                  placeholder="30"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">
                  Custom Variant SKU
                </label>
                <input
                  value={vSku}
                  onChange={(e) => setVSku(e.target.value)}
                  className="w-full bg-g[#F9F9F9] py-4 px-2 text-xs rounded outline-none"
                  placeholder="POLO-BLK-M"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Variant Image
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {draftImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative group w-14 h-14 rounded border overflow-hidden bg-white"
                  >
                    <Image
                      width={56}
                      height={56}
                      unoptimized
                      src={resolveImgSrc(src)}
                      className="w-full h-full object-cover"
                      alt="Variant image"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraftImages((prev) =>
                          prev.filter((_, idx2) => idx2 !== i),
                        )
                      }
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() =>
                    !uploadingVariantImg && variantFileRef.current?.click()
                  }
                  className="w-14 h-14 rounded border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer relative"
                >
                  {uploadingVariantImg ? (
                    <Loader2
                      className="animate-spin text-orange-500"
                      size={16}
                    />
                  ) : (
                    <IamgeIcon size="20" color="#999" />
                  )}
                </div>
                <input
                  type="file"
                  ref={variantFileRef}
                  className="hidden"
                  onChange={handleVariantImageUpload}
                  accept="image/*"
                  multiple
                  disabled={uploadingVariantImg}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={
                editingIndex !== null ? handleUpdateOption : handlePushOption
              }
              disabled={updateVariantMutation.isPending}
              className="flex items-center gap-1 bg-[#36BAF9] text-white rounded text-sm font-medium  px-3 py-2 cursor-pointer"
            >
              {updateVariantMutation.isPending ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <PluseIcon />
              )}{" "}
              {editingIndex !== null ? "Update Variant" : "Commit Variant"}
            </button>
          </>
        )}
      </div>
    </SectionWrapper>
  );
}
