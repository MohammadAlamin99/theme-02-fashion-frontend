"use client";

import React, { useRef, ChangeEvent } from "react";
import Image from "next/image";
import { Edit3, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadMainBanner } from "@/services-api/blogService";
import toast from "react-hot-toast"; // Added toast import

interface BannerResponse {
  data: {
    image_url: string;
  };
}

interface Props {
  bannerData: BannerResponse | null | undefined;
  isLoading: boolean;
}

export default function BannerSection({ bannerData, isLoading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // Banner upload mutation with proper types
  const uploadMutation = useMutation<BannerResponse, Error, File>({
    mutationFn: (file: File) => uploadMainBanner(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["main-banner"] });
      toast.success("Main banner updated successfully!"); // Replaced alert
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload banner"); // Replaced alert
    },
  });

  // Safe construction of banner URL
  const rawImageUrl = bannerData?.data?.image_url;
  const bannerUrl = rawImageUrl?.startsWith("http")
    ? rawImageUrl
    : `${backendBaseUrl}/${rawImageUrl?.replace(/^\/+/, "")}`;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="px-6 py-4 flex flex-col md:flex-row gap-8 items-start">
      <div className="w-full md:w-1/4">
        <h2 className="text-lg font-medium text-black mb-2 font-poppins">
          Main Banner
        </h2>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex items-center gap-2 border border-[#A2A2A2] rounded px-3 py-1 text-base text-[#A2A2A2] font-poppins cursor-pointer disabled:opacity-50"
        >
          {uploadMutation.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Edit3 size={14} />
          )}
          {uploadMutation.isPending ? "Uploading..." : "Edit Banner"}
        </button>
      </div>

      <div className="w-full md:w-3/4 h-48 bg-gray-100 rounded-lg overflow-hidden border border-dashed border-gray-300 flex items-center justify-center relative">
        {isLoading || uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-sky-500" />
            {uploadMutation.isPending && (
              <span className="text-xs text-gray-500">Updating Banner...</span>
            )}
          </div>
        ) : (
          bannerData?.data?.image_url && (
            <Image
              src={bannerUrl}
              alt="Banner"
              fill
              className="object-cover"
              unoptimized
            />
          )
        )}
      </div>
    </div>
  );
}
