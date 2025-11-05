import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useIsMobile, useBreakpoint, useDeviceOrientation } from '@/hooks/use-mobile'
import { useTouchGestures, useHapticFeedback } from '@/hooks/use-touch-gestures'
import { cn } from '@/lib/utils'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  side?: 'left' | 'right'
  title?: string
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  allowSwipeToClose?: boolean
  width?: string
}

export default function MobileDrawer({
  isOpen,
  onClose,
  side = 'left',
  title,
  children,
  className,
  showCloseButton = true,
  allowSwipeToClose = true,
  width = '80vw',
}: MobileDrawerProps) {
  const isMobile = useIsMobile()
  const { isTablet } = useBreakpoint()
  const { vibrateShort, vibrateSuccess } = useHapticFeedback()
  const drawerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, time: 0 })

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    vibrateShort()
    onClose()
  }

  // Touch gestures for the drawer
  const touchGestures = useTouchGestures({
    onSwipeLeft: side === 'right' ? handleClose : undefined,
    onSwipeRight: side === 'left' ? handleClose : undefined,
    onTap: (e) => {
      // Close when tapping outside drawer
      if (e.target === e.currentTarget) {
        handleClose()
      }
    },
    threshold: 50,
  })

  // Handle drag gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!allowSwipeToClose) return

    const touch = e.touches[0]
    const drawerRect = drawerRef.current?.getBoundingClientRect()
    
    // Only allow dragging if starting from the edge
    if (side === 'left' && touch.clientX > 20) return
    if (side === 'right' && touch.clientX < window.innerWidth - 20) return

    setDragStart({
      x: touch.clientX,
      time: Date.now(),
    })
    setIsDragging(true)
    vibrateShort()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !allowSwipeToClose) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x

    // Prevent horizontal scroll when dragging drawer
    e.preventDefault()

    if (drawerRef.current) {
      if (side === 'left') {
        const translateX = Math.max(0, Math.min(deltaX, window.innerWidth))
        drawerRef.current.style.transform = `translateX(${translateX}px)`
      } else {
        const translateX = Math.min(0, Math.max(deltaX, -window.innerWidth))
        drawerRef.current.style.transform = `translateX(${translateX}px)`
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !allowSwipeToClose) return

    setIsDragging(false)

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - dragStart.x
    const deltaTime = Date.now() - dragStart.time
    const velocity = Math.abs(deltaX) / deltaTime

    // Reset transform
    if (drawerRef.current) {
      drawerRef.current.style.transform = ''
    }

    // Close drawer if swipe with sufficient velocity or distance
    if (Math.abs(deltaX) > 80 || velocity > 0.3) {
      handleClose()
    } else {
      vibrateSuccess()
    }
  }

  if (!isOpen) return null

  const drawerContent = (
    <div className="mobile-sheet" onClick={handleClose}>
      <div
        ref={drawerRef}
        className={cn(
          'mobile-drawer',
          side === 'left' ? 'left-0' : 'right-0',
          isOpen && 'open',
          className
        )}
        style={{ width }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'mobile-drawer-title' : undefined}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 
              id="mobile-drawer-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 touch-target"
                aria-label="Close drawer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto mobile-scroll p-4">
          {children}
        </div>
      </div>
    </div>
  )

  // Use portal to render drawer at document level
  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body)
  }

  return drawerContent
}

// Specialized drawer components
interface NavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function NavigationDrawer({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  user,
}: NavigationDrawerProps) {
  const { vibrateShort } = useHapticFeedback()

  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: '🏠',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📊',
    },
    {
      id: 'content',
      label: 'Content',
      icon: '📝',
    },
    {
      id: 'research',
      label: 'Research',
      icon: '🔍',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
    },
  ]

  return (
    <MobileDrawer 
      isOpen={isOpen} 
      onClose={onClose}
      side="left"
      title="Menu"
      width="280px"
    >
      {/* User Profile Section */}
      {user && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              vibrateShort()
              onTabChange(item.id)
              onClose()
            }}
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 touch-target',
              activeTab === item.id
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200 touch-target">
          <span className="text-lg">🚪</span>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </MobileDrawer>
  )
}

interface ActionDrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  actions: Array<{
    label: string
    onClick: () => void
    icon?: string
    variant?: 'default' | 'destructive' | 'primary'
    disabled?: boolean
  }>
}

export function ActionDrawer({ isOpen, onClose, title = 'Actions', actions }: ActionDrawerProps) {
  const { vibrateShort } = useHapticFeedback()

  return (
    <MobileDrawer 
      isOpen={isOpen} 
      onClose={onClose}
      side="right"
      title={title}
      width="280px"
    >
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              vibrateShort()
              action.onClick()
            }}
            disabled={action.disabled}
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 touch-target',
              action.variant === 'destructive'
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : action.variant === 'primary'
                ? 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              action.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {action.icon && <span className="text-lg">{action.icon}</span>}
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </MobileDrawer>
  )
}