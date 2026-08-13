"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { getFaqs } from "@/services-api/faqService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

const FAQ = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // 1. TanStack Query Fetching
  const { data: faqResponse, isLoading } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: () => getFaqs(),
  });

  // Extract data array safely
  const faqData = faqResponse?.data || [];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Skip rendering if still loading or no data found
  if (isLoading || faqData.length === 0) return null;

  return (
    <section className="w-full px-4 md:px-3 bg-white font-poppins py-12">
      <div className="w-full lg:max-w-[1740px] mx-auto">
        {/* Title */}
        <h2 className="text-center text-black text-[28px] md:text-[32px] font-semibold mb-12">
          {t.faq.title}
        </h2>

        {/* FAQ List */}
        <div className="flex flex-col gap-5">
          {faqData.map((item, index) => (
            <div
              key={item.id || index}
              className={`
                rounded-[8px] transition-all duration-300 ease-in-out
                ${
                  openIndex === index
                    ? "bg-[#EBEBEB] shadow-none"
                    : "bg-white shadow-[0px_4px_15px_rgba(0,0,0,0.04)] hover:shadow-[0px_4px_20px_rgba(0,0,0,0.08)]"
                }
              `}
            >
              {/* Question Header */}
              <button
                onClick={() => handleToggle(index)}
                className="w-full flex justify-between items-center p-5 md:p-6 text-left cursor-pointer outline-none"
              >
                <span className="text-black text-[16px] md:text-[18px] font-semibold">
                  {item.question}
                </span>
                <FiChevronDown
                  className={`text-[24px] text-[#727272] transition-transform duration-300 ease-in-out ${
                    openIndex === index ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Answer Content - Using grid transition for smooth auto-height animation */}
              <div
                className={`
                  grid transition-all duration-300 ease-in-out px-5 md:px-6
                  ${
                    openIndex === index
                      ? "grid-rows-[1fr] opacity-100 pb-6"
                      : "grid-rows-[0fr] opacity-0 pb-0"
                  }
                `}
              >
                <div className="overflow-hidden">
                  <p className="text-[#585858] text-[14px] md:text-[15px] leading-relaxed font-normal">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
