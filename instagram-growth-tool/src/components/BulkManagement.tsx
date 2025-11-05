import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { List, CheckSquare, Trash2, Calendar, Edit, Copy, Archive, Tag } from 'lucide-react';

interface BulkManagementProps {
  accountId: string;
}

interface ContentItem {
  id: string;
  title: string;
  caption: string;
  content_type: string;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  tags?: string[];
}

type BulkAction = 'delete' | 'archive' | 'schedule' | 'change_status' | 'add_tags';

export default function BulkManagement({ accountId }: BulkManagementProps) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showBulkActionMenu, setShowBulkActionMenu] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<{ action: BulkAction; data?: any } | null>(null);

  const statuses = ['all', 'draft', 'scheduled', 'published', 'pending_approval'];

  useEffect(() => {
    fetchContent();
  }, [accountId, filterStatus]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('content_management')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      setContent(data || []);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === content.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(content.map(item => item.id)));
    }
  };

  const executeBulkAction = async (action: BulkAction) => {
    if (selectedIds.size === 0) {
      alert('Please select at least one item');
      return;
    }

    try {
      const selectedIdsArray = Array.from(selectedIds);

      switch (action) {
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) return;
          
          const { error: deleteError } = await supabase
            .from('content_management')
            .delete()
            .in('id', selectedIdsArray);

          if (deleteError) throw deleteError;

          // Log bulk operation
          await supabase.from('bulk_operations').insert({
            account_id: accountId,
            operation_type: 'delete',
            items_count: selectedIds.size,
            status: 'completed'
          });

          break;

        case 'change_status':
          const newStatus = prompt('Enter new status (draft/scheduled/published/pending_approval):');
          if (!newStatus) return;

          const { error: statusError } = await supabase
            .from('content_management')
            .update({ status: newStatus })
            .in('id', selectedIdsArray);

          if (statusError) throw statusError;

          await supabase.from('bulk_operations').insert({
            account_id: accountId,
            operation_type: 'status_change',
            items_count: selectedIds.size,
            status: 'completed'
          });

          break;

        case 'add_tags':
          const tagsInput = prompt('Enter tags (comma-separated):');
          if (!tagsInput) return;

          const tags = tagsInput.split(',').map(t => t.trim());

          for (const id of selectedIdsArray) {
            await supabase
              .from('content_tags')
              .insert(tags.map(tag => ({
                content_id: id,
                tag_name: tag
              })));
          }

          await supabase.from('bulk_operations').insert({
            account_id: accountId,
            operation_type: 'add_tags',
            items_count: selectedIds.size,
            status: 'completed'
          });

          break;

        default:
          alert('Action not yet implemented');
          return;
      }

      fetchContent();
      setShowBulkActionMenu(false);
    } catch (error) {
      console.error('Error executing bulk action:', error);
      alert('Failed to execute bulk action. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      scheduled: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', text: 'Scheduled' },
      draft: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', text: 'Draft' },
      published: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', text: 'Published' },
      pending_approval: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', text: 'Pending' }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Bulk Content Management</h2>
            <p className="text-indigo-100">Manage multiple posts at once efficiently</p>
          </div>
          <List className="w-16 h-16 opacity-30" />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            <div className="flex space-x-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => setShowBulkActionMenu(!showBulkActionMenu)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Bulk Actions
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions Menu */}
        {showBulkActionMenu && selectedIds.size > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button
                onClick={() => executeBulkAction('change_status')}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Change Status</span>
              </button>
              <button
                onClick={() => executeBulkAction('add_tags')}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                <Tag className="w-4 h-4" />
                <span className="text-sm">Add Tags</span>
              </button>
              <button
                onClick={() => executeBulkAction('delete')}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
              <button
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">Duplicate</span>
              </button>
              <button
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900/50 transition-colors"
              >
                <Archive className="w-4 h-4" />
                <span className="text-sm">Archive</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <CheckSquare className="w-6 h-6 mr-3 text-indigo-600" />
            Content Items ({content.length})
          </h3>
          <button
            onClick={toggleSelectAll}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {selectedIds.size === content.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {content.length === 0 ? (
          <div className="text-center py-12">
            <List className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No content found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Create content to manage it in bulk
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === content.length && content.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {content.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedIds.has(item.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.title || 'Untitled'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {item.caption || 'No caption'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium capitalize">
                        {item.content_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.scheduled_date
                        ? new Date(item.scheduled_date).toLocaleString()
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
        <div className="flex items-start space-x-4">
          <List className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Bulk Management Tips
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Select multiple items using checkboxes to perform actions on all at once</li>
              <li>• Use filters to find specific content quickly</li>
              <li>• Bulk operations are logged and can be reviewed later</li>
              <li>• Changes cannot be undone, so review selections carefully before taking action</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
