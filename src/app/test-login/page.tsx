'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TestLoginPage() {
  const [email, setEmail] = useState('john@techcorp.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('Attempting login with:', { email, password });
      
      const response = await fetch('/api/auth/login/owner', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      setResult({
        status: response.status,
        statusText: response.statusText,
        data: data,
        success: response.ok
      });

    } catch (error) {
      console.error('Login error:', error);
      setResult({
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const testCases = [
    { email: 'john@techcorp.com', password: 'password123', name: 'John Smith (TechCorp)' },
    { email: 'sarah@healthplus.com', password: 'password123', name: 'Sarah Johnson (HealthPlus)' },
    { email: 'mike@greenfinance.com', password: 'password123', name: 'Mike Chen (Green Finance)' },
    { email: 'lisa@retailtech.com', password: 'password123', name: 'Lisa Rodriguez (RetailTech - Not Approved)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Business Owner Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Debug login issues with mock business owners
          </p>
        </div>

        <div className="space-y-6">
          {/* Quick Test Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Test Accounts</CardTitle>
              <CardDescription>
                Click to test each mock business owner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {testCases.map((testCase, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      setEmail(testCase.email);
                      setPassword(testCase.password);
                    }}
                    variant="outline"
                    className="justify-start text-left"
                  >
                    <div>
                      <div className="font-medium">{testCase.name}</div>
                      <div className="text-sm text-gray-500">{testCase.email}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Manual Test Form */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Test</CardTitle>
              <CardDescription>
                Test login with custom credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="business@company.com"
                />
                
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                />
                
                <Button
                  onClick={testLogin}
                  loading={loading}
                  className="w-full"
                >
                  Test Login
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className={result.success ? 'text-green-600' : 'text-red-600'}>
                  {result.success ? '✅ Login Success' : '❌ Login Failed'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Status:</strong> {result.status} {result.statusText}
                  </div>
                  
                  {result.data && (
                    <div className="text-sm">
                      <strong>Response:</strong>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-sm text-red-600">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Debugging Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>1.</strong> First run the debug SQL script in Supabase to check if business owners exist</p>
                <p><strong>2.</strong> Open browser developer tools (F12) and check the Network tab</p>
                <p><strong>3.</strong> Try logging in and look for the API request to <code>/api/auth/login/owner</code></p>
                <p><strong>4.</strong> Check for any error messages in the Console tab</p>
                <p><strong>5.</strong> Verify the response shows the exact error message</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 