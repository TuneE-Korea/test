import type { MediaType } from '@/shared/lib';

// "일상 로그" 도메인의 타입 정의. 이 entity 의 model 세그먼트에 둔다.

export type Visibility = 'public' | 'friends' | 'private';

export interface LogComment {
  id: string;
  author: string;
  text: string;
  createdAt: string; // ISO
}

/** 하나의 "일상 로그". 캘린더의 한 셀에 매핑된다. */
export interface DailyLog {
  id: string;
  ownerId: string;
  /** 게시된 시각 (ISO). 캘린더 배치 및 "YYYY년 MM월 DD일 HH시 mm분" 표기에 사용 */
  takenAt: string;
  mediaType: MediaType;
  uri: string;
  thumbnailUri?: string;
  caption?: string;
  visibility: Visibility;
  /** 클라이언트 압축 후 추정 용량(byte). 스토리지 쿼터 합산에 사용 */
  sizeBytes: number;
  comments: LogComment[];
  /** 이모지 반응. 키=이모지, 값=누른 사람 수 */
  reactions?: Record<string, number>;
  /** 내가 누른 이모지 목록 */
  myReactions?: string[];
}

/** 새 로그 작성 입력값 (업로드 기능이 넘겨줌) */
export interface NewLogInput {
  uri: string;
  mediaType: MediaType;
  thumbnailUri?: string;
  caption?: string;
  visibility: Visibility;
  sizeBytes: number;
}

/** 반응 패널에 노출할 이모지 후보 */
export const REACTION_EMOJIS = ['❤️', '😂', '👍', '🎉'] as const;
