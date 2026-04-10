'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface DebugInfo {
  email?: string;
  emailLength?: number;
  hasEmail?: boolean;
  emailError?: string;
  isValidEmail?: boolean;
  buttonShouldBeEnabled?: boolean;
  endsWithBabson?: boolean;
  includesAt?: boolean;
  apiResponse?: {
    status: number;
    ok: boolean;
    data: any;
  };
  apiError?: any;
}

export default function DebugLogin() {
  const [email, setEmail] = useState('');
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Please enter a valid email';
    if (!email.toLowerCase().endsWith('@babson.edu')) {
      return 'Please use your @babson.edu email address';
    }
    return '';
  };

  const updateDebugInfo = (email: string) => {
    const emailError = validateEmail(email);
    const hasEmail = !!email;
    const isValidEmail = !emailError;
    const buttonShouldBeEnabled = hasEmail && isValidEmail;

    setDebugInfo({
      email,
      emailLength: email.length,
      hasEmail,
      emailError,
      isValidEmail,
      buttonShouldBeEnabled,
      endsWithBabson: email.toLowerCase().endsWith('@babson.edu'),
      includesAt: email.includes('@')
    });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    updateDebugInfo(newEmail);
  };

  const testLoginAPI = async () => {
    if (!email) return;

    try {
      const response = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      setDebugInfo((prev: DebugInfo) => ({
        ...prev,
        apiResponse: {
          status: response.status,
          ok: response.ok,
          data
        }
      }));
    } catch (error) {
      setDebugInfo((prev: DebugInfo) => ({
        ...prev,
        apiError: error
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🐛 Login Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Input
                label="Test Email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="student1@babson.edu"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                disabled={!email}
                onClick={() => updateDebugInfo(email)}
                variant="outline"
              >
                🔍 Check Validation
              </Button>
              
              <Button
                disabled={!email || !!validateEmail(email)}
                onClick={testLoginAPI}
              >
                🧪 Test API Call
              </Button>
            </div>

            {/* Debug Information */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Debug Information:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Email:</strong> "{debugInfo.email}"
                </div>
                <div>
                  <strong>Email Length:</strong> {debugInfo.emailLength}
                </div>
                <div>
                  <strong>Has Email:</strong> {debugInfo.hasEmail ? '✅ Yes' : '❌ No'}
                </div>
                <div>
                  <strong>Includes @:</strong> {debugInfo.includesAt ? '✅ Yes' : '❌ No'}
                </div>
                <div>
                  <strong>Ends with @babson.edu:</strong> {debugInfo.endsWithBabson ? '✅ Yes' : '❌ No'}
                </div>
                <div>
                  <strong>Email Error:</strong> {debugInfo.emailError || '✅ None'}
                </div>
                <div>
                  <strong>Is Valid Email:</strong> {debugInfo.isValidEmail ? '✅ Yes' : '❌ No'}
                </div>
                <div className="font-semibold">
                  <strong>Button Should Be Enabled:</strong> {debugInfo.buttonShouldBeEnabled ? '✅ Yes' : '❌ No'}
                </div>
              </div>
            </div>

            {/* API Response */}
            {debugInfo.apiResponse && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">API Response:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo.apiResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* API Error */}
            {debugInfo.apiError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">API Error:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo.apiError, null, 2)}
                </pre>
              </div>
            )}

            {/* Test Emails */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Available Test Emails:</h3>
              <div className="space-y-1 text-sm">
                {[
                  'student1@babson.edu',
                  'student2@babson.edu',
                  'student3@babson.edu',
                  'student4@babson.edu',
                  'student5@babson.edu'
                ].map(testEmail => (
                  <button
                    key={testEmail}
                    onClick={() => {
                      setEmail(testEmail);
                      updateDebugInfo(testEmail);
                    }}
                    className="block w-full text-left px-2 py-1 hover:bg-green-100 rounded"
                  >
                    {testEmail}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => window.open('/login', '_blank')}
              >
                🔗 Open Real Login Page
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('/test-supabase', '_blank')}
              >
                🧪 Test Database Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 