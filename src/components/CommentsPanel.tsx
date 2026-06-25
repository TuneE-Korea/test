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
import { useApp } from '../store/AppContext';
import { colors, radius, spacing } from '../theme';
import { DailyLog, REACTION_EMOJIS } from '../types';
import { MediaView } from './MediaView';

/**
 * 선택된 피드의 댓글 및 반응 패널.
 * 데스크탑 우측 분할창에서 채팅과 탭 전환으로 사용되고,
 * 스크롤하면서 즉시 댓글을 작성할 수 있다.
 */
export function CommentsPanel({
  log,
  onShare,
}: {
  log: DailyLog | null;
  onShare?: (log: DailyLog) => void;
}) {
  const { addComment, toggleReaction } = useApp();
  const [draft, setDraft] = useState('');

  if (!log) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderIcon}>💬</Text>
        <Text style={styles.placeholderTxt}>피드에서 기록을 선택하면{'\n'}댓글과 반응을 남길 수 있어요.</Text>
      </View>
    );
  }

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    addComment(log.id, text);
    setDraft('');
  };

  const reactions = log.reactions ?? {};
  const mine = log.myReactions ?? [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing(3) }}>
        <View style={styles.media}>
          <MediaView log={log} mode="full" />
        </View>

        <View style={styles.meta}>
          {!!log.caption && <Text style={styles.caption}>{log.caption}</Text>}
          <View style={styles.metaRow}>
            <Text style={styles.timestamp}>{formatKoreanTimestamp(log.takenAt)}</Text>
            {onShare && (
              <Pressable style={styles.shareBtn} onPress={() => onShare(log)}>
                <Text style={styles.shareTxt}>↗ 공유</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* 반응(이모지) */}
        <View style={styles.reactions}>
          {REACTION_EMOJIS.map((e) => {
            const on = mine.includes(e);
            const count = reactions[e] ?? 0;
            return (
              <Pressable
                key={e}
                style={[styles.reaction, on && styles.reactionOn]}
                onPress={() => toggleReaction(log.id, e)}
              >
                <Text style={styles.reactionEmoji}>{e}</Text>
                {count > 0 && <Text style={[styles.reactionCount, on && styles.reactionCountOn]}>{count}</Text>}
              </Pressable>
            );
          })}
        </View>

        {/* 댓글 목록 */}
        <View style={styles.comments}>
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
        </View>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(6) },
  placeholderIcon: { fontSize: 40, marginBottom: spacing(3) },
  placeholderTxt: { color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  media: { width: '100%', aspectRatio: 1, backgroundColor: '#000' },
  meta: { padding: spacing(4), paddingBottom: spacing(2) },
  caption: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timestamp: { color: colors.textMuted, fontSize: 13 },
  shareBtn: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
  },
  shareTxt: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  reactions: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing(4), paddingBottom: spacing(3) },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  reactionOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  reactionEmoji: { fontSize: 16 },
  reactionCount: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  reactionCountOn: { color: colors.primary },
  comments: { paddingHorizontal: spacing(4) },
  empty: { color: colors.textMuted, fontSize: 13, paddingVertical: spacing(2) },
  commentRow: { flexDirection: 'row', gap: 8, paddingVertical: spacing(1) },
  commentAuthor: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  commentText: { color: colors.text, fontSize: 13, flex: 1 },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    padding: spacing(3),
    borderTopWidth: 1,
    borderColor: colors.border,
  },
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
