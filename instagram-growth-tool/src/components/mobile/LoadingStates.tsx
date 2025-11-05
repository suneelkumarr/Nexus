import React from 'react'
import { useIsMobile, useBreakpoint } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'shimmer'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
  text?: string
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const colorClasses = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  white: 'text-white',
  gray: 'text-gray-600',
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  className 
}: Omit<LoadingStateProps, 'variant'>) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )
}

export function LoadingDots({ 
  size = 'md', 
  color = 'primary',
  className 
}: Omit<LoadingStateProps, 'variant'>) {
  const dotSize = size === 'xs' ? 'w-1' : size === 'sm' ? 'w-1.5' : 'w-2'
  const spacing = size === 'xs' ? 'space-x-1' : 'space-x-2'

  return (
    <div className={cn('flex items-center', spacing, className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            dotSize,
            colorClasses[color] === 'text-white' ? 'bg-white' :
            colorClasses[color] === 'text-gray-600' ? 'bg-gray-600' :
            colorClasses[color] === 'text-secondary-600' ? 'bg-secondary-600' :
            'bg-primary-600'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  )
}

export function LoadingPulse({ 
  size = 'md', 
  color = 'primary',
  className 
}: Omit<LoadingStateProps, 'variant'>) {
  return (
    <div
      className={cn(
        'rounded-full animate-pulse',
        sizeClasses[size],
        colorClasses[color] === 'text-white' ? 'bg-white' :
        colorClasses[color] === 'text-gray-600' ? 'bg-gray-600' :
        colorClasses[color] === 'text-secondary-600' ? 'bg-secondary-600' :
        'bg-primary-600',
        className
      )}
    />
  )
}

export function LoadingShimmer({ 
  className 
}: Omit<LoadingStateProps, 'variant' | 'size' | 'color'>) {
  return (
    <div className={cn('relative overflow-hidden bg-gray-200 dark:bg-gray-700', className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
    </div>
  )
}

export function LoadingSkeleton({ 
  variant = 'rectangle',
  lines = 3,
  className 
}: { 
  variant?: 'rectangle' | 'circle' | 'text' | 'card'
  lines?: number
  className?: string
}) {
  const isMobile = useIsMobile()
  
  const renderSkeleton = () => {
    switch (variant) {
      case 'circle':
        return <LoadingShimmer className="rounded-full w-12 h-12" />
      
      case 'card':
        return (
          <div className={cn('mobile-card p-4 space-y-4', className)}>
            <div className="flex items-center space-x-4">
              <LoadingShimmer className="rounded-full w-12 h-12" />
              <div className="space-y-2 flex-1">
                <LoadingShimmer className="h-4 w-3/4" />
                <LoadingShimmer className="h-3 w-1/2" />
              </div>
            </div>
            <LoadingShimmer className="h-32 w-full rounded-lg" />
            <div className="space-y-2">
              <LoadingShimmer className="h-3 w-full" />
              <LoadingShimmer className="h-3 w-5/6" />
              <LoadingShimmer className="h-3 w-2/3" />
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className={cn('space-y-3', className)}>
            {Array.from({ length: lines }).map((_, i) => (
              <LoadingShimmer 
                key={i} 
                className={cn(
                  'h-4 rounded',
                  i === lines - 1 ? 'w-3/4' : 'w-full'
                )}
              />
            ))}
          </div>
        )
      
      default:
        return <LoadingShimmer className={cn('h-24 w-full rounded-lg', className)} />
    }
  }

  return renderSkeleton()
}

export function LoadingState({ 
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  className,
  text
}: LoadingStateProps) {
  const isMobile = useIsMobile()

  const renderLoader = () => {
    const props = { size, color, className }
    
    switch (variant) {
      case 'spinner':
        return <LoadingSpinner {...props} />
      case 'dots':
        return <LoadingDots {...props} />
      case 'pulse':
        return <LoadingPulse {...props} />
      case 'shimmer':
        return <LoadingShimmer {...props} />
      default:
        return <LoadingSpinner {...props} />
    }
  }

  if (!text) {
    return (
      <div className="flex items-center justify-center">
        {renderLoader()}
      </div>
    )
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      isMobile && 'py-8',
      className
    )}>
      {renderLoader()}
      <p className={cn(
        'text-sm text-gray-600 dark:text-gray-400 text-center',
        isMobile && 'px-4'
      )}>
        {text}
      </p>
    </div>
  )
}

// Specialized loading components for different use cases
export function FullScreenLoader({ text = 'Loading...', className }: { 
  text?: string
  className?: string 
}) {
  const isMobile = useIsMobile()
  
  return (
    <div className={cn(
      'fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50',
      isMobile && 'px-4',
      className
    )}>
      <LoadingState 
        variant="spinner" 
        size="lg" 
        text={text}
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
      />
    </div>
  )
}

export function InlineLoader({ text, className }: { 
  text?: string
  className?: string 
}) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <LoadingDots size="sm" text={text} />
    </div>
  )
}

export function CardLoader({ className }: { className?: string }) {
  return (
    <div className={cn('mobile-card p-6', className)}>
      <div className="flex items-center space-x-4 mb-4">
        <LoadingSkeleton variant="circle" />
        <div className="space-y-2">
          <LoadingShimmer className="h-4 w-32" />
          <LoadingShimmer className="h-3 w-24" />
        </div>
      </div>
      <LoadingShimmer className="h-40 w-full rounded-lg mb-4" />
      <div className="space-y-2">
        <LoadingShimmer className="h-3 w-full" />
        <LoadingShimmer className="h-3 w-5/6" />
        <LoadingShimmer className="h-3 w-4/6" />
      </div>
    </div>
  )
}

export function ListLoader({ 
  items = 3, 
  variant = 'card',
  className 
}: { 
  items?: number
  variant?: 'card' | 'line' | 'simple'
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <CardLoader key={i} />
      ))}
    </div>
  )
}

export function TableLoader({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number
  columns?: number
  className?: string 
}) {
  return (
    <div className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingShimmer key={i} className="h-6 w-full" />
        ))}
      </div>
      
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <LoadingShimmer 
                key={colIndex} 
                className={cn(
                  'h-4',
                  rowIndex === rows - 1 && colIndex === columns - 1 && 'w-3/4'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartLoader({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <LoadingState variant="shimmer" text="Loading chart data..." />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center">
            <LoadingShimmer className="h-4 w-16 mx-auto mb-2" />
            <LoadingShimmer className="h-3 w-12 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}