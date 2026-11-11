import { PostListData } from '../api/types';
import PostListEmptyUI from './PostListEmptyUI';
import ListItem from './PostListItem';
import PostListSkeletonUI from './PostListSkeletonUI';

interface Props {
  posts: PostListData[];
  isLoading: boolean;
}

/** 제목 중심 목록과 빈 결과·로딩 상태를 구분한다. */
export default function PostList({ posts, isLoading }: Props) {
  if (isLoading) return <PostListSkeletonUI />;
  if (!posts.length) return <PostListEmptyUI />;
  return (
    <ul aria-label="게시글 목록" className="border-t border-line">
      {posts.map(post => (
        <ListItem key={post.id} post={post} />
      ))}
    </ul>
  );
}
