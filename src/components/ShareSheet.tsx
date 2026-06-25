import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { ChatRoom, DailyLog } from '../types';

interface Props {
  log: DailyLog;
  rooms: ChatRoom[];
  onClose: () => void;
  onShareToRoom: (room: ChatRoom, log: DailyLog) => void;
}

/** 미디어를 채팅방으로 공유하거나 링크를 복사하는 시트. */
export function ShareSheet({ log, rooms, onClose, onShareToRoom }: Props) {
  const copyLink = () => {
    const url = `daylog://log/${log.id}`;
    // 웹에서는 클립보드 API 사용
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    onClose();
  };

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>이 로그 공유</Text>
        <Text style={styles.sub}>채팅방으로 보내 대화 맥락을 만들어보세요.</Text>

        {rooms.map((room) => (
          <Pressable
            key={room.id}
            style={styles.row}
            onPress={() => onShareToRoom(room, log)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{room.name.slice(0, 1)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomLast}>{room.lastMessage}</Text>
            </View>
            <Text style={styles.send}>보내기</Text>
          </Pressable>
        ))}

        <Pressable style={styles.linkBtn} onPress={copyLink}>
          <Text style={styles.linkTxt}>🔗 링크 복사</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 60, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing(5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 4, marginBottom: spacing(4) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: spacing(3),
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: colors.primary, fontWeight: '700' },
  roomName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  roomLast: { color: colors.textMuted, fontSize: 12 },
  send: { color: colors.primary, fontWeight: '700' },
  linkBtn: {
    marginTop: spacing(3),
    paddingVertical: spacing(3),
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  linkTxt: { color: colors.text, fontWeight: '600' },
});
