'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import { Project } from '@/types';
import { transformProject, getIndustryTags } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BusinessProfile {
  companyName?: string;
  logoUrl?: string;
  contactName?: string;
}

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    // Add a small delay to ensure cookies are properly set
    const timer = setTimeout(() => {
      setAuthChecked(true);
      fetchProjects();
      fetchProfile();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Refresh projects when returning from create/edit pages
  useEffect(() => {
    const handleRouteChange = () => {
      if (authChecked) {
        fetchProjects();
      }
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [authChecked]);

  // Fetch profile and projects on page focus to get latest updates
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing data...');
      fetchProfile();
      fetchProjects(); // Also refresh projects when page receives focus
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileUpdated') {
        fetchProfile();
      }
      if (e.key === 'projectsUpdated') {
        console.log('Projects updated trigger received');
        fetchProjects();
      }
    };

    // Also check on visibility change (more reliable than focus)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible, refreshing projects...');
        fetchProjects();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/business/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched profile:', data.data);
        setProfile(data.data);
      } else if (response.status === 404) {
        // Profile doesn't exist yet
        console.log('Profile not found, user needs to create one');
        setProfile({
          companyName: '',
          contactName: '',
          logoUrl: ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      // Add timestamp to prevent caching
      const response = await fetch(`/api/business/projects?t=${Date.now()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
      });

      if (response.status === 401) {
        // If unauthorized, redirect to login
        router.push('/business/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched projects:', data.data.length, 'projects');
        // Transform the projects to ensure consistent camelCase naming
        const transformedProjects = data.data.map(transformProject);
        setProjects(transformedProjects);
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/business/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
        toast.success('Project deleted successfully');
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    if (status === 'open') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (status === 'closed') {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const getApplicationsCount = (project: Project) => {
    return project.applications?.length || 0;
  };

  const getActiveApplicationsCount = (project: Project) => {
    return project.applications?.filter(app =>
      ['submitted', 'underReview', 'interviewScheduled'].includes(app.status)
    ).length || 0;
  };

  const getCompensationDisplay = (type: string, value: string) => {
    // Handle missing type
    if (!type) {
      return 'Not specified';
    }

    // Format type label
    let typeLabel = '';
    switch (type) {
      case 'paid-hourly':
        typeLabel = 'Hourly';
        break;
      case 'paid-stipend':
        typeLabel = 'Stipend';
        break;
      case 'paid-fixed':
        typeLabel = 'Fixed Fee';
        break;
      case 'paid-salary':
        typeLabel = 'Salary';
        break;
      case 'equity':
        typeLabel = 'Equity';
        break;
      case 'experience':
        return 'Experience/Portfolio only';
      default:
        typeLabel = type;
    }

    // Handle value display for paid compensation types
    if (!value || value === '' || value === 'Portfolio/Experience Building') {
      return `${typeLabel}: Not specified`;
    }

    return `${typeLabel}: ${value}`;
  };

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#789b4a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ${!profile?.logoUrl ? 'bg-[#789b4a]' : ''}`}>
                {profile?.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt={profile.companyName || 'Company'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BuildingOfficeIcon className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.companyName || 'Business Dashboard'}
                </h1>
                <p className="text-gray-600">Manage your project opportunities</p>
              </div>
            </div>
            <Link href="/business/projects/new">
              <Button className="inline-flex items-center space-x-2">
                <PlusIcon className="w-5 h-5" />
                <span>New Opportunity</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => !p.status || p.status === 'open').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.reduce((sum, p) => sum + getApplicationsCount(p), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <EyeIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.reduce((sum, p) => sum + getActiveApplicationsCount(p), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first opportunity to start connecting with talented AI students.
              </p>
              <Link href="/business/projects/new">
                <Button>
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Your First Opportunity
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const industryTags = getIndustryTags(project);
              return (
                <Card key={project.id} hover className="relative group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                          {project.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {industryTags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {industryTags.length > 2 && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              +{industryTags.length - 2} more
                            </span>
                          )}
                        </div>
                        <div className={getStatusBadge(project.status)}>
                          {project.status === 'closed'
                            ? 'Student Selected'
                            : project.status.charAt(0).toUpperCase() + project.status.slice(1)
                          }
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      {project.estimatedDuration && (
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="w-4 h-4 mr-2" />
                          <span>Duration: {project.estimatedDuration}</span>
                        </div>
                      )}
                      {project.compensationType && project.compensationType !== 'experience' && (
                        <div className="flex items-center text-sm text-gray-500">
                          <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                          <span>{getCompensationDisplay(project.compensationType, project.compensationValue)}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <UsersIcon className="w-4 h-4 mr-2" />
                        <span>{getApplicationsCount(project)} application{getApplicationsCount(project) !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>Ends: {new Date(project.applyWindowEnd).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link href={`/business/projects/${project.id}/applicants`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Applications
                        </Button>
                      </Link>
                      <Link href={`/business/projects/${project.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-full">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(project.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-8">
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-900">
              <QuestionMarkCircleIcon className="w-6 h-6 mr-2" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800">
                  <span className="font-semibold">This is a BETA version.</span> If there are any issues, please contact Gavin Mestler.
                </p>
              </div>

              <div className="flex items-start">
                <PlayCircleIcon className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800">
                  <span className="font-semibold">Watch Tutorial:</span>
                  <a href="https://www.youtube.com/watch?v=xSMx84UMe7E" target="_blank" rel="noopener noreferrer" className="ml-1 hover:underline text-blue-700">
                    How to Use the G1000 Portal
                  </a>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 ml-7">
                <div className="flex items-center text-amber-800">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  <span className="font-medium">Phone:</span>
                  <a href="tel:7606817000" className="ml-1 hover:underline">760-681-7000</a>
                </div>

                <div className="flex items-center text-amber-800">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  <span className="font-medium">Email:</span>
                  <a href="mailto:gmestler1@babson.edu" className="ml-1 hover:underline">gmestler1@babson.edu</a>
                </div>
              </div>

              <p className="text-amber-700 text-sm ml-7 font-medium">
                We will resolve any issues ASAP.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Confirm Delete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this project? This action cannot be undone and will remove all associated applications.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="danger"
                  onClick={() => handleDeleteProject(deleteId)}
                  className="flex-1"
                >
                  Delete Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteId(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 