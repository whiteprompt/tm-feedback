'use client';

import React, { useState } from 'react';
import { TeamMember } from '@/lib/constants';
import { formatDate } from '@/lib/date';
import ResumeModal from './ResumeModal';

interface PersonalInformationCardProps {
  teamMember: TeamMember;
}

interface InfoFieldProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

const InfoField: React.FC<InfoFieldProps> = ({ 
  label, 
  value, 
  className = '', 
  onClick, 
  clickable = false 
}) => (
  <div 
    className={`
      space-y-2
      ${className}
      ${clickable ? 'group cursor-pointer' : ''}
    `}
    onClick={onClick}
  >
    <label className={`
      wp-white-body-small block font-semibold tracking-wider uppercase
    `}>
      {label}
    </label>
    <p className={`
      wp-body font-medium text-white
      ${clickable ? `
        flex items-center gap-2 transition-colors
        group-hover:text-blue-400
      ` : ''}
    `}>
      {value}
      {clickable && (
        <svg 
          className={`
            h-4 w-4 transition-transform
            group-hover:translate-x-1
          `} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </p>
  </div>
);

export const PersonalInformationCard: React.FC<PersonalInformationCardProps> = ({
  teamMember,
}) => {
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const handleResumeClick = async () => {
    setIsResumeModalOpen(true);
    
    // Only fetch if we don't have content yet
    if (!resumeContent && !isLoadingResume) {
      setIsLoadingResume(true);
      setResumeError(null);
      
      try {
        const response = await fetch(`/api/resume?teamMemberId=${teamMember.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch resume: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.content) {
          setResumeContent(data.content);
        } else {
          throw new Error('Resume content not found in response');
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
        setResumeError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoadingResume(false);
      }
    }
  };

  return (
    <div className="wp-card relative p-8">
      {/* Edit Button */}
      <a
        href="https://sites.google.com/whiteprompt.com/intranet/administration/first-steps-in-the-company/update-your-personal-information"
        target="_blank"
        rel="noopener noreferrer"
        className={`
          group absolute top-4 right-4 rounded-lg p-2 transition-colors
          hover:bg-white/10
        `}
        aria-label="Edit personal information"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`
            text-gray-400 transition-colors
            group-hover:text-white
          `}
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </a>

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
        <InfoField 
          label="My Resume" 
          value="View Resume" 
          clickable={true}
          onClick={handleResumeClick}
        />
        
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
              mb-2 block font-semibold tracking-wider text-white uppercase
            `}>
              Access Tools
            </label>
            <p className="wp-body-small mb-4">
              List of active tools assigned to your account
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(teamMember?.accesses || []).map((access: string, index: number) => (
              <span 
                key={index} 
                className={`
                  rounded-full bg-gray-500/20 px-3 py-1 text-sm font-medium
                  text-gray-300
                `}
              >
                {access}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Modal */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        content={resumeContent}
        isLoading={isLoadingResume}
        error={resumeError}
      />
    </div>
  );
};

