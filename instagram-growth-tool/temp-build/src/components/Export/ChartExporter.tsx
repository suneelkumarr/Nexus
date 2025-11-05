import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { 
  Download, 
  Image as ImageIcon, 
  FileImage, 
  Settings, 
  Maximize2, 
  Crop,
  Palette,
  Filter,
  Share2
} from 'lucide-react';

interface ChartExporterProps {
  chartId?: string;
  chartRef?: React.RefObject<HTMLElement>;
  chartName?: string;
  onExport?: (blob: Blob, filename: string) => void;
  className?: string;
}

type ExportFormat = 'png' | 'jpeg' | 'svg' | 'pdf';
type ExportQuality = 'low' | 'medium' | 'high' | 'ultra';

interface ExportOptions {
  format: ExportFormat;
  quality: ExportQuality;
  width: number;
  height: number;
  backgroundColor: string;
  transparent: boolean;
  scale: number;
  includeTitle: boolean;
  titleText?: string;
  titlePosition: 'top' | 'bottom' | 'overlay';
  fontSize: number;
  fontFamily: string;
}

export default function ChartExporter({ 
  chartId, 
  chartRef, 
  chartName = 'Chart', 
  onExport,
  className = '' 
}: ChartExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 'high',
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    transparent: false,
    scale: 2,
    includeTitle: true,
    titlePosition: 'top',
    fontSize: 14,
    fontFamily: 'Arial, sans-serif'
  });

  const getChartElement = useCallback(() => {
    if (chartRef?.current) {
      return chartRef.current;
    }
    
    if (chartId) {
      return document.getElementById(chartId);
    }
    
    // Fallback to finding chart elements
    const chartElements = document.querySelectorAll('.recharts-wrapper, .chart-container, [data-chart]');
    return chartElements[0] as HTMLElement;
  }, [chartId, chartRef]);

  const getQualityMultiplier = (quality: ExportQuality): number => {
    switch (quality) {
      case 'low': return 1;
      case 'medium': return 1.5;
      case 'high': return 2;
      case 'ultra': return 3;
      default: return 2;
    }
  };

  const getExportSettings = () => {
    const qualityMultiplier = getQualityMultiplier(exportOptions.quality);
    
    return {
      scale: exportOptions.scale * qualityMultiplier,
      width: exportOptions.width * qualityMultiplier,
      height: exportOptions.height * qualityMultiplier,
      backgroundColor: exportOptions.transparent ? undefined : exportOptions.backgroundColor,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDoc: Document) => {
        // Apply styles to cloned document
        const clonedElement = clonedDoc.querySelector(`#${chartId}`) || clonedDoc.querySelector('.recharts-wrapper');
        if (clonedElement) {
          // Ensure fonts are loaded
          if ('fonts' in document) {
            (document as any).fonts.ready.then(() => {
              // Additional styling for export
              clonedElement.style.fontFamily = exportOptions.fontFamily;
            });
          }
        }
      }
    };
  };

  const generatePreview = async () => {
    const chartElement = getChartElement();
    if (!chartElement) {
      throw new Error('Chart element not found');
    }

    const canvas = await html2canvas(chartElement, getExportSettings());
    const dataUrl = canvas.toDataURL('image/png', 0.9);
    setPreviewUrl(dataUrl);
    return dataUrl;
  };

  const exportChart = async () => {
    const chartElement = getChartElement();
    if (!chartElement) {
      throw new Error('Chart element not found. Please ensure the chart is visible and try again.');
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(chartElement, getExportSettings());
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), `image/${exportOptions.format}`, 0.9);
      });

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${chartName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${exportOptions.format}`;

      // Save file
      saveAs(blob, filename);

      // Call onExport callback
      if (onExport) {
        onExport(blob, filename);
      }

      return blob;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const exportWithTitle = async () => {
    const chartElement = getChartElement();
    if (!chartElement) {
      throw new Error('Chart element not found');
    }

    setIsExporting(true);
    try {
      // Create a temporary container with title
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.backgroundColor = exportOptions.backgroundColor;
      tempContainer.style.padding = '20px';
      tempContainer.style.width = `${exportOptions.width}px`;
      tempContainer.style.fontFamily = exportOptions.fontFamily;

      // Add title if requested
      if (exportOptions.includeTitle && exportOptions.titleText) {
        const titleElement = document.createElement('h3');
        titleElement.textContent = exportOptions.titleText;
        titleElement.style.fontSize = `${exportOptions.fontSize + 4}px`;
        titleElement.style.fontWeight = 'bold';
        titleElement.style.marginBottom = '10px';
        titleElement.style.color = '#333';
        titleElement.style.textAlign = 'center';
        
        if (exportOptions.titlePosition === 'top') {
          tempContainer.appendChild(titleElement);
        }
      }

      // Clone the chart element
      const chartClone = chartElement.cloneNode(true) as HTMLElement;
      tempContainer.appendChild(chartClone);

      // Add title at bottom if requested
      if (exportOptions.includeTitle && exportOptions.titleText && exportOptions.titlePosition === 'bottom') {
        const titleElement = document.createElement('h3');
        titleElement.textContent = exportOptions.titleText;
        titleElement.style.fontSize = `${exportOptions.fontSize + 4}px`;
        titleElement.style.fontWeight = 'bold';
        titleElement.style.marginTop = '10px';
        titleElement.style.color = '#333';
        titleElement.style.textAlign = 'center';
        tempContainer.appendChild(titleElement);
      }

      document.body.appendChild(tempContainer);

      // Generate canvas
      const canvas = await html2canvas(tempContainer, {
        ...getExportSettings(),
        width: tempContainer.offsetWidth,
        height: tempContainer.offsetHeight
      });

      // Clean up
      document.body.removeChild(tempContainer);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), `image/${exportOptions.format}`, 0.9);
      });

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${chartName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${exportOptions.format}`;

      // Save file
      saveAs(blob, filename);

      return blob;
    } catch (error) {
      console.error('Export with title failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
    try {
      if (exportOptions.includeTitle && exportOptions.titleText) {
        await exportWithTitle();
      } else {
        await exportChart();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatOptions = [
    { value: 'png', label: 'PNG', description: 'High quality with transparency' },
    { value: 'jpeg', label: 'JPEG', description: 'Smaller file size' },
    { value: 'svg', label: 'SVG', description: 'Vector format' },
    { value: 'pdf', label: 'PDF', description: 'Document format' }
  ];

  const qualityOptions = [
    { value: 'low', label: 'Low (72 DPI)', multiplier: 1 },
    { value: 'medium', label: 'Medium (150 DPI)', multiplier: 1.5 },
    { value: 'high', label: 'High (300 DPI)', multiplier: 2 },
    { value: 'ultra', label: 'Ultra (450 DPI)', multiplier: 3 }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Export Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export Chart
            </>
          )}
        </button>

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Options
        </button>

        <button
          onClick={generatePreview}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ImageIcon className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
          <img src={previewUrl} alt="Chart preview" className="max-w-full h-auto rounded" />
        </div>
      )}

      {/* Export Options */}
      {showOptions && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Export Settings</h4>
            <button
              onClick={() => setShowOptions(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as ExportFormat }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {formatOptions.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label} - {format.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
              <select
                value={exportOptions.quality}
                onChange={(e) => setExportOptions(prev => ({ ...prev, quality: e.target.value as ExportQuality }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {qualityOptions.map(quality => (
                  <option key={quality.value} value={quality.value}>
                    {quality.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
              <input
                type="number"
                value={exportOptions.width}
                onChange={(e) => setExportOptions(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
              <input
                type="number"
                value={exportOptions.height}
                onChange={(e) => setExportOptions(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={exportOptions.backgroundColor}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.transparent}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, transparent: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Transparent</span>
                </label>
              </div>
            </div>

            {/* Title Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Include Title</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeTitle}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeTitle: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Add title to exported image</span>
              </label>
            </div>
          </div>

          {/* Title Settings */}
          {exportOptions.includeTitle && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h5 className="font-medium text-gray-900">Title Settings</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title Text</label>
                  <input
                    type="text"
                    value={exportOptions.titleText || ''}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, titleText: e.target.value }))}
                    placeholder="Enter chart title..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={exportOptions.titlePosition}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, titlePosition: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="overlay">Overlay</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="border-t border-gray-200 pt-4">
            <h5 className="font-medium text-gray-900 mb-3">Advanced</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scale Factor</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  value={exportOptions.scale}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, scale: parseFloat(e.target.value) || 2 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                <input
                  type="number"
                  min="8"
                  max="24"
                  value={exportOptions.fontSize}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 14 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={exportOptions.fontFamily}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Helvetica, sans-serif">Helvetica</option>
                  <option value="Times New Roman, serif">Times New Roman</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Quick actions:</span>
        <button
          onClick={() => setExportOptions(prev => ({ ...prev, format: 'png', quality: 'high' }))}
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          High Quality PNG
        </button>
        <span>•</span>
        <button
          onClick={() => setExportOptions(prev => ({ ...prev, format: 'jpeg', quality: 'medium' }))}
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          Compressed JPEG
        </button>
        <span>•</span>
        <button
          onClick={() => setExportOptions(prev => ({ ...prev, format: 'pdf', quality: 'high' }))}
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          PDF Document
        </button>
      </div>
    </div>
  );
}