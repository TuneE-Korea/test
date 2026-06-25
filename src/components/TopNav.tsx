import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '../theme';

export type AppTab = 'feed' | 'chat' | 'friends' | 'profile';

const TABS: { key: AppTab; label: string }[] = [
  { key: 'feed', label: '피드' },
  { key: 'chat', label: '채팅' },
  { key: 'friends', label: '친구' },
  { key: 'profile', label: '프로필' },
];

interface Props {
  active: AppTab;
  onChange: (tab: AppTab) => void;
  onUpload: () => void;
  /** false 면 탭을 숨기고 로고만 표시 (모바일: 탭은 하단 바가 담당) */
  showTabs?: boolean;
}

/** 상단 네비게이션 바: 좌측 로고 + 우측 탭 + 업로드 버튼. */
export function TopNav({ active, onChange, onUpload, showTabs = true }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top, height: 56 + insets.top }]}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoTxt}>D</Text>
        </View>
        <Text style={styles.brandTxt}>DayLog</Text>
      </View>

      <View style={styles.right}>
        {showTabs && (
          <View style={styles.tabs}>
            {TABS.map((t) => {
              const isActive = active === t.key;
              return (
                <Pressable
                  key={t.key}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => onChange(t.key)}
                >
                  <Text style={[styles.tabTxt, isActive && styles.tabTxtActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        <Pressable style={styles.upload} onPress={onUpload}>
          <Text style={styles.uploadTxt}>＋ 기록</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(4),
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  brandTxt: { color: colors.text, fontWeight: '700', fontSize: 16 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  upload: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
  },
  uploadTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tabs: { flexDirection: 'row', gap: 4 },
  tab: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
  },
  tabActive: { backgroundColor: colors.primarySoft },
  tabTxt: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  tabTxtActive: { color: colors.primary },
});
