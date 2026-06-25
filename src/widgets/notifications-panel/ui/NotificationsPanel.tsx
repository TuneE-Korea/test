import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotificationStore, type NotificationType } from '@/entities/notification';
import { formatKoreanTimestamp } from '@/shared/lib';

const ICON: Record<NotificationType, string> = {
  comment: '💬',
  friend: '👥',
  chat: '✉️',
  system: '🔔',
};

/** 알림 목록 패널 (FCM / Web Push 수신 알림의 인앱 표시). */
export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute inset-0 z-[90] flex-row justify-end">
      <Pressable className="absolute inset-0 bg-overlay" onPress={onClose} />
      <View
        className="w-full max-w-[380px] border-l border-border bg-surface px-4"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-between py-3">
          <Text className="text-lg font-extrabold text-text">알림</Text>
          <View className="flex-row items-center gap-4">
            <Pressable onPress={markAllRead} hitSlop={8}>
              <Text className="text-[13px] font-bold text-primary">모두 읽음</Text>
            </Pressable>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text className="text-lg text-textMuted">✕</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView>
          {notifications.map((n) => (
            <View
              key={n.id}
              className={`flex-row gap-3 rounded-md border-b border-border px-2 py-3 ${
                !n.read ? 'bg-primarySoft' : ''
              }`}
            >
              <Text className="text-xl">{ICON[n.type]}</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-text">{n.title}</Text>
                <Text className="mt-0.5 text-[13px] text-text">{n.body}</Text>
                <Text className="mt-1 text-[11px] text-textMuted">
                  {formatKoreanTimestamp(n.createdAt)}
                </Text>
              </View>
              {!n.read && <View className="mt-1.5 h-2 w-2 rounded-pill bg-primary" />}
            </View>
          ))}
          {notifications.length === 0 && (
            <Text className="mt-8 text-center text-textMuted">알림이 없어요.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
