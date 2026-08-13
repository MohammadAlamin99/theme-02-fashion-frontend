"use client"

import Image from "next/image";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";


const featureImages = [
  "/images/store-front/feature/feture1.svg",
  "/images/store-front/feature/feature2.svg",
  "/images/store-front/feature/feature3.svg",
  "/images/store-front/feature/feature4.svg",

];

const Features = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <section className="w-full bg-white font-inter py-10 md:py-[80px] px-4 md:px-10">
      <div className="max-w-[1720px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-0 lg:gap-y-0">
        {t.features.map((item, index) => (
          <div
            key={index}
            className="relative flex items-start lg:items-center lg:justify-center"
          >
            {/* Feature Content */}
            <div className="flex items-start lg:items-center gap-3 lg:gap-5">
              <div className="shrink-0">
                <Image
                  src={featureImages[index]}
                  alt={item.title}
                  width={80}
                  height={80}
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-20 lg:h-20 object-contain"
                />
              </div>

              <div className="flex flex-col">
                <h3 className="text-[#000000] text-[14px] sm:text-[16px] lg:text-[24px] font-normal leading-tight lg:leading-normal mb-1">
                  {item.title}
                </h3>

                <p className="text-[#8C8C8C] text-[10px] sm:text-[12px] font-normal leading-normal max-w-[150px] lg:max-w-[174px]">
                  {item.desc}
                </p>
              </div>
            </div>

            {/* Desktop Separator */}
            {index !== t.features.length - 1 && (
              <div className="hidden lg:block absolute right-0 w-px h-[24px] bg-[#E2E2E2]" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;