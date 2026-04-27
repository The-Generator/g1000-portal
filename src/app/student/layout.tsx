'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { User } from '@/types';
import GeneratorLogo from '@/components/GeneratorLogo';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface StudentLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: '🏠' },
  { name: 'Opportunities', href: '/student/opportunities', icon: '🔍' },
  { name: 'My Applications', href: '/student/applications', icon: '📋' },
  { name: 'Projects', href: '/student/projects', icon: '💼' },
  { name: 'Interviews', href: '/student/interviews', icon: '📅' },
  { name: 'Resources', href: '/student/resources', icon: '📚' },
  { name: 'Profile', href: '/student/profile', icon: '👤' },
];

export default function StudentLayout({ children }: StudentLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }

        const userData = await response.json();
        if (userData.data.role !== 'student') {
          router.push('/login');
          return;
        }

        setUser(userData.data);

        // Fetch student profile to get profile photo
        try {
          const profileResponse = await fetch('/api/student/me');
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.data?.profile?.profilePhotoUrl) {
              setProfilePhotoUrl(profileData.data.profile.profilePhotoUrl);
            }
          }
        } catch (profileError) {
          console.error('Failed to fetch profile photo:', profileError);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Main Navigation Header - Logo and User Actions Only */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/student/dashboard" className="flex items-center space-x-3">
                <GeneratorLogo height={48} />
                <div className="h-10 w-px bg-gray-300"></div>
                <span className="text-xl font-semibold text-generator-dark">G1000 Portal</span>
              </Link>
            </div>

            {/* Right side - User Actions */}
            <div className="hidden lg:flex lg:items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt={user?.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-generator-green/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-generator-dark">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm font-semibold text-black">
                  {user?.name}
                </span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <Button
                variant="ghost"
                onClick={() => setShowLogoutModal(true)}
                className="hover:bg-red-50 hover:text-red-600 transition-colors -mr-5"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 p-2 rounded-md -mr-2"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation Bar - Menu Items */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-white text-generator-dark shadow-sm border-gray-200'
                      : 'text-gray-600 hover:text-generator-dark hover:bg-white/70 border-transparent'
                  } inline-flex items-center px-5 py-3 border text-sm font-medium transition-all duration-200 rounded-lg`}
                >
                  <span className="mr-2.5 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="pt-3 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-generator-green/10 border-generator-green text-generator-dark'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  } block mx-3 pl-4 pr-4 py-3 border-l-4 text-base font-medium rounded-r-lg transition-all duration-200`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
            <div className="border-t border-gray-200 mx-3 mt-3 pt-3">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt={user?.name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-generator-green/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-generator-dark">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Welcome back,</span>
                    <span className="text-sm font-semibold text-black">
                      {user?.name}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLogoutModal(true)}
                  className="hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">Confirm Logout</h3>
                </div>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? You'll need to sign in again to access your account.
              </p>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmLogout}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Yes, Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 