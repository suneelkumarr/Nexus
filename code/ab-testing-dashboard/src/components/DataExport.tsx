import React, { useState, useEffect, useMemo } from 'react';
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  DocumentChartBarIcon,
  SparklesIcon,
  CogIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { ExportConfig, ABTest, ExportJob } from '../types';
import { toast } from 'react-hot-toast';

const DataExport: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [selectedFormat, setSelectedFormat] = useState<ExportConfig['format']>('csv');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [includeRawData, setIncludeRawData] = useState(true);
  const [includeStatisticalAnalysis, setIncludeStatisticalAnalysis] = useState(true);
  const [includeVisualizations, setIncludeVisualizations] = useState(true);
  const [includeActivityLog, setIncludeActivityLog] = useState(false);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [groupBy, setGroupBy] = useState<ExportConfig['groupBy']>('day');
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [selectedTab, setSelectedTab] = useState<'export' | 'history' | 'templates' | 'scheduled'>('export');

  // Mock tests data
  const [tests] = useState<ABTest[]>([
    {
      id: 'test_1',
      name: 'Homepage CTA Button Color',
      description: 'Testing blue vs green CTA button colors',
      hypothesis: 'Green buttons will increase conversions',
      status: 'running',
      category: 'Landing Page',
      priority: 'high',
      variants: [
        {
          id: 'control',
          name: 'Blue Button',
          description: 'Current blue CTA',
          trafficAllocation: 50,
          isControl: true,
          conversionRate: 2.3,
          visitors: 1247,
          conversions: 29,
          revenue: 1450,
          config: {},
          color: '#3B82F6',
        },
        {
          id: 'variant_a',
          name: 'Green Button',
          description: 'New green CTA',
          trafficAllocation: 50,
          isControl: false,
          conversionRate: 2.8,
          visitors: 1289,
          conversions: 36,
          revenue: 1800,
          config: {},
          color: '#10B981',
        },
      ],
      targetAudience: {
        percentage: 100,
        device: { desktop: true, mobile: true, tablet: true },
      },
      metrics: [
        {
          id: 'primary',
          name: 'Conversion Rate',
          type: 'conversion',
          eventName: 'signup',
          aggregation: 'percentage',
          isPrimary: true,
          unit: '%',
        },
      ],
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 0,
      minimumSampleSize: 1000,
      statisticalSignificance: 5,
      confidenceLevel: 95,
      statisticalPower: 80,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '1',
      lastModified: new Date().toISOString(),
      owner: user?.id || '1',
      collaborators: [],
      tags: ['cta', 'homepage'],
      isArchived: false,
    },
    {
      id: 'test_2',
      name: 'Pricing Page Layout Test',
      description: 'Testing single-column vs multi-column layout',
      hypothesis: 'Multi-column layout will increase conversions',
      status: 'completed',
      category: 'Pricing',
      priority: 'medium',
      variants: [
        {
          id: 'control',
          name: 'Single Column',
          description: 'Current layout',
          trafficAllocation: 50,
          isControl: true,
          conversionRate: 1.8,
          visitors: 856,
          conversions: 15,
          revenue: 2250,
          config: {},
          color: '#8B5CF6',
        },
        {
          id: 'variant_a',
          name: 'Multi Column',
          description: 'New layout',
          trafficAllocation: 50,
          isControl: false,
          conversionRate: 2.1,
          visitors: 834,
          conversions: 18,
          revenue: 2700,
          config: {},
          color: '#F59E0B',
        },
      ],
      targetAudience: {
        percentage: 75,
        device: { desktop: true, mobile: false, tablet: false },
      },
      metrics: [
        {
          id: 'primary',
          name: 'Conversion Rate',
          type: 'conversion',
          eventName: 'purchase',
          aggregation: 'percentage',
          isPrimary: true,
          unit: '%',
        },
      ],
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 3,
      minimumSampleSize: 500,
      statisticalSignificance: 5,
      confidenceLevel: 95,
      statisticalPower: 80,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '1',
      lastModified: new Date().toISOString(),
      owner: user?.id || '1',
      collaborators: [],
      tags: ['pricing', 'layout'],
      isArchived: false,
    },
    {
      id: 'test_3',
      name: 'Email Subject Line Test',
      description: 'Testing different subject line approaches',
      hypothesis: 'Urgent subject lines will increase open rates',
      status: 'completed',
      category: 'Email Marketing',
      priority: 'low',
      variants: [
        {
          id: 'control',
          name: 'Standard Subject',
          description: 'Current subject line',
          trafficAllocation: 50,
          isControl: true,
          conversionRate: 15.2,
          visitors: 5000,
          conversions: 760,
          revenue: 15200,
          config: {},
          color: '#3B82F6',
        },
        {
          id: 'variant_a',
          name: 'Urgent Subject',
          description: 'Urgent subject line',
          trafficAllocation: 50,
          isControl: false,
          conversionRate: 18.7,
          visitors: 4950,
          conversions: 926,
          revenue: 18520,
          config: {},
          color: '#10B981',
        },
      ],
      targetAudience: {
        percentage: 100,
        device: { desktop: true, mobile: true, tablet: true },
      },
      metrics: [
        {
          id: 'primary',
          name: 'Open Rate',
          type: 'conversion',
          eventName: 'email_open',
          aggregation: 'percentage',
          isPrimary: true,
          unit: '%',
        },
      ],
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 2,
      minimumSampleSize: 4000,
      statisticalSignificance: 5,
      confidenceLevel: 95,
      statisticalPower: 80,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '1',
      lastModified: new Date().toISOString(),
      owner: user?.id || '1',
      collaborators: [],
      tags: ['email', 'subject-lines'],
      isArchived: false,
    },
  ]);

  // Mock export jobs
  useEffect(() => {
    const mockJobs: ExportJob[] = [
      {
        id: 'job_1',
        testIds: ['test_1', 'test_2'],
        format: 'csv',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        downloadUrl: '/exports/test_export_1.csv',
        fileSize: 245760,
        recordCount: 15420,
        createdBy: user?.id || '1',
        config: {
          format: 'csv',
          dateRange: {
            start: dateRange.start,
            end: dateRange.end,
          },
          testIds: ['test_1', 'test_2'],
          includeRawData: true,
          includeStatisticalAnalysis: true,
          includeVisualizations: false,
          includeActivityLog: false,
          includeRecommendations: true,
          groupBy: 'day',
        },
      },
      {
        id: 'job_2',
        testIds: ['test_3'],
        format: 'pdf',
        status: 'processing',
        progress: 65,
        startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        recordCount: 0,
        createdBy: user?.id || '1',
        config: {
          format: 'pdf',
          dateRange: {
            start: dateRange.start,
            end: dateRange.end,
          },
          testIds: ['test_3'],
          includeRawData: false,
          includeStatisticalAnalysis: true,
          includeVisualizations: true,
          includeActivityLog: true,
          includeRecommendations: true,
          groupBy: 'week',
        },
      },
    ];

    setExportJobs(mockJobs);
  }, [user, dateRange]);

  const handleExport = async () => {
    if (!hasPermission('export_data')) {
      toast.error('You do not have permission to export data');
      return;
    }

    if (selectedTests.length === 0) {
      toast.error('Please select at least one test to export');
      return;
    }

    if (new Date(dateRange.start) >= new Date(dateRange.end)) {
      toast.error('Start date must be before end date');
      return;
    }

    setIsExporting(true);

    try {
      const exportConfig: ExportConfig = {
        format: selectedFormat,
        dateRange,
        testIds: selectedTests,
        includeRawData,
        includeStatisticalAnalysis,
        includeVisualizations,
        includeActivityLog,
        includeRecommendations,
        groupBy,
        customFields,
      };

      const newJob: ExportJob = {
        id: `job_${Date.now()}`,
        testIds: selectedTests,
        format: selectedFormat,
        status: 'processing',
        progress: 0,
        startedAt: new Date().toISOString(),
        createdBy: user!.id,
        config: exportConfig,
      };

      setExportJobs(prev => [newJob, ...prev]);

      // Simulate export processing
      const interval = setInterval(() => {
        setExportJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, progress: Math.min(job.progress + Math.random() * 15, 95) }
            : job
        ));
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        
        const completedJob: ExportJob = {
          ...newJob,
          status: 'completed',
          progress: 100,
          completedAt: new Date().toISOString(),
          downloadUrl: generateDownloadUrl(selectedFormat),
          fileSize: Math.floor(Math.random() * 1000000) + 100000,
          recordCount: Math.floor(Math.random() * 50000) + 5000,
        };

        setExportJobs(prev => prev.map(job => 
          job.id === newJob.id ? completedJob : job
        ));

        // Generate and download file
        generateAndDownloadFile(exportConfig, completedJob);
        
        toast.success('Export completed successfully!');
        setIsExporting(false);
      }, 8000);

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
      setIsExporting(false);
      
      setExportJobs(prev => prev.map(job => 
        job.testIds === selectedTests && job.format === selectedFormat 
          ? { ...job, status: 'failed' as const }
          : job
      ));
    }
  };

  const generateDownloadUrl = (format: ExportConfig['format']): string => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `/exports/ab_tests_export_${timestamp}.${format === 'excel' ? 'xlsx' : format}`;
  };

  const generateAndDownloadFile = (config: ExportConfig, job: ExportJob) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `ab_tests_export_${timestamp}.${config.format === 'excel' ? 'xlsx' : config.format}`;
    
    let content: string | Blob;
    let mimeType: string;

    switch (config.format) {
      case 'json':
        content = JSON.stringify(generateMockExportData(config), null, 2);
        mimeType = 'application/json';
        break;
        
      case 'csv':
        content = generateCSVData(config);
        mimeType = 'text/csv';
        break;
        
      case 'pdf':
        // For PDF, we'll create a text-based representation
        content = generatePDFContent(config);
        mimeType = 'text/plain';
        break;
        
      default:
        content = 'Export format not supported';
        mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMockExportData = (config: ExportConfig) => {
    const selectedTestData = tests
      .filter(test => config.testIds.includes(test.id))
      .map(test => ({
        test: {
          id: test.id,
          name: test.name,
          description: test.description,
          status: test.status,
          category: test.category,
          priority: test.priority,
          startDate: test.startDate,
          endDate: test.endDate,
          duration: test.duration,
          hypothesis: test.hypothesis,
          tags: test.tags,
        },
        variants: test.variants.map(variant => ({
          id: variant.id,
          name: variant.name,
          trafficAllocation: variant.trafficAllocation,
          visitors: variant.visitors,
          conversions: variant.conversions,
          conversionRate: variant.conversionRate,
          revenue: variant.revenue,
          isControl: variant.isControl,
        })),
        statisticalAnalysis: {
          confidenceLevel: test.confidenceLevel,
          statisticalPower: test.statisticalPower,
          minimumSampleSize: test.minimumSampleSize,
          statisticalSignificance: test.statisticalSignificance,
        },
        targetAudience: test.targetAudience,
        metrics: test.metrics,
        dateRange: config.dateRange,
        exportDate: new Date().toISOString(),
      }));

    return {
      exportConfig: config,
      summary: {
        totalTests: selectedTestData.length,
        totalVariants: selectedTestData.reduce((sum, test) => sum + test.variants.length, 0),
        totalVisitors: selectedTestData.reduce((sum, test) => 
          sum + test.variants.reduce((vSum, variant) => vSum + (variant.visitors || 0), 0), 0),
        totalConversions: selectedTestData.reduce((sum, test) => 
          sum + test.variants.reduce((vSum, variant) => vSum + (variant.conversions || 0), 0), 0),
        exportDate: new Date().toISOString(),
        exportedBy: user?.name || 'Unknown User',
      },
      data: selectedTestData,
    };
  };

  const generateCSVData = (config: ExportConfig) => {
    const headers = [
      'Test ID',
      'Test Name',
      'Status',
      'Variant ID',
      'Variant Name',
      'Traffic Allocation (%)',
      'Visitors',
      'Conversions',
      'Conversion Rate (%)',
      'Revenue',
      'Is Control',
      'Start Date',
      'End Date',
      'Category',
      'Priority',
    ];

    const rows = [headers.join(',')];

    tests
      .filter(test => config.testIds.includes(test.id))
      .forEach(test => {
        test.variants.forEach(variant => {
          const row = [
            test.id,
            `"${test.name}"`,
            test.status,
            variant.id,
            `"${variant.name}"`,
            variant.trafficAllocation,
            variant.visitors || 0,
            variant.conversions || 0,
            (variant.conversionRate || 0).toFixed(2),
            variant.revenue || 0,
            variant.isControl,
            new Date(test.startDate).toLocaleDateString(),
            test.endDate ? new Date(test.endDate).toLocaleDateString() : 'N/A',
            test.category,
            test.priority,
          ];
          rows.push(row.join(','));
        });
      });

    return rows.join('\n');
  };

  const generatePDFContent = (config: ExportConfig) => {
    const selectedTests = tests.filter(test => config.testIds.includes(test.id));
    
    let content = `A/B Testing Platform - Export Report\n`;
    content += `Generated on: ${new Date().toLocaleString()}\n`;
    content += `Exported by: ${user?.name || 'Unknown User'}\n`;
    content += `Date Range: ${new Date(config.dateRange.start).toLocaleDateString()} - ${new Date(config.dateRange.end).toLocaleDateString()}\n\n`;

    selectedTests.forEach((test, index) => {
      content += `Test ${index + 1}: ${test.name}\n`;
      content += `Status: ${test.status}\n`;
      content += `Category: ${test.category}\n`;
      content += `Start Date: ${new Date(test.startDate).toLocaleDateString()}\n`;
      if (test.endDate) {
        content += `End Date: ${new Date(test.endDate).toLocaleDateString()}\n`;
      }
      content += `Description: ${test.description}\n\n`;

      content += `Variants:\n`;
      test.variants.forEach(variant => {
        content += `  - ${variant.name}:\n`;
        content += `    Visitors: ${variant.visitors || 0}\n`;
        content += `    Conversions: ${variant.conversions || 0}\n`;
        content += `    Conversion Rate: ${(variant.conversionRate || 0).toFixed(2)}%\n`;
        content += `    Revenue: $${(variant.revenue || 0).toLocaleString()}\n`;
        content += `    Traffic Allocation: ${variant.trafficAllocation}%\n`;
        content += `    Control: ${variant.isControl ? 'Yes' : 'No'}\n\n`;
      });

      content += `---\n\n`;
    });

    return content;
  };

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = !searchQuery || 
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [tests, searchQuery, filterStatus]);

  const getFormatIcon = (format: ExportConfig['format']) => {
    switch (format) {
      case 'csv':
        return <TableCellsIcon className="h-5 w-5" />;
      case 'excel':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'pdf':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'json':
        return <DocumentChartBarIcon className="h-5 w-5" />;
      default:
        return <DocumentArrowDownIcon className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const exportTemplates = [
    {
      id: 'complete_analysis',
      name: 'Complete Analysis',
      description: 'Full statistical analysis with raw data and visualizations',
      config: {
        includeRawData: true,
        includeStatisticalAnalysis: true,
        includeVisualizations: true,
        includeRecommendations: true,
      },
    },
    {
      id: 'executive_summary',
      name: 'Executive Summary',
      description: 'High-level results for stakeholder presentation',
      config: {
        includeRawData: false,
        includeStatisticalAnalysis: true,
        includeVisualizations: true,
        includeRecommendations: true,
      },
    },
    {
      id: 'raw_data',
      name: 'Raw Data Export',
      description: 'Complete raw data for further analysis in external tools',
      config: {
        includeRawData: true,
        includeStatisticalAnalysis: false,
        includeVisualizations: false,
        includeRecommendations: false,
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <DocumentArrowDownIcon className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Export</h1>
            <p className="text-gray-600 mt-1">
              Export A/B test data in multiple formats with comprehensive analysis and visualizations
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2">
          {[
            { tab: 'export', label: 'Export Data', icon: DocumentArrowDownIcon },
            { tab: 'history', label: 'Export History', icon: ClockIcon },
            { tab: 'templates', label: 'Templates', icon: SparklesIcon },
            { tab: 'scheduled', label: 'Scheduled Exports', icon: CalendarIcon },
          ].map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Export Tab */}
      {selectedTab === 'export' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Export Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export Format</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { format: 'csv', label: 'CSV', description: 'Spreadsheet compatible' },
                  { format: 'excel', label: 'Excel', description: 'Microsoft Excel format' },
                  { format: 'pdf', label: 'PDF Report', description: 'Formatted report' },
                  { format: 'json', label: 'JSON', description: 'Programmatic access' },
                ].map(({ format, label, description }) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format as ExportConfig['format'])}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      selectedFormat === format
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      {getFormatIcon(format as ExportConfig['format'])}
                    </div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-xs text-gray-500 mt-1">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Selection */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Select Tests</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedTests(filteredTests.map(t => t.id))}
                    className="px-3 py-1 text-sm bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedTests([])}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex space-x-4 mb-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Test List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredTests.map(test => (
                  <label key={test.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTests(prev => [...prev, test.id]);
                        } else {
                          setSelectedTests(prev => prev.filter(id => id !== test.id));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{test.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          test.status === 'running' ? 'bg-green-100 text-green-800' :
                          test.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          test.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{test.description}</p>
                      <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                        <span>{test.category}</span>
                        <span>Started: {new Date(test.startDate).toLocaleDateString()}</span>
                        <span>{test.variants.length} variants</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {filteredTests.length === 0 && (
                <div className="text-center py-8">
                  <FunnelIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No tests match your current filters</p>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => {
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setDateRange({
                      start: weekAgo.toISOString().split('T')[0],
                      end: now.toISOString().split('T')[0],
                    });
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    setDateRange({
                      start: monthAgo.toISOString().split('T')[0],
                      end: now.toISOString().split('T')[0],
                    });
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  Last 30 days
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    setDateRange({
                      start: yearAgo.toISOString().split('T')[0],
                      end: now.toISOString().split('T')[0],
                    });
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  Last year
                </button>
              </div>
            </div>

            {/* Content Options */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content Options</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeRawData}
                    onChange={(e) => setIncludeRawData(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Include raw data (visitor counts, conversions, timestamps)
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeStatisticalAnalysis}
                    onChange={(e) => setIncludeStatisticalAnalysis(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Include statistical analysis (p-values, confidence intervals, power analysis)
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeVisualizations}
                    onChange={(e) => setIncludeVisualizations(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Include visualizations (charts, graphs, trend analysis)
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeActivityLog}
                    onChange={(e) => setIncludeActivityLog(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Include activity log (user actions, test changes, notifications)
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeRecommendations}
                    onChange={(e) => setIncludeRecommendations(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Include recommendations (next steps, optimization suggestions)
                  </span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Data By
                  </label>
                  <select
                    value={groupBy || ''}
                    onChange={(e) => setGroupBy(e.target.value as ExportConfig['groupBy'])}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No grouping</option>
                    <option value="hour">Hourly</option>
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={handleExport}
                disabled={isExporting || selectedTests.length === 0}
                className={`flex items-center px-6 py-3 rounded-lg text-white font-medium ${
                  isExporting || selectedTests.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    {getFormatIcon(selectedFormat)}
                    <span className="ml-2">
                      Export {selectedTests.length} Test{selectedTests.length !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Export Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Tests Selected:</span>
                  <span className="font-medium text-blue-900">{selectedTests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Variants:</span>
                  <span className="font-medium text-blue-900">
                    {tests.filter(t => selectedTests.includes(t.id))
                      .reduce((sum, test) => sum + test.variants.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Export Format:</span>
                  <span className="font-medium text-blue-900 uppercase">{selectedFormat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Date Range:</span>
                  <span className="font-medium text-blue-900">
                    {Math.ceil((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>

            {/* Export Templates */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-900 mb-4">Quick Templates</h3>
              <div className="space-y-3">
                {exportTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setIncludeRawData(template.config.includeRawData);
                      setIncludeStatisticalAnalysis(template.config.includeStatisticalAnalysis);
                      setIncludeVisualizations(template.config.includeVisualizations);
                      setIncludeRecommendations(template.config.includeRecommendations);
                    }}
                    className="w-full text-left p-3 bg-white border border-green-200 rounded-lg hover:bg-green-50"
                  >
                    <div className="font-medium text-green-900">{template.name}</div>
                    <div className="text-sm text-green-700 mt-1">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-yellow-900 mb-4">Export Tips</h3>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>• Large datasets may take several minutes to process</li>
                <li>• PDF reports include formatted visualizations</li>
                <li>• JSON format is best for programmatic analysis</li>
                <li>• CSV files can be opened in Excel or Google Sheets</li>
                <li>• Include statistical analysis for reliable conclusions</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Export History Tab */}
      {selectedTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Export History</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Export
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exportJobs.map(job => {
                    const selectedTestNames = tests
                      .filter(test => job.testIds.includes(test.id))
                      .map(test => test.name);
                    
                    return (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(job.status)}
                            <span className="ml-2 text-sm text-gray-900">
                              Export {job.id.slice(-6)}
                            </span>
                          </div>
                          {job.status === 'processing' && (
                            <div className="mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${job.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getFormatIcon(job.format)}
                            <span className="ml-2 text-sm text-gray-900 uppercase">
                              {job.format}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {selectedTestNames.slice(0, 2).join(', ')}
                            {selectedTestNames.length > 2 && (
                              <span className="text-gray-500">
                                +{selectedTestNames.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.fileSize ? formatFileSize(job.fileSize) : 'Processing...'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(job.startedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {job.status === 'completed' && job.downloadUrl ? (
                            <a
                              href={job.downloadUrl}
                              download
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Download
                            </a>
                          ) : job.status === 'failed' ? (
                            <span className="text-red-600">Failed</span>
                          ) : (
                            <span className="text-gray-500">Processing...</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {exportJobs.length === 0 && (
              <div className="text-center py-12">
                <DocumentArrowDownIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Exports Yet</h3>
                <p className="text-gray-600">Your export history will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exportTemplates.map(template => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <SparklesIcon className="h-6 w-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
              </div>
              <p className="text-gray-600 mb-4">{template.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Raw Data:</span>
                  <span className={template.config.includeRawData ? 'text-green-600' : 'text-gray-400'}>
                    {template.config.includeRawData ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statistical Analysis:</span>
                  <span className={template.config.includeStatisticalAnalysis ? 'text-green-600' : 'text-gray-400'}>
                    {template.config.includeStatisticalAnalysis ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Visualizations:</span>
                  <span className={template.config.includeVisualizations ? 'text-green-600' : 'text-gray-400'}>
                    {template.config.includeVisualizations ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Recommendations:</span>
                  <span className={template.config.includeRecommendations ? 'text-green-600' : 'text-gray-400'}>
                    {template.config.includeRecommendations ? '✓' : '✗'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setIncludeRawData(template.config.includeRawData);
                  setIncludeStatisticalAnalysis(template.config.includeStatisticalAnalysis);
                  setIncludeVisualizations(template.config.includeVisualizations);
                  setIncludeRecommendations(template.config.includeRecommendations);
                  toast.success('Template applied! Configure your export settings.');
                  setSelectedTab('export');
                }}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Scheduled Exports Tab */}
      {selectedTab === 'scheduled' && (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Scheduled Exports Coming Soon</h3>
          <p className="text-gray-600">
            Schedule automatic exports for regular reporting and analysis
          </p>
        </div>
      )}
    </div>
  );
};

export default DataExport;
