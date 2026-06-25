import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useApp } from '../store/AppContext';
import { colors, radius, spacing } from '../theme';
import { Friend } from '../types';

export function FriendsScreen() {
  const { searchUsers, friendList, incomingRequests, requestFriend, acceptFriend, removeFriend } =
    useApp();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchUsers(query), [searchUsers, query]);
  const searching = query.trim().length > 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.header}>친구</Text>

      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="이름 · 이메일 · 학번으로 검색"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
      />

      {searching ? (
        <Section title={`검색 결과 (${results.length})`}>
          {results.map((f) => (
            <FriendRow
              key={f.user.id}
              friend={f}
              onRequest={() => requestFriend(f.user.id)}
              onAccept={() => acceptFriend(f.user.id)}
              onRemove={() => removeFriend(f.user.id)}
            />
          ))}
          {results.length === 0 && <Text style={styles.empty}>일치하는 유저가 없어요.</Text>}
        </Section>
      ) : (
        <>
          {incomingRequests.length > 0 && (
            <Section title={`받은 친구 요청 (${incomingRequests.length})`}>
              {incomingRequests.map((f) => (
                <FriendRow
                  key={f.user.id}
                  friend={f}
                  onAccept={() => acceptFriend(f.user.id)}
                  onRemove={() => removeFriend(f.user.id)}
                />
              ))}
            </Section>
          )}

          <Section title={`내 친구 (${friendList.length})`}>
            {friendList.map((f) => (
              <FriendRow key={f.user.id} friend={f} onRemove={() => removeFriend(f.user.id)} />
            ))}
            {friendList.length === 0 && (
              <Text style={styles.empty}>아직 친구가 없어요. 위에서 검색해 추가해보세요.</Text>
            )}
          </Section>
        </>
      )}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FriendRow({
  friend,
  onRequest,
  onAccept,
  onRemove,
}: {
  friend: Friend;
  onRequest?: () => void;
  onAccept?: () => void;
  onRemove?: () => void;
}) {
  const { user, status } = friend;
  return (
    <View style={styles.row}>
      <Image source={{ uri: user.avatarUri }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.sub}>
          {user.studentId ? `${user.studentId} · ` : ''}
          {user.email}
        </Text>
      </View>
      {status === 'none' && (
        <Action label="친구 추가" onPress={onRequest} primary />
      )}
      {status === 'requested' && <Action label="요청됨" disabled />}
      {status === 'incoming' && (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Action label="수락" onPress={onAccept} primary />
          <Action label="거절" onPress={onRemove} />
        </View>
      )}
      {status === 'friend' && <Action label="친구 ✓" onPress={onRemove} />}
    </View>
  );
}

function Action({
  label,
  onPress,
  primary,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.action, primary && styles.actionPrimary, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.actionTxt, primary && styles.actionTxtPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing(4), paddingBottom: spacing(10) },
  header: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing(4) },
  search: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: { marginTop: spacing(5) },
  sectionTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', marginBottom: spacing(2) },
  empty: { color: colors.textMuted, fontSize: 13, paddingVertical: spacing(3) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceAlt },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  sub: { color: colors.textMuted, fontSize: 12 },
  action: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionTxt: { color: colors.text, fontSize: 13, fontWeight: '700' },
  actionTxtPrimary: { color: '#fff' },
});
