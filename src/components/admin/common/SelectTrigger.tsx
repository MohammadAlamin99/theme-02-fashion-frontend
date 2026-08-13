import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectTriggerProps {
    label: string;
    onClick?: () => void;
    className?: string;
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({ label, onClick, className = "" }) => {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-2 bg-[#F9FAFB] px-3 py-2 rounded-[8px] cursor-pointer ml-2 border border-transparent ${className}`}
        >
            <span className="text-xs font-normal text-[#000000] whitespace-nowrap">
                {label}
            </span>
            <ChevronDown size={16} className="text-[#000000]" />
        </div>
    );
};

export default SelectTrigger;