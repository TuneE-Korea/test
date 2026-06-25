import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { DailyLog } from '@/entities/daily-log';

import { CalendarFeed } from './CalendarFeed';
import { TimelineList } from './TimelineList';

type Mode = 'calendar' | 'timeline';

/** 달력 뷰 ↔ 세로 스크롤 타임라인 뷰 토글 래퍼. */
export function FeedBoard({
  logs,
  onSelectLog,
}: {
  logs: DailyLog[];
  onSelectLog: (log: DailyLog) => void;
}) {
  const [mode, setMode] = useState<Mode>('calendar');

  return (
    <View className="flex-1">
      <View className="m-3 flex-row self-center rounded-pill bg-surfaceAlt p-1">
        {(['calendar', 'timeline'] as Mode[]).map((m) => {
          const on = mode === m;
          return (
            <Pressable
              key={m}
              className={`rounded-pill px-5 py-2 ${on ? 'bg-primary' : ''}`}
              onPress={() => setMode(m)}
            >
              <Text className={`text-[13px] font-bold ${on ? 'text-white' : 'text-textMuted'}`}>
                {m === 'calendar' ? '📅 달력' : '📜 타임라인'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mode === 'calendar' ? (
        <CalendarFeed logs={logs} onSelectLog={onSelectLog} />
      ) : (
        <TimelineList logs={logs} onSelectLog={onSelectLog} />
      )}
    </View>
  );
}
