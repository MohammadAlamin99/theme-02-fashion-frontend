"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { Edit3, Loader2, Info, X, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadMainBanner } from "@/services-api/blogService";
import toast from "react-hot-toast";

interface BannerResponse {
  data: {
    image_url: string;
  };
}

interface Props {
  bannerData: BannerResponse | null | undefined;
  isLoading: boolean;
}

// Keep in sync with backend ImageUploadInterceptor config for 'upload-banner'
const BANNER_WIDTH = 1920;
const BANNER_HEIGHT = 450;
const BANNER_MAX_SIZE_MB = 5; // adjust to match actual backend limit

export default function BannerSection({ bannerData, isLoading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Local preview state — holds the selected file's object URL until upload settles
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const uploadMutation = useMutation<BannerResponse, Error, File>({
    mutationFn: (file: File) => uploadMainBanner(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["main-banner"] });
      toast.success("Main banner updated successfully!");
      setJustUploaded(true);
      // Brief "saved" confirmation, then hand off to the real server image
      setTimeout(() => {
        setJustUploaded(false);
        revokePreview();
      }, 900);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload banner");
      // Keep the local preview visible on failure so the user doesn't lose their selection
    },
  });

  const revokePreview = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rawImageUrl = bannerData?.data?.image_url;
  const bannerUrl = rawImageUrl?.startsWith("http")
    ? rawImageUrl
    : `${backendBaseUrl}/${rawImageUrl?.replace(/^\/+/, "")}`;

  const validateAndUpload = (file: File) => {
    const maxBytes = BANNER_MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Image must be smaller than ${BANNER_MAX_SIZE_MB}MB`);
      return;
    }

    // Revoke any previous preview before creating a new one
    revokePreview();
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    uploadMutation.mutate(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
    e.target.value = "";
  };

  const handleCancelPreview = () => {
    revokePreview();
  };
  const showingPreview = !!previewUrl;

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

        {/* Size guide */}
        <div className="flex items-start gap-1.5 mt-2 text-xs text-gray-500 font-poppins">
          <Info size={13} className="mt-[1px] shrink-0" />
          <p>
            Recommended size: {BANNER_WIDTH} × {BANNER_HEIGHT}px
            <br />
            (Auto-resized on upload · max {BANNER_MAX_SIZE_MB}MB)
          </p>
        </div>

        {/* Discard local preview if upload failed */}
        {showingPreview && uploadMutation.isError && (
          <button
            onClick={handleCancelPreview}
            className="flex items-center gap-1 mt-2 text-xs text-red-500 hover:text-red-600 font-poppins"
          >
            <X size={12} />
            Discard preview
          </button>
        )}
      </div>

      <div className="w-full md:w-3/4 h-48 bg-gray-100 rounded-lg overflow-hidden border border-dashed border-gray-300 flex items-center justify-center relative">
        {showingPreview ? (
          <>
            {/* Live preview — same object-cover crop as the real banner, so it's a true WYSIWYG */}
            <Image
              src={previewUrl!}
              alt="Banner preview"
              width={BANNER_WIDTH}
              height={BANNER_HEIGHT}
              className="object-cover"
              unoptimized
            />
            {uploadMutation.isPending && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-white" size={22} />
                <span className="text-xs text-white font-poppins">
                  Uploading...
                </span>
              </div>
            )}
            {justUploaded && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                <div className="bg-white rounded-full p-1.5">
                  <Check size={16} className="text-green-600" />
                </div>
                <span className="text-xs text-white font-poppins">Saved</span>
              </div>
            )}
            {uploadMutation.isError && (
              <div className="absolute bottom-0 inset-x-0 bg-red-500/90 text-white text-xs text-center py-1 font-poppins">
                Upload failed — showing local preview only
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-sky-500" />
          </div>
        ) : bannerData?.data?.image_url ? (
          <Image
            src={bannerUrl}
            alt="Banner"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-xs text-gray-400 font-poppins">
            No banner uploaded yet
          </span>
        )}
      </div>
    </div>
  );
}
