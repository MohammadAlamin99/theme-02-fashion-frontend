"use client";

import { usePathname, useRouter } from "next/navigation";
import { Shapes, Hash } from "lucide-react";
import TabItem from "./TabItem";
import SubCategoryIcon from "@/components/store-front/svg/svg/SubCategroyIcon";
import BrandIcon from "@/components/store-front/svg/svg/BrandIcon";
import ChildCategoryIcon from "@/components/store-front/svg/svg/ChildCategoryIcon";

const CategoryNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();

  // 🚀 FIXED: Paths mapped fully to absolute dashboard routing tree parameters
  const tabs = [
    {
      id: "category",
      label: "Category",
      path: "/admin/dashboard/category",
      icon: Shapes,
    },
    {
      id: "sub-category",
      label: "Sub Category",
      path: "/admin/dashboard/sub-category",
      icon: SubCategoryIcon,
    },
    {
      id: "child-category",
      label: "Child Category",
      path: "/admin/dashboard/child-category",
      icon: ChildCategoryIcon,
    },
    {
      id: "brand",
      label: "Brand",
      path: "/admin/dashboard/brand",
      icon: BrandIcon,
    },
    { id: "tags", label: "Tags", path: "/admin/dashboard/tag", icon: Hash },
  ];

  return (
    <div className="w-full bg-white mt-8 mb-2">
      <div className="flex items-center gap-2 md:gap-4 overflow-x-auto flex-nowrap scrollbar-none pb-px">
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
  );
};

export default CategoryNavigation;
