'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Select from 'react-select';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';

interface Project {
  id: string;
  name: string;
}

interface FeedbackForm {
  projectId: string;
  role: string;
  responsibilities: string;
  technologies: string[];
}

interface NotionTitle {
  plain_text: string;
}

interface NotionRollup {
  array: Array<{
    title: NotionTitle[];
  }>;
}

interface NotionProperties {
  '*ProjectsDB (wpId)': {
    rollup: NotionRollup;
  };
}

interface NotionResult {
  id: string;
  properties: NotionProperties;
}

interface NotionResponse {
  results: NotionResult[];
}

interface TeamMemberFeedbackClientProps {
  initialData: NotionResponse;
}

export default function TeamMemberFeedbackClient({ initialData }: TeamMemberFeedbackClientProps) {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>(() => {
    return initialData.results?.map((result: NotionResult) => ({
      id: result.id,
      name: result.properties['*ProjectsDB (wpId)']?.rollup?.array?.[0]?.title?.[0]?.plain_text || 'Unnamed Project'
    })).filter((project: Project) => project.name) || [];
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<FeedbackForm>({
    projectId: '',
    role: '',
    responsibilities: '',
    technologies: [],
  });
  const [currentTech, setCurrentTech] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (session?.user?.email && isClient) {
      fetchProjects();
    }
  }, [session, isClient]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data: NotionResponse = await response.json();
      
      const projectList = data.results?.map((result: NotionResult) => ({
        id: result.id,
        name: result.properties['*ProjectsDB (wpId)']?.rollup?.array?.[0]?.title?.[0]?.plain_text || 'Unnamed Project'
      })).filter((project: Project) => project.name) || [];
      
      setProjects(projectList);
    } catch (error) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects:', error);
    }
  };

  const handleProjectChange = (selected: Project | null) => {
    setSelectedProject(selected);
    setFormData(prev => ({ ...prev, projectId: selected?.id || '' }));
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

    try {
      const { error: supabaseError } = await supabase
        .from('team_member_feedback')
        .insert([
          {
            user_email: session?.user?.email,
            project_id: formData.projectId,
            role: formData.role,
            responsibilities: formData.responsibilities,
            technologies: formData.technologies,
          }
        ]);

      if (supabaseError) throw supabaseError;

      // Reset form
      setFormData({
        projectId: '',
        role: '',
        responsibilities: '',
        technologies: [],
      });
      setSelectedProject(null);
      alert('Feedback submitted successfully!');
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
                Project
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