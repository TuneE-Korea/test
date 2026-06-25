import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatBytes } from '../dateUtils';
import { useApp } from '../store/AppContext';
import { colors, radius, spacing } from '../theme';
import { DailyLog } from '../types';

export function ProfileScreen({ onOpenLog }: { onOpenLog: (log: DailyLog) => void }) {
  const { currentUser, logs, friendList, quotaUsed, quotaLimit, logout } = useApp();
  const myLogs = logs.filter((l) => l.ownerId === 'me');
  const ratio = Math.min(1, quotaUsed / quotaLimit);
  const nearFull = ratio > 0.8;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* 프로필 헤더 */}
      <View style={styles.profileRow}>
        <Image source={{ uri: currentUser?.avatarUri }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{currentUser?.name}</Text>
          <Text style={styles.sub}>
            {currentUser?.studentId ? `${currentUser.studentId} · ` : ''}
            {currentUser?.email}
          </Text>
          {!!currentUser?.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}
        </View>
      </View>

      {/* 통계 */}
      <View style={styles.stats}>
        <Stat label="기록" value={myLogs.length} />
        <Stat label="친구" value={friendList.length} />
        <Stat
          label="공개"
          value={myLogs.filter((l) => l.visibility === 'public').length}
        />
      </View>

      {/* 스토리지 쿼터 */}
      <View style={styles.quotaCard}>
        <View style={styles.quotaHead}>
          <Text style={styles.quotaTitle}>스토리지 사용량</Text>
          <Text style={[styles.quotaVal, nearFull && { color: colors.danger }]}>
            {formatBytes(quotaUsed)} / {formatBytes(quotaLimit)}
          </Text>
        </View>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: `${ratio * 100}%` },
              nearFull && { backgroundColor: colors.danger },
            ]}
          />
        </View>
        {nearFull && (
          <Text style={styles.quotaWarn}>용량이 거의 찼어요. 오래된 기록을 정리해보세요.</Text>
        )}
      </View>

      {/* 내 기록 그리드 */}
      <Text style={styles.sectionTitle}>내 기록</Text>
      <View style={styles.grid}>
        {myLogs.map((l) => {
          const poster = l.mediaType === 'image' ? l.uri : l.thumbnailUri;
          return (
            <Pressable key={l.id} style={styles.cell} onPress={() => onOpenLog(l)}>
              {poster ? (
                <Image source={{ uri: poster }} style={styles.cellImg} resizeMode="cover" />
              ) : (
                <View style={[styles.cellImg, styles.cellPlaceholder]}>
                  <Text style={{ fontSize: 20 }}>🎬</Text>
                </View>
              )}
              {l.mediaType === 'video' && <Text style={styles.playBadge}>▶</Text>}
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.logout} onPress={logout}>
        <Text style={styles.logoutTxt}>로그아웃</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing(4), paddingBottom: spacing(10) },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surfaceAlt },
  name: { color: colors.text, fontSize: 20, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  bio: { color: colors.text, fontSize: 13, marginTop: 6 },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing(4),
    marginTop: spacing(5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { color: colors.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  quotaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(4),
    marginTop: spacing(4),
    borderWidth: 1,
    borderColor: colors.border,
  },
  quotaHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing(2) },
  quotaTitle: { color: colors.text, fontWeight: '700' },
  quotaVal: { color: colors.textMuted, fontSize: 13 },
  barBg: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  quotaWarn: { color: colors.danger, fontSize: 12, marginTop: spacing(2) },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing(6),
    marginBottom: spacing(3),
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: {
    width: '32.5%',
    aspectRatio: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  cellImg: { width: '100%', height: '100%' },
  cellPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  playBadge: { position: 'absolute', top: 4, right: 6, color: '#fff', fontSize: 12 },
  logout: {
    marginTop: spacing(8),
    paddingVertical: spacing(4),
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutTxt: { color: colors.danger, fontWeight: '700' },
});
