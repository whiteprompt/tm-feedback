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
        badge="Team Member Portal"
        headline="Manage Your Tasks & Stay Updated"
        subheadline="Your central hub for managing every task across the company—from feedback and leave requests to expenses and projects. Stay connected with real-time company news and updates, all in one modern platform."
        primaryCta={{
          text: "Learn More",
          onClick: handleLearnMore,
        }}
      />
      <div>
        <FullWidthContainerSection
          headline="Stay Informed with Real-Time Notifications"
          description="Never miss important updates. Get instant notifications for you need to know."
        >
          <UnreadNotificationsTable />
        </FullWidthContainerSection>

        <FullWidthContainerSection
          headline="Stay Connected with Company News"
          description="Keep your team informed and engaged with announcements, updates, and important company-wide communications."
          classNameContent="w-[70%]"
        >
          <CompanyNewsCarousel newsItems={newsItems} />
        </FullWidthContainerSection>

        <FullWidthContainerSection
          headline={`Next Holidays in ${teamMember?.country}`}
          description={`Official holidays for ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`}
        >
          <HolidaysSection countryAcronym={teamMember?.countryAcronym || 'ar'} />
        </FullWidthContainerSection>

        <FullWidthContainerSection
          id="video-section"
          headline="See How It Works"
          description="Watch this video to discover what the app does and understand its general purpose. Learn how our platform helps you manage tasks, stay connected, and streamline your workflow."
        >
          <VideoSection />
        </FullWidthContainerSection>
      </div>
    </PageLayout>
  );
}
