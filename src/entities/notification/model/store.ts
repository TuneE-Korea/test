import { create } from 'zustand';

import { mockNotifications } from '@/data/mockLogs';

import type { AppNotification, NotificationType } from './types';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: () => number;
  markAllRead: () => void;
  /** 인앱 알림 생성 (실제로는 FCM/Web Push 수신). */
  push: (type: NotificationType, title: string, body: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: mockNotifications,

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  markAllRead: () =>
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),

  push: (type, title, body) =>
    set((state) => ({
      notifications: [
        { id: `n-${Date.now()}`, type, title, body, createdAt: new Date().toISOString(), read: false },
        ...state.notifications,
      ],
    })),
}));
