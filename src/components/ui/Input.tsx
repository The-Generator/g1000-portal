import { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  success?: boolean;
  variant?: 'default' | 'filled' | 'ghost';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  floatingLabel?: boolean;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    icon,
    iconPosition = 'left',
    success = false,
    variant = 'default',
    rounded = 'xl',
    floatingLabel = false,
    showPasswordToggle = false,
    type,
    placeholder,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;
    
    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && !floatingLabel && (
          <motion.label 
            className="block text-sm font-medium text-gray-700 mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </motion.label>
        )}
        
        <div className="relative">
          {floatingLabel && (
            <AnimatePresence>
              <motion.label
                className={clsx(
                  'absolute left-4 transition-all duration-200 pointer-events-none z-10',
                  {
                    'top-2.5 text-base text-gray-500': !isFocused && !hasValue,
                    '-top-2 left-3 text-xs bg-white px-1 text-primary-600': isFocused || hasValue,
                  }
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {label}
                {props.required && <span className="text-error-500 ml-1">*</span>}
              </motion.label>
            </AnimatePresence>
          )}
          
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={clsx(
              'w-full transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'placeholder:text-gray-400',
              {
                // Base padding
                'px-4 py-2.5': !icon,
                'pl-10 pr-4 py-2.5': icon && iconPosition === 'left',
                'pl-4 pr-10 py-2.5': icon && iconPosition === 'right',
                
                // Rounded
                'rounded-md': rounded === 'sm',
                'rounded-lg': rounded === 'md',
                'rounded-xl': rounded === 'lg',
                'rounded-2xl': rounded === 'xl',
                'rounded-full': rounded === 'full',
                
                // Variants
                'bg-white border shadow-sm': variant === 'default',
                'bg-gray-50 border-0 focus:bg-white': variant === 'filled',
                'bg-transparent border-0 border-b-2 rounded-none px-0 focus:ring-0': variant === 'ghost',
                
                // States
                'border-gray-200 hover:border-gray-300 focus:border-primary-500 focus:ring-primary-500/20': 
                  !error && !success && variant !== 'ghost',
                'border-error-300 focus:border-error-500 focus:ring-error-500/20': error,
                'border-success-300 focus:border-success-500 focus:ring-success-500/20': success,
                'border-gray-200 hover:border-gray-300 focus:border-primary-500': variant === 'ghost' && !error && !success,
                'border-error-500': variant === 'ghost' && error,
                'border-success-500': variant === 'ghost' && success,
                
                // Animation
                'transform hover:scale-[1.01]': variant !== 'ghost',
              },
              className
            )}
            placeholder={floatingLabel ? ' ' : placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          
          {icon && iconPosition === 'right' && !isPasswordField && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          
          {isPasswordField && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
          
          {/* Success checkmark */}
          {success && !error && (
            <motion.div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success-500"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.p 
              className="mt-1.5 text-sm text-error-600 flex items-center gap-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.p>
          )}
          {helperText && !error && (
            <motion.p 
              className="mt-1.5 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component with similar styling
const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'ghost';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
}>(
  ({ 
    className, 
    label, 
    error, 
    helperText,
    variant = 'default',
    rounded = 'xl',
    ...props 
  }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            'w-full px-4 py-2.5 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'placeholder:text-gray-400 resize-none',
            {
              // Rounded
              'rounded-md': rounded === 'sm',
              'rounded-lg': rounded === 'md',
              'rounded-xl': rounded === 'lg',
              'rounded-2xl': rounded === 'xl',
              
              // Variants
              'bg-white border shadow-sm': variant === 'default',
              'bg-gray-50 border-0 focus:bg-white': variant === 'filled',
              'bg-transparent border-0 border-b-2 rounded-none px-0 focus:ring-0': variant === 'ghost',
              
              // States
              'border-gray-200 hover:border-gray-300 focus:border-primary-500 focus:ring-primary-500/20': 
                !error && variant !== 'ghost',
              'border-error-300 focus:border-error-500 focus:ring-error-500/20': error,
              'border-gray-200 hover:border-gray-300 focus:border-primary-500': variant === 'ghost' && !error,
              'border-error-500': variant === 'ghost' && error,
            },
            className
          )}
          {...props}
        />
        <AnimatePresence>
          {error && (
            <motion.p 
              className="mt-1.5 text-sm text-error-600 flex items-center gap-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.p>
          )}
          {helperText && !error && (
            <motion.p 
              className="mt-1.5 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };