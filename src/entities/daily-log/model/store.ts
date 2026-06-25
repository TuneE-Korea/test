import { create } from 'zustand';

import { mockLogs } from '@/data/mockLogs';

import type { DailyLog, NewLogInput } from './types';

// zustand 스토어: "일상 로그"의 클라이언트 상태 + 변경 액션.
// AppContext 의 useState 로 흩어져 있던 로그 로직을 이 entity 의 model 로 모았다.
//
// 문법:
//   create<State>()(initializer)
//   - 제네릭 State 로 스토어 모양을 명시
//   - initializer: (set, get) => State  형태의 함수
//   - set(partial) 또는 set((prev) => partial) 로 상태를 갱신
//   - 반환값 useDailyLogStore 는 React 훅: useDailyLogStore(selector) 로 구독
interface DailyLogState {
  logs: DailyLog[];
  addLog: (input: NewLogInput) => void;
  addComment: (logId: string, text: string) => void;
  toggleReaction: (logId: string, emoji: string) => void;
}

export const useDailyLogStore = create<DailyLogState>((set) => ({
  logs: mockLogs,

  addLog: (input) =>
    set((state) => ({
      logs: [
        {
          id: `log-${Date.now()}`,
          ownerId: 'me',
          takenAt: new Date().toISOString(),
          comments: [],
          ...input,
        },
        ...state.logs,
      ],
    })),

  addComment: (logId, text) =>
    set((state) => ({
      logs: state.logs.map((l) =>
        l.id === logId
          ? {
              ...l,
              comments: [
                ...l.comments,
                { id: `c-${Date.now()}`, author: '나', text, createdAt: new Date().toISOString() },
              ],
            }
          : l,
      ),
    })),

  // 이모지 반응 토글 (내가 이미 누른 이모지면 취소).
  toggleReaction: (logId, emoji) =>
    set((state) => ({
      logs: state.logs.map((l) => {
        if (l.id !== logId) return l;
        const mine = l.myReactions ?? [];
        const counts = { ...(l.reactions ?? {}) };
        const has = mine.includes(emoji);
        counts[emoji] = Math.max(0, (counts[emoji] ?? 0) + (has ? -1 : 1));
        if (counts[emoji] === 0) delete counts[emoji];
        return {
          ...l,
          reactions: counts,
          myReactions: has ? mine.filter((e) => e !== emoji) : [...mine, emoji],
        };
      }),
    })),
}));
