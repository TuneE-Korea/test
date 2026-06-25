import { create } from 'zustand';

import { initialFriendStatus, mockUsers } from '@/data/mockLogs';

import type { Friend, FriendStatus, User } from './types';

// "유저 + 친구관계" 도메인 상태.
// 주의: 액션은 순수하게 상태만 바꾼다. (예: 친구 수락 시 알림 생성 같은 부수효과는
//       feature 레이어가 이 액션 + notification 스토어를 함께 호출해 처리한다.)
interface UserState {
  users: User[];
  friends: Record<string, FriendStatus>;
  setFriendStatus: (userId: string, status: FriendStatus) => void;
  friendList: () => Friend[];
  incomingRequests: () => Friend[];
  searchUsers: (q: string) => Friend[];
}

const initialFriends: Record<string, FriendStatus> = {};
for (const u of mockUsers) initialFriends[u.id] = initialFriendStatus[u.id] ?? 'none';

export const useUserStore = create<UserState>((set, get) => ({
  users: mockUsers,
  friends: initialFriends,

  setFriendStatus: (userId, status) =>
    set((state) => ({ friends: { ...state.friends, [userId]: status } })),

  // get() 으로 현재 상태를 읽어 파생 목록을 만든다(셀렉터 메서드).
  friendList: () =>
    get()
      .users.filter((u) => get().friends[u.id] === 'friend')
      .map((u) => ({ user: u, status: 'friend' as FriendStatus })),

  incomingRequests: () =>
    get()
      .users.filter((u) => get().friends[u.id] === 'incoming')
      .map((u) => ({ user: u, status: 'incoming' as FriendStatus })),

  searchUsers: (q) => {
    const term = q.trim().toLowerCase();
    const { users, friends } = get();
    return users
      .filter(
        (u) =>
          !term ||
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.studentId ?? '').includes(term),
      )
      .map((u) => ({ user: u, status: friends[u.id] ?? 'none' }));
  },
}));
