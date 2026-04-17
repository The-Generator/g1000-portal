#!/usr/bin/env python3
"""
Database Setup Script for G1000 Portal
Uses Supabase Management API to create tables and seed data
"""

import os
import requests
import json
import time
from pathlib import Path

# Supabase Management API configuration
SUPABASE_ACCESS_TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")  # set via env
SUPABASE_API_URL = "https://api.supabase.com/v1"

# Your project details from .env.local
PROJECT_REF = "dyhfoqepatibrfrnztxw"  # Extracted from your Supabase URL

def execute_sql(sql_content, description="Executing SQL"):
    """Execute SQL using Supabase Management API"""
    
    print(f"\n📋 {description}...")
    
    url = f"{SUPABASE_API_URL}/projects/{PROJECT_REF}/database/query"
    
    headers = {
        "Authorization": f"Bearer {SUPABASE_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Split SQL into individual statements
    statements = []
    current_statement = []
    
    for line in sql_content.split('\n'):
        # Skip empty lines and comments
        if not line.strip() or line.strip().startswith('--'):
            continue
        
        current_statement.append(line)
        
        # Check if this line ends a statement
        if line.rstrip().endswith(';'):
            statement = '\n'.join(current_statement)
            statements.append(statement)
            current_statement = []
    
    # Add any remaining statement
    if current_statement:
        statements.append('\n'.join(current_statement))
    
    success_count = 0
    error_count = 0
    errors = []
    
    for i, statement in enumerate(statements, 1):
        if not statement.strip():
            continue
            
        # Skip pure comment blocks
        if all(line.strip().startswith('--') or not line.strip() for line in statement.split('\n')):
            continue
        
        try:
            response = requests.post(
                url,
                headers=headers,
                json={"query": statement}
            )
            
            if response.status_code == 200:
                success_count += 1
                print(f"   ✅ Statement {i}/{len(statements)} executed successfully")
            else:
                error_count += 1
                error_msg = response.json().get('message', response.text)
                errors.append(f"Statement {i}: {error_msg[:100]}")
                print(f"   ⚠️  Statement {i}/{len(statements)} failed: {error_msg[:100]}")
                
        except Exception as e:
            error_count += 1
            errors.append(f"Statement {i}: {str(e)[:100]}")
            print(f"   ❌ Statement {i}/{len(statements)} error: {str(e)[:100]}")
        
        # Small delay to avoid rate limiting
        time.sleep(0.1)
    
    print(f"\n   📊 Results: {success_count} successful, {error_count} errors")
    
    if errors:
        print("\n   ⚠️  Errors encountered:")
        for error in errors[:5]:  # Show first 5 errors
            print(f"      • {error}")
    
    return success_count, error_count

def read_sql_file(filepath):
    """Read SQL file content"""
    path = Path(filepath)
    if not path.exists():
        print(f"   ❌ File not found: {filepath}")
        return None
    return path.read_text()

def main():
    print("🚀 G1000 Portal Database Setup")
    print(f"📍 Project: {PROJECT_REF}")
    print("=" * 50)
    
    # Define SQL files to execute
    sql_files = [
        {
            'path': 'src/db/scripts/complete-database-setup.sql',
            'description': 'Creating tables, indexes, and seed data'
        },
        {
            'path': 'src/db/scripts/setup-rls-policies.sql', 
            'description': 'Setting up Row Level Security policies'
        }
    ]
    
    total_success = 0
    total_errors = 0
    
    for sql_file in sql_files:
        filepath = Path(__file__).parent.parent / sql_file['path']
        sql_content = read_sql_file(filepath)
        
        if sql_content:
            success, errors = execute_sql(sql_content, sql_file['description'])
            total_success += success
            total_errors += errors
        else:
            print(f"   ⏭️  Skipping {sql_file['description']}")
    
    # Final summary
    print("\n" + "=" * 50)
    print("📊 SETUP COMPLETE")
    print(f"   Total statements executed: {total_success}")
    print(f"   Total errors: {total_errors}")
    
    if total_errors == 0:
        print("\n✅ Database setup completed successfully!")
    else:
        print(f"\n⚠️  Setup completed with {total_errors} errors.")
        print("   Some errors may be expected (e.g., 'already exists' errors)")
    
    print("\n📝 Test Credentials:")
    print("   Students: student1@babson.edu, student2@babson.edu, etc.")
    print("   Business Owners: john@techcorp.com, sarah@healthplus.com")
    print("   Password for all: Test123!@#")
    
    print("\n🔗 Next Steps:")
    print("   1. Go to your Supabase dashboard")
    print("   2. Navigate to the SQL Editor")
    print("   3. Run the verification script: src/db/scripts/verify-database-setup.sql")
    print("   4. Check that all tables and data are present")

if __name__ == "__main__":
    main()