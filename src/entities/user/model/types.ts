// "유저" 도메인 타입.
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
