/**
 * DEPRECATED: Email service utility for SendGrid
 * This file is kept for reference but is no longer used.
 * The application now uses manual email sending through mailto: links.
 * See /src/lib/emailTemplates.ts for the current email implementation.
 */

// Email service utility for SendGrid
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  console.warn('SENDGRID_API_KEY is not set. Emails will not be sent.');
} else {
  sgMail.setApiKey(apiKey);
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // Skip if no API key
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('Email not sent - SENDGRID_API_KEY not configured');
    return;
  }

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@babson.edu', // Use env variable or default
    subject,
    text: text || '',
    html,
  };

  try {
    console.log('Sending email with details:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      hasText: !!msg.text,
      hasHtml: !!msg.html
    });

    const result = await sgMail.send(msg);
    console.log('Email sent successfully to:', to);
    console.log('SendGrid response status:', result[0]?.statusCode);
    return result;
  } catch (error: any) {
    console.error('Email sending failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.body
    });
    throw error;
  }
}

export async function sendVerificationCode(email: string, code: string) {
  const subject = 'Your G1000 Portal Verification Code';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #006744, #789b4a); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-family: 'Trade Gothic Condensed', Arial, sans-serif;">
          G1000 Portal
        </h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #006744; margin-bottom: 20px;">Verification Code</h2>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          Welcome to the G1000 Portal! Please use the verification code below to complete your sign-in:
        </p>
        
        <div style="background: #f8f9fa; border: 2px solid #006744; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <div style="font-size: 32px; font-weight: bold; color: #006744; letter-spacing: 3px;">
            ${code}
          </div>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          This code will expire in 15 minutes. If you didn't request this code, please ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © 2024 G1000 Portal - Connecting Babson Students with Real-World Projects
        </p>
      </div>
    </div>
  `;
  
  const text = `
    G1000 Portal Verification Code
    
    Your verification code is: ${code}
    
    This code will expire in 15 minutes.
    
    If you didn't request this code, please ignore this email.
  `;

  await sendEmail({ to: email, subject, html, text });
}

export async function sendApplicationNotification(
  businessOwnerEmail: string,
  projectTitle: string,
  studentName: string
) {
  const subject = `New Application for "${projectTitle}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #006744, #789b4a); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-family: 'Trade Gothic Condensed', Arial, sans-serif;">
          G1000 Portal
        </h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #006744; margin-bottom: 20px;">New Application Received</h2>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          Great news! You've received a new application for your project:
        </p>
        
        <div style="background: #f8f9fa; border-left: 4px solid #006744; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #006744;">${projectTitle}</h3>
          <p style="margin: 0; color: #666;">Application from: <strong>${studentName}</strong></p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/projects" 
             style="background: #006744; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Application
          </a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © 2024 G1000 Portal - Connecting Babson Students with Real-World Projects
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: businessOwnerEmail, subject, html });
}

export async function sendInterviewInvitation(
  studentEmail: string,
  projectTitle: string,
  meetingDateTime: string,
  meetingLink?: string
) {
  const subject = `Interview Invitation - ${projectTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #006744, #789b4a); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-family: 'Trade Gothic Condensed', Arial, sans-serif;">
          G1000 Portal
        </h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #006744; margin-bottom: 20px;">Interview Invitation</h2>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          Congratulations! You've been invited to an interview for:
        </p>
        
        <div style="background: #f8f9fa; border-left: 4px solid #5bbbb7; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #006744;">${projectTitle}</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Date & Time:</strong> ${new Date(meetingDateTime).toLocaleString()}</p>
          ${meetingLink ? `<p style="margin: 5px 0; color: #666;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        </div>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/applications" 
             style="background: #5bbbb7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Application Details
          </a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © 2024 G1000 Portal - Connecting Babson Students with Real-World Projects
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: studentEmail, subject, html });
} 