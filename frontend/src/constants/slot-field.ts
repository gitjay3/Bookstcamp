/**
 * 슬롯 필드 정렬 순서 상수
 *
 * 이벤트 슬롯의 extraInfo 필드들을 일관된 순서로 표시하기 위한 공통 상수입니다.
 * 사용처: CamperMyPage, SlotList, SlotEditModal
 */
export const SLOT_FIELD_ORDER = [
  'content',      // 내용
  'date',         // 날짜 (대체 id)
  'eventDate',    // 행사 날짜
  'startTime',    // 시작 시간
  'endTime',      // 종료 시간
  'location',     // 장소
  'place',        // 장소 (대체 id)
  'mentor',       // 멘토명 (대체 id)
  'mentorName',   // 멘토명
] as const;

export type SlotFieldId = typeof SLOT_FIELD_ORDER[number];

/**
 * 슬롯 필드를 정렬하는 유틸리티 함수
 * SLOT_FIELD_ORDER에 정의된 순서대로 정렬하고, 정의되지 않은 필드는 맨 뒤로 배치
 */
export function sortSlotFields<T extends { id: string }>(fields: T[]): T[] {
  return [...fields].sort((a, b) => {
    const indexA = SLOT_FIELD_ORDER.indexOf(a.id as SlotFieldId);
    const indexB = SLOT_FIELD_ORDER.indexOf(b.id as SlotFieldId);
    const orderA = indexA === -1 ? SLOT_FIELD_ORDER.length : indexA;
    const orderB = indexB === -1 ? SLOT_FIELD_ORDER.length : indexB;
    return orderA - orderB;
  });
}

/**
 * 필드 ID의 정렬 우선순위를 반환 (낮을수록 먼저 표시)
 * 정의되지 않은 필드는 높은 값(100) 반환
 */
export function getFieldPriority(fieldId: string): number {
  const index = SLOT_FIELD_ORDER.indexOf(fieldId as SlotFieldId);
  return index === -1 ? 100 : index + 1;
}
