const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://genufllbsvczadzhukor.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbnVmbGxic3ZjemFkemh1a29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk0NDk5NCwiZXhwIjoyMDcwNTIwOTk0fQ.5eZWs5gF61w2YNp6EiKoncR52RTjNfYo5kvOxuMIQGA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function monitorAuth() {
  const email = 'gavin@keeswilliams.com';

  console.log('='.repeat(80));
  console.log('AUTHENTICATION MONITORING FOR:', email);
  console.log('Started at:', new Date().toISOString());
  console.log('='.repeat(80));

  // Check initial state
  console.log('\n📊 INITIAL STATE CHECK:');
  console.log('-'.repeat(40));

  // Check auth.users
  try {
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (authUser) {
      console.log('❌ USER EXISTS IN AUTH (should not exist for fresh signup)');
      console.log('   ID:', authUser.id);
      console.log('   Email Confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');
      console.log('   Created:', authUser.created_at);
    } else {
      console.log('✅ No user in auth.users (ready for fresh signup)');
    }
  } catch (error) {
    console.error('Error checking auth:', error.message);
  }

  // Check users table
  try {
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase());

    if (userData && userData.length > 0) {
      console.log('❌ USER EXISTS IN USERS TABLE (should not exist)');
      console.log('   Data:', userData[0]);
    } else {
      console.log('✅ No user in users table (ready for fresh signup)');
    }
  } catch (error) {
    console.error('Error checking users:', error.message);
  }

  // Check approved emails
  try {
    const { data: approvedData } = await supabaseAdmin
      .from('approved_business_emails')
      .select('*')
      .eq('email', email.toLowerCase());

    if (approvedData && approvedData.length > 0) {
      console.log('✅ Email is in approved list');
      console.log('   Company:', approvedData[0].company_name);
      console.log('   Active:', approvedData[0].is_active);
    } else {
      console.log('❌ Email NOT in approved list (will show unauthorized modal)');
    }
  } catch (error) {
    console.error('Error checking approved emails:', error.message);
  }

  console.log('\n' + '='.repeat(80));
  console.log('MONITORING READY - Proceed with registration/login');
  console.log('I will check the state again after you complete the process');
  console.log('='.repeat(80));
}

// Run initial check
monitorAuth();

// Check every 30 seconds for changes
setInterval(async () => {
  console.log('\n⏰ Periodic check at:', new Date().toISOString());

  const email = 'gavin@keeswilliams.com';

  try {
    // Quick check for auth user
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (authUser) {
      console.log('🔔 AUTH USER DETECTED!');
      console.log('   ID:', authUser.id);
      console.log('   Confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');
      console.log('   Metadata:', JSON.stringify(authUser.user_metadata));
    }

    // Check users table
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, email, has_set_password, created_at')
      .eq('email', email.toLowerCase())
      .single();

    if (userData) {
      console.log('🔔 USER IN DATABASE!');
      console.log('   Has Password:', userData.has_set_password);
      console.log('   Created:', userData.created_at);
    }
  } catch (error) {
    // Silent fail for periodic checks
  }
}, 30000);