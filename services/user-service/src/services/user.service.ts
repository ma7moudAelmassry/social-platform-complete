import { prisma } from '../utils/prisma';
import { cacheUser, getCachedUser, invalidateUserCache } from '../utils/redis';
import { logger } from '../utils/logger';

export class UserService {
  async getUserById(id: string) {
    const cached = await getCachedUser(id);
    if (cached) return cached;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) throw new Error('User not found');

    const result = {
      ...user,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      postsCount: 0, // Will be fetched from post service
    };

    await cacheUser(id, result);
    return result;
  }

  async getUserByUsername(username: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) throw new Error('User not found');

    let isFollowing = false;
    if (currentUserId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...user,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      postsCount: 0,
      isFollowing,
    };
  }

  async updateProfile(userId: string, data: {
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
    avatar?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.avatar && { avatar: data.avatar }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        isVerified: true,
        createdAt: true,
      },
    });

    await invalidateUserCache(userId);
    await cacheUser(userId, user);

    logger.info('Profile updated', { userId });
    return user;
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new Error('Already following this user');
    }

    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    await invalidateUserCache(followerId);
    await invalidateUserCache(followingId);

    logger.info('User followed', { followerId, followingId });
    return { success: true };
  }

  async unfollowUser(followerId: string, followingId: string) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    await invalidateUserCache(followerId);
    await invalidateUserCache(followingId);

    logger.info('User unfollowed', { followerId, followingId });
    return { success: true };
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              isVerified: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
    ]);

    return {
      data: followers.map((f: any) => f.follower),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + followers.length < total,
      },
    };
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              isVerified: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      data: following.map((f: any) => f.following),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + following.length < total,
      },
    };
  }

  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          isVerified: true,
        },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + users.length < total,
      },
    };
  }
}

export const userService = new UserService();
