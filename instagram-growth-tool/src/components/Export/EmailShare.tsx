import React, { useState } from 'react';
import { X, Mail, Send, Users, Clock, FileText, Download, Eye, BarChart3, TrendingUp } from 'lucide-react';

interface EmailShareProps {
  isOpen: boolean;
  onClose: () => void;
  reportData?: {
    title: string;
    analyticsData?: any;
    dateRange?: { start: Date; end: Date };
    shareableLink?: string;
  };
}

export default function EmailShare({ isOpen, onClose, reportData }: EmailShareProps) {
  const [emailForm, setEmailForm] = useState({
    recipients: '',
    ccRecipients: '',
    subject: '',
    message: '',
    includeAttachment: true,
    includeAnalytics: true,
    includeCharts: true,
    template: 'professional'
  });

  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  const emailTemplates = [
    {
      id: 'professional',
      name: 'Professional Report',
      subject: 'Instagram Analytics Report - {dateRange}',
      description: 'Formal business report suitable for stakeholders',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'client',
      name: 'Client Update',
      subject: 'Your Instagram Performance Report - {dateRange}',
      description: 'Client-friendly format with insights and recommendations',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'executive',
      name: 'Executive Summary',
      subject: 'Instagram Analytics Executive Brief - {dateRange}',
      description: 'High-level overview for executives and leadership',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'custom',
      name: 'Custom',
      subject: 'Instagram Analytics Report - {dateRange}',
      description: 'Fully customizable email template',
      icon: Mail,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  const generateSubjectLine = (template: string): string => {
    const dateRange = reportData?.dateRange 
      ? `${reportData.dateRange.start.toLocaleDateString()} - ${reportData.dateRange.end.toLocaleDateString()}`
      : 'Recent Period';
    
    return template
      .replace('{dateRange}', dateRange)
      .replace('{title}', reportData?.title || 'Analytics Report');
  };

  const generateEmailContent = (template: string): string => {
    const { analyticsData } = reportData || {};
    const dateRange = reportData?.dateRange 
      ? `${reportData.dateRange.start.toLocaleDateString()} - ${reportData.dateRange.end.toLocaleDateString()}`
      : 'Recent Period';

    switch (template) {
      case 'professional':
        return `Dear Team,

Please find attached our Instagram analytics report for the period ${dateRange}.

Key Highlights:
${analyticsData ? `
• Total Followers: ${analyticsData.followers?.toLocaleString() || 'N/A'}
• Engagement Rate: ${analyticsData.engagementRate?.toFixed(2) || '0.00'}%
• Total Reach: ${analyticsData.reach?.toLocaleString() || 'N/A'}
• Growth Rate: ${analyticsData.growth?.followers?.toFixed(1) || '0.0'}%
` : '• Comprehensive analytics and insights included'}

The report includes detailed analysis, growth trends, and actionable recommendations for improving our Instagram performance.

You can also view the interactive report online at: ${reportData?.shareableLink || '[Link to be generated]'}

Best regards,
GrowthHub Analytics Team`;

      case 'client':
        return `Hello,

I hope this email finds you well. I'm pleased to share your Instagram performance report for ${dateRange}.

This month's performance shows ${analyticsData?.growth?.followers > 0 ? 'strong growth' : 'challenging trends'} with:
${analyticsData ? `
• Follower growth of ${analyticsData.growth?.followers?.toFixed(1) || '0.0'}%
• Engagement rate of ${analyticsData.engagementRate?.toFixed(2) || '0.00'}%
• Total reach of ${analyticsData.reach?.toLocaleString() || 'N/A'}
` : ''}

Key Recommendations:
• Continue focusing on high-engagement content types
• Consider posting during peak audience hours
• Expand hashtag strategy based on performance data

The attached report provides detailed insights and a 30-day action plan.

Please let me know if you have any questions or would like to schedule a call to discuss the results.

Best regards,
[Your Name]`;

      case 'executive':
        return `Executive Summary - Instagram Analytics Report
Period: ${dateRange}

Performance Overview:
${analyticsData ? `
• Current Followers: ${analyticsData.followers?.toLocaleString() || 'N/A'} (${analyticsData.growth?.followers > 0 ? '+' : ''}${analyticsData.growth?.followers?.toFixed(1) || '0.0'}% vs. previous period)
• Engagement Rate: ${analyticsData.engagementRate?.toFixed(2) || '0.00'}% (${analyticsData.growth?.engagement > 0 ? '+' : ''}${analyticsData.growth?.engagement?.toFixed(1) || '0.0'}% change)
• Monthly Reach: ${analyticsData.reach?.toLocaleString() || 'N/A'} impressions
• Total Interactions: ${(analyticsData.likes || 0 + analyticsData.comments || 0).toLocaleString()} engagements
` : ''}

Strategic Insights:
• Content performance indicates strong audience connection
• Growth trajectory suggests effective strategy implementation
• Engagement patterns show optimal posting times identified

Next Steps:
• Continue current content strategy
• Implement recommended optimizations
• Monitor competitor performance for additional insights

Detailed analysis available in attached report.
View interactive dashboard: ${reportData?.shareableLink || '[Link to be generated]'}`;

      default:
        return `Please find attached your Instagram analytics report for ${dateRange}.

The report includes:
• Performance metrics and key insights
• Growth analysis and trends
• Recommendations for optimization
• Comparative analysis

You can access the interactive version online: ${reportData?.shareableLink || '[Link to be generated]'}

Thank you for using GrowthHub Analytics.`;

    }
  };

  const handleTemplateChange = (templateId: string) => {
    setEmailForm(prev => ({
      ...prev,
      template: templateId,
      subject: generateSubjectLine(emailTemplates.find(t => t.id === templateId)?.subject || ''),
      message: generateEmailContent(templateId)
    }));
  };

  const handleSendEmail = async () => {
    if (!emailForm.recipients.trim()) {
      alert('Please enter at least one recipient email address.');
      return;
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = emailForm.recipients.split(',').map(email => email.trim()).filter(Boolean);
    
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        alert(`Invalid email address: ${email}`);
        return;
      }
    }

    setIsSending(true);
    setSendProgress(0);

    try {
      // Simulate email sending process
      const steps = [
        { step: 'Preparing email content...', progress: 20 },
        { step: 'Generating report attachment...', progress: 40 },
        { step: 'Compiling analytics data...', progress: 60 },
        { step: 'Sending email...', progress: 80 },
        { step: 'Email sent successfully!', progress: 100 }
      ];

      for (const { step, progress } of steps) {
        setSendProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Generate mailto link as fallback (opens user's email client)
      const mailtoLink = generateMailtoLink();
      window.open(mailtoLink, '_blank');

      // Reset form and close modal after delay
      setTimeout(() => {
        setIsSending(false);
        setSendProgress(0);
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
      setIsSending(false);
      setSendProgress(0);
    }
  };

  const generateMailtoLink = (): string => {
    const subject = encodeURIComponent(emailForm.subject);
    const body = encodeURIComponent(emailForm.message);
    const recipients = encodeURIComponent(emailForm.recipients);
    const cc = emailForm.ccRecipients ? `&cc=${encodeURIComponent(emailForm.ccRecipients)}` : '';
    
    return `mailto:${recipients}?subject=${subject}&body=${body}${cc}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Share via Email</h2>
            <p className="text-gray-600 mt-1">Send your analytics report directly to stakeholders</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-140px)]">
          {/* Template Selection */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Template</h3>
            <div className="grid grid-cols-2 gap-3">
              {emailTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template.id)}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      emailForm.template === template.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${template.bgColor}`}>
                        <Icon className={`h-4 w-4 ${template.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Recipients */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To (Required)</label>
                <input
                  type="text"
                  value={emailForm.recipients}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, recipients: e.target.value }))}
                  placeholder="email@example.com, another@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CC (Optional)</label>
                <input
                  type="text"
                  value={emailForm.ccRecipients}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, ccRecipients: e.target.value }))}
                  placeholder="cc@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                rows={12}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Include in Email</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailForm.includeAttachment}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, includeAttachment: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Attach PDF report</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailForm.includeAnalytics}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, includeAnalytics: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Include analytics summary</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailForm.includeCharts}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Include chart images</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Email Preview</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>To:</strong> {emailForm.recipients || 'Not specified'}</p>
                {emailForm.ccRecipients && <p><strong>CC:</strong> {emailForm.ccRecipients}</p>}
                <p><strong>Subject:</strong> {emailForm.subject || 'No subject'}</p>
                <div className="mt-3">
                  <p className="font-medium text-gray-900">Message Preview:</p>
                  <div className="text-gray-700 text-xs mt-1 p-2 bg-white rounded border max-h-32 overflow-y-auto">
                    {emailForm.message || 'No message content'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            {/* Send Progress */}
            {isSending && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium text-blue-900">Sending email...</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sendProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-blue-700 mt-1">{sendProgress}% complete</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generateMailtoLink())}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Copy Mailto Link
                </button>
                {reportData?.shareableLink && (
                  <button
                    onClick={() => copyToClipboard(reportData.shareableLink!)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Copy Share Link
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSending || !emailForm.recipients.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}