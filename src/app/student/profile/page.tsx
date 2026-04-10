'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StudentProfile, User, SKILL_TAGS, AvailabilitySlot } from '@/types';
import { WeeklyAvailability } from '@/components/WeeklyAvailability';
import { ChevronDownIcon, ChevronUpIcon, KeyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function StudentProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    personalWebsiteUrl: '',
    profilePhotoUrl: '',
    skills: [] as string[],
    proofOfWorkUrls: [] as string[],
    // Legacy availability fields (for backward compatibility)
    availableDays: [] as string[],
    availableStartTime: '',
    availableEndTime: '',
    // New flexible availability
    availabilitySlots: [] as AvailabilitySlot[],
    timezone: 'America/New_York'
  });

  const [newSkill, setNewSkill] = useState('');
  const [newProofOfWork, setNewProofOfWork] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string>('');
  const [availabilityExpanded, setAvailabilityExpanded] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Helper function to format URLs properly
  const formatUrl = (url: string): string => {
    if (!url) return '';
    // If URL doesn't start with http:// or https://, add https://
    if (!url.match(/^https?:\/\//i)) {
      return `https://${url}`;
    }
    return url;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/student/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
          setProfile(data.data.profile);
          
          if (data.data.profile) {
            setFormData({
              bio: data.data.profile.bio || '',
              linkedinUrl: data.data.profile.linkedinUrl || '',
              githubUrl: data.data.profile.githubUrl || '',
              personalWebsiteUrl: data.data.profile.personalWebsiteUrl || '',
              profilePhotoUrl: data.data.profile.profilePhotoUrl || '',
              skills: data.data.profile.skills || [],
              proofOfWorkUrls: data.data.profile.proofOfWorkUrls || [],
              availableDays: data.data.profile.availableDays || [],
              availableStartTime: data.data.profile.availableStartTime || '',
              availableEndTime: data.data.profile.availableEndTime || '',
              availabilitySlots: data.data.profile.availabilitySlots || [],
              timezone: data.data.profile.timezone || 'America/New_York'
            });
            // Set preview URL if profile photo exists
            if (data.data.profile.profilePhotoUrl) {
              setPreviewPhotoUrl(data.data.profile.profilePhotoUrl);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    // Format URLs for professional links
    if (['linkedinUrl', 'githubUrl', 'personalWebsiteUrl'].includes(field) && value) {
      // Only format if user has finished typing (on blur will handle this)
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleUrlBlur = (field: string) => {
    const value = formData[field as keyof typeof formData] as string;
    if (value && value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: formatUrl(value.trim())
      }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addProofOfWork = () => {
    if (newProofOfWork.trim()) {
      const formattedUrl = formatUrl(newProofOfWork.trim());
      if (!formData.proofOfWorkUrls.includes(formattedUrl)) {
        setFormData(prev => ({
          ...prev,
          proofOfWorkUrls: [...prev.proofOfWorkUrls, formattedUrl]
        }));
        setNewProofOfWork('');
      }
    }
  };

  const removeProofOfWork = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      proofOfWorkUrls: prev.proofOfWorkUrls.filter(url => url !== urlToRemove)
    }));
  };

  const toggleAvailableDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Photo must be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setMessage('Please upload a JPEG, PNG, or WebP image');
        return;
      }

      setSelectedPhotoFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;

    setUploadingPhoto(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);

      const response = await fetch('/api/student/upload-photo', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        console.error('Failed to upload photo');
        return null;
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setSelectedPhotoFile(null);
    setPreviewPhotoUrl('');
    setFormData(prev => ({ ...prev, profilePhotoUrl: '' }));
  };

  const savePhoto = async () => {
    if (!selectedPhotoFile && !formData.profilePhotoUrl) return;

    setSavingPhoto(true);
    setMessage('');

    let photoUrl = formData.profilePhotoUrl;

    // Upload photo if selected
    if (selectedPhotoFile) {
      const uploadedUrl = await uploadPhoto(selectedPhotoFile);
      if (uploadedUrl) {
        photoUrl = uploadedUrl;
        setSelectedPhotoFile(null); // Clear the file after successful upload
      } else {
        setMessage('Failed to upload photo');
        setSavingPhoto(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, profilePhotoUrl: photoUrl })
      });

      if (response.ok) {
        setMessage('Profile photo updated successfully!');
        setFormData(prev => ({ ...prev, profilePhotoUrl: photoUrl }));
      } else {
        setMessage('Failed to update profile photo');
      }
    } catch (error) {
      console.error('Failed to save photo:', error);
      setMessage('Failed to save profile photo');
    } finally {
      setSavingPhoto(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    let finalFormData = { ...formData };

    // Upload photo if selected
    if (selectedPhotoFile) {
      const photoUrl = await uploadPhoto(selectedPhotoFile);
      if (photoUrl) {
        finalFormData.profilePhotoUrl = photoUrl;
        setSelectedPhotoFile(null); // Clear the file after successful upload
      } else {
        setMessage('Failed to upload photo, but saving other changes...');
      }
    }

    console.log('Submitting profile data:', finalFormData);

    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalFormData)
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        // Refetch profile data
        const updatedResponse = await fetch('/api/student/me');
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setProfile(data.data.profile);
        }
      } else {
        const errorData = await response.json();
        console.error('Profile update failed:', errorData);
        console.error('Response status:', response.status);
        setMessage(errorData.error || 'Failed to update profile');
        if (errorData.details) {
          console.error('Error details:', errorData.details);
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilitySlotsChange = useCallback((slots: AvailabilitySlot[]) => {
    setFormData(prev => ({ ...prev, availabilitySlots: slots }));
  }, []);

  const handleTimezoneChange = useCallback((timezone: string) => {
    setFormData(prev => ({ ...prev, timezone }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
          <p className="mt-2 text-gray-600">
            Complete your profile to help business owners understand your skills and experience.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-6">
                {/* Photo Preview */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                    {previewPhotoUrl ? (
                      <img
                        src={previewPhotoUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Upload a professional photo to help business owners recognize you.
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG or WebP. Max size 5MB.
                    </p>
                    <div className="flex space-x-2 mt-4">
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoSelect}
                          className="hidden"
                          disabled={uploadingPhoto || savingPhoto}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('photo-upload')?.click();
                          }}
                          disabled={uploadingPhoto || savingPhoto}
                        >
                          {uploadingPhoto ? 'Uploading...' : 'Choose Photo'}
                        </Button>
                      </label>
                      {previewPhotoUrl && (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removePhoto}
                            className="text-red-600 hover:text-red-700"
                            disabled={savingPhoto}
                          >
                            Remove
                          </Button>
                          {selectedPhotoFile && (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={savePhoto}
                              disabled={savingPhoto}
                            >
                              {savingPhoto ? 'Saving...' : 'Save Photo'}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Basic Information</span>
                {!showPasswordChange && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPasswordChange(true)}
                  >
                    <KeyIcon className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Major
                  </label>
                  <input
                    type="text"
                    value={profile?.major || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Year
                  </label>
                  <input
                    type="text"
                    value={profile?.year || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                  maxLength={1000}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.bio.length}/1000 characters
                </p>
              </div>

              {/* Password Change Section */}
              {showPasswordChange && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter new password (minimum 8 characters)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handlePasswordChange}
                        loading={changingPassword}
                        disabled={changingPassword}
                      >
                        {changingPassword ? 'Changing...' : 'Change Password'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="LinkedIn URL"
                  type="text"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  onBlur={() => handleUrlBlur('linkedinUrl')}
                  placeholder="linkedin.com/in/yourprofile"
                />

                <Input
                  label="GitHub URL"
                  type="text"
                  value={formData.githubUrl}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  onBlur={() => handleUrlBlur('githubUrl')}
                  placeholder="github.com/yourusername"
                />

                <Input
                  label="Personal Website URL"
                  type="text"
                  value={formData.personalWebsiteUrl}
                  onChange={(e) => handleInputChange('personalWebsiteUrl', e.target.value)}
                  onBlur={() => handleUrlBlur('personalWebsiteUrl')}
                  placeholder="yourwebsite.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Add a skill (e.g., Python, Machine Learning)"
                      list="skills-list"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <datalist id="skills-list">
                      {SKILL_TAGS.map((skill) => (
                        <option key={skill} value={skill} />
                      ))}
                    </datalist>
                  </div>
                  <Button type="button" onClick={addSkill} variant="outline">
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-600 hover:bg-primary-200 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proof of Work */}
          <Card>
            <CardHeader>
              <CardTitle>Proof of Work Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={newProofOfWork}
                    onChange={(e) => setNewProofOfWork(e.target.value)}
                    placeholder="github.com/yourproject or yourportfolio.com"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProofOfWork())}
                  />
                  <Button type="button" onClick={addProofOfWork} variant="outline">
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.proofOfWorkUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <a
                        href={formatUrl(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate flex-1 mr-2"
                      >
                        {url}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeProofOfWork(url)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meeting Availability */}
          <Card>
            <CardHeader className="pb-6">
              <div
                className="flex items-center justify-between cursor-pointer py-2"
                onClick={() => setAvailabilityExpanded(!availabilityExpanded)}
              >
                <div className="flex-1 pr-4">
                  <CardTitle className="mb-2">Meeting Availability</CardTitle>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Set your flexible availability - different time ranges for different days
                  </p>
                </div>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {availabilityExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </CardHeader>
            {availabilityExpanded && (
              <CardContent>
                <WeeklyAvailability
                  slots={formData.availabilitySlots}
                  onChange={handleAvailabilitySlotsChange}
                  timezone={formData.timezone}
                  onTimezoneChange={handleTimezoneChange}
                />
              </CardContent>
            )}
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" loading={saving} size="lg">
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 