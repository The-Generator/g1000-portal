'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

interface ProjectData {
  id: string;
  title: string;
  description: string;
  studentName: string;
  studentEmail: string;
  status: 'active' | 'completed';

  overview: {
    id?: string;
    scope: string;
    deliverables: string[];
    startDate?: string;
    targetEndDate?: string;
    meetingLink?: string;
    ownerContactName?: string;
    ownerContactEmail?: string;
    usefulLinks?: { title: string; url: string }[];
  };

  updates: Array<{
    id: string;
    workedOn: string;
    progressPercentage: number;
    blockers?: string;
    nextSteps?: string[];
    links?: { title: string; url: string }[];
    createdAt: string;
    comments: Array<{
      id: string;
      userName: string;
      userRole: string;
      comment: string;
      createdAt: string;
    }>;
  }>;

  review?: {
    id: string;
    reliabilityRating: number;
    communicationRating: number;
    initiativeRating: number;
    qualityRating: number;
    impactRating: number;
    reviewNote?: string;
    deliverablesCompleted: boolean;
    createdAt: string;
  };
}

export default function BusinessProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'updates' | 'review'>('overview');
  const [editingOverview, setEditingOverview] = useState(false);
  const [overviewForm, setOverviewForm] = useState({
    scope: '',
    deliverables: [''],
    startDate: '',
    targetEndDate: '',
    meetingLink: '',
    ownerContactName: '',
    ownerContactEmail: '',
    usefulLinks: [{ title: '', url: '' }]
  });
  const [commentForm, setCommentForm] = useState<{ [key: string]: string }>({});
  const [reviewForm, setReviewForm] = useState({
    reliabilityRating: 5,
    communicationRating: 5,
    initiativeRating: 5,
    qualityRating: 5,
    impactRating: 5,
    reviewNote: '',
    deliverablesCompleted: true
  });
  const router = useRouter();

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/business/projects/${params.id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/business/login');
          return;
        }
        throw new Error('Failed to fetch project');
      }

      const { data } = await response.json();
      setProject(data);

      // Initialize overview form with current data
      if (data.overview) {
        setOverviewForm({
          scope: data.overview.scope || '',
          deliverables: data.overview.deliverables?.length > 0 ? data.overview.deliverables : [''],
          startDate: data.overview.startDate || '',
          targetEndDate: data.overview.targetEndDate || '',
          meetingLink: data.overview.meetingLink || '',
          ownerContactName: data.overview.ownerContactName || '',
          ownerContactEmail: data.overview.ownerContactEmail || '',
          usefulLinks: data.overview.usefulLinks?.length > 0 ? data.overview.usefulLinks : [{ title: '', url: '' }]
        });
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOverview = async () => {
    try {
      const response = await fetch(`/api/business/projects/${params.id}/overview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          scope: overviewForm.scope,
          deliverables: overviewForm.deliverables.filter(d => d.trim()),
          startDate: overviewForm.startDate,
          targetEndDate: overviewForm.targetEndDate,
          meetingLink: overviewForm.meetingLink,
          ownerContactName: overviewForm.ownerContactName,
          ownerContactEmail: overviewForm.ownerContactEmail,
          usefulLinks: overviewForm.usefulLinks.filter(l => l.url.trim())
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save overview');
      }

      toast.success('Overview saved successfully');
      setEditingOverview(false);
      fetchProject();
    } catch (error) {
      console.error('Error saving overview:', error);
      toast.error('Failed to save overview');
    }
  };

  const handleAddComment = async (updateId: string) => {
    const comment = commentForm[updateId];
    if (!comment?.trim()) return;

    try {
      const response = await fetch(`/api/business/projects/${params.id}/updates/${updateId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment: comment.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      toast.success('Comment added');
      setCommentForm({ ...commentForm, [updateId]: '' });
      fetchProject();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleSubmitReview = async () => {
    try {
      const response = await fetch(`/api/business/projects/${params.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(reviewForm)
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      toast.success('Review submitted successfully');
      fetchProject();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Project not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {project.status === 'completed' ? 'Completed' : 'Active'}
          </span>
        </div>
        <p className="text-gray-600 mb-2">{project.description}</p>
        <div className="text-sm text-gray-500">
          <span className="font-medium">Student:</span> {project.studentName} ({project.studentEmail})
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-generator-green text-generator-green'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('updates')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'updates'
              ? 'border-generator-green text-generator-green'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Updates ({project.updates.length})
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'review'
              ? 'border-generator-green text-generator-green'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Review & Complete
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Overview</h2>
            {!editingOverview ? (
              <button
                onClick={() => setEditingOverview(true)}
                className="px-4 py-2 bg-generator-green text-white rounded-lg hover:bg-generator-dark"
              >
                Edit Overview
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingOverview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOverview}
                  className="px-4 py-2 bg-generator-green text-white rounded-lg hover:bg-generator-dark"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {editingOverview ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Scope
                </label>
                <textarea
                  value={overviewForm.scope}
                  onChange={(e) => setOverviewForm({ ...overviewForm, scope: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={4}
                  maxLength={2000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deliverables
                </label>
                {overviewForm.deliverables.map((del, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={del}
                      onChange={(e) => {
                        const newDeliverables = [...overviewForm.deliverables];
                        newDeliverables[index] = e.target.value;
                        setOverviewForm({ ...overviewForm, deliverables: newDeliverables });
                      }}
                      placeholder="Enter deliverable"
                    />
                    {overviewForm.deliverables.length > 1 && (
                      <button
                        onClick={() => {
                          const newDeliverables = overviewForm.deliverables.filter((_, i) => i !== index);
                          setOverviewForm({ ...overviewForm, deliverables: newDeliverables });
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setOverviewForm({ ...overviewForm, deliverables: [...overviewForm.deliverables, ''] })}
                  className="text-generator-green hover:text-generator-dark text-sm"
                >
                  + Add deliverable
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={overviewForm.startDate}
                    onChange={(e) => setOverviewForm({ ...overviewForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target End Date
                  </label>
                  <Input
                    type="date"
                    value={overviewForm.targetEndDate}
                    onChange={(e) => setOverviewForm({ ...overviewForm, targetEndDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Link
                </label>
                <Input
                  value={overviewForm.meetingLink}
                  onChange={(e) => setOverviewForm({ ...overviewForm, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <Input
                    value={overviewForm.ownerContactName}
                    onChange={(e) => setOverviewForm({ ...overviewForm, ownerContactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={overviewForm.ownerContactEmail}
                    onChange={(e) => setOverviewForm({ ...overviewForm, ownerContactEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Scope</h3>
                <p className="text-gray-600">{project.overview.scope || 'Not set'}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-1">Deliverables</h3>
                {project.overview.deliverables?.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-600">
                    {project.overview.deliverables.map((del, index) => (
                      <li key={index}>{del}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No deliverables set</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Timeline</h3>
                  <p className="text-gray-600">
                    {formatDate(project.overview.startDate)} - {formatDate(project.overview.targetEndDate)}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Meeting Link</h3>
                  {project.overview.meetingLink ? (
                    <a href={project.overview.meetingLink} target="_blank" rel="noopener noreferrer"
                       className="text-generator-green hover:underline">
                      Join Meeting
                    </a>
                  ) : (
                    <p className="text-gray-400">Not set</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-1">Contact Information</h3>
                <p className="text-gray-600">
                  {project.overview.ownerContactName || 'Not set'}
                  {project.overview.ownerContactEmail && ` - ${project.overview.ownerContactEmail}`}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Updates Tab */}
      {activeTab === 'updates' && (
        <div className="space-y-6">
          {project.updates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No updates yet. The student will post updates as they make progress.</p>
            </Card>
          ) : (
            project.updates.map((update) => (
              <Card key={update.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      {formatDate(update.createdAt)}
                    </div>
                    <div className="text-2xl font-bold text-generator-green">
                      {update.progressPercentage}% Complete
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">What was worked on:</h4>
                    <p className="text-gray-600">{update.workedOn}</p>
                  </div>

                  {update.blockers && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Blockers:</h4>
                      <p className="text-gray-600">{update.blockers}</p>
                    </div>
                  )}

                  {update.nextSteps && update.nextSteps.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Next Steps:</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {update.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {update.links && update.links.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Links:</h4>
                      <div className="space-y-1">
                        {update.links.map((link, index) => (
                          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer"
                             className="text-generator-green hover:underline block">
                            {link.title || link.url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Comments</h4>
                  {update.comments.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {update.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">
                              {comment.userName}
                              <span className="text-gray-500 ml-1">({comment.userRole})</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={commentForm[update.id] || ''}
                      onChange={(e) => setCommentForm({ ...commentForm, [update.id]: e.target.value })}
                      placeholder="Add a comment..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(update.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(update.id)}
                      className="px-4 py-2 bg-generator-green text-white rounded-lg hover:bg-generator-dark"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Review Tab */}
      {activeTab === 'review' && (
        <Card className="p-6">
          {project.review ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Project Review</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Reliability:</span> {project.review.reliabilityRating}/5
                </div>
                <div>
                  <span className="font-medium">Communication:</span> {project.review.communicationRating}/5
                </div>
                <div>
                  <span className="font-medium">Initiative:</span> {project.review.initiativeRating}/5
                </div>
                <div>
                  <span className="font-medium">Quality:</span> {project.review.qualityRating}/5
                </div>
                <div>
                  <span className="font-medium">Impact:</span> {project.review.impactRating}/5
                </div>
                {project.review.reviewNote && (
                  <div>
                    <span className="font-medium">Review Note:</span>
                    <p className="mt-1 text-gray-600">{project.review.reviewNote}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">Deliverables Completed:</span>{' '}
                  {project.review.deliverablesCompleted ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-gray-500 mt-4">
                  Reviewed on {formatDate(project.review.createdAt)}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Complete Project & Submit Review</h2>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Once the student has completed the project, submit your review to close it out.
                </div>

                {/* Rating Fields */}
                {[
                  { key: 'reliabilityRating', label: 'Reliability' },
                  { key: 'communicationRating', label: 'Communication' },
                  { key: 'initiativeRating', label: 'Initiative' },
                  { key: 'qualityRating', label: 'Quality' },
                  { key: 'impactRating', label: 'Impact' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label} Rating
                    </label>
                    <select
                      value={reviewForm[key as keyof typeof reviewForm]}
                      onChange={(e) => setReviewForm({ ...reviewForm, [key]: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded-lg"
                    >
                      {[5, 4, 3, 2, 1].map(num => (
                        <option key={num} value={num}>{num} - {
                          num === 5 ? 'Excellent' :
                          num === 4 ? 'Good' :
                          num === 3 ? 'Average' :
                          num === 2 ? 'Below Average' :
                          'Poor'
                        }</option>
                      ))}
                    </select>
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Note (Optional)
                  </label>
                  <textarea
                    value={reviewForm.reviewNote}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewNote: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    rows={4}
                    maxLength={2000}
                    placeholder="Any additional feedback for the student..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reviewForm.deliverablesCompleted}
                      onChange={(e) => setReviewForm({ ...reviewForm, deliverablesCompleted: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      All deliverables were completed successfully
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleSubmitReview}
                  className="w-full py-3 bg-generator-green text-white rounded-lg hover:bg-generator-dark font-medium"
                >
                  Submit Review & Complete Project
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}