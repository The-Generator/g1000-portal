'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BuildingOfficeIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import GeneratorLogo from '@/components/GeneratorLogo';
import UnauthorizedBusinessModal from '@/components/UnauthorizedBusinessModal';

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    contactName: '',
    industry: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [unauthorizedData, setUnauthorizedData] = useState({
    email: '',
    businessName: '',
    contactName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          contactName: formData.contactName,
          industry: formData.industry,
          website: formData.website,
        }),
      });

      if (response.ok) {
        router.push('/business/login?message=Registration successful! Please sign in.');
      } else {
        const data = await response.json();

        // Check if it's an unauthorized email error
        if (response.status === 403 && data.error === 'UNAUTHORIZED_EMAIL') {
          setUnauthorizedData({
            email: data.email || formData.email,
            businessName: data.businessName || formData.businessName,
            contactName: data.contactName || formData.contactName
          });
          setShowUnauthorizedModal(true);
          setError('');
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-generator-green/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-generator-dark/5 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 rounded-full bg-generator-gold/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-soft border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <Link href="/" className="flex items-center space-x-3">
              <GeneratorLogo height={48} />
              <div className="h-10 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-generator-dark">
                G1000 Portal
              </h1>
            </Link>
            <Link href="/">
              <Button
                variant="ghost"
                icon={<ArrowLeftIcon className="w-4 h-4" />}
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 mt-16">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#789b4a] rounded-xl flex items-center justify-center">
              <BuildingOfficeIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-generator-dark">
            Business Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the G1000 network and connect with talented AI students
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="shadow-soft border-gray-100">
          <CardHeader>
            <CardTitle>Register Your Business</CardTitle>
            <CardDescription>
              Create your business account to start posting opportunities
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Business Information */}
                <div className="space-y-4">
                  <Input
                    label="Business Name"
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Your Business Name"
                    required
                  />

                  <Input
                    label="Contact Name"
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Your Full Name"
                    required
                  />

                  <Input
                    label="Business Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="business@company.com"
                    required
                  />

                  <Input
                    label="Industry"
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g., Healthcare, Finance, Retail"
                  />

                  <Input
                    label="Website"
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://your-website.com"
                  />
                </div>

                {/* Password Section with Divider */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-error-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-error-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password strength indicator */}
                  {formData.password && (
                    <div className="text-xs text-gray-500 mt-1">
                      Password should be at least 8 characters long
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!formData.email || !formData.password || !formData.businessName || !formData.contactName}
              >
                Create Business Account
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link href="/business/login" className="font-medium text-generator-green hover:text-generator-dark transition-colors">
                  Sign in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Are you a student?{' '}
            <Link href="/login" className="font-medium text-generator-green hover:text-generator-dark transition-colors">
              Student portal
            </Link>
          </p>
        </div>
        </div>
      </div>

      {/* Unauthorized Business Modal */}
      <UnauthorizedBusinessModal
        isOpen={showUnauthorizedModal}
        onClose={() => setShowUnauthorizedModal(false)}
        email={unauthorizedData.email}
        businessName={unauthorizedData.businessName}
        contactName={unauthorizedData.contactName}
      />
    </div>
  );
} 