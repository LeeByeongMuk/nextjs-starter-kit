import {
  CreatePostReq,
  PostData,
  PostListData,
  PostsReq,
  PostsRes,
  UpdatePostReq,
  UpdatePostResourceData,
} from '@/app/types/post';
import { CustomError } from '@/server/utils/errorHandling';
import { prisma } from '@/server/utils/prisma';

export default function Posts() {}

Posts.getPosts = async function (req: PostsReq): Promise<PostsRes> {
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
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const lastPage = Math.ceil(totalPosts / pageSize);

  return {
    data: posts as unknown as PostListData[],
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
}): Promise<PostData> {
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
    user_name: post.user.name,
  };
};

interface CreatePostReqWithUserId extends CreatePostReq {
  userId: number;
}

Posts.createPost = async function ({
  userId,
  ...req
}: CreatePostReqWithUserId): Promise<number> {
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

    return result.id;
  });
};

interface UpdatePostReqWithUserId extends UpdatePostReq {
  userId: number;
}

Posts.updatePost = async function ({
  userId,
  ...req
}: UpdatePostReqWithUserId): Promise<number> {
  return prisma.$transaction(async prisma => {
    const result = await prisma.post.update({
      where: {
        id: req.id,
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
      throw new CustomError('Post not found', 404);
    }

    return result.id;
  });
};

Posts.getPostUpdateResourceById = async function ({
  postId,
  userId,
}: {
  postId: number;
  userId: number;
}): Promise<UpdatePostResourceData> {
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

  if (!post) throw new CustomError('Post not found', 404);

  return {
    id: post.id,
    title: post.title,
    contents: post.contents,
    type: post.type,
    is_open: post.is_open,
  };
};
