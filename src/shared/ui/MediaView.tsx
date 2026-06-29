import { useVideoPlayer, VideoView } from "expo-video";
import { Image, Text, View } from "react-native";

type MediaType = "image" | "video";

interface Props {
  mediaType: MediaType;
  /** 이미지 또는 동영상 원본 URL */
  uri: string;
  /** 동영상 포스터(썸네일) URL */
  thumbnailUri?: string;
  /**
   * thumbnail: 캘린더 셀 배경용. 동영상도 재생하지 않고 포스터 이미지만.
   * full: 모달용. 동영상은 재생, 이미지는 그대로.
   */
  mode: "thumbnail" | "full";
}

/**
 * 미디어 렌더링 단일 진입점.
 * - 셀에서는 수십 개가 동시에 그려지므로 동영상 디코딩 없이 포스터만 그린다.
 * - 모달에서만 실제 동영상 플레이어(expo-video)를 마운트해 재생한다.
 *
 * FSD: DailyLog 같은 도메인 타입에 의존하지 않고 원시 값만 받으므로 shared/ui 에 둘 수 있다.
 */
export function MediaView({ mediaType, uri, thumbnailUri, mode }: Props) {
  if (mode === "thumbnail") {
    return (
      <ThumbnailMedia
        mediaType={mediaType}
        uri={uri}
        thumbnailUri={thumbnailUri}
      />
    );
  }
  if (mediaType === "video") {
    return <FullVideo uri={uri} />;
  }
  return (
    <Image source={{ uri }} className="h-full w-full" resizeMode="contain" />
  );
}

// 셀: 항상 정적 이미지. 동영상은 thumbnailUri 가 있을 때만 이미지로,
// 없으면 회색 placeholder + 🎬 처리.
function ThumbnailMedia({ mediaType, uri, thumbnailUri }: Omit<Props, "mode">) {
  const poster = mediaType === "image" ? uri : thumbnailUri;
  return (
    <View className="absolute inset-0 items-center justify-center bg-surfaceAlt">
      {poster ? (
        <Image
          source={{ uri: poster }}
          className="h-full w-full"
          resizeMode="cover"
        />
      ) : (
        <Text className="text-[22px]">🎬</Text>
      )}
      {mediaType === "video" && (
        <View className="absolute h-[26px] w-[26px] items-center justify-center rounded-pill bg-overlay">
          <Text className="ml-0.5 text-xs text-white">▶</Text>
        </View>
      )}
    </View>
  );
}

// 모달: expo-video 로 재생. VideoView 는 서드파티라 className 대신 style 로 크기를 준다.
function FullVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: "100%" }}
      contentFit="contain"
      nativeControls
      allowsFullscreen
    />
  );
}
