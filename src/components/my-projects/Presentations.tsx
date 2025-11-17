'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Presentation {
  projectPlainName: string;
  projectName: string;
  status: 'Presented' | 'Cancelled' | 'Rejected' | 'Follow-up';
  start: string;
  end: string;
  lastUpdated: string;
  comments: string;
}

interface PresentationsProps {
  description?: string;
}

const STATUS_COLORS = {
  'Presented': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
  'Cancelled': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  'Rejected': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  'Accepted': 'bg-gradient-to-r from-blue-500 to-green-600 text-white',
  'Follow-up': 'bg-gradient-to-r from-wp-primary to-wp-accent text-white',
  'Interview': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
} as const;

export default function Presentations({
  description = "Track your presentation history and status updates. View all your past and upcoming presentations with their current status."
}: PresentationsProps) {
  const { data: session, status } = useSession();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
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
        setPresentations((data || []).sort((a: Presentation, b: Presentation) => new Date(b.end).getTime() - new Date(a.end).getTime()));
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
  }, [session, status]);

  return (
    <section className="mb-16 wp-slide-up">
      <div className="wp-card p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-linear-to-r from-wp-primary to-wp-accent rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10h6V6H9z" />
            </svg>
          </div>
          <div>
            <h2 className="wp-heading-3">Presentations</h2>
            <p className="wp-body-small text-wp-text-secondary mt-2">
              {description}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-wp-primary/30 border-t-wp-primary rounded-full animate-spin"></div>
              </div>
              <p className="wp-body text-wp-text-secondary">Loading presentations...</p>
            </div>
          </div>
        ) : error ? (
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
    </section>
  );
}

