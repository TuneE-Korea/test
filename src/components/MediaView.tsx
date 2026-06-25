import { useVideoPlayer, VideoView } from 'expo-video';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { DailyLog } from '../types';

interface Props {
  log: DailyLog;
  /**
   * thumbnail: 캘린더 셀 배경용. 동영상도 재생하지 않고 포스터 이미지만.
   * full: 모달용. 동영상은 재생, 이미지는 그대로.
   */
  mode: 'thumbnail' | 'full';
}

/**
 * 미디어 렌더링 단일 진입점.
 * - 셀에서는 수십 개가 동시에 그려지므로 동영상 디코딩 없이 포스터만 그린다.
 * - 모달에서만 실제 동영상 플레이어(expo-video)를 마운트해 재생한다.
 */
export function MediaView({ log, mode }: Props) {
  if (mode === 'thumbnail') {
    return <ThumbnailMedia log={log} />;
  }
  if (log.mediaType === 'video') {
    return <FullVideo log={log} />;
  }
  return <Image source={{ uri: log.uri }} style={styles.fill} resizeMode="contain" />;
}

// 셀: 항상 정적 이미지 (동영상은 thumbnailUri, 없으면 원본 uri)
function ThumbnailMedia({ log }: { log: DailyLog }) {
  const poster = log.mediaType === 'video' ? log.thumbnailUri ?? log.uri : log.uri;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image source={{ uri: poster }} style={styles.fill} resizeMode="cover" />
      {log.mediaType === 'video' && (
        <View style={styles.playBadge}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      )}
    </View>
  );
}

// 모달: expo-video 로 재생
function FullVideo({ log }: { log: DailyLog }) {
  const player = useVideoPlayer(log.uri, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.fill}
      contentFit="contain"
      nativeControls
      allowsFullscreen
    />
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  playBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#fff', fontSize: 12, marginLeft: 2 },
});
