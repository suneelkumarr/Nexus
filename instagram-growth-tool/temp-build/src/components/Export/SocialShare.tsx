import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Copy,
  ExternalLink,
  QrCode,
  Link,
  Hash,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

interface SocialShareProps {
  isOpen: boolean;
  onClose: () => void;
  reportData?: {
    title: string;
    analyticsData?: any;
    shareableLink?: string;
    hashtags?: string[];
  };
}

export default function SocialShare({ isOpen, onClose, reportData }: SocialShareProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const socialPlatforms = [
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: Twitter,
      color: 'text-blue-400',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Share insights with your Twitter audience',
      maxLength: 280,
      supportsImages: true
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Professional network sharing',
      maxLength: 3000,
      supportsImages: true
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Share with your Facebook community',
      maxLength: 63206,
      supportsImages: true
    },
    {
      id: 'instagram',
      name: 'Instagram Stories',
      icon: Instagram,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      description: 'Create engaging Instagram Stories',
      maxLength: 2200,
      supportsImages: true
    }
  ];

  const defaultMessages = {
    twitter: () => `📊 Just completed my Instagram analytics review! 

${generateTwitterMessage()}

#InstagramAnalytics #SocialMediaMarketing #Growth ${getRecommendedHashtags().slice(0, 3).join(' ')}`,

    linkedin: () => `🚀 Instagram Performance Update

${generateLinkedInMessage()}

What strategies have worked best for your Instagram growth? Share your insights below! 👇

#InstagramMarketing #SocialMediaStrategy #DigitalGrowth`,

    facebook: () => `📈 Instagram Analytics Report Completed!

${generateFacebookMessage()}

I'd love to hear about your Instagram growth strategies in the comments! 

#InstagramAnalytics #SocialMedia #DigitalMarketing`,

    instagram: () => `✨ Instagram Analytics Deep Dive! 

${generateInstagramMessage()}

Double-tap if this inspires your Instagram growth journey! 💪

#InstagramAnalytics #GrowthHacking #SocialMedia ${getRecommendedHashtags().slice(0, 5).join(' ')}`
  };

  const shareTemplates = [
    {
      id: 'metrics',
      name: 'Key Metrics',
      description: 'Highlight impressive numbers',
      icon: TrendingUp,
      preview: 'Our Instagram engagement is up 25% this month!'
    },
    {
      id: 'milestone',
      name: 'Milestone Achievement',
      description: 'Celebrate growth achievements',
      icon: Award,
      preview: 'Just hit 50K followers! Thank you for the amazing support! 🎉'
    },
    {
      id: 'insights',
      name: 'Key Insights',
      description: 'Share valuable insights',
      icon: Hash,
      preview: 'Discovering that video content drives 3x more engagement than photos 📹'
    },
    {
      id: 'community',
      name: 'Community Building',
      description: 'Engage with your audience',
      icon: Users,
      preview: 'Building authentic connections one post at a time 💫'
    }
  ];

  function generateTwitterMessage(): string {
    const { analyticsData } = reportData || {};
    if (!analyticsData) return 'Check out my latest Instagram analytics insights!';
    
    const followerGrowth = analyticsData.growth?.followers || 0;
    const engagementRate = analyticsData.engagementRate || 0;
    
    if (followerGrowth > 0) {
      return `My Instagram is growing! 🚀\n\n• +${followerGrowth.toFixed(1)}% follower growth\n• ${engagementRate.toFixed(2)}% engagement rate\n• ${analyticsData.reach?.toLocaleString() || 'N/A'} total reach`;
    } else {
      return `Working on my Instagram strategy! 📊\n\n• ${engagementRate.toFixed(2)}% engagement rate\n• ${analyticsData.reach?.toLocaleString() || 'N/A'} total reach\n• Learning and improving every day!`;
    }
  }

  function generateLinkedInMessage(): string {
    const { analyticsData } = reportData || {};
    if (!analyticsData) return 'Sharing my latest Instagram analytics insights from this month.';
    
    return `Key Performance Indicators:
• Follower Growth: ${analyticsData.growth?.followers?.toFixed(1) || '0.0'}%
• Engagement Rate: ${analyticsData.engagementRate?.toFixed(2) || '0.00'}%
• Monthly Reach: ${analyticsData.reach?.toLocaleString() || 'N/A'} impressions

These metrics show ${analyticsData.growth?.followers > 0 ? 'strong momentum' : 'opportunities for optimization'} in our social media strategy.`;
  }

  function generateFacebookMessage(): string {
    const { analyticsData } = reportData || {};
    if (!analyticsData) return 'Just wrapped up my monthly Instagram analytics - so much to learn and improve on!';
    
    return `Monthly Instagram Update! 🎯

${analyticsData.growth?.followers > 0 ? 'Exciting growth this month!' : 'Focused on improving strategy!'} Here are the numbers:
• Followers: ${analyticsData.followers?.toLocaleString() || 'N/A'} (${analyticsData.growth?.followers > 0 ? '+' : ''}${analyticsData.growth?.followers?.toFixed(1) || '0.0'}%)
• Engagement: ${analyticsData.engagementRate?.toFixed(2) || '0.00'}%
• Reach: ${analyticsData.reach?.toLocaleString() || 'N/A'}

Thanks for following along on this journey!`;
  }

  function generateInstagramMessage(): string {
    const { analyticsData } = reportData || {};
    if (!analyticsData) return 'Always learning and growing! 📚✨';
    
    const growth = analyticsData.growth?.followers || 0;
    return growth > 0 
      ? `Growth update: ${growth.toFixed(1)}% follower increase this month! 📈\n\nThank you for being part of this journey! Your support means everything 💜`
      : `Consistency is key! 📊\n\n• ${analyticsData.engagementRate?.toFixed(2) || '0.00'}% engagement rate\n• ${analyticsData.reach?.toLocaleString() || 'N/A'} reach\n\nEvery step forward is progress! 🌟`;
  }

  function getRecommendedHashtags(): string[] {
    const hashtags = ['#InstagramGrowth', '#SocialMediaMarketing', '#ContentStrategy', '#DigitalMarketing', 
                     '#Growth', '#Engagement', '#Analytics', '#BrandBuilding', '#CommunityBuilding', '#Inspiration'];
    return reportData?.hashtags?.length ? reportData.hashtags : hashtags;
  }

  function generateShareableMessage(platformId: string): string {
    const defaultMessage = defaultMessages[platformId as keyof typeof defaultMessages]?.() || '';
    const customPart = customMessage ? `\n\n${customMessage}` : '';
    
    let message = defaultMessage + customPart;
    
    // Add hashtags if enabled
    if (includeHashtags) {
      const hashtags = getRecommendedHashtags();
      const hashtagString = platformId === 'instagram' ? hashtags.slice(0, 10).join(' ') : hashtags.slice(0, 5).join(' ');
      message += `\n\n${hashtagString}`;
    }
    
    // Add metrics if enabled and it's not already included
    if (includeMetrics && !message.includes('%') && reportData?.analyticsData) {
      const { analyticsData } = reportData;
      message += `\n\n📊 ${analyticsData.followers?.toLocaleString() || 'N/A'} followers • ${analyticsData.engagementRate?.toFixed(2) || '0.00'}% engagement`;
    }
    
    return message;
  }

  const getShareUrl = (platformId: string): string => {
    const shareText = encodeURIComponent(generateShareableMessage(platformId));
    const shareUrl = encodeURIComponent(reportData?.shareableLink || window.location.href);
    
    switch (platformId) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we prepare content for manual posting
        return 'instagram://create/story';
      default:
        return shareUrl;
    }
  };

  const handleShare = (platformId: string) => {
    const url = getShareUrl(platformId);
    
    if (platformId === 'instagram') {
      // For Instagram, copy the message to clipboard for manual posting
      navigator.clipboard.writeText(generateShareableMessage(platformId));
      alert('Message copied to clipboard! You can now paste it into Instagram.');
    } else {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const selectTemplate = (templateId: string) => {
    const template = shareTemplates.find(t => t.id === templateId);
    if (template) {
      setCustomMessage(template.preview);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Share on Social Media</h2>
            <p className="text-gray-600 mt-1">Share your Instagram analytics with your audience</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-140px)]">
          {/* Platform Selection */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Platform</h3>
            <div className="grid grid-cols-2 gap-3">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedPlatform === platform.id
                        ? 'border-purple-500 bg-purple-50'
                        : `${platform.borderColor} hover:${platform.bgColor}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                        <Icon className={`h-5 w-5 ${platform.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{platform.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {platform.maxLength.toLocaleString()} character limit
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedPlatform && (
            <>
              {/* Message Composition */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Templates */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Quick Templates</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {shareTemplates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={template.id}
                          onClick={() => selectTemplate(template.id)}
                          className="p-3 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-sm text-gray-900">{template.name}</span>
                          </div>
                          <p className="text-xs text-gray-600">{template.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add your personal touch to the message..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      Character limit: {generateShareableMessage(selectedPlatform).length}/
                      {socialPlatforms.find(p => p.id === selectedPlatform)?.maxLength || 0}
                    </span>
                    {generateShareableMessage(selectedPlatform).length > (socialPlatforms.find(p => p.id === selectedPlatform)?.maxLength || 0) && (
                      <span className="text-xs text-red-500">Message too long!</span>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Include</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeMetrics}
                        onChange={(e) => setIncludeMetrics(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Key performance metrics</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeHashtags}
                        onChange={(e) => setIncludeHashtags(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Relevant hashtags</span>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                  <div className="bg-white border border-gray-200 rounded p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
                    {generateShareableMessage(selectedPlatform) || 'Your message will appear here...'}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generateShareableMessage(selectedPlatform))}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Text
                    </button>
                    <button
                      onClick={() => copyToClipboard(getShareUrl(selectedPlatform))}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Link className="h-4 w-4" />
                      Copy Link
                    </button>
                    {reportData?.shareableLink && (
                      <button
                        onClick={() => copyToClipboard(reportData.shareableLink!)}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Copy Share URL
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleShare(selectedPlatform)}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Share2 className="h-4 w-4" />
                    Share on {socialPlatforms.find(p => p.id === selectedPlatform)?.name}
                  </button>
                </div>
              </div>
            </>
          )}

          {!selectedPlatform && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Platform</h3>
                <p className="text-gray-600">Choose a social media platform to start composing your share message</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}