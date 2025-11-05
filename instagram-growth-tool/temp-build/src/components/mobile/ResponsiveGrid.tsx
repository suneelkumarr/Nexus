import React, { useMemo } from 'react'
import { useIsMobile, useBreakpoint } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  minItemWidth?: string
  maxItems?: number
  adaptive?: boolean
}

const spacingClasses = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

export default function ResponsiveGrid({
  children,
  className,
  spacing = 'md',
  columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  minItemWidth = '280px',
  maxItems,
  adaptive = true,
}: ResponsiveGridProps) {
  const isMobile = useIsMobile()
  const { currentBreakpoint } = useBreakpoint()

  // Get the appropriate column count for the current breakpoint
  const getColumnCount = () => {
    if (maxItems && React.Children.count(children) <= maxItems) {
      return React.Children.count(children)
    }
    
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    const currentIndex = breakpoints.indexOf(currentBreakpoint)
    
    // Find the first breakpoint that matches or is smaller
    for (let i = currentIndex; i >= 0; i--) {
      const breakpoint = breakpoints[i]
      if (columns[breakpoint]) {
        return columns[breakpoint]
      }
    }
    
    return columns.xs || 1
  }

  const columnCount = getColumnCount()

  // Memoized grid styles for performance
  const gridStyles = useMemo(() => {
    if (!adaptive) {
      return {
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        minItemWidth,
      }
    }

    if (isMobile && columnCount === 1) {
      return {
        gridTemplateColumns: '1fr',
        minItemWidth: '100%',
      }
    }

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, ${columnCount}fr))`,
      gridAutoRows: 'minmax(120px, auto)',
      gap: spacingClasses[spacing],
    }
  }, [columnCount, spacing, isMobile, adaptive, minItemWidth])

  return (
    <div
      className={cn(
        'w-full',
        spacingClasses[spacing],
        className
      )}
      style={gridStyles}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className="min-w-0" // Prevent overflow
          style={{
            gridColumn: adaptive ? 'auto' : undefined,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Specialized grid components
interface CardsGridProps extends Omit<ResponsiveGridProps, 'children'> {
  cards: Array<{
    id: string | number
    title?: string
    subtitle?: string
    content?: React.ReactNode
    image?: string
    icon?: React.ComponentType<{ size?: number; className?: string }>
    actions?: React.ReactNode
    variant?: 'default' | 'compact' | 'featured'
    className?: string
  }>
  renderCard?: (card: any, index: number) => React.ReactNode
}

export function CardsGrid({
  cards,
  renderCard,
  variant = 'default',
  className,
  ...gridProps
}: CardsGridProps) {
  const defaultRenderCard = (card: any, index: number) => (
    <div
      className={cn(
        'mobile-card p-4 hover:shadow-md transition-all duration-200 cursor-pointer',
        card.className
      )}
      key={card.id}
    >
      {variant === 'featured' && (
        <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg mb-4 flex items-center justify-center">
          {card.icon && <card.icon size={32} className="text-primary-600 dark:text-primary-400" />}
        </div>
      )}

      {variant !== 'compact' && (
        <div className="mb-3">
          {card.title && (
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {card.title}
            </h3>
          )}
          {card.subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {card.subtitle}
            </p>
          )}
        </div>
      )}

      {card.image && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img
            src={card.image}
            alt={card.title || 'Card image'}
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {card.content && (
        <div className="mb-3">
          {card.content}
        </div>
      )}

      {card.actions && (
        <div className="flex justify-end space-x-2 mt-3">
          {card.actions}
        </div>
      )}
    </div>
  )

  return (
    <ResponsiveGrid {...gridProps} className={className}>
      {cards.map((card, index) => 
        renderCard ? renderCard(card, index) : defaultRenderCard(card, index)
      )}
    </ResponsiveGrid>
  )
}

interface MetricsGridProps {
  metrics: Array<{
    id: string | number
    title: string
    value: string | number
    change?: number
    trend?: 'up' | 'down' | 'neutral'
    icon?: React.ComponentType<{ size?: number; className?: string }>
    color?: string
    formatter?: (value: any) => string
  }>
  className?: string
}

export function MetricsGrid({ metrics, className }: MetricsGridProps) {
  return (
    <ResponsiveGrid
      columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
      spacing="md"
      className={className}
    >
      {metrics.map((metric) => {
        const Icon = metric.icon
        
        const getTrendColor = () => {
          switch (metric.trend) {
            case 'up':
              return 'text-green-600 dark:text-green-400'
            case 'down':
              return 'text-red-600 dark:text-red-400'
            default:
              return 'text-gray-600 dark:text-gray-400'
          }
        }

        const formatValue = metric.formatter 
          ? metric.formatter(metric.value)
          : metric.value.toString()

        return (
          <div
            key={metric.id}
            className="mobile-card p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              {Icon && (
                <Icon 
                  size={20} 
                  className={cn('text-gray-500', metric.color)} 
                />
              )}
              {metric.change && (
                <span className={cn('text-sm font-medium', getTrendColor())}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatValue}
              </p>
            </div>
          </div>
        )
      })}
    </ResponsiveGrid>
  )
}

interface MasonryGridProps {
  children: React.ReactNode[]
  columns?: number
  gap?: number
  className?: string
}

export function MasonryGrid({
  children,
  columns = 2,
  gap = 16,
  className,
}: MasonryGridProps) {
  const isMobile = useIsMobile()
  
  // Use CSS columns for true masonry layout
  const columnCount = isMobile ? 1 : columns

  return (
    <div
      className={cn('columns-1 sm:columns-2 lg:columns-3', className)}
      style={{
        columnCount,
        columnGap: `${gap}px`,
      }}
    >
      {React.Children.map(children, (child) => (
        <div
          className="break-inside-avoid mb-4"
          style={{
            marginBottom: `${gap}px`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

interface StickyGridProps extends ResponsiveGridProps {
  stickyHeader?: boolean
  stickyFooter?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function StickyGrid({
  stickyHeader = false,
  stickyFooter = false,
  header,
  footer,
  children,
  className,
  ...gridProps
}: StickyGridProps) {
  const isMobile = useIsMobile()

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {stickyHeader && header && (
        <div className={cn(
          'flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
          isMobile ? 'sticky top-0 z-10' : 'relative'
        )}>
          {header}
        </div>
      )}

      <div className="flex-1 overflow-y-auto mobile-scroll">
        <ResponsiveGrid {...gridProps}>
          {children}
        </ResponsiveGrid>
      </div>

      {stickyFooter && footer && (
        <div className={cn(
          'flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700',
          isMobile ? 'sticky bottom-0 z-10' : 'relative'
        )}>
          {footer}
        </div>
      )}
    </div>
  )
}