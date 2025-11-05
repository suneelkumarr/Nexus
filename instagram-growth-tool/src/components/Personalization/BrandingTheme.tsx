import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalization } from '@/hooks/usePersonalization';
import {
  Palette,
  CheckCircle,
  Crown,
  Sparkles,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Save,
  Zap,
  Heart,
  Moon,
  Sun,
  Star,
  AlertCircle
} from 'lucide-react';

interface BrandingThemeProps {
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
  userPreferences?: {
    theme: string;
    layout: 'compact' | 'comfortable' | 'spacious';
    animations: boolean;
    compactSidebar: boolean;
  };
}

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  gradient: string;
  icon: React.ComponentType<any>;
  premium?: boolean;
}

const themeOptions: ThemeOption[] = [
  {
    id: 'classic',
    name: 'Classic Purple',
    description: 'The original GrowthHub experience with purple gradients',
    colors: {
      primary: 'from-purple-500 to-pink-500',
      secondary: 'from-purple-600 to-blue-600',
      accent: 'from-pink-400 to-rose-500',
      background: 'bg-gray-50',
      surface: 'bg-white'
    },
    gradient: 'from-purple-500 to-pink-500',
    icon: Crown
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Calming blue and teal tones for a professional feel',
    colors: {
      primary: 'from-blue-500 to-cyan-500',
      secondary: 'from-teal-500 to-blue-600',
      accent: 'from-cyan-400 to-blue-500',
      background: 'bg-blue-50',
      surface: 'bg-white'
    },
    gradient: 'from-blue-500 to-cyan-500',
    icon: Sparkles
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm orange and red gradients for an energetic vibe',
    colors: {
      primary: 'from-orange-500 to-red-500',
      secondary: 'from-red-500 to-pink-600',
      accent: 'from-yellow-400 to-orange-500',
      background: 'bg-orange-50',
      surface: 'bg-white'
    },
    gradient: 'from-orange-500 to-red-500',
    icon: Sun
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural green tones for growth and harmony',
    colors: {
      primary: 'from-green-500 to-emerald-600',
      secondary: 'from-emerald-500 to-teal-600',
      accent: 'from-lime-400 to-green-500',
      background: 'bg-green-50',
      surface: 'bg-white'
    },
    gradient: 'from-green-500 to-emerald-600',
    icon: Heart
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    description: 'Professional dark theme with purple accents',
    colors: {
      primary: 'from-purple-600 to-indigo-700',
      secondary: 'from-indigo-600 to-purple-700',
      accent: 'from-purple-400 to-pink-500',
      background: 'bg-gray-900',
      surface: 'bg-gray-800'
    },
    gradient: 'from-purple-600 to-indigo-700',
    icon: Moon,
    premium: true
  },
  {
    id: 'cosmic',
    name: 'Cosmic Galaxy',
    description: 'Deep space theme with cosmic purple and cosmic pink',
    colors: {
      primary: 'from-violet-600 to-purple-700',
      secondary: 'from-purple-600 to-fuchsia-700',
      accent: 'from-fuchsia-400 to-violet-500',
      background: 'bg-gray-900',
      surface: 'bg-gray-800'
    },
    gradient: 'from-violet-600 to-purple-700',
    icon: Star,
    premium: true
  }
];

const layoutOptions = [
  { id: 'compact', name: 'Compact', description: 'More content, less space' },
  { id: 'comfortable', name: 'Comfortable', description: 'Balanced spacing' },
  { id: 'spacious', name: 'Spacious', description: 'More breathing room' }
] as const;

export default function BrandingTheme({ 
  currentTheme = 'classic',
  onThemeChange,
  userPreferences = {
    theme: 'classic',
    layout: 'comfortable',
    animations: true,
    compactSidebar: false
  }
}: BrandingThemeProps) {
  const { user } = useAuth();
  const { updatePreferences } = usePersonalization();
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [preferences, setPreferences] = useState(userPreferences);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    onThemeChange?.(themeId);
  };

  const handlePreferenceChange = (key: string, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
  };

  const savePreferences = async () => {
    if (!user) {
      setLastError('You must be logged in to save preferences');
      return;
    }

    setSaving(true);
    setLastError(null);
    try {
      // Update theme in preferences
      const updatedPreferences = { ...preferences, theme: selectedTheme };
      
      // Save to database using the usePersonalization hook
      await updatePreferences(updatedPreferences);
      
      // Update local state
      setPreferences(updatedPreferences);
      
      // Apply theme changes immediately
      if (onThemeChange) {
        onThemeChange(selectedTheme);
      }
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      setLastError(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const getDeviceIcon = (mode: string) => {
    switch (mode) {
      case 'tablet': return Tablet;
      case 'mobile': return Smartphone;
      default: return Monitor;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Branding & Theme
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customize your visual experience
            </p>
          </div>
        </div>
        
        {/* Device Preview Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['desktop', 'tablet', 'mobile'] as const).map((mode) => {
            const Icon = getDeviceIcon(mode);
            return (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`p-2 rounded-md transition-colors ${
                  previewMode === mode 
                    ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Color Themes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themeOptions.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selectedTheme === theme.id;
            
            return (
              <div
                key={theme.id}
                className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-purple-500 shadow-lg ring-2 ring-purple-200 dark:ring-purple-800'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                {/* Theme Preview */}
                <div className={`h-16 bg-gradient-to-r ${theme.gradient} relative`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  {theme.premium && (
                    <div className="absolute top-2 right-2">
                      <Crown className="h-4 w-4 text-yellow-300" />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      {theme.name}
                    </h5>
                    {theme.premium && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium rounded-full">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {theme.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layout Preferences */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Layout Preferences
        </h4>
        <div className="space-y-3">
          {/* Layout Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {layoutOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handlePreferenceChange('layout', option.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  preferences.layout === option.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <h6 className="font-medium text-gray-900 dark:text-white">
                  {option.name}
                </h6>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {option.description}
                </p>
              </button>
            ))}
          </div>

          {/* Toggle Options */}
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Animations
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable smooth transitions and effects
                  </p>
                </div>
              </div>
              <button
                onClick={() => handlePreferenceChange('animations', !preferences.animations)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.animations ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.animations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Compact Sidebar
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Reduce sidebar width for more content space
                  </p>
                </div>
              </div>
              <button
                onClick={() => handlePreferenceChange('compactSidebar', !preferences.compactSidebar)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.compactSidebar ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.compactSidebar ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Live Preview
        </h4>
        <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-4 transition-all duration-300 ${
          previewMode === 'mobile' ? 'max-w-sm mx-auto' :
          previewMode === 'tablet' ? 'max-w-2xl mx-auto' : 'w-full'
        }`}>
          {/* Mock Header */}
          <div className={`bg-gradient-to-r ${themeOptions.find(t => t.id === selectedTheme)?.gradient} rounded-lg p-4 text-white`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <h5 className="font-semibold">GrowthHub</h5>
                <p className="text-xs opacity-80">Instagram Analytics</p>
              </div>
            </div>
          </div>
          
          {/* Mock Content */}
          <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            setSelectedTheme('classic');
            setPreferences({
              theme: 'classic',
              layout: 'comfortable',
              animations: true,
              compactSidebar: false
            });
          }}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reset to Default
        </button>
        
        <button
          onClick={savePreferences}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
      
      {/* Error Message */}
      {lastError && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-900 dark:text-red-100">
              Save Error
            </span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {lastError}
          </p>
        </div>
      )}
      
      {/* Success Message */}
      {!lastError && !saving && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Preferences saved successfully
            </span>
          </div>
        </div>
      )}
      
      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Pro Tip
          </span>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Dark themes are perfect for late-night work sessions and reduce eye strain. 
          Compact layouts give you more space to focus on your analytics.
        </p>
      </div>
    </div>
  );
}