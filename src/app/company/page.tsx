'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

const companyLinks = [
  {
    title: 'Request a leave',
    description: 'Submit your leave request for approval',
    icon: '🏖️',
    href: 'https://www.whiteprompt.com/'
  },
  {
    title: 'Request a training',
    description: 'Apply for professional development opportunities',
    icon: '🎓',
    href: 'https://www.whiteprompt.com/'
  },
  {
    title: 'Refer a friend',
    description: 'Recommend talented professionals to join our team',
    icon: '👥',
    href: 'https://www.whiteprompt.com/'
  },
  {
    title: 'Get your Cursor/Copilot license',
    description: 'Access your development tools and licenses',
    icon: '💻',
    href: 'https://www.whiteprompt.com/'
  },
  {
    title: 'Submit your hours',
    description: 'Log your working hours for timesheet tracking',
    icon: '⏰',
    href: 'https://www.whiteprompt.com/'
  },
  {
    title: 'Change your payment method',
    description: 'Update your banking and payment information',
    icon: '💳',
    href: 'https://www.whiteprompt.com/'
  },
  {
    title: 'Create your invoice',
    description: 'Generate invoices for your completed work',
    icon: '📄',
    href: 'https://www.whiteprompt.com/'
  },
  {
    title: 'Request for a working certificate',
    description: 'Obtain official employment certification documents',
    icon: '📋',
    href: 'https://www.whiteprompt.com/'
  },
  {
    title: 'Obtain your refund',
    description: 'Process reimbursements and expense claims',
    icon: '💰',
    href: 'https://www.whiteprompt.com/'
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-wp-dark-primary via-wp-dark-secondary to-wp-dark-tertiary">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="wp-slide-up">
            <div className="wp-card p-8">
              <div className="animate-pulse">
                <div className="h-12 bg-wp-dark-card/50 rounded w-1/3 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-32 bg-wp-dark-card/50 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="wp-section-sm">
        <div className="wp-container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-16 wp-fade-in">
            <h1 className="wp-heading-1 text-wp-text-primary mb-4">Company Portal</h1>
          </div>
          <div>
            <p className="wp-body text-wp-text-secondary">Access company services and resources</p>
          </div>

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
        </div>
      </main>
    </div>
  );
}