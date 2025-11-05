import React, { useState, useCallback } from 'react';
import { 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram, 
  Mail, 
  MessageCircle,
  QrCode,
  Link2,
  Copy,
  ExternalLink,
  Send,
  Users,
  Eye,
  BarChart3
} from 'lucide-react';
import { useSharing } from '@/hooks/useExport';
import QRCodeReact from 'react-qr-code';

interface SocialShareProps {
  data: {
    title: string;
    description: string;
    url: string;
    image?: string;
    hashtags?: string[];
  };
  onShare?: (platform: string, sharedData: any) => void;
  showAnalytics?: boolean;
  className?: string;
}

interface ShareAnalytics {
  totalShares: number;
  platformBreakdown: Record<string, number>;
  recentShares: ShareEvent[];
}

interface ShareEvent {
  platform: string;
  timestamp: Date;
  url: string;
}

export default function SocialShare({ data, onShare, showAnalytics = true, className = '' }: SocialShareProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [analytics, setAnalytics] = useState<ShareAnalytics>({
    totalShares: 0,
    platformBreakdown: {},
    recentShares: []
  });

  const { trackShare, getShareAnalytics } = useSharing();

  const sharePlatforms = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      bgColor: 'hover:bg-blue-50',
      description: 'Share on Twitter'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50',
      description: 'Share on LinkedIn'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-700',
      bgColor: 'hover:bg-blue-50',
      description: 'Share on Facebook'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-600',
      bgColor: 'hover:bg-pink-50',
      description: 'Share on Instagram'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'text-gray-600',
      bgColor: 'hover:bg-gray-50',
      description: 'Share via Email'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50',
      description: 'Share on WhatsApp'
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: QrCode,
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50',
      description: 'Generate QR Code'
    },
    {
      id: 'link',
      name: 'Copy Link',
      icon: Link2,
      color: 'text-indigo-600',
      bgColor: 'hover:bg-indigo-50',
      description: 'Copy Shareable Link'
    }
  ];

  const generateShareUrl = useCallback((platform: string, customText?: string) => {
    const text = encodeURIComponent(customText || data.description);
    const url = encodeURIComponent(data.url);
    const hashtags = data.hashtags?.map(tag => tag.replace('#', '')).join(',') || '';
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}${hashtags ? `&hashtags=${hashtags}` : ''}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing via URL
      email: `mailto:?subject=${encodeURIComponent(data.title)}&body=${text}%0A%0A${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      qr: data.url, // For QR code generation
      link: data.url // For copying
    };
    
    return urls[platform as keyof typeof urls] || data.url;
  }, [data]);

  const handleShare = useCallback(async (platform: string) => {
    try {
      // Track the share event
      trackShare({
        type: platform === 'qr' || platform === 'link' ? 'link' : 'social',
        platform,
        reportId: 'current-report',
        timestamp: new Date()
      });

      if (platform === 'qr') {
        setShowQRCode(true);
        setSelectedPlatform(null);
        return;
      }

      if (platform === 'link') {
        await copyToClipboard(data.url);
        return;
      }

      if (platform === 'email') {
        const subject = encodeURIComponent(data.title);
        const body = encodeURIComponent(`${customMessage || data.description}\n\n${data.url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      } else {
        // Open social media sharing
        const shareUrl = generateShareUrl(platform, customMessage);
        const windowFeatures = 'width=600,height=400,scrollbars=yes,resizable=yes';
        window.open(shareUrl, '_blank', windowFeatures);
      }

      // Update share count
      setShareCount(prev => prev + 1);
      
      // Update analytics
      setAnalytics(getShareAnalytics());

      // Call onShare callback
      if (onShare) {
        onShare(platform, {
          url: generateShareUrl(platform, customMessage),
          platform,
          timestamp: new Date()
        });
      }

      setSelectedPlatform(null);
      setCustomMessage('');

    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [data, customMessage, generateShareUrl, trackShare, getShareAnalytics, onShare]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const generateQRCode = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan to Share</h3>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <QRCodeReact 
                value={data.url} 
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Scan this QR code to access the report on mobile devices
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => copyToClipboard(data.url)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Copy className="h-4 w-4 inline mr-2" />
                Copy URL
              </button>
              <button
                onClick={() => setShowQRCode(false)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Share Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">Share Analytics</span>
        </div>
        
        {showAnalytics && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span>{shareCount} shares</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>0 views</span>
            </div>
          </div>
        )}
      </div>

      {/* Share Message Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Custom Message (optional)
        </label>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Add a personal message to your share..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
          maxLength={280}
        />
        <div className="text-xs text-gray-500 text-right">
          {customMessage.length}/280 characters
        </div>
      </div>

      {/* Platform Selection */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Choose Platform</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sharePlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(selectedPlatform === platform.id ? null : platform.id)}
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                  selectedPlatform === platform.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${platform.bgColor}`}
              >
                <Icon className={`h-6 w-6 ${platform.color}`} />
                <span className="text-xs font-medium text-gray-700">{platform.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Platform Actions */}
      {selectedPlatform && (
        <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-purple-900">
              Share on {sharePlatforms.find(p => p.id === selectedPlatform)?.name}
            </h5>
            <button
              onClick={() => setSelectedPlatform(null)}
              className="text-purple-600 hover:text-purple-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Preview */}
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <h6 className="font-medium text-gray-900 mb-1">{data.title}</h6>
              <p className="text-sm text-gray-600 mb-2">
                {customMessage || data.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link2 className="h-3 w-3" />
                <span className="truncate">{data.url}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleShare(selectedPlatform)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
              >
                <Send className="h-4 w-4" />
                Share Now
              </button>
              
              {selectedPlatform === 'link' && (
                <button
                  onClick={() => copyToClipboard(data.url)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Share Actions */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            <Twitter className="h-4 w-4" />
            Tweet
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            <Linkedin className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={() => handleShare('email')}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Share Analytics */}
      {showAnalytics && shareCount > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Share Analytics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{shareCount}</div>
              <div className="text-sm text-gray-600">Total Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Engagement</div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && generateQRCode()}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h5 className="font-medium text-blue-900 mb-1">💡 Sharing Tips</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Add a custom message to make your share more engaging</li>
          <li>• Use relevant hashtags to increase visibility</li>
          <li>• Share on multiple platforms for maximum reach</li>
        </ul>
      </div>
    </div>
  );
}