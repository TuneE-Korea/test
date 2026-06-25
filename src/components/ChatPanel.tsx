import { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radius, spacing } from '../theme';
import { ChatMessage, ChatRoom } from '../types';

interface Props {
  rooms: ChatRoom[];
  activeId: string;
  onChangeActive: (id: string) => void;
  onSend: (roomId: string, text: string) => void;
}

/**
 * 데스크탑 Split View 우측 영역(채팅) 및 채팅 탭.
 * - 좌측 방 목록 클릭 시 해당 방 대화로 전환(controlled)
 * - 입력창에서 메시지 전송 가능
 * - 공유된 미디어는 말풍선 안에 이미지로 표시
 */
export function ChatPanel({ rooms, activeId, onChangeActive, onSend }: Props) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const activeRoom = rooms.find((r) => r.id === activeId) ?? rooms[0];

  const submit = () => {
    const text = draft.trim();
    if (!text || !activeRoom) return;
    onSend(activeRoom.id, text);
    setDraft('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <View style={styles.root}>
      <Text style={styles.header}>채팅</Text>
      <View style={styles.split}>
        <ScrollView style={styles.list}>
          {rooms.map((r) => (
            <Pressable
              key={r.id}
              style={[styles.room, activeId === r.id && styles.roomActive]}
              onPress={() => onChangeActive(r.id)}
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
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {activeRoom?.messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="메시지를 입력하세요…"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={submit}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <Pressable style={styles.sendBtn} onPress={submit}>
              <Text style={styles.sendTxt}>전송</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.mine;
  return (
    <View style={mine ? styles.bubbleOut : styles.bubbleIn}>
      {!!message.imageUri && (
        <View style={styles.mediaWrap}>
          <Image source={{ uri: message.imageUri }} style={styles.media} resizeMode="cover" />
          {message.mediaType === 'video' && (
            <View style={styles.playBadge}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          )}
        </View>
      )}
      {!!message.text && <Text style={styles.bubbleTxt}>{message.text}</Text>}
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
  mediaWrap: { width: 160, height: 160, borderRadius: radius.sm, overflow: 'hidden' },
  media: { width: '100%', height: '100%' },
  playBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#fff', fontSize: 12, marginLeft: 2 },
  composer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing(2),
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  sendTxt: { color: '#fff', fontWeight: '700' },
});
