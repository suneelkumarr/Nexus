import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart2, Users, TrendingUp, Heart, RefreshCw } from 'lucide-react';

interface BenchmarkData {
  myAccount: {
    followers: number;
    posts: number;
    engagement: number;
  };
  competitors: Array<{
    username: string;
    followers: number;
    posts: number;
    engagement: number;
  }>;
}

interface BenchmarkingDashboardProps {
  selectedAccount: string | null;
}

export default function BenchmarkingDashboard({ selectedAccount }: BenchmarkingDashboardProps) {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      fetchBenchmarkData();
    }
  }, [selectedAccount]);

  const fetchBenchmarkData = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      // Fetch my account data
      const { data: myData, error: myError } = await supabase
        .from('instagram_accounts')
        .select('followers_count, posts_count')
        .eq('id', selectedAccount)
        .single();

      if (myError) throw myError;

      // Fetch competitors data
      const { data: competitorsData, error: competitorsError } = await supabase
        .from('competitor_accounts')
        .select('competitor_username, followers_count, posts_count, engagement_rate')
        .eq('instagram_account_id', selectedAccount)
        .eq('tracking_enabled', true)
        .limit(5);

      if (competitorsError) throw competitorsError;

      setBenchmarkData({
        myAccount: {
          followers: myData?.followers_count || 0,
          posts: myData?.posts_count || 0,
          engagement: 0 // Would calculate from analytics
        },
        competitors: (competitorsData || []).map(c => ({
          username: c.competitor_username,
          followers: c.followers_count || 0,
          posts: c.posts_count || 0,
          engagement: c.engagement_rate || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (myValue: number, avgValue: number) => {
    if (myValue > avgValue) return 'text-green-600 dark:text-green-400';
    if (myValue < avgValue * 0.8) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const calculateAverage = (values: number[]) => {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading benchmark data...</p>
        </div>
      </div>
    );
  }

  if (!benchmarkData || benchmarkData.competitors.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <BarChart2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Benchmark Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add competitors in the Competitor Analysis tab to see performance benchmarking.
          </p>
        </div>
      </div>
    );
  }

  const avgFollowers = calculateAverage(benchmarkData.competitors.map(c => c.followers));
  const avgPosts = calculateAverage(benchmarkData.competitors.map(c => c.posts));
  const avgEngagement = calculateAverage(benchmarkData.competitors.map(c => c.engagement));

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Followers</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600 dark:text-gray-400">Your Account</span>
              <span className={`text-2xl font-bold ${getPerformanceColor(benchmarkData.myAccount.followers, avgFollowers)}`}>
                {benchmarkData.myAccount.followers.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600 dark:text-gray-400">Competitor Avg</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {avgFollowers.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Posts</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600 dark:text-gray-400">Your Account</span>
              <span className={`text-2xl font-bold ${getPerformanceColor(benchmarkData.myAccount.posts, avgPosts)}`}>
                {benchmarkData.myAccount.posts.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600 dark:text-gray-400">Competitor Avg</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {avgPosts.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-lg">
              <Heart className="w-6 h-6 text-pink-600 dark:text-pink-300" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Engagement</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600 dark:text-gray-400">Your Account</span>
              <span className={`text-2xl font-bold ${getPerformanceColor(benchmarkData.myAccount.engagement, avgEngagement)}`}>
                {benchmarkData.myAccount.engagement.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600 dark:text-gray-400">Competitor Avg</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {avgEngagement.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Comparison Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Detailed Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Account
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Followers
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Posts
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Engagement
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                  Your Account
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                  {benchmarkData.myAccount.followers.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                  {benchmarkData.myAccount.posts.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                  {benchmarkData.myAccount.engagement.toFixed(2)}%
                </td>
              </tr>
              {benchmarkData.competitors.map((competitor, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    @{competitor.username}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    {competitor.followers.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    {competitor.posts.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    {competitor.engagement.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
