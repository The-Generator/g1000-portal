'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Project, ApplicationForm, BusinessOwnerProfile } from '@/types';
import ApplicationEmailModal from '@/components/ApplicationEmailModal';
import {
  DocumentTextIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ApplicationForm>({
    coverNote: '',
    proofOfWorkUrl: '' // Keep for backward compatibility but won't be used
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showOwnerProfile, setShowOwnerProfile] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchOpportunity();
    }
    fetchStudentInfo();
  }, [params.id]);

  const fetchStudentInfo = async () => {
    try {
      const response = await fetch('/api/student/me');
      if (response.ok) {
        const data = await response.json();
        setStudentInfo({
          name: data.data.user?.name || 'Student',
          email: data.data.user?.email || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch student info:', error);
    }
  };

  const fetchOpportunity = async () => {
    try {
      const response = await fetch(`/api/opportunities/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOpportunity(data.data);
        
        // Check if application window is open or opening soon
        const now = new Date();
        const start = new Date(data.data.applyWindowStart);
        const end = new Date(data.data.applyWindowEnd);

        // Allow applications if window opens within 24 hours
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const isOpeningSoon = now < start && start <= twentyFourHoursFromNow;
        const isOpen = (now >= start && now <= end) || isOpeningSoon;

        if (!isOpen) {
          setError('Application window is closed for this opportunity');
        }
      } else {
        setError('Opportunity not found');
      }
    } catch (error) {
      console.error('Failed to fetch opportunity:', error);
      setError('Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.coverNote.trim()) {
      errors.coverNote = 'Cover note is required';
    } else if (formData.coverNote.trim().length < 50) {
      errors.coverNote = 'Cover note must be at least 50 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/student/opportunities/${params.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Application submitted successfully!');
        // Ensure we have opportunity data before showing modal
        if (opportunity) {
          console.log('Setting showEmailModal to true');
          setShowEmailModal(true);
        } else {
          // If no opportunity data, just redirect
          setTimeout(() => {
            router.push('/student/applications');
          }, 1500);
        }
      } else {
        toast.error(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ApplicationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cannot Apply</h1>
          <p className="text-gray-600 mb-6">{error || 'The opportunity you\'re trying to apply to doesn\'t exist.'}</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Opportunity
          </Button>
          
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-5 flex-1">
                  {/* Business Owner Profile Photo */}
                  <div className="flex-shrink-0">
                    {opportunity.owner?.logoUrl ? (
                      <img
                        src={opportunity.owner.logoUrl}
                        alt={opportunity.owner.companyName}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-md border-2 border-gray-100">
                        <BuildingOfficeIcon className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mb-2">
                        ✓ Applications Open
                      </span>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {opportunity.title}
                      </h1>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        <span className="font-medium">{opportunity.owner?.companyName || 'Business Owner'}</span>
                        {opportunity.owner?.websiteUrl && (
                          <>
                            <span className="text-gray-400">•</span>
                            <a
                              href={opportunity.owner.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 hover:underline text-sm"
                            >
                              Visit Website →
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quick Info Bar */}
                    <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-200">
                      {opportunity.type && (
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="capitalize">{opportunity.type.replace(/-/g, ' ')}</span>
                        </div>
                      )}
                      {opportunity.compensationValue && (
                        <div className="flex items-center text-sm font-medium text-green-700">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {opportunity.compensationValue}
                        </div>
                      )}
                      {opportunity.location && (
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="capitalize">{opportunity.location}</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOwnerProfile(true)}
                        className="text-primary-600 hover:text-primary-700 ml-auto"
                      >
                        <UserCircleIcon className="w-4 h-4 mr-1" />
                        Company Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Consultation Banner */}
            {opportunity.isAiConsultation && (
              <div className="bg-blue-600 text-white px-6 py-3 border-t border-blue-700">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-medium">AI Solutions Consultation - Help this business identify AI opportunities</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Application Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Cover Note */}
                  <div>
                    <label htmlFor="coverNote" className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Note *
                    </label>
                    <textarea
                      id="coverNote"
                      rows={8}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        formErrors.coverNote ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Tell the business owner why you're interested in this opportunity and what unique value you can bring. Mention relevant experience, skills, and your enthusiasm for the project..."
                      value={formData.coverNote}
                      onChange={(e) => handleInputChange('coverNote', e.target.value)}
                    />
                    {formErrors.coverNote && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.coverNote}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.coverNote.length}/500 characters (minimum 50)
                    </p>
                  </div>


                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full lg:w-auto"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Application...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Opportunity Summary & Tips */}
          <div className="space-y-6">
            {/* Opportunity Summary */}
            <Card className="border-l-4 border-l-primary-500">
              <CardHeader>
                <CardTitle className="text-lg">Opportunity Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Compensation */}
                {opportunity.compensationType && (
                  <div className="pb-3 border-b">
                    <div className="flex items-center mb-1">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium text-gray-900 text-sm">Compensation</p>
                    </div>
                    <p className="text-gray-700 ml-6">
                      {opportunity.compensationType === 'paid-hourly' && 'Paid (Hourly)'}
                      {opportunity.compensationType === 'paid-stipend' && 'Paid (Stipend)'}
                      {opportunity.compensationType === 'paid-fixed' && 'Paid (Fixed Fee)'}
                      {opportunity.compensationType === 'paid-salary' && 'Paid (Salary)'}
                      {opportunity.compensationType === 'equity' && 'Equity/Ownership'}
                      {opportunity.compensationType === 'experience' && 'Experience/Portfolio'}
                      {opportunity.compensationType === 'other' && 'Other'}
                      {opportunity.compensationValue && ` - ${opportunity.compensationValue}`}
                    </p>
                  </div>
                )}

                {/* Duration & Hours */}
                {(opportunity.estimatedDuration || opportunity.estimatedHoursPerWeek) && (
                  <div className="pb-3 border-b">
                    <div className="space-y-2">
                      {opportunity.estimatedDuration && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">
                            <span className="font-medium">Duration:</span> <span className="text-gray-700">{opportunity.estimatedDuration}</span>
                          </p>
                        </div>
                      )}
                      {opportunity.estimatedHoursPerWeek && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm">
                            <span className="font-medium">Hours/Week:</span> <span className="text-gray-700">{opportunity.estimatedHoursPerWeek}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {opportunity.location && (
                  <div className="pb-3 border-b">
                    <div className="flex items-center mb-1">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="font-medium text-gray-900 text-sm">Location</p>
                    </div>
                    <p className="text-gray-700 ml-6 capitalize">
                      {opportunity.location}
                      {opportunity.location === 'onsite' && opportunity.onsiteLocation && ` - ${opportunity.onsiteLocation}`}
                    </p>
                  </div>
                )}

                {/* Industry Tags */}
                {opportunity.industryTags && opportunity.industryTags.length > 0 && (
                  <div className="pb-3 border-b">
                    <p className="font-medium text-gray-900 text-sm mb-2">Industries</p>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.industryTags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Skills */}
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 ? (
                      opportunity.requiredSkills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No specific skills required</span>
                    )}
                  </div>
                </div>

                {/* Application Window */}
                <div className="pt-3 border-t">
                  <p className="font-medium text-gray-900 text-sm mb-2">Application Window</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Opens:</span>
                      <span className="text-gray-900">{new Date(opportunity.applyWindowStart).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Closes:</span>
                      <span className="text-gray-900">{new Date(opportunity.applyWindowEnd).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                  Application Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Be specific about your relevant experience and skills
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Explain why you're interested in this particular project
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Demonstrate your understanding of the business needs
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Proofread your application before submitting
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Business Owner Profile Modal */}
      <BusinessOwnerProfileModal
        isOpen={showOwnerProfile}
        onClose={() => setShowOwnerProfile(false)}
        owner={opportunity?.owner}
      />

      {/* Email Notification Modal */}
      {showEmailModal && opportunity && console.log('Rendering ApplicationEmailModal', { showEmailModal, opportunity: opportunity.title })}
      {showEmailModal && opportunity && (
        <ApplicationEmailModal
          isOpen={true}
          onClose={() => {
            setShowEmailModal(false);
            router.push('/student/applications');
          }}
          opportunityTitle={opportunity.title || 'Opportunity'}
          businessOwnerName={opportunity.owner?.companyName || 'Business Owner'}
          businessOwnerEmail={opportunity.owner?.user?.email}
          studentName={studentInfo?.name || 'Student'}
          onEmailSent={() => {
            setTimeout(() => {
              router.push('/student/applications');
            }, 2000);
          }}
        />
      )}
    </div>
  );
}

// Business Owner Profile Modal Component
function BusinessOwnerProfileModal({
  isOpen,
  onClose,
  owner
}: {
  isOpen: boolean;
  onClose: () => void;
  owner?: BusinessOwnerProfile | null;
}) {
  if (!isOpen || !owner) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Business Profile</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Company Header */}
            <div className="flex items-start gap-4">
              {owner.logoUrl ? (
                <img
                  src={owner.logoUrl}
                  alt={owner.companyName}
                  className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">{owner.companyName}</h4>
                {owner.contactName && (
                  <p className="text-gray-600 mt-1">Contact: {owner.contactName}</p>
                )}
                {owner.city && owner.state && (
                  <p className="text-gray-500 text-sm mt-1">{owner.city}, {owner.state}</p>
                )}
              </div>
            </div>

            {/* Company Details */}
            {owner.description && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">About</h5>
                <p className="text-gray-600">{owner.description}</p>
              </div>
            )}

            {/* Industry Tags */}
            {owner.industryTags && owner.industryTags.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Industries</h5>
                <div className="flex flex-wrap gap-2">
                  {owner.industryTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {owner.founded && (
                <div>
                  <p className="font-medium text-gray-900 text-sm">Founded</p>
                  <p className="text-gray-600">{owner.founded}</p>
                </div>
              )}
              {owner.employeeCount && (
                <div>
                  <p className="font-medium text-gray-900 text-sm">Employees</p>
                  <p className="text-gray-600">{owner.employeeCount}</p>
                </div>
              )}
              {owner.phone && (
                <div>
                  <p className="font-medium text-gray-900 text-sm">Phone</p>
                  <p className="text-gray-600">{owner.phone}</p>
                </div>
              )}
              {owner.address && (
                <div>
                  <p className="font-medium text-gray-900 text-sm">Address</p>
                  <p className="text-gray-600">{owner.address}</p>
                </div>
              )}
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              {owner.websiteUrl && (
                <a
                  href={owner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Website
                </a>
              )}
              {owner.linkedinUrl && (
                <a
                  href={owner.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 