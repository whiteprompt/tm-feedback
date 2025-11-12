'use client';

import Link from 'next/link';

interface PortalLink {
  title: string;
  href: string;
  description?: string;
}

interface WelcomeSectionProps {
  welcomeMessage?: string;
  sitePurpose?: string;
  portalLinks?: PortalLink[];
}

export default function WelcomeSection({
  welcomeMessage = "Welcome to White Prompt",
  sitePurpose = "Your central hub for managing your work, requests, and company resources. This portal provides everything you need to stay connected and productive.",
  portalLinks = [
    { title: "My Profile", href: "/my-profile", description: "View your personal information and project details" },
    { title: "Feedbacks", href: "/feedbacks", description: "Submit and manage team member feedback" },
    { title: "Requests", href: "/leaves", description: "Submit leaves and expense refunds" },
    { title: "Company Portal", href: "/company", description: "Access company services and resources" },
  ]
}: WelcomeSectionProps) {
  return (
    <section className="text-center mb-16 wp-fade-in">
      <h1 className="wp-heading-1 mb-6">
        {welcomeMessage}
      </h1>
      <p className="flex justify-center">
        {sitePurpose}
      </p>
      <br />
      
      {portalLinks?.length  && (
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {portalLinks.map((link, index) => {
            const isExternal = link.href.startsWith('http');
            const className = "group wp-card p-4 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-wp-primary/20 min-w-[200px]";
            
            const content = (
              <>
                <h3 className="wp-heading-3 text-wp-text-primary mb-2 group-hover:text-wp-primary transition-colors duration-300">
                  {link.title}
                </h3>
                {link.description && (
                  <p className="wp-body-small text-wp-text-secondary group-hover:text-wp-text-muted transition-colors duration-300">
                    {link.description}
                  </p>
                )}
              </>
            );
            
            return isExternal ? (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            ) : (
              <Link
                key={index}
                href={link.href}
                className={className}
              >
                {content}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

