'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function SetupDatabase() {
  const [step, setStep] = useState(1);
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setLoading(true);
    setTestResult('Testing connection...');

    try {
      // Test if tables exist and have data
      const { data, error } = await supabase
        .from('g1000_participants')
        .select('email, name')
        .limit(5);

      if (error) {
        if (error.message.includes('relation "g1000_participants" does not exist')) {
          setTestResult('❌ Database not set up yet. Please follow the steps below.');
          setStep(2);
        } else {
          setTestResult(`❌ Database error: ${error.message}`);
        }
      } else if (data && data.length > 0) {
        setTestResult(`✅ Database is ready! Found ${data.length} student emails. You can now test login!`);
        setStep(4);
      } else {
        setTestResult('⚠️ Database tables exist but no student emails found. Add some emails first.');
        setStep(3);
      }
    } catch (err: any) {
      setTestResult(`❌ Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sqlScript = `-- G1000 Portal Database Setup Script
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'owner', 'admin');
CREATE TYPE compensation_type AS ENUM ('stipend', 'equity', 'credit');
CREATE TYPE project_status AS ENUM ('open', 'closed');
CREATE TYPE application_status AS ENUM ('submitted', 'underReview', 'interviewScheduled', 'accepted', 'rejected');

-- Users table (main user accounts)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- G1000 participants table (for verification) - THIS IS THE KEY TABLE FOR LOGIN
CREATE TABLE g1000_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    major VARCHAR(255) NOT NULL,
    year VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification codes table (temporary storage for email codes)
CREATE TABLE verification_codes (
    email VARCHAR(255) PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [Rest of the schema - see setup-database.sql file for complete script]

-- Insert sample student emails for testing
INSERT INTO g1000_participants (email, name, major, year) VALUES
  ('student1@babson.edu', 'Alice Johnson', 'Computer Science', '2025'),
  ('student2@babson.edu', 'Bob Smith', 'Business Analytics', '2024'),
  ('student3@babson.edu', 'Carol Davis', 'Information Technology', '2025'),
  ('student4@babson.edu', 'David Wilson', 'Data Science', '2024'),
  ('student5@babson.edu', 'Eva Brown', 'Digital Innovation', '2025');`;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🚀 G1000 Portal Database Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Step 1: Test Current Status */}
              <div className={`p-4 rounded-lg ${step === 1 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                <h3 className="font-semibold text-lg mb-2">Step 1: Test Current Database Status</h3>
                <p className="text-gray-600 mb-4">
                  First, let's check if your database is already set up.
                </p>
                <Button 
                  onClick={testDatabaseConnection} 
                  loading={loading}
                  className="mb-2"
                >
                  Test Database Connection
                </Button>
                {testResult && (
                  <div className="p-3 bg-gray-100 rounded mt-2">
                    <p className="text-sm">{testResult}</p>
                  </div>
                )}
              </div>

              {/* Step 2: Run SQL Script */}
              <div className={`p-4 rounded-lg ${step === 2 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}>
                <h3 className="font-semibold text-lg mb-2">Step 2: Set Up Database Tables</h3>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Copy the complete SQL script and run it in your Supabase dashboard:
                  </p>
                  <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Click "SQL Editor" in the left sidebar</li>
                    <li>Click "New query"</li>
                    <li>Copy the complete SQL from the <code>setup-database.sql</code> file</li>
                    <li>Paste it into the SQL editor</li>
                    <li>Click "Run" to execute</li>
                  </ol>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(sqlScript);
                        alert('SQL script copied to clipboard!');
                      }}
                    >
                      📋 Copy SQL Script
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.open('https://supabase.com/dashboard/projects', '_blank')}
                    >
                      🔗 Open Supabase Dashboard
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 3: Add Student Emails */}
              <div className={`p-4 rounded-lg ${step === 3 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                <h3 className="font-semibold text-lg mb-2">Step 3: Add Real Student Emails</h3>
                <p className="text-gray-600 mb-4">
                  Add your actual Babson student emails to the database. Run this in Supabase SQL Editor:
                </p>
                <div className="bg-gray-800 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
{`-- Add real student emails
INSERT INTO g1000_participants (email, name, major, year) VALUES
  ('your.email@babson.edu', 'Your Name', 'Your Major', '2024'),
  ('student2@babson.edu', 'Student Name 2', 'Their Major', '2025');
  -- Add more students as needed`}
                </div>
              </div>

              {/* Step 4: Test Login */}
              <div className={`p-4 rounded-lg ${step === 4 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                <h3 className="font-semibold text-lg mb-2">Step 4: Test Student Login</h3>
                <p className="text-gray-600 mb-4">
                  Now you can test the student login with the emails you added!
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => window.open('/login', '_blank')}
                  >
                    🎓 Test Student Login
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('/test-supabase', '_blank')}
                  >
                    🧪 Run Connection Test
                  </Button>
                </div>
              </div>

              {/* Quick Reference */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🔍 Quick Reference</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• <strong>Test emails:</strong> student1@babson.edu, student2@babson.edu, etc.</li>
                  <li>• <strong>Login flow:</strong> Enter @babson.edu email → Get verification code → Enter code → Login</li>
                  <li>• <strong>Database file:</strong> <code>setup-database.sql</code> contains the complete schema</li>
                  <li>• <strong>Environment:</strong> Make sure your <code>.env.local</code> has Supabase credentials</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 