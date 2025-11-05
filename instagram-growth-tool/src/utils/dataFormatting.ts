/**
 * Data Formatting Utilities for Instagram Analytics
 * Handles professional formatting of metrics to ensure realistic and trustworthy data presentation
 */

// Format large numbers with appropriate suffixes (1.2M, 1.5K format)
export const formatNumber = (num: number): string => {
  if (!num || isNaN(num) || num < 0) return '0';
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return Math.round(num).toLocaleString();
};

// Format numbers without decimals for cleaner display
export const formatNumberInteger = (num: number): string => {
  if (!num || isNaN(num) || num < 0) return '0';
  return Math.round(num).toLocaleString();
};

// Format percentages with appropriate precision
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (!value || isNaN(value)) return '0%';
  
  // Ensure percentage is within realistic bounds
  const clampedValue = Math.max(0, Math.min(100, value));
  
  if (clampedValue === 0) return '0%';
  if (clampedValue < 1) return '<1%';
  if (decimals === 0) return `${Math.round(clampedValue)}%`;
  
  return `${clampedValue.toFixed(decimals)}%`;
};

// Format follower ratios in a professional format (1.25M:1 format)
export const formatRatio = (followers: number, following: number): string => {
  if (!followers || !following || isNaN(followers) || isNaN(following) || following <= 0) {
    return '0:1';
  }
  
  const ratio = followers / following;
  
  // If ratio is too large, format the followers part
  if (followers >= 1000000) {
    return `${formatNumber(followers)}:1`;
  }
  
  // Format with appropriate decimal precision based on the ratio size
  if (ratio >= 1000) {
    return `${Math.round(ratio)}:1`;
  } else if (ratio >= 100) {
    return `${ratio.toFixed(0)}:1`;
  } else if (ratio >= 10) {
    return `${ratio.toFixed(1)}:1`;
  } else {
    return `${ratio.toFixed(2)}:1`;
  }
};

// Format currency values for potential earnings/revenue
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  if (!amount || isNaN(amount) || amount < 0) return '$0';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount);
};

// Format currency with decimals for smaller amounts
export const formatCurrencyDetailed = (amount: number, currency: string = 'USD'): string => {
  if (!amount || isNaN(amount) || amount < 0) return '$0.00';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

// Format date ranges for time periods
export const formatDateRange = (startDate: Date | string, endDate?: Date | string): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  if (isNaN(start.getTime())) return 'Invalid date';
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };
  
  // Add year if dates are in different years
  if (start.getFullYear() !== end.getFullYear()) {
    options.year = 'numeric';
  }
  
  if (start.toDateString() === end.toDateString()) {
    // Same day, just show the date
    return start.toLocaleDateString('en-US', options);
  }
  
  // Different days, show range
  const startStr = start.toLocaleDateString('en-US', options);
  const endOptions = { ...options };
  if (!endOptions.year && start.getFullYear() !== end.getFullYear()) {
    endOptions.year = 'numeric';
  }
  const endStr = end.toLocaleDateString('en-US', endOptions);
  
  return `${startStr} - ${endStr}`;
};

// Format relative time (e.g., "2 hours ago", "3 days ago")
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  
  if (isNaN(target.getTime())) return 'Unknown';
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  
  // For older dates, show the actual date
  return target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: target.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

// Format engagement rate with trend indicator
export const formatEngagementRate = (rate: number, trend?: 'up' | 'down' | 'stable'): string => {
  const formatted = formatPercentage(rate, 2);
  
  if (!trend) return formatted;
  
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
  return `${formatted} ${trendIcon}`;
};

// Format post frequency in a user-friendly way
export const formatPostFrequency = (postsPerMonth: number): string => {
  if (!postsPerMonth || isNaN(postsPerMonth) || postsPerMonth <= 0) {
    return '0/month';
  }
  
  if (postsPerMonth >= 100) {
    return `${Math.round(postsPerMonth)}/month`;
  }
  
  if (postsPerMonth >= 30) {
    return `${postsPerMonth.toFixed(0)}/month`;
  }
  
  // For smaller numbers, provide more context
  const perWeek = postsPerMonth / 4.33; // Average weeks per month
  if (perWeek < 1) {
    return `${postsPerMonth.toFixed(1)}/month (~${(perWeek * 7).toFixed(1)}/week)`;
  }
  
  return `${postsPerMonth.toFixed(1)}/month (~${perWeek.toFixed(1)}/week)`;
};

// Format follower growth with trend indicator
export const formatFollowerGrowth = (growth: number): string => {
  if (!growth || isNaN(growth)) return '0';
  
  const formatted = formatNumber(Math.abs(growth));
  const sign = growth > 0 ? '+' : growth < 0 ? '−' : '';
  
  if (growth > 0) {
    return `${sign}${formatted} ↗`;
  } else if (growth < 0) {
    return `${sign}${formatted} ↘`;
  } else {
    return 'No change';
  }
};

// Format data quality indicators
export const formatDataQuality = (lastUpdated: Date | string, freshnessThreshold: number = 24): {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  label: string;
  color: string;
} => {
  const updated = new Date(lastUpdated);
  const now = new Date();
  const hoursDiff = (now.getTime() - updated.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff <= freshnessThreshold / 4) {
    return { quality: 'excellent', label: 'Fresh data', color: 'text-green-600' };
  } else if (hoursDiff <= freshnessThreshold / 2) {
    return { quality: 'good', label: 'Recent data', color: 'text-blue-600' };
  } else if (hoursDiff <= freshnessThreshold) {
    return { quality: 'fair', label: 'Updated today', color: 'text-yellow-600' };
  } else {
    return { quality: 'poor', label: 'Stale data', color: 'text-red-600' };
  }
};

// Format large numbers for follower counts specifically
export const formatFollowerCount = (count: number): string => {
  if (!count || isNaN(count) || count < 0) return '0';
  
  if (count >= 10000000) {
    return (count / 1000000).toFixed(0) + 'M';
  } else if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  
  return count.toLocaleString();
};

// Format engagement metrics with appropriate precision
export const formatEngagementMetric = (value: number, type: 'likes' | 'comments' | 'shares' | 'saves'): string => {
  if (!value || isNaN(value) || value < 0) return '0';
  
  switch (type) {
    case 'likes':
    case 'comments':
    case 'shares':
    case 'saves':
      return formatNumber(value);
    default:
      return value.toString();
  }
};