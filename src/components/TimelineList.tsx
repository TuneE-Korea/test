import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DailyLog, LogCard } from '@/entities/daily-log';

import { colors, spacing } from '../theme';

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
        <LogCard key={log.id} log={log} onPress={() => onSelectLog(log)} />
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
  loader: { alignItems: 'center', gap: 6, paddingVertical: spacing(3) },
  loaderTxt: { color: colors.textMuted, fontSize: 12 },
  end: { color: colors.textMuted, fontSize: 12, textAlign: 'center', paddingVertical: spacing(3) },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing(8) },
});
