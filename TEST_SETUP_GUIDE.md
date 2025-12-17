# Test Setup Guide

This guide provides step-by-step instructions for setting up the testing infrastructure for the MindMap Frontend project.

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Git configured

## Installation Steps

### 1. Install Testing Dependencies

```bash
# Install Vitest and related packages
npm install -D vitest @vitest/ui @vitest/coverage-v8

# Install React Testing Library
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install JSDOM for browser environment simulation
npm install -D jsdom

# Install Playwright for E2E tests
npm install -D @playwright/test

# Install MSW (Mock Service Worker) for API mocking
npm install -D msw

# Install testing utilities
npm install -D @faker-js/faker
```

### 2. Create Vitest Configuration

Create `vitest.config.ts` in the project root:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/components/ui/**', // Exclude shadcn/ui components
      ],
      include: ['src/**/*.{ts,tsx}'],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 3. Create Test Setup File

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
```

### 4. Create Test Utilities

Create `src/test/utils/test-utils.tsx`:

```typescript
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'

interface AllTheProvidersProps {
  children: React.ReactNode
}

// Create wrapper with all providers
function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

// Custom render function that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
```

### 5. Create API Mocks

Create `src/test/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as any

    if (body.identifier === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            username: 'testuser',
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      })
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Invalid credentials',
      },
      { status: 401 }
    )
  }),

  http.post(`${API_BASE_URL}/api/auth/register/start`, async ({ request }) => {
    const body = await request.json() as any

    return HttpResponse.json({
      success: true,
      data: {
        verificationId: 'mock-verification-id',
      },
    })
  }),

  http.post(`${API_BASE_URL}/api/auth/register/verify`, async ({ request }) => {
    const body = await request.json() as any

    if (body.otp === '123456') {
      return HttpResponse.json({
        success: true,
        data: {
          registrationToken: 'mock-registration-token',
        },
      })
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Invalid OTP',
      },
      { status: 400 }
    )
  }),

  http.post(`${API_BASE_URL}/api/auth/register/complete`, async ({ request }) => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          name: 'New User',
          email: 'newuser@example.com',
          username: 'newuser',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    })
  }),

  http.get(`${API_BASE_URL}/api/auth/me`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (authHeader?.includes('mock-access-token')) {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            username: 'testuser',
          },
        },
      })
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Unauthorized',
      },
      { status: 401 }
    )
  }),

  http.post(`${API_BASE_URL}/api/auth/refresh`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token',
      },
    })
  }),

  http.post(`${API_BASE_URL}/api/auth/logout`, async () => {
    return HttpResponse.json({
      success: true,
    })
  }),
]
```

Create `src/test/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server for Node environment (tests)
export const server = setupServer(...handlers)
```

Create `src/test/mocks/browser.ts`:

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Setup MSW worker for browser environment (development)
export const worker = setupWorker(...handlers)
```

### 6. Create Socket Mock

Create `src/test/mocks/socket.ts`:

```typescript
import { vi } from 'vitest'

export const createMockSocketClient = () => ({
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn(),
  isConnected: vi.fn().mockReturnValue(true),
  send: vi.fn(),
  on: vi.fn().mockReturnValue(() => {}),
  off: vi.fn(),
  joinConversation: vi.fn(),
  leaveConversation: vi.fn(),
  updateToken: vi.fn(),
  getConnectionStatus: vi.fn().mockReturnValue({
    isConnected: true,
    isConnecting: false,
    hasToken: true,
  }),
})

// Mock the socket module
vi.mock('@/lib/socket', () => ({
  socketClient: createMockSocketClient(),
}))
```

### 7. Create Playwright Configuration

Create `playwright.config.ts` in the project root:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:9002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:9002',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 8. Update package.json Scripts

Add the following scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

### 9. Create Test Directory Structure

```bash
mkdir -p src/test/{mocks,utils}
mkdir -p src/__tests__/{integration,e2e}
```

Final structure:
```
src/
├── test/
│   ├── setup.ts
│   ├── mocks/
│   │   ├── handlers.ts
│   │   ├── server.ts
│   │   ├── browser.ts
│   │   └── socket.ts
│   └── utils/
│       └── test-utils.tsx
├── __tests__/
│   ├── integration/
│   │   └── auth-flow.test.tsx
│   └── e2e/
│       └── registration.spec.ts
└── components/
    └── auth/
        ├── AuthForm.tsx
        └── AuthForm.test.tsx
```

### 10. Create GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, staging, claude/*]
  pull_request:
    branches: [main, staging]

jobs:
  unit-tests:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Verification

After completing the setup, verify everything works:

```bash
# Run unit tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run E2E tests (ensure dev server is running on port 9002)
npm run test:e2e
```

## Next Steps

1. Write your first test following the examples in TEST_PLAN.md
2. Check coverage reports in `coverage/index.html`
3. Review E2E test reports in `playwright-report/index.html`
4. Set up code coverage thresholds
5. Integrate with CI/CD pipeline

## Troubleshooting

### Common Issues

**Issue: "Cannot find module '@testing-library/react'"**
- Solution: Run `npm install` again

**Issue: "JSDOM environment not found"**
- Solution: Install jsdom: `npm install -D jsdom`

**Issue: "Playwright browsers not installed"**
- Solution: Run `npx playwright install`

**Issue: "Port 9002 already in use"**
- Solution: Stop the dev server or change the port in playwright.config.ts

**Issue: "Module path aliases not working"**
- Solution: Ensure vitest.config.ts has correct path resolution

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
