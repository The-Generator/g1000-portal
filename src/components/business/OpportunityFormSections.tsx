'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  AcademicCapIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon
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
import { getTodayDate } from '@/lib/utils';

export interface OpportunityFormSectionsProps {
  formData: ProjectForm;
  setFormData: React.Dispatch<React.SetStateAction<ProjectForm>>;
  errors: Record<string, string>;
}

const COMPENSATION_LABELS: Record<string, string> = {
  'paid-hourly': 'Hourly',
  'paid-stipend': 'Stipend',
  'paid-fixed': 'Fixed Project Fee',
  'paid-salary': 'Salary',
  equity: 'Equity / Ownership',
  experience: 'Experience / Portfolio only',
  other: 'Other'
};

const COMPENSATION_PLACEHOLDERS: Record<string, string> = {
  'paid-hourly': 'e.g., $25/hour',
  'paid-stipend': 'e.g., $500/month',
  'paid-fixed': 'e.g., $2,000 for the project',
  'paid-salary': 'e.g., $60,000/year',
  equity: 'e.g., 2% equity or describe the arrangement',
  experience: 'e.g., Great portfolio piece, mentorship included',
  other: 'Please describe the compensation'
};

export function OpportunityFormSections({
  formData,
  setFormData,
  errors
}: OpportunityFormSectionsProps) {
  const [skillInput, setSkillInput] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  // Track custom duration mode separately so the select can show "Custom"
  // while formData.estimatedDuration holds the actual typed value.
  const isPresetDuration = (d?: string) =>
    !!d && (DURATION_OPTIONS as readonly string[]).includes(d) && d !== 'Custom';
  const [customDurationMode, setCustomDurationMode] = useState(() => {
    const d = formData.estimatedDuration;
    return !!d && !isPresetDuration(d);
  });
  const [customDuration, setCustomDuration] = useState(() => {
    const d = formData.estimatedDuration;
    return !!d && !isPresetDuration(d) && d !== 'Custom' ? d : '';
  });

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.requiredSkills?.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...(prev.requiredSkills || []), trimmed]
      }));
    }
    setSkillInput('');
    setCustomSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.filter(s => s !== skillToRemove) || []
    }));
  };

  const addIndustryTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !formData.industryTags.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        industryTags: [...prev.industryTags, trimmed]
      }));
    }
    setIndustryInput('');
    setCustomIndustry('');
  };

  const removeIndustryTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      industryTags: prev.industryTags.filter(t => t !== tagToRemove)
    }));
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...(prev.deliverables || []), '']
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData(prev => {
      const next = [...(prev.deliverables || [])];
      next[index] = value;
      return { ...prev, deliverables: next };
    });
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => {
      if ((prev.deliverables?.length || 0) <= 1) {
        return { ...prev, deliverables: [''] };
      }
      return {
        ...prev,
        deliverables: prev.deliverables?.filter((_, i) => i !== index) || []
      };
    });
  };

  // Section completion detection for progress indicator
  const sectionStatus = useMemo(() => {
    const basicsComplete = formData.isAiConsultation
      ? !!(formData.currentSoftwareTools?.trim()) && formData.industryTags.length > 0
      : !!(formData.title.trim() && formData.description.trim() && formData.type) &&
        formData.industryTags.length > 0;

    const scopeComplete =
      (formData.requiredSkills && formData.requiredSkills.length > 0) ||
      (formData.deliverables && formData.deliverables.some(d => d && d.trim())) ||
      !!formData.estimatedDuration ||
      !!formData.estimatedHoursPerWeek;

    const compensationComplete =
      !!(formData.applyWindowStart && formData.applyWindowEnd) &&
      (!!formData.compensationValue ||
        formData.compensationType === 'experience' ||
        !!formData.budget);

    const locationComplete =
      !!formData.location &&
      (formData.location !== 'onsite' || !!formData.onsiteLocation?.trim());

    return {
      basics: basicsComplete,
      scope: scopeComplete,
      compensation: compensationComplete,
      location: locationComplete
    };
  }, [formData]);

  const sections = [
    { id: 'basics', label: 'Project Basics', icon: DocumentTextIcon, complete: sectionStatus.basics, required: true },
    { id: 'scope', label: 'Scope & Requirements', icon: ClipboardDocumentCheckIcon, complete: sectionStatus.scope, required: false },
    { id: 'compensation', label: 'Compensation & Timeline', icon: CurrencyDollarIcon, complete: sectionStatus.compensation, required: true },
    { id: 'location', label: 'Location', icon: MapPinIcon, complete: sectionStatus.location, required: false }
  ];

  const daysBetween = useMemo(() => {
    if (!formData.applyWindowStart || !formData.applyWindowEnd) return null;
    const diff = new Date(formData.applyWindowEnd).getTime() - new Date(formData.applyWindowStart).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [formData.applyWindowStart, formData.applyWindowEnd]);

  return (
    <div className="space-y-6">
      {/* Section Navigation / Progress */}
      <Card className="shadow-sm border-gray-200 sticky top-0 z-10 bg-white/95 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm font-medium text-gray-700">Form progress</div>
            <nav aria-label="Form sections" className="flex flex-wrap gap-2">
              {sections.map(s => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.id}
                    href={`#section-${s.id}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                      s.complete
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : s.required
                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    {s.complete ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="whitespace-nowrap">{s.label}</span>
                    {s.required && !s.complete && (
                      <span className="text-[10px] uppercase font-semibold tracking-wide">Required</span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 1: Project Basics */}
      <section id="section-basics" className="scroll-mt-24">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center text-lg">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600" />
              Project Basics
            </CardTitle>
            <CardDescription>
              Tell students what you&apos;re working on. Required to post an opportunity.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* AI Consultation Option */}
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAiConsultation}
                  onChange={e => setFormData(prev => ({ ...prev, isAiConsultation: e.target.checked }))}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                    <SparklesIcon className="w-4 h-4 text-blue-600" />
                    AI Solutions Consultation
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose this if you don&apos;t have a defined project yet and want a student to
                    explore where AI could add the most value in your business. We&apos;ll prompt you
                    for your current software and pain points instead of a traditional scope.
                  </p>
                </div>
              </label>

              {formData.isAiConsultation && (
                <div className="mt-5 space-y-4 pl-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Software, Systems, and Tools <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      List what you use day-to-day (e.g., QuickBooks, HubSpot, Shopify, Google Workspace).
                    </p>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={4}
                      placeholder="We currently use..."
                      value={formData.currentSoftwareTools || ''}
                      onChange={e => setFormData(prev => ({ ...prev, currentSoftwareTools: e.target.value }))}
                    />
                    {errors.currentSoftwareTools && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentSoftwareTools}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pain Points & Repetitive Tasks <span className="text-gray-400">(optional)</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      What eats up your team&apos;s time? Repetitive work or friction points help students
                      pinpoint high-value AI opportunities.
                    </p>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={4}
                      placeholder="Every week we spend hours on..."
                      value={formData.painPoints || ''}
                      onChange={e => setFormData(prev => ({ ...prev, painPoints: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Title/Description/Type - shown when NOT AI consultation */}
            {!formData.isAiConsultation && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opportunity Title <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    A concise, specific title students can scan quickly.
                  </p>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., AI-Powered Customer Service Chatbot Development"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opportunity Description <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Describe the problem, the scope of work, and what success looks like. A clear
                    description attracts stronger applicants.
                  </p>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={6}
                    placeholder="We need help with..."
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PROJECT_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type }))}
                        className={`px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                          formData.type === type
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <CheckCircleIcon
                          className={`w-5 h-5 mx-auto mb-1 ${
                            formData.type === type ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                  {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                </div>
              </div>
            )}

            {/* Industry Tags - Always required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <AcademicCapIcon className="w-4 h-4 text-gray-500" />
                Industry Tags <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Click a tag below to add it. Click the × on a selected tag to remove it. Add at
                least one so students can find your opportunity.
              </p>

              {formData.industryTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
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
                        aria-label={`Remove ${tag}`}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {INDUSTRY_TAGS.filter(t => !formData.industryTags.includes(t)).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addIndustryTag(tag)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-green-50 hover:border-green-400 transition-colors"
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
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter custom industry..."
                    value={customIndustry}
                    onChange={e => setCustomIndustry(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customIndustry) {
                          addIndustryTag(customIndustry);
                          setIndustryInput('');
                        }
                      }
                    }}
                  />
                  <div className="flex gap-2">
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
                </div>
              )}
              {errors.industryTags && (
                <p className="mt-2 text-sm text-red-600">{errors.industryTags}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 2: Scope & Requirements */}
      {!formData.isAiConsultation && (
        <section id="section-scope" className="scroll-mt-24">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center text-lg">
                <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-gray-600" />
                Scope & Requirements
              </CardTitle>
              <CardDescription>
                Optional, but helps attract the right candidates. Fill in whatever applies.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Deliverables */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deliverables <span className="text-gray-400">(optional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  List the concrete outputs you expect (e.g., &quot;Working prototype&quot;,
                  &quot;Market research report&quot;, &quot;Deployed chatbot&quot;). This defines
                  what &quot;done&quot; looks like.
                </p>
                <div className="space-y-3">
                  {(formData.deliverables || ['']).map((deliverable, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <span className="text-gray-400 mt-2 select-none">{index + 1}.</span>
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                        placeholder="Describe expected outcome..."
                        value={deliverable}
                        onChange={e => updateDeliverable(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                        disabled={(formData.deliverables?.length || 0) <= 1 && !deliverable}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        aria-label="Remove deliverable"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addDeliverable} className="w-full">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Another Deliverable
                  </Button>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills / Expertise Desired <span className="text-gray-400">(optional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Click a skill to add it. Click the × to remove. Leaving this empty means students
                  of any skill set can apply.
                </p>
                {formData.requiredSkills && formData.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-blue-600"
                          aria-label={`Remove ${skill}`}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {SKILL_TAGS.filter(s => !formData.requiredSkills?.includes(s))
                    .slice(0, 12)
                    .map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors"
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
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter custom skill..."
                      value={customSkill}
                      onChange={e => setCustomSkill(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customSkill) {
                            addSkill(customSkill);
                            setSkillInput('');
                          }
                        }
                      }}
                    />
                    <div className="flex gap-2">
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSkillInput('');
                          setCustomSkill('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Duration + Hours (grouped) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Duration <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                    value={customDurationMode ? 'Custom' : (formData.estimatedDuration || '')}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === 'Custom') {
                        setCustomDurationMode(true);
                        setFormData(prev => ({ ...prev, estimatedDuration: customDuration }));
                      } else {
                        setCustomDurationMode(false);
                        setCustomDuration('');
                        setFormData(prev => ({ ...prev, estimatedDuration: v }));
                      }
                    }}
                  >
                    <option value="">Not specified</option>
                    {DURATION_OPTIONS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {customDurationMode && (
                    <input
                      type="text"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                      placeholder="Enter custom duration..."
                      value={customDuration}
                      onChange={e => {
                        const v = e.target.value;
                        setCustomDuration(v);
                        setFormData(prev => ({ ...prev, estimatedDuration: v }));
                      }}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours per Week <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                    value={formData.estimatedHoursPerWeek || ''}
                    onChange={e => setFormData(prev => ({ ...prev, estimatedHoursPerWeek: e.target.value }))}
                  >
                    <option value="">Not specified</option>
                    {HOURS_PER_WEEK_OPTIONS.map(h => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* SECTION 3: Compensation & Timeline */}
      <section id="section-compensation" className="scroll-mt-24">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center text-lg">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-gray-600" />
              Compensation & Timeline
            </CardTitle>
            <CardDescription>
              How you&apos;re compensating the student and when applications are open.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Compensation type + value grouped */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compensation Type <span className="text-gray-400">(optional)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Hourly pay is the most common choice.
                  </p>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                    value={formData.compensationType || 'paid-hourly'}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, compensationType: e.target.value as any }))
                    }
                  >
                    {COMPENSATION_TYPES.map(t => (
                      <option key={t} value={t}>
                        {COMPENSATION_LABELS[t] || t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compensation Details <span className="text-gray-400">(optional)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">The amount or arrangement.</p>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                    placeholder={COMPENSATION_PLACEHOLDERS[formData.compensationType || 'paid-hourly']}
                    value={formData.compensationValue || ''}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, compensationValue: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Project Budget <span className="text-gray-400">(optional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Total budget range for the opportunity, if different from the hourly/stipend rate
                  above.
                </p>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                  placeholder="e.g., $5k-$10k, or 'Flexible'"
                  value={formData.budget || ''}
                  onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                />
              </div>
            </div>

            {/* Apply window grouped */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center mb-3">
                <CalendarIcon className="w-5 h-5 mr-2 text-gray-600" />
                <span className="font-medium text-gray-900">Application Window</span>
                <span className="ml-2 text-red-500">*</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Students can apply only during this window.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.applyWindowStart}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, applyWindowStart: e.target.value }))
                    }
                    min={getTodayDate()}
                  />
                  {errors.applyWindowStart && (
                    <p className="mt-1 text-sm text-red-600">{errors.applyWindowStart}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.applyWindowEnd}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, applyWindowEnd: e.target.value }))
                    }
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
                  {daysBetween !== null
                    ? `Applications will be open for ${daysBetween} day${daysBetween === 1 ? '' : 's'}.`
                    : 'Pick a start and end date to see how long applications will be open.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 4: Location */}
      <section id="section-location" className="scroll-mt-24">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center text-lg">
              <MapPinIcon className="w-5 h-5 mr-2 text-gray-600" />
              Location
            </CardTitle>
            <CardDescription>
              Where does the work happen? Remote is the default and most common.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location / Modality
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LOCATION_OPTIONS.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, location: loc as any }))}
                    className={`px-4 py-3 rounded-lg border-2 transition-all capitalize text-sm ${
                      formData.location === loc
                        ? 'border-generator-green bg-generator-green/10 text-generator-green font-medium'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <MapPinIcon
                      className={`w-5 h-5 mx-auto mb-1 ${
                        formData.location === loc ? 'text-generator-green' : 'text-gray-400'
                      }`}
                    />
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {formData.location === 'onsite' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  On-site Location <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">City and state, or specific office.</p>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-generator-green focus:border-generator-green"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.onsiteLocation || ''}
                  onChange={e => setFormData(prev => ({ ...prev, onsiteLocation: e.target.value }))}
                />
                {errors.onsiteLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.onsiteLocation}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
