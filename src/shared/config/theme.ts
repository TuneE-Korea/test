// 디자인 토큰의 "단일 출처(single source of truth)".
// - className(NativeWind)으로 표현 가능한 스타일은 tailwind.config.js 가 사용
// - JS 값이 필요한 곳(ActivityIndicator color, StatusBar, 동적 계산)은 이 파일을 import
//
// FSD: 비즈니스 로직이 없고 어느 레이어에서나 쓰이는 값이므로 shared/config 에 둔다.
export const colors = {
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
};

export const spacing = (n: number) => n * 4;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

// 화면 분기 기준점. 768px 이상 = 데스크탑/가로(Split View).
export const BREAKPOINT = 768;
