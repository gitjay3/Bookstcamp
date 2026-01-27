import { describe, it, expect } from 'vitest';
import { SLOT_FIELD_ORDER, sortSlotFields, getFieldPriority } from './slot-field';

describe('slot-field constants', () => {
  describe('SLOT_FIELD_ORDER', () => {
    it('content가 첫 번째 순서이다', () => {
      expect(SLOT_FIELD_ORDER[0]).toBe('content');
    });

    it('시간 관련 필드가 날짜 이후에 온다', () => {
      const dateIndex = SLOT_FIELD_ORDER.indexOf('eventDate');
      const startTimeIndex = SLOT_FIELD_ORDER.indexOf('startTime');
      const endTimeIndex = SLOT_FIELD_ORDER.indexOf('endTime');

      expect(startTimeIndex).toBeGreaterThan(dateIndex);
      expect(endTimeIndex).toBeGreaterThan(startTimeIndex);
    });

    it('멘토 관련 필드가 마지막에 온다', () => {
      const mentorIndex = SLOT_FIELD_ORDER.indexOf('mentor');
      const mentorNameIndex = SLOT_FIELD_ORDER.indexOf('mentorName');
      const locationIndex = SLOT_FIELD_ORDER.indexOf('location');

      expect(mentorIndex).toBeGreaterThan(locationIndex);
      expect(mentorNameIndex).toBeGreaterThan(locationIndex);
    });
  });

  describe('sortSlotFields', () => {
    it('SLOT_FIELD_ORDER 순서대로 정렬한다', () => {
      const fields = [
        { id: 'mentorName', name: '멘토명' },
        { id: 'content', name: '내용' },
        { id: 'startTime', name: '시작 시간' },
      ];

      const sorted = sortSlotFields(fields);

      expect(sorted.map((f) => f.id)).toEqual(['content', 'startTime', 'mentorName']);
    });

    it('정의되지 않은 필드는 맨 뒤로 배치한다', () => {
      const fields = [
        { id: 'customField', name: '커스텀' },
        { id: 'content', name: '내용' },
        { id: 'unknownField', name: '알수없음' },
      ];

      const sorted = sortSlotFields(fields);

      expect(sorted[0].id).toBe('content');
      expect(['customField', 'unknownField']).toContain(sorted[1].id);
      expect(['customField', 'unknownField']).toContain(sorted[2].id);
    });

    it('빈 배열을 처리한다', () => {
      const sorted = sortSlotFields([]);
      expect(sorted).toEqual([]);
    });

    it('원본 배열을 변경하지 않는다', () => {
      const original = [
        { id: 'mentorName', name: '멘토명' },
        { id: 'content', name: '내용' },
      ];
      const originalCopy = [...original];

      sortSlotFields(original);

      expect(original).toEqual(originalCopy);
    });

    it('대체 id 스타일(place, mentor)도 올바르게 정렬한다', () => {
      const fields = [
        { id: 'mentor', name: '멘토' },
        { id: 'place', name: '장소' },
        { id: 'date', name: '날짜' },
      ];

      const sorted = sortSlotFields(fields);

      expect(sorted.map((f) => f.id)).toEqual(['date', 'place', 'mentor']);
    });
  });

  describe('getFieldPriority', () => {
    it('content는 우선순위 1이다', () => {
      expect(getFieldPriority('content')).toBe(1);
    });

    it('startTime은 eventDate보다 높은 우선순위 값을 갖는다', () => {
      const eventDatePriority = getFieldPriority('eventDate');
      const startTimePriority = getFieldPriority('startTime');

      expect(startTimePriority).toBeGreaterThan(eventDatePriority);
    });

    it('정의되지 않은 필드는 100을 반환한다', () => {
      expect(getFieldPriority('unknownField')).toBe(100);
      expect(getFieldPriority('customField')).toBe(100);
    });

    it('모든 정의된 필드는 100 미만의 우선순위를 갖는다', () => {
      SLOT_FIELD_ORDER.forEach((fieldId) => {
        expect(getFieldPriority(fieldId)).toBeLessThan(100);
      });
    });
  });
});
