import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressResult {
  uri: string;
  sizeBytes: number;
}

/**
 * 네이티브(iOS/Android) 이미지 압축.
 * 저사양 서버/스토리지 정책에 맞춰 클라이언트에서 사전 압축한다.
 * - 가로 최대 1080px 로 리사이즈, JPEG 품질 0.5
 */
export async function compressImage(uri: string): Promise<CompressResult> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
  );
  // 네이티브에서 정확한 파일 크기는 expo-file-system 이 필요하므로,
  // 해상도 기반으로 용량을 추정한다(프로토타입).
  const w = result.width ?? 1080;
  const h = result.height ?? 1080;
  const estimated = Math.round(w * h * 0.18); // JPEG q0.5 대략치
  return { uri: result.uri, sizeBytes: estimated };
}

/**
 * 동영상 첫 프레임 썸네일.
 * 네이티브는 expo-video-thumbnails 가 필요하므로 프로토타입에선 미지원(undefined).
 */
export async function makeVideoThumbnail(_uri: string): Promise<string | undefined> {
  return undefined;
}
