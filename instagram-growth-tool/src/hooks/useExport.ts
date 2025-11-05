import { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { AnalyticsData, InstagramAccount, DateRange, ExportOptions } from '@/types/analytics';
import { 
  generatePDFReport, 
  downloadPDF, 
  exportToCSV, 
  exportToExcel, 
  exportToJSON,
  exportChartAsImage,
  downloadChartImage,
  performBatchExport,
  generateQRCode,
  generateShareableLink,
  generateMockExportData,
  ExportData,
  ChartData
} from '@/utils/exportUtils';
import {
  generateShareableLink as generateShareLink,
  shareToSocialMedia,
  shareViaEmail,
  copyToClipboard,
  trackShareView,
  getShareAnalytics,
  generateSocialContent,
  generateShareId,
  generateEmbedCode,
  ShareOptions,
  ShareableLink,
  ShareAnalytics
} from '@/utils/shareUtils';

export interface ExportProgress {
  stage: 'preparing' | 'generating' | 'finalizing' | 'complete';
  percentage: number;
  message: string;
}

export interface UseExportReturn {
  // State
  isExporting: boolean;
  exportProgress: ExportProgress | null;
  exportHistory: ExportHistoryItem[];
  
  // Export functions
  exportToPDF: (data: ExportData, options?: any) => Promise<void>;
  exportToCSV: (data: ExportData) => Promise<void>;
  exportToExcel: (data: ExportData) => Promise<void>;
  exportToJSON: (data: ExportData) => Promise<void>;
  exportChartImage: (chartElementId: string, format?: 'png' | 'jpeg') => Promise<void>;
  exportMultipleCharts: (chartIds: string[], format?: 'png' | 'jpeg') => Promise<void>;
  performBatchExport: (data: ExportData[], formats: string[]) => Promise<void>;
  
  // QR and Sharing
  generateQRCodeForShare: (reportId: string, timeRange: string) => Promise<string>;
  generateShareLink: (reportId: string, timeRange: string, filters?: Record<string, any>) => string;
  createShareableLink: (options: ShareOptions) => ShareableLink;
  shareOnSocialMedia: (platform: string, data: any) => void;
  shareViaEmail: (options: { to: string[]; subject: string; message: string; attachmentUrl?: string }) => string;
  
  // Presentation mode
  enterPresentationMode: () => void;
  exitPresentationMode: () => void;
  isPresentationMode: boolean;
  
  // Scheduling
  scheduleExport: (config: any) => void;
  getScheduledExports: () => any[];
  
  // Analytics
  getShareAnalytics: (shareId: string) => ShareAnalytics | null;
  trackShareView: (shareId: string, metadata?: any) => Promise<any>;
  
  // Copy utilities
  copyLink: (url: string) => Promise<boolean>;
  copyEmbedCode: (url: string, options?: any) => string;
  
  // Utilities
  clearExportHistory: () => void;
  getExportHistory: () => ExportHistoryItem[];
}

export interface ExportHistoryItem {
  id: string;
  type: 'pdf' | 'csv' | 'excel' | 'json' | 'chart';
  filename: string;
  size: string;
  timestamp: Date;
  reportId?: string;
  shareUrl?: string;
  qrCode?: string;
}

export const useExport = (): UseExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [scheduledExports, setScheduledExports] = useState<any[]>([]);

  const updateProgress = useCallback((stage: ExportProgress['stage'], percentage: number, message: string) => {
    setExportProgress({ stage, percentage, message });
  }, []);

  const addToHistory = useCallback((item: Omit<ExportHistoryItem, 'id' | 'timestamp'>) => {
    const historyItem: ExportHistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setExportHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 items
    return historyItem;
  }, []);

  const exportToPDF = useCallback(async (data: ExportData, options: any = {}) => {
    setIsExporting(true);
    try {
      updateProgress('preparing', 10, 'Preparing report data...');
      
      const filename = `instagram-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
      
      updateProgress('generating', 30, 'Generating PDF report...');
      const pdfBlob = await generatePDFReport(data, options);
      
      updateProgress('finalizing', 80, 'Finalizing PDF...');
      
      // Save the file
      saveAs(pdfBlob, filename);
      
      updateProgress('complete', 100, 'PDF report generated successfully!');
      
      addToHistory({
        type: 'pdf',
        filename,
        size: formatFileSize(pdfBlob.size),
        reportId: `report-${Date.now()}`
      });
      
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [addToHistory, updateProgress]);

  const exportToCSV = useCallback(async (data: ExportData) => {
    setIsExporting(true);
    try {
      updateProgress('preparing', 10, 'Preparing CSV data...');
      
      const filename = `analytics-data-${new Date().toISOString().split('T')[0]}.csv`;
      
      updateProgress('generating', 50, 'Generating CSV file...');
      exportToCSV(data, filename);
      
      updateProgress('complete', 100, 'CSV file generated successfully!');
      
      addToHistory({
        type: 'csv',
        filename,
        size: '1.2 MB', // Mock size
        reportId: `report-${Date.now()}`
      });
      
    } catch (error) {
      console.error('CSV export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [addToHistory, updateProgress]);

  const exportToExcel = useCallback(async (data: ExportData) => {
    setIsExporting(true);
    try {
      updateProgress('preparing', 10, 'Preparing Excel data...');
      
      const filename = `analytics-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      updateProgress('generating', 50, 'Generating Excel file...');
      exportToExcel(data, filename);
      
      updateProgress('complete', 100, 'Excel file generated successfully!');
      
      addToHistory({
        type: 'excel',
        filename,
        size: '2.8 MB', // Mock size
        reportId: `report-${Date.now()}`
      });
      
    } catch (error) {
      console.error('Excel export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [addToHistory, updateProgress]);

  const exportToJSON = useCallback(async (data: ExportData) => {
    setIsExporting(true);
    try {
      updateProgress('preparing', 10, 'Preparing JSON data...');
      
      const filename = `analytics-data-${new Date().toISOString().split('T')[0]}.json`;
      
      updateProgress('generating', 50, 'Generating JSON file...');
      exportToJSON(data, filename);
      
      updateProgress('complete', 100, 'JSON file generated successfully!');
      
      addToHistory({
        type: 'json',
        filename,
        size: '850 KB', // Mock size
        reportId: `report-${Date.now()}`
      });
      
    } catch (error) {
      console.error('JSON export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [addToHistory, updateProgress]);

  const exportChartImage = useCallback(async (chartElementId: string, format: 'png' | 'jpeg' = 'png') => {
    setIsExporting(true);
    try {
      updateProgress('preparing', 10, 'Capturing chart...');
      
      const filename = `chart-${chartElementId}-${new Date().toISOString().split('T')[0]}.${format}`;
      
      updateProgress('generating', 50, 'Rendering chart image...');
      await downloadChartImage(chartElementId, filename, format);
      
      updateProgress('complete', 100, 'Chart image exported successfully!');
      
      addToHistory({
        type: 'chart',
        filename,
        size: '425 KB', // Mock size
        reportId: `chart-${chartElementId}`
      });
      
    } catch (error) {
      console.error('Chart export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [addToHistory, updateProgress]);

  const performBatchExportFn = useCallback(async (data: ExportData[], formats: string[]) => {
    setIsExporting(true);
    try {
      updateProgress('preparing', 5, `Preparing batch export of ${formats.length} formats...`);
      
      for (let i = 0; i < formats.length; i++) {
        const format = formats[i];
        updateProgress('generating', 10 + (i * 80 / formats.length), `Generating ${format.toUpperCase()} files...`);
        
        // Process each format
        for (const exportData of data) {
          try {
            switch (format) {
              case 'pdf':
                await exportToPDF(exportData);
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
            }
          } catch (error) {
            console.error(`Error in batch export for ${format}:`, error);
          }
        }
      }
      
      updateProgress('complete', 100, 'Batch export completed successfully!');
      
    } catch (error) {
      console.error('Batch export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [exportToPDF, exportToCSV, exportToExcel, exportToJSON, updateProgress]);

  const exportMultipleCharts = useCallback(async (chartIds: string[], format: 'png' | 'jpeg' = 'png') => {
    setIsExporting(true);
    try {
      const totalCharts = chartIds.length;
      
      for (let i = 0; i < chartIds.length; i++) {
        const chartId = chartIds[i];
        updateProgress('generating', Math.round((i / totalCharts) * 100), `Exporting chart ${i + 1} of ${totalCharts}...`);
        
        await exportChartImage(chartId, format);
      }
      
      updateProgress('complete', 100, 'All charts exported successfully!');
      
    } catch (error) {
      console.error('Multiple chart export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [exportChartImage, updateProgress]);

  const generateQRCodeForShare = useCallback(async (reportId: string, timeRange: string) => {
    try {
      const shareLink = generateShareableLink({ reportId, timeRange });
      const qrCodeDataURL = await generateQRCode(shareLink, { size: 200 });
      
      // Add to history
      const filename = `qr-code-${reportId}.png`;
      addToHistory({
        type: 'chart', // Reusing chart type for QR codes
        filename,
        size: '15 KB',
        reportId,
        shareUrl: shareLink,
        qrCode: qrCodeDataURL
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw error;
    }
  }, [addToHistory]);

  const generateShareLink = useCallback((reportId: string, timeRange: string, filters?: Record<string, any>) => {
    return generateShareableLink({ reportId, timeRange, filters });
  }, []);

  const createShareableLink = useCallback((options: ShareOptions) => {
    const shareId = generateShareId();
    return generateShareLink({
      ...options,
      reportId: shareId
    });
  }, [generateShareLink]);

  const shareOnSocialMedia = useCallback((platform: string, data: any) => {
    const shareData = {
      url: data.url || generateShareLink({ reportId: data.reportId, timeRange: data.timeRange }),
      text: data.text || generateSocialContent(platform, data),
      hashtags: data.hashtags || ['#InstagramAnalytics', '#SocialMedia', '#Growth']
    };
    shareToSocialMedia(platform, shareData);
  }, [generateShareLink, generateSocialContent]);

  const shareViaEmailCallback = useCallback((options: { to: string[]; subject: string; message: string; attachmentUrl?: string }) => {
    return shareViaEmail(options);
  }, []);

  const enterPresentationMode = useCallback(() => {
    setIsPresentationMode(true);
    document.documentElement.requestFullscreen?.().catch(console.error);
  }, []);

  const exitPresentationMode = useCallback(() => {
    setIsPresentationMode(false);
    document.exitFullscreen?.().catch(console.error);
  }, []);

  const scheduleExport = useCallback((config: any) => {
    const schedule = {
      id: generateShareId(),
      ...config,
      createdAt: new Date()
    };
    setScheduledExports(prev => [schedule, ...prev]);
  }, []);

  const getScheduledExports = useCallback(() => {
    return [...scheduledExports];
  }, [scheduledExports]);

  const copyLink = useCallback(async (url: string) => {
    return await copyToClipboard(url);
  }, []);

  const copyEmbedCode = useCallback((url: string, options?: any) => {
    return generateEmbedCode(url, options);
  }, []);

  const clearExportHistory = useCallback(() => {
    setExportHistory([]);
  }, []);

  const getExportHistory = useCallback(() => {
    return [...exportHistory];
  }, [exportHistory]);

  return {
    // State
    isExporting,
    exportProgress,
    exportHistory,
    
    // Export functions
    exportToPDF,
    exportToCSV,
    exportToExcel,
    exportToJSON,
    exportChartImage,
    exportMultipleCharts,
    performBatchExport: performBatchExportFn,
    
    // QR and Sharing
    generateQRCodeForShare,
    generateShareLink,
    createShareableLink,
    shareOnSocialMedia,
    shareViaEmail: shareViaEmailCallback,
    
    // Presentation mode
    enterPresentationMode,
    exitPresentationMode,
    isPresentationMode,
    
    // Scheduling
    scheduleExport,
    getScheduledExports,
    
    // Analytics
    getShareAnalytics,
    trackShareView,
    
    // Copy utilities
    copyLink,
    copyEmbedCode,
    
    // Utilities
    clearExportHistory,
    getExportHistory
  };
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Hook for sharing and collaboration
export const useSharing = () => {
  const [shareHistory, setShareHistory] = useState<any[]>([]);
  
  const trackShare = useCallback((data: {
    type: 'email' | 'social' | 'link' | 'qr';
    platform?: string;
    reportId: string;
    recipient?: string;
    timestamp: Date;
  }) => {
    setShareHistory(prev => [data, ...prev.slice(0, 99)]); // Keep last 100 shares
  }, []);

  const getShareAnalytics = useCallback(() => {
    const totalShares = shareHistory.length;
    const platformBreakdown = shareHistory.reduce((acc, share) => {
      const platform = share.platform || share.type;
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalShares,
      platformBreakdown,
      recentShares: shareHistory.slice(0, 10)
    };
  }, [shareHistory]);

  return {
    trackShare,
    getShareAnalytics,
    shareHistory
  };
};

// Hook for scheduling exports
export const useExportScheduling = () => {
  const [scheduledExports, setScheduledExports] = useState<any[]>([]);
  
  const scheduleExport = useCallback((schedule: {
    id?: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    formats: string[];
    recipients?: string[];
    reportType: 'summary' | 'detailed' | 'custom';
    active: boolean;
  }) => {
    const newSchedule = {
      ...schedule,
      id: schedule.id || Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    
    setScheduledExports(prev => [newSchedule, ...prev]);
    return newSchedule.id;
  }, []);

  const cancelSchedule = useCallback((scheduleId: string) => {
    setScheduledExports(prev => prev.filter(s => s.id !== scheduleId));
  }, []);

  return {
    scheduledExports,
    scheduleExport,
    cancelSchedule
  };
};