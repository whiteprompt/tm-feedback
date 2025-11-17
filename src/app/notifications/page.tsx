'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import NotificationsCenter from '@/components/NotificationsCenter';

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
      <div className="mb-8 wp-fade-in">
        <h1 className="wp-heading-1 mb-4">Notifications</h1>
        <p className="wp-body-large max-w-3xl">
          Stay up to date with all your important updates and notifications.
        </p>
      </div>

      <NotificationsCenter />
    </PageLayout>
  );
}

