import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { DailyLog, LogCard } from '@/entities/daily-log';
import { colors } from '@/shared/config';

const PAGE = 6;

/**
 * 세로 스크롤 타임라인 피드.
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
      contentContainerStyle={{ padding: 12, gap: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {visible.map((log) => (
        <LogCard key={log.id} log={log} onPress={() => onSelectLog(log)} />
      ))}

      {loading && (
        <View className="items-center gap-1.5 py-3">
          <ActivityIndicator color={colors.primary} />
          <Text className="text-xs text-textMuted">이전 기록 불러오는 중…</Text>
        </View>
      )}
      {!hasMore && visible.length > 0 && (
        <Text className="py-3 text-center text-xs text-textMuted">· 처음까지 모두 봤어요 ·</Text>
      )}
      {sorted.length === 0 && (
        <Text className="mt-8 text-center text-textMuted">아직 기록이 없어요.</Text>
      )}
    </ScrollView>
  );
}
