import React from 'react';

interface ButtonProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
}

const SeconderyButton: React.FC<ButtonProps> = ({
    label,
    icon,
    onClick,
    type = "button",
    className = ""
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`cursor-pointer font-lato bg-[#F4F4F4]
        text-black px-5 py-3 rounded-[8px] flex items-center gap-2 text-[15px] font-semibold
        transition-colors active:opacity-90
        max-sm:px-3 max-sm:py-2 max-sm:text-[13px] max-sm:gap-1 ${className}`}
        >
            {icon && icon}
            <span className="max-sm:text-[13px]">{label}</span>
        </button>
    );
};

export default SeconderyButton;