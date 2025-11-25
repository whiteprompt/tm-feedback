'use client';

import TeamMemberFeedbackClient from '@/components/feedbacks/TeamMemberFeedbackClient';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';


export const dynamic = 'force-dynamic';

export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
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
          // badge="Submit New Feedback"
          headline="Submit New Feedback"
          subheadline="Submit a new feedback for your project allocations."
          primaryCta={{
            text: "Go back to feedbacks",
            onClick: () => router.push("/my-projects"),
          }}
        />
        <FullWidthContainerSection>
          <TeamMemberFeedbackClient />
        </FullWidthContainerSection>
      </PageLayout>
    );
} 