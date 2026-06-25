import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatKoreanTimestamp } from '../dateUtils';
import { useApp } from '../store/AppContext';
import { colors, radius, spacing } from '../theme';
import { DailyLog, REACTION_EMOJIS } from '../types';
import { MediaView } from './MediaView';

interface Props {
  log: DailyLog;
  /** 데스크탑에서 모달이 우측 채팅 영역을 가리지 않도록 부모가 영역을 제한한다 */
  onClose: () => void;
  onShare: (log: DailyLog) => void;
}

/**
 * 미디어 상세 모달.
 * - 동영상은 재생, 이미지는 표시
 * - 미디어 위에 게시 날짜를 큰 흰 글씨로 표기 (YYYY년 MM월 DD일 HH시 mm분)
 * - 이모지 반응 / 공유만 가능 (댓글 없음)
 *
 * 이 컴포넌트는 화면 전체가 아니라 부모(피드 영역) 내부를 채우는 오버레이로 동작한다.
 * 따라서 데스크탑 Split View 에서 우측 채팅방을 가리지 않는다.
 */
export function MediaModal({ log, onClose, onShare }: Props) {
  const { toggleReaction } = useApp();
  const reactions = log.reactions ?? {};
  const myReactions = log.myReactions ?? [];

  return (
    <View style={styles.root}>
      {/* 배경(딤). 누르면 닫힘 — 단, 부모 영역 안에서만 덮인다 */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.cardWrap} pointerEvents="box-none">
        <View style={styles.card}>
          {/* 미디어 영역 */}
          <View style={styles.media}>
            <MediaView log={log} mode="full" />

            {/* 닫기 */}
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Text style={styles.closeTxt}>✕</Text>
            </Pressable>

            {/* 미디어 위에 게시 날짜를 큰 흰 글씨로 (미디어 중앙 정렬) */}
            <View style={styles.dateOverlay} pointerEvents="none">
              <Text style={styles.dateText}>{formatKoreanTimestamp(log.takenAt)}</Text>
            </View>
          </View>

          {/* 메타 + 인터랙션 */}
          <View style={styles.body}>
            {!!log.caption && <Text style={styles.caption}>{log.caption}</Text>}

            <View style={styles.actionRow}>
              {/* 반응(이모지) */}
              <View style={styles.reactions}>
                {REACTION_EMOJIS.map((e) => {
                  const on = myReactions.includes(e);
                  const count = reactions[e] ?? 0;
                  return (
                    <Pressable
                      key={e}
                      style={[styles.reaction, on && styles.reactionOn]}
                      onPress={() => toggleReaction(log.id, e)}
                    >
                      <Text style={styles.reactionEmoji}>{e}</Text>
                      {count > 0 && (
                        <Text style={[styles.reactionCount, on && styles.reactionCountOn]}>
                          {count}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* 공유 */}
              <Pressable style={styles.shareBtn} onPress={() => onShare(log)}>
                <Text style={styles.shareTxt}>↗ 공유</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
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
  dateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dateText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    // 밝은 배경 위에서도 읽히도록 그림자
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  body: { padding: spacing(4) },
  caption: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing(3) },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactions: { flexDirection: 'row', gap: 8, flex: 1 },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reactionOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  reactionEmoji: { fontSize: 16 },
  reactionCount: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  reactionCountOn: { color: colors.primary },
  shareBtn: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    marginLeft: spacing(2),
  },
  shareTxt: { color: colors.primary, fontSize: 13, fontWeight: '700' },
});
