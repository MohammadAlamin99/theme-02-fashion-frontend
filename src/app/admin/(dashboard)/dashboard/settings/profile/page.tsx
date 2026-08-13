"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  RotateCcw,
  Save,
  Camera,
  Lock,
  ArrowRight,
  User,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  useAdminProfileData,
  useAdminUpdateProfileMutation,
  useAdminUpdateAvatarMutation,
} from "@/hooks/useProfile";
import { apiFetch } from "@/utils/api";
import TabItem from "../../../../../../components/admin/catalog/TabItem";
import ContentIcon from "@/components/store-front/svg/svg/ContentIcon";
import ChatInterfaceIcon from "@/components/store-front/svg/svg/ChatInterfaceIcon";
import ShopSettingsIcon from "@/components/store-front/svg/svg/ShopSettingsIcon";

const AdminProfilePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: profile, isLoading, refetch } = useAdminProfileData();
  const updateProfile = useAdminUpdateProfileMutation();
  const uploadAvatar = useAdminUpdateAvatarMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const tabs = [
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
    // {
    //   id: "shop",
    //   label: "Manage Shop",
    //   icon: ShopSettingsIcon,
    //   path: "/admin/dashboard/settings/manage-shop",
    // },
    {
      id: "profile",
      label: "Profile Details",
      icon: User,
      path: "/admin/dashboard/settings/profile",
    },
  ];

  useEffect(() => {
    if (profile) {
      const user = profile.user || profile;
      const primaryAddress =
        user.addresses?.find((a: any) => a.label === "PRIMARY")?.address || "";
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: primaryAddress,
      });
      if (user.avatar) {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
          "http://localhost:8082";
        setAvatarPreview(`${baseUrl}/${user.avatar.replace(/^\/+/, "")}`);
      }
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate(
      {
        name: formData.name,
        email: formData.email,
        primaryAddress: formData.address,
      },
      {
        onSuccess: () => {
          alert("Profile updated!");
          refetch();
        },
        onError: (err: any) => alert(err.message),
      },
    );
  };

  const handleLogout = async () => {
    await apiFetch("/users/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="w-full p-8 font-lato bg-white">
      <h1 className="text-2xl font-bold text-[#003032] mb-6">Settings</h1>

      {/* Tab Navigation exactly like ChatSettingsPage */}
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

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[22px] font-bold text-[#023337]">
          Profile Details
        </h2>
        <div className="flex gap-3">
          {/* <button onClick={() => refetch()} className="cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-[8px] bg-[#F9F9F9] font-semibold text-sm">
            <RotateCcw size={18} /> Reset
          </button> */}
          <button
            onClick={handleSave}
            className="cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-[8px] bg-[#1DA1F2] text-white font-semibold text-sm"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className="relative w-24 h-24">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-100">
            {avatarPreview ? (
              <img src={avatarPreview} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-gray-400" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border shadow-sm cursor-pointer"
          >
            <Camera size={16} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAvatarPreview(URL.createObjectURL(file));
                uploadAvatar.mutate(file, { onSuccess: () => refetch() });
              }
            }}
            className="hidden"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{formData.name}</h2>
          <span className="px-3 py-0.5 rounded-full border border-[#FF7050] text-[#FF7050] text-xs font-semibold">
            Owner since{" "}
            {new Date(profile?.created_at || Date.now()).getFullYear()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Name"
          value={formData.name}
          onChange={(v: string) => setFormData({ ...formData, name: v })}
          icon={User}
        />
        <InputField
          label="Phone"
          value={formData.phone}
          disabled
          icon={Phone}
        />
        <InputField
          label="Email"
          value={formData.email}
          onChange={(v: string) => setFormData({ ...formData, email: v })}
          icon={Mail}
        />
        <InputField
          label="Address"
          value={formData.address}
          onChange={(v: string) => setFormData({ ...formData, address: v })}
          icon={MapPin}
        />

        <button
          onClick={() => setIsPassModalOpen(true)}
          className="flex items-center justify-between bg-[#F9F9F9] p-4 rounded-[8px] cursor-pointer hover:bg-gray-100 border border-gray-100 w-full"
        >
          <div className="flex items-center gap-3">
            <Lock size={20} />{" "}
            <span className="text-sm font-semibold">Change Password</span>
          </div>
          <ArrowRight size={20} />
        </button>
      </div>

      {isPassModalOpen && (
        <PasswordModal
          onClose={() => setIsPassModalOpen(false)}
          onRedirect={handleLogout}
        />
      )}
    </div>
  );
};

const PasswordModal = ({ onClose, onRedirect }: any) => {
  const [data, setData] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/users/change-password", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Incorrect current password.");
      setSuccess(true);
      setTimeout(() => onRedirect(), 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-[350px] shadow-2xl">
        {success ? (
          <div className="text-center py-6">
            <CheckCircle2 className="text-green-500 mx-auto mb-2" size={48} />{" "}
            <h3 className="font-bold">Password Changed!</h3>{" "}
            <p className="text-sm text-gray-500">Redirecting...</p>
          </div>
        ) : (
          <>
            <h3 className="font-bold mb-4">Change Password</h3>
            <input
              type="password"
              placeholder="Current Password"
              className="w-full p-3 bg-gray-50 rounded mb-3 border outline-none"
              onChange={(e) =>
                setData({ ...data, currentPassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 bg-gray-50 rounded mb-4 border outline-none"
              onChange={(e) =>
                setData({ ...data, newPassword: e.target.value })
              }
            />
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 p-2 bg-gray-100 rounded"
              >
                Cancel
              </button>{" "}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 p-2 bg-[#1DA1F2] text-white rounded"
              >
                {loading ? "Saving..." : "Confirm"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  icon: Icon,
  disabled = false,
}: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold">{label}</label>
    <div className="flex items-center bg-[#F9F9F9] rounded-[8px] px-3 border border-gray-100">
      <Icon size={16} className="text-gray-400 mr-2" />
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent p-3 border-none outline-none"
      />
    </div>
  </div>
);

export default AdminProfilePage;
