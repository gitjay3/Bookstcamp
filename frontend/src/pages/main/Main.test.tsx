import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import {
  customRender,
  renderAuthenticated,
  renderAsAdmin,
  userEvent,
} from '@/test/utils';
import Main from './Main';
import * as eventApi from '@/api/event';
import type { Event } from '@/types/event';

// SVG 모킹
vi.mock('@/assets/icons/plus.svg?react', () => ({
  default: () => <span data-testid="plus-icon">+</span>,
}));

vi.mock('@/assets/icons/trash.svg?react', () => ({
  default: () => <span data-testid="trash-icon">🗑</span>,
}));

vi.mock('@/assets/icons/chevron-down.svg?react', () => ({
  default: () => <span data-testid="chevron-icon">▼</span>,
}));

vi.mock('@/assets/icons/calendar-clock.svg?react', () => ({
  default: () => <span data-testid="calendar-icon">📅</span>,
}));

vi.mock('@/assets/icons/edit.svg?react', () => ({
  default: () => <span data-testid="edit-icon">✏️</span>,
}));

vi.mock('@/assets/icons/ellipsis-vertical.svg?react', () => ({
  default: () => <span data-testid="ellipsis-icon">⋮</span>,
}));

// API 모킹
vi.mock('@/api/event');

// react-router 모킹
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ orgId: 'org-1' }),
  };
});

const createMockEvent = (overrides?: Partial<Event>): Event => ({
  id: 1,
  title: '테스트 이벤트',
  description: '테스트 설명',
  track: 'WEB',
  status: 'ONGOING',
  applicationUnit: 'INDIVIDUAL',
  startTime: new Date('2026-01-25T10:00:00'),
  endTime: new Date('2026-01-26T12:00:00'),
  ...overrides,
});

describe('Main', () => {
  const mockGetEvents = vi.mocked(eventApi.getEvents);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetEvents.mockResolvedValue([]);
  });

  describe('일반 사용자 뷰', () => {
    it('이벤트 예약 제목을 표시한다', async () => {
      renderAuthenticated(<Main />);

      await waitFor(() => {
        expect(screen.getByText('이벤트 예약')).toBeInTheDocument();
      });
    });

    it('사용자용 설명을 표시한다', async () => {
      renderAuthenticated(<Main />);

      await waitFor(() => {
        expect(
          screen.getByText(
            '부스트캠프 멤버들을 위한 다양한 멘토링과 특강을 확인하고 신청하세요.',
          ),
        ).toBeInTheDocument();
      });
    });

    it('이벤트 생성 버튼을 표시하지 않는다', async () => {
      renderAuthenticated(<Main />);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /이벤트 생성/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('관리자 뷰', () => {
    it('이벤트 관리 제목을 표시한다', async () => {
      renderAsAdmin(<Main />);

      await waitFor(() => {
        expect(screen.getByText('이벤트 관리')).toBeInTheDocument();
      });
    });

    it('관리자용 설명을 표시한다', async () => {
      renderAsAdmin(<Main />);

      await waitFor(() => {
        expect(
          screen.getByText(
            '부스트캠프 멤버들을 위한 멘토링과 특강을 등록하고 현황을 확인하세요.',
          ),
        ).toBeInTheDocument();
      });
    });

    it('이벤트 생성 버튼을 표시한다', async () => {
      renderAsAdmin(<Main />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /이벤트 생성/i })).toBeInTheDocument();
      });
    });

    it('이벤트 생성 버튼 클릭 시 생성 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      renderAsAdmin(<Main />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /이벤트 생성/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /이벤트 생성/i }));

      expect(mockNavigate).toHaveBeenCalledWith('events/new');
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때는 사용자 뷰를 표시한다', async () => {
      customRender(<Main />, {
        auth: { user: null, isLoading: true },
      });

      await waitFor(() => {
        expect(screen.getByText('이벤트 예약')).toBeInTheDocument();
      });
    });
  });

  describe('이벤트 목록', () => {
    it('카테고리 탭들을 표시한다', async () => {
      mockGetEvents.mockResolvedValue([createMockEvent()]);
      renderAuthenticated(<Main />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '공통' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Web' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Android' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'iOS' })).toBeInTheDocument();
      });
    });

    it('이벤트를 표시한다', async () => {
      mockGetEvents.mockResolvedValue([
        createMockEvent({ id: 1, title: '멘토링 세션' }),
        createMockEvent({ id: 2, title: '특강 세션' }),
      ]);
      renderAuthenticated(<Main />);

      await waitFor(() => {
        expect(screen.getByText('멘토링 세션')).toBeInTheDocument();
        expect(screen.getByText('특강 세션')).toBeInTheDocument();
      });
    });

    it('카테고리 탭 클릭 시 해당 카테고리만 필터링된다', async () => {
      mockGetEvents.mockResolvedValue([
        createMockEvent({ id: 1, title: '웹 이벤트', track: 'WEB' }),
        createMockEvent({ id: 2, title: '안드로이드 이벤트', track: 'ANDROID' }),
      ]);
      const user = userEvent.setup();
      renderAuthenticated(<Main />);

      await waitFor(() => {
        expect(screen.getByText('웹 이벤트')).toBeInTheDocument();
        expect(screen.getByText('안드로이드 이벤트')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Web' }));

      expect(screen.getByText('웹 이벤트')).toBeInTheDocument();
      expect(screen.queryByText('안드로이드 이벤트')).not.toBeInTheDocument();
    });
  });
});
