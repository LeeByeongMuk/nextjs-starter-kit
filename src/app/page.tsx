'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Link href="/notice">Notice</Link>
      <br />
      <Link href="/signin">signin</Link>
      <br />
      <Link href="/signup">signup</Link>
      <br />
      <button type="button" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}
