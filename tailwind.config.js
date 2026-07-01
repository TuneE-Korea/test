/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind가 className 을 스캔할 파일 범위. 여기 없는 경로의 클래스는 빌드에서 제거된다.
  content: ['./src/**/*.{ts,tsx}'],
  // RN 환경에 맞춘 Tailwind 동작을 주입하는 NativeWind 프리셋
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // 기존 theme.ts 의 디자인 토큰을 Tailwind 색상으로 이식
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
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
