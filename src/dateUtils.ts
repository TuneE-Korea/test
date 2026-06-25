// 외부 라이브러리 없이 캘린더 그리드를 구성하기 위한 최소 날짜 유틸.
// (date-fns / dayjs 로 교체 가능하나, 의존성 최소화를 위해 직접 작성)

export const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

export function daysInMonth(year: number, month0: number) {
  // month0: 0-11
  return new Date(year, month0 + 1, 0).getDate();
}

export function firstWeekday(year: number, month0: number) {
  return new Date(year, month0, 1).getDay(); // 0(일)~6(토)
}

/** 해당 월의 캘린더 셀 배열. 앞쪽 빈칸은 null. */
export function buildMonthMatrix(year: number, month0: number): (number | null)[] {
  const total = daysInMonth(year, month0);
  const offset = firstWeekday(year, month0);
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  // 마지막 줄을 7칸으로 맞춤
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** "YYYY년 MM월 DD일 HH시 mm분" 형식 (요구사항 표기) */
export function formatKoreanTimestamp(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${y}년 ${mo}월 ${da}일 ${h}시 ${mi}분`;
}

export function sameYMD(iso: string, year: number, month0: number, day: number) {
  const d = new Date(iso);
  return d.getFullYear() === year && d.getMonth() === month0 && d.getDate() === day;
}

export function isToday(year: number, month0: number, day: number) {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month0 && t.getDate() === day;
}

/** byte 를 사람이 읽기 쉬운 단위로 (예: 12.3MB) */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)}KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)}MB`;
  return `${(mb / 1024).toFixed(2)}GB`;
}
