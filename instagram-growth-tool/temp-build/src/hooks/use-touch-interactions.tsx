import * as React from 'react'
import { useIsMobile, useTouchDevice } from '@/hooks/use-mobile'
import { useHapticFeedback } from '@/hooks/use-touch-gestures'

interface TouchInteractionOptions {
  onTap?: (event: React.TouchEvent | React.MouseEvent) => void
  onLongPress?: (event: React.TouchEvent | React.MouseEvent) => void
  onSwipeLeft?: (event: React.TouchEvent) => void
  onSwipeRight?: (event: React.TouchEvent) => void
  onSwipeUp?: (event: React.TouchEvent) => void
  onSwipeDown?: (event: React.TouchEvent) => void
  onPinchIn?: (event: React.TouchEvent) => void
  onPinchOut?: (event: React.TouchEvent) => void
  longPressDuration?: number
  swipeThreshold?: number
  disabled?: boolean
  hapticFeedback?: boolean
}

export function useTouchInteraction(options: TouchInteractionOptions) {
  const {
    onTap,
    onLongPress,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinchIn,
    onPinchOut,
    longPressDuration = 500,
    swipeThreshold = 50,
    disabled = false,
    hapticFeedback = true,
  } = options

  const { vibrateShort, vibrateLong, vibrateSuccess } = useHapticFeedback()
  const [isPressed, setIsPressed] = React.useState(false)
  const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null)
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number; time: number } | null>(null)
  const [lastTouchEnd, setLastTouchEnd] = React.useState(0)

  // Clear long press timer
  const clearLongPressTimer = React.useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }, [longPressTimer])

  // Handle touch start
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (disabled) return

    const touch = e.touches[0]
    const now = Date.now()

    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: now,
    })

    setIsPressed(true)

    // Set up long press timer
    if (onLongPress && hapticFeedback) {
      vibrateLong()
    }

    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress(e)
      }, longPressDuration)
      setLongPressTimer(timer)
    }
  }, [disabled, onLongPress, longPressDuration, hapticFeedback, vibrateLong])

  // Handle touch move
  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (disabled || !touchStart) return

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStart.x)
    const deltaY = Math.abs(touch.clientY - touchStart.y)

    // Cancel long press if finger moves significantly
    if (Math.max(deltaX, deltaY) > 10) {
      clearLongPressTimer()
      setIsPressed(false)
    }
  }, [disabled, touchStart, clearLongPressTimer])

  // Handle touch end
  const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
    if (disabled || !touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    const deltaTime = Date.now() - touchStart.time

    // Clear long press timer
    clearLongPressTimer()

    // Determine gesture type
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
      // Tap
      if (onTap) {
        onTap(e)
        if (hapticFeedback) vibrateSuccess()
      }
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > swipeThreshold && deltaTime < 300) {
        if (deltaX > 0) {
          onSwipeRight?.(e)
        } else {
          onSwipeLeft?.(e)
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > swipeThreshold && deltaTime < 300) {
        if (deltaY > 0) {
          onSwipeDown?.(e)
        } else {
          onSwipeUp?.(e)
        }
      }
    }

    setTouchStart(null)
    setIsPressed(false)
  }, [
    disabled,
    touchStart,
    onTap,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    swipeThreshold,
    clearLongPressTimer,
    hapticFeedback,
    vibrateSuccess,
  ])

  // Handle touch cancel
  const handleTouchCancel = React.useCallback(() => {
    clearLongPressTimer()
    setTouchStart(null)
    setIsPressed(false)
  }, [clearLongPressTimer])

  // Handle mouse events for desktop compatibility
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (disabled) return

    setIsPressed(true)
    if (onLongPress && hapticFeedback) {
      vibrateLong()
    }

    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress(e)
      }, longPressDuration)
      setLongPressTimer(timer)
    }
  }, [disabled, onLongPress, longPressDuration, hapticFeedback, vibrateLong])

  const handleMouseUp = React.useCallback((e: React.MouseEvent) => {
    if (disabled) return

    clearLongPressTimer()
    if (onTap) {
      onTap(e)
      if (hapticFeedback) vibrateSuccess()
    }
    setIsPressed(false)
  }, [disabled, onTap, clearLongPressTimer, hapticFeedback, vibrateSuccess])

  const handleMouseLeave = React.useCallback(() => {
    clearLongPressTimer()
    setIsPressed(false)
  }, [clearLongPressTimer])

  return {
    // Touch event handlers
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    
    // Mouse event handlers
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    
    // State
    isPressed,
    clearLongPressTimer,
  }
}

// Specialized hook for swipe interactions
interface SwipeOptions {
  onSwipeLeft?: (event: React.TouchEvent) => void
  onSwipeRight?: (event: React.TouchEvent) => void
  onSwipeUp?: (event: React.TouchEvent) => void
  onSwipeDown?: (event: React.TouchEvent) => void
  threshold?: number
  disabled?: boolean
}

export function useSwipeInteraction(options: SwipeOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    disabled = false,
  } = options

  const { vibrateShort, vibrateSuccess } = useHapticFeedback()
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (disabled) return

    const touch = e.touches[0]
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    })
  }, [disabled])

  const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
    if (disabled || !touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    const deltaTime = Date.now()

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.(e)
          vibrateSuccess()
        } else {
          onSwipeLeft?.(e)
          vibrateSuccess()
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.(e)
          vibrateSuccess()
        } else {
          onSwipeUp?.(e)
          vibrateSuccess()
        }
      }
    }

    setTouchStart(null)
  }, [disabled, touchStart, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, vibrateSuccess])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    // Prevent scrolling during swipe gestures
    if (touchStart) {
      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - touchStart.x)
      const deltaY = Math.abs(touch.clientY - touchStart.y)

      if (deltaX > 10 || deltaY > 10) {
        e.preventDefault()
      }
    }
  }, [touchStart])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}

// Hook for button-like interactions
interface ButtonInteractionOptions {
  onClick?: (event: React.MouseEvent | React.TouchEvent) => void
  disabled?: boolean
  hapticFeedback?: boolean
  longPress?: (event: React.MouseEvent | React.TouchEvent) => void
}

export function useButtonInteraction(options: ButtonInteractionOptions) {
  const { onClick, disabled = false, hapticFeedback = true, longPress } = options
  const { vibrateShort, vibrateLong, vibrateSuccess } = useHapticFeedback()
  const [isPressed, setIsPressed] = React.useState(false)
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null)

  const handleInteractionStart = React.useCallback(() => {
    if (disabled) return

    setIsPressed(true)
    
    if (longPress && hapticFeedback) {
      vibrateLong()
    }
    
    if (longPress) {
      longPressTimer.current = setTimeout(() => {
        longPress()
      }, 500)
    }
  }, [disabled, longPress, hapticFeedback, vibrateLong])

  const handleInteractionEnd = React.useCallback(() => {
    if (disabled) return

    setIsPressed(false)
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    
    if (onClick) {
      onClick()
      if (hapticFeedback) vibrateSuccess()
    }
  }, [disabled, onClick, hapticFeedback, vibrateSuccess])

  const handleInteractionCancel = React.useCallback(() => {
    setIsPressed(false)
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  return {
    isPressed,
    handlers: {
      onTouchStart: handleInteractionStart,
      onMouseDown: handleInteractionStart,
      onTouchEnd: handleInteractionEnd,
      onMouseUp: handleInteractionEnd,
      onTouchCancel: handleInteractionCancel,
      onMouseLeave: handleInteractionCancel,
      onClick: handleInteractionEnd,
    },
  }
}

// Hook for carousel/slider interactions
interface CarouselOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
  disabled?: boolean
}

export function useCarouselInteraction(options: CarouselOptions) {
  const { onSwipeLeft, onSwipeRight, threshold = 50, disabled = false } = options
  const { vibrateSuccess } = useHapticFeedback()
  const [touchStart, setTouchStart] = React.useState<{ x: number; time: number } | null>(null)

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (disabled) return

    const touch = e.touches[0]
    setTouchStart({
      x: touch.clientX,
      time: Date.now(),
    })
  }, [disabled])

  const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
    if (disabled || !touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaTime = Date.now() - touchStart.time
    const velocity = Math.abs(deltaX) / deltaTime

    if (Math.abs(deltaX) > threshold || velocity > 0.3) {
      if (deltaX > 0) {
        onSwipeRight?.()
        vibrateSuccess()
      } else {
        onSwipeLeft?.()
        vibrateSuccess()
      }
    }

    setTouchStart(null)
  }, [disabled, touchStart, onSwipeLeft, onSwipeRight, threshold, vibrateSuccess])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  }
}

// Hook for drag and drop interactions
interface DragOptions {
  onDragStart?: (event: React.TouchEvent) => void
  onDrag?: (event: React.TouchEvent, delta: { x: number; y: number }) => void
  onDragEnd?: (event: React.TouchEvent) => void
  disabled?: boolean
}

export function useDragInteraction(options: DragOptions) {
  const { onDragStart, onDrag, onDragEnd, disabled = false } = options
  const { vibrateShort } = useHapticFeedback()
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (disabled) return

    const touch = e.touches[0]
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
    })
    setIsDragging(true)
    
    onDragStart?.(e)
    vibrateShort()
  }, [disabled, onDragStart, vibrateShort])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (disabled || !dragStart) return

    const touch = e.touches[0]
    const delta = {
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    }

    onDrag?.(e, delta)
  }, [disabled, dragStart, onDrag])

  const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
    if (disabled) return

    setDragStart(null)
    setIsDragging(false)
    onDragEnd?.(e)
  }, [disabled, onDragEnd])

  return {
    isDragging,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}