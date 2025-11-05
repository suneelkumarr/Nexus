import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, Calculator, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../Shared/Card';
import { Badge } from '../Shared/Badge';
import { Button } from '../Shared/Button';
import { Input } from '../Shared/Input';
import { ROIAnalysis, ROIMetric } from '../../types/analytics';
import { formatCurrency, formatPercentage, calculateROI, calculatePaybackPeriod } from '../../utils/analytics';
import { ConversionDataService } from '../../services/dataService';

interface ROICalculatorProps {
  className?: string;
}

export const ROICalculator: React.FC<ROICalculatorProps> = ({ className }) => {
  const [roiAnalysis, setRoiAnalysis] = useState<ROIAnalysis | null>(null);
  const [customInputs, setCustomInputs] = useState({
    investment: 50000,
    revenue: 150000,
    timeframe: 90
  });
  const [calculatedROI, setCalculatedROI] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadROIAnalysis = async () => {
      setLoading(true);
      try {
        const dataService = ConversionDataService.getInstance();
        const analysis = dataService.generateMockROIAnalysis();
        setRoiAnalysis(analysis);
      } catch (error) {
        console.error('Error loading ROI analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    loadROIAnalysis();
  }, []);

  useEffect(() => {
    const roi = calculateROI(customInputs.revenue, customInputs.investment);
    setCalculatedROI(roi);
  }, [customInputs]);

  if (loading || !roiAnalysis) {
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

  const paybackPeriod = calculatePaybackPeriod(customInputs.investment, customInputs.revenue / (customInputs.timeframe / 30));
  const netProfit = customInputs.revenue - customInputs.investment;

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const pieData = roiAnalysis.breakdown.map((item, index) => ({
    name: item.subcategory,
    value: Math.abs(item.amount),
    percentage: Math.abs(item.percentage),
    category: item.category
  }));

  const timeSeriesData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - i));
    return {
      month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      investment: roiAnalysis.totalInvestment / 12 * (i + 1),
      revenue: (roiAnalysis.totalRevenue / 12) * (i + 1) * (0.8 + Math.random() * 0.4),
      cumulativeROI: ((roiAnalysis.totalRevenue * (i + 1) / 12) - (roiAnalysis.totalInvestment * (i + 1) / 12)) / roiAnalysis.totalInvestment * 100
    };
  });

  const getROIColor = (roi: number) => {
    if (roi > 50) return 'text-green-600';
    if (roi > 20) return 'text-blue-600';
    if (roi > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getROIStatus = (roi: number) => {
    if (roi > 100) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (roi > 50) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (roi > 20) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
    if (roi > 0) return { label: 'Poor', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Loss', color: 'bg-red-100 text-red-800' };
  };

  const status = getROIStatus(calculatedROI);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key ROI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI</p>
                <p className={`text-2xl font-bold ${getROIColor(calculatedROI)}`}>
                  {calculatedROI.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge className={status.color}>
                {status.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payback Period</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paybackPeriod.toFixed(1)} days
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">Target: 90 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(netProfit)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">
                Margin: {((netProfit / customInputs.revenue) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(customInputs.revenue)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calculator className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-blue-600">
                vs {formatCurrency(customInputs.investment)} investment
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive ROI Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>ROI Calculator</CardTitle>
          <CardDescription>
            Adjust inputs to calculate your custom ROI metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount
              </label>
              <Input
                type="number"
                value={customInputs.investment}
                onChange={(e) => setCustomInputs(prev => ({ 
                  ...prev, 
                  investment: Number(e.target.value) 
                }))}
                placeholder="Enter investment amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenue Generated
              </label>
              <Input
                type="number"
                value={customInputs.revenue}
                onChange={(e) => setCustomInputs(prev => ({ 
                  ...prev, 
                  revenue: Number(e.target.value) 
                }))}
                placeholder="Enter revenue amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeframe (days)
              </label>
              <Input
                type="number"
                value={customInputs.timeframe}
                onChange={(e) => setCustomInputs(prev => ({ 
                  ...prev, 
                  timeframe: Number(e.target.value) 
                }))}
                placeholder="Enter timeframe"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">ROI</p>
              <p className={`text-2xl font-bold ${getROIColor(calculatedROI)}`}>
                {calculatedROI.toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Payback Period</p>
              <p className="text-2xl font-bold text-gray-900">
                {paybackPeriod.toFixed(1)} days
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(netProfit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost/Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost & Revenue Breakdown</CardTitle>
            <CardDescription>
              Distribution of investments and returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ROI Trends */}
        <Card>
          <CardHeader>
            <CardTitle>ROI Trends</CardTitle>
            <CardDescription>
              Monthly cumulative ROI over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Line 
                  type="monotone" 
                  dataKey="cumulativeROI" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Cumulative ROI %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ROI Metrics Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed ROI Metrics</CardTitle>
          <CardDescription>
            Comprehensive breakdown of conversion optimization performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roiAnalysis.metrics.map((metric) => (
              <div key={metric.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{metric.name}</h4>
                  <Badge variant={
                    metric.category === 'revenue' ? 'default' :
                    metric.category === 'cost' ? 'destructive' :
                    metric.category === 'conversion' ? 'secondary' : 'outline'
                  }>
                    {metric.category}
                  </Badge>
                </div>
                
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.unit === 'currency' ? formatCurrency(metric.value) :
                   metric.unit === 'percentage' ? formatPercentage(metric.value / 100) :
                   metric.value.toLocaleString()}
                </p>
                
                <p className="text-xs text-gray-600 mb-2">{metric.description}</p>
                
                <div className="text-xs text-gray-500">
                  <p>Calculation: {metric.calculation}</p>
                  <p>Timeframe: {metric.timeframe} days</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROI Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle>ROI Analysis Summary</CardTitle>
          <CardDescription>
            {formatDate(roiAnalysis.startDate)} to {formatDate(roiAnalysis.endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Financial Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Investment</span>
                  <span className="font-medium">{formatCurrency(roiAnalysis.totalInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-medium">{formatCurrency(roiAnalysis.totalRevenue)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-900 font-medium">Net Profit</span>
                  <span className="font-bold text-gray-900">{formatCurrency(roiAnalysis.netProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI</span>
                  <span className={`font-bold ${getROIColor(roiAnalysis.roi)}`}>
                    {formatPercentage(roiAnalysis.roi / 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payback Period</span>
                  <span className="font-medium">{roiAnalysis.paybackPeriod.toFixed(1)} days</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Category Breakdown</h4>
              <div className="space-y-3">
                {roiAnalysis.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{item.subcategory}</p>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(Math.abs(item.amount))}</p>
                      <p className="text-xs text-gray-600">{Math.abs(item.percentage)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};