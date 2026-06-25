import { create } from 'zustand';

import { mockChatRooms, mockUsers } from '@/data/mockLogs';

import type { ChatMessage, ChatRoom } from './types';

interface ChatState {
  rooms: ChatRoom[];
  /** 현재 열람 중인 방 id (UI 상태) */
  activeRoomId: string;
  setActiveRoom: (roomId: string) => void;
  appendMessage: (roomId: string, msg: ChatMessage) => void;
  /** 멤버 userId 들로 1:1 또는 그룹 채팅방 생성. 생성된 roomId 반환. */
  createRoom: (memberUserIds: string[]) => string;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: mockChatRooms,
  activeRoomId: mockChatRooms[0]?.id ?? '',
  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

  appendMessage: (roomId, msg) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              messages: [...r.messages, msg],
              lastMessage: msg.text ?? (msg.mediaType === 'video' ? '[동영상]' : '[사진]'),
            }
          : r,
      ),
    })),

  createRoom: (memberUserIds) => {
    const members = mockUsers.filter((u) => memberUserIds.includes(u.id));
    const name =
      members.length <= 1
        ? members[0]?.name ?? '새 채팅'
        : `${members[0].name} 외 ${members.length - 1}명`;
    const id = `room-${Date.now()}`;
    set((state) => ({
      rooms: [{ id, name, lastMessage: '새 채팅방이 생성되었어요', messages: [] }, ...state.rooms],
    }));
    return id;
  },
}));
