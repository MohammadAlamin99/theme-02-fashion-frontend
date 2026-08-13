import React from "react";

interface ButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  type?: "button" | "submit" | "reset"; // Added type prop to the interface
}

const CrystalOrangeButton: React.FC<ButtonProps> = ({
  label,
  icon,
  onClick,
  className = "",
  type = "button", // Defaulting to "button" to prevent accidental form submission resets
}) => {
  return (
    <button
      type={type} // Added HTML type attribute execution
      onClick={onClick}
      className={`cursor-pointer font-lato bg-gradient-to-b from-[#FF6A00] to-[#FF9F1C]
            text-white px-8 py-3 rounded-[8px] flex items-center justify-center gap-2 text-[15px] font-bold
            transition-all active:scale-95 border-none outline-none ${className}`}
    >
      {icon && icon}
      <span>{label}</span>
    </button>
  );
};

export default CrystalOrangeButton;
