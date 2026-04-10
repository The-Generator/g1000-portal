'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  EnvelopeIcon,
  XMarkIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ApplicationEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityTitle: string;
  businessOwnerName: string;
  businessOwnerEmail?: string;
  studentName: string;
  onEmailSent?: () => void;
}

export default function ApplicationEmailModal({
  isOpen,
  onClose,
  opportunityTitle,
  businessOwnerName,
  businessOwnerEmail,
  studentName,
  onEmailSent
}: ApplicationEmailModalProps) {
  const [emailContent, setEmailContent] = useState('');

  // Generate default email content
  const defaultEmailContent = `Dear ${businessOwnerName},

I am writing to express my strong interest in the "${opportunityTitle}" opportunity posted on the G1000 Portal. I have just submitted my application and wanted to personally reach out to introduce myself.

I am excited about the possibility of contributing to your project and would be happy to discuss how my skills and experience align with your needs. I am available for an interview at your convenience.

Thank you for considering my application. I look forward to hearing from you soon.

Best regards,
${studentName}`;

  const handleSendEmail = () => {
    const messageToSend = emailContent || defaultEmailContent;

    // Create mailto link with the email content
    const subject = `New Application for: ${opportunityTitle}`;

    // Build the mailto URL
    const mailtoUrl = `mailto:${businessOwnerEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageToSend)}`;

    // Open the user's default email client
    window.open(mailtoUrl, '_blank');

    // Show success message and close
    toast.success('Email client opened! Please send the email from your email application.');

    // Close modal and redirect
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={handleSkip} />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Application Submitted Successfully!
                </h3>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Email Form */}
          <div className="px-6 py-4">
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <EnvelopeIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">
                  Notify the Business Owner
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Would you like to send a personalized email to {businessOwnerName} about your application?
                This can help you stand out and show your enthusiasm for the opportunity.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={8}
                  placeholder="Write a personalized message to the business owner..."
                  value={emailContent || defaultEmailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Feel free to customize this message or use the suggested template
                </p>
              </div>

              {businessOwnerEmail && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Email will be sent to:</span> {businessOwnerEmail}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
            >
              Skip for Now
            </Button>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setEmailContent(defaultEmailContent)}
              >
                Use Template
              </Button>
              <Button
                variant="primary"
                onClick={handleSendEmail}
                icon={<EnvelopeIcon className="w-4 h-4" />}
              >
                Open Email Client
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}