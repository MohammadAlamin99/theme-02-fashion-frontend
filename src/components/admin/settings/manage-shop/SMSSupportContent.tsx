"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchSmsSettings,
  updateSmsSettings,
  saveSmsProviderCredentials,
  sendTestSms,
  SmsProvider,
  SmsTriggers,
} from "../../products/add/smsSettingsService";

const AVAILABLE_PROVIDERS = [
  { id: "bdbulksms", name: "BDBULKSMS.NET", logo: "/images/admin/smsbd.png" },
  { id: "greenweb", name: "Greenweb BD", logo: "/images/admin/smsbd.png" },
  { id: "sslwireless", name: "SSL Wireless", logo: "/images/admin/smsbd.png" },
  { id: "mamberit", name: "Mamber IT", logo: "/images/admin/smsbd.png" },
  { id: "twilio", name: "Twilio SMS", logo: "/images/admin/smsbd.png" },
];

const TRIGGER_KEYS: { key: keyof SmsTriggers; label: string }[] = [
  { key: "orderPlaced", label: "Order Placed" },
  { key: "orderConfirmed", label: "Order Confirmed" },
  { key: "orderDelivered", label: "Order Delivered" },
  { key: "orderCanceled", label: "Order Canceled" },
  { key: "adminNotification", label: "Admin Notification" },
  { key: "accountRegistered", label: "Account registered" },
  { key: "accountLogin", label: "Account Login" },
];

const SMSSupportContent = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savingProvider, setSavingProvider] = useState<boolean>(false);
  const [sendingTest, setSendingTest] = useState<boolean>(false);

  // Form State for Provider Integration
  const [selectedProviderId, setSelectedProviderId] =
    useState<string>("bdbulksms");
  const [senderId, setSenderId] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [apiSecret, setApiSecret] = useState<string>("");

  // Settings State
  const [activeProvider, setActiveProvider] = useState<string>("bdbulksms");
  const [providers, setProviders] = useState<SmsProvider[]>([]);
  const [triggers, setTriggers] = useState<SmsTriggers>({
    orderPlaced: true,
    orderConfirmed: false,
    orderDelivered: false,
    orderCanceled: false,
    adminNotification: false,
    accountRegistered: false,
    accountLogin: false,
  });

  const [orderMessage, setOrderMessage] = useState<string>("");
  const [authMessage, setAuthMessage] = useState<string>("");
  const [adminMessage, setAdminMessage] = useState<string>("");
  const [testPhone, setTestPhone] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const data = await fetchSmsSettings();
        if (!isMounted) return;

        if (data) {
          setActiveProvider(data.activeProvider || "bdbulksms");
          setProviders(data.providers || []);
          if (data.triggers) {
            setTriggers(data.triggers);
          }
          setOrderMessage(data.orderMessage || "");
          setAuthMessage(data.authMessage || "");
          setAdminMessage(data.adminMessage || "");

          // Prefill provider form if available
          const currentSelected = (data.providers || []).find(
            (p) => p.providerId === selectedProviderId,
          );
          if (currentSelected) {
            setSenderId(currentSelected.senderId || "");
            setApiKey(currentSelected.apiKey || "");
            setApiSecret(currentSelected.apiSecret || "");
          }
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load SMS settings",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [selectedProviderId]);

  // Sync inputs when user changes provider dropdown
  const handleSelectProviderChange = (providerId: string) => {
    setSelectedProviderId(providerId);
    const found = providers.find((p) => p.providerId === providerId);
    if (found) {
      setSenderId(found.senderId || "");
      setApiKey(found.apiKey || "");
      setApiSecret(found.apiSecret || "");
    } else {
      setSenderId("");
      setApiKey("");
      setApiSecret("");
    }
  };

  const handleSaveProviderCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProv = AVAILABLE_PROVIDERS.find(
      (p) => p.id === selectedProviderId,
    );
    const name = targetProv ? targetProv.name : selectedProviderId;

    try {
      setSavingProvider(true);
      const updatedSettings = await saveSmsProviderCredentials({
        providerId: selectedProviderId,
        name,
        senderId,
        apiKey,
        apiSecret,
        isActive: activeProvider === selectedProviderId,
      });

      setProviders(updatedSettings.providers || []);
      toast.success(`${name} credentials saved successfully!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save credentials",
      );
    } finally {
      setSavingProvider(false);
    }
  };

  const handleToggleActiveProvider = async (providerId: string) => {
    try {
      const targetProv = AVAILABLE_PROVIDERS.find((p) => p.id === providerId);
      const existing = providers.find((p) => p.providerId === providerId);

      const updatedSettings = await saveSmsProviderCredentials({
        providerId,
        name: targetProv?.name || providerId,
        senderId: existing?.senderId || "",
        apiKey: existing?.apiKey || "",
        apiSecret: existing?.apiSecret || "",
        isActive: true, // Set this provider as active
      });

      setActiveProvider(providerId);
      setProviders(updatedSettings.providers || []);
      toast.success(`Active provider set to ${targetProv?.name || providerId}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update active provider",
      );
    }
  };

  const handleTriggerToggle = (key: keyof SmsTriggers) => {
    setTriggers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const insertTag = (
    tag: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter((prev) => `${prev} {${tag}}`.trim());
  };

  const handleSubmitAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await updateSmsSettings({
        activeProvider,
        triggers,
        orderMessage,
        authMessage,
        adminMessage,
      });
      toast.success("SMS Settings updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testPhone) {
      toast.error("Please enter a valid phone number for testing.");
      return;
    }
    try {
      setSendingTest(true);
      const res = await sendTestSms({
        phone: testPhone,
        message: "Test message from SMS Settings.",
        providerId: activeProvider,
      });
      toast.success(res.message || "Test SMS sent!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send test SMS",
      );
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading SMS Support Settings...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 font-lato animate-in fade-in duration-500 text-gray-800">
      {/* Page Header */}
      <div className="mb-4 bg-white py-6 px-4.5 rounded-lg flex justify-between items-center">
        <div>
          <h3 className="text-[20px] font-normal text-black mb-1 font-lato">
            SMS Support
          </h3>
          <p className="text-xs text-gray-400">
            Configure gateways, automated notification triggers, and custom
            message templates.
          </p>
        </div>

        {/* Quick Test SMS Input */}
        <div className="hidden md:flex items-center gap-2 bg-[#F8F9FA] p-1.5 rounded-xl border border-gray-200">
          <input
            type="text"
            placeholder="01700000000"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            className="bg-transparent px-3 py-1 text-xs font-normal outline-none w-36"
          />
          <button
            type="button"
            onClick={handleSendTestSms}
            disabled={sendingTest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {sendingTest ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Test SMS
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* --- LEFT COLUMN (40% Width) --- */}
        <div className="w-full lg:w-[40%] space-y-4">
          {/* Integration Form */}
          <form
            onSubmit={handleSaveProviderCredentials}
            className="bg-white p-6 rounded-lg space-y-5 border border-gray-100"
          >
            <div>
              <h4 className="text-[16px] font-normal text-black">
                Integrate SMS Provider
              </h4>
              <p className="text-xs font-normal text-gray-400 font-poppins">
                Please provide your credentials to integrate
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <select
                  value={selectedProviderId}
                  onChange={(e) => handleSelectProviderChange(e.target.value)}
                  className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none appearance-none border border-transparent focus:border-gray-200 cursor-pointer text-gray-700"
                >
                  {AVAILABLE_PROVIDERS.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200"
                  placeholder="Sender Id"
                />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200"
                  placeholder="API / Secret Key"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProvider}
                  className="bg-[#1890FF] hover:bg-blue-600 text-white px-10 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {savingProvider && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </form>

          {/* Provider List */}
          <section className="space-y-4 bg-white p-6 rounded-lg border border-gray-100">
            <h4 className="text-[16px] font-normal text-black">
              Select Active SMS Provider
            </h4>
            <div className="space-y-3">
              {AVAILABLE_PROVIDERS.map((prov) => {
                const configuredObj = providers.find(
                  (p) => p.providerId === prov.id,
                );
                const isConfigured = Boolean(
                  configuredObj?.isConfigured ||
                  configuredObj?.apiKey ||
                  configuredObj?.senderId,
                );
                const isActive = activeProvider === prov.id;

                return (
                  <div
                    key={prov.id}
                    className={`bg-white p-3 rounded-xl flex justify-between items-center border transition-all ${
                      isActive
                        ? "border-blue-500 bg-blue-50/20"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-lg p-1">
                        <img
                          src={prov.logo}
                          alt={prov.name}
                          className="max-h-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-800">
                          {prov.name}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            isConfigured ? "text-emerald-600" : "text-gray-400"
                          }`}
                        >
                          {isConfigured ? "Configured" : "Not Configured"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleActiveProvider(prov.id)}
                      className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${
                        isActive ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${
                          isActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* --- RIGHT COLUMN (Remaining Width) --- */}
        <form
          onSubmit={handleSubmitAll}
          className="w-full lg:flex-1 space-y-4 rounded-lg"
        >
          {/* Triggers Section */}
          <section className="space-y-5 bg-white p-6 rounded-lg border border-gray-100">
            <h4 className="text-[16px] font-normal text-black">
              SMS Sent When (Event Triggers)
            </h4>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {TRIGGER_KEYS.map(({ key, label }) => {
                const isChecked = Boolean(triggers[key]);
                return (
                  <label
                    key={key}
                    onClick={() => handleTriggerToggle(key)}
                    className="flex items-center gap-2.5 cursor-pointer group user-select-none"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        isChecked
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 group-hover:border-blue-400"
                      }`}
                    >
                      {isChecked && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm font-normal text-gray-700 font-poppins">
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Custom Message Templates */}
          <div className="space-y-4">
            {/* Order Messages */}
            <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-100">
              <div>
                <h4 className="text-[16px] font-normal text-black">
                  Customize SMS Messages for Order
                </h4>
                <p className="text-xs font-normal text-gray-400 font-poppins">
                  Leave blank to use default messages. Add custom text and use
                  dynamic tags to personalize.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-black uppercase tracking-wider mr-2">
                  QUICK INSERT
                </span>
                {[
                  "Client Name",
                  "Shop Name",
                  "Product Name",
                  "Estimate Delivery",
                ].map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => insertTag(tag, setOrderMessage)}
                    className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-[11px] font-normal text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
              <textarea
                value={orderMessage}
                onChange={(e) => setOrderMessage(e.target.value)}
                className="w-full bg-[#F8F9FA] rounded-2xl p-5 text-sm font-normal outline-none min-h-[120px] resize-none text-gray-700 placeholder:text-gray-300 border border-transparent focus:border-gray-200 transition-all"
                placeholder="Custom Message For Delivery..."
              />
            </div>

            {/* Auth Messages */}
            <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-100">
              <div>
                <h4 className="text-[16px] font-normal text-black">
                  Customize SMS Messages for Login/Registration
                </h4>
                <p className="text-xs font-normal text-gray-400 font-poppins">
                  Leave blank to use default messages. Add custom text and use
                  dynamic tags to personalize.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-black uppercase tracking-wider mr-2">
                  QUICK INSERT
                </span>
                {[
                  "Client Name",
                  "Shop Name",
                  "Phone Number",
                  "Attempt Time",
                ].map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => insertTag(tag, setAuthMessage)}
                    className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-[11px] font-normal text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
              <textarea
                value={authMessage}
                onChange={(e) => setAuthMessage(e.target.value)}
                className="w-full bg-[#F8F9FA] rounded-2xl p-5 text-sm font-normal outline-none min-h-[120px] resize-none text-gray-700 placeholder:text-gray-300 border border-transparent focus:border-gray-200 transition-all"
                placeholder="Custom Message For Login/Registration..."
              />
            </div>

            {/* Admin Notification */}
            <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-100">
              <div>
                <h4 className="text-[16px] font-normal text-black">
                  Admin Notification
                </h4>
                <p className="text-xs font-normal text-gray-400 font-poppins">
                  Leave blank to use default messages. Add custom text and use
                  dynamic tags to personalize.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-black uppercase tracking-wider mr-2">
                  QUICK INSERT
                </span>
                {["Shop Name", "Client Name", "Phone Number"].map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => insertTag(tag, setAdminMessage)}
                    className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-[11px] font-normal text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
              <textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                className="w-full bg-[#F8F9FA] rounded-2xl p-5 text-sm font-normal outline-none min-h-[120px] resize-none text-gray-700 placeholder:text-gray-300 border border-transparent focus:border-gray-200 transition-all"
                placeholder="Custom Message For Admin Notification..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#1890FF] hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-sm font-bold cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save SMS Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SMSSupportContent;
