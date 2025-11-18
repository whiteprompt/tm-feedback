'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';
import ExternalLinkCard from '@/components/ExternalLinkCard';

interface RequestLink {
  title: string;
  description: string;
  href: string;
  icon: string;
}

const requestLinks: { category: string; links: RequestLink[] }[] = [
  {
    category: 'Development',
    links: [
      {
        title: 'Request a Training',
        description: 'Request access to training programs and professional development opportunities.',
        href: 'https://sites.google.com/whiteprompt.com/intranet/staffing/training',
        icon: '📚',
      },
      {
        title: 'Get Cursor License',
        description: 'Request a license for Cursor IDE to enhance your development workflow.',
        href: '#', // TODO: Update with actual URL when available
        icon: '💻',
      },
    ],
  },
  {
    category: 'Recruiting',
    links: [
      {
        title: 'Refer a Friend',
        description: 'Refer talented professionals to join our team and help us grow.',
        href: 'https://sites.google.com/whiteprompt.com/intranet/recruiting/refer-a-friend',
        icon: '👥',
      },
    ],
  },
  {
    category: 'Time Tracking',
    links: [
      {
        title: 'Submit Your Hours',
        description: 'Submit and forecast your timesheet hours for accurate project tracking.',
        href: 'https://sites.google.com/whiteprompt.com/intranet/administration/time-tracking/timesheet-forecasting',
        icon: '⏰',
      },
    ],
  },
  {
    category: 'Compensation',
    links: [
      {
        title: 'Change Your Payment Method',
        description: 'Update your preferred payment method for compensation.',
        href: 'https://sites.google.com/whiteprompt.com/intranet/administration/get-your-compensation/choose-your-payment-method',
        icon: '💳',
      },
      {
        title: 'Create Your Invoice',
        description: 'Create and submit your invoice from scratch for compensation.',
        href: 'https://sites.google.com/whiteprompt.com/intranet/administration/get-your-compensation/create-your-invoice-from-scratch',
        icon: '📄',
      },
    ],
  },
];

export default function OtherRequestsPage() {
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
        badge="Other Requests"
        headline="Access Company Processes & Resources"
        subheadline="Find quick links to various company processes, from training requests to compensation management."
      />
      <div>
        {requestLinks.map((category, index) => (
          <FullWidthContainerSection
            key={category.category}
            headline={category.category}
            description={`Access ${category.category.toLowerCase()} related processes and resources.`}
          >
            <div className={`${
              category.links.length === 1 
                ? 'flex justify-center' 
                : 'grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch'
            }`}>
              {category.links.length === 1 && (
                <div className="w-full max-w-2xl">
                  {category.links.map((link) => (
                    <ExternalLinkCard
                      key={link.title}
                      title={link.title}
                      description={link.description}
                      href={link.href}
                      icon={link.icon}
                      className="h-full"
                    />
                  ))}
                </div>
              )}
              {category.links.length > 1 && (
                <>
                  {category.links.map((link) => (
                    <ExternalLinkCard
                      key={link.title}
                      title={link.title}
                      description={link.description}
                      href={link.href}
                      icon={link.icon}
                      className="h-full"
                    />
                  ))}
                </>
              )}
            </div>
          </FullWidthContainerSection>
        ))}
      </div>
    </PageLayout>
  );
}

