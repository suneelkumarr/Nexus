import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors",
  secondary: "bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-all",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors"
};

export const animationClasses = {
  fadeIn: "animate-in fade-in duration-500",
  slideUp: "animate-in slide-in-from-bottom-4 duration-500",
  slideInLeft: "animate-in slide-in-from-left-4 duration-500",
  slideInRight: "animate-in slide-in-from-right-4 duration-500",
  zoomIn: "animate-in zoom-in duration-300"
};

export const buttonSizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3",
  lg: "px-8 py-4 text-lg"
};

export const spacing = {
  section: "py-16 px-4 sm:px-6 lg:px-8",
  container: "max-w-7xl mx-auto",
  grid: "grid gap-8 md:gap-12"
};

export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};