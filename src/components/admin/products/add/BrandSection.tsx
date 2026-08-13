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
      title="Brand Metadata"
      description="Connect product rows to system brand indexes."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Select Brand</Label>
          <div className="relative w-full">
            <select
              value={activeBrandId || ""}
              onChange={(e) => setValue("brand_id", e.target.value)}
              className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-800 px-4 py-3 text-xs rounded-lg outline-none appearance-none cursor-pointer"
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
        <div>
          <Label>Model Variant Reference String</Label>
          <Input placeholder="Ex: RT53 Refrigerator" />
        </div>
      </div>
    </SectionWrapper>
  );
}
