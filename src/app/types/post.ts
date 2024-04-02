type PostType = 'notice' | 'faq' | '';

interface PostsReq {
  page: number;
  type: PostType;
  q: string;
}

type PostListSearch = Omit<PostsReq, 'page'>;

interface PostListData {
  created_at: string;
  hit: number;
  id: number;
  title: string;
  type: 'notice' | 'post' | null;
  user: {
    id: number;
    name: string;
  };
}

interface PostsRes {
  data: PostListData[];
  links: {
    first: string;
    last: string;
    next: string | null;
    prev: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

interface PostReq {
  id: number;
}

interface PostData {
  contents: string;
  created_at: string;
  hit: number;
  id: number;
  title: string;
  type: 'notice' | 'post' | null;
  user: {
    name: string;
    nickname: string;
  };
}

interface PostRes {
  data: PostData;
}

interface PostCreateReq {
  title: string;
  type: string | null;
  contents: string;
  is_open: boolean | null;
}

interface PostCreateRes {
  data: {
    id: number;
    message: string;
  };
}

interface PostUpdateReq {
  id: number;
  title: string;
  type: string | null;
  contents: string;
  is_open: boolean | null;
}

interface PostUpdateRes {
  data: {
    id: number;
    message: string;
  };
}

interface PostUpdateResourceReq {
  id: number;
}

interface PostUpdateResourceRes {
  data: {
    id: number;
    type: 'notice' | 'faq' | null;
    title: string;
    contents: string;
    is_open: boolean;
  };
}

export type {
  PostType,
  PostsReq,
  PostListSearch,
  PostListData,
  PostsRes,
  PostReq,
  PostData,
  PostRes,
  PostCreateReq,
  PostCreateRes,
  PostUpdateReq,
  PostUpdateRes,
  PostUpdateResourceReq,
  PostUpdateResourceRes,
};
