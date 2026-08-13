"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  MoreHorizontal,
  Menu,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { FiSend, FiLoader, FiFileText, FiPaperclip, FiX } from "react-icons/fi";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";
import { useAuthStore } from "@/store/useAuthStore";

interface AdminChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatRoom {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  unreadCount: number;
  avatar?: string | null;
}

interface Attachment {
  type: "IMAGE" | "VIDEO" | "FILE";
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string | null;
  attachments?: Attachment[] | null;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  } | null;
}

let adminSocketInstance: Socket | null = null;

const AdminChatModal = ({ isOpen, onClose }: AdminChatModalProps) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [useLoadingHistory, setUseLoadingHistory] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>(
    [],
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const baseStorageUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // 🚀 FIXED: Global unread calculation wrapped in an async microtask queue to eliminate cross-component render errors
  const syncGlobalStoreCount = useCallback((currentRooms: ChatRoom[]) => {
    const totalUnread = currentRooms.reduce(
      (acc: number, room: ChatRoom) => acc + (room.unreadCount || 0),
      0,
    );
    // Queue execution right after render painting finishes
    Promise.resolve().then(() => {
      useAuthStore.getState().setUnreadMessageCount(totalUnread);
    });
  }, []);

  const fetchChatRooms = useCallback(async () => {
    try {
      const adminToken = await getAdminTokenAction();
      const res = await apiFetch("/chat/rooms", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken || ""}`,
          "X-Admin-Request": "true",
        },
      });

      if (res.ok) {
        const roomData = await res.json();
        const dynamicRooms = Array.isArray(roomData)
          ? roomData
          : roomData?.rooms || roomData?.data || [];

        setRooms(dynamicRooms);
        syncGlobalStoreCount(dynamicRooms);
      }
    } catch (err) {
      console.error("Failed to load chat conversations:", err);
    }
  }, [syncGlobalStoreCount]);

  useEffect(() => {
    if (!isOpen) return;
    fetchChatRooms();
    const interval = setInterval(fetchChatRooms, 10000);
    return () => clearInterval(interval);
  }, [isOpen, fetchChatRooms]);

  useEffect(() => {
    if (!isOpen) return;

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:8082";

    const initSocket = async () => {
      const adminToken = await getAdminTokenAction();

      // If a socket exists but was created without a token, disconnect and recreate it
      // Narrow auth: it may be a function in some socket typings, so ensure it's not a function
      if (
        adminSocketInstance &&
        (typeof adminSocketInstance.auth === "function" ? false : !adminSocketInstance.auth?.token)
      ) {
        adminSocketInstance.disconnect();
        adminSocketInstance = null;
      }

      if (!adminSocketInstance) {
        adminSocketInstance = io(`${backendUrl}/chat`, {
          withCredentials: true,
          transports: ["websocket"],
          auth: { token: adminToken || "" },
          query: { isAdmin: "true" },
        });
      }

      adminSocketInstance.on("newMessage", (message: Message) => {
        setActiveRoom((currentActive) => {
          if (message.conversation_id === currentActive?.id) {
            // 🚀 AUTO-READ TRIGGER
            apiFetch(`/chat/conversations/${currentActive.id}/messages`, {
              method: "GET",
            }).catch((err) =>
              console.error("Auto-read database sync failed:", err),
            );

            setMessages((prev) => {
              // Replace optimistic temp message if it exists, otherwise append
              const hasTempMsg = prev.some((m) => m.id.startsWith("temp-"));
              if (hasTempMsg && message.sender?.role === "ADMIN") {
                return prev.map((m) =>
                  m.id.startsWith("temp-") ? message : m,
                );
              }
              if (prev.some((m) => m.id === message.id)) return prev;
              return [...prev, message];
            });
          }

          // Update rooms list
          setRooms((prevRooms) => {
            const isViewing = message.conversation_id === currentActive?.id;
            const updatedRooms = prevRooms.map((room) => {
              if (room.id === message.conversation_id) {
                return {
                  ...room,
                  lastMessage: message.text || "[Attachment]",
                  unreadCount: isViewing
                    ? 0
                    : (room.unreadCount || 0) + 1,
                };
              }
              return room;
            });

            syncGlobalStoreCount(updatedRooms);
            return updatedRooms;
          });

          return currentActive;
        });
      });
    };

    initSocket();

    return () => {
      if (adminSocketInstance) {
        adminSocketInstance.off("newMessage");
      }
    };
  }, [isOpen, syncGlobalStoreCount]);

  useEffect(() => {
    if (!activeRoom?.id || !adminSocketInstance) return;

    adminSocketInstance.emit("joinRoom", { conversationId: activeRoom.id });

    return () => {
      if (adminSocketInstance) {
        adminSocketInstance.emit("leaveRoom", {
          conversationId: activeRoom.id,
        });
      }
    };
  }, [activeRoom?.id]);

  useEffect(() => {
    if (!activeRoom?.id || !isOpen) return;

    const fetchMessages = async () => {
      try {
        setUseLoadingHistory(true);
        const adminToken = await getAdminTokenAction();
        const res = await apiFetch(
          `/chat/conversations/${activeRoom.id}/messages`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${adminToken || ""}`,
              "X-Admin-Request": "true",
            },
          },
        );
        if (res.ok) {
          const cleanMsgs = await res.json();
          console.log("AdminChatModal Fetched Messages API response:", cleanMsgs);
          const rawData = cleanMsgs?.data !== undefined ? cleanMsgs.data : cleanMsgs;
          const messageArray = Array.isArray(rawData) ? rawData : rawData?.messages || [];
          setMessages(messageArray);
        }
      } catch (err) {
        console.error("Failed to load message strings:", err);
      } finally {
        setUseLoadingHistory(false);
      }
    };

    fetchMessages();
  }, [activeRoom?.id, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setErrorText(null);
      const adminToken = await getAdminTokenAction();
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch("/chat/attachments/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken || ""}`,
          "X-Admin-Request": "true",
        },
        body: formData,
      });

      const jsonResponse = await res.json();
      if (!res.ok) throw new Error(jsonResponse?.message || "Upload failed.");

      const innerData = jsonResponse.data || jsonResponse;

      setPendingAttachments((prev) => [
        ...prev,
        {
          type:
            innerData.type ||
            (file.type.startsWith("image") ? "IMAGE" : "FILE"),
          url: innerData.url,
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
        },
      ]);
    } catch (err: any) {
      setErrorText(err.message || "Failed to process attachment staging.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && pendingAttachments.length === 0) return;
    if (!activeRoom || !adminSocketInstance) return;

    const currentText = replyText.trim();
    const currentAttachments = pendingAttachments.length > 0 ? [...pendingAttachments] : null;

    setReplyText("");
    setPendingAttachments([]);

    // 🚀 OPTIMISTIC UPDATE: Instantly render admin reply in chat history UI
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeRoom.id,
      sender_id: "ADMIN",
      text: currentText || null,
      attachments: currentAttachments,
      created_at: new Date().toISOString(),
      sender: {
        id: "ADMIN",
        name: "Admin",
        avatar: null,
        role: "ADMIN",
      },
    };

    setMessages((prev) => [...prev, tempMsg]);

    adminSocketInstance.emit("sendMessage", {
      conversationId: activeRoom.id,
      text: currentText || null,
      attachments: currentAttachments || [],
    });
  };


  const renderAttachmentFile = (att: Attachment, isAdminMsg: boolean) => {
    const absoluteAssetUrl = `${baseStorageUrl}${att.url}`;

    if (att.type === "IMAGE") {
      return (
        <div className="mt-1 rounded-sm overflow-hidden border border-gray-100 max-w-[240px] bg-white">
          <img
            src={absoluteAssetUrl}
            alt=""
            className="w-full object-cover max-h-[160px]"
          />
        </div>
      );
    }
    return (
      <a
        href={absoluteAssetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-1 flex items-center gap-2 px-3 py-2 rounded-xs text-xs max-w-[240px] transition-all border ${
          isAdminMsg
            ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <FiFileText
          size={14}
          className={isAdminMsg ? "text-blue-500" : "text-gray-500"}
        />
        <span className="truncate">{att.name || "View Attachment"}</span>
      </a>
    );
  };

  if (!isOpen) return null;

  const filteredRooms = rooms.filter(
    (room) =>
      room.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.customerPhone?.includes(searchQuery),
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 font-sans text-black antialiased transition-all">
      <div className="bg-white w-full max-w-7xl h-[92vh] rounded-[4px] shadow-2xl flex flex-col overflow-hidden relative border border-gray-200">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between z-10">
          <span className="text-[13px] font-normal text-gray-800 tracking-wide">
            Litee Chat
          </span>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer outline-none"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden bg-white">
          {/* LEFT PANEL */}
          <div className="w-[280px] md:w-[320px] border-r border-gray-200 flex flex-col bg-[#F3F4F6]/50 shrink-0 justify-between">
            <div>
              <div className="p-4 flex flex-col gap-3">
                <Menu size={20} className="text-gray-500 cursor-pointer mb-1" />
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white placeholder-gray-400 pl-4 pr-10 py-1.5 rounded-[4px] text-xs text-black border border-gray-300 outline-none focus:border-gray-400 transition-all shadow-inner"
                  />
                  <Search
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={14}
                  />
                </div>
              </div>

              {/* Chat Thread Item Links */}
              <div className="overflow-y-auto px-2 space-y-0.5 max-h-[60vh]">
                {filteredRooms.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 mt-12 font-medium">
                    No threads located.
                  </p>
                ) : (
                  filteredRooms.map((room) => {
                    const isSelected = activeRoom?.id === room.id;
                    // Combines the storage asset prefixes correctly
                    const absoluteAvatarUrl = room.avatar
                      ? `${baseStorageUrl}${room.avatar}`
                      : null;

                    return (
                      <button
                        key={room.id}
                        onClick={() => {
                          setActiveRoom(room);
                          setRooms((prevRooms) => {
                            const updated = prevRooms.map((r) =>
                              r.id === room.id ? { ...r, unreadCount: 0 } : r,
                            );
                            syncGlobalStoreCount(updated);
                            return updated;
                          });
                        }}
                        className={`w-full text-left p-3 flex items-center gap-3 transition-all cursor-pointer border border-transparent outline-none ${
                          isSelected
                            ? "bg-[#EAEAEA] rounded-[4px]"
                            : "hover:bg-gray-200/50 rounded-[4px]"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-3xs bg-slate-400">
                            {/* 🚀 DYNAMIC RESOLVER: Correctly maps profile images for both self-chats and customers */}
                            {absoluteAvatarUrl ? (
                              <img
                                src={absoluteAvatarUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500 text-white font-bold text-sm">
                                {room.customerName?.charAt(0).toUpperCase() ||
                                  "C"}
                              </div>
                            )}
                          </div>
                          {room.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                              {room.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {room.customerName}
                          </p>
                          <p
                            className={`text-[11px] truncate mt-0.5 font-medium ${room.unreadCount > 0 ? "text-gray-900 font-semibold" : "text-gray-400"}`}
                          >
                            {room.lastMessage || "No messages yet"}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Static Settings Link */}
            <div className="p-4 border-t border-gray-200/60 bg-transparent shrink-0">
              <button className="flex items-center gap-3 text-xs font-medium text-gray-600 hover:text-black transition-colors border-none bg-transparent outline-none cursor-pointer w-full text-left">
                <Settings size={16} className="text-gray-500" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 bg-white flex flex-col relative">
            {activeRoom ? (
              <>
                {/* Header User Display */}
                <div className="px-8 py-5 flex items-center justify-between bg-white shrink-0">
                  <h4 className="text-lg font-bold text-gray-900 tracking-tight">
                    {activeRoom.customerName}
                  </h4>
                  <MoreHorizontal
                    className="text-gray-400 hover:text-black cursor-pointer transition-colors"
                    size={20}
                  />
                </div>

                {/* Main Message History Stream Window Area */}
                <div className="flex-1 overflow-y-auto px-8 py-2 bg-white space-y-6">
                  {errorText && (
                    <div className="bg-amber-50 text-amber-700 text-xs px-3 py-2 rounded border border-amber-100 font-medium">
                      {errorText}
                    </div>
                  )}

                  {useLoadingHistory ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                      <FiLoader
                        className="animate-spin text-gray-400"
                        size={18}
                      />
                      <span className="text-xs font-medium">
                        Loading history thread...
                      </span>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isAdminMsg =
                        msg.sender?.role === "ADMIN" ||
                        msg.sender_id === "ADMIN" ||
                        (msg.sender
                          ? msg.sender.role === "ADMIN"
                          : msg.sender_id !== activeRoom.id);

                      const absoluteUserMsgAvatar = msg.sender?.avatar
                        ? `${baseStorageUrl}${msg.sender.avatar}`
                        : activeRoom.avatar
                          ? `${baseStorageUrl}${activeRoom.avatar}`
                          : null;

                      return (
                        <div
                          key={msg.id}
                          className={`flex w-full items-start gap-3.5 ${isAdminMsg ? "justify-end" : "justify-start"}`}
                        >
                          {!isAdminMsg && (
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5 bg-slate-300 shadow-3xs">
                              {absoluteUserMsgAvatar ? (
                                <img
                                  src={absoluteUserMsgAvatar}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-400 text-white flex items-center justify-center font-bold text-[11px]">
                                  {activeRoom.customerName
                                    ?.charAt(0)
                                    .toUpperCase() || "C"}
                                </div>
                              )}
                            </div>
                          )}

                          <div
                            className={`flex flex-col max-w-[65%] ${isAdminMsg ? "items-end" : "items-start"}`}
                          >
                            {msg.text && (
                              <div className="px-4 py-2.5 text-[12.5px] leading-relaxed rounded-xs bg-[#F1F1F1] text-gray-800 font-normal">
                                {msg.text}
                              </div>
                            )}
                            {msg.attachments &&
                              Array.isArray(msg.attachments) &&
                              msg.attachments.map((att, idx) => (
                                <div key={idx} className="max-w-full">
                                  {renderAttachmentFile(att, isAdminMsg)}
                                </div>
                              ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Console */}
                <div className="p-6 bg-white shrink-0 flex flex-col gap-2">
                  {pendingAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-h-16 overflow-y-auto p-1.5 bg-gray-50 rounded border border-dashed border-gray-200">
                      {pendingAttachments.map((att, idx) => {
                        const storageUrl =
                          process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
                            "/api/v1",
                            "",
                          ) || "http://localhost:8082";
                        return (
                          <div
                            key={idx}
                            className="relative flex items-center gap-1.5 bg-white border p-1 rounded max-w-[130px] shadow-3xs"
                          >
                            {att.type === "IMAGE" ? (
                              <img
                                src={`${storageUrl}${att.url}`}
                                className="w-6 h-6 object-cover rounded-xs"
                                alt=""
                              />
                            ) : (
                              <FiFileText
                                size={14}
                                className="text-gray-400 ml-1"
                              />
                            )}
                            <span className="text-[10px] text-gray-600 truncate max-w-[70px] font-medium">
                              {att.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePendingAttachment(idx)}
                              className="bg-red-500 text-white rounded-full p-0.5 ml-1 hover:bg-red-600 cursor-pointer border-none flex items-center justify-center"
                            >
                              <FiX size={8} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <form
                    onSubmit={handleSendReply}
                    className="flex items-center gap-2 bg-white border border-gray-300 rounded-[4px] px-4 py-2 relative w-full focus-within:border-gray-400 transition-all"
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
                      className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer border-none outline-none bg-transparent p-0 mr-1 shrink-0"
                    >
                      {uploading ? (
                        <FiLoader
                          className="animate-spin text-gray-500"
                          size={16}
                        />
                      ) : (
                        <FiPaperclip size={16} />
                      )}
                    </button>

                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={
                        uploading
                          ? "Staging asset upload..."
                          : `Write a message for ${activeRoom.customerName}`
                      }
                      className="w-full bg-transparent border-none outline-none text-xs py-1.5 text-gray-800 pr-12 placeholder-gray-400 font-normal shadow-none"
                    />
                    <button
                      type="submit"
                      disabled={
                        uploading ||
                        (!replyText.trim() && pendingAttachments.length === 0)
                      }
                      className="absolute right-2 text-white bg-[#0060C0] hover:bg-[#0050A0] p-2 rounded-[4px] transition-all disabled:opacity-40 cursor-pointer border-none outline-none shadow-xs flex items-center justify-center"
                    >
                      <FiSend size={14} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-white text-gray-400 gap-2.5 p-6">
                <ShieldAlert
                  size={32}
                  className="text-gray-300 animate-pulse"
                />
                <p className="text-xs font-semibold text-gray-700">
                  No Target Conversation Selected
                </p>
                <p className="text-[11px] max-w-[220px] text-center text-gray-400 font-medium">
                  Select an open message room thread to begin response sequence
                  logs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatModal;
