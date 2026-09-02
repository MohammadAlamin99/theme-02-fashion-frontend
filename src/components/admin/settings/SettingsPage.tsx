"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  useForm,
  FormProvider,
  useFormContext,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateSettings } from "@/services-api/settingsService";
import { RotateCcw, Plus, User, Trash2 } from "lucide-react";

// Components
import CrystalOrangeButton from "./CrystalOrangeButton";
import { LogoUploadCard } from "./LogoUploadCard";
import { RichTextSection } from "./RichTextSection";
import TabItem from "../catalog/TabItem";
import ContentIcon from "@/components/store-front/svg/svg/ContentIcon";
import ChatInterfaceIcon from "@/components/store-front/svg/svg/ChatInterfaceIcon";
import PrimaryButton from "../common/PrimaryButton";
import toast from "react-hot-toast";
import ShopSettingsIcon from "@/components/store-front/svg/svg/ShopSettingsIcon";

const InputGroup = ({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) => {
  const { register } = useFormContext();
  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-[15px] font-bold text-[#000000] font-lato">
        {label}
      </label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="bg-[#F9F9F9] rounded-lg px-4 py-3 text-base outline-none placeholder:text-[#A2A2A2] border-none font-poppins"
      />
    </div>
  );
};

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface SettingsData {
  social_links: SocialLink[];
  offers: unknown[];
  chat_support: Record<string, unknown>;
  site_toggles: Record<string, unknown>;
  primary_logo: string;
  header_logo: string;
  footer_logo: string;
  favicon: string;
  announcement: string;
  contact_email: string;
  branding_text: string;
  address: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const methods = useForm<SettingsData>({
    defaultValues: {
      social_links: [],
      offers: [],
      chat_support: {},
      site_toggles: {},
    },
  });
  const { handleSubmit, reset, control } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "social_links",
  });
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update settings!");
    },
  });

  useEffect(() => {
    if (settings) {
      // Look at your screenshot: the actual data is inside "data"
      const settingsData = settings.data || settings;
      reset(settingsData);
    }
  }, [settings, reset]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit((d) =>
          mutation.mutate(d as unknown as Record<string, unknown>),
        )}
        className="w-full bg-white p-4 font-lato"
      >
        <h1 className="text-2xl font-bold text-[#003032] mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-none">
          {[
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
            {
              id: "shop",
              label: "Manage Shop",
              icon: ShopSettingsIcon,
              path: "/admin/dashboard/settings/manage-shop",
            },
            {
              id: "profile",
              label: "Profile Details",
              icon: User,
              path: "/admin/dashboard/settings/profile",
            },
          ].map((tab) => (
            <TabItem
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={pathname === tab.path}
              onClick={() => router.push(tab.path)}
            />
          ))}
        </div>

        {/* Header Row */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-[#003032]">
            Website Information
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="flex items-center gap-2 px-6 py-3 rounded-[8px] bg-[#F9F9F9] text-sm font-semibold"
            >
              <RotateCcw size={18} /> Reset
            </button>
            <PrimaryButton
              label={mutation.isPending ? "Saving..." : "Save Changes"}
              type="submit"
            />
          </div>
        </div>

        {/* Logo Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Controller
            name="primary_logo"
            render={({ field: { onChange, value } }) => (
              <LogoUploadCard
                title="Primary Logo"
                value={value}
                onChange={onChange}
              />
            )}
          />
          <Controller
            name="header_logo"
            render={({ field: { onChange, value } }) => (
              <LogoUploadCard
                title="Header Logo"
                value={value}
                onChange={onChange}
              />
            )}
          />
          <Controller
            name="footer_logo"
            render={({ field: { onChange, value } }) => (
              <LogoUploadCard
                title="Footer Logo"
                value={value}
                onChange={onChange}
              />
            )}
          />
          <Controller
            name="favicon"
            render={({ field: { onChange, value } }) => (
              <LogoUploadCard
                title="Favicon"
                value={value}
                onChange={onChange}
              />
            )}
          />
        </div>

        {/* Basic Forms Section */}
        <div className="flex flex-col gap-6 mb-10">
          {/* The first 4 inputs in a 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <InputGroup
              label="Announcement"
              name="announcement"
              placeholder="Text"
            />
            <InputGroup
              label="Email"
              name="contact_email"
              placeholder="xyz@gmail.com"
            />
            <InputGroup
              label="Branding Text"
              name="branding_text"
              placeholder="Your Brand Text"
            />
            <InputGroup
              label="Address"
              name="address"
              placeholder="Your Address"
            />
          </div>

          {/* Social Links Section - Full Width */}
          <div className="flex flex-col gap-4 mt-2">
            <h3 className="text-[15px] font-bold text-[#000000] font-lato">
              Social Links
            </h3>

            {fields.map((f, i) => (
              <div
                key={f.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
              >
                <div className="md:col-span-5">
                  <InputGroup
                    name={`social_links.${i}.platform`}
                    label=""
                    placeholder="Platform"
                  />
                </div>
                <div className="md:col-span-5">
                  <InputGroup
                    name={`social_links.${i}.url`}
                    label=""
                    placeholder="URL"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="w-full h-[48px] flex items-center justify-center bg-[#FFF1F1] text-[#FF4D4D] rounded-[8px] hover:bg-[#ffe0e0] transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-2">
              <CrystalOrangeButton
                label="Add New Link"
                type="button"
                icon={<Plus size={20} />}
                onClick={() => append({ id: "", platform: "", url: "" })}
              />
            </div>
          </div>
        </div>
        <RichTextSection
          title="About us"
          name="about_content"
          placeholder="About Your Brand"
        />
        <RichTextSection
          title="Privacy Policy"
          name="privacy_content"
          placeholder="Shop Privacy And Policy"
        />
        <RichTextSection
          title="Terms and Condition"
          name="terms_content"
          placeholder="Shop Terms And Conditions"
        />
        <RichTextSection
          title="Return and Cancellation Policy"
          name="return_content"
          placeholder="Return and Cancellation Policy"
        />
      </form>
    </FormProvider>
  );
}
