import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatBytes } from '../dateUtils';
import { compressImage, makeVideoThumbnail } from '../media/compress';
import { useApp } from '../store/AppContext';
import { colors, radius, spacing } from '../theme';
import { MediaType, Visibility } from '../types';

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

export function UploadSheet({ onClose }: { onClose: () => void }) {
  const { addLog, quotaUsed, quotaLimit } = useApp();
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
        // 클라이언트 사전 압축 (저사양 서버/쿼터 정책)
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
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: spacing(5) + insets.bottom }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>새 일상 기록</Text>

        <ScrollView keyboardShouldPersistTaps="handled">
          {/* 미디어 선택/미리보기 */}
          <Pressable style={styles.preview} onPress={pick}>
            {picked ? (
              poster ? (
                <Image source={{ uri: poster }} style={styles.previewImg} resizeMode="cover" />
              ) : (
                <View style={styles.previewVideo}>
                  <Text style={{ fontSize: 32 }}>🎬</Text>
                  <Text style={styles.muted}>동영상 선택됨</Text>
                </View>
              )
            ) : (
              <View style={styles.previewEmpty}>
                <Text style={{ fontSize: 30 }}>＋</Text>
                <Text style={styles.muted}>{busy ? '처리 중…' : '사진/동영상 선택'}</Text>
              </View>
            )}
            {picked?.mediaType === 'video' && (
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>▶ 동영상</Text>
              </View>
            )}
          </Pressable>

          {picked && (
            <Text style={styles.sizeTxt}>
              압축 후 약 {formatBytes(picked.sizeBytes)} · 남은 용량{' '}
              {formatBytes(Math.max(0, quotaLimit - quotaUsed))}
            </Text>
          )}

          <TextInput
            style={styles.caption}
            value={caption}
            onChangeText={setCaption}
            placeholder="이 순간에 대한 한마디…"
            placeholderTextColor={colors.textMuted}
            multiline
          />

          <Text style={styles.label}>공개 범위</Text>
          <View style={styles.visRow}>
            {VIS.map((v) => (
              <Pressable
                key={v.key}
                style={[styles.visBtn, visibility === v.key && styles.visActive]}
                onPress={() => setVisibility(v.key)}
              >
                <Text style={styles.visIcon}>{v.icon}</Text>
                <Text style={[styles.visTxt, visibility === v.key && styles.visTxtActive]}>
                  {v.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.cancel]} onPress={onClose}>
              <Text style={styles.cancelTxt}>취소</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.publish, (!picked || busy) && { opacity: 0.5 }]}
              onPress={publish}
              disabled={!picked || busy}
            >
              <Text style={styles.publishTxt}>게시</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 70, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing(5),
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing(3),
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing(4) },
  preview: {
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImg: { width: '100%', height: '100%' },
  previewVideo: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  previewEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  muted: { color: colors.textMuted },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.overlay,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2),
    paddingVertical: 2,
  },
  badgeTxt: { color: '#fff', fontSize: 11 },
  sizeTxt: { color: colors.textMuted, fontSize: 12, marginTop: spacing(2) },
  caption: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing(3),
    color: colors.text,
    minHeight: 60,
    marginTop: spacing(3),
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.textMuted, fontSize: 13, marginTop: spacing(4), marginBottom: spacing(2) },
  visRow: { flexDirection: 'row', gap: 8 },
  visBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing(3),
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  visActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  visIcon: { fontSize: 18 },
  visTxt: { color: colors.textMuted, fontSize: 12 },
  visTxtActive: { color: colors.primary, fontWeight: '700' },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing(3) },
  actions: { flexDirection: 'row', gap: 10, marginTop: spacing(5) },
  btn: { flex: 1, paddingVertical: spacing(4), borderRadius: radius.md, alignItems: 'center' },
  cancel: { backgroundColor: colors.surfaceAlt },
  cancelTxt: { color: colors.text, fontWeight: '700' },
  publish: { backgroundColor: colors.primary },
  publishTxt: { color: '#fff', fontWeight: '800' },
});
