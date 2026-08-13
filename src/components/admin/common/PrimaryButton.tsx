import React from 'react';

interface ButtonProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string; 
    disabled?: boolean;
}

const PrimaryButton: React.FC<ButtonProps> = ({
    label,
    icon,
    onClick,
    type = "button",
    className = "",
    disabled
}) => {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`cursor-pointer font-lato bg-[linear-gradient(90deg,#38BDF8_0%,#1E90FF_100%)]
        text-white px-5 py-3 rounded-lg flex items-center gap-2 text-[15px] font-semibold
        transition-colors active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
        max-sm:px-3 max-sm:py-2 max-sm:text-[13px] max-sm:gap-1 ${className}`}
        >
            {icon && icon}
            <span className="max-sm:text-[13px]">{label}</span>
        </button>
    );
};

export default PrimaryButton;