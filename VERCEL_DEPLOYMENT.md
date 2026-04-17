# Vercel Deployment Configuration

## Required Environment Variables

To deploy this application successfully on Vercel, you must configure the following environment variables in your Vercel project settings:

### 1. Authentication
```
JWT_SECRET=<your-jwt-secret>
```
**Important:** This must be the same secret used in your local development to ensure tokens are valid across environments.

### 2. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

### 3. Production Mode (Important!)
```
DEV_MODE=false
```
**Note:** Set this to `false` for production. When set to `true`, it uses mock authentication for development.

### 4. App URL (Optional but recommended)
```
NEXT_PUBLIC_APP_URL=https://your-vercel-app-url.vercel.app
```
Replace with your actual Vercel deployment URL.

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable listed above
4. Make sure to select all environments (Production, Preview, Development)
5. Click "Save" for each variable

## Important Notes

- **JWT_SECRET**: Must be a strong, random string. The one provided is for this specific project.
- **SUPABASE_SERVICE_ROLE_KEY**: This is sensitive and should never be exposed to the client.
- **DEV_MODE**: MUST be set to `false` in production, otherwise authentication will be bypassed.

## Troubleshooting

### Issue: Users can't log in / are redirected to wrong login page
- Verify all environment variables are set correctly
- Check that `JWT_SECRET` matches between local and production
- Ensure `DEV_MODE` is set to `false`

### Issue: "Dynamic server usage" errors during build
- All API routes that use authentication are marked with `export const dynamic = 'force-dynamic'`
- This is already configured in the codebase

### Issue: Authentication not persisting
- Check that cookies are being set with `secure: true` in production
- Verify your domain allows cookies (not blocked by browser)

## Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] DEV_MODE set to `false`
- [ ] JWT_SECRET is configured
- [ ] Supabase keys are configured
- [ ] Build succeeds without errors
- [ ] Authentication works for both student and business portals