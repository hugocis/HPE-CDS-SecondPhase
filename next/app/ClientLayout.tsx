'use client';

import { SessionProvider } from 'next-auth/react';
import { Suspense } from 'react';
import Navbar from './components/Navbar';
import Loading from './loading';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Navbar />
      <Suspense fallback={<Loading />}>
        <main className="container mx-auto px-4 py-8 mt-20">
          {children}
        </main>
      </Suspense>
    </SessionProvider>
  );
}