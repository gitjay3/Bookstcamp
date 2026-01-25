import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import calcStatus from './calcStatus';

describe('calcStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('시작 시간 전이면 UPCOMING을 반환한다', () => {
    const now = new Date('2024-01-15T10:00:00');
    vi.setSystemTime(now);

    const startTime = new Date('2024-01-15T12:00:00');
    const endTime = new Date('2024-01-15T14:00:00');

    expect(calcStatus(startTime, endTime)).toBe('UPCOMING');
  });

  it('종료 시간 이후면 ENDED를 반환한다', () => {
    const now = new Date('2024-01-15T15:00:00');
    vi.setSystemTime(now);

    const startTime = new Date('2024-01-15T12:00:00');
    const endTime = new Date('2024-01-15T14:00:00');

    expect(calcStatus(startTime, endTime)).toBe('ENDED');
  });

  it('시작과 종료 사이면 ONGOING을 반환한다', () => {
    const now = new Date('2024-01-15T13:00:00');
    vi.setSystemTime(now);

    const startTime = new Date('2024-01-15T12:00:00');
    const endTime = new Date('2024-01-15T14:00:00');

    expect(calcStatus(startTime, endTime)).toBe('ONGOING');
  });

  it('정확히 시작 시간이면 ONGOING을 반환한다', () => {
    const now = new Date('2024-01-15T12:00:00');
    vi.setSystemTime(now);

    const startTime = new Date('2024-01-15T12:00:00');
    const endTime = new Date('2024-01-15T14:00:00');

    expect(calcStatus(startTime, endTime)).toBe('ONGOING');
  });

  it('정확히 종료 시간이면 ENDED를 반환한다', () => {
    const now = new Date('2024-01-15T14:00:00');
    vi.setSystemTime(now);

    const startTime = new Date('2024-01-15T12:00:00');
    const endTime = new Date('2024-01-15T14:00:00');

    expect(calcStatus(startTime, endTime)).toBe('ENDED');
  });
});
