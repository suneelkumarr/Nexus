import React, { useState, useEffect } from 'react'
import { useIsMobile, useBreakpoint } from '@/hooks/use-mobile'
import { useHapticFeedback, useTouchGestures } from '@/hooks/use-touch-gestures'
import { 
  Home, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Settings, 
  User, 
  MessageCircle, 
  Bell, 
  Search,
  Plus,
  Menu,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: number
  color?: string
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Home',
    icon: Home,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: TrendingUp,
  },
  {
    id: 'content',
    label: 'Content',
    icon: Calendar,
  },
  {
    id: 'research',
    label: 'Research',
    icon: Search,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
  },
]

const quickActions: NavItem[] = [
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    badge: 3,
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    badge: 2,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
  },
]

export default function MobileNavigation({ 
  activeTab, 
  onTabChange, 
  className 
}: MobileNavigationProps) {
  const isMobile = useIsMobile()
  const { isTablet } = useBreakpoint()
  const { vibrateShort, vibrateSuccess } = useHapticFeedback()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)

  // Don't render mobile navigation on desktop
  if (!isMobile && !isTablet) {
    return null
  }

  const handleTabChange = (tabId: string) => {
    vibrateSuccess()
    onTabChange(tabId)
    setShowQuickActions(false)
  }

  const handleQuickAction = (actionId: string) => {
    vibrateShort()
    onTabChange(actionId)
    setShowQuickActions(false)
  }

  const toggleExpanded = () => {
    vibrateShort()
    setIsExpanded(!isExpanded)
  }

  const toggleQuickActions = () => {
    vibrateShort()
    setShowQuickActions(!showQuickActions)
  }

  // Touch gestures for navigation
  useTouchGestures({
    onSwipeUp: () => {
      if (isExpanded) {
        toggleExpanded()
      }
    },
    onSwipeDown: () => {
      if (!isExpanded) {
        toggleExpanded()
      }
    },
    onTap: () => {
      setShowQuickActions(false)
    },
  })

  // Auto-collapse after navigation
  useEffect(() => {
    setIsExpanded(false)
    setShowQuickActions(false)
  }, [activeTab])

  return (
    <div className={cn('mobile-nav', className)}>
      {/* Main Navigation */}
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                'mobile-nav-item',
                isActive && 'active'
              )}
              aria-label={item.label}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs truncate">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
              )}
            </button>
          )
        })}

        {/* Quick Actions Toggle */}
        <button
          onClick={toggleQuickActions}
          className={cn(
            'mobile-nav-item',
            showQuickActions && 'active'
          )}
          aria-label="Quick Actions"
        >
          <Menu size={20} className="mb-1" />
          <span className="text-xs">More</span>
          {showQuickActions ? (
            <ChevronUp size={12} className="absolute top-1 right-1" />
          ) : (
            <ChevronDown size={12} className="absolute top-1 right-1" />
          )}
        </button>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 mobile-scroll">
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              const isActive = activeTab === action.id

              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-lg transition-colors duration-200 touch-target',
                    isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <div className="relative">
                    <Icon size={20} className="mb-1" />
                    {action.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Expandable Panel */}
      {isExpanded && (
        <div className="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Quick Actions
              </h3>
              <button
                onClick={toggleExpanded}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center space-x-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                <Plus size={20} />
                <span className="text-sm font-medium">Create Post</span>
              </button>

              <button className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <Search size={20} />
                <span className="text-sm font-medium">Search</span>
              </button>

              <button className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <BarChart3 size={20} />
                <span className="text-sm font-medium">Reports</span>
              </button>

              <button className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <Settings size={20} />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tap overlay to close expanded panels */}
      {(isExpanded || showQuickActions) && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => {
            setIsExpanded(false)
            setShowQuickActions(false)
          }}
        />
      )}
    </div>
  )
}