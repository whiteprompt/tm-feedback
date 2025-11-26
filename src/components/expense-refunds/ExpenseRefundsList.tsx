'use client';

import React from 'react';

export interface ExpenseRefund {
  id: string;
  teamMemberNotionId: string;
  concept: string;
  date: string;
  name: string | null;
  amount: number;
  currency: string;
  store: string;
  tax: number | null;
  usdExchange: number | null;
  adminApproval: string;
  amApproval: string;
  receipt: string;
  finalStatus: string;
  rejectAdminReason: string;
  rejectAMReason: string;
}

interface ExpenseRefundsListProps {
  data: ExpenseRefund[] | null | undefined;
  isLoading?: boolean;
  description?: string;
  statusFilter?: string;
  onStatusFilterChange?: (filter: string) => void;
  totalCount?: number;
}

const STATUS_MAP = {
  'In Progress': { label: 'In Progress', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/30' },
  'Approved': { label: 'Approved', color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/30' },
  'Not Approved': { label: 'Rejected', color: 'text-red-400', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/30' },
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

export default function ExpenseRefundsList({
  data,
  isLoading = false,
  statusFilter = 'All',
  onStatusFilterChange,
  totalCount
}: ExpenseRefundsListProps) {
  const defaultEmptyState = {
    icon: (
      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: statusFilter === 'All' ? 'No Expense Refunds Yet' : `No ${statusFilter} Expense Refunds`,
    message: statusFilter === 'All' 
      ? "You haven't submitted any expense refund requests yet. Start by submitting your first expense refund!"
      : `No expense refunds found with status "${statusFilter}".`,
  };

  const defaultNoDataState = {
    icon: (
      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    title: 'No Information',
    message: 'No team member information available.',
  };

  return (
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
                    bg-wp-dark-secondary border-wp-border text-wp-text-primary
                    min-w-[180px] cursor-pointer appearance-none rounded-lg
                    border-2 py-2 pr-10 pl-4 text-sm transition-all duration-200
                    focus:border-wp-primary focus:ring-wp-primary/20
                    focus:ring-2
                    hover:border-wp-primary/50
                  `}
                >
                  <option value="All">All Status</option>
                  <option value="Approved">✅ Approved</option>
                  <option value="In Progress">🔄 In Progress</option>
                  <option value="Not Approved">❌ Rejected</option>
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
                    inline-flex items-center space-x-2 rounded-lg border px-4
                    py-2 transition-all duration-200
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
                text-wp-text-muted bg-wp-dark-card border-wp-border rounded-lg
                border px-3 py-2 text-sm
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
              ? `${totalCount} expense refund${totalCount !== 1 ? 's' : ''} submitted`
              : `${data.length} ${statusFilter.toLowerCase()} expense refund${data.length !== 1 ? 's' : ''}`
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
        renderEmptyState(defaultNoDataState)
      ) : data.length === 0 ? (
        renderEmptyState(defaultEmptyState)
      ) : (
        <div className="grid gap-4">
          {data.map((refund: ExpenseRefund) => {
            let overallStatus = STATUS_MAP[refund.finalStatus as keyof typeof STATUS_MAP];
            // fallback to In Progress if status is not found
            if (!overallStatus) {
              overallStatus = STATUS_MAP['In Progress']
            }
            
            return (
              <div
                key={refund.id}
                className={`
                  rounded-lg border p-6 transition-all duration-300
                  ${
                  refund.finalStatus === 'Approved'
                    ? `
                      from-wp-primary/10 to-wp-accent/10 border-wp-primary/30
                      bg-linear-to-r
                    `
                    : refund.finalStatus === 'In Progress'
                    ? 'border-yellow-400/20 bg-yellow-400/5'
                    : 'bg-wp-dark-card/50 border-wp-border'
                }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`
                      wp-body text-wp-text-primary mb-2 font-semibold
                    `}>
                      {refund.concept}
                    </h3>
                    <div className={`
                      text-wp-text-secondary mb-2 flex items-center space-x-4
                      text-sm
                    `}>
                      <span>{new Date(refund.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                      <span>•</span>
                      <span className="text-wp-text-primary font-medium">
                        {refund.amount.toFixed(2)} {refund.currency}
                      </span>
                      {refund.currency !== 'USD' && refund.usdExchange && (
                        <>
                          <span>•</span>
                          <span className="text-wp-text-muted">
                            ≈ ${(refund.amount / refund.usdExchange).toFixed(2)} USD
                          </span>
                        </>
                      )}
                    </div>
                    <div className={`
                      text-wp-text-secondary flex items-center space-x-4 text-sm
                    `}>
                      <span className={`
                        bg-wp-purple/20 text-wp-purple inline-block rounded-lg
                        px-3 py-1 text-xs font-medium
                      `}>
                        {refund.store}
                      </span>
                      {refund.receipt && (
                        <a 
                          href={refund.receipt} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`
                            text-wp-primary inline-flex items-center space-x-1
                            transition-colors
                            hover:text-wp-accent
                          `}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-xs">Receipt</span>
                        </a>
                      )}
                    </div>
                    {refund.finalStatus === 'Not Approved' && (refund.rejectAdminReason || refund.rejectAMReason) && (
                      <div className="border-wp-border/30 mt-3 border-t pt-3">
                        <p className="text-wp-text-muted mb-1 text-xs">Rejection Reason:</p>
                        <p className="text-sm text-red-400">
                          {refund.rejectAdminReason || refund.rejectAMReason}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <span className={`
                      rounded-full px-4 py-2 text-sm font-medium
                      ${overallStatus.bgColor}
                      ${overallStatus.color}
                      ${overallStatus.borderColor}
                      border
                    `}>
                      {overallStatus.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

