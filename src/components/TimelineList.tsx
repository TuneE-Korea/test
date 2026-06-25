import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatKoreanTimestamp } from '../dateUtils';
import { colors, radius, spacing } from '../theme';
import { DailyLog, Visibility } from '../types';
import { MediaView } from './MediaView';

const VIS_LABEL: Record<Visibility, string> = {
  public: '🌐 전체 공개',
  friends: '👥 친구 공개',
  private: '🔒 나만 보기',
};

/** 세로 스크롤 타임라인 피드 (기획서: 달력형 + 세로 스크롤 타임라인). */
export function TimelineList({
  logs,
  onSelectLog,
}: {
  logs: DailyLog[];
  onSelectLog: (log: DailyLog) => void;
}) {
  // 최신순 정렬
  const sorted = useMemo(
    () => [...logs].sort((a, b) => +new Date(b.takenAt) - +new Date(a.takenAt)),
    [logs],
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {sorted.map((log) => (
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
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing(8) },
});
