"use client";

import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

interface SectionHeaderProps {
  title: string;
  link: string;
}

export const SectionHeader = ({ title, link }: SectionHeaderProps) => {
  const {language} = useLanguage();
  const t= translations[language];
  return (
    <div className="flex justify-between items-center w-full mb-8">
      <h2 className="text-[#000] font-poppins text-[24px] md:text-[32px] font-semibold leading-normal">
        {title}
      </h2>
      <Link
        href={link}
        className="flex items-center gap-1 text-[#FF7050] font-inter text-[18px] md:text-[24px] font-medium leading-normal hover:opacity-80 transition-opacity"
      >
        {t.common.viewMore}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="32"
          viewBox="0 0 16 32"
          fill="none"
          className="w-3 h-6 md:w-4 md:h-8"
        >
          <path
            d="M3.26932 8.77332L4.68398 7.35999L12.3893 15.0627C12.5135 15.1861 12.6121 15.3328 12.6794 15.4945C12.7466 15.6562 12.7813 15.8296 12.7813 16.0047C12.7813 16.1798 12.7466 16.3531 12.6794 16.5148C12.6121 16.6765 12.5135 16.8232 12.3893 16.9467L4.68398 24.6533L3.27065 23.24L10.5026 16.0067L3.26932 8.77332Z"
            fill="#FF7050"
          />
        </svg>
      </Link>
    </div>
  );
};
