import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'elevated' | 'bordered' | 'glass' | 'gradient' | 'interactive';
  hover?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gradient?: boolean;
  glowOnHover?: boolean;
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'elevated',
    hover = false, 
    shadow = 'sm',
    rounded = '2xl',
    padding = 'lg',
    gradient = false,
    glowOnHover = false,
    children, 
    ...props 
  }, ref) => {
    const cardContent = (
      <div
        className={clsx(
          'relative',
          {
            // Base styles
            'bg-white': variant !== 'glass' && variant !== 'gradient',

            // Variants
            'shadow-soft': variant === 'elevated',
            'border border-gray-200': variant === 'bordered',
            'bg-white/80 backdrop-blur-md border border-white/20 shadow-xl': variant === 'glass',
            'bg-gradient-to-br from-white to-gray-50 shadow-soft': variant === 'gradient',
            'shadow-soft cursor-pointer': variant === 'interactive',

            // Hover effects (removed scale and shadow animations)
            '': hover && variant !== 'interactive',
            '': glowOnHover,
            
            // Shadow
            'shadow-none': shadow === 'none' || variant === 'flat',
            'shadow-sm': shadow === 'sm' && variant !== 'elevated' && variant !== 'interactive',
            'shadow-md': shadow === 'md',
            'shadow-lg': shadow === 'lg',
            'shadow-xl': shadow === 'xl',
            
            // Rounded
            'rounded-md': rounded === 'sm',
            'rounded-lg': rounded === 'md',
            'rounded-xl': rounded === 'lg',
            'rounded-2xl': rounded === 'xl',
            'rounded-3xl': rounded === '2xl',
            
            // Padding
            'p-0': padding === 'none',
            'p-4': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
            'p-10': padding === 'xl',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Gradient overlay for extra visual appeal */}
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 rounded-inherit pointer-events-none" />
        )}
        
        {/* Glow effect */}
        {glowOnHover && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-inherit opacity-0 hover:opacity-20 blur transition-opacity duration-300 pointer-events-none" />
        )}
        
        {children}
      </div>
    );

    return cardContent;
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('flex flex-col space-y-1.5 pb-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={clsx(
        'text-2xl font-bold leading-none tracking-tight',
        'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={clsx('text-sm text-gray-500 leading-relaxed', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('space-y-4', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'flex items-center pt-6 mt-6 border-t border-gray-100',
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

// Additional Card Components
const CardBadge = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
        {
          'bg-primary-100 text-primary-700 border border-primary-200': variant === 'primary',
          'bg-secondary-100 text-secondary-700 border border-secondary-200': variant === 'secondary',
          'bg-success-100 text-success-700 border border-success-200': variant === 'success',
          'bg-warning-100 text-warning-700 border border-warning-200': variant === 'warning',
          'bg-error-100 text-error-700 border border-error-200': variant === 'error',
          'bg-accent-100 text-accent-700 border border-accent-200': variant === 'info',
        },
        className
      )}
      {...props}
    />
  )
);
CardBadge.displayName = 'CardBadge';

const CardImage = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  src?: string;
  alt?: string;
  height?: string;
}>(
  ({ className, src, alt, height = 'h-48', ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'relative overflow-hidden -mx-8 -mt-8 mb-6',
        height,
        className
      )}
      {...props}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  )
);
CardImage.displayName = 'CardImage';

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  CardBadge,
  CardImage 
};