import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatKoreanTimestamp } from '../dateUtils';
import { colors, radius, spacing } from '../theme';
import { DailyLog, Visibility } from '../types';
import { MediaView } from './MediaView';

const VIS_LABEL: Record<Visibility, string> = {
  public: '🌐 전체 공개',
  friends: '👥 친구 공개',
  private: '🔒 나만 보기',
};

const PAGE = 6;

/**
 * 세로 스크롤 타임라인 피드 (기획서: 달력형 + 세로 스크롤 타임라인).
 * 무한 스크롤(커서 페이징) 흉내: 끝에 닿으면 과거 기록을 점진적으로 더 불러온다.
 */
export function TimelineList({
  logs,
  onSelectLog,
}: {
  logs: DailyLog[];
  onSelectLog: (log: DailyLog) => void;
}) {
  const sorted = useMemo(
    () => [...logs].sort((a, b) => +new Date(b.takenAt) - +new Date(a.takenAt)),
    [logs],
  );

  const [count, setCount] = useState(PAGE);
  const [loading, setLoading] = useState(false);

  // 끝까지 스크롤하면 다음 페이지 로드 (네트워크 지연 흉내)
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const nearEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
    if (nearEnd && !loading && count < sorted.length) {
      setLoading(true);
      setTimeout(() => {
        setCount((c) => Math.min(c + PAGE, sorted.length));
        setLoading(false);
      }, 700);
    }
  };

  const visible = sorted.slice(0, count);
  const hasMore = count < sorted.length;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {visible.map((log) => (
        <Pressable key={log.id} style={styles.card} onPress={() => onSelectLog(log)}>
          <View style={styles.media}>
            <MediaView log={log} mode="thumbnail" />
          </View>
          <View style={styles.meta}>
            <Text style={styles.time}>{formatKoreanTimestamp(log.takenAt)}</Text>
            {!!log.caption && <Text style={styles.caption}>{log.caption}</Text>}
            <View style={styles.footer}>
              <Text style={styles.vis}>{VIS_LABEL[log.visibility]}</Text>
              <Text style={styles.comments}>💬 {log.comments.length}</Text>
            </View>
          </View>
        </Pressable>
      ))}

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loaderTxt}>이전 기록 불러오는 중…</Text>
        </View>
      )}
      {!hasMore && visible.length > 0 && <Text style={styles.end}>· 처음까지 모두 봤어요 ·</Text>}
      {sorted.length === 0 && <Text style={styles.empty}>아직 기록이 없어요.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(3), gap: spacing(4), paddingBottom: spacing(8) },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  media: { width: '100%', aspectRatio: 1, backgroundColor: '#000' },
  meta: { padding: spacing(4) },
  time: { color: colors.textMuted, fontSize: 13 },
  caption: { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing(3),
  },
  vis: { color: colors.textMuted, fontSize: 12 },
  comments: { color: colors.textMuted, fontSize: 12 },
  loader: { alignItems: 'center', gap: 6, paddingVertical: spacing(3) },
  loaderTxt: { color: colors.textMuted, fontSize: 12 },
  end: { color: colors.textMuted, fontSize: 12, textAlign: 'center', paddingVertical: spacing(3) },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing(8) },
});
