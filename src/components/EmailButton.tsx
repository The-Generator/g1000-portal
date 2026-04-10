'use client';

import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { generateMailtoUrl, EmailTemplate } from '@/lib/emailTemplates';

interface EmailButtonProps {
  template: EmailTemplate;
  buttonText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  className?: string;
  onClick?: () => void; // Optional callback for analytics or tracking
}

export default function EmailButton({
  template,
  buttonText = 'Send Email',
  variant = 'primary',
  size = 'md',
  icon = true,
  className = '',
  onClick
}: EmailButtonProps) {
  const handleClick = () => {
    // Call optional onClick handler (for analytics, etc.)
    if (onClick) {
      onClick();
    }

    // Generate and open mailto link in new tab
    const mailtoUrl = generateMailtoUrl(template);
    window.open(mailtoUrl, '_blank');
  };

  // Variant styles - Updated to use generator theme colors
  const variantStyles = {
    primary: 'bg-generator-green hover:bg-generator-dark text-white border-generator-green shadow-md hover:shadow-lg',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600 shadow-md hover:shadow-lg',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-sm hover:shadow-md',
    success: 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-md hover:shadow-lg'
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg border
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-generator-green
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon && (
        <EnvelopeIcon className={`${iconSizes[size]} ${buttonText ? 'mr-2' : ''}`} />
      )}
      {buttonText}
    </button>
  );
}

// Convenience component for inline email links
export function EmailLink({
  template,
  linkText = 'Send Email',
  className = '',
  onClick
}: {
  template: EmailTemplate;
  linkText?: string;
  className?: string;
  onClick?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (onClick) {
      onClick();
    }

    const mailtoUrl = generateMailtoUrl(template);
    window.location.href = mailtoUrl;
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className={`text-generator-green hover:text-generator-dark underline inline-flex items-center transition-colors duration-200 ${className}`}
    >
      <EnvelopeIcon className="w-4 h-4 mr-1" />
      {linkText}
    </a>
  );
}

// Toast notification component for email button feedback
export function EmailButtonWithToast({
  template,
  buttonText = 'Send Email',
  variant = 'primary',
  size = 'md',
  toastMessage = 'Opening email client...',
  className = ''
}: EmailButtonProps & { toastMessage?: string }) {
  const handleClick = () => {
    // Import toast dynamically to avoid dependency issues
    import('react-hot-toast').then(({ default: toast }) => {
      toast.success(toastMessage);
    });
  };

  return (
    <EmailButton
      template={template}
      buttonText={buttonText}
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    />
  );
}