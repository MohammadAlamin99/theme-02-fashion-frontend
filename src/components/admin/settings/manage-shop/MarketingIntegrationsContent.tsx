"use client";

import React, { useEffect, useState } from "react";
import { Copy, Globe, Code, Loader2 } from "lucide-react";
import PrimaryButton from "../../common/PrimaryButton";
import toast from "react-hot-toast";
import {
  updateMarketingSettings,
  MarketingSettingsData,
  fetchMarketingSettings,
} from "../../products/add/marketingSettingsService";

const MarketingIntegrationsContent = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [settings, setSettings] = useState<MarketingSettingsData>({
    sitemapEnabled: false,
    gtmId: "",
    googleVerificationCode: "",
    fbFeedEnabled: false,
    fbPixelId: "",
    fbPixelAccessToken: "",
    fbPixelTestEventId: "",
    fbDomainVerificationCode: "",
    tiktokPixelId: "",
    tiktokPixelAccessToken: "",
    tiktokTestEventId: "",
    baseScript: "",
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchMarketingSettings();
      if (data) {
        setSettings({
          sitemapEnabled: data.sitemapEnabled ?? false,
          gtmId: data.gtmId ?? "",
          googleVerificationCode: data.googleVerificationCode ?? "",
          fbFeedEnabled: data.fbFeedEnabled ?? false,
          fbPixelId: data.fbPixelId ?? "",
          fbPixelAccessToken: data.fbPixelAccessToken ?? "",
          fbPixelTestEventId: data.fbPixelTestEventId ?? "",
          fbDomainVerificationCode: data.fbDomainVerificationCode ?? "",
          tiktokPixelId: data.tiktokPixelId ?? "",
          tiktokPixelAccessToken: data.tiktokPixelAccessToken ?? "",
          tiktokTestEventId: data.tiktokTestEventId ?? "",
          baseScript: data.baseScript ?? "",
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load marketing settings",
      );
    } finally {
      setLoading(false);
    }
  };

  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings();
    if (typeof window !== "undefined") {
      const apiHost =
        process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
        window.location.origin;
      setBaseUrl(apiHost);
    }
  }, []);

  const sitemapUrl = baseUrl
    ? `${baseUrl}/api/sitemaps.xml`
    : "Loading sitemap URL...";
  const fbFeedUrl = baseUrl
    ? `${baseUrl}/feed/product-catalog.csv`
    : "Loading feed URL...";

  const handleChange = (
    field: keyof MarketingSettingsData,
    value: string | boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await updateMarketingSettings(settings);
      toast.success("Marketing settings updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update marketing settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">
          Loading Marketing Integrations Settings...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 pb-20 font-lato text-gray-800 animate-in fade-in duration-500 bg-white p-6 rounded-lg"
    >
      {/* Page Header */}
      <div>
        <h3 className="text-[20px] font-medium font-lato mb-1">
          Marketing Integrations
        </h3>
        <p className="text-xs font-normal text-gray-400">
          Strategically Multiply Your Business Revenue.
        </p>
      </div>

      {/* 1. Sitemaps for Search Engine */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/admin/google.png"
              alt="Google"
              className="w-6 h-6 object-contain"
            />
            <div>
              <h4 className="text-[16px] font-normal text-black">
                Sitemaps for Search Engine
              </h4>
              <p className="text-xs font-normal text-gray-400">
                Add sitemaps to Google Search Console to Rank your website.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.sitemapEnabled}
              onChange={(e) => handleChange("sitemapEnabled", e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
        <input
          readOnly
          className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal text-gray-500 outline-none border border-transparent"
          value={sitemapUrl}
        />
      </section>

      {/* 2. Setup Google Tag Manager */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#4285F4] rounded flex items-center justify-center text-white font-bold text-[9px]">
            GTM
          </div>
          <h4 className="text-[16px] font-normal text-black">
            Setup Google Tag Manager
          </h4>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block tracking-wider px-1">
            GTM ID
          </label>
          <input
            className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
            placeholder="GTM ID"
            value={settings.gtmId}
            onChange={(e) => handleChange("gtmId", e.target.value)}
          />
        </div>
      </section>

      {/* 3. Google Domain Verification */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-3">
          <Globe size={22} className="text-[#4285F4]" />
          <h4 className="text-[16px] font-normal text-black">
            Google Domain Verification
          </h4>
        </div>
        <input
          className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
          placeholder="Domain Verification Code"
          value={settings.googleVerificationCode}
          onChange={(e) =>
            handleChange("googleVerificationCode", e.target.value)
          }
        />
      </section>

      {/* 4. Facebook Data Feed */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/admin/facebook.png"
              alt="FB"
              className="w-6 h-6 object-contain"
            />
            <div>
              <h4 className="text-[16px] font-normal text-black">
                Facebook Data Feed
              </h4>
              <p className="text-xs font-normal text-gray-400">
                Add/Upload data feed to the Facebook catalog.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.fbFeedEnabled}
              onChange={(e) => handleChange("fbFeedEnabled", e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
        <div className="relative flex items-center">
          <input
            readOnly
            className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal text-[#1DA1F2] outline-none border border-transparent pr-12"
            value={fbFeedUrl}
          />
          <button
            type="button"
            onClick={() => handleCopy(fbFeedUrl)}
            className="absolute right-4 text-gray-400 hover:text-[#1DA1F2] transition-colors"
          >
            <Copy size={18} />
          </button>
        </div>
      </section>

      {/* 5. Setup Facebook Conversion API and Pixel */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-3">
          <img src="/images/admin/meta.png" alt="Meta" className="h-4 w-auto" />
          <h4 className="text-[16px] font-normal text-black">
            Setup Facebook Conversion API and Pixel
          </h4>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block tracking-wider px-1">
              Pixel ID
            </label>
            <input
              className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
              placeholder="Pixel ID"
              value={settings.fbPixelId}
              onChange={(e) => handleChange("fbPixelId", e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block tracking-wider px-1">
              Pixel Access Token
            </label>
            <input
              className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
              placeholder="Pixel Access Token"
              value={settings.fbPixelAccessToken}
              onChange={(e) =>
                handleChange("fbPixelAccessToken", e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block tracking-wider px-1">
              Pixel Test Event Id
            </label>
            <span className="text-[11px] font-normal text-gray-400 block mb-2 px-1 italic">
              (Just to test. Clear after testing is done)
            </span>
            <input
              className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
              placeholder="Pixel Test Event Id"
              value={settings.fbPixelTestEventId}
              onChange={(e) =>
                handleChange("fbPixelTestEventId", e.target.value)
              }
            />
          </div>
        </div>
      </section>

      {/* 6. Base Script */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center text-emerald-500">
            <Code size={22} />
          </div>
          <h4 className="text-[16px] font-normal text-black">Base Script</h4>
        </div>
        <textarea
          className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 min-h-[120px] resize-none text-gray-600 leading-relaxed font-mono text-xs"
          placeholder="Paste your base script code here..."
          value={settings.baseScript}
          onChange={(e) => handleChange("baseScript", e.target.value)}
        />
      </section>

      {/* 7. Facebook Domain Verification */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-3">
          <Globe size={22} className="text-[#1877F2]" />
          <h4 className="text-[16px] font-normal text-black">
            Facebook Domain Verification
          </h4>
        </div>
        <input
          className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
          placeholder="Domain Verification Code"
          value={settings.fbDomainVerificationCode}
          onChange={(e) =>
            handleChange("fbDomainVerificationCode", e.target.value)
          }
        />
      </section>

      {/* 8. TikTok Pixel and Events API */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-3">
          <img
            src="/images/admin/tiktok.png"
            alt="TikTok"
            className="w-6 h-6 object-contain"
          />
          <h4 className="text-[16px] font-normal text-black">
            Setup TikTok Pixel and Events API
          </h4>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block tracking-wider px-1">
              TikTok Pixel ID
            </label>
            <input
              className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
              placeholder="TikTok Pixel ID"
              value={settings.tiktokPixelId}
              onChange={(e) => handleChange("tiktokPixelId", e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block tracking-wider px-1">
              TikTok Pixel Access Token
            </label>
            <input
              className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
              placeholder="TikTok Pixel Access Token"
              value={settings.tiktokPixelAccessToken}
              onChange={(e) =>
                handleChange("tiktokPixelAccessToken", e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block tracking-wider px-1">
              TikTok Pixel Test Event Code
            </label>
            <span className="text-[11px] font-normal text-gray-400 block mb-2 px-1 italic">
              (Optional - for testing. Clear after testing is done)
            </span>
            <input
              className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
              placeholder="TikTok Pixel Test Event Id"
              value={settings.tiktokTestEventId}
              onChange={(e) =>
                handleChange("tiktokTestEventId", e.target.value)
              }
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <PrimaryButton
          type="submit"
          disabled={saving}
          label={saving ? "Updating Settings..." : "Update Marketing Settings"}
          className="px-10 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
        />
      </div>
    </form>
  );
};

export default MarketingIntegrationsContent;
