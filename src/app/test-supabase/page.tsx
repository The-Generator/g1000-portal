'use client';

import { useState } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Not tested');
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing connection...');
    setDetails(null);

    try {
      // Test 1: Basic connection
      setStatus('✅ Step 1: Supabase client initialized');
      
      // Test 2: Check if tables exist
      setStatus('🔍 Step 2: Checking database tables...');
      
      const { data: tables, error: tablesError } = await supabase
        .from('g1000_participants')
        .select('count(*)')
        .limit(1);

      if (tablesError) {
        if (tablesError.message.includes('relation "g1000_participants" does not exist')) {
          setStatus('❌ Database tables not found. Need to run schema setup.');
          setDetails({ 
            error: 'Tables not created yet. Follow the setup instructions below.',
            needsSetup: true 
          });
          return;
        } else {
          setStatus(`❌ Database error: ${tablesError.message}`);
          setDetails({ error: tablesError });
          return;
        }
      }

      // Test 3: Check for sample data
      setStatus('📊 Step 3: Checking for sample data...');
      
      const { data: participants, error: participantsError } = await supabase
        .from('g1000_participants')
        .select('email, name')
        .limit(5);

      if (participantsError) {
        setStatus(`❌ Error fetching participants: ${participantsError.message}`);
        setDetails({ error: participantsError });
        return;
      }

      if (!participants || participants.length === 0) {
        setStatus('⚠️ Connection successful but no student data found.');
        setDetails({ 
          message: 'Database is connected but empty. You need to add student emails to g1000_participants table.',
          nextStep: 'Add student emails to the database',
          needsData: true
        });
        return;
      }

      // Success!
      setStatus('✅ All tests passed! Supabase is fully connected and configured.');
      setDetails({
        participants: participants,
        count: participants.length,
        message: 'Ready to test login with these emails'
      });

    } catch (err: any) {
      setStatus(`❌ Connection error: ${err.message}`);
      setDetails({ error: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🧪 Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Connection */}
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-sm font-medium">Current Status:</p>
              <p className="text-sm mt-1">{status}</p>
            </div>
            
            <Button 
              onClick={testConnection} 
              loading={loading}
              className="w-full"
            >
              🔍 Test Supabase Connection
            </Button>

            {/* Setup Instructions */}
            {details?.needsSetup && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-lg mb-3">📋 Database Setup Required</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your Supabase connection works, but the database tables need to be created.
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Setup Instructions:</h4>
                  <ol className="text-sm space-y-1 text-gray-600 list-decimal list-inside">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Click "SQL Editor" in the left sidebar</li>
                    <li>Click "New query"</li>
                    <li>Copy the SQL script from <code>setup-database-fixed.sql</code> file</li>
                    <li>Paste it into the SQL editor and click "Run"</li>
                    <li>Come back here and test the connection again</li>
                  </ol>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => window.open('https://supabase.com/dashboard/projects', '_blank')}
                    >
                      🔗 Open Supabase Dashboard
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/'}
                    >
                      🏠 Back to Home
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
            {details?.participants && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-lg mb-2">✅ Database Ready!</h3>
                <p className="text-sm text-green-700 mb-3">
                  Found {details.count} student email(s) in database. You can now test login!
                </p>
                <div className="space-y-1">
                  {details.participants.map((p: any, i: number) => (
                    <div key={i} className="bg-white px-3 py-2 rounded text-sm">
                      <strong>{p.email}</strong> - {p.name}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => window.open('/login', '_blank')}
                  >
                    🎓 Test Student Login
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                  >
                    🏠 Back to Home
                  </Button>
                </div>
              </div>
            )}

            {/* Error State */}
            {details?.error && !details?.needsSetup && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-lg mb-2">❌ Connection Error</h3>
                <p className="text-sm text-red-700 mb-2">
                  There was an error connecting to your Supabase database:
                </p>
                <pre className="text-xs bg-red-100 p-2 rounded overflow-auto">
                  {JSON.stringify(details.error, null, 2)}
                </pre>
                <p className="text-sm text-red-600 mt-2">
                  Please check your environment variables in .env.local
                </p>
              </div>
            )}

            {/* Need Data State */}
            {details?.needsData && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-lg mb-2">⚠️ Database Empty</h3>
                <p className="text-sm text-orange-700 mb-3">
                  Your database tables exist but no student emails are found. Add some student emails to test login.
                </p>
                <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-xs">
{`-- Add student emails in Supabase SQL Editor:
INSERT INTO g1000_participants (email, name, major, year) VALUES
  ('your.email@babson.edu', 'Your Name', 'Your Major', '2024');`}
                </div>
              </div>
            )}

            {/* Quick Reference */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🔍 Quick Reference</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <strong>Environment:</strong> <code>.env.local</code> with Supabase credentials</li>
                <li>• <strong>Database setup:</strong> <code>setup-database-fixed.sql</code> file</li>
                <li>• <strong>Test emails:</strong> student1@babson.edu, student2@babson.edu, etc.</li>
                <li>• <strong>Login flow:</strong> Enter @babson.edu email → Get verification code → Enter code</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 