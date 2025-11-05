import React, { useState, useEffect } from 'react';
import { 
  X, 
  Link, 
  Copy, 
  ExternalLink, 
  QrCode, 
  Share2, 
  Settings, 
  Eye, 
  Users, 
  Calendar,
  Filter,
  Clock,
  BarChart3,
  TrendingUp,
  Smartphone
} from 'lucide-react';

interface LinkShareProps {
  isOpen: boolean;
  onClose: () => void;
  reportData?: {
    title: string;
    reportId?: string;
    analyticsData?: any;
  };
}

export default function LinkShare({ isOpen, onClose, reportData }: LinkShareProps) {
  const [shareOptions, setShareOptions] = useState({
    timeRange: '30d',
    includeAnalytics: true,
    includeCharts: true,
    password: '',
    expiresAt: '',
    customDomain: false,
    domainName: '',
    trackingEnabled: true,
    notifyOnView: false,
    maxViews: 0,
    allowDownload: false
  });

  const [generatedLinks, setGeneratedLinks] = useState<{
    public: string;
    embed: string;
    qr: string;
    short: string;
  } | null>(null);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days', description: 'Weekly performance' },
    { value: '30d', label: 'Last 30 days', description: 'Monthly overview' },
    { value: '90d', label: 'Last 3 months', description: 'Quarterly analysis' },
    { value: '1y', label: 'Last year', description: 'Annual performance' },
    { value: 'custom', label: 'Custom range', description: 'Specify dates' }
  ];

  const linkTemplates = [
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level metrics and KPIs',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'detailed',
      name: 'Detailed Analytics',
      description: 'Complete data breakdown',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'growth',
      name: 'Growth Story',
      description: 'Focus on trends and growth',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'comparison',
      name: 'Period Comparison',
      description: 'Before/after analysis',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      generateShareLinks();
    }
  }, [shareOptions, reportData]);

  const generateShareLinks = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate link generation process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const baseUrl = window.location.origin;
      const reportId = reportData?.reportId || generateReportId();
      
      // Build URL parameters
      const params = new URLSearchParams({
        report: reportId,
        period: shareOptions.timeRange,
        analytics: shareOptions.includeAnalytics.toString(),
        charts: shareOptions.includeCharts.toString(),
        v: '1' // version
      });

      if (shareOptions.password) {
        params.set('pwd', btoa(shareOptions.password));
      }

      if (shareOptions.expiresAt) {
        params.set('exp', new Date(shareOptions.expiresAt).getTime().toString());
      }

      if (shareOptions.maxViews > 0) {
        params.set('maxViews', shareOptions.maxViews.toString());
      }

      const publicLink = `${baseUrl}/shared-report?${params.toString()}`;
      
      // Generate embed code
      const embedCode = `<iframe 
  src="${publicLink}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  scrolling="auto"
  title="Instagram Analytics Report">
</iframe>`;

      // Generate short link (mock)
      const shortLink = `https://ghub.analytics/${reportId.substring(0, 8)}`;

      // Generate QR code (mock - would integrate with actual QR generation)
      const qrLink = `data:image/svg+xml;base64,${btoa(generateMockQRCode(publicLink))}`;

      setGeneratedLinks({
        public: publicLink,
        embed: embedCode,
        qr: qrLink,
        short: shortLink
      });
      
    } catch (error) {
      console.error('Failed to generate share links:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const generateMockQRCode = (url: string): string => {
    // This is a placeholder - in real implementation, you'd use a QR code library
    return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" dy=".3em" fill="black">QR Code</text>
      <text x="100" y="120" text-anchor="middle" dy=".3em" fill="black" font-size="8">${url.substring(0, 20)}...</text>
    </svg>`;
  };

  const copyToClipboard = (text: string, type: string = 'link') => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
    // For now, just console log for debugging
    console.log(`${type} copied to clipboard`);
  };

  const getLinkPreview = (url: string) => {
    return {
      title: reportData?.title || 'Instagram Analytics Report',
      description: `Instagram analytics data for ${timeRangeOptions.find(t => t.value === shareOptions.timeRange)?.description || 'selected period'}`,
      image: `${window.location.origin}/api/og-image?report=${shareOptions.timeRange}`,
      domain: window.location.hostname
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shareable Links</h2>
            <p className="text-gray-600 mt-1">Generate secure links for sharing your analytics</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-140px)]">
          {/* Settings */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Link Settings</h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings className="h-4 w-4" />
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Time Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={shareOptions.timeRange}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, timeRange: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {timeRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Include Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Include Data</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareOptions.includeAnalytics}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, includeAnalytics: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Analytics</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareOptions.includeCharts}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Charts</span>
                  </label>
                </div>
              </div>

              {/* Access Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Control</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareOptions.trackingEnabled}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, trackingEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Track views</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareOptions.notifyOnView}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, notifyOnView: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Email on view</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      value={shareOptions.password}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Optional password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expires</label>
                    <input
                      type="datetime-local"
                      value={shareOptions.expiresAt}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Views</label>
                    <input
                      type="number"
                      min="0"
                      value={shareOptions.maxViews}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, maxViews: parseInt(e.target.value) || 0 }))}
                      placeholder="0 = unlimited"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mt-8">
                      <input
                        type="checkbox"
                        checked={shareOptions.allowDownload}
                        onChange={(e) => setShareOptions(prev => ({ ...prev, allowDownload: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Allow download</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generated Links */}
          <div className="flex-1 overflow-y-auto p-6">
            {isGenerating ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating secure links...</p>
                </div>
              </div>
            ) : generatedLinks ? (
              <div className="space-y-6">
                {/* Public Link */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Public Share Link</h4>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedLinks.public}
                      readOnly
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedLinks.public, 'Public link')}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(generatedLinks.public, '_blank')}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Short Link */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-gray-900">Short Link</h4>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedLinks.short}
                      readOnly
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedLinks.short, 'Short link')}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Embed Code */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium text-gray-900">Embed Code</h4>
                  </div>
                  <textarea
                    value={generatedLinks.embed}
                    readOnly
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedLinks.embed, 'Embed code')}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Embed Code
                  </button>
                </div>

                {/* QR Code */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-orange-600" />
                    <h4 className="font-medium text-gray-900">QR Code</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <img 
                      src={generatedLinks.qr} 
                      alt="QR Code" 
                      className="w-24 h-24 border border-gray-200 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        Scan this QR code to view the report on mobile devices
                      </p>
                      <button
                        onClick={() => copyToClipboard(generatedLinks.public, 'QR link')}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        <Download className="h-4 w-4" />
                        Download QR Code
                      </button>
                    </div>
                  </div>
                </div>

                {/* Link Preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Link Preview</h4>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{getLinkPreview(generatedLinks.public).title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{getLinkPreview(generatedLinks.public).description}</p>
                        <p className="text-xs text-gray-500 mt-2">{getLinkPreview(generatedLinks.public).domain}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Tracking */}
                {shareOptions.trackingEnabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">View Tracking Enabled</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      You'll be notified when someone views this report. Current status: Ready to track views.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Link className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Configure settings to generate share links</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {generatedLinks ? (
                  <div className="flex items-center gap-4">
                    <span>🔒 Secure sharing enabled</span>
                    <span>📊 Analytics tracking: {shareOptions.trackingEnabled ? 'On' : 'Off'}</span>
                    <span>🕒 {shareOptions.expiresAt ? 'Expires' : 'No expiry'}</span>
                  </div>
                ) : (
                  'Links will be generated based on your settings'
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={generateShareLinks}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                  Regenerate Links
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}