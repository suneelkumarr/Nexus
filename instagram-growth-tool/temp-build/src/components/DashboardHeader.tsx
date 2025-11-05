import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  RefreshCw, 
  Download, 
  ChevronDown, 
  X, 
  FileText, 
  FileSpreadsheet,
  Users,
  Instagram
} from 'lucide-react';
import { DateRange, DashboardFilters, InstagramAccount, ExportOptions } from '@/types/analytics';
import { supabase } from '@/lib/supabase';

interface DashboardHeaderProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: Partial<DashboardFilters>) => void;
  onExport: (options: ExportOptions) => void;
  loading?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  filters,
  onFiltersChange,
  onExport,
  loading = false
}) => {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Date range options
  const dateRangeOptions: DateRange[] = [
    {
      label: 'Last 7 days',
      value: '7d',
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    {
      label: 'Last 30 days',
      value: '30d',
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    {
      label: 'Last 90 days',
      value: '90d',
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  ];

  // Load accounts
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setAccountsLoading(true);
    try {
      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleDateRangeSelect = (range: DateRange) => {
    onFiltersChange({
      dateRange: range
    });
    setShowDateDropdown(false);
    setShowCustomDatePicker(false);
  };

  const handleCustomDateApply = () => {
    if (customDateRange.start && customDateRange.end) {
      const range: DateRange = {
        label: 'Custom',
        value: 'custom',
        start: new Date(customDateRange.start),
        end: new Date(customDateRange.end)
      };
      onFiltersChange({ dateRange: range });
      setShowCustomDatePicker(false);
    }
  };

  const handleAccountSelect = (accountId: string | null) => {
    onFiltersChange({ selectedAccount: accountId });
    setShowAccountDropdown(false);
  };

  const handleRefresh = () => {
    onFiltersChange({ isRefreshing: true });
    // Simulate refresh delay
    setTimeout(() => {
      onFiltersChange({ isRefreshing: false });
    }, 2000);
  };

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    const options: ExportOptions = {
      format,
      dateRange: filters.dateRange,
      includeCharts: true,
      selectedMetrics: ['followers', 'engagement', 'reach', 'likes', 'comments']
    };
    onExport(options);
    setShowExportDropdown(false);
  };

  const selectedAccount = accounts.find(acc => acc.id === filters.selectedAccount);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Main Header Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDateDropdown(!showDateDropdown);
                  setShowExportDropdown(false);
                  setShowAccountDropdown(false);
                }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filters.dateRange.label}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showDateDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    {dateRangeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleDateRangeSelect(option)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setShowCustomDatePicker(true);
                        setShowDateDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      Custom Range
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Date Picker */}
              {showCustomDatePicker && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Custom Date Range</h3>
                    <button
                      onClick={() => setShowCustomDatePicker(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleCustomDateApply}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => setShowCustomDatePicker(false)}
                        className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAccountDropdown(!showAccountDropdown);
                  setShowDateDropdown(false);
                  setShowExportDropdown(false);
                }}
                disabled={accountsLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {accountsLoading ? 'Loading...' : selectedAccount?.display_name || 'All Accounts'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showAccountDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => handleAccountSelect(null)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        filters.selectedAccount === null
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      All Accounts
                    </button>
                    {accounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => handleAccountSelect(account.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                          filters.selectedAccount === account.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Instagram className="w-4 h-4" />
                        <span className="truncate">{account.display_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading || filters.isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${filters.isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowExportDropdown(!showExportDropdown);
                  setShowDateDropdown(false);
                  setShowAccountDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showExportDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export as Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside overlay to close dropdowns */}
      {(showDateDropdown || showAccountDropdown || showExportDropdown) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowDateDropdown(false);
            setShowAccountDropdown(false);
            setShowExportDropdown(false);
            setShowCustomDatePicker(false);
          }}
        />
      )}
    </div>
  );
};

export default DashboardHeader;