import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder | undefined => PlaceHolderImages.find(img => img.id === id);

export type User = {
  id: string;
  name: string;
  username: string;
  avatar: ImagePlaceholder;
  bio: string;
  stats: {
    followers: number;
    following: number;
  };
  isVerified: {
    email: boolean;
    phone: boolean;
  };
  privacy: 'public' | 'private';
  relation?: 'following' | 'requested' | 'none';
};

export type Post = {
  id: string;
  author: User;
  timestamp: string;
  content: string;
  media: ImagePlaceholder[];
  stats: {
    likes: number;
    comments: number;
    reposts: number;
  };
  isRepost?: boolean;
  repostedBy?: string;
};

export type Notification = {
  id: string;
  type: 'follow_request' | 'like' | 'comment';
  user: User;
  post?: Post;
  timestamp: string;
};

export type Message = {
    id: string;
    sender: 'me' | User;
    content: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
    createdAt?: string; // ISO timestamp for sorting
}

export type Chat = {
    id: string;
    user: User;
    messages: Message[];
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export type StoryItem = {
    id: string;
    type: 'image' | 'video';
    url: string;
    timestamp: string;
};

export type Story = {
    id: string;
    user: User;
    items: StoryItem[];
    seen: boolean;
};

export const users: User[] = [
  { id: 'user-1', name: 'Alex Drake', username: 'alexdrake', avatar: getImage('avatar-1')!, bio: 'Exploring the world one photo at a time. 📸', stats: { followers: 1258, following: 342 }, isVerified: { email: true, phone: true }, privacy: 'public', relation: 'following' },
  { id: 'user-2', name: 'Mia Wong', username: 'miaw', avatar: getImage('avatar-2')!, bio: 'Designer & Dreamer. Turning coffee into code.', stats: { followers: 894, following: 512 }, isVerified: { email: true, phone: false }, privacy: 'private', relation: 'requested' },
  { id: 'user-3', name: 'Leo Rivera', username: 'leorivera', avatar: getImage('avatar-3')!, bio: 'Just a guy who loves food and travel.', stats: { followers: 560, following: 780 }, isVerified: { email: false, phone: true }, privacy: 'public', relation: 'none' },
  { id: 'user-4', name: 'Sophia Chen', username: 'sophiac', avatar: getImage('avatar-4')!, bio: 'Bookworm. Artist. Overthinker.', stats: { followers: 2345, following: 123 }, isVerified: { email: true, phone: true }, privacy: 'public', relation: 'following' },
  { id: 'user-5', name: 'Noah Evans', username: 'noahevans', avatar: getImage('avatar-5')!, bio: 'Building the future.', stats: { followers: 50, following: 100 }, isVerified: { email: true, phone: false }, privacy: 'private', relation: 'none' },
];

export const posts: Post[] = [
  {
    id: 'post-1',
    author: users[0],
    timestamp: '2h ago',
    content: 'Found this incredible view on my morning hike. The world is full of wonders if you just look for them. #nature #hiking #adventure',
    media: [getImage('post-1-1')!, getImage('post-1-2')!],
    stats: { likes: 345, comments: 23, reposts: 12 },
  },
  {
    id: 'post-2',
    author: users[3],
    timestamp: '5h ago',
    content: 'Into the woods we go...',
    media: [getImage('post-2-1')!],
    stats: { likes: 789, comments: 56, reposts: 45 },
    isRepost: true,
    repostedBy: 'Alex Drake'
  },
  {
    id: 'post-3',
    author: users[1],
    timestamp: '1d ago',
    content: 'Golden hour at the beach is something else. So peaceful and serene. Can\'t wait to go back. 🌅',
    media: [getImage('post-3-1')!, getImage('post-3-2')!, getImage('post-3-3')!],
    stats: { likes: 1200, comments: 102, reposts: 88 },
  },
  {
    id: 'post-4',
    author: users[2],
    timestamp: '2d ago',
    content: 'Love the lines and shadows of this building. Urban exploration is my new favorite thing.',
    media: [getImage('post-4-1')!],
    stats: { likes: 450, comments: 30, reposts: 15 },
  },
];

export const notifications: Notification[] = [
    { id: 'notif-1', type: 'follow_request', user: users[4], timestamp: '10m ago' },
    { id: 'notif-2', type: 'follow_request', user: users[2], timestamp: '1h ago' },
];

export const chats: Chat[] = [
    {
        id: 'chat-1',
        user: users[0],
        lastMessage: "Yeah, I'm looking forward to it!",
        lastMessageTime: '10:42 AM',
        unreadCount: 2,
        messages: [
            { id: 'msg-1-1', sender: users[0], content: "Hey! Did you see the latest design mockups?", timestamp: "10:40 AM", status: 'read' },
            { id: 'msg-1-2', sender: 'me', content: "Oh, not yet. Are they in the shared folder?", timestamp: "10:41 AM", status: 'read' },
            { id: 'msg-1-3', sender: users[0], content: "Yep! Let me know what you think. We're presenting them tomorrow.", timestamp: "10:41 AM", status: 'delivered' },
            { id: 'msg-1-4', sender: users[0], content: "Yeah, I'm looking forward to it!", timestamp: "10:42 AM", status: 'delivered' },
        ],
    },
    {
        id: 'chat-2',
        user: users[3],
        lastMessage: 'Perfect, sounds good.',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        messages: [
            { id: 'msg-2-1', sender: 'me', content: "Are we still on for lunch tomorrow?", timestamp: "Yesterday", status: 'read' },
            { id: 'msg-2-2', sender: users[3], content: "Absolutely! 12:30 at The Corner Cafe?", timestamp: "Yesterday", status: 'read' },
            { id: 'msg-2-3', sender: 'me', content: "Perfect, sounds good.", timestamp: "Yesterday", status: 'sent' },
        ],
    }
];

export const stories: Story[] = [
  {
    id: 'my-story',
    user: users[0],
    items: [],
    seen: true,
  },
  {
    id: 'story-2',
    user: { ...users[1], name: 'Mia' },
    items: [
      { id: 'story-item-1', type: 'image', url: getImage('post-1-2')!.imageUrl, timestamp: '2h ago'},
    ],
    seen: false,
  },
  {
    id: 'story-3',
    user: { ...users[2], name: 'Leo' },
    items: [
      { id: 'story-item-2', type: 'image', url: getImage('post-2-1')!.imageUrl, timestamp: '4h ago'},
      { id: 'story-item-3', type: 'image', url: getImage('post-1-1')!.imageUrl, timestamp: '3h ago'},
    ],
    seen: false,
  },
    {
    id: 'story-4',
    user: { ...users[3], name: 'Sophia' },
    items: [
      { id: 'story-item-4', type: 'image', url: getImage('post-4-1')!.imageUrl, timestamp: '8h ago'},
    ],
    seen: true,
  },
];
