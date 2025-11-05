import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize, 
  Minimize, 
  Download, 
  Share2, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Eye,
  Monitor,
  Printer
} from 'lucide-react';
import { PresentationData } from '@/types/analytics';

interface PresentationModeProps {
  isActive: boolean;
  onClose: () => void;
  data: any;
  options?: PresentationData;
  slides?: Array<{
    id: string;
    title: string;
    component: React.ComponentType<any>;
    duration?: number;
  }>;
}

export default function PresentationMode({ 
  isActive, 
  onClose, 
  data, 
  options = {
    mode: 'dashboard',
    fullscreen: true,
    autoAdvance: false,
    duration: 5000
  },
  slides = []
}: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
      
      // Auto-hide controls
      const hideControls = () => {
        setShowControls(false);
      };
      
      const showControlsTemporarily = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(hideControls, 3000);
      };
      
      // Show controls on mouse move
      const handleMouseMove = () => {
        showControlsTemporarily();
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      showControlsTemporarily();
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('mousemove', handleMouseMove);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      };
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive && isPlaying && slides.length > 0) {
      timerRef.current = setTimeout(() => {
        nextSlide();
      }, options.duration);
      
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [isActive, isPlaying, currentSlide, options.duration, slides.length]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCurrentSlide(0);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      setCurrentSlide(slides.length - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const exportCurrentSlide = () => {
    // Export current slide as PDF or image
    window.print();
  };

  const shareCurrentSlide = () => {
    // Share current view
    const shareData = {
      title: 'Instagram Analytics Presentation',
      text: 'Check out my Instagram analytics presentation',
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {slides.length > 0 ? (
          <>
            {/* Slides */}
            <div className="w-full h-full">
              {slides.map((slide, index) => {
                const SlideComponent = slide.component;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="w-full h-full p-8 bg-white">
                      <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{slide.title}</h1>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">
                            {currentSlide + 1} / {slides.length}
                          </span>
                        </div>
                      </div>
                      <SlideComponent data={data} presentationMode />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          /* Default Dashboard View */
          <div className="w-full h-full bg-white">
            <div className="p-12">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Instagram Analytics Report</h1>
                <p className="text-xl text-gray-600">Full Dashboard Presentation</p>
              </div>
              
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                {[
                  { label: 'Total Followers', value: data?.followers?.toLocaleString() || '0', color: 'text-blue-600' },
                  { label: 'Engagement Rate', value: `${data?.engagementRate?.toFixed(2) || '0.00'}%`, color: 'text-green-600' },
                  { label: 'Total Reach', value: data?.reach?.toLocaleString() || '0', color: 'text-purple-600' },
                  { label: 'Growth Rate', value: `${data?.growth?.followers?.toFixed(1) || '0.0'}%`, color: 'text-pink-600' }
                ].map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-4xl font-bold ${metric.color} mb-2`}>
                      {metric.value}
                    </div>
                    <div className="text-gray-600 font-medium">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                  <span className="text-gray-500">Follower Growth Chart</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                  <span className="text-gray-500">Engagement Trend Chart</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between">
          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={previousSlide}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              disabled={slides.length <= 1}
            >
              <SkipBack className="h-6 w-6" />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="p-3 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </button>
            
            <button
              onClick={nextSlide}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              disabled={slides.length <= 1}
            >
              <SkipForward className="h-6 w-6" />
            </button>
          </div>

          {/* Slide Info */}
          {slides.length > 0 && (
            <div className="text-white text-center">
              <div className="font-medium">{slides[currentSlide]?.title}</div>
              <div className="text-sm opacity-75">
                {currentSlide + 1} of {slides.length}
              </div>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={exportCurrentSlide}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            
            <button
              onClick={shareCurrentSlide}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Maximize className="h-4 w-4" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
            
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Minimize className="h-4 w-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      {showControls && (
        <div className="absolute top-4 right-4 text-white text-sm opacity-75">
          <div>← → Navigate slides</div>
          <div>Space: Play/Pause</div>
          <div>F: Fullscreen</div>
          <div>Esc: Exit</div>
        </div>
      )}
    </div>
  );
}

// Keyboard shortcuts hook
export const usePresentationShortcuts = (onAction: (action: string) => void) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          onAction('previous');
          break;
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          onAction(event.key === ' ' ? 'toggle' : 'next');
          break;
        case 'f':
        case 'F':
          onAction('fullscreen');
          break;
        case 'Escape':
          onAction('exit');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onAction]);
};