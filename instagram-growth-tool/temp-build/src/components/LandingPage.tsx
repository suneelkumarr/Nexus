import React from 'react';
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
  Award
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics & Data Infrastructure',
      description: 'Comprehensive Instagram analytics with real-time metrics, growth tracking, and audience insights.',
      benefits: ['Real-time performance tracking', 'Advanced audience demographics', 'Growth velocity analysis']
    },
    {
      icon: Calendar,
      title: 'Content Management System',
      description: 'Plan, schedule, and manage your Instagram content with our intuitive content calendar.',
      benefits: ['Drag-drop content planning', 'Bulk post management', 'Approval workflows']
    },
    {
      icon: Search,
      title: 'Advanced Research & Intelligence',
      description: 'Competitor analysis, influencer discovery, and market research tools for strategic growth.',
      benefits: ['Competitor benchmarking', 'Influencer database', 'Market trend analysis']
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Features',
      description: 'Leverage artificial intelligence for content suggestions, performance predictions, and optimization.',
      benefits: ['AI content recommendations', 'Performance forecasting', 'Smart hashtag suggestions']
    },
    {
      icon: Users,
      title: 'Productivity & Collaboration',
      description: 'Team management, role-based access control, and collaborative workflows for agencies.',
      benefits: ['Team member management', 'Role-based permissions', 'Real-time collaboration']
    },
    {
      icon: Shield,
      title: 'Platform Enhancement & Testing',
      description: 'Enterprise-grade security, performance monitoring, and automated testing capabilities.',
      benefits: ['Security audit logging', 'Performance optimization', 'Automated testing suite']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Social Media Manager at TechCorp',
      content: 'This platform transformed our Instagram strategy. The AI insights are incredibly accurate and have helped us grow our engagement by 300%.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Digital Marketing Agency Owner',
      content: 'The team collaboration features are game-changing. We can manage 50+ client accounts efficiently with real-time monitoring.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Content Creator',
      content: 'The content scheduling and AI recommendations have saved me hours every week. My posts are performing better than ever.',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for individual creators and small businesses',
      features: [
        'Up to 3 Instagram accounts',
        'Basic analytics and insights',
        'Content scheduling',
        'Standard support',
        'Mobile app access'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Ideal for growing businesses and agencies',
      features: [
        'Up to 15 Instagram accounts',
        'Advanced analytics and AI insights',
        'Team collaboration tools',
        'Competitor analysis',
        'Priority support',
        'API access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'For large agencies and enterprises',
      features: [
        'Unlimited Instagram accounts',
        'Full platform access',
        'Advanced security features',
        'Custom integrations',
        'Dedicated account manager',
        'White-label options'
      ],
      popular: false
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
    }
  ];

  const handleGetStarted = () => {
    onGetStarted();
  };

  const handleWatchDemo = () => {
    // In a real implementation, this would open a demo video modal
    console.log('Demo video would play here');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
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
            <div className="flex items-center space-x-4">
              <button
                onClick={onGetStarted}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional Instagram
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {' '}Analytics Platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your Instagram presence with AI-powered insights, advanced analytics, 
              team collaboration, and enterprise-grade tools for serious growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleWatchDemo}
                className="px-8 py-4 bg-white text-gray-900 text-lg font-semibold rounded-xl border border-gray-200 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Instagram Growth Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to analyze, optimize, and scale your Instagram presence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="p-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mb-6">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Growth Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See how our platform is helping businesses and creators succeed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs and scale as you grow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative p-8 rounded-2xl ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-purple-50 to-pink-50 border-2 border-purple-500' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Start Free Trial
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Get answers to common questions about our platform
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Instagram Strategy?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of businesses and creators who are already growing with our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-purple-600 text-lg font-semibold rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Your Free Trial Today
            </button>
            <button
              onClick={() => window.location.href = 'mailto:support@instagramanalytics.com'}
              className="px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white hover:text-purple-600 transition-all flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Contact Sales</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Instagram Analytics Pro</h3>
              </div>
              <p className="text-gray-400">
                Professional Instagram analytics platform for serious growth.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Instagram Analytics Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;