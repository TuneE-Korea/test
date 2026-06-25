import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { DailyLog } from '../types';
import { CalendarFeed } from './CalendarFeed';
import { TimelineList } from './TimelineList';

type Mode = 'calendar' | 'timeline';

/** 달력 뷰 ↔ 세로 스크롤 타임라인 뷰 토글 래퍼. */
export function FeedView({
  logs,
  onSelectLog,
}: {
  logs: DailyLog[];
  onSelectLog: (log: DailyLog) => void;
}) {
  const [mode, setMode] = useState<Mode>('calendar');

  return (
    <View style={styles.root}>
      <View style={styles.toggle}>
        {(['calendar', 'timeline'] as Mode[]).map((m) => (
          <Pressable
            key={m}
            style={[styles.seg, mode === m && styles.segActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.segTxt, mode === m && styles.segTxtActive]}>
              {m === 'calendar' ? '📅 달력' : '📜 타임라인'}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'calendar' ? (
        <CalendarFeed logs={logs} onSelectLog={onSelectLog} />
      ) : (
        <TimelineList logs={logs} onSelectLog={onSelectLog} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    margin: spacing(3),
  },
  seg: { paddingHorizontal: spacing(5), paddingVertical: spacing(2), borderRadius: radius.pill },
  segActive: { backgroundColor: colors.primary },
  segTxt: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  segTxtActive: { color: '#fff' },
});
