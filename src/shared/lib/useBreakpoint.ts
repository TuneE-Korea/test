import { useWindowDimensions } from 'react-native';

import { BREAKPOINT } from '@/shared/config/theme';

export type Layout = 'mobile' | 'desktop';

/**
 * 화면 너비를 감지해 Stack(모바일) / Split View(데스크탑)를 동적으로 분기.
 * 브라우저 창 크기를 줄이면 실시간으로 mobile 로 전환된다.
 */
export function useBreakpoint() {
  const { width } = useWindowDimensions();
  const layout: Layout = width >= BREAKPOINT ? 'desktop' : 'mobile';
  return { width, layout, isDesktop: layout === 'desktop' };
}
