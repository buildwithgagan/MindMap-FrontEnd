// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

// Stories Types
export type StoryVisibility = 'PUBLIC' | 'FOLLOWERS';

export interface Story {
  id: string;
  authorId: string;
  mediaUrl: string;
  mediaType: MediaType; // 'IMAGE' | 'VIDEO'
  caption?: string;
  visibility: StoryVisibility;
  duration: number; // seconds
  expiresAt: string;
  createdAt: string;
  isViewed?: boolean;
}

export interface CreateStoryRequest {
  file?: File;
  mediaUrl?: string;
  caption?: string;
  visibility?: StoryVisibility;
  durationSeconds?: number;
}

export interface CreateStoryResponse {
  story: Story;
}

export interface StoriesFeedAuthor {
  id: string;
  name: string;
  profileImage?: string;
}

export interface StoriesFeedStory {
  id: string;
  authorId: string;
  mediaUrl: string;
  mediaType: MediaType; // 'IMAGE' | 'VIDEO'
  caption?: string;
  visibility: StoryVisibility;
  duration: number; // seconds
  expiresAt: string;
  createdAt: string;
  isViewed: boolean;
}

export interface StoriesFeedItem {
  author: StoriesFeedAuthor;
  stories: StoriesFeedStory[];
  hasUnseen: boolean;
  latestStoryAt: string;
}

export interface StoriesFeedResponse {
  items: StoriesFeedItem[];
}

export interface MarkStoryViewedData {
  viewedAt: string;
  alreadyViewed: boolean;
}

// Authentication Types
export interface RegisterStartRequest {
  identifier: string; // email or phone
}

export interface RegisterStartResponse {
  verificationId: string;
  expiresAt: string;
}

export interface RegisterVerifyRequest {
  verificationId: string;
  otp: string;
}

export interface RegisterVerifyResponse {
  registrationToken: string;
}

export interface RegisterCompleteRequest {
  registrationToken: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNo?: string;
  profileImage?: string;
  bio?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  isPrivate: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// User Profile Types
export type VerificationType = 'EMAIL' | 'PHONE';

export interface VerifyStartRequest {
  type: VerificationType;
}

export interface VerifyStartResponse {
  verificationId: string;
  expiresAt: string;
}

export interface VerifyConfirmRequest {
  type: VerificationType;
  verificationId: string;
  otp: string;
}

export interface UpdateProfileRequest {
  dob?: string;
  email?: string;
  phoneNo?: string;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
}

export interface ListUsersQuery {
  search?: string;
  cursor?: string;
  pageSize?: number;
}

// Media Types
export type MediaType = 'IMAGE' | 'VIDEO';

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number; // for videos
}

export interface MediaItem {
  url: string;
  type: MediaType;
  thumbnailUrl?: string;
  metadata?: MediaMetadata;
}

export interface UploadMediaResponse {
  url: string;
  key: string;
  type: MediaType;
}

// Feed Types
export interface Location {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PostSettings {
  hideLikes: boolean;
  turnOffComments: boolean;
}

export interface CreatePostRequest {
  mediaItems: MediaItem[];
  caption?: string;
  taggedUserIds?: string[];
  location?: Location;
  settings?: PostSettings;
}

export interface Post {
  id: string;
  author: User;
  type: 'POST' | 'REPOST';
  mediaItems: MediaItem[];
  caption?: string;
  taggedUsers?: User[];
  location?: Location;
  settings: PostSettings;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  originalPost?: Post; // for reposts
}

export interface GetFeedQuery {
  cursor?: string;
  pageSize?: number;
}

export interface ToggleLikeResponse {
  isLiked: boolean;
  likesCount: number;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  postId: string;
  parentCommentId?: string;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface GetCommentsQuery {
  cursor?: string;
  pageSize?: number;
}

export interface RepostRequest {
  caption?: string;
}

// Relationships Types
export interface Relationship {
  id: string;
  followerId: string;
  followingId: string;
  status: 'ACCEPTED' | 'PENDING';
  createdAt: string;
}

export interface FollowResponse {
  id: string;
  followerId: string;
  followingId: string;
  status: 'ACCEPTED' | 'PENDING';
  message: string;
}

export interface GetFollowersQuery {
  cursor?: string;
  limit?: number;
}

export interface GetFollowingQuery {
  cursor?: string;
  limit?: number;
}

export interface PendingFollowRequest {
  relationshipId: string;
  user: User;
  createdAt: string;
}

export interface GetPendingRequestsQuery {
  cursor?: string;
  limit?: number;
}

// Reports Types
export type ReportTargetType = 'POST' | 'COMMENT' | 'USER';
export type ReportReason = 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'NUDITY' | 'OTHER';

export interface CreateReportRequest {
  targetId: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  description?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

// Chat Types
export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface CreateConversationRequest {
  participantId: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  updatedAt: string;
}

export interface GetMessagesQuery {
  pageSize?: number;
  cursor?: string;
}
