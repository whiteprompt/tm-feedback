'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDate } from '@/utils/date';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import { useSettings } from '@/contexts/SettingsContext';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { Allocation, Contract } from '@/lib/constants';

export default function TeamMemberPage() {
  const { status } = useSession();
  const router = useRouter();
  const { teamMember, loading: teamMemberLoading, error: teamMemberError } = useTeamMember();
  const { settings, loading: settingsLoading } = useSettings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);



  useEffect(() => {
    setLoading(false);
  }, []);

  if (status === 'loading' || loading || teamMemberLoading || settingsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout>
          {/* Hero Section */}
          <div className="text-center mb-16 wp-fade-in">
            <h1 className="wp-heading-1 mb-4">
              Welcome back, {teamMember?.firstName || 'Team Member'}!
            </h1>
            <p className="wp-body-large max-w-2xl mx-auto">
              Here&rsquo;s your complete team member information and current project details.
            </p>
            <br />
          </div>

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
        <div className="space-y-32 wp-slide-up">
          {/* Personal Information Card */}
          <div className="wp-card p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-wp-primary to-wp-accent rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="wp-heading-3">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">Full Name</label>
                    <p className="wp-body text-wp-text-primary font-medium">
                      {teamMember.firstName} {teamMember.lastName}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">Work Email</label>
                    <p className="wp-body text-wp-text-primary font-medium">{teamMember.email}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">Start Date</label>
                    <p className="wp-body text-wp-text-primary font-medium">{formatDate(teamMember.startDate)}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">Personal Email</label>
                    <p className="wp-body text-wp-text-primary font-medium">{teamMember.personalEmail}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">Mobile</label>
                    <p className="wp-body text-wp-text-primary font-medium">{teamMember.mobile}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">ID Type</label>
                    <p className="wp-body text-wp-text-primary font-medium">{teamMember.identificationType}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">ID Number</label>
                    <p className="wp-body text-wp-text-primary font-medium">{teamMember.identificationNumber}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">Country</label>
                    <p className="wp-body text-wp-text-primary font-medium">{teamMember.country || 'Not specified'}</p>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">Access Tools</label>
                    <div className="flex flex-wrap gap-2">
                      {(teamMember?.accesses || []).map((access: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-wp-primary/20 text-wp-primary rounded-full text-sm font-medium">
                          {access}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <br />
              <br />
              {/* Project Allocations Card */}
              <div className="wp-card p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-wp-purple to-wp-purple-dark rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h2 className="wp-heading-3">Project Allocations</h2>
                </div>
                {!teamMember ? (
                  <div className="text-center py-8">
                    <div className="text-wp-text-muted mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h3 className="wp-heading-3 text-wp-text-muted mb-2">No Information</h3>
                    <p className="wp-body text-wp-text-muted">No team member information available.</p>
                  </div>
                ) : teamMember.allocations && teamMember.allocations.length > 0 ? (
                  <div className="grid gap-4">
                    {teamMember.allocations.map((allocation: Allocation, index: number) => (
                      <div
                        key={index}
                        className={`p-6 rounded-lg border transition-all duration-300 ${
                          allocation.active
                            ? 'bg-gradient-to-r from-wp-primary/10 to-wp-accent/10 border-wp-primary/30'
                            : 'bg-wp-dark-card/50 border-wp-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="wp-body font-semibold text-wp-text-primary mb-2">
                              {allocation.project}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-wp-text-secondary">
                              <span>Start: {allocation.start}</span>
                              <span>•</span>
                              <span>End: {allocation.end || 'Ongoing'}</span>
                            </div>
                          </div>
                          {allocation.active && (
                            <span className="px-8 py-3 bg-gradient-to-r from-wp-primary to-wp-accent text-white text-base font-bold rounded-full min-w-[100px] text-center">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-wp-text-muted mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="wp-body text-wp-text-muted">No project allocations found.</p>
                  </div>
                )}
              </div>
              <br />
              <br />
              {/* Contracts Card - Only show if enabled */}
              {settings.showContracts && (
                <div className="wp-card p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="wp-heading-3">Contracts</h2>
                  </div>
                  {!teamMember ? (
                    <div className="text-center py-8">
                      <div className="text-wp-text-muted mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h3 className="wp-heading-3 text-wp-text-muted mb-2">No Information</h3>
                      <p className="wp-body text-wp-text-muted">No team member information available.</p>
                    </div>
                  ) : teamMember?.contracts && teamMember.contracts.length > 0 ? (
                    <div className="grid gap-4">
                      {teamMember.contracts.map((contract: Contract, index: number) => (
                        <div
                          key={index}
                          className={`p-6 rounded-lg border transition-all duration-300 ${
                            contract.active
                              ? 'bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/30'
                              : 'bg-wp-dark-card/50 border-wp-border'
                          }`}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div>
                              <label className="wp-body-small text-wp-text-muted">Type</label>
                              <p className="wp-body text-wp-text-primary font-medium">{contract.type}</p>
                            </div>
                            <div>
                              <label className="wp-body-small text-wp-text-muted">Amount</label>
                              <p className="wp-body text-wp-text-primary font-medium">
                                ${parseFloat(contract.amount?.toString() || '0').toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <label className="wp-body-small text-wp-text-muted">Daily Hours</label>
                              <p className="wp-body text-wp-text-primary font-medium">{contract.dailyHours}h</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <label className="wp-body-small text-wp-text-muted">Period</label>
                                <p className="wp-body-small text-wp-text-secondary">
                                  {contract.start} - {contract.end || 'Ongoing'}
                                </p>
                              </div>
                              {contract.active && (
                                <span className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-base font-bold rounded-full min-w-[100px] text-center">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-wp-text-muted mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="wp-body text-wp-text-muted">No contracts found.</p>
                    </div>
                  )}
                </div>
              )}
        </div>
      )}
    </PageLayout>
  );
}