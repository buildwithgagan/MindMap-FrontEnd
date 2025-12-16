# TypeScript Rules

## Type Safety Standards

### Strict Mode
- **Always use strict TypeScript** (enabled in tsconfig.json)
- Never disable strict mode
- Fix type errors, don't suppress them

### Type Definitions

#### Interfaces vs Types
- **Use interfaces** for object shapes that might be extended
- **Use type aliases** for unions, primitives, and computed types

```typescript
// ✅ Good: Interface for object shape
interface User {
  id: string;
  name: string;
  email?: string;
}

// ✅ Good: Type alias for union
type MediaType = 'IMAGE' | 'VIDEO';

// ✅ Good: Type alias for computed type
type UserKeys = keyof User;
```

#### Generic Types
- Use generics for reusable structures
- Provide meaningful generic names: `T`, `K`, `V` for simple cases

```typescript
// ✅ Good: Generic API response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ✅ Good: Generic function
function getValue<T>(key: string): T | null {
  // Implementation
}
```

### Type Annotations

#### Required Annotations
- Function parameters
- Function return types (when not obvious)
- Component props
- State variables (when type can't be inferred)
- Complex object literals

```typescript
// ✅ Good: Explicit return type
async function fetchData(): Promise<ApiResponse<Post[]>> {
  // Implementation
}

// ✅ Good: Explicit state type
const [user, setUser] = useState<User | null>(null);

// ✅ Good: Explicit props type
type PostCardProps = {
  post: Post;
  onLike?: (postId: string) => void;
};
```

#### Type Inference
- Let TypeScript infer types when obvious
- Don't over-annotate simple cases

```typescript
// ✅ Good: Type inferred
const count = 0; // number
const name = "John"; // string
const items = []; // any[] - but should be typed!

// ✅ Better: Explicit array type
const items: Post[] = [];
```

### Null Safety

#### Nullable Types
- Use `Type | null` for nullable values
- Use optional properties: `email?: string`
- Check for existence before accessing

```typescript
// ✅ Good: Nullable type
const [user, setUser] = useState<User | null>(null);

// ✅ Good: Optional property
interface User {
  email?: string;
  profileImage?: string;
}

// ✅ Good: Null check
if (user) {
  console.log(user.email);
}
```

#### Nullish Coalescing
- Use `??` for default values
- Use `?.` for optional chaining

```typescript
// ✅ Good: Nullish coalescing
const name = user?.name ?? 'Anonymous';
const count = items?.length ?? 0;

// ✅ Good: Optional chaining
const email = user?.profile?.email;
```

### Type Assertions

#### When to Use
- Use sparingly and only when necessary
- Prefer type guards over assertions
- Document why assertion is needed

```typescript
// ❌ Bad: Unsafe assertion
const data = response as Post[];

// ✅ Better: Type guard
function isPostArray(data: unknown): data is Post[] {
  return Array.isArray(data) && data.every(item => 'id' in item);
}

if (isPostArray(response)) {
  const data = response; // TypeScript knows it's Post[]
}
```

### Common Patterns

#### API Response Handling
```typescript
// ✅ Good: Handle different response structures
if (response && typeof response === 'object' && 'success' in response) {
  const apiResponse = response as ApiResponse<Post[]>;
  if (apiResponse.success && apiResponse.data) {
    setPosts(apiResponse.data);
  }
}
```

#### Component Props
```typescript
// ✅ Good: Explicit props type
type ComponentProps = {
  required: string;
  optional?: number;
  children?: ReactNode;
  onClick?: () => void;
};

export default function Component({ 
  required, 
  optional, 
  children,
  onClick 
}: ComponentProps) {
  // Implementation
}
```

#### Event Handlers
```typescript
// ✅ Good: Typed event handlers
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // Handler logic
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;
  // Handler logic
};
```

### Type Guards

#### Custom Type Guards
```typescript
// ✅ Good: Type guard function
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    typeof (obj as any).id === 'string'
  );
}

// Usage
if (isUser(data)) {
  // TypeScript knows data is User
  console.log(data.name);
}
```

### Never Use

#### `any` Type
- ❌ Never use `any` type
- Use `unknown` if type is truly unknown
- Use proper types or type guards

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data');
}
```

#### Type Assertions Without Checks
```typescript
// ❌ Bad: Unsafe assertion
const user = response.data as User;

// ✅ Good: Check first
if (response.data && 'id' in response.data) {
  const user = response.data as User;
}
```

### Type Definitions Location

#### Where to Define Types
- **API types**: `src/lib/api/types.ts`
- **Component props**: In the component file
- **Shared types**: Create a shared types file if used in multiple places
- **Context types**: In the context file

```typescript
// src/lib/api/types.ts
export interface User {
  id: string;
  name: string;
}

// Component file
import type { User } from "@/lib/api";

type ProfileCardProps = {
  user: User;
};
```

### Utility Types

#### Common Utility Types
```typescript
// Partial - all properties optional
type PartialUser = Partial<User>;

// Pick - select specific properties
type UserPreview = Pick<User, 'id' | 'name' | 'profileImage'>;

// Omit - exclude specific properties
type UserWithoutId = Omit<User, 'id'>;

// Required - make all properties required
type RequiredUser = Required<User>;
```
