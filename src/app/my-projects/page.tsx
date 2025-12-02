'use client';

import { useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import Allocations from '@/components/my-projects/Allocations';
import Presentations from '@/components/my-projects/Presentations';
import Feedbacks from '@/components/my-projects/Feedbacks';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';

function MyProjectsContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const section = searchParams.get('section');
    if (section && status === 'authenticated') {
      // Wait for the page to render before scrolling
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [searchParams, status]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <PageLayout>
      <HeroSection
        headline="Projects Overview"
        subheadline="Track your active assignments, client presentations, and performance reviews."
        showScrollIndicator
      />
      <div>
          <FullWidthContainerSection
            id="allocations"
            headline='My Allocations'
            description='Overview of your current and past projects.'>
            <Allocations />
          </FullWidthContainerSection>
          <FullWidthContainerSection
            id="presentations"
            headline='Client Presentations'
            description='Find the information related to the client introductions you have agreed with the company.'>
             <Presentations />
          </FullWidthContainerSection>
          <FullWidthContainerSection
            id="feedbacks"
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

export default function MyProjectsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MyProjectsContent />
    </Suspense>
  );
}

