/**
 * Data Validation Utilities for Instagram Analytics
 * Ensures all metrics fall within realistic ranges and data quality is maintained
 */

export interface ValidationResult {
  isValid: boolean;
  value: number;
  warnings: string[];
  errors: string[];
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

// Validation thresholds for Instagram metrics
export const VALIDATION_THRESHOLDS = {
  followers: {
    min: 0,
    max: 1000000000, // 1B (upper limit for realistic Instagram accounts)
    realisticMax: 500000000 // 500M (threshold for data quality)
  },
  following: {
    min: 0,
    max: 10000, // Instagram's following limit
    realisticMax: 5000
  },
  postsCount: {
    min: 0,
    max: 100000, // Reasonable upper limit
    realisticMax: 50000
  },
  engagementRate: {
    min: 0,
    max: 100,
    realisticMin: 0.1,
    realisticMax: 20 // Most accounts fall between 1-10%
  },
  followerRatio: {
    min: 0,
    max: 10000, // 10K:1 is very high but possible
    realisticMax: 1000
  },
  postFrequency: {
    min: 0,
    max: 200, // 200 posts per month is extremely high
    realisticMax: 60 // 60 posts per month (2 per day)
  },
  growthRate: {
    min: -100,
    max: 1000, // 1000% growth in a period
    realisticMax: 200
  }
};

// Validate individual metrics
export const validateMetric = (
  value: number,
  metricType: keyof typeof VALIDATION_THRESHOLDS,
  fieldName: string = 'metric'
): ValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  let quality: ValidationResult['quality'] = 'excellent';
  const threshold = VALIDATION_THRESHOLDS[metricType];

  // Check for invalid values
  if (value === null || value === undefined || isNaN(value)) {
    return {
      isValid: false,
      value: 0,
      warnings,
      errors: [`${fieldName} is missing or invalid`],
      quality: 'poor'
    };
  }

  // Check for negative values (except growth rate which can be negative)
  if (value < 0 && metricType !== 'growthRate') {
    errors.push(`${fieldName} cannot be negative`);
    quality = 'poor';
  }

  // Check basic bounds
  if (value < threshold.min) {
    errors.push(`${fieldName} is below minimum threshold (${threshold.min})`);
    quality = 'poor';
  }

  if (value > threshold.max) {
    errors.push(`${fieldName} exceeds maximum threshold (${threshold.max})`);
    quality = 'poor';
  }

  // Check realistic ranges for data quality assessment
  if ('realisticMax' in threshold && value > threshold.realisticMax) {
    warnings.push(`${fieldName} is unusually high - may need verification`);
    quality = quality === 'excellent' ? 'good' : quality;
  }

  if ('realisticMin' in threshold && value < threshold.realisticMin) {
    warnings.push(`${fieldName} is unusually low - may need verification`);
    quality = quality === 'excellent' ? 'fair' : quality;
  }

  // Metric-specific validations
  switch (metricType) {
    case 'followers':
      if (value === 0) {
        warnings.push('Account has no followers - may be new or inactive');
      }
      break;

    case 'following':
      if (value > 7500) {
        warnings.push('Following count is very high - account may be close to Instagram limit');
      }
      break;

    case 'postsCount':
      if (value === 0) {
        warnings.push('Account has no posts yet');
      }
      if (value > 0 && value < 10) {
        warnings.push('Account has very few posts - limited data available');
      }
      break;

    case 'engagementRate':
      if (value > 15) {
        warnings.push('Engagement rate is extremely high - verify authenticity');
        quality = quality === 'excellent' ? 'fair' : quality;
      }
      if (value < 0.5 && value > 0) {
        warnings.push('Engagement rate is very low - account may be inactive');
      }
      break;

    case 'followerRatio':
      if (value > 100) {
        warnings.push('Follower ratio is very high - indicates strong engagement');
      }
      break;

    case 'postFrequency':
      if (value > 30) {
        warnings.push('Post frequency is very high - may indicate automated posting');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    value,
    warnings,
    errors,
    quality
  };
};

// Validate complete Instagram account data
export const validateAccountData = (accountData: any): {
  isValid: boolean;
  quality: ValidationResult['quality'];
  issues: string[];
  warnings: string[];
} => {
  const issues: string[] = [];
  const warnings: string[] = [];
  let overallQuality: ValidationResult['quality'] = 'excellent';

  if (!accountData) {
    return {
      isValid: false,
      quality: 'poor',
      issues: ['Account data is missing'],
      warnings: []
    };
  }

  // Validate individual metrics
  const validations = [
    validateMetric(accountData.followers_count || 0, 'followers', 'Followers count'),
    validateMetric(accountData.following_count || 0, 'following', 'Following count'),
    validateMetric(accountData.posts_count || 0, 'postsCount', 'Posts count'),
  ];

  // Check for logical inconsistencies
  if (accountData.followers_count && accountData.following_count) {
    const ratio = (accountData.followers_count || 0) / Math.max(accountData.following_count || 1, 1);
    const ratioValidation = validateMetric(ratio, 'followerRatio', 'Follower ratio');
    
    validations.push(ratioValidation);
    
    if (ratioValidation.warnings.length > 0) {
      warnings.push(...ratioValidation.warnings);
    }
  }

  // Aggregate validation results
  validations.forEach(validation => {
    if (!validation.isValid) {
      issues.push(...validation.errors);
    }
    if (validation.warnings.length > 0) {
      warnings.push(...validation.warnings);
    }
    
    // Determine overall quality (worst case wins)
    const qualityOrder = ['excellent', 'good', 'fair', 'poor'];
    const currentIndex = qualityOrder.indexOf(validation.quality);
    const overallIndex = qualityOrder.indexOf(overallQuality);
    
    if (currentIndex > overallIndex) {
      overallQuality = validation.quality;
    }
  });

  // Additional consistency checks
  if (accountData.posts_count && accountData.followers_count) {
    // Check if follower-to-post ratio is realistic
    const postsPerFollower = accountData.followers_count / accountData.posts_count;
    if (postsPerFollower > 100000) {
      warnings.push('Very high follower-to-post ratio - account may have gained followers without posting');
    }
  }

  // Check data freshness
  if (accountData.updated_at) {
    const updated = new Date(accountData.updated_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - updated.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      warnings.push('Data may be stale - consider refreshing account data');
      overallQuality = overallQuality === 'excellent' ? 'fair' : overallQuality;
    }
  }

  return {
    isValid: issues.length === 0,
    quality: overallQuality,
    issues,
    warnings
  };
};

// Sanitize and normalize API responses
export const sanitizeData = (rawData: any): any => {
  if (!rawData || typeof rawData !== 'object') {
    return null;
  }

  const sanitized = { ...rawData };

  // Clean numeric fields
  const numericFields = [
    'followers_count', 'following_count', 'posts_count',
    'engagement_rate', 'likes_count', 'comments_count', 'shares_count'
  ];

  numericFields.forEach(field => {
    if (sanitized[field] !== null && sanitized[field] !== undefined) {
      const num = Number(sanitized[field]);
      if (isNaN(num) || !isFinite(num)) {
        sanitized[field] = 0;
      } else {
        sanitized[field] = Math.max(0, num); // Ensure non-negative
      }
    }
  });

  // Clean text fields
  const textFields = ['username', 'full_name', 'biography'];
  textFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = String(sanitized[field]).trim().substring(0, 500);
    }
  });

  // Clean boolean fields
  const booleanFields = ['is_verified', 'is_private', 'is_business'];
  booleanFields.forEach(field => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = Boolean(sanitized[field]);
    }
  });

  // Ensure required fields exist
  if (!sanitized.username) {
    sanitized.username = 'unknown_user';
  }

  return sanitized;
};

// Validate engagement metrics specifically
export const validateEngagementMetrics = (metrics: {
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
}): ValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  if (!metrics) {
    return {
      isValid: false,
      value: 0,
      warnings,
      errors: ['Engagement metrics are missing'],
      quality: 'poor'
    };
  }

  // Validate individual metrics
  const engagementFields = ['likes', 'comments', 'shares', 'saves'] as const;
  let quality: ValidationResult['quality'] = 'excellent';

  engagementFields.forEach(field => {
    const value = metrics[field] || 0;
    if (value < 0) {
      errors.push(`${field} cannot be negative`);
      quality = 'poor';
    }
    if (value > 10000000) { // 10M is very high for individual engagement
      warnings.push(`${field} count is extremely high - verify authenticity`);
      quality = quality === 'excellent' ? 'fair' : quality;
    }
  });

  // Validate reach vs impressions consistency
  if (metrics.reach && metrics.impressions) {
    if (metrics.impressions < metrics.reach) {
      warnings.push('Impressions should be greater than or equal to reach');
      quality = quality === 'excellent' ? 'good' : quality;
    }
  }

  return {
    isValid: errors.length === 0,
    value: 0,
    warnings,
    errors,
    quality
  };
};

// Check if data needs refreshing based on age and type
export const shouldRefreshData = (
  lastUpdated: Date | string,
  dataType: 'profile' | 'engagement' | 'media' | 'analytics'
): boolean => {
  const updated = new Date(lastUpdated);
  const now = new Date();
  const hoursDiff = (now.getTime() - updated.getTime()) / (1000 * 60 * 60);

  const refreshThresholds = {
    profile: 24,      // Profile data changes infrequently
    engagement: 12,   // Engagement changes more frequently
    media: 6,         // Media data should be fresh
    analytics: 1      // Analytics should be very fresh
  };

  const threshold = refreshThresholds[dataType] || 24;
  
  return hoursDiff > threshold;
};

// Get data quality score (0-100)
export const getDataQualityScore = (validation: ValidationResult): number => {
  if (validation.errors.length > 0) return 0;
  
  let score = 100;
  
  // Deduct points for warnings
  score -= validation.warnings.length * 10;
  
  // Deduct points for quality level
  switch (validation.quality) {
    case 'excellent':
      break;
    case 'good':
      score -= 5;
      break;
    case 'fair':
      score -= 15;
      break;
    case 'poor':
      score -= 30;
      break;
  }
  
  return Math.max(0, Math.min(100, score));
};