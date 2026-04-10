#!/usr/bin/env node

/**
 * Test script to verify the student authentication flow
 * This tests the OTP email sending functionality
 */

const TEST_EMAIL = 'test.student@babson.edu'; // This should exist in g1000_participants table

async function testRequestCode() {
  console.log('\n📧 Testing OTP Request Flow...\n');
  console.log('Email:', TEST_EMAIL);

  try {
    const response = await fetch('http://localhost:3000/api/auth/request-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL
      })
    });

    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS: OTP email request sent successfully!');
      console.log('Check the Supabase Auth Logs for email delivery status.');
      console.log('\nTo check logs:');
      console.log('1. Go to: https://supabase.com/dashboard/project/genufllbsvczadzhukor/logs/auth');
      console.log('2. Look for recent email sending events');
      console.log('3. Verify the email template is being used correctly');
    } else {
      console.log('\n❌ ERROR: Failed to send OTP email');
      if (response.status === 404) {
        console.log('Make sure the email exists in the g1000_participants table');
      }
    }
  } catch (error) {
    console.error('\n💥 Network Error:', error.message);
    console.log('Make sure the development server is running on port 3000');
  }
}

// Run the test
console.log('========================================');
console.log('Student Authentication Flow Test');
console.log('========================================');

testRequestCode();