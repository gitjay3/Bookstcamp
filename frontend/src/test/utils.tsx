import type { ReactElement, ReactNode } from 'react';
import { render, renderHook, type RenderOptions, type RenderHookOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthContext } from '@/store/AuthContext';
import { OrgProvider } from '@/store/OrgContext';
import type { User } from '@/types/user';
import type { Organization } from '@/api/organization';

// ============================================
// Mock Data Factories
// ============================================

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-1',
  name: '테스트 유저',
  role: 'USER',
  organizations: [
    {
      organization: {
        id: 'org-1',
        name: '테스트 조직',
      },
    },
  ],
  ...overrides,
});

export const createMockAdmin = (overrides?: Partial<User>): User => ({
  ...createMockUser(),
  role: 'ADMIN',
  ...overrides,
});

export const createMockOrganization = (overrides?: Partial<Organization>): Organization => ({
  id: 'org-1',
  name: '테스트 조직',
  ...overrides,
} as Organization);

// ============================================
// Provider Options
// ============================================

interface AuthProviderOptions {
  user?: User | null;
  isLoading?: boolean;
  logout?: () => Promise<void>;
}

interface ProviderOptions {
  auth?: AuthProviderOptions;
  organization?: Organization | null;
  route?: string;
  useMemoryRouter?: boolean;
}

// ============================================
// Test Wrapper Components
// ============================================

interface WrapperProps {
  children: ReactNode;
}

function createWrapper(options: ProviderOptions = {}) {
  const {
    auth = {},
    organization = null,
    route = '/',
    useMemoryRouter = false,
  } = options;

  const authValue = {
    user: auth.user ?? null,
    isLoading: auth.isLoading ?? false,
    logout: auth.logout ?? vi.fn().mockResolvedValue(undefined),
  };

  return function TestWrapper({ children }: WrapperProps) {
    const Router = useMemoryRouter
      ? ({ children: c }: WrapperProps) => (
          <MemoryRouter initialEntries={[route]}>{c}</MemoryRouter>
        )
      : BrowserRouter;

    return (
      <Router>
        <AuthContext value={authValue}>
          <OrgProvider organization={organization}>
            {children}
          </OrgProvider>
        </AuthContext>
      </Router>
    );
  };
}

// ============================================
// Custom Render Functions
// ============================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'>, ProviderOptions {}

export function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const {
    auth,
    organization,
    route,
    useMemoryRouter,
    ...renderOptions
  } = options;

  const Wrapper = createWrapper({ auth, organization, route, useMemoryRouter });

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// renderWithRouter는 customRender의 alias로 유지 (하위 호환성)
export const renderWithRouter = customRender;

// ============================================
// Custom RenderHook Function
// ============================================

export function customRenderHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: Omit<RenderHookOptions<TProps>, 'wrapper'> & ProviderOptions = {}
) {
  const {
    auth,
    organization,
    route,
    useMemoryRouter,
    ...renderHookOptions
  } = options;

  const Wrapper = createWrapper({ auth, organization, route, useMemoryRouter });

  return renderHook(hook, { wrapper: Wrapper, ...renderHookOptions });
}

// ============================================
// Convenience Render Functions
// ============================================

// 로그인된 상태로 렌더링
export function renderAuthenticated(ui: ReactElement, options: CustomRenderOptions = {}) {
  return customRender(ui, {
    auth: { user: createMockUser(), isLoading: false },
    ...options,
  });
}

// 관리자로 로그인된 상태로 렌더링
export function renderAsAdmin(ui: ReactElement, options: CustomRenderOptions = {}) {
  return customRender(ui, {
    auth: { user: createMockAdmin(), isLoading: false },
    ...options,
  });
}

// 로그인되지 않은 상태로 렌더링
export function renderUnauthenticated(ui: ReactElement, options: CustomRenderOptions = {}) {
  return customRender(ui, {
    auth: { user: null, isLoading: false },
    ...options,
  });
}

// 조직 컨텍스트와 함께 렌더링
export function renderWithOrg(ui: ReactElement, options: CustomRenderOptions = {}) {
  return customRender(ui, {
    auth: { user: createMockUser(), isLoading: false },
    organization: createMockOrganization(),
    ...options,
  });
}

// ============================================
// Re-exports
// ============================================

export * from '@testing-library/react';
export { userEvent };
