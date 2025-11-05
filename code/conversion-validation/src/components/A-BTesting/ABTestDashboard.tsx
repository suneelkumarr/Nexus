import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown, Users, Target, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../Shared/Card';
import { Badge } from '../Shared/Badge';
import { Button } from '../Shared/Button';
import { ABTestResult } from '../../types/analytics';
import { formatPercentage, formatCurrency, formatDate } from '../../utils/analytics';
import { ConversionDataService } from '../../services/dataService';

interface ABTestDashboardProps {
  className?: string;
}

export const ABTestDashboard: React.FC<ABTestDashboardProps> = ({ className }) => {
  const [tests, setTests] = useState<ABTestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTests = async () => {
      setLoading(true);
      try {
        const dataService = ConversionDataService.getInstance();
        const mockTests = dataService.generateMockABTests(5);
        setTests(mockTests);
        setSelectedTest(mockTests[0]);
      } catch (error) {
        console.error('Error loading A/B tests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4 text-green-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'border-green-200 bg-green-50';
      case 'paused': return 'border-yellow-200 bg-yellow-50';
      case 'completed': return 'border-blue-200 bg-blue-50';
      case 'cancelled': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSignificanceColor = (isSignificant: boolean) => {
    return isSignificant ? 'text-green-600' : 'text-gray-600';
  };

  const getSignificanceIcon = (isSignificant: boolean) => {
    return isSignificant ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-600" />;
  };

  // Generate time series data for the selected test
  const generateTestTrendData = (test: ABTestResult) => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      return {
        date: date.toISOString().split('T')[0],
        control: test.variants[0]?.conversionRate + (Math.random() - 0.5) * 0.02 || 0,
        variantA: test.variants[1]?.conversionRate + (Math.random() - 0.5) * 0.02 || 0,
        visitors: 800 + Math.random() * 400
      };
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Test Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.filter(t => t.status === 'running').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Play className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Significant Results</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.reduce((acc, test) => 
                    acc + (test.results.some(r => r.isSignificant) ? 1 : 0), 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>A/B Tests</CardTitle>
              <CardDescription>
                Manage and monitor all A/B tests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTest?.id === test.id 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-900">{test.name}</h4>
                    {getStatusIcon(test.status)}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge 
                      variant={test.status === 'running' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {test.status}
                    </Badge>
                    {test.results.some(r => r.isSignificant) && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        Significant
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {test.description}
                  </p>
                  
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Started: {formatDate(test.startDate)}</span>
                    {test.endDate && <span>Ended: {formatDate(test.endDate)}</span>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Selected Test Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTest && (
            <>
              {/* Test Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedTest.name}</CardTitle>
                      <CardDescription>{selectedTest.description}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        {selectedTest.status === 'running' ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                        {selectedTest.status === 'running' ? 'Pause' : 'Resume'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Hypothesis</h4>
                      <p className="text-sm text-gray-600">{selectedTest.hypothesis}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Primary Metric</span>
                        <span className="font-medium">{selectedTest.primaryMetric}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Significance Level</span>
                        <span className="font-medium">{formatPercentage(selectedTest.significanceLevel)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Required Sample Size</span>
                        <span className="font-medium">{selectedTest.requiredSampleSize.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variant Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Variant Performance</CardTitle>
                  <CardDescription>
                    Compare conversion rates and metrics between variants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {selectedTest.variants.map((variant) => (
                      <div key={variant.id} className={`p-4 rounded-lg border ${getStatusColor(selectedTest.status)}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{variant.name}</h4>
                          <Badge variant="outline">{variant.trafficAllocation}% traffic</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Visitors</p>
                            <p className="text-lg font-semibold">{variant.visitors.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Conversions</p>
                            <p className="text-lg font-semibold">{variant.conversions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Conversion Rate</p>
                            <p className="text-lg font-semibold">{formatPercentage(variant.conversionRate)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Revenue</p>
                            <p className="text-lg font-semibold">{formatCurrency(variant.revenue)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-xs text-gray-600 mb-1">Additional Metrics</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(variant.metrics).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="font-medium">
                                  {key.includes('Rate') ? formatPercentage(value) : 
                                   key.includes('Duration') ? `${value.toFixed(1)}min` :
                                   key.includes('Revenue') ? formatCurrency(value) : value.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Results Analysis */}
                  {selectedTest.results.length > 0 && (
                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-4">Statistical Analysis</h4>
                      <div className="space-y-4">
                        {selectedTest.results.map((result, index) => {
                          const variant = selectedTest.variants.find(v => v.id === result.variantId);
                          const control = selectedTest.variants.find(v => v.id === 'control');
                          
                          const lift = control && variant 
                            ? ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100
                            : 0;

                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                {getSignificanceIcon(result.isSignificant)}
                                <div>
                                  <p className="font-medium text-sm">{variant?.name} vs Control</p>
                                  <p className="text-xs text-gray-600">p-value: {result.pValue.toFixed(4)}</p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="flex items-center space-x-2">
                                  {lift >= 0 ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                  )}
                                  <span className={`text-sm font-medium ${lift >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {lift >= 0 ? '+' : ''}{lift.toFixed(1)}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                  Confidence: {result.liftConfidence.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Test Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Daily conversion rates for each variant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={generateTestTrendData(selectedTest)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatPercentage(value),
                          name === 'control' ? 'Control' : 'Variant A'
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="control" 
                        stroke="#6b7280" 
                        strokeWidth={2}
                        name="Control"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="variantA" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Variant A"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};