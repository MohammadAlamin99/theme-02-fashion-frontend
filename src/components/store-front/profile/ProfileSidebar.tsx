"use client";

import React, { useState, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaRegUser,
  FaRegHeart,
  FaCamera,
  FaSpinner,
  FaTruck,
} from "react-icons/fa";
import { BiUser } from "react-icons/bi";
import { SlHandbag } from "react-icons/sl";
import { IoLogOutOutline } from "react-icons/io5";
import { useAuthStore } from "@/store/useAuthStore";
import { deleteSessionToken } from "@/app/actions/auth";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/utils/api";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";
import Image from "next/image";
import toast from "react-hot-toast";

const emptySubscribe = () => () => {};

const ProfileSidebar = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);
  const isStoreReady = useAuthStore((state) => state._hasHydrated);
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [uploading, setUploading] = useState(false);
  const [cacheBuster, setCacheBuster] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sidebarLinks = [
    {
      name: t.profileSidebar.profileDetails,
      href: "/profile",
      icon: BiUser,
    },
    {
      name: t.profileSidebar.orders,
      href: "/profile/order",
      icon: SlHandbag,
    },
    {
      name: t.profileSidebar.wishList,
      href: "/profile/wishlist",
      icon: FaRegHeart,
    },
    {
      name: t.profileSidebar.trackOrder,
      href: "/profile/track-order",
      icon: FaTruck,
    },
  ];

  const handleLogout = async () => {
    queryClient.clear();
    if (clearAuth) {
      clearAuth();
    }
    await deleteSessionToken();
    router.refresh();
    router.push("/signin");
  };

  const handleEditAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();

      // ✅ Matches your backend NestJS controller interceptor parameter target
      formData.append("image", file);

      // 🚀 FIXED: Replaced raw fetch with apiFetch to properly route customer custom headers
      const res = await apiFetch("/users/avatar", {
        method: "PATCH",
        headers: {
          // Explicit flag informs JwtStrategy to prioritize customer identity checks
          "X-Customer-Request": "true",
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Image upload failed.");
      }

      const updatedAvatarPath =
        data?.image_url ??
        data?.avatar ??
        data?.data?.image_url ??
        data?.data?.avatar ??
        data?.user?.avatar ??
        data?.data?.user?.avatar ??
        null;

      if (!updatedAvatarPath) {
        throw new Error("Avatar path not found in server response.");
      }

      if (user && setAuthUser) {
        setAuthUser({
          ...user,
          avatar: updatedAvatarPath,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setCacheBuster(Date.now());

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || "Could not upload image.");
    } finally {
      setUploading(false);
    }
  };

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  let avatarUrl = null;
  if (user?.avatar) {
    const cleanPath = user.avatar.replace(/^\/+/, "");
    avatarUrl = cacheBuster
      ? `${backendBaseUrl}/${cleanPath}?t=${cacheBuster}`
      : `${backendBaseUrl}/${cleanPath}`;
  }

  if (!hydrated || !isStoreReady) {
    return (
      <div className="w-full bg-white rounded-[12px] p-6 border border-[#D2D2D2] h-fit font-poppins animate-pulse">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 bg-[#F2F2F2] rounded-full mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-[12px] p-6 border border-[#D2D2D2] h-fit font-poppins">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative group w-24 h-24 mb-4">
          <div className="w-full h-full bg-[#F2F2F2] rounded-full overflow-hidden border border-gray-100 flex items-center justify-center text-gray-300 relative">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile Avatar"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                unoptimized
              />
            ) : (
              <FaRegUser size={40} />
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white z-10 rounded-full">
                <FaSpinner className="animate-spin" size={20} />
              </div>
            )}
          </div>

          <button
            onClick={handleEditAvatarClick}
            disabled={uploading}
            type="button"
            className="absolute bottom-0 right-0 bg-[#FF7050] text-white p-2 rounded-full border-2 border-white shadow-md hover:bg-[#e66345] transition-all cursor-pointer flex items-center justify-center z-20 disabled:opacity-50"
            title={t.profileSidebar.updateProfilePicture}
          >
            <FaCamera size={12} />
          </button>
        </div>

        <h3 className="text-lg font-semibold text-black">
          {user?.name || t.profileSidebar.userAccount}
        </h3>
        <p className="text-sm text-gray-400 font-medium">
          {user?.phone || t.profileSidebar.noPhoneInfo}
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center font-medium gap-4 px-4 py-3.5 rounded-[8px] transition-all relative group ${
                isActive
                  ? "text-black bg-[#F9F9F9]"
                  : "text-[#727272] hover:bg-gray-50"
              }`}
            >
              <Icon
                size={18}
                className={`${isActive ? "text-[#FF7050]" : "text-[#727272]"}`}
              />

              <span className="text-base">{link.name}</span>
              {isActive && (
                <div className="absolute right-0 top-1/4 h-1/2 w-[3px] bg-[#FF7050] rounded-l-full" />
              )}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3.5 mt-4 rounded-[8px] text-[#FF4D4D] hover:bg-red-50 transition-all font-medium cursor-pointer w-full text-left border-none bg-transparent"
        >
          <IoLogOutOutline
            size={24}
            className="group-hover:translate-x-1 transition-transform"
          />
          <span className="text-sm">{t.profileSidebar.logout}</span>
        </button>
      </nav>
    </div>
  );
};

export default ProfileSidebar;
