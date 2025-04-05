'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from './components/Navbar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        {children}
      </main>
    </SessionProvider>
  );
}