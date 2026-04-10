'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  CalendarIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Application } from '@/types';
import { formatMeetingDateTime, parseLocalDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Application | null>(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await fetch('/api/student/applications');
      if (response.ok) {
        const data = await response.json();
        // Filter for only applications with scheduled interviews
        const scheduledInterviews = data.data.filter((app: Application) => 
          app.status === 'interviewScheduled' && app.meetingDateTime
        );
        setInterviews(scheduledInterviews);
      } else {
        toast.error('Failed to load interviews');
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatMeetingDateTimeDetailed = (dateTime: string) => {
    const date = parseLocalDateTime(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      }),
      full: formatMeetingDateTime(dateTime)
    };
  };

  const generateCalendarLink = (interview: Application) => {
    if (!interview.meetingDateTime) return '';

    const startDate = parseLocalDateTime(interview.meetingDateTime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

    // Format dates in local time for Google Calendar (YYYYMMDDTHHmmss format)
    const formatDateForGoogle = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };

    const startDateFormatted = formatDateForGoogle(startDate);
    const endDateFormatted = formatDateForGoogle(endDate);

    const title = `Interview: ${interview.project?.title}`;
    const details = `Interview for ${interview.project?.title} with Business Owner`;
    const location = interview.meetingLink ? interview.meetingLink : '';

    let googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateFormatted}/${endDateFormatted}&details=${encodeURIComponent(details)}`;

    if (location) {
      googleCalendarUrl += `&location=${encodeURIComponent(location)}`;
    }

    return googleCalendarUrl;
  };

  const isUpcoming = (dateTime: string) => {
    return parseLocalDateTime(dateTime) > new Date();
  };

  const isPast = (dateTime: string) => {
    return parseLocalDateTime(dateTime) < new Date();
  };

  const isToday = (dateTime: string) => {
    const today = new Date();
    const interviewDate = parseLocalDateTime(dateTime);
    return today.toDateString() === interviewDate.toDateString();
  };

  const sortedInterviews = interviews.sort((a, b) => {
    return parseLocalDateTime(a.meetingDateTime!).getTime() - parseLocalDateTime(b.meetingDateTime!).getTime();
  });

  const upcomingInterviews = sortedInterviews.filter(interview => 
    isUpcoming(interview.meetingDateTime!)
  );

  const pastInterviews = sortedInterviews.filter(interview => 
    isPast(interview.meetingDateTime!)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interview Schedule</h1>
          <p className="mt-2 text-gray-600">Manage your upcoming interviews and view past meetings</p>
        </div>

        {interviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
              <p className="text-gray-600 mb-6">Once you're invited to interviews, they'll appear here.</p>
              <Link href="/student/opportunities">
                <Button>Browse Opportunities</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Interviews */}
            {upcomingInterviews.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Interviews</h2>
                <div className="space-y-4">
                  {upcomingInterviews.map((interview) => {
                    const meetingInfo = formatMeetingDateTimeDetailed(interview.meetingDateTime!);
                    const isInterviewToday = isToday(interview.meetingDateTime!);
                    
                    return (
                      <Card key={interview.id} hover className={isInterviewToday ? 'ring-2 ring-yellow-400' : ''}>
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                            {/* Left Section */}
                            <div className="flex-1 mb-4 lg:mb-0">
                              {isInterviewToday && (
                                <div className="mb-3 flex items-center text-yellow-600">
                                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                                  <span className="font-medium text-sm">Interview Today!</span>
                                </div>
                              )}
                              
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {interview.project?.title}
                                  </h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>Business Owner ID: {interview.project?.ownerId}</span>
                                    <span>•</span>
                                    <span>Applied {new Date(interview.submittedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Meeting Details */}
                              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <CalendarIcon className="w-5 h-5 text-green-600 mr-2" />
                                  <span className="text-sm font-medium text-green-800">Interview Scheduled</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <ClockIcon className="w-4 h-4 text-green-600 mr-2" />
                                    <span className="text-sm text-green-700 font-medium">
                                      {meetingInfo.date}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="w-4 h-4 mr-2"></span>
                                    <span className="text-sm text-green-700">
                                      {meetingInfo.time}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Project Details */}
                              <div className="flex flex-wrap gap-2">
                                {interview.project?.industryTags?.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {interview.project?.duration}
                                </span>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  {interview.project?.compensationType}: {interview.project?.compensationValue}
                                </span>
                              </div>
                            </div>

                            {/* Right Section - Actions */}
                            <div className="flex flex-col space-y-2 lg:ml-6 lg:min-w-[200px]">
                              <a
                                href={generateCalendarLink(interview)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                              >
                                <Button variant="accent" className="w-full">
                                  <CalendarIcon className="w-4 h-4 mr-2" />
                                  Add to Calendar
                                </Button>
                              </a>

                              <Link href={`/student/opportunities/${interview.projectId}`}>
                                <Button variant="outline" className="w-full">
                                  View Project
                                </Button>
                              </Link>

                              {interview.proofOfWorkUrl && (
                                <a 
                                  href={interview.proofOfWorkUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="w-full"
                                >
                                  <Button variant="ghost" className="w-full">
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                                    View Portfolio
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Interviews */}
            {pastInterviews.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Interviews</h2>
                <div className="space-y-4">
                  {pastInterviews.map((interview) => {
                    const meetingInfo = formatMeetingDateTimeDetailed(interview.meetingDateTime!);
                    
                    return (
                      <Card key={interview.id} className="opacity-75">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                            {/* Left Section */}
                            <div className="flex-1 mb-4 lg:mb-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {interview.project?.title}
                                  </h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>Business Owner ID: {interview.project?.ownerId}</span>
                                    <span>•</span>
                                    <span>Interviewed {meetingInfo.date}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Meeting Details */}
                              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <CalendarIcon className="w-5 h-5 text-gray-600 mr-2" />
                                  <span className="text-sm font-medium text-gray-800">Interview Completed</span>
                                </div>
                                <div className="flex items-center">
                                  <ClockIcon className="w-4 h-4 text-gray-600 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {meetingInfo.full}
                                  </span>
                                </div>
                              </div>

                              {/* Project Details */}
                              <div className="flex flex-wrap gap-2">
                                {interview.project?.industryTags?.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {interview.project?.duration}
                                </span>
                              </div>
                            </div>

                            {/* Right Section - Actions */}
                            <div className="flex flex-col space-y-2 lg:ml-6 lg:min-w-[200px]">
                              <Link href={`/student/opportunities/${interview.projectId}`}>
                                <Button variant="outline" className="w-full">
                                  View Project
                                </Button>
                              </Link>

                              <Link href="/student/applications">
                                <Button variant="ghost" className="w-full">
                                  View Application
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 