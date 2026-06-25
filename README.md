# DayLog (가칭) — 일상 공유·아카이빙 서비스 프론트엔드 프로토타입

FE/디자인 협업 이전에, **프론트 단독으로 먼저 만들 수 있는 부분**을 React Native for Web 으로 구현한 프로토타입입니다.
가장 핵심이자 난이도가 높은 **메인 피드의 커스텀 캘린더 뷰**에 집중했습니다.

## 실행

```bash
npm install
npm run web      # 데스크탑 웹 (Split View 확인)
# npm run ios / npm run android  # 네이티브
```

브라우저 창 너비를 768px 기준으로 줄였다 늘리면 **Stack(모바일) ↔ Split View(데스크탑)** 전환이 실시간으로 동작합니다.

## 구현된 기능 (프론트엔드 전체, 목업/로컬 상태)

- **인증/회원가입** (`AuthScreen`, `store/AppContext`): 이메일·학번 기반 로그인/가입, 목업 JWT 토큰을 AsyncStorage 에 보관해 세션 유지, 미인증 시 인증 화면 라우팅
- **미디어 업로드 + 클라이언트 압축** (`UploadSheet`, `media/compress*`): `expo-image-picker` 로 사진/동영상 선택 → 웹은 canvas, 네이티브는 `expo-image-manipulator` 로 사전 압축 → 캡션·공개범위 지정 → 게시. 동영상은 첫 프레임 썸네일(웹) 생성
- **친구/유저 검색** (`FriendsScreen`): 이름·이메일·학번 검색, 친구 요청/수락/거절/삭제, 받은 요청·내 친구 목록
- **프로필 + 스토리지 쿼터** (`ProfileScreen`): 내 프로필, 기록/친구/공개 통계, 유저별 스토리지 사용량 바(Quota), 내 기록 그리드, 로그아웃
- **공개 범위/프라이버시**: 업로드 시 전체공개/친구공개/나만보기 선택
- 탭: 피드 / 채팅 / 친구 / 프로필 (데스크탑 상단 네비, 모바일 하단 탭)

## 핵심 기능

### 1. 커스텀 캘린더 피드 (`src/components/CalendarFeed.tsx`)
- 외부 캘린더 라이브러리 **없이** 7열 그리드를 직접 구성 → 셀을 완전히 제어
- 각 날짜 셀 **배경에 이미지/동영상 썸네일**을 깔고, 날짜 가독성을 위한 스크림 처리
- 동영상 셀은 **재생하지 않고 포스터(썸네일)만** 표시 + ▶ 배지
  - 수십 개 셀에서 동영상을 디코딩하지 않도록, 셀은 정적 이미지만 렌더 (`MediaView` 의 `thumbnail` 모드)
- 월 이동(‹ ›), 오늘 강조, 요일 헤더(주말 색상)

### 2. 미디어 상세 모달 (`src/components/MediaModal.tsx`)
- **동영상은 재생**(`expo-av`), **이미지는 표시**
- 상단에 게시 타임라인을 **`YYYY년 MM월 DD일 HH시 mm분`** 형식으로 표기 (`dateUtils.formatKoreanTimestamp`)
- 미디어 위에 사용자가 **할 말(댓글)을 게시** — 최신 한마디는 미디어 위 캡션으로 오버레이
- **공유** 버튼 → 채팅방으로 전송 / 링크 복사 (`ShareSheet`)
- ⭐ 모달은 화면 전체가 아니라 **피드 영역 내부 오버레이**로 동작 → 데스크탑 Split View 에서 **우측 채팅 영역을 가리지 않음**

### 3. 반응형 레이아웃 (`src/hooks/useBreakpoint.ts`)
- 768px 기준으로 데스크탑(좌 60% 피드 / 우 40% 채팅) ↔ 모바일(하단 탭 Stack) 분기

## 폴더 구조
```
App.tsx                     앱 진입점
src/
  screens/HomeScreen.tsx    레이아웃 분기 + 상태 관리
  components/
    CalendarFeed.tsx        커스텀 캘린더 그리드
    DayCell.tsx             날짜 셀 (미디어 배경)
    MediaView.tsx           이미지/동영상 렌더 (thumbnail/full)
    MediaModal.tsx          상세 모달 (재생·타임라인·댓글·공유)
    ShareSheet.tsx          공유 시트
    ChatPanel.tsx           우측 채팅 패널 (목업)
  data/mockLogs.ts          목업 데이터 (백엔드 연동 전)
  dateUtils.ts              날짜/타임스탬프 유틸
  theme.ts                  임시 디자인 토큰
```

## 백엔드 연동 시 교체 지점
- `data/mockLogs.ts` → `GET /logs?year=&month=` 등 월별 조회 API
- `MediaView` 의 `uri` → MinIO Presigned URL
- `MediaModal.onAddComment` / `ShareSheet.onShareToRoom` → 댓글·공유 API (+ 채팅 STOMP 전송)

## 캘린더 라이브러리에 대한 메모
요구하신 자유도(셀 배경 미디어, 동영상 포스터, 셀별 커스텀 모달)는 범용 캘린더 라이브러리의
day 렌더 커스터마이즈로도 가능은 하지만 제약이 많습니다. 그리드 자체는 며칠이면 직접 짤 수 있어
**직접 구현**을 택했고, 이 프로토타입이 그 방식입니다. (자세한 비교는 PR/채팅 설명 참고)
```
