'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { fetchPost } from '@/app/api/post';
import ListFilter from '@/app/components/Post/ListFilter';

export default function PostDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const {
    data: { data: post },
    isError,
  } = useQuery({
    queryKey: ['posts', { id }],
    queryFn: () => fetchPost({ id }),
    initialData: {
      data: {
        title: '',
        contents: '',
        user: {
          name: '',
          nickname: '',
        },
      },
    },
  });

  useEffect(() => {
    if (isError) {
      alert('Failed to fetch post');
      router.back();
    }
  }, [isError, router]);

  return (
    <section className="pb-8 pt-8">
      <ListFilter />

      <div className="mt-5">
        <div>
          <h4 className="border-b-2 border-b-teal-600 p-2 text-xl font-bold">
            {post.title}
          </h4>

          <div className="flex justify-between bg-teal-100 p-2 text-base">
            <span>{post.user.name || post.user.nickname}</span>
            <span>1분 전</span>
          </div>
        </div>

        <div
          className="border-b-2 pb-5 pl-2 pr-2 pt-5 text-base"
          dangerouslySetInnerHTML={{ __html: post.contents }}
        />
      </div>
    </section>
  );
}
