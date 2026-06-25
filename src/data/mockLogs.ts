import { AppNotification, ChatRoom, DailyLog, User } from '../types';

// 백엔드(MinIO Presigned URL) 연동 전까지 사용하는 목업 데이터.
// 실제 연동 시 fetchLogsByMonth / searchUsers 등 API 호출로 대체하면 된다.

const sampleVideo =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const sampleVideo2 =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;
const avatar = (seed: string) => `https://i.pravatar.cc/150?u=${seed}`;

function iso(year: number, month: number, day: number, h: number, m: number) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const hh = String(h).padStart(2, '0');
  const min = String(m).padStart(2, '0');
  return `${year}-${mm}-${dd}T${hh}:${min}:00`;
}

const now = new Date();
const Y = now.getFullYear();
const M = now.getMonth() + 1; // 1-12

// ── 유저 ────────────────────────────────────────────
export const me: User = {
  id: 'me',
  email: 'xodbs1758@gmail.com',
  studentId: '20211234',
  name: '나',
  avatarUri: avatar('me'),
  bio: '일상을 기록합니다 ☕️',
};

export const mockUsers: User[] = [
  { id: 'u-1', email: 'boss@univ.ac.kr', studentId: '20180001', name: '부장님', avatarUri: avatar('boss') },
  { id: 'u-2', email: 'dev@univ.ac.kr', studentId: '20190002', name: '개발팀장', avatarUri: avatar('dev') },
  { id: 'u-3', email: 'club@univ.ac.kr', studentId: '20211111', name: '동아리회장', avatarUri: avatar('club') },
  { id: 'u-4', email: 'minji@univ.ac.kr', studentId: '20210123', name: '김민지', avatarUri: avatar('minji') },
  { id: 'u-5', email: 'jihun@univ.ac.kr', studentId: '20200456', name: '이지훈', avatarUri: avatar('jihun') },
  { id: 'u-6', email: 'sora@univ.ac.kr', studentId: '20220789', name: '박소라', avatarUri: avatar('sora') },
];

// 초기 친구 관계: 부장님/개발팀장/동아리회장은 친구, 김민지는 받은 요청(incoming)
export const initialFriendStatus: Record<string, 'friend' | 'incoming'> = {
  'u-1': 'friend',
  'u-2': 'friend',
  'u-3': 'friend',
  'u-4': 'incoming',
};

// ── 로그 ────────────────────────────────────────────
const KB = 1024;
const MB = 1024 * KB;

type RawLog = Omit<DailyLog, 'sizeBytes'> & { sizeBytes?: number };

const rawLogs: RawLog[] = [
  {
    id: 'log-1',
    ownerId: 'me',
    takenAt: iso(Y, M, 2, 9, 12),
    mediaType: 'image',
    uri: img('coffee'),
    caption: '아침 커피 한 잔',
    visibility: 'friends',
    comments: [
      { id: 'c1', author: '부장님', text: '좋은 아침!', createdAt: iso(Y, M, 2, 9, 30) },
    ],
  },
  {
    id: 'log-2',
    ownerId: 'me',
    takenAt: iso(Y, M, 5, 18, 45),
    mediaType: 'video',
    uri: sampleVideo,
    thumbnailUri: img('sunset'),
    caption: '퇴근길 노을',
    visibility: 'public',
    comments: [],
    sizeBytes: 8 * MB,
  },
  {
    id: 'log-3',
    ownerId: 'me',
    takenAt: iso(Y, M, 9, 13, 5),
    mediaType: 'image',
    uri: img('lunch'),
    caption: '점심 먹고 와요',
    visibility: 'friends',
    comments: [],
  },
  {
    id: 'log-4',
    ownerId: 'me',
    takenAt: iso(Y, M, 14, 21, 30),
    mediaType: 'video',
    uri: sampleVideo2,
    thumbnailUri: img('night'),
    caption: '야경 드라이브',
    visibility: 'private',
    comments: [],
    sizeBytes: 12 * MB,
  },
  {
    id: 'log-5',
    ownerId: 'me',
    takenAt: iso(Y, M, 17, 11, 0),
    mediaType: 'image',
    uri: img('mountain'),
    caption: '주말 등산',
    visibility: 'public',
    comments: [],
  },
  {
    id: 'log-6',
    ownerId: 'me',
    takenAt: iso(Y, M, 21, 8, 20),
    mediaType: 'image',
    uri: img('flower'),
    caption: '출근길 꽃',
    visibility: 'friends',
    comments: [],
  },
  {
    id: 'log-7',
    ownerId: 'me',
    takenAt: iso(Y, M, 24, 19, 15),
    mediaType: 'video',
    uri: sampleVideo,
    thumbnailUri: img('dinner'),
    caption: '저녁 모임',
    visibility: 'friends',
    comments: [],
    sizeBytes: 6 * MB,
  },
  {
    id: 'log-8',
    ownerId: 'me',
    takenAt: iso(Y, M, 28, 16, 40),
    mediaType: 'image',
    uri: img('cat'),
    caption: '낮잠 자는 고양이',
    visibility: 'public',
    comments: [],
  },
];

// sizeBytes 기본값(이미지 ~1.5MB) 주입
export const mockLogs: DailyLog[] = rawLogs.map((l) => ({
  ...l,
  sizeBytes: l.sizeBytes ?? Math.round(1.5 * MB),
}));

// ── 채팅 ────────────────────────────────────────────
export const mockChatRooms: ChatRoom[] = [
  {
    id: 'room-1',
    name: '부장님',
    lastMessage: '점심 먹고 와요',
    messages: [
      { id: 'm1', text: '오늘 점심 같이 할까?', mine: false },
      { id: 'm2', text: '좋아요!', mine: true },
      { id: 'm3', text: '점심 먹고 와요', mine: false },
    ],
  },
  {
    id: 'room-2',
    name: '개발팀',
    lastMessage: '죄송합니다..',
    messages: [
      { id: 'm1', text: '배포 언제 되나요?', mine: false },
      { id: 'm2', text: '곧 올리겠습니다', mine: true },
      { id: 'm3', text: '버그 하나 더 나왔어요', mine: false },
      { id: 'm4', text: '죄송합니다..', mine: true },
    ],
  },
  {
    id: 'room-3',
    name: '동아리방',
    lastMessage: '오늘 모임 인증!',
    messages: [
      { id: 'm1', text: '다들 어디쯤?', mine: true },
      { id: 'm2', text: '거의 도착!', mine: false },
      { id: 'm3', text: '오늘 모임 인증!', mine: false },
    ],
  },
];

// ── 알림 ────────────────────────────────────────────
// 실제로는 FCM / Web Push 로 수신한 알림. 여기선 목업.
export const mockNotifications: AppNotification[] = [
  {
    id: 'n-1',
    type: 'comment',
    title: '새 댓글',
    body: '부장님님이 "아침 커피 한 잔"에 댓글을 남겼어요.',
    createdAt: iso(Y, M, 2, 9, 30),
    read: false,
  },
  {
    id: 'n-2',
    type: 'friend',
    title: '친구 요청',
    body: '김민지님이 친구 요청을 보냈어요.',
    createdAt: iso(Y, M, 1, 20, 12),
    read: false,
  },
  {
    id: 'n-3',
    type: 'chat',
    title: '동아리방',
    body: '오늘 모임 인증!',
    createdAt: iso(Y, M, 1, 18, 5),
    read: true,
  },
  {
    id: 'n-4',
    type: 'system',
    title: '스토리지 안내',
    body: '저사양 서버 정책에 따라 업로드 전 자동 압축이 적용됩니다.',
    createdAt: iso(Y, M, 1, 9, 0),
    read: true,
  },
];

// 스토리지 쿼터(유저별 할당량). 저사양 온프레미스 정책 반영.
export const QUOTA_LIMIT_BYTES = 200 * MB;
