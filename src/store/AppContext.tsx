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

import {
  initialFriendStatus,
  me as defaultMe,
  mockChatRooms,
  mockLogs,
  mockUsers,
  QUOTA_LIMIT_BYTES,
} from '../data/mockLogs';
import {
  ChatMessage,
  ChatRoom,
  DailyLog,
  Friend,
  FriendStatus,
  User,
  Visibility,
} from '../types';

const STORAGE_KEY = 'daylog.auth.v1';

interface SignupForm {
  email: string;
  studentId: string;
  name: string;
  password: string;
}

interface NewLogInput {
  uri: string;
  mediaType: DailyLog['mediaType'];
  thumbnailUri?: string;
  caption?: string;
  visibility: Visibility;
  sizeBytes: number;
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

  // auth
  login: (emailOrId: string, password: string) => Promise<void>;
  signup: (form: SignupForm) => Promise<void>;
  logout: () => Promise<void>;

  // logs
  addLog: (input: NewLogInput) => void;
  addComment: (logId: string, text: string) => void;

  // chat
  appendMessage: (roomId: string, msg: ChatMessage) => void;

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
  const [logs, setLogs] = useState<DailyLog[]>(mockLogs);
  const [rooms, setRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [friends, setFriends] = useState<Record<string, FriendStatus>>(() => {
    const map: Record<string, FriendStatus> = {};
    for (const u of mockUsers) map[u.id] = initialFriendStatus[u.id] ?? 'none';
    return map;
  });

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

  const addLog = useCallback((input: NewLogInput) => {
    const log: DailyLog = {
      id: `log-${Date.now()}`,
      ownerId: 'me',
      takenAt: new Date().toISOString(),
      comments: [],
      ...input,
    };
    setLogs((prev) => [log, ...prev]);
  }, []);

  const addComment = useCallback((logId: string, text: string) => {
    setLogs((prev) =>
      prev.map((l) =>
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
    );
  }, []);

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

  // ── 친구 ──────────────────────────────────────────
  const setFriendStatus = useCallback((userId: string, status: FriendStatus) => {
    setFriends((prev) => ({ ...prev, [userId]: status }));
  }, []);

  const requestFriend = useCallback(
    (userId: string) => setFriendStatus(userId, 'requested'),
    [setFriendStatus],
  );
  const acceptFriend = useCallback(
    (userId: string) => setFriendStatus(userId, 'friend'),
    [setFriendStatus],
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
    login,
    signup,
    logout,
    addLog,
    addComment,
    appendMessage,
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
