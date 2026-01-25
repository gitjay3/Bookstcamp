/**
 * 테스트용 Mock Factory 유틸리티
 *
 * @golevelup/ts-jest의 createMock을 활용한 타입 안전한 모킹 유틸리티입니다.
 */

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import { MetricsService } from '../../metrics/metrics.service';

// ============================================
// 자동 Mock 생성 유틸리티
// ============================================

/**
 * 서비스의 DeepMocked 인스턴스를 생성합니다.
 * 모든 메서드가 jest.fn()으로 자동 모킹됩니다.
 */
export function createServiceMock<T extends object>(): DeepMocked<T> {
  return createMock<T>();
}

// ============================================
// 자주 사용되는 서비스 Mock
// ============================================

export function createJwtServiceMock(): DeepMocked<JwtService> {
  const mock = createMock<JwtService>();
  mock.sign.mockReturnValue('mock-jwt-token');
  mock.verify.mockReturnValue({ sub: 'user-1' });
  return mock;
}

export function createConfigServiceMock(
  config: Record<string, unknown> = {},
): DeepMocked<ConfigService> {
  const defaultConfig: Record<string, unknown> = {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '1d',
    FRONTEND_URL: 'http://localhost:3000',
    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
    ...config,
  };

  const mock = createMock<ConfigService>();
  mock.get.mockImplementation(
    <T>(key: string, defaultValue?: T): T =>
      (defaultConfig[key] ?? defaultValue) as T,
  );
  return mock;
}

export function createRedisServiceMock(): DeepMocked<RedisService> {
  const mock = createMock<RedisService>();
  mock.decrementStock.mockResolvedValue(true);
  mock.incrementStock.mockResolvedValue(1);
  mock.getStock.mockResolvedValue(10);
  return mock;
}

export function createMetricsServiceMock(): DeepMocked<MetricsService> {
  return createMock<MetricsService>();
}

// ============================================
// Mock 데이터 팩토리
// ============================================

export interface MockUserData {
  id: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string | null;
}

export function createMockUser(
  overrides?: Partial<MockUserData>,
): MockUserData {
  return {
    id: 'user-uuid-1',
    name: '테스트 유저',
    role: 'USER',
    avatarUrl: null,
    ...overrides,
  };
}

export function createMockAdmin(
  overrides?: Partial<MockUserData>,
): MockUserData {
  return {
    ...createMockUser(),
    name: '관리자',
    role: 'ADMIN',
    ...overrides,
  };
}

export interface MockEventData {
  id: number;
  title: string;
  description: string | null;
  track: 'WEB' | 'ANDROID' | 'IOS' | 'COMMON';
  applicationUnit: 'INDIVIDUAL' | 'TEAM';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockEvent(
  overrides?: Partial<MockEventData>,
): MockEventData {
  const now = new Date();
  return {
    id: 1,
    title: '테스트 이벤트',
    description: '테스트 설명',
    track: 'WEB',
    applicationUnit: 'INDIVIDUAL',
    organizationId: 'org-1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export interface MockEventSlotData {
  id: number;
  eventId: number;
  maxCapacity: number;
  currentCount: number;
  version: number;
  extraInfo: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockEventSlot(
  overrides?: Partial<MockEventSlotData>,
): MockEventSlotData {
  const now = new Date();
  return {
    id: 1,
    eventId: 1,
    maxCapacity: 10,
    currentCount: 0,
    version: 1,
    extraInfo: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export interface MockReservationData {
  id: number;
  userId: string;
  slotId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export function createMockReservation(
  overrides?: Partial<MockReservationData>,
): MockReservationData {
  const now = new Date();
  return {
    id: 1,
    userId: 'user-uuid-1',
    slotId: 1,
    status: 'CONFIRMED',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export interface MockOrganizationData {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockOrganization(
  overrides?: Partial<MockOrganizationData>,
): MockOrganizationData {
  const now = new Date();
  return {
    id: 'org-1',
    name: '테스트 조직',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export interface MockTemplateData {
  id: number;
  title: string;
  organizationId: string;
  slotSchema: { fields: Array<{ id: string; name: string; type: string }> };
  createdAt: Date;
  updatedAt: Date;
}

export function createMockTemplate(
  overrides?: Partial<MockTemplateData>,
): MockTemplateData {
  const now = new Date();
  return {
    id: 1,
    title: '테스트 템플릿',
    organizationId: 'org-1',
    slotSchema: {
      fields: [{ id: 'f1', name: '필드1', type: 'text' }],
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================
// Re-exports
// ============================================

export { createMock } from '@golevelup/ts-jest';
export type { DeepMocked } from '@golevelup/ts-jest';
