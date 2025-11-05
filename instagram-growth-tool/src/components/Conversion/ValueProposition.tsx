import { TrendingUp, DollarSign, Clock, Users, Target, BarChart3, ArrowUpRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ROIData {
  metric: string;
  currentValue: string;
  projectedValue: string;
  improvement: string;
  timeToValue: string;
  description: string;
}

interface ValuePropositionProps {
  onUpgradeClick: () => void;
}

const roiMetrics: ROIData[] = [
  {
    metric: 'Follower Growth Rate',
    currentValue: '2.1%/month',
    projectedValue: '8.5%/month',
    improvement: '+304%',
    timeToValue: '2-3 weeks',
    description: 'Through optimized posting times and hashtag strategies'
  },
  {
    metric: 'Engagement Rate',
    currentValue: '1.8%',
    projectedValue: '4.2%',
    improvement: '+133%',
    timeToValue: '1-2 weeks',
    description: 'AI-powered content suggestions boost engagement by 2.3x'
  },
  {
    metric: 'Content Performance',
    currentValue: 'Baseline',
    projectedValue: '+285% reach',
    improvement: '+285%',
    timeToValue: '1 week',
    description: 'Data-driven content strategy increases organic reach'
  },
  {
    metric: 'Time Saved',
    currentValue: 'Manual work',
    projectedValue: '8+ hours/week',
    improvement: '10x faster',
    timeToValue: 'Immediate',
    description: 'Automated scheduling and analytics save hours of manual work'
  }
];

const successStories = [
  {
    name: 'Sarah Chen',
    role: 'Fitness Influencer',
    before: '2.5K followers',
    after: '45K followers',
    timeframe: '3 months',
    quote: 'This platform helped me grow from 2.5K to 45K followers in just 3 months. The AI insights are incredibly accurate.',
    avatar: '👩‍💼',
    results: ['+1,700% follower growth', '300% engagement increase', '$12K/month in brand deals']
  },
  {
    name: 'Mike Rodriguez',
    role: 'E-commerce Brand',
    before: '$2K/month',
    after: '$28K/month',
    timeframe: '6 months',
    quote: 'Our Instagram sales increased by 1,300% using the analytics and content optimization features.',
    avatar: '👨‍💼',
    results: ['1,300% sales increase', '400% reach improvement', '65% lower customer acquisition cost']
  },
  {
    name: 'Lisa Park',
    role: 'Digital Marketing Agency',
    before: '50 clients',
    after: '200+ clients',
    timeframe: '8 months',
    quote: 'We scaled our agency from 50 to 200+ clients using the white-label features and analytics.',
    avatar: '👩‍💻',
    results: ['400% client growth', '$500K+ additional revenue', '90% client retention rate']
  }
];

export default function ValueProposition({ onUpgradeClick }: ValuePropositionProps) {
  const [activeStory, setActiveStory] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeStory < successStories.length - 1) {
      setActiveStory(activeStory + 1);
    }
    if (isRightSwipe && activeStory > 0) {
      setActiveStory(activeStory - 1);
    }
  };

  const nextStory = () => {
    setActiveStory((prev) => (prev + 1) % successStories.length);
  };

  const prevStory = () => {
    setActiveStory((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 sm:space-y-12 px-4 sm:px-0">
      {/* ROI Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium mb-6">
          <TrendingUp className="w-4 h-4" />
          Proven ROI Results
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          See Real Results in Your First Week
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 px-4">
          Our users typically see measurable improvements within 7 days. Here's what you can expect:
        </p>

        {/* ROI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {roiMetrics.map((metric, index) => (
            <div key={metric.metric} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-tight">{metric.metric}</h3>
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 flex-shrink-0 ml-2">
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-bold">{metric.improvement}</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Current:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metric.currentValue}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">With Pro:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{metric.projectedValue}</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">{metric.description}</p>
              
              <div className="flex items-center gap-1 text-xs">
                <Clock className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <span className="text-blue-600 dark:text-blue-400">Time to value: {metric.timeToValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories Section */}
      <div>
        <div className="text-center mb-6 sm:mb-8 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            Real User Results
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Join 50,000+ Success Stories
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            See how creators and businesses are achieving extraordinary results
          </p>
        </div>

        {/* Success Stories Carousel */}
        <div 
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Story Content */}
            <div className="flex-1 p-4 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl flex-shrink-0">{successStories[activeStory].avatar}</div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg leading-tight">
                    {successStories[activeStory].name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {successStories[activeStory].role}
                  </p>
                </div>
              </div>

              <blockquote className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 italic leading-relaxed">
                "{successStories[activeStory].quote}"
              </blockquote>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {successStories[activeStory].results.map((result, index) => (
                  <div key={index} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-3">
                    <div className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-300 leading-tight">{result}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span>Before: {successStories[activeStory].before}</span>
                <span>After: {successStories[activeStory].after}</span>
                <span>In {successStories[activeStory].timeframe}</span>
              </div>
            </div>

            {/* Story Navigation */}
            <div className="lg:w-80 bg-gray-50 dark:bg-gray-700/50 p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">More Success Stories</h4>
                <div className="space-y-2 sm:space-y-3">
                  {successStories.map((story, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStory(index)}
                      className={`w-full text-left p-3 rounded-lg transition-all min-h-[60px] ${
                        activeStory === index
                          ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600'
                          : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent'
                      } border`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl sm:text-2xl flex-shrink-0">{story.avatar}</span>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm leading-tight">{story.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{story.role}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-center items-center gap-2">
                  {/* Navigation Buttons */}
                  <button
                    onClick={prevStory}
                    disabled={activeStory === 0}
                    className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous story"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  {/* Dot Indicators */}
                  <div className="flex justify-center gap-2 px-2">
                    {successStories.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveStory(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeStory === index ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        aria-label={`Go to story ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={nextStory}
                    disabled={activeStory === successStories.length - 1}
                    className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Next story"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Calculator */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 sm:p-8 text-white">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Calculate Your ROI</h2>
          <p className="text-purple-100 text-sm sm:text-base">
            See how much value you could generate with our platform
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 rounded-xl p-4 sm:p-6 text-center">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-yellow-300" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base leading-tight">Average Revenue Increase</h3>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-1">$2,847</div>
            <div className="text-purple-200 text-xs sm:text-sm">per month</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 sm:p-6 text-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-blue-300" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base leading-tight">Time Saved</h3>
            <div className="text-2xl sm:text-3xl font-bold text-blue-300 mb-1">8.5</div>
            <div className="text-purple-200 text-xs sm:text-sm">hours per week</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-green-300" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base leading-tight">Conversion Rate</h3>
            <div className="text-2xl sm:text-3xl font-bold text-green-300 mb-1">+285%</div>
            <div className="text-purple-200 text-xs sm:text-sm">improvement</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 leading-tight px-2">
            Investment: $29/month → Value: $2,847+/month
          </div>
          <div className="text-purple-200 mb-4 sm:mb-6 text-sm sm:text-base px-2">
            That's a 9,490% ROI in your first month
          </div>
          <button
            onClick={onUpgradeClick}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all min-h-[48px] touch-manipulation"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Start Your Success Story
          </button>
        </div>
      </div>
    </div>
  );
}