import { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useChatStore, type ChatMessage } from '@/entities/chat-room';
import { NewChatModal } from '@/features/create-room';
import { useSendMessage } from '@/features/send-message';
import { colors } from '@/shared/config';

// 온라인 여부 흉내 (방 id 기반 안정적 값)
function isOnline(id: string) {
  return [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % 2 === 0;
}

/**
 * 데스크탑 Split View 우측 영역(채팅) 및 채팅 탭.
 * - 방 목록/대화/입력을 스스로 관리(chat 스토어 + send-message·create-room feature)
 */
export function ChatPanel() {
  const rooms = useChatStore((s) => s.rooms);
  const activeId = useChatStore((s) => s.activeRoomId);
  const setActive = useChatStore((s) => s.setActiveRoom);
  const { send, typingRoomId } = useSendMessage();

  const [draft, setDraft] = useState('');
  const [showNew, setShowNew] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const activeRoom = rooms.find((r) => r.id === activeId) ?? rooms[0];

  const submit = () => {
    const text = draft.trim();
    if (!text || !activeRoom) return;
    send(activeRoom.id, text);
    setDraft('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text className="text-lg font-bold text-text">채팅</Text>
        <Pressable className="rounded-pill bg-primarySoft px-3 py-2" onPress={() => setShowNew(true)}>
          <Text className="text-[13px] font-bold text-primary">＋ 새 채팅</Text>
        </Pressable>
      </View>

      <View className="flex-1 flex-row">
        {/* 방 목록 */}
        <ScrollView className="w-[38%] border-r border-border">
          {rooms.map((r) => (
            <Pressable
              key={r.id}
              className={`flex-row items-center gap-3 p-3 ${activeId === r.id ? 'bg-surfaceAlt' : ''}`}
              onPress={() => setActive(r.id)}
            >
              <View className="h-[38px] w-[38px] items-center justify-center rounded-pill bg-primarySoft">
                <Text className="font-bold text-primary">{r.name.slice(0, 1)}</Text>
                {isOnline(r.id) && (
                  <View className="absolute -bottom-px -right-px h-[11px] w-[11px] rounded-pill border-2 border-bg bg-[#22c55e]" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-text">{r.name}</Text>
                <Text numberOfLines={1} className="text-xs text-textMuted">
                  {typingRoomId === r.id ? '입력 중…' : r.lastMessage}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* 대화 */}
        <View className="flex-1 p-3">
          <View className="mb-2 flex-row items-center justify-between border-b border-border pb-2">
            <Text className="text-[15px] font-bold text-text">{activeRoom?.name}</Text>
            {activeRoom && (
              <View className="flex-row items-center gap-1.5">
                <View
                  className={`h-2 w-2 rounded-pill ${isOnline(activeRoom.id) ? 'bg-[#22c55e]' : 'bg-textMuted'}`}
                />
                <Text className="text-xs text-textMuted">
                  {isOnline(activeRoom.id) ? '온라인' : '오프라인'}
                </Text>
              </View>
            )}
          </View>

          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerStyle={{ justifyContent: 'flex-end', flexGrow: 1, gap: 8 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {activeRoom?.messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
            {typingRoomId === activeRoom?.id && (
              <View className="self-start rounded-md bg-surfaceAlt px-3 py-2">
                <Text className="text-[13px] italic text-textMuted">상대가 입력 중…</Text>
              </View>
            )}
          </ScrollView>

          <View className="mt-2 flex-row gap-2">
            <TextInput
              className="flex-1 rounded-pill border border-border bg-surfaceAlt px-4 py-2 text-text"
              value={draft}
              onChangeText={setDraft}
              placeholder="메시지를 입력하세요…"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={submit}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <Pressable className="justify-center rounded-pill bg-primary px-4" onPress={submit}>
              <Text className="font-bold text-white">전송</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {showNew && (
        <NewChatModal
          onClose={() => setShowNew(false)}
          onCreated={(roomId) => {
            setShowNew(false);
            setActive(roomId);
          }}
        />
      )}
    </View>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.mine;
  return (
    <View
      className={`max-w-[80%] rounded-md px-3 py-2 ${
        mine ? 'self-end bg-primary' : 'self-start bg-surfaceAlt'
      }`}
    >
      {!!message.imageUri && (
        <View className="mb-1 overflow-hidden rounded-sm">
          <Image source={{ uri: message.imageUri }} className="h-40 w-40" resizeMode="cover" />
          {message.mediaType === 'video' && (
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-2xl text-white">▶</Text>
            </View>
          )}
        </View>
      )}
      {!!message.text && (
        <Text className={mine ? 'text-white' : 'text-text'}>{message.text}</Text>
      )}
    </View>
  );
}
