// 'image' | 'video' 는 특정 도메인(로그·채팅) 어디에도 속하지 않는 범용 미디어 구분.
// 여러 entity 가 공유하므로 shared 에 둔다. (entity 끼리 서로 import 하지 않기 위함)
export type MediaType = 'image' | 'video';
