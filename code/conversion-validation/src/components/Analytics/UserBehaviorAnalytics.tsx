import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import { Users, Clock, MousePointer, Eye, UserCheck, TrendingUp, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../Shared/Card';
import { Badge } from '../Shared/Badge';
import { Button } from '../Shared/Button';
import { Input } from '../Shared/Input';
import { UserBehaviorMetrics, SegmentAnalysis } from '../../types/analytics';
import { formatPercentage, formatDate } from '../../utils/analytics';
import { ConversionDataService } from '../../services/dataService';

interface UserBehaviorAnalyticsProps {
  className?: string;
}

export const UserBehaviorAnalytics: React.FC<UserBehaviorAnalyticsProps> = ({ className }) => {
  const [behaviorData, setBehaviorData] = useState<UserBehaviorMetrics[]>([]);
  const [segments, setSegments] = useState<SegmentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const loadBehaviorData = async () => {
      setLoading(true);
      try {
        const dataService = ConversionDataService.getInstance();
        const [behavior, segmentData] = await Promise.all([
          Promise.resolve(dataService.generateMockUserBehaviorMetrics(500)),
          Promise.resolve(dataService.generateMockSegmentAnalysis())
        ]);

        setBehaviorData(behavior);
        setSegments(segmentData);
      } catch (error) {
        console.error('Error loading behavior data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBehaviorData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Process behavior data for analytics
  const totalUsers = behaviorData.length;
  const completedOnboarding = behaviorData.filter(u => u.onboardingCompleted).length;
  const initiatedUpgrade = behaviorData.filter(u => u.upgradeInitiated).length;
  const completedUpgrade = behaviorData.filter(u => u.upgradeCompleted).length;
  const averageSessionDuration = behaviorData.reduce((sum, u) => sum + u.totalTimeSpent, 0) / totalUsers;

  // Generate funnel step data
  const funnelData = [
    { name: 'Users', value: totalUsers, color: '#3b82f6' },
    { name: 'Onboarding Start', value: behaviorData.filter(u => u.totalTimeSpent > 0).length, color: '#10b981' },
    { name: 'Onboarding Complete', value: completedOnboarding, color: '#f59e0b' },
    { name: 'Feature Trial', value: behaviorData.filter(u => u.featuresUsed.length > 0).length, color: '#8b5cf6' },
    { name: 'Upgrade Initiated', value: initiatedUpgrade, color: '#ef4444' },
    { name: 'Upgrade Complete', value: completedUpgrade, color: '#06b6d4' }
  ];

  // Generate feature usage data
  const featureUsage = new Map<string, number>();
  behaviorData.forEach(user => {
    user.featuresUsed.forEach(feature => {
      featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1);
    });
  });

  const topFeatures = Array.from(featureUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([feature, count]) => ({
      name: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      usage: count,
      percentage: (count / totalUsers) * 100
    }));

  // Generate session duration data
  const sessionDurationData = Array.from({ length: 10 }, (_, i) => {
    const range = [`${i}-${i+5}min`, `${i+5}-${i+10}min`, `${i+10}-${i+20}min`, '20min+'][Math.floor(Math.random() * 4)];
    return {
      range,
      users: Math.floor(Math.random() * 100) + 20
    };
  });

  // Generate time-based data
  const timeSeriesData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      sessions: 200 + Math.random() * 100,
      avgDuration: averageSessionDuration + (Math.random() - 0.5) * 20,
      conversionRate: (completedUpgrade / totalUsers) * 100 + (Math.random() - 0.5) * 5
    };
  });

  const onboardingRate = (completedOnboarding / totalUsers) * 100;
  const upgradeInitiateRate = (initiatedUpgrade / completedOnboarding) * 100;
  const upgradeCompleteRate = (completedUpgrade / initiatedUpgrade) * 100;
  const overallConversionRate = (completedUpgrade / totalUsers) * 100;

  const exportData = () => {
    // In a real app, this would export to CSV/Excel
    const data = {
      totalUsers,
      onboardingRate,
      upgradeInitiateRate,
      upgradeCompleteRate,
      overallConversionRate,
      averageSessionDuration,
      topFeatures
    };
    console.log('Exporting data:', data);
    alert('Data export functionality would be implemented here');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Behavior Analytics</h2>
          <p className="text-gray-600">Analyze user engagement and conversion patterns</p>
        </div>
        <div className="flex space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-600 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Onboarding Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(onboardingRate / 100)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{completedOnboarding}</span>
              <span className="text-gray-600 ml-1">of {totalUsers} users</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {averageSessionDuration.toFixed(1)} min
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+8.2%</span>
              <span className="text-gray-600 ml-1">increase</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(overallConversionRate / 100)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 font-medium">{completedUpgrade}</span>
              <span className="text-gray-600 ml-1">conversions</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>User Journey Funnel</CardTitle>
            <CardDescription>
              Conversion through key user journey steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(),
                    'Users'
                  ]}
                />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Duration Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Session Duration</CardTitle>
            <CardDescription>
              Distribution of user session lengths
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sessionDurationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Top Features by Usage</CardTitle>
          <CardDescription>
            Most popular features among users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topFeatures.map((feature, index) => (
              <div key={feature.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-gray-900">{feature.name}</h4>
                  <Badge variant="secondary">#{index + 1}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usage</span>
                    <span className="font-medium">{feature.usage} users</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${feature.percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    {feature.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Flow Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of user conversion journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              {
                step: 'Onboarding',
                current: completedOnboarding,
                total: totalUsers,
                rate: onboardingRate,
                dropoff: 100 - onboardingRate,
                color: 'bg-green-500'
              },
              {
                step: 'Feature Trial',
                current: behaviorData.filter(u => u.featuresUsed.length > 0).length,
                total: completedOnboarding,
                rate: (behaviorData.filter(u => u.featuresUsed.length > 0).length / completedOnboarding) * 100,
                dropoff: 100 - (behaviorData.filter(u => u.featuresUsed.length > 0).length / completedOnboarding) * 100,
                color: 'bg-blue-500'
              },
              {
                step: 'Upgrade Intent',
                current: initiatedUpgrade,
                total: completedOnboarding,
                rate: upgradeInitiateRate,
                dropoff: 100 - upgradeInitiateRate,
                color: 'bg-yellow-500'
              },
              {
                step: 'Upgrade Complete',
                current: completedUpgrade,
                total: initiatedUpgrade,
                rate: upgradeCompleteRate,
                dropoff: 100 - upgradeCompleteRate,
                color: 'bg-purple-500'
              }
            ].map((flow, index) => (
              <div key={flow.step} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${flow.color}`}></div>
                    <h4 className="font-medium text-gray-900">{flow.step}</h4>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      {flow.current.toLocaleString()} / {flow.total.toLocaleString()}
                    </span>
                    <span className="font-medium">
                      {formatPercentage(flow.rate / 100)}
                    </span>
                    <span className="text-red-600">
                      -{flow.dropoff.toFixed(1)}% dropoff
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${flow.color}`}
                      style={{ width: `${Math.min(100, flow.rate)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Series Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Behavior Trends</CardTitle>
          <CardDescription>
            Daily metrics over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="sessions" fill="#e5e7eb" name="Sessions" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="conversionRate" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Conversion Rate (%)"
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="avgDuration" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Avg Duration (min)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Segment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>User Segments</CardTitle>
          <CardDescription>
            Behavior analysis by user segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {segments.map((segment) => (
              <div key={segment.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{segment.name}</h4>
                  <Badge variant="outline">
                    {segment.size.toLocaleString()} users
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Conversion Rate</p>
                    <p className="text-lg font-semibold">
                      {formatPercentage(segment.conversionRate / 100)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="text-lg font-semibold">
                      ${segment.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-sm text-gray-900">Key Metrics</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trial Start Rate</span>
                      <span className="font-medium">{formatPercentage(segment.metrics.trialStartRate / 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trial to Paid Rate</span>
                      <span className="font-medium">{formatPercentage(segment.metrics.trialToPaidRate / 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Feature Adoption</span>
                      <span className="font-medium">{formatPercentage(segment.metrics.featureAdoptionRate / 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Churn Rate</span>
                      <span className="font-medium">{formatPercentage(segment.metrics.churnRate / 100)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};