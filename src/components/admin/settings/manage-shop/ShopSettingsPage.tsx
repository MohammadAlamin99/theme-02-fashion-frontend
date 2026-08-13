"use client";
import TabItem from "../../catalog/TabItem";
import { usePathname, useRouter } from "next/navigation";
import ShopManagementGrid from "./ShopManagementGrid";
import { User } from "lucide-react";
import ContentIcon from "@/components/store-front/svg/svg/ContentIcon";
import ChatInterfaceIcon from "@/components/store-front/svg/svg/ChatInterfaceIcon";
import ShopSettingsIcon from "@/components/store-front/svg/svg/ShopSettingsIcon";

export default function ShopSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = [
    {
      id: "web",
      label: "Website Information",
      icon: ContentIcon,
      path: "/admin/dashboard/settings/information",
    },
    {
      id: "chat",
      label: "Chat Settings",
      icon: ChatInterfaceIcon,
      path: "/admin/dashboard/settings/chat",
    },
    {
      id: "shop",
      label: "Manage Shop",
      icon: ShopSettingsIcon,
      path: "/admin/dashboard/settings/manage-shop",
    },
    {
      id: "profile",
      label: "Profile Details",
      icon: User,
      path: "/admin/dashboard/settings/profile",
    },
  ];

  return (
    <>
      <div className="w-full p-8 font-lato bg-white">
        <h1 className="text-2xl font-bold text-[#003032] mb-6">Settings</h1>
        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <TabItem
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={pathname === tab.path}
              onClick={() => router.push(tab.path)}
            />
          ))}
        </div>
      </div>
      <div className="mt-2">
        <ShopManagementGrid />
      </div>
    </>
  );
}
