import { useRouter } from 'expo-router';

import { ProfilePage } from '@/pages/profile';

export default function ProfileRoute() {
  const router = useRouter();
  // 기록 클릭 → 피드 라우트로 이동하며 ?log=ID 로 상세 모달 열기
  return <ProfilePage onOpenLog={(l) => router.navigate({ pathname: '/', params: { log: l.id } })} />;
}
