// 참고: global.css 는 AppProviders(정적 import 모듈)에서 불러온다.
// expo-router 라우트 파일은 require.context 로 로드돼 NativeWind 의 CSS 추출 그래프에
// 잡히지 않으므로, 여기(_layout)에서 import 하면 웹 CSS 가 생성되지 않는다.
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AppProviders } from '@/app/providers/AppProviders';
import { useSessionStore } from '@/entities/session';
import { colors } from '@/shared/config';

function RootNav() {
  const booting = useSessionStore((s) => s.booting);
  const restore = useSessionStore((s) => s.restore);

  // 앱 시작 시 저장된 세션 복원 (1회)
  useEffect(() => {
    restore();
  }, [restore]);

  if (booting) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNav />
    </AppProviders>
  );
}
