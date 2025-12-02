'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import LeavesSummaryTable from '@/components/leaves/LeavesSummaryTable';
import VacationsSummaryTable from '@/components/leaves/VacationsSummaryTable';
import LeavesList from '@/components/leaves/LeavesList';
import { eachDayOfInterval, isWeekend } from 'date-fns';
import { Leave } from '@/lib/types';
import { HeroSection } from '@/components/home/HeroSection';
import { FullWidthContainerSection } from '@/components/FullWidthContainerSection';
import Tabs from '@/components/Tabs';


// Calculate business days (excluding weekends) between two dates
const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => !isWeekend(day)).length;
};

export default function LeavesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { teamMember, loading: teamMemberLoading } = useTeamMember();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingLeaveId, setDeletingLeaveId] = useState<string | null>(null);
  const [uploadingLeaveId, setUploadingLeaveId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<Leave | null>(null);

  const fetchLeaves = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch(`/api/leaves`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaves');
      }

      const data = await response.json();
      setLeaves((data || []).map((leave: Leave) => ({
        ...leave,
        totalDays: calculateBusinessDays(new Date(leave.fromDate), new Date(leave.toDate))
      })));
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.email) {
      fetchLeaves();
    }
  }, [session, status, router]);

  // Filter leaves based on status
  useEffect(() => {
    if (!leaves.length) {
      setFilteredLeaves([]);
      return;
    }

    if (statusFilter === 'All') {
      setFilteredLeaves(leaves);
    } else {
      // Map filter options to actual status values
      const statusMap: { [key: string]: string[] } = {
        'Done': ['Done'],
        'Rejected': ['Rejected'],
        'In progress': ['In progress'],
        'Requires approval': ['Requires approval'],
        'Not started': ['Not started'],
      };
      
      const targetStatuses = statusMap[statusFilter] || [];
      const filtered = leaves.filter(leave => targetStatuses.includes(leave.status));
      setFilteredLeaves(filtered);
      console.log(filtered);
    }
  }, [leaves, statusFilter]);

  // Determine if the last active contract is hourly
  const isLastActiveContractHourly = useMemo(() => {
    if (!teamMember?.contracts || teamMember.contracts.length === 0) {
      return false;
    }

    const currentDate = new Date();

    // Filter contracts that are currently active (started and not ended, or open)
    const activeContracts = (teamMember.contracts || []).filter(contract => {
      if (!contract.start) return false;

      const contractStart = new Date(contract.start);
      if (contractStart > currentDate) return false; // Not started yet

      // If contract has no end date, it's still active (open contract)
      if (!contract.end) {
        return true;
      }

      const contractEnd = new Date(contract.end);
      return contractEnd >= currentDate; // Still active
    });

    if (activeContracts.length === 0) {
      return false;
    }

    // Find the last active contract (most recent start date, or open contract)
    const lastActiveContract = activeContracts.reduce((latest, contract) => {
      if (!latest) return contract;
      
      const contractStart = new Date(contract.start);
      const latestStart = new Date(latest.start);
      
      // Prefer open contracts (no end date)
      if (!contract.end && latest.end) return contract;
      if (contract.end && !latest.end) return latest;
      
      // If both have end dates or both are open, pick the one with latest start date
      return contractStart > latestStart ? contract : latest;
    });

    return lastActiveContract?.amountType === 'Hourly';
  }, [teamMember]);

  // Handle delete click - shows confirmation modal
  const handleDeleteClick = (leave: Leave) => {
    setLeaveToDelete(leave);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!leaveToDelete) return;

    setDeletingLeaveId(leaveToDelete.notionId);
    setError('');

    try {
      const response = await fetch(`/api/leaves/${leaveToDelete.notionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete leave');
      }

      // Refresh the leaves list
      await fetchLeaves();
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setLeaveToDelete(null);
    } catch (error) {
      console.error('Error deleting leave:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete leave');
      setShowDeleteModal(false);
    } finally {
      setDeletingLeaveId(null);
    }
  };

  // Handle cancel delete
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setLeaveToDelete(null);
  };

  // Handle upload certificate
  const handleUploadCertificate = async (leaveId: string, file: File) => {
    setUploadingLeaveId(leaveId);
    setError('');

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const formData = new FormData();
      formData.append('certificate', file);

      const response = await fetch(`/api/leaves/${leaveId}/certificate`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload certificate');
      }

      // Refresh the leaves list
      await fetchLeaves();
    } catch (error) {
      console.error('Error uploading certificate:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload certificate');
    } finally {
      setUploadingLeaveId(null);
    }
  };

  // Handle file input change
  const handleFileInputChange = (leaveId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadCertificate(leaveId, file);
    }
  };
  
  if (loading || teamMemberLoading) {
    return <LoadingSpinner />;
  }

  if (!teamMember) {
    return (
      <PageLayout>
        <ErrorDisplay 
          title="No Information" 
          message="No team member information available." 
          icon="noData"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <HeroSection
        headline="My Leaves"
        subheadline="Manage your leaves and vacations all in one place."
        primaryCta={{
          text: "Submit a new Leave",
          onClick: () => router.push("/leaves/new"),
        }}
        secondaryCta={{
          text: "Request a Leave process",
          href: "https://sites.google.com/whiteprompt.com/intranet/administration/leaves/notify-your-leave",
          newTab: true,
        }}
      />
      <div>
        {!isLastActiveContractHourly && (
          <>
            {/* Vacations Summary Table */}
            <FullWidthContainerSection
              headline='Vacations Balance'
              description='View your available days and yearly accrual.'
            >
              <VacationsSummaryTable 
              leaves={leaves} 
              initialBalance={teamMember?.annualLeavesBalance || 0}
              isLastActiveContractHourly={isLastActiveContractHourly}
            />
            </FullWidthContainerSection>
          </>
        )}
        {/* Leaves Tabs Section */}
        <FullWidthContainerSection
          headline='Leaves Summary'
          description='Review all your previously submitted leaves.'
        >
          <Tabs
            tabs={[
              {
                label: 'By year',
                content: <LeavesSummaryTable leaves={leaves} />
              },
              {
                label: 'Details',
                content: error ? (
                  <ErrorDisplay message={error} />
                ) : (
                  <LeavesList
                    data={filteredLeaves}
                    isLoading={loading}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    totalCount={leaves.length}
                    deletingLeaveId={deletingLeaveId}
                    uploadingLeaveId={uploadingLeaveId}
                    onDeleteClick={handleDeleteClick}
                    onFileInputChange={handleFileInputChange}
                    showDeleteModal={showDeleteModal}
                    leaveToDelete={leaveToDelete}
                    onDeleteConfirm={handleDeleteConfirm}
                    onDeleteCancel={handleDeleteCancel}
                    calculateBusinessDays={calculateBusinessDays}
                  />
                )
              }
            ]}
          />
        </FullWidthContainerSection>
      </div>
    </PageLayout>
  );
}