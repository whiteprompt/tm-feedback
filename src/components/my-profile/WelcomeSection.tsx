'use client';

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
  sitePurpose = "Your central hub for managing work, requests, and company resources.",
}: WelcomeSectionProps) {
  return (
    <section className="wp-fade-in mb-16 text-center">
      <h1 className="wp-heading-1 mb-6">
        {welcomeMessage}
      </h1>
      <p className="flex justify-center">
        {sitePurpose}
      </p>
    </section>
  );
}

