import { Redirect } from 'expo-router';

import { useSessionStore } from '@/entities/session';
import { AuthPage } from '@/pages/auth';

// /auth — 비로그인 진입점. 로그인되면 피드로 보낸다.
export default function AuthRoute() {
  const currentUser = useSessionStore((s) => s.currentUser);
  if (currentUser) return <Redirect href="/" />;
  return <AuthPage />;
}
