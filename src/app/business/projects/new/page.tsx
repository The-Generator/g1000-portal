'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  AcademicCapIcon,
  SparklesIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  ProjectForm,
  INDUSTRY_TAGS,
  SKILL_TAGS,
  COMPENSATION_TYPES,
  PROJECT_TYPES,
  DURATION_OPTIONS,
  HOURS_PER_WEEK_OPTIONS,
  LOCATION_OPTIONS
} from '@/types';
import { getTodayDate, getNextWeekDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ProjectForm>({
    title: '',
    description: '',
    type: 'project-based',
    isAiConsultation: false,
    currentSoftwareTools: '',
    painPoints: '',
    industryTags: [],
    estimatedDuration: '',
    estimatedHoursPerWeek: '',
    compensationType: 'experience',
    compensationValue: '',
    budget: '',
    deliverables: [''],
    location: 'remote',
    onsiteLocation: '',
    applyWindowStart: getTodayDate(),
    applyWindowEnd: getNextWeekDate(),
    requiredSkills: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState({
    duration: false,
    hours: false,
    compensation: false,
    budget: false,
    skills: false,
    deliverables: false,
    location: false
  });

  // Auto-fill title and description for AI consultation
  useEffect(() => {
    if (formData.isAiConsultation) {
      setFormData(prev => ({
        ...prev,
        title: prev.title || 'AI Solutions Consultation',
        description: prev.description || 'Looking for a student to consult on where AI solutions could provide the most value in our business operations.',
        type: 'consulting'
      }));
    } else {
      // Clear auto-filled values when unchecking AI consultation
      setFormData(prev => {
        const updates: any = { ...prev };
        // Only clear if they match the default AI consultation values
        if (prev.title === 'AI Solutions Consultation') {
          updates.title = '';
        }
        if (prev.description === 'Looking for a student to consult on where AI solutions could provide the most value in our business operations.') {
          updates.description = '';
        }
        // Reset type if it was set to consulting by the AI consultation
        if (prev.type === 'consulting') {
          updates.type = 'project-based';
        }
        return updates;
      });
    }
  }, [formData.isAiConsultation]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.isAiConsultation) {
      if (!formData.title.trim()) newErrors.title = 'Opportunity Title is required';
      if (!formData.description.trim()) newErrors.description = 'Opportunity Description is required';
      if (!formData.type) newErrors.type = 'Type is required';
    } else {
      if (!formData.currentSoftwareTools?.trim()) {
        newErrors.currentSoftwareTools = 'Please describe your current software and tools';
      }
    }

    if (formData.industryTags.length === 0) newErrors.industryTags = 'At least one industry tag is required';

    if (!formData.applyWindowStart) newErrors.applyWindowStart = 'Application start date is required';
    if (!formData.applyWindowEnd) newErrors.applyWindowEnd = 'Application end date is required';

    if (formData.applyWindowStart && formData.applyWindowEnd) {
      if (new Date(formData.applyWindowStart) >= new Date(formData.applyWindowEnd)) {
        newErrors.applyWindowEnd = 'End date must be after start date';
      }
    }

    // Validate optional fields only if shown
    if (showOptionalFields.location && formData.location === 'onsite' && !formData.onsiteLocation?.trim()) {
      newErrors.onsiteLocation = 'Please specify the on-site location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.isAiConsultation) {
      if (!formData.title.trim()) newErrors.title = 'Opportunity Title is required';
      if (!formData.description.trim()) newErrors.description = 'Opportunity Description is required';
      if (!formData.type) newErrors.type = 'Type is required';
    } else {
      if (!formData.currentSoftwareTools?.trim()) {
        newErrors.currentSoftwareTools = 'Please describe your current software and tools';
      }
    }

    if (formData.industryTags.length === 0) newErrors.industryTags = 'At least one industry tag is required';

    if (!formData.applyWindowStart) newErrors.applyWindowStart = 'Application start date is required';
    if (!formData.applyWindowEnd) newErrors.applyWindowEnd = 'Application end date is required';

    if (formData.applyWindowStart && formData.applyWindowEnd) {
      if (new Date(formData.applyWindowStart) >= new Date(formData.applyWindowEnd)) {
        newErrors.applyWindowEnd = 'End date must be after start date';
      }
    }

    // Validate optional fields only if shown
    if (showOptionalFields.location && formData.location === 'onsite' && !formData.onsiteLocation?.trim()) {
      newErrors.onsiteLocation = 'Please specify the on-site location';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorList = Object.values(newErrors).join(', ');
      toast.error(`Please fix the following: ${errorList}`);
      return;
    }

    setLoading(true);

    try {
      const submissionData = {
        ...formData,
        // Send actual form data - use undefined for empty values to clear them
        // Only send values that are actually shown in the UI
        estimatedDuration: showOptionalFields.duration && formData.estimatedDuration ? formData.estimatedDuration : undefined,
        estimatedHoursPerWeek: showOptionalFields.hours && formData.estimatedHoursPerWeek ? formData.estimatedHoursPerWeek : undefined,
        // Always send compensation type - 'experience' when unchecked, selected value when checked
        compensationType: showOptionalFields.compensation ? formData.compensationType : 'experience',
        compensationValue: showOptionalFields.compensation ? formData.compensationValue : '',
        budget: showOptionalFields.budget && formData.budget ? formData.budget : undefined,
        requiredSkills: showOptionalFields.skills && formData.requiredSkills?.length ? formData.requiredSkills : [],
        deliverables: showOptionalFields.deliverables && formData.deliverables?.length ? formData.deliverables.filter(d => d && d.trim()) : [],
        location: showOptionalFields.location ? formData.location : 'remote',
        onsiteLocation: showOptionalFields.location && formData.location === 'onsite' ? formData.onsiteLocation : undefined
      };

      console.log('Creating new opportunity with data:', submissionData);

      const response = await fetch('/api/business/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Opportunity created successfully:', data);
        toast.success('Opportunity created successfully!');
        // Trigger storage event to update dashboard
        window.localStorage.setItem('projectsUpdated', Date.now().toString());
        // Force refresh dashboard on navigation
        router.push('/business/dashboard');
        router.refresh();
      } else {
        console.error('Failed to create opportunity:', data);
        toast.error(data.error || 'Failed to create opportunity');
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.requiredSkills?.includes(skill)) {
      setFormData({
        ...formData,
        requiredSkills: [...(formData.requiredSkills || []), skill]
      });
    }
    setSkillInput('');
    setCustomSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills?.filter(skill => skill !== skillToRemove) || []
    });
  };

  const addIndustryTag = (tag: string) => {
    if (tag && !formData.industryTags.includes(tag)) {
      setFormData({
        ...formData,
        industryTags: [...formData.industryTags, tag]
      });
    }
    setIndustryInput('');
    setCustomIndustry('');
  };

  const removeIndustryTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      industryTags: formData.industryTags.filter(tag => tag !== tagToRemove)
    });
  };

  const addDeliverable = () => {
    setFormData({
      ...formData,
      deliverables: [...(formData.deliverables || []), '']
    });
  };

  const updateDeliverable = (index: number, value: string) => {
    const newDeliverables = [...(formData.deliverables || [])];
    newDeliverables[index] = value;
    setFormData({
      ...formData,
      deliverables: newDeliverables
    });
  };

  const removeDeliverable = (index: number) => {
    if ((formData.deliverables?.length || 0) > 1) {
      setFormData({
        ...formData,
        deliverables: formData.deliverables?.filter((_, i) => i !== index) || []
      });
    }
  };

  const getCompensationLabel = (type: string) => {
    switch (type) {
      case 'paid-hourly': return 'Hourly';
      case 'paid-stipend': return 'Stipend';
      case 'paid-fixed': return 'Fixed Project Fee';
      case 'paid-salary': return 'Salary';
      case 'equity': return 'Equity / Ownership';
      case 'experience': return 'Experience / Portfolio only';
      case 'other': return 'Other';
      default: return type;
    }
  };

  const getCompensationPlaceholder = (type?: string) => {
    switch (type) {
      case 'paid-hourly': return 'e.g., $25/hour';
      case 'paid-stipend': return 'e.g., $500/month';
      case 'paid-fixed': return 'e.g., $2,000 for the project';
      case 'paid-salary': return 'e.g., $60,000/year';
      case 'equity': return 'e.g., 2% equity or describe the arrangement';
      case 'experience': return 'e.g., Great portfolio piece, mentorship included';
      case 'other': return 'Please describe the compensation';
      default: return 'Describe the compensation value';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/business/dashboard">
              <Button variant="ghost" size="sm" className="mr-4 hover:bg-gray-100">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Opportunity</h1>
              <p className="text-gray-600 mt-1">Post an opportunity for talented G1000 students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* AI Consultation Option */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAiConsultation}
                  onChange={(e) => setFormData({ ...formData, isAiConsultation: e.target.checked })}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">AI Solutions Consultation</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Check this if you DO NOT have a specific project and would like a student to consult you on where AI solutions could provide the most value in your business
                  </p>
                </div>
              </label>

              {formData.isAiConsultation && (
                <div className="mt-6 space-y-4 pl-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Software, Systems, and Tools *
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={4}
                      placeholder="Please describe the software, systems, and tools you currently use in your business operations..."
                      value={formData.currentSoftwareTools || ''}
                      onChange={(e) => setFormData({ ...formData, currentSoftwareTools: e.target.value })}
                    />
                    {errors.currentSoftwareTools && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentSoftwareTools}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pain Points & Repetitive Tasks (Optional)
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={4}
                      placeholder="Describe any pain points you currently have and repetitive tasks you or your employees find yourselves doing..."
                      value={formData.painPoints || ''}
                      onChange={(e) => setFormData({ ...formData, painPoints: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Information - Only show if NOT AI Consultation */}
          {!formData.isAiConsultation && (
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center text-lg">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Core details about your opportunity (required)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opportunity Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., AI-Powered Customer Service Chatbot Development"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opportunity Description *
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={6}
                    placeholder="Describe your opportunity in detail. Include the problem you're solving, the scope of work, and what success looks like..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PROJECT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.type === type
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <CheckCircleIcon className={`w-5 h-5 mx-auto mb-1 ${
                          formData.type === type ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Industry Tags - Always Required */}
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center text-lg">
                  <AcademicCapIcon className="w-5 h-5 mr-2 text-gray-600" />
                  Industry Tags
                </CardTitle>
                <CardDescription>
                  Select industries that best describe your business
                </CardDescription>
              </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.industryTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeIndustryTag(tag)}
                      className="ml-2 hover:text-green-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_TAGS.filter(tag => !formData.industryTags.includes(tag)).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addIndustryTag(tag)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIndustryInput('custom')}
                  className="px-3 py-1.5 text-sm border border-dashed border-gray-400 rounded-full hover:bg-gray-50 transition-colors"
                >
                  + Custom
                </button>
              </div>
              {industryInput === 'custom' && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter custom industry..."
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (customIndustry) {
                        addIndustryTag(customIndustry);
                        setIndustryInput('');
                      }
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIndustryInput('');
                      setCustomIndustry('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {errors.industryTags && (
                <p className="mt-2 text-sm text-red-600">{errors.industryTags}</p>
              )}
            </CardContent>
          </Card>

          {/* Optional Details - Show if NOT AI Consultation */}
          {!formData.isAiConsultation && (
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center text-lg">
                <PlusIcon className="w-5 h-5 mr-2 text-gray-600" />
                Opportunity Details
              </CardTitle>
              <CardDescription>
                Add optional details to attract the right candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {Object.entries({
                  duration: 'Duration',
                  hours: 'Hours/Week',
                  compensation: 'Compensation',
                  budget: 'Budget',
                  skills: 'Required Skills',
                  deliverables: 'Deliverables',
                  location: 'Location'
                }).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      const isCurrentlyShown = showOptionalFields[key as keyof typeof showOptionalFields];
                      setShowOptionalFields(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));

                      // Clear the form data when unchecking
                      if (isCurrentlyShown) {
                        setFormData(prev => {
                          const updates = { ...prev };
                          switch (key) {
                            case 'duration':
                              updates.estimatedDuration = '';
                              break;
                            case 'hours':
                              updates.estimatedHoursPerWeek = '';
                              break;
                            case 'compensation':
                              updates.compensationType = 'experience';
                              updates.compensationValue = '';
                              break;
                            case 'budget':
                              updates.budget = '';
                              break;
                            case 'skills':
                              updates.requiredSkills = [];
                              break;
                            case 'deliverables':
                              updates.deliverables = [''];
                              break;
                            case 'location':
                              updates.location = 'remote';
                              updates.onsiteLocation = '';
                              break;
                          }
                          return updates;
                        });
                      } else if (!isCurrentlyShown && key === 'compensation') {
                        // When showing compensation, default to fixed project fee
                        setFormData(prev => ({
                          ...prev,
                          compensationType: 'paid-fixed',
                          compensationValue: prev.compensationValue || ''
                        }));
                      }
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                      showOptionalFields[key as keyof typeof showOptionalFields]
                        ? 'border-generator-green bg-generator-green/10 text-generator-green font-medium'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {showOptionalFields[key as keyof typeof showOptionalFields] ? '✓ ' : '+ '}{label}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {/* Duration */}
                {showOptionalFields.duration && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                      value={formData.estimatedDuration || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, estimatedDuration: e.target.value });
                        if (e.target.value !== 'Custom') setCustomDuration('');
                      }}
                    >
                      <option value="">Select duration...</option>
                      {DURATION_OPTIONS.map((duration) => (
                        <option key={duration} value={duration}>{duration}</option>
                      ))}
                    </select>
                    {formData.estimatedDuration === 'Custom' && (
                      <input
                        type="text"
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                        placeholder="Enter custom duration..."
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                      />
                    )}
                  </div>
                )}

                {/* Hours per Week */}
                {showOptionalFields.hours && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Hours per Week
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                      value={formData.estimatedHoursPerWeek || ''}
                      onChange={(e) => setFormData({ ...formData, estimatedHoursPerWeek: e.target.value })}
                    >
                      <option value="">Select hours...</option>
                      {HOURS_PER_WEEK_OPTIONS.map((hours) => (
                        <option key={hours} value={hours}>{hours}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Compensation */}
                {showOptionalFields.compensation && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compensation Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                        value={formData.compensationType || ''}
                        onChange={(e) => setFormData({ ...formData, compensationType: e.target.value as any })}
                      >
                        <option value="">Select type...</option>
                        {COMPENSATION_TYPES.map((type) => (
                          <option key={type} value={type}>{getCompensationLabel(type)}</option>
                        ))}
                      </select>
                    </div>

                    {formData.compensationType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Compensation Value
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                          placeholder={getCompensationPlaceholder(formData.compensationType)}
                          value={formData.compensationValue || ''}
                          onChange={(e) => setFormData({ ...formData, compensationValue: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Budget */}
                {showOptionalFields.budget && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Budget
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                      placeholder="e.g., $5k-$10k, or 'Flexible'"
                      value={formData.budget || ''}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                )}

                {/* Skills */}
                {showOptionalFields.skills && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills / Expertise Desired
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.requiredSkills?.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 hover:text-blue-600"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_TAGS.filter(skill => !formData.requiredSkills?.includes(skill)).slice(0, 10).map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                        >
                          + {skill}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSkillInput('custom')}
                        className="px-3 py-1.5 text-sm border border-dashed border-gray-400 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        + Custom
                      </button>
                    </div>
                    {skillInput === 'custom' && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter custom skill..."
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (customSkill) {
                              addSkill(customSkill);
                              setSkillInput('');
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Location */}
                {showOptionalFields.location && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location / Modality
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {LOCATION_OPTIONS.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => setFormData({ ...formData, location: loc as any })}
                            className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${
                              formData.location === loc
                                ? 'border-generator-green bg-generator-green/10 text-generator-green font-medium'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                          >
                            <MapPinIcon className={`w-5 h-5 mx-auto mb-1 ${
                              formData.location === loc ? 'text-generator-green' : 'text-gray-400'
                            }`} />
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.location === 'onsite' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          On-site Location *
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                          placeholder="e.g., San Francisco, CA"
                          value={formData.onsiteLocation || ''}
                          onChange={(e) => setFormData({ ...formData, onsiteLocation: e.target.value })}
                        />
                        {errors.onsiteLocation && (
                          <p className="mt-1 text-sm text-red-600">{errors.onsiteLocation}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Deliverables */}
                {showOptionalFields.deliverables && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deliverables / Outcomes Expected
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Clearly define what "success" looks like for this opportunity
                    </p>
                    <div className="space-y-3">
                      {formData.deliverables?.map((deliverable, index) => (
                        <div key={index} className="flex gap-2">
                          <span className="text-gray-400 mt-2">{index + 1}.</span>
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                            placeholder="Describe expected outcome..."
                            value={deliverable}
                            onChange={(e) => updateDeliverable(index, e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDeliverable(index)}
                            disabled={(formData.deliverables?.length || 0) === 1}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addDeliverable}
                        className="w-full"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Another Deliverable
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Application Window - Always show */}
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center text-lg">
                <CalendarIcon className="w-5 h-5 mr-2 text-gray-600" />
                Application Window
              </CardTitle>
              <CardDescription>
                Set when students can apply to this opportunity
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Start Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.applyWindowStart}
                    onChange={(e) => setFormData({ ...formData, applyWindowStart: e.target.value })}
                    min={getTodayDate()}
                  />
                  {errors.applyWindowStart && (
                    <p className="mt-1 text-sm text-red-600">{errors.applyWindowStart}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application End Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.applyWindowEnd}
                    onChange={(e) => setFormData({ ...formData, applyWindowEnd: e.target.value })}
                    min={formData.applyWindowStart || getTodayDate()}
                  />
                  {errors.applyWindowEnd && (
                    <p className="mt-1 text-sm text-red-600">{errors.applyWindowEnd}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Applications will be open for {formData.applyWindowStart && formData.applyWindowEnd ?
                    Math.ceil((new Date(formData.applyWindowEnd).getTime() - new Date(formData.applyWindowStart).getTime()) / (1000 * 60 * 60 * 24))
                    : '...'} days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center">
            <Link href="/business/dashboard">
              <Button variant="outline" size="lg" disabled={loading}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
            >
              Create Opportunity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}