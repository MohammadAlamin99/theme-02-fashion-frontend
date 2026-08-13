import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";
import { HiMiniMinusSmall } from "react-icons/hi2";

interface Props {
  value: number;
  activeMaxPrice: string;
  setValue: (val: number) => void;
  onUpdate: (key: string, val: string) => void;
}

export default function PriceSection({
  value,
  activeMaxPrice,
  setValue,
  onUpdate,
}: Props) {
  const { language } = useLanguage();
  const t = translations[language];
  const popularPrices = [500, 1000, 1500, 2000];

  return (
    <div className="py-4 border-b border-[#D9D9D9]">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-black md:text-[24px] text-xl font-medium">{t.price.title}</h4>
        <HiMiniMinusSmall className="md:text-2xl text-xl text-gray-400" />
      </div>
      <p className="text-[#828282] text-[16px] mb-3">0 {t.product.bdt} – {value} {t.product.bdt}</p>

      <div className="relative h-8 flex items-center mb-6">
        <div className="absolute left-0 right-0 h-[5px] rounded-full border border-[#FF7050] bg-gray-100" />
        <div
          className="absolute left-0 h-[8px] rounded-full bg-[#FF7050]"
          style={{ width: `${(value / 100000) * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={100000}
          step={500}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onMouseUp={(e) =>
            onUpdate("max", (e.target as HTMLInputElement).value)
          }
          onTouchEnd={(e) =>
            onUpdate("max", (e.target as HTMLInputElement).value)
          }
          className="price-slider absolute w-full z-10 cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <h5 className="text-[#727272] md:text-[22px] text-lg font-normal">
          {t.price.popularRange}:
        </h5>
        <div className="flex flex-wrap gap-2">
          {popularPrices.map((price) => (
            <button
              key={price}
              onClick={() => {
                setValue(price);
                onUpdate("max", price.toString());
              }}
              className={`px-4 py-2 border rounded-full md:text-[20px] text-base transition-all ${
                activeMaxPrice === price.toString()
                  ? "bg-[#FF7050] text-white border-[#FF7050]"
                  : "border-[#FF7050] text-[#FF7050] bg-transparent"
              }`}
            >
              {price} {t.product.bdt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
