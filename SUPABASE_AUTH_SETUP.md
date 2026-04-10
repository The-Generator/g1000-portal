# Supabase Auth Email Configuration Guide

## Overview
The G1000 Portal uses Supabase Auth's email OTP (One-Time Password) system to authenticate Babson students. This guide will help you configure email authentication properly.

## Step 1: Configure SMTP in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/genufllbsvczadzhukor
2. Navigate to **Settings** → **Authentication** → **SMTP Settings**
3. Enable "Custom SMTP" and configure with your email provider:

### Example with SendGrid:
```
SMTP Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Your SendGrid API Key]
Sender Email: noreply@g1000portal.com
Sender Name: G1000 Portal
```

### Example with Resend:
```
SMTP Host: smtp.resend.com
Port: 587
Username: resend
Password: [Your Resend API Key]
Sender Email: noreply@g1000portal.com
Sender Name: G1000 Portal
```

## Step 2: Configure Email Templates

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Select "Magic Link" template
3. Replace with this OTP template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>G1000 Portal - Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #006744, #789b4a); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">G1000 Portal</h1>
  </div>
  
  <div style="padding: 30px; background: white;">
    <h2 style="color: #006744; margin-bottom: 20px;">Verification Code</h2>
    
    <p style="font-size: 16px; line-height: 1.5; color: #333;">
      Welcome to the G1000 Portal! Please use the verification code below to complete your sign-in:
    </p>
    
    <div style="background: #f8f9fa; border: 2px solid #006744; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
      <div style="font-size: 32px; font-weight: bold; color: #006744; letter-spacing: 3px;">
        {{ .Token }}
      </div>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      This code will expire in 1 hour. If you didn't request this code, please ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © 2024 G1000 Portal - Connecting Babson Students with Real-World Projects
    </p>
  </div>
</body>
</html>
```

## Step 3: Configure Authentication Settings

1. Go to **Authentication** → **Providers** → **Email**
2. Ensure these settings:
   - Enable email provider: ✅
   - Confirm email: ✅ (recommended for production)
   - Secure email change: ✅
   - OTP Expiration: 3600 seconds (1 hour)

## Step 4: Configure Rate Limits

1. Go to **Authentication** → **Rate Limits**
2. Set appropriate limits:
   - Email/OTP per hour: 10 (adjust based on needs)
   - Verify OTP attempts: 5

## Step 5: Add Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these URLs to "Redirect URLs":
   - `http://localhost:3000/student/dashboard` (for development)
   - `https://your-domain.com/student/dashboard` (for production)

## Step 6: Update Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://genufllbsvczadzhukor.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 7: Test the Authentication Flow

1. Ensure you have student emails in the `g1000_participants` table:
```sql
INSERT INTO g1000_participants (email, name, major, year) 
VALUES 
  ('test.student@babson.edu', 'Test Student', 'Computer Science', 'Senior'),
  ('another.student@babson.edu', 'Another Student', 'Business', 'Junior');
```

2. Test the login flow:
   - Go to `/login`
   - Enter a @babson.edu email
   - Check email for OTP code
   - Enter the code to sign in

## Troubleshooting

### Emails not sending?
- Check SMTP configuration is correct
- Verify sender email is authorized with your SMTP provider
- Check Supabase logs: Dashboard → Logs → Auth

### OTP not working?
- Ensure the email template includes `{{ .Token }}`
- Check that OTP expiration is set appropriately
- Verify the email address exists in `g1000_participants` table

### Rate limit errors?
- Increase rate limits in Authentication settings
- Consider implementing a queue system for high-volume periods

## Production Checklist

- [ ] Configure custom SMTP (not using Supabase default)
- [ ] Set up proper sender domain with SPF/DKIM records
- [ ] Configure production redirect URLs
- [ ] Set appropriate rate limits
- [ ] Test with real @babson.edu emails
- [ ] Enable email confirmation for security
- [ ] Set up monitoring for failed authentications

## Support

For issues with Supabase Auth configuration, refer to:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Authentication Guide](https://supabase.com/docs/guides/auth/auth-email-passwordless)