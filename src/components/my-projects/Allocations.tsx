'use client';

import { useTeamMember } from '@/contexts/TeamMemberContext';
import { Allocation } from '@/lib/constants';
import { DataCard } from '@/components/DataCard';

export default function Allocations() {
  const { teamMember } = useTeamMember();

  return (
    <DataCard<Allocation>
      iconBgClassName="bg-linear-to-r from-wp-purple to-wp-purple-dark"
      data={teamMember?.allocations || null}
      wrapperClassName="mb-16 wp-slide-up"
      emptyState={{
        icon: (
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        message: 'No project allocations found.',
      }}
      noDataState={{
        icon: (
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        ),
        title: 'No Information',
        message: 'No team member information available.',
      }}
      renderItem={(allocation: Allocation, index: number) => (
        <div
          key={index}
          className={`
            rounded-lg border p-6 transition-all duration-300
            ${
            allocation.active
              ? `
                border-green-500/30 bg-linear-to-r from-green-500/10
                to-green-600/10
              `
              : 'bg-wp-dark-card/50 border-wp-border'
          }
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="wp-body text-wp-text-primary mb-2 font-semibold">
                {`${allocation.project?.clientName}-${allocation.project?.projectName}`}
              </h3>
              <div className={`
                text-wp-text-secondary flex items-center space-x-4 text-sm
              `}>
                <span>Start: {allocation.start}</span>
                <span>•</span>
                <span>End: {allocation.end || 'Ongoing'}</span>
              </div>
            </div>
            {allocation.active && (
              <span className={`
                min-w-[100px] rounded-full bg-linear-to-r px-8 py-3 text-center
                text-base font-bold text-white
              `}>
                Active
              </span>
            )}
          </div>
        </div>
      )}
    />
  );
}

