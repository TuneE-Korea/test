import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDailyLogStore } from '@/entities/daily-log';
import { QUOTA_LIMIT_BYTES } from '@/data/mockLogs';
import { formatBytes } from '@/shared/lib';
import type { MediaType } from '@/shared/lib';
import { colors } from '@/shared/config';
import type { Visibility } from '@/entities/daily-log';

import { compressImage, makeVideoThumbnail } from '../lib/compress';

interface Picked {
  uri: string;
  mediaType: MediaType;
  sizeBytes: number;
  thumbnailUri?: string;
}

const VIS: { key: Visibility; label: string; icon: string }[] = [
  { key: 'public', label: '전체 공개', icon: '🌐' },
  { key: 'friends', label: '친구 공개', icon: '👥' },
  { key: 'private', label: '나만 보기', icon: '🔒' },
];

/** 미디어 선택 → 클라 압축 → 새 로그 게시 (feature: "업로드한다"). */
export function UploadSheet({ onClose }: { onClose: () => void }) {
  const addLog = useDailyLogStore((s) => s.addLog);
  const logs = useDailyLogStore((s) => s.logs);
  const quotaUsed = logs
    .filter((l) => l.ownerId === 'me')
    .reduce((sum, l) => sum + l.sizeBytes, 0);
  const quotaLimit = QUOTA_LIMIT_BYTES;

  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<Picked | null>(null);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('friends');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('미디어 접근 권한이 필요합니다.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 1,
    });
    if (res.canceled || !res.assets?.length) return;

    const asset = res.assets[0];
    const isVideo = asset.type === 'video';
    setBusy(true);
    try {
      if (isVideo) {
        const thumb = await makeVideoThumbnail(asset.uri);
        setPicked({
          uri: asset.uri,
          mediaType: 'video',
          sizeBytes: asset.fileSize ?? 8 * 1024 * 1024,
          thumbnailUri: thumb,
        });
      } else {
        const compressed = await compressImage(asset.uri);
        setPicked({ uri: compressed.uri, mediaType: 'image', sizeBytes: compressed.sizeBytes });
      }
    } catch {
      setError('미디어 처리 중 오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const publish = () => {
    if (!picked) return;
    if (quotaUsed + picked.sizeBytes > quotaLimit) {
      setError('스토리지 할당량을 초과했습니다. 용량을 비운 뒤 다시 시도하세요.');
      return;
    }
    addLog({
      uri: picked.uri,
      mediaType: picked.mediaType,
      thumbnailUri: picked.thumbnailUri,
      caption: caption.trim() || undefined,
      visibility,
      sizeBytes: picked.sizeBytes,
    });
    onClose();
  };

  const poster = picked?.mediaType === 'image' ? picked.uri : picked?.thumbnailUri;

  return (
    <View className="absolute inset-0 z-[70] justify-end">
      <Pressable className="absolute inset-0 bg-overlay" onPress={onClose} />
      <View
        className="max-h-[90%] rounded-t-xl border border-border bg-surface p-5"
        style={{ paddingBottom: 20 + insets.bottom }}
      >
        <View className="mb-3 h-1 w-10 self-center rounded-sm bg-border" />
        <Text className="mb-4 text-lg font-bold text-text">새 일상 기록</Text>

        <ScrollView keyboardShouldPersistTaps="handled">
          <Pressable
            className="aspect-square overflow-hidden rounded-md border border-border bg-surfaceAlt"
            onPress={pick}
          >
            {picked ? (
              poster ? (
                <Image source={{ uri: poster }} className="h-full w-full" resizeMode="cover" />
              ) : (
                <View className="flex-1 items-center justify-center gap-1.5">
                  <Text className="text-[32px]">🎬</Text>
                  <Text className="text-textMuted">동영상 선택됨</Text>
                </View>
              )
            ) : (
              <View className="flex-1 items-center justify-center gap-1.5">
                <Text className="text-[30px]">＋</Text>
                <Text className="text-textMuted">{busy ? '처리 중…' : '사진/동영상 선택'}</Text>
              </View>
            )}
            {picked?.mediaType === 'video' && (
              <View className="absolute left-2 top-2 rounded-pill bg-overlay px-2 py-0.5">
                <Text className="text-[11px] text-white">▶ 동영상</Text>
              </View>
            )}
          </Pressable>

          {picked && (
            <Text className="mt-2 text-xs text-textMuted">
              압축 후 약 {formatBytes(picked.sizeBytes)} · 남은 용량{' '}
              {formatBytes(Math.max(0, quotaLimit - quotaUsed))}
            </Text>
          )}

          <TextInput
            className="mt-3 min-h-[60px] rounded-md border border-border bg-surfaceAlt p-3 text-text"
            value={caption}
            onChangeText={setCaption}
            placeholder="이 순간에 대한 한마디…"
            placeholderTextColor={colors.textMuted}
            multiline
          />

          <Text className="mb-2 mt-4 text-[13px] text-textMuted">공개 범위</Text>
          <View className="flex-row gap-2">
            {VIS.map((v) => {
              const on = visibility === v.key;
              return (
                <Pressable
                  key={v.key}
                  className={`flex-1 items-center gap-1 rounded-md border py-3 ${
                    on ? 'border-primary bg-primarySoft' : 'border-border bg-surfaceAlt'
                  }`}
                  onPress={() => setVisibility(v.key)}
                >
                  <Text className="text-lg">{v.icon}</Text>
                  <Text className={`text-xs ${on ? 'font-bold text-primary' : 'text-textMuted'}`}>
                    {v.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {!!error && <Text className="mt-3 text-[13px] text-danger">{error}</Text>}

          <View className="mt-5 flex-row gap-2.5">
            <Pressable
              className="flex-1 items-center rounded-md bg-surfaceAlt py-4"
              onPress={onClose}
            >
              <Text className="font-bold text-text">취소</Text>
            </Pressable>
            <Pressable
              className="flex-1 items-center rounded-md bg-primary py-4"
              style={(!picked || busy) && { opacity: 0.5 }}
              onPress={publish}
              disabled={!picked || busy}
            >
              <Text className="font-extrabold text-white">게시</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
