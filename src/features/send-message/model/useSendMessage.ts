import { useState } from 'react';

import { useChatStore } from '@/entities/chat-room';

const REPLIES = ['오 좋다!', 'ㅋㅋㅋ 인정', '와 대박', '나도 가고 싶다', '👍'];

/**
 * 메시지 전송 + 실시간 흉내(상대 "입력 중…" 후 자동 응답) 훅.
 * 반환: { send(roomId, text), typingRoomId }
 */
export function useSendMessage() {
  const appendMessage = useChatStore((s) => s.appendMessage);
  const [typingRoomId, setTypingRoomId] = useState<string | null>(null);

  const send = (roomId: string, text: string) => {
    appendMessage(roomId, { id: `m-${Date.now()}`, text, mine: true });
    setTypingRoomId(roomId);
    setTimeout(() => {
      setTypingRoomId((cur) => (cur === roomId ? null : cur));
      appendMessage(roomId, {
        id: `m-${Date.now()}-r`,
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
        mine: false,
      });
    }, 1500);
  };

  return { send, typingRoomId };
}
