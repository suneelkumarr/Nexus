import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckSquare, Clock, CheckCircle, XCircle, MessageSquare, User, Calendar } from 'lucide-react';

interface ApprovalWorkflowProps {
  accountId: string;
}

interface ApprovalItem {
  id: string;
  content_id: string;
  workflow_stage: string;
  status: string;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  content?: {
    title: string;
    caption: string;
    content_type: string;
    scheduled_date: string | null;
  };
}

interface WorkflowStage {
  id: string;
  name: string;
  color: string;
  icon: any;
}

export default function ApprovalWorkflow({ accountId }: ApprovalWorkflowProps) {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const stages: WorkflowStage[] = [
    { id: 'all', name: 'All Stages', color: 'from-gray-500 to-gray-600', icon: CheckSquare },
    { id: 'draft_review', name: 'Draft Review', color: 'from-blue-500 to-cyan-600', icon: Clock },
    { id: 'content_review', name: 'Content Review', color: 'from-purple-500 to-pink-600', icon: MessageSquare },
    { id: 'final_approval', name: 'Final Approval', color: 'from-orange-500 to-red-600', icon: CheckCircle },
  ];

  useEffect(() => {
    fetchApprovals();
  }, [accountId, filterStage]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('content_approval_workflows')
        .select(`
          *,
          content:content_management(title, caption, content_type, scheduled_date)
        `)
        .eq('account_id', accountId)
        .order('submitted_at', { ascending: false });

      if (filterStage !== 'all') {
        query = query.eq('workflow_stage', filterStage);
      }

      const { data, error } = await query;

      if (error) throw error;

      setApprovals(data || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (approval: ApprovalItem) => {
    setSelectedApproval(approval);
    setReviewNotes(approval.reviewer_notes || '');
    setShowReviewModal(true);
  };

  const submitReview = async (decision: 'approved' | 'rejected') => {
    if (!selectedApproval) return;

    try {
      // Update approval workflow
      const { error: workflowError } = await supabase
        .from('content_approval_workflows')
        .update({
          status: decision,
          reviewer_notes: reviewNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedApproval.id);

      if (workflowError) throw workflowError;

      // Update content status
      if (decision === 'approved') {
        const { error: contentError } = await supabase
          .from('content_management')
          .update({ status: 'scheduled' })
          .eq('id', selectedApproval.content_id);

        if (contentError) throw contentError;
      } else {
        const { error: contentError } = await supabase
          .from('content_management')
          .update({ status: 'draft' })
          .eq('id', selectedApproval.content_id);

        if (contentError) throw contentError;
      }

      setShowReviewModal(false);
      setSelectedApproval(null);
      setReviewNotes('');
      fetchApprovals();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', text: 'Pending', icon: Clock },
      approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', text: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', text: 'Rejected', icon: XCircle }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        <span>{badge.text}</span>
      </span>
    );
  };

  const getStageInfo = (stage: string) => {
    return stages.find(s => s.id === stage) || stages[0];
  };

  const stats = {
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Content Approval Workflow</h2>
            <p className="text-pink-100">Review and approve content before publishing</p>
          </div>
          <CheckSquare className="w-16 h-16 opacity-30" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pending Review</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.approved}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.rejected}</div>
        </div>
      </div>

      {/* Stage Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <button
                key={stage.id}
                onClick={() => setFilterStage(stage.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  filterStage === stage.id
                    ? `bg-gradient-to-r ${stage.color} text-white shadow-lg`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{stage.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Approvals List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <CheckSquare className="w-6 h-6 mr-3 text-pink-600" />
            Approval Queue ({approvals.length})
          </h3>
        </div>

        {approvals.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No approvals in queue</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Content awaiting approval will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {approvals.map((approval) => {
              const stageInfo = getStageInfo(approval.workflow_stage);
              const StageIcon = stageInfo.icon;
              const content = Array.isArray(approval.content) ? approval.content[0] : approval.content;

              return (
                <div
                  key={approval.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {content?.title || 'Untitled Content'}
                        </h4>
                        {getStatusBadge(approval.status)}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {content?.caption || 'No caption provided'}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <StageIcon className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {stageInfo.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {content?.scheduled_date
                              ? new Date(content.scheduled_date).toLocaleDateString()
                              : 'Not scheduled'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {new Date(approval.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700 dark:text-gray-300 capitalize">
                            {content?.content_type || 'Post'}
                          </span>
                        </div>
                      </div>

                      {approval.reviewer_notes && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Reviewer Notes
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {approval.reviewer_notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {approval.status === 'pending' && (
                      <div className="ml-4">
                        <button
                          onClick={() => handleReview(approval)}
                          className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Review Content
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Title
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {Array.isArray(selectedApproval.content) 
                    ? selectedApproval.content[0]?.title 
                    : selectedApproval.content?.title || 'Untitled'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Caption
                </label>
                <p className="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {Array.isArray(selectedApproval.content)
                    ? selectedApproval.content[0]?.caption
                    : selectedApproval.content?.caption || 'No caption'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Add review notes (optional)"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => submitReview('rejected')}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => submitReview('approved')}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-700">
        <div className="flex items-start space-x-4">
          <CheckSquare className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Approval Workflow Stages
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• <strong>Draft Review:</strong> Initial review of content structure and quality</li>
              <li>• <strong>Content Review:</strong> Detailed review of caption, hashtags, and messaging</li>
              <li>• <strong>Final Approval:</strong> Final sign-off before scheduling for publication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
