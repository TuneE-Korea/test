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
import { ChatRoom, DailyLog } from '../types';

export function HomeScreen() {
  const { isDesktop } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<DailyLog[]>(mockLogs);
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

  const handleShareToRoom = (room: ChatRoom, log: DailyLog) => {
    // 실제로는 채팅 API 로 로그 카드 메시지를 전송한다.
    setShareTarget(null);
    if (typeof window !== 'undefined') {
      window.alert(`'${log.caption ?? '로그'}' 을(를) [${room.name}] 방으로 공유했어요.`);
    }
  };

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

  const shareSheet = shareTarget && (
    <ShareSheet
      log={shareTarget}
      rooms={mockChatRooms}
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
              <View style={styles.chatCol}>
                <ChatPanel rooms={mockChatRooms} />
              </View>
            </View>
          )}
          {tab === 'chat' && <ChatPanel rooms={mockChatRooms} />}
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
        {tab === 'chat' && <ChatPanel rooms={mockChatRooms} />}
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
