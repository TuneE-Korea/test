import { mockLogs } from '@/data/mockLogs';

import type { DailyLog } from '../model/types';

/**
 * 백엔드 `GET /logs` 가 들어올 자리(서버 통신 경계).
 * 지금은 목업을 약간의 지연 후 반환해 "네트워크 요청"을 흉내 낸다.
 *
 * 반환: Promise<DailyLog[]>  (tanstack-query 의 queryFn 은 Promise 를 반환해야 한다)
 */
export async function fetchLogs(): Promise<DailyLog[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockLogs;
}
