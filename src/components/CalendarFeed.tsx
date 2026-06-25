import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { buildMonthMatrix, isToday, sameYMD, WEEKDAYS_KO } from '../dateUtils';
import { colors, radius, spacing } from '../theme';
import { DailyLog } from '../types';
import { DayCell } from './DayCell';

interface Props {
  logs: DailyLog[];
  onSelectLog: (log: DailyLog) => void;
}

/**
 * 커스텀 캘린더 피드.
 * - 외부 캘린더 라이브러리 대신 7열 그리드를 직접 구성해 셀을 완전히 제어한다.
 * - 각 날짜 셀 배경에 미디어 썸네일을 깐다.
 */
export function CalendarFeed({ logs, onSelectLog }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month0, setMonth0] = useState(today.getMonth()); // 0-11

  const cells = useMemo(() => buildMonthMatrix(year, month0), [year, month0]);

  // 날짜 -> 로그 매핑 (하루 한 개 가정. 여러 개면 가장 최근 것을 대표로)
  const logByDay = useMemo(() => {
    const map = new Map<number, DailyLog>();
    for (const log of logs) {
      const d = new Date(log.takenAt);
      if (d.getFullYear() === year && d.getMonth() === month0) {
        const existing = map.get(d.getDate());
        if (!existing || new Date(log.takenAt) > new Date(existing.takenAt)) {
          map.set(d.getDate(), log);
        }
      }
    }
    return map;
  }, [logs, year, month0]);

  const goPrev = () => {
    if (month0 === 0) {
      setYear((y) => y - 1);
      setMonth0(11);
    } else {
      setMonth0((m) => m - 1);
    }
  };
  const goNext = () => {
    if (month0 === 11) {
      setYear((y) => y + 1);
      setMonth0(0);
    } else {
      setMonth0((m) => m + 1);
    }
  };

  // 7개씩 끊어 주(week) 단위 행으로
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={goPrev} style={styles.navBtn} hitSlop={8}>
          <Text style={styles.navTxt}>‹</Text>
        </Pressable>
        <Text style={styles.title}>
          {year}년 {month0 + 1}월
        </Text>
        <Pressable onPress={goNext} style={styles.navBtn} hitSlop={8}>
          <Text style={styles.navTxt}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS_KO.map((w, i) => (
          <Text
            key={w}
            style={[
              styles.weekday,
              i === 0 && { color: colors.danger },
              i === 6 && { color: colors.primary },
            ]}
          >
            {w}
          </Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.gridRow}>
            {row.map((day, ci) => (
              <DayCell
                key={`${ri}-${ci}`}
                day={day}
                log={day ? logByDay.get(day) : undefined}
                isToday={day ? isToday(year, month0, day) : false}
                onPress={onSelectLog}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// 외부에서 day 비교가 필요할 때를 대비해 export (현재 내부 사용)
export { sameYMD };

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(3),
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  navTxt: { color: colors.text, fontSize: 22, lineHeight: 24 },
  weekRow: { flexDirection: 'row', paddingHorizontal: spacing(1) },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginHorizontal: 3,
    marginBottom: spacing(1),
  },
  grid: { paddingHorizontal: spacing(1), paddingBottom: spacing(6) },
  gridRow: { flexDirection: 'row' },
});
