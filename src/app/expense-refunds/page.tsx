'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
import ExternalLinkCard from '@/components/ExternalLinkCard';

interface ExpenseRefund {
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

const STATUS_MAP = {
  'In Progress': { label: 'In Progress', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/30' },
  'Approved': { label: 'Approved', color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/30' },
  'Not Approved': { label: 'Rejected', color: 'text-red-400', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/30' },
} as const;

export default function ExpenseRefundsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { teamMember, loading: teamMemberLoading } = useTeamMember();
  const [expenseRefunds, setExpenseRefunds] = useState<ExpenseRefund[]>([]);
  const [filteredExpenseRefunds, setFilteredExpenseRefunds] = useState<ExpenseRefund[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExpenseRefunds = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/expense-refunds");

      if (!response.ok) {
        throw new Error("Failed to fetch expense refunds");
      }

      const data = await response.json();
      setExpenseRefunds(data);
    } catch (error) {
      setError("Failed to fetch expense refunds");
      console.error("Error fetching expense refunds:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  // Filter expense refunds based on status
  useEffect(() => {
    if (!expenseRefunds.length) {
      setFilteredExpenseRefunds([]);
      return;
    }

    if (statusFilter === 'All') {
      setFilteredExpenseRefunds(expenseRefunds);
    } else {
      const filtered = expenseRefunds.filter(refund => {
        const overallStatusKey = refund.finalStatus;
        return overallStatusKey === statusFilter;
      });
      setFilteredExpenseRefunds(filtered);
    }
  }, [expenseRefunds, statusFilter]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchExpenseRefunds();
    }
  }, [session, fetchExpenseRefunds]);

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
        title="My Expense Refunds"
        description="Track and manage all your submitted expense refund requests."
        actionButton={{
          label: "New Expense Refund",
          href: "/expense-refunds/bulk",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )
        }}
      />

      {/* Obtain Refund Link Card */}
      <ExternalLinkCard
        title="Obtain your refund"
        description="Process reimbursements and expense claims"
        icon="💰"
        href="https://sites.google.com/whiteprompt.com/intranet/administration/get-your-refund"
      />
      <br />

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
                <option value="Approved">✅ Approved</option>
                <option value="In Progress">🔄 In Progress</option>
                <option value="Not Approved">❌ Rejected</option>
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

      {error ? (
        <ErrorDisplay message={error} />
      ) : filteredExpenseRefunds.length === 0 ? (
        <EmptyState
          title={statusFilter === 'All' ? 'No Expense Refunds Yet' : `No ${statusFilter} Expense Refunds`}
          description={statusFilter === 'All' 
            ? "You haven't submitted any expense refund requests yet. Start by submitting your first expense refund!"
            : `No expense refunds found with status "${statusFilter}".`
          }
          actionButton={{
            label: "Submit Your First Expense Refund",
            href: "/expense-refunds/new",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )
          }}
          icon={(
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
        />
      ) : (
        <div className="space-y-6 wp-slide-up">
          <div className="flex items-center justify-between">
            <p className="wp-body text-wp-text-secondary">
              {statusFilter === 'All' 
                ? `${expenseRefunds.length} expense refund${expenseRefunds.length !== 1 ? 's' : ''} submitted`
                : `${filteredExpenseRefunds.length} ${statusFilter.toLowerCase()} expense refund${filteredExpenseRefunds.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          
          <div className="grid gap-6">
            {filteredExpenseRefunds.map((refund) => {
              const overallStatus = STATUS_MAP[refund.finalStatus as keyof typeof STATUS_MAP];
              
              return (
                <div key={refund.id} className="wp-card p-10 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="wp-heading-3 text-wp-primary">{refund.concept}</h3>
                          </div>
                          <p className="wp-body-small text-wp-text-muted">
                            Date: {new Date(refund.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${overallStatus.bgColor} ${overallStatus.color} ${overallStatus.borderColor} border`}>
                            {overallStatus.label}
                          </span>
                          {overallStatus.label === 'Rejected' && (refund.rejectAdminReason || refund.rejectAMReason) && (
                            <div className="mt-2 max-w-xs">
                              <p className="text-xs text-wp-text-muted mb-1">Reason:</p>
                              <p className="text-sm text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/30">
                                {refund.rejectAdminReason || refund.rejectAMReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Amount Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div>
                            <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold mb-2 block">
                              Amount
                            </label>
                            <div className="space-y-1">
                              <p className="wp-heading-3 text-wp-primary">{refund.amount.toFixed(2)} {refund.currency}</p>
                              {refund.currency !== 'USD' && (
                                <p className="wp-body-small text-wp-text-muted">
                                  ≈ ${(refund.amount / (refund.usdExchange || 0)).toFixed(2)} USD
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold mb-2 block">
                              Tax
                            </label>
                            <p className="wp-heading-3 text-wp-text-primary">{(refund.tax || 0).toFixed(2)} {refund.currency}</p>
                          </div>

                          <div>
                            <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold mb-2 block">
                              USD Exchange Rate
                            </label>
                            <p className="wp-heading-3 text-wp-text-primary">
                              {refund.currency === 'USD' ? '-' : (refund.usdExchange || 0)}
                            </p>
                          </div>
                        </div>

                        {/* Store and Details Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold mb-2 block">
                              Store
                            </label>
                            <span className="inline-block px-4 py-2 bg-wp-purple/20 text-wp-purple rounded-lg text-sm font-medium">
                              {refund.store}
                            </span>
                          </div>

                          {refund.receipt && (
                            <div>
                              <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold mb-2 block">
                                Receipt
                              </label>
                              <a 
                                href={refund.receipt} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-wp-primary/10 text-wp-primary rounded-lg hover:bg-wp-primary/20 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span>View Receipt</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Additional Name Section - Only if present */}
                        {refund.name && (
                          <div>
                            <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold mb-2 block">
                              Additional Details
                            </label>
                            <div className="bg-wp-dark-card/20 p-4 rounded-lg border border-wp-border/30">
                              <p className="wp-body text-wp-text-primary leading-relaxed">
                                {refund.name}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
            })}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
