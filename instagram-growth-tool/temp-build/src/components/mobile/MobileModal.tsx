import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useIsMobile, useBreakpoint, useDeviceOrientation } from '@/hooks/use-mobile'
import { useTouchGestures, useHapticFeedback } from '@/hooks/use-touch-gestures'
import { X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  showDragHandle?: boolean
  allowSwipeToClose?: boolean
  disableCloseOnBackdrop?: boolean
  position?: 'bottom' | 'center'
  height?: 'auto' | 'full'
}

export default function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  showDragHandle = true,
  allowSwipeToClose = true,
  disableCloseOnBackdrop = false,
  position = 'bottom',
  height = 'auto',
}: MobileModalProps) {
  const isMobile = useIsMobile()
  const { isTablet } = useBreakpoint()
  const orientation = useDeviceOrientation()
  const { vibrateShort, vibrateSuccess } = useHapticFeedback()
  const modalRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ y: 0, time: 0 })

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

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      firstFocusable?.focus()
    }
  }, [isOpen])

  const handleClose = () => {
    vibrateShort()
    onClose()
  }

  // Touch gestures for the modal
  const touchGestures = useTouchGestures({
    onSwipeDown: allowSwipeToClose ? handleClose : undefined,
    onTap: (e) => {
      // Close when tapping backdrop (if not disabled)
      if (
        !disableCloseOnBackdrop && 
        e.target === e.currentTarget && 
        !modalRef.current?.contains(e.target as Node)
      ) {
        handleClose()
      }
    },
    threshold: 100, // Higher threshold for modal swipe gestures
  })

  // Handle drag gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!showDragHandle || !allowSwipeToClose) return

    const touch = e.touches[0]
    setDragStart({
      y: touch.clientY,
      time: Date.now(),
    })
    setIsDragging(true)

    // Add haptic feedback for drag start
    vibrateShort()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !showDragHandle) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - dragStart.y

    // Prevent vertical scroll when dragging modal
    e.preventDefault()

    if (deltaY > 0 && modalRef.current) {
      // Apply drag effect
      modalRef.current.style.transform = `translateY(${Math.min(deltaY, 200)}px)`
      modalRef.current.style.opacity = `${Math.max(1 - deltaY / 400, 0.5)}`
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !showDragHandle) return

    setIsDragging(false)

    const touch = e.changedTouches[0]
    const deltaY = touch.clientY - dragStart.y
    const deltaTime = Date.now() - dragStart.time
    const velocity = deltaY / deltaTime

    // Reset transform
    if (modalRef.current) {
      modalRef.current.style.transform = ''
      modalRef.current.style.opacity = ''
    }

    // Close modal if swipe down with sufficient velocity
    if (deltaY > 100 || velocity > 0.5) {
      handleClose()
    } else {
      vibrateSuccess()
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div 
      className={cn(
        'mobile-modal',
        position === 'center' ? 'items-center' : 'items-end sm:items-center',
        className
      )}
      onClick={(e) => {
        if (!disableCloseOnBackdrop && e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div
        ref={modalRef}
        className={cn(
          'mobile-modal-content',
          position === 'bottom' ? 'sm:rounded-2xl' : 'rounded-2xl',
          height === 'full' ? 'max-h-[95vh]' : 'max-h-[90vh]',
          'touch-gestures-container'
        )}
        style={{
          // Apply device orientation adjustments
          maxHeight: orientation === 'landscape' && isMobile ? '85vh' : undefined,
          minHeight: height === 'full' ? '100vh' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'mobile-modal-title' : undefined}
      >
        {/* Drag Handle */}
        {showDragHandle && position === 'bottom' && (
          <div className="flex justify-center pt-2 pb-4">
            <div 
              className={cn(
                'w-8 h-1 rounded-full transition-colors duration-200',
                isDragging ? 'bg-primary-300' : 'bg-gray-300 dark:bg-gray-600'
              )}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h2 
              id="mobile-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate"
            >
              {title}
            </h2>
          )}
          
          <button
            onClick={handleClose}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200',
              'touch-target'
            )}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mobile-scroll">
          {children}
        </div>
      </div>
    </div>
  )

  // Use portal to render modal at document level
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}

// Specialized modal components
interface SheetModalProps extends Omit<MobileModalProps, 'position'> {
  children: React.ReactNode
}

export function SheetModal({ children, ...props }: SheetModalProps) {
  return (
    <MobileModal 
      position="bottom" 
      showDragHandle={true}
      allowSwipeToClose={true}
      {...props}
    >
      {children}
    </MobileModal>
  )
}

interface ActionSheetModalProps extends SheetModalProps {
  actions: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive' | 'primary'
    disabled?: boolean
  }>
}

export function ActionSheetModal({ actions, children, ...props }: ActionSheetModalProps) {
  const { vibrateShort } = useHapticFeedback()

  return (
    <SheetModal {...props}>
      {children && <div className="p-4">{children}</div>}
      
      <div className="border-t border-gray-200 dark:border-gray-700">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              vibrateShort()
              action.onClick()
            }}
            disabled={action.disabled}
            className={cn(
              'w-full px-4 py-3 text-left transition-colors duration-200 touch-target',
              'border-b border-gray-100 dark:border-gray-700 last:border-b-0',
              action.variant === 'destructive'
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : action.variant === 'primary'
                ? 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700',
              action.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </SheetModal>
  )
}