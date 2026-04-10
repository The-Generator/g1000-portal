'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AcademicCapIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import GeneratorLogo from '@/components/GeneratorLogo';

export default function StudentComingSoonPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-soft border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <GeneratorLogo height={48} />
                <div className="h-10 w-px bg-gray-300"></div>
                <h1 className="text-xl font-semibold text-generator-dark">
                  G1000 Portal
                </h1>
              </Link>
            </div>
            
            <Button 
              variant="ghost"
              onClick={() => router.push('/')}
              icon={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-generator-green to-generator-dark rounded-full flex items-center justify-center mx-auto">
              <AcademicCapIcon className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-generator-dark">
            Babson Student Access
          </h1>
          
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">
            Coming Soon
          </h2>

          <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
            Please fill out this short form to get priority for joining the platform.
          </p>

          <div className="space-y-4">
            <style jsx>{`
              @keyframes greenGlow {
                0%, 100% {
                  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3);
                }
                50% {
                  box-shadow: 0 0 30px rgba(16, 185, 129, 0.7), 0 0 60px rgba(16, 185, 129, 0.5);
                }
              }
              .glow-button {
                animation: greenGlow 2s ease-in-out infinite;
              }
            `}</style>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSc-f6JBG3P4EoAZBAQdXxPthIS4hPT24sldcDB59MwJoLdDLQ/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
              className="glow-button inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white hover:bg-gray-50 text-generator-dark transition-colors duration-200 border border-generator-green"
            >
              Request Access
            </a>

            <div className="pt-4">
              <p className="text-sm text-gray-500">
                We'll notify you as soon as the platform is ready for Babson students.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">
            © 2024 The Generator - Babson College. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}