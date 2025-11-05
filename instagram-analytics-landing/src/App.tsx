import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Shield, 
  Calendar, 
  Search, 
  CheckCircle, 
  Star,
  ArrowRight,
  Play,
  MessageSquare,
  Award,
  Zap,
  Target,
  Globe,
  Clock,
  Phone,
  Mail,
  X,
  Minus,
  Plus,
  ExternalLink,
  Lock,
  CreditCard,
  Users2,
  TrendingDown,
  Briefcase
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const platformUrl = 'https://lvy8r7gq8eu1.space.minimax.io';
  
  // State for interactive elements
  const [email, setEmail] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trust badges and social proof
  const trustBadges = [
    { icon: Shield, text: 'SOC 2 Compliant' },
    { icon: Lock, text: '256-bit SSL' },
    { icon: Users2, text: 'GDPR Ready' },
    { icon: Award, text: 'ISO 27001' }
  ];

  const companyLogos = [
    'TechCorp', 'GrowthLabs', 'DigitalPro', 'SocialMax', 'BrandBoost', 'MarketWise'
  ];

  // Enhanced testimonials with more detailed info
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Social Media Manager at TechCorp',
      content: 'This platform transformed our Instagram strategy. The AI insights are incredibly accurate and have helped us grow our engagement by 300%.',
      rating: 5,
      avatar: 'SC',
      results: '300% engagement growth'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Digital Marketing Agency Owner',
      content: 'The team collaboration features are game-changing. We can manage 50+ client accounts efficiently with real-time monitoring.',
      rating: 5,
      avatar: 'MR',
      results: '50+ accounts managed'
    },
    {
      name: 'Emily Johnson',
      role: 'Content Creator & Influencer',
      content: 'The content scheduling and AI recommendations have saved me hours every week. My posts are performing better than ever.',
      rating: 5,
      avatar: 'EJ',
      results: '10+ hours saved weekly'
    }
  ];

  // Add urgency/scarcity elements
  const urgencyElements = [
    { icon: Clock, text: 'Limited: 50 spots left this month' },
    { icon: Star, text: '97% of users see results within 30 days' },
    { icon: TrendingUp, text: 'Average ROI: 425% in first year' }
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In real implementation, this would send to email service
      console.log('Email submitted:', email);
      setIsEmailModalOpen(false);
      setEmail('');
      // Redirect to platform after email capture
      handleGetStarted();
    }
  };

  const handleContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setFormData({ name: '', email: '', company: '', message: '' });
    alert('Thank you! We\'ll be in touch soon.');
  };

  const handleGetStarted = () => {
    window.open(platformUrl, '_blank');
  };

  const handleWatchDemo = () => {
    // In a real implementation, this would open a demo video modal
    console.log('Demo video would play here');
  };

  const toggleEmailModal = () => {
    setIsEmailModalOpen(!isEmailModalOpen);
  };

  // Email capture modal component
  const EmailCaptureModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isEmailModalOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleEmailModal}></div>
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <button 
          onClick={toggleEmailModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-fit mx-auto mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Your Free Guide</h3>
          <p className="text-gray-600">Download our "Instagram Growth Playbook" and start seeing results today!</p>
        </div>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
          >
            Get Free Guide & Start Trial
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-4">
          No spam, unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </div>
  );

  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics & Data Infrastructure',
      description: 'Comprehensive Instagram analytics with real-time metrics, growth tracking, and audience insights.',
      benefits: ['Real-time performance tracking', 'Advanced audience demographics', 'Growth velocity analysis', 'Custom metric dashboards']
    },
    {
      icon: Calendar,
      title: 'Content Management System',
      description: 'Plan, schedule, and manage your Instagram content with our intuitive content calendar and bulk tools.',
      benefits: ['Drag-drop content planning', 'Bulk post management', 'Approval workflows', 'Content performance ranking']
    },
    {
      icon: Search,
      title: 'Advanced Research & Intelligence',
      description: 'Competitor analysis, influencer discovery, and market research tools for strategic growth.',
      benefits: ['Competitor benchmarking', 'Influencer database', 'Market trend analysis', 'Account audit tools']
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Features',
      description: 'Leverage artificial intelligence for content suggestions, performance predictions, and optimization.',
      benefits: ['AI content recommendations', 'Performance forecasting', 'Smart hashtag suggestions', 'Intelligent reporting']
    },
    {
      icon: Users,
      title: 'Productivity & Collaboration',
      description: 'Team management, role-based access control, and collaborative workflows for agencies.',
      benefits: ['Team member management', 'Role-based permissions', 'Real-time collaboration', 'Export templates']
    },
    {
      icon: Shield,
      title: 'Platform Enhancement & Testing',
      description: 'Enterprise-grade security, performance monitoring, and automated testing capabilities.',
      benefits: ['Security audit logging', 'Performance optimization', 'Automated testing suite', 'Admin panel controls']
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      originalPrice: '$39',
      description: 'Perfect for individual creators and small businesses',
      badge: 'Save 25%',
      features: [
        'Up to 3 Instagram accounts',
        'Basic analytics and insights',
        'Content scheduling',
        'Standard support',
        'Mobile app access',
        '30-day money-back guarantee'
      ],
      popular: false,
      color: 'from-blue-500 to-cyan-500',
      cta: 'Start 14-Day Free Trial'
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      originalPrice: '$99',
      description: 'Ideal for growing businesses and agencies',
      badge: 'Most Popular',
      features: [
        'Up to 15 Instagram accounts',
        'Advanced analytics and AI insights',
        'Team collaboration tools',
        'Competitor analysis',
        'Priority support',
        'API access',
        'Custom reporting',
        'Priority onboarding'
      ],
      popular: true,
      color: 'from-purple-500 to-pink-500',
      cta: 'Start Free Trial Now'
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      originalPrice: '$249',
      description: 'For large agencies and enterprises',
      badge: 'Best Value',
      features: [
        'Unlimited Instagram accounts',
        'Full platform access',
        'Advanced security features',
        'Custom integrations',
        'Dedicated account manager',
        'White-label options',
        'SLA guarantee',
        'Custom training sessions'
      ],
      popular: false,
      color: 'from-gray-700 to-gray-900',
      cta: 'Contact Sales'
    }
  ];

  const faqs = [
    {
      question: 'How does the AI-powered content analysis work?',
      answer: 'Our AI analyzes your content performance, audience engagement patterns, and industry trends to provide personalized recommendations for optimal posting times, content types, and hashtag strategies.'
    },
    {
      question: 'Can I manage multiple Instagram accounts?',
      answer: 'Yes! Depending on your plan, you can manage between 3 to unlimited Instagram accounts from a single dashboard with team collaboration features.'
    },
    {
      question: 'Is my Instagram data secure?',
      answer: 'Absolutely. We use enterprise-grade security measures including encryption, audit logging, and comply with data protection regulations to ensure your data is safe.'
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes, we offer a 14-day free trial with full access to all features so you can experience the platform before committing to a plan.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.'
    },
    {
      question: 'What makes this different from other Instagram tools?',
      answer: 'Our platform combines AI-powered insights, team collaboration, advanced research tools, and enterprise-grade security in one comprehensive solution.'
    },
    {
      question: 'How quickly will I see results?',
      answer: 'Most users see significant improvements within the first 30 days. Our AI learns your audience patterns and optimizes recommendations for maximum impact.'
    },
    {
      question: 'Do you provide customer support?',
      answer: 'Yes! We offer 24/7 support via chat, email, and phone. Enterprise customers get dedicated account managers and priority support.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Happy Users' },
    { number: '500M+', label: 'Posts Analyzed' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        {/* Trust badges bar */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center md:justify-start items-center py-2 space-x-6 text-xs text-gray-600">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className="flex items-center space-x-1">
                    <Icon className="w-3 h-3" />
                    <span>{badge.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Instagram Analytics Pro</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
              <button
                onClick={handleGetStarted}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={toggleEmailModal}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Get Started
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={handleGetStarted}
                className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="text-center">
            {/* Company logos */}
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-4">Trusted by leading brands worldwide</p>
              <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
                {companyLogos.map((company, index) => (
                  <div key={index} className="bg-gray-200 px-4 py-2 rounded text-sm font-medium text-gray-600">
                    {company}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700 mb-8">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Trusted by 10,000+ businesses worldwide</span>
              <span className="text-red-500 font-semibold">⚡ 50 spots left this month</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Professional Instagram
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {' '}Analytics Platform
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Transform your Instagram presence with AI-powered insights, advanced analytics, 
              team collaboration, and enterprise-grade tools. Built for serious growth.
            </p>
            
            {/* Urgency indicators */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {urgencyElements.map((element, index) => {
                const Icon = element.icon;
                return (
                  <div key={index} className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full text-sm">
                    <Icon className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{element.text}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={toggleEmailModal}
                className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleWatchDemo}
                className="px-6 md:px-8 py-3 md:py-4 bg-white text-gray-900 text-lg font-semibold rounded-xl border border-gray-200 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500 mb-12">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-200">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full text-sm font-medium text-purple-700 mb-4">
              <Zap className="w-4 h-4" />
              <span>Complete Solution</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Dominate Instagram
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Six powerful modules working together to give you complete control over your Instagram growth strategy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 md:mb-6">{feature.description}</p>
                  <ul className="space-y-2 md:space-y-3">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={handleGetStarted}
                    className="mt-4 md:mt-6 text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors flex items-center space-x-1"
                  >
                    <span>Learn more</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700 mb-4">
              <Award className="w-4 h-4 text-yellow-500" />
              <span>Customer Success Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Growth Professionals Worldwide
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              See how our platform is helping businesses and creators achieve remarkable results
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 md:w-5 h-4 md:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 md:mb-6 italic text-base md:text-lg">"{testimonial.content}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm md:text-base">{testimonial.name}</p>
                      <p className="text-xs md:text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">{testimonial.results}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Additional social proof */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
              <span className="text-gray-700 font-medium">4.9/5 from 2,847 reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full text-sm font-medium text-green-700 mb-4">
              <Target className="w-4 h-4" />
              <span>Simple Pricing</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Growth Plan
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Transparent pricing that scales with your business. Start free and upgrade when you're ready.
            </p>
            
            {/* Special offer banner */}
            <div className="mt-6 inline-flex items-center space-x-2 bg-red-100 px-4 py-2 rounded-full text-sm font-medium text-red-700">
              <Clock className="w-4 h-4" />
              <span>🔥 Limited Time: 25% OFF all plans - Ends Soon!</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative p-6 md:p-8 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-purple-50 to-pink-50 border-2 border-purple-500 shadow-xl' 
                    : 'bg-gray-50 border border-gray-200 hover:shadow-lg'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 md:px-6 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">{plan.description}</p>
                  <div className="flex items-baseline justify-center mb-2">
                    {plan.originalPrice && (
                      <span className="text-lg md:text-xl text-gray-400 line-through mr-2">{plan.originalPrice}</span>
                    )}
                    <span className="text-4xl md:text-6xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2 text-base md:text-lg">{plan.period}</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">per account</p>
                </div>
                
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 md:space-x-3">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={plan.cta === 'Contact Sales' ? () => window.location.href = 'mailto:sales@instagramanalytics.com' : toggleEmailModal}
                  className={`w-full py-3 md:py-4 rounded-xl font-semibold transition-all text-base md:text-lg ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </button>
                
                {plan.popular && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    💎 Most chosen by growing businesses
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 md:mt-12">
            <p className="text-gray-600 mb-4">All plans include our 14-day free trial</p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>24/7 support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-4">
              <MessageSquare className="w-4 h-4" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Get answers to common questions about our platform and features
            </p>
          </div>
          
          <div className="space-y-4 md:space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <button
                  className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  {expandedFaq === index ? (
                    <Minus className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Contact support CTA */}
          <div className="text-center mt-12">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
              <p className="text-gray-600 mb-6">Our support team is here to help you succeed.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = 'mailto:support@instagramanalytics.com'}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email Support</span>
                </button>
                <button
                  onClick={() => window.location.href = 'tel:+1-555-0123'}
                  className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Sales</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - CTA content */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Instagram Strategy?
              </h2>
              <p className="text-lg md:text-xl text-purple-100 mb-8 leading-relaxed">
                Join thousands of businesses and creators who are already growing with our comprehensive platform. 
                Start your free trial today and see the difference professional analytics can make.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={toggleEmailModal}
                  className="px-6 md:px-8 py-3 md:py-4 bg-white text-purple-600 text-base md:text-lg font-semibold rounded-xl hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Start Your Free Trial Today</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.location.href = 'mailto:sales@instagramanalytics.com'}
                  className="px-6 md:px-8 py-3 md:py-4 border-2 border-white text-white text-base md:text-lg font-semibold rounded-xl hover:bg-white hover:text-purple-600 transition-all flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Contact Sales</span>
                </button>
              </div>
              <p className="text-purple-200 mt-6 text-sm md:text-base">
                Questions? We're here to help at support@instagramanalytics.com
              </p>
            </div>
            
            {/* Right side - Contact form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 text-center">Get a Custom Demo</h3>
              <p className="text-purple-100 text-center mb-6 text-sm md:text-base">
                See how our platform can work for your specific needs
              </p>
              <form onSubmit={handleContactForm} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <input
                  type="email"
                  placeholder="Work Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <textarea
                  placeholder="Tell us about your needs..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Request Demo'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Instagram Analytics Pro</h3>
              </div>
              <p className="text-gray-400 mb-4 text-sm md:text-base">
                Professional Instagram analytics platform for serious growth and business success.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Globe className="w-4 h-4" />
                <span>Trusted worldwide</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 md:mb-6 text-base md:text-lg">Product</h4>
              <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 md:mb-6 text-base md:text-lg">Company</h4>
              <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 md:mb-6 text-base md:text-lg">Support</h4>
              <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status Page</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; 2024 Instagram Analytics Pro. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <CreditCard className="w-4 h-4" />
                <span>Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Email Capture Modal */}
      <EmailCaptureModal />
    </div>
  );
};

export default LandingPage;