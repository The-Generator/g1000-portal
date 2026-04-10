#!/usr/bin/env node

/**
 * Comprehensive test script for the complete authentication flow
 * Tests both student and business owner authentication with password creation
 */

async function testAuthFlow(type, email) {
  console.log(`\n📧 Testing ${type} authentication for: ${email}`);
  console.log('=' .repeat(60));

  const endpoint = type === 'student'
    ? '/api/auth/check-user'
    : '/api/auth/business/check-user';

  try {
    // Step 1: Check if user exists and has password
    console.log('\n1️⃣  Checking user status...');
    const checkResponse = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const checkData = await checkResponse.json();
    console.log('User Status:', checkData);

    if (!checkData.exists) {
      console.log('❌ User not found in database');
      console.log(`   Make sure ${email} exists in the appropriate table`);
      return;
    }

    if (type === 'business' && !checkData.isApproved) {
      console.log('⚠️  Business account is not approved');
      console.log('   Set is_approved = true in business_owner_profiles table');
      return;
    }

    if (checkData.hasPassword) {
      console.log('✅ User has a password set');
      console.log('\n🔑 Authentication flow:');
      console.log('   1. Enter email');
      console.log('   2. Enter password');
      console.log('   3. Sign in directly');
      console.log('\n💡 Alternative: User can choose "Sign in with verification code"');
    } else {
      console.log('🆕 First-time user (no password set)');
      console.log('\n📱 Authentication flow:');
      console.log('   1. Enter email');
      console.log('   2. Receive OTP code via email');
      console.log('   3. Enter verification code');
      console.log('   4. Create a password');
      console.log('   5. Sign in automatically');

      // Step 2: Request OTP code
      console.log('\n2️⃣  Requesting OTP code...');
      const requestEndpoint = type === 'student'
        ? '/api/auth/request-code'
        : '/api/auth/business/request-code';

      const otpResponse = await fetch(`http://localhost:3000${requestEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const otpData = await otpResponse.json();

      if (otpResponse.ok) {
        console.log('✅ OTP code sent successfully!');
        console.log('   Check email for 6-digit verification code');
      } else {
        console.log('❌ Failed to send OTP:', otpData.error);
      }
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
    console.log('\n💡 Make sure the development server is running: npm run dev');
  }
}

async function main() {
  console.log('\n========================================');
  console.log('Complete Authentication Flow Test');
  console.log('========================================');
  console.log('\n🔒 New Authentication System:');
  console.log('   • First login: Email → OTP Code → Create Password');
  console.log('   • Subsequent logins: Email → Password');
  console.log('   • Alternative: Always available OTP option');

  // Test student authentication
  await testAuthFlow('student', 'gmestler1@babson.edu');

  // Test business authentication
  await testAuthFlow('business', 'mlewis@nesb.com');

  console.log('\n========================================');
  console.log('Summary');
  console.log('========================================');
  console.log('\n✨ Key Features:');
  console.log('   • No more shared passwords');
  console.log('   • Secure OTP verification for first login');
  console.log('   • Personal passwords for convenience');
  console.log('   • Fallback to OTP if password forgotten');
  console.log('\n🎯 To test the full flow:');
  console.log('   1. Go to /login (students) or /business/login');
  console.log('   2. Follow the authentication flow');
  console.log('   3. Create your password on first login');
  console.log('   4. Use password for future logins\n');
}

// Run the tests
main();