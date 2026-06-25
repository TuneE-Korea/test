import { Pressable, Text, View } from 'react-native';

import { formatKoreanTimestamp } from '@/shared/lib';
import { MediaView } from '@/shared/ui';

import type { DailyLog, Visibility } from '../model/types';

const VIS_LABEL: Record<Visibility, string> = {
  public: '🌐 전체 공개',
  friends: '👥 친구 공개',
  private: '🔒 나만 보기',
};

/**
 * 타임라인/피드에서 로그 하나를 카드로 보여준다.
 *
 * FSD: 이 컴포넌트는 DailyLog(도메인 타입)를 알아야 하므로 entities/daily-log/ui 에 둔다.
 * 내부에서 shared/ui 의 MediaView(더 낮은 레이어)를 사용한다 → 의존성 방향 정상(위→아래).
 */
export function LogCard({ log, onPress }: { log: DailyLog; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-lg border border-border bg-surface"
    >
      <View className="aspect-square w-full bg-black">
        <MediaView
          mediaType={log.mediaType}
          uri={log.uri}
          thumbnailUri={log.thumbnailUri}
          mode="thumbnail"
        />
      </View>
      <View className="p-4">
        <Text className="text-[13px] text-textMuted">{formatKoreanTimestamp(log.takenAt)}</Text>
        {!!log.caption && (
          <Text className="mt-1 text-base font-semibold text-text">{log.caption}</Text>
        )}
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-xs text-textMuted">{VIS_LABEL[log.visibility]}</Text>
          <Text className="text-xs text-textMuted">💬 {log.comments.length}</Text>
        </View>
      </View>
    </Pressable>
  );
}
