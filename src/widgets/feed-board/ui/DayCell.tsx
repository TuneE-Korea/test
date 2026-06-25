import { Pressable, Text, View } from 'react-native';

import type { DailyLog } from '@/entities/daily-log';
import { MediaView } from '@/shared/ui';

interface Props {
  day: number | null;
  log?: DailyLog;
  isToday: boolean;
  onPress: (log: DailyLog) => void;
}

/** 캘린더의 한 칸. 로그가 있으면 미디어가 배경으로 깔린다. */
export function DayCell({ day, log, isToday, onPress }: Props) {
  if (day === null) {
    return <View className="m-[3px] aspect-square flex-1" />;
  }

  const hasMedia = !!log;

  return (
    <Pressable
      className={`m-[3px] aspect-square flex-1 overflow-hidden rounded-sm border bg-surfaceAlt active:opacity-80 ${
        isToday ? 'border-2 border-primary' : 'border-border'
      }`}
      disabled={!hasMedia}
      onPress={() => log && onPress(log)}
    >
      {hasMedia && (
        <MediaView
          mediaType={log.mediaType}
          uri={log.uri}
          thumbnailUri={log.thumbnailUri}
          mode="thumbnail"
        />
      )}
      {hasMedia && (
        <View pointerEvents="none" className="absolute left-0 right-0 top-0 h-7 bg-black/35" />
      )}
      <Text
        className={`absolute left-1.5 top-1 text-xs font-semibold ${
          hasMedia ? 'text-white' : 'text-textMuted'
        }`}
      >
        {day}
      </Text>
    </Pressable>
  );
}
