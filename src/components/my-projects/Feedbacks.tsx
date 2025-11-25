'use client';

import { useFeedbacks } from '@/contexts/FeedbacksContext';
import ErrorDisplay from '@/components/ErrorDisplay';
import { CommentIcon } from '@/components/icons/CommentIcon';

const SATISFACTION_MAP = {
  'happy': { emoji: '😊', label: 'Happy', color: 'text-green-400' },
  'neutral': { emoji: '😐', label: 'Neutral', color: 'text-yellow-400' },
  'sad': { emoji: '😞', label: 'Sad', color: 'text-red-400' }
} as const;

export default function Feedbacks() {
  const { feedbacks, loading, error } = useFeedbacks();

  return (
    <section className="wp-slide-up">
      <div className="wp-card p-8">
        {loading ? (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className={`
                  border-wp-primary/30 border-t-wp-primary h-16 w-16
                  animate-spin rounded-full border-4
                `}></div>
              </div>
              <p className="wp-body text-wp-text-secondary">Loading feedbacks...</p>
            </div>
          </div>
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : feedbacks.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-wp-text-muted mb-4">
              <CommentIcon />
            </div>
            {/* <h3 className="wp-heading-3 text-wp-text-muted mb-2">No Feedbacks Yet</h3> */}
            <p className="wp-body text-wp-text-muted mb-6">You haven't submitted feedback yet. Start by sharing your experience on a Project!</p>
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
                let satisfaction = SATISFACTION_MAP[feedback.overall_satisfaction as keyof typeof SATISFACTION_MAP];
                if (!satisfaction) {
                  satisfaction = { emoji: '😐', label: 'Neutral', color: 'text-yellow-400' };
                }
                const isRecent = new Date(feedback.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                
                return (
                  <div key={feedback.id} className={`
                    border-wp-border rounded-lg border p-6 transition-all
                    duration-300
                    hover:bg-wp-dark-card/30
                  `}>
                    <div className="mb-6 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-3">
                          <h3 className="wp-heading-3 text-wp-primary">{feedback.project_id}</h3>
                          {isRecent && (
                            <span className={`
                              bg-wp-primary/20 text-wp-primary rounded-full px-2
                              py-1 text-xs font-semibold
                            `}>
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
                        <div className="mb-1 text-3xl">{satisfaction.emoji}</div>
                        <p className={`
                          text-xs font-medium
                          ${satisfaction.color}
                        `}>
                          {satisfaction.label}
                        </p>
                      </div>
                    </div>

                    <div className={`
                      grid gap-8
                      md:grid-cols-2
                    `}>
                      <div className="space-y-6">
                        <div>
                          <label className={`
                            wp-body-small text-wp-text-muted mb-2 block
                            font-semibold tracking-wider uppercase
                          `}>
                            Role
                          </label>
                          <p className="wp-body text-wp-text-primary">{feedback.role}</p>
                        </div>
                        
                        <div>
                          <label className={`
                            wp-body-small text-wp-text-muted mb-2 block
                            font-semibold tracking-wider uppercase
                          `}>
                            Responsibilities
                          </label>
                          <p className={`
                            wp-body text-wp-text-primary leading-relaxed
                          `}>
                            {feedback.responsibilities}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className={`
                            wp-body-small text-wp-text-muted mb-2 block
                            font-semibold tracking-wider uppercase
                          `}>
                            Technologies
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {feedback.technologies.map((tech, index) => (
                              <span
                                key={index}
                                className={`
                                  bg-wp-purple/20 text-wp-purple rounded-full
                                  px-3 py-1 text-sm font-medium
                                `}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {feedback.project_issue && (
                          <div>
                            <label className={`
                              wp-body-small text-wp-text-muted mb-2 block
                              font-semibold tracking-wider uppercase
                            `}>
                              Comments
                            </label>
                            <p className={`
                              wp-body text-wp-text-primary bg-wp-dark-card/20
                              border-wp-border/30 rounded-lg border p-4
                              leading-relaxed
                            `}>
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

