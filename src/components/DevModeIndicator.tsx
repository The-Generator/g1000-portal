'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WrenchScrewdriverIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DevModeIndicator = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <div className="bg-yellow-500 text-black p-4 rounded-lg shadow-lg border-2 border-yellow-600 min-w-64">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
              <span className="font-bold">🔧 Dev Mode Active</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-yellow-600 rounded"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-sm mb-3">
            <p className="mb-2">Authentication bypassed</p>
            <p className="text-xs">Role auto-assigned based on route</p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Link 
              href="/business/dashboard"
              className="px-3 py-1 bg-black text-yellow-500 rounded text-sm hover:bg-gray-800 transition-colors"
            >
              Business Portal →
            </Link>
            <Link 
              href="/student/dashboard"
              className="px-3 py-1 bg-black text-yellow-500 rounded text-sm hover:bg-gray-800 transition-colors"
            >
              Student Portal →
            </Link>
            <Link 
              href="/"
              className="px-3 py-1 bg-black text-yellow-500 rounded text-sm hover:bg-gray-800 transition-colors"
            >
              Home →
            </Link>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-yellow-500 text-black p-3 rounded-full shadow-lg border-2 border-yellow-600 hover:bg-yellow-400 transition-all transform hover:scale-105"
          title="Dev Mode Active - Click for quick nav"
        >
          <WrenchScrewdriverIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default DevModeIndicator; 