'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { socketClient } from '@/lib/socket';
import { useNotificationStore } from '@/stores/notificationStore';
import { useChatStore } from '@/stores/chatStore';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const receiveMessage = useChatStore((state) => state.receiveMessage);
  const setTyping = useChatStore((state) => state.setTyping);

  useEffect(() => {
    if (!isAuthenticated) return;

    socketClient.connect();
    const socket = socketClient.getSocket();

    if (socket) {
      socketClient.onNotification((notification) => {
        addNotification(notification);
      });

      socketClient.onNewMessage((message) => {
        receiveMessage(message.roomId, message);
      });

      socketClient.onTyping((data) => {
        setTyping(data.roomId, data.userId, true);
        setTimeout(() => {
          setTyping(data.roomId, data.userId, false);
        }, 3000);
      });
    }

    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated, addNotification, receiveMessage, setTyping]);

  return <>{children}</>;
}
