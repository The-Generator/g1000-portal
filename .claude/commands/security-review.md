# Security Review Command

Perform comprehensive security review of code changes and implementations.

## Security Review Areas

1. **Authentication & Authorization**
   - Verify authentication checks at all API endpoints
   - Ensure role-based access control is properly implemented
   - Check that client-side auth is never trusted for security decisions
   - Validate session management and token handling

2. **Input Validation & Sanitization**
   - Verify Zod schemas are implemented for all user inputs
   - Check server-side validation duplicates client-side validation
   - Ensure proper sanitization of user-generated content
   - Validate file upload security measures

3. **Data Protection**
   - Verify Row-Level Security (RLS) policies on database tables
   - Check that sensitive data is not exposed in logs or errors
   - Ensure proper handling of PII and financial data
   - Validate data encryption for sensitive information

4. **SQL Injection Prevention**
   - Review database queries for proper parameterization
   - Ensure no dynamic SQL construction with user input
   - Verify Supabase client usage follows security best practices
   - Check for proper escaping of database inputs

5. **XSS Prevention**
   - Review user content rendering for proper escaping
   - Check React component props for XSS vulnerabilities
   - Ensure proper Content Security Policy implementation
   - Validate handling of user-generated HTML/markdown

6. **API Security**
   - Verify proper CORS configuration
   - Check rate limiting implementation
   - Ensure sensitive endpoints require authentication
   - Validate proper error handling (no information leakage)

7. **Environment & Configuration Security**
   - Check that no secrets are hard-coded in source
   - Verify environment variables are properly secured
   - Ensure development configs don't leak to production
   - Validate third-party integrations (Stripe, Plaid, Clerk)

## Security Checklist

- [ ] All API endpoints have authentication checks
- [ ] User inputs are validated and sanitized
- [ ] Database queries use parameterization
- [ ] Sensitive data is properly protected
- [ ] Error messages don't leak information
- [ ] File uploads have security restrictions
- [ ] XSS prevention measures are in place
- [ ] No secrets in source code
- [ ] RLS policies protect user data
- [ ] Third-party integrations are secure

## High-Risk Areas to Focus On

- Payment processing endpoints
- User authentication flows  
- File upload functionality
- Admin panel access controls
- Database migration scripts
- API routes handling sensitive data

Execute this review for all security-critical changes and before production deployments.