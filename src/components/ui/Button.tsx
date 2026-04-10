import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading, 
    fullWidth = false,
    icon,
    iconPosition = 'left',
    rounded = 'xl',
    shadow = false,
    pulse = false,
    children, 
    disabled, 
    ...props 
  }, ref) => {
    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden',
          'transform-gpu backface-visibility-hidden',
          {
            // Width
            'w-full': fullWidth,
            
            // Rounded
            'rounded-md': rounded === 'sm',
            'rounded-lg': rounded === 'md',
            'rounded-xl': rounded === 'lg',
            'rounded-2xl': rounded === 'xl',
            'rounded-full': rounded === 'full',
            
            // Shadow
            'shadow-lg hover:shadow-xl': shadow && !disabled,
            
            // Pulse
            'animate-pulse-soft': pulse && !disabled && !loading,
            
            // Variants with gradient backgrounds
            'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 focus:ring-primary-500 shadow-primary-600/25': 
              variant === 'primary',
            'bg-gradient-to-r from-secondary-600 to-secondary-500 text-white hover:from-secondary-700 hover:to-secondary-600 focus:ring-secondary-500 shadow-secondary-600/25': 
              variant === 'secondary',
            'bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:from-accent-700 hover:to-accent-600 focus:ring-accent-500 shadow-accent-600/25': 
              variant === 'accent',
            'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:border-primary-700 focus:ring-primary-500': 
              variant === 'outline',
            'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-soft focus:ring-gray-400 border border-gray-200': 
              variant === 'ghost',
            'bg-gradient-to-r from-error-600 to-error-500 text-white hover:from-error-700 hover:to-error-600 focus:ring-error-500 shadow-error-600/25': 
              variant === 'danger',
            'bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500 text-white hover:from-primary-700 hover:via-accent-600 hover:to-secondary-600 focus:ring-accent-500 shadow-lg': 
              variant === 'gradient',
            
            // Sizes
            'px-2.5 py-1 text-xs gap-1': size === 'xs',
            'px-3 py-1.5 text-sm gap-1.5': size === 'sm',
            'px-5 py-2.5 text-sm gap-2': size === 'md',
            'px-6 py-3 text-base gap-2': size === 'lg',
            'px-8 py-4 text-lg gap-3': size === 'xl',
          },
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {/* Ripple effect background */}
        <span className="absolute inset-0 overflow-hidden rounded-inherit">
          <span className={clsx(
            "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300",
            "group-hover:opacity-10",
            {
              'from-white to-white': variant === 'primary' || variant === 'secondary' || variant === 'accent' || variant === 'danger' || variant === 'gradient',
              'from-primary-600 to-primary-600': variant === 'outline',
              'from-gray-900 to-gray-900': variant === 'ghost',
            }
          )} />
        </span>
        
        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center">
          {loading && (
            <svg
              className={clsx(
                'animate-spin h-4 w-4',
                children && 'mr-2'
              )}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {!loading && icon && iconPosition === 'left' && (
            <span className={clsx('inline-flex', children && 'mr-2')}>{icon}</span>
          )}
          {children}
          {!loading && icon && iconPosition === 'right' && (
            <span className={clsx('inline-flex', children && 'ml-2')}>{icon}</span>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };