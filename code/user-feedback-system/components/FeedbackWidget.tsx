import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, ThumbsUp, AlertTriangle, Send } from 'lucide-react';
import { 
  FeedbackWidgetProps, 
  FeedbackWidgetConfig, 
  UserFeedback, 
  BugReportData,
  NPSWidgetProps,
  FeatureRatingWidgetProps 
} from '../types';
import { feedbackService } from '../services/feedbackService';
import { sentimentAnalyzer } from '../utils/sentimentAnalyzer';

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  type,
  trigger = 'automatic',
  config,
  onSubmit,
  onClose,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (trigger === 'automatic' && config?.trigger_condition) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, config.trigger_condition.delay || 30000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [trigger, config]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Analyze sentiment
      const sentiment = await sentimentAnalyzer.analyze(data.message || '');
      
      const feedback: Partial<UserFeedback> = {
        feedback_type: type,
        ...data,
        sentiment_score: sentiment.score,
        context: {
          user_journey_stage: getUserJourneyStage(),
          device_type: getDeviceType(),
          browser: getBrowserInfo(),
          ...config?.trigger_condition
        },
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        session_id: getSessionId()
      };

      const result = await feedbackService.submitFeedback(feedback);
      
      if (onSubmit) {
        onSubmit(feedback);
      }
      
      setIsVisible(false);
      onClose?.();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserJourneyStage = (): string => {
    // Determine user journey stage based on analytics
    const accountAge = getAccountAge();
    const sessionDuration = getSessionDuration();
    
    if (accountAge < 7) return 'onboarding';
    if (sessionDuration > 300) return 'active_use';
    if (Math.random() > 0.7) return 'churn_risk';
    return 'returning_user';
  };

  const getAccountAge = (): number => {
    // Mock implementation - in real app, get from user profile
    return 15;
  };

  const getSessionDuration = (): number => {
    // Mock implementation - in real app, track session time
    return Math.floor(Math.random() * 600);
  };

  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad/.test(userAgent)) return 'mobile';
    if (/tablet/.test(userAgent)) return 'tablet';
    return 'desktop';
  };

  const getBrowserInfo = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    return 'Other';
  };

  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  if (!isVisible) return null;

  const renderContent = () => {
    switch (type) {
      case 'nps':
        return <NPSWidget onSubmit={handleSubmit} onClose={() => setIsVisible(false)} />;
      case 'feature_rating':
        return <FeatureRatingWidget onSubmit={handleSubmit} onClose={() => setIsVisible(false)} />;
      case 'bug_report':
        return <BugReportWidget onSubmit={handleSubmit} onClose={() => setIsVisible(false)} />;
      case 'general_feedback':
        return <GeneralFeedbackWidget onSubmit={handleSubmit} onClose={() => setIsVisible(false)} />;
      default:
        return <GeneralFeedbackWidget onSubmit={handleSubmit} onClose={() => setIsVisible(false)} />;
    }
  };

  const positionClasses = {
    'bottom_left': 'bottom-4 left-4',
    'bottom_right': 'bottom-4 right-4',
    'top_left': 'top-4 left-4',
    'top_right': 'top-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <div className={`fixed z-50 ${positionClasses[config?.position || 'bottom_right']} ${className}`}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-md w-80 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex justify-between items-center">
          <h3 className="font-semibold">{config?.title || 'We Value Your Feedback'}</h3>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// NPS Widget Component
const NPSWidget: React.FC<NPSWidgetProps> = ({ onSubmit, onClose, userSegment, showReasonPrompt = true }) => {
  const [score, setScore] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (score !== null) {
      onSubmit(score, reason);
    }
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 9) return 'Very Satisfied';
    if (score >= 7) return 'Satisfied';
    if (score >= 5) return 'Neutral';
    if (score >= 3) return 'Dissatisfied';
    return 'Very Dissatisfied';
  };

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-4">
        How likely are you to recommend our platform to others?
      </p>
      
      <div className="grid grid-cols-5 gap-2 mb-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
          <button
            key={number}
            onClick={() => setScore(number)}
            className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-all ${
              score === number
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {number}
          </button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 mb-4 flex justify-between">
        <span>Not at all likely</span>
        <span>Extremely likely</span>
      </div>
      
      {score !== null && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {getScoreLabel(score)}
          </p>
          
          {showReasonPrompt && (
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="What's the main reason for your score?"
              className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
              rows={3}
            />
          )}
        </div>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          Skip
        </button>
        <button
          onClick={handleSubmit}
          disabled={score === null}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1"
        >
          <Send size={14} />
          Submit
        </button>
      </div>
    </div>
  );
};

// Feature Rating Widget Component
const FeatureRatingWidget: React.FC<FeatureRatingWidgetProps> = ({
  feature,
  onSubmit,
  onClose,
  ratingLabel = 'Rate your experience',
  showFeedbackInput = true
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, feedback);
  };

  return (
    <div className="text-center">
      <h4 className="font-medium text-gray-900 mb-2">{feature}</h4>
      <p className="text-sm text-gray-600 mb-4">{ratingLabel}</p>
      
      <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
            className={`cursor-pointer transition-colors ${
              star <= (hoveredRating || rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      
      {showFeedbackInput && (
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us more about your experience..."
          className="w-full p-2 border border-gray-300 rounded text-sm resize-none mb-4"
          rows={3}
        />
      )}
      
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          Skip
        </button>
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

// Bug Report Widget Component
const BugReportWidget: React.FC<{ onSubmit: (data: BugReportData) => void; onClose: () => void }> = ({
  onSubmit,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [steps, setSteps] = useState('');

  const handleSubmit = () => {
    if (title.trim() && description.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        severity,
        steps_to_reproduce: steps.trim(),
        expected_behavior: '',
        actual_behavior: description.trim(),
        device_type: /Mobile|Android|iPhone/.test(navigator.userAgent) ? 'mobile' : 'desktop'
      });
    }
  };

  const severityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief description of the issue"
          className="w-full p-2 border border-gray-300 rounded text-sm"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
      </div>
      
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the problem"
          className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
          rows={3}
        />
      </div>
      
      <div>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as any)}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        >
          <option value="low">Low - Minor inconvenience</option>
          <option value="medium">Medium - Affects usability</option>
          <option value="high">High - Major functionality broken</option>
          <option value="critical">Critical - Platform unusable</option>
        </select>
      </div>
      
      <div>
        <textarea
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="Steps to reproduce (optional)"
          className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
          rows={2}
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !description.trim()}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1"
        >
          <AlertTriangle size={14} />
          Report Bug
        </button>
      </div>
    </div>
  );
};

// General Feedback Widget Component
const GeneralFeedbackWidget: React.FC<{ onSubmit: (data: any) => void; onClose: () => void }> = ({
  onSubmit,
  onClose
}) => {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState(0);

  const categories = [
    { value: 'user_interface', label: 'User Interface' },
    { value: 'performance', label: 'Performance' },
    { value: 'features', label: 'Features' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'billing', label: 'Billing' },
    { value: 'general', label: 'General' }
  ];

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit({
        message: message.trim(),
        category: category || 'general',
        rating: rating || undefined
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        >
          <option value="">Select a category (optional)</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={`cursor-pointer transition-colors ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Share your thoughts, suggestions, or concerns..."
        className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
        rows={4}
      />
      
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1"
        >
          <MessageSquare size={14} />
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

export default FeedbackWidget;