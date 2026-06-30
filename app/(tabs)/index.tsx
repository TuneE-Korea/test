import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useChatStore, type ChatRoom } from '@/entities/chat-room';
import { useDailyLogStore, type DailyLog } from '@/entities/daily-log';
import { ShareSheet } from '@/features/share-post';
import { useBreakpoint } from '@/shared/lib';
import { FeedBoard } from '@/widgets/feed-board';
import { MediaDetailModal } from '@/widgets/media-detail';

/**
 * 피드 라우트 ('/').
 * 상세 모달은 URL 쿼리(?log=ID)로 제어 → 딥링크/뒤로가기 가능하면서도
 * 피드 영역 안에서만 떠서 데스크탑 채팅 사이드바를 가리지 않는다.
 */
export default function FeedRoute() {
  const router = useRouter();
  const { isDesktop } = useBreakpoint();
  const logs = useDailyLogStore((s) => s.logs);
  const rooms = useChatStore((s) => s.rooms);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);

  const { log: logId } = useLocalSearchParams<{ log?: string }>();
  const selected = logId ? logs.find((l) => l.id === logId) ?? null : null;
  const [shareTarget, setShareTarget] = useState<DailyLog | null>(null);

  const openLog = (l: DailyLog) => router.setParams({ log: l.id });
  const closeLog = () => router.setParams({ log: '' });

  const handleShareToRoom = (room: ChatRoom, log: DailyLog) => {
    appendMessage(room.id, {
      id: `m-${Date.now()}`,
      imageUri: log.mediaType === 'video' ? log.thumbnailUri ?? log.uri : log.uri,
      mediaType: log.mediaType,
      text: log.caption,
      mine: true,
    });
    setShareTarget(null);
    closeLog();
    setActiveRoom(room.id);
    if (!isDesktop) router.navigate('/chat'); // 모바일은 채팅 화면으로 이동
  };

  return (
    <View className="flex-1 overflow-hidden">
      <FeedBoard logs={logs} onSelectLog={openLog} />
      {selected && (
        <MediaDetailModal
          log={selected}
          onClose={closeLog}
          onShare={(l) => setShareTarget(l)}
        />
      )}
      {shareTarget && (
        <ShareSheet
          log={shareTarget}
          rooms={rooms}
          onClose={() => setShareTarget(null)}
          onShareToRoom={handleShareToRoom}
        />
      )}
    </View>
  );
}
