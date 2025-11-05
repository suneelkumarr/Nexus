import React, { useState, useRef, useEffect } from 'react'
import { useIsMobile, useBreakpoint } from '@/hooks/use-mobile'
import { useTouchGestures, useHapticFeedback } from '@/hooks/use-touch-gestures'
import { 
  Plus, 
  X, 
  Edit, 
  Share2, 
  Camera, 
  MessageSquare, 
  TrendingUp,
  Search,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileFABProps {
  onAction?: (action: string) => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  actions?: Array<{
    id: string
    label: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    color?: string
    badge?: number
    onClick: () => void
  }>
  className?: string
}

const defaultActions = [
  {
    id: 'create-post',
    label: 'Create Post',
    icon: Edit,
    onClick: () => {},
  },
  {
    id: 'take-photo',
    label: 'Take Photo',
    icon: Camera,
    onClick: () => {},
  },
  {
    id: 'share',
    label: 'Share',
    icon: Share2,
    onClick: () => {},
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: TrendingUp,
    badge: 3,
    onClick: () => {},
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    onClick: () => {},
  },
  {
    id: 'message',
    label: 'Message',
    icon: MessageSquare,
    badge: 2,
    onClick: () => {},
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    onClick: () => {},
  },
]

export default function MobileFAB({
  onAction,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  actions = defaultActions,
  className,
}: MobileFABProps) {
  const isMobile = useIsMobile()
  const { isTablet } = useBreakpoint()
  const { vibrateShort, vibrateSuccess, vibrateError } = useHapticFeedback()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const fabRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Don't render on desktop (use tooltips instead)
  if (!isMobile && !isTablet) {
    return null
  }

  const toggleExpanded = () => {
    vibrateShort()
    setIsExpanded(!isExpanded)
  }

  const handleAction = (action: typeof actions[0]) => {
    vibrateSuccess()
    onAction?.(action.id)
    action.onClick()
    setIsExpanded(false)
  }

  const getPositionClasses = () => {
    const positions = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
    }
    return positions[position]
  }

  const getSizeClasses = () => {
    const sizes = {
      sm: 'w-10 h-10',
      md: 'w-14 h-14',
      lg: 'w-16 h-16',
    }
    return sizes[size]
  }

  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/30',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg shadow-gray-600/30',
      success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-600/30',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30',
    }
    return variants[variant]
  }

  const getIconSize = () => {
    const sizes = {
      sm: 18,
      md: 24,
      lg: 28,
    }
    return sizes[size]
  }

  // Touch gestures for the FAB
  useTouchGestures({
    onTap: () => {
      if (isExpanded) {
        setIsExpanded(false)
      } else {
        toggleExpanded()
      }
    },
    onSwipeDown: () => {
      setIsExpanded(false)
    },
  })

  // Handle drag for custom positioning
  const handleDragStart = (e: React.TouchEvent) => {
    vibrateShort()
    setIsDragging(true)
    
    const touch = e.touches[0]
    const rect = fabRef.current?.getBoundingClientRect()
    
    if (rect) {
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      })
    }
  }

  const handleDragMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const touch = e.touches[0]
    const container = containerRef.current
    const fab = fabRef.current

    if (container && fab) {
      const containerRect = container.getBoundingClientRect()
      const fabRect = fab.getBoundingClientRect()
      
      let newX = touch.clientX - containerRect.left - dragOffset.x
      let newY = touch.clientY - containerRect.top - dragOffset.y

      // Constrain to container bounds
      const maxX = containerRect.width - fabRect.width - 16
      const maxY = containerRect.height - fabRect.height - 16

      newX = Math.max(16, Math.min(newX, maxX))
      newY = Math.max(16, Math.min(newY, maxY))

      fab.style.left = `${newX}px`
      fab.style.top = `${newY}px`
      fab.style.right = 'auto'
      fab.style.bottom = 'auto'
    }
  }

  const handleDragEnd = () => {
    if (!isDragging) return

    setIsDragging(false)
    vibrateSuccess()

    // Save position to localStorage
    const fab = fabRef.current
    if (fab) {
      const rect = fab.getBoundingClientRect()
      localStorage.setItem('fab-position', JSON.stringify({
        x: rect.left,
        y: rect.top,
      }))
    }
  }

  // Load saved position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('fab-position')
    if (savedPosition && fabRef.current) {
      try {
        const { x, y } = JSON.parse(savedPosition)
        fabRef.current.style.left = `${x}px`
        fabRef.current.style.top = `${y}px`
        fabRef.current.style.right = 'auto'
        fabRef.current.style.bottom = 'auto'
      } catch (error) {
        console.warn('Failed to load FAB position:', error)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-40">
      {/* Expanded Action Buttons */}
      {isExpanded && (
        <div className="absolute inset-0 pointer-events-auto">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          />

          {/* Action Buttons */}
          <div className="absolute">
            {actions.map((action, index) => {
              const Icon = action.icon
              const angle = (index / actions.length) * 2 * Math.PI - Math.PI / 2
              const radius = 80
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  className={cn(
                    'absolute w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                    'shadow-lg hover:shadow-xl hover:scale-110 active:scale-95',
                    'mobile-bounce',
                    action.color || 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  )}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    animationDelay: `${index * 50}ms`,
                  }}
                  aria-label={action.label}
                >
                  <Icon size={20} />
                  {action.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {action.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Main FAB */}
      <div
        ref={fabRef}
        className={cn(
          'mobile-fab pointer-events-auto',
          getPositionClasses(),
          getSizeClasses(),
          getVariantClasses(),
          isExpanded && 'rotate-45',
          isDragging && 'scale-110 shadow-2xl',
          className
        )}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {isExpanded ? (
          <X size={getIconSize()} />
        ) : (
          <Plus size={getIconSize()} />
        )}

        {/* Pulse animation for attention */}
        {!isExpanded && (
          <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-20" />
        )}
      </div>

      {/* Drag instruction tooltip */}
      {isDragging && (
        <div className="absolute bottom-20 left-4 right-4 bg-black/80 text-white text-xs p-2 rounded-lg text-center">
          Release to save position
        </div>
      )}
    </div>
  )
}

// Specialized FAB variants
interface CreatePostFABProps {
  onCreatePost?: () => void
  onOtherAction?: (action: string) => void
}

export function CreatePostFAB({ onCreatePost, onOtherAction }: CreatePostFABProps) {
  const createActions = [
    {
      id: 'photo',
      label: 'Photo',
      icon: Camera,
      color: 'bg-blue-500 text-white',
      onClick: onCreatePost || (() => {}),
    },
    {
      id: 'story',
      label: 'Story',
      icon: Edit,
      color: 'bg-purple-500 text-white',
      onClick: () => onOtherAction?.('story'),
    },
    {
      id: 'reel',
      label: 'Reel',
      icon: Camera,
      color: 'bg-pink-500 text-white',
      onClick: () => onOtherAction?.('reel'),
    },
    {
      id: 'live',
      label: 'Live',
      icon: MessageSquare,
      color: 'bg-red-500 text-white',
      onClick: () => onOtherAction?.('live'),
    },
  ]

  return (
    <MobileFAB
      actions={createActions}
      onAction={(action) => onOtherAction?.(action)}
      variant="primary"
      size="lg"
      position="bottom-right"
    />
  )
}

interface QuickActionsFABProps {
  onQuickAction?: (action: string) => void
  notificationCount?: number
}

export function QuickActionsFAB({ onQuickAction, notificationCount }: QuickActionsFABProps) {
  const quickActions = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      badge: notificationCount || undefined,
      color: 'bg-blue-500 text-white',
      onClick: () => onQuickAction?.('analytics'),
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      color: 'bg-green-500 text-white',
      onClick: () => onQuickAction?.('search'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: 'bg-gray-500 text-white',
      onClick: () => onQuickAction?.('settings'),
    },
  ]

  return (
    <MobileFAB
      actions={quickActions}
      onAction={(action) => onQuickAction?.(action)}
      variant="secondary"
      size="md"
      position="bottom-left"
    />
  )
}