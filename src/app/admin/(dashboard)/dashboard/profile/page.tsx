"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useAdminProfileData, useAdminUpdateProfileMutation, useAdminUpdateAvatarMutation } from "@/hooks/useProfile";
import { User, Phone, Mail, Shield, Camera, Loader2 } from "lucide-react";

const AdminProfilePage = () => {
  const { data: profile, isLoading, isError, error } = useAdminProfileData();
  const updateProfile = useAdminUpdateProfileMutation();
  const uploadAvatar = useAdminUpdateAvatarMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (profile) {
      const rawUser = profile.user || profile.data || profile;
      setName(rawUser.name || "");
      setEmail(rawUser.email || "");
      
      const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:8082";
      if (rawUser.avatar) {
        setAvatarPreview(rawUser.avatar.startsWith("data:") || rawUser.avatar.startsWith("http") 
          ? rawUser.avatar 
          : `${backendBaseUrl}/${rawUser.avatar.replace(/^\/+/, "")}`
        );
      } else {
        setAvatarPreview(null);
      }
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return setStatus({ type: "error", text: "Image must be under 2MB." });
      }

      // Display virtual DOM local asset preview instantly
      const localUrl = URL.createObjectURL(file);
      setAvatarPreview(localUrl);
      setStatus(null);

      uploadAvatar.mutate(file, {
        onSuccess: () => {
          setStatus({ type: "success", text: "Admin avatar changed successfully!" });
        },
        onError: (err: any) => {
          setStatus({ type: "error", text: err.message || "Failed to upload avatar image file." });
        }
      });
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      return setStatus({ type: "error", text: "Name field cannot be left blank." });
    }

    setStatus(null);

    updateProfile.mutate(
      {
        name: cleanName,
        email: cleanEmail || undefined,
      },
      {
        onSuccess: () => {
          setStatus({ type: "success", text: "Profile modifications synchronized successfully!" });
        },
        onError: (err: any) => {
          setStatus({ type: "error", text: err.message || "Could not save adjustments." });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col items-center justify-center font-poppins gap-3">
        <Loader2 className="text-[#FF7050] animate-spin" size={32} />
        <span className="text-sm font-medium text-gray-500">Loading admin profile context...</span>
      </div>
    );
  }

  const currentRole = profile?.role || profile?.user?.role || "ADMIN";
  const isPendingState = updateProfile.isPending || uploadAvatar.isPending;

  return (
    
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 p-4 md:p-6 font-poppins text-black">
      <div className="max-w-3xl mx-auto bg-white rounded-[12px] border border-[#D2D2D2] overflow-hidden relative shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C]"></div>

        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left bg-white">
          
          <div className="relative group w-20 h-20 shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF9F1C] flex items-center justify-center text-white text-3xl font-bold shadow-xs overflow-hidden border-2 border-orange-100 relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase() || "A"
              )}
              {uploadAvatar.isPending && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                  <FaSpinner className="animate-spin" size={18} />
                </div>
              )}
            </div>
            
            {!uploadAvatar.isPending && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity outline-none"
              >
                <Camera size={20} />
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-black">{name || "Admin Details"}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Management Control Portal Settings</p>
          </div>
        </div>

        <form onSubmit={handleSaveChanges} className="p-6 flex flex-col gap-6">
          {(status || isError) && (
            <div
              className={`flex items-center gap-3 text-sm font-medium p-4 rounded-[8px] border transition-all ${
                status?.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {status?.type === "success" ? <FaCheckCircle size={16} /> : <FaExclamationCircle size={16} />}
              <span>{status?.text || error?.message}</span>
            </div>
          )}

          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Account Parameters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-[#F9F9F9] rounded-[8px] border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
              <User className="text-[#FF7050] shrink-0" size={20} />
              <div className="flex-1">
                <label className="text-[11px] text-gray-400 block font-semibold uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-800 font-medium border-none outline-none mt-0.5 p-0 focus:ring-0"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#F9F9F9] rounded-[8px] border border-transparent opacity-70 cursor-not-allowed">
              <Phone className="text-gray-400 shrink-0" size={20} />
              <div className="flex-1">
                <label className="text-[11px] text-gray-400 block font-semibold uppercase">Phone Number</label>
                <input
                  type="text"
                  value={profile?.phone || profile?.user?.phone || ""}
                  disabled
                  className="w-full bg-transparent text-sm text-gray-500 font-medium border-none outline-none mt-0.5 p-0 cursor-not-allowed focus:ring-0"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#F9F9F9] rounded-[8px] border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
              <Mail className="text-[#FF7050] shrink-0" size={20} />
              <div className="flex-1">
                <label className="text-[11px] text-gray-400 block font-semibold uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-800 font-medium border-none outline-none mt-0.5 p-0 focus:ring-0"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#F9F9F9] rounded-[8px] border border-transparent opacity-80">
              <Shield className="text-[#FF7050] shrink-0" size={20} />
              <div>
                <span className="text-[11px] text-gray-400 block font-semibold uppercase">Privilege Role</span>
                <span className="text-sm font-bold text-[#FF6A00] tracking-wide block mt-0.5">
                  {currentRole}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isPendingState}
              className="text-white px-6 py-3 rounded-[8px] text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all hover:brightness-105"
              style={{ background: "linear-gradient(180deg, #FF6A00 0%, #FF9F1C 100%)" }}
            >
              {updateProfile.isPending && <FaSpinner className="animate-spin" size={14} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfilePage;