import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatPanel } from '../components/ChatPanel';
import { CommentsPanel } from '../components/CommentsPanel';
import { FeedView } from '../components/FeedView';
import { MediaModal } from '../components/MediaModal';
import { NotificationsPanel } from '../components/NotificationsPanel';
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
  const { logs, rooms, addComment, appendMessage, unreadCount } = useApp();

  const [selected, setSelected] = useState<DailyLog | null>(null);
  const [shareTarget, setShareTarget] = useState<DailyLog | null>(null);
  const [tab, setTab] = useState<AppTab>('feed');
  const [activeRoomId, setActiveRoomId] = useState<string>(rooms[0].id);
  const [showUpload, setShowUpload] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  /** 데스크탑 우측 분할창 탭: 채팅 / 댓글·반응 */
  const [rightTab, setRightTab] = useState<'chat' | 'comments'>('chat');
  /** 상대가 입력 중인 방 (실시간 흉내) */
  const [typingRoomId, setTypingRoomId] = useState<string | null>(null);

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
    // 실시간 흉내: 잠시 후 상대가 "입력 중…" 표시 후 자동 응답
    setTypingRoomId(roomId);
    const replies = ['오 좋다!', 'ㅋㅋㅋ 인정', '와 대박', '나도 가고 싶다', '👍'];
    setTimeout(() => {
      setTypingRoomId((cur) => (cur === roomId ? null : cur));
      appendMessage(roomId, {
        id: `m-${Date.now()}-r`,
        text: replies[Math.floor(Math.random() * replies.length)],
        mine: false,
      });
    }, 1500);
  };

  const openLog = (log: DailyLog) => {
    setTab('feed');
    setSelected(log);
  };

  // 데스크탑: 카드 선택 시 우측 댓글 탭으로 열기
  const selectOnDesktop = (log: DailyLog) => {
    setSelected(log);
    setRightTab('comments');
  };

  // ── 화면 조각 ────────────────────────────────────
  // 데스크탑 피드: 모달 없이 좌측에 표시(댓글은 우측 패널)
  const FeedDesktop = (
    <View style={styles.feedArea}>
      <FeedView logs={logs} onSelectLog={selectOnDesktop} />
    </View>
  );

  // 모바일 피드: 선택 시 상세 모달
  const FeedMobile = (
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
      typingRoomId={typingRoomId}
    />
  );

  // 데스크탑 우측 분할창: 채팅 ↔ 댓글·반응 탭
  const RightColumn = (
    <View style={styles.rightCol}>
      <View style={styles.rightTabs}>
        {(['chat', 'comments'] as const).map((rt) => (
          <Pressable
            key={rt}
            style={[styles.rightTab, rightTab === rt && styles.rightTabActive]}
            onPress={() => setRightTab(rt)}
          >
            <Text style={[styles.rightTabTxt, rightTab === rt && styles.rightTabTxtActive]}>
              {rt === 'chat' ? '채팅' : '댓글·반응'}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        {rightTab === 'chat' ? (
          Chat
        ) : (
          <CommentsPanel log={selectedLive} onShare={(l) => setShareTarget(l)} />
        )}
      </View>
    </View>
  );

  const content = (forTab: AppTab) => {
    switch (forTab) {
      case 'feed':
        return FeedMobile;
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
      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
    </>
  );

  // ── 데스크탑 ─────────────────────────────────────
  if (isDesktop) {
    return (
      <View style={styles.root}>
        <TopNav
          active={tab}
          onChange={setTab}
          onUpload={() => setShowUpload(true)}
          onBell={() => setShowNotifs(true)}
          unreadCount={unreadCount}
        />
        <View style={styles.body}>
          {tab === 'feed' ? (
            <View style={styles.desktopRow}>
              <View style={styles.feedCol}>{FeedDesktop}</View>
              <View style={styles.chatCol}>{RightColumn}</View>
            </View>
          ) : tab === 'chat' ? (
            Chat
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
        onBell={() => setShowNotifs(true)}
        unreadCount={unreadCount}
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
  rightCol: { flex: 1 },
  rightTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rightTab: { flex: 1, alignItems: 'center', paddingVertical: spacing(3), borderBottomWidth: 2, borderColor: 'transparent' },
  rightTabActive: { borderColor: colors.primary },
  rightTabTxt: { color: colors.textMuted, fontWeight: '700' },
  rightTabTxtActive: { color: colors.primary },
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
