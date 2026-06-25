// [마이그레이션 진행 중]
// - MediaType 은 shared/lib 로 이동
// - 일상 로그 관련 타입(Visibility/LogComment/DailyLog/REACTION_EMOJIS)은 entities/daily-log 로 이동
// 아래는 호환을 위한 재노출 + 아직 옮기지 않은 타입(User/Chat/Notification)들.
import type { MediaType } from '@/shared/lib';

export type { MediaType } from '@/shared/lib';
export type { Visibility, LogComment, DailyLog } from '@/entities/daily-log';
export { REACTION_EMOJIS } from '@/entities/daily-log';

export interface User {
  id: string;
  /** 이메일 또는 학번 기반 로그인 식별자 */
  email: string;
  studentId?: string;
  name: string;
  avatarUri?: string;
  bio?: string;
}

export type FriendStatus = 'none' | 'requested' | 'incoming' | 'friend';

export interface Friend {
  user: User;
  status: FriendStatus;
}

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

export type NotificationType = 'comment' | 'friend' | 'chat' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string; // ISO
  read: boolean;
}
