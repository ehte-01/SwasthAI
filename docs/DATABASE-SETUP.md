# Database Setup Guide for SwasthAI

## Current Issue
The application is showing errors because the database tables `vault_documents` and `emergency_contacts` are missing from your Supabase database.

## Quick Fix

### Step 1: Access Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your SwasthAI project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Missing Tables Script
1. Copy the contents of `database/missing-tables.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### Step 3: Verify Tables Created
1. Go to **Table Editor** in the left sidebar
2. You should now see:
   - `vault_documents` table
   - `emergency_contacts` table

## Complete Database Setup (If Starting Fresh)

If you need to set up the entire database from scratch:

### Step 1: Create Custom Types
```sql
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE relationship AS ENUM ('spouse', 'parent', 'child', 'sibling', 'grandparent', 'grandchild', 'other');
CREATE TYPE record_type AS ENUM ('prescription', 'lab_report', 'diagnosis', 'vaccination', 'surgery', 'other');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE insight_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE document_type AS ENUM ('identity', 'medical', 'insurance', 'legal', 'financial', 'education', 'photo', 'other');
```

### Step 2: Run Complete Schema
1. Copy the entire contents of `database/schema.sql`
2. Paste it into the SQL Editor
3. Click **Run**

### Step 3: Set Up Storage Buckets
1. Go to **Storage** in the left sidebar
2. Create these buckets:
   - `avatars` (public)
   - `documents` (private)
   - `health-records` (private)

### Step 4: Configure Storage Policies
The storage policies are included in the schema.sql file and will be automatically created.

## Environment Variables

Make sure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under **API**.

## Testing the Fix

After running the missing tables script:
1. Refresh your SwasthAI application
2. Navigate to the Family Vault page
3. The errors should be resolved
4. You should be able to add family members and upload documents

## Troubleshooting

If you still see errors:
1. Check that all tables exist in the Table Editor
2. Verify that RLS (Row Level Security) is enabled on all tables
3. Ensure your environment variables are correct
4. Check the browser console for any remaining errors

## Need Help?

If you encounter any issues:
1. Check the Supabase logs in your dashboard
2. Verify your database connection
3. Ensure you have the correct permissions in your Supabase project
