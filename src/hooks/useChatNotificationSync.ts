import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationStore } from "@/store/useNotificationStore";
import { notificationApi } from "@/services-api/notificationService";
import { toast } from "react-hot-toast";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:8082";

const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export const useChatNotificationSync = () => {
  const { setNotifications, addNotification } = useNotificationStore();

  useEffect(() => {
    // 1. Fetch history (Already filtered in service)
    notificationApi.getRecent().then(data => {
      setNotifications(data);
    });

    // 2. Listen for Real-time events
    socket.on("newNotification", (notification: any) => {
      // 🚀 FILTER: Only push if it's an Order or Review
      if (notification.type === 'ORDER' || notification.type === 'REVIEW') {
        addNotification(notification);
        
        toast(notification.title, {
          icon: notification.type === 'ORDER' ? '📦' : '⭐',
          style: { borderRadius: '10px', background: '#023337', color: '#fff', fontSize: '14px' },
          duration: 5000,
        });
      }
    });

    return () => {
      socket.off("newNotification");
    };
  }, [setNotifications, addNotification]);
};