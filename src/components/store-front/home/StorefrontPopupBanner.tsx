"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { getActivePopupBanner, PopupBanner } from "@/services-api/popupBannerService";

export default function StorefrontPopupBanner() {
  const [banner, setBanner] = useState<PopupBanner | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const activeBanner = await getActivePopupBanner();
        console.log("[PopupBanner] fetched activeBanner:", activeBanner);

        if (!activeBanner || !activeBanner.image_url) {
          console.log("[PopupBanner] No active banner or missing image_url");
          return;
        }

        // Check if we should show it based on show_once logic
        if (activeBanner.show_once === true) {
          const hasSeen = sessionStorage.getItem(`popup_seen_${activeBanner.id}`);
          if (hasSeen) {
            console.log("[PopupBanner] Already seen, skipping.");
            return;
          }
        }

        setBanner(activeBanner);
        // Small delay for better UX
        setTimeout(() => setIsVisible(true), 800);
      } catch (error) {
        console.error("Failed to load popup banner:", error);
      }
    };

    fetchBanner();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (banner && banner.show_once) {
      sessionStorage.setItem(`popup_seen_${banner.id}`, "true");
    }
  };

  if (!banner || !isVisible || !banner.image_url) return null;

  const imageUrl = banner.image_url?.startsWith("http") 
    ? banner.image_url 
    : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8082"}${banner.image_url?.startsWith("/") ? "" : "/"}${banner.image_url}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative max-w-2xl w-full bg-transparent flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleClose}
          className="absolute -top-10 right-0 md:-right-10 w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-200 transition-colors z-10"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>

        <div className="relative w-full overflow-hidden rounded-xl shadow-2xl bg-white max-h-[85vh] flex items-center justify-center">
          {banner.link_url ? (
            <Link href={banner.link_url} onClick={handleClose} className="w-full h-full block">
              <img
                src={imageUrl}
                alt="Popup Banner"
                className="w-full h-auto object-contain max-h-[85vh]"
              />
            </Link>
          ) : (
            <img
              src={imageUrl}
              alt="Popup Banner"
              className="w-full h-auto object-contain max-h-[85vh]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
