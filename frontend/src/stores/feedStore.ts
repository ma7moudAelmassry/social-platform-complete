'use client';

import { create } from 'zustand';
import { Post, FeedItem } from '@/types';
import { api } from '@/lib/api';

interface FeedState {
  feed: FeedItem[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  error: string | null;

  fetchFeed: (reset?: boolean) => Promise<void>;
  addPost: (post: Post) => void;
  removePost: (postId: string) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  addComment: (postId: string) => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  feed: [],
  isLoading: false,
  hasMore: true,
  page: 1,
  error: null,

  fetchFeed: async (reset = false) => {
    const { page, feed, isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const currentPage = reset ? 1 : page;
      const response = await api.getFeed(currentPage, 10);
      const newItems = response.data.data || [];

      set({
        feed: reset ? newItems : [...feed, ...newItems],
        page: currentPage + 1,
        hasMore: response.data.pagination?.hasMore ?? false,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to load feed', isLoading: false });
    }
  },

  addPost: (post) => {
    set((state) => ({
      feed: [{ id: post.id, type: 'post', post }, ...state.feed],
    }));
  },

  removePost: (postId) => {
    set((state) => ({
      feed: state.feed.filter((item) => item.post?.id !== postId),
    }));
  },

  updatePost: (postId, updates) => {
    set((state) => ({
      feed: state.feed.map((item) =>
        item.post?.id === postId
          ? { ...item, post: { ...item.post!, ...updates } }
          : item
      ),
    }));
  },

  likePost: (postId) => {
    set((state) => ({
      feed: state.feed.map((item) =>
        item.post?.id === postId
          ? { ...item, post: { ...item.post!, isLiked: true, likesCount: item.post.likesCount + 1 } }
          : item
      ),
    }));
  },

  unlikePost: (postId) => {
    set((state) => ({
      feed: state.feed.map((item) =>
        item.post?.id === postId
          ? { ...item, post: { ...item.post!, isLiked: false, likesCount: Math.max(0, item.post.likesCount - 1) } }
          : item
      ),
    }));
  },

  addComment: (postId) => {
    set((state) => ({
      feed: state.feed.map((item) =>
        item.post?.id === postId
          ? { ...item, post: { ...item.post!, commentsCount: item.post.commentsCount + 1 } }
          : item
      ),
    }));
  },
}));
