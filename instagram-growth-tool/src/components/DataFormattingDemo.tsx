import React from 'react';
import { 
  formatNumber, 
  formatPercentage, 
  formatRatio, 
  formatCurrency, 
  formatPostFrequency,
  formatRelativeTime,
  formatEngagementRate
} from '@/utils/dataFormatting';
import { validateMetric } from '@/utils/dataValidation';
import { generateRealisticMockData } from '@/utils/mockDataGenerator';

export default function DataFormattingDemo() {
  // Example data that would previously show unrealistic numbers
  const problematicData = {
    followers: 1254904.4, // Would show as "1254904.4:1" in ratios
    following: 1,
    posts_per_month: 1657, // Would show unrealistic "1657 posts/month"
    engagement_rate: 0.05, // Would show "0.05%"
    currency_amount: 1234567.89
  };

  // Generate realistic mock data
  const realisticData = generateRealisticMockData('micro', 'demo_user');

  const validationExamples = [
    { value: 1254904.4, type: 'followers', name: 'Over 1M followers' },
    { value: 1657, type: 'postFrequency', name: '1657 posts/month' },
    { value: 45.67, type: 'engagementRate', name: '45.67% engagement' },
    { value: 7500, type: 'following', name: '7500 following' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Data Formatting Improvements
        </h2>
        
        {/* Before/After Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
              ❌ Before: Unrealistic Numbers
            </h3>
            <div className="space-y-3 text-sm">
              <div>Follower Ratio: {problematicData.followers}:1</div>
              <div>Post Frequency: {problematicData.posts_per_month}/month</div>
              <div>Engagement: {problematicData.engagement_rate}%</div>
              <div>Currency: ${problematicData.currency_amount.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
              ✅ After: Professional Formatting
            </h3>
            <div className="space-y-3 text-sm">
              <div>Follower Ratio: {formatRatio(problematicData.followers, problematicData.following)}</div>
              <div>Post Frequency: {formatPostFrequency(problematicData.posts_per_month)}</div>
              <div>Engagement: {formatPercentage(problematicData.engagement_rate)}</div>
              <div>Currency: {formatCurrency(problematicData.currency_amount)}</div>
            </div>
          </div>
        </div>

        {/* Formatting Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Number Formatting</h4>
            <div className="space-y-2 text-sm">
              <div>1,000 → {formatNumber(1000)}</div>
              <div>1,500,000 → {formatNumber(1500000)}</div>
              <div>123,456,789 → {formatNumber(123456789)}</div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">Percentage Formatting</h4>
            <div className="space-y-2 text-sm">
              <div>0.05% → {formatPercentage(0.05)}</div>
              <div>5.67% → {formatPercentage(5.67)}</div>
              <div>15.23% → {formatPercentage(15.23)}</div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">Ratio Formatting</h4>
            <div className="space-y-2 text-sm">
              <div>1M:1K → {formatRatio(1000000, 1000)}</div>
              <div>500K:500 → {formatRatio(500000, 500)}</div>
              <div>2.5M:1 → {formatRatio(2500000, 1)}</div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">Post Frequency</h4>
            <div className="space-y-2 text-sm">
              <div>1.5/month → {formatPostFrequency(1.5)}</div>
              <div>8.2/month → {formatPostFrequency(8.2)}</div>
              <div>24/month → {formatPostFrequency(24)}</div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">Currency Formatting</h4>
            <div className="space-y-2 text-sm">
              <div>$1,234 → {formatCurrency(1234)}</div>
              <div>$50,000 → {formatCurrency(50000)}</div>
              <div>$1.2M → {formatCurrency(1200000)}</div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
            <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3">Relative Time</h4>
            <div className="space-y-2 text-sm">
              <div>Just now → {formatRelativeTime(new Date())}</div>
              <div>1 hour ago → {formatRelativeTime(Date.now() - 3600000)}</div>
              <div>2 days ago → {formatRelativeTime(Date.now() - 172800000)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Validation Examples */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Data Validation Examples
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {validationExamples.map((example, index) => {
            const validation = validateMetric(example.value, example.type as any, example.name);
            return (
              <div key={index} className={`rounded-xl p-4 border ${
                validation.isValid 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  validation.isValid 
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {example.name}
                </h4>
                <div className="text-sm space-y-1">
                  <div>Value: {example.value}</div>
                  <div>Quality: <span className="capitalize font-medium">{validation.quality}</span></div>
                  {validation.warnings.length > 0 && (
                    <div className="text-yellow-600 dark:text-yellow-400">
                      ⚠️ {validation.warnings[0]}
                    </div>
                  )}
                  {validation.errors.length > 0 && (
                    <div className="text-red-600 dark:text-red-400">
                      ❌ {validation.errors[0]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Realistic Mock Data Example */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Realistic Mock Data Example
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Account Stats</h4>
            <div className="space-y-2 text-sm">
              <div>Username: @{realisticData.username}</div>
              <div>Followers: {formatNumber(realisticData.followers_count)}</div>
              <div>Following: {formatNumber(realisticData.following_count)}</div>
              <div>Posts: {formatNumber(realisticData.posts_count)}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Engagement</h4>
            <div className="space-y-2 text-sm">
              <div>Rate: {formatEngagementRate(realisticData.engagement_rate)}</div>
              <div>Avg Likes: {formatNumber(realisticData.average_likes)}</div>
              <div>Avg Comments: {formatNumber(realisticData.average_comments)}</div>
              <div>Growth: {realisticData.follower_growth_rate > 0 ? '+' : ''}{realisticData.follower_growth_rate}%</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Activity</h4>
            <div className="space-y-2 text-sm">
              <div>Post Freq: {formatPostFrequency(realisticData.post_frequency)}</div>
              <div>Verified: {realisticData.is_verified ? '✅ Yes' : '❌ No'}</div>
              <div>Business: {realisticData.is_business ? '✅ Yes' : '❌ No'}</div>
              <div>Quality Score: Excellent</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 This mock data demonstrates realistic patterns: higher follower counts correlate with lower engagement rates, 
            and post frequencies stay within believable ranges (2-30 posts per month).
          </p>
        </div>
      </div>
    </div>
  );
}