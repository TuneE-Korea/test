import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatKoreanTimestamp } from '../dateUtils';
import { useApp } from '../store/AppContext';
import { colors, radius, spacing } from '../theme';
import { NotificationType } from '../types';

const ICON: Record<NotificationType, string> = {
  comment: '💬',
  friend: '👥',
  chat: '✉️',
  system: '🔔',
};

/** 알림 목록 패널 (FCM / Web Push 수신 알림의 인앱 표시). */
export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markAllRead } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.panel, { paddingTop: insets.top + spacing(2) }]}>
        <View style={styles.head}>
          <Text style={styles.title}>알림</Text>
          <View style={styles.headActions}>
            <Pressable onPress={markAllRead} hitSlop={8}>
              <Text style={styles.readAll}>모두 읽음</Text>
            </Pressable>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView>
          {notifications.map((n) => (
            <View key={n.id} style={[styles.row, !n.read && styles.unread]}>
              <Text style={styles.icon}>{ICON[n.type]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{n.title}</Text>
                <Text style={styles.body}>{n.body}</Text>
                <Text style={styles.time}>{formatKoreanTimestamp(n.createdAt)}</Text>
              </View>
              {!n.read && <View style={styles.dot} />}
            </View>
          ))}
          {notifications.length === 0 && <Text style={styles.empty}>알림이 없어요.</Text>}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 90, flexDirection: 'row', justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  panel: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(4),
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing(3),
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  headActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  readAll: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  close: { color: colors.textMuted, fontSize: 18 },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(2),
    borderRadius: radius.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  unread: { backgroundColor: colors.primarySoft },
  icon: { fontSize: 20 },
  rowTitle: { color: colors.text, fontWeight: '700', fontSize: 14 },
  body: { color: colors.text, fontSize: 13, marginTop: 2 },
  time: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing(8) },
});
