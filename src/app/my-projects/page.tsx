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
        // badge="Projects Overview"
        headline="Projects Overview"
        subheadline="Track your active assignments, client presentations, and performance reviews."
      />
      <div>
          <FullWidthContainerSection
            headline='My Allocations'
            description='Overview of your current and past projects.'>
            <Allocations />
          </FullWidthContainerSection>
          <FullWidthContainerSection
            headline='Client Presentations'
            description='Find the information related to the client introductions you have agreed with the company.'>
             <Presentations />
          </FullWidthContainerSection>
          <FullWidthContainerSection
            headline='My Feedbacks'
            description='Share your experience and view feedback history.'
            primaryCta={{
              text: "Submit a new Feedback",
              onClick: () => router.push("/feedbacks/new"),
            }}
            >
            <Feedbacks />
          </FullWidthContainerSection>
        </div>
    </PageLayout>
  );
}

