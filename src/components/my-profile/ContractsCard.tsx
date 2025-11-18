'use client';

import React from 'react';
import { TeamMember, Contract } from '@/lib/constants';
import { DataCard } from '@/components/DataCard';

interface ContractsCardProps {
  teamMember: TeamMember | null;
}

export const ContractsCard: React.FC<ContractsCardProps> = ({
  teamMember,
}) => {
  const icon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <DataCard<Contract>
      iconBgClassName="bg-linear-to-r from-green-500 to-green-600"
      data={teamMember?.contracts || null}
      emptyState={{
        icon: (
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        message: 'No contracts found.',
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
      renderItem={(contract: Contract, index: number) => (
        <div
          key={index}
          className={`p-6 rounded-lg border transition-all duration-300 ${
            contract.active
              ? 'bg-linear-to-r from-green-500/10 to-green-600/10 border-green-500/30'
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
                <span className="px-8 py-3 bg-linear-to-r text-white text-base font-bold rounded-full min-w-[100px] text-center">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    />
  );
};

