"use client";

import Link from "next/link";

interface NavSingleItemProps {
  item: {
    label: string;
    href?: string;
    matchPrefix?: string;
    icon: React.ElementType;
    activeIcon?: React.ElementType;
  };
  pathname: string;
  activeItemStyle: React.CSSProperties;
}
export const NavSingleItem = ({
  item,
  pathname,
  activeItemStyle,
}: NavSingleItemProps) => {
  const activeBase = item.matchPrefix || item.href;
  const isActive =
    pathname === activeBase || pathname.startsWith(`${activeBase}/`);
  const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

  return (
    <Link href={item.href || "#"}>
      <div
        style={isActive ? activeItemStyle : {}}
        className="flex items-center justify-between px-4 py-2.5 mx-2 cursor-pointer transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <Icon
            size={20}
            className={isActive ? "text-[#38BDF8]" : "text-black"}
          />
          <span
            className={`text-base font-normal ${isActive ? "text-[#38BDF8]" : "text-black"}`}
          >
            {item.label}
          </span>
        </div>
      </div>
    </Link>
  );
};
