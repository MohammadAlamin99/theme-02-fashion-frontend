"use client";
import { Search } from 'lucide-react';
import React from 'react';

interface Props {
    placeholder?: string;
    onSearch: (val: string) => void;
}

export default function InventorySearchBar({ placeholder = "Search products/SKU", onSearch }: Props) {
    const [val, setVal] = React.useState("");
    return (
        <div className="relative flex items-center bg-[#F9F9F9] rounded-[8px] px-3 py-2 w-full md:w-[292px]">
            <Search size={24} className="text-[#000000] mr-2" />
            <input
                type="text"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(val)}
                placeholder={placeholder}
                className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-[#7B7B7B]"
            />
            <button onClick={() => onSearch(val)} className="text-sm cursor-pointer font-normal text-black ml-2">
                Search
            </button>
        </div>
    );
}