'use client';

import { SessionProvider } from 'next-auth/react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      session={undefined}
      refetchInterval={15 * 60} // Aumentar a 15 minutos
      refetchOnWindowFocus={false}
      refetchWhenOffline={false} // No recargar cuando está offline
    >
      {children}
    </SessionProvider>
  );
}