import React from "react";

export const Input = ({
  placeholder,
  icon: Icon,
  type = "text",
}: {
  placeholder?: string;
  icon?: React.ElementType;
  type?: string;
}) => (
  <div className="relative w-full">
    <input
      type={type}
      placeholder={placeholder}
      className="w-full bg-[#F9F9F9] rounded-lg px-4 py-3 text-sm outline-none placeholder:text-[#A2A2A2] text-gray-700"
    />
    {Icon && (
      <Icon
        size={18}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
    )}
  </div>
);
