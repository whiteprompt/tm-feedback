'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DataCard } from '@/components/DataCard';

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
  'Cancelled': 'bg-gradient-to-r from-pink-400 to-pink-600 text-white',
  'Rejected': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  'Accepted': 'bg-gradient-to-r from-blue-500 to-green-600 text-white',
  'Follow-up': 'bg-gradient-to-r from-wp-primary to-wp-accent text-white',
  'Interview': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
} as const;

export default function Presentations() {
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

  const icon = (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10h6V6H9z" />
    </svg>
  );

  // Render the table as a single item since DataCard expects items in a grid
  const renderTable = () => (
    <div className="overflow-hidden flex justify-center col-span-full">
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
                Date
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
                  {new Date(presentation.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
  );

  return (
    <DataCard<Presentation>
      // title="Processes"
      // description={description}
      icon={icon}
      iconBgClassName="bg-linear-to-r from-wp-primary to-wp-accent"
      data={error ? null : presentations}
      isLoading={loading}
      wrapperClassName="mb-16 wp-slide-up"
      emptyState={{
        icon: (
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10h6V6H9z" />
          </svg>
        ),
        title: 'No Client introductions',
        message: 'No client introductions found for your account.',
      }}
      noDataState={{
        icon: (
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        title: 'Error',
        message: error || 'Failed to load presentations.',
      }}
      renderItem={(presentation: Presentation, index: number) => {
        // Only render the table on the first item, then return null for others
        if (index === 0) {
          return renderTable();
        }
        return null;
      }}
    />
  );
}

