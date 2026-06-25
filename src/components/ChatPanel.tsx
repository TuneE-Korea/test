import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { ChatRoom } from '../types';

interface Props {
  rooms: ChatRoom[];
}

/**
 * 데스크탑 Split View 의 우측 영역(채팅).
 * 실시간 STOMP/SockJS 연동 전까지는 목업 UI 만 제공한다.
 * 미디어 모달이 이 영역을 가리지 않는다는 점을 보여주기 위한 자리.
 */
export function ChatPanel({ rooms }: Props) {
  const [activeId, setActiveId] = useState(rooms[0]?.id);
  const activeRoom = rooms.find((r) => r.id === activeId) ?? rooms[0];

  return (
    <View style={styles.root}>
      <Text style={styles.header}>채팅</Text>
      <View style={styles.split}>
        <ScrollView style={styles.list}>
          {rooms.map((r) => (
            <Pressable
              key={r.id}
              style={[styles.room, activeId === r.id && styles.roomActive]}
              onPress={() => setActiveId(r.id)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{r.name.slice(0, 1)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.roomName}>{r.name}</Text>
                <Text style={styles.roomLast} numberOfLines={1}>
                  {r.lastMessage}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.thread}>
          <Text style={styles.threadTitle}>{activeRoom?.name}</Text>
          <ScrollView
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
          >
            {activeRoom?.messages.map((m) => (
              <View key={m.id} style={m.mine ? styles.bubbleOut : styles.bubbleIn}>
                <Text style={styles.bubbleTxt}>{m.text}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.composer}>
            <Text style={styles.composerHint}>메시지를 입력하세요…</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    padding: spacing(4),
    paddingBottom: spacing(2),
  },
  split: { flex: 1, flexDirection: 'row' },
  list: {
    width: '38%',
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  room: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing(3) },
  roomActive: { backgroundColor: colors.surfaceAlt },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: colors.primary, fontWeight: '700' },
  roomName: { color: colors.text, fontWeight: '600' },
  roomLast: { color: colors.textMuted, fontSize: 12 },
  thread: { flex: 1, padding: spacing(3) },
  threadTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
    paddingBottom: spacing(2),
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing(2),
  },
  messages: { flex: 1 },
  messagesContent: { justifyContent: 'flex-end', flexGrow: 1, gap: 8 },
  bubbleIn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    maxWidth: '80%',
  },
  bubbleOut: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    maxWidth: '80%',
  },
  bubbleTxt: { color: '#fff' },
  composer: {
    marginTop: spacing(2),
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
  },
  composerHint: { color: colors.textMuted },
});
