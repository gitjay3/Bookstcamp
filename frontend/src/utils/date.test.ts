import { describe, it, expect } from 'vitest';
import toISODateTime from './date';

describe('toISODateTime', () => {
  it('유효한 날짜와 시간을 ISO 문자열로 변환한다', () => {
    const result = toISODateTime('2024-01-15', '10:30');
    expect(result).toBe(new Date('2024-01-15T10:30:00').toISOString());
  });

  it('date가 없으면 null을 반환한다', () => {
    expect(toISODateTime(undefined, '10:30')).toBeNull();
    expect(toISODateTime('', '10:30')).toBeNull();
  });

  it('time이 없으면 null을 반환한다', () => {
    expect(toISODateTime('2024-01-15', undefined)).toBeNull();
    expect(toISODateTime('2024-01-15', '')).toBeNull();
  });

  it('둘 다 없으면 null을 반환한다', () => {
    expect(toISODateTime(undefined, undefined)).toBeNull();
    expect(toISODateTime('', '')).toBeNull();
  });

  it('유효하지 않은 날짜 형식이면 null을 반환한다', () => {
    expect(toISODateTime('invalid-date', '10:30')).toBeNull();
  });

  it('유효하지 않은 시간 형식이면 null을 반환한다', () => {
    expect(toISODateTime('2024-01-15', 'invalid')).toBeNull();
  });

  it('자정 시간을 처리한다', () => {
    const result = toISODateTime('2024-01-15', '00:00');
    expect(result).toBe(new Date('2024-01-15T00:00:00').toISOString());
  });

  it('23:59 시간을 처리한다', () => {
    const result = toISODateTime('2024-01-15', '23:59');
    expect(result).toBe(new Date('2024-01-15T23:59:00').toISOString());
  });
});
