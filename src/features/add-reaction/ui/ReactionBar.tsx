import { Pressable, Text, View } from 'react-native';

import { REACTION_EMOJIS, useDailyLogStore, type DailyLog } from '@/entities/daily-log';

/** 로그에 이모지 반응을 토글하는 바 (feature: "반응한다"). */
export function ReactionBar({ log }: { log: DailyLog }) {
  const toggleReaction = useDailyLogStore((s) => s.toggleReaction);
  const reactions = log.reactions ?? {};
  const mine = log.myReactions ?? [];

  return (
    <View className="flex-row gap-2">
      {REACTION_EMOJIS.map((e) => {
        const on = mine.includes(e);
        const count = reactions[e] ?? 0;
        return (
          <Pressable
            key={e}
            onPress={() => toggleReaction(log.id, e)}
            className={`flex-row items-center gap-1 rounded-pill border px-3 py-1 ${
              on ? 'border-primary bg-primarySoft' : 'border-border'
            }`}
          >
            <Text className="text-base">{e}</Text>
            {count > 0 && (
              <Text className={`text-[13px] font-bold ${on ? 'text-primary' : 'text-textMuted'}`}>
                {count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
