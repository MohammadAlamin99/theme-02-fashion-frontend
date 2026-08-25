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

  // seed builders from already-saved variants (edit mode) — runs once
  useEffect(() => {
    const existingVariants = (watch("variants") || []) as VariantRow[];
    if (!existingVariants.length) return;

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

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (map.size > 0) setVariantTypes(Array.from(map.values()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
