# Comprehensive Test Plan for MindMap Frontend (ZenZone)

## Executive Summary

This document outlines a comprehensive testing strategy to maximize code coverage for the MindMap Frontend application (ZenZone). The application currently has **ZERO test coverage**, making this a critical priority.

**Application Overview:**
- Next.js 15 with App Router
- React 19 with TypeScript
- Real-time social media application
- Features: Authentication, Chat, Feed, Stories, Profiles, Notifications

---

## Current State Analysis

### Test Coverage Status
- **Current Coverage:** 0%
- **Test Files:** 0
- **Testing Framework:** None configured
- **CI/CD Integration:** None

### Technology Stack
- Next.js 15.5.9
- React 19.2.1
- TypeScript 5
- Socket.io Client 4.8.1
- shadcn/ui components
- React Hook Form with Zod validation

---

## Testing Strategy Overview

### Testing Pyramid Approach

```
                    /\
                   /  \
                  / E2E \          10% - End-to-End Tests
                 /______\
                /        \
               / Integr.  \        20% - Integration Tests
              /____________\
             /              \
            /  Unit Tests    \     70% - Unit Tests
           /                  \
          /____________________\
```

### Recommended Testing Frameworks

1. **Unit & Integration Tests:** Vitest + React Testing Library
   - Faster than Jest
   - Native ESM support
   - Better TypeScript support
   - Compatible with Vite/Next.js

2. **E2E Tests:** Playwright
   - Multi-browser support
   - Built-in test runner
   - Auto-waiting and retry mechanisms
   - Network interception

3. **Component Testing:** Storybook (optional)
   - Visual regression testing
   - Component documentation
   - Isolated component development

---

## Test Coverage Goals

### Phase 1: Critical Path (Target: 40% coverage)
Focus on authentication and core user flows.

### Phase 2: Feature Coverage (Target: 70% coverage)
Expand to all features and components.

### Phase 3: Edge Cases & Optimization (Target: 85%+ coverage)
Handle edge cases, error scenarios, and performance.

---

## Detailed Test Plan by Layer

## 1. Unit Tests (70% of test effort)

### 1.1 Utility Functions

#### `src/lib/utils.ts`
- **Priority:** High
- **Coverage Goal:** 100%
- **Test Cases:**
  ```typescript
  describe('cn utility', () => {
    test('should merge classnames correctly')
    test('should handle empty inputs')
    test('should handle conditional classes')
    test('should handle Tailwind conflicts')
  })
  ```

#### `src/lib/chat-utils.ts`
- **Priority:** High
- **Coverage Goal:** 100%
- **Test Cases:**
  - Message formatting
  - Date/time utilities
  - Message grouping logic

#### `src/lib/placeholder-images.ts`
- **Priority:** Low
- **Coverage Goal:** 80%

### 1.2 API Client Layer

#### `src/lib/api/client.ts` (Critical)
- **Priority:** CRITICAL
- **Coverage Goal:** 95%
- **Test Cases:**
  ```typescript
  describe('ApiClient', () => {
    describe('Token Management', () => {
      test('should store tokens in localStorage')
      test('should retrieve tokens correctly')
      test('should clear tokens on logout')
      test('should handle missing tokens gracefully')
    })

    describe('Request Handling', () => {
      test('should add auth header when token exists')
      test('should normalize URLs correctly')
      test('should handle 204 No Content responses')
      test('should parse JSON responses')
      test('should extract error messages from various formats')
    })

    describe('Token Refresh', () => {
      test('should retry request after token refresh on 401')
      test('should clear tokens on refresh failure')
      test('should dispatch token-expired event')
      test('should update socket token after refresh')
    })

    describe('File Upload', () => {
      test('should create FormData correctly')
      test('should handle upload progress')
      test('should handle upload errors')
    })
  })
  ```

#### `src/lib/api/services/auth.ts` (Critical)
- **Priority:** CRITICAL
- **Coverage Goal:** 95%
- **Test Cases:**
  ```typescript
  describe('authService', () => {
    describe('registerStart', () => {
      test('should send OTP to email')
      test('should send OTP to phone')
      test('should return verificationId')
      test('should handle API errors')
    })

    describe('registerVerify', () => {
      test('should verify valid OTP')
      test('should reject invalid OTP')
      test('should return registrationToken')
    })

    describe('registerComplete', () => {
      test('should complete registration with valid data')
      test('should store tokens after registration')
      test('should validate password strength')
    })

    describe('login', () => {
      test('should login with email')
      test('should login with phone')
      test('should store tokens after login')
      test('should handle invalid credentials')
    })

    describe('getCurrentUser', () => {
      test('should fetch user with valid token')
      test('should extract user from response')
      test('should handle 401 and refresh token')
    })

    describe('logout', () => {
      test('should call logout endpoint')
      test('should clear tokens')
    })
  })
  ```

#### `src/lib/api/services/chat.ts`
- **Priority:** High
- **Coverage Goal:** 90%

#### `src/lib/api/services/feed.ts`
- **Priority:** High
- **Coverage Goal:** 90%

#### `src/lib/api/services/user.ts`
- **Priority:** High
- **Coverage Goal:** 90%

#### `src/lib/api/services/relationships.ts`
- **Priority:** Medium
- **Coverage Goal:** 85%

#### `src/lib/api/services/media.ts`
- **Priority:** Medium
- **Coverage Goal:** 85%

#### `src/lib/api/services/reports.ts`
- **Priority:** Low
- **Coverage Goal:** 75%

### 1.3 WebSocket Client

#### `src/lib/socket.ts` (Critical)
- **Priority:** CRITICAL
- **Coverage Goal:** 90%
- **Test Cases:**
  ```typescript
  describe('SocketClient', () => {
    describe('Connection', () => {
      test('should connect with valid token')
      test('should reject connection without token')
      test('should handle connection timeout')
      test('should handle connection errors')
      test('should reconnect automatically')
      test('should not reconnect after manual disconnect')
    })

    describe('Event Handling', () => {
      test('should emit connect event on successful connection')
      test('should emit disconnect event')
      test('should forward new_message events')
      test('should forward message_status_update events')
      test('should map new_message to message:new for compatibility')
      test('should handle typing indicators')
    })

    describe('Message Sending', () => {
      test('should send messages when connected')
      test('should not send messages when disconnected')
      test('should handle send errors gracefully')
    })

    describe('Room Management', () => {
      test('should join conversation rooms')
      test('should leave conversation rooms')
      test('should handle room errors')
    })

    describe('Token Updates', () => {
      test('should update token on running connection')
      test('should reconnect with new token if disconnected')
    })

    describe('Environment-specific Behavior', () => {
      test('should suppress errors in production')
      test('should show errors in development')
    })
  })
  ```

### 1.4 Custom Hooks

#### `src/hooks/useTypingIndicator.ts`
- **Priority:** Medium
- **Coverage Goal:** 90%
- **Test Cases:**
  ```typescript
  describe('useTypingIndicator', () => {
    test('should start typing indicator')
    test('should stop typing after timeout')
    test('should debounce multiple calls')
    test('should clean up on unmount')
  })
  ```

#### `src/hooks/use-toast.ts`
- **Priority:** Medium
- **Coverage Goal:** 85%

### 1.5 Validation Functions

#### `src/components/auth/AuthForm.tsx` (Validation functions)
- **Priority:** High
- **Coverage Goal:** 100%
- **Test Cases:**
  ```typescript
  describe('Validation Functions', () => {
    describe('isValidEmail', () => {
      test('should accept valid emails')
      test('should reject invalid emails')
      test('should handle edge cases (no @, no domain, etc)')
    })

    describe('isValidPhone', () => {
      test('should accept valid phone numbers')
      test('should accept international formats')
      test('should reject invalid phone numbers')
      test('should handle various delimiters')
    })
  })
  ```

### 1.6 Error Handler

#### `src/lib/error-handler.ts`
- **Priority:** High
- **Coverage Goal:** 90%
- **Test Cases:**
  - Extension error suppression
  - Console error filtering
  - Pattern matching

---

## 2. Integration Tests (20% of test effort)

### 2.1 Context Providers

#### `src/contexts/AuthContext.tsx` (Critical)
- **Priority:** CRITICAL
- **Coverage Goal:** 95%
- **Test Cases:**
  ```typescript
  describe('AuthContext Integration', () => {
    describe('Session Initialization', () => {
      test('should initialize with no user when tokens missing')
      test('should validate session with valid tokens')
      test('should connect socket on successful session')
      test('should redirect to auth on invalid session')
    })

    describe('Token Refresh Flow', () => {
      test('should refresh expired tokens automatically')
      test('should retry getCurrentUser after refresh')
      test('should clear tokens and redirect on refresh failure')
    })

    describe('Socket Integration', () => {
      test('should connect socket only once on auth')
      test('should not reconnect socket on tab navigation')
      test('should handle socket connection failures gracefully')
      test('should disconnect socket on logout')
      test('should suppress socket errors in production')
    })

    describe('Event Listeners', () => {
      test('should handle auth:token-expired event')
      test('should handle auth:success event')
      test('should handle socket connect event')
      test('should handle socket disconnect event')
      test('should clean up listeners on unmount')
    })

    describe('Logout Flow', () => {
      test('should disconnect socket')
      test('should call logout endpoint')
      test('should clear tokens')
      test('should redirect to auth page')
    })
  })
  ```

### 2.2 Component Integration

#### Authentication Flow Components
- **Priority:** CRITICAL
- **Coverage Goal:** 90%
- **Test Cases:**
  ```typescript
  describe('Authentication Flow', () => {
    describe('Sign Up Flow', () => {
      test('should complete full registration flow')
      test('should validate email/phone input')
      test('should send OTP')
      test('should verify OTP')
      test('should validate profile data')
      test('should complete registration and redirect')
    })

    describe('Sign In Flow', () => {
      test('should login with valid credentials')
      test('should show error with invalid credentials')
      test('should store tokens on success')
      test('should redirect to home on success')
    })

    describe('Mode Switching', () => {
      test('should switch between signup and signin')
      test('should reset form state on mode change')
    })
  })
  ```

#### Chat Window Integration
- **Priority:** High
- **Coverage Goal:** 85%
- **Test Cases:**
  - Message sending and receiving
  - Real-time updates via socket
  - Typing indicators
  - Message status updates
  - Date headers

#### Feed Component Integration
- **Priority:** High
- **Coverage Goal:** 85%
- **Test Cases:**
  - Post creation
  - Post rendering
  - Infinite scroll
  - Like/comment interactions

### 2.3 Protected Routes

#### `src/components/auth/ProtectedRoute.tsx`
- **Priority:** High
- **Coverage Goal:** 90%
- **Test Cases:**
  ```typescript
  describe('ProtectedRoute', () => {
    test('should allow access with valid auth')
    test('should redirect to auth when not authenticated')
    test('should show loading state during validation')
  })
  ```

### 2.4 Middleware

#### `src/middleware.ts`
- **Priority:** High
- **Coverage Goal:** 90%
- **Test Cases:**
  - Route protection
  - Token validation
  - Redirect logic

---

## 3. Component Tests (Part of Unit Tests)

### 3.1 UI Components (shadcn/ui)

#### Priority: Low (Pre-built library)
- **Coverage Goal:** 50% (Focus on customizations only)
- Test only if customizations are made

### 3.2 Custom Components

#### `src/components/auth/AuthForm.tsx` (Critical)
- **Priority:** CRITICAL
- **Coverage Goal:** 95%
- **Test Cases:**
  ```typescript
  describe('AuthForm Component', () => {
    describe('EmailStep', () => {
      test('should render email input')
      test('should show validation errors')
      test('should disable submit when invalid')
      test('should call registerStart on submit (signup mode)')
      test('should call login on submit (signin mode)')
      test('should show loading state during submission')
    })

    describe('OtpStep', () => {
      test('should render OTP input')
      test('should accept only 6 digits')
      test('should enable verify when 6 digits entered')
      test('should call registerVerify on submit')
      test('should show error on invalid OTP')
      test('should allow going back')
    })

    describe('ProfileStep', () => {
      test('should render name and password inputs')
      test('should validate name (min 2 chars)')
      test('should validate password (min 8 chars, complexity)')
      test('should call registerComplete on submit')
      test('should show validation errors')
    })
  })
  ```

#### `src/components/chat/ChatWindow.tsx`
- **Priority:** High
- **Coverage Goal:** 85%

#### `src/components/chat/MessageBubble.tsx`
- **Priority:** High
- **Coverage Goal:** 90%

#### `src/components/chat/TypingIndicator.tsx`
- **Priority:** Medium
- **Coverage Goal:** 85%

#### `src/components/feed/PostCard.tsx`
- **Priority:** High
- **Coverage Goal:** 85%

#### `src/components/feed/CreatePostDialog.tsx`
- **Priority:** High
- **Coverage Goal:** 85%

#### `src/components/stories/StoriesTray.tsx`
- **Priority:** Medium
- **Coverage Goal:** 80%

#### `src/components/profile/ProfileHeader.tsx`
- **Priority:** Medium
- **Coverage Goal:** 80%

#### `src/components/notifications/RequestItem.tsx`
- **Priority:** Medium
- **Coverage Goal:** 80%

#### Error Boundaries
- **Priority:** High
- **Coverage Goal:** 90%
- **Components:**
  - `src/components/ErrorBoundary.tsx`
  - `src/components/ErrorHandler.tsx`

---

## 4. End-to-End Tests (10% of test effort)

### 4.1 Critical User Journeys

#### Journey 1: New User Registration
```typescript
test('User can sign up, verify OTP, complete profile, and access home', async ({ page }) => {
  // Navigate to auth page
  // Enter email
  // Receive and enter OTP
  // Complete profile
  // Verify redirect to home
  // Verify socket connection
})
```

#### Journey 2: Existing User Login
```typescript
test('User can login and access protected routes', async ({ page }) => {
  // Navigate to auth
  // Enter credentials
  // Verify redirect to home
  // Navigate to different protected routes
  // Verify persistence after refresh
})
```

#### Journey 3: Chat Conversation
```typescript
test('Users can send and receive real-time messages', async ({ page, context }) => {
  // Login as user 1
  // Login as user 2 in new context
  // User 1 sends message
  // Verify user 2 receives message in real-time
  // Verify typing indicators
  // Verify message status updates
})
```

#### Journey 4: Feed Interaction
```typescript
test('User can create post, like, and comment', async ({ page }) => {
  // Login
  // Create post with image
  // Like post
  // Add comment
  // Verify updates
})
```

#### Journey 5: Token Refresh Flow
```typescript
test('App handles token expiration gracefully', async ({ page }) => {
  // Login
  // Wait for token expiration (mock)
  // Make API request
  // Verify automatic refresh
  // Verify request succeeds
})
```

#### Journey 6: Error Handling
```typescript
test('App handles network errors gracefully', async ({ page }) => {
  // Login
  // Simulate network failure
  // Verify error messages
  // Verify retry mechanisms
})
```

---

## 5. Visual Regression Tests (Optional - Phase 3)

### Tools: Playwright Visual Comparisons or Percy

- **Components to Test:**
  - AuthForm variations
  - PostCard variations
  - ChatWindow states
  - StoriesTray
  - ProfileHeader
  - Mobile vs Desktop layouts

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Goal: Set up testing infrastructure and test critical paths**

#### Week 1: Setup
- [ ] Install and configure Vitest
- [ ] Install React Testing Library
- [ ] Install Playwright
- [ ] Set up test utilities and mocks
- [ ] Configure test coverage reporting
- [ ] Set up CI/CD integration

**Deliverables:**
```
vitest.config.ts
playwright.config.ts
src/test/
  setup.ts
  mocks/
    api.ts
    socket.ts
    localStorage.ts
  utils/
    test-utils.tsx
    render.tsx
```

#### Week 2: Critical Path Tests
- [ ] ApiClient unit tests (100%)
- [ ] authService unit tests (100%)
- [ ] SocketClient unit tests (90%)
- [ ] AuthContext integration tests (95%)
- [ ] AuthForm component tests (95%)
- [ ] E2E: Registration flow
- [ ] E2E: Login flow

**Coverage Target: 40%**

### Phase 2: Feature Expansion (Week 3-5)

#### Week 3: Chat & Real-time
- [ ] chatService unit tests
- [ ] ChatWindow integration tests
- [ ] MessageBubble component tests
- [ ] TypingIndicator tests
- [ ] useTypingIndicator hook tests
- [ ] E2E: Chat conversation

#### Week 4: Feed & Social Features
- [ ] feedService unit tests
- [ ] PostCard component tests
- [ ] CreatePostDialog component tests
- [ ] StoriesTray component tests
- [ ] E2E: Feed interactions

#### Week 5: Profiles & Relationships
- [ ] userService unit tests
- [ ] relationshipsService unit tests
- [ ] ProfileHeader component tests
- [ ] E2E: Profile viewing and editing

**Coverage Target: 70%**

### Phase 3: Edge Cases & Optimization (Week 6-7)

#### Week 6: Error Scenarios
- [ ] Network error handling
- [ ] Token expiration scenarios
- [ ] Socket connection failures
- [ ] API error responses
- [ ] Form validation edge cases
- [ ] E2E: Error recovery flows

#### Week 7: Performance & Polish
- [ ] Performance tests
- [ ] Load testing (if applicable)
- [ ] Visual regression tests
- [ ] Accessibility tests
- [ ] Mobile-specific tests
- [ ] Cross-browser E2E tests

**Coverage Target: 85%+**

---

## Testing Best Practices

### 1. Test Organization
```
src/
  components/
    auth/
      AuthForm.tsx
      AuthForm.test.tsx
  lib/
    api/
      client.ts
      client.test.ts
  __tests__/
    integration/
      auth-flow.test.tsx
    e2e/
      registration.spec.ts
```

### 2. Naming Conventions
- Test files: `*.test.ts` or `*.test.tsx`
- E2E files: `*.spec.ts`
- Use descriptive test names: `should [action] when [condition]`

### 3. Mock Strategy
- Mock external dependencies (API, socket, localStorage)
- Mock Next.js router
- Mock environment variables
- Use MSW (Mock Service Worker) for API mocking

### 4. Test Data
- Use factories for test data generation
- Keep test data realistic but minimal
- Use faker.js for dynamic test data

### 5. Continuous Integration
- Run tests on every PR
- Require minimum coverage threshold (start at 40%, increase gradually)
- Block merges if tests fail
- Generate and publish coverage reports

---

## Coverage Metrics

### Measurement Tools
- Vitest built-in coverage (using v8 or istanbul)
- Codecov or Coveralls for visualization
- SonarQube for code quality

### Coverage Targets by Layer

| Layer | Target Coverage | Priority |
|-------|----------------|----------|
| Utils | 95% | High |
| API Services | 90% | Critical |
| Socket Client | 90% | Critical |
| Auth Context | 95% | Critical |
| Custom Hooks | 85% | High |
| UI Components | 75% | Medium |
| Pages | 70% | Medium |
| E2E Critical Paths | 100% | Critical |

### Overall Coverage Goals
- **Phase 1:** 40% overall coverage
- **Phase 2:** 70% overall coverage
- **Phase 3:** 85% overall coverage
- **Long-term:** 90%+ overall coverage

---

## Risk Areas Requiring Extra Testing

### 1. Authentication & Token Management (CRITICAL)
- Token storage and retrieval
- Token refresh logic
- Session validation
- Logout and cleanup

### 2. Real-time Communication (CRITICAL)
- Socket connection reliability
- Message delivery and status
- Reconnection logic
- Error handling in prod vs dev

### 3. API Error Handling (HIGH)
- Network failures
- 401/403 responses
- Malformed responses
- Timeout scenarios

### 4. Race Conditions (HIGH)
- Multiple token refresh attempts
- Concurrent API calls
- Socket connection during navigation
- Message ordering

### 5. State Management (MEDIUM)
- Context updates
- Component re-renders
- Memory leaks
- Event listener cleanup

---

## Test Maintenance

### Code Review Checklist
- [ ] New features include tests
- [ ] Tests cover happy path and error cases
- [ ] Tests are readable and maintainable
- [ ] Mocks are appropriate
- [ ] Coverage threshold is met

### Continuous Improvement
- Review test failures regularly
- Refactor brittle tests
- Update tests when requirements change
- Monitor test execution time
- Remove obsolete tests

---

## Tools & Dependencies

### Required Dependencies

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^23.0.0",
    "@playwright/test": "^1.40.0",
    "msw": "^2.0.0",
    "@faker-js/faker": "^8.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

### Configuration Files Needed

1. **vitest.config.ts** - Vitest configuration
2. **playwright.config.ts** - Playwright configuration
3. **setup-tests.ts** - Global test setup
4. **.github/workflows/test.yml** - CI/CD pipeline

---

## Success Criteria

### Phase 1 Success Criteria
- [x] Testing infrastructure set up
- [ ] 40% code coverage achieved
- [ ] Critical paths tested (auth, token management)
- [ ] CI/CD pipeline running tests
- [ ] No blocking bugs found

### Phase 2 Success Criteria
- [ ] 70% code coverage achieved
- [ ] All major features tested
- [ ] Integration tests passing
- [ ] E2E tests for main user journeys
- [ ] Test documentation complete

### Phase 3 Success Criteria
- [ ] 85%+ code coverage achieved
- [ ] Edge cases handled
- [ ] Performance benchmarks met
- [ ] Visual regression tests in place
- [ ] Zero critical bugs

---

## Appendix

### A. Test Utilities Example

```typescript
// src/test/utils/test-utils.tsx
import { render } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'

export function renderWithAuth(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  )
}
```

### B. API Mock Example

```typescript
// src/test/mocks/api.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json()
    // Return mock response
    return HttpResponse.json({
      success: true,
      data: {
        user: { id: '1', name: 'Test User' },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token'
      }
    })
  })
]
```

### C. Socket Mock Example

```typescript
// src/test/mocks/socket.ts
export const mockSocketClient = {
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn(),
  isConnected: vi.fn().mockReturnValue(true),
  send: vi.fn(),
  on: vi.fn().mockReturnValue(() => {}),
  off: vi.fn(),
}
```

---

## Conclusion

This comprehensive test plan provides a structured approach to achieving maximum test coverage for the MindMap Frontend application. By following the phased implementation roadmap, the team can systematically build a robust test suite that ensures code quality, catches regressions early, and provides confidence in deployments.

**Next Steps:**
1. Review and approve this test plan
2. Allocate resources for Phase 1 implementation
3. Set up testing infrastructure
4. Begin writing tests for critical paths
5. Monitor coverage metrics and adjust as needed

**Estimated Timeline:** 7 weeks to reach 85% coverage
**Estimated Effort:** 2-3 developers working part-time on tests alongside feature development
