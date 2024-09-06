import bcrypt from 'bcrypt';

import { SignUpReq } from '@/app/types/auth';
import { CustomError } from '@/server/utils/errorHandling';
import { prisma } from '@/server/utils/prisma';

export default function Users() {}

Users.getUser = async function (id: number) {
  return prisma.$transaction(async prisma => {
    const result = await prisma.user.findUnique({
      where: {
        id,
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
  });
};

Users.signIn = async function (req: SignUpReq): Promise<{ id: number }> {
  return prisma.$transaction(async prisma => {
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
  });
};

Users.createUser = async function (req: SignUpReq): Promise<{ id: number }> {
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

    return { id: result.id };
  });
};

Users.updateUser = async function ({ id, ...req }: any): Promise<{
  id: number;
  name: string;
  nickname: string;
  email: string;
}> {
  return prisma.$transaction(async prisma => {
    const result = await prisma.user.update({
      where: {
        id,
        deleted_at: null,
      },
      data: req,
    });

    if (!result) {
      throw new CustomError('User not found', 404);
    }

    return {
      id: result.id,
      name: result.name,
      nickname: result.nickname,
      email: result.email as string,
    };
  });
};

Users.deleteUser = async function ({
  id,
  ...req
}: {
  id: number;
  deleted_reason?: string;
}) {
  return prisma.$transaction(async prisma => {
    const result = await prisma.user.update({
      where: {
        id,
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

    // 유저 삭제 시 관련된 모든 리프레시 토큰 철회
    await prisma.token.deleteMany({
      where: { user_id: id },
    });

    return { id: result.id };
  });
};
