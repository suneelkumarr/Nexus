import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Download, FileText, FileSpreadsheet, Plus, Search, Filter, Edit, Trash2, Copy, Eye, Calendar, Users, BarChart3, Check, X } from 'lucide-react';

interface ExportTemplate {
  id: string;
  user_id: string;
  team_id: string | null;
  template_name: string;
  template_type: string;
  export_format: string;
  template_config: any;
  data_sources: any[];
  filters: any;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  usage_count: number;
  team_name?: string;
}

interface Team {
  id: string;
  team_name: string;
}

interface ExportTemplatesProps {
  selectedAccount: string | null;
}

const TEMPLATE_TYPES = [
  { id: 'analytics', name: 'Analytics Report', description: 'Performance metrics and insights' },
  { id: 'content', name: 'Content Report', description: 'Content performance analysis' },
  { id: 'audience', name: 'Audience Report', description: 'Demographic and engagement data' },
  { id: 'competitor', name: 'Competitor Analysis', description: 'Competitive intelligence data' },
  { id: 'custom', name: 'Custom Export', description: 'User-defined data export' }
];

const EXPORT_FORMATS = [
  { id: 'pdf', name: 'PDF', icon: FileText, description: 'Formatted report document' },
  { id: 'excel', name: 'Excel', icon: FileSpreadsheet, description: 'Spreadsheet with charts' },
  { id: 'csv', name: 'CSV', icon: BarChart3, description: 'Raw data for analysis' }
];

const DATA_SOURCES = [
  { id: 'instagram_accounts', name: 'Instagram Accounts', description: 'Account information and metrics' },
  { id: 'analytics_snapshots', name: 'Analytics Snapshots', description: 'Historical performance data' },
  { id: 'media_insights', name: 'Media Insights', description: 'Post and story performance' },
  { id: 'hashtag_performance', name: 'Hashtag Performance', description: 'Hashtag analysis data' },
  { id: 'growth_recommendations', name: 'Growth Recommendations', description: 'AI-generated insights' },
  { id: 'competitor_metrics', name: 'Competitor Metrics', description: 'Competitor analysis data' }
];

export default function ExportTemplates({ selectedAccount }: ExportTemplatesProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    template_name: '',
    template_type: '',
    export_format: '',
    team_id: '',
    is_public: false,
    data_sources: [] as string[],
    filters: {},
    date_range_required: false,
    account_filter_required: false
  });

  useEffect(() => {
    fetchTeams();
    fetchTemplates();
  }, [user]);

  const fetchTeams = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('team_management')
        .select('id, team_name')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('team_name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      setError(error.message);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) return;

      const { data, error } = await supabase
        .from('export_templates')
        .select(`
          *,
          team_management(team_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const templatesWithTeamNames = (data || []).map(template => ({
        ...template,
        team_name: template.team_management?.team_name
      }));

      setTemplates(templatesWithTeamNames);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    try {
      setError('');

      if (!user) return;

      const { error } = await supabase
        .from('export_templates')
        .insert([{
          user_id: user.id,
          team_id: formData.team_id || null,
          template_name: formData.template_name,
          template_type: formData.template_type,
          export_format: formData.export_format,
          template_config: {
            date_range_required: formData.date_range_required,
            account_filter_required: formData.account_filter_required
          },
          data_sources: formData.data_sources.map(source => ({
            table: source,
            columns: '*',
            date_column: source.includes('analytics') ? 'created_at' : null,
            account_column: source.includes('accounts') || source.includes('analytics') ? 'account_id' : null
          })),
          filters: formData.filters,
          is_public: formData.is_public,
          usage_count: 0
        }]);

      if (error) throw error;

      setIsCreateModalOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      console.error('Error creating template:', error);
      setError(error.message);
    }
  };

  const updateTemplate = async () => {
    try {
      setError('');

      if (!selectedTemplate) return;

      const { error } = await supabase
        .from('export_templates')
        .update({
          template_name: formData.template_name,
          template_type: formData.template_type,
          export_format: formData.export_format,
          team_id: formData.team_id || null,
          template_config: {
            date_range_required: formData.date_range_required,
            account_filter_required: formData.account_filter_required
          },
          data_sources: formData.data_sources.map(source => ({
            table: source,
            columns: '*',
            date_column: source.includes('analytics') ? 'created_at' : null,
            account_column: source.includes('accounts') || source.includes('analytics') ? 'account_id' : null
          })),
          filters: formData.filters,
          is_public: formData.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      setIsEditModalOpen(false);
      setSelectedTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      console.error('Error updating template:', error);
      setError(error.message);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      setError('');

      const confirmed = window.confirm('Are you sure you want to delete this template?');
      if (!confirmed) return;

      const { error } = await supabase
        .from('export_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      setError(error.message);
    }
  };

  const duplicateTemplate = async (template: ExportTemplate) => {
    try {
      setError('');

      if (!user) return;

      const { error } = await supabase
        .from('export_templates')
        .insert([{
          user_id: user.id,
          team_id: template.team_id,
          template_name: `${template.template_name} (Copy)`,
          template_type: template.template_type,
          export_format: template.export_format,
          template_config: template.template_config,
          data_sources: template.data_sources,
          filters: template.filters,
          is_public: false,
          usage_count: 0
        }]);

      if (error) throw error;

      fetchTemplates();
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      setError(error.message);
    }
  };

  const generateExport = async (template: ExportTemplate) => {
    try {
      setGenerating(template.id);
      setError('');

      const { data, error } = await supabase.functions.invoke('generate-exports', {
        body: {
          templateId: template.id,
          exportFormat: template.export_format,
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          },
          accountIds: selectedAccount ? [selectedAccount] : undefined,
          customFilters: {}
        }
      });

      if (error) throw error;

      if (data?.data?.export_url) {
        // Download the generated file
        window.open(data.data.export_url, '_blank');
        
        // Show success message
        alert(`Export generated successfully! File: ${data.data.file_name}`);
      } else {
        throw new Error('Export generation failed - no download URL received');
      }
    } catch (error: any) {
      console.error('Error generating export:', error);
      setError(`Export generation failed: ${error.message}`);
    } finally {
      setGenerating(null);
    }
  };

  const openEditModal = (template: ExportTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      template_name: template.template_name,
      template_type: template.template_type,
      export_format: template.export_format,
      team_id: template.team_id || '',
      is_public: template.is_public,
      data_sources: template.data_sources.map((ds: any) => ds.table || ds),
      filters: template.filters || {},
      date_range_required: template.template_config?.date_range_required || false,
      account_filter_required: template.template_config?.account_filter_required || false
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      template_name: '',
      template_type: '',
      export_format: '',
      team_id: '',
      is_public: false,
      data_sources: [],
      filters: {},
      date_range_required: false,
      account_filter_required: false
    });
  };

  const getFormatIcon = (format: string) => {
    const formatConfig = EXPORT_FORMATS.find(f => f.id === format);
    return formatConfig?.icon || FileText;
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'text-red-600';
      case 'excel':
        return 'text-green-600';
      case 'csv':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.template_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || template.template_type === typeFilter;
    const matchesFormat = formatFilter === 'all' || template.export_format === formatFilter;
    const matchesVisibility = visibilityFilter === 'all' || 
                              (visibilityFilter === 'public' && template.is_public) ||
                              (visibilityFilter === 'private' && !template.is_public) ||
                              (visibilityFilter === 'mine' && template.user_id === user?.id);
    
    return matchesSearch && matchesType && matchesFormat && matchesVisibility;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {TEMPLATE_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Formats</option>
            {EXPORT_FORMATS.map(format => (
              <option key={format.id} value={format.id}>{format.name}</option>
            ))}
          </select>

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Templates</option>
            <option value="mine">My Templates</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const FormatIcon = getFormatIcon(template.export_format);
          const typeInfo = TEMPLATE_TYPES.find(t => t.id === template.template_type);
          
          return (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${getFormatColor(template.export_format)}`}>
                      <FormatIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {template.template_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {typeInfo?.name} • {template.export_format.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {template.is_public && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                        Public
                      </span>
                    )}
                  </div>
                </div>

                {/* Data Sources */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Data Sources:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.data_sources.slice(0, 3).map((source: any, index: number) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {typeof source === 'string' ? source.replace('_', ' ') : source.table?.replace('_', ' ')}
                      </span>
                    ))}
                    {template.data_sources.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        +{template.data_sources.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Usage</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {template.usage_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Team</p>
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {template.team_name || 'Personal'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateExport(template)}
                    disabled={generating === template.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {generating === template.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {generating === template.id ? 'Generating...' : 'Export'}
                  </button>
                  
                  <button
                    onClick={() => openEditModal(template)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => duplicateTemplate(template)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  
                  {template.user_id === user?.id && (
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || typeFilter !== 'all' || formatFilter !== 'all' || visibilityFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first export template to get started'
            }
          </p>
          {!searchQuery && typeFilter === 'all' && formatFilter === 'all' && visibilityFilter === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Template
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Template Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {isCreateModalOpen ? 'Create Export Template' : 'Edit Export Template'}
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formData.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter template name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template Type
                    </label>
                    <select
                      value={formData.template_type}
                      onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      {TEMPLATE_TYPES.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Export Format
                    </label>
                    <select
                      value={formData.export_format}
                      onChange={(e) => setFormData({ ...formData, export_format: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select format</option>
                      {EXPORT_FORMATS.map(format => (
                        <option key={format.id} value={format.id}>{format.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Team (Optional)
                    </label>
                    <select
                      value={formData.team_id}
                      onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Personal template</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.team_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Sources
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                    {DATA_SOURCES.map(source => (
                      <label key={source.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.data_sources.includes(source.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                data_sources: [...formData.data_sources, source.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                data_sources: formData.data_sources.filter(ds => ds !== source.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{source.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.date_range_required}
                      onChange={(e) => setFormData({ ...formData, date_range_required: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Require date range</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.account_filter_required}
                      onChange={(e) => setFormData({ ...formData, account_filter_required: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Require account filter</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Make template public</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={isCreateModalOpen ? createTemplate : updateTemplate}
                  disabled={!formData.template_name || !formData.template_type || !formData.export_format || formData.data_sources.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="h-4 w-4" />
                  {isCreateModalOpen ? 'Create Template' : 'Update Template'}
                </button>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedTemplate(null);
                    resetForm();
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}