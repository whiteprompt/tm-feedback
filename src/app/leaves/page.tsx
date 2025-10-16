'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import ConfirmationModal from '@/components/ConfirmationModal';
import { beginOfMonth } from '@/utils/date';
import { addDays, differenceInDays, endOfMonth, format } from 'date-fns';

interface Leave {
  notionId: string;
  fromDate: string;
  toDate: string;
  type: string;
  status: string;
  days: number;
  comments?: string;
  certificate?: string;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  country: string;
  type?: string;
}

const STATUS_COLORS = {
  'Done': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
  'Rejected': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  'In progress': 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
  'Requires approval': 'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
  'Not started': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
} as const;

const LEAVE_TYPE_COLORS = {
  'Vacation': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  'Sick': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  'Personal': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
  'Maternity': 'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
  'Paternity': 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
  'Emergency': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  'Unknown': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
} as const;

export default function LeavesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { teamMember, loading: teamMemberLoading } = useTeamMember();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [error, setError] = useState('');
  const [holidaysError, setHolidaysError] = useState('');
  const [deletingLeaveId, setDeletingLeaveId] = useState<string | null>(null);
  const [uploadingLeaveId, setUploadingLeaveId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<Leave | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    const fetchLeaves = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(`/api/leaves`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaves');
        }

        const data = await response.json();
        setLeaves(data || []);
      } catch (error) {
        console.error('Error fetching leaves:', error);
        setError('Failed to load leaves');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchLeaves();
    }
  }, [session, status, router]);

  // Fetch holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      if (!session?.user?.email || !teamMember?.country) return;

      try {
        setHolidaysLoading(true);
        setHolidaysError('');

        // Get current month and add the next 6 months
        const fromDate = format(beginOfMonth(new Date()), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(addDays(new Date(), 180)), 'yyyy-MM-dd');

        const countryAcronym = teamMember.country?.toLowerCase()?.substring(0, 2);
      
        const response = await fetch(`/api/holidays?fromDate=${fromDate}&endDate=${endDate}&country=${countryAcronym}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch holidays');
        }

        const data = await response.json();
        setHolidays(data || []);
      } catch (error) {
        console.error('Error fetching holidays:', error);
        setHolidaysError('Failed to load holidays');
      } finally {
        setHolidaysLoading(false);
      }
    };

    if (session?.user?.email && teamMember?.country) {
      fetchHolidays();
    }
  }, [session, teamMember]);

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
    }
  }, [leaves, statusFilter]);

  // Fetch leaves function (extracted for reuse)
  const fetchLeaves = async () => {
    if (!session?.user?.email) return;

    try {
      setError('');
      const response = await fetch(`/api/leaves`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaves');
      }

      const data = await response.json();
      setLeaves(data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError('Failed to load leaves');
    }
  };

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
      <PageHeader 
        title="My Leaves"
        description="Review all your previously submitted leaves."
        actionButton={{
          label: "Submit New Leave",
          href: "/leaves/new",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )
        }}
      />

      {/* Holidays Section */}
      <div className="wp-card p-6 mb-8 wp-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-wp-primary/10 rounded-lg">
              <svg className="w-6 h-6 text-wp-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4h8m-4-4v8m-4-4h8" />
              </svg>
            </div>
            <div>
              <h2 className="wp-heading-2 text-wp-text-primary">Holidays in {teamMember?.country}</h2>
              <p className="wp-body-small text-wp-text-muted">
                Official holidays for {new Date().getFullYear()} - {new Date().getFullYear() + 1}
              </p>
            </div>
          </div>
        </div>

        {holidaysLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wp-primary"></div>
            <span className="ml-3 text-wp-text-muted">Loading holidays...</span>
          </div>
        ) : holidaysError ? (
          <div className="text-center py-8">
            <div className="text-wp-error mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="wp-body text-wp-error">{holidaysError}</p>
          </div>
        ) : !holidays?.length ? (
          <div className="text-center py-8">
            <div className="text-wp-text-muted mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4h8m-4-4v8m-4-4h8" />
              </svg>
            </div>
            <p className="wp-body text-wp-text-muted">No holidays found for this period.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {holidays.map((holiday, index) => {
              const holidayDate = new Date(holiday.date.split('T')[0] + 'T10:00:00Z');
              const isUpcoming = holidayDate > new Date();
              const isToday = holidayDate.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={holiday.id || index}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    isToday
                      ? 'bg-wp-primary/10 border-wp-primary/50 shadow-lg'
                      : isUpcoming
                      ? 'bg-wp-dark-card border-wp-border hover:border-wp-primary/30'
                      : 'bg-wp-dark-secondary border-wp-border/50 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`wp-body font-semibold mb-1 ${
                        isToday ? 'text-wp-primary' : 'text-wp-text-primary'
                      }`}>
                        {holiday.name}
                      </h3>
                      <p className="wp-body-small text-wp-text-muted mb-2">
                        {holidayDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {holiday.type && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-wp-primary/20 text-wp-primary rounded-full">
                          {holiday.type}
                        </span>
                      )}
                    </div>
                    <div className={`p-2 rounded-full ${
                      isToday
                        ? 'bg-wp-primary/20 text-wp-primary'
                        : isUpcoming
                        ? 'bg-wp-success/20 text-wp-success'
                        : 'bg-wp-text-muted/20 text-wp-text-muted'
                    }`}>
                      {isToday ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      ) : isUpcoming ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <br/>

      {/* Filter Section */}
      <div className="wp-card p-6 mb-16 wp-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-wp-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
              <label htmlFor="status-filter" className="wp-body text-wp-text-primary font-medium">
                Filter by Status
              </label>
            </div>
            <div className="relative">
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-wp-dark-secondary border-2 border-wp-border text-wp-text-primary focus:border-wp-primary focus:ring-2 focus:ring-wp-primary/20 rounded-lg pl-4 pr-10 py-3 min-w-[180px] transition-all duration-200 hover:border-wp-primary/50 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Done">✅ Done</option>
                <option value="Rejected">❌ Rejected</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-wp-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {statusFilter !== 'All' && (
              <button
                onClick={() => setStatusFilter('All')}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-wp-primary/10 hover:bg-wp-primary/20 text-wp-primary rounded-lg transition-all duration-200 border border-wp-primary/30 hover:border-wp-primary/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm font-medium">Clear Filter</span>
              </button>
            )}
            <div className="text-sm text-wp-text-muted bg-wp-dark-card px-3 py-2 rounded-lg border border-wp-border">
              {statusFilter === 'All' ? 'Showing all' : `Filtered by: ${statusFilter}`}
            </div>
          </div>
        </div>
      </div>

      <br/>

      {/* Content */}
      <div className="wp-card p-8">
        {error ? (
          <ErrorDisplay message={error} />
        ) : !filteredLeaves?.length ? (
          <div className="wp-card p-12 text-center wp-fade-in">
            <div className="text-wp-text-muted mb-6">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4h8m-4-4v8m-4-4h8" />
              </svg>
            </div>
            <h3 className="wp-heading-3 text-wp-text-muted mb-2">
              {statusFilter === 'All' ? 'No Leaves' : `No ${statusFilter} Leaves`}
            </h3>
            <p className="wp-body text-wp-text-muted">
              {statusFilter === 'All' 
                ? 'No leaves found for your account.' 
                : `No leaves found with status "${statusFilter}".`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-hidden flex justify-center">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full mx-auto">
                <thead>
                  <tr className="border-b border-wp-border">
                    <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          Type
                        </th>
                        <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          Start Date
                        </th>
                        <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          End Date
                        </th>
                        <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          Days
                        </th>
                        <th className="px-10 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          Comments
                        </th>
                        <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaves?.sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime())?.map((leave, index) => (
                        <tr key={leave.notionId || index} className="border-b border-wp-border/50 hover:bg-wp-dark-card/30 transition-colors">
                          <td className="px-6 py-6 text-center">
                            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${LEAVE_TYPE_COLORS[leave.type as keyof typeof LEAVE_TYPE_COLORS] || LEAVE_TYPE_COLORS.Unknown}`}>
                              {leave.type}
                            </span>
                          </td>
                          <td className="px-6 py-6 wp-body-small text-wp-text-secondary text-center">
                            {new Date(leave.fromDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-6 wp-body-small text-wp-text-secondary text-center">
                            {new Date(leave.toDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-6 wp-body text-wp-text-primary font-medium text-center">
                            {differenceInDays(new Date(leave.toDate), new Date(leave.fromDate)) + 1}
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${STATUS_COLORS[leave.status as keyof typeof STATUS_COLORS] || STATUS_COLORS['Requires approval']}`}>
                              {leave.status || 'Done'}
                            </span>
                          </td>
                          <td className="px-6 py-6 wp-body-small text-wp-text-secondary text-center max-w-xs truncate">
                            {leave.comments || '-'}
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {/* Delete Button - Always visible */}
                              <button
                                onClick={() => handleDeleteClick(leave)}
                                disabled={deletingLeaveId === leave.notionId}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete leave"
                              >
                                {deletingLeaveId === leave.notionId ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>

                              {/* Upload Certificate Button - Only for Illness leave and Maternity leave without certificate */}
                              {['Illness leave','Maternity leave'].includes(leave.type) && !leave.certificate && (
                                <>
                                  <input
                                    type="file"
                                    id={`certificate-upload-${leave.notionId}`}
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleFileInputChange(leave.notionId)}
                                    className="hidden"
                                    disabled={uploadingLeaveId === leave.notionId}
                                  />
                                  <button
                                    onClick={() => document.getElementById(`certificate-upload-${leave.notionId}`)?.click()}
                                    disabled={uploadingLeaveId === leave.notionId}
                                    className="p-2 bg-wp-primary/10 hover:bg-wp-primary/20 text-wp-primary rounded-lg transition-all duration-200 border border-wp-primary/30 hover:border-wp-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Upload certificate"
                                  >
                                    {uploadingLeaveId === leave.notionId ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-wp-primary"></div>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                      </svg>
                                    )}
                                  </button>
                                </>
                              )}

                              {/* View Certificate Button - Only when certificate is available */}
                              {(leave.certificate) && (
                                <button
                                  onClick={() => window.open(leave.certificate, '_blank')}
                                  className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-all duration-200 border border-green-500/30 hover:border-green-500/50"
                                  title="View certificate"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal && leaveToDelete !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Leave Request"
        message="Are you sure you want to delete this leave request? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deletingLeaveId !== null}
        variant="danger"
        details={leaveToDelete ? [
          { label: 'Type', value: leaveToDelete.type },
          { label: 'From', value: new Date(leaveToDelete.fromDate).toLocaleDateString() },
          { label: 'To', value: new Date(leaveToDelete.toDate).toLocaleDateString() },
          { label: 'Days', value: String(differenceInDays(new Date(leaveToDelete.toDate), new Date(leaveToDelete.fromDate)) + 1) },
        ] : undefined}
      />
    </PageLayout>
  );
}