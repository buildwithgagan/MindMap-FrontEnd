# Test Examples and Patterns

This document provides practical examples of tests for the MindMap Frontend project, demonstrating best practices and common patterns.

## Table of Contents

1. [Unit Tests](#unit-tests)
2. [Integration Tests](#integration-tests)
3. [Component Tests](#component-tests)
4. [E2E Tests](#e2e-tests)
5. [Testing Patterns](#testing-patterns)

---

## Unit Tests

### Example 1: Testing Utility Functions

**File: `src/lib/utils.test.ts`**

```typescript
import { describe, test, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  test('should merge single className', () => {
    const result = cn('text-red-500')
    expect(result).toBe('text-red-500')
  })

  test('should merge multiple classNames', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  test('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  test('should handle Tailwind conflicts correctly', () => {
    const result = cn('text-red-500', 'text-blue-500')
    // twMerge should keep only the last text color
    expect(result).toBe('text-blue-500')
  })

  test('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  test('should filter out falsy values', () => {
    const result = cn('class1', null, undefined, false, '', 'class2')
    expect(result).toBe('class1 class2')
  })
})
```

### Example 2: Testing API Client

**File: `src/lib/api/client.test.ts`**

```typescript
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { apiClient } from './client'

// Mock fetch
global.fetch = vi.fn()

describe('ApiClient', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    // Reset fetch mock
    vi.clearAllMocks()
  })

  describe('Token Management', () => {
    test('should store tokens in localStorage', () => {
      apiClient.setTokens('access-token', 'refresh-token')

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mindmap_access_token',
        'access-token'
      )
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mindmap_refresh_token',
        'refresh-token'
      )
    })

    test('should retrieve access token correctly', () => {
      localStorage.setItem('mindmap_access_token', 'test-token')

      const token = apiClient.getAccessToken()

      expect(token).toBe('test-token')
    })

    test('should retrieve refresh token correctly', () => {
      localStorage.setItem('mindmap_refresh_token', 'refresh-token')

      const token = apiClient.getRefreshToken()

      expect(token).toBe('refresh-token')
    })

    test('should clear all tokens', () => {
      apiClient.setTokens('access', 'refresh')
      apiClient.clearTokens()

      expect(localStorage.removeItem).toHaveBeenCalledWith('mindmap_access_token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('mindmap_refresh_token')
    })

    test('should handle missing tokens gracefully', () => {
      const accessToken = apiClient.getAccessToken()
      const refreshToken = apiClient.getRefreshToken()

      expect(accessToken).toBeNull()
      expect(refreshToken).toBeNull()
    })
  })

  describe('Request Handling', () => {
    test('should add auth header when token exists', async () => {
      apiClient.setTokens('test-token', 'refresh-token')

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: {} }),
      }
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      await apiClient.fetch('/api/test', { method: 'GET' })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      )
    })

    test('should normalize URLs correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      }
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      await apiClient.fetch('/api/test')

      // Should not have double slashes
      const callUrl = (global.fetch as any).mock.calls[0][0]
      expect(callUrl).not.toContain('//')
      expect(callUrl).toMatch(/^https?:\/\/[^/]+\/api\/test$/)
    })

    test('should handle 204 No Content responses', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        json: async () => { throw new Error('No content') },
      }
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await apiClient.fetch('/api/test')

      expect(result).toEqual({
        success: true,
        data: {},
      })
    })

    test('should extract error messages from various formats', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: 'Custom error message' },
        }),
      }
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      await expect(apiClient.fetch('/api/test')).rejects.toThrow(
        'Custom error message'
      )
    })
  })

  describe('Token Refresh', () => {
    test('should retry request after token refresh on 401', async () => {
      apiClient.setTokens('expired-token', 'refresh-token')

      // First call returns 401
      const mock401Response = {
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      }

      // Refresh token call succeeds
      const mockRefreshResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            accessToken: 'new-token',
            refreshToken: 'new-refresh',
          },
        }),
      }

      // Retry with new token succeeds
      const mockSuccessResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { id: 1 },
        }),
      }

      ;(global.fetch as any)
        .mockResolvedValueOnce(mock401Response)
        .mockResolvedValueOnce(mockRefreshResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      const result = await apiClient.fetchWithAuth('/api/protected')

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    test('should dispatch token-expired event on refresh failure', async () => {
      apiClient.setTokens('expired-token', 'invalid-refresh')

      const eventSpy = vi.fn()
      window.addEventListener('auth:token-expired', eventSpy)

      const mock401Response = {
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      }

      const mockRefreshFailure = {
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid refresh token' }),
      }

      ;(global.fetch as any)
        .mockResolvedValueOnce(mock401Response)
        .mockResolvedValueOnce(mockRefreshFailure)

      await expect(apiClient.fetchWithAuth('/api/protected')).rejects.toThrow()

      expect(eventSpy).toHaveBeenCalled()
      expect(apiClient.getAccessToken()).toBeNull()

      window.removeEventListener('auth:token-expired', eventSpy)
    })
  })

  describe('File Upload', () => {
    test('should create FormData correctly', async () => {
      apiClient.setTokens('test-token', 'refresh-token')

      const file = new File(['content'], 'test.png', { type: 'image/png' })

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { url: 'https://example.com/image.png' },
        }),
      }
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      await apiClient.uploadFile('/api/upload', file, 'image')

      const [[url, options]] = (global.fetch as any).mock.calls

      expect(url).toContain('/api/upload')
      expect(options.method).toBe('POST')
      expect(options.body).toBeInstanceOf(FormData)
      expect(options.headers['Authorization']).toBe('Bearer test-token')
    })

    test('should handle upload errors', async () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' })

      const mockResponse = {
        ok: false,
        status: 413,
        json: async () => ({
          message: 'File too large',
        }),
      }
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      await expect(
        apiClient.uploadFile('/api/upload', file)
      ).rejects.toThrow('File too large')
    })
  })
})
```

### Example 3: Testing Auth Service

**File: `src/lib/api/services/auth.test.ts`**

```typescript
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { authService } from './auth'
import { apiClient } from '../client'

// Mock apiClient
vi.mock('../client', () => ({
  apiClient: {
    fetch: vi.fn(),
    fetchWithAuth: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerStart', () => {
    test('should send OTP to email', async () => {
      const mockResponse = {
        success: true,
        data: { verificationId: 'ver-123' },
      }
      ;(apiClient.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await authService.registerStart({
        identifier: 'test@example.com',
      })

      expect(apiClient.fetch).toHaveBeenCalledWith(
        '/api/auth/register/start',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ identifier: 'test@example.com' }),
        })
      )
      expect(result.success).toBe(true)
      expect(result.data?.verificationId).toBe('ver-123')
    })

    test('should handle API errors', async () => {
      ;(apiClient.fetch as any).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(
        authService.registerStart({ identifier: 'test@example.com' })
      ).rejects.toThrow('Network error')
    })
  })

  describe('login', () => {
    test('should login with valid credentials', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: '1', name: 'Test User' },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      }
      ;(apiClient.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await authService.login({
        identifier: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(true)
      expect(apiClient.setTokens).toHaveBeenCalledWith(
        'access-token',
        'refresh-token'
      )
    })

    test('should not store tokens on login failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials',
      }
      ;(apiClient.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await authService.login({
        identifier: 'test@example.com',
        password: 'wrong-password',
      })

      expect(result.success).toBe(false)
      expect(apiClient.setTokens).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    test('should call logout endpoint and clear tokens', async () => {
      const mockResponse = { success: true }
      ;(apiClient.fetch as any).mockResolvedValueOnce(mockResponse)

      await authService.logout({ refreshToken: 'refresh-token' })

      expect(apiClient.fetch).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
        })
      )
      expect(apiClient.clearTokens).toHaveBeenCalled()
    })
  })
})
```

---

## Integration Tests

### Example 4: Testing AuthContext

**File: `src/contexts/AuthContext.test.tsx`**

```typescript
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { authService } from '@/lib/api'
import { apiClient } from '@/lib/api/client'
import { socketClient } from '@/lib/socket'

// Mock dependencies
vi.mock('@/lib/api', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  },
}))

vi.mock('@/lib/socket', () => ({
  socketClient: {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn(),
    isConnected: vi.fn().mockReturnValue(false),
    on: vi.fn().mockReturnValue(() => {}),
  },
}))

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('should provide auth context', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('loading')
    expect(result.current).toHaveProperty('isAuthenticated')
    expect(result.current).toHaveProperty('refreshSession')
    expect(result.current).toHaveProperty('logout')
  })

  test('should initialize with no user when tokens missing', async () => {
    ;(apiClient.getAccessToken as any).mockReturnValue(null)
    ;(apiClient.getRefreshToken as any).mockReturnValue(null)

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  test('should validate session with valid tokens', async () => {
    ;(apiClient.getAccessToken as any).mockReturnValue('valid-token')
    ;(apiClient.getRefreshToken as any).mockReturnValue('refresh-token')
    ;(authService.getCurrentUser as any).mockResolvedValue({
      success: true,
      data: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    })
    expect(result.current.isAuthenticated).toBe(true)
  })

  test('should connect socket on successful session', async () => {
    ;(apiClient.getAccessToken as any).mockReturnValue('valid-token')
    ;(apiClient.getRefreshToken as any).mockReturnValue('refresh-token')
    ;(authService.getCurrentUser as any).mockResolvedValue({
      success: true,
      data: { id: '1', name: 'Test User' },
    })

    renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(socketClient.connect).toHaveBeenCalledWith('valid-token')
    })
  })

  test('should handle logout correctly', async () => {
    ;(apiClient.getAccessToken as any).mockReturnValue('valid-token')
    ;(apiClient.getRefreshToken as any).mockReturnValue('refresh-token')
    ;(authService.getCurrentUser as any).mockResolvedValue({
      success: true,
      data: { id: '1', name: 'Test User' },
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    await result.current.logout()

    expect(socketClient.disconnect).toHaveBeenCalled()
    expect(apiClient.clearTokens).toHaveBeenCalled()
    expect(result.current.user).toBeNull()
  })
})
```

---

## Component Tests

### Example 5: Testing AuthForm Component

**File: `src/components/auth/AuthForm.test.tsx`**

```typescript
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthForm from './AuthForm'
import { authService } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  authService: {
    registerStart: vi.fn(),
    registerVerify: vi.fn(),
    registerComplete: vi.fn(),
    login: vi.fn(),
  },
}))

describe('AuthForm', () => {
  describe('EmailStep', () => {
    test('should render email input', () => {
      render(<AuthForm />)

      expect(screen.getByLabelText(/email\/phone/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    })

    test('should show validation error for empty input', async () => {
      render(<AuthForm />)
      const user = userEvent.setup()

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      expect(
        await screen.findByText(/please enter your email or phone/i)
      ).toBeInTheDocument()
    })

    test('should show validation error for invalid email', async () => {
      render(<AuthForm />)
      const user = userEvent.setup()

      const input = screen.getByLabelText(/email\/phone/i)
      await user.type(input, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      expect(
        await screen.findByText(/please enter a valid email/i)
      ).toBeInTheDocument()
    })

    test('should accept valid email and call registerStart', async () => {
      ;(authService.registerStart as any).mockResolvedValue({
        success: true,
        data: { verificationId: 'ver-123' },
      })

      render(<AuthForm />)
      const user = userEvent.setup()

      const input = screen.getByLabelText(/email\/phone/i)
      await user.type(input, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(authService.registerStart).toHaveBeenCalledWith({
          identifier: 'test@example.com',
        })
      })
    })

    test('should switch to signin mode', async () => {
      render(<AuthForm />)
      const user = userEvent.setup()

      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)

      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /sign in/i, pressed: true })
      ).toBeInTheDocument()
    })

    test('should call login in signin mode', async () => {
      ;(authService.login as any).mockResolvedValue({
        success: true,
        data: {
          user: { id: '1' },
          accessToken: 'token',
          refreshToken: 'refresh',
        },
      })

      render(<AuthForm />)
      const user = userEvent.setup()

      // Switch to signin
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Enter credentials
      await user.type(screen.getByLabelText(/email\/phone/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      // Submit
      await user.click(screen.getByRole('button', { name: /sign in/i, pressed: true }))

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          identifier: 'test@example.com',
          password: 'password123',
        })
      })
    })
  })

  describe('OtpStep', () => {
    test('should only accept 6 digits', async () => {
      render(<AuthForm />)
      const user = userEvent.setup()

      // Move to OTP step (mock the flow)
      // ... setup code to reach OTP step

      const otpInput = screen.getByPlaceholderText('123456')
      await user.type(otpInput, 'abc123456789')

      expect(otpInput).toHaveValue('123456')
    })
  })

  describe('ProfileStep', () => {
    test('should validate password complexity', async () => {
      // ... test implementation
    })
  })
})
```

---

## E2E Tests

### Example 6: Registration Flow E2E Test

**File: `src/__tests__/e2e/registration.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test.describe('User Registration Flow', () => {
  test('should complete full registration process', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth')

    // Verify we're on auth page
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible()

    // Enter email
    const emailInput = page.getByLabel(/email\/phone/i)
    await emailInput.fill('newuser@example.com')

    // Click continue
    await page.getByRole('button', { name: /continue/i }).click()

    // Wait for OTP step
    await expect(
      page.getByRole('heading', { name: /verify/i })
    ).toBeVisible()

    // Enter OTP (in real test, you'd need to retrieve this from test email)
    const otpInput = page.getByPlaceholder('123456')
    await otpInput.fill('123456')

    // Click verify
    await page.getByRole('button', { name: /verify/i }).click()

    // Wait for profile step
    await expect(
      page.getByRole('heading', { name: /complete your profile/i })
    ).toBeVisible()

    // Fill profile details
    await page.getByLabel(/full name/i).fill('Test User')
    await page.getByLabel(/password/i).fill('SecurePass123!')

    // Submit
    await page.getByRole('button', { name: /finish setup/i }).click()

    // Verify redirect to home
    await expect(page).toHaveURL('/home')

    // Verify user is logged in (check for user-specific elements)
    await expect(page.getByText(/welcome/i)).toBeVisible()
  })

  test('should show error for invalid OTP', async ({ page }) => {
    await page.goto('/auth')

    // Go through to OTP step
    await page.getByLabel(/email\/phone/i).fill('test@example.com')
    await page.getByRole('button', { name: /continue/i }).click()

    // Enter invalid OTP
    await page.getByPlaceholder('123456').fill('000000')
    await page.getByRole('button', { name: /verify/i }).click()

    // Verify error message
    await expect(page.getByText(/invalid verification code/i)).toBeVisible()
  })
})
```

### Example 7: Chat E2E Test

**File: `src/__tests__/e2e/chat.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Real-time Chat', () => {
  test('should send and receive messages between two users', async ({
    browser,
  }) => {
    // Create two browser contexts (two users)
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // User 1 logs in
    await page1.goto('/auth')
    await page1.getByLabel(/email\/phone/i).fill('user1@example.com')
    await page1.getByLabel(/password/i).fill('password123')
    await page1.getByRole('button', { name: /sign in/i }).click()
    await page1.waitForURL('/home')

    // User 2 logs in
    await page2.goto('/auth')
    await page2.getByLabel(/email\/phone/i).fill('user2@example.com')
    await page2.getByLabel(/password/i).fill('password123')
    await page2.getByRole('button', { name: /sign in/i }).click()
    await page2.waitForURL('/home')

    // User 1 navigates to chat
    await page1.goto('/chat')
    await page1.getByText('User 2').click()

    // User 2 navigates to chat with User 1
    await page2.goto('/chat')

    // User 1 types and sends a message
    const messageInput1 = page1.getByPlaceholder(/type a message/i)
    await messageInput1.fill('Hello from User 1!')
    await messageInput1.press('Enter')

    // Verify message appears in User 1's chat
    await expect(page1.getByText('Hello from User 1!')).toBeVisible()

    // Verify message appears in User 2's chat (real-time)
    await expect(page2.getByText('Hello from User 1!')).toBeVisible({
      timeout: 5000,
    })

    // User 2 replies
    const messageInput2 = page2.getByPlaceholder(/type a message/i)
    await messageInput2.fill('Hi back from User 2!')
    await messageInput2.press('Enter')

    // Verify reply in both chats
    await expect(page2.getByText('Hi back from User 2!')).toBeVisible()
    await expect(page1.getByText('Hi back from User 2!')).toBeVisible({
      timeout: 5000,
    })

    // Cleanup
    await context1.close()
    await context2.close()
  })

  test('should show typing indicator', async ({ browser }) => {
    // Similar setup as above...
    // User 1 starts typing
    // User 2 should see typing indicator
  })
})
```

---

## Testing Patterns

### Pattern 1: Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useTypingIndicator } from './useTypingIndicator'

test('should debounce typing indicator', async () => {
  vi.useFakeTimers()

  const mockCallback = vi.fn()
  const { result } = renderHook(() => useTypingIndicator(mockCallback, 2000))

  // Start typing
  act(() => {
    result.current.startTyping()
  })

  expect(mockCallback).toHaveBeenCalledWith(true)

  // Fast forward 1 second (not enough)
  act(() => {
    vi.advanceTimersByTime(1000)
  })

  expect(mockCallback).toHaveBeenCalledTimes(1)

  // Fast forward another 1 second (total 2 seconds)
  act(() => {
    vi.advanceTimersByTime(1000)
  })

  expect(mockCallback).toHaveBeenCalledWith(false)

  vi.useRealTimers()
})
```

### Pattern 2: Testing with MSW

```typescript
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

test('should handle API error gracefully', async () => {
  // Override handler for this specific test
  server.use(
    http.post('/api/auth/login', () => {
      return HttpResponse.json(
        { success: false, message: 'Server error' },
        { status: 500 }
      )
    })
  )

  render(<AuthForm />)

  // Perform login
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
  await userEvent.type(screen.getByLabelText(/password/i), 'password123')
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

  // Verify error message
  await expect(screen.findByText(/server error/i)).toBeVisible()
})
```

### Pattern 3: Testing Protected Routes

```typescript
test('should redirect to auth when not authenticated', async ({ page }) => {
  // Try to access protected route directly
  await page.goto('/home')

  // Should be redirected to auth
  await expect(page).toHaveURL('/auth')
})

test('should allow access when authenticated', async ({ page }) => {
  // Login first
  await page.goto('/auth')
  // ... perform login

  // Now try to access protected route
  await page.goto('/home')

  // Should stay on home page
  await expect(page).toHaveURL('/home')
})
```

### Pattern 4: Testing Form Validation

```typescript
test('should validate all fields on submit', async () => {
  render(<AuthForm />)

  // Don't fill anything, just submit
  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  // All validation errors should appear
  expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
})
```

### Pattern 5: Testing Async Operations

```typescript
test('should show loading state during async operation', async () => {
  render(<AuthForm />)

  // Fill form
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
  await userEvent.type(screen.getByLabelText(/password/i), 'password123')

  // Click submit
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

  // Check loading state appears
  expect(screen.getByText(/signing in/i)).toBeInTheDocument()

  // Wait for operation to complete
  await waitFor(() => {
    expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
  })
})
```

---

## Best Practices Summary

1. **Always cleanup after tests** - Use `afterEach(cleanup)` or built-in cleanup
2. **Mock external dependencies** - API calls, socket connections, localStorage
3. **Test user behavior, not implementation** - Focus on what users see and do
4. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
5. **Wait for async updates** - Use `waitFor` for async state changes
6. **Keep tests independent** - Each test should be able to run in isolation
7. **Use descriptive test names** - Should describe what and when
8. **Group related tests** - Use `describe` blocks effectively
9. **Test edge cases** - Empty inputs, errors, loading states
10. **Maintain tests like production code** - Refactor, DRY, readable

---

## Running Tests

```bash
# Run all unit tests
npm test

# Run specific file
npm test -- AuthForm.test.tsx

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- registration.spec.ts
```
