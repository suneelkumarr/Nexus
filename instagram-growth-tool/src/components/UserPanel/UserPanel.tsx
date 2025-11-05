import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { 
  X, Download, Share2, Palette, Sparkles, HelpCircle, 
  Plus, TrendingUp, Crown, LogOut, AlertCircle, User,
  Building, Settings, ExternalLink, Copy
} from 'lucide-react';
import IconWrapper from '@/components/UI/IconWrapper';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import HoverableCard from '@/components/UI/HoverableCard';

interface UserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  showPersonalizationPanel: boolean;
  setShowPersonalizationPanel: (show: boolean) => void;
  showFeatureDiscovery: boolean;
  setShowFeatureDiscovery: (show: boolean) => void;
  showHelpTooltips: boolean;
  setShowHelpTooltips: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  setShowLinkShare: (show: boolean) => void;
  setShowUpgradeModal: (show: boolean) => void;
  signOut: () => void;
  profileData: any;
  profileLoading: boolean;
  profileError: boolean | null;
  currentPlan: any;
  subscriptionLoading: boolean;
  usageAlerts: string[];
  loadProfileData: () => void;
}

export default function UserPanel({
  isOpen,
  onClose,
  showPersonalizationPanel,
  setShowPersonalizationPanel,
  showFeatureDiscovery,
  setShowFeatureDiscovery,
  showHelpTooltips,
  setShowHelpTooltips,
  setShowExportModal,
  setShowLinkShare,
  setShowUpgradeModal,
  signOut,
  profileData,
  profileLoading,
  profileError,
  currentPlan,
  subscriptionLoading,
  usageAlerts,
  loadProfileData
}: UserPanelProps) {
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  if (!isOpen) return null;

  const handleSignOut = () => {
    if (showSignOutConfirm) {
      signOut();
      setShowSignOutConfirm(false);
      onClose();
    } else {
      setShowSignOutConfirm(true);
      setTimeout(() => setShowSignOutConfirm(false), 3000);
    }
  };

  const handleExportClick = () => {
    setShowExportModal(true);
    onClose();
  };

  const handleShareClick = () => {
    setShowLinkShare(true);
    onClose();
  };

  const handleAddAccount = () => {
    // TODO: Navigate to accounts section or open add account modal
    onClose();
    // This would typically navigate to the accounts tab or open an add account modal
  };

  const currentUserName = profileData?.full_name || 'User';
  const currentPlanName = currentPlan?.plan_type === 'free' ? 'Free Plan' : (currentPlan?.plan_name || 'No Plan');
  const isProPlan = currentPlan?.plan_type !== 'free' && currentPlan?.plan_type;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* User Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                {profileLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <span className="text-white font-semibold text-lg">
                    {currentUserName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentUserName}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentPlanName}
                  </span>
                  {isProPlan && (
                    <Crown className="w-4 h-4 text-purple-500" />
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Export & Share Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                <Download className="w-4 h-4" />
                Export & Share
              </div>
              <div className="grid grid-cols-2 gap-3">
                <HoverableCard
                  onClick={handleExportClick}
                  className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Download className="w-4 h-4" />
                    <span className="font-medium text-sm">Export Report</span>
                  </div>
                </HoverableCard>
                <HoverableCard
                  onClick={handleShareClick}
                  className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Share2 className="w-4 h-4" />
                    <span className="font-medium text-sm">Share Dashboard</span>
                  </div>
                </HoverableCard>
              </div>
            </div>

            {/* Settings Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                <Settings className="w-4 h-4" />
                Settings
              </div>
              <div className="space-y-2">
                <HoverableCard
                  onClick={() => setShowPersonalizationPanel(true)}
                  className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Palette className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Theme & Appearance
                    </span>
                    <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                  </div>
                </HoverableCard>
                
                <HoverableCard
                  onClick={() => setShowFeatureDiscovery(!showFeatureDiscovery)}
                  className={cn(
                    "w-full p-3 transition-colors",
                    showFeatureDiscovery
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className={cn(
                      "w-4 h-4",
                      showFeatureDiscovery ? "text-green-600" : "text-gray-500"
                    )} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {showFeatureDiscovery ? 'Hide Features' : 'Show Features'}
                    </span>
                  </div>
                </HoverableCard>

                <HoverableCard
                  onClick={() => setShowHelpTooltips(!showHelpTooltips)}
                  className={cn(
                    "w-full p-3 transition-colors",
                    showHelpTooltips
                      ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className={cn(
                      "w-4 h-4",
                      showHelpTooltips ? "text-purple-600" : "text-gray-500"
                    )} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {showHelpTooltips ? 'Hide Tips' : 'Show Tips'}
                    </span>
                  </div>
                </HoverableCard>
              </div>
            </div>

            {/* Account Usage Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                <User className="w-4 h-4" />
                Account Usage
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    0 of 5 connected accounts
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    0% used
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: '0%' }}
                  />
                </div>
                
                <HoverableCard
                  onClick={handleAddAccount}
                  className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="font-medium text-sm">Add Account</span>
                  </div>
                </HoverableCard>
              </div>
            </div>

            {/* Upgrade Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                <Crown className="w-4 h-4 text-purple-500" />
                Upgrade to Pro
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Unlock unlimited accounts, advanced analytics, and team features.
                </p>
                <HoverableCard
                  onClick={() => {
                    setShowUpgradeModal(true);
                    onClose();
                  }}
                  className="w-full p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold text-sm">Upgrade Now</span>
                  </div>
                </HoverableCard>
              </div>
            </div>

            {/* Usage Alerts */}
            {usageAlerts.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300 uppercase tracking-wide">
                    Usage Alert
                  </span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {usageAlerts[0]}
                </p>
              </div>
            )}
          </div>

          {/* Sign Out Section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <HoverableCard
              onClick={handleSignOut}
              className={cn(
                "w-full p-4 border-2 transition-all duration-200",
                showSignOutConfirm
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <LogOut className={cn(
                  "w-4 h-4",
                  showSignOutConfirm ? "text-red-600" : "text-red-500"
                )} />
                <span className={cn(
                  "font-medium text-sm",
                  showSignOutConfirm ? "text-red-700 dark:text-red-300" : "text-red-600"
                )}>
                  {showSignOutConfirm ? 'Click again to confirm sign out' : 'Sign Out'}
                </span>
              </div>
            </HoverableCard>
            {showSignOutConfirm && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Click "Sign Out" again to confirm
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
