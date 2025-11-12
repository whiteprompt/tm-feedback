'use client';

import { useFeedbacks } from '@/contexts/FeedbacksContext';
import Link from 'next/link';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';

interface FeedbacksProps {
  description?: string;
}

const SATISFACTION_MAP = {
  'happy': { emoji: '😊', label: 'Happy', color: 'text-green-400' },
  'neutral': { emoji: '😐', label: 'Neutral', color: 'text-yellow-400' },
  'sad': { emoji: '😞', label: 'Sad', color: 'text-red-400' }
} as const;

export default function Feedbacks({
  description = "Review all your previously submitted project feedbacks and satisfaction ratings. Share your experience and help improve our projects."
}: FeedbacksProps) {
  const { feedbacks, loading, error } = useFeedbacks();

  return (
    <section className="mb-16 wp-slide-up">
      <div className="wp-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-wp-purple to-wp-purple-dark rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <h2 className="wp-heading-3">Feedbacks</h2>
              <p className="wp-body-small text-wp-text-secondary mt-2">
                {description}
              </p>
            </div>
          </div>
          <Link
            href="/feedbacks/new"
            className="wp-button-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-wp-primary/30 border-t-wp-primary rounded-full animate-spin"></div>
              </div>
              <p className="wp-body text-wp-text-secondary">Loading feedbacks...</p>
            </div>
          </div>
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-wp-text-muted mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="wp-heading-3 text-wp-text-muted mb-2">No Feedbacks Yet</h3>
            <p className="wp-body text-wp-text-muted mb-6">You haven't submitted any project feedbacks yet. Start by sharing your experience on a project!</p>
            <Link href="/feedbacks/new" className="wp-button-primary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Submit Your First Feedback
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
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
                  <div key={feedback.id} className="p-6 rounded-lg border border-wp-border hover:bg-wp-dark-card/30 transition-all duration-300">
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
    </section>
  );
}

