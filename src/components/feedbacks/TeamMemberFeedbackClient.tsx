'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Select from 'react-select';
import ErrorBanner from '@/components/ErrorBanner';
import { useRouter } from 'next/navigation';
import { useTeamMember } from '@/contexts/TeamMemberContext';
import { useFeedbacks } from '@/contexts/FeedbacksContext';
import { Allocation } from '@/lib/constants';
import FormActionButtons from '@/components/FormActionButtons';

interface Project {
  id: string;
  name: string;
}

interface FeedbackForm {
  projectId: string;
  role: string;
  responsibilities: string;
  technologies: string[];
  overallSatisfaction: string;
  comments: string;
}

const SATISFACTION_MAP = {
  'happy': '😊',
  'neutral': '😐',
  'sad': '😞'
} as const;

export default function TeamMemberFeedbackClient() {
  const { status } = useSession();
  const router = useRouter();
  const { getLastFeedbackForProject, refetch } = useFeedbacks();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<FeedbackForm>({
    projectId: '',
    role: '',
    responsibilities: '',
    technologies: [],
    overallSatisfaction: 'neutral',
    comments: '',
  });
  const [currentTech, setCurrentTech] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/feedbacks/new')}`);
    }
  }, [status, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { teamMember } = useTeamMember();

  useEffect(() => {
    if (teamMember?.allocations && isClient) {
      setProjects(teamMember.allocations.map((allocation: Allocation) => ({
        id: allocation.project.id,
        name: allocation.project.projectName
      })).filter((project: Project) => !project.name?.toLowerCase().includes('wp')));
    }
  }, [teamMember, isClient]);

  // Track form changes
  useEffect(() => {
    const initialFormData = {
      projectId: '',
      role: '',
      responsibilities: '',
      technologies: [],
      overallSatisfaction: 'neutral',
      comments: '',
    };

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);



  const handleProjectChange = (selected: Project | null) => {
    setSelectedProject(selected);
    setFormData(prev => ({ ...prev, projectId: selected?.id || '' }));

    if (selected) {
      // Get the last feedback for this project from context
      const lastFeedback = getLastFeedbackForProject(selected.id);
      
      if (lastFeedback) {
        setFormData(prev => ({
          ...prev,
          role: lastFeedback.role || '',
          technologies: lastFeedback.technologies || [],
        }));
      } else {
        // Reset form fields if no previous feedback exists
        setFormData(prev => ({
          ...prev,
          role: '',
          technologies: [],
        }));
      }
    } else {
      // Reset form fields if no project is selected
      setFormData(prev => ({
        ...prev,
        role: '',
        technologies: [],
      }));
    }
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = currentTech.trim();
    if ((e.key === 'Enter' || e.key === ',') && value) {
      e.preventDefault();
      if (!formData.technologies.includes(value)) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, value]
        }));
      }
      setCurrentTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedProject) {
      setError('Please select a project');
      setLoading(false);
      return;
    }

    if (!formData.technologies.length) {
      setError('Please add at least one technology');
      setLoading(false);
      return;
    }

    // Check if there's any text in the technologies input
    if (currentTech.trim()) {
      const shouldSubmit = window.confirm('You have an unadded technology in the input. Would you like to add it before submitting?');
      if (shouldSubmit) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, currentTech.trim()]
        }));
        setCurrentTech('');
      } else {
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject?.name || '',
          role: formData.role,
          responsibilities: formData.responsibilities,
          technologies: formData.technologies,
          overallSatisfaction: formData.overallSatisfaction,
          comments: formData.comments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      // Reset form and unsaved changes flag
      setFormData({
        projectId: '',
        role: '',
        responsibilities: '',
        technologies: [],
        overallSatisfaction: 'neutral',
        comments: '',
      });
      setSelectedProject(null);
      setHasUnsavedChanges(false);
      
      // Refetch feedbacks to update the list
      await refetch();
      
      // Redirect to feedbacks page
      router.push('/feedbacks');
    } catch (error) {
      setError('Failed to submit feedback');
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };



  if (status === 'loading' || !isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="wp-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className={`
                border-wp-primary/30 border-t-wp-primary h-16 w-16 animate-spin
                rounded-full border-4
              `}></div>
            </div>
            <p className="wp-body text-wp-text-secondary">Loading your information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className={`
      from-wp-dark-primary via-wp-dark-secondary to-wp-dark-tertiary
      min-h-screen bg-linear-to-r
    `}>
        <main className="wp-section-sm">
          <div className="wp-card p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className={`
                  wp-body-small text-wp-text-muted font-semibold tracking-wider
                  uppercase
                `}>
                  Project <span className="text-red-400">*</span>
                </label>
                <Select
                  options={projects}
                  getOptionLabel={(option: Project) => option.name}
                  getOptionValue={(option: Project) => option.id}
                  value={selectedProject}
                  onChange={handleProjectChange}
                  placeholder="Select a project"
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable={false}
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgba(26, 26, 46, 0.6)',
                      borderColor: 'rgba(64, 75, 104, 0.3)',
                      color: '#E2E8F0',
                      minHeight: '48px',
                      '&:hover': { borderColor: '#00A3B4' }
                    }),
                    singleValue: (base) => ({ ...base, color: '#E2E8F0' }),
                    placeholder: (base) => ({ ...base, color: '#94A3B8' }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'rgba(26, 26, 46, 0.95)',
                      border: '1px solid rgba(64, 75, 104, 0.3)'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? '#00A3B4' : 'transparent',
                      color: '#E2E8F0',
                      '&:hover': { backgroundColor: '#00A3B4' }
                    })
                  }}
                />
              </div>
              <div className="space-y-3">
                <label className={`
                  wp-body-small text-wp-text-muted font-semibold tracking-wider
                  uppercase
                `}>
                  Role <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className={`
                    bg-wp-dark-card/60 border-wp-border wp-body
                    text-wp-text-primary placeholder-wp-text-muted w-full
                    rounded-lg border px-4 py-3 transition-all duration-300
                    focus:ring-wp-primary focus:border-wp-primary focus:ring-2
                    focus:outline-none
                  `}
                  placeholder="Enter your role"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className={`
                  wp-body-small text-wp-text-muted font-semibold tracking-wider
                  uppercase
                `}>
                  Responsibilities <span className="text-red-400">*</span>
                </label>
                <p className="wp-body-small text-wp-text-secondary mb-4">
                  Please describe your main tasks and areas of responsibility in the project. Include any significant milestones or achievements from the recent period.
                </p>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                  rows={5}
                  className={`
                    bg-wp-dark-card/60 border-wp-border wp-body
                    text-wp-text-primary placeholder-wp-text-muted w-full
                    resize-none rounded-lg border px-4 py-3 transition-all
                    duration-300
                    focus:ring-wp-primary focus:border-wp-primary focus:ring-2
                    focus:outline-none
                  `}
                  placeholder="Describe your responsibilities"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className={`
                  wp-body-small text-wp-text-muted font-semibold tracking-wider
                  uppercase
                `}>
                  Technologies <span className="text-red-400">*</span>
                </label>
                <p className="wp-body-small text-wp-text-secondary mb-4">
                  {`Add technologies you're using in this project. Press Enter or type a comma (,) to add each technology.`}
                </p>
                <div className="mb-4 flex flex-wrap gap-3">
                  {formData.technologies.map((tech) => (
                    <span
                      key={tech}
                      className={`
                        wp-body-small rom-wp-primary/20 to-wp-accent/20
                        text-wp-primary border-wp-primary/30 inline-flex
                        items-center rounded-full border bg-linear-to-r px-4
                        py-2 font-medium
                      `}
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className={`
                          text-wp-primary ml-2 transition-colors
                          hover:text-wp-accent
                        `}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={currentTech}
                  onChange={(e) => setCurrentTech(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                  className={`
                    bg-wp-dark-card/60 border-wp-border wp-body
                    text-wp-text-primary placeholder-wp-text-muted w-full
                    rounded-lg border px-4 py-3 transition-all duration-300
                    focus:ring-wp-primary focus:border-wp-primary focus:ring-2
                    focus:outline-none
                  `}
                  placeholder="Type technology and press Enter or comma (,)"
                />
              </div>
              <div className="space-y-3">
                <label className={`
                  wp-body-small text-wp-text-muted font-semibold tracking-wider
                  uppercase
                `}>
                  Overall Satisfaction <span className="text-red-400">*</span>
                </label>
                <div className="flex justify-center gap-8 py-4">
                  <label className={`
                    group flex cursor-pointer flex-col items-center space-y-2
                  `}>
                    <input
                      type="radio"
                      name="satisfaction"
                      value="happy"
                      checked={formData.overallSatisfaction === 'happy'}
                      onChange={(e) => setFormData(prev => ({ ...prev, overallSatisfaction: e.target.value }))}
                      className="sr-only"
                      required
                    />
                    <div className={`
                      rounded-full p-4 transition-all duration-300
                      ${formData.overallSatisfaction === 'happy' ? `
                        scale-110 bg-linear-to-r from-green-500 to-green-600
                        shadow-lg
                      ` : `
                        bg-wp-dark-card/60
                        group-hover:bg-green-500/20
                      `}
                    `}>
                      <span className="text-3xl">{SATISFACTION_MAP.happy}</span>
                    </div>
                    <span className="wp-body-small text-wp-text-secondary">Happy</span>
                  </label>
                  <label className={`
                    group flex cursor-pointer flex-col items-center space-y-2
                  `}>
                    <input
                      type="radio"
                      name="satisfaction"
                      value="neutral"
                      checked={formData.overallSatisfaction === 'neutral'}
                      onChange={(e) => setFormData(prev => ({ ...prev, overallSatisfaction: e.target.value }))}
                      className="sr-only"
                      required
                    />
                    <div className={`
                      rounded-full p-4 transition-all duration-300
                      ${formData.overallSatisfaction === 'neutral' ? `
                        scale-110 bg-linear-to-r from-yellow-500 to-yellow-600
                        shadow-lg
                      ` : `
                        bg-wp-dark-card/60
                        group-hover:bg-yellow-500/20
                      `}
                    `}>
                      <span className="text-3xl">{SATISFACTION_MAP.neutral}</span>
                    </div>
                    <span className="wp-body-small text-wp-text-secondary">Neutral</span>
                  </label>
                  <label className={`
                    group flex cursor-pointer flex-col items-center space-y-2
                  `}>
                    <input
                      type="radio"
                      name="satisfaction"
                      value="sad"
                      checked={formData.overallSatisfaction === 'sad'}
                      onChange={(e) => setFormData(prev => ({ ...prev, overallSatisfaction: e.target.value }))}
                      className="sr-only"
                      required
                    />
                    <div className={`
                      rounded-full p-4 transition-all duration-300
                      ${formData.overallSatisfaction === 'sad' ? `
                        scale-110 bg-linear-to-r from-red-500 to-red-600
                        shadow-lg
                      ` : `
                        bg-wp-dark-card/60
                        group-hover:bg-red-500/20
                      `}
                    `}>
                      <span className="text-3xl">{SATISFACTION_MAP.sad}</span>
                    </div>
                    <span className="wp-body-small text-wp-text-secondary">Sad</span>
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <label className={`
                  wp-body-small text-wp-text-muted font-semibold tracking-wider
                  uppercase
                `}>
                  Comments
                </label>
                <p className="wp-body-small text-wp-text-secondary mb-4">
                  {`Please share any additional comments or feedback you'd like to provide. Please also consider issues or challenges you're facing in the project.`}
                </p>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                  rows={4}
                  className={`
                    bg-wp-dark-card/60 border-wp-border wp-body
                    text-wp-text-primary placeholder-wp-text-muted w-full
                    resize-none rounded-lg border px-4 py-3 transition-all
                    duration-300
                    focus:ring-wp-primary focus:border-wp-primary focus:ring-2
                    focus:outline-none
                  `}
                  placeholder="Describe any issues or challenges you're facing in the project"
                />
              </div>
              <ErrorBanner 
                error={error} 
                onDismiss={() => setError('')}
                title="Error submitting feedback"
              />
              <FormActionButtons
                isSubmitting={loading}
                hasUnsavedChanges={hasUnsavedChanges}
                cancelRoute="/my-projects?section=feedbacks"
                submitText="Submit Feedback"
                submittingText="Submitting..."
              />
            </form>
          </div>
      </main>

    </div>
  );
} 