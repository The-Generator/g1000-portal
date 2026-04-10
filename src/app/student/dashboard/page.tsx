'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, StudentProfile, Application } from '@/types';
import Link from 'next/link';
import {
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  applicationsSubmitted: number;
  interviewsScheduled: number;
  projectsCompleted: number;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    applicationsSubmitted: 0,
    interviewsScheduled: 0,
    projectsCompleted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user profile and stats
        const [userResponse, statsResponse] = await Promise.all([
          fetch('/api/student/me'),
          fetch('/api/student/stats')
        ]);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.data.user);
          setProfile(userData.data.profile);
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.applicationsSubmitted}</p>
                  <p className="text-sm text-gray-600">Applications Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.interviewsScheduled}</p>
                  <p className="text-sm text-gray-600">Interviews Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.projectsCompleted}</p>
                  <p className="text-sm text-gray-600">Projects Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile ? (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 text-xl font-bold">
                          {user?.name?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                        <p className="text-gray-600">{profile.major} • Class of {profile.year}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    
                    {profile.skills?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {profile.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{profile.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Complete your profile to get started</p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <Link href="/student/profile">
                    <Button variant="outline" className="w-full">
                      {profile ? 'Edit Profile' : 'Complete Profile'}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/student/opportunities">
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">Browse Opportunities</h4>
                        <p className="text-sm text-gray-600">Find exciting AI projects to work on</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/student/applications">
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">My Applications</h4>
                        <p className="text-sm text-gray-600">Track your application status</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/student/interviews">
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">Upcoming Interviews</h4>
                        <p className="text-sm text-gray-600">Manage your interview schedule</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
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
    </div>
  );
} 