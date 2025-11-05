import * as React from "react"

// Enhanced breakpoints for mobile-first design
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type BreakpointKey = keyof typeof BREAKPOINTS

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.md)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<BreakpointKey>('lg')
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isTablet, setIsTablet] = React.useState<boolean>(false)
  const [isDesktop, setIsDesktop] = React.useState<boolean>(false)

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      // Determine breakpoint
      let newBreakpoint: BreakpointKey = 'xs'
      if (width >= BREAKPOINTS['2xl']) newBreakpoint = '2xl'
      else if (width >= BREAKPOINTS.xl) newBreakpoint = 'xl'
      else if (width >= BREAKPOINTS.lg) newBreakpoint = 'lg'
      else if (width >= BREAKPOINTS.md) newBreakpoint = 'md'
      else if (width >= BREAKPOINTS.sm) newBreakpoint = 'sm'
      else newBreakpoint = 'xs'
      
      // Determine device type
      const mobile = width < BREAKPOINTS.md
      const tablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg
      const desktop = width >= BREAKPOINTS.lg

      setCurrentBreakpoint(newBreakpoint)
      setIsMobile(mobile)
      setIsTablet(tablet)
      setIsDesktop(desktop)
    }

    // Initial check
    updateBreakpoint()

    // Create media queries for all breakpoints
    const mediaQueries = Object.entries(BREAKPOINTS).map(([key, value]) => {
      if (key === 'xs') {
        return window.matchMedia(`(max-width: ${value}px)`)
      } else {
        return window.matchMedia(`(min-width: ${value}px)`)
      }
    })

    // Add listeners
    mediaQueries.forEach(mql => mql.addEventListener('change', updateBreakpoint))
    window.addEventListener('resize', updateBreakpoint)
    window.addEventListener('orientationchange', updateBreakpoint)

    return () => {
      mediaQueries.forEach(mql => mql.removeEventListener('change', updateBreakpoint))
      window.removeEventListener('resize', updateBreakpoint)
      window.removeEventListener('orientationchange', updateBreakpoint)
    }
  }, [])

  return {
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isSm: currentBreakpoint === 'sm',
    isMd: currentBreakpoint === 'md',
    isLg: currentBreakpoint === 'lg',
    isXl: currentBreakpoint === 'xl',
    is2Xl: currentBreakpoint === '2xl',
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }
}

export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false)

  React.useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      )
    }

    checkTouchDevice()
    window.addEventListener('touchstart', checkTouchDevice, { passive: true })
    window.addEventListener('pointerdown', checkTouchDevice, { passive: true })

    return () => {
      window.removeEventListener('touchstart', checkTouchDevice)
      window.removeEventListener('pointerdown', checkTouchDevice)
    }
  }, [])

  return isTouchDevice
}

export function useSafeArea() {
  const [safeArea, setSafeArea] = React.useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })

  React.useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
      })
    }

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    return () => window.removeEventListener('resize', updateSafeArea)
  }, [])

  return safeArea
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')

  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return orientation
}
