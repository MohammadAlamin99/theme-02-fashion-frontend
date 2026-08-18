// import { useEffect } from "react";
// import { io, Socket } from "socket.io-client";
// import { useNotificationStore } from "@/store/useNotificationStore";
// import { notificationApi } from "@/services-api/notificationService";
// import { toast } from "react-hot-toast";

// const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:8082";

// const socket: Socket = io(SOCKET_URL, {
//   transports: ["websocket"],
//   autoConnect: true,
// });

// export const useChatNotificationSync = () => {
//   const { setNotifications, addNotification } = useNotificationStore();

//   useEffect(() => {
//     // 1. Fetch history (Already filtered in service)
//     notificationApi.getRecent().then(data => {
//       setNotifications(data);
//     });

//     // 2. Listen for Real-time events
//     socket.on("newNotification", (notification: any) => {
//       // 🚀 FILTER: Only push if it's an Order or Review
//       if (notification.type === 'ORDER' || notification.type === 'REVIEW') {
//         addNotification(notification);

//         toast(notification.title, {
//           icon: notification.type === 'ORDER' ? '📦' : '⭐',
//           style: { borderRadius: '10px', background: '#023337', color: '#fff', fontSize: '14px' },
//           duration: 5000,
//         });
//       }
//     });

//     return () => {
//       socket.off("newNotification");
//     };
//   }, [setNotifications, addNotification]);
// };

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { notificationApi } from "@/services-api/notificationService";
import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";
import { toast } from "react-hot-toast";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
  "http://localhost:8082";

// // 1. Root Socket for System Notifications
// const rootSocket: Socket = io(SOCKET_URL, {
//   transports: ["websocket"],
//   autoConnect: true,
// });

// 1. Root Notification Socket
const rootSocket: Socket = io(SOCKET_URL, {
  transports: ["websocket"], // 🚀 Force pure websocket mode
  withCredentials: true,
  autoConnect: true,
});

export const useChatNotificationSync = () => {
  const { setNotifications, addNotification } = useNotificationStore();
  const { unreadMessageCount, setUnreadMessageCount, isChatOpen } =
    useAuthStore();

  useEffect(() => {
    let chatSocket: Socket | null = null;

    const initializeSync = async () => {
      const adminToken = await getAdminTokenAction();
      if (!adminToken) return;

      // --- A. INITIAL UNREAD FETCH ---
      // Fetch rooms to calculate total unread count on load
      try {
        const res = await apiFetch("/chat/rooms", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "X-Admin-Request": "true",
          },
        });
        if (res.ok) {
          const roomData = await res.json();
          const rooms = Array.isArray(roomData)
            ? roomData
            : roomData?.rooms || roomData?.data || [];
          const totalUnread = rooms.reduce(
            (acc: number, room: any) => acc + (room.unreadCount || 0),
            0,
          );
          setUnreadMessageCount(totalUnread);
        }
      } catch (err) {
        console.error("Failed to fetch initial unread count", err);
      }

      // --- B. AUTHENTICATED CHAT SOCKET ---
      // chatSocket = io(`${SOCKET_URL}/chat`, {
      //   transports: ["websocket"],
      //   auth: { token: adminToken }, // 🚀 CRITICAL: Must have token to hear messages
      //   query: { isAdmin: "true" },
      // });

      // 2. Chat Socket
      chatSocket = io(`${SOCKET_URL}/chat`, {
        transports: ["websocket"], // 🚀 Force pure websocket mode
        withCredentials: true,
        auth: { token: adminToken },
        query: { isAdmin: "true" },
      });

      chatSocket.on("newMessage", (message: any) => {
        const state = useAuthStore.getState();
        // Only increment if user is NOT currently looking at the chat
        if (!state.isChatOpen) {
          state.setUnreadMessageCount(state.unreadMessageCount + 1);
          toast(`New message received`, {
            icon: "💬",
            style: { background: "#FF6A00", color: "#fff" },
          });
        }
      });
    };

    // --- C. SYSTEM NOTIFICATIONS ---
    rootSocket.on("newNotification", (notification: any) => {
      if (notification.type === "ORDER" || notification.type === "REVIEW") {
        addNotification(notification);
        toast(notification.title, { icon: "🔔" });
      }
    });

    // Fetch history
    notificationApi.getRecent().then((data) => setNotifications(data));

    initializeSync();

    return () => {
      rootSocket.off("newNotification");
      if (chatSocket) {
        chatSocket.off("newMessage");
        chatSocket.disconnect();
      }
    };
  }, [setNotifications, addNotification, setUnreadMessageCount]);
};
