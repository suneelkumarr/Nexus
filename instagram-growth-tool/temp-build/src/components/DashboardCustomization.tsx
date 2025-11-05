import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Palette, Layout, Save, Eye, Copy, Trash2, Plus, Search, Star, Users, Share } from 'lucide-react';

interface DashboardCustomization {
  id: string;
  user_id: string;
  team_id: string | null;
  dashboard_name: string;
  layout_config: any;
  widget_settings: any;
  color_scheme: string;
  theme_settings: any;
  created_at: string;
  updated_at: string;
  is_default: boolean;
  is_shared: boolean;
  view_count: number;
  team_name?: string;
}

interface Team {
  id: string;
  team_name: string;
}

interface DashboardCustomizationProps {
  selectedAccount: string | null;
}

const COLOR_SCHEMES = [
  { id: 'default', name: 'Default Blue', colors: ['#3B82F6', '#1D4ED8', '#1E40AF'] },
  { id: 'purple', name: 'Purple', colors: ['#8B5CF6', '#7C3AED', '#6D28D9'] },
  { id: 'green', name: 'Green', colors: ['#10B981', '#059669', '#047857'] },
  { id: 'orange', name: 'Orange', colors: ['#F59E0B', '#D97706', '#B45309'] },
  { id: 'pink', name: 'Pink', colors: ['#EC4899', '#DB2777', '#BE185D'] },
  { id: 'dark', name: 'Dark Mode', colors: ['#374151', '#1F2937', '#111827'] }
];

const WIDGET_TYPES = [
  { id: 'analytics_overview', name: 'Analytics Overview', description: 'Key metrics summary' },
  { id: 'follower_growth', name: 'Follower Growth', description: 'Growth chart visualization' },
  { id: 'engagement_metrics', name: 'Engagement Metrics', description: 'Likes, comments, shares' },
  { id: 'content_performance', name: 'Content Performance', description: 'Top performing posts' },
  { id: 'hashtag_analytics', name: 'Hashtag Analytics', description: 'Hashtag performance' },
  { id: 'competitor_comparison', name: 'Competitor Comparison', description: 'Competitive analysis' },
  { id: 'ai_recommendations', name: 'AI Recommendations', description: 'AI-powered insights' },
  { id: 'recent_activity', name: 'Recent Activity', description: 'Latest platform activity' }
];

export default function DashboardCustomization({ selectedAccount }: DashboardCustomizationProps) {
  const { user } = useAuth();
  const [customizations, setCustomizations] = useState<DashboardCustomization[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomization, setSelectedCustomization] = useState<DashboardCustomization | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    dashboard_name: '',
    team_id: '',
    color_scheme: 'default',
    is_shared: false,
    enabled_widgets: [] as string[],
    layout_type: 'grid'
  });

  useEffect(() => {
    fetchTeams();
    fetchCustomizations();
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

  const fetchCustomizations = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) return;

      const { data, error } = await supabase
        .from('dashboard_customization')
        .select(`
          *,
          team_management(team_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const customizationsWithTeamNames = (data || []).map(customization => ({
        ...customization,
        team_name: customization.team_management?.team_name
      }));

      setCustomizations(customizationsWithTeamNames);
    } catch (error: any) {
      console.error('Error fetching customizations:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createCustomization = async () => {
    try {
      setError('');

      if (!user) return;

      const layoutConfig = {
        type: formData.layout_type,
        columns: formData.layout_type === 'grid' ? 3 : 1,
        widget_order: formData.enabled_widgets,
        responsive: true
      };

      const widgetSettings = formData.enabled_widgets.reduce((acc, widgetId) => {
        acc[widgetId] = {
          enabled: true,
          size: 'medium',
          position: { x: 0, y: 0 }
        };
        return acc;
      }, {} as any);

      const themeSettings = {
        primary_color: COLOR_SCHEMES.find(c => c.id === formData.color_scheme)?.colors[0] || '#3B82F6',
        secondary_color: COLOR_SCHEMES.find(c => c.id === formData.color_scheme)?.colors[1] || '#1D4ED8',
        accent_color: COLOR_SCHEMES.find(c => c.id === formData.color_scheme)?.colors[2] || '#1E40AF',
        border_radius: 'medium',
        spacing: 'normal'
      };

      const { error } = await supabase
        .from('dashboard_customization')
        .insert([{
          user_id: user.id,
          team_id: formData.team_id || null,
          dashboard_name: formData.dashboard_name,
          layout_config: layoutConfig,
          widget_settings: widgetSettings,
          color_scheme: formData.color_scheme,
          theme_settings: themeSettings,
          is_default: false,
          is_shared: formData.is_shared,
          view_count: 0
        }]);

      if (error) throw error;

      setIsCreateModalOpen(false);
      resetForm();
      fetchCustomizations();
    } catch (error: any) {
      console.error('Error creating customization:', error);
      setError(error.message);
    }
  };

  const duplicateCustomization = async (customization: DashboardCustomization) => {
    try {
      setError('');

      if (!user) return;

      const { error } = await supabase
        .from('dashboard_customization')
        .insert([{
          user_id: user.id,
          team_id: customization.team_id,
          dashboard_name: `${customization.dashboard_name} (Copy)`,
          layout_config: customization.layout_config,
          widget_settings: customization.widget_settings,
          color_scheme: customization.color_scheme,
          theme_settings: customization.theme_settings,
          is_default: false,
          is_shared: false,
          view_count: 0
        }]);

      if (error) throw error;

      fetchCustomizations();
    } catch (error: any) {
      console.error('Error duplicating customization:', error);
      setError(error.message);
    }
  };

  const deleteCustomization = async (customizationId: string) => {
    try {
      setError('');

      const confirmed = window.confirm('Are you sure you want to delete this dashboard customization?');
      if (!confirmed) return;

      const { error } = await supabase
        .from('dashboard_customization')
        .delete()
        .eq('id', customizationId);

      if (error) throw error;

      fetchCustomizations();
    } catch (error: any) {
      console.error('Error deleting customization:', error);
      setError(error.message);
    }
  };

  const setAsDefault = async (customizationId: string) => {
    try {
      setError('');

      // First, unset all current defaults
      await supabase
        .from('dashboard_customization')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the selected one as default
      const { error } = await supabase
        .from('dashboard_customization')
        .update({ is_default: true })
        .eq('id', customizationId);

      if (error) throw error;

      fetchCustomizations();
    } catch (error: any) {
      console.error('Error setting default:', error);
      setError(error.message);
    }
  };

  const previewCustomization = (customization: DashboardCustomization) => {
    setSelectedCustomization(customization);
    setPreviewMode(true);
  };

  const resetForm = () => {
    setFormData({
      dashboard_name: '',
      team_id: '',
      color_scheme: 'default',
      is_shared: false,
      enabled_widgets: [],
      layout_type: 'grid'
    });
  };

  const getColorScheme = (schemeId: string) => {
    return COLOR_SCHEMES.find(c => c.id === schemeId) || COLOR_SCHEMES[0];
  };

  const filteredCustomizations = customizations.filter(customization =>
    customization.dashboard_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customization.team_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Create Theme
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Customizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomizations.map((customization) => {
          const colorScheme = getColorScheme(customization.color_scheme);
          
          return (
            <div key={customization.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {customization.dashboard_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {customization.team_name || 'Personal'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {customization.is_default && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    {customization.is_shared && (
                      <Share className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Color Scheme</p>
                  <div className="flex gap-2">
                    {colorScheme.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Widget Count */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Widgets</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {Object.keys(customization.widget_settings || {}).length} enabled
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {customization.view_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(customization.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => previewCustomization(customization)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  
                  <button
                    onClick={() => duplicateCustomization(customization)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  
                  {!customization.is_default && customization.user_id === user?.id && (
                    <button
                      onClick={() => setAsDefault(customization.id)}
                      className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  
                  {customization.user_id === user?.id && (
                    <button
                      onClick={() => deleteCustomization(customization.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Delete"
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

      {filteredCustomizations.length === 0 && (
        <div className="text-center py-12">
          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No customizations found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery 
              ? 'Try adjusting your search criteria'
              : 'Create your first dashboard theme to personalize your experience'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Theme
            </button>
          )}
        </div>
      )}

      {/* Create Customization Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create Dashboard Theme</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme Name
                    </label>
                    <input
                      type="text"
                      value={formData.dashboard_name}
                      onChange={(e) => setFormData({ ...formData, dashboard_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter theme name"
                    />
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
                      <option value="">Personal theme</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.team_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color Scheme
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {COLOR_SCHEMES.map((scheme) => (
                      <button
                        key={scheme.id}
                        onClick={() => setFormData({ ...formData, color_scheme: scheme.id })}
                        className={`p-3 border rounded-lg transition-colors ${
                          formData.color_scheme === scheme.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {scheme.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white">{scheme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Layout Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, layout_type: 'grid' })}
                      className={`p-3 border rounded-lg transition-colors ${
                        formData.layout_type === 'grid'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Layout className="h-5 w-5 mx-auto mb-2" />
                      <p className="text-sm text-gray-900 dark:text-white">Grid Layout</p>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, layout_type: 'list' })}
                      className={`p-3 border rounded-lg transition-colors ${
                        formData.layout_type === 'list'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Layout className="h-5 w-5 mx-auto mb-2 rotate-90" />
                      <p className="text-sm text-gray-900 dark:text-white">List Layout</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enabled Widgets
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                    {WIDGET_TYPES.map(widget => (
                      <label key={widget.id} className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={formData.enabled_widgets.includes(widget.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                enabled_widgets: [...formData.enabled_widgets, widget.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                enabled_widgets: formData.enabled_widgets.filter(w => w !== widget.id)
                              });
                            }
                          }}
                          className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{widget.name}</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{widget.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_shared}
                      onChange={(e) => setFormData({ ...formData, is_shared: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Share with team</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={createCustomization}
                  disabled={!formData.dashboard_name || formData.enabled_widgets.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Create Theme
                </button>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMode && selectedCustomization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Preview: {selectedCustomization.dashboard_name}
                </h2>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <Layout className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Dashboard preview with {selectedCustomization.color_scheme} theme
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    {Object.keys(selectedCustomization.widget_settings || {}).length} widgets configured
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}