export interface CompressResult {
  uri: string;
  sizeBytes: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = src;
  });
}

/**
 * 웹 이미지 압축 (canvas).
 * - 가로 최대 1080px 리사이즈, JPEG 품질 0.5
 * - blob.size 로 실제 압축 용량을 측정해 쿼터 합산에 사용
 */
export async function compressImage(uri: string): Promise<CompressResult> {
  const img = await loadImage(uri);
  const maxW = 1080;
  const scale = Math.min(1, maxW / img.width || 1);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { uri, sizeBytes: 0 };
  ctx.drawImage(img, 0, 0, w, h);

  const blob: Blob | null = await new Promise((res) =>
    canvas.toBlob(res, 'image/jpeg', 0.5),
  );
  if (!blob) return { uri, sizeBytes: 0 };
  return { uri: URL.createObjectURL(blob), sizeBytes: blob.size };
}

/** 동영상 첫 프레임을 캡처해 썸네일(dataURL) 생성 */
export async function makeVideoThumbnail(uri: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.src = uri;
    const onError = () => resolve(undefined);
    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.1, video.duration || 0.1);
      } catch {
        resolve(undefined);
      }
    };
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 600;
        canvas.height = video.videoHeight || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(undefined);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      } catch {
        resolve(undefined);
      }
    };
    video.onerror = onError;
  });
}
