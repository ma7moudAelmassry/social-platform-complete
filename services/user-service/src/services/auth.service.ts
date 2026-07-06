import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateTokens, revokeRefreshToken, revokeAllUserTokens } from '../utils/jwt';
import { cacheUser, invalidateUserCache } from '../utils/redis';
import { logger } from '../utils/logger';

export class AuthService {
  async register(data: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        displayName: data.displayName,
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

    const tokens = await generateTokens({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    await cacheUser(user.id, user);

    logger.info('User registered', { userId: user.id, username: user.username });

    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account has been deactivated');
    }

    const tokens = await generateTokens({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      website: user.website,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    await cacheUser(user.id, userWithoutPassword);

    logger.info('User logged in', { userId: user.id });

    return { user: userWithoutPassword, ...tokens };
  }

  async refreshToken(token: string) {
    const { verifyRefreshToken, generateTokens } = await import('../utils/jwt');
    const user = await verifyRefreshToken(token);

    await revokeRefreshToken(token);

    const tokens = await generateTokens({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    return tokens;
  }

  async logout(token: string) {
    await revokeRefreshToken(token);
    logger.info('User logged out');
  }

  async logoutAll(userId: string) {
    await revokeAllUserTokens(userId);
    await invalidateUserCache(userId);
    logger.info('User logged out from all devices', { userId });
  }
}

export const authService = new AuthService();
