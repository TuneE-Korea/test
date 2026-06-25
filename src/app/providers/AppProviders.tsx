import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// FSD app 레이어: 앱 전역 Provider 조립.
// - QueryClientProvider: tanstack-query 서버 데이터 캐시
// - SafeAreaProvider: 노치/홈인디케이터 안전 영역
// (상태는 zustand 스토어가 들고 있어 별도 Provider 가 필요 없다)
const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </QueryClientProvider>
  );
}
