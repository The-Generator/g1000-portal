'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ArrowLeftIcon,
  LinkIcon,
  CalendarIcon,
  UserIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  ChartBarIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProjectDetails {
  id: string;
  title: string;
  description: string;
  companyName: string;
  companyLogoUrl: string | null;
  status: 'active' | 'completed';
  overview: {
    id?: string;
    scope: string;
    deliverables: Array<{ text: string; completed: boolean }>;
    startDate: string | null;
    targetEndDate: string | null;
    meetingLink: string;
    ownerContactName: string;
    ownerContactEmail: string;
    usefulLinks: Array<{ title: string; url: string }>;
  };
  updates: Array<{
    id: string;
    workedOn: string;
    progressPercentage: number;
    blockers: string | null;
    nextSteps: string[];
    links: Array<{ title: string; url: string }>;
    createdAt: string;
    comments: Array<{
      id: string;
      userId: string;
      userName: string;
      userRole: string;
      comment: string;
      createdAt: string;
    }>;
  }>;
  review: {
    id: string;
    reliabilityRating: number;
    communicationRating: number;
    initiativeRating: number;
    qualityRating: number;
    impactRating: number;
    reviewNote: string;
    deliverablesCompleted: boolean;
    createdAt: string;
  } | null;
  reflection: {
    id: string;
    reflectionPoints: string[];
    reflectionLinks: Array<{ title: string; url: string }>;
    createdAt: string;
  } | null;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Update form state
  const [updateForm, setUpdateForm] = useState({
    workedOn: '',
    progressPercentage: 0,
    blockers: '',
    nextSteps: [''],
    links: [{ title: '', url: '' }]
  });

  // Reflection form state
  const [reflectionForm, setReflectionForm] = useState({
    reflectionPoints: ['', '', ''],
    reflectionLinks: [{ title: '', url: '' }]
  });

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/student/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.data);
      } else {
        toast.error('Failed to load project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/student/projects/${projectId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updateForm,
          nextSteps: updateForm.nextSteps.filter(s => s.trim()),
          links: updateForm.links.filter(l => l.url.trim())
        })
      });

      if (response.ok) {
        toast.success('Update posted successfully');
        setShowUpdateForm(false);
        setUpdateForm({
          workedOn: '',
          progressPercentage: 0,
          blockers: '',
          nextSteps: [''],
          links: [{ title: '', url: '' }]
        });
        fetchProject();
      } else {
        const error = await response.json();
        console.error('Update error:', error);
        if (error.details) {
          toast.error(`${error.error}: ${error.details}`);
          console.log('Full error:', error);
          if (error.hint) {
            console.log('Hint:', error.hint);
          }
        } else {
          toast.error(error.error || 'Failed to post update');
        }
      }
    } catch (error) {
      console.error('Error posting update:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleSubmitComment = async (updateId: string) => {
    if (!commentText.trim()) return;

    try {
      const response = await fetch(`/api/student/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateId,
          comment: commentText
        })
      });

      if (response.ok) {
        toast.success('Comment added');
        setCommentingOn(null);
        setCommentText('');
        fetchProject();
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm('Are you sure you want to delete this update? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/student/projects/${projectId}/updates/${updateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Update deleted successfully');
        fetchProject();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete update');
      }
    } catch (error) {
      console.error('Error deleting update:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleDeleteComment = async (updateId: string, commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/student/projects/${projectId}/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Comment deleted successfully');
        fetchProject();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleSubmitReflection = async (e: React.FormEvent) => {
    e.preventDefault();

    const validPoints = reflectionForm.reflectionPoints.filter(p => p.trim());
    if (validPoints.length === 0) {
      toast.error('Please add at least one reflection point');
      return;
    }

    try {
      const response = await fetch(`/api/student/projects/${projectId}/reflection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reflectionPoints: validPoints,
          reflectionLinks: reflectionForm.reflectionLinks.filter(l => l.url.trim())
        })
      });

      if (response.ok) {
        toast.success('Reflection submitted successfully');
        setShowReflectionForm(false);
        fetchProject();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit reflection');
      }
    } catch (error) {
      console.error('Error submitting reflection:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Project not found</p>
          <Link href="/student/projects">
            <Button variant="outline" className="mt-4">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/student/projects">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {project.companyLogoUrl ? (
                <img
                  src={project.companyLogoUrl}
                  alt={project.companyName}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-400">
                    {project.companyName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-gray-600">{project.companyName}</p>
              </div>
            </div>
            <div>
              {project.status === 'completed' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section A: Overview (Read-only for students) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scope */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Scope</h4>
              <p className="text-gray-600">{project.overview.scope || 'No scope defined yet'}</p>
            </div>

            {/* Deliverables */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Deliverables</h4>
              {project.overview.deliverables.length > 0 ? (
                <ul className="space-y-2">
                  {project.overview.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={deliverable.completed}
                        disabled
                        className="mr-3 h-4 w-4 text-primary-600 rounded"
                      />
                      <span className={deliverable.completed ? 'line-through text-gray-400' : 'text-gray-600'}>
                        {deliverable.text}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No deliverables defined yet</p>
              )}
            </div>

            {/* Dates & Contact */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Timeline</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <CalendarIcon className="inline w-4 h-4 mr-2 text-gray-400" />
                    Start: {formatDate(project.overview.startDate)}
                  </p>
                  <p className="text-gray-600">
                    <CalendarIcon className="inline w-4 h-4 mr-2 text-gray-400" />
                    Target End: {formatDate(project.overview.targetEndDate)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Contact</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <UserIcon className="inline w-4 h-4 mr-2 text-gray-400" />
                    {project.overview.ownerContactName || 'Not provided'}
                  </p>
                  <p className="text-gray-600">
                    <EnvelopeIcon className="inline w-4 h-4 mr-2 text-gray-400" />
                    {project.overview.ownerContactEmail || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Meeting & Links */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Meeting Link</h4>
                {project.overview.meetingLink ? (
                  <a
                    href={project.overview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Join Meeting
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm italic">No meeting link provided</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Useful Links</h4>
                {project.overview.usefulLinks.length > 0 ? (
                  <div className="space-y-1">
                    {project.overview.usefulLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      >
                        <LinkIcon className="w-3 h-3 mr-1" />
                        {link.title || link.url}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No links provided</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section B: Updates */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Progress Updates</CardTitle>
              {project.status === 'active' && (
                <Button onClick={() => setShowUpdateForm(!showUpdateForm)} size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Post Update
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Update Form */}
            {showUpdateForm && (
              <form onSubmit={handleSubmitUpdate} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What did you work on? (5-8 sentences max)
                    </label>
                    <textarea
                      value={updateForm.workedOn}
                      onChange={(e) => setUpdateForm({ ...updateForm, workedOn: e.target.value })}
                      rows={4}
                      maxLength={2000}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Describe what you accomplished..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Progress: {updateForm.progressPercentage}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={updateForm.progressPercentage}
                      onChange={(e) => setUpdateForm({ ...updateForm, progressPercentage: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blockers (1-2 lines, optional)
                    </label>
                    <input
                      type="text"
                      value={updateForm.blockers}
                      onChange={(e) => setUpdateForm({ ...updateForm, blockers: e.target.value })}
                      maxLength={200}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Any challenges or blockers?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Steps (up to 3 bullets)
                    </label>
                    {updateForm.nextSteps.map((step, index) => (
                      <input
                        key={index}
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...updateForm.nextSteps];
                          newSteps[index] = e.target.value;
                          setUpdateForm({ ...updateForm, nextSteps: newSteps });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                        placeholder={`Next step ${index + 1}`}
                      />
                    ))}
                    {updateForm.nextSteps.length < 3 && (
                      <button
                        type="button"
                        onClick={() => setUpdateForm({ ...updateForm, nextSteps: [...updateForm.nextSteps, ''] })}
                        className="text-primary-600 text-sm hover:text-primary-700"
                      >
                        + Add step
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Links (up to 3, optional)
                    </label>
                    {updateForm.links.map((link, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => {
                            const newLinks = [...updateForm.links];
                            newLinks[index].title = e.target.value;
                            setUpdateForm({ ...updateForm, links: newLinks });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Link title"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...updateForm.links];
                            newLinks[index].url = e.target.value;
                            setUpdateForm({ ...updateForm, links: newLinks });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    ))}
                    {updateForm.links.length < 3 && (
                      <button
                        type="button"
                        onClick={() => setUpdateForm({ ...updateForm, links: [...updateForm.links, { title: '', url: '' }] })}
                        className="text-primary-600 text-sm hover:text-primary-700"
                      >
                        + Add link
                      </button>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowUpdateForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm">
                      Submit Update
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Updates List */}
            {project.updates.length > 0 ? (
              <div className="space-y-6">
                {project.updates.map((update) => (
                  <div key={update.id} className="border-l-4 border-gray-200 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">{formatDateTime(update.createdAt)}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <ChartBarIcon className="w-3 h-3 mr-1" />
                          {update.progressPercentage}%
                        </span>
                      </div>
                      {project.status === 'active' && (
                        <button
                          onClick={() => handleDeleteUpdate(update.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete update"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Work Completed:</h5>
                        <p className="text-sm text-gray-600">{update.workedOn}</p>
                      </div>

                      {update.blockers && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Blockers:</h5>
                          <p className="text-sm text-red-600">{update.blockers}</p>
                        </div>
                      )}

                      {update.nextSteps.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Next Steps:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {update.nextSteps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {update.links.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Links:</h5>
                          <div className="space-y-1">
                            {update.links.map((link, index) => (
                              <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                              >
                                <LinkIcon className="w-3 h-3 mr-1" />
                                {link.title || link.url}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Comments */}
                      {update.comments.length > 0 && (
                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-100">
                          {update.comments.map((comment) => (
                            <div key={comment.id} className="text-sm group">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-700">{comment.userName}</span>
                                  <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
                                </div>
                                {project.status === 'active' && (
                                  <button
                                    onClick={() => handleDeleteComment(update.id, comment.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-opacity"
                                    title="Delete comment"
                                  >
                                    <TrashIcon className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-gray-600">{comment.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment */}
                      {project.status === 'active' && (
                        <>
                          {commentingOn === update.id ? (
                            <div className="mt-3 flex space-x-2">
                              <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSubmitComment(update.id);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSubmitComment(update.id)}
                              >
                                Post
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCommentingOn(null);
                                  setCommentText('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setCommentingOn(update.id)}
                              className="text-primary-600 text-sm hover:text-primary-700 mt-2"
                            >
                              Add comment
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-8">No updates posted yet</p>
            )}
          </CardContent>
        </Card>

        {/* Section C: Finish (Review & Reflection) */}
        {project.status === 'completed' && project.review && (
          <Card>
            <CardHeader>
              <CardTitle>Final Review & Reflection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Owner Review */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Performance Review</h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    {[
                      { label: 'Reliability', value: project.review.reliabilityRating },
                      { label: 'Communication', value: project.review.communicationRating },
                      { label: 'Initiative', value: project.review.initiativeRating },
                      { label: 'Quality', value: project.review.qualityRating },
                      { label: 'Impact', value: project.review.impactRating }
                    ].map((rating) => (
                      <div key={rating.label} className="text-center">
                        <div className="text-2xl font-bold text-green-600">{rating.value}/5</div>
                        <div className="text-xs text-gray-600">{rating.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Review Note:</span>
                    </p>
                    <p className="text-sm text-gray-600">{project.review.reviewNote}</p>
                    <div className="flex items-center mt-3">
                      {project.review.deliverablesCompleted ? (
                        <span className="text-sm text-green-600 flex items-center">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          All deliverables completed
                        </span>
                      ) : (
                        <span className="text-sm text-yellow-600">
                          Some deliverables incomplete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Reflection */}
              {project.reflection ? (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Your Reflection</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3">
                      {project.reflection.reflectionPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                    {project.reflection.reflectionLinks.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-blue-200">
                        {project.reflection.reflectionLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" />
                            {link.title || link.url}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Add Your Reflection (Optional)</h4>
                  {showReflectionForm ? (
                    <form onSubmit={handleSubmitReflection} className="p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Key Learnings (up to 3 points)
                          </label>
                          {reflectionForm.reflectionPoints.map((point, index) => (
                            <input
                              key={index}
                              type="text"
                              value={point}
                              onChange={(e) => {
                                const newPoints = [...reflectionForm.reflectionPoints];
                                newPoints[index] = e.target.value;
                                setReflectionForm({ ...reflectionForm, reflectionPoints: newPoints });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                              placeholder={`Learning point ${index + 1}`}
                            />
                          ))}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supporting Links (optional)
                          </label>
                          {reflectionForm.reflectionLinks.map((link, index) => (
                            <div key={index} className="flex space-x-2 mb-2">
                              <input
                                type="text"
                                value={link.title}
                                onChange={(e) => {
                                  const newLinks = [...reflectionForm.reflectionLinks];
                                  newLinks[index].title = e.target.value;
                                  setReflectionForm({ ...reflectionForm, reflectionLinks: newLinks });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Link title"
                              />
                              <input
                                type="url"
                                value={link.url}
                                onChange={(e) => {
                                  const newLinks = [...reflectionForm.reflectionLinks];
                                  newLinks[index].url = e.target.value;
                                  setReflectionForm({ ...reflectionForm, reflectionLinks: newLinks });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="https://..."
                              />
                            </div>
                          ))}
                          {reflectionForm.reflectionLinks.length < 3 && (
                            <button
                              type="button"
                              onClick={() => setReflectionForm({
                                ...reflectionForm,
                                reflectionLinks: [...reflectionForm.reflectionLinks, { title: '', url: '' }]
                              })}
                              className="text-primary-600 text-sm hover:text-primary-700"
                            >
                              + Add link
                            </button>
                          )}
                        </div>

                        <div className="flex justify-end space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowReflectionForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" size="sm">
                            Submit Reflection
                          </Button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <Button onClick={() => setShowReflectionForm(true)} variant="outline">
                      Add Reflection
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}