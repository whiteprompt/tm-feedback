'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { PersonalInformationCard } from '@/components/my-profile/PersonalInformationCard';
import { ContractsCard } from '@/components/my-profile/ContractsCard';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';

export default function TeamMemberPage() {
  const { status } = useSession();
  const router = useRouter();
  const { teamMember, loading: teamMemberLoading, error: teamMemberError } = useTeamMember();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);



  useEffect(() => {
    setLoading(false);
  }, []);

  if (status === 'loading' || loading || teamMemberLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        badge="My main information"
        headline={`Welcome back, ${teamMember?.firstName || 'Team Member'}!`}
        subheadline="Here&rsquo;s your complete team member information."
      />
      {teamMemberError ? (
        <ErrorDisplay message={teamMemberError} />
      ) : !teamMember ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <ErrorDisplay 
            title="No Information" 
            message="No team member information available." 
            icon="noData"
          />
        </div>
      ) : (
        <div>
          <FullWidthContainerSection
            headline='My personal information'
            description='Find your main personal information here.'>
            <PersonalInformationCard teamMember={teamMember} />
          </FullWidthContainerSection>
          <FullWidthContainerSection
            headline='My contracts'
            description='Find the information related to the contracts you have signed with the company.'>
            <ContractsCard teamMember={teamMember} />
          </FullWidthContainerSection>
        </div>
      )}
    </PageLayout>
  );
}

