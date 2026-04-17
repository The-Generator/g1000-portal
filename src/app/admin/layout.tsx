'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheckIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import GeneratorLogo from '@/components/GeneratorLogo';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignOutMenu, setShowSignOutMenu] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.sign-out-dropdown')) {
        setShowSignOutMenu(false);
      }
    };

    if (showSignOutMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSignOutMenu]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const userData = data.data;
        
        if (userData.role !== 'admin') {
          router.push('/admin/login');
          return;
        }
        
        setUser(userData);
        setLoading(false);
      } else if (response.status === 401) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't auto-kick on network errors just in case
      setLoading(false); 
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  // Don't show layout for auth pages
  const isAuthPage = pathname === '/admin/login';
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: 'Business Approvals',
      href: '/admin',
      icon: UsersIcon,
    },
    {
      name: 'Video Resources',
      href: '/admin/resources',
      icon: VideoCameraIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation - Logo and User Actions Only */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center space-x-3">
                <GeneratorLogo height={48} />
                <div className="h-10 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                  <span className="text-xl font-semibold text-generator-dark">Admin Portal</span>
                </div>
              </Link>
            </div>

            {/* Right side - Profile & Sign Out */}
            <div className="hidden lg:flex lg:items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Administrator
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-600">
                  <span className="font-semibold text-green-800 tracking-wider">AD</span>
                </div>
              </div>

              <div className="h-8 w-px bg-gray-300"></div>

              <div className="relative sign-out-dropdown">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSignOutMenu(!showSignOutMenu)}
                  className="text-gray-500 hover:text-gray-700 -mr-3"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                </Button>

                {showSignOutMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setShowSignOutMenu(!showSignOutMenu)}
                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 p-2 rounded-md -mr-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-white text-green-700 shadow-sm border-gray-200'
                      : 'text-gray-600 hover:text-green-700 hover:bg-white/70 border-transparent'
                  } inline-flex items-center px-5 py-3 border text-sm font-medium transition-all duration-200 rounded-lg`}
                >
                  <item.icon className="w-4 h-4 mr-2.5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showSignOutMenu && (
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
                      ? 'bg-green-50 border-green-600 text-green-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  } block mx-3 pl-4 pr-4 py-3 border-l-4 text-base font-medium rounded-r-lg transition-all duration-200`}
                  onClick={() => setShowSignOutMenu(false)}
                >
                  <item.icon className="w-4 h-4 mr-3 inline" />
                  {item.name}
                </Link>
              );
            })}
            <div className="border-t border-gray-200 mx-3 mt-3 pt-3">
              <button
                onClick={handleLogout}
                className="block w-full text-left mx-3 px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
