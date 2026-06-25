export type MediaType = 'image' | 'video';

export interface LogComment {
  id: string;
  author: string;
  text: string;
  createdAt: string; // ISO
}

// 하나의 "일상 로그". 캘린더의 한 셀에 매핑된다.
export interface DailyLog {
  id: string;
  /** 게시된 시각 (ISO). 캘린더 배치 및 "YYYY년 MM월 DD일 HH시 mm분" 표기에 사용 */
  takenAt: string;
  mediaType: MediaType;
  /** 이미지 또는 동영상 원본 URL */
  uri: string;
  /** 동영상 썸네일(포스터) URL. 없으면 첫 프레임을 사용 */
  thumbnailUri?: string;
  caption?: string;
  visibility: 'public' | 'friends' | 'private';
  comments: LogComment[];
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
