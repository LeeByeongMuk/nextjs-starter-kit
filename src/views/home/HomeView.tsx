'use client';

import Link from 'next/link';

export default function HomeView() {
  return (
    <div>
      <h1>Home</h1>
      <Link href="/post">post</Link>
      <br />
      <Link href="/signin">signin</Link>
      <br />
      <Link href="/signup">signup</Link>
    </div>
  );
}
