import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database type definitions
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
          status: 'submitted' | 'underReview' | 'interviewScheduled' | 'accepted' | 'rejected';
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
          status?: 'submitted' | 'underReview' | 'interviewScheduled' | 'accepted' | 'rejected';
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
          status?: 'submitted' | 'underReview' | 'interviewScheduled' | 'accepted' | 'rejected';
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