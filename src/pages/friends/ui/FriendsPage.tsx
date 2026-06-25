import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import type { Friend } from '@/entities/user';
import { useManageFriends } from '@/features/manage-friends';
import { colors } from '@/shared/config';

export function FriendsPage() {
  const { friendList, incomingRequests, searchUsers, requestFriend, acceptFriend, removeFriend } =
    useManageFriends();
  const [query, setQuery] = useState('');

  const searching = query.trim().length > 0;
  const results = searching ? searchUsers(query) : [];

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text className="mb-4 text-[22px] font-extrabold text-text">친구</Text>

      <TextInput
        className="rounded-pill border border-border bg-surfaceAlt px-4 py-3 text-text"
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
          {results.length === 0 && (
            <Text className="py-3 text-[13px] text-textMuted">일치하는 유저가 없어요.</Text>
          )}
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
              <Text className="py-3 text-[13px] text-textMuted">
                아직 친구가 없어요. 위에서 검색해 추가해보세요.
              </Text>
            )}
          </Section>
        </>
      )}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-5">
      <Text className="mb-2 text-[13px] font-bold text-textMuted">{title}</Text>
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
    <View className="flex-row items-center gap-3 border-b border-border py-3">
      <Image source={{ uri: user.avatarUri }} className="h-11 w-11 rounded-pill bg-surfaceAlt" />
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-text">{user.name}</Text>
        <Text className="text-xs text-textMuted">
          {user.studentId ? `${user.studentId} · ` : ''}
          {user.email}
        </Text>
      </View>
      {status === 'none' && <Action label="친구 추가" onPress={onRequest} primary />}
      {status === 'requested' && <Action label="요청됨" disabled />}
      {status === 'incoming' && (
        <View className="flex-row gap-1.5">
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
      className={`rounded-pill border px-3 py-2 ${
        primary ? 'border-primary bg-primary' : 'border-border bg-surfaceAlt'
      }`}
      style={disabled && { opacity: 0.5 }}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={`text-[13px] font-bold ${primary ? 'text-white' : 'text-text'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
