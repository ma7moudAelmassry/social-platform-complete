import axios from 'axios';
import { config } from '../config';
import { cacheFeed, getCachedFeed, invalidateFeed } from '../utils/redis';
import { logger } from '../utils/logger';

export class FeedService {
  async getFeed(userId: string, page: number = 1, limit: number = 10) {
    // Try cache first for page 1
    if (page === 1) {
      const cached = await getCachedFeed(userId);
      if (cached) {
        logger.info('Feed served from cache', { userId });
        return {
          data: cached.slice(0, limit),
          pagination: { page, limit, total: cached.length, hasMore: cached.length > limit },
        };
      }
    }

    // Get following list from user service
    let followingIds: string[] = [];
    try {
      const response = await axios.get(`${config.userServiceUrl}/users/${userId}/following`, {
        params: { limit: 1000 },
      });
      followingIds = response.data.data.data.map((u: any) => u.id);
    } catch (error) {
      logger.warn('Failed to fetch following list', { userId, error });
    }

    // Get posts from post service
    let posts: any[] = [];
    try {
      // Get posts from followed users + own posts
      const authorIds = [...followingIds, userId];

      // For now, fetch recent posts and filter
      const response = await axios.get(`${config.postServiceUrl}/posts/search`, {
        params: { q: '*', page, limit: limit * 3 },
      });

      posts = (response.data.data?.data || []).filter((post: any) => 
        authorIds.includes(post.authorId)
      );
    } catch (error) {
      logger.warn('Failed to fetch posts', { error });
    }

    // Sort by createdAt desc
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Enrich with user data
    const enrichedPosts = await this.enrichPostsWithUsers(posts.slice(0, limit));

    // Cache for page 1
    if (page === 1) {
      await cacheFeed(userId, enrichedPosts);
    }

    return {
      data: enrichedPosts.map((post) => ({ id: post.id, type: 'post', post })),
      pagination: {
        page,
        limit,
        total: posts.length,
        hasMore: posts.length > limit,
      },
    };
  }

  async getExploreFeed(page: number = 1, limit: number = 10) {
    try {
      const response = await axios.get(`${config.postServiceUrl}/posts/search`, {
        params: { q: '*', page, limit },
      });

      const posts = response.data.data?.data || [];
      const enrichedPosts = await this.enrichPostsWithUsers(posts);

      return {
        data: enrichedPosts.map((post) => ({ id: post.id, type: 'post', post })),
        pagination: {
          page,
          limit,
          total: response.data.data?.pagination?.total || 0,
          hasMore: response.data.data?.pagination?.hasMore || false,
        },
      };
    } catch (error) {
      logger.error('Failed to get explore feed', { error });
      return { data: [], pagination: { page, limit, total: 0, hasMore: false } };
    }
  }

  async search(query: string, type?: string, page: number = 1, limit: number = 20) {
    const results: any = { users: [], posts: [], hashtags: [] };

    if (!type || type === 'users') {
      try {
        const response = await axios.get(`${config.userServiceUrl}/users/search`, {
          params: { q: query, page, limit },
        });
        results.users = response.data.data?.data || [];
      } catch (error) {
        logger.warn('User search failed', { error });
      }
    }

    if (!type || type === 'posts') {
      try {
        const response = await axios.get(`${config.postServiceUrl}/posts/search`, {
          params: { q: query, page, limit },
        });
        const posts = response.data.data?.data || [];
        results.posts = await this.enrichPostsWithUsers(posts);
      } catch (error) {
        logger.warn('Post search failed', { error });
      }
    }

    if (!type || type === 'hashtags') {
      try {
        const response = await axios.get(`${config.postServiceUrl}/posts/trending`, {
          params: { limit },
        });
        results.hashtags = response.data.data || [];
      } catch (error) {
        logger.warn('Hashtag search failed', { error });
      }
    }

    return results;
  }

  async getTrendingTopics(limit: number = 10) {
    try {
      const response = await axios.get(`${config.postServiceUrl}/posts/trending`, {
        params: { limit },
      });
      return response.data.data || [];
    } catch (error) {
      logger.warn('Failed to get trending topics', { error });
      return [];
    }
  }

  private async enrichPostsWithUsers(posts: any[]): Promise<any[]> {
    const userIds = [...new Set(posts.map((p) => p.authorId))];
    const users: Record<string, any> = {};

    // Fetch user data in parallel
    await Promise.all(
      userIds.map(async (id) => {
        try {
          const response = await axios.get(`${config.userServiceUrl}/users/${id}`);
          users[id] = response.data.data;
        } catch (error) {
          users[id] = {
            id,
            username: 'unknown',
            displayName: 'Unknown User',
            avatar: null,
            isVerified: false,
          };
        }
      })
    );

    return posts.map((post) => ({
      ...post,
      author: users[post.authorId] || {
        id: post.authorId,
        username: 'unknown',
        displayName: 'Unknown User',
        avatar: null,
        isVerified: false,
      },
    }));
  }
}

export const feedService = new FeedService();
