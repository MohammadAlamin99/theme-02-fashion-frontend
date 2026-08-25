import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { SectionWrapper } from "./SectionWrapper";
import { Label } from "./Label";
import { ChevronDown } from "lucide-react";
import { apiFetch } from "@/utils/api";
import { Input } from "./Input";

export default function BrandSection() {
  const { setValue, watch } = useFormContext();
  const activeBrandId = watch("brand_id");

  const { data: brandResponse } = useQuery({
    queryKey: ["brands-list-select"],
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
    <SectionWrapper
      title="Brand"
      description="Add detailed brand and model information here."
    >
      <div className="grid grid-cols-1">
        <div>
          <Label>Select Brand</Label>
          <div className="relative w-full">
            <select
              value={activeBrandId || ""}
              onChange={(e) => setValue("brand_id", e.target.value)}
              className="w-full bg-[#F9F9F9] px-3 py-4 text-sm font-lato rounded-lg outline-none appearance-none cursor-pointer"
            >
              <option value="">Select Brand Mapping</option>
              {brandList.map((brand: { id: string; name: string }) => (
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
      </div>
    </SectionWrapper>
  );
}
