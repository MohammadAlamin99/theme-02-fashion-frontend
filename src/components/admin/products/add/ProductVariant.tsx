// import { Label } from "./Label";
// import { SectionWrapper } from "./SectionWrapper";
// import { Toggle } from "./Toggle";
// import { Input } from "./Input";
// import { Plus } from "lucide-react";
// import IamgeIcon from "@/components/store-front/svg/svg/IamgeIcon";
// import PrimaryButton from "../../common/PrimaryButton";
// import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
// import SeconderyButton from "../../common/SeconderyButton";
// import CloseIcon from "@/components/store-front/svg/svg/CloseIcon";

// export default function ProductVariant() {
//   return (
//     <SectionWrapper
//       title="Product Variants"
//       description="You can add multiple variant for a single product here. Like Size, Color, and Weight etc."
//     >
//       <div className="bg-white border border-[#38BDF8] rounded-[16px] px-4 py-6 mb-5">
//         <div className="flex justify-between items-start mb-6">
//           <div>
//             <h4 className="text-xl font-medium text-black">
//               Make this variant mandatory
//             </h4>
//             <p className="text-[12px] text-[#A2A2A2]">
//               Toggle this on if you want your customer to select at least one of
//               the variant options
//             </p>
//           </div>
//           <Toggle checked={false} sideLabel="[No]" />
//         </div>
//         <div className="mb-4">
//           <Label>Title</Label>
//           <Input placeholder="Enter the name of variant (e.g., Colour, Size, Material)" />
//         </div>
//         <div className="flex gap-2 items-end">
//           <div className="w-[67px] h-[67px] bg-[#F9F9F9] rounded-[8px] flex items-center justify-center shrink-0 mb-1">
//             <IamgeIcon color="#A2A2A2" size="60" />
//           </div>
//           <div className="flex-1">
//             <Label>Attribute</Label>
//             <Input placeholder="Enter variant Option (e.g., Red, Large, Cotton)" />
//           </div>
//           <div className="flex-1">
//             <Label>Extra Price</Label>
//             <Input placeholder="Enter Extra price for this option" />
//           </div>
//           <button className=" cursor-pointer bg-[#FEF5F5] p-2.5 text-red-400 hover:bg-red-50 rounded-[8px] transition-colors">
//             <CloseIcon />
//           </button>
//         </div>
//         <div className="mt-4">
//           <PrimaryButton label="Add More Option" icon={<PluseIcon />} />
//         </div>
//       </div>
//       <SeconderyButton
//         label="Add a new variant"
//         icon={
//           <Plus
//             size={21}
//             strokeWidth={1.5}
//             color="black"
//             className="border border-w-[1.5px] rounded-full"
//           />
//         }
//       />
//     </SectionWrapper>
//   );
// }

"use client";

import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Trash2 } from "lucide-react";
import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";

export default function ProductVariant() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const isMandatory = watch("is_variant_mandatory");

  const [attr, setAttr] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");

  const handlePushVariantOption = () => {
    if (!attr || !price) return;
    append({
      attribute: attr,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      sku: sku || `SKU-${Date.now()}`
    });
    setAttr(""); setPrice(""); setStock(""); setSku("");
  };

  return (
    <div className="bg-white rounded-lg px-4 py-5 mb-4 border border-gray-100">
      <h3 className="text-[#003032] font-medium text-xl mb-1">Product Variants</h3>
      <p className="text-xs text-[#A2A2A2] mb-5 leading-tight">Add dynamic configurations (Color, Size) mapped to Prisma rows.</p>

      <div className="bg-white border border-[#38BDF8] rounded-2xl px-4 py-6 mb-5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="text-xl font-medium text-black">Make this variant mandatory</h4>
            <p className="text-[12px] text-[#A2A2A2]">Toggle this on if customers must pick a configuration option</p>
          </div>
          <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => setValue("is_variant_mandatory", !isMandatory)}>
            <span className="text-[11px] font-bold text-gray-500">{isMandatory ? "[Yes]" : "[No]"}</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${isMandatory ? 'bg-[#1DA1F2]' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-xs ${isMandatory ? 'left-5' : 'left-0.5'}`} />
            </div>
          </div>
        </div>

        {fields.map((field, idx) => (
          <div key={field.id} className="flex justify-between items-center bg-gray-50 border p-3 rounded-lg text-xs mb-2">
            <span><strong>{watch(`variants.${idx}.attribute`)}</strong> | ৳{watch(`variants.${idx}.price`)} | Stock: {watch(`variants.${idx}.stock`)}</span>
            <button type="button" onClick={() => remove(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <input value={attr} onChange={(e) => setAttr(e.target.value)} className="w-full bg-[#F9F9F9] rounded-lg px-4 py-3 text-sm outline-none" placeholder="Option Name (e.g. Red, Large)" />
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-[#F9F9F9] rounded-lg px-4 py-3 text-sm outline-none" placeholder="Price Override" />
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-[#F9F9F9] rounded-lg px-4 py-3 text-sm outline-none" placeholder="Stock Level" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="w-full bg-[#F9F9F9] rounded-lg px-4 py-3 text-sm outline-none" placeholder="Variant SKU" />
        </div>

        <div className="mt-4">
          <button type="button" onClick={handlePushVariantOption} className="bg-sky-500 text-white rounded-[6px] px-4 py-2 text-xs font-semibold hover:opacity-90 flex items-center gap-1">
            <PluseIcon /> Commit Variant Option
          </button>
        </div>
      </div>
    </div>
  );
}