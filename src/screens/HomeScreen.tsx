import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatPanel } from '../components/ChatPanel';
import { FeedView } from '../components/FeedView';
import { MediaModal } from '../components/MediaModal';
import { ShareSheet } from '../components/ShareSheet';
import { AppTab, TopNav } from '../components/TopNav';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useApp } from '../store/AppContext';
import { colors, spacing } from '../theme';
import { ChatRoom, DailyLog } from '../types';
import { FriendsScreen } from './FriendsScreen';
import { ProfileScreen } from './ProfileScreen';
import { UploadSheet } from './UploadSheet';

const TAB_LABELS: Record<AppTab, string> = {
  feed: '피드',
  chat: '채팅',
  friends: '친구',
  profile: '프로필',
};

export function HomeScreen() {
  const { isDesktop } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const { logs, rooms, addComment, appendMessage } = useApp();

  const [selected, setSelected] = useState<DailyLog | null>(null);
  const [shareTarget, setShareTarget] = useState<DailyLog | null>(null);
  const [tab, setTab] = useState<AppTab>('feed');
  const [activeRoomId, setActiveRoomId] = useState<string>(rooms[0].id);
  const [showUpload, setShowUpload] = useState(false);

  // 항상 최신 상태에서 다시 찾아 댓글 반영
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
    setActiveRoomId(room.id);
    setTab('chat');
  };

  const handleSend = (roomId: string, text: string) => {
    appendMessage(roomId, { id: `m-${Date.now()}`, text, mine: true });
  };

  const openLog = (log: DailyLog) => {
    setTab('feed');
    setSelected(log);
  };

  // ── 화면 조각 ────────────────────────────────────
  const Feed = (
    <View style={styles.feedArea}>
      <FeedView logs={logs} onSelectLog={setSelected} />
      {selectedLive && (
        <MediaModal
          log={selectedLive}
          onClose={() => setSelected(null)}
          onShare={(l) => setShareTarget(l)}
          onAddComment={addComment}
        />
      )}
    </View>
  );

  const Chat = (
    <ChatPanel
      rooms={rooms}
      activeId={activeRoomId}
      onChangeActive={setActiveRoomId}
      onSend={handleSend}
    />
  );

  const content = (forTab: AppTab) => {
    switch (forTab) {
      case 'feed':
        return Feed;
      case 'chat':
        return Chat;
      case 'friends':
        return <FriendsScreen />;
      case 'profile':
        return <ProfileScreen onOpenLog={openLog} />;
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
    </>
  );

  // ── 데스크탑 ─────────────────────────────────────
  if (isDesktop) {
    return (
      <View style={styles.root}>
        <TopNav active={tab} onChange={setTab} onUpload={() => setShowUpload(true)} />
        <View style={styles.body}>
          {tab === 'feed' ? (
            <View style={styles.desktopRow}>
              <View style={styles.feedCol}>{Feed}</View>
              <View style={styles.chatCol}>{Chat}</View>
            </View>
          ) : (
            content(tab)
          )}
        </View>
        {overlays}
      </View>
    );
  }

  // ── 모바일 ───────────────────────────────────────
  return (
    <View style={styles.root}>
      <TopNav
        active={tab}
        onChange={setTab}
        onUpload={() => setShowUpload(true)}
        showTabs={false}
      />
      <View style={styles.body}>{content(tab)}</View>

      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        {(['feed', 'chat', 'friends', 'profile'] as AppTab[]).map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => setTab(t)}>
            <Text style={[styles.tabTxt, tab === t && styles.tabActive]}>{TAB_LABELS[t]}</Text>
          </Pressable>
        ))}
      </View>

      {overlays}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
  desktopRow: { flex: 1, flexDirection: 'row' },
  feedCol: { width: '60%', borderRightWidth: 1, borderColor: colors.border },
  chatCol: { width: '40%' },
  feedArea: { flex: 1, overflow: 'hidden' },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing(3) },
  tabTxt: { color: colors.textMuted, fontWeight: '600' },
  tabActive: { color: colors.primary },
});
