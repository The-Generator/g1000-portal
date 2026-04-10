#!/usr/bin/env node

/**
 * Quick Database Setup Script for G1000 Portal
 * Executes SQL files directly using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile(filePath) {
  console.log(`\n📋 Executing: ${path.basename(filePath)}`);
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Execute the SQL using Supabase's raw SQL execution
  try {
    // For Supabase v2, we need to use the SQL function differently
    // Split into statements and execute
    const statements = sql
      .split(/;\s*$/gm)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`   Found ${statements.length} SQL statements to execute`);
    
    let success = 0;
    for (const stmt of statements) {
      if (!stmt) continue;
      
      try {
        // Using direct fetch to Supabase SQL endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: stmt })
        });
        
        if (response.ok) {
          success++;
        } else {
          console.log(`   ⚠️ Statement failed: ${stmt.substring(0, 50)}...`);
        }
      } catch (e) {
        console.log(`   ⚠️ Error: ${e.message}`);
      }
    }
    
    console.log(`   ✅ Executed ${success}/${statements.length} statements`);
    
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting Database Setup...');
  console.log(`📍 URL: ${supabaseUrl}`);
  
  // Execute setup files
  const setupFile = path.join(__dirname, '../src/db/scripts/complete-database-setup.sql');
  const rlsFile = path.join(__dirname, '../src/db/scripts/setup-rls-policies.sql');
  
  if (fs.existsSync(setupFile)) {
    await executeSQLFile(setupFile);
  }
  
  if (fs.existsSync(rlsFile)) {
    await executeSQLFile(rlsFile);
  }
  
  console.log('\n✅ Setup complete!');
  console.log('\n📝 Test Credentials:');
  console.log('   Students: student1@babson.edu');
  console.log('   Business: john@techcorp.com');  
  console.log('   Password: Test123!@#');
}

main().catch(console.error);