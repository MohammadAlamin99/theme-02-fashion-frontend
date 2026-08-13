

"use client";
import { useFormContext } from "react-hook-form";
import { Bold, Italic, Underline, Link, Image, List, ListOrdered, Quote, Type, ChevronDown } from "lucide-react";

export const RichTextSection = ({ title, placeholder, name }: { title: string; placeholder: string; name: string }) => {
  const { register } = useFormContext();
  return (
    <div className="mb-8">
      <h3 className="text-[22px] font-bold text-black mb-4 font-lato">{title}</h3>
      <div className="bg-white rounded-[8px] overflow-hidden">
        {/* <div className="bg-[#F9F9F9] flex items-center gap-4 px-4 py-2 border-b border-gray-100">
          <div className="flex items-center gap-1 text-xs font-bold text-[#4F4D4D]">Normal <ChevronDown size={14} /></div>
          <div className="h-4 w-[1px] bg-gray-200" />
          <Bold size={16} className="text-[#4F4D4D]" /> <Italic size={16} className="text-[#4F4D4D]" /> <Underline size={16} className="text-[#4F4D4D]" />
          <div className="h-4 w-[1px] bg-gray-200" />
          <Quote size={16} className="text-[#4F4D4D]" /> <Type size={16} className="text-[#4F4D4D]" />
          <div className="h-4 w-[1px] bg-gray-200" />
          <List size={16} className="text-[#4F4D4D]" /> <ListOrdered size={16} className="text-[#4F4D4D]" />
          <div className="h-4 w-[1px] bg-gray-200" />
          <Image size={16} className="text-[#4F4D4D]" /> <Link size={16} className="text-[#4F4D4D]" />
        </div> */}
        <textarea {...register(name)} placeholder={placeholder} className="w-full min-h-[175px] p-4 text-sm bg-[#F9F9F9] outline-none placeholder:text-[#A2A2A2] mt-4 rounded-[8px]" />
      </div>
    </div>
  );
};