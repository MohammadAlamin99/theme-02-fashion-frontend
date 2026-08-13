
"use client";

import { useEffect, useRef, useState } from "react";
import ChevronDownIcon from "../svg/ChevronDownIcon";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

type CategoryItem =
  | Category
  | string
  | { label?: string; value?: string; type?: string; [key: string]: unknown };

interface CategoryDropdownProps<T extends CategoryItem = CategoryItem> {
  categories: T[];
  mobile?: boolean;
  onSelect?: (category: T) => void;
}


// --- helper functions: এখানেই type narrowing হচ্ছে ---
const getCategoryLabel = (category: CategoryItem): string => {
  if (typeof category === "string") return category;

  if ("name" in category && typeof category.name === "string") {
    return category.name;
  }
  if ("label" in category && typeof category.label === "string") {
    return category.label;
  }
  if ("value" in category && typeof category.value === "string") {
    return category.value;
  }

  return JSON.stringify(category) || "Unknown Category";
};

const getCategoryKey = (category: CategoryItem, index: number): string => {
  if (typeof category === "string") return category;

  if ("id" in category && typeof category.id === "string") {
    return category.id;
  }
  if ("label" in category && typeof category.label === "string") {
    return category.label;
  }
  if ("value" in category && typeof category.value === "string") {
    return category.value;
  }

  return String(index);
};

const CategoryDropdown = <T extends CategoryItem = CategoryItem>({
  categories,
  mobile = false,
  onSelect,
}: CategoryDropdownProps<T>) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <span
          className={`text-black text-sm font-medium whitespace-nowrap ${
            mobile ? "hidden sm:block" : ""
          }`}
        >
          {t.search.allCategories}
        </span>

        <ChevronDownIcon />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-[8px] border border-[#E2E2E2] shadow-lg z-[9999] overflow-hidden">
          {categories.map((category, index) => {
            const label = getCategoryLabel(category);
            const key = getCategoryKey(category, index);

            return (
              <button
                key={key}
                onClick={() => {
                  if (onSelect) onSelect(category);
                  else console.log(category);
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-[14px] text-[#5E5E5E] hover:bg-[#F9F9F9] hover:text-[#FF7050] transition-all"
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;