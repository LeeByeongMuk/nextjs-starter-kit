import { prisma } from '@/server/utils/prisma';

export default function Token() {}

Token.saveRefreshToken = async function ({
  userId,
  refreshToken,
}: {
  userId: number;
  refreshToken: string;
}) {
  return prisma.$transaction(async prisma => {
    const result = await prisma.token.upsert({
      where: {
        user_id: userId,
      },
      update: {
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      create: {
        user_id: userId,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    if (!result) {
      return null;
    }

    return {
      ok: true,
    };
  });
};

Token.findRefreshToken = async function ({ userId }: { userId: number }) {
  const result = prisma.token.findUnique({
    where: {
      user_id: userId,
    },
  });

  if (!result) {
    return null;
  }

  return result;
};

Token.revokeRefreshToken = async function ({ userId }: { userId: number }) {
  return prisma.$transaction(async prisma => {
    const result = await prisma.token.delete({
      where: {
        user_id: userId,
      },
    });

    if (!result) {
      return null;
    }

    return {
      ok: true,
    };
  });
};
