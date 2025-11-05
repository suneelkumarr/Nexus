import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../Shared/Card';
import { Badge } from '../Shared/Badge';
import { Progress } from '../Shared/Progress';
import { ConversionFunnel, ConversionInsights, ConversionGoal } from '../../types/analytics';
import { formatPercentage, formatCurrency, formatDate } from '../../utils/analytics';
import { ConversionDataService } from '../../services/dataService';

interface ConversionDashboardProps {
  className?: string;
}

export const ConversionDashboard: React.FC<ConversionDashboardProps> = ({ className }) => {
  const [funnelData, setFunnelData] = useState<ConversionFunnel | null>(null);
  const [insights, setInsights] = useState<ConversionInsights | null>(null);
  const [goals, setGoals] = useState<ConversionGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const dataService = ConversionDataService.getInstance();
        const [funnel, conversionInsights, conversionGoals] = await Promise.all([
          Promise.resolve(dataService.generateMockFunnel()),
          Promise.resolve(dataService.generateMockConversionInsights()),
          Promise.resolve(dataService.generateMockConversionGoals())
        ]);

        setFunnelData(funnel);
        setInsights(conversionInsights);
        setGoals(conversionGoals);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  if (!funnelData || !insights) {
    return <div className="text-center p-8">Error loading dashboard data</div>;
  }

  const funnelChartData = funnelData.steps.map(step => ({
    name: step.name,
    value: step.users,
    conversionRate: step.conversionRate * 100
  }));

  const timeSeriesData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      conversionRate: 12 + Math.random() * 6,
      visitors: 800 + Math.random() * 400,
      conversions: 100 + Math.random() * 50
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-green-600';
      case 'on_track': return 'text-blue-600';
      case 'at_risk': return 'text-yellow-600';
      case 'missed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'on_track': return <Target className="h-4 w-4 text-blue-600" />;
      case 'at_risk': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'missed': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(insights.conversionRate / 100)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+2.3%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time to Convert</p>
                <p className="text-2xl font-bold text-gray-900">
                  {insights.averageTimeToConvert.toFixed(1)} days
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">-0.8 days</span>
              <span className="text-gray-600 ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {funnelData.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(125000)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+18.2%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              User progression through conversion steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' ? value.toLocaleString() : formatPercentage(value / 100),
                    name === 'value' ? 'Users' : 'Conversion Rate'
                  ]}
                />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Trends</CardTitle>
            <CardDescription>
              30-day conversion rate and volume trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="visitors" fill="#e5e7eb" name="Visitors" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="conversionRate" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Conversion Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>
              Analysis of conversion patterns and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Top Drop-off Points</h4>
              <ul className="space-y-2">
                {insights.topDropOffPoints.map((point, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Most Effective Features</h4>
              <ul className="space-y-2">
                {insights.mostEffectiveFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">A/B Test Winners</h4>
              <ul className="space-y-2">
                {insights.abTestWinners.map((winner, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    {winner}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Goals</CardTitle>
            <CardDescription>
              Progress towards key conversion objectives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(goal.status)}
                    <h4 className="font-medium text-gray-900">{goal.name}</h4>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Current: {goal.unit === 'percentage' ? formatPercentage(goal.current / 100) : goal.current}</span>
                  <span>Target: {goal.unit === 'percentage' ? formatPercentage(goal.target / 100) : goal.target}</span>
                </div>
                
                <Progress 
                  value={(goal.current / goal.target) * 100} 
                  className="h-2"
                />
                
                <p className="text-xs text-gray-500">
                  Deadline: {formatDate(goal.deadline)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Actionable insights to improve conversion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.recommendations.map((recommendation) => (
              <div key={recommendation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                  <div className="flex space-x-2">
                    <Badge variant={recommendation.impact === 'high' ? 'destructive' : recommendation.impact === 'medium' ? 'default' : 'secondary'}>
                      {recommendation.impact} impact
                    </Badge>
                    <Badge variant="outline">
                      {recommendation.effort} effort
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-medium">{recommendation.confidence}%</span>
                  </div>
                  <Progress value={recommendation.confidence} className="h-2" />
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Implementation:</p>
                  <p className="text-xs text-gray-700">{recommendation.implementation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};