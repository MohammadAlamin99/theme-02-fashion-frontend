"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";
import { getCookie } from "cookies-next";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string | null;
  content?: string | null;
  attachments: [] | null;
  created_at: string;
  sender: { id: string; name: string; avatar: string | null; role: string };
}

let sharedSocketInstance: Socket | null = null;

export function useChatEngine(isOpen: boolean) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUnreadMessageCount = useAuthStore(
    (state) => state.setUnreadMessageCount,
  );
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  // Use a ref to track open state inside the socket listener without re-running the effect
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // 1️⃣ Fetch Active Room ID
  const { data: roomId } = useQuery({
    queryKey: ["chat", "room"],
    queryFn: async () => {
      const res = await apiFetch("/chat/conversations/sync-room", {
        method: "GET",
        headers: { "X-Customer-Request": "true" },
      });
      const json = await res.json();
      return json?.data?.conversationId || json?.conversationId || "";
    },
    enabled: !!user?.id, // Enabled as long as user is logged in
  });

  // 2️⃣ Fetch Message History Cache
  const { data: messages = [], isLoading: loadingHistory } = useQuery<
    Message[]
  >({
    queryKey: ["chat", "messages", roomId],
    queryFn: async () => {
      const res = await apiFetch(`/chat/conversations/${roomId}/messages`, {
        method: "GET",
        headers: { "X-Customer-Request": "true" },
      });
      if (!res.ok) throw new Error("Failed to fetch messages.");
      const json = await res.json();
      const rawData = json?.data !== undefined ? json.data : json;
      const list = Array.isArray(rawData) ? rawData : rawData?.messages || [];

      return list.map(
        (msg: {
          text: string | null;
          content?: string | null;
          sender?: {
            id: string;
            name: string;
            avatar: string | null;
            role: string;
          };
        }) => ({
          ...msg,
          text: msg.text ?? msg.content ?? null,
        }),
      );
    },
    enabled: !!roomId && isOpen, // Only fetch history when window is open
  });

  // 3️⃣ Socket Management
  useEffect(() => {
    // 🚀 FIXED: We connect as long as we have a roomId, even if window is closed
    if (!roomId || !user?.id) return;

    const token =
      typeof window !== "undefined"
        ? getCookie("auth_token") ||
          getCookie("token") ||
          localStorage.getItem("token")
        : null;

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:8082";

    if (!sharedSocketInstance || !sharedSocketInstance.connected) {
      sharedSocketInstance = io(`${backendUrl}/chat`, {
        path: "/socket.io",
        transports: ["websocket"],
        withCredentials: true,
        autoConnect: true,
        auth: { token: token },
        query: { isCustomerRequest: "true" },
      });
    }

    const socket = sharedSocketInstance;

    const handleConnect = () => {
      socket.emit("joinRoom", { conversationId: roomId });
    };

    if (socket.connected) handleConnect();
    else socket.on("connect", handleConnect);

    const handleNewMessage = (rawMessage: {
      id: string;
      conversation_id: string;
      sender_id: string;
      text: string | null;
      content?: string | null;
      attachments: [];
      created_at: string;
      sender: {
        id: string;
        name: string;
        avatar: string | null;
        role: string;
      };
    }) => {
      const message: Message = {
        ...rawMessage,
        text: rawMessage.text ?? rawMessage.content ?? null,
      };

      // Update the UI cache
      queryClient.setQueryData(
        ["chat", "messages", roomId],
        (oldMessages: Message[] = []) => {
          if (oldMessages.some((m) => m.id === message.id)) return oldMessages;
          return [...oldMessages, message];
        },
      );

      // 🚀 FIXED: Update unread badge if chat is closed and message is from Admin
      const isFromAdmin = message.sender?.role !== "CUSTOMER";
      if (!isOpenRef.current && isFromAdmin) {
        const currentCount = useAuthStore.getState().unreadMessageCount;
        setUnreadMessageCount(currentCount + 1);
      }
    };

    const handleUserTyping = (data: { userId: string }) => {
      if (data.userId !== user?.id) setIsAdminTyping(true);
    };

    const handleUserStoppedTyping = (data: { userId: string }) => {
      if (data.userId !== user?.id) setIsAdminTyping(false);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      // Don't disconnect socket, just remove listeners to keep background sync alive
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [roomId, user?.id, queryClient, setUnreadMessageCount]);

  const sendTypingStatus = (typing: boolean) => {
    if (sharedSocketInstance && roomId) {
      sharedSocketInstance.emit(typing ? "typing" : "stopTyping", {
        conversationId: roomId,
      });
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: {
      text: string | null;
      attachments: unknown[] | null;
    }) => {
      if (sharedSocketInstance && roomId) {
        sharedSocketInstance.emit("sendMessage", {
          conversationId: roomId,
          text: payload.text,
          content: payload.text,
          attachments: payload.attachments || [],
        });
      }
    },
  });

  return {
    roomId,
    messages,
    loadingHistory,
    isAdminTyping,
    sendTypingStatus,
    sendMessage: sendMessageMutation.mutate,
  };
}
