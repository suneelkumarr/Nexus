import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Table, 
  FileImage, 
  Code, 
  QrCode, 
  Share2, 
  Calendar,
  Settings,
  CheckCircle,
  Clock,
  Mail,
  Twitter,
  Linkedin,
  Instagram,
  Copy,
  ExternalLink,
  Monitor,
  Printer
} from 'lucide-react';
import { useExport, ExportProgress } from '@/hooks/useExport';
import { generateMockExportData } from '@/utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
}

type ExportFormat = 'pdf' | 'csv' | 'excel' | 'json' | 'chart';

interface ExportConfig {
  format: ExportFormat;
  template?: 'executive' | 'detailed' | 'custom';
  includeCharts: boolean;
  includeAnalytics: boolean;
  selectedMetrics: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

export default function ExportModal({ isOpen, onClose, data }: ExportModalProps) {
  const { 
    isExporting, 
    exportProgress, 
    exportToPDF, 
    exportToCSV, 
    exportToExcel, 
    exportToJSON,
    exportChartImage,
    performBatchExport: performBatchExportFn,
    generateQRCodeForShare,
    generateShareLink
  } = useExport();

  const [activeTab, setActiveTab] = useState<'export' | 'share' | 'schedule' | 'history'>('export');
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>(['pdf']);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'pdf',
    template: 'executive',
    includeCharts: true,
    includeAnalytics: true,
    selectedMetrics: ['followers', 'engagement', 'reach', 'likes', 'comments'],
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  });

  const [shareOptions, setShareOptions] = useState({
    email: '',
    socialPlatform: '',
    customMessage: '',
    includeQR: true,
    trackViews: true
  });

  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');

  // Mock data for demonstration
  const [exportData] = useState(() => generateMockExportData());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const exportFormatOptions = [
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF Report',
      description: 'Professional PDF report with charts and insights',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      popular: true
    },
    {
      id: 'csv' as ExportFormat,
      name: 'CSV Data',
      description: 'Raw data for spreadsheet analysis',
      icon: Table,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'excel' as ExportFormat,
      name: 'Excel Workbook',
      description: 'Multi-sheet workbook with detailed data',
      icon: Table,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'json' as ExportFormat,
      name: 'JSON Data',
      description: 'Developer-friendly data format',
      icon: Code,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'chart' as ExportFormat,
      name: 'Chart Images',
      description: 'Export individual charts as images',
      icon: FileImage,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const handleFormatToggle = (format: ExportFormat) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const handleExport = async () => {
    try {
      if (selectedFormats.length === 1) {
        // Single format export
        switch (selectedFormats[0]) {
          case 'pdf':
            await exportToPDF(exportData, {
              title: `Instagram Analytics Report - ${exportConfig.dateRange.start.toLocaleDateString()} to ${exportConfig.dateRange.end.toLocaleDateString()}`,
              template: exportConfig.template,
              includeCharts: exportConfig.includeCharts,
              includeAnalytics: exportConfig.includeAnalytics
            });
            break;
          case 'csv':
            await exportToCSV(exportData);
            break;
          case 'excel':
            await exportToExcel(exportData);
            break;
          case 'json':
            await exportToJSON(exportData);
            break;
          case 'chart':
            // Export all charts
            const chartIds = ['follower-growth', 'engagement-trend', 'content-type', 'post-frequency'];
            for (const chartId of chartIds) {
              await exportChartImage(chartId);
            }
            break;
        }
      } else {
        // Batch export
        await performBatchExportFn([exportData], selectedFormats);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleGenerateQRCode = async () => {
    try {
      const shareLink = generateShareLink('report-123', '30d', exportConfig.selectedMetrics);
      const qrCode = await generateQRCodeForShare('report-123', '30d');
      setQrCodeData(qrCode);
      setShowQRCode(true);
    } catch (error) {
      console.error('QR code generation failed:', error);
    }
  };

  const handleSocialShare = (platform: string) => {
    const shareText = encodeURIComponent(`Check out my Instagram analytics report! 📊`);
    const shareUrl = encodeURIComponent(generateShareLink('report-123', '30d'));
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      email: `mailto:?subject=Instagram Analytics Report&body=${shareText}%0A%0A${shareUrl}`
    };
    
    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Export & Share Analytics</h2>
            <p className="text-gray-600 mt-1">Generate reports, share insights, and schedule automation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'export', name: 'Export', icon: Download },
            { id: 'share', name: 'Share', icon: Share2 },
            { id: 'schedule', name: 'Schedule', icon: Calendar },
            { id: 'history', name: 'History', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Export Progress */}
              {isExporting && exportProgress && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="font-medium text-blue-900">{exportProgress.message}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-blue-700 mt-1">{exportProgress.percentage}% complete</span>
                </div>
              )}

              {/* Format Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Export Format</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exportFormatOptions.map((format) => (
                    <div
                      key={format.id}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedFormats.includes(format.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleFormatToggle(format.id)}
                    >
                      {format.popular && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                          Popular
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${format.bgColor}`}>
                          <format.icon className={`h-6 w-6 ${format.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{format.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                        </div>
                        {selectedFormats.includes(format.id) && (
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PDF Options */}
                {(selectedFormats.includes('pdf') || selectedFormats.length === 0) && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">PDF Options</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                      <select
                        value={exportConfig.template}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, template: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="executive">Executive Summary</option>
                        <option value="detailed">Detailed Report</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exportConfig.includeCharts}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Include Charts</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exportConfig.includeAnalytics}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, includeAnalytics: e.target.checked }))}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Include Analytics</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Date Range */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Date Range</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exportConfig.dateRange.start.toISOString().split('T')[0]}
                        onChange={(e) => setExportConfig(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, start: new Date(e.target.value) }
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exportConfig.dateRange.end.toISOString().split('T')[0]}
                        onChange={(e) => setExportConfig(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, end: new Date(e.target.value) }
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {selectedFormats.length === 1 
                    ? `Exporting as ${selectedFormats[0].toUpperCase()}`
                    : `Batch export (${selectedFormats.length} formats)`
                  }
                </div>
                <button
                  onClick={handleExport}
                  disabled={isExporting || selectedFormats.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isExporting ? 'Exporting...' : `Export ${selectedFormats.length > 1 ? 'Batch' : ''}`}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-6">
              {/* Share Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Social Sharing */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Social Media</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleSocialShare('twitter')}
                      className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Twitter className="h-6 w-6 text-blue-400" />
                      <span className="text-xs font-medium">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleSocialShare('linkedin')}
                      className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Linkedin className="h-6 w-6 text-blue-600" />
                      <span className="text-xs font-medium">LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleSocialShare('email')}
                      className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Mail className="h-6 w-6 text-gray-600" />
                      <span className="text-xs font-medium">Email</span>
                    </button>
                  </div>
                </div>

                {/* QR Code */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">QR Code</h4>
                  <div className="text-center">
                    <button
                      onClick={handleGenerateQRCode}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mx-auto"
                    >
                      <QrCode className="h-4 w-4" />
                      Generate QR Code
                    </button>
                  </div>
                  {showQRCode && qrCodeData && (
                    <div className="text-center">
                      <img src={qrCodeData} alt="QR Code" className="mx-auto border rounded-lg" />
                      <p className="text-xs text-gray-500 mt-2">Scan to view report on mobile</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shareable Link */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Shareable Link</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generateShareLink('report-123', '30d')}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                  />
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Presentation Mode */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Presentation Mode</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
                    <Monitor className="h-6 w-6 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Full Screen Dashboard</div>
                      <div className="text-sm text-gray-600">Present your analytics in clean full-screen mode</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
                    <Printer className="h-6 w-6 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Print Layout</div>
                      <div className="text-sm text-gray-600">Optimized layout for printing</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Automated Reporting</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Schedule automatic report generation and delivery. Perfect for regular team updates and client reports.
                </p>
                <button className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                  Coming Soon
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Export History</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  View and manage your recent exports, downloads, and shared reports.
                </p>
                <button className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                  Coming Soon
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}