import './global.css';

import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AppProviders } from '@/app/providers/AppProviders';
import { useSessionStore } from '@/entities/session';
import { AuthPage } from '@/pages/auth';
import { HomePage } from '@/pages/home';
import { colors } from '@/shared/config';

function Root() {
  const booting = useSessionStore((s) => s.booting);
  const currentUser = useSessionStore((s) => s.currentUser);
  const restore = useSessionStore((s) => s.restore);

  // 앱 시작 시 저장된 세션 복원
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
    <View className="flex-1 bg-bg">
      <StatusBar style="light" />
      {currentUser ? <HomePage /> : <AuthPage />}
    </View>
  );
}

export default function App() {
  return (
    <AppProviders>
      <Root />
    </AppProviders>
  );
}
