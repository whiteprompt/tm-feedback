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
        headline={`Hi, ${teamMember?.firstName || teamMember?.lastName || 'Team Member'}!`}
        subheadline="Manage your profile details and review your contract history."
      />
      {teamMemberError ? (
        <ErrorDisplay message={teamMemberError} />
      ) : !teamMember ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <ErrorDisplay 
            title="No Information" 
            message="No team member information available." 
            icon="noData"
          />
        </div>
      ) : (
        <div>
          <FullWidthContainerSection
            headline='My Personal information'
            description='Access your official employee record and personal data.'>
            <PersonalInformationCard teamMember={teamMember} />
          </FullWidthContainerSection>
          <FullWidthContainerSection
            headline='My Contracts'
            description='Find the information related to the contracts you have signed with the company.'>
            <ContractsCard teamMember={teamMember} />
          </FullWidthContainerSection>
        </div>
      )}
    </PageLayout>
  );
}

