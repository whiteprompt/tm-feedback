'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { HeroSection } from '@/components/home/HeroSection';
import ExternalLinkCard from '@/components/ExternalLinkCard';
import Divider from '@/components/Divider';

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
        href: 'https://sites.google.com/whiteprompt.com/intranet/staffing/training-request',
        icon: '📚',
      },
      {
        title: 'Get Cursor License',
        description: 'Request a license for Cursor IDE to enhance your development workflow.',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSfPAY9ZKwcwtrteqds1udIUs6ZfhXmH6qIRIQowwE5X6RKiCQ/alreadyresponded',
        icon: '💻',
      },
      {
        title: 'Online Tech Talk',
        description: 'Propose an online tech talk for your employment.',
        href: 'https://sites.google.com/whiteprompt.com/intranet/architecture/ott-propose',
        icon: '🚀',
      },
    ],
  },
  {
    category: 'Recruiting & Staffing',
    links: [
      {
        title: 'Refer a Friend',
        description: 'Refer talented professionals to join our team and help us grow.',
        href: 'https://sites.google.com/whiteprompt.com/intranet/recruiting/refer-a-friend',
        icon: '👥',
      },
      {
        title: 'Update Personal Information',
        description: 'Update your personal information for your employment.',
        href: 'https://sites.google.com/whiteprompt.com/intranet/administration/first-steps-in-the-company/update-your-personal-information',
        icon: '📝',
      },
      {
        title: 'Social Event Refund',
        description: 'Request a refund for a social event.',
        href: '/expense-refunds/new?type=Social',
        icon: '💰',
      }
    ],
  },
  {
    category: 'Time Tracking',
    links: [
      {
        title: 'Submit Your Hours',
        description: 'Submit and forecast your timesheet hours for accurate project tracking.',
        href: 'https://sites.google.com/whiteprompt.com/intranet/administration/time-tracking/submit-your-weekly-timesheet',
        icon: '⏰',
      },
      {
        title: 'Working Certificate',
        description: 'Request a working certificate for your employment.',
        href: 'https://sites.google.com/whiteprompt.com/intranet/administration/working-certificates',
        icon: '📄',
      },
    ],
  },
  {
    category: 'Compensation',
    links: [
      {
        title: 'Choose Your Payment Method',
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
      {
        title: 'Resignation',
        description: 'Request a resignation letter for your employment.',
        href: 'https://sites.google.com/whiteprompt.com/intranet/administration/leaving-the-company/resignation-request',
        icon: '👋',
      }
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
        headline='Other Requests'
        subheadline="Find quick links to a variety of company request processes."
        showScrollIndicator
      />
      <Divider />
      <div className="mt-16 divide-y divide-gray-800">
        {requestLinks.map((category) => (
          <div key={category.category} className={`
            grid grid-cols-1 gap-6 py-12
            first:pt-0
            last:pb-0
            md:grid-cols-12
          `}>
            <div className="md:col-span-4">
              <h2 className="text-2xl font-bold text-white">{category.category}</h2>
              <p className="mt-2 text-gray-400">
                Access {category.category.toLowerCase()} related processes and resources.
              </p>
            </div>
            <div className="md:col-span-8">
              {category.links.length > 1 ? (
                <div className={`
                  grid grid-cols-1 gap-6
                  md:grid-cols-2
                `}>
                  {category.links.map((link) => (
                    <ExternalLinkCard
                      key={link.title}
                      title={link.title}
                      description={link.description}
                      href={link.href}
                      icon={link.icon}
                      className="h-full w-full"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex justify-center">
                  {category.links.map((link) => (
                    <div key={link.title} className="w-full max-w-md">
                      <ExternalLinkCard
                        title={link.title}
                        description={link.description}
                        href={link.href}
                        icon={link.icon}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

