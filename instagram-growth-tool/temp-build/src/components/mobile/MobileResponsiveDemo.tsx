import React, { useState } from 'react'
import { useIsMobile, useBreakpoint, useDeviceOrientation } from '@/hooks/use-mobile'
import { useTouchDevice, useHapticFeedback } from '@/hooks/use-touch-gestures'
import { useTouchInteraction } from '@/hooks/use-touch-interactions'
import MobileNavigation from '@/components/mobile/MobileNavigation'
import MobileModal from '@/components/mobile/MobileModal'
import MobileDrawer from '@/components/mobile/MobileDrawer'
import { NavigationDrawer, ActionDrawer } from '@/components/mobile/MobileDrawer'
import { CreatePostFAB, QuickActionsFAB } from '@/components/mobile/MobileFAB'
import ResponsiveGrid, { CardsGrid, MetricsGrid } from '@/components/mobile/ResponsiveGrid'
import LoadingStates, { FullScreenLoader, CardLoader } from '@/components/mobile/LoadingStates'
import { cn } from '@/lib/utils'
import {
  Home,
  TrendingUp,
  BarChart3,
  Calendar,
  Settings,
  User,
  Search,
  Bell,
  MessageCircle,
  Edit,
  Camera,
  Share2,
  Heart,
  Eye,
  Users,
  Target,
  Zap,
  Clock,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react'

// Demo cards data
const demoCards = [
  {
    id: 1,
    title: 'Analytics Overview',
    subtitle: 'Track your growth',
    icon: TrendingUp,
    variant: 'featured',
  },
  {
    id: 2,
    title: 'Content Calendar',
    subtitle: 'Plan your posts',
    icon: Calendar,
  },
  {
    id: 3,
    title: 'Audience Insights',
    subtitle: 'Know your followers',
    icon: Users,
  },
  {
    id: 4,
    title: 'Engagement Rate',
    subtitle: '8.5% this month',
    icon: Heart,
  },
]

// Demo metrics data
const demoMetrics = [
  {
    id: 1,
    title: 'Followers',
    value: '24.5K',
    change: 12.3,
    trend: 'up' as const,
    icon: Users,
    color: 'text-blue-600',
  },
  {
    id: 2,
    title: 'Engagement',
    value: '8.5%',
    change: 2.1,
    trend: 'up' as const,
    icon: Heart,
    color: 'text-red-600',
  },
  {
    id: 3,
    title: 'Reach',
    value: '156K',
    change: -1.2,
    trend: 'down' as const,
    icon: Eye,
    color: 'text-green-600',
  },
  {
    id: 4,
    title: 'Growth Rate',
    value: '15.2%',
    change: 5.7,
    trend: 'up' as const,
    icon: Target,
    color: 'text-purple-600',
  },
]

export default function MobileResponsiveDemo() {
  const isMobile = useIsMobile()
  const { currentBreakpoint, isTablet } = useBreakpoint()
  const orientation = useDeviceOrientation()
  const isTouchDevice = useTouchDevice()
  const { vibrateSuccess, vibrateShort } = useHapticFeedback()

  // Demo state management
  const [activeTab, setActiveTab] = useState('overview')
  const [showModal, setShowModal] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [selectedCard, setSelectedCard] = useState<any>(null)

  // Touch interaction demo
  const { handlers, isPressed } = useTouchInteraction({
    onTap: () => {
      vibrateSuccess()
      setShowModal(true)
    },
    onSwipeLeft: () => {
      setShowDrawer(true)
    },
    onLongPress: () => {
      setShowQuickActions(true)
    },
    hapticFeedback: true,
  })

  const handleFABAction = (action: string) => {
    vibrateShort()
    switch (action) {
      case 'create-post':
        setShowModal(true)
        break
      case 'analytics':
        setActiveTab('analytics')
        break
      case 'search':
        setActiveTab('research')
        break
      default:
        console.log('FAB action:', action)
    }
  }

  const renderOverviewTab = () => (
    <div className="p-4 space-y-6">
      {/* Hero Card */}
      <div 
        {...handlers}
        className={cn(
          'mobile-card p-6 cursor-pointer transition-all duration-200',
          isPressed && 'scale-95 opacity-75'
        )}
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Mobile Demo
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tap to open modal • Swipe left for drawer • Long press for actions
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Performance Metrics
        </h3>
        <MetricsGrid metrics={demoMetrics} />
      </div>

      {/* Cards Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Feature Cards
        </h3>
        <CardsGrid 
          cards={demoCards}
          onCardClick={(card) => {
            setSelectedCard(card)
            vibrateSuccess()
          }}
        />
      </div>

      {/* Demo Actions */}
      <div className="space-y-3">
        <button
          onClick={() => setLoadingDemo(true)}
          className="mobile-button-primary w-full"
        >
          Show Loading State
        </button>
        
        <button
          onClick={() => setShowNavigationDrawer(true)}
          className="mobile-button-secondary w-full"
        >
          Open Navigation Drawer
        </button>
      </div>

      {/* Responsive Info */}
      <div className="mobile-card p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Responsive Info
        </h4>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <p>Device: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</p>
          <p>Breakpoint: {currentBreakpoint}</p>
          <p>Orientation: {orientation}</p>
          <p>Touch Device: {isTouchDevice ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Analytics Dashboard
      </h2>
      
      {/* Mock chart */}
      <div className="mobile-card p-6">
        <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              Interactive Chart Demo
            </p>
          </div>
        </div>
      </div>

      {/* Detailed metrics */}
      <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 3 }}>
        {demoMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.id} className="mobile-card p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={metric.color} size={20} />
                <span className={cn(
                  'text-sm font-medium',
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {metric.value}
              </p>
            </div>
          )
        })}
      </ResponsiveGrid>
    </div>
  )

  const renderContentTab = () => (
    <div className="p-4">
      <div className="space-y-4">
        <div className="mobile-card p-4">
          <div className="flex items-center space-x-3">
            <Edit className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Create New Content
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tap to start creating
              </p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="mobile-button-primary"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="mobile-card p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Content Calendar
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Plan your posts
              </p>
            </div>
          </div>
        </div>

        <div className="mobile-card p-4">
          <div className="flex items-center space-x-3">
            <Camera className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Media Library
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your assets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'analytics':
        return renderAnalyticsTab()
      case 'content':
        return renderContentTab()
      default:
        return renderOverviewTab()
    }
  }

  if (loadingDemo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-4 space-y-4">
          <LoadingStates variant="skeleton" />
          <CardLoader />
          <CardLoader />
          <button 
            onClick={() => setLoadingDemo(false)}
            className="mobile-button-secondary w-full"
          >
            Back to Demo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setShowNavigationDrawer(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-semibold text-gray-900 dark:text-gray-100">
            Mobile Demo
          </h1>
          <button
            onClick={() => setShowQuickActions(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        'pb-20', // Space for mobile navigation
        isMobile && 'pb-16'
      )}>
        {renderCurrentTab()}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* FAB Buttons */}
      <CreatePostFAB
        onCreatePost={() => setShowModal(true)}
        onOtherAction={handleFABAction}
      />

      <QuickActionsFAB
        onQuickAction={handleFABAction}
        notificationCount={3}
      />

      {/* Modal Demo */}
      <MobileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Post"
        showDragHandle={true}
        allowSwipeToClose={true}
      >
        <div className="p-4 space-y-4">
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                Tap to add photo/video
              </p>
            </div>
          </div>
          
          <textarea
            placeholder="What's on your mind?"
            className="mobile-input resize-none"
            rows={4}
          />

          <div className="space-y-2">
            <button className="mobile-button-primary w-full">
              Publish
            </button>
            <button 
              onClick={() => setShowModal(false)}
              className="mobile-button-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      </MobileModal>

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setShowNavigationDrawer(false)
        }}
        user={{
          name: 'Demo User',
          email: 'demo@example.com',
        }}
      />

      {/* Action Drawer */}
      <ActionDrawer
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        title="Quick Actions"
        actions={[
          {
            label: 'Share',
            onClick: () => {},
            icon: '🔗',
          },
          {
            label: 'Export',
            onClick: () => {},
            icon: '📤',
            variant: 'primary',
          },
          {
            label: 'Settings',
            onClick: () => {},
            icon: '⚙️',
          },
          {
            label: 'Help',
            onClick: () => {},
            icon: '❓',
          },
          {
            label: 'Sign Out',
            onClick: () => {},
            icon: '🚪',
            variant: 'destructive',
          },
        ]}
      />

      {/* Full Screen Loader Overlay (optional) */}
      {false && <FullScreenLoader text="Loading demo..." />}
    </div>
  )
}