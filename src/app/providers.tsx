'use client';

import { SessionProvider } from 'next-auth/react';
import { AdminProvider } from '@/contexts/AdminContext';
import { TeamMemberProvider } from '@/contexts/TeamMemberContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { FeedbacksProvider } from '@/contexts/FeedbacksContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingModal from '@/components/OnboardingModal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OnboardingProvider>
        <AdminProvider>
          <NotificationsProvider>
            <TeamMemberProvider>
              <FeedbacksProvider>
                {children}
                <OnboardingModal />
              </FeedbacksProvider>
            </TeamMemberProvider>
          </NotificationsProvider>
        </AdminProvider>
      </OnboardingProvider>
    </SessionProvider>
  );
}