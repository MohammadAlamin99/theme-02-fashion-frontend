"use client";

import { IconComponent } from "@/@types/profile.type";

interface InputFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  icon: IconComponent;
  disabled?: boolean;
}

const InputField = ({
  label,
  value,
  onChange,
  icon: Icon,
  disabled = false,
}: InputFieldProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold">{label}</label>
    <div className="flex items-center bg-[#F9F9F9] rounded-lg px-3 border border-gray-100">
      <Icon size={16} className="text-gray-400 mr-2" />
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-transparent p-3 border-none outline-none"
      />
    </div>
  </div>
);

export default InputField;
