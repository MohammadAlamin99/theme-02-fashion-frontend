// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useEffect, useState, useRef } from "react";
// import { io, Socket } from "socket.io-client";
// import { apiFetch } from "@/utils/api";
// import { useAuthStore } from "@/store/useAuthStore";

// interface ChatAttachment {
//   id?: string;
//   url?: string;
//   name?: string;
//   type?: string;
//   size?: number;
// }

// interface MessageSender {
//   id: string;
//   name: string;
//   avatar: string | null;
//   role: string;
// }

// interface Message {
//   id: string;
//   conversation_id: string;
//   sender_id: string;
//   text: string | null;
//   content?: string | null;
//   attachments: ChatAttachment[] | null;
//   created_at: string;
//   sender: MessageSender;
// }

// interface RawMessage {
//   id: string;
//   conversation_id: string;
//   sender_id: string;
//   text?: string | null;
//   content?: string | null;
//   attachments?: ChatAttachment[] | null;
//   created_at: string;
//   sender: MessageSender;
// }

// interface TypingEvent {
//   userId: string;
// }

// interface SendMessagePayload {
//   text: string | null;
//   attachments: ChatAttachment[] | null;
// }

// interface RoomResponse {
//   data?: {
//     conversationId?: string;
//   };
//   conversationId?: string;
// }

// interface MessagesResponse {
//   data?: Message[] | { messages?: Message[] };
//   messages?: Message[];
// }

// let sharedSocketInstance: Socket | null = null;

// export function useChatEngine(isOpen: boolean) {
//   const queryClient = useQueryClient();
//   const user = useAuthStore((state) => state.user);
//   const [isAdminTyping, setIsAdminTyping] = useState(false);

//   const isOpenRef = useRef(isOpen);

//   useEffect(() => {
//     isOpenRef.current = isOpen;
//   }, [isOpen]);

//   // 1️⃣ Fetch Active Room ID
//   const { data: roomId } = useQuery({
//     queryKey: ["chat", "room"],
//     queryFn: async (): Promise<string> => {
//       const res = await apiFetch("/chat/conversations/sync-room", {
//         method: "GET",
//         headers: { "X-Customer-Request": "true" },
//       });

//       const json: RoomResponse = await res.json();

//       return json?.data?.conversationId || json?.conversationId || "";
//     },
//     enabled: !!user?.id && isOpen,
//   });

//   // 2️⃣ Fetch Message History Cache
//   const { data: messages = [], isLoading: loadingHistory } = useQuery<
//     Message[]
//   >({
//     queryKey: ["chat", "messages", roomId],
//     queryFn: async (): Promise<Message[]> => {
//       const res = await apiFetch(`/chat/conversations/${roomId}/messages`, {
//         method: "GET",
//         headers: { "X-Customer-Request": "true" },
//       });

//       if (!res.ok) {
//         throw new Error("Failed to fetch messages.");
//       }

//       const json: MessagesResponse = await res.json();

//       const rawData = json?.data !== undefined ? json.data : json;

//       const list: Message[] = Array.isArray(rawData)
//         ? rawData
//         : rawData?.messages || [];

//       return list.map((msg: Message) => ({
//         ...msg,
//         text: msg.text ?? msg.content ?? null,
//       }));
//     },
//     enabled: !!roomId && isOpen,
//   });

//   // 3️⃣ Socket Management
//   useEffect(() => {
//     if (!roomId || !isOpen) return;

//     const backendUrl =
//       process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//       "http://localhost:8082";

//     if (!sharedSocketInstance) {
//       sharedSocketInstance = io(`${backendUrl}/chat`, {
//         withCredentials: true,
//         transports: ["websocket"],
//         query: {
//           isCustomerRequest: "true",
//         },
//       });
//     }

//     const socket = sharedSocketInstance;

//     const handleConnect = () => {
//       socket.emit("joinRoom", {
//         conversationId: roomId,
//       });
//     };

//     if (socket.connected) {
//       handleConnect();
//     } else {
//       socket.on("connect", handleConnect);
//     }

//     const handleNewMessage = (rawMessage: RawMessage) => {
//       const message: Message = {
//         ...rawMessage,
//         text: rawMessage.text ?? rawMessage.content ?? null,
//         attachments: rawMessage.attachments ?? null,
//       };

//       queryClient.setQueryData(
//         ["chat", "messages", roomId],
//         (oldMessages: Message[] = []) => {
//           if (oldMessages.some((m) => m.id === message.id)) {
//             return oldMessages;
//           }

//           return [...oldMessages, message];
//         },
//       );
//     };

//     const handleUserTyping = (data: TypingEvent) => {
//       if (data.userId !== user?.id) {
//         setIsAdminTyping(true);
//       }
//     };

//     const handleUserStoppedTyping = (data: TypingEvent) => {
//       if (data.userId !== user?.id) {
//         setIsAdminTyping(false);
//       }
//     };

//     const handleException = (err: unknown) => {
//       console.error("[ChatSocket] Backend Exception:", err);
//     };

//     socket.on("newMessage", handleNewMessage);
//     socket.on("userTyping", handleUserTyping);
//     socket.on("userStoppedTyping", handleUserStoppedTyping);
//     socket.on("exception", handleException);

//     return () => {
//       socket.emit("leaveRoom", {
//         conversationId: roomId,
//       });

//       socket.off("connect", handleConnect);
//       socket.off("newMessage", handleNewMessage);
//       socket.off("userTyping", handleUserTyping);
//       socket.off("userStoppedTyping", handleUserStoppedTyping);
//       socket.off("exception", handleException);
//     };
//   }, [roomId, isOpen, queryClient, user?.id]);

//   // 4️⃣ Send Typing Indicators
//   const sendTypingStatus = (typing: boolean) => {
//     if (sharedSocketInstance && roomId) {
//       sharedSocketInstance.emit(typing ? "typing" : "stopTyping", {
//         conversationId: roomId,
//       });
//     }
//   };

//   // 5️⃣ Send Message Mutation
//   const sendMessageMutation = useMutation({
//     mutationFn: async (payload: SendMessagePayload): Promise<void> => {
//       if (sharedSocketInstance && roomId) {
//         sharedSocketInstance.emit("sendMessage", {
//           conversationId: roomId,
//           text: payload.text,
//           content: payload.text,
//           attachments: payload.attachments || [],
//         });
//       }
//     },
//   });

//   return {
//     roomId,
//     messages,
//     loadingHistory,
//     isAdminTyping,
//     sendTypingStatus,
//     sendMessage: sendMessageMutation.mutate,
//   };
// }

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string | null;
  content?: string | null;
  attachments: any[] | null;
  created_at: string;
  sender: { id: string; name: string; avatar: string | null; role: string };
}

let sharedSocketInstance: Socket | null = null;

export function useChatEngine(isOpen: boolean) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [isAdminTyping, setIsAdminTyping] = useState(false);

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
    enabled: !!user?.id && isOpen,
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

      return list.map((msg: any) => ({
        ...msg,
        text: msg.text ?? msg.content ?? null,
      }));
    },
    enabled: !!roomId && isOpen,
  });

  // 3️⃣ Socket Management
  useEffect(() => {
    if (!roomId || !isOpen) return;

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:8082";

    if (!sharedSocketInstance || !sharedSocketInstance.connected) {
      sharedSocketInstance = io(`${backendUrl}/chat`, {
        path: "/socket.io", // 🚀 Crucial for Traefik / Coolify proxy routing
        transports: ["websocket"], // 🚀 Force WebSocket only
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: { isCustomerRequest: "true" },
      });
    }

    const socket = sharedSocketInstance;

    const handleConnect = () => {
      console.log("[Socket] Connected successfully");
      socket.emit("joinRoom", { conversationId: roomId });
    };

    const handleConnectError = (err: any) => {
      console.error("[Socket] Connection Error:", err);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    socket.on("connect_error", handleConnectError);

    const handleNewMessage = (rawMessage: any) => {
      const message: Message = {
        ...rawMessage,
        text: rawMessage.text ?? rawMessage.content ?? null,
      };

      queryClient.setQueryData(
        ["chat", "messages", roomId],
        (oldMessages: Message[] = []) => {
          if (oldMessages.some((m) => m.id === message.id)) return oldMessages;
          return [...oldMessages, message];
        },
      );
    };

    const handleUserTyping = (data: { userId: string }) => {
      if (data.userId !== user?.id) setIsAdminTyping(true);
    };

    const handleUserStoppedTyping = (data: { userId: string }) => {
      if (data.userId !== user?.id) setIsAdminTyping(false);
    };

    const handleException = (err: any) => {
      console.error("[ChatSocket] Backend Exception:", err);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);
    socket.on("exception", handleException);

    return () => {
      socket.emit("leaveRoom", { conversationId: roomId });
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
      socket.off("exception", handleException);
    };
  }, [roomId, isOpen, queryClient, user?.id]);

  // 4️⃣ Send Typing Indicators
  const sendTypingStatus = (typing: boolean) => {
    if (sharedSocketInstance && roomId) {
      sharedSocketInstance.emit(typing ? "typing" : "stopTyping", {
        conversationId: roomId,
      });
    }
  };

  // 5️⃣ Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: {
      text: string | null;
      attachments: any[] | null;
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
