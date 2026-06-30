import { Redirect } from 'expo-router';

import { useBreakpoint } from '@/shared/lib';
import { ChatPanel } from '@/widgets/chat-panel';

// /chat — 모바일 전용 전체 채팅. 데스크탑은 채팅이 사이드바라 피드로 보낸다.
export default function ChatRoute() {
  const { isDesktop } = useBreakpoint();
  if (isDesktop) return <Redirect href="/" />;
  return <ChatPanel />;
}
