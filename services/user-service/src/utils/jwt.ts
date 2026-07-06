import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from './prisma';

export interface TokenPayload {
  id: string;
  username: string;
  email: string;
}

export const generateTokens = async (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  const refreshToken = jwt.sign(
    { id: payload.id, type: 'refresh' },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: payload.id,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

export const verifyRefreshToken = async (token: string) => {
  const decoded = jwt.verify(token, config.jwtRefreshSecret) as { id: string; type: string };

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new Error('Invalid or expired refresh token');
  }

  return storedToken.user;
};

export const revokeRefreshToken = async (token: string) => {
  await prisma.refreshToken.delete({ where: { token } });
};

export const revokeAllUserTokens = async (userId: string) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};
