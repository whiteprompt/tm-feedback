'use client';

import React from 'react';
import { TeamMember } from '@/lib/constants';
import { formatDate } from '@/utils/date';

interface PersonalInformationCardProps {
  teamMember: TeamMember;
}

interface InfoFieldProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold block">
      {label}
    </label>
    <p className="wp-body text-wp-text-primary font-medium">{value}</p>
  </div>
);

export const PersonalInformationCard: React.FC<PersonalInformationCardProps> = ({
  teamMember,
}) => {
  return (
    <div className="wp-card p-8">
      <header className="flex items-center mb-8">
        <div className="w-12 h-12 bg-linear-to-br from-wp-primary to-wp-accent rounded-full flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="wp-heading-3">Personal Information</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <InfoField label="Full Name" value={`${teamMember.firstName} ${teamMember.lastName}`} />
        <InfoField label="Work Email" value={teamMember.email} />
        <InfoField label="Start Date" value={formatDate(teamMember.startDate)} />
        <InfoField label="Personal Email" value={teamMember.personalEmail} />
        <InfoField label="Mobile" value={teamMember.mobile} />
        <InfoField label="Country" value={teamMember.country || 'Not specified'} />
        
        {/* ID Type and ID Number in the same row */}
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <InfoField label="ID Type" value={teamMember.identificationType} />
          <InfoField label="ID Number" value={teamMember.identificationNumber} />
        </div>

        {/* Access Tools section */}
        <div className="md:col-span-2 lg:col-span-3 space-y-3">
          <div>
            <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold block mb-2">
              Access Tools
            </label>
            <p className="wp-body-small text-wp-text-muted mb-4">
              List of active tools assigned to your account
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(teamMember?.accesses || []).map((access: string, index: number) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-wp-primary/20 text-wp-primary rounded-full text-sm font-medium"
              >
                {access}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

