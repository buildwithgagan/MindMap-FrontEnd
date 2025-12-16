# Coding Standards

## General Principles

1. **Consistency** - Follow existing patterns and conventions
2. **Readability** - Write clear, self-documenting code
3. **Maintainability** - Keep components small and focused
4. **Type Safety** - Use TypeScript strictly, avoid `any`
5. **Error Handling** - Always handle errors gracefully

## Code Organization

### Component Structure
```typescript
"use client"; // If component uses client-side features

import { useState, useEffect } from "react";
import { Component } from "@/components/ui/component";
import { service } from "@/lib/api";
import type { Type } from "@/lib/api";
import { cn } from "@/lib/utils";

type ComponentProps = {
  prop: string;
};

export default function Component({ prop }: ComponentProps) {
  // 1. State declarations
  const [state, setState] = useState<Type | null>(null);
  
  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 3. Handlers
  const handleAction = async () => {
    // Handler logic
  };
  
  // 4. Render
  return (
    <div className={cn("base-classes", conditionalClasses)}>
      {/* JSX */}
    </div>
  );
}
```

### Function Organization
1. State declarations at the top
2. Effects after state
3. Event handlers after effects
4. Computed values before render
5. Return statement at the end

## Naming Conventions

### Variables
- **camelCase** for variables: `userName`, `isLoading`
- **camelCase** for functions: `handleClick`, `fetchData`
- **PascalCase** for components: `PostCard`, `AuthForm`
- **UPPER_SNAKE_CASE** for constants: `API_BASE_URL`

### Boolean Variables
- Prefix with `is`, `has`, `should`: `isLoading`, `hasError`, `shouldRender`
- Use descriptive names: `isAuthenticated`, `hasMorePosts`

### Event Handlers
- Prefix with `handle`: `handleClick`, `handleSubmit`, `handleChange`
- Use descriptive names: `handleLikePost`, `handleDeleteComment`

## Comments

### When to Comment
- Complex business logic
- Non-obvious code decisions
- Workarounds or temporary solutions
- API response structure handling
- Performance optimizations

### Comment Style
```typescript
// Single-line comments for brief explanations

/**
 * Multi-line comments for complex logic
 * Explain the why, not the what
 */

// TODO: Future improvements
// FIXME: Known issues
// NOTE: Important information
```

## Code Formatting

### Spacing
- Use 2 spaces for indentation
- Add blank lines between logical sections
- No trailing whitespace

### Line Length
- Prefer lines under 100 characters
- Break long lines at logical points
- Align continuation lines appropriately

### Braces
- Use braces for all blocks, even single-line
- Opening brace on same line
- Closing brace on new line

## Console Logging

### Development Logging
- Use descriptive emoji prefixes: `🚀`, `✅`, `❌`, `🔍`, `⚠️`
- Log in development only: `if (process.env.NODE_ENV === 'development')`
- Suppress sensitive data: `Authorization: '[REDACTED]'`
- Use structured logging: `console.log('Label:', { data })`

### Logging Patterns
```typescript
// Request logging
console.log('🚀 API Request:', {
  method: 'POST',
  url: '/api/endpoint',
  data: requestData,
});

// Success logging
console.log('✅ API Response:', {
  url: '/api/endpoint',
  status: 200,
  data: responseData,
});

// Error logging
console.error('❌ API Error:', {
  url: '/api/endpoint',
  error: error.message,
  stack: error.stack,
});

// Debug logging
console.log('🔍 Debug Info:', {
  variable: value,
  state: currentState,
});
```

## Code Quality

### Do's
- ✅ Extract reusable logic to hooks/utilities
- ✅ Keep components focused and small
- ✅ Use meaningful variable names
- ✅ Handle all error cases
- ✅ Add loading states for async operations
- ✅ Use TypeScript types strictly

### Don'ts
- ❌ Don't use `any` type
- ❌ Don't ignore TypeScript errors
- ❌ Don't leave console.logs in production code
- ❌ Don't create deeply nested components
- ❌ Don't duplicate code (DRY principle)
- ❌ Don't mutate state directly

## Performance Considerations

### Optimization Practices
- Use `useEffect` dependencies correctly
- Implement pagination for large lists
- Lazy load images with `loading="lazy"`
- Use skeleton loaders for better UX
- Avoid unnecessary re-renders
- Memoize expensive computations when needed

### Anti-patterns to Avoid
- ❌ Fetching data in render function
- ❌ Creating objects/arrays in render
- ❌ Missing dependency arrays in useEffect
- ❌ Infinite loops in useEffect
- ❌ Unnecessary state updates
