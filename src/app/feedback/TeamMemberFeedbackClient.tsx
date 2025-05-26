'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Select from 'react-select';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/feedback')}`);
    }
  }, [status, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchTeamMemberInfo = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/team-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch team member info");
      }

      const teamMember = await response.json();
      setProjects(teamMember.allocations.map((allocation: {
        project: string
      }) => ({
        id: allocation.project,
        name: allocation.project
      })));
    } catch (error) {
      console.error("Error fetching team member info:", error);
      setProjects([]);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email && isClient) {
      fetchTeamMemberInfo();
    }
  }, [session, isClient, fetchTeamMemberInfo]);

  const handleProjectChange = async (selected: Project | null) => {
    setSelectedProject(selected);
    setFormData(prev => ({ ...prev, projectId: selected?.id || '' }));

    if (selected && session?.user?.email) {
      try {
        const response = await fetch("/api/last-feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session.user.email,
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
    if (e.key === 'Enter' && currentTech.trim()) {
      e.preventDefault();
      if (!formData.technologies.includes(currentTech.trim())) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, currentTech.trim()]
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

      // Reset form
      setFormData({
        projectId: '',
        role: '',
        responsibilities: '',
        technologies: [],
        overallSatisfaction: 'neutral',
        projectIssue: '',
      });
      setSelectedProject(null);
      
      // Redirect to home page
      router.push('/submitted-feedbacks');
    } catch (error) {
      setError('Failed to submit feedback');
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || !isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-6">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Team Member Feedback
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project <span className="text-red-500">*</span>
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your role"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsibilities
              </label>
              <textarea
                value={formData.responsibilities}
                onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your responsibilities"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technologies
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type technology and press Enter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Satisfaction <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="satisfaction"
                    value="happy"
                    checked={formData.overallSatisfaction === 'happy'}
                    onChange={(e) => setFormData(prev => ({ ...prev, overallSatisfaction: e.target.value }))}
                    className="h-4 w-4 text-blue-600"
                    required
                  />
                  <span className="text-2xl">{SATISFACTION_MAP.happy}</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="satisfaction"
                    value="neutral"
                    checked={formData.overallSatisfaction === 'neutral'}
                    onChange={(e) => setFormData(prev => ({ ...prev, overallSatisfaction: e.target.value }))}
                    className="h-4 w-4 text-blue-600"
                    required
                  />
                  <span className="text-2xl">{SATISFACTION_MAP.neutral}</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="satisfaction"
                    value="sad"
                    checked={formData.overallSatisfaction === 'sad'}
                    onChange={(e) => setFormData(prev => ({ ...prev, overallSatisfaction: e.target.value }))}
                    className="h-4 w-4 text-blue-600"
                    required
                  />
                  <span className="text-2xl">{SATISFACTION_MAP.sad}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Issue
              </label>
              <textarea
                value={formData.projectIssue}
                onChange={(e) => setFormData(prev => ({ ...prev, projectIssue: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe any issues or challenges you're facing in the project"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 