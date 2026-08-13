import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { apiFetch } from "@/utils/api";
import { ChevronDown } from "lucide-react";
import { Label } from "./Label";

export default function SidebarBrandSection() {
  const { setValue, watch } = useFormContext();
  const activeBrandId = watch("brand_id");

  const { data: brandResponse, isLoading } = useQuery({
    queryKey: ["brands-list-select-sidebar"],
    queryFn: async () => {
      const res = await apiFetch("/brand");
      return res.json();
    },
  });

  const brandList = (() => {
    if (Array.isArray(brandResponse)) return brandResponse;
    if (brandResponse && Array.isArray(brandResponse.data))
      return brandResponse.data;
    if (brandResponse && Array.isArray(brandResponse.data?.data))
      return brandResponse.data.data;
    return [];
  })();

  return (
    <div className="bg-white rounded-[8px] p-5 border border-gray-100 shadow-xs">
      <h3 className="text-black font-medium text-base mb-4">Brand Selection</h3>
      <Label>Select Brand</Label>
      <div className="relative w-full">
        <select
          value={activeBrandId || ""}
          onChange={(e) =>
            setValue("brand_id", e.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 px-4 py-3 text-xs rounded-[8px] outline-none appearance-none cursor-pointer focus:bg-white"
        >
          <option value="">
            {isLoading ? "Synchronizing brands..." : "Select Brand Mapping"}
          </option>
          {brandList.map((brand: any) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
