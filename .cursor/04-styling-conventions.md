# Styling Conventions

## Tailwind CSS Usage

### General Principles
- **Use Tailwind utility classes** for all styling
- **Use `cn()` helper** for conditional classes
- **Follow mobile-first approach**: base styles for mobile, `md:` for desktop
- **Use CSS variables** for theming
- **Prefer semantic color tokens** over hardcoded colors

### Class Organization
```typescript
// ✅ Good: Organized classes
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  variant === "primary" && "primary-classes"
)}>

// ✅ Good: Using cn() helper
import { cn } from "@/lib/utils";

<div className={cn(
  "flex items-center gap-4",
  isActive && "bg-primary text-primary-foreground",
  disabled && "opacity-50 cursor-not-allowed"
)}>
```

### Responsive Design

#### Breakpoints
- Base styles: Mobile (default)
- `md:` - Tablet/Desktop (768px+)
- Use mobile-first approach

```typescript
// ✅ Good: Mobile-first
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Content</div>
</div>
```

#### Layout Patterns
- Sidebar hidden on mobile, visible on desktop
- BottomNavbar on mobile, Sidebar on desktop
- Container max-width: `max-w-3xl` for main content

### Design System

#### Border Radius
- Cards: `rounded-3xl`
- Buttons: `rounded-lg`
- Inputs: `rounded-md`
- Small elements: `rounded-sm`

#### Spacing
- Use consistent spacing scale: 4, 8, 12, 16, 20, 24, 32
- Gap utilities: `gap-2`, `gap-4`, `gap-8`
- Padding: `p-4`, `px-6`, `py-8`
- Margin: `mb-4`, `mt-8`

#### Shadows
- Cards: `shadow-diffused` (defined in globals.css)
- Buttons: Default shadow or none
- Hover effects: `hover:shadow-lg`

#### Typography
- Body text: `font-body`
- Headings: `font-headline`
- Code: `font-code`
- Sizes: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`

### Color System

#### Semantic Colors
Use CSS variable-based colors for theming:

```typescript
// ✅ Good: Semantic colors
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">
<div className="bg-card text-card-foreground">
<div className="bg-destructive text-destructive-foreground">
<div className="text-muted-foreground">
```

#### Color Tokens
- `background` - Main background
- `foreground` - Main text
- `primary` - Primary actions
- `secondary` - Secondary elements
- `muted` - Muted backgrounds/text
- `accent` - Accent elements
- `destructive` - Error/danger states
- `border` - Borders
- `input` - Input borders
- `ring` - Focus rings

### Dark Mode

#### Default Theme
- **Dark mode is the default** theme
- All components should work in dark mode
- Use CSS variables for colors (automatically themed)

```typescript
// ✅ Good: Uses CSS variables (auto-themed)
<div className="bg-background text-foreground border-border">
```

### Component Styling Patterns

#### Card Components
```typescript
<Card className="overflow-hidden border-none bg-card shadow-diffused rounded-3xl">
  <CardHeader className="flex flex-row items-center gap-4 p-4">
    {/* Header content */}
  </CardHeader>
  <CardContent className="space-y-4 p-4 pt-0">
    {/* Content */}
  </CardContent>
  <CardFooter className="grid grid-cols-4 gap-2 p-2">
    {/* Footer */}
  </CardFooter>
</Card>
```

#### Button Variants
```typescript
// Primary button
<Button variant="default" className="...">
  Primary Action
</Button>

// Ghost button
<Button variant="ghost" className="flex items-center gap-2">
  <Icon className="h-5 w-5" />
  <span>Label</span>
</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Icon className="h-5 w-5" />
</Button>
```

#### Form Elements
```typescript
// Input
<Input 
  className="w-full"
  placeholder="Enter text"
/>

// Label
<Label htmlFor="input-id">
  Label Text
</Label>

// Error state
<Input 
  className={cn(
    "w-full",
    hasError && "border-destructive"
  )}
/>
```

### Layout Patterns

#### Container
```typescript
// Main content container
<div className="container mx-auto h-full max-w-3xl px-4 py-8 md:py-12 w-full">
  {children}
</div>
```

#### Flex Layouts
```typescript
// Horizontal layout
<div className="flex items-center gap-4">
  {/* Items */}
</div>

// Vertical layout
<div className="flex flex-col gap-4">
  {/* Items */}
</div>

// Space between
<div className="flex items-center justify-between">
  {/* Items */}
</div>
```

#### Grid Layouts
```typescript
// Grid with columns
<div className="grid grid-cols-4 gap-2">
  {/* Items */}
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

### Image Styling

#### Image Containers
```typescript
// Aspect ratio container
<div 
  className="relative w-full overflow-hidden rounded-2xl bg-muted" 
  style={{ 
    aspectRatio: '16/9',
    minHeight: '400px',
    maxHeight: '600px',
  }}
>
  <img
    src={imageSrc}
    alt="Description"
    className="absolute inset-0 w-full h-full object-cover"
    loading="lazy"
  />
</div>
```

#### Avatar
```typescript
<Avatar className="h-12 w-12">
  <AvatarImage src={user.profileImage} alt={user.name} />
  <AvatarFallback>
    {user.name.charAt(0).toUpperCase()}
  </AvatarFallback>
</Avatar>
```

### Animation & Transitions

#### Transitions
```typescript
// Opacity transition
<img 
  className="transition-opacity duration-300"
  style={{ opacity: loaded ? 1 : 0 }}
/>

// Hover transitions
<Button className="transition-colors hover:bg-primary/90">
  Hover me
</Button>
```

#### Loading States
```typescript
// Skeleton loader
<Skeleton className="h-64 w-full rounded-3xl" />

// Spinner
<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
```

### Utility Classes

#### Common Combinations
```typescript
// Centered content
<div className="flex items-center justify-center min-h-screen">

// Full width container
<div className="w-full">

// Text truncation
<p className="truncate">Long text...</p>

// Scrollable container
<div className="overflow-y-auto max-h-96">

// Hidden on mobile, visible on desktop
<div className="hidden md:block">

// Visible on mobile, hidden on desktop
<div className="block md:hidden">
```

### CSS Variables

#### Custom Properties
All colors use HSL format via CSS variables:
- `--background`: Main background color
- `--foreground`: Main text color
- `--primary`: Primary color
- `--radius`: Border radius value

Access via Tailwind: `bg-background`, `text-foreground`, `rounded-lg`

### Best Practices

#### Do's
- ✅ Use `cn()` for conditional classes
- ✅ Use semantic color tokens
- ✅ Follow mobile-first approach
- ✅ Use consistent spacing scale
- ✅ Use CSS variables for theming
- ✅ Keep class names readable

#### Don'ts
- ❌ Don't use inline styles (except for dynamic values)
- ❌ Don't hardcode colors
- ❌ Don't mix Tailwind with CSS modules
- ❌ Don't use arbitrary values unless necessary
- ❌ Don't create deeply nested class strings
