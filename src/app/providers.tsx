'use client';

import { SessionProvider } from 'next-auth/react';
import { AdminProvider } from '@/contexts/AdminContext';
import { TeamMemberProvider } from '@/contexts/TeamMemberContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { FeedbacksProvider } from '@/contexts/FeedbacksContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminProvider>
          <NotificationsProvider>
            <TeamMemberProvider>
              <FeedbacksProvider>{children}</FeedbacksProvider>
            </TeamMemberProvider>
          </NotificationsProvider>
      </AdminProvider>
    </SessionProvider>
  );
} 