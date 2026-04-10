// Test the API endpoint and capture debug info
const fetch = require('node-fetch');

async function testLogin() {
  console.log('Testing login endpoint...\n');

  try {
    const response = await fetch('http://localhost:3000/api/auth/business/login-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'gavin@keeswilliams.com',
        password: 'test123456'
      })
    });

    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (data.error === 'Account sync error. Please contact support.') {
      console.log('\n❌ SYNC ERROR DETECTED');
      console.log('\nThis error means the query is returning 0 rows.');
      console.log('But we know the user exists from our direct test.');
      console.log('\nPossible causes:');
      console.log('1. Environment variables not loaded properly in API route');
      console.log('2. Different Supabase project being used');
      console.log('3. RLS policies blocking the query');
      console.log('4. Service role key not working correctly');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();