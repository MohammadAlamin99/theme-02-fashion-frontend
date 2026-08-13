import { Search } from 'lucide-react'
import React from 'react'

export default function SearchBar({ placeholder = "Search products/SKU" }: { placeholder?: string }) {
    return (
        <div className="relative flex items-center bg-[#F9F9F9] rounded-[8px] px-3 py-2 w-full md:w-[292px]">
            <Search size={24} className="text-[#000000] mr-2" />
            <input
                type="text"
                placeholder={placeholder}
                className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-[#7B7B7B]"
            />
            <button className="text-sm cursor-pointer font-normal text-black ml-2">
                Search
            </button>
        </div>
    )
}
