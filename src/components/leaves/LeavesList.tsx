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
  <div className="py-8 text-center">
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
  const defaultEmptyState = {
    icon: (
      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="wp-slide-up mb-16">
        <div className="wp-card p-8">
          {/* Filter Section */}
          {onStatusFilterChange && (
            <div className="border-wp-border mb-6 border-b pb-6">
              <div className={`
                flex flex-col gap-4
                sm:flex-row sm:items-center sm:justify-between
              `}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <svg className="text-wp-primary h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                    </svg>
                    <label htmlFor="status-filter" className={`
                      wp-body text-wp-text-primary font-medium
                    `}>
                      Filter by Status
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => onStatusFilterChange(e.target.value)}
                      className={`
                        bg-wp-dark-secondary border-wp-border
                        text-wp-text-primary min-w-[180px] cursor-pointer
                        appearance-none rounded-lg border-2 py-2 pr-10 pl-4
                        text-sm transition-all duration-200
                        focus:border-wp-primary focus:ring-wp-primary/20
                        focus:ring-2
                        hover:border-wp-primary/50
                      `}
                    >
                      <option value="All">All Status</option>
                      <option value="Done">✅ Done</option>
                      <option value="Rejected">❌ Rejected</option>
                    </select>
                    <div className={`
                      pointer-events-none absolute inset-y-0 right-0 flex
                      items-center pr-3
                    `}>
                      <svg className="text-wp-text-muted h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {statusFilter !== 'All' && (
                    <button
                      onClick={() => onStatusFilterChange('All')}
                      className={`
                        bg-wp-primary/10 text-wp-primary border-wp-primary/30
                        inline-flex items-center space-x-2 rounded-lg border
                        px-4 py-2 transition-all duration-200
                        hover:bg-wp-primary/20 hover:border-wp-primary/50
                      `}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm font-medium">Clear Filter</span>
                    </button>
                  )}
                  <div className={`
                    text-wp-text-muted bg-wp-dark-card border-wp-border
                    rounded-lg border px-3 py-2 text-sm
                  `}>
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
            <div className="py-8 text-center">
              <p className="wp-body text-wp-text-muted">Loading...</p>
            </div>
          ) : data === null || data === undefined ? (
            renderEmptyState({
              icon: (
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              ),
              title: 'No Information',
              message: 'No team member information available.',
            })
          ) : data.length === 0 ? (
            renderEmptyState(defaultEmptyState)
          ) : (
            <div className="flex justify-center overflow-hidden">
              <div className="w-full overflow-x-auto">
                <table className="mx-auto min-w-full">
                  <thead>
                    <tr className="border-wp-border border-b">
                      <th className={`
                        wp-body-small text-wp-text-muted px-6 py-4 text-center
                        font-semibold tracking-wider uppercase
                      `}>
                        Type
                      </th>
                      <th className={`
                        wp-body-small text-wp-text-muted px-6 py-4 text-center
                        font-semibold tracking-wider uppercase
                      `}>
                        Start Date
                      </th>
                      <th className={`
                        wp-body-small text-wp-text-muted px-6 py-4 text-center
                        font-semibold tracking-wider uppercase
                      `}>
                        End Date
                      </th>
                      <th className={`
                        wp-body-small text-wp-text-muted px-6 py-4 text-center
                        font-semibold tracking-wider uppercase
                      `}>
                        Days
                      </th>
                      <th className={`
                        wp-body-small text-wp-text-muted px-10 py-4 text-center
                        font-semibold tracking-wider uppercase
                      `}>
                        Status
                      </th>
                      <th className={`
                        wp-body-small text-wp-text-muted px-6 py-4 text-center
                        font-semibold tracking-wider uppercase
                      `}>
                        Comments
                      </th>
                      <th className={`
                        wp-body-small text-wp-text-muted px-6 py-4 text-center
                        font-semibold tracking-wider uppercase
                      `}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime()).map((leave, index) => (
                      <tr key={leave.notionId || index} className={`
                        border-wp-border/50 border-b transition-colors
                        hover:bg-wp-dark-card/30
                      `}>
                        <td className="px-6 py-6 text-center">
                          <span className={`
                            rounded-full px-4 py-2 text-sm font-semibold
                            ${LEAVE_TYPE_COLORS[leave.type as keyof typeof LEAVE_TYPE_COLORS] || LEAVE_TYPE_COLORS.Unknown}
                          `}>
                            {leave.type}
                          </span>
                        </td>
                        <td className={`
                          wp-body-small text-wp-text-secondary px-6 py-6
                          text-center
                        `}>
                          {new Date(leave.fromDate).toLocaleDateString()}
                        </td>
                        <td className={`
                          wp-body-small text-wp-text-secondary px-6 py-6
                          text-center
                        `}>
                          {new Date(leave.toDate).toLocaleDateString()}
                        </td>
                        <td className={`
                          wp-body text-wp-text-primary px-6 py-6 text-center
                          font-medium
                        `}>
                          {leave.totalDays}
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className={`
                            rounded-full px-4 py-2 text-sm font-semibold
                            ${STATUS_COLORS[leave.status as keyof typeof STATUS_COLORS] || STATUS_COLORS['Requires approval']}
                          `}>
                            {leave.status || 'Done'}
                          </span>
                        </td>
                        <td className={`
                          wp-body-small text-wp-text-secondary max-w-xs truncate
                          px-6 py-6 text-center
                        `}>
                          {leave.comments || '-'}
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className={`
                            flex items-center justify-center space-x-2
                          `}>
                            {/* Delete Button - Always visible */}
                            {onDeleteClick && (
                              <button
                                onClick={() => onDeleteClick(leave)}
                                disabled={deletingLeaveId === leave.notionId}
                                className={`
                                  rounded-lg border border-red-500/30
                                  bg-red-500/10 p-2 text-red-500 transition-all
                                  duration-200
                                  hover:border-red-500/50 hover:bg-red-500/20
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                `}
                                title="Delete leave"
                              >
                                {deletingLeaveId === leave.notionId ? (
                                  <div className={`
                                    h-4 w-4 animate-spin rounded-full border-b-2
                                    border-red-500
                                  `}></div>
                                ) : (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                  className={`
                                    bg-wp-primary/10 text-wp-primary
                                    border-wp-primary/30 rounded-lg border p-2
                                    transition-all duration-200
                                    hover:bg-wp-primary/20
                                    hover:border-wp-primary/50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  `}
                                  title="Upload certificate"
                                >
                                  {uploadingLeaveId === leave.notionId ? (
                                    <div className={`
                                      border-wp-primary h-4 w-4 animate-spin
                                      rounded-full border-b-2
                                    `}></div>
                                  ) : (
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                className={`
                                  rounded-lg border border-green-500/30
                                  bg-green-500/10 p-2 text-green-500
                                  transition-all duration-200
                                  hover:border-green-500/50
                                  hover:bg-green-500/20
                                `}
                                title="View certificate"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

