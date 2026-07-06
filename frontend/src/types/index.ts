export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  isFollowing?: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  media: Media[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  hashtags: string[];
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video' | 'gif';
  width: number;
  height: number;
  thumbnail?: string;
  duration?: number;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'share';
  actor: User;
  targetId: string;
  targetType: 'post' | 'comment' | 'user' | 'message';
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender: User;
  content: string;
  media?: Media;
  read: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedItem {
  id: string;
  type: 'post' | 'suggested_follow' | 'trending';
  post?: Post;
  suggestedUsers?: User[];
  trendingTopics?: TrendingTopic[];
}

export interface TrendingTopic {
  id: string;
  name: string;
  postsCount: number;
  category: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CreatePostInput {
  content: string;
  media?: File[];
  hashtags?: string[];
  mentions?: string[];
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: File;
}

export interface SearchResult {
  users: User[];
  posts: Post[];
  hashtags: TrendingTopic[];
}
