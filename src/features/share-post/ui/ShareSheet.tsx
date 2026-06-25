import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ChatRoom } from '@/entities/chat-room';
import type { DailyLog } from '@/entities/daily-log';

interface Props {
  log: DailyLog;
  rooms: ChatRoom[];
  onClose: () => void;
  onShareToRoom: (room: ChatRoom, log: DailyLog) => void;
}

/** 미디어를 채팅방으로 공유하거나 링크를 복사하는 시트 (feature: "공유한다"). */
export function ShareSheet({ log, rooms, onClose, onShareToRoom }: Props) {
  const insets = useSafeAreaInsets();

  const copyLink = () => {
    const url = `daylog://log/${log.id}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    onClose();
  };

  return (
    <View className="absolute inset-0 z-[60] justify-end">
      <Pressable className="absolute inset-0 bg-overlay" onPress={onClose} />
      <View
        className="rounded-t-xl border border-border bg-surface p-5"
        style={{ paddingBottom: 20 + insets.bottom }}
      >
        <Text className="text-lg font-bold text-text">이 로그 공유</Text>
        <Text className="mb-4 mt-1 text-[13px] text-textMuted">
          채팅방으로 보내 대화 맥락을 만들어보세요.
        </Text>

        {rooms.map((room) => (
          <Pressable
            key={room.id}
            className="flex-row items-center gap-3 py-3"
            onPress={() => onShareToRoom(room, log)}
          >
            <View className="h-10 w-10 items-center justify-center rounded-pill bg-primarySoft">
              <Text className="font-bold text-primary">{room.name.slice(0, 1)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-text">{room.name}</Text>
              <Text className="text-xs text-textMuted">{room.lastMessage}</Text>
            </View>
            <Text className="font-bold text-primary">보내기</Text>
          </Pressable>
        ))}

        <Pressable
          className="mt-3 items-center rounded-md bg-surfaceAlt py-3"
          onPress={copyLink}
        >
          <Text className="font-semibold text-text">🔗 링크 복사</Text>
        </Pressable>
      </View>
    </View>
  );
}
