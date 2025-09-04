'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import { useSettings } from '@/contexts/SettingsContext';

interface Presentation {
  projectPlainName: string;
  projectName: string;
  status: 'Presented' | 'Cancelled' | 'Rejected' | 'Follow-up';
  start: string;
  end: string;
  lastUpdated: string;
  comments: string;
}

const STATUS_COLORS = {
  'Presented': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
  'Cancelled': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  'Rejected': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  'Follow-up': 'bg-gradient-to-r from-wp-primary to-wp-accent text-white',
  'Interview': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
} as const;

export default function PresentationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { teamMember, loading: teamMemberLoading } = useTeamMember();
  const { settings, loading: settingsLoading } = useSettings();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    const fetchPresentations = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(`/api/presentations`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch presentations');
        }

        const data = await response.json();

        setPresentations(data || []);
      } catch (error) {
        console.error('Error fetching presentations:', error);
        setError('Failed to load presentations');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchPresentations();
    }
  }, [session, status, router]);

  if (loading || teamMemberLoading || settingsLoading) {
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

  if (!settings.showPresentations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wp-dark-primary via-wp-dark-secondary to-wp-dark-tertiary">
        <Navigation />
        <main className="flex justify-center items-center min-h-[80vh] px-4 sm:px-6 lg:px-8">
          <div className="wp-slide-up">
            <div className="wp-card p-12 text-center max-w-md w-full">
              <div className="text-wp-text-muted mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="wp-heading-3 text-wp-text-muted mb-2">Feature Disabled</h3>
              <p className="wp-body text-wp-text-muted">This feature is currently disabled.</p>
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
            <h1 className="wp-heading-1 text-wp-text-primary mb-4">My Presentations</h1>
          </div>
          <div>
            <p className="wp-body text-wp-text-secondary">Track your presentation history and status updates</p>
          </div>

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
            ) : !presentations?.length ? (
              <div className="text-center py-12">
                <div className="text-wp-text-muted mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10h6V6H9z" />
                  </svg>
                </div>
                <h3 className="wp-heading-3 text-wp-text-muted mb-2">No Presentations</h3>
                <p className="wp-body text-wp-text-muted">No presentations found for your account.</p>
              </div>
            ) : (
              <div className="overflow-hidden flex justify-center">
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full mx-auto">
                    <thead>
                      <tr className="border-b border-wp-border">
                        <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          Client
                        </th>
                        <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          Start
                        </th>
                        <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          End
                        </th>
                        <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          Last Updated
                        </th>
                        <th className="px-6 py-4 text-center wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                          Comments
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {presentations.map((presentation, index) => (
                        <tr key={index} className="border-b border-wp-border/50 hover:bg-wp-dark-card/30 transition-colors">
                          <td className="px-6 py-6 wp-body text-wp-text-primary font-medium text-center">
                            {presentation.projectPlainName || presentation.projectName}
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${STATUS_COLORS[presentation.status]}`}>
                              {presentation.status}
                            </span>
                          </td>
                          <td className="px-6 py-6 wp-body-small text-wp-text-secondary text-center">
                            {new Date(presentation.start).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-6 wp-body-small text-wp-text-secondary text-center">
                            {new Date(presentation.end).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-6 wp-body-small text-wp-text-secondary text-center">
                            {new Date(presentation.lastUpdated).toLocaleString()}
                          </td>
                          <td className="px-6 py-6 wp-body-small text-wp-text-secondary text-center max-w-xs truncate">
                            {presentation.comments}
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