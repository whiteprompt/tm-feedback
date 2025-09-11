'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';

interface Leave {
  id: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  days: number;
  comments?: string;
}

const STATUS_COLORS = {
  'Done': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
  'Pending': 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
  'Rejected': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  'Cancelled': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
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
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      };
      
      const targetStatuses = statusMap[statusFilter] || [];
      const filtered = leaves.filter(leave => targetStatuses.includes(leave.status));
      setFilteredLeaves(filtered);
    }
  }, [leaves, statusFilter]);
  
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
          href: "https://redmine.whiteprompt.com/projects/licencias/issues/new",
          external: true,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )
        }}
      />

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
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaves.map((leave, index) => (
                        <tr key={leave.id || index} className="border-b border-wp-border/50 hover:bg-wp-dark-card/30 transition-colors">
                          <td className="px-6 py-6 text-center">
                            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${LEAVE_TYPE_COLORS[leave.type as keyof typeof LEAVE_TYPE_COLORS] || LEAVE_TYPE_COLORS.Unknown}`}>
                              {leave.type}
                            </span>
                          </td>
                          <td className="px-6 py-6 wp-body-small text-wp-text-secondary text-center">
                            {new Date(leave.start_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-6 wp-body-small text-wp-text-secondary text-center">
                            {new Date(leave.end_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-6 wp-body text-wp-text-primary font-medium text-center">
                            {leave.days}
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${STATUS_COLORS[leave.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.Pending}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-6 py-6 wp-body-small text-wp-text-secondary text-center max-w-xs truncate">
                            {leave.comments || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}