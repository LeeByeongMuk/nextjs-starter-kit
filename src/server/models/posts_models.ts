import { PostType } from '@/app/types/api/post';
import { CustomError } from '@/server/utils/errorHandling';
import { prisma } from '@/server/utils/prisma';

export default function Posts() {}

Posts.getPosts = async function (req: {
  page?: number;
  type?: PostType;
  q?: string;
}) {
  const page = req.page || 1;
  const type = req.type || null;
  const q = req.q || '';

  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const whereCondition = {
    deleted_at: null,
    ...(type !== null && { type }),
    OR: [{ title: { contains: q } }, { contents: { contains: q } }],
  };

  const totalPosts = await prisma.post.count({ where: whereCondition });
  const posts = await prisma.post.findMany({
    where: whereCondition,
    skip,
    take: pageSize,
    orderBy: {
      created_at: 'desc',
    },
    select: {
      created_at: true,
      hit: true,
      id: true,
      title: true,
      type: true,
      user: {
        select: {
          id: true,
          name: true,
          nickname: true,
        },
      },
    },
  });
  const lastPage = Math.ceil(totalPosts / pageSize);

  if (!totalPosts || !posts) {
    throw new CustomError('Posts not found', 404);
  }

  return {
    data: posts,
    meta: {
      current_page: page, // 현재 페이지
      last_page: lastPage, // 마지막 페이지
      total: totalPosts, // 전체 게시글 수
    },
  };
};

Posts.getPostById = async function ({
  postId,
  userId,
}: {
  postId: number;
  userId: number;
}) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
      deleted_at: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          nickname: true,
        },
      },
    },
  });

  if (!post) {
    throw new CustomError('Post not found', 404);
  }

  const isEditable = post.user_id === userId;

  return {
    contents: post.contents,
    created_at: post.created_at.toISOString(),
    hit: post.hit,
    id: post.id,
    is_editable: isEditable,
    title: post.title,
    type: post.type,
    user_name: post.user.nickname || post.user.name,
  };
};

Posts.createPost = async function ({
  userId,
  ...req
}: {
  userId: number;
  title: string;
  contents: string;
  type: PostType;
  is_open: boolean;
}) {
  return prisma.$transaction(async prisma => {
    const result = await prisma.post.create({
      data: {
        title: req.title,
        contents: req.contents,
        type: req.type,
        is_open: req.is_open,
        user_id: userId,
        updated_at: new Date(),
      },
    });

    if (!result) {
      throw new CustomError('Failed to create post', 500);
    }

    return {
      id: result.id,
    };
  });
};

Posts.updatePost = async function ({
  userId,
  ...req
}: {
  userId: number;
  postId: number;
  title: string;
  contents: string;
  type: PostType;
  is_open: boolean;
}) {
  return prisma.$transaction(async prisma => {
    const result = await prisma.post.update({
      where: {
        id: req.postId,
        user_id: userId,
        deleted_at: null,
      },
      data: {
        title: req.title,
        contents: req.contents,
        type: req.type,
        is_open: req.is_open,
        updated_at: new Date(),
      },
    });

    if (!result) {
      throw new CustomError('Failed to update post', 500);
    }

    return {
      id: result.id,
    };
  });
};

Posts.getPostUpdateResourceById = async function ({
  postId,
  userId,
}: {
  postId: number;
  userId: number;
}) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      user_id: userId,
      deleted_at: null,
    },
    select: {
      id: true,
      title: true,
      contents: true,
      type: true,
      is_open: true,
    },
  });

  if (!post) {
    throw new CustomError('Post not found', 404);
  }

  return {
    id: post.id,
    title: post.title,
    contents: post.contents,
    type: post.type,
    is_open: post.is_open,
  };
};

Posts.deletePost = async function ({
  userId,
  postId,
}: {
  userId: number;
  postId: number;
}) {
  return prisma.$transaction(async prisma => {
    const result = await prisma.post.update({
      where: {
        id: postId,
        user_id: userId,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    if (!result) {
      throw new CustomError('Failed to delete post', 500);
    }

    return {
      id: result.id,
    };
  });
};
