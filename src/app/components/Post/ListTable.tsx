import Link from 'next/link';

interface Props {
  posts: { id: number; title: string; type: string }[];
}

export default function ListTable({ posts }: Props) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="ltr:text-left">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Name
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {posts.map(post => (
            <tr key={post.id} className="odd:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                <Link href={`/post/${post.id}`}>{post.title}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
