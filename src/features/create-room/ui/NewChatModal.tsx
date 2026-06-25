import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { useChatStore } from '@/entities/chat-room';
import { useUserStore } from '@/entities/user';

/** 친구를 골라 1:1/그룹 채팅방을 만든다 (feature: "방을 만든다"). */
export function NewChatModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (roomId: string) => void;
}) {
  // friends 변화 구독 → 목록 재계산 (friendList() 는 getState 로 호출)
  const friends = useUserStore((s) => s.friends);
  const friendList = useUserStore.getState().friendList();
  const createRoom = useChatStore((s) => s.createRoom);
  const [selected, setSelected] = useState<string[]>([]);
  // friends 를 참조해 lint/구독 유지
  void friends;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const create = () => {
    if (selected.length === 0) return;
    onCreated(createRoom(selected));
  };

  return (
    <View className="absolute inset-0 z-[80] items-center justify-center">
      <Pressable className="absolute inset-0 bg-overlay" onPress={onClose} />
      <View className="max-h-[80%] w-[90%] max-w-[420px] rounded-lg border border-border bg-surface p-5">
        <Text className="text-lg font-bold text-text">새 채팅</Text>
        <Text className="mb-3 mt-1 text-[13px] text-textMuted">
          친구를 선택하세요. {selected.length >= 2 ? '(그룹 채팅)' : ''}
        </Text>

        <ScrollView className="max-h-[320px]">
          {friendList.map((f) => {
            const on = selected.includes(f.user.id);
            return (
              <Pressable
                key={f.user.id}
                className="flex-row items-center gap-3 py-3"
                onPress={() => toggle(f.user.id)}
              >
                <Image source={{ uri: f.user.avatarUri }} className="h-10 w-10 rounded-pill bg-surfaceAlt" />
                <Text className="flex-1 text-[15px] font-semibold text-text">{f.user.name}</Text>
                <View
                  className={`h-6 w-6 items-center justify-center rounded-pill border-2 ${
                    on ? 'border-primary bg-primary' : 'border-border'
                  }`}
                >
                  {on && <Text className="text-sm font-extrabold text-white">✓</Text>}
                </View>
              </Pressable>
            );
          })}
          {friendList.length === 0 && (
            <Text className="py-4 text-center text-textMuted">친구를 먼저 추가하세요.</Text>
          )}
        </ScrollView>

        <View className="mt-4 flex-row gap-2.5">
          <Pressable className="flex-1 items-center rounded-md bg-surfaceAlt py-3" onPress={onClose}>
            <Text className="font-bold text-text">취소</Text>
          </Pressable>
          <Pressable
            className="flex-1 items-center rounded-md bg-primary py-3"
            style={selected.length === 0 && { opacity: 0.5 }}
            onPress={create}
            disabled={selected.length === 0}
          >
            <Text className="font-extrabold text-white">
              만들기{selected.length > 0 ? ` (${selected.length})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
