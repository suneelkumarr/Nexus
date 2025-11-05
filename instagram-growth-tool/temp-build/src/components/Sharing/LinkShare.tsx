import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  Copy, 
  QrCode, 
  ExternalLink, 
  Clock, 
  Users, 
  Eye, 
  BarChart3,
  Settings,
  Mail,
  MessageSquare,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  Globe
} from 'lucide-react';
import QRCodeReact from 'react-qr-code';

interface LinkShareProps {
  reportId: string;
  title: string;
  description?: string;
  timeRange: string;
  filters?: Record<string, any>;
  allowAnalytics?: boolean;
  showQRCode?: boolean;
  className?: string;
}

interface ShareAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  shares: number;
  lastViewed?: Date;
  viewHistory: ViewData[];
}

interface ViewData {
  timestamp: Date;
  userAgent: string;
  referrer: string;
  country?: string;
  city?: string;
}

export default function LinkShare({ 
  reportId, 
  title, 
  description = '', 
  timeRange, 
  filters = {}, 
  allowAnalytics = true,
  showQRCode = true,
  className = '' 
}: LinkShareProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [analytics, setAnalytics] = useState<ShareAnalytics>({
    totalViews: 0,
    uniqueVisitors: 0,
    shares: 0,
    viewHistory: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailList, setEmailList] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [accessPassword, setAccessPassword] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    generateShareableLink();
    if (allowAnalytics) {
      loadAnalytics();
    }
  }, [reportId, timeRange, filters, trackingEnabled]);

  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      report: reportId,
      period: timeRange,
      ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) }),
      ...(trackingEnabled && { track: '1' }),
      ...(accessPassword && { access: accessPassword }),
      ...(expiryDate && { expires: expiryDate })
    });
    
    const url = `${baseUrl}/shared-report?${params.toString()}`;
    setShareUrl(url);
    
    // Generate embed code
    const embed = `<iframe src="${url}" width="100%" height="600" frameborder="0"></iframe>`;
    setEmbedCode(embed);
  };

  const loadAnalytics = () => {
    // Simulate loading analytics data
    const mockAnalytics: ShareAnalytics = {
      totalViews: Math.floor(Math.random() * 100),
      uniqueVisitors: Math.floor(Math.random() * 80),
      shares: Math.floor(Math.random() * 20),
      lastViewed: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      viewHistory: Array.from({ length: 5 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
        userAgent: 'Chrome on Desktop',
        referrer: Math.random() > 0.5 ? 'Direct' : 'Twitter',
        country: ['US', 'UK', 'CA', 'AU'][Math.floor(Math.random() * 4)],
        city: ['New York', 'London', 'Toronto', 'Sydney'][Math.floor(Math.random() * 4)]
      }))
    };
    setAnalytics(mockAnalytics);
  };

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
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">QR Code</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <QRCodeReact 
                  value={shareUrl} 
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              
              <p className="text-sm text-gray-600 mt-4 mb-4">
                Scan this QR code to access the report on mobile devices
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Copy className="h-4 w-4 inline mr-2" />
                  Copy URL
                </button>
                
                <button
                  onClick={() => {
                    // Download QR code as image
                    const svg = document.querySelector('#qr-code-svg');
                    if (svg) {
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const img = new Image();
                      img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx?.drawImage(img, 0, 0);
                        canvas.toBlob((blob) => {
                          if (blob) {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'qr-code.png';
                            a.click();
                            URL.revokeObjectURL(url);
                          }
                        });
                      };
                      img.src = `data:image/svg+xml;base64,${btoa(new XMLSerializer().serializeToString(svg))}`;
                    }
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sendEmails = async () => {
    const emails = emailList.split(',').map(email => email.trim()).filter(email => email.length > 0);
    
    if (emails.length === 0) {
      alert('Please enter at least one email address');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mailto link for each email
      const subject = customSubject || `Instagram Analytics Report - ${timeRange}`;
      const body = customMessage || 
        `Please find the Instagram analytics report attached.\n\n` +
        `Report Title: ${title}\n` +
        `Period: ${timeRange}\n` +
        `Link: ${shareUrl}`;
      
      const mailtoLinks = emails.map(email => 
        `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      );
      
      // Open first email client
      if (mailtoLinks.length > 0) {
        window.location.href = mailtoLinks[0];
      }
      
    } catch (error) {
      console.error('Failed to send emails:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description || `Check out my Instagram analytics report`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Web Share API failed:', error);
      }
    } else {
      // Fallback to clipboard
      copyToClipboard(shareUrl);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Share Link */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Shareable Link</h3>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
          />
          <button
            onClick={() => copyToClipboard(shareUrl)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={() => window.open(shareUrl, '_blank')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </button>
        </div>
      </div>

      {/* Link Settings */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Link Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Password (optional)
              </label>
              <input
                type="password"
                value={accessPassword}
                onChange={(e) => {
                  setAccessPassword(e.target.value);
                  generateShareableLink();
                }}
                placeholder="Set password protection"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date (optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => {
                  setExpiryDate(e.target.value);
                  generateShareableLink();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={trackingEnabled}
              onChange={(e) => {
                setTrackingEnabled(e.target.checked);
                generateShareableLink();
              }}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Enable view tracking and analytics</span>
          </label>
        </div>
      </div>

      {/* Quick Share Actions */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Share</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={shareViaWebAPI}
            className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
          >
            <Share2 className="h-6 w-6 text-purple-600" />
            <span className="text-xs font-medium">Share</span>
          </button>
          
          <button
            onClick={() => setShowQRCode(true)}
            className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <QrCode className="h-6 w-6 text-blue-600" />
            <span className="text-xs font-medium">QR Code</span>
          </button>
          
          <button
            onClick={() => {
              const subject = `Instagram Analytics Report - ${timeRange}`;
              const body = `${description || 'Please find the Instagram analytics report attached.'}\n\nLink: ${shareUrl}`;
              window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }}
            className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
          >
            <Mail className="h-6 w-6 text-green-600" />
            <span className="text-xs font-medium">Email</span>
          </button>
          
          <button
            onClick={() => {
              const text = encodeURIComponent(`${description || 'Check out my Instagram analytics report!'}\n\n${shareUrl}`);
              window.open(`https://wa.me/?text=${text}`, '_blank');
            }}
            className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
          >
            <MessageSquare className="h-6 w-6 text-yellow-600" />
            <span className="text-xs font-medium">WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Email Campaign */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Email Campaign</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Emails (comma-separated)
            </label>
            <textarea
              value={emailList}
              onChange={(e) => setEmailList(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder={`Instagram Analytics Report - ${timeRange}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Message
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message to your email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              rows={3}
            />
          </div>
          
          <button
            onClick={sendEmails}
            disabled={isGenerating || !emailList.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send Emails
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embed Code */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Embed Code</h3>
        <p className="text-sm text-gray-600 mb-3">
          Copy this HTML code to embed the report in your website
        </p>
        
        <div className="space-y-2">
          <textarea
            value={embedCode}
            readOnly
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
            rows={3}
          />
          <button
            onClick={() => copyToClipboard(embedCode)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Copy className="h-4 w-4" />
            Copy Embed Code
          </button>
        </div>
      </div>

      {/* Analytics */}
      {allowAnalytics && trackingEnabled && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Link Analytics</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.totalViews}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.uniqueVisitors}</div>
              <div className="text-sm text-gray-600">Unique Visitors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.shares}</div>
              <div className="text-sm text-gray-600">Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analytics.lastViewed ? new Date(analytics.lastViewed).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Last Viewed</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Recent Activity</h4>
            {analytics.viewHistory.length > 0 ? (
              <div className="space-y-1">
                {analytics.viewHistory.map((view, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-gray-400" />
                      <span>{view.country} • {view.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{view.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && generateQRCode()}

      {/* Link Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Link Information</p>
            <ul className="space-y-1">
              <li>• Links are publicly accessible unless password protected</li>
              <li>• Analytics tracking requires JavaScript enabled</li>
              <li>• Expired links will redirect to a 404 page</li>
              <li>• Embed codes work on most websites and blogs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}