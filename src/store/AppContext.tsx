import { createContext, ReactNode, useCallback, useContext, useEffect } from 'react';

import { useChatStore, type ChatMessage, type ChatRoom } from '@/entities/chat-room';
import {
  useDailyLogStore,
  type DailyLog,
  type NewLogInput,
} from '@/entities/daily-log';
import { useNotificationStore, type AppNotification } from '@/entities/notification';
import { useSessionStore, type SignupForm } from '@/entities/session';
import { useUserStore, type Friend, type FriendStatus, type User } from '@/entities/user';

import { QUOTA_LIMIT_BYTES } from '../data/mockLogs';

// [마이그레이션 중] AppContext 는 이제 상태를 직접 들지 않고,
// 도메인별 zustand 스토어를 모아 기존 useApp() 모양으로 노출하는 facade 일 뿐이다.
// 화면들이 점차 스토어를 직접 쓰도록 옮겨가면 이 파일은 사라진다.

interface AppState {
  booting: boolean;
  currentUser: User | null;
  isAuthed: boolean;

  logs: DailyLog[];
  rooms: ChatRoom[];
  users: User[];
  friends: Record<string, FriendStatus>;

  quotaUsed: number;
  quotaLimit: number;

  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;

  login: (emailOrId: string, password: string) => Promise<void>;
  signup: (form: SignupForm) => Promise<void>;
  logout: () => Promise<void>;

  addLog: (input: NewLogInput) => void;
  addComment: (logId: string, text: string) => void;
  toggleReaction: (logId: string, emoji: string) => void;

  appendMessage: (roomId: string, msg: ChatMessage) => void;
  createRoom: (memberUserIds: string[]) => string;

  friendList: Friend[];
  incomingRequests: Friend[];
  searchUsers: (q: string) => Friend[];
  requestFriend: (userId: string) => void;
  acceptFriend: (userId: string) => void;
  removeFriend: (userId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // session
  const booting = useSessionStore((s) => s.booting);
  const currentUser = useSessionStore((s) => s.currentUser);
  const login = useSessionStore((s) => s.login);
  const signup = useSessionStore((s) => s.signup);
  const logout = useSessionStore((s) => s.logout);
  const restore = useSessionStore((s) => s.restore);

  // daily-log
  const logs = useDailyLogStore((s) => s.logs);
  const addLog = useDailyLogStore((s) => s.addLog);
  const addComment = useDailyLogStore((s) => s.addComment);
  const toggleReaction = useDailyLogStore((s) => s.toggleReaction);

  // chat
  const rooms = useChatStore((s) => s.rooms);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const createRoom = useChatStore((s) => s.createRoom);

  // user / friends
  const users = useUserStore((s) => s.users);
  const friends = useUserStore((s) => s.friends);
  const setFriendStatus = useUserStore((s) => s.setFriendStatus);

  // notification
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const pushNotification = useNotificationStore((s) => s.push);

  // 앱 시작 시 세션 복원
  useEffect(() => {
    restore();
  }, [restore]);

  // 파생값 (friends/logs 가 바뀌면 facade 가 리렌더되어 재계산)
  const friendList = useUserStore.getState().friendList();
  const incomingRequests = useUserStore.getState().incomingRequests();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const quotaUsed = logs
    .filter((l) => l.ownerId === 'me')
    .reduce((sum, l) => sum + l.sizeBytes, 0);

  // searchUsers 는 friends 가 바뀔 때 참조가 갱신되도록 의존성에 friends 를 넣는다
  const searchUsers = useCallback(
    (q: string) => useUserStore.getState().searchUsers(q),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [friends],
  );

  const requestFriend = useCallback(
    (userId: string) => setFriendStatus(userId, 'requested'),
    [setFriendStatus],
  );
  const acceptFriend = useCallback(
    (userId: string) => {
      setFriendStatus(userId, 'friend');
      const u = users.find((x) => x.id === userId);
      if (u) pushNotification('friend', '친구 추가됨', `${u.name}님과 친구가 되었어요.`);
    },
    [setFriendStatus, users, pushNotification],
  );
  const removeFriend = useCallback(
    (userId: string) => setFriendStatus(userId, 'none'),
    [setFriendStatus],
  );

  const value: AppState = {
    booting,
    currentUser,
    isAuthed: !!currentUser,
    logs,
    rooms,
    users,
    friends,
    quotaUsed,
    quotaLimit: QUOTA_LIMIT_BYTES,
    notifications,
    unreadCount,
    markAllRead,
    login,
    signup,
    logout,
    addLog,
    addComment,
    toggleReaction,
    appendMessage,
    createRoom,
    friendList,
    incomingRequests,
    searchUsers,
    requestFriend,
    acceptFriend,
    removeFriend,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
