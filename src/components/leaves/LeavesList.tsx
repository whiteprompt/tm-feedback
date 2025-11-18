'use client';

import React from 'react';
import { Leave } from '@/lib/types';
import ConfirmationModal from '@/components/ConfirmationModal';

interface LeavesListProps {
  data: Leave[] | null | undefined;
  isLoading?: boolean;
  description?: string;
  statusFilter?: string;
  onStatusFilterChange?: (filter: string) => void;
  totalCount?: number;
  deletingLeaveId?: string | null;
  uploadingLeaveId?: string | null;
  onDeleteClick?: (leave: Leave) => void;
  onFileInputChange?: (leaveId: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  showDeleteModal?: boolean;
  leaveToDelete?: Leave | null;
  onDeleteConfirm?: () => void;
  onDeleteCancel?: () => void;
  calculateBusinessDays?: (startDate: Date, endDate: Date) => number;
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

const renderEmptyState = (config: { icon?: React.ReactNode; title?: string; message: string }) => (
  <div className="text-center py-8">
    <div className="text-wp-text-muted mb-4">
      {config.icon}
    </div>
    {config.title && (
      <h3 className="wp-heading-3 text-wp-text-muted mb-2">{config.title}</h3>
    )}
    <p className="wp-body text-wp-text-muted">{config.message}</p>
  </div>
);

export default function LeavesList({
  data,
  isLoading = false,
  description = "Review all your previously submitted leaves.",
  statusFilter = 'All',
  onStatusFilterChange,
  totalCount,
  deletingLeaveId,
  uploadingLeaveId,
  onDeleteClick,
  onFileInputChange,
  showDeleteModal = false,
  leaveToDelete,
  onDeleteConfirm,
  onDeleteCancel,
  calculateBusinessDays
}: LeavesListProps) {
  const icon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4h8m-4-4v8m-4-4h8" />
    </svg>
  );

  const defaultEmptyState = {
    icon: (
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4h8m-4-4v8m-4-4h8" />
      </svg>
    ),
    title: statusFilter === 'All' ? 'No Leaves' : `No ${statusFilter} Leaves`,
    message: statusFilter === 'All' 
      ? 'No leaves found for your account.' 
      : `No leaves found with status "${statusFilter}".`,
  };

  return (
    <>
      <div className="mb-16 wp-slide-up">
        <div className="wp-card p-8">
          {/* Filter Section */}
          {onStatusFilterChange && (
            <div className="mb-6 pb-6 border-b border-wp-border">
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
                      onChange={(e) => onStatusFilterChange(e.target.value)}
                      className="appearance-none bg-wp-dark-secondary border-2 border-wp-border text-wp-text-primary focus:border-wp-primary focus:ring-2 focus:ring-wp-primary/20 rounded-lg pl-4 pr-10 py-2 min-w-[180px] transition-all duration-200 hover:border-wp-primary/50 cursor-pointer text-sm"
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
                      onClick={() => onStatusFilterChange('All')}
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
          )}

          {/* Count Display */}
          {totalCount !== undefined && data && data.length > 0 && (
            <div className="mb-4">
              <p className="wp-body text-wp-text-secondary text-sm">
                {statusFilter === 'All' 
                  ? `${totalCount} leave${totalCount !== 1 ? 's' : ''} found`
                  : `${data.length} ${statusFilter.toLowerCase()} leave${data.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          )}

          {/* Data Content */}
          {isLoading ? (
            <div className="text-center py-8">
              <p className="wp-body text-wp-text-muted">Loading...</p>
            </div>
          ) : data === null || data === undefined ? (
            renderEmptyState({
              icon: (
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              ),
              title: 'No Information',
              message: 'No team member information available.',
            })
          ) : data.length === 0 ? (
            renderEmptyState(defaultEmptyState)
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
                    {data.sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime()).map((leave, index) => (
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
                          {leave.totalDays}
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
                            {onDeleteClick && (
                              <button
                                onClick={() => onDeleteClick(leave)}
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
                            )}

                            {/* Upload Certificate Button - Only for Illness leave and Maternity leave without certificate */}
                            {onFileInputChange && ['Illness leave','Maternity leave'].includes(leave.type) && !leave.certificate && (
                              <>
                                <input
                                  type="file"
                                  id={`certificate-upload-${leave.notionId}`}
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={onFileInputChange(leave.notionId)}
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
                            {leave.certificate && (
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && leaveToDelete && onDeleteConfirm && onDeleteCancel && calculateBusinessDays && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={onDeleteCancel}
          onConfirm={onDeleteConfirm}
          title="Delete Leave Request"
          message="Are you sure you want to delete this leave request? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          isLoading={deletingLeaveId !== null}
          variant="danger"
          details={[
            { label: 'Type', value: leaveToDelete.type },
            { label: 'From', value: new Date(leaveToDelete.fromDate).toLocaleDateString() },
            { label: 'To', value: new Date(leaveToDelete.toDate).toLocaleDateString() },
            { label: 'Days', value: String(calculateBusinessDays(new Date(leaveToDelete.fromDate), new Date(leaveToDelete.toDate))) },
          ]}
        />
      )}
    </>
  );
}

