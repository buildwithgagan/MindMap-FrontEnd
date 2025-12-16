# Project Structure

## Directory Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Main app routes (protected)
│   │   ├── chat/
│   │   ├── home/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── search/
│   │   └── layout.tsx     # Main layout with Sidebar & BottomNavbar
│   ├── auth/              # Authentication routes (public)
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles & CSS variables
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat-related components
│   ├── feed/              # Feed/post components
│   ├── notifications/    # Notification components
│   ├── profile/           # Profile components
│   ├── shared/            # Shared layout components
│   ├── stories/           # Stories feature components
│   ├── ui/                # shadcn/ui components
│   ├── ErrorBoundary.tsx  # Error boundary component
│   └── ErrorHandler.tsx   # Global error handler
├── contexts/              # React Context providers
│   └── AuthContext.tsx    # Authentication context
├── hooks/                 # Custom React hooks
│   ├── use-toast.ts       # Toast notifications hook
│   └── useTypingIndicator.ts
├── lib/                   # Utility libraries
│   ├── api/               # API client & services
│   │   ├── client.ts      # ApiClient singleton
│   │   ├── types.ts       # API type definitions
│   │   ├── services/      # API service modules
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   ├── feed.ts
│   │   │   ├── media.ts
│   │   │   ├── relationships.ts
│   │   │   ├── reports.ts
│   │   │   ├── user.ts
│   │   │   └── index.ts   # Service exports
│   │   └── index.ts       # Main API exports
│   ├── socket.ts          # Socket.io client singleton
│   ├── utils.ts           # Utility functions (cn helper)
│   ├── constants.ts       # App-wide constants
│   ├── error-handler.ts   # Error suppression utilities
│   └── chat-utils.ts      # Chat utility functions
└── middleware.ts          # Next.js middleware for route protection
```

## File Naming Conventions

### Components
- **PascalCase** for component files: `PostCard.tsx`, `AuthForm.tsx`
- **PascalCase** for component names: `export default function PostCard()`
- **camelCase** for utility components: `MediaItem` (internal component)

### Services & Utilities
- **camelCase** for service files: `auth.ts`, `feed.ts`
- **camelCase** for service exports: `export const authService = { ... }`
- **camelCase** for utility files: `utils.ts`, `constants.ts`

### Types & Interfaces
- **PascalCase** for types: `Post`, `User`, `ApiResponse<T>`
- **PascalCase** for interfaces: `interface AuthContextType`
- **PascalCase** for type aliases: `type MediaType = 'IMAGE' | 'VIDEO'`

### Hooks
- **camelCase** starting with "use": `useAuth`, `useTypingIndicator`
- File names: `use-toast.ts`, `useTypingIndicator.ts` (kebab-case or camelCase)

### Constants
- **UPPER_SNAKE_CASE** for constants: `API_BASE_URL`, `ACCESS_TOKEN_KEY`
- **PascalCase** for exported constants: `DEFAULT_PLACEHOLDER_IMAGE`

## Path Aliases

- `@/components` - Components
- `@/lib` - Utilities and services
- `@/hooks` - Custom hooks
- `@/contexts` - Context providers
- `@/app` - App router pages (rarely imported)

## Import Organization

### Import Order
1. React and Next.js imports
2. Third-party library imports
3. Internal component imports (from `@/components`)
4. Internal utility imports (from `@/lib`)
5. Type imports (using `import type`)
6. Relative imports (if any)

### Example
```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { feedService } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/api";
```
