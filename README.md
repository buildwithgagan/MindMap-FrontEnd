# ZenZone (MindMap Frontend)

> A minimalist social media platform focused on mindful connection and positive interactions, inspired by Apple's design philosophy.

ZenZone is a modern, ad-free social media application built with Next.js 15, React 19, and TypeScript. It provides a calm, distraction-free space for users to connect authentically, share meaningful content, and engage in quality conversations.

## ✨ Features

### Core Features

- **3-Step OTP Authentication Flow**
  - Email/phone input
  - OTP verification
  - Profile completion

- **Rich Media Feed**
  - Post cards with images/videos carousels
  - User avatars, names, and timestamps
  - Repost indicators
  - Social interaction buttons (like, comment, repost)
  - Stories tray with user stories

- **User Profiles**
  - Large avatar display
  - Bio and statistics (followers/following)
  - Verification badges (email/phone)
  - Privacy settings (public/private)
  - Follow/Request status buttons
  - Dynamic routing (`/profile/[username]`)

- **Real-time Chat Interface**
  - Split-view chat layout (desktop) / Full-screen (mobile)
  - Message bubbles with sender indicators
  - Status indicators (sent/delivered/read)
  - Typing animations
  - Chat list with unread counts
  - Responsive mobile/desktop views

- **Follow Request Management**
  - Notification-style list
  - Accept/decline actions
  - Soft pastel button design

- **Search & Discovery**
  - User search functionality
  - Content discovery

- **Landing Page**
  - Hero section
  - Feature showcase
  - Team introduction
  - FAQ section
  - Call-to-action sections

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15.5.9** - React framework with App Router
- **React 19.2.1** - UI library
- **TypeScript 5** - Type safety

### UI & Styling
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Sora Font** - Google Fonts (Apple-inspired typography)
- **shadcn/ui** - Component library built on Radix UI

### Form Handling & Validation
- **React Hook Form 7.54.2** - Form state management
- **Zod 3.24.2** - Schema validation
- **@hookform/resolvers** - Form validation integration

### AI Integration
- **Genkit 1.20.0** - AI development framework
- **@genkit-ai/google-genai** - Google AI integration
- **@genkit-ai/next** - Next.js integration for Genkit
- **Gemini 2.5 Flash** - AI model

### Additional Libraries
- **Firebase 11.9.1** - Backend services (ready for integration)
- **date-fns 3.6.0** - Date utilities
- **recharts 2.15.1** - Chart library
- **embla-carousel-react** - Carousel component
- **usehooks-ts** - React hooks utilities

## 📁 Project Structure

```
src/
├── ai/                          # AI integration (Genkit)
│   ├── dev.ts                  # Development AI setup
│   └── genkit.ts               # Genkit configuration
├── app/                         # Next.js App Router
│   ├── (main)/                 # Main app routes (authenticated)
│   │   ├── chat/               # Chat interface
│   │   ├── home/               # Home feed
│   │   ├── notifications/      # Notifications page
│   │   ├── profile/            # User profiles
│   │   │   └── [username]/     # Dynamic profile routes
│   │   ├── search/             # Search page
│   │   ├── layout.tsx          # Main layout with Sidebar/BottomNav
│   │   └── page.tsx            # Main app entry
│   ├── auth/                   # Authentication pages
│   │   ├── layout.tsx          # Auth layout
│   │   └── page.tsx            # Auth page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── auth/                   # Authentication components
│   │   └── AuthForm.tsx        # 3-step OTP form
│   ├── chat/                   # Chat components
│   │   ├── ChatList.tsx        # Chat list sidebar
│   │   ├── ChatWindow.tsx      # Chat conversation view
│   │   ├── MessageBubble.tsx   # Individual message component
│   │   └── TypingIndicator.tsx # Typing animation
│   ├── feed/                   # Feed components
│   │   ├── CreatePostDialog.tsx # Post creation modal
│   │   └── PostCard.tsx        # Post display component
│   ├── notifications/          # Notification components
│   │   └── RequestItem.tsx     # Follow request item
│   ├── profile/                # Profile components
│   │   └── ProfileHeader.tsx   # Profile header section
│   ├── shared/                 # Shared components
│   │   ├── BottomNavbar.tsx    # Mobile bottom navigation
│   │   ├── Logo.tsx            # Application logo
│   │   └── Sidebar.tsx         # Desktop sidebar navigation
│   ├── stories/                # Stories components
│   │   ├── StoriesTray.tsx     # Stories horizontal scroll
│   │   └── StoryView.tsx       # Story viewer
│   └── ui/                     # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (40+ UI components)
├── hooks/                       # Custom React hooks
│   └── use-toast.ts            # Toast notification hook
└── lib/                         # Utilities & data
    ├── data.ts                 # Mock data (users, posts, chats)
    ├── placeholder-images.ts   # Image placeholder utilities
    ├── placeholder-images.json # Image data
    └── utils.ts                # Utility functions (cn, etc.)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- (Optional) Firebase account for backend integration

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/buildwithgagan/MindMap-FrontEnd.git
   cd MindMap-FrontEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (if needed)
   ```bash
   cp .env.example .env.local
   ```
   Add your environment variables:
   - Firebase configuration (if using Firebase)
   - Genkit API keys (if using AI features)
   - Other service API keys

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

## 📜 Available Scripts

- `npm run dev` - Start development server with Turbopack on port 9002
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run genkit:watch` - Start Genkit with watch mode

## 🎨 Design System

### Color Palette

The design follows Apple's minimalist aesthetic with:

- **Background**: Light gray (#F7F7F7) / Dark mode support
- **Primary**: Subtle blue (#007AFF / hsl(211 100% 50%))
- **Secondary**: Off-white gray tones
- **Accents**: Muted blue and gray highlights

### Typography

- **Font Family**: Sora (Google Fonts) - Apple-inspired clean typeface
- **Font Weights**: 400 (Regular), 600 (Semibold), 700 (Bold)

### Design Principles

- **Large Border Radius**: 24px+ for cards and components
- **Diffused Shadows**: Soft, subtle shadows instead of harsh borders
- **Minimalist Icons**: Clear, recognizable icons from Lucide React
- **Smooth Animations**: Subtle transitions for enhanced UX
- **Responsive Design**: Sidebar collapses to bottom navigation on mobile

### Component Styling

- Cards use `rounded-3xl` (24px+ border radius)
- Shadows use custom `shadow-diffused` class
- Interactive elements have smooth hover/transition effects
- Mobile-first responsive breakpoints (md: 768px)

## 🏗️ Architecture

### Routing

- **App Router** (Next.js 15): Uses the modern App Router pattern
- **Route Groups**: `(main)` group for authenticated routes
- **Dynamic Routes**: `[username]` for user profiles
- **Layout Hierarchy**: Root layout → Auth/Main layouts → Page layouts

### State Management

- **React Hooks**: `useState`, `useEffect` for local state
- **URL State**: Next.js router for navigation state
- **Form State**: React Hook Form for form management

### Data Flow

Currently uses mock data from `src/lib/data.ts`. Ready for Firebase/backend integration:

- Users, posts, chats, notifications are defined in TypeScript
- Types are exported for type safety
- Easy to swap with API calls or Firebase queries

### Component Architecture

- **Server Components**: Default (pages, layouts)
- **Client Components**: Marked with `"use client"` where needed (interactivity, hooks)
- **Shared Components**: Reusable UI components in `components/ui/`
- **Feature Components**: Domain-specific components in feature folders

## 🔧 Key Components

### Authentication (`AuthForm.tsx`)

3-step wizard:
1. Email input
2. OTP verification
3. Profile completion

Features:
- Progress indicator
- Back navigation
- Form validation ready

### Feed (`PostCard.tsx`)

Post display component with:
- User avatar and info
- Media carousel (images/videos)
- Interaction buttons
- Repost indicators
- Timestamps

### Chat (`ChatWindow.tsx`, `ChatList.tsx`)

Real-time chat interface:
- Split view (desktop) / Full-screen (mobile)
- Message bubbles with status indicators
- Typing indicators
- Unread count badges

### Profile (`ProfileHeader.tsx`)

User profile display:
- Large avatar
- Bio and stats
- Verification badges
- Privacy-aware action buttons

## 🔐 Authentication Flow

1. **Email Input**: User enters email/phone
2. **OTP Verification**: 6-digit code sent and verified
3. **Profile Setup**: User completes name and username
4. **Redirect**: User redirected to `/home` feed

*Note: Currently UI-only. Backend integration needed for actual authentication.*

## 📱 Responsive Design

- **Desktop (>768px)**: Sidebar navigation, split chat views
- **Mobile (<768px)**: Bottom navigation bar, full-screen views
- **Breakpoints**: Uses Tailwind's `md:` breakpoint (768px)

## 🤖 AI Integration

Genkit is configured for AI features:
- Model: Google Gemini 2.5 Flash
- Integration: `@genkit-ai/google-genai`
- Setup: `src/ai/genkit.ts`

*Note: Requires API keys and backend setup for full functionality.*

## 🔮 Future Enhancements

- [ ] Firebase Authentication integration
- [ ] Real-time database (Firestore) for posts, chats
- [ ] Image upload and storage
- [ ] Push notifications
- [ ] Real-time chat with WebSockets
- [ ] Advanced search with filters
- [ ] Story creation and viewing
- [ ] Analytics and insights
- [ ] PWA support
- [ ] Dark mode toggle

## 🧪 Development Notes

### TypeScript Configuration

- Strict mode enabled
- Build errors ignored for rapid development (can be enabled later)
- ESLint warnings ignored during builds

### Image Optimization

Next.js Image component configured for:
- `placehold.co` - Placeholder images
- `images.unsplash.com` - Stock photos
- `picsum.photos` - Random images

### Code Style

- Functional components with TypeScript
- Custom hooks for reusable logic
- Utility functions in `lib/utils.ts`
- Consistent naming conventions

## 📄 License

[Add your license here]

## 👥 Contributors

[Add contributors here]

## 🙏 Acknowledgments

- Design inspiration from Apple's Human Interface Guidelines
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Built with ❤️ using Next.js, React, and TypeScript**
