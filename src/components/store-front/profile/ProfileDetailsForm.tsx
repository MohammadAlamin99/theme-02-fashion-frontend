"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaCamera,
} from "react-icons/fa";
import {
  useProfileData,
  useUpdateProfileMutation,
  useUpdateCustomerAvatarMutation,
  useAddAddressMutation,
} from "@/hooks/useProfile";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";
import Image from "next/image";

interface AddressItem {
  id?: string;
  address: string;
  label: "PRIMARY" | "CUSTOM";
}

const ProfileDetailsForm = () => {
  // 🚀 Declarative SaaS-Level State Orchestration via custom TanStack Query hooks
  const { data: profile, isLoading, isError, error } = useProfileData();

  const updateProfile = useUpdateProfileMutation();
  const uploadAvatar = useUpdateCustomerAvatarMutation(); // 🚀 FIXED: Initialized the avatar mutation handler
  const addAddress = useAddAddressMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [primaryAddress, setPrimaryAddress] = useState("");
  const [newAddressInput, setNewAddressInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  // Keep local inputs in sync with backend server cache pipeline data updates
  useEffect(() => {
    if (profile) {
      const rawUser = profile.user || profile.data || profile;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(rawUser.name || "");
      setEmail(rawUser.email || "");

      // Calculate active base paths matching backend upload static server configuration assets
      const backendBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
        "http://localhost:8082";
      if (rawUser.avatar) {
        setAvatarPreview(
          rawUser.avatar.startsWith("data:") ||
            rawUser.avatar.startsWith("http")
            ? rawUser.avatar
            : `${backendBaseUrl}/${rawUser.avatar.replace(/^\/+/, "")}`,
        );
      } else {
        setAvatarPreview(null);
      }

      const addressList = profile.addresses || rawUser.addresses || [];
      if (Array.isArray(addressList)) {
        const primary = addressList.find(
          (addr: AddressItem) => addr.label === "PRIMARY",
        );
        setPrimaryAddress(primary ? primary.address : "");
      }
    }
  }, [profile]);

  const handleSaveChanges = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      return setStatus({
        type: "error",
        text: t.profileDetails.validation.blankName,
      });
    }
    if (cleanName.length < 2) {
      return setStatus({
        type: "error",
        text: t.profileDetails.validation.shortName,
      });
    }

    if (cleanEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanEmail)) {
        return setStatus({
          type: "error",
          text: t.profileDetails.validation.invalidEmail,
        });
      }
    }

    setStatus(null);
    updateProfile.mutate(
      {
        name: cleanName,
        email: cleanEmail || undefined,
        primaryAddress: primaryAddress.trim() || undefined,
      },
      {
        onSuccess: () => {
          setStatus({
            type: "success",
            text: t.profileDetails.success.profileUpdated,
          });
        },
        onError: (err: unknown) => {
          if (err instanceof Error) {
            setStatus({
              type: "error",
              text: err.message || t.profileDetails.error.saveFailed,
            });
          }
        },
      },
    );
  };

  const handleAddNewAddress = () => {
    const cleanAddress = newAddressInput.trim();
    if (!cleanAddress) return;

    setStatus(null);
    addAddress.mutate(cleanAddress, {
      onSuccess: () => {
        setNewAddressInput("");
        setStatus({
          type: "success",
          text: t.profileDetails.success.addressAdded,
        });
      },
      onError: (err: unknown) => {
        if (err instanceof Error) {
          setStatus({
            type: "error",
            text: err.message || t.profileDetails.error.addressFailed,
          });
        }
      },
    });
  };

  const handleCustomerImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return setStatus({
          type: "error",
          text: t.profileDetails.validation.imageSize,
        });
      }

      // Instantly generate object url for instant frontend UI render feedback
      const localUrl = URL.createObjectURL(file);
      setAvatarPreview(localUrl);
      setStatus(null);

      uploadAvatar.mutate(file, {
        onSuccess: () => {
          setStatus({
            type: "success",
            text: t.profileDetails.success.avatarUpdated,
          });
        },
        onError: (err: unknown) => {
          if (err instanceof Error) {
            setStatus({
              type: "error",
              text: err.message || t.profileDetails.error.uploadFailed,
            });
          }
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 font-poppins gap-3">
        <FaSpinner className="animate-spin text-[#FF7050]" size={32} />
        <p className="text-sm">{t.profileDetails.loading}</p>
      </div>
    );
  }

  const customAddresses = (
    profile?.addresses ||
    profile?.user?.addresses ||
    []
  ).filter((addr: AddressItem) => addr.label === "CUSTOM");

  const isPendingState = updateProfile.isPending || uploadAvatar.isPending;

  return (
    <div className="bg-white rounded-[12px] border border-[#D2D2D2] overflow-hidden font-poppins">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-black">
          {t.profileDetails.title}
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          {t.profileDetails.subtitle}
        </p>
      </div>

      <div className="p-6 flex flex-col gap-8">
        {(status || isError) && (
          <div
            className={`flex items-center gap-3 text-sm font-medium p-4 rounded-[8px] border transition-all ${
              status?.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {status?.type === "success" ? (
              <FaCheckCircle size={16} />
            ) : (
              <FaExclamationCircle size={16} />
            )}
            <span>{status?.text || error?.message}</span>
          </div>
        )}

        {/* 🚀 FIXED: Dynamic Interactive Profile Picture Widget Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAFAFA] p-4 rounded-[10px] border border-dashed border-gray-200">
          <div className="relative group w-16 h-16 shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF9F1C] flex items-center justify-center text-white text-xl font-bold overflow-hidden border-2 border-white shadow-xs relative">
              {avatarPreview ? (
                <Image
                  width={64}
                  height={64}
                  src={avatarPreview}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                name.charAt(0).toUpperCase() || "U"
              )}
              {uploadAvatar.isPending && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                  <FaSpinner className="animate-spin" size={14} />
                </div>
              )}
            </div>

            {!uploadAvatar.isPending && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer outline-none"
              >
                <FaCamera size={14} />
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCustomerImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-semibold text-black">
              {t.profileDetails.avatarTitle}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {t.profileDetails.avatarSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#727272]">
              {t.profileDetails.name}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F9F9F9] rounded-[10px] p-4 text-sm text-gray-700 outline-none border border-transparent focus:border-gray-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#727272]">
              {t.profileDetails.phone}
            </label>
            <input
              type="text"
              value={profile?.phone || profile?.user?.phone || ""}
              disabled
              placeholder={t.profileDetails.phonePlaceholder}
              className="w-full bg-[#F9F9F9] rounded-[10px] p-4 text-sm text-gray-700 outline-none border border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-[#727272]">
              {t.profileDetails.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F9F9F9] rounded-[10px] p-4 text-sm text-gray-700 outline-none border border-transparent focus:border-gray-200"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 relative">
          <label className="text-base font-semibold text-[#727272]">
            {t.profileDetails.primaryAddress}
          </label>
          <textarea
            className="w-full bg-[#F9F9F9] rounded-[10px] p-5 text-sm text-gray-700 outline-none min-h-[140px] resize-none border border-transparent focus:border-gray-200"
            value={primaryAddress}
            onChange={(e) => setPrimaryAddress(e.target.value)}
            placeholder={t.profileDetails.addressPlaceholder}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSaveChanges}
              disabled={isPendingState}
              className="bg-[#32CD32] hover:bg-[#2cb92c] transition-colors text-white px-6 py-3 rounded-[12px] text-base font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {updateProfile.isPending && (
                <FaSpinner className="animate-spin" size={16} />
              )}
              {t.profileDetails.saveChanges}
            </button>
          </div>
        </div>

        {customAddresses.map((addr: AddressItem, index: number) => (
          <div
            key={addr?.id || `address-key-${index}`}
            className="flex flex-col gap-2"
          >
            <label className="text-base font-semibold text-[#727272]">
              {t.Address} {index + 2}
            </label>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <input
                className="w-full bg-[#F9F9F9] rounded-[10px] p-4 text-sm text-gray-700 outline-none border border-transparent"
                value={addr?.address || ""}
                readOnly
              />
              <button className="w-full md:w-[150px] bg-[#FF7050] text-white py-3.5 rounded-[10px] text-sm font-bold hover:bg-[#e66345] transition-all cursor-pointer shadow-sm">
                {t.profileDetails.select}
              </button>
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-[#727272]">
            {t.profileDetails.newAddress}
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              className="w-full bg-[#F9F9F9] rounded-[10px] p-4 text-sm text-gray-700 outline-none border border-transparent focus:border-gray-200"
              placeholder={t.profileDetails.newAddressPlaceholder}
              value={newAddressInput}
              onChange={(e) => setNewAddressInput(e.target.value)}
            />
            <button
              onClick={handleAddNewAddress}
              disabled={addAddress.isPending || !newAddressInput.trim()}
              className="w-full md:w-[150px] bg-[#FF7050] text-white py-3.5 rounded-[10px] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#e66345] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {addAddress.isPending ? (
                <FaSpinner className="animate-spin" size={14} />
              ) : (
                <div className="border-2 border-white rounded-full p-0.5">
                  <PlusIconShim />
                </div>
              )}
              {t.profileDetails.addNew}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlusIconShim = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 448 512"
    height="10"
    width="10"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M416 208H240V32c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v176H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v176c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h176c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
  </svg>
);

export default ProfileDetailsForm;
