'use client';

interface ProcessItem {
  title: string;
  description: string;
  icon: string;
  href: string;
}

interface ImportantProcessesProps {
  processes?: ProcessItem[];
}

export default function ImportantProcesses({
  processes = [
    {
      title: 'Submit your hours',
      description: 'Log your working hours for timesheet tracking',
      icon: '⏰',
      href: 'https://sites.google.com/whiteprompt.com/intranet/administration/time-tracking'
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
      title: 'Create your invoice',
      description: 'Generate invoices for your completed work',
      icon: '📄',
      href: 'https://sites.google.com/whiteprompt.com/intranet/administration/get-your-compensation/create-your-invoice-from-scratch'
    },
    {
      title: 'Get your cursor/copilot license',
      description: 'Access your development tools and licenses',
      icon: '💻',
      href: 'https://docs.google.com/forms/d/e/1FAIpQLSfPAY9ZKwcwtrteqds1udIUs6ZfhXmH6qIRIQowwE5X6RKiCQ/viewform'
    },
    {
      title: 'Change your payment method',
      description: 'Update your banking and payment information',
      icon: '💳',
      href: 'https://sites.google.com/whiteprompt.com/intranet/administration/get-your-compensation'
    }
  ]
}: ImportantProcessesProps) {
  return (
    <section className="mb-16 wp-slide-up">
      <div className="text-center mb-8">
        <h2 className="wp-heading-2 mb-4">Important Processes</h2>
        <p className="wp-body-large text-wp-text-secondary max-w-2xl mx-auto">
          Quick access to essential company processes and resources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processes.map((process, index) => (
          <a
            key={index}
            href={process.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group wp-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-wp-primary/20"
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                {process.icon}
              </div>
              <div className="flex-1">
                <h3 className="wp-heading-3 text-wp-text-primary mb-2 group-hover:text-wp-primary transition-colors duration-300">
                  {process.title}
                </h3>
                <p className="wp-body-small text-wp-text-secondary group-hover:text-wp-text-muted transition-colors duration-300">
                  {process.description}
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
    </section>
  );
}

