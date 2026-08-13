"use client";

import Link from "next/link";

interface NavSingleItemProps {
    item: {
        label: string;
        href?: string;
        icon: React.ElementType;
        activeIcon?: React.ElementType;
    };
    pathname: string;
    activeItemStyle: React.CSSProperties;
}

export const NavSingleItem = ({ item, pathname, activeItemStyle }: NavSingleItemProps) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

    return (
        <Link href={item.href || "#"}>
            <div
                style={isActive ? activeItemStyle : {}}
                className="flex items-center justify-between px-4 py-2.5 mx-2 cursor-pointer transition-all duration-200"
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} className={isActive ? "text-[#38BDF8]" : "text-black"} />
                    <span className={`text-base font-normal ${isActive ? "text-[#38BDF8]" : "text-black"}`}>
                        {item.label}
                    </span>
                </div>
            </div>
        </Link>
    );
};