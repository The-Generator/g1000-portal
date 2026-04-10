import { clsx, type ClassValue } from 'clsx';
import { format, isAfter, isBefore, parseISO, isValid } from 'date-fns';
import { Project } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(dateObj)) {
    console.error('Invalid date provided to formatDate:', date);
    return 'Invalid Date';
  }
  
  return format(dateObj, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(dateObj)) {
    console.error('Invalid date provided to formatDateTime:', date);
    return 'Invalid Date';
  }
  
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

export function isDateInPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(dateObj, new Date());
}

export function isDateInFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(dateObj, new Date());
}

export function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function createSearchParams(params: Record<string, string | number | boolean | undefined>): URLSearchParams {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams;
}

// Transform snake_case database fields to camelCase for frontend
export const transformProject = (dbProject: any): Project & any => {
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    type: dbProject.type || 'project-based',
    typeExplanation: dbProject.type_explanation || dbProject.typeExplanation,
    industryTags: dbProject.industry_tags || dbProject.industryTags || [],
    duration: dbProject.duration,
    deliverables: dbProject.deliverables || [],
    compensationType: dbProject.compensation_type || dbProject.compensationType,
    compensationValue: dbProject.compensation_value || dbProject.compensationValue,
    applyWindowStart: dbProject.apply_window_start || dbProject.applyWindowStart,
    applyWindowEnd: dbProject.apply_window_end || dbProject.applyWindowEnd,
    requiredSkills: dbProject.required_skills || dbProject.requiredSkills || [],
    status: dbProject.status,
    ownerId: dbProject.owner_id || dbProject.ownerId,
    createdAt: dbProject.created_at || dbProject.createdAt,
    updatedAt: dbProject.updated_at || dbProject.updatedAt,
    applications: dbProject.applications || [],
    // AI Consultation fields
    isAiConsultation: dbProject.is_ai_consultation === true,
    currentSoftwareTools: dbProject.current_software_tools || '',
    painPoints: dbProject.pain_points || '',
    // Additional optional fields
    estimatedDuration: dbProject.estimated_duration || '',
    estimatedHoursPerWeek: dbProject.estimated_hours_per_week || '',
    budget: dbProject.budget || '',
    location: dbProject.location || 'remote',
    onsiteLocation: dbProject.onsite_location || ''
  };
};

// Safe function to get industry tags with fallback
export const getIndustryTags = (project: Project) => {
  return Array.isArray(project.industryTags) ? project.industryTags : [];
};

// Format date for input fields
export const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};

// Get tomorrow's date for minimum date validation
// Get today's date for minimum date selection (uses local timezone)
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get tomorrow's date for minimum date selection (uses local timezone)
export const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get next week's date for default date selection (uses local timezone)
export const getNextWeekDate = () => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const year = nextWeek.getFullYear();
  const month = String(nextWeek.getMonth() + 1).padStart(2, '0');
  const day = String(nextWeek.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// General email validation function
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate that an email address is from Babson University
export const validateBabsonEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Check if email ends with @babson.edu
  return email.toLowerCase().endsWith('@babson.edu');
}; 

/**
 * Fixes timezone issues with datetime-local inputs
 * Ensures the date is treated as local time, not UTC
 */
export function parseLocalDateTime(dateTimeString: string): Date {
  if (!dateTimeString) return new Date();
  
  // If the string is from datetime-local (no timezone), treat it as local time
  if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
    // Create date in local timezone by explicitly parsing components
    const [date, time] = dateTimeString.split('T');
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    return new Date(year, month - 1, day, hour, minute);
  }
  
  // Otherwise, use standard Date parsing
  return new Date(dateTimeString);
}

/**
 * Formats a datetime string for display, ensuring timezone consistency
 */
export function formatMeetingDateTime(dateTimeString: string): string {
  const date = parseLocalDateTime(dateTimeString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

/**
 * Formats datetime for datetime-local input value
 */
export function toDateTimeLocalValue(date: Date | string): string {
  const d = typeof date === 'string' ? parseLocalDateTime(date) : date;
  
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converts local datetime-local value to ISO string for API storage
 */
export function toISOString(dateTimeLocalValue: string): string {
  const date = parseLocalDateTime(dateTimeLocalValue);
  return date.toISOString();
}

/**
 * Pre-defined vibrant colors for well-known tools.
 * New tools will use deterministic HSL hashes.
 */
export const TOOL_COLORS: Record<string, string> = {
  'ChatGPT': 'bg-green-600',
  'Claude': 'bg-amber-600',
  'Zapier': 'bg-orange-500',
  'Make': 'bg-purple-600',
  'Loom': 'bg-indigo-500',
  'Twilio': 'bg-red-500',
  'Canva': 'bg-cyan-500',
  'Notion': 'bg-neutral-800'
};

/**
 * Generates a deterministic, readable color for any text.
 * Falls back to custom DB maps or predefined tailwind classes if available.
 */
export function getToolColor(toolName: string, customColorMap?: Record<string, string>): string {
  if (!toolName) return 'bg-gray-600';
  
  // 1. Check custom DB overrides first
  if (customColorMap) {
    const customMatch = Object.keys(customColorMap).find(k => k.toLowerCase() === toolName.toLowerCase());
    if (customMatch && customColorMap[customMatch]) return customColorMap[customMatch];
  }

  // 2. Check predefined text matches perfectly (case insensitive fallback handling)
  const exactMatch = Object.keys(TOOL_COLORS).find(k => k.toLowerCase() === toolName.toLowerCase());
  if (exactMatch) return TOOL_COLORS[exactMatch];

  // 3. Deterministic hash based on characters
  let hash = 0;
  for (let i = 0; i < toolName.length; i++) {
    hash = toolName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to an HSL color with fixed saturation and lightness
  // Saturation 75% for richness, Lightness 40% for strong white contrast
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 75%, 40%)`;
}