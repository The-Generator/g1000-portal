#!/usr/bin/env node

/**
 * Test script for Gavin Mestler's authentication flow
 * This verifies that OTP codes are sent instead of confirmation links
 */

const EMAIL = 'gmestler1@babson.edu';

async function testAuthFlow() {
  console.log('\n========================================');
  console.log('Testing Authentication for Gavin Mestler');
  console.log('========================================\n');

  console.log('📧 Email:', EMAIL);
  console.log('\n1️⃣ Step 1: Requesting OTP code...\n');

  try {
    const response = await fetch('http://localhost:3000/api/auth/request-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: EMAIL
      })
    });

    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS: OTP code request sent!');
      console.log('\n📬 Check your email for:');
      console.log('   - A 6-digit verification CODE (not a link!)');
      console.log('   - Subject should be about verification/login');
      console.log('   - The email should show the code prominently');

      console.log('\n2️⃣ Step 2: Once you receive the code:');
      console.log('   1. Go to http://localhost:3000/login');
      console.log('   2. Enter email: gmestler1@babson.edu');
      console.log('   3. Click Continue');
      console.log('   4. Enter the 6-digit code from your email');
      console.log('   5. You should be logged in successfully!');

      console.log('\n⚠️  Important: You should receive a CODE, not a confirmation link!');
      console.log('   If you receive a link instead, the issue is not fully resolved.');

    } else {
      console.log('\n❌ ERROR:', data.error || 'Failed to send OTP');
      if (response.status === 404) {
        console.log('\n💡 This error means the email is not in g1000_participants table');
      }
    }
  } catch (error) {
    console.error('\n💥 Network Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. The development server is running: npm run dev');
    console.log('   2. It\'s accessible at http://localhost:3000');
  }

  console.log('\n========================================\n');
}

// Run the test
testAuthFlow();