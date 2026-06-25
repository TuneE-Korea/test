import type { MediaType } from '@/shared/lib';

export interface ChatMessage {
  id: string;
  text?: string;
  /** 공유된 미디어(이미지 또는 동영상 썸네일) URL */
  imageUri?: string;
  mediaType?: MediaType;
  /** 내가 보낸 메시지인지 (말풍선 좌/우 정렬) */
  mine: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  messages: ChatMessage[];
}
