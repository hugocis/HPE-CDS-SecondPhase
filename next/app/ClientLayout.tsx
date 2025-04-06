'use client';

import { SessionProvider } from 'next-auth/react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      session={undefined} 
      refetchInterval={5 * 60} // Refetch session every 5 minutes instead of the default interval
      refetchOnWindowFocus={false} // Prevent refetching on window focus
    >
      {children}
    </SessionProvider>
  );
}