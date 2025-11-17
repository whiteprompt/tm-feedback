'use client';

import { useTeamMember } from '@/contexts/TeamMemberContext';
import { Allocation } from '@/lib/constants';

interface AllocationsProps {
  description?: string;
}

export default function Allocations({
  description = "View your current and past project allocations. Track your active projects and their timelines."
}: AllocationsProps) {
  const { teamMember } = useTeamMember();

  return (
    <section className="mb-16 wp-slide-up">
      <div className="wp-card p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-linear-to-r from-wp-purple to-wp-purple-dark rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="wp-heading-3">Project Allocations</h2>
            <p className="wp-body-small text-wp-text-secondary mt-2">
              {description}
            </p>
          </div>
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
        ) : teamMember?.allocations?.length ? (
          <div className="grid gap-4">
            {teamMember.allocations.map((allocation: Allocation, index: number) => (
              <div
                key={index}
                className={`p-6 rounded-lg border transition-all duration-300 ${
                  allocation.active
                    ? 'b-linear-to-r from-wp-primary/10 to-wp-accent/10 border-wp-primary/30'
                    : 'bg-wp-dark-card/50 border-wp-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="wp-body font-semibold text-wp-text-primary mb-2">
                      {`${allocation.project?.clientName}-${allocation.project?.projectName}`}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-wp-text-secondary">
                      <span>Start: {allocation.start}</span>
                      <span>•</span>
                      <span>End: {allocation.end || 'Ongoing'}</span>
                    </div>
                  </div>
                  {allocation.active && (
                    <span className="px-8 py-3 bg-linear-to-r from-wp-primary to-wp-accent text-white text-base font-bold rounded-full min-w-[100px] text-center">
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
    </section>
  );
}

