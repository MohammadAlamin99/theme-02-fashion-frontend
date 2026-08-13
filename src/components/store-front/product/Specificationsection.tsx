import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";
import React from "react";
interface SpecItem {
  type: string;
  desc: string;
}

interface SpecificationProps {
  specs: SpecItem[] | null;
}

const SpecificationSection = ({ specs }: SpecificationProps) => {
  const { language } = useLanguage();
  const t = translations[language];
  if (!specs || specs.length === 0) {
    return <p className="text-[#727272]">{t.specification.noSpecification}</p>;
  }

  return (
    <div className="text-base md:text-lg font-poppins">
      <div className="grid grid-cols-2 gap-y-6 gap-x-10">
        <h3 className="md:text-[24px] text-[18px] font-semibold text-black">
          {t.specification.feature}
        </h3>
        <h3 className="md:text-[24px] text-[18px] font-semibold text-black mb-4">
          {t.specification.details}
        </h3>

        {/* 4. Map over the array directly */}
        {specs.map((item, idx) => (
          <React.Fragment key={idx}>
            <span className="text-[#727272] md:text-[20px] text-base border-b border-gray-100 pb-2">
              {item.type}
            </span>
            <span className="text-black md:text-[20px] text-base font-medium border-b border-gray-100 pb-2">
              {item.desc}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SpecificationSection;
