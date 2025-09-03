'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useTeamMember } from '@/contexts/TeamMemberContext';

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
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-16 wp-fade-in">
            <div>
              <h1 className="wp-heading-1 mb-4">My Submitted Feedbacks</h1>
              <p className="wp-body-large">
                Review all your previously submitted project feedbacks and satisfaction ratings.
              </p>
            </div>
            <Link
              href="/feedback"
              className="wp-button-primary inline-flex items-center space-x-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Submit New Feedback</span>
            </Link>
          </div>
          <br />
          {error ? (
            <div className="wp-card p-8 text-center wp-fade-in">
              <div className="text-red-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="wp-heading-3 text-red-400 mb-2">Error</h3>
              <p className="wp-body text-red-300">{error}</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="wp-card p-12 text-center wp-fade-in">
              <div className="text-wp-text-muted mb-6">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="wp-heading-3 text-wp-text-secondary mb-4">No Feedbacks Yet</h3>
              <p className="wp-body text-wp-text-muted mb-8">
                You haven&rsquo;t submitted any project feedbacks yet. Start by sharing your experience on a project!
              </p>
              <Link href="/feedback" className="wp-button-primary inline-flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Submit Your First Feedback</span>
              </Link>
            </div>
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
        </div>
      </main>
    </div>
  );
}