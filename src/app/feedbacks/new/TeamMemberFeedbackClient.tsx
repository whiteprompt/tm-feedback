'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Select from 'react-select';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import ErrorBanner from '@/components/ErrorBanner';
import { useRouter } from 'next/navigation';
import { useTeamMember } from '@/contexts/TeamMemberContext';

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
  projectIssue: string;
}

const SATISFACTION_MAP = {
  'happy': '😊',
  'neutral': '😐',
  'sad': '😞'
} as const;

export default function TeamMemberFeedbackClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<FeedbackForm>({
    projectId: '',
    role: '',
    responsibilities: '',
    technologies: [],
    overallSatisfaction: 'neutral',
    projectIssue: '',
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
      setProjects(teamMember.allocations.map((allocation: {
        project: string
      }) => ({
        id: allocation.project,
        name: allocation.project
      })));
    }
  }, [teamMember, isClient]);

  const handleProjectChange = async (selected: Project | null) => {
    setSelectedProject(selected);
    setFormData(prev => ({ ...prev, projectId: selected?.id || '' }));

    if (selected && session?.user?.email) {
      try {
        const response = await fetch("/api/feedbacks/last", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: selected.id
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch last feedback");
        }

        const lastFeedback = await response.json();
        setFormData(prev => ({
          ...prev,
          role: lastFeedback.role || '',
          technologies: lastFeedback.technologies || [],
        }));
      } catch (error) {
        console.error("Error fetching last feedback:", error);
        // If there's an error, just keep the form fields empty
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

  // Track form changes
  useEffect(() => {
    const initialFormData = {
      projectId: '',
      role: '',
      responsibilities: '',
      technologies: [],
      overallSatisfaction: 'neutral',
      projectIssue: '',
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

  // Handle navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && hasUnsavedChanges) {
        e.preventDefault();
        const shouldLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
        if (!shouldLeave) {
          // If user cancels, do nothing and stay on the page
          return;
        }
        // Only navigate if user confirms
        router.push(link.href);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [hasUnsavedChanges, router]);

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
      const { error: supabaseError } = await supabase
        .from('team_member_feedback')
        .insert([
          {
            user_email: session?.user?.email,
            project_id: selectedProject?.name || '',
            role: formData.role,
            responsibilities: formData.responsibilities,
            technologies: formData.technologies,
            overall_satisfaction: formData.overallSatisfaction,
            project_issue: formData.projectIssue,
          }
        ]);

      if (supabaseError) throw supabaseError;

      // Reset form and unsaved changes flag
      setFormData({
        projectId: '',
        role: '',
        responsibilities: '',
        technologies: [],
        overallSatisfaction: 'neutral',
        projectIssue: '',
      });
      setSelectedProject(null);
      setHasUnsavedChanges(false);
      
      // Redirect to home page
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

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wp-dark-primary via-wp-dark-secondary to-wp-dark-tertiary">
      <Navigation />
        <main className="wp-section-sm">
          <div className="wp-container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-16 wp-fade-in">
            <h1 className="wp-heading-1 text-wp-text-primary mb-4">Team Member Feedback</h1>
            <p className="wp-body text-wp-text-secondary">Share your project experience and feedback</p>
          </div>

          {/* Form Card */}
          <div className="wp-card p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
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
              <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                Role <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-3 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body text-wp-text-primary placeholder-wp-text-muted focus:outline-none focus:ring-2 focus:ring-wp-primary focus:border-wp-primary transition-all duration-300"
                placeholder="Enter your role"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                Responsibilities <span className="text-red-400">*</span>
              </label>
              <p className="wp-body-small text-wp-text-secondary mb-4">
                Please describe your main tasks and areas of responsibility in the project. Include any significant milestones or achievements from the recent period.
              </p>
              <textarea
                value={formData.responsibilities}
                onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                rows={5}
                className="w-full px-4 py-3 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body text-wp-text-primary placeholder-wp-text-muted focus:outline-none focus:ring-2 focus:ring-wp-primary focus:border-wp-primary transition-all duration-300 resize-none"
                placeholder="Describe your responsibilities"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                Technologies <span className="text-red-400">*</span>
              </label>
              <p className="wp-body-small text-wp-text-secondary mb-4">
                {`Add technologies you're using in this project. Press Enter or type a comma (,) to add each technology.`}
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                {formData.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-4 py-2 rounded-full wp-body-small font-medium bg-gradient-to-r from-wp-primary/20 to-wp-accent/20 text-wp-primary border border-wp-primary/30"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="ml-2 text-wp-primary hover:text-wp-accent transition-colors"
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
                className="w-full px-4 py-3 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body text-wp-text-primary placeholder-wp-text-muted focus:outline-none focus:ring-2 focus:ring-wp-primary focus:border-wp-primary transition-all duration-300"
                placeholder="Type technology and press Enter or comma (,)"
              />
            </div>
            <div className="space-y-3">
              <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                Overall Satisfaction <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-8 justify-center py-4">
                <label className="flex flex-col items-center space-y-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="satisfaction"
                    value="happy"
                    checked={formData.overallSatisfaction === 'happy'}
                    onChange={(e) => setFormData(prev => ({ ...prev, overallSatisfaction: e.target.value }))}
                    className="sr-only"
                    required
                  />
                  <div className={`p-4 rounded-full transition-all duration-300 ${formData.overallSatisfaction === 'happy' ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg scale-110' : 'bg-wp-dark-card/60 group-hover:bg-green-500/20'}`}>
                    <span className="text-3xl">{SATISFACTION_MAP.happy}</span>
                  </div>
                  <span className="wp-body-small text-wp-text-secondary">Happy</span>
                </label>
                <label className="flex flex-col items-center space-y-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="satisfaction"
                    value="neutral"
                    checked={formData.overallSatisfaction === 'neutral'}
                    onChange={(e) => setFormData(prev => ({ ...prev, overallSatisfaction: e.target.value }))}
                    className="sr-only"
                    required
                  />
                  <div className={`p-4 rounded-full transition-all duration-300 ${formData.overallSatisfaction === 'neutral' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg scale-110' : 'bg-wp-dark-card/60 group-hover:bg-yellow-500/20'}`}>
                    <span className="text-3xl">{SATISFACTION_MAP.neutral}</span>
                  </div>
                  <span className="wp-body-small text-wp-text-secondary">Neutral</span>
                </label>
                <label className="flex flex-col items-center space-y-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="satisfaction"
                    value="sad"
                    checked={formData.overallSatisfaction === 'sad'}
                    onChange={(e) => setFormData(prev => ({ ...prev, overallSatisfaction: e.target.value }))}
                    className="sr-only"
                    required
                  />
                  <div className={`p-4 rounded-full transition-all duration-300 ${formData.overallSatisfaction === 'sad' ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg scale-110' : 'bg-wp-dark-card/60 group-hover:bg-red-500/20'}`}>
                    <span className="text-3xl">{SATISFACTION_MAP.sad}</span>
                  </div>
                  <span className="wp-body-small text-wp-text-secondary">Sad</span>
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                Comments
              </label>
              <p className="wp-body-small text-wp-text-secondary mb-4">
                {`Please share any additional comments or feedback you'd like to provide. Please also consider issues or challenges you're facing in the project.`}
              </p>
              <textarea
                value={formData.projectIssue}
                onChange={(e) => setFormData(prev => ({ ...prev, projectIssue: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body text-wp-text-primary placeholder-wp-text-muted focus:outline-none focus:ring-2 focus:ring-wp-primary focus:border-wp-primary transition-all duration-300 resize-none"
                placeholder="Describe any issues or challenges you're facing in the project"
              />
            </div>
            <ErrorBanner 
              error={error} 
              onDismiss={() => setError('')}
              title="Error submitting feedback"
            />
            <div className="flex gap-6 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (hasUnsavedChanges) {
                    const shouldLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
                    if (!shouldLeave) return;
                  }
                  router.push('/feedbacks');
                }}
                className="flex-1 py-4 px-6 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body font-medium text-wp-text-secondary hover:text-wp-text-primary hover:bg-wp-dark-card/80 focus:outline-none focus:ring-2 focus:ring-wp-primary focus:border-wp-primary transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 wp-button-primary py-4 px-6 wp-body disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
          </div>
        </div>
      </main>
    </div>
  );
} 