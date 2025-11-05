import { AnalyticsData, InstagramAccount } from '@/types/analytics';

export interface ShareOptions {
  reportId: string;
  timeRange: string;
  includeAnalytics: boolean;
  includeCharts: boolean;
  password?: string;
  expiresAt?: Date;
  maxViews?: number;
  trackingEnabled?: boolean;
  customMessage?: string;
  platform?: 'email' | 'social' | 'link';
}

export interface ShareableLink {
  url: string;
  shortUrl?: string;
  qrCode?: string;
  embedCode?: string;
  expiresAt?: Date;
  passwordProtected: boolean;
  viewCount?: number;
  lastViewed?: Date;
}

export interface ShareAnalytics {
  totalViews: number;
  uniqueViews: number;
  viewsByDate: { date: string; views: number }[];
  topReferrers: { source: string; count: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
  geographicData: { country: string; views: number }[];
}

// Shareable Link Generation
export const generateShareableLink = (options: ShareOptions): ShareableLink => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    report: options.reportId,
    period: options.timeRange,
    analytics: options.includeAnalytics.toString(),
    charts: options.includeCharts.toString(),
    v: '1.0'
  });

  if (options.password) {
    params.set('pwd', btoa(options.password));
  }

  if (options.expiresAt) {
    params.set('exp', options.expiresAt.getTime().toString());
  }

  if (options.maxViews && options.maxViews > 0) {
    params.set('maxViews', options.maxViews.toString());
  }

  const url = `${baseUrl}/shared-report?${params.toString()}`;
  const shortUrl = generateShortUrl(options.reportId);
  const embedCode = generateEmbedCode(url);
  
  return {
    url,
    shortUrl,
    embedCode,
    expiresAt: options.expiresAt,
    passwordProtected: !!options.password,
    viewCount: 0
  };
};

// Short URL Generation (Mock implementation)
export const generateShortUrl = (reportId: string): string => {
  // In a real implementation, this would call a URL shortening service
  const shortCode = reportId.substring(0, 8);
  return `https://ghub.analytics/${shortCode}`;
};

// Embed Code Generation
export const generateEmbedCode = (url: string, options?: {
  width?: string;
  height?: string;
  title?: string;
}): string => {
  const width = options?.width || '100%';
  const height = options?.height || '600px';
  const title = options?.title || 'Instagram Analytics Report';
  
  return `<iframe 
  src="${url}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  scrolling="auto"
  title="${title}"
  style="border: 1px solid #e5e7eb; border-radius: 8px;">
</iframe>`;
};

// QR Code Generation
export const generateQRCode = async (url: string, options?: {
  size?: number;
  margin?: number;
  color?: { dark: string; light: string };
}): Promise<string> => {
  // This would use a QR code library like qrcode
  // For now, returning a placeholder
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`data:image/svg+xml;base64,${btoa(generateMockQRCodeSVG(url))}`);
    }, 100);
  });
};

const generateMockQRCodeSVG = (url: string): string => {
  return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white" stroke="#e5e7eb"/>
    <rect x="20" y="20" width="10" height="10" fill="black"/>
    <rect x="40" y="20" width="10" height="10" fill="black"/>
    <rect x="60" y="20" width="10" height="10" fill="black"/>
    <rect x="80" y="20" width="10" height="10" fill="black"/>
    <rect x="100" y="20" width="10" height="10" fill="black"/>
    <text x="100" y="180" text-anchor="middle" fill="black" font-size="8">${url.substring(0, 20)}...</text>
  </svg>`;
};

// Social Media Sharing
export const shareToSocialMedia = (platform: string, data: {
  url: string;
  text: string;
  hashtags?: string[];
  image?: string;
}) => {
  const encodedUrl = encodeURIComponent(data.url);
  const encodedText = encodeURIComponent(data.text);
  const hashtags = data.hashtags?.map(tag => encodeURIComponent(tag)).join(' ') || '';

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${hashtags}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  };

  if (shareUrls[platform as keyof typeof shareUrls]) {
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
  }
};

// Email Sharing
export const shareViaEmail = (options: {
  to: string[];
  subject: string;
  message: string;
  attachmentUrl?: string;
}): string => {
  const mailtoLink = `mailto:${options.to.join(',')}?subject=${encodeURIComponent(options.subject)}&body=${encodeURIComponent(options.message)}${options.attachmentUrl ? `&attachment=${encodeURIComponent(options.attachmentUrl)}` : ''}`;
  
  // Open default email client
  window.location.href = mailtoLink;
  
  return mailtoLink;
};

// Clipboard Utilities
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};

// Share Analytics Tracking
export const trackShareView = async (shareId: string, metadata?: {
  userAgent?: string;
  referrer?: string;
  ipAddress?: string;
}) => {
  try {
    // This would typically send data to your analytics service
    const trackingData = {
      shareId,
      timestamp: new Date().toISOString(),
      userAgent: metadata?.userAgent || navigator.userAgent,
      referrer: metadata?.referrer || document.referrer,
      ipAddress: metadata?.ipAddress,
      screen: {
        width: window.screen.width,
        height: window.screen.height
      }
    };

    // Store in localStorage for demo purposes
    const existingViews = JSON.parse(localStorage.getItem('shareViews') || '[]');
    existingViews.push(trackingData);
    localStorage.setItem('shareViews', JSON.stringify(existingViews));

    return trackingData;
  } catch (error) {
    console.error('Failed to track share view:', error);
    return null;
  }
};

// Get Share Analytics
export const getShareAnalytics = (shareId: string): ShareAnalytics | null => {
  try {
    const views = JSON.parse(localStorage.getItem('shareViews') || '[]');
    const shareViews = views.filter((view: any) => view.shareId === shareId);
    
    if (shareViews.length === 0) return null;

    // Calculate analytics
    const totalViews = shareViews.length;
    const uniqueViews = new Set(shareViews.map((view: any) => view.ipAddress)).size;
    
    // Group views by date
    const viewsByDate = shareViews.reduce((acc: any, view: any) => {
      const date = new Date(view.timestamp).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      totalViews,
      uniqueViews,
      viewsByDate: Object.entries(viewsByDate).map(([date, views]) => ({ date, views: views as number })),
      topReferrers: [
        { source: 'Direct', count: Math.floor(totalViews * 0.6) },
        { source: 'Social Media', count: Math.floor(totalViews * 0.3) },
        { source: 'Email', count: Math.floor(totalViews * 0.1) }
      ],
      deviceBreakdown: [
        { device: 'Mobile', percentage: 65 },
        { device: 'Desktop', percentage: 30 },
        { device: 'Tablet', percentage: 5 }
      ],
      geographicData: [
        { country: 'United States', views: Math.floor(totalViews * 0.4) },
        { country: 'United Kingdom', views: Math.floor(totalViews * 0.2) },
        { country: 'Canada', views: Math.floor(totalViews * 0.15) },
        { country: 'Australia', views: Math.floor(totalViews * 0.1) },
        { country: 'Other', views: Math.floor(totalViews * 0.15) }
      ]
    };
  } catch (error) {
    console.error('Failed to get share analytics:', error);
    return null;
  }
};

// Generate Social Media Content
export const generateSocialContent = (platform: string, data: {
  analyticsData: AnalyticsData;
  timeRange: string;
  customMessage?: string;
}) => {
  const { analyticsData, timeRange } = data;
  const followerGrowth = analyticsData.growth?.followers || 0;
  const engagementRate = analyticsData.engagementRate || 0;

  const content = {
    twitter: () => `📊 Instagram Analytics Update!

• ${followerGrowth > 0 ? '+' : ''}${followerGrowth.toFixed(1)}% follower growth
• ${engagementRate.toFixed(2)}% engagement rate  
• ${analyticsData.reach?.toLocaleString() || 'N/A'} total reach

#InstagramAnalytics #SocialMediaMarketing #Growth`,

    linkedin: () => `🚀 Instagram Performance Update - ${timeRange}

Key Metrics:
• Follower Growth: ${followerGrowth > 0 ? '+' : ''}${followerGrowth.toFixed(1)}%
• Engagement Rate: ${engagementRate.toFixed(2)}%
• Monthly Reach: ${analyticsData.reach?.toLocaleString() || 'N/A'} impressions

Data-driven insights continue to drive our social media strategy forward.

#InstagramMarketing #SocialMediaStrategy #DigitalGrowth #Analytics`,

    facebook: () => `📈 Instagram Analytics Report Complete!

${followerGrowth > 0 ? 'Exciting growth this month!' : 'Working on improving our strategy!'} Here are the numbers:

👥 Followers: ${analyticsData.followers?.toLocaleString() || 'N/A'} (${followerGrowth > 0 ? '+' : ''}${followerGrowth.toFixed(1)}%)
💝 Engagement: ${engagementRate.toFixed(2)}%
👀 Reach: ${analyticsData.reach?.toLocaleString() || 'N/A'}

Thanks for following along on this journey! What's working best for your Instagram growth? 

#InstagramAnalytics #SocialMedia #DigitalMarketing`,

    instagram: () => `✨ Instagram Deep Dive! 

${followerGrowth > 0 ? `Growth update: +${followerGrowth.toFixed(1)}% follower increase this month! 📈` : `Consistency is key! 📊`}

• ${engagementRate.toFixed(2)}% engagement rate
• ${analyticsData.reach?.toLocaleString() || 'N/A'} reach
• ${analyticsData.likes?.toLocaleString() || 'N/A'} likes

${followerGrowth > 0 ? 'Thank you for being part of this journey! 💜' : 'Every step forward is progress! 🌟'}

#InstagramAnalytics #GrowthHacking #SocialMedia #Engagement #Consistency`
  };

  let message = content[platform as keyof typeof content]?.() || '';
  
  if (data.customMessage) {
    message += `\n\n${data.customMessage}`;
  }

  return message;
};

// Compression Utilities for URL parameters
export const compressData = (data: any): string => {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Failed to compress data:', error);
    return '';
  }
};

export const decompressData = (compressedData: string): any => {
  try {
    return JSON.parse(atob(compressedData));
  } catch (error) {
    console.error('Failed to decompress data:', error);
    return null;
  }
};

// Link Validation
export const validateShareableUrl = (url: string): { isValid: boolean; error?: string } => {
  try {
    const urlObj = new URL(url);
    
    // Check if it's HTTPS
    if (urlObj.protocol !== 'https:') {
      return { isValid: false, error: 'URL must use HTTPS for security' };
    }
    
    // Check if it's a valid domain
    if (!urlObj.hostname) {
      return { isValid: false, error: 'Invalid URL format' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = ['javascript:', 'data:', 'vbscript:'];
    if (suspiciousPatterns.some(pattern => url.includes(pattern))) {
      return { isValid: false, error: 'URL contains suspicious patterns' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

// URL Security
export const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    
    // Remove potentially dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    dangerousProtocols.forEach(protocol => {
      if (urlObj.protocol === protocol) {
        throw new Error('Dangerous protocol detected');
      }
    });
    
    return urlObj.toString();
  } catch (error) {
    console.error('URL sanitization failed:', error);
    return '';
  }
};

// Generate unique share ID
export const generateShareId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `share_${timestamp}_${randomPart}`;
};

// Cache utilities for sharing
export const cacheShareData = (shareId: string, data: any, ttl: number = 3600000): void => {
  try {
    const cacheData = {
      data,
      expiresAt: Date.now() + ttl
    };
    localStorage.setItem(`share_cache_${shareId}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to cache share data:', error);
  }
};

export const getCachedShareData = (shareId: string): any | null => {
  try {
    const cached = localStorage.getItem(`share_cache_${shareId}`);
    if (!cached) return null;
    
    const { data, expiresAt } = JSON.parse(cached);
    
    if (Date.now() > expiresAt) {
      localStorage.removeItem(`share_cache_${shareId}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get cached share data:', error);
    return null;
  }
};