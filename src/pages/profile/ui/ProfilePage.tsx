import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { useDailyLogStore, type DailyLog } from '@/entities/daily-log';
import { useSessionStore } from '@/entities/session';
import { useUserStore } from '@/entities/user';
import { QUOTA_LIMIT_BYTES } from '@/data/mockLogs';
import { formatBytes } from '@/shared/lib';

export function ProfilePage({ onOpenLog }: { onOpenLog: (log: DailyLog) => void }) {
  const currentUser = useSessionStore((s) => s.currentUser);
  const logout = useSessionStore((s) => s.logout);
  const logs = useDailyLogStore((s) => s.logs);
  const friends = useUserStore((s) => s.friends);
  void friends;
  const friendList = useUserStore.getState().friendList();

  const myLogs = logs.filter((l) => l.ownerId === 'me');
  const quotaUsed = myLogs.reduce((sum, l) => sum + l.sizeBytes, 0);
  const quotaLimit = QUOTA_LIMIT_BYTES;
  const ratio = Math.min(1, quotaUsed / quotaLimit);
  const nearFull = ratio > 0.8;

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View className="flex-row items-center gap-3.5">
        <Image source={{ uri: currentUser?.avatarUri }} className="h-[72px] w-[72px] rounded-pill bg-surfaceAlt" />
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-text">{currentUser?.name}</Text>
          <Text className="mt-0.5 text-[13px] text-textMuted">
            {currentUser?.studentId ? `${currentUser.studentId} · ` : ''}
            {currentUser?.email}
          </Text>
          {!!currentUser?.bio && <Text className="mt-1.5 text-[13px] text-text">{currentUser.bio}</Text>}
        </View>
      </View>

      <View className="mt-5 flex-row rounded-lg border border-border bg-surface py-4">
        <Stat label="기록" value={myLogs.length} />
        <Stat label="친구" value={friendList.length} />
        <Stat label="공개" value={myLogs.filter((l) => l.visibility === 'public').length} />
      </View>

      <View className="mt-4 rounded-lg border border-border bg-surface p-4">
        <View className="mb-2 flex-row justify-between">
          <Text className="font-bold text-text">스토리지 사용량</Text>
          <Text className={`text-[13px] ${nearFull ? 'text-danger' : 'text-textMuted'}`}>
            {formatBytes(quotaUsed)} / {formatBytes(quotaLimit)}
          </Text>
        </View>
        <View className="h-2 overflow-hidden rounded-pill bg-surfaceAlt">
          <View
            className={`h-full rounded-pill ${nearFull ? 'bg-danger' : 'bg-primary'}`}
            style={{ width: `${ratio * 100}%` }}
          />
        </View>
        {nearFull && (
          <Text className="mt-2 text-xs text-danger">용량이 거의 찼어요. 오래된 기록을 정리해보세요.</Text>
        )}
      </View>

      <Text className="mb-3 mt-6 text-base font-bold text-text">내 기록</Text>
      <View className="flex-row flex-wrap gap-1">
        {myLogs.map((l) => {
          const poster = l.mediaType === 'image' ? l.uri : l.thumbnailUri;
          return (
            <Pressable
              key={l.id}
              className="aspect-square w-[32.5%] overflow-hidden rounded-sm bg-surfaceAlt"
              onPress={() => onOpenLog(l)}
            >
              {poster ? (
                <Image source={{ uri: poster }} className="h-full w-full" resizeMode="cover" />
              ) : (
                <View className="h-full w-full items-center justify-center">
                  <Text className="text-xl">🎬</Text>
                </View>
              )}
              {l.mediaType === 'video' && (
                <Text className="absolute right-1.5 top-1 text-xs text-white">▶</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        className="mt-8 items-center rounded-md border border-border bg-surfaceAlt py-4"
        onPress={logout}
      >
        <Text className="font-bold text-danger">로그아웃</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-xl font-extrabold text-text">{value}</Text>
      <Text className="mt-0.5 text-xs text-textMuted">{label}</Text>
    </View>
  );
}
