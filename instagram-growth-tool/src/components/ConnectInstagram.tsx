// Connect Instagram Component
// Button to initiate OAuth flow for connecting Instagram Business Account

import { useState } from 'react';
import { Instagram, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useInstagramGraphAPI } from '@/hooks/useInstagramGraphAPI';

// TODO: Replace with your Facebook App ID from environment variables
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';

interface ConnectInstagramProps {
  onSuccess?: () => void;
  className?: string;
}

export default function ConnectInstagram({ onSuccess, className = '' }: ConnectInstagramProps) {
  const { initiateOAuth } = useInstagramGraphAPI();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleConnect = () => {
    if (!FACEBOOK_APP_ID) {
      alert('Facebook App ID not configured. Please set VITE_FACEBOOK_APP_ID in environment variables.');
      return;
    }

    initiateOAuth(FACEBOOK_APP_ID);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connect Button */}
      <button
        onClick={handleConnect}
        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Instagram className="w-5 h-5" />
        <span className="font-semibold">Connect Instagram Business Account</span>
      </button>

      {/* Help Button */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="text-sm text-gray-600 hover:text-gray-800 underline"
      >
        {showInstructions ? 'Hide' : 'Show'} Requirements
      </button>

      {/* Instructions Panel */}
      {showInstructions && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Before Connecting Your Instagram Account
          </h3>
          
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
              <div>
                <strong>Business or Creator Account Required:</strong>
                <p className="text-blue-700">Personal Instagram accounts cannot use this feature. Convert to Business or Creator in Instagram Settings → Account → Switch Account Type.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
              <div>
                <strong>Connected to Facebook Page:</strong>
                <p className="text-blue-700">Your Instagram Business account must be linked to a Facebook Page. Set this up in Instagram Settings → Account → Linked Accounts.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
              <div>
                <strong>Public Account:</strong>
                <p className="text-blue-700">Private accounts cannot access Instagram Graph API. Make sure your account is public.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
              <div>
                <strong>Optional: 100+ Followers for Full Insights:</strong>
                <p className="text-blue-700">Some audience demographics require at least 100 followers. Basic insights work with any follower count.</p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-600">
              After clicking "Connect", you'll be redirected to Facebook to authorize access. You can revoke access at any time from your Facebook settings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
