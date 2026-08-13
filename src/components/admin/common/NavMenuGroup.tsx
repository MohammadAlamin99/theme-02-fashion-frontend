"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SubmenuItem {
    href: string;
    label: string;
}

interface NavMenuGroupProps {
    item: {
        label: string;
        icon: React.ElementType;
        activeIcon?: React.ElementType;
        submenu?: SubmenuItem[];
    };
    isOpen: boolean;
    pathname: string;
    activeItemStyle: React.CSSProperties;
    onToggle: () => void;
}

export const NavMenuGroup = ({ item, isOpen, pathname, activeItemStyle, onToggle }: NavMenuGroupProps) => {
    const isAnySubmenuActive = item.submenu?.some(
        (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
    );

    const shouldHighlightParent = isOpen || isAnySubmenuActive;
    const Icon = isOpen && item.activeIcon ? item.activeIcon : item.icon;

    return (
        <div>
            {/* Parent Toggle Button */}
            <div
                onClick={onToggle}
                style={shouldHighlightParent ? activeItemStyle : {}}
                className="flex items-center justify-between px-4 py-2.5 mx-2 cursor-pointer transition-all"
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} className={isOpen ? "text-[#38BDF8]" : "text-gray-500"} />
                    <span className={`text-base font-normal ${isOpen ? "text-[#38BDF8]" : "text-black"}`}>
                        {item.label}
                    </span>
                </div>
                {isOpen ? (
                    <ChevronDown size={16} className="text-[#38BDF8]" />
                ) : (
                    <ChevronRight size={16} className="text-gray-500" />
                )}
            </div>

            {/* Submenu Item List */}
            {isOpen && (
                <div className="mt-1 space-y-1">
                    {item.submenu?.map((sub) => {
                        const isSubActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                        return (
                            <Link key={sub.href} href={sub.href} className="block">
                                <div className={`flex items-center gap-3 pl-12 py-2 mx-2 rounded-[5px] transition-colors
                                    ${isSubActive ? "text-[#38BDF8]" : "text-black"}`}>
                                    <ChevronRight size={24} className={isSubActive ? "text-[#38BDF8]" : "text-black"} />
                                    <span className="text-base font-normal">{sub.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};