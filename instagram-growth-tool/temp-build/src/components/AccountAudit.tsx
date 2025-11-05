import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileCheck, RefreshCw, TrendingUp, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';

interface AccountAudit {
  id: string;
  overall_score: number;
  profile_optimization_score: number;
  content_quality_score: number;
  engagement_score: number;
  growth_score: number;
  hashtag_strategy_score: number;
  posting_schedule_score: number;
  visual_quality_score: number;
  audit_results: any;
  optimization_suggestions: any[];
  improvement_priorities: any[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  action_items: any[];
  estimated_impact: any;
  audit_date: string;
}

interface AccountAuditProps {
  selectedAccount: string | null;
}

export default function AccountAudit({ selectedAccount }: AccountAuditProps) {
  const [audit, setAudit] = useState<AccountAudit | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      fetchLatestAudit();
    }
  }, [selectedAccount]);

  const fetchLatestAudit = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('account_audits')
        .select('*')
        .eq('instagram_account_id', selectedAccount)
        .eq('is_latest', true)
        .order('audit_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setAudit(data || null);
    } catch (error) {
      console.error('Error fetching audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewAudit = async () => {
    if (!selectedAccount) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-account-audit', {
        body: { accountId: selectedAccount }
      });

      if (error) throw error;
      setAudit(data.audit);
    } catch (error) {
      console.error('Error generating audit:', error);
      alert('Failed to generate audit. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[priority as keyof typeof colors] || colors['medium'];
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading audit...</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <FileCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Audit Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Generate a comprehensive account audit to get optimization insights and recommendations.
          </p>
          <button
            onClick={generateNewAudit}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? 'Generating Audit...' : 'Generate Account Audit'}
          </button>
        </div>
      </div>
    );
  }

  const scoreCategories = [
    { name: 'Profile', score: audit.profile_optimization_score },
    { name: 'Content', score: audit.content_quality_score },
    { name: 'Engagement', score: audit.engagement_score },
    { name: 'Growth', score: audit.growth_score },
    { name: 'Hashtags', score: audit.hashtag_strategy_score },
    { name: 'Schedule', score: audit.posting_schedule_score },
    { name: 'Visual', score: audit.visual_quality_score }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">Account Audit</h2>
            <p className="text-blue-100">
              Last updated: {new Date(audit.audit_date).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={generateNewAudit}
            disabled={generating}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Refresh Audit'}
          </button>
        </div>
        
        <div className="mt-8 flex items-end gap-4">
          <div className="text-7xl font-bold">{audit.overall_score}</div>
          <div className="mb-2">
            <div className="text-2xl font-semibold">{getScoreLabel(audit.overall_score)}</div>
            <div className="text-blue-100">Overall Performance</div>
          </div>
        </div>

        {audit.estimated_impact && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm text-blue-100">Follower Growth Potential</div>
              <div className="text-2xl font-bold">{audit.estimated_impact.follower_growth_potential}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm text-blue-100">Engagement Increase</div>
              <div className="text-2xl font-bold">{audit.estimated_impact.engagement_increase_potential}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm text-blue-100">Reach Improvement</div>
              <div className="text-2xl font-bold">{audit.estimated_impact.reach_improvement}</div>
            </div>
          </div>
        )}
      </div>

      {/* Category Scores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Performance Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {scoreCategories.map((category) => (
            <div key={category.name} className="text-center">
              <div className={`text-3xl font-bold p-4 rounded-lg ${getScoreColor(category.score)}`}>
                {category.score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {category.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Suggestions */}
      {audit.optimization_suggestions && audit.optimization_suggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Optimization Suggestions
          </h3>
          <div className="space-y-3">
            {audit.optimization_suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <span className={`inline-block px-2 py-1 text-xs rounded ${getPriorityBadge(suggestion.priority)}`}>
                    {suggestion.priority}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    {suggestion.category}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestion.suggestion}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                    <span>Impact: {suggestion.impact}</span>
                    <span>Difficulty: {suggestion.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SWOT Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {audit.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mt-1">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Weaknesses
          </h3>
          <ul className="space-y-2">
            {audit.weaknesses?.map((weakness, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-red-500 mt-1">•</span>
                {weakness}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Opportunities
          </h3>
          <ul className="space-y-2">
            {audit.opportunities?.map((opportunity, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-blue-500 mt-1">•</span>
                {opportunity}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Threats
          </h3>
          <ul className="space-y-2">
            {audit.threats?.map((threat, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-orange-500 mt-1">•</span>
                {threat}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Items */}
      {audit.action_items && audit.action_items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Recommended Action Items
          </h3>
          <div className="space-y-3">
            {audit.action_items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold">
                  {item.id}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    {item.action}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {item.description}
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <span className={`px-2 py-1 rounded ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span>Est. Time: {item.estimated_time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
