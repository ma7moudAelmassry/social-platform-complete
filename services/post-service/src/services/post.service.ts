import { Post, IPost } from '../models/Post';
import { Comment } from '../models/Comment';
import { Like } from '../models/Like';
import { Save } from '../models/Save';
import { cachePost, getCachedPost, invalidatePostCache, cacheFeed, getCachedFeed } from '../utils/redis';
import { logger } from '../utils/logger';

export class PostService {
  async createPost(data: {
    authorId: string;
    content: string;
    media?: any[];
    hashtags?: string[];
    mentions?: string[];
  }) {
    const post = await Post.create({
      authorId: data.authorId,
      content: data.content,
      media: data.media || [],
      hashtags: data.hashtags || [],
      mentions: data.mentions || [],
    });

    // Invalidate user's feed cache
    await invalidatePostCache(post.id);

    logger.info('Post created', { postId: post.id, authorId: data.authorId });
    return post;
  }

  async getPost(postId: string, userId?: string) {
    // Try cache first
    const cached = await getCachedPost(postId);
    if (cached) {
      if (userId) {
        cached.isLiked = await this.isPostLiked(postId, userId);
        cached.isSaved = await this.isPostSaved(postId, userId);
      }
      return cached;
    }

    const post = await Post.findById(postId).lean();
    if (!post || post.isDeleted) {
      throw new Error('Post not found');
    }

    const result = {
      ...post,
      id: post._id.toString(),
      isLiked: userId ? await this.isPostLiked(postId, userId) : false,
      isSaved: userId ? await this.isPostSaved(postId, userId) : false,
    };

    await cachePost(postId, result);
    return result;
  }

  async getUserPosts(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: Array<Record<string, any> & { id: string }>;
    pagination: { page: number; limit: number; total: number; hasMore: boolean };
  }> {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ authorId: userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({ authorId: userId, isDeleted: false }),
    ]);

    return {
      data: posts.map((post) => ({ ...post, id: post._id.toString() })),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total,
      },
    };
  }

  async deletePost(postId: string, userId: string) {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');
    if (post.authorId !== userId) throw new Error('Unauthorized');

    post.isDeleted = true;
    await post.save();

    await invalidatePostCache(postId);
    logger.info('Post deleted', { postId, userId });
    return { success: true };
  }

  async likePost(postId: string, userId: string) {
    const existingLike = await Like.findOne({ postId, userId });
    if (existingLike) {
      throw new Error('Already liked');
    }

    await Like.create({ postId, userId });
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
    await invalidatePostCache(postId);

    logger.info('Post liked', { postId, userId });
    return { success: true };
  }

  async unlikePost(postId: string, userId: string) {
    const result = await Like.findOneAndDelete({ postId, userId });
    if (result) {
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      await invalidatePostCache(postId);
    }

    logger.info('Post unliked', { postId, userId });
    return { success: true };
  }

  async savePost(postId: string, userId: string) {
    const existingSave = await Save.findOne({ postId, userId });
    if (existingSave) {
      await Save.findOneAndDelete({ postId, userId });
      logger.info('Post unsaved', { postId, userId });
      return { saved: false };
    }

    await Save.create({ postId, userId });
    logger.info('Post saved', { postId, userId });
    return { saved: true };
  }

  async isPostLiked(postId: string, userId: string): Promise<boolean> {
    const like = await Like.findOne({ postId, userId });
    return !!like;
  }

  async isPostSaved(postId: string, userId: string): Promise<boolean> {
    const save = await Save.findOne({ postId, userId });
    return !!save;
  }

  async getComments(
    postId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: Array<Record<string, any> & { id: string }>;
    pagination: { page: number; limit: number; total: number; hasMore: boolean };
  }> {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ postId, isDeleted: false, parentId: { $exists: false } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ postId, isDeleted: false }),
    ]);

    return {
      data: comments.map((c) => ({ ...c, id: c._id.toString() })),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + comments.length < total,
      },
    };
  }

  async createComment(postId: string, authorId: string, content: string) {
    const comment = await Comment.create({
      postId,
      authorId,
      content,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    await invalidatePostCache(postId);

    logger.info('Comment created', { commentId: comment.id, postId, authorId });
    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== userId) throw new Error('Unauthorized');

    comment.isDeleted = true;
    await comment.save();

    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });
    await invalidatePostCache(comment.postId);

    logger.info('Comment deleted', { commentId, userId });
    return { success: true };
  }

  async searchPosts(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: Array<Record<string, any> & { id: string }>;
    pagination: { page: number; limit: number; total: number; hasMore: boolean };
  }> {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(
        { $text: { $search: query }, isDeleted: false },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({ $text: { $search: query }, isDeleted: false }),
    ]);

    return {
      data: posts.map((post) => ({ ...post, id: post._id.toString() })),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total,
      },
    };
  }

  async getTrendingHashtags(limit: number = 10) {
    const result = await Post.aggregate([
      { $match: { isDeleted: false, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return result.map((item) => ({
      name: item._id,
      postsCount: item.count,
    }));
  }
}

export const postService = new PostService();
