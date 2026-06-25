import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { formatKoreanTimestamp } from '../dateUtils';
import { colors, radius, spacing } from '../theme';
import { DailyLog } from '../types';
import { MediaView } from './MediaView';

interface Props {
  log: DailyLog;
  /** 데스크탑에서 모달이 우측 채팅 영역을 가리지 않도록 부모가 영역을 제한한다 */
  onClose: () => void;
  onShare: (log: DailyLog) => void;
  onAddComment: (logId: string, text: string) => void;
}

/**
 * 미디어 상세 모달.
 * - 동영상은 재생, 이미지는 표시
 * - 상단에 게시 타임라인(YYYY년 MM월 DD일 HH시 mm분)
 * - 미디어 위에 사용자가 할 말(댓글) 게시 가능
 * - 공유 버튼 제공
 *
 * 이 컴포넌트는 화면 전체가 아니라 부모(피드 영역) 내부를 채우는 오버레이로 동작한다.
 * 따라서 데스크탑 Split View 에서 우측 채팅방을 가리지 않는다.
 */
export function MediaModal({ log, onClose, onShare, onAddComment }: Props) {
  const [draft, setDraft] = useState('');

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAddComment(log.id, text);
    setDraft('');
  };

  return (
    <View style={styles.root}>
      {/* 배경(딤). 누르면 닫힘 — 단, 부모 영역 안에서만 덮인다 */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.cardWrap}
        pointerEvents="box-none"
      >
        <View style={styles.card}>
          {/* 미디어 영역 */}
          <View style={styles.media}>
            <MediaView log={log} mode="full" />

            {/* 닫기 */}
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Text style={styles.closeTxt}>✕</Text>
            </Pressable>

            {/* 미디어 위에 게시된 사용자의 한마디(가장 최근 댓글) */}
            {log.comments.length > 0 && (
              <View style={styles.overlayCaption} pointerEvents="none">
                <Text style={styles.overlayAuthor}>
                  {log.comments[log.comments.length - 1].author}
                </Text>
                <Text style={styles.overlayText}>
                  {log.comments[log.comments.length - 1].text}
                </Text>
              </View>
            )}
          </View>

          {/* 메타 + 인터랙션 */}
          <View style={styles.body}>
            <View style={styles.metaRow}>
              <View style={{ flex: 1 }}>
                {!!log.caption && <Text style={styles.caption}>{log.caption}</Text>}
                {/* 요구 표기: YYYY년 MM월 DD일 HH시 mm분 */}
                <Text style={styles.timestamp}>{formatKoreanTimestamp(log.takenAt)}</Text>
              </View>
              <Pressable style={styles.shareBtn} onPress={() => onShare(log)}>
                <Text style={styles.shareTxt}>↗ 공유</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.comments} keyboardShouldPersistTaps="handled">
              {log.comments.length === 0 ? (
                <Text style={styles.empty}>첫 한마디를 남겨보세요.</Text>
              ) : (
                log.comments.map((c) => (
                  <View key={c.id} style={styles.commentRow}>
                    <Text style={styles.commentAuthor}>{c.author}</Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                placeholder="이 순간에 할 말 남기기…"
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={submit}
                returnKeyType="send"
              />
              <Pressable style={styles.sendBtn} onPress={submit}>
                <Text style={styles.sendTxt}>게시</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  cardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(4),
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  media: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#000',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: { color: '#fff', fontSize: 16 },
  overlayCaption: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
  },
  overlayAuthor: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  overlayText: { color: '#fff', fontSize: 14 },
  body: { padding: spacing(4) },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing(2) },
  caption: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 2 },
  timestamp: { color: colors.textMuted, fontSize: 13 },
  shareBtn: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
  },
  shareTxt: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  comments: { maxHeight: 140, marginVertical: spacing(2) },
  empty: { color: colors.textMuted, fontSize: 13, paddingVertical: spacing(2) },
  commentRow: { flexDirection: 'row', gap: 8, paddingVertical: spacing(1) },
  commentAuthor: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  commentText: { color: colors.text, fontSize: 13, flex: 1 },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: spacing(1) },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    paddingHorizontal: spacing(4),
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  sendTxt: { color: '#fff', fontWeight: '700' },
});
