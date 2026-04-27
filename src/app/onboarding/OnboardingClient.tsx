'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  AcademicCapIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import GeneratorLogo from '@/components/GeneratorLogo';

type Stage = 'choose' | 'business-form';

interface OnboardingClientProps {
  email: string;
  defaultName: string;
}

/**
 * Client UI for the onboarding role-picker. Two paths:
 *   - "Student" — any email can register. POSTs to
 *     /api/auth/onboarding and redirects to /student/dashboard.
 *   - "Business Owner" — opens an inline form for company / contact name,
 *     then POSTs and redirects to /business/dashboard.
 *
 * Errors from the API surface inline so a user can go back and pick
 * Business Owner without losing context.
 */
export default function OnboardingClient({
  email,
  defaultName,
}: OnboardingClientProps) {
  const [stage, setStage] = useState<Stage>('choose');
  const [error, setError] = useState('');
  const [submittingRole, setSubmittingRole] = useState<
    'student' | 'owner' | null
  >(null);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState(defaultName);

  async function submitOnboarding(payload: Record<string, unknown>) {
    const res = await fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let body: { data?: { redirect?: string }; error?: string } = {};
    try {
      body = await res.json();
    } catch {
      // Empty body — fall through to status check below.
    }

    if (!res.ok) {
      throw new Error(body.error || `Request failed (${res.status})`);
    }

    return body.data?.redirect ?? '/';
  }

  const handleSelectStudent = async () => {
    setError('');
    setSubmittingRole('student');
    try {
      const redirectTo = await submitOnboarding({ role: 'student' });
      window.location.href = redirectTo;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not finish onboarding';
      setError(message);
      setSubmittingRole(null);
    }
  };

  const handleChooseBusiness = () => {
    setError('');
    setStage('business-form');
  };

  const handleSubmitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }

    setSubmittingRole('owner');
    try {
      const redirectTo = await submitOnboarding({
        role: 'owner',
        companyName: companyName.trim(),
        contactName: contactName.trim(),
      });
      window.location.href = redirectTo;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not finish onboarding';
      setError(message);
      setSubmittingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Decorative background blobs (matches /login page) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-generator-green/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-generator-dark/5 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 rounded-full bg-generator-gold/5 blur-3xl" />
      </div>

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
            {stage === 'business-form' ? (
              <Button
                variant="ghost"
                icon={<ArrowLeftIcon className="w-4 h-4" />}
                onClick={() => {
                  setStage('choose');
                  setError('');
                }}
              >
                Back
              </Button>
            ) : (
              <Link href="/">
                <Button
                  variant="ghost"
                  icon={<ArrowLeftIcon className="w-4 h-4" />}
                >
                  Back to Home
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 mt-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#789b4a] rounded-xl flex items-center justify-center">
              <UserCircleIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-generator-dark">
            Welcome to G1000 Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tell us how you&rsquo;d like to use the portal.
            {email && (
              <>
                {' '}
                Signed in as{' '}
                <span className="font-medium text-gray-800">{email}</span>.
              </>
            )}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          {error && (
            <div
              role="alert"
              data-testid="onboarding-error"
              className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </div>
          )}

          {stage === 'choose' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={handleSelectStudent}
                disabled={submittingRole !== null}
                data-testid="role-student"
                className="group text-left rounded-3xl bg-white shadow-soft border border-gray-100 p-8 transition hover:border-generator-green/40 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-generator-green focus:ring-offset-2"
              >
                <div className="w-12 h-12 rounded-xl bg-generator-green/10 text-generator-green flex items-center justify-center mb-5">
                  <AcademicCapIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-generator-dark mb-2">
                  I&rsquo;m a Student
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Browse opportunities posted by business owners and apply for
                  projects that match your skills.
                </p>
                <p className="text-xs text-gray-500">
                  Open to all students.
                </p>
                <div className="mt-6 text-sm font-medium text-generator-green">
                  {submittingRole === 'student'
                    ? 'Setting you up…'
                    : 'Continue as Student →'}
                </div>
              </button>

              <button
                type="button"
                onClick={handleChooseBusiness}
                disabled={submittingRole !== null}
                data-testid="role-owner"
                className="group text-left rounded-3xl bg-white shadow-soft border border-gray-100 p-8 transition hover:border-generator-green/40 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-generator-green focus:ring-offset-2"
              >
                <div className="w-12 h-12 rounded-xl bg-generator-gold/10 text-generator-dark flex items-center justify-center mb-5">
                  <BriefcaseIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-generator-dark mb-2">
                  I&rsquo;m a Business Owner
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Post project opportunities and connect with talented Babson
                  students ready to help your business grow.
                </p>
                <p className="text-xs text-gray-500">
                  Open to any business owner.
                </p>
                <div className="mt-6 text-sm font-medium text-generator-green">
                  Continue as Business Owner →
                </div>
              </button>
            </div>
          ) : (
            <Card className="shadow-soft border-gray-100">
              <CardHeader>
                <CardTitle>Tell us about your business</CardTitle>
                <CardDescription>
                  These details appear on your business profile and help students
                  understand who they&rsquo;re working with.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitBusiness} className="space-y-6">
                  <Input
                    label="Company Name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Coffee Roasters"
                    required
                    data-testid="onboarding-company-name"
                  />
                  <Input
                    label="Contact Name"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your full name"
                    data-testid="onboarding-contact-name"
                  />
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setStage('choose');
                        setError('');
                      }}
                      disabled={submittingRole === 'owner'}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={submittingRole === 'owner'}
                      disabled={!companyName.trim()}
                      data-testid="onboarding-submit-owner"
                    >
                      Finish Setup
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
