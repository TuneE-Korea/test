import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { me as defaultMe } from '@/data/mockLogs';
// 교차 참조: 세션은 "현재 유저"를 다루므로 user 엔티티의 User 타입을 사용한다.
// (엄격 FSD 에서는 @x 크로스임포트 API 를 쓰지만, 학습 단계에선 타입 재사용으로 단순화)
import type { User } from '@/entities/user';

const STORAGE_KEY = 'daylog.auth.v1';

export interface SignupForm {
  email: string;
  studentId: string;
  name: string;
  password: string;
}

interface SessionState {
  booting: boolean;
  currentUser: User | null;
  restore: () => Promise<void>;
  login: (emailOrId: string, password: string) => Promise<void>;
  signup: (form: SignupForm) => Promise<void>;
  logout: () => Promise<void>;
}

// 저장소에 세션(JWT 흉내)을 보관/복원하는 헬퍼
async function persist(user: User | null) {
  try {
    if (user) {
      const token = `mock.jwt.${user.id}.${Date.now()}`;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export const useSessionStore = create<SessionState>((set) => ({
  booting: true,
  currentUser: null,

  // 앱 시작 시 1회 호출: 저장된 세션 복원
  restore: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ currentUser: JSON.parse(raw).user as User });
    } catch {
      // ignore
    } finally {
      set({ booting: false });
    }
  },

  login: async (emailOrId, _password) => {
    // 목업: 입력 식별자로 기존 me 프로필 로드(비밀번호 미검증)
    const user: User = {
      ...defaultMe,
      email: emailOrId.includes('@') ? emailOrId : defaultMe.email,
      studentId: emailOrId.includes('@') ? defaultMe.studentId : emailOrId,
    };
    set({ currentUser: user });
    await persist(user);
  },

  signup: async (form) => {
    const user: User = {
      ...defaultMe,
      email: form.email,
      studentId: form.studentId,
      name: form.name || defaultMe.name,
    };
    set({ currentUser: user });
    await persist(user);
  },

  logout: async () => {
    set({ currentUser: null });
    await persist(null);
  },
}));
