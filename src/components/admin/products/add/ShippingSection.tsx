import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
import { SectionWrapper } from "./SectionWrapper";
import PrimaryButton from "../../common/PrimaryButton";
import { Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function ShippingSection({ isEditMode }: { isEditMode: boolean }) {
  const { control, watch, setValue, register } = useFormContext();
  const shippingMode = watch("shippingMode") as "DEFAULT" | "CUSTOM" | "FREE";

  const { fields, append, remove } = useFieldArray({
    control,
    name: "customShippingRows",
  });

  const modes: { value: "DEFAULT" | "CUSTOM" | "FREE"; label: string }[] = [
    { value: "DEFAULT", label: "Default" },
    { value: "CUSTOM", label: "Custom" },
    { value: "FREE", label: "Free" },
  ];

  return (
    <SectionWrapper
      title="Shipping Configuration"
      description="Choose how delivery charges apply to this product."
    >
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setValue("shippingMode", m.value)}
              className={`px-4 py-2 rounded-[8px] text-xs font-semibold border transition-colors cursor-pointer ${
                shippingMode === m.value
                  ? "bg-[#FF9F1C] text-white border-[#FF9F1C]"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {shippingMode === "DEFAULT" && (
          <div className="bg-gray-50 border border-gray-200 text-gray-600 text-xs px-3 py-2.5 rounded-[8px]">
            This product will use the system&apos;s global default delivery
            rate.
          </div>
        )}

        {shippingMode === "FREE" && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2.5 rounded-[8px]">
            This product will ship free of charge to all zones (৳0).
          </div>
        )}

        {shippingMode === "CUSTOM" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Add as many delivery zones as needed with their own charge.
            </p>
            {fields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input
                  {...register(`customShippingRows.${idx}.zone`)}
                  className="flex-1 bg-[#F9F9F9] px-2.5 py-3 text-xs rounded outline-none"
                  placeholder="Zone (e.g. Dhaka, Chittagong, Sylhet)"
                />
                <input
                  type="number"
                  {...register(`customShippingRows.${idx}.charge`)}
                  className="w-32 bg-[#F9F9F9] px-2.5 py-3 text-xs rounded outline-none"
                  placeholder="Charge (৳)"
                />
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-red-500 hover:text-red-700 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <PrimaryButton
              label="Add Zone"
              onClick={() => append({ zone: "", charge: "" })}
              icon={<PluseIcon />}
            />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
