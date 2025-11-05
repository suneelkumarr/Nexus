import { Star, Quote, Users, TrendingUp, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar: string;
  rating: number;
  quote: string;
  results: string[];
  timeframe: string;
  verified: boolean;
  plan: 'free' | 'pro' | 'enterprise';
  followers?: string;
  revenue?: string;
}

interface SocialProofProps {
  onUpgradeClick: () => void;
  onViewTestimonials: () => void;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Fitness Coach',
    company: 'Peak Performance',
    avatar: '💪',
    rating: 5,
    quote: 'This platform transformed my fitness business. I went from struggling to get 50 likes to consistently hitting 10K engagements per post.',
    results: ['+2,400% follower growth', '400% engagement increase', '$8K/month in consultations'],
    timeframe: '4 months',
    verified: true,
    plan: 'pro',
    followers: '125K',
    revenue: '$8K/month'
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    role: 'E-commerce Founder',
    company: 'EcoBeauty Co',
    avatar: '🌱',
    rating: 5,
    quote: 'The competitor analysis feature is a game-changer. We identified trending products 2 months ahead of competitors and dominated the market.',
    results: ['1,200% sales increase', '300% market share growth', '$45K additional revenue'],
    timeframe: '6 months',
    verified: true,
    plan: 'enterprise',
    followers: '89K',
    revenue: '$45K/month'
  },
  {
    id: '3',
    name: 'David Chen',
    role: 'Digital Marketing Agency Owner',
    company: 'Growth Hackers Agency',
    avatar: '📈',
    rating: 5,
    quote: 'Managing 200+ client accounts was a nightmare. This platform\'s white-label solution helped us scale to 500+ clients profitably.',
    results: ['400% client growth', '$500K+ additional revenue', '90% client retention rate'],
    timeframe: '8 months',
    verified: true,
    plan: 'enterprise',
    followers: '156K',
    revenue: '$500K+/month'
  },
  {
    id: '4',
    name: 'Sarah Kim',
    role: 'Lifestyle Influencer',
    avatar: '✨',
    rating: 5,
    quote: 'The AI content suggestions are incredibly accurate. My engagement rate went from 1.2% to 8.7% in just 3 weeks.',
    results: ['+725% engagement rate', '250% follower growth', '15 brand partnerships'],
    timeframe: '6 weeks',
    verified: true,
    plan: 'pro',
    followers: '67K',
    revenue: '$3K/month'
  },
  {
    id: '5',
    name: 'Mike Thompson',
    role: 'Restaurant Chain Owner',
    company: 'Thompson Hospitality',
    avatar: '🍽️',
    rating: 5,
    quote: 'We optimized our posting strategy and increased foot traffic by 180% across all 12 locations using the analytics insights.',
    results: ['180% foot traffic increase', '300% online orders', '$125K additional revenue'],
    timeframe: '5 months',
    verified: true,
    plan: 'enterprise',
    followers: '45K',
    revenue: '$125K/month'
  },
  {
    id: '6',
    name: 'Lisa Park',
    role: 'Tech Startup Founder',
    company: 'InnovateTech',
    avatar: '🚀',
    rating: 5,
    quote: 'The audience insights helped us identify our core demographic and adjust our product messaging. Our conversion rate improved by 450%.',
    results: ['450% conversion rate improvement', '200% user acquisition', '$2M in Series A funding'],
    timeframe: '4 months',
    verified: true,
    plan: 'pro',
    followers: '34K',
    revenue: '$2M funding'
  }
];

const stats = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Users',
    description: 'Growing their Instagram presence'
  },
  {
    icon: TrendingUp,
    value: '2.3M+',
    label: 'Posts Analyzed',
    description: 'Data-driven insights provided'
  },
  {
    icon: CheckCircle,
    value: '98.7%',
    label: 'Customer Satisfaction',
    description: 'Based on verified reviews'
  },
  {
    icon: Star,
    value: '4.9/5',
    label: 'Average Rating',
    description: 'From 5,000+ reviews'
  }
];

const trustBadges = [
  { text: 'SOC 2 Certified', icon: Shield },
  { text: 'GDPR Compliant', icon: CheckCircle },
  { text: '99.9% Uptime', icon: TrendingUp },
  { text: 'Bank-Level Security', icon: Shield }
];

export default function SocialProof({ onUpgradeClick, onViewTestimonials }: SocialProofProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
    setAutoPlay(false);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextTestimonial();
    } else if (isRightSwipe) {
      prevTestimonial();
    }
  };

  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [autoPlay]);

  const currentTest = testimonials[currentTestimonial];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 lg:space-y-12 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium mb-4 lg:mb-6">
          <Users className="w-4 h-4" />
          Trusted by 50,000+ Users
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 lg:mb-4 px-4">
          Real Results from Real People
        </h2>
        <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
          Join thousands of creators, businesses, and agencies who have transformed their Instagram presence
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8 lg:mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="text-center p-4 lg:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1 text-sm lg:text-base">{stat.label}</div>
              <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">{stat.description}</div>
            </div>
          );
        })}
      </div>

      {/* Featured Testimonial */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div 
          className="flex flex-col lg:flex-row"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Main Content */}
          <div className="flex-1 p-6 lg:p-12">
            {/* Header */}
            <div className="flex items-center gap-3 lg:gap-4 mb-6">
              <div className="text-4xl lg:text-6xl">{currentTest.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    {currentTest.name}
                  </h3>
                  {currentTest.verified && (
                    <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
                  {currentTest.role}
                  {currentTest.company && ` at ${currentTest.company}`}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(currentTest.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="text-base lg:text-xl text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
              <Quote className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400 inline mr-2 -mt-2" />
              {currentTest.quote}
              <Quote className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400 inline ml-2 rotate-180 -mt-2" />
            </blockquote>

            {/* Results */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {currentTest.results.map((result, index) => (
                <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 lg:p-4 border border-green-200 dark:border-green-700">
                  <div className="text-green-800 dark:text-green-300 font-semibold text-sm lg:text-base">
                    {result}
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap gap-4 lg:gap-6 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">Timeframe:</span> {currentTest.timeframe}
              </div>
              {currentTest.followers && (
                <div>
                  <span className="font-medium">Followers:</span> {currentTest.followers}
                </div>
              )}
              {currentTest.revenue && (
                <div>
                  <span className="font-medium">Revenue:</span> {currentTest.revenue}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Sidebar */}
          <div className="lg:hidden">
            {/* Navigation Section */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                Success Stories
              </h4>
              
              {/* Arrow Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevTestimonial}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentTestimonial + 1} / {testimonials.length}
                  </span>
                </div>
                
                <button
                  onClick={nextTestimonial}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Next testimonial"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Testimonial Selector */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {testimonials.slice(0, 3).map((testimonial, index) => (
                  <button
                    key={testimonial.id}
                    onClick={() => goToTestimonial(testimonials.findIndex(t => t.id === testimonial.id))}
                    className={`p-2 rounded-lg transition-all ${
                      currentTestimonial === testimonials.findIndex(t => t.id === testimonial.id)
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600 border-transparent'
                    } border text-xs`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{testimonial.avatar}</span>
                      <span className="font-medium text-gray-900 dark:text-white leading-tight">
                        {testimonial.name.split(' ')[0]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Dots Navigation */}
              <div className="flex justify-center gap-2 mb-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentTestimonial === index
                        ? 'bg-purple-600' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className="w-full text-xs text-purple-600 dark:text-purple-400 font-medium py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              >
                {autoPlay ? '⏸️ Pause' : '▶️ Play'} auto-rotation
              </button>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-96 bg-gray-50 dark:bg-gray-700/50 p-8 flex flex-col justify-between">
            {/* Navigation */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                More Success Stories
              </h4>
              <div className="space-y-3">
                {testimonials.slice(0, 3).map((testimonial, index) => (
                  <button
                    key={testimonial.id}
                    onClick={() => {
                      setCurrentTestimonial(testimonials.findIndex(t => t.id === testimonial.id));
                      setAutoPlay(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentTestimonial === testimonials.findIndex(t => t.id === testimonial.id)
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600 border-transparent'
                    } border`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{testimonial.avatar}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {testimonial.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dots Navigation */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-center gap-2 mb-4">
                {testimonials.slice(0, 3).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentTestimonial(testimonials.findIndex(t => t.id === testimonials[index].id));
                      setAutoPlay(false);
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentTestimonial === testimonials.findIndex(t => t.id === testimonials[index].id)
                        ? 'bg-purple-600' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className="w-full text-xs text-purple-600 dark:text-purple-400 font-medium"
              >
                {autoPlay ? 'Pause' : 'Play'} auto-rotation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 lg:mb-6">
          Trusted & Secure
        </h3>
        <div className="flex flex-wrap justify-center gap-3 lg:gap-6">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div key={index} className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300">{badge.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 lg:p-8">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 lg:mb-4">
            Ready to Join These Success Stories?
          </h3>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Start your free trial today and see why thousands of users trust our platform to grow their Instagram presence.
          </p>
          <div className="flex flex-col gap-3 lg:gap-4 justify-center">
            <button
              onClick={onUpgradeClick}
              className="flex items-center justify-center gap-2 px-6 lg:px-8 py-4 lg:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-base lg:text-base min-h-[48px]"
            >
              <Star className="w-5 h-5" />
              Start Your Success Story
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onViewTestimonials}
              className="px-6 lg:px-8 py-4 lg:py-4 border border-purple-300 text-purple-700 dark:text-purple-300 dark:border-purple-600 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-base min-h-[48px]"
            >
              Read More Stories
            </button>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-4 px-4">
            Join 50,000+ users • 4.9/5 average rating • 98.7% satisfaction rate
          </p>
        </div>
      </div>
    </div>
  );
}