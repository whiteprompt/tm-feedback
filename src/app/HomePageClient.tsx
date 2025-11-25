'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';
import UnreadNotificationsTable from '@/components/UnreadNotificationsTable';
import HolidaysSection from '@/components/leaves/HolidaysSection';
import CompanyNewsCarousel from '@/components/home/CompanyNewsCarousel';
import VideoSection from '@/components/home/VideoSection';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import { NewsItem } from '@/lib/api/news';

interface HomePageClientProps {
  newsItems: NewsItem[];
}

export default function HomePageClient({ newsItems }: HomePageClientProps) {
  const { status } = useSession();
  const router = useRouter();
  const { teamMember } = useTeamMember();

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

  const handleLearnMore = () => {
    // Scroll to video section
    const element = document.getElementById('video-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        // badge="Welcome to the Portal!"
        headline="Welcome to the Portal!"
        subheadline="Your central hub for managing every task across the company—from feedback and requests to projects. Stay connected with real-time updates, all in one modern platform."
        primaryCta={{
          text: "Learn More",
          onClick: handleLearnMore,
        }}
      />
      <div>
        <FullWidthContainerSection
          headline="Real-Time Notifications"
          description="Never miss important updates. Get instant notifications for what you need to know."
        >
          <UnreadNotificationsTable />
        </FullWidthContainerSection>

        <FullWidthContainerSection
          headline="Company News"
          description="Stay informed and engaged with announcements, updates, and important company-wide communications."
          classNameContent="w-[70%]"
        >
          <CompanyNewsCarousel newsItems={newsItems} />
        </FullWidthContainerSection>

        <FullWidthContainerSection
          headline={`Next Holidays in ${teamMember?.country}`}
          description={`Official holidays for ${new Date().getFullYear()}`}
        >
          <HolidaysSection countryAcronym={teamMember?.countryAcronym || 'ar'} />
        </FullWidthContainerSection>

        <FullWidthContainerSection
          id="video-section"
          headline="How does the portal work?"
          description="Stay informed and engaged with announcements, updates, and important company-wide communications."
        >
          <VideoSection />
        </FullWidthContainerSection>
      </div>
    </PageLayout>
  );
}
