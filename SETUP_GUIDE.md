# G1000 Portal Setup Guide

## Real Data Setup

The portal is now configured to use real authentication and data. Follow these steps to get started:

### 1. Business Owner Setup

1. Navigate to `/business/register`
2. Create a business account with:
   - Your email address
   - Password (minimum 8 characters)
   - Business name
   - Contact name
   - Industry (optional)
   - Website (optional)

3. Once registered, log in at `/business/login` with your email and password
4. You can now:
   - Create new project opportunities
   - View and manage applications
   - Schedule interviews with students

### 2. Student Setup

Students need to be in the G1000 participants list to register.

#### Adding Students to the Database

Run this SQL in your Supabase SQL editor to add test students:

```sql
-- Add test students to g1000_participants table
INSERT INTO g1000_participants (email, name, major, year) VALUES
('student1@babson.edu', 'John Smith', 'Computer Science', 2024),
('student2@babson.edu', 'Jane Doe', 'Business Analytics', 2025),
('student3@babson.edu', 'Mike Johnson', 'Entrepreneurship', 2024);
```

#### Student Registration Process

1. Navigate to `/login`
2. Enter a Babson email (e.g., `student1@babson.edu`)
3. Click "Send Code"
4. Check Supabase Auth logs for the verification code:
   - Go to Supabase Dashboard > Authentication > Logs
   - Look for the 6-digit code in the email logs
5. Enter the code to complete registration
6. Students can then:
   - View available opportunities
   - Apply to projects
   - Manage their profile

### 3. Creating Test Opportunities

As a business owner:

1. Log in to the business portal
2. Click "Post New Project"
3. Fill in project details:
   - Title
   - Description
   - Requirements
   - Skills needed
   - Duration
   - Location
4. Submit the project

### 4. Testing the Application Flow

1. **As a Student:**
   - Browse opportunities at `/student/opportunities`
   - Click on a project to view details
   - Submit an application with cover note and portfolio link

2. **As a Business Owner:**
   - View applications at `/business/projects/[id]/applicants`
   - Click "View Profile" to see student details
   - Invite students to interviews
   - Manage application statuses

## Database Schema

The system uses the following main tables:

- `users` - All user accounts (students and business owners)
- `student_profiles` - Student-specific information
- `business_owner_profiles` - Business owner information
- `projects` - Job/internship opportunities
- `applications` - Student applications to projects
- `g1000_participants` - Whitelist of students who can register

## Authentication Flow

- **Students**: Email-based OTP authentication (Babson emails only)
- **Business Owners**: Email/password authentication
- **Sessions**: JWT tokens stored in HTTP-only cookies

## Troubleshooting

### Cannot log in as student
- Ensure the email is added to `g1000_participants` table
- Check that it's a valid Babson email (@babson.edu)
- Verify the OTP code from Supabase Auth logs

### Cannot log in as business owner
- Ensure you've registered first at `/business/register`
- Check that your account is approved (currently auto-approved)
- Verify your password is correct

### Student profile not loading
- Ensure the student has applied to at least one of your projects
- Check that you're logged in as a business owner
- Verify the student exists in the database

## Environment Variables

Ensure these are set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

## Support

For issues or questions, check:
1. Browser console for client-side errors
2. Server logs for API errors
3. Supabase dashboard for database/auth issues