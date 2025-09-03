'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import Link from 'next/link';

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
  
  if (loading || teamMemberLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="wp-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-wp-primary/30 border-t-wp-primary rounded-full animate-spin"></div>
            </div>
            <p className="wp-body text-wp-text-secondary">Loading your information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!teamMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wp-dark-primary via-wp-dark-secondary to-wp-dark-tertiary">
        <Navigation />
        <main className="wp-section-sm">
          <div className="wp-container">
            <div className="wp-card p-8">
              <div className="text-wp-text-muted mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="wp-heading-3 text-wp-text-muted mb-2">No Information</h3>
              <p className="wp-body text-wp-text-muted">No team member information available.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="wp-section-sm">
        <div className="wp-container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-16 wp-fade-in">
            <div>
              <h1 className="wp-heading-1 mb-4">My Leaves</h1>
              <p className="wp-body-large">
                Review all your previously submitted leaves.
              </p>
            </div>
            <Link
              href="https://redmine.whiteprompt.com/projects/licencias/issues/new"
              className="wp-button-primary inline-flex items-center space-x-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Submit New Leave</span>
            </Link>
          </div>
          <br />

          {/* Content */}
          <div className="wp-card p-8">
            {error ? (
             <div className="text-center py-12">
                <div className="text-red-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="wp-heading-3 text-red-400 mb-2">Error</h3>
                <p className="wp-body text-wp-text-muted">{error}</p>
              </div>
            ) : !leaves?.length ? (
              <div className="text-center py-12">
                <div className="text-wp-text-muted mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4h8m-4-4v8m-4-4h8" />
                  </svg>
                </div>
                <h3 className="wp-heading-3 text-wp-text-muted mb-2">No Leaves</h3>
                <p className="wp-body text-wp-text-muted">No leaves found for your account.</p>
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
                      {leaves.map((leave, index) => (
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
        </div>
      </main>
    </div>
  );
}