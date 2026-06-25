import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  onBell: () => void;
  unreadCount?: number;
  /** false 면 탭을 숨기고 로고만 표시 (모바일: 탭은 하단 바가 담당) */
  showTabs?: boolean;
}

/** 상단 네비게이션 바: 좌측 로고 + 우측 탭 + 업로드/알림 버튼. */
export function TopNav({
  active,
  onChange,
  onUpload,
  onBell,
  unreadCount = 0,
  showTabs = true,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center justify-between border-b border-border bg-surface px-4"
      style={{ paddingTop: insets.top, height: 56 + insets.top }}
    >
      <View className="flex-row items-center gap-2">
        <View className="h-[30px] w-[30px] items-center justify-center rounded-sm bg-primary">
          <Text className="text-base font-extrabold text-white">D</Text>
        </View>
        <Text className="text-base font-bold text-text">DayLog</Text>
      </View>

      <View className="flex-row items-center gap-2">
        {showTabs && (
          <View className="flex-row gap-1">
            {TABS.map((t) => {
              const on = active === t.key;
              return (
                <Pressable
                  key={t.key}
                  className={`rounded-pill px-4 py-2 ${on ? 'bg-primarySoft' : ''}`}
                  onPress={() => onChange(t.key)}
                >
                  <Text className={`text-sm font-semibold ${on ? 'text-primary' : 'text-textMuted'}`}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        <Pressable className="rounded-pill bg-primary px-4 py-2" onPress={onUpload}>
          <Text className="text-[13px] font-bold text-white">＋ 기록</Text>
        </Pressable>
        <Pressable className="p-1" onPress={onBell} hitSlop={6}>
          <Text className="text-lg">🔔</Text>
          {unreadCount > 0 && (
            <View className="absolute -right-1 -top-0.5 h-4 min-w-[16px] items-center justify-center rounded-pill bg-danger px-[3px]">
              <Text className="text-[10px] font-extrabold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
