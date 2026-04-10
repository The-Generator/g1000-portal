'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

interface ProjectStudent {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  projectId: string;
  title: string;
  studentName: string;
  studentEmail: string;
  status: 'active' | 'completed';
  projectStatus: string;
  lastUpdate?: string;
  progressPercentage?: number;
  startDate?: string;
  targetEndDate?: string;
  hasOverview: boolean;
  submittedAt: string;
}

export default function BusinessProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const router = useRouter();

  // Temporarily show Coming Soon while feature is under development
  const showComingSoon = true;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/business/projects?type=active-projects', {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/business/login');
          return;
        }
        throw new Error('Failed to fetch projects');
      }

      const { data } = await response.json();
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysAgo = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  // Temporarily show Coming Soon
  if (showComingSoon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Project Management Coming Soon</h1>
          <p className="text-xl text-gray-600 mb-8">
            We're building powerful tools to help you manage your student projects.
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Soon you'll be able to track progress, review deliverables, provide feedback,
            and manage all your active projects from one centralized dashboard.
          </p>
          <Link href="/business/dashboard">
            <button className="bg-generator-green hover:bg-generator-green-dark text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Projects</h1>
        <p className="text-gray-600">
          Manage and track all accepted student applications
        </p>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-generator-green text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Projects ({projects.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-generator-green text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Active ({projects.filter(p => p.status === 'active').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-generator-green text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Completed ({projects.filter(p => p.status === 'completed').length})
        </button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {filter === 'all'
              ? "No projects yet. Accept some student applications to get started!"
              : `No ${filter} projects`
            }
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/business/projects/${project.id}`}
              className="block hover:no-underline"
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {project.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {project.status === 'completed' ? 'Completed' : 'Active'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{project.studentName}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      {project.studentEmail}
                    </div>
                  </div>

                  {project.progressPercentage !== undefined && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-generator-green">
                        {project.progressPercentage}%
                      </div>
                      <div className="text-xs text-gray-500">Progress</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Project Timeline */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Start:</span> {formatDate(project.startDate)}
                    </div>
                    <div>
                      <span className="font-medium">Target End:</span> {formatDate(project.targetEndDate)}
                    </div>
                  </div>

                  {/* Last Update */}
                  {project.lastUpdate ? (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Last update:</span> {getDaysAgo(project.lastUpdate)}
                    </div>
                  ) : (
                    <div className="text-sm text-generator-dark">
                      No updates yet - waiting for student to post first update
                    </div>
                  )}

                  {/* Overview Status */}
                  {!project.hasOverview && (
                    <div className="text-sm text-generator-dark bg-generator-green/10 px-3 py-1 rounded-md inline-block">
                      ⚠️ Project overview needs to be set up
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {project.progressPercentage !== undefined && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-generator-green h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}