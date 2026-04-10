'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  status: 'active' | 'completed';
  projectStatus: string;
  nextDue: string | null;
  startDate: string | null;
  targetEndDate: string | null;
  scope: string | null;
  meetingLink: string | null;
  projectId: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Temporarily show Coming Soon while feature is under development
  const showComingSoon = true;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/student/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to load projects:', errorData);
        toast.error(errorData.error || 'Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getNextDueDisplay = (project: Project) => {
    if (project.status === 'completed') return '—';
    if (!project.nextDue) return '—';

    const dueDate = new Date(project.nextDue);
    const now = new Date();
    const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return <span className="text-red-600 font-medium">Overdue</span>;
    } else if (daysUntilDue === 0) {
      return <span className="text-orange-600 font-medium">Due Today</span>;
    } else if (daysUntilDue <= 2) {
      return <span className="text-yellow-600 font-medium">Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}</span>;
    }

    return formatDate(project.nextDue);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  // Temporarily show Coming Soon
  if (showComingSoon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <BriefcaseIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Projects Coming Soon</h1>
          <p className="text-xl text-gray-600 mb-8">
            We're putting the finishing touches on your projects workspace.
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Soon you'll be able to track your active internships, manage deliverables,
            submit updates, and collaborate with business owners all in one place.
          </p>
          <Link href="/student/dashboard">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="mt-2 text-gray-600">Track your active internships and AI projects</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setFilter('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'active'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active ({projects.filter(p => p.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'completed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed ({projects.filter(p => p.status === 'completed').length})
            </button>
          </nav>
        </div>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all'
                  ? 'No projects yet'
                  : filter === 'active'
                  ? 'No active projects'
                  : 'No completed projects'}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' && 'Your accepted applications will appear here as active projects.'}
                {filter === 'active' && 'You don\'t have any active projects at the moment.'}
                {filter === 'completed' && 'You haven\'t completed any projects yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} hover>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Company Logo */}
                      {project.companyLogoUrl ? (
                        <img
                          src={project.companyLogoUrl}
                          alt={project.companyName}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <span className="text-lg font-semibold text-gray-400">
                            {project.companyName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Project Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {project.title}
                          </h3>
                          {project.status === 'completed' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {project.companyName}
                        </p>

                        {/* Project Details Grid */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Start Date:</span>
                            <p className="font-medium text-gray-900">{formatDate(project.startDate)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Target End:</span>
                            <p className="font-medium text-gray-900">{formatDate(project.targetEndDate)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Next Update Due:</span>
                            <p className="font-medium text-gray-900">{getNextDueDisplay(project)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Open Button */}
                    <div className="ml-6">
                      <Link href={`/student/projects/${project.id}`}>
                        <Button variant="primary" className="flex items-center">
                          Open
                          <ChevronRightIcon className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}