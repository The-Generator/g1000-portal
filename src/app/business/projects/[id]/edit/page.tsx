'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Project, ProjectForm } from '@/types';
import { transformProject, formatDateForInput } from '@/lib/utils';
import { OpportunityFormSections } from '@/components/business/OpportunityFormSections';
import toast from 'react-hot-toast';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [project, setProject] = useState<Project | null>(null);

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
    compensationType: 'paid-hourly',
    compensationValue: '',
    budget: '',
    deliverables: [''],
    location: 'remote',
    onsiteLocation: '',
    applyWindowStart: '',
    applyWindowEnd: '',
    requiredSkills: []
  });

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/business/projects/${projectId}?mode=edit`);
      if (response.ok) {
        const data = await response.json();
        const projectData = transformProject(data.data);
        setProject(projectData);

        setFormData({
          title: projectData.title || '',
          description: projectData.description || '',
          type: projectData.type || 'project-based',
          isAiConsultation: (projectData as any).isAiConsultation || false,
          currentSoftwareTools: (projectData as any).currentSoftwareTools || '',
          painPoints: (projectData as any).painPoints || '',
          industryTags: projectData.industryTags || [],
          estimatedDuration:
            (projectData as any).duration || (projectData as any).estimatedDuration || '',
          estimatedHoursPerWeek: (projectData as any).estimatedHoursPerWeek || '',
          // Preserve existing compensation type from project data.
          // Only new projects default to 'paid-hourly'; for edits we keep whatever was saved.
          compensationType: projectData.compensationType,
          compensationValue: projectData.compensationValue || '',
          budget: (projectData as any).budget || '',
          deliverables:
            projectData.deliverables && projectData.deliverables.length > 0
              ? projectData.deliverables
              : [''],
          location: (projectData as any).location || 'remote',
          onsiteLocation: (projectData as any).onsiteLocation || '',
          applyWindowStart: formatDateForInput(projectData.applyWindowStart),
          applyWindowEnd: formatDateForInput(projectData.applyWindowEnd),
          requiredSkills: projectData.requiredSkills || []
        });
      } else {
        throw new Error('Failed to fetch project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
      router.push('/business/dashboard');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (formData.isAiConsultation && !formData.title) {
      setFormData(prev => ({
        ...prev,
        title: 'AI Solutions Consultation',
        description:
          'Looking for a student to consult on where AI solutions could provide the most value in our business operations.',
        type: 'consulting'
      }));
    } else if (!formData.isAiConsultation) {
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
      if (!formData.title?.trim()) newErrors.title = 'Opportunity Title is required';
      if (!formData.description?.trim())
        newErrors.description = 'Opportunity Description is required';
      if (!formData.type) newErrors.type = 'Type is required';
    } else if (!formData.currentSoftwareTools?.trim()) {
      newErrors.currentSoftwareTools = 'Please describe your current software and tools';
    }

    if (!formData.industryTags || formData.industryTags.length === 0) {
      newErrors.industryTags = 'At least one industry tag is required';
    }

    if (!formData.applyWindowStart)
      newErrors.applyWindowStart = 'Application start date is required';
    if (!formData.applyWindowEnd)
      newErrors.applyWindowEnd = 'Application end date is required';
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
          formData.location === 'onsite' ? formData.onsiteLocation : undefined,
        duration: formData.estimatedDuration || undefined
      };

      const response = await fetch(`/api/business/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Opportunity updated successfully!');
        window.localStorage.setItem('projectsUpdated', Date.now().toString());
        router.push('/business/dashboard');
        router.refresh();
      } else {
        const errorMessage = data.details
          ? `${data.error}: ${data.details}`
          : data.error || 'Failed to update opportunity';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasApplications = project?.applications && project.applications.length > 0;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#789b4a] mx-auto" />
          <p className="mt-4 text-gray-600">Loading opportunity...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Opportunity</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Update your opportunity for talented G1000 students
              </p>
            </div>
          </div>
        </div>
      </div>

      {hasApplications && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <Card className="border-yellow-200 bg-yellow-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    This opportunity has applications
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Be careful when editing opportunity details as it may affect existing
                    applicants. Consider communicating significant changes to applicants.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
              Update Opportunity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
