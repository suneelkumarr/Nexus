import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock, Target, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../Shared/Card';
import { Badge } from '../Shared/Badge';
import { Button } from '../Shared/Button';
import { SuccessCriteria } from '../../types/analytics';
import { formatPercentage, formatDate } from '../../utils/analytics';
import { ConversionDataService } from '../../services/dataService';

interface SuccessCriteriaValidatorProps {
  className?: string;
}

export const SuccessCriteriaValidator: React.FC<SuccessCriteriaValidatorProps> = ({ className }) => {
  const [criteria, setCriteria] = useState<SuccessCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const loadCriteria = async () => {
      setLoading(true);
      try {
        const dataService = ConversionDataService.getInstance();
        const mockCriteria = dataService.generateMockSuccessCriteria();
        setCriteria(mockCriteria);
      } catch (error) {
        console.error('Error loading success criteria:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCriteria();
  }, []);

  const handleValidation = async () => {
    setValidating(true);
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update criteria with new values (simulate real-time validation)
    setCriteria(prev => prev.map(c => {
      const variance = (Math.random() - 0.5) * 10; // +/- 5%
      const newValue = Math.max(0, c.currentValue + variance);
      
      let newStatus: SuccessCriteria['status'];
      const target = c.targetValue;
      
      switch (c.operator) {
        case '>=':
          newStatus = newValue >= target ? 'met' : (newValue >= target * 0.9 ? 'at_risk' : 'not_met');
          break;
        case '<=':
          newStatus = newValue <= target ? 'met' : (newValue <= target * 1.1 ? 'at_risk' : 'not_met');
          break;
        case '=':
          const tolerance = target * 0.05;
          newStatus = Math.abs(newValue - target) <= tolerance ? 'met' : 'not_met';
          break;
        default:
          newStatus = 'unknown';
      }
      
      return {
        ...c,
        currentValue: newValue,
        status: newStatus,
        lastChecked: new Date()
      };
    }));
    
    setValidating(false);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      case 'met': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'exceeded': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'at_risk': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'not_met': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'unknown': return <Clock className="h-5 w-5 text-gray-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'met': return 'border-green-200 bg-green-50';
      case 'exceeded': return 'border-blue-200 bg-blue-50';
      case 'at_risk': return 'border-yellow-200 bg-yellow-50';
      case 'not_met': return 'border-red-200 bg-red-50';
      case 'unknown': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getProgressValue = (criteria: SuccessCriteria) => {
    switch (criteria.operator) {
      case '>=':
        return Math.min(100, (criteria.currentValue / criteria.targetValue) * 100);
      case '<=':
        return Math.min(100, (criteria.targetValue / criteria.currentValue) * 100);
      case '=':
        return Math.abs(criteria.currentValue - criteria.targetValue) <= criteria.targetValue * 0.05 ? 100 : 0;
      default:
        return 0;
    }
  };

  const progressToTarget = (criteria: SuccessCriteria) => {
    switch (criteria.operator) {
      case '>=':
        return criteria.currentValue >= criteria.targetValue;
      case '<=':
        return criteria.currentValue <= criteria.targetValue;
      case '=':
        return Math.abs(criteria.currentValue - criteria.targetValue) <= criteria.targetValue * 0.05;
      default:
        return false;
    }
  };

  const overallProgress = (criteria.filter(c => progressToTarget(c)).length / criteria.length) * 100;

  const criteriaByStatus = {
    met: criteria.filter(c => c.status === 'met' || c.status === 'exceeded'),
    at_risk: criteria.filter(c => c.status === 'at_risk'),
    not_met: criteria.filter(c => c.status === 'not_met'),
    unknown: criteria.filter(c => c.status === 'unknown')
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Validation Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Success Criteria Validation</h2>
          <p className="text-gray-600">Automated validation of conversion goals and KPIs</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleValidation} 
            disabled={validating}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${validating ? 'animate-spin' : ''}`} />
            <span>{validating ? 'Validating...' : 'Validate All'}</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Criteria Met</p>
                <p className="text-2xl font-bold text-green-600">
                  {criteriaByStatus.met.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {criteriaByStatus.at_risk.length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Not Met</p>
                <p className="text-2xl font-bold text-red-600">
                  {criteriaByStatus.not_met.length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {overallProgress.toFixed(0)}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Criteria List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {criteria.map((criterion) => {
          const progress = getProgressValue(criterion);
          const metTarget = progressToTarget(criterion);
          const progressDiff = criterion.currentValue - criterion.targetValue;
          
          return (
            <Card key={criterion.id} className={getStatusColor(criterion.status)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(criterion.status)}
                      <CardTitle className="text-lg">{criterion.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {criterion.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={getPriorityColor(criterion.priority)}>
                      {criterion.priority}
                    </Badge>
                    {criterion.automatedCheck && (
                      <Badge variant="outline" className="text-xs">
                        Auto
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Current Value</p>
                    <p className="text-xl font-bold text-gray-900">
                      {criterion.metric.includes('rate') || criterion.metric.includes('conversion') 
                        ? formatPercentage(criterion.currentValue / 100)
                        : criterion.currentValue.toLocaleString()
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600">Target</p>
                    <p className="text-xl font-bold text-gray-900">
                      {criterion.metric.includes('rate') || criterion.metric.includes('conversion')
                        ? formatPercentage(criterion.targetValue / 100)
                        : criterion.targetValue.toLocaleString()
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <div className="flex items-center space-x-2">
                    {metTarget ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={metTarget ? 'text-green-600' : 'text-red-600'}>
                      {progressDiff >= 0 ? '+' : ''}{progressDiff.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metTarget ? 'bg-green-600' : criterion.status === 'at_risk' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Timeframe: {criterion.timeframe} days</span>
                  <span>Last checked: {formatDate(criterion.lastChecked)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    metTarget ? 'text-green-600' : 
                    criterion.status === 'at_risk' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {criterion.status.replace('_', ' ').toUpperCase()}
                  </span>
                  
                  <span className="text-xs text-gray-500">
                    Operator: {criterion.operator}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Validation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Summary</CardTitle>
          <CardDescription>
            Overall assessment of success criteria performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Success Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {((criteriaByStatus.met.length / criteria.length) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-600">
                {criteriaByStatus.met.length} of {criteria.length} criteria met
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-medium text-gray-900">Attention Needed</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {criteriaByStatus.at_risk.length}
              </p>
              <p className="text-sm text-gray-600">
                Criteria requiring monitoring
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-medium text-gray-900">Action Required</h3>
              <p className="text-2xl font-bold text-red-600">
                {criteriaByStatus.not_met.length}
              </p>
              <p className="text-sm text-gray-600">
                Criteria not meeting targets
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};