'use client';

import { create } from 'zustand';
import { Notification } from '@/types';
import { api } from '@/lib/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  fetchNotifications: (reset?: boolean) => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: true,
  page: 1,

  fetchNotifications: async (reset = false) => {
    const { page, notifications, isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true });

    try {
      const currentPage = reset ? 1 : page;
      const response = await api.getNotifications(currentPage, 20);
      const newNotifications = response.data.data || [];

      set({
        notifications: reset ? newNotifications : [...notifications, ...newNotifications],
        page: currentPage + 1,
        hasMore: response.data.pagination?.hasMore ?? false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.markAllNotificationsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  setUnreadCount: (count) => set({ unreadCount: count }),
}));
