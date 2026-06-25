import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { DailyLog, NewLogInput, useDailyLogStore } from '@/entities/daily-log';

import {
  initialFriendStatus,
  me as defaultMe,
  mockChatRooms,
  mockNotifications,
  mockUsers,
  QUOTA_LIMIT_BYTES,
} from '../data/mockLogs';
import {
  AppNotification,
  ChatMessage,
  ChatRoom,
  Friend,
  FriendStatus,
  NotificationType,
  User,
} from '../types';

const STORAGE_KEY = 'daylog.auth.v1';

interface SignupForm {
  email: string;
  studentId: string;
  name: string;
  password: string;
}

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

  // auth
  login: (emailOrId: string, password: string) => Promise<void>;
  signup: (form: SignupForm) => Promise<void>;
  logout: () => Promise<void>;

  // logs
  addLog: (input: NewLogInput) => void;
  addComment: (logId: string, text: string) => void;
  toggleReaction: (logId: string, emoji: string) => void;

  // chat
  appendMessage: (roomId: string, msg: ChatMessage) => void;
  createRoom: (memberUserIds: string[]) => string;

  // friends
  friendList: Friend[];
  incomingRequests: Friend[];
  searchUsers: (q: string) => Friend[];
  requestFriend: (userId: string) => void;
  acceptFriend: (userId: string) => void;
  removeFriend: (userId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // 로그 상태/액션은 entities/daily-log 의 zustand 스토어가 단일 소스로 보유한다.
  const logs = useDailyLogStore((s) => s.logs);
  const addLog = useDailyLogStore((s) => s.addLog);
  const addComment = useDailyLogStore((s) => s.addComment);
  const toggleReaction = useDailyLogStore((s) => s.toggleReaction);
  const [rooms, setRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [friends, setFriends] = useState<Record<string, FriendStatus>>(() => {
    const map: Record<string, FriendStatus> = {};
    for (const u of mockUsers) map[u.id] = initialFriendStatus[u.id] ?? 'none';
    return map;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);

  // 로컬 알림 생성 (실제로는 FCM/Web Push 수신). 새 활동을 알림에 반영.
  const pushNotification = useCallback(
    (type: NotificationType, title: string, body: string) => {
      setNotifications((prev) => [
        { id: `n-${Date.now()}`, type, title, body, createdAt: new Date().toISOString(), read: false },
        ...prev,
      ]);
    },
    [],
  );

  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  );

  // 부팅 시 저장된 세션 복원 (JWT 토큰 보관 흉내)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setCurrentUser(JSON.parse(raw).user as User);
      } catch {
        // ignore
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const persist = useCallback(async (user: User | null) => {
    try {
      if (user) {
        // 실제로는 서버가 발급한 JWT 를 저장. 여기선 목업 토큰.
        const token = `mock.jwt.${user.id}.${Date.now()}`;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(
    async (emailOrId: string, _password: string) => {
      // 목업: 입력한 식별자로 기존 me 프로필을 로드(데모용, 비밀번호 미검증)
      const user: User = {
        ...defaultMe,
        email: emailOrId.includes('@') ? emailOrId : defaultMe.email,
        studentId: emailOrId.includes('@') ? defaultMe.studentId : emailOrId,
      };
      setCurrentUser(user);
      await persist(user);
    },
    [persist],
  );

  const signup = useCallback(
    async (form: SignupForm) => {
      const user: User = {
        ...defaultMe,
        email: form.email,
        studentId: form.studentId,
        name: form.name || defaultMe.name,
      };
      setCurrentUser(user);
      await persist(user);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    setCurrentUser(null);
    await persist(null);
  }, [persist]);

  const appendMessage = useCallback((roomId: string, msg: ChatMessage) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              messages: [...r.messages, msg],
              lastMessage: msg.text ?? (msg.mediaType === 'video' ? '[동영상]' : '[사진]'),
            }
          : r,
      ),
    );
  }, []);

  // 1:1 또는 그룹 채팅방 생성. 멤버 이름으로 방 이름 구성.
  const createRoom = useCallback((memberUserIds: string[]): string => {
    const members = mockUsers.filter((u) => memberUserIds.includes(u.id));
    const name =
      members.length <= 1
        ? members[0]?.name ?? '새 채팅'
        : `${members[0].name} 외 ${members.length - 1}명`;
    const id = `room-${Date.now()}`;
    setRooms((prev) => [{ id, name, lastMessage: '새 채팅방이 생성되었어요', messages: [] }, ...prev]);
    return id;
  }, []);

  // ── 친구 ──────────────────────────────────────────
  const setFriendStatus = useCallback((userId: string, status: FriendStatus) => {
    setFriends((prev) => ({ ...prev, [userId]: status }));
  }, []);

  const requestFriend = useCallback(
    (userId: string) => setFriendStatus(userId, 'requested'),
    [setFriendStatus],
  );
  const acceptFriend = useCallback(
    (userId: string) => {
      setFriendStatus(userId, 'friend');
      const u = mockUsers.find((x) => x.id === userId);
      if (u) pushNotification('friend', '친구 추가됨', `${u.name}님과 친구가 되었어요.`);
    },
    [setFriendStatus, pushNotification],
  );
  const removeFriend = useCallback(
    (userId: string) => setFriendStatus(userId, 'none'),
    [setFriendStatus],
  );

  const friendList = useMemo<Friend[]>(
    () =>
      mockUsers
        .filter((u) => friends[u.id] === 'friend')
        .map((u) => ({ user: u, status: 'friend' as FriendStatus })),
    [friends],
  );

  const incomingRequests = useMemo<Friend[]>(
    () =>
      mockUsers
        .filter((u) => friends[u.id] === 'incoming')
        .map((u) => ({ user: u, status: 'incoming' as FriendStatus })),
    [friends],
  );

  const searchUsers = useCallback(
    (q: string): Friend[] => {
      const term = q.trim().toLowerCase();
      return mockUsers
        .filter(
          (u) =>
            !term ||
            u.name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            (u.studentId ?? '').includes(term),
        )
        .map((u) => ({ user: u, status: friends[u.id] ?? 'none' }));
    },
    [friends],
  );

  const quotaUsed = useMemo(
    () => logs.filter((l) => l.ownerId === 'me').reduce((sum, l) => sum + l.sizeBytes, 0),
    [logs],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value: AppState = {
    booting,
    currentUser,
    isAuthed: !!currentUser,
    logs,
    rooms,
    users: mockUsers,
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
