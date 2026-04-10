'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  GlobeAltIcon,
  TagIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import GeneratorLogo from '@/components/GeneratorLogo';

interface BusinessProfile {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  websiteUrl?: string;
  industryTags: string[];
  description?: string;
  logoUrl?: string;
  linkedinUrl?: string;
  founded?: string;
  employeeCount?: string;
}

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Education',
  'Real Estate',
  'Hospitality',
  'Marketing',
  'Consulting',
  'E-commerce',
  'Non-profit',
  'Media',
  'Transportation',
  'Energy',
  'Construction',
  'Agriculture',
  'Legal',
  'Entertainment',
  'Other'
];

const EMPLOYEE_COUNT_OPTIONS = [
  '1-10',
  '11-50',
  '51-100',
  '101-500',
  '500+',
];

export default function BusinessProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [profile, setProfile] = useState<BusinessProfile>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    websiteUrl: '',
    industryTags: [],
    description: '',
    logoUrl: '',
    linkedinUrl: '',
    founded: '',
    employeeCount: '',
  });

  const [editedProfile, setEditedProfile] = useState<BusinessProfile>(profile);
  const [newIndustryTag, setNewIndustryTag] = useState('');

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/business/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setProfile(data.data);
          setEditedProfile(data.data);
        }
      } else if (response.status === 404) {
        // Profile doesn't exist yet, that's ok
        setEditMode(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalLogoUrl = editedProfile.logoUrl;

      // Upload logo first if there's a new one
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);

        const logoResponse = await fetch('/api/business/profile/logo', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (logoResponse.ok) {
          const logoData = await logoResponse.json();
          finalLogoUrl = logoData.logoUrl;
        } else {
          toast.error('Failed to upload logo');
        }
      }

      // Save profile with the logo URL
      const response = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...editedProfile,
          logoUrl: finalLogoUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setEditedProfile(data.data);
        setEditMode(false);
        setLogoFile(null);
        setLogoPreview(null);
        toast.success('Profile updated successfully');

        // Trigger a storage event to notify other tabs/windows
        window.localStorage.setItem('profileUpdated', Date.now().toString());
      } else {
        const errorData = await response.json();
        console.error('Profile update error:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setEditMode(false);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    // Set the file for upload on save
    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    toast('Logo will be saved when you click Save', {
      icon: '📸',
      duration: 3000,
    });
  };

  const addIndustryTag = () => {
    if (newIndustryTag && !editedProfile.industryTags.includes(newIndustryTag)) {
      setEditedProfile(prev => ({
        ...prev,
        industryTags: [...prev.industryTags, newIndustryTag]
      }));
      setNewIndustryTag('');
    }
  };

  const removeIndustryTag = (tag: string) => {
    setEditedProfile(prev => ({
      ...prev,
      industryTags: prev.industryTags.filter(t => t !== tag)
    }));
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

      const data = await response.json();

      if (response.ok) {
        toast.success('Password changed successfully');
        setShowPasswordChange(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswords({
          current: false,
          new: false,
          confirm: false
        });
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#789b4a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-generator-green/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-generator-dark/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-soft border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-generator-dark">
                Profile Settings
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/business/dashboard">
                <Button
                  variant="ghost"
                  icon={<ArrowLeftIcon className="w-4 h-4" />}
                >
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                {/* Logo Upload */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                    {(editMode && logoPreview) ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profile.logoUrl ? (
                      <img
                        src={profile.logoUrl}
                        alt={profile.companyName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  {editMode && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-generator-green text-white rounded-full p-2 shadow-lg hover:bg-generator-dark transition-colors"
                      >
                        <CameraIcon className="w-4 h-4" />
                      </button>
                      {logoPreview && (
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 text-xs">
                          New
                        </div>
                      )}
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                {/* Company Info */}
                <div className="flex-1">
                  {editMode ? (
                    <Input
                      value={editedProfile.companyName}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Company Name"
                      className="text-2xl font-bold mb-2"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">{profile.companyName || 'Company Name'}</h2>
                  )}
                  <p className="text-gray-600">{profile.contactName}</p>
                  <p className="text-gray-500 text-sm">{profile.email}</p>
                </div>
              </div>

              {/* Edit/Save Buttons */}
              <div className="flex items-center space-x-2">
                {editMode ? (
                  <>
                    <Button
                      onClick={handleSave}
                      loading={saving}
                      icon={<CheckIcon className="w-4 h-4" />}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleCancel}
                      icon={<XMarkIcon className="w-4 h-4" />}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setEditMode(true)}
                    variant="outline"
                    icon={<PencilIcon className="w-4 h-4" />}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <BuildingOfficeIcon className="w-4 h-4 inline mr-2" />
                  Company Name
                </label>
                {editMode ? (
                  <Input
                    value={editedProfile.companyName}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter company name"
                  />
                ) : (
                  <p className="text-gray-900">{profile.companyName || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                  Description
                </label>
                {editMode ? (
                  <Textarea
                    value={editedProfile.description}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your business"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-900">{profile.description || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                  Website
                </label>
                {editMode ? (
                  <Input
                    type="url"
                    value={editedProfile.websiteUrl}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="https://www.example.com"
                  />
                ) : (
                  profile.websiteUrl ? (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-generator-green hover:underline">
                      {profile.websiteUrl}
                    </a>
                  ) : (
                    <p className="text-gray-900">-</p>
                  )
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Founded
                </label>
                {editMode ? (
                  <Input
                    type="text"
                    value={editedProfile.founded}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, founded: e.target.value }))}
                    placeholder="e.g., 2020"
                  />
                ) : (
                  <p className="text-gray-900">{profile.founded || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Count
                </label>
                {editMode ? (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={editedProfile.employeeCount}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, employeeCount: e.target.value }))}
                  >
                    <option value="">Select employee count</option>
                    {EMPLOYEE_COUNT_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.employeeCount || '-'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  Contact Name
                </label>
                {editMode ? (
                  <Input
                    value={editedProfile.contactName}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Your name"
                  />
                ) : (
                  <p className="text-gray-900">{profile.contactName || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <p className="text-gray-900">{profile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <PhoneIcon className="w-4 h-4 inline mr-2" />
                  Phone
                </label>
                {editMode ? (
                  <Input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPinIcon className="w-4 h-4 inline mr-2" />
                  Address
                </label>
                {editMode ? (
                  <div className="space-y-2">
                    <Input
                      value={editedProfile.address}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Street address"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={editedProfile.city}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                      />
                      <Input
                        value={editedProfile.state}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                        maxLength={2}
                      />
                      <Input
                        value={editedProfile.zipCode}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="ZIP"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    {profile.address && <p className="text-gray-900">{profile.address}</p>}
                    {(profile.city || profile.state || profile.zipCode) && (
                      <p className="text-gray-900">
                        {[profile.city, profile.state, profile.zipCode].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {!profile.address && !profile.city && !profile.state && !profile.zipCode && (
                      <p className="text-gray-900">-</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Industry Tags */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                <TagIcon className="w-5 h-5 inline mr-2" />
                Industry Tags
              </CardTitle>
              <CardDescription>
                Select industries that best describe your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {editedProfile.industryTags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-generator-green/10 text-generator-green border border-generator-green/20"
                      >
                        {tag}
                        <button
                          onClick={() => removeIndustryTag(tag)}
                          className="ml-2 hover:text-red-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={newIndustryTag}
                      onChange={(e) => setNewIndustryTag(e.target.value)}
                    >
                      <option value="">Select an industry...</option>
                      {INDUSTRY_OPTIONS.filter(opt => !editedProfile.industryTags.includes(opt)).map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      onClick={addIndustryTag}
                      disabled={!newIndustryTag}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.industryTags.length > 0 ? (
                    profile.industryTags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-generator-green/10 text-generator-green border border-generator-green/20"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No industries selected</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change Section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <LockClosedIcon className="w-5 h-5 mr-2" />
                  Security Settings
                </span>
                {!showPasswordChange && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordChange(true)}
                  >
                    <KeyIcon className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Manage your account security and password
              </CardDescription>
            </CardHeader>
            {showPasswordChange && (
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter your current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.current ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter your new password (min 8 characters)"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm your new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handlePasswordChange}
                    loading={changingPassword}
                    disabled={changingPassword}
                  >
                    Update Password
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
                      setShowPasswords({
                        current: false,
                        new: false,
                        confirm: false
                      });
                    }}
                    disabled={changingPassword}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            )}
            {!showPasswordChange && (
              <CardContent>
                <p className="text-sm text-gray-600">
                  Keep your account secure by using a strong, unique password.
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}