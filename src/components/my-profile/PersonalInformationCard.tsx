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
  <div className={`
    space-y-2
    ${className}
  `}>
    <label className={`
      wp-body-small text-wp-text-muted block font-semibold tracking-wider
      uppercase
    `}>
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
      <div className={`
        grid grid-cols-1 gap-8
        md:grid-cols-2
        lg:grid-cols-3
      `}>
        <InfoField label="Full Name" value={`${teamMember.firstName} ${teamMember.lastName}`} />
        <InfoField label="Work Email" value={teamMember.email} />
        <InfoField label="Start Date" value={formatDate(teamMember.startDate)} />
        <InfoField label="Personal Email" value={teamMember.personalEmail} />
        <InfoField label="Mobile" value={teamMember.mobile} />
        <InfoField label="Country" value={teamMember.country || 'Not specified'} />
        
        {/* ID Type and ID Number in the same row */}
        <div className={`
          grid grid-cols-1 gap-8
          md:col-span-2 md:grid-cols-2
          lg:col-span-2
        `}>
          <InfoField label="ID Type" value={teamMember.identificationType} />
          <InfoField label="ID Number" value={teamMember.identificationNumber} />
        </div>

        {/* Access Tools section */}
        <div className={`
          space-y-3
          md:col-span-2
          lg:col-span-3
        `}>
          <div>
            <label className={`
              wp-body-small text-wp-text-muted mb-2 block font-semibold
              tracking-wider uppercase
            `}>
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
                className={`
                  bg-wp-primary/20 text-wp-primary rounded-full px-3 py-1
                  text-sm font-medium
                `}
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

