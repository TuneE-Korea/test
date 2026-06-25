// [마이그레이션 shim] 정식 위치는 @/shared/ui/MediaView.
// shared/ui/MediaView 는 도메인 타입(DailyLog)에 의존하지 않도록 원시 props 를 받는다.
// 아직 log 객체를 넘기는 기존 호출부를 위해 여기서 어댑터로 변환해준다.
import { MediaView as Base } from '@/shared/ui/MediaView';

import { DailyLog } from '../types';

export function MediaView({ log, mode }: { log: DailyLog; mode: 'thumbnail' | 'full' }) {
  return (
    <Base
      mediaType={log.mediaType}
      uri={log.uri}
      thumbnailUri={log.thumbnailUri}
      mode={mode}
    />
  );
}
