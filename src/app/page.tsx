'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import WelcomeSection from '@/components/my-profile/WelcomeSection';
import CompanyNewsCarousel from '@/components/my-profile/CompanyNewsCarousel';
import ImportantProcesses from '@/components/my-profile/ImportantProcesses';
import HolidaysSection from '@/components/leaves/HolidaysSection';
import UnreadNotificationsTable from '@/components/UnreadNotificationsTable';

export default function HomePage() {
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
      <div className="space-y-16">
        <WelcomeSection />
        <br />
        <UnreadNotificationsTable />
        <br />
        <HolidaysSection />
        <br />
        <CompanyNewsCarousel />
        <br />
        <ImportantProcesses />
      </div>
    </PageLayout>
  );
}
