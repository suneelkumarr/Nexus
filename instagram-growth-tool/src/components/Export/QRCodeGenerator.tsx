import React, { useState, useEffect } from 'react';
import { X, QrCode, Download, Share2, Settings, Eye, Smartphone, Copy, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
  onGenerate?: (qrDataUrl: string) => void;
}

export default function QRCodeGenerator({ isOpen, onClose, url = '', title = 'Instagram Analytics', onGenerate }: QRCodeGeneratorProps) {
  const [customUrl, setCustomUrl] = useState(url);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrOptions, setQrOptions] = useState({
    size: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    logo: '',
    logoSize: 0.15, // 15% of QR code size
    errorCorrectionLevel: 'M' as 'L' | 'M' | 'Q' | 'H',
    format: 'png' as 'png' | 'svg'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const sizePresets = [
    { label: 'Small (128px)', value: 128 },
    { label: 'Medium (256px)', value: 256 },
    { label: 'Large (512px)', value: 512 },
    { label: 'Extra Large (1024px)', value: 1024 }
  ];

  const errorCorrectionLevels = [
    { label: 'Low (7%)', value: 'L', description: 'Smallest QR codes' },
    { label: 'Medium (15%)', value: 'M', description: 'Recommended' },
    { label: 'Quartile (25%)', value: 'Q', description: 'Good for logos' },
    { label: 'High (30%)', value: 'H', description: 'Maximum error correction' }
  ];

  const designTemplates = [
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional black and white',
      options: { dark: '#000000', light: '#FFFFFF' }
    },
    {
      id: 'purple',
      name: 'Purple Theme',
      description: 'Brand colors',
      options: { dark: '#9333ea', light: '#FFFFFF' }
    },
    {
      id: 'gradient',
      name: 'Gradient',
      description: 'Modern gradient effect',
      options: { dark: '#9333ea', light: '#ec4899' }
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean and simple',
      options: { dark: '#374151', light: '#f9fafb' }
    }
  ];

  useEffect(() => {
    if (isOpen) {
      generateQRCode();
    }
  }, [customUrl, qrOptions, isOpen]);

  const generateQRCode = async () => {
    if (!customUrl.trim()) return;

    setIsGenerating(true);
    try {
      const options = {
        width: qrOptions.size,
        margin: qrOptions.margin,
        color: {
          dark: qrOptions.color.dark,
          light: qrOptions.color.light
        },
        errorCorrectionLevel: qrOptions.errorCorrectionLevel
      };

      const dataUrl = await QRCode.toDataURL(customUrl, options);
      setQrDataUrl(dataUrl);
      
      if (onGenerate) {
        onGenerate(dataUrl);
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qr-code.${qrOptions.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const applyDesignTemplate = (templateId: string) => {
    const template = designTemplates.find(t => t.id === templateId);
    if (template) {
      setQrOptions(prev => ({
        ...prev,
        color: template.options
      }));
    }
  };

  const generateShareableLinks = () => {
    const qrServices = [
      {
        name: 'QR Server',
        url: `https://api.qrserver.com/v1/create-qr-code/?size=${qrOptions.size}x${qrOptions.size}&data=${encodeURIComponent(customUrl)}`
      },
      {
        name: 'QR Code Generator',
        url: `https://www.qr-code-generator.com/?size=${qrOptions.size}&data=${encodeURIComponent(customUrl)}`
      },
      {
        name: 'Unitag',
        url: `https://www.unitag.io/qr-code-generator?data=${encodeURIComponent(customUrl)}`
      }
    ];

    return qrServices;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">QR Code Generator</h2>
            <p className="text-gray-600 mt-1">Create QR codes for easy mobile access</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-140px)]">
          {/* URL Input */}
          <div className="p-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">URL to Encode</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/analytics-report"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={() => setCustomUrl(window.location.href)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* QR Code Display */}
            <div className="w-1/2 p-6 border-r border-gray-200 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  {showAdvanced ? 'Simple' : 'Advanced'}
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating QR code...</p>
                  </div>
                ) : qrDataUrl ? (
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img 
                        src={qrDataUrl} 
                        alt="QR Code" 
                        className="border border-gray-200 rounded-lg"
                        style={{ maxWidth: '300px', maxHeight: '300px' }}
                      />
                      {qrOptions.logo && (
                        <img 
                          src={qrOptions.logo} 
                          alt="Logo" 
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          style={{ 
                            width: `${qrOptions.size * qrOptions.logoSize}px`,
                            height: `${qrOptions.size * qrOptions.logoSize}px`,
                            maxWidth: '60px',
                            maxHeight: '60px'
                          }}
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {qrOptions.size} × {qrOptions.size} pixels
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Enter a URL to generate QR code</p>
                  </div>
                )}
              </div>

              {qrDataUrl && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={downloadQRCode}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Download QR Code
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => copyToClipboard(customUrl)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </button>
                    <button
                      onClick={() => window.open(customUrl, '_blank')}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      Test Link
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="w-1/2 p-6 overflow-y-auto">
              {!showAdvanced ? (
                <div className="space-y-6">
                  {/* Quick Settings */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Quick Settings</h4>
                    
                    {/* Design Templates */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Design</label>
                      <div className="grid grid-cols-2 gap-2">
                        {designTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => applyDesignTemplate(template.id)}
                            className="p-3 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: template.options.dark }}
                              ></div>
                              <span className="font-medium text-sm text-gray-900">{template.name}</span>
                            </div>
                            <p className="text-xs text-gray-600">{template.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                      <select
                        value={qrOptions.size}
                        onChange={(e) => setQrOptions(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {sizePresets.map(preset => (
                          <option key={preset.value} value={preset.value}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Advanced Settings */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Advanced Settings</h4>
                    
                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Foreground</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={qrOptions.color.dark}
                            onChange={(e) => setQrOptions(prev => ({ 
                              ...prev, 
                              color: { ...prev.color, dark: e.target.value }
                            }))}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={qrOptions.color.dark}
                            onChange={(e) => setQrOptions(prev => ({ 
                              ...prev, 
                              color: { ...prev.color, dark: e.target.value }
                            }))}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={qrOptions.color.light}
                            onChange={(e) => setQrOptions(prev => ({ 
                              ...prev, 
                              color: { ...prev.color, light: e.target.value }
                            }))}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={qrOptions.color.light}
                            onChange={(e) => setQrOptions(prev => ({ 
                              ...prev, 
                              color: { ...prev.color, light: e.target.value }
                            }))}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Error Correction */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Error Correction</label>
                      <select
                        value={qrOptions.errorCorrectionLevel}
                        onChange={(e) => setQrOptions(prev => ({ ...prev, errorCorrectionLevel: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {errorCorrectionLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label} - {level.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Margin */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={qrOptions.margin}
                        onChange={(e) => setQrOptions(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>{qrOptions.margin}</span>
                        <span>10</span>
                      </div>
                    </div>

                    {/* Logo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL (Optional)</label>
                      <input
                        type="url"
                        value={qrOptions.logo}
                        onChange={(e) => setQrOptions(prev => ({ ...prev, logo: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {qrOptions.logo && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Logo Size</label>
                          <input
                            type="range"
                            min="0.05"
                            max="0.3"
                            step="0.01"
                            value={qrOptions.logoSize}
                            onChange={(e) => setQrOptions(prev => ({ ...prev, logoSize: parseFloat(e.target.value) }))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>5%</span>
                            <span>{Math.round(qrOptions.logoSize * 100)}%</span>
                            <span>30%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile-friendly sharing</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>View tracking available</span>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}