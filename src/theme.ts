// [마이그레이션 shim] 정식 위치는 @/shared/config/theme.
// 아직 옮기지 않은 기존 코드가 '../theme' 로 import 하므로 호환을 위해 재노출한다.
// 모든 컴포넌트가 @/shared 로 이전되면 이 파일은 삭제한다.
export { colors, spacing, radius, BREAKPOINT } from '@/shared/config/theme';
