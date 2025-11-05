import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HoverableCardProps {
  children: ReactNode;
  className?: string;
  hoverScale?: boolean;
  hoverShadow?: boolean;
  hoverBorder?: boolean;
  subtleShadow?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6', 
  lg: 'p-8',
  xl: 'p-10'
};

const roundedClasses = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl', 
  xl: 'rounded-3xl'
};

export default function HoverableCard({
  children,
  className,
  hoverScale = true,
  hoverShadow = true,
  hoverBorder = true,
  subtleShadow = true,
  padding = 'md',
  rounded = 'lg',
  onClick,
  onHover,
  disabled = false,
  loading = false
}: HoverableCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    if (!disabled && !loading) {
      setIsHovered(true);
      onHover?.(true);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && !loading) {
      setIsHovered(false);
      onHover?.(false);
    }
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        // Base styles
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'transition-all duration-300 ease-out',
        'transform-gpu will-change-transform',
        
        // Padding and rounded
        paddingClasses[padding],
        roundedClasses[rounded],
        
        // Subtle shadow
        subtleShadow && 'shadow-sm',
        
        // Hover effects
        !disabled && !loading && 'cursor-pointer',
        
        // Scale on hover
        hoverScale && isHovered && 'scale-[1.02]',
        
        // Shadow on hover
        hoverShadow && isHovered && 'shadow-lg dark:shadow-xl',
        
        // Border on hover
        hoverBorder && isHovered && 'border-gray-300 dark:border-gray-600',
        
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        
        // Loading state
        loading && 'cursor-wait',
        
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
}