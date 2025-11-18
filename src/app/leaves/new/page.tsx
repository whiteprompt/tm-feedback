'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import LeaveFormClient from '@/components/leaves/LeaveFormClient';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';

export default function NewLeavePage() {
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
    return null; // Will redirect
  }

  return (
    <PageLayout>
      <HeroSection
        badge="Submit New Leave Request"
        headline="Request time off by filling out the form below."
        subheadline="Request time off by filling out the form below."
        primaryCta={{
          text: "Go back to list",
          onClick: () => router.push("/leaves"),
        }}
      />
      <FullWidthContainerSection>
        <LeaveFormClient />
      </FullWidthContainerSection>
    </PageLayout>
  );
}

