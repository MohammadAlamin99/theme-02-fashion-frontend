"use client";

import { useRef, useState } from "react";
import {
  Save,
  Camera,
  Lock,
  ArrowRight,
  User,
  Mail,
  MapPin,
  Phone,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useAdminUpdateProfileMutation,
  useAdminUpdateAvatarMutation,
} from "@/hooks/useProfile";
import { Profile, ProfileFormData } from "@/@types/profile.type";
import InputField from "./Inputfield";
import PasswordModal from "./Passwordmodal";
import { useAuthStore } from "@/store/useAuthStore";
import { deleteAdminSessionToken } from "@/app/actions/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
interface ProfileFormProps {
  profile: Profile;
  refetch: () => void;
}

const resolveAvatarUrl = (avatarPath?: string): string | null => {
  if (!avatarPath) return null;
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";
  return `${baseUrl}/${avatarPath.replace(/^\/+/, "")}`;
};

const buildInitialFormData = (profile: Profile): ProfileFormData => {
  const user = profile.user ?? profile;
  const primaryAddress =
    user.addresses?.find((a) => a.label === "PRIMARY")?.address || "";
  return {
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: primaryAddress,
  };
};
const ProfileForm = ({ profile, refetch }: ProfileFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateProfile = useAdminUpdateProfileMutation();
  const uploadAvatar = useAdminUpdateAvatarMutation();

  const [formData, setFormData] = useState<ProfileFormData>(() =>
    buildInitialFormData(profile),
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(() =>
    resolveAvatarUrl((profile.user ?? profile).avatar),
  );
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const clearAdminAuth = useAuthStore(
    (state) => state.clearAdminAuth || state.clearAuth,
  );
  const [fallbackYear] = useState(() => new Date().getFullYear());
  const ownerSinceYear = profile.created_at
    ? new Date(profile.created_at).getFullYear()
    : fallbackYear;

  const handleSave = () => {
    updateProfile.mutate(
      {
        name: formData.name,
        email: formData.email,
        primaryAddress: formData.address,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated !");
          refetch();
        },
        onError: () => toast.error("Profile update failed !"),
      },
    );
  };

  const handleAvatarChange = (file: File) => {
    setAvatarPreview(URL.createObjectURL(file));
    uploadAvatar.mutate(file, { onSuccess: () => refetch() });
  };

  const handleLogout = async () => {
    try {
      // 1. Clear React Query Cache
      queryClient.clear();

      // 2. Clear Admin Auth State in Zustand
      if (clearAdminAuth) {
        clearAdminAuth();
      }
      await deleteAdminSessionToken();
      router.refresh();
      router.push("/admin/dashboard/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[22px] font-bold text-[#023337]">
          Profile Details
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1DA1F2] text-white font-semibold text-sm"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className="relative w-24 h-24">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-100">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
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
              if (file) handleAvatarChange(file);
            }}
            className="hidden"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{formData.name}</h2>
          <span className="px-3 py-0.5 rounded-full border border-[#FF7050] text-[#FF7050] text-xs font-semibold">
            Owner since {ownerSinceYear}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Name"
          value={formData.name}
          onChange={(v) => setFormData({ ...formData, name: v })}
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
          onChange={(v) => setFormData({ ...formData, email: v })}
          icon={Mail}
        />
        <InputField
          label="Address"
          value={formData.address}
          onChange={(v) => setFormData({ ...formData, address: v })}
          icon={MapPin}
        />

        <button
          onClick={() => setIsPassModalOpen(true)}
          className="flex items-center justify-between bg-[#F9F9F9] p-4 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-100 w-full"
        >
          <div className="flex items-center gap-3">
            <Lock size={20} />{" "}
            <span className="text-sm font-semibold">Change Password</span>
          </div>
          <ArrowRight size={20} />
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-[#FF7050] hover:bg-orange-50 rounded-[8px] transition-all font-semibold text-sm cursor-pointer border-none bg-transparent"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {isPassModalOpen && (
        <PasswordModal
          onClose={() => setIsPassModalOpen(false)}
          onRedirect={handleLogout}
        />
      )}
    </>
  );
};

export default ProfileForm;
