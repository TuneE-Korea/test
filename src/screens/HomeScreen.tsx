import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalendarFeed } from '../components/CalendarFeed';
import { ChatPanel } from '../components/ChatPanel';
import { MediaModal } from '../components/MediaModal';
import { ShareSheet } from '../components/ShareSheet';
import { AppTab, TopNav } from '../components/TopNav';
import { mockChatRooms, mockLogs } from '../data/mockLogs';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { colors, spacing } from '../theme';
import { ChatMessage, ChatRoom, DailyLog } from '../types';

export function HomeScreen() {
  const { isDesktop } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<DailyLog[]>(mockLogs);
  const [rooms, setRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [activeRoomId, setActiveRoomId] = useState<string>(mockChatRooms[0].id);
  const [selected, setSelected] = useState<DailyLog | null>(null);
  const [shareTarget, setShareTarget] = useState<DailyLog | null>(null);
  const [tab, setTab] = useState<AppTab>('feed');

  // 현재 선택된 로그를 항상 최신 상태(logs)에서 다시 찾아 댓글 반영
  const selectedLive = selected ? logs.find((l) => l.id === selected.id) ?? null : null;

  const addComment = useCallback((logId: string, text: string) => {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? {
              ...l,
              comments: [
                ...l.comments,
                {
                  id: `c-${Date.now()}`,
                  author: '나',
                  text,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : l,
      ),
    );
  }, []);

  // 특정 방에 메시지 추가 (공유/전송 공통)
  const appendMessage = useCallback((roomId: string, msg: ChatMessage) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              messages: [...r.messages, msg],
              lastMessage: msg.text ?? (msg.mediaType === 'video' ? '[동영상]' : '[사진]'),
            }
          : r,
      ),
    );
  }, []);

  const handleShareToRoom = (room: ChatRoom, log: DailyLog) => {
    // 공유한 미디어를 해당 방의 메시지로 추가
    appendMessage(room.id, {
      id: `m-${Date.now()}`,
      imageUri: log.mediaType === 'video' ? log.thumbnailUri ?? log.uri : log.uri,
      mediaType: log.mediaType,
      text: log.caption,
      mine: true,
    });
    setShareTarget(null);
    setSelected(null); // 상세 모달 닫기
    setActiveRoomId(room.id); // 공유한 방으로 전환
    setTab('chat'); // 채팅 화면으로 이동 (데스크탑은 우측에 그대로 보임)
  };

  const handleSend = useCallback(
    (roomId: string, text: string) => {
      appendMessage(roomId, { id: `m-${Date.now()}`, text, mine: true });
    },
    [appendMessage],
  );

  // 피드 영역(캘린더 + 상세 모달). 모달은 이 컨테이너 내부에 오버레이되어
  // 데스크탑에서 우측 채팅 영역을 가리지 않는다.
  const Feed = (
    <View style={styles.feedArea}>
      <CalendarFeed logs={logs} onSelectLog={setSelected} />
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

  const Profile = (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTxt}>프로필 (준비 중)</Text>
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

  const shareSheet = shareTarget && (
    <ShareSheet
      log={shareTarget}
      rooms={rooms}
      onClose={() => setShareTarget(null)}
      onShareToRoom={handleShareToRoom}
    />
  );

  // ── 데스크탑: 상단 네비 + 탭별 콘텐츠 ────────────────
  if (isDesktop) {
    return (
      <View style={styles.root}>
        <TopNav active={tab} onChange={setTab} />
        <View style={styles.body}>
          {tab === 'feed' && (
            // 적용 예시 2: 좌측 60% 피드 / 우측 40% 채팅(반응창)
            <View style={styles.desktopRow}>
              <View style={styles.feedCol}>{Feed}</View>
              <View style={styles.chatCol}>{Chat}</View>
            </View>
          )}
          {tab === 'chat' && Chat}
          {tab === 'profile' && Profile}
        </View>
        {shareSheet}
      </View>
    );
  }

  // ── 모바일: 상단 로고바 + 콘텐츠 + 하단 탭 ───────────
  return (
    <View style={styles.root}>
      <TopNav active={tab} onChange={setTab} showTabs={false} />
      <View style={styles.body}>
        {tab === 'feed' && Feed}
        {tab === 'chat' && Chat}
        {tab === 'profile' && Profile}
      </View>

      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        {(['feed', 'chat', 'profile'] as AppTab[]).map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => setTab(t)}>
            <Text style={[styles.tabTxt, tab === t && styles.tabActive]}>
              {t === 'feed' ? '피드' : t === 'chat' ? '채팅' : '프로필'}
            </Text>
          </Pressable>
        ))}
      </View>

      {shareSheet}
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
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderTxt: { color: colors.textMuted },
});
