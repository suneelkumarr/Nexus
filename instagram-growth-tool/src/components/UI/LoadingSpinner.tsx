import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'success' | 'warning' | 'error';
  className?: string;
  text?: string;
  textPosition?: 'right' | 'bottom';
  variant?: 'default' | 'dots' | 'pulse' | 'bars';
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4', 
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16'
};

const colorClasses = {
  primary: 'border-primary-500 border-t-transparent',
  secondary: 'border-secondary-500 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent',
  success: 'border-green-500 border-t-transparent',
  warning: 'border-yellow-500 border-t-transparent',
  error: 'border-red-500 border-t-transparent'
};

const renderSpinner = (size: string, color: string, variant: string) => {
  switch (variant) {
    case 'dots':
      return (
        <div className="flex gap-1">
          <div className={cn(sizeClasses[size as keyof typeof sizeClasses], 'bg-current rounded-full animate-bounce', color)} />
          <div className={cn(sizeClasses[size as keyof typeof sizeClasses], 'bg-current rounded-full animate-bounce', color, 'animation-delay-75')} />
          <div className={cn(sizeClasses[size as keyof typeof sizeClasses], 'bg-current rounded-full animate-bounce', color, 'animation-delay-150')} />
        </div>
      );
    
    case 'pulse':
      return (
        <div className={cn('bg-current rounded-full animate-pulse', sizeClasses[size as keyof typeof sizeClasses], color.replace('border-', 'bg-').replace('border-t-transparent', ''))} />
      );
    
    case 'bars':
      return (
        <div className="flex gap-1 items-end">
          <div className={cn('bg-current rounded-sm animate-pulse', color)} style={{ height: '60%', animationDelay: '0ms', animationDuration: '800ms' }} />
          <div className={cn('bg-current rounded-sm animate-pulse', color)} style={{ height: '100%', animationDelay: '200ms', animationDuration: '800ms' }} />
          <div className={cn('bg-current rounded-sm animate-pulse', color)} style={{ height: '80%', animationDelay: '400ms', animationDuration: '800ms' }} />
          <div className={cn('bg-current rounded-sm animate-pulse', color)} style={{ height: '40%', animationDelay: '600ms', animationDuration: '800ms' }} />
        </div>
      );
    
    default:
      return (
        <div className={cn('border-2 rounded-full animate-spin', sizeClasses[size as keyof typeof sizeClasses], color)} />
      );
  }
};

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className,
  text,
  textPosition = 'right',
  variant = 'default'
}: LoadingSpinnerProps) {
  const colorClass = colorClasses[color];
  
  const content = (
    <>
      {renderSpinner(size, colorClass, variant)}
      {text && (
        <span className={cn(
          'text-sm font-medium',
          textPosition === 'right' ? 'ml-2' : 'mt-2',
          color === 'white' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
        )}>
          {text}
        </span>
      )}
    </>
  );

  if (text && textPosition === 'right') {
    return (
      <div className={cn('flex items-center', className)}>
        {content}
      </div>
    );
  }

  if (text && textPosition === 'bottom') {
    return (
      <div className={cn('flex flex-col items-center', className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {renderSpinner(size, colorClass, variant)}
    </div>
  );
}

// Specialized spinner components for common use cases
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <LoadingSpinner size="xl" text={text} textPosition="bottom" />
  </div>
);

export const ComponentLoader: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Loading...', 
  className 
}) => (
  <div className={cn('flex items-center justify-center py-8', className)}>
    <LoadingSpinner size="lg" text={text} textPosition="bottom" />
  </div>
);

export const InlineLoader: React.FC<{ text?: string; className?: string }> = ({ 
  text, 
  className 
}) => (
  <div className={cn('inline-flex items-center', className)}>
    <LoadingSpinner size="sm" text={text} />
  </div>
);

export const ButtonLoader: React.FC = () => (
  <LoadingSpinner size="xs" color="white" />
);

export const DotsLoader: React.FC<{ className?: string; color?: string }> = ({ 
  className, 
  color = 'currentColor' 
}) => (
  <div className={cn('flex items-center gap-1', className)}>
    <div className={cn('w-2 h-2 rounded-full animate-bounce', `bg-${color}`)} style={{ animationDelay: '0ms' }} />
    <div className={cn('w-2 h-2 rounded-full animate-bounce', `bg-${color}`)} style={{ animationDelay: '150ms' }} />
    <div className={cn('w-2 h-2 rounded-full animate-bounce', `bg-${color}`)} style={{ animationDelay: '300ms' }} />
  </div>
);