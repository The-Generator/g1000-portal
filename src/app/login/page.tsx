'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import GeneratorLogo from '@/components/GeneratorLogo';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'register';

/**
 * Unified login page replacing the legacy /business/login, /admin/login, and
 * student-specific /login pages. Authentication goes through Supabase Auth
 * directly from the browser via @supabase/ssr's createBrowserClient. After a
 * successful sign-in, middleware (not this page) decides where to send the
 * user based on their role / onboarding status.
 */
function LoginForm() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const message = searchParams.get('message');
    if (message) toast.success(message);

    const errParam = searchParams.get('error');
    if (errParam) setError(errParam);

    const initialMode = searchParams.get('mode');
    if (initialMode === 'register') setMode('register');
  }, [mounted, searchParams]);

  const isRegister = mode === 'register';

  const handleGoogleSignIn = async () => {
    setError('');
    setInfo('');
    setGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) {
        setError(oauthError.message || 'Could not start Google sign-in');
        setGoogleLoading(false);
      }
      // On success the browser is redirected to Google, so we leave the
      // loading spinner up — there's no return path here.
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError('Network error starting Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Friendlier copy for the most common case.
        if (
          signInError.message.toLowerCase().includes('invalid login credentials')
        ) {
          setError('Invalid email or password.');
        } else {
          setError(signInError.message || 'Sign in failed');
        }
        return;
      }

      // Middleware handles role-based routing. Reload to /, which will be
      // redirected to onboarding or the role's dashboard automatically.
      toast.success('Welcome back!');
      window.location.href = '/';
    } catch (err) {
      console.error('Sign-in failed:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        const msg = signUpError.message?.toLowerCase() ?? '';
        if (
          msg.includes('already registered') ||
          msg.includes('already been registered') ||
          msg.includes('user already')
        ) {
          setError('An account with that email already exists. Try signing in.');
        } else if (msg.includes('invalid') && msg.includes('email')) {
          setError('That email address is invalid.');
        } else {
          setError(signUpError.message || 'Registration failed');
        }
        return;
      }

      // Supabase returns a user with no session if email confirmation is
      // required. In that case we cannot redirect — instruct the user.
      if (data.session) {
        toast.success('Account created!');
        window.location.href = '/';
      } else {
        setInfo(
          'Account created. Please check your email to confirm your address, then sign in.'
        );
        setMode('login');
      }
    } catch (err) {
      console.error('Sign-up failed:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#789b4a] rounded-xl flex items-center justify-center">
              <UserCircleIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-generator-dark">
            G1000 Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
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
            <Link href="/">
              <Button variant="ghost" icon={<ArrowLeftIcon className="w-4 h-4" />}>
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
              <UserCircleIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-generator-dark">
            Sign in to G1000 Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            One door for students, business owners, and admins
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="shadow-soft border-gray-100">
            <CardHeader>
              <div className="flex gap-2 mb-3" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isRegister}
                  data-testid="tab-signin"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setInfo('');
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    !isRegister
                      ? 'bg-generator-green text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isRegister}
                  data-testid="tab-register"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setInfo('');
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    isRegister
                      ? 'bg-generator-green text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Register
                </button>
              </div>
              <CardTitle>
                {isRegister ? 'Create your account' : 'Welcome back'}
              </CardTitle>
              <CardDescription>
                {isRegister
                  ? 'Sign up with Google or with your email and a password'
                  : 'Sign in with Google or with your email and password'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                type="button"
                variant="outline"
                className="w-full mb-6"
                loading={googleLoading}
                onClick={handleGoogleSignIn}
                data-testid="google-signin"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.7 2.5 2.4 6.8 2.4 12.1S6.7 21.7 12 21.7c6.9 0 9.5-4.8 9.5-7.3 0-.5-.1-.9-.1-1.3H12z"
                  />
                </svg>
                Sign in with Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">
                    or continue with email
                  </span>
                </div>
              </div>

              <form
                onSubmit={isRegister ? handleRegister : handleSignIn}
                className="space-y-6"
              >
                {error && (
                  <div
                    role="alert"
                    data-testid="login-error"
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
                  >
                    {error}
                  </div>
                )}

                {info && (
                  <div
                    role="status"
                    className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm"
                  >
                    {info}
                  </div>
                )}

                {isRegister && (
                  <Input
                    label="Full Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                )}

                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-error-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        isRegister ? 'At least 8 characters' : 'Enter your password'
                      }
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
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
                  disabled={!email || !password || (isRegister && !name)}
                  data-testid="submit-credentials"
                >
                  {isRegister ? 'Create Account' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(isRegister ? 'login' : 'register');
                  setError('');
                  setInfo('');
                }}
                className="font-medium text-generator-green hover:text-generator-dark transition-colors"
              >
                {isRegister ? 'Sign in' : 'Register'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#789b4a] rounded-xl flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-generator-dark">
              G1000 Portal
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
