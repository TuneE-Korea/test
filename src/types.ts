// [마이그레이션 shim] 모든 도메인 타입은 각 entity 로 이동했다.
// 아직 '../types' 를 import 하는 기존 코드 호환을 위해 재노출한다.
export type { MediaType } from '@/shared/lib';
export type { Visibility, LogComment, DailyLog } from '@/entities/daily-log';
// 값(런타임) 재노출은 store 를 끌고 오는 순환을 피하려 deep 경로를 쓴다
export { REACTION_EMOJIS } from '@/entities/daily-log/model/types';
export type { User, Friend, FriendStatus } from '@/entities/user';
export type { ChatMessage, ChatRoom } from '@/entities/chat-room';
export type { AppNotification, NotificationType } from '@/entities/notification';
