export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'owner' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  id: string; // Unique identifier for each slot
  day: string; // 'Monday', 'Tuesday', etc.
  start_time: string; // 'HH:MM' format
  end_time: string; // 'HH:MM' format
}

export interface StudentProfile {
  userId: string;
  bio?: string;
  major: string;
  year: string;
  linkedinUrl?: string;
  githubUrl?: string;
  personalWebsiteUrl?: string;
  resumeUrl?: string;
  profilePhotoUrl?: string;
  skills: string[];
  proofOfWorkUrls: string[];
  // Legacy availability fields (kept for backward compatibility)
  availableDays: string[];
  availableStartTime?: string;
  availableEndTime?: string;
  // New flexible availability system
  availabilitySlots?: AvailabilitySlot[];
  timezone: string;
  updatedAt: string;
  user?: User;
}

export interface BusinessOwnerProfile {
  userId: string;
  companyName: string;
  contactName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  industryTags: string[];
  websiteUrl?: string;
  description?: string;
  logoUrl?: string;
  linkedinUrl?: string;
  founded?: string;
  employeeCount?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: 'project-based' | 'internship' | 'consulting';
  isAiConsultation?: boolean;
  currentSoftwareTools?: string;
  painPoints?: string;
  industryTags: string[];
  estimatedDuration?: string;
  estimatedHoursPerWeek?: string;
  compensationType?: 'paid-hourly' | 'paid-stipend' | 'paid-fixed' | 'paid-salary' | 'equity' | 'experience' | 'other';
  compensationValue?: string;
  budget?: string;
  deliverables?: string[];
  location?: 'remote' | 'hybrid' | 'onsite';
  onsiteLocation?: string;
  applyWindowStart: string;
  applyWindowEnd: string;
  requiredSkills?: string[];
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
  owner?: BusinessOwnerProfile;
  applications?: Application[];
}

export interface Application {
  id: string;
  projectId: string;
  studentId: string;
  coverNote: string;
  proofOfWorkUrl: string;
  status: 'submitted' | 'underReview' | 'interviewScheduled' | 'accepted' | 'rejected';
  submittedAt: string;
  invitedAt?: string;
  rejectedAt?: string;
  meetingDateTime?: string;
  meetingLink?: string;
  reflectionOwner?: string;
  reflectionStudent?: string;
  project?: Project;
  student?: StudentProfile;
}

export interface AdminMetrics {
  pendingOwnerCount: number;
  activeProjectCount: number;
  openApplicationCount: number;
  userCountByRole: {
    student: number;
    owner: number;
    admin: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password?: string;
  code?: string;
}

export interface ProjectForm {
  title: string;
  description: string;
  type: 'project-based' | 'internship' | 'consulting';
  isAiConsultation?: boolean;
  currentSoftwareTools?: string;
  painPoints?: string;
  industryTags: string[];
  estimatedDuration?: string;
  estimatedHoursPerWeek?: string;
  compensationType?: 'paid-hourly' | 'paid-stipend' | 'paid-fixed' | 'paid-salary' | 'equity' | 'experience' | 'other';
  compensationValue?: string;
  budget?: string;
  deliverables?: string[];
  location?: 'remote' | 'hybrid' | 'onsite';
  onsiteLocation?: string;
  applyWindowStart: string;
  applyWindowEnd: string;
  requiredSkills?: string[];
}

export interface ApplicationForm {
  coverNote: string;
  proofOfWorkUrl: string;
}

export interface ProfileForm {
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  personalWebsiteUrl?: string;
  skills: string[];
  proofOfWorkUrls: string[];
  availableDays: string[];
  availableStartTime?: string;
  availableEndTime?: string;
  timezone: string;
}

// Constants
export const ROLES = ['student', 'owner', 'admin'] as const;
export const APPLICATION_STATUSES = ['submitted', 'underReview', 'interviewScheduled', 'accepted', 'rejected'] as const;
export const PROJECT_STATUSES = ['open', 'closed'] as const;
export const COMPENSATION_TYPES = [
  'paid-hourly',
  'paid-stipend',
  'paid-fixed',
  'paid-salary',
  'equity',
  'experience',
  'other'
] as const;

export const PROJECT_TYPES = [
  'project-based',
  'internship',
  'consulting'
] as const;

export const DURATION_OPTIONS = [
  'Less than 4 weeks',
  '4-8 weeks',
  '2-3 months',
  '3-6 months',
  'Ongoing',
  'Custom'
] as const;

export const HOURS_PER_WEEK_OPTIONS = [
  'Less than 5 hours',
  '5-10 hours',
  '10-20 hours',
  '20-30 hours',
  '30+ hours'
] as const;

export const LOCATION_OPTIONS = [
  'remote',
  'hybrid',
  'onsite'
] as const;

export const INDUSTRY_TAGS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Real Estate',
  'Non-profit',
  'Food & Beverage',
  'Marketing',
  'Other'
] as const;

export const SKILL_TAGS = [
  'Python',
  'JavaScript',
  'React',
  'Node.js',
  'Machine Learning',
  'Data Analysis',
  'UI/UX Design',
  'Project Management',
  'SQL',
  'API Development',
  'Mobile Development',
  'Cloud Computing',
  'Digital Marketing',
  'Business Strategy',
  'Research',
  'Content Creation'
] as const; 