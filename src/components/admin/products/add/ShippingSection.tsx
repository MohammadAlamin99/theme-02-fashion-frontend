// import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
// import { SectionWrapper } from "./SectionWrapper";
// import PrimaryButton from "../../common/PrimaryButton";
// import { Trash2 } from "lucide-react";
// import { useFieldArray, useFormContext } from "react-hook-form";

// export default function ShippingSection({ isEditMode }: { isEditMode: boolean }) {
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
import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
import { SectionWrapper } from "./SectionWrapper";
import { CirclePlus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
        checked ? "bg-[#3B82F6]" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function ShippingSection({
  isEditMode,
}: {
  isEditMode: boolean;
}) {
  const { control, watch, setValue, register } = useFormContext();
  const shippingMode = watch("shippingMode") as "DEFAULT" | "CUSTOM" | "FREE";

  const { fields, append, remove } = useFieldArray({
    control,
    name: "customShippingRows",
  });

  const applyDefault = shippingMode === "DEFAULT";
  const isFree = shippingMode === "FREE";

  const handleApplyDefaultToggle = (val: boolean) => {
    setValue("shippingMode", val ? "DEFAULT" : "CUSTOM");
  };

  const handleFreeToggle = (val: boolean) => {
    setValue("shippingMode", val ? "FREE" : "CUSTOM");
  };

  return (
    <SectionWrapper title="Shipping" description="">
      <div className="bg-white rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Delivery Charge
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            You can add specific delivery charge for this product or use the
            default charges
          </p>
        </div>

        {/* Apply default delivery charges — no manual value, just toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-800">
            Apply default delivery charges
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              [{applyDefault ? "Applied" : "Not Applied"}]
            </span>
            <ToggleSwitch
              checked={applyDefault}
              onChange={handleApplyDefaultToggle}
            />
          </div>
        </div>

        {/* Free delivery charge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-800">Free delivery charge</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              [{isFree ? "Applied" : "Not Applied"}]
            </span>
            <ToggleSwitch checked={isFree} onChange={handleFreeToggle} />
          </div>
        </div>

        {isFree && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2.5 rounded-[8px]">
            This product will ship free of charge to all zones (৳0).
          </div>
        )}

        {/* Specific delivery charge — free text zone, unlimited add */}
        {!isFree && (
          <div>
            <p className="text-sm text-gray-800 mb-3">
              Specific Delivery Charge
            </p>
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input
                    {...register(`customShippingRows.${idx}.zone`)}
                    placeholder="Zone (e.g. Dhaka, Chittagong, Sylhet)"
                    className="flex-1 bg-[#F9F9F9] px-3 py-3 text-xs rounded-[8px] outline-none"
                  />
                  <input
                    type="number"
                    {...register(`customShippingRows.${idx}.charge`)}
                    placeholder="Charge (৳)"
                    className="w-32 bg-[#F9F9F9] px-3 py-3 text-xs rounded-[8px] outline-none"
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
            </div>

            <button
              type="button"
              onClick={() => append({ zone: "", charge: "" })}
              className="mt-3 flex items-center gap-2 border border-gray-300 rounded-[8px] px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <CirclePlus size={24} />
              Add More
            </button>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
