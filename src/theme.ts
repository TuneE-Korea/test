// 디자인 시스템 토큰(임시). 추후 디자인팀과 함께 정식 토큰으로 대체.
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
