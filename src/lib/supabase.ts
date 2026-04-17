import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
if (!supabaseServiceKey) {
  throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database type definitions — mirrors the 14 tables that remain after the
// foundation DB cleanup. Kept deliberately loose (no overly strict unions on
// nullable columns) so queries with partial selects still type-check.
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'student' | 'owner' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'student' | 'owner' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'student' | 'owner' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      student_profiles: {
        Row: {
          user_id: string;
          bio: string | null;
          major: string;
          year: string;
          linkedin_url: string | null;
          github_url: string | null;
          personal_website_url: string | null;
          resume_url: string | null;
          skills: string[];
          proof_of_work_urls: string[];
          available_days: string[];
          available_start_time: string | null;
          available_end_time: string | null;
          availability_slots: Array<{day: string, start_time: string, end_time: string}>;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          bio?: string | null;
          major: string;
          year: string;
          linkedin_url?: string | null;
          github_url?: string | null;
          personal_website_url?: string | null;
          resume_url?: string | null;
          skills?: string[];
          proof_of_work_urls?: string[];
          available_days?: string[];
          available_start_time?: string | null;
          available_end_time?: string | null;
          availability_slots?: Array<{day: string, start_time: string, end_time: string}>;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          bio?: string | null;
          major?: string;
          year?: string;
          linkedin_url?: string | null;
          github_url?: string | null;
          personal_website_url?: string | null;
          resume_url?: string | null;
          skills?: string[];
          proof_of_work_urls?: string[];
          available_days?: string[];
          available_start_time?: string | null;
          available_end_time?: string | null;
          availability_slots?: Array<{day: string, start_time: string, end_time: string}>;
          timezone?: string;
          updated_at?: string;
        };
      };
      business_owner_profiles: {
        Row: {
          user_id: string;
          company_name: string;
          industry_tags: string[];
          website_url: string | null;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          company_name: string;
          industry_tags?: string[];
          website_url?: string | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          company_name?: string;
          industry_tags?: string[];
          website_url?: string | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          industry_tags: string[];
          duration: string;
          deliverables: string[];
          compensation_type: 'stipend' | 'equity' | 'credit';
          compensation_value: string;
          apply_window_start: string;
          apply_window_end: string;
          required_skills: string[];
          status: 'open' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          industry_tags?: string[];
          duration: string;
          deliverables?: string[];
          compensation_type: 'stipend' | 'equity' | 'credit';
          compensation_value: string;
          apply_window_start: string;
          apply_window_end: string;
          required_skills?: string[];
          status?: 'open' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string;
          industry_tags?: string[];
          duration?: string;
          deliverables?: string[];
          compensation_type?: 'stipend' | 'equity' | 'credit';
          compensation_value?: string;
          apply_window_start?: string;
          apply_window_end?: string;
          required_skills?: string[];
          status?: 'open' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          project_id: string;
          student_id: string;
          cover_note: string;
          proof_of_work_url: string;
          status: 'submitted' | 'underReview' | 'interviewScheduled' | 'accepted' | 'rejected' | 'withdrawn';
          submitted_at: string;
          invited_at: string | null;
          rejected_at: string | null;
          meeting_date_time: string | null;
          reflection_owner: string | null;
          reflection_student: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          student_id: string;
          cover_note: string;
          proof_of_work_url: string;
          status?: 'submitted' | 'underReview' | 'interviewScheduled' | 'accepted' | 'rejected' | 'withdrawn';
          submitted_at?: string;
          invited_at?: string | null;
          rejected_at?: string | null;
          meeting_date_time?: string | null;
          reflection_owner?: string | null;
          reflection_student?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          student_id?: string;
          cover_note?: string;
          proof_of_work_url?: string;
          status?: 'submitted' | 'underReview' | 'interviewScheduled' | 'accepted' | 'rejected' | 'withdrawn';
          submitted_at?: string;
          invited_at?: string | null;
          rejected_at?: string | null;
          meeting_date_time?: string | null;
          reflection_owner?: string | null;
          reflection_student?: string | null;
        };
      };
      resources: {
        Row: {
          id: number;
          creator: string | null;
          title: string;
          description: string;
          tool: string;
          category: string;
          duration: string;
          video_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          creator?: string | null;
          title: string;
          description: string;
          tool: string;
          category: string;
          duration: string;
          video_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          creator?: string | null;
          title?: string;
          description?: string;
          tool?: string;
          category?: string;
          duration?: string;
          video_url?: string | null;
          created_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
      project_comments: {
        Row: {
          id: string;
          update_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          update_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          update_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      project_overviews: {
        Row: {
          id: string;
          application_id: string;
          summary: string | null;
          goals: string | null;
          owner_contact_email: string | null;
          useful_links: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          summary?: string | null;
          goals?: string | null;
          owner_contact_email?: string | null;
          useful_links?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          summary?: string | null;
          goals?: string | null;
          owner_contact_email?: string | null;
          useful_links?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_reflections: {
        Row: {
          id: string;
          application_id: string;
          student_id: string;
          reflection: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          student_id: string;
          reflection: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          student_id?: string;
          reflection?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_reviews: {
        Row: {
          id: string;
          application_id: string;
          reliability_rating: number;
          communication_rating: number;
          initiative_rating: number;
          quality_rating: number;
          impact_rating: number;
          review_note: string | null;
          deliverables_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          reliability_rating: number;
          communication_rating: number;
          initiative_rating: number;
          quality_rating: number;
          impact_rating: number;
          review_note?: string | null;
          deliverables_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          reliability_rating?: number;
          communication_rating?: number;
          initiative_rating?: number;
          quality_rating?: number;
          impact_rating?: number;
          review_note?: string | null;
          deliverables_completed?: boolean;
          created_at?: string;
        };
      };
      project_updates: {
        Row: {
          id: string;
          application_id: string;
          student_id: string;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          student_id: string;
          title: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          student_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
        };
      };
      resource_categories: {
        Row: {
          id: number;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          created_at?: string;
        };
      };
      support_documents: {
        Row: {
          id: string;
          resource_id: number;
          title: string;
          file_type: string;
          file_size: string | null;
          file_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          resource_id: number;
          title: string;
          file_type: string;
          file_size?: string | null;
          file_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: number;
          title?: string;
          file_type?: string;
          file_size?: string | null;
          file_url?: string;
          created_at?: string;
        };
      };
    };
  };
}; 