'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  CalendarIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  LinkIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Application } from '@/types';
import { formatMeetingDateTime, parseLocalDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import EmailButton from '@/components/EmailButton';
import { generateUpdateRequestEmail } from '@/lib/emailTemplates';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [interviewModal, setInterviewModal] = useState<{isOpen: boolean, application: Application | null}>({
    isOpen: false,
    application: null
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/student/applications');
      if (response.ok) {
        const data = await response.json();
        // Sort applications: accepted first, then by date
        const sortedApplications = data.data.sort((a: Application, b: Application) => {
          if (a.status === 'accepted' && b.status !== 'accepted') return -1;
          if (a.status !== 'accepted' && b.status === 'accepted') return 1;
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        });
        setApplications(sortedApplications);
      } else {
        toast.error('Failed to load applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800',
      underReview: 'bg-yellow-100 text-yellow-800',
      interviewScheduled: 'bg-green-100 text-green-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    const labels = {
      submitted: 'Submitted',
      underReview: 'Under Review',
      interviewScheduled: 'Interview Scheduled',
      accepted: 'Accepted',
      rejected: 'Rejected',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    
    try {
      const response = await fetch(`/api/student/applications/${applicationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Application withdrawn successfully');
        fetchApplications();
      } else {
        toast.error('Failed to withdraw application');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const generateCalendarLink = (application: Application) => {
    if (!application.meetingDateTime) return '';

    const startDate = parseLocalDateTime(application.meetingDateTime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

    const title = `Interview: ${application.project?.title}`;
    const details = `Interview for ${application.project?.title} with ${application.project?.owner?.name || 'the business owner'}`;

    // Format dates for Google Calendar (YYYYMMDDTHHmmss format in local time)
    const formatDateForGoogle = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };

    const startDateStr = formatDateForGoogle(startDate);
    const endDateStr = formatDateForGoogle(endDate);

    // Add location if meeting link exists
    const location = application.meetingLink ? encodeURIComponent(application.meetingLink) : '';
    const locationParam = location ? `&location=${location}` : '';

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateStr}/${endDateStr}&details=${encodeURIComponent(details)}${locationParam}`;

    return googleCalendarUrl;
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="mt-2 text-gray-600">Track your project applications and interview schedules</p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-6">Start browsing opportunities and submit your first application!</p>
              <Link href="/student/opportunities">
                <Button>Browse Opportunities</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Accepted Applications Section Header */}
            {applications.some(app => app.status === 'accepted') && (
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>
                  <div className="mx-4 flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full border border-green-300">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-bold text-green-800">ACCEPTED APPLICATIONS</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>
                </div>
              </div>
            )}

            {applications.map((application, index) => {
              const prevApplication = index > 0 ? applications[index - 1] : null;
              const showDivider = prevApplication?.status === 'accepted' && application.status !== 'accepted';

              return (
                <div key={application.id}>
                  {/* Other Applications Divider */}
                  {showDivider && (
                    <div className="mb-6 mt-8">
                      <div className="flex items-center">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="mx-4 text-sm font-medium text-gray-500 px-3 py-1 bg-gray-50 rounded-full">
                          Other Applications
                        </span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                      </div>
                    </div>
                  )}

                  <Card
                    hover
                    className={application.status === 'accepted' ? 'relative overflow-hidden border-2 border-green-500 bg-white shadow-lg' : ''}
              >
                {/* Accepted Badge */}
                {application.status === 'accepted' && (
                  <>
                    {/* Top corner ribbon */}
                    <div className="absolute top-0 right-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-8 py-1 rounded-bl-lg shadow-md">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-bold">ACCEPTED!</span>
                      </div>
                    </div>
                  </>
                )}
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    {/* Left Section */}
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-4">
                          {/* Business Logo */}
                          {(application.project as any)?.companyLogoUrl ? (
                            <div className="flex-shrink-0">
                              <img
                                src={(application.project as any).companyLogoUrl}
                                alt={(application.project as any)?.companyName || 'Company'}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                              <span className="text-lg font-semibold text-gray-400">
                                {((application.project as any)?.companyName || 'C').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}

                          {/* Project Info */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {application.project?.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{(application.project as any)?.companyName || 'Unknown Company'}</span>
                              <span>•</span>
                              <span>Applied {new Date(application.submittedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(application.status)}
                        </div>
                      </div>

                      {/* Accepted Celebration Message */}
                      {application.status === 'accepted' && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-bold text-green-800">Congratulations!</span>
                          </div>
                          <p className="text-sm text-green-700">
                            Your application has been accepted! The business will contact you soon with next steps.
                          </p>
                        </div>
                      )}

                      {/* Interview Details */}
                      {application.status === 'interviewScheduled' && application.meetingDateTime && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <CalendarIcon className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">Interview Scheduled</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <ClockIcon className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm text-green-700">
                              {formatMeetingDateTime(application.meetingDateTime)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <LinkIcon className="w-4 h-4 text-green-600 mr-2" />
                            {application.meetingLink ? (
                              <a
                                href={application.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-green-700 hover:text-green-900 underline"
                              >
                                Join Meeting
                              </a>
                            ) : (
                              <span className="text-sm text-gray-500 italic">
                                Meeting link not available yet
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Project Details */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {application.project?.industryTags?.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {application.project?.duration && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {application.project.duration}
                          </span>
                        )}
                        {application.project?.compensationType && application.project?.compensationValue && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            {application.project.compensationType}: {application.project.compensationValue}
                          </span>
                        )}
                      </div>

                      {/* Cover Note */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Cover Note</p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {application.coverNote}
                        </p>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-col space-y-2 lg:ml-6 lg:min-w-[200px]">
                      <Link href={`/student/opportunities/${application.projectId}`}>
                        <Button variant="outline" className="w-full">
                          View Project
                        </Button>
                      </Link>

                      {application.status === 'interviewScheduled' && application.meetingDateTime && (
                        <Button
                          variant="accent"
                          className="w-full"
                          onClick={() => setInterviewModal({ isOpen: true, application })}
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Interview Details
                        </Button>
                      )}

                      {(application.status === 'submitted' || application.status === 'underReview') && (
                        <>
                          <EmailButton
                            template={(() => {
                              const project = application.project as any;
                              const ownerEmail = project?.ownerEmail || '';
                              const ownerName = project?.ownerName || 'Business Owner';
                              const companyName = project?.companyName || 'Company';
                              const projectTitle = project?.title || '';
                              const studentName = 'Student'; // This will come from the logged-in user

                              return generateUpdateRequestEmail({
                                ownerEmail,
                                ownerName,
                                studentName,
                                projectTitle,
                                applicationDate: application.submittedAt
                              });
                            })()}
                            buttonText="Request Update"
                            variant="outline"
                            size="md"
                            className="w-full"
                          />
                          <Button
                            variant="danger"
                            onClick={() => handleWithdrawApplication(application.id)}
                            className="w-full"
                          >
                            Withdraw
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interview Details Modal */}
      {interviewModal.isOpen && interviewModal.application && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-start space-x-3 mb-4">
                  {/* Business Logo in Modal */}
                  {(interviewModal.application.project as any)?.companyLogoUrl ? (
                    <img
                      src={(interviewModal.application.project as any).companyLogoUrl}
                      alt={(interviewModal.application.project as any)?.companyName || 'Company'}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-400">
                        {((interviewModal.application.project as any)?.companyName || 'C').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {interviewModal.application.project?.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {(interviewModal.application.project as any)?.companyName || 'Unknown Company'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Interview scheduled for your application
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CalendarIcon className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="font-medium text-purple-800">Meeting Time</span>
                </div>
                <p className="text-sm text-purple-700 mb-3">
                  {formatMeetingDateTime(interviewModal.application.meetingDateTime!)}
                </p>
                
                <div className="flex flex-col space-y-2">
                  <a
                    href={generateCalendarLink(interviewModal.application)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full"
                  >
                    <Button variant="outline" className="w-full">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Add to Calendar
                    </Button>
                  </a>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> The meeting link will be provided by the business owner closer to the interview time. 
                  Check your email for meeting details or contact them directly if needed.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setInterviewModal({ isOpen: false, application: null })}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 