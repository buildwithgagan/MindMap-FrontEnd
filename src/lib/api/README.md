# API Client Documentation

This directory contains the complete API client implementation for the MindMap backend API.

## Setup

1. **Environment Variables**

   The project uses environment-specific configuration:
   
   - **Development** (`.env.development`): Uses `http://localhost:3000`
   - **Production** (`.env.production`): Uses `https://mind-map-x41e.vercel.app`
   
   Environment variables:
   - `NEXT_PUBLIC_API_BASE_URL` - Base URL for REST API calls
   - `NEXT_PUBLIC_WS_BASE_URL` - Base URL for WebSocket connections (optional, falls back to API_BASE_URL)
   
   For local overrides, create `.env.local` (gitignored):
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_WS_BASE_URL=http://localhost:3000
   ```

## Structure

```
src/lib/api/
├── client.ts          # Base API client with token management
├── types.ts           # TypeScript types for all API requests/responses
├── services/          # Service modules organized by feature
│   ├── auth.ts        # Authentication endpoints
│   ├── user.ts        # User profile endpoints
│   ├── media.ts       # Media upload endpoints
│   ├── feed.ts        # Feed/post endpoints
│   ├── relationships.ts # Follow/unfollow endpoints
│   ├── reports.ts     # Reporting endpoints
│   ├── chat.ts        # Chat/conversation endpoints
│   └── index.ts       # Centralized exports
└── index.ts           # Main API exports
```

## Usage

### Authentication

```typescript
import { authService } from '@/lib/api';

// Register (3-step flow)
const startResponse = await authService.registerStart({ identifier: 'user@example.com' });
const verifyResponse = await authService.registerVerify({ 
  verificationId: startResponse.data.verificationId, 
  otp: '000000' 
});
const completeResponse = await authService.registerComplete({
  registrationToken: verifyResponse.data.registrationToken,
  password: 'SecurePass123!',
  name: 'John Doe'
});

// Login
const loginResponse = await authService.login({
  identifier: 'user@example.com',
  password: 'SecurePass123!'
});

// Get current user
const userResponse = await authService.getCurrentUser();

// Logout
await authService.logout({ refreshToken: apiClient.getRefreshToken()! });
```

### Feed

```typescript
import { feedService } from '@/lib/api';

// Create post
const post = await feedService.createPost({
  mediaItems: [{
    url: 'https://example.com/image.jpg',
    type: 'IMAGE',
    metadata: { width: 1920, height: 1080 }
  }],
  caption: 'My first post!',
  settings: { hideLikes: false, turnOffComments: false }
});

// Get feed
const feed = await feedService.getFeed({ pageSize: 20 });

// Like/unlike post
const likeResponse = await feedService.toggleLike('post-id');

// Add comment
const comment = await feedService.addComment('post-id', {
  content: 'Great post!'
});
```

### User Profile

```typescript
import { userService } from '@/lib/api';

// Update profile
const updated = await userService.updateProfile({
  bio: 'New bio',
  dob: '1990-01-01',
  gender: 'male'
});

// List users
const users = await userService.listUsers({ 
  search: 'john', 
  pageSize: 20 
});
```

### Media Upload

```typescript
import { mediaService } from '@/lib/api';

// Upload image/video
const file = new File([...], 'image.jpg', { type: 'image/jpeg' });
const uploadResponse = await mediaService.uploadMedia(file);
// Use uploadResponse.data.url in your post creation
```

### Relationships

```typescript
import { relationshipsService } from '@/lib/api';

// Follow user
await relationshipsService.followUser('user-id');

// Get followers
const followers = await relationshipsService.getFollowers('user-id');

// Accept follow request
await relationshipsService.acceptFollowRequest('relationship-id');
```

### Chat

```typescript
import { chatService } from '@/lib/api';

// Create or find conversation
const conversation = await chatService.createOrFindConversation({
  participantId: 'user-id'
});

// Get messages
const messages = await chatService.getMessages('conversation-id', {
  pageSize: 50
});
```

## Token Management

The API client automatically manages authentication tokens:

- **Automatic Storage**: Tokens are saved to `localStorage` after login/registration
- **Automatic Refresh**: Access tokens are automatically refreshed when expired (401 errors)
- **Manual Access**: Use `apiClient.getAccessToken()` and `apiClient.getRefreshToken()` if needed

```typescript
import { apiClient } from '@/lib/api';

// Get tokens
const accessToken = apiClient.getAccessToken();
const refreshToken = apiClient.getRefreshToken();

// Clear tokens (on logout)
apiClient.clearTokens();
```

## Error Handling

All API methods throw errors that should be caught:

```typescript
try {
  const response = await authService.login({ identifier, password });
  if (response.success) {
    // Handle success
  }
} catch (error) {
  // Handle error
  console.error('Login failed:', error.message);
}
```

## Type Safety

All API methods are fully typed. Import types as needed:

```typescript
import type { User, Post, Comment, ApiResponse } from '@/lib/api';

function handleUser(user: User) {
  // TypeScript knows all User properties
}
```

## Notes

- All authenticated endpoints automatically include the `Authorization` header
- The client handles token refresh automatically on 401 errors
- File uploads use `FormData` and are handled separately from JSON requests
- Pagination uses cursor-based pagination (see `PaginatedResponse` type)
