"use client";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { sidebarMenu } from "@/config/sidebar";
import { SidebarHeader } from "./SidebarHeader";
import { NavMenuGroup } from "./NavMenuGroup";
import { NavSingleItem } from "./NavSingleItem";
import { useAdminProfileData } from "@/hooks/useProfile";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const activeItemStyle: React.CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(56, 189, 248, 0.10) 0%, rgba(30, 144, 255, 0.10) 100%)",
  borderRight: "1px solid #14B7FF",
  borderRadius: "5px",
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Update this line inside the component:
  const { data: userData } = useAdminProfileData();

  // The rest of the logic remains the same...
  const user = userData?.data || userData;

  const filteredMenu = useMemo(() => {
    if (!user) return [];
    return sidebarMenu
      .map((section) => ({
        ...section,
        items: section.items.filter((item: { permission: string }) => {
          // if (user.role === "ADMIN") return true;
          return user.permissions?.includes(item.permission);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [user]);

  // User toggles for submenus
  const [userToggledMenus, setUserToggledMenus] = useState<
    Record<string, boolean>
  >({});

  // Derived state: calculate which submenus contain the active route
  const activeMenus = useMemo(() => {
    const active: Record<string, boolean> = {};
    filteredMenu.forEach((section) => {
      section.items.forEach((item) => {
        if (item.submenu) {
          const isActive = item.submenu.some(
            (sub: { href: string }) =>
              pathname === sub.href || pathname.startsWith(`${sub.href}/`),
          );
          if (isActive) {
            active[item.label] = true;
          }
        }
      });
    });
    return active;
  }, [pathname, filteredMenu]);

  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleMenu = (menuName: string) => {
    const currentlyOpen = userToggledMenus[menuName] ?? !!activeMenus[menuName];
    setUserToggledMenus((prev) => ({ ...prev, [menuName]: !currentlyOpen }));
  };

  const sidebarContent = (
    <aside className="w-64 h-full flex flex-col overflow-y-auto custom-scrollbar pt-4 bg-white">
      <SidebarHeader onClose={onClose} />

      <nav className="flex-1 mt-2 font-poppins">
        {/* 3. Render the filteredMenu instead of the raw sidebarMenu */}
        {filteredMenu.map((section) => (
          <div key={section.section}>
            <p className="px-6 mt-6 mb-2 text-base font-normal text-[#777]">
              {section.section}
            </p>

            {section.items.map((item) => {
              if (item.submenu) {
                const isMenuOpen =
                  userToggledMenus[item.label] ?? !!activeMenus[item.label];
                return (
                  <NavMenuGroup
                    key={item.label}
                    item={item}
                    isOpen={isMenuOpen}
                    pathname={pathname}
                    activeItemStyle={activeItemStyle}
                    onToggle={() => toggleMenu(item.label)}
                  />
                );
              }
              return (
                <NavSingleItem
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  activeItemStyle={activeItemStyle}
                />
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );

  return (
    <>
      <div className="hidden md:block h-screen">{sidebarContent}</div>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={onClose}
          />
          <div className="absolute left-0 top-0 h-full w-64 shadow-xl animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
