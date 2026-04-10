'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRightIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  SparklesIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  StarIcon,
  CommandLineIcon,
  CpuChipIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import GeneratorLogo from '@/components/GeneratorLogo';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-generator-green/10 to-generator-gold/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-generator-dark/10 to-generator-green/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-generator-gold/10 to-generator-green/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-soft border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
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

            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="hidden sm:inline-flex"
                  icon={<AcademicCapIcon className="w-4 h-4" />}
                >
                  Student Login
                </Button>
              </Link>
              <Link href="/business/login">
                <Button
                  variant="ghost"
                  className="hidden sm:inline-flex"
                  icon={<BuildingOfficeIcon className="w-4 h-4" />}
                >
                  Business Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-[200px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-generator-dark">
            The G1000 Portal
            <span className="text-base md:text-lg font-normal text-gray-500 ml-2 align-super">(BETA)</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            This student-run networking platform enables small business owners to post AI projects/internship opportunities for Babson students. Babson College does not represent student services.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="xl"
                variant="outline"
                icon={<AcademicCapIcon className="w-5 h-5" />}
                className="group"
              >
                <span>I'm a Student</span>
                <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/business/login">
              <Button
                size="xl"
                variant="outline"
                icon={<BuildingOfficeIcon className="w-5 h-5" />}
                className="group"
              >
                <span>I'm a Business</span>
                <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-generator-dark">1</div>
              <div className="text-gray-600 mt-1">Bootcamp Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-generator-dark">50+</div>
              <div className="text-gray-600 mt-1">Current G1000 Alumni</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-generator-dark">1,000</div>
              <div className="text-gray-600 mt-1">Alumni Goal</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-generator-dark">5</div>
              <div className="text-gray-600 mt-1">Opportunities Delivered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Two Dashboards
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The portal offers two dashboards: one for students and one for small business owners.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Students */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#789b4a] rounded-xl flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Students</h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-generator-green mt-1 flex-shrink-0" />
                  <span className="ml-3 text-gray-700">Create your profile</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-generator-green mt-1 flex-shrink-0" />
                  <span className="ml-3 text-gray-700">Browse real-world AI projects</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-generator-green mt-1 flex-shrink-0" />
                  <span className="ml-3 text-gray-700">Apply for projects and internships</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-generator-green mt-1 flex-shrink-0" />
                  <span className="ml-3 text-gray-700">Gain practical experience</span>
                </li>
              </ul>
            </div>

            {/* For Businesses */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#789b4a] rounded-xl flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Business Owners</h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-generator-green mt-1 flex-shrink-0" />
                  <span className="ml-3 text-gray-700">Post your AI project needs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-generator-green mt-1 flex-shrink-0" />
                  <span className="ml-3 text-gray-700">Review qualified applications</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-generator-green mt-1 flex-shrink-0" />
                  <span className="ml-3 text-gray-700">Schedule meetings with students</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-generator-green mt-1 flex-shrink-0" />
                  <span className="ml-3 text-gray-700">Move your business forward</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">
              Eligibility
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Students */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#789b4a] rounded-xl flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Students</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Babson students log in with their babson.edu email to view and apply for posted opportunities.
                Students who have led a G1000 Bootcamp receive priority access when applying.
              </p>
            </div>

            {/* For Business Owners */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#789b4a] rounded-xl flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Business Owners</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Eligible to join if they&apos;ve attended a G1000 workshop or contributed to The Generator.
                Once signed up, they can easily post AI and automation opportunities for Babson students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <QuestionMarkCircleIcon className="w-6 h-6 mr-2" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800">
                    <span className="font-semibold">This is a BETA version.</span> If there are any issues, please contact Gavin Mestler.
                  </p>
                </div>

                <div className="flex items-start">
                  <PlayCircleIcon className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800">
                    <span className="font-semibold">Watch Tutorial:</span>
                    <a href="https://www.youtube.com/watch?v=xSMx84UMe7E" target="_blank" rel="noopener noreferrer" className="ml-1 hover:underline text-blue-700">
                      How to Use the G1000 Portal
                    </a>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 ml-7">
                  <div className="flex items-center text-amber-800">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium">Phone:</span>
                    <a href="tel:7606817000" className="ml-1 hover:underline">760-681-7000</a>
                  </div>

                  <div className="flex items-center text-amber-800">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium">Email:</span>
                    <a href="mailto:gmestler1@babson.edu" className="ml-1 hover:underline">gmestler1@babson.edu</a>
                  </div>
                </div>

                <p className="text-amber-700 text-sm ml-7 font-medium">
                  We will resolve any issues ASAP.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <GeneratorLogo height={36} />
              <div className="h-8 w-px bg-gray-700 mx-3"></div>
              <span className="text-lg font-medium text-white">G1000 Portal</span>
            </div>

            <div className="flex space-x-6">
              <a href="https://www.babson.edu/thegenerator/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">About</a>
              <a href="mailto:gmestler1@babson.edu" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2024 The Generator - Babson College. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}