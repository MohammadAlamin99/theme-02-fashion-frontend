"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";

export const SectionWrapper = ({
  title,
  children,
  description,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg px-4 py-5 mb-4">
      <div
        className="flex justify-between items-center mb-4 cursor-pointer select-none"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h3 className="text-[#003032] font-medium text-xl">{title}</h3>
        <ChevronUp
          size={24}
          color="black"
          strokeWidth={2.5}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-0" : "rotate-180"
          }`}
        />
      </div>

      {isOpen && (
        <>
          {description && (
            <p className="text-xs text-[#A2A2A2] -mt-3 mb-5 leading-tight">
              {description}
            </p>
          )}
          {children}
        </>
      )}
    </div>
  );
};
