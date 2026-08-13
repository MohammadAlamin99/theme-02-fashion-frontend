"use client";

import Image from "next/image";
import { X } from "lucide-react";

interface SidebarHeaderProps {
  onClose?: () => void;
}

export const SidebarHeader = ({ onClose }: SidebarHeaderProps) => {
  return (
    <div className="relative mx-auto flex items-center justify-between w-full px-4">
      <div className="relative w-[120px] h-[30px] sm:w-[140px] sm:h-[35px] lg:w-[160px] lg:h-[40px]">
        <Image
          src="/images/admin/logo.png"
          alt="Logo"
          fill
          priority
          className="object-contain"
          sizes="(max-width: 768px) 120px, (max-width: 1200px) 140px, 160px"
        />
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-md text-gray-500 hover:text-gray-700"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};
