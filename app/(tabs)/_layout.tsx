import { Redirect, Slot, usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotificationStore } from '@/entities/notification';
import { useSessionStore } from '@/entities/session';
import { UploadSheet } from '@/features/upload-media';
import { useBreakpoint } from '@/shared/lib';
import { ChatPanel } from '@/widgets/chat-panel';
import { NotificationsPanel } from '@/widgets/notifications-panel';
import { TopNav, type AppTab } from '@/widgets/top-nav';

const TAB_LABELS: Record<AppTab, string> = {
  feed: '피드',
  chat: '채팅',
  friends: '친구',
  profile: '프로필',
};

// 탭 → URL 경로 (그룹 (tabs) 는 URL 에 안 보임)
const PATH: Record<AppTab, string> = {
  feed: '/',
  chat: '/chat',
  friends: '/friends',
  profile: '/profile',
};

export default function TabsLayout() {
  const currentUser = useSessionStore((s) => s.currentUser);
  const { isDesktop } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const notifications = useNotificationStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const [showUpload, setShowUpload] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  // 모든 훅 호출 뒤에 가드 (조건부 훅 방지)
  if (!currentUser) return <Redirect href="/auth" />;

  const active: AppTab = pathname.startsWith('/chat')
    ? 'chat'
    : pathname.startsWith('/friends')
      ? 'friends'
      : pathname.startsWith('/profile')
        ? 'profile'
        : 'feed';

  const go = (t: AppTab) => router.navigate(PATH[t]);

  const overlays = (
    <>
      {showUpload && <UploadSheet onClose={() => setShowUpload(false)} />}
      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
    </>
  );

  // ── 데스크탑: Split View (라우트 콘텐츠 | 채팅 사이드바) ──
  if (isDesktop) {
    return (
      <View className="flex-1 bg-bg">
        <TopNav
          active={active}
          onChange={go}
          tabs={['feed', 'friends', 'profile']}
          onUpload={() => setShowUpload(true)}
          onBell={() => setShowNotifs(true)}
          unreadCount={unread}
        />
        <View className="flex-1 flex-row">
          <View className="w-[60%] border-r border-border">
            <Slot />
          </View>
          <View className="w-[40%]">
            <ChatPanel />
          </View>
        </View>
        {overlays}
      </View>
    );
  }

  // ── 모바일: Stack + 하단 탭 ──
  return (
    <View className="flex-1 bg-bg">
      <TopNav
        active={active}
        onChange={go}
        showTabs={false}
        onUpload={() => setShowUpload(true)}
        onBell={() => setShowNotifs(true)}
        unreadCount={unread}
      />
      <View className="flex-1">
        <Slot />
      </View>

      <View
        className="flex-row border-t border-border bg-surface"
        style={{ paddingBottom: insets.bottom }}
      >
        {(['feed', 'chat', 'friends', 'profile'] as AppTab[]).map((t) => (
          <Pressable key={t} className="flex-1 items-center py-3" onPress={() => go(t)}>
            <Text className={`font-semibold ${active === t ? 'text-primary' : 'text-textMuted'}`}>
              {TAB_LABELS[t]}
            </Text>
          </Pressable>
        ))}
      </View>

      {overlays}
    </View>
  );
}
