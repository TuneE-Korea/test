import { Pressable, Text, View } from 'react-native';

import type { DailyLog } from '@/entities/daily-log';
import { ReactionBar } from '@/features/add-reaction';
import { formatKoreanTimestamp } from '@/shared/lib';
import { MediaView } from '@/shared/ui';

interface Props {
  log: DailyLog;
  onClose: () => void;
  onShare: (log: DailyLog) => void;
}

/**
 * 미디어 상세 모달.
 * - 미디어 위에 게시 날짜를 큰 흰 글씨로 중앙 표기
 * - 이모지 반응(feature) / 공유만 가능 (댓글 없음)
 * - 부모(피드 영역) 안을 채우는 오버레이라 데스크탑 우측 채팅을 가리지 않는다.
 */
export function MediaDetailModal({ log, onClose, onShare }: Props) {
  return (
    <View className="absolute inset-0 z-50">
      <Pressable className="absolute inset-0 bg-overlay" onPress={onClose} />

      <View className="flex-1 items-center justify-center p-4" pointerEvents="box-none">
        <View className="max-h-[92%] w-full max-w-[460px] overflow-hidden rounded-lg border border-border bg-surface">
          {/* 미디어 */}
          <View className="aspect-square w-full bg-black">
            <MediaView mediaType={log.mediaType} uri={log.uri} thumbnailUri={log.thumbnailUri} mode="full" />

            <Pressable
              className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-pill bg-overlay"
              onPress={onClose}
              hitSlop={8}
            >
              <Text className="text-base text-white">✕</Text>
            </Pressable>

            {/* 날짜 오버레이 (중앙, 큰 흰 글씨 + 그림자) */}
            <View className="absolute inset-0 items-center justify-center p-4" pointerEvents="none">
              <Text
                className="text-center text-[26px] font-extrabold text-white"
                style={{
                  textShadowColor: 'rgba(0,0,0,0.6)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 6,
                }}
              >
                {formatKoreanTimestamp(log.takenAt)}
              </Text>
            </View>
          </View>

          {/* 메타 + 반응/공유 */}
          <View className="p-4">
            {!!log.caption && (
              <Text className="mb-3 text-base font-semibold text-text">{log.caption}</Text>
            )}
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <ReactionBar log={log} />
              </View>
              <Pressable
                className="ml-2 rounded-pill bg-primarySoft px-4 py-2"
                onPress={() => onShare(log)}
              >
                <Text className="text-[13px] font-bold text-primary">↗ 공유</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
