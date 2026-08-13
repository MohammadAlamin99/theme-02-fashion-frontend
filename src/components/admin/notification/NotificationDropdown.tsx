"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";
import NotificationIcon from "@/components/store-front/svg/svg/NotificationIcon";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // 🚀 FIXED: Defensively handle filtering so it never throws an error even if state is loading
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const token = await getAdminTokenAction();
      const res = await apiFetch("/notifications", {
        method: "GET",
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      if (res.ok) {
        const json = await res.json();
        
        // 🚀 FIXED: Robust deep inspection of array locations based on your backend object mappings
        if (Array.isArray(json)) {
          setNotifications(json);
        } else if (json && Array.isArray(json.data)) {
          setNotifications(json.data);
        } else if (json && json.notifications && Array.isArray(json.notifications)) {
          setNotifications(json.notifications);
        } else {
          setNotifications([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notification strings:", err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:8082";
    
    const socket = io(`${backendUrl}/chat`, {
      withCredentials: true,
      transports: ["websocket"],
      query: { isAdmin: "true" },
    });

    socket.on("newNotification", (item: NotificationItem) => {
      setNotifications((prev) => {
        const currentList = Array.isArray(prev) ? prev : [];
        if (currentList.some((n) => n.id === item.id)) return currentList;
        return [item, ...currentList];
      });
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      socket.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const token = await getAdminTokenAction();
      await apiFetch("/notifications/read-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      setNotifications((prev) => {
        const currentList = Array.isArray(prev) ? prev : [];
        return currentList.map((n) => ({ ...n, isRead: true }));
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (id: string) => {
    try {
      const token = await getAdminTokenAction();
      await apiFetch(`/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      setNotifications((prev) => {
        const currentList = Array.isArray(prev) ? prev : [];
        return currentList.map((n) => n.id === id ? { ...n, isRead: true } : n);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer p-1 hover:opacity-75 transition-opacity border-none bg-transparent outline-none flex items-center"
      >
        <NotificationIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3.5 w-80 bg-white border border-gray-200 shadow-xl rounded-[4px] z-[9999] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
            <span className="text-xs font-bold text-gray-800">Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-[#0060C0] hover:underline bg-transparent border-none outline-none cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 bg-white custom-scrollbar">
            {safeNotifications.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-10 font-normal">No new notifications</p>
            ) : (
              safeNotifications.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleItemClick(item.id)}
                  className={`p-3.5 text-left transition-colors cursor-pointer relative ${
                    !item.isRead ? "bg-slate-50/70" : "bg-white hover:bg-slate-50/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-semibold text-gray-900 leading-tight">{item.title}</h5>
                    {!item.isRead && <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-1" />}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal font-normal break-words">{item.message}</p>
                  <span className="text-[9px] text-gray-400 block mt-1.5 font-medium">
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;