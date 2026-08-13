"use client";
import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

// 1. Update the interface to accept the raw data shape
interface RawFAQ {
  q: string;
  a: string;
}

interface FAQProps {
  faqs: RawFAQ[] | null;
}

const Faqssection = ({ faqs }: FAQProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) {
    return (
      <p className="text-[#727272] text-center">
        {t.faq.noFaq}
      </p>
    );
  }

  return (
    <section className="w-full font-poppins">
      <div className="mx-auto">
        <h2 className="text-center text-black text-[28px] md:text-[32px] font-semibold mb-12">
          {t.faq.title}
        </h2>

        <div className="flex flex-col gap-5">
          {/* 2. Map the data by renaming 'q' to 'question' and 'a' to 'answer' */}
          {faqs.map((item, index) => (
            <div
              key={index}
              className={`rounded-[8px] transition-all duration-300 ${
                openIndex === index
                  ? "bg-[#EBEBEB]"
                  : "bg-white border border-gray-100"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-5 md:p-6 text-left cursor-pointer"
              >
                <span className="text-black text-[16px] md:text-[18px] font-semibold">
                  {item.q}
                </span>
                <FiChevronDown
                  className={`text-[24px] text-[#727272] transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out px-5 md:px-6 ${
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100 pb-6"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-[#585858] text-[14px] md:text-[15px] leading-relaxed">
                    {item.a}
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

export default Faqssection;
