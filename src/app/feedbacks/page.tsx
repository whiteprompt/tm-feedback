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

interface Feedback {
  id: string;
  role: string;
  responsibilities: string;
  technologies: string[];
  overall_satisfaction: string;
  project_issue: string;
  created_at: string;
  project_id: string;
}

const SATISFACTION_MAP = {
  'happy': { emoji: '😊', label: 'Happy', color: 'text-green-400' },
  'neutral': { emoji: '😐', label: 'Neutral', color: 'text-yellow-400' },
  'sad': { emoji: '😞', label: 'Sad', color: 'text-red-400' }
} as const;

export default function SubmittedFeedbacksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { teamMember, loading: teamMemberLoading } = useTeamMember();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeedbacks = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/feedbacks");

      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks");
      }

      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      setError("Failed to fetch feedbacks");
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchFeedbacks();
    }
  }, [session, fetchFeedbacks]);

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
        title="My Submitted Feedbacks"
        description="Review all your previously submitted project feedbacks and satisfaction ratings."
        actionButton={{
          label: "Submit New Feedback",
          href: "/feedbacks/new",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )
        }}
      />
      {error ? (
        <ErrorDisplay message={error} />
      ) : feedbacks.length === 0 ? (
        <EmptyState
          title="No Feedbacks Yet"
          description="You haven't submitted any project feedbacks yet. Start by sharing your experience on a project!"
          actionButton={{
            label: "Submit Your First Feedback",
            href: "/feedbacks/new",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )
          }}
        />
      ) : (
        <div className="space-y-6 wp-slide-up">
          <div className="flex items-center justify-between">
            <p className="wp-body text-wp-text-secondary">
              {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} submitted
            </p>
          </div>
          
          <div className="grid gap-6">
            {feedbacks.map((feedback) => {
              const satisfaction = SATISFACTION_MAP[feedback.overall_satisfaction as keyof typeof SATISFACTION_MAP];
              const isRecent = new Date(feedback.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              
              return (
                <div key={feedback.id} className="wp-card p-8 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="wp-heading-3 text-wp-primary">{feedback.project_id}</h3>
                            {isRecent && (
                              <span className="px-2 py-1 bg-wp-primary/20 text-wp-primary text-xs font-semibold rounded-full">
                                Recent
                              </span>
                            )}
                          </div>
                          <p className="wp-body-small text-wp-text-muted">
                            Submitted on {new Date(feedback.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl mb-1">{satisfaction.emoji}</div>
                          <p className={`text-xs font-medium ${satisfaction.color}`}>
                            {satisfaction.label}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold mb-2 block">
                              Role
                            </label>
                            <p className="wp-body text-wp-text-primary">{feedback.role}</p>
                          </div>
                          
                          <div>
                            <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold mb-2 block">
                              Responsibilities
                            </label>
                            <p className="wp-body text-wp-text-primary leading-relaxed">
                              {feedback.responsibilities}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold mb-2 block">
                              Technologies
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {feedback.technologies.map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-wp-purple/20 text-wp-purple rounded-full text-sm font-medium"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>

                          {feedback.project_issue && (
                            <div>
                              <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold mb-2 block">
                                Comments
                              </label>
                              <p className="wp-body text-wp-text-primary leading-relaxed bg-wp-dark-card/20 p-4 rounded-lg border border-wp-border/30">
                                {feedback.project_issue}
                              </p>
                            </div>
                          )}
                        </div>
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