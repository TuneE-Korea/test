# HANDOFF — 임시(목업) 세팅 & 실제 교체 가이드

백엔드/디자이너 협업 전, **임시로 세팅한 부분**과 **실제 연동 시 무엇을 바꿔야 하는지** 정리한 인수인계 문서입니다.

> 환경/툴 세팅은 [`SETUP.md`](./SETUP.md) 참고. 이 문서는 **"목업 → 실제"** 교체 지점만 다룹니다.

## 한눈에 보기

| # | 영역 | 임시 방식 | 위치 | 교체 대상 |
|---|---|---|---|---|
| 1 | 디자인 토큰 | 임의 다크 팔레트 하드코딩 | `tailwind.config.js`, `src/shared/config/theme.ts` | 디자이너 정식 토큰 |
| 2 | 데이터 | 목업 fixtures | `src/data/mockLogs.ts` | 실제 API 응답 |
| 3 | 미디어 저장 | 외부 샘플 URL | `src/data/mockLogs.ts` | MinIO presigned URL |
| 4 | 인증 | 비번 미검증·가짜 JWT | `src/entities/session` | 로그인 API + JWT |
| 5 | 토큰 저장 | AsyncStorage 평문 | `src/entities/session` | `expo-secure-store` |
| 6 | 로그 조회 | `setTimeout` 목업 | `src/entities/daily-log/api` | `GET /logs` (Query) |
| 7 | 변경(쓰기) | zustand 직접 변경 | `src/entities/*/model/store.ts` | API + `useMutation` |
| 8 | 실시간 채팅 | 자동응답·해시 온라인 | `src/features/send-message`, `src/widgets/chat-panel` | WebSocket |
| 9 | 무한 스크롤 | `setTimeout` 페이징 | `src/widgets/feed-board/ui/TimelineList.tsx` | 커서 기반 API |
| 10 | 알림 | 인앱 목업 리스트 | `src/entities/notification` | FCM / Web Push |
| 11 | 스토리지 쿼터 | `200MB` 하드코딩 | `src/data/mockLogs.ts`, `upload-media` | 서버 응답값 |
| 12 | 공유 링크 | `daylog://log/id` | `src/features/share-post` | 공개 URL + OG |
| 13 | API 설정 | 없음 | — | `.env` + API 클라이언트 |

---

## 1. 디자인 토큰 (디자이너 협업 전)

- **임시:** 색/반경을 제가 임의로 박은 다크 테마.
  - `tailwind.config.js` → `theme.extend.colors` / `borderRadius`
  - `src/shared/config/theme.ts` → 동일 값의 JS 버전 (className 으로 못 닿는 곳용)
- **교체:** 디자이너의 정식 팔레트로 위 두 곳을 동시 수정.
  라이트/다크 모드, 폰트 스케일, spacing 스케일이 추가될 수 있음.
- **주의:** 색 값은 **두 파일에 중복** 정의돼 있으니 함께 갱신. (단일화하려면 `theme.ts` 를 `tailwind.config.js` 가 import 하도록 묶을 수 있음)

## 2~3. 데이터 & 미디어 — `src/data/mockLogs.ts`

- **임시:** `mockLogs / mockUsers / mockChatRooms / mockNotifications / me / initialFriendStatus / QUOTA_LIMIT_BYTES`.
  이미지=`picsum.photos`, 아바타=`pravatar.cc`, 동영상=Google 샘플 mp4.
- **교체:**
  - 각 entity 스토어가 `mockLogs` 대신 **API 응답**으로 초기화되도록.
  - 업로드는 **MinIO presigned URL** 흐름으로 (클라가 presigned URL 요청 → 직접 PUT 업로드 → 서버에 메타 등록).
- **연동 지점:** 스토어 초기값(`create((set) => ({ logs: mockLogs ... }))`) → 빈 배열로 두고 Query 로 채움(아래 6번).

## 4~5. 인증 & 토큰 저장 — `src/entities/session/model/store.ts`

- **임시:**
  - `login()` 이 **비밀번호 미검증**, 입력 식별자로 `me` 프로필 로드.
  - 토큰은 `mock.jwt.${id}.${Date.now()}` 문자열.
  - **AsyncStorage 평문** 저장.
- **교체:**
  - `login/signup` → 실제 인증 API 호출, 서버 발급 **JWT** 수신.
  - 토큰은 **`expo-secure-store`**(iOS Keychain / Android Keystore)에 저장. 비민감 정보만 AsyncStorage.
  - 만료/갱신(refresh token) 흐름 추가.

## 6~7. 서버 데이터(읽기/쓰기) — Query/Mutation 전환

- **임시:**
  - `src/entities/daily-log/api/fetchLogs.ts` → `setTimeout(300)` 후 mock 반환.
  - `useLogsQuery` 는 만들어 뒀지만 **아직 화면에서 미사용**(seam).
  - 실제 변경은 zustand 스토어 액션(`addLog`/`toggleReaction` 등)이 메모리에서 처리.
- **교체:**
  - **읽기:** 화면이 `useLogsQuery()` 를 단일 소스로 사용.
    ```tsx
    const { data: logs = [], isLoading } = useLogsQuery();
    ```
  - **쓰기:** `useMutation` + 캐시 무효화/낙관적 업데이트.
    ```tsx
    const qc = useQueryClient();
    const { mutate: addLog } = useMutation({
      mutationFn: (input) => api.post('/logs', input),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['logs'] }),
    });
    ```
  - **역할 분담 유지:** 서버 데이터=TanStack Query, 클라 상태(탭·모달·세션·활성방)=zustand.

## 8. 실시간 채팅

- **임시:**
  - `src/features/send-message/model/useSendMessage.ts` → 전송 후 `setTimeout(1500)` 자동 응답.
  - `src/widgets/chat-panel/ui/ChatPanel.tsx` → `isOnline()` 이 방 id 해시로 온라인 흉내.
- **교체:** WebSocket(또는 SSE) 연결.
  - 메시지 송수신, "입력 중(typing)" 이벤트, presence(온라인 상태)를 서버 이벤트로.
  - `useSendMessage` 내부를 소켓 emit 으로 교체, 수신은 별도 구독 훅.

## 9. 무한 스크롤 — `src/widgets/feed-board/ui/TimelineList.tsx`

- **임시:** 전체 목록을 `PAGE(6)` 씩 잘라 `setTimeout(700)` 후 노출.
- **교체:** **커서 기반 페이징** API + TanStack Query 의 `useInfiniteQuery`.
  - `getNextPageParam` 으로 다음 커서 전달, `onEndReached` 에서 `fetchNextPage()`.

## 10. 알림 — `src/entities/notification`

- **임시:** `mockNotifications` 인앱 리스트 + 활동 시 `push()` 로 로컬 생성.
- **교체:**
  - **모바일:** FCM(Android) / APNs(iOS) — `expo-notifications` 로 토큰 등록·수신.
  - **웹:** Web Push (Service Worker + VAPID). iOS Safari 제약 확인.
  - 목록은 `GET /notifications` + 읽음 처리 `PATCH`.

## 11. 스토리지 쿼터

- **임시:** `QUOTA_LIMIT_BYTES = 200MB` 하드코딩, 업로드 `sizeBytes` 는 클라 추정치.
- **교체:** 서버가 사용자별 **할당량/사용량**을 응답 → 프로필·업로드에서 그 값 사용.
  실제 용량은 업로드 완료 후 서버 측 크기로 갱신.

## 12. 공유 링크 — `src/features/share-post/ui/ShareSheet.tsx`

- **임시:** `daylog://log/${id}` 스킴 문자열 복사.
- **교체:** 공개 게시물용 **실제 URL**(예: `https://daylog.app/p/{id}`) + **OG 메타태그**.
  - OG 미리보기는 그 페이지만 SSR/ISR(서버리스)로 처리 권장.

## 13. API 설정 (현재 없음 → 추가 필요)

- **현재:** `.env` 없음, 환경변수 사용 없음, API 클라이언트 없음.
- **추가:**
  - `.env` + Expo 공개 변수 컨벤션 `EXPO_PUBLIC_API_URL` 등.
    ```
    EXPO_PUBLIC_API_URL=https://api.daylog.app
    ```
    ```ts
    const BASE = process.env.EXPO_PUBLIC_API_URL;
    ```
  - 공통 **API 클라이언트**(fetch/axios 래퍼 + JWT 헤더 주입)를 `src/shared/api/` 에 신설.
  - `.env` 는 `.gitignore` 에, 비밀키는 클라 번들에 넣지 말 것(`EXPO_PUBLIC_` 은 노출됨).

---

## 교체 순서 추천

1. **13 + 5** — API 클라이언트·`.env`·secure-store (기반)
2. **4** — 실제 인증/JWT
3. **6·7·2·3·11** — 로그 CRUD + 미디어 업로드 + 쿼터 (핵심 도메인)
4. **9** — 무한 스크롤(커서)
5. **8** — 실시간 채팅(WebSocket)
6. **10** — 푸시 알림
7. **12** — 공개 공유 + OG
8. **1** — 디자인 토큰 (디자이너 합류 시점에 맞춰 병행)

> 구조상 대부분의 교체는 **entity 의 `model/store` · `api`** 안에서 끝나도록 설계돼 있어, UI(widgets/pages)는 거의 손대지 않아도 됩니다.
