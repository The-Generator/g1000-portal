'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Project, INDUSTRY_TAGS, SKILL_TAGS, COMPENSATION_TYPES, DURATION_OPTIONS } from '@/types';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface FilterState {
  search: string;
  industry: string[];
  skills: string[];
  compensationType: string[];
  duration: string[];
}

interface CompanyModalProps {
  company: any;
  onClose: () => void;
}

function CompanyModal({ company, onClose }: CompanyModalProps) {
  if (!company) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Company Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Company Header */}
          <div className="flex items-start space-x-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.companyName}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-10 h-10 text-blue-600" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{company.companyName}</h3>
              {company.contactName && (
                <p className="text-gray-600 mt-1">Contact: {company.contactName}</p>
              )}
              {company.user?.email && (
                <div className="flex items-center text-gray-600 mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${company.user.email}`} className="text-generator-green hover:text-generator-dark underline text-sm">
                    {company.user.email}
                  </a>
                </div>
              )}
              {company.city && company.state && (
                <div className="flex items-center text-gray-500 mt-2">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">{company.city}, {company.state}</span>
                </div>
              )}
            </div>
          </div>

          {/* Company Description */}
          {company.description && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">About</h4>
              <p className="text-gray-600">{company.description}</p>
            </div>
          )}

          {/* Company Details */}
          <div className="grid grid-cols-2 gap-4">
            {company.founded && (
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Founded</p>
                  <p className="text-sm font-medium">{company.founded}</p>
                </div>
              </div>
            )}

            {company.employeeCount && (
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Company Size</p>
                  <p className="text-sm font-medium">{company.employeeCount} employees</p>
                </div>
              </div>
            )}
          </div>

          {/* Industry Tags */}
          {company.industryTags && company.industryTags.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Industries</h4>
              <div className="flex flex-wrap gap-2">
                {company.industryTags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="space-y-2 pt-4 border-t">
            {company.websiteUrl && (
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <GlobeAltIcon className="w-5 h-5 mr-2" />
                Visit Website
              </a>
            )}
            {company.linkedinUrl && (
              <a
                href={company.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn Profile
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showPastOpportunities, setShowPastOpportunities] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    industry: [],
    skills: [],
    compensationType: [],
    duration: []
  });

  useEffect(() => {
    fetchOpportunities();
  }, [filters]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.industry.length > 0) params.append('industry', filters.industry.join(','));
      if (filters.skills.length > 0) params.append('skills', filters.skills.join(','));
      if (filters.compensationType.length > 0) params.append('compensationType', filters.compensationType.join(','));
      if (filters.duration.length > 0) params.append('duration', filters.duration.join(','));

      const response = await fetch(`/api/opportunities?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      industry: [],
      skills: [],
      compensationType: [],
      duration: []
    });
  };

  const getCompensationIcon = (type: string) => {
    switch (type) {
      case 'paid-hourly':
      case 'paid-stipend':
      case 'paid-fixed':
      case 'paid-salary':
        return '💰';
      case 'equity':
        return '📈';
      case 'experience':
        return '🎓';
      default:
        return '💼';
    }
  };

  const getCompensationLabel = (type: string) => {
    switch (type) {
      case 'paid-hourly': return 'Hourly';
      case 'paid-stipend': return 'Stipend';
      case 'paid-fixed': return 'Fixed';
      case 'paid-salary': return 'Salary';
      case 'equity': return 'Equity';
      case 'experience': return 'Experience';
      default: return type;
    }
  };

  const isApplicationWindowOpen = (project: Project) => {
    const now = new Date();
    const start = new Date(project.applyWindowStart);
    const end = new Date(project.applyWindowEnd);

    // Allow applications if window opens within 24 hours
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const isOpeningSoon = now < start && start <= twentyFourHoursFromNow;

    return (now >= start && now <= end) || isOpeningSoon;
  };

  const handleWithdraw = async (opportunityId: string, applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw your application?')) {
      return;
    }

    try {
      const response = await fetch(`/api/student/applications/${applicationId}/withdraw`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Application withdrawn successfully');
        // Refresh opportunities to update the status
        fetchOpportunities();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to withdraw application');
      }
    } catch (error) {
      console.error('Failed to withdraw application:', error);
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
          <p className="mt-2 text-gray-600">
            Discover exciting AI and automation projects from small business owners
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by keyword or project title"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Industry Filter */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Industry</h3>
                    <div className="space-y-2">
                      {INDUSTRY_TAGS.map((industry) => (
                        <label key={industry} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.industry.includes(industry)}
                            onChange={() => handleFilterChange('industry', industry)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{industry}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Skills Filter */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Skills Required</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {SKILL_TAGS.map((skill) => (
                        <label key={skill} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.skills.includes(skill)}
                            onChange={() => handleFilterChange('skills', skill)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Compensation Filter */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Compensation Type</h3>
                    <div className="space-y-2">
                      {COMPENSATION_TYPES.map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.compensationType.includes(type)}
                            onChange={() => handleFilterChange('compensationType', type)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">{getCompensationLabel(type)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Duration</h3>
                    <div className="space-y-2">
                      {DURATION_OPTIONS.map((duration) => (
                        <label key={duration} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.duration.includes(duration)}
                            onChange={() => handleFilterChange('duration', duration)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{duration}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button variant="ghost" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Current Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                // Filter for current opportunities (not closed without application)
                const currentOpportunities = opportunities.filter(opp => {
                  const isClosed = opp.status === 'closed' || new Date() > new Date(opp.applyWindowEnd);
                  const hasApplied = opp.userApplication && opp.userApplication.status !== 'withdrawn';
                  // Show if: not closed, or closed but applied
                  return !isClosed || hasApplied;
                });

                if (currentOpportunities.length === 0) {
                  return (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-600 text-lg">No opportunities found matching your criteria.</p>
                      <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                    </div>
                  );
                }

                return currentOpportunities.map((opportunity) => {
                const isOpen = isApplicationWindowOpen(opportunity) && (!opportunity.status || opportunity.status === 'open');
                const isClosed = opportunity.status === 'closed';
                const hasApplied = opportunity.userApplication && opportunity.userApplication.status !== 'withdrawn';
                return (
                  <Card
                    key={opportunity.id}
                    hover
                    className={`flex flex-col ${hasApplied ? 'bg-green-50 border-green-300' : ''}`}
                  >
                    {/* Applied Status Banner */}
                    {hasApplied && (
                      <div className="bg-green-100 border-b border-green-300 px-6 py-2">
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-700">Application Submitted</span>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-6 flex-1">
                      {/* Company Info */}
                      {opportunity.owner && (
                        <div className="flex items-center justify-between mb-4 pb-3 border-b">
                          <div className="flex items-center space-x-3">
                            {opportunity.owner.logoUrl ? (
                              <img
                                src={opportunity.owner.logoUrl}
                                alt={opportunity.owner.companyName}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                                <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {opportunity.owner.companyName}
                              </p>
                              {opportunity.owner.city && opportunity.owner.state && (
                                <p className="text-xs text-gray-500">
                                  {opportunity.owner.city}, {opportunity.owner.state}
                                </p>
                              )}
                              {opportunity.owner.user?.email && (
                                <p className="text-xs text-gray-500 truncate">
                                  <a href={`mailto:${opportunity.owner.user.email}`} className="text-generator-green hover:text-generator-dark underline">
                                    {opportunity.owner.user.email}
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedCompany(opportunity.owner)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="View company profile"
                          >
                            <InformationCircleIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      {/* Opportunity Header */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {isClosed && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 mr-2">
                              Student Selected
                            </span>
                          )}
                          {opportunity.isAiConsultation && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                              AI Consultation
                            </span>
                          )}
                          {opportunity.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {opportunity.industryTags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Compensation */}
                      {opportunity.compensationType && opportunity.compensationType !== 'experience' && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                          <span>{getCompensationIcon(opportunity.compensationType)}</span>
                          <span className="font-medium">{getCompensationLabel(opportunity.compensationType)}</span>
                          {opportunity.compensationValue && opportunity.compensationValue !== '' ? (
                            <>
                              <span>•</span>
                              <span>{opportunity.compensationValue}</span>
                            </>
                          ) : (
                            <>
                              <span>•</span>
                              <span className="text-gray-500">Not specified</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {opportunity.description}
                      </p>

                      {/* Duration & Location */}
                      <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                        {opportunity.estimatedDuration && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {opportunity.estimatedDuration}
                          </div>
                        )}
                        {opportunity.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            <span className="capitalize">{opportunity.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {opportunity.requiredSkills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                            {opportunity.requiredSkills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{opportunity.requiredSkills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Application Window */}
                      <div className="text-xs text-gray-500">
                        Applications: {new Date(opportunity.applyWindowStart).toLocaleDateString()} - {new Date(opportunity.applyWindowEnd).toLocaleDateString()}
                      </div>
                    </CardContent>

                    {/* Footer */}
                    <div className="p-6 pt-0">
                      {hasApplied ? (
                        <div className="flex space-x-3">
                          <Link href={`/student/opportunities/${opportunity.id}`} className="flex-1">
                            <Button variant="outline" className="w-full whitespace-nowrap">
                              View Details
                            </Button>
                          </Link>
                          <Link href="/student/applications">
                            <Button variant="primary" className="px-6 whitespace-nowrap">
                              View Application
                            </Button>
                          </Link>
                        </div>
                      ) : opportunity.userApplication && opportunity.userApplication.status === 'withdrawn' ? (
                        <div className="flex space-x-3">
                          <Link href={`/student/opportunities/${opportunity.id}`} className="flex-1">
                            <Button variant="outline" className="w-full whitespace-nowrap">
                              View Details
                            </Button>
                          </Link>
                          <Button disabled className="px-6 bg-gray-100 text-gray-500 whitespace-nowrap">
                            Withdrawn
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-3">
                          <Link href={`/student/opportunities/${opportunity.id}`} className="flex-1">
                            <Button variant="outline" className="w-full whitespace-nowrap">
                              View Details
                            </Button>
                          </Link>
                          {isClosed ? (
                            <Button disabled className="px-6 bg-red-100 text-red-700 border-red-200 whitespace-nowrap">
                              Student Selected
                            </Button>
                          ) : isOpen ? (
                            <Link href={`/student/opportunities/${opportunity.id}/apply`}>
                              <Button className="px-6 whitespace-nowrap">
                                Apply
                              </Button>
                            </Link>
                          ) : (
                            <Button disabled className="px-6 whitespace-nowrap">
                              {new Date() > new Date(opportunity.applyWindowEnd) ? 'Closed' : 'Not Open'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              });
              })()}
            </div>

            {/* Past Opportunities Section */}
            {(() => {
              // Filter for past opportunities (closed and not applied)
              const pastOpportunities = opportunities.filter(opp => {
                const isClosed = opp.status === 'closed' || new Date() > new Date(opp.applyWindowEnd);
                const hasApplied = opp.userApplication && opp.userApplication.status !== 'withdrawn';
                // Show if: closed and not applied
                return isClosed && !hasApplied;
              });

              if (pastOpportunities.length === 0) return null;

              return (
                <div className="mt-12">
                  {/* Past Opportunities Header */}
                  <div
                    className="mb-6 pb-4 border-b cursor-pointer"
                    onClick={() => setShowPastOpportunities(!showPastOpportunities)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="w-6 h-6 text-gray-500" />
                        <h2 className="text-xl font-semibold text-gray-700">
                          Past Opportunities ({pastOpportunities.length})
                        </h2>
                        <span className="text-sm text-gray-500">
                          Opportunities you didn't apply to
                        </span>
                      </div>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {showPastOpportunities ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Past Opportunities Grid */}
                  {showPastOpportunities && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pastOpportunities.map((opportunity) => {
                        const hasApplied = opportunity.userApplication && opportunity.userApplication.status !== 'withdrawn';
                        return (
                          <Card
                            key={opportunity.id}
                            hover
                            className="flex flex-col opacity-75"
                          >
                            <CardContent className="p-6 flex-1">
                              {/* Company Info */}
                              {opportunity.owner && (
                                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                                  <div className="flex items-center space-x-3">
                                    {opportunity.owner.logoUrl ? (
                                      <img
                                        src={opportunity.owner.logoUrl}
                                        alt={opportunity.owner.companyName}
                                        className="w-10 h-10 rounded object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                                        <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {opportunity.owner.companyName}
                                      </p>
                                      {opportunity.owner.city && opportunity.owner.state && (
                                        <p className="text-xs text-gray-500">
                                          {opportunity.owner.city}, {opportunity.owner.state}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setSelectedCompany(opportunity.owner)}
                                    className="text-blue-600 hover:text-blue-700 p-1"
                                    title="View company profile"
                                  >
                                    <InformationCircleIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              )}

                              {/* Opportunity Header */}
                              <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 mr-2">
                                    Closed
                                  </span>
                                  {opportunity.isAiConsultation && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                                      AI Consultation
                                    </span>
                                  )}
                                  {opportunity.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {opportunity.industryTags.slice(0, 2).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Compensation */}
                              {opportunity.compensationType && opportunity.compensationType !== 'experience' && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                                  <span>{getCompensationIcon(opportunity.compensationType)}</span>
                                  <span className="font-medium">{getCompensationLabel(opportunity.compensationType)}</span>
                                  {opportunity.compensationValue && opportunity.compensationValue !== '' ? (
                                    <>
                                      <span>•</span>
                                      <span>{opportunity.compensationValue}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>•</span>
                                      <span className="text-gray-500">Not specified</span>
                                    </>
                                  )}
                                </div>
                              )}

                              {/* Description */}
                              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {opportunity.description}
                              </p>

                              {/* Application Window */}
                              <div className="text-xs text-gray-500">
                                Closed: {new Date(opportunity.applyWindowEnd).toLocaleDateString()}
                              </div>
                            </CardContent>

                            {/* Footer */}
                            <div className="p-6 pt-0">
                              <div className="flex space-x-3">
                                <Link href={`/student/opportunities/${opportunity.id}`} className="flex-1">
                                  <Button variant="outline" className="w-full whitespace-nowrap">
                                    View Details
                                  </Button>
                                </Link>
                                <Button disabled className="px-6 bg-gray-100 text-gray-500">
                                  Closed
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Company Modal */}
      {selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}