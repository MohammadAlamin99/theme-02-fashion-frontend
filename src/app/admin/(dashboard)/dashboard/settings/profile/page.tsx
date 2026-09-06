"use client";

import { usePathname, useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useAdminProfileData } from "@/hooks/useProfile";
import TabItem from "../../../../../../components/admin/catalog/TabItem";
import ContentIcon from "@/components/store-front/svg/svg/ContentIcon";
import ChatInterfaceIcon from "@/components/store-front/svg/svg/ChatInterfaceIcon";
import ShopSettingsIcon from "@/components/store-front/svg/svg/ShopSettingsIcon";
import { Profile, Tab } from "@/@types/profile.type";
import ProfileForm from "@/components/admin/settings/profile/Profileform";

const tabs: Tab[] = [
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

const AdminProfilePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: profile, isLoading, refetch } = useAdminProfileData();

  return (
    <div className="w-full p-8 font-lato bg-white">
      <h1 className="text-2xl font-bold text-[#003032] mb-6">Settings</h1>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-none">
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

      {isLoading || !profile ? (
        <div className="p-8">Loading...</div>
      ) : (
        <ProfileForm profile={profile as Profile} refetch={refetch} />
      )}
    </div>
  );
};

export default AdminProfilePage;
