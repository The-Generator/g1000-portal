# Database Migration Instructions

## Required Migrations

### 1. Student Profile Fixes (URGENT)

**Issue:** Student profile updates are failing with "value too long for type character varying(10)" error.

**Root Cause:** Two problems:
1. Missing availability columns 
2. `year` column is VARCHAR(10) but we're saving "Not specified" (13 characters)

**Solution:** Run both migrations:

#### Step A: Add availability columns (if not done already)
```sql
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS available_days TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS available_start_time VARCHAR(10),
ADD COLUMN IF NOT EXISTS available_end_time VARCHAR(10),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/New_York';
```

#### Step B: Fix year column length 
```sql
ALTER TABLE student_profiles 
ALTER COLUMN year TYPE VARCHAR(20);

ALTER TABLE g1000_participants 
ALTER COLUMN year TYPE VARCHAR(20);
```

### 2. Flexible Availability System (NEW FEATURE)

**Feature:** Enhanced availability system allowing multiple time ranges per day and different ranges for different days.

**Migration:** Add flexible availability support:

```sql
-- Add flexible availability column
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS availability_slots JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_availability_slots 
ON student_profiles USING GIN (availability_slots);
```

**Data Format Example:**
```json
[
  {"day": "Monday", "start_time": "09:00", "end_time": "12:00"},
  {"day": "Monday", "start_time": "14:00", "end_time": "17:00"},
  {"day": "Tuesday", "start_time": "10:00", "end_time": "15:00"}
]
```

### 2. Project Type Migration

To fix the foreign key constraint error and add support for the new project type fields, you need to run the migration script.

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `src/db/scripts/migration-add-project-type-fields.sql`
4. Click "Run" to execute the migration

### Option 2: Using Supabase CLI (if installed)
```bash
supabase db reset
```
Then apply the new schema.

### Option 3: Manual SQL Execution
Connect to your database and run the migration script manually.

## What this migration does:
- Adds new compensation types: 'unpaid', 'hourly-wage', 'salary', 'commission', 'hourly-commission', 'other'
- Creates a new project_type enum with values: 'project-based', 'internship', 'micro-internship', 'consulting-gig', 'other'
- Adds `type` and `type_explanation` columns to the projects table
- Updates existing projects to have a default type
- Creates an index for better query performance

## After running the migrations:
1. **Student profile fixes**: Student profile updates will work properly - both availability data and "Not specified" year values will save correctly
2. **Flexible availability**: Students can now set different time ranges for different days (e.g., Monday 9-12 & 2-5, Tuesday 10-3)
3. **Project type migration**: The create opportunity form should work without foreign key errors
4. Restart your Next.js development server if needed
5. Mock users will be automatically created in development mode 