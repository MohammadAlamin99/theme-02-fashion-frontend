import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string | null;
  attachments: any[] | null;
  created_at: string;
  sender: { id: string; name: string; avatar: string | null; role: string };
}

// Global variable tracking ensures a single web socket instance across components
let sharedSocketInstance: Socket | null = null;

export function useChatEngine(isOpen: boolean) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  // 1️⃣ Fetch Active Room Target Path Reference
  const { data: roomId } = useQuery({
    queryKey: ["chat", "room"],
    queryFn: async () => {
      const res = await apiFetch("/chat/conversations/sync-room", {
        method: "GET",
        headers: {
          // 🚀 FIXED: Protects handshake endpoint from being hijacked by admin cookies
          "X-Customer-Request": "true"
        }
      });
      const json = await res.json();
      return json?.data?.conversationId || json?.conversationId || "";
    },
    enabled: !!user?.id && isOpen,
  });

  // 2️⃣ Sync Timestream History Cache
  const { data: messages = [], isLoading: loadingHistory } = useQuery<Message[]>({
    queryKey: ["chat", "messages", roomId],
    queryFn: async () => {
      const res = await apiFetch(`/chat/conversations/${roomId}/messages`, {
        method: "GET",
        headers: {
          // 🚀 FIXED: Isolates message history requests to storefront customer profile context
          "X-Customer-Request": "true"
        }
      });
      if (!res.ok) throw new Error("Failed to sync structural messaging metrics.");
      const json = await res.json();
      const rawData = json?.data !== undefined ? json.data : json;
      return Array.isArray(rawData) ? rawData : rawData?.messages || [];
    },
    enabled: !!roomId && isOpen,
  });

  // 3️⃣ Manage Global Realtime WebSocket Listener Contexts
  useEffect(() => {
    if (!roomId || !isOpen) return;

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:8082";
    
    if (!sharedSocketInstance) {
      // 🚀 FIXED: Injected explicit custom header into the websocket layer instance configuration
      sharedSocketInstance = io(`${backendUrl}/chat`, {
        withCredentials: true,
        transports: ["websocket"],
        extraHeaders: {
          "X-Customer-Request": "true" // 🔒 Locks WebSocket initialization strictly to customer credentials context
        }
      });
    }

    sharedSocketInstance.emit("joinRoom", { conversationId: roomId });

    // React Query handles optimistic visual mutations inside updates cleanly
    sharedSocketInstance.on("newMessage", (message: Message) => {
      queryClient.setQueryData(["chat", "messages", roomId], (oldMessages: Message[] = []) => {
        if (oldMessages.some((m) => m.id === message.id)) return oldMessages;
        return [...oldMessages, message];
      });
    });

    sharedSocketInstance.on("userTyping", (data: { userId: string }) => {
      if (data.userId !== user?.id) setIsAdminTyping(true);
    });

    sharedSocketInstance.on("userStoppedTyping", (data: { userId: string }) => {
      if (data.userId !== user?.id) setIsAdminTyping(false);
    });

    return () => {
      if (sharedSocketInstance) {
        sharedSocketInstance.emit("leaveRoom", { conversationId: roomId });
        sharedSocketInstance.off("newMessage");
        sharedSocketInstance.off("userTyping");
        sharedSocketInstance.off("userStoppedTyping");
      }
    };
  }, [roomId, isOpen, queryClient, user?.id]);

  // 4️⃣ Encapsulate Typing Notification Emit Dispatches
  const sendTypingStatus = (typing: boolean) => {
    if (sharedSocketInstance && roomId) {
      sharedSocketInstance.emit(typing ? "typing" : "stopTyping", { conversationId: roomId });
    }
  };

  // 5️⃣ Encapsulate Output Payload Delivery Channels
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { text: string | null; attachments: any[] | null }) => {
      if (sharedSocketInstance && roomId) {
        sharedSocketInstance.emit("sendMessage", {
          conversationId: roomId,
          text: payload.text,
          attachments: payload.attachments,
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