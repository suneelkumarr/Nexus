import * as React from 'react'

export interface TouchGestureConfig {
  onSwipeLeft?: (e: TouchEvent) => void
  onSwipeRight?: (e: TouchEvent) => void
  onSwipeUp?: (e: TouchEvent) => void
  onSwipeDown?: (e: TouchEvent) => void
  onPinchIn?: (e: TouchEvent) => void
  onPinchOut?: (e: TouchEvent) => void
  onTap?: (e: TouchEvent) => void
  onDoubleTap?: (e: TouchEvent) => void
  threshold?: number
  timeout?: number
}

export function useTouchGestures(config: TouchGestureConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinchIn,
    onPinchOut,
    onTap,
    onDoubleTap,
    threshold = 50,
    timeout = 300,
  } = config

  const touchStart = React.useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTap = React.useRef<number | null>(null)

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }

    // Handle tap detection
    const now = Date.now()
    if (lastTap.current && now - lastTap.current < timeout) {
      onDoubleTap?.(e)
      lastTap.current = null
    } else {
      lastTap.current = now
      setTimeout(() => {
        lastTap.current = null
      }, timeout)
    }
  }, [onDoubleTap, timeout])

  const handleTouchEnd = React.useCallback((e: TouchEvent) => {
    if (!touchStart.current) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.current.x
    const deltaY = touch.clientY - touchStart.current.y
    const deltaTime = Date.now() - touchStart.current.time

    // Check for tap
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200) {
      onTap?.(e)
      return
    }

    // Check for swipe gestures
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold && deltaTime < 300) {
        if (deltaX > 0) {
          onSwipeRight?.(e)
        } else {
          onSwipeLeft?.(e)
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold && deltaTime < 300) {
        if (deltaY > 0) {
          onSwipeDown?.(e)
        } else {
          onSwipeUp?.(e)
        }
      }
    }

    touchStart.current = null
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, threshold])

  React.useEffect(() => {
    const element = document.body

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchEnd])

  return {
    handleTouchStart,
    handleTouchEnd,
  }
}

// Haptic feedback hook
export function useHapticFeedback() {
  const [isSupported, setIsSupported] = React.useState(false)

  React.useEffect(() => {
    setIsSupported('vibrate' in navigator || 'vibration' in navigator)
  }, [])

  const vibrate = React.useCallback((pattern: number | number[]) => {
    if (isSupported) {
      navigator.vibrate?.(pattern)
    }
  }, [isSupported])

  const vibrateShort = React.useCallback(() => {
    vibrate(10)
  }, [vibrate])

  const vibrateMedium = React.useCallback(() => {
    vibrate(50)
  }, [vibrate])

  const vibrateLong = React.useCallback(() => {
    vibrate(100)
  }, [vibrate])

  const vibrateSuccess = React.useCallback(() => {
    vibrate([20, 30, 20])
  }, [vibrate])

  const vibrateError = React.useCallback(() => {
    vibrate([50, 25, 50, 25, 50])
  }, [vibrate])

  const vibrateWarning = React.useCallback(() => {
    vibrate([100, 50, 100])
  }, [vibrate])

  return {
    isSupported,
    vibrate,
    vibrateShort,
    vibrateMedium,
    vibrateLong,
    vibrateSuccess,
    vibrateError,
    vibrateWarning,
  }
}

// Prevent zoom hook
export function usePreventZoom() {
  React.useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault()
    }

    // Prevent zoom on wheel events
    document.addEventListener('wheel', preventDefault, { passive: false })

    // Prevent zoom on pinch gestures
    let lastTouchEnd = 0
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    document.addEventListener('touchend', preventZoom, { passive: false })

    return () => {
      document.removeEventListener('wheel', preventDefault)
      document.removeEventListener('touchend', preventZoom)
    }
  }, [])
}

// Handle safe area and viewport changes
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = React.useState(window.innerHeight)

  React.useEffect(() => {
    const updateHeight = () => {
      // Use viewport unit as fallback
      setViewportHeight(window.innerHeight)
    }

    // Update on resize
    window.addEventListener('resize', updateHeight)
    
    // Update on orientation change
    const handleOrientationChange = () => {
      setTimeout(updateHeight, 100) // Delay to ensure correct height
    }
    
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return viewportHeight
}