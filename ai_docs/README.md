# G1000 Portal

A comprehensive platform connecting Babson AI Innovators Bootcamp alumni with small business owners for real-world AI and automation projects.

## 🚀 Features

### For Students
- **Profile Management**: Create detailed profiles with skills, portfolios, and proof-of-work
- **Project Discovery**: Browse and filter available business projects
- **Application System**: Apply to projects with cover letters and portfolio links
- **Interview Scheduling**: Coordinate meetings with business owners
- **Progress Tracking**: Monitor application status and project progress

### For Business Owners
- **Project Posting**: Create detailed project listings with requirements and compensation
- **Applicant Review**: Review student applications with filtering and sorting
- **Interview Management**: Schedule and manage student interviews
- **Project Management**: Track project progress and outcomes

### For Administrators
- **User Management**: Approve business owners and manage user accounts
- **Analytics Dashboard**: Monitor platform usage and success metrics
- **Content Moderation**: Oversee projects and applications

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Custom JWT implementation with email verification
- **Email**: SendGrid for transactional emails
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- SendGrid account for email services

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd G1000-Portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file based on `.env.example`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the schema SQL in the Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase/schema.sql
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📱 Application Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── student/           # Student portal
│   ├── business/          # Business owner portal
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   └── features/         # Feature-specific components
├── lib/                  # Utility libraries
│   ├── supabase.ts      # Database client
│   ├── auth.ts          # Authentication utilities
│   ├── email.ts         # Email services
│   └── utils.ts         # General utilities
└── types/               # TypeScript type definitions
```

## 🔐 Authentication Flow

### Students
1. Enter @babson.edu email address
2. Receive 6-digit verification code via email
3. Enter code to authenticate
4. Automatic account creation with G1000 participant verification

### Business Owners
1. Register with email and password
2. Account pending approval by administrators
3. Login with email/password after approval

### Administrators
1. Pre-provisioned accounts
2. Email/password authentication

## 📊 Database Schema

The application uses a PostgreSQL database with the following main tables:

- `users` - Main user accounts
- `student_profiles` - Student-specific data
- `business_owner_profiles` - Business owner data
- `projects` - Project listings
- `applications` - Student applications
- `g1000_participants` - Verified G1000 alumni

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Tailwind CSS for consistent styling
- Component-based architecture

## 📧 Email Templates

The application includes professionally designed email templates for:
- Verification codes
- Application notifications
- Interview invitations
- Status updates

## 🔒 Security Features

- JWT-based authentication
- HTTP-only secure cookies
- Role-based access control
- Email verification
- Password hashing with bcrypt
- Rate limiting (recommended for production)

## 📈 Analytics

Built-in analytics dashboard tracks:
- User registration and activity
- Project posting and application rates
- Successful matches and completion rates
- Platform engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Create an issue on GitHub
- Contact the Generator team

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced matching algorithms
- [ ] Video interview integration
- [ ] Project collaboration tools
- [ ] Payment processing integration
- [ ] Advanced analytics and reporting

---

Built with ❤️ by the Generator Team for the Babson G1000 community.
