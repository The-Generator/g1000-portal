'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ProjectForm } from '@/types';
import { getTodayDate, getNextWeekDate } from '@/lib/utils';
import { OpportunityFormSections } from '@/components/business/OpportunityFormSections';
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
    compensationType: 'paid-hourly', // smart default: hourly is most common
    compensationValue: '',
    budget: '',
    deliverables: [''],
    location: 'remote', // smart default: remote
    onsiteLocation: '',
    applyWindowStart: getTodayDate(),
    applyWindowEnd: getNextWeekDate(),
    requiredSkills: []
  });

  // Auto-fill title and description for AI consultation
  useEffect(() => {
    if (formData.isAiConsultation) {
      setFormData(prev => ({
        ...prev,
        title: prev.title || 'AI Solutions Consultation',
        description:
          prev.description ||
          'Looking for a student to consult on where AI solutions could provide the most value in our business operations.',
        type: 'consulting'
      }));
    } else {
      setFormData(prev => {
        const updates: Partial<ProjectForm> = {};
        if (prev.title === 'AI Solutions Consultation') updates.title = '';
        if (
          prev.description ===
          'Looking for a student to consult on where AI solutions could provide the most value in our business operations.'
        ) {
          updates.description = '';
        }
        if (prev.type === 'consulting') updates.type = 'project-based';
        return { ...prev, ...updates };
      });
    }
  }, [formData.isAiConsultation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.isAiConsultation) {
      if (!formData.title.trim()) newErrors.title = 'Opportunity Title is required';
      if (!formData.description.trim()) newErrors.description = 'Opportunity Description is required';
      if (!formData.type) newErrors.type = 'Type is required';
    } else if (!formData.currentSoftwareTools?.trim()) {
      newErrors.currentSoftwareTools = 'Please describe your current software and tools';
    }

    if (formData.industryTags.length === 0) {
      newErrors.industryTags = 'At least one industry tag is required';
    }

    if (!formData.applyWindowStart) newErrors.applyWindowStart = 'Application start date is required';
    if (!formData.applyWindowEnd) newErrors.applyWindowEnd = 'Application end date is required';
    if (formData.applyWindowStart && formData.applyWindowEnd) {
      if (new Date(formData.applyWindowStart) >= new Date(formData.applyWindowEnd)) {
        newErrors.applyWindowEnd = 'End date must be after start date';
      }
    }

    if (formData.location === 'onsite' && !formData.onsiteLocation?.trim()) {
      newErrors.onsiteLocation = 'Please specify the on-site location';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(`Please fix the following: ${Object.values(newErrors).join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const submissionData = {
        ...formData,
        estimatedDuration: formData.estimatedDuration || undefined,
        estimatedHoursPerWeek: formData.estimatedHoursPerWeek || undefined,
        compensationType: formData.compensationType || 'experience',
        compensationValue: formData.compensationValue || '',
        budget: formData.budget || undefined,
        requiredSkills: formData.requiredSkills?.length ? formData.requiredSkills : [],
        deliverables: formData.deliverables?.length
          ? formData.deliverables.filter(d => d && d.trim())
          : [],
        location: formData.location || 'remote',
        onsiteLocation:
          formData.location === 'onsite' ? formData.onsiteLocation : undefined
      };

      const response = await fetch('/api/business/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Opportunity created successfully!');
        window.localStorage.setItem('projectsUpdated', Date.now().toString());
        router.push('/business/dashboard');
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to create opportunity');
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center py-4 sm:py-6 gap-3">
            <Link href="/business/dashboard">
              <Button variant="ghost" size="sm" className="mr-0 sm:mr-4 hover:bg-gray-100">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Create New Opportunity
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Post an opportunity for talented G1000 students
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <OpportunityFormSections
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />

          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <Link href="/business/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" disabled={loading} className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full sm:w-auto"
            >
              Create Opportunity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
