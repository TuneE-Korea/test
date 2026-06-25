import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../store/AppContext';
import { colors, radius, spacing } from '../theme';

/** 친구를 골라 1:1 또는 그룹 채팅방을 만든다. */
export function NewChatModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (roomId: string) => void;
}) {
  const { friendList, createRoom } = useApp();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const create = () => {
    if (selected.length === 0) return;
    onCreated(createRoom(selected));
  };

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.card}>
        <Text style={styles.title}>새 채팅</Text>
        <Text style={styles.sub}>
          친구를 선택하세요. {selected.length >= 2 ? '(그룹 채팅)' : ''}
        </Text>

        <ScrollView style={styles.list}>
          {friendList.map((f) => {
            const on = selected.includes(f.user.id);
            return (
              <Pressable key={f.user.id} style={styles.row} onPress={() => toggle(f.user.id)}>
                <Image source={{ uri: f.user.avatarUri }} style={styles.avatar} />
                <Text style={styles.name}>{f.user.name}</Text>
                <View style={[styles.check, on && styles.checkOn]}>
                  {on && <Text style={styles.checkTxt}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
          {friendList.length === 0 && (
            <Text style={styles.empty}>친구를 먼저 추가하세요.</Text>
          )}
        </ScrollView>

        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.cancel]} onPress={onClose}>
            <Text style={styles.cancelTxt}>취소</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.create, selected.length === 0 && { opacity: 0.5 }]}
            onPress={create}
            disabled={selected.length === 0}
          >
            <Text style={styles.createTxt}>
              만들기{selected.length > 0 ? ` (${selected.length})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 80, alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  card: {
    width: '90%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 4, marginBottom: spacing(3) },
  list: { maxHeight: 320 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: spacing(3) },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceAlt },
  name: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  empty: { color: colors.textMuted, paddingVertical: spacing(4), textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: spacing(4) },
  btn: { flex: 1, paddingVertical: spacing(3), borderRadius: radius.md, alignItems: 'center' },
  cancel: { backgroundColor: colors.surfaceAlt },
  cancelTxt: { color: colors.text, fontWeight: '700' },
  create: { backgroundColor: colors.primary },
  createTxt: { color: '#fff', fontWeight: '800' },
});
