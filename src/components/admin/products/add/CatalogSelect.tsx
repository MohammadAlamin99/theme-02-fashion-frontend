// components/CatalogSelect.tsx
import { ChevronIcon } from "./ChevronIcon";

export interface CategoryNode {
  id: string | number;
  name: string;
  children?: CategoryNode[];
}

interface CatalogSelectProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options: CategoryNode[];
}

export function CatalogSelect({
  value,
  onChange,
  placeholder,
  options,
}: CatalogSelectProps) {
  return (
    <div className="mb-4">
      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#F9F9F9] text-gray-800 px-3 py-4 text-sm rounded-lg outline-none appearance-none cursor-pointer focus:bg-white border border-transparent focus:border-gray-200"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
        <ChevronIcon />
      </div>
    </div>
  );
}
