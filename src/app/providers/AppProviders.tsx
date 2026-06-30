// NativeWind 의 Tailwind 스타일 주입(웹 CSS 생성 포함).
// expo-router 라우트 파일이 아닌 "정적 import 되는 일반 모듈"에서 불러와야
// 메트로의 CSS 추출 그래프에 잡힌다.
import '../../../global.css';

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
