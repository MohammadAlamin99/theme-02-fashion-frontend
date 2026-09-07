"use client";
import { useState, useRef, useEffect } from "react";
import ChatIcon from "@/components/store-front/svg/svg/ChatIcon";
import GlobalIcon from "@/components/store-front/svg/svg/GlobalIcon";
import NotificationIcon from "@/components/store-front/svg/svg/NotificationIcon";
import { useAdminProfileData } from "@/hooks/useProfile";
import AdminChatModal from "@/components/admin/chat/AdminChatModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useChatNotificationSync } from "@/hooks/useChatNotificationSync";
import { notificationApi } from "@/services-api/notificationService";
import { Menu, ShoppingCart, Star, CheckCheck, Clock, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const router = useRouter();
  const { data: profile } = useAdminProfileData();
  const [chatOpen, setChatOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // 🚀 REAL-TIME ENGINE
  useChatNotificationSync();

  // 🚀 STORE DATA
  const unreadMessageCount =
    useAuthStore((state) => state.unreadMessageCount) || 0;
  const { notifications, unreadCount, markRead, setNotifications } =
    useNotificationStore();

  // 🚀 ACTIONS
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
    } catch (e) {
      console.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = async (n: {
    isRead: boolean;
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
  }) => {
    try {
      // 1. Mark as read
      if (!n.isRead) {
        await notificationApi.markAsRead(n.id);
        markRead(n.id);
      }

      // 2. Close dropdown
      setShowNotifDropdown(false);

      // 3. 🚀 Navigate based on type
      if (n.type === "ORDER") {
        router.push("/admin/dashboard/order");
      } else if (n.type === "REVIEW") {
        router.push("/admin/dashboard/review");
      }
    } catch (e) {
      console.error("Navigation error", e);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rawUser = profile?.user || profile?.data || profile;
  const adminName = rawUser?.name || "Admin";
  const adminRole = rawUser?.role || "ADMIN";

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  let finalAvatarUrl = null;
  if (rawUser?.avatar && rawUser.avatar.trim().length > 1) {
    finalAvatarUrl =
      rawUser.avatar.startsWith("data:") || rawUser.avatar.startsWith("http")
        ? rawUser.avatar
        : `${backendBaseUrl}/${rawUser.avatar.replace(/^\/+/, "")}`;
  }

  return (
    <header className="flex items-center justify-between bg-white px-4 md:px-6 py-3 mt-2 rounded-lg gap-3 mx-2 sm:mx-4 relative">
      {/* LEFT PANEL */}
      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-md text-black hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="relative w-[120px] h-[32px] md:w-[155px] md:h-[40px]">
          <Image
            src="/images/admin/logomain.png"
            alt="Logo"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 120px, 155px"
            priority
          />
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-[#F9F9F9] rounded-[8px] font-poppins cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <GlobalIcon />
            <span className="text-sm font-normal text-black">View Website</span>
          </Link>
          {/* <button className="xl:flex hidden items-center gap-2 p-2 bg-[#F9F9F9] rounded-[8px] font-poppins cursor-pointer hover:bg-gray-100 transition-colors">
            <VideoCamIcon />
            <span className="text-sm font-normal text-black">Tutorials</span>
          </button> */}
        </div>
      </div>

      {/* CENTER: Search Bar */}
      {/* <div className="flex-1 max-w-[318px] mx-8 hidden md:hidden xl:block">
        <div className="relative group font-poppins">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-black" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3 bg-[#F9F9F9] border-transparent rounded-[8px] text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            placeholder="Search dashboard..."
          />
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none pr-1 z-50">
            <button className="cursor-pointer text-sm font-normal text-black font-sans tracking-tight">
              Search
            </button>
          </div>
        </div>
      </div> */}

      {/* RIGHT: Action Icons + Badge Indicators */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* CHAT ICON (Restored Original Logic) */}
        <button
          onClick={() => setChatOpen(true)}
          className="relative cursor-pointer p-1.5 hover:opacity-75 transition-opacity border-none bg-transparent outline-none flex items-center"
        >
          <ChatIcon />
          {unreadMessageCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-bold text-[9px] min-w-[15px] h-3.5 px-0.5 rounded-full flex items-center justify-center shadow-sm select-none pointer-events-none animate-in zoom-in-50 duration-150">
              {unreadMessageCount}
            </span>
          )}
        </button>

        {/* 🚀 NOTIFICATION ICON + DROPDOWN (ONLY ORDERS AND REVIEWS) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className={`relative cursor-pointer p-1.5 transition-all border-none bg-transparent outline-none flex items-center ${showNotifDropdown ? "opacity-50" : "hover:opacity-75"}`}
          >
            <NotificationIcon />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#FF6A00] text-white font-bold text-[9px] min-w-[15px] h-3.5 px-0.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* 🚀 DROPDOWN PANEL (Restored Original Styles) */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-gray-100 shadow-2xl rounded-xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-[#F9FAFB]">
                <h3 className="font-bold text-[#023337] text-[14px]">
                  Notifications
                </h3>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-[#1DA1F2] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 border-b border-gray-50 flex gap-4 cursor-pointer transition-colors ${!n.isRead ? "bg-blue-50/20" : "hover:bg-gray-50 opacity-70"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${n.type === "ORDER" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}
                      >
                        {n.type === "ORDER" ? (
                          <ShoppingCart size={18} />
                        ) : (
                          <Star size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[13px] leading-tight ${!n.isRead ? "font-bold text-black" : "text-gray-600"}`}
                        >
                          {n.title}
                        </p>
                        <p className="text-[12px] text-gray-500 mt-1 line-clamp-2 leading-snug">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2 font-medium">
                          <Clock size={10} />{" "}
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-400 text-xs italic">
                    No recent notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Navigation Info */}
        <Link
          href="/admin/dashboard/profile"
          className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 font-poppins cursor-pointer group"
        >
          <div className="text-right">
            <p className="text-[10px] md:text-xs font-bold text-[#7fb63f] tracking-wide uppercase leading-tight">
              {adminRole}
            </p>
            <p className="text-xs md:text-sm font-semibold text-black leading-tight">
              {adminName}
            </p>
          </div>
          <div className="relative">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#7fb63f] to-[#7fb63f] flex items-center justify-center text-white text-xs md:text-sm font-bold transition-all overflow-hidden">
              {finalAvatarUrl ? (
                <Image
                  src={finalAvatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  width={100}
                  height={100}
                  unoptimized
                />
              ) : (
                adminName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </Link>
      </div>

      <AdminChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </header>
  );
};

export default Header;
