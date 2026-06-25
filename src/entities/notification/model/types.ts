export type NotificationType = 'comment' | 'friend' | 'chat' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string; // ISO
  read: boolean;
}
