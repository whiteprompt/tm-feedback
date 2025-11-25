'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import NotificationsCenter from '@/components/NotificationsCenter';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <PageLayout>
      <HeroSection
        headline="My notifications"
        subheadline="Here&rsquo;s your complete notifications information."
      />

      <div>
        <FullWidthContainerSection>
          <NotificationsCenter />
        </FullWidthContainerSection>
      </div>
    </PageLayout>
  );
}

