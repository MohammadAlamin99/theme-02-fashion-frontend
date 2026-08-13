"use client";

import { useState, useEffect } from "react";
import { RotateCcw, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  fetchChatSettings,
  updateChatSettings,
} from "@/services-api/chatSettingsService";
import { ToggleSwitch } from "../ToggleSwitch";
import PrimaryButton from "../../common/PrimaryButton";
import TabItem from "../../catalog/TabItem";
import { usePathname, useRouter } from "next/navigation";
import ChatInterfaceIcon from "@/components/store-front/svg/svg/ChatInterfaceIcon";
import ShopSettingsIcon from "@/components/store-front/svg/svg/ShopSettingsIcon";
import ContentIcon from "@/components/store-front/svg/svg/ContentIcon";
import PhoneIcon from "@/components/store-front/svg/svg/PhoneIcon";
import WhatsappIcon from "@/components/store-front/svg/svg/WhatsappIcon";
import MessangerIcon from "@/components/store-front/svg/svg/MessangerIcon";

interface ChatSettingsData {
  enableLiveChat: boolean;
  whatsappFallback: boolean;
  welcomeMessage: string;
  offlineMessage: string;
  supportHourFrom: string;
  supportHourTo: string;
  phone: string;
  whatsappUrl: string;
  messengerUrl: string;
}

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  subLabel?: string;
}

const InputField = ({ label, placeholder, value, onChange, subLabel }: InputFieldProps) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-[14px] font-bold text-[#003032] font-lato">
      {label}
    </label>
    {subLabel && <p className="text-[10px] text-gray-400 -mt-1">{subLabel}</p>}
    <input
      type="text"
      placeholder={placeholder}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none placeholder:text-gray-400 font-poppins border-none"
    />
  </div>
);

export default function ChatSettingsPage() {
  const [activeSupport, setActiveSupport] = useState<"Phone" | "WhatsApp" | "Messenger">("Phone");
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ChatSettingsData>({
    enableLiveChat: false,
    whatsappFallback: false,
    welcomeMessage: "",
    offlineMessage: "",
    supportHourFrom: "",
    supportHourTo: "",
    phone: "",
    whatsappUrl: "",
    messengerUrl: "",
  });

  const { data: settings } = useQuery<ChatSettingsData>({
    queryKey: ["chatSettings"],
    queryFn: fetchChatSettings,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        enableLiveChat: settings.enableLiveChat ?? false,
        whatsappFallback: settings.whatsappFallback ?? false,
        welcomeMessage: settings.welcomeMessage ?? "",
        offlineMessage: settings.offlineMessage ?? "",
        supportHourFrom: settings.supportHourFrom ?? "",
        supportHourTo: settings.supportHourTo ?? "",
        phone: settings.phone ?? "",
        whatsappUrl: settings.whatsappUrl ?? "",
        messengerUrl: settings.messengerUrl ?? "",
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: updateChatSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSettings"] });
      queryClient.invalidateQueries({ queryKey: ["chat-settings"] });
      toast.success("Chat settings saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save settings. Please try again.");
    },
  });

  const handleSave = () => mutation.mutate(formData as unknown as Record<string, unknown>);

  const getPlatformValue = () => {
    if (activeSupport === "Phone") return formData.phone;
    if (activeSupport === "WhatsApp") return formData.whatsappUrl;
    return formData.messengerUrl;
  };

  const getPlatformPlaceholder = () => {
    if (activeSupport === "Phone") return "+8801712345678 or 01712345678";
    if (activeSupport === "WhatsApp") return "https://wa.me/8801712345678 or 01712345678";
    return "https://m.me/yourpage or www.facebook.com/messages/t/yourpage";
  };

  const setPlatformValue = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      [activeSupport === "Phone"
        ? "phone"
        : activeSupport === "WhatsApp"
          ? "whatsappUrl"
          : "messengerUrl"]: val,
    }));
  };

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

  return (
    <div className="w-full p-8 font-lato bg-white">
      <h1 className="text-2xl font-bold text-[#003032] mb-6">Settings</h1>

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

      <div className="flex justify-between items-center mb-8 bg-white">
        <h2 className="text-[22px] font-bold text-[#023337]">Chat settings</h2>
        <div className="flex gap-3">
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["chatSettings"] })
            }
            className="cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-[8px] bg-[#F9F9F9] text-[#020202] font-semibold text-sm"
          >
            <RotateCcw size={18} /> Reset
          </button>
          <PrimaryButton label="Save Changes" onClick={handleSave} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 font-poppins bg-white">
        <div className="bg-[#F9F9F9]/50 p-4 rounded-[8px] flex justify-between items-center">
          <div>
            <p className="text-[12px] font-medium text-[#000000]">
              Enable Live Chat
            </p>
            <p className="text-[10px] text-[#B9B9B9]">
              Allow customers to chat with you
            </p>
          </div>
          <ToggleSwitch
            active={formData.enableLiveChat}
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                enableLiveChat: !prev.enableLiveChat,
              }))
            }
          />
        </div>
        <div className="bg-[#F9F9F9]/50 p-4 rounded-[8px] flex justify-between items-center">
          <div>
            <p className="text-[12px] font-medium text-[#000000]">
              WhatsApp Fallback
            </p>
            <p className="text-[10px] text-[#B9B9B9]">
              Redirect to WhatsApp when chat disabled
            </p>
          </div>
          <ToggleSwitch
            active={formData.whatsappFallback}
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                whatsappFallback: !prev.whatsappFallback,
              }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12 bg-white">
        <div className="md:col-span-8 flex flex-col gap-6">
          <InputField
            label="Welcome Message"
            value={formData.welcomeMessage}
            onChange={(val: string) =>
              setFormData({ ...formData, welcomeMessage: val })
            }
            placeholder="Enter welcome message"
          />
          <InputField
            label="Offline Message"
            value={formData.offlineMessage}
            onChange={(val: string) =>
              setFormData({ ...formData, offlineMessage: val })
            }
            placeholder="Enter offline message"
          />
        </div>
        <div className="md:col-span-4 flex flex-col gap-6">
          <InputField
            label="Support Hour From"
            value={formData.supportHourFrom}
            onChange={(val: string) =>
              setFormData({ ...formData, supportHourFrom: val })
            }
            placeholder="09:00 AM"
          />
          <InputField
            label="Support Hour To"
            value={formData.supportHourTo}
            onChange={(val: string) =>
              setFormData({ ...formData, supportHourTo: val })
            }
            placeholder="09:00 PM"
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-[8px]">
        <h3 className="text-[20px] font-bold text-black mb-1">Chat Support</h3>
        <p className="text-[12px] text-[#6F6F6F] mb-6 font-poppins">
          Please provide your credentials to integrate
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            {[
              { id: "Phone" as const, icon: PhoneIcon },
              { id: "WhatsApp" as const, icon: WhatsappIcon },
              { id: "Messenger" as const, icon: MessangerIcon },
            ].map((plat) => (
              <button
                key={plat.id}
                type="button"
                onClick={() => setActiveSupport(plat.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-[8px] border transition-all cursor-pointer font-medium text-base ${activeSupport === plat.id ? "border-[#38BDF8] bg-[#F9F9F9]" : "border-[#F9F9F9] bg-[#F9F9F9]"}`}
              >
                <plat.icon /> {plat.id}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={getPlatformValue()}
              onChange={(e) => setPlatformValue(e.target.value)}
              placeholder={getPlatformPlaceholder()}
              className="flex-1 bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none font-poppins"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={mutation.isPending}
              className="bg-[#1E90FF] text-white px-10 py-3 rounded-[8px] text-sm font-semibold cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

