import { useQuery } from '@tanstack/react-query';

import { fetchLogs } from './fetchLogs';

/**
 * 서버에서 로그 목록을 읽어오는 tanstack-query 훅.
 *
 * useQuery({ queryKey, queryFn }) 인자:
 *   - queryKey: 이 데이터의 "캐시 주소"(배열). 같은 key 면 캐시를 공유하고,
 *               key 가 바뀌면 자동으로 다시 가져온다. 예: ['logs', month]
 *   - queryFn:  실제 데이터를 가져오는 async 함수 (Promise 반환)
 *
 * 반환값(주요 필드):
 *   - data:       성공 시 DailyLog[] (로딩 중엔 undefined)
 *   - isLoading:  최초 로딩 여부
 *   - isError / error: 실패 여부와 에러
 *   - refetch():  수동으로 다시 가져오기
 *
 * 지금은 로컬 변경(추가/반응)이 잦아 살아있는 상태를 zustand(useDailyLogStore)가 들고 있고,
 * 이 훅은 "실제 백엔드가 붙는 지점"으로 마련해 둔 것이다. 백엔드 연동 레슨에서
 * 이 query 를 단일 소스로 승격하고, 변경은 useMutation 으로 캐시를 갱신하게 된다.
 */
export function useLogsQuery() {
  return useQuery({
    queryKey: ['logs'],
    queryFn: fetchLogs,
  });
}
