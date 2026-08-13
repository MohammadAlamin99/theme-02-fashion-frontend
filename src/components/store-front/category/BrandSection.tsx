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
        {brands.map((brand) => (
          <li
            key={brand.id}
            onClick={() => onUpdate("brand_id", brand.id)}
            className="flex justify-between items-center cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <IoCheckmarkCircleSharp
                className={
                  activeBrandId === brand.id
                    ? "text-[#FF7050] text-[24px]"
                    : "text-[#D9D9D9] text-[24px]"
                }
              />
              <span
                className={`text-[20px] font-normal transition-colors ${
                  activeBrandId === brand.id
                    ? "text-[#FF7050]"
                    : "text-black group-hover:text-[#FF7050]"
                }`}
              >
                {brand.name}
              </span>
            </div>
            <span
              className={`text-[20px] font-normal ${activeBrandId === brand.id ? "text-[#FF7050]" : "text-black"}`}
            >
              {brand._count?.products || 0}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
