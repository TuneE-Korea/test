import { ChatRoom, DailyLog } from '../types';

// 백엔드(MinIO Presigned URL) 연동 전까지 사용하는 목업 데이터.
// 실제 연동 시 fetchLogsByMonth(year, month) 같은 API 호출로 대체하면 된다.

const sampleVideo =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const sampleVideo2 =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

function iso(year: number, month: number, day: number, h: number, m: number) {
  // month: 1-12
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const hh = String(h).padStart(2, '0');
  const min = String(m).padStart(2, '0');
  return `${year}-${mm}-${dd}T${hh}:${min}:00`;
}

const now = new Date();
const Y = now.getFullYear();
const M = now.getMonth() + 1; // 1-12

export const mockLogs: DailyLog[] = [
  {
    id: 'log-1',
    takenAt: iso(Y, M, 2, 9, 12),
    mediaType: 'image',
    uri: img('coffee'),
    caption: '아침 커피 한 잔',
    visibility: 'friends',
    comments: [
      {
        id: 'c1',
        author: '부장님',
        text: '좋은 아침!',
        createdAt: iso(Y, M, 2, 9, 30),
      },
    ],
  },
  {
    id: 'log-2',
    takenAt: iso(Y, M, 5, 18, 45),
    mediaType: 'video',
    uri: sampleVideo,
    thumbnailUri: img('sunset'),
    caption: '퇴근길 노을',
    visibility: 'public',
    comments: [],
  },
  {
    id: 'log-3',
    takenAt: iso(Y, M, 9, 13, 5),
    mediaType: 'image',
    uri: img('lunch'),
    caption: '점심 먹고 와요',
    visibility: 'friends',
    comments: [],
  },
  {
    id: 'log-4',
    takenAt: iso(Y, M, 14, 21, 30),
    mediaType: 'video',
    uri: sampleVideo2,
    thumbnailUri: img('night'),
    caption: '야경 드라이브',
    visibility: 'private',
    comments: [],
  },
  {
    id: 'log-5',
    takenAt: iso(Y, M, 17, 11, 0),
    mediaType: 'image',
    uri: img('mountain'),
    caption: '주말 등산',
    visibility: 'public',
    comments: [],
  },
  {
    id: 'log-6',
    takenAt: iso(Y, M, 21, 8, 20),
    mediaType: 'image',
    uri: img('flower'),
    caption: '출근길 꽃',
    visibility: 'friends',
    comments: [],
  },
  {
    id: 'log-7',
    takenAt: iso(Y, M, 24, 19, 15),
    mediaType: 'video',
    uri: sampleVideo,
    thumbnailUri: img('dinner'),
    caption: '저녁 모임',
    visibility: 'friends',
    comments: [],
  },
  {
    id: 'log-8',
    takenAt: iso(Y, M, 28, 16, 40),
    mediaType: 'image',
    uri: img('cat'),
    caption: '낮잠 자는 고양이',
    visibility: 'public',
    comments: [],
  },
];

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
