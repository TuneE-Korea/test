import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme';
import { DailyLog } from '../types';
import { MediaView } from './MediaView';

interface Props {
  day: number | null;
  log?: DailyLog;
  isToday: boolean;
  onPress: (log: DailyLog) => void;
}

/** 캘린더의 한 칸. 로그가 있으면 미디어가 배경으로 깔린다. */
export function DayCell({ day, log, isToday, onPress }: Props) {
  if (day === null) {
    return <View style={[styles.cell, styles.empty]} />;
  }

  const hasMedia = !!log;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cell,
        isToday && styles.today,
        pressed && hasMedia && styles.pressed,
      ]}
      disabled={!hasMedia}
      onPress={() => log && onPress(log)}
    >
      {hasMedia && <MediaView log={log} mode="thumbnail" />}
      {hasMedia && <View style={styles.scrim} pointerEvents="none" />}
      <Text style={[styles.dayNum, hasMedia && styles.dayNumOnMedia]}>{day}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    margin: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  empty: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  today: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pressed: { opacity: 0.8 },
  // 미디어 위 날짜 가독성을 위한 어두운 그라데이션 대용 스크림
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  dayNum: {
    position: 'absolute',
    top: 4,
    left: 6,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  dayNumOnMedia: { color: '#fff' },
});
