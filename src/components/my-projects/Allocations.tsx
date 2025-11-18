'use client';

import { useTeamMember } from '@/contexts/TeamMemberContext';
import { Allocation } from '@/lib/constants';
import { DataCard } from '@/components/DataCard';

interface AllocationsProps {
  description?: string;
}

export default function Allocations({
  description = "View your current and past project allocations. Track your active projects and their timelines."
}: AllocationsProps) {
  const { teamMember } = useTeamMember();

  const icon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );

  return (
    <DataCard<Allocation>
      // title="Project Allocations"
      // description={description}
      // icon={icon}
      iconBgClassName="bg-linear-to-r from-wp-purple to-wp-purple-dark"
      data={teamMember?.allocations || null}
      wrapperClassName="mb-16 wp-slide-up"
      emptyState={{
        icon: (
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        message: 'No project allocations found.',
      }}
      noDataState={{
        icon: (
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        ),
        title: 'No Information',
        message: 'No team member information available.',
      }}
      renderItem={(allocation: Allocation, index: number) => (
        <div
          key={index}
          className={`p-6 rounded-lg border transition-all duration-300 ${
            allocation.active
              ? 'bg-linear-to-r from-green-500/10 to-green-600/10 border-green-500/30'
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
              <span className="px-8 py-3 bg-linear-to-r text-white text-base font-bold rounded-full min-w-[100px] text-center">
                Active
              </span>
            )}
          </div>
        </div>
      )}
    />
  );
}

