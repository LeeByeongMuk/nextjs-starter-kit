import bcrypt from 'bcrypt';

import { CustomError } from '@/server/utils/errorHandling';
import { prisma } from '@/server/utils/prisma';

export default function Users() {}

Users.getUser = async function ({ userId }: { userId: number }) {
  const result = await prisma.user.findUnique({
    where: {
      id: userId,
      deleted_at: null,
    },
  });

  if (!result) {
    throw new CustomError('User not found', 404);
  }

  return {
    id: result.id,
    name: result.name,
    nickname: result.nickname,
    email: result.email,
  };
};

Users.signIn = async function (req: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: {
      email: req.email,
      deleted_at: null,
    },
  });
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const isPasswordValid = bcrypt.compareSync(req.password, user.password);
  if (!isPasswordValid) {
    throw new CustomError('Invalid password', 401);
  }

  return {
    id: user.id,
  };
};

Users.createUser = async function (req: {
  email: string;
  name: string;
  nickname: string;
  password: string;
}) {
  const hashedPassword = await bcrypt.hash(req.password, 10);

  return prisma.$transaction(async prisma => {
    const result = await prisma.user.create({
      data: {
        email: req.email,
        name: req.name,
        nickname: req.nickname,
        password: hashedPassword,
      },
    });

    if (!result) {
      throw new CustomError('Error creating user', 500);
    }

    return {
      id: result.id,
    };
  });
};

Users.updateUser = async function ({
  userId,
  ...req
}: {
  userId: number;
  name: string;
  nickname: string;
  email: string;
}) {
  return prisma.$transaction(async prisma => {
    const result = await prisma.user.update({
      where: {
        id: userId,
        deleted_at: null,
      },
      data: {
        name: req.name,
        nickname: req.nickname,
        email: req.email,
      },
    });

    if (!result) {
      throw new CustomError('User not found', 404);
    }

    return {
      id: result.id,
      name: result.name,
      nickname: result.nickname,
      email: result.email,
    };
  });
};

Users.deleteUser = async function ({
  userId,
  ...req
}: {
  userId: number;
  deleted_reason?: string;
}) {
  return prisma.$transaction(async prisma => {
    const result = await prisma.user.update({
      where: {
        id: userId,
        deleted_at: null,
      },
      data: {
        deleted_reason: req.deleted_reason || null,
        deleted_at: new Date(),
      },
    });

    if (!result) {
      throw new CustomError('User not found', 404);
    }

    await prisma.token.deleteMany({
      where: {
        user_id: userId,
      },
    });

    return {
      ok: true,
    };
  });
};
