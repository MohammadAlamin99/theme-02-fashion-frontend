"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatEngine } from "@/hooks/useChat";
import { useQuery } from "@tanstack/react-query";
import {
  FiSend,
  FiPaperclip,
  FiX,
  FiFileText,
  FiLoader,
  FiAlertCircle,
  FiPhone,
  FiMessageSquare,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { BsChatDotsFill, BsWhatsapp, BsMessenger } from "react-icons/bs";
import { apiFetch } from "@/utils/api";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";
import { toast } from "react-hot-toast";

interface ChatSettings {
  id?: string;
  enableLiveChat?: boolean;
  whatsappFallback?: boolean;
  welcomeMessage?: string;
  offlineMessage?: string;
  supportHourFrom?: string;
  supportHourTo?: string;
  phone?: string;
  whatsappUrl?: string;
  messengerUrl?: string;
}

interface Attachment {
  type: "IMAGE" | "VIDEO" | "FILE";
  url: string;
  name: string;
  mimeType?: string;
  mimetype?: string;
  size?: number;
}

interface ChatMessage {
  id: string;
  conversation_id?: string;
  sender_id: string;
  text: string | null;
  attachments: Attachment[] | null;
  created_at: string;
  sender?: { id: string; name: string; avatar: string | null; role: string };
}

const fetchChatSettings = async (): Promise<ChatSettings> => {
  try {
    const res = await apiFetch("/admin/chat-settings", {
      method: "GET",
      cache: "no-store",
    });
    
    const json = await res.json();
    return json?.data ?? json ?? {};
  } catch (err) {
    console.error("Error fetching chat settings:", err);
    return {};
  }
};


const ChatWidget = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const user = useAuthStore((state) => state.user);
  const isStoreReady = useAuthStore((state) => state._hasHydrated);

  // Zustand State for the internal message window
  const isOpen = useAuthStore((state) => state.isChatOpen);
  const setIsOpen = useAuthStore((state) => state.setIsChatOpen);

  // Local state for the multi-channel menu and phone popup
  const [showOptions, setShowOptions] = useState(false);
  const [showPhoneInfo, setShowPhoneInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form States
  const [inputText, setInputText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>(
    [],
  );
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🚀 1. FETCH LIVE SETTINGS — staleTime:0 ensures admin toggle changes reflect immediately
  const { data: settings } = useQuery<ChatSettings>({
    queryKey: ["chatSettings"],
    queryFn: fetchChatSettings,
    staleTime: 0,
  });

  const {
    messages,
    loadingHistory,
    isAdminTyping,
    sendTypingStatus,
    sendMessage,
  } = useChatEngine(isOpen);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAdminTyping]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && pendingAttachments.length === 0) return;

    sendMessage({
      text: inputText.trim() || null,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : null,
    });

    setInputText("");
    setPendingAttachments([]);
    setIsTyping(false);
    sendTypingStatus(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setErrorText(null);
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch("/chat/attachments/upload", {
        method: "POST",
        body: formData,
      });

      const jsonResponse = await res.json();
      if (!res.ok) throw new Error(jsonResponse?.message || "Upload failed.");

      const innerData = jsonResponse.data;

      setPendingAttachments((prev) => [
        ...prev,
        {
          type: innerData.type,
          url: innerData.url,
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
        },
      ]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorText(err.message);
      } else {
        setErrorText("Failed to process attachment.");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = () => {
    if (settings?.phone) {
      navigator.clipboard.writeText(settings.phone);
      setCopied(true);
      toast.success("Number copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatWhatsappUrl = (urlOrPhone?: string): string | null => {
    if (!urlOrPhone) return null;
    if (urlOrPhone.startsWith("http://") || urlOrPhone.startsWith("https://")) {
      return urlOrPhone;
    }
    const cleanNumber = urlOrPhone.replace(/[^0-9]/g, "");
    return cleanNumber ? `https://wa.me/${cleanNumber}` : null;
  };

  const formatMessengerUrl = (url?: string): string | null => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://m.me/${url.replace(/^\/+/, "")}`;
  };

  const renderAttachmentPreview = (att: Attachment, isMe: boolean) => {
    const baseStorageUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:8082";
    const absoluteAssetUrl = `${baseStorageUrl}${att.url}`;

    if (att.type === "IMAGE") {
      return (
        <div className="mt-1.5 rounded-xl overflow-hidden border border-gray-100 max-w-[220px] shadow-sm bg-white cursor-pointer">
          <img
            src={absoluteAssetUrl}
            alt={att.name}
            className="w-full object-cover max-h-[160px]"
          />
        </div>
      );
    }
    if (att.type === "VIDEO") {
      return (
        <video
          controls
          className="mt-1.5 w-full rounded-xl max-h-[160px] bg-black shadow-sm border border-gray-200"
        >
          <source src={absoluteAssetUrl} type={att.mimeType || att.mimetype} />
        </video>
      );
    }
    return (
      <a
        href={absoluteAssetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-1.5 flex items-center gap-2.5 border p-2.5 rounded-xl text-xs transition-all shadow-3xs max-w-[240px] ${isMe ? "bg-white/10 border-white/10 text-white" : "bg-slate-50 border-gray-200 text-gray-700"}`}
      >
        <FiFileText
          size={16}
          className={isMe ? "text-white" : "text-[#FF7050]"}
        />
        <div className="overflow-hidden flex-1">
          <p className="truncate font-semibold text-[11px]">
            {att.name || "File"}
          </p>
        </div>
      </a>
    );
  };

  if (!isStoreReady || !user) return null;

  const whatsappHref = formatWhatsappUrl(settings?.whatsappUrl || settings?.phone);
  const messengerHref = formatMessengerUrl(settings?.messengerUrl);
  const enableLiveChat = settings?.enableLiveChat ?? true;

  return (
    <div className="fixed bottom-[85px] right-4 lg:bottom-6 lg:right-6 z-[210] font-sans flex flex-col items-end antialiased selection:bg-orange-100">
      {/* 🚀 1. THE MULTI-CHANNEL OPTIONS MENU */}
      {showOptions && !isOpen && (
        <div className="flex flex-col gap-3 mb-4 animate-in fade-in slide-in-from-bottom-5 duration-300 relative items-end">
          {/* 📞 PHONE POPUP */}
          {showPhoneInfo && (
            <div className="absolute right-14 bottom-0 w-64 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-5 animate-in fade-in slide-in-from-right-4 duration-300 z-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Contact Help Desk
                </span>
                <button
                  onClick={() => setShowPhoneInfo(false)}
                  className="text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
              <p className="text-[13px] text-[#023337] font-semibold leading-snug mb-4">
                Have a question? Call or SMS us directly for support:
              </p>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-gray-100 mb-4 group transition-all hover:bg-slate-100">
                <span className="text-sm font-bold text-gray-800 tracking-tight">
                  {settings?.phone || "N/A"}
                </span>
                {settings?.phone && (
                  <button
                    onClick={copyToClipboard}
                    className="text-[#FF7050] hover:text-[#e65c3c] border-none bg-transparent cursor-pointer p-1"
                  >
                    {copied ? (
                      <FiCheck size={16} className="text-emerald-500" />
                    ) : (
                      <FiCopy size={16} />
                    )}
                  </button>
                )}
              </div>
              {settings?.phone ? (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center justify-center gap-2 w-full bg-[#023337] text-white py-2.5 rounded-xl text-xs font-bold no-underline hover:bg-black transition-all shadow-lg shadow-gray-200"
                >
                  <FiPhone size={14} /> Call Now
                </a>
              ) : (
                <p className="text-xs text-center text-gray-400">Phone number not configured</p>
              )}
            </div>
          )}

          {/* Individual Channel Buttons — each only shows when setting is configured */}

          {/* 📞 Phone — show only if phone number is set */}
          {settings?.phone && (
            <button
              onClick={() => setShowPhoneInfo(!showPhoneInfo)}
              className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-all border-none cursor-pointer ${showPhoneInfo ? "bg-black text-white" : "bg-gray-800 text-white"}`}
              title="Call Support"
            >
              <FiPhone size={20} />
            </button>
          )}

          {/* 💬 Messenger — show only if messengerUrl is set */}
          {messengerHref && (
            <a
              href={messengerHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-[#0084FF] text-white rounded-full shadow-lg hover:scale-110 transition-all border-none"
              title="Messenger"
            >
              <BsMessenger size={20} />
            </a>
          )}

          {/* 🟢 WhatsApp — show only if whatsappFallback is enabled AND URL is set */}
          {settings?.whatsappFallback && whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-all border-none"
              title="WhatsApp"
            >
              <BsWhatsapp size={22} />
            </a>
          )}

          {/* 💬 Live Chat — show only if enableLiveChat is true */}
          {enableLiveChat && (
            <button
              onClick={() => {
                setIsOpen(true);
                setShowOptions(false);
                setShowPhoneInfo(false);
              }}
              className="flex items-center justify-center w-12 h-12 bg-[#FF7050] text-white rounded-full shadow-lg hover:scale-110 transition-all border-none cursor-pointer"
              title="Live Chat"
            >
              <FiMessageSquare size={22} />
            </button>
          )}

        </div>
      )}

      {/* 🚀 2. THE INTERNAL MESSAGE WINDOW */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[400px] h-[480px] sm:h-[520px] bg-white border border-gray-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transform origin-bottom-right animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#FF7050] to-[#ff846b] text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center font-bold text-sm relative border border-white/10 shadow-inner">
                CM
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#FF7050] rounded-full shadow-sm animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-wide uppercase">
                  {t.chat.helpDesk}
                </h4>
                <p className="text-[10px] text-orange-50/80 font-medium">
                  {t.chat.instantReply}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/15 rounded-full transition-colors cursor-pointer text-white border-none bg-transparent flex items-center outline-none"
            >
              <FiX size={18} />
            </button>
          </div>

          {errorText && (
            <div className="bg-amber-50 border-b border-amber-100 px-3 py-1.5 flex items-center gap-2 text-amber-700 text-xs shrink-0 font-medium">
              <FiAlertCircle size={14} className="shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC] space-y-3.5 custom-scrollbar">
            {loadingHistory ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <FiLoader className="animate-spin text-[#FF7050]" size={20} />
                <p className="text-xs font-medium">Synchronizing...</p>
              </div>
            ) : Array.isArray(messages) && messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 gap-2">
                <BsChatDotsFill size={32} className="text-gray-200 mb-1" />
                <h5 className="text-[13px] font-bold text-gray-700">
                  {settings?.welcomeMessage || "Hello! How can we help?"}
                </h5>
              </div>
            ) : null}

            {!loadingHistory &&
              messages.map((msg: ChatMessage) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 w-full ${isMe ? "justify-end" : "justify-start"} animate-in fade-in-50 duration-150`}
                  >
                    <div
                      className={`flex flex-col max-w-[78%] ${isMe ? "items-end" : "items-start"}`}
                    >
                      {msg.text && (
                        <div
                          className={`p-3 text-[13px] leading-relaxed shadow-3xs border ${isMe ? "bg-[#FF7050] text-white rounded-2xl rounded-tr-none border-transparent font-medium" : "bg-white text-gray-800 rounded-2xl rounded-tl-none border-gray-200/60 font-normal"}`}
                        >
                          {msg.text}
                        </div>
                      )}
                      {msg.attachments?.map((att: Attachment, i: number) => (
                        <div key={i}>{renderAttachmentPreview(att, isMe)}</div>
                      ))}
                      <span className="text-[9px] text-gray-400 mt-1 px-1 font-medium">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}

            {isAdminTyping && (
              <div className="flex gap-2 items-center justify-start animate-pulse">
                <div className="bg-white border border-gray-200/60 px-3 py-2 rounded-xl rounded-tl-none shadow-3xs flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form / Typing Area */}
          <div className="p-3 border-t border-gray-100 bg-white shrink-0 flex flex-col gap-2">
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                {pendingAttachments.map((att, idx) => {
                  const storageUrl =
                    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
                      "/api/v1",
                      "",
                    ) || "http://localhost:8082";
                  return (
                    <div
                      key={idx}
                      className="relative group flex items-center gap-1.5 bg-white border p-1 rounded-lg max-w-[140px] shadow-3xs"
                    >
                      {att.type === "IMAGE" ? (
                        <img
                          src={`${storageUrl}${att.url}`}
                          className="w-8 h-8 object-cover rounded-md"
                          alt=""
                        />
                      ) : (
                        <FiFileText size={16} className="text-[#FF7050] ml-1" />
                      )}
                      <span className="text-[10px] text-gray-600 truncate max-w-[80px] font-semibold">
                        {att.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePendingAttachment(idx)}
                        className="bg-red-500 text-white rounded-full p-0.5 ml-1 hover:bg-red-600 border-none cursor-pointer flex items-center justify-center"
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2.5 bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#FF7050] transition-all relative"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-[#FF7050] transition-colors cursor-pointer border-none bg-transparent p-0 flex items-center"
              >
                {uploading ? (
                  <FiLoader className="animate-spin text-[#FF7050]" size={18} />
                ) : (
                  <FiPaperclip size={18} />
                )}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={
                  uploading ? "File uploading..." : "Write a message..."
                }
                disabled={uploading}
                className="w-full bg-transparent border-none outline-none text-xs text-gray-800 font-medium placeholder-gray-400"
              />

              <button
                type="submit"
                disabled={
                  uploading ||
                  (!inputText.trim() && pendingAttachments.length === 0)
                }
                className="text-[#FF7050] bg-transparent border-none cursor-pointer flex items-center disabled:opacity-30"
              >
                <FiSend size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 THE MAIN FLOATING CM TOGGLE BUTTON */}
      <button
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            setShowOptions(!showOptions);
            if (showOptions) setShowPhoneInfo(false);
          }
        }}
        type="button"
        className="bg-[#FF7050] text-white w-14 h-14 rounded-full shadow-[0_8px_24px_rgba(255,112,80,0.35)] hover:bg-[#e66345] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center z-[100] border-none outline-none"
      >
        {isOpen || showOptions ? (
          <FiX size={28} />
        ) : (
          <BsChatDotsFill size={28} />
        )}
      </button>
    </div>
  );
};

export default ChatWidget;