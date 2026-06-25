import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChatStore, type ChatRoom } from '@/entities/chat-room';
import { useDailyLogStore, type DailyLog } from '@/entities/daily-log';
import { useNotificationStore } from '@/entities/notification';
import { ShareSheet } from '@/features/share-post';
import { UploadSheet } from '@/features/upload-media';
import { useBreakpoint } from '@/shared/lib';
import { ChatPanel } from '@/widgets/chat-panel';
import { FeedBoard } from '@/widgets/feed-board';
import { MediaDetailModal } from '@/widgets/media-detail';
import { NotificationsPanel } from '@/widgets/notifications-panel';
import { TopNav, type AppTab } from '@/widgets/top-nav';

import { FriendsPage } from '@/pages/friends';
import { ProfilePage } from '@/pages/profile';

const TAB_LABELS: Record<AppTab, string> = {
  feed: '피드',
  chat: '채팅',
  friends: '친구',
  profile: '프로필',
};

export function HomePage() {
  const { isDesktop } = useBreakpoint();
  const insets = useSafeAreaInsets();

  const logs = useDailyLogStore((s) => s.logs);
  const rooms = useChatStore((s) => s.rooms);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [selected, setSelected] = useState<DailyLog | null>(null);
  const [shareTarget, setShareTarget] = useState<DailyLog | null>(null);
  const [tab, setTab] = useState<AppTab>('feed');
  const [showUpload, setShowUpload] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  // 항상 최신 상태(반응 등)에서 다시 찾아 반영
  const selectedLive = selected ? logs.find((l) => l.id === selected.id) ?? null : null;

  const handleShareToRoom = (room: ChatRoom, log: DailyLog) => {
    appendMessage(room.id, {
      id: `m-${Date.now()}`,
      imageUri: log.mediaType === 'video' ? log.thumbnailUri ?? log.uri : log.uri,
      mediaType: log.mediaType,
      text: log.caption,
      mine: true,
    });
    setShareTarget(null);
    setSelected(null);
    setActiveRoom(room.id);
    setTab('chat');
  };

  const openLog = (log: DailyLog) => {
    setTab('feed');
    setSelected(log);
  };

  // ── 화면 조각 ────────────────────────────────────
  const Feed = (
    <View className="flex-1 overflow-hidden">
      <FeedBoard logs={logs} onSelectLog={setSelected} />
      {selectedLive && (
        <MediaDetailModal
          log={selectedLive}
          onClose={() => setSelected(null)}
          onShare={(l) => setShareTarget(l)}
        />
      )}
    </View>
  );

  const content = (forTab: AppTab) => {
    switch (forTab) {
      case 'feed':
        return Feed;
      case 'chat':
        return <ChatPanel />;
      case 'friends':
        return <FriendsPage />;
      case 'profile':
        return <ProfilePage onOpenLog={openLog} />;
    }
  };

  const overlays = (
    <>
      {shareTarget && (
        <ShareSheet
          log={shareTarget}
          rooms={rooms}
          onClose={() => setShareTarget(null)}
          onShareToRoom={handleShareToRoom}
        />
      )}
      {showUpload && <UploadSheet onClose={() => setShowUpload(false)} />}
      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
    </>
  );

  // ── 데스크탑: Split View ─────────────────────────
  if (isDesktop) {
    return (
      <View className="flex-1 bg-bg">
        <TopNav
          active={tab}
          onChange={setTab}
          onUpload={() => setShowUpload(true)}
          onBell={() => setShowNotifs(true)}
          unreadCount={unreadCount}
        />
        <View className="flex-1">
          {tab === 'feed' ? (
            <View className="flex-1 flex-row">
              <View className="w-[60%] border-r border-border">{Feed}</View>
              <View className="w-[40%]">
                <ChatPanel />
              </View>
            </View>
          ) : tab === 'chat' ? (
            <ChatPanel />
          ) : (
            content(tab)
          )}
        </View>
        {overlays}
      </View>
    );
  }

  // ── 모바일: Stack + 하단 탭 ──────────────────────
  return (
    <View className="flex-1 bg-bg">
      <TopNav
        active={tab}
        onChange={setTab}
        onUpload={() => setShowUpload(true)}
        onBell={() => setShowNotifs(true)}
        unreadCount={unreadCount}
        showTabs={false}
      />
      <View className="flex-1">{content(tab)}</View>

      <View className="flex-row border-t border-border bg-surface" style={{ paddingBottom: insets.bottom }}>
        {(['feed', 'chat', 'friends', 'profile'] as AppTab[]).map((t) => (
          <Pressable key={t} className="flex-1 items-center py-3" onPress={() => setTab(t)}>
            <Text className={`font-semibold ${tab === t ? 'text-primary' : 'text-textMuted'}`}>
              {TAB_LABELS[t]}
            </Text>
          </Pressable>
        ))}
      </View>

      {overlays}
    </View>
  );
}
