'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';

const companyLinks = [
  {
    title: 'Request a leave',
    description: 'Submit your leave request for approval',
    icon: '🏖️',
    href: 'https://sites.google.com/whiteprompt.com/intranet/administration/leaves/notify-your-leave'
  },
  {
    title: 'Request a training',
    description: 'Apply for professional development opportunities',
    icon: '🎓',
    href: 'https://sites.google.com/whiteprompt.com/intranet/staffing/training-request'
  },
  {
    title: 'Refer a friend',
    description: 'Recommend talented professionals to join our team',
    icon: '👥',
    href: 'https://sites.google.com/whiteprompt.com/intranet/recruiting/refer-a-friend'
  },
  {
    title: 'Get your Cursor/Copilot license',
    description: 'Access your development tools and licenses',
    icon: '💻',
    href: 'https://docs.google.com/forms/d/e/1FAIpQLSfPAY9ZKwcwtrteqds1udIUs6ZfhXmH6qIRIQowwE5X6RKiCQ/viewform'
  },
  {
    title: 'Submit your hours',
    description: 'Log your working hours for timesheet tracking',
    icon: '⏰',
    href: 'https://sites.google.com/whiteprompt.com/intranet/administration/time-tracking'
  },
  {
    title: 'Change your payment method',
    description: 'Update your banking and payment information',
    icon: '💳',
    href: 'https://sites.google.com/whiteprompt.com/intranet/administration/get-your-compensation'
  },
  {
    title: 'Create your invoice',
    description: 'Generate invoices for your completed work',
    icon: '📄',
    href: 'https://sites.google.com/whiteprompt.com/intranet/administration/get-your-compensation/create-your-invoice-from-scratch'
  },
  {
    title: 'Request for a working certificate',
    description: 'Obtain official employment certification documents',
    icon: '📋',
    href: 'https://sites.google.com/whiteprompt.com/intranet/administration/working-certificates'
  },
  {
    title: 'Obtain your refund',
    description: 'Process reimbursements and expense claims',
    icon: '💰',
    href: 'https://sites.google.com/whiteprompt.com/intranet/administration/get-your-refund'
  }
];

export default function CompanyPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/company')}`);
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
      <PageHeader 
        title="Company Portal"
        description="Access company services and resources"
      />

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companyLinks.map((link, index) => (
          <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group wp-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-wp-primary/20"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="wp-heading-3 text-wp-text-primary mb-2 group-hover:text-wp-primary transition-colors duration-300">
                      {link.title}
                    </h3>
                    <p className="wp-body-small text-wp-text-secondary group-hover:text-wp-text-muted transition-colors duration-300">
                      {link.description}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-wp-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </a>
        ))}
      </div>
      <br />
      {/* Info Card */}
      <div className="wp-card p-6 bg-gradient-to-r from-wp-primary/10 to-wp-accent/10 border border-wp-primary/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-wp-primary/20 rounded-lg">
            <svg className="w-6 h-6 text-wp-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="wp-body font-semibold text-wp-text-primary mb-1">Need Help?</h4>
            <p className="wp-body-small text-wp-text-secondary">
              If you need assistance with any of these services, please contact the HR team or reach out through our internal communication channels.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}