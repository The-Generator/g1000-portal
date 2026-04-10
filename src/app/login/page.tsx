'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AcademicCapIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import GeneratorLogo from '@/components/GeneratorLogo';
import toast from 'react-hot-toast';

export default function StudentLoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<'password' | 'code'>('password');
  const [step, setStep] = useState<'email' | 'code' | 'create-password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    code?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [mounted, setMounted] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Please enter a valid email';
    if (!email.toLowerCase().endsWith('@babson.edu')) {
      return 'Please use your @babson.edu email address';
    }
    return '';
  };

  const validateCode = (code: string) => {
    if (!code) return 'Verification code is required';
    if (code.length !== 6) return 'Verification code must be 6 digits';
    if (!/^\d{6}$/.test(code)) return 'Verification code must contain only numbers';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const checkUserStatus = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setHasPassword(data.hasPassword);
        if (!data.hasPassword) {
          // First time user - send verification code
          await handleRequestCode();
        } else {
          // User has password - stop loading and show password field
          setLoading(false);
        }
      } else {
        // User doesn't exist - treat as first-time
        setHasPassword(false);
        await handleRequestCode();
      }
    } catch {
      setErrors({ email: 'Network error. Please try again.' });
      setLoading(false);
    }
  };

  const handleRequestCode = async () => {
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('code');
        setAuthMethod('code');
        setResendCooldown(60);
        if (mounted) {
          toast.success('Verification code sent to your email!');
        }
      } else {
        if (response.status === 404) {
          setErrors({ email: 'Email not found. Please make sure you are registered for G1000.' });
        } else {
          setErrors({ email: data.error || 'Failed to send verification code' });
        }
      }
    } catch {
      setErrors({ email: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (mounted) {
          toast.success('Welcome back!');
        }
        // Use window.location for a full page navigation to ensure cookies are properly set
        setTimeout(() => {
          window.location.href = '/student/dashboard';
        }, 500);
      } else {
        if (response.status === 401) {
          setErrors({ password: 'Invalid email or password' });
        } else if (response.status === 404) {
          // User hasn't set password yet
          setHasPassword(false);
          setAuthMethod('code');
          await handleRequestCode();
        } else {
          setErrors({ password: data.error || 'Login failed' });
        }
      }
    } catch {
      setErrors({ password: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const codeError = validateCode(code);
    if (codeError) {
      setErrors({ code: codeError });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user needs to create a password
        if (!data.hasPassword) {
          setStep('create-password');
        } else {
          if (mounted) {
            toast.success('Welcome to G1000 Portal!');
          }
          // Use window.location for a full page navigation to ensure cookies are properly set
          setTimeout(() => {
            window.location.href = '/student/dashboard';
          }, 500);
        }
      } else {
        setErrors({ code: data.error || 'Invalid verification code' });
      }
    } catch {
      setErrors({ code: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (mounted) {
          toast.success('Password created successfully!');
        }
        // Use window.location for a full page navigation to ensure cookies are properly set
        setTimeout(() => {
          window.location.href = '/student/dashboard';
        }, 500);
      } else {
        setErrors({ password: data.error || 'Failed to create password' });
      }
    } catch {
      setErrors({ password: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasPassword === null) {
      await checkUserStatus();
    } else if (hasPassword) {
      await handlePasswordLogin(e);
    } else {
      await handleRequestCode();
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setCode('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setAuthMethod('password');
    setHasPassword(null);
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#789b4a] rounded-xl flex items-center justify-center">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-generator-dark">
            Student Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Loading...
          </p>
        </div>
      </div>
    );
  }

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
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-generator-dark">
            Student Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'create-password'
              ? 'Create your password'
              : 'Sign in with your Babson email address'
            }
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="shadow-soft border-gray-100">
          <CardHeader>
            <CardTitle>
              {step === 'email' && 'Enter Your Email'}
              {step === 'code' && 'Enter Verification Code'}
              {step === 'create-password' && 'Create Your Password'}
            </CardTitle>
            <CardDescription>
              {step === 'email' && (hasPassword ? 'Enter your password to sign in' : "We'll help you sign in")}
              {step === 'code' && `We sent a 6-digit code to ${email}`}
              {step === 'create-password' && 'Set up a password for future logins'}
            </CardDescription>
          </CardHeader>

          <CardContent>
{step === 'email' ? (
              <form onSubmit={handleSubmitEmail} className="space-y-6">
                <Input
                  label="Babson Email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setHasPassword(null); // Reset status when email changes
                  }}
                  placeholder="yourname@babson.edu"
                  error={errors.email}
                  required
                />

                {hasPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-error-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        error={errors.password}
                        required
                        className="pr-12"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={!email || (!!hasPassword && !password)}
                >
                  {hasPassword ? 'Sign In' : 'Continue'}
                </Button>

                {hasPassword && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('code');
                      handleRequestCode();
                    }}
                    className="w-full text-sm text-generator-green hover:text-generator-dark transition-colors"
                  >
                    Sign in with verification code instead
                  </button>
                )}
              </form>
            ) : step === 'code' ? (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <Input
                  label="Verification Code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  error={errors.code}
                  maxLength={6}
                  required
                />

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    loading={loading}
                    disabled={code.length !== 6}
                  >
                    Verify Code
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={handleBackToEmail}
                  >
                    Use Different Email
                  </Button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleRequestCode}
                    className={`w-full text-sm transition-colors ${
                      resendCooldown > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-generator-green hover:text-generator-dark cursor-pointer'
                    }`}
                  >
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : 'Resend verification code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreatePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password <span className="text-error-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      error={errors.password}
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Enter password again"
                      error={errors.confirmPassword}
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={!password || !confirmPassword}
                >
                  Create Password & Sign In
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Are you a business owner?{' '}
              <Link href="/business/login" className="font-medium text-generator-green hover:text-generator-dark transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}