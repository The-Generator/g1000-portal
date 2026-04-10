/**
 * Email template utilities for generating mailto: links
 * These functions create pre-filled email templates that open in the user's default email client
 */

export interface EmailTemplate {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

/**
 * Generates a mailto: URL from email template data
 */
export function generateMailtoUrl(template: EmailTemplate): string {
  const { to, subject, body, cc, bcc } = template;

  // Build query parameters array
  const params: string[] = [];

  // Properly encode each parameter for mailto: URLs
  // Note: encodeURIComponent is used, and spaces will be %20, not +
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  if (cc) params.push(`cc=${encodeURIComponent(cc)}`);
  if (bcc) params.push(`bcc=${encodeURIComponent(bcc)}`);

  // Construct mailto URL - don't encode the email address itself
  const queryString = params.join('&');
  return `mailto:${to}${queryString ? '?' + queryString : ''}`;
}

/**
 * Interview invitation email template
 */
export function generateInterviewInviteEmail(data: {
  studentEmail: string;
  studentName: string;
  projectTitle: string;
  companyName: string;
  ownerName: string;
  meetingDateTime: string;
  meetingLink?: string;
  message?: string;
}): EmailTemplate {
  const formattedDate = new Date(data.meetingDateTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  let body = `Dear ${data.studentName},

Congratulations! You've been invited to an interview for the following project:

Project: ${data.projectTitle}
Company: ${data.companyName}

Interview Details:
Date & Time: ${formattedDate}`;

  if (data.meetingLink) {
    body += `\nMeeting Link: ${data.meetingLink}`;
  }

  if (data.message) {
    body += `\n\nMessage from ${data.ownerName}:\n${data.message}`;
  }

  body += `\n\nPlease confirm your availability for this interview time. If you need to reschedule, please let me know as soon as possible.

Best regards,
${data.ownerName}
${data.companyName}

---
G1000 Portal - Connecting Babson Students with Real-World Projects`;

  return {
    to: data.studentEmail,
    subject: `Interview Invitation - ${data.projectTitle}`,
    body
  };
}

/**
 * Application acceptance email template
 */
export function generateAcceptanceEmail(data: {
  studentEmail: string;
  studentName: string;
  projectTitle: string;
  companyName: string;
  ownerName: string;
  message?: string;
}): EmailTemplate {
  let body = `Dear ${data.studentName},

Congratulations! We are pleased to inform you that your application for the following project has been ACCEPTED:

Project: ${data.projectTitle}
Company: ${data.companyName}`;

  if (data.message) {
    body += `\n\nMessage from ${data.ownerName}:\n${data.message}`;
  } else {
    body += `\n\nWe were impressed with your application and look forward to working with you on this project.`;
  }

  body += `\n\nNext Steps:
- We will be in touch shortly with project details and onboarding information
- Please check your G1000 Portal dashboard for updates
- Prepare any questions you may have about the project

Welcome to the team!

Best regards,
${data.ownerName}
${data.companyName}

---
G1000 Portal - Connecting Babson Students with Real-World Projects`;

  return {
    to: data.studentEmail,
    subject: `Application Accepted - ${data.projectTitle}`,
    body
  };
}

/**
 * Application rejection email template
 */
export function generateRejectionEmail(data: {
  studentEmail: string;
  studentName: string;
  projectTitle: string;
  companyName: string;
  ownerName: string;
  reason?: string;
}): EmailTemplate {
  let body = `Dear ${data.studentName},

Thank you for your interest in the following project:

Project: ${data.projectTitle}
Company: ${data.companyName}

After careful consideration, we have decided to move forward with other candidates for this position.`;

  if (data.reason) {
    body += `\n\nFeedback:\n${data.reason}`;
  } else {
    body += `\n\nWe appreciate the time you took to apply and encourage you to apply for other projects that match your skills and interests.`;
  }

  body += `\n\nWe wish you the best of luck in your future endeavors and hope you'll consider applying to our future projects.

Best regards,
${data.ownerName}
${data.companyName}

---
G1000 Portal - Connecting Babson Students with Real-World Projects`;

  return {
    to: data.studentEmail,
    subject: `Application Update - ${data.projectTitle}`,
    body
  };
}

/**
 * New application notification email template (for business owners)
 */
export function generateNewApplicationEmail(data: {
  ownerEmail: string;
  ownerName: string;
  studentName: string;
  projectTitle: string;
  applicationDate: string;
  coverLetter?: string;
}): EmailTemplate {
  const formattedDate = new Date(data.applicationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let body = `Dear ${data.ownerName},

You have received a new application for your project:

Project: ${data.projectTitle}
Applicant: ${data.studentName}
Application Date: ${formattedDate}`;

  if (data.coverLetter) {
    // Truncate cover letter if too long for mailto
    const truncatedLetter = data.coverLetter.length > 500
      ? data.coverLetter.substring(0, 500) + '...'
      : data.coverLetter;
    body += `\n\nCover Letter Preview:\n${truncatedLetter}`;
  }

  body += `\n\nTo review this application in detail:
1. Log into your G1000 Portal dashboard
2. Navigate to your project's applications
3. Review the applicant's full profile and materials

---
G1000 Portal - Connecting Babson Students with Real-World Projects`;

  return {
    to: data.ownerEmail,
    subject: `New Application - ${data.projectTitle} from ${data.studentName}`,
    body
  };
}

/**
 * Reschedule meeting email template
 */
export function generateRescheduleEmail(data: {
  studentEmail: string;
  studentName: string;
  projectTitle: string;
  companyName: string;
  ownerName: string;
  oldDateTime: string;
  newDateTime: string;
  reason?: string;
}): EmailTemplate {
  const oldDate = new Date(data.oldDateTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const newDate = new Date(data.newDateTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  let body = `Dear ${data.studentName},

We need to reschedule your interview for the following project:

Project: ${data.projectTitle}
Company: ${data.companyName}

Original Time: ${oldDate}
New Time: ${newDate}`;

  if (data.reason) {
    body += `\n\nReason for rescheduling:\n${data.reason}`;
  }

  body += `\n\nPlease confirm your availability for the new time. If this doesn't work for you, please let me know your availability and we can find another suitable time.

We apologize for any inconvenience this may cause.

Best regards,
${data.ownerName}
${data.companyName}

---
G1000 Portal - Connecting Babson Students with Real-World Projects`;

  return {
    to: data.studentEmail,
    subject: `Interview Rescheduled - ${data.projectTitle}`,
    body
  };
}

/**
 * Student request for update email template
 */
export function generateUpdateRequestEmail(data: {
  ownerEmail: string;
  ownerName: string;
  studentName: string;
  projectTitle: string;
  applicationDate: string;
}): EmailTemplate {
  const daysSince = Math.floor(
    (Date.now() - new Date(data.applicationDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const body = `Dear ${data.ownerName},

I hope this email finds you well. I wanted to follow up on my application for the following project:

Project: ${data.projectTitle}
Application submitted: ${daysSince} days ago

I remain very interested in this opportunity and would appreciate any update on the status of my application.

If you need any additional information or materials from me, please don't hesitate to let me know.

Thank you for your time and consideration.

Best regards,
${data.studentName}

---
G1000 Portal - Connecting Babson Students with Real-World Projects`;

  return {
    to: data.ownerEmail,
    subject: `Application Status Inquiry - ${data.projectTitle}`,
    body
  };
}