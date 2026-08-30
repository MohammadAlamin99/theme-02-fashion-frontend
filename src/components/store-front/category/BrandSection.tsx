import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { HiMiniMinusSmall } from "react-icons/hi2";
import { Brand } from "@/services-api/brandService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

interface Props {
  brands: Brand[];
  activeBrandId: string;
  onUpdate: (key: string, val: string) => void;
}

export default function BrandSection({
  brands,
  activeBrandId,
  onUpdate,
}: Props) {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-black md:text-[24px] text-xl font-medium">
          {t.brands}
        </h4>
        <HiMiniMinusSmall className="text-2xl text-gray-400" />
      </div>
      <ul className="flex flex-col gap-4">
        {/* All Option */}
        <li
          onClick={() => onUpdate("brand_slug", "")}
          className="flex justify-between items-center cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <IoCheckmarkCircleSharp
              className={
                !activeBrandId
                  ? "text-[#7CB640] text-[24px]"
                  : "text-[#D9D9D9] text-[24px]"
              }
            />
            <span
              className={`text-[20px] font-normal transition-colors ${
                !activeBrandId
                  ? "text-[#7CB640]"
                  : "text-black group-hover:text-[#7CB640]"
              }`}
            >
              All
            </span>
          </div>
        </li>
        {brands.map((brand) => {
          const isSelected =
            activeBrandId === brand.id || activeBrandId === brand.slug;
          return (
            <li
              key={brand.id}
              onClick={() => onUpdate("brand_slug", brand.slug || brand.id)}
              className="flex justify-between items-center cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <IoCheckmarkCircleSharp
                  className={
                    isSelected
                      ? "text-[#7CB640] text-[24px]"
                      : "text-[#D9D9D9] text-[24px]"
                  }
                />
                <span
                  className={`text-[20px] font-normal transition-colors ${
                    isSelected
                      ? "text-[#7CB640]"
                      : "text-black group-hover:text-[#7CB640]"
                  }`}
                >
                  {brand.name}
                </span>
              </div>
              <span
                className={`text-[20px] font-normal ${isSelected ? "text-[#7CB640]" : "text-black"}`}
              >
                {brand.product_count ?? brand._count?.products ?? 0}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
