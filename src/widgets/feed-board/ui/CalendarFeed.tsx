import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { DailyLog } from '@/entities/daily-log';
import { buildMonthMatrix, isToday, WEEKDAYS_KO } from '@/shared/lib';

import { DayCell } from './DayCell';

interface Props {
  logs: DailyLog[];
  onSelectLog: (log: DailyLog) => void;
}

/** 7열 그리드를 직접 구성한 커스텀 캘린더 피드. */
export function CalendarFeed({ logs, onSelectLog }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month0, setMonth0] = useState(today.getMonth());

  const cells = useMemo(() => buildMonthMatrix(year, month0), [year, month0]);

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
    } else setMonth0((m) => m - 1);
  };
  const goNext = () => {
    if (month0 === 11) {
      setYear((y) => y + 1);
      setMonth0(0);
    } else setMonth0((m) => m + 1);
  };

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-2 py-3">
        <Pressable
          onPress={goPrev}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-sm bg-surfaceAlt"
        >
          <Text className="text-[22px] leading-6 text-text">‹</Text>
        </Pressable>
        <Text className="text-xl font-bold text-text">
          {year}년 {month0 + 1}월
        </Text>
        <Pressable
          onPress={goNext}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-sm bg-surfaceAlt"
        >
          <Text className="text-[22px] leading-6 text-text">›</Text>
        </Pressable>
      </View>

      <View className="flex-row px-1">
        {WEEKDAYS_KO.map((w, i) => (
          <Text
            key={w}
            className={`mx-[3px] mb-1 flex-1 text-center text-xs ${
              i === 0 ? 'text-danger' : i === 6 ? 'text-primary' : 'text-textMuted'
            }`}
          >
            {w}
          </Text>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row, ri) => (
          <View key={ri} className="flex-row">
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
