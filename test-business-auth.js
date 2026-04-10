const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client - using NEW project
const supabaseUrl = 'https://genufllbsvczadzhukor.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbnVmbGxic3ZjemFkemh1a29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDQ5OTQsImV4cCI6MjA3MDUyMDk5NH0.jZn-nYmaIcIMVtsUHtDZEzZA09oTfJHblB2Nn_TLBq8';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbnVmbGxic3ZjemFkemh1a29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk0NDk5NCwiZXhwIjoyMDcwNTIwOTk0fQ.5eZWs5gF61w2YNp6EiKoncR52RTjNfYo5kvOxuMIQGA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkBusinessOwner() {
  const email = 'gavin@keeswilliams.com';

  console.log('========================================');
  console.log('Checking business owner:', email);
  console.log('========================================\n');

  // Check in auth.users
  console.log('1. Checking in auth.users table...');
  try {
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (!authError) {
      const authUser = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (authUser) {
        console.log('✅ Found in auth.users:');
        console.log('   ID:', authUser.id);
        console.log('   Email:', authUser.email);
        console.log('   Confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');
        console.log('   Metadata:', JSON.stringify(authUser.user_metadata, null, 2));
      } else {
        console.log('❌ NOT found in auth.users');
      }
    } else {
      console.error('Error checking auth.users:', authError);
    }
  } catch (err) {
    console.error('Exception checking auth:', err.message);
  }

  // Check in users table
  console.log('\n2. Checking in users table...');
  try {
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('role', 'owner');

    if (!userError) {
      if (userData && userData.length > 0) {
        console.log('✅ Found in users table:');
        console.log('   ID:', userData[0].id);
        console.log('   Email:', userData[0].email);
        console.log('   Name:', userData[0].name);
        console.log('   Has Password:', userData[0].has_set_password);
        console.log('   Role:', userData[0].role);
        console.log('   Number of records found:', userData.length);
      } else {
        console.log('❌ NOT found in users table');
      }
    } else {
      console.error('Error checking users table:', userError);
    }
  } catch (err) {
    console.error('Exception checking users:', err.message);
  }

  // Check business_owner_profiles
  console.log('\n3. Checking business_owner_profiles...');
  try {
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('role', 'owner')
      .single();

    if (userData) {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('business_owner_profiles')
        .select('*')
        .eq('user_id', userData.id);

      if (!profileError) {
        if (profileData && profileData.length > 0) {
          console.log('✅ Found profile:');
          console.log('   Company:', profileData[0].company_name || profileData[0].business_name);
          console.log('   Approved:', profileData[0].is_approved);
        } else {
          console.log('❌ Profile NOT found');
        }
      } else {
        console.error('Error checking profile:', profileError);
      }
    }
  } catch (err) {
    console.error('Exception checking profile:', err.message);
  }

  // Test Supabase Auth directly
  console.log('\n4. Testing Supabase Auth directly...');
  try {
    const testPassword = 'test123456'; // Use the password you set during testing
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: testPassword
    });

    if (!authError && authData.user) {
      console.log('✅ Supabase Auth login successful!');
      console.log('   User ID:', authData.user.id);
    } else {
      console.log('❌ Supabase Auth login failed:', authError?.message || 'Unknown error');

      // Try to reset the password for testing
      console.log('\n5. Resetting password for testing...');
      const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
        'ab1e820e-27aa-48dc-9ac9-ae276c0b643c', // Using the ID we found
        { password: testPassword }
      );

      if (!resetError) {
        console.log('✅ Password reset successful! Try logging in again.');
      } else {
        console.log('❌ Password reset failed:', resetError.message);
      }
    }
  } catch (err) {
    console.log('Error testing auth:', err.message);
  }

  // Test the query that's failing in login-password
  console.log('\n6. Testing the exact query from login-password endpoint...');
  try {
    const { data: testUser, error: testError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('role', 'owner')
      .single();

    if (!testError && testUser) {
      console.log('✅ Query successful! User found:', testUser.id);
    } else {
      console.log('❌ Query failed!');
      console.log('   Error code:', testError?.code);
      console.log('   Error message:', testError?.message);
      console.log('   Error details:', testError?.details);
    }
  } catch (err) {
    console.log('Exception during query:', err.message);
  }

  // Test the API endpoint directly
  console.log('\n7. Testing login-password API endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/auth/business/login-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: 'test123456' // Use the password you set during testing
      })
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 404 && data.error === 'Account sync error. Please contact support.') {
      console.log('\n⚠️  SYNC ERROR DETECTED!');
      console.log('This error happens when:');
      console.log('   1. User query returns PGRST116 (no rows found)');
      console.log('   2. But user exists in Supabase Auth');
    }
  } catch (err) {
    console.log('Could not test API endpoint (server may not be running):', err.message);
  }

  console.log('\n========================================');
  console.log('Debug Complete');
  console.log('========================================');
}

checkBusinessOwner().catch(console.error);