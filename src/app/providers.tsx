'use client';

import { SessionProvider } from 'next-auth/react';
import { AdminProvider } from '@/contexts/AdminContext';
import { TeamMemberProvider } from '@/contexts/TeamMemberContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminProvider>
        <SettingsProvider>
          <TeamMemberProvider>{children}</TeamMemberProvider>
        </SettingsProvider>
      </AdminProvider>
    </SessionProvider>
  );
} 