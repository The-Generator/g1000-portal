#!/usr/bin/env node

/**
 * Database Setup Script for G1000 Portal
 * This script will create all necessary tables and seed data in your Supabase project
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filePath, description) {
  try {
    console.log(`\n📋 ${description}...`);
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL into individual statements (basic split, may need refinement)
    const statements = sql
      .split(/;\s*$/gm)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      // Skip empty statements or comments
      if (!statement || statement.startsWith('--')) continue;
      
      try {
        // Execute using Supabase's SQL function
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        }).single();
        
        if (error) {
          // Try direct execution as fallback
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: statement + ';' })
          });
          
          if (!response.ok) {
            console.error(`   ⚠️  Statement failed: ${statement.substring(0, 50)}...`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`   ⚠️  Error: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`   ✅ Completed: ${successCount} successful, ${errorCount} errors`);
    return { success: successCount, errors: errorCount };
    
  } catch (error) {
    console.error(`❌ Failed to execute ${description}: ${error.message}`);
    return { success: 0, errors: 1 };
  }
}

async function setupDatabase() {
  console.log('🚀 Starting G1000 Portal Database Setup...');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  
  try {
    // Test connection first
    const { data: test, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (!testError) {
      console.log('⚠️  Warning: Database may already have tables. Proceeding with caution...');
    }
    
    // Execute setup scripts in order
    const scripts = [
      {
        path: path.join(__dirname, '../src/db/scripts/complete-database-setup.sql'),
        description: 'Creating tables and seed data'
      },
      {
        path: path.join(__dirname, '../src/db/scripts/setup-rls-policies.sql'),
        description: 'Setting up Row Level Security'
      }
    ];
    
    let totalSuccess = 0;
    let totalErrors = 0;
    
    for (const script of scripts) {
      if (fs.existsSync(script.path)) {
        const result = await executeSQLFile(script.path, script.description);
        totalSuccess += result.success;
        totalErrors += result.errors;
      } else {
        console.log(`   ⏭️  Skipping ${script.description} (file not found)`);
      }
    }
    
    // Verify setup
    console.log('\n🔍 Verifying database setup...');
    
    // Check tables
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    const { data: participants, error: participantsError } = await supabase
      .from('g1000_participants')
      .select('*')
      .limit(5);
    
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);
    
    console.log('\n📊 Database Status:');
    console.log(`   • Users table: ${usersError ? '❌ Error' : `✅ ${users?.length || 0} records found`}`);
    console.log(`   • G1000 Participants: ${participantsError ? '❌ Error' : `✅ ${participants?.length || 0} records found`}`);
    console.log(`   • Projects table: ${projectsError ? '❌ Error' : `✅ ${projects?.length || 0} records found`}`);
    
    if (totalErrors > 0) {
      console.log(`\n⚠️  Setup completed with ${totalErrors} errors. Please check the output above.`);
    } else {
      console.log('\n✅ Database setup completed successfully!');
    }
    
    console.log('\n📝 Test Credentials:');
    console.log('   Students: student1@babson.edu, student2@babson.edu, etc.');
    console.log('   Business Owners: john@techcorp.com, sarah@healthplus.com, mike@greenfinance.com');
    console.log('   Password for all test accounts: Test123!@#');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(console.error);