'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function SeedBusinessOwnersPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const mockBusinessOwners = [
    {
      email: 'john@techcorp.com',
      password: 'password123',
      name: 'John Smith',
      companyName: 'TechCorp Industries',
      industryTags: ['Technology', 'Software'],
      websiteUrl: 'https://techcorp.com',
      isApproved: true
    },
    {
      email: 'sarah@healthplus.com',
      password: 'password123',
      name: 'Sarah Johnson',
      companyName: 'HealthPlus Solutions',
      industryTags: ['Healthcare', 'Digital Health'],
      websiteUrl: 'https://healthplus.com',
      isApproved: true
    },
    {
      email: 'mike@greenfinance.com',
      password: 'password123',
      name: 'Mike Chen',
      companyName: 'Green Finance Partners',
      industryTags: ['Finance', 'Sustainability'],
      websiteUrl: 'https://greenfinance.com',
      isApproved: true
    },
    {
      email: 'lisa@retailtech.com',
      password: 'password123',
      name: 'Lisa Rodriguez',
      companyName: 'RetailTech Innovations',
      industryTags: ['Retail', 'E-commerce'],
      websiteUrl: 'https://retailtech.com',
      isApproved: false // This one needs approval
    }
  ];

  const seedDatabase = async () => {
    setLoading(true);
    setResults([]);
    
    for (const owner of mockBusinessOwners) {
      try {
        const response = await fetch('/api/seed/business-owners', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(owner),
        });

        const data = await response.json();
        
        if (response.ok) {
          setResults(prev => [...prev, `✅ Created: ${owner.email} (${owner.companyName})`]);
        } else {
          setResults(prev => [...prev, `❌ Failed: ${owner.email} - ${data.error}`]);
        }
      } catch (error) {
        setResults(prev => [...prev, `❌ Error: ${owner.email} - Network error`]);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seed Business Owners</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add mock business owners to the database for testing
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mock Business Owners</CardTitle>
            <CardDescription>
              This will create the following test accounts:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBusinessOwners.map((owner, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{owner.companyName}</h3>
                      <p className="text-sm text-gray-600">{owner.name}</p>
                      <p className="text-sm text-blue-600">{owner.email}</p>
                      <p className="text-xs text-gray-500">Password: {owner.password}</p>
                      <p className="text-xs text-gray-500">
                        Status: {owner.isApproved ? 'Pre-approved' : 'Needs approval'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-wrap gap-1">
                        {owner.industryTags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-6">
          <Button
            onClick={seedDatabase}
            loading={loading}
            disabled={loading}
            className="px-8 py-3"
          >
            {loading ? 'Creating Business Owners...' : 'Seed Database'}
          </Button>
        </div>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm font-mono ${
                      result.startsWith('✅')
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            After seeding, you can test login at{' '}
            <a href="/business/login" className="text-blue-600 hover:underline">
              /business/login
            </a>
          </p>
          <p className="mt-2">
            Note: The account with lisa@retailtech.com will need admin approval before login.
          </p>
        </div>
      </div>
    </div>
  );
} 