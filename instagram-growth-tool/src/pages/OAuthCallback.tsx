// OAuth Callback Handler
// Handles the OAuth redirect from Facebook and exchanges authorization code for access token

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInstagramGraphAPI } from '@/hooks/useInstagramGraphAPI';
import { Instagram, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useInstagramGraphAPI();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your Instagram account...');
  const [accountData, setAccountData] = useState<any>(null);

  useEffect(() => {
    const processCallback = async () => {
      // Check for error in URL
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setMessage(errorDescription || 'Failed to authorize Instagram access');
        setTimeout(() => {
          navigate('/dashboard?error=oauth_failed');
        }, 3000);
        return;
      }

      // Get authorization code
      const code = searchParams.get('code');

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        setTimeout(() => {
          navigate('/dashboard?error=no_code');
        }, 3000);
        return;
      }

      try {
        // Exchange code for access token
        setMessage('Exchanging authorization code for access token...');
        const account = await handleOAuthCallback(code);

        setStatus('success');
        setMessage('Instagram account connected successfully!');
        setAccountData(account);

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard?success=instagram_connected');
        }, 2000);
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setMessage(err.message || 'Failed to connect Instagram account');

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard?error=connection_failed');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, handleOAuthCallback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          {status === 'loading' && (
            <div className="relative">
              <Instagram className="w-16 h-16 text-purple-600" />
              <Loader className="w-8 h-8 text-pink-600 animate-spin absolute -bottom-2 -right-2" />
            </div>
          )}
          {status === 'success' && (
            <div className="relative">
              <Instagram className="w-16 h-16 text-purple-600" />
              <CheckCircle className="w-8 h-8 text-green-600 absolute -bottom-2 -right-2" />
            </div>
          )}
          {status === 'error' && (
            <div className="relative">
              <Instagram className="w-16 h-16 text-gray-400" />
              <XCircle className="w-8 h-8 text-red-600 absolute -bottom-2 -right-2" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900">
          {status === 'loading' && 'Connecting Instagram'}
          {status === 'success' && 'Connected Successfully!'}
          {status === 'error' && 'Connection Failed'}
        </h1>

        {/* Message */}
        <p className="text-center text-gray-600">
          {message}
        </p>

        {/* Account Info (on success) */}
        {status === 'success' && accountData && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-3">
              {accountData.profile_picture_url && (
                <img
                  src={accountData.profile_picture_url}
                  alt={accountData.username}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">@{accountData.username}</p>
                <p className="text-sm text-gray-600">{accountData.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-purple-200">
              <div>
                <p className="text-sm font-semibold text-gray-900">{accountData.followers_count?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-600">Followers</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{accountData.follows_count?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-600">Following</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{accountData.media_count?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-600">Posts</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status !== 'loading' ? 'bg-gray-300' : 'bg-purple-600 animate-pulse'}`}></div>
          <div className={`w-2 h-2 rounded-full ${status === 'loading' ? 'bg-gray-300' : status === 'success' ? 'bg-green-600' : 'bg-red-600'}`}></div>
        </div>

        {/* Redirect Message */}
        <p className="text-xs text-center text-gray-500">
          {status === 'loading' && 'Please wait...'}
          {status === 'success' && 'Redirecting to dashboard...'}
          {status === 'error' && 'Redirecting back...'}
        </p>

        {/* Manual Navigation (for errors) */}
        {status === 'error' && (
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
