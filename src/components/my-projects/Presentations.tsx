'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DataCard } from '@/components/DataCard';
import { FolderIcon } from '@/components/icons/FolderIcon';

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
  'Presented': 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  'Cancelled': 'text-pink-400 bg-pink-400/10 border border-pink-400/20',
  'Rejected': 'text-red-400 bg-red-400/10 border border-red-400/20',
  'Accepted': 'text-green-400 bg-green-400/10 border border-green-400/20',
  'Follow-up': 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
  'Interview': 'text-purple-400 bg-purple-400/10 border border-purple-400/20',
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
    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10h6V6H9z" />
    </svg>
  );

  // Render the table as a single item since DataCard expects items in a grid
  const renderTable = () => (
    <div className="col-span-full flex justify-center overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="mx-auto min-w-full">
          <thead>
            <tr className="border-wp-border border-b">
              <th className={`
                wp-body-small text-wp-text-muted px-6 py-4 text-center
                font-semibold tracking-wider uppercase
              `}>
                Client
              </th>
              <th className={`
                wp-body-small text-wp-text-muted px-6 py-4 text-center
                font-semibold tracking-wider uppercase
              `}>
                Status
              </th>
              <th className={`
                wp-body-small text-wp-text-muted px-6 py-4 text-center
                font-semibold tracking-wider uppercase
              `}>
                Date
              </th>
              <th className={`
                wp-body-small text-wp-text-muted px-6 py-4 text-center
                font-semibold tracking-wider uppercase
              `}>
                Comments
              </th>
            </tr>
          </thead>
          <tbody>
            {presentations.map((presentation, index) => (
              <tr key={index} className={`
                border-wp-border/50 border-b transition-colors
                hover:bg-wp-dark-card/30
              `}>
                <td className={`
                  wp-body text-wp-text-primary px-6 py-6 text-center font-medium
                `}>
                  {presentation.projectPlainName || presentation.projectName}
                </td>
                <td className="px-6 py-6 text-center">
                  <span className={`
                    rounded-full px-4 py-2 text-sm font-semibold
                    ${STATUS_COLORS[presentation.status]}
                  `}>
                    {presentation.status}
                  </span>
                </td>
                <td className={`
                  wp-body-small text-wp-text-secondary px-6 py-6 text-center
                `}>
                  {new Date(presentation.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </td>
                <td className={`
                  wp-body-small text-wp-text-secondary max-w-xs truncate px-6
                  py-6 text-center
                `}>
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
      icon={icon}
      iconBgClassName="bg-linear-to-r from-wp-primary to-wp-accent"
      data={error ? null : presentations}
      isLoading={loading}
      wrapperClassName="mb-16 wp-slide-up"
      emptyState={{
        icon: <FolderIcon />,
        // title: 'No Client Presentations',
        message: "We haven't found any Client presentations yet.",
      }}
      noDataState={{
        icon: <FolderIcon />,
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

