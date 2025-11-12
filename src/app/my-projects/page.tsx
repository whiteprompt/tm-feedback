'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import Allocations from '@/components/my-projects/Allocations';
import Presentations from '@/components/my-projects/Presentations';
import Feedbacks from '@/components/my-projects/Feedbacks';

export default function MyProjectsPage() {
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
      <div className="mb-16 wp-fade-in">
        <h1 className="wp-heading-1 mb-4">My Projects</h1>
        <p className="wp-body-large max-w-3xl">
          Manage your project allocations, presentations, and feedbacks all in one place.
        </p>
      </div>

      <div className="space-y-16">
        <Allocations />
        <br />
        <Presentations />
        <br />
        <Feedbacks />
      </div>
    </PageLayout>
  );
}

