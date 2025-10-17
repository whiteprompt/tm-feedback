'use client';

import { SessionProvider } from 'next-auth/react';
import { AdminProvider } from '@/contexts/AdminContext';
import { TeamMemberProvider } from '@/contexts/TeamMemberContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminProvider>
        <SettingsProvider>
          <NotificationsProvider>
            <TeamMemberProvider>{children}</TeamMemberProvider>
          </NotificationsProvider>
        </SettingsProvider>
      </AdminProvider>
    </SessionProvider>
  );
} 