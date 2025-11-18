'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import Allocations from '@/components/my-projects/Allocations';
import Presentations from '@/components/my-projects/Presentations';
import Feedbacks from '@/components/my-projects/Feedbacks';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';

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
      <HeroSection
        badge="My projects"
        headline="Manage your project allocations, processes, and feedbacks all in one place."
        subheadline="Here&rsquo;s your complete project information."
      />
      <div>
          <FullWidthContainerSection
            headline='My project allocations'
            description='Find your project allocations here.'>
            <Allocations />
          </FullWidthContainerSection>
          <FullWidthContainerSection
            headline='Processes information'
            description='Find the information related to the processes you have signed with the company.'>
             <Presentations />
          </FullWidthContainerSection>
          <FullWidthContainerSection
            headline='My allocations&rsquo; feedbacks'
            description='Find the information related to the feedbacks you have submitted for your allocations.'>
            <Feedbacks />
          </FullWidthContainerSection>
        </div>
    </PageLayout>
  );
}

