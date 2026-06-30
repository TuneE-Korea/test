# DayLog 개발 환경 세팅 가이드

이 프로젝트(**Expo RN + Web · FSD · NativeWind · zustand · TanStack Query · Expo Router**)를
처음부터 동일하게 세팅하는 방법입니다.

## 기술 스택 한눈에

| 분류 | 사용 |
|---|---|
| 런타임 | Expo SDK **54** (React Native 0.81 + react-native-web) |
| 언어 | TypeScript |
| 스타일 | **NativeWind v4** (Tailwind CSS v3 기반) |
| 클라이언트 상태 | **zustand** |
| 서버 상태 | **TanStack Query** (백엔드 연동 자리) |
| 라우팅 | **Expo Router** (파일 기반) |
| 폴더 구조 | **FSD** (Feature-Sliced Design) |
| 애니메이션 기반 | react-native-reanimated 4 (+ worklets) |

---

## 0. 사전 준비

```bash
node -v   # Node 18+ (20 LTS 권장)
npm -v
```

> ⚠️ **`npm install -g expo-cli` 는 하지 마세요.** 전역 `expo-cli` 는 deprecated 입니다.
> 모던 Expo 는 프로젝트 로컬 CLI 를 `npx expo ...` 로 호출합니다.

---

## 1. 프로젝트 생성

```bash
npx create-expo-app@latest daylog --template blank-typescript
cd daylog
```

---

## 2. 패키지 설치

> 💡 **설치 명령 구분**
> - **네이티브 모듈**(expo-*, reanimated, async-storage, safe-area, screens 등) → **`npx expo install`**
>   ( SDK 에 맞는 호환 버전을 자동 선택해 줌 )
> - **순수 JS 라이브러리**(zustand, tanstack-query, nativewind, tailwindcss 등) → **`npm install`**

```bash
# 상태 / 서버 상태
npm install zustand @tanstack/react-query

# Expo 모듈
npx expo install expo-image-picker expo-image-manipulator expo-video expo-status-bar
npx expo install @react-native-async-storage/async-storage

# Reanimated + Worklets + SafeArea (SDK 54)
npx expo install react-native-reanimated react-native-worklets react-native-safe-area-context

# NativeWind  ── Tailwind 는 반드시 v3 로 고정! (NativeWind v4 는 Tailwind v4 비호환)
npm install nativewind
npm install -D tailwindcss@^3.4.0 prettier-plugin-tailwindcss

# 기타
npm install cross-env

# 라우팅 (Expo Router)
npx expo install expo-router react-native-screens expo-linking expo-constants
```

---

## 3. NativeWind 설정

### `tailwind.config.js`
> `content` 에 **`app/` 폴더 포함**(라우트), 그리고 디자인 토큰 정의.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0f1115',
        surface: '#171a21',
        surfaceAlt: '#1f2430',
        border: '#2a3140',
        text: '#f5f7fa',
        textMuted: '#9aa4b2',
        primary: '#6c8cff',
        primarySoft: 'rgba(108, 140, 255, 0.15)',
        danger: '#ff6b6b',
        overlay: 'rgba(0, 0, 0, 0.55)',
      },
      borderRadius: { sm: '8px', md: '12px', lg: '16px', xl: '24px', pill: '9999px' },
    },
  },
  plugins: [],
};
```

### `global.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### `babel.config.js`
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // reanimated 4 의 worklets 플러그인은 반드시 맨 마지막
    plugins: ['react-native-worklets/plugin'],
  };
};
```

### `metro.config.js`
```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

### `nativewind-env.d.ts`
```ts
/// <reference types="nativewind/types" />
```

### ⭐ `global.css` 는 "정적 모듈"에서 import
```tsx
// 예: src/app/providers/AppProviders.tsx (라우트 파일이 아닌 일반 모듈)
import '../../../global.css';
```
> **주의:** `app/_layout.tsx` 같은 **라우트 파일에서 import 하면 웹 CSS 가 생성되지 않습니다.**
> Expo Router 가 라우트를 `require.context` 로 동적 로드해서, NativeWind 의 CSS 추출 그래프에
> 잡히지 않기 때문입니다. **반드시 정적으로 import 되는 일반 모듈에서** 불러오세요.

---

## 4. TypeScript 경로 별칭 — `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", "nativewind-env.d.ts"]
}
```
> `@/entities/...` 처럼 절대경로 import 가 가능해집니다. (Metro 가 tsconfig paths 를 자동 인식)

---

## 5. Expo Router 설정

### `package.json` — 진입점 변경 (가장 중요)
```jsonc
{
  "main": "expo-router/entry"   // 기존 "index.ts" / "App.tsx" 대신
}
```

### `app.json`
```jsonc
{
  "expo": {
    "name": "DayLog",
    "slug": "daylog",
    "version": "0.1.0",
    "newArchEnabled": true,          // reanimated 4 / worklets 사용 시 필수
    "scheme": "daylog",              // 딥링크 URL 스킴 (Expo Router 필수)
    "web": { "bundler": "metro", "output": "single" },  // SPA
    "plugins": [
      "expo-router",
      ["expo-image-picker", { "photosPermission": "사진/동영상 접근 권한이 필요합니다." }]
    ]
  }
}
```

### 옛 진입점 제거
```bash
rm App.tsx index.ts   # Expo Router 가 app/ 폴더를 스캔해 부팅
```

### `app/` 폴더 = 라우트
```
app/
  _layout.tsx        # 루트 레이아웃 (Provider · Stack) — export default 필수
  auth.tsx           # /auth
  (tabs)/            # 괄호 = URL 에 안 보이는 "그룹"
    _layout.tsx      # 탭 공통 셸
    index.tsx        # /          (피드)
    chat.tsx         # /chat
    friends.tsx      # /friends
    profile.tsx      # /profile
```

가장 단순한 루트 레이아웃:
```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

> **Expo Router 핵심 규칙**
> 1. `package.json` 의 `main` 을 **`expo-router/entry`** 로 (안 바꾸면 라우터 미동작)
> 2. `app/` 안의 파일 = 라우트, **`_layout.tsx` 는 `export default` 필수**
> 3. `app.json` 에 **`scheme`** 없으면 네이티브 딥링크 경고
> 4. **babel 추가 설정 불필요** — SDK 50+ 의 `babel-preset-expo` 가 Expo Router 를 자동 포함
> 5. 표준 하단탭이면 `<Tabs>` 가 간단. 데스크탑 Split View 같은 커스텀 레이아웃이 필요하면 `<Slot/>` + 직접 만든 네비게이션 사용

---

## 6. FSD 폴더 구조

```
src/
├─ app/        providers/ (전역 Provider 조립)
├─ pages/      화면 조립 (auth · friends · profile …) — 로직 최소
├─ widgets/    여러 entity/feature 조합 UI 블록 (top-nav · feed-board · chat-panel …)
├─ features/   "동사" = 사용자 행동 (upload-media · add-reaction · send-message …)
├─ entities/   "명사" = 도메인 객체 (daily-log · user · session · chat-room · notification)
│                각 entity = model(types·store) + api(query) + ui
├─ shared/     도메인 무관 재사용 (config·lib·ui)
└─ data/       목업 fixtures (백엔드 연동 시 교체)

app/            ← Expo Router 라우트 (위 5번). src/ 와 별개의 루트 폴더
```

**의존성 규칙 (위 → 아래로만 import):**
```
app → pages → widgets → features → entities → shared
```
- 같은 레이어끼리 횡단 import 금지 (entity ↔ entity, feature ↔ feature, page ↔ page).
- 각 슬라이스는 **`index.ts`(공개 API)** 만 외부에 노출.

**상태 관리 분담:**
- 서버 데이터(피드·채팅 목록) → **TanStack Query** (`entities/*/api`)
- 클라이언트 상태(현재 탭·모달·세션·활성방) → **zustand** (`entities/*/model/store.ts`)

---

## 7. 실행

```bash
npx expo start          # 개발 서버 → 터미널에서 w(웹) / a(안드로이드) / i(iOS) 선택

# 또는 package.json scripts 사용
npm run web             # 웹
npm run android         # Android
npm run ios             # iOS (Mac 전용)
```

### 빌드 검증
```bash
npx tsc --noEmit                    # 타입 체크
npx expo export --platform web      # 웹 정적 번들 출력 (dist/)
```
> 웹 빌드 후 `dist/_expo/static/css/web-*.css` 가 생성되면 NativeWind 가 정상 컴파일된 것입니다.
> ( CSS 가 비어 있으면 3번의 "global.css 정적 모듈 import" 를 확인하세요. )

---

## 자주 겪는 함정 체크리스트

- [ ] 전역 `expo-cli` 설치하지 않기 (deprecated)
- [ ] `tailwindcss@^3.4` 로 버전 고정 (v4 는 NativeWind v4 와 비호환)
- [ ] `tailwind.config.js` 의 `content` 에 **`app/`** 포함
- [ ] `global.css` 는 **라우트 파일이 아닌 정적 모듈**에서 import
- [ ] `package.json` `main` = **`expo-router/entry`**
- [ ] `app.json` 에 `scheme` + `plugins: ["expo-router"]`
- [ ] 옛 `App.tsx` / `index.ts` 삭제
- [ ] `newArchEnabled: true` (reanimated 4 / worklets 사용 시)
