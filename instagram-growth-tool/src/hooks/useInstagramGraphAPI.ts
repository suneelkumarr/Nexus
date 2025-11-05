// Instagram Graph API Hook
// Provides methods to interact with Instagram Graph API via Supabase Edge Functions

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface InstagramAccount {
  id: string;
  user_id: string;
  instagram_user_id: string;
  username: string;
  name: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  biography: string;
  website: string;
  is_verified: boolean;
  account_type: string;
  connected_at: string;
  last_synced_at: string;
  sync_status: string;
}

export interface InstagramProfile {
  id: string;
  username: string;
  name: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  biography: string;
  website: string;
}

export interface InstagramMediaPost {
  id: string;
  caption: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  username: string;
  insights: {
    engagement?: number;
    impressions?: number;
    reach?: number;
    saved?: number;
    video_views?: number;
  };
}

export interface InstagramInsights {
  account_insights: {
    impressions: number;
    reach: number;
    profile_views: number;
    website_clicks: number;
    email_contacts: number;
    phone_call_clicks: number;
    get_directions_clicks: number;
    text_message_clicks: number;
  };
  audience_demographics: {
    audience_city?: Record<string, number>;
    audience_country?: Record<string, number>;
    audience_gender_age?: Record<string, number>;
    audience_locale?: Record<string, number>;
  };
  period: string;
  timestamp: string;
}

export const useInstagramGraphAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initiate OAuth flow to connect Instagram Business Account
   * @param facebookAppId - Facebook App ID from environment
   */
  const initiateOAuth = (facebookAppId: string) => {
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const scope = 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement';
    
    const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
      `client_id=${facebookAppId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scope}&` +
      `response_type=code`;
    
    window.location.href = oauthUrl;
  };

  /**
   * Handle OAuth callback and exchange code for access token
   * @param code - Authorization code from OAuth redirect
   */
  const handleOAuthCallback = async (code: string): Promise<InstagramAccount> => {
    setLoading(true);
    setError(null);

    try {
      const redirectUri = `${window.location.origin}/oauth/callback`;
      
      const { data, error: functionError } = await supabase.functions.invoke(
        'instagram-oauth-callback',
        {
          body: {
            code,
            redirectUri
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to connect Instagram account');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to connect Instagram account');
      }

      return data.account;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect Instagram account';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch Instagram profile data
   * @param instagramAccountId - Instagram Business Account ID
   * @param forceRefresh - Force fresh data (bypass cache)
   */
  const fetchProfile = async (
    instagramAccountId: string,
    forceRefresh = false
  ): Promise<{ data: InstagramProfile; cached: boolean; fetchedAt: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'instagram-fetch-profile-graph',
        {
          body: {
            instagramAccountId,
            forceRefresh
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to fetch profile data');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch profile data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch Instagram media posts with insights
   * @param instagramAccountId - Instagram Business Account ID
   * @param limit - Number of posts to fetch (default: 25)
   * @param forceRefresh - Force fresh data (bypass cache)
   */
  const fetchMedia = async (
    instagramAccountId: string,
    limit = 25,
    forceRefresh = false
  ): Promise<{
    data: { posts: InstagramMediaPost[]; count: number };
    cached: boolean;
    fetchedAt: string;
  }> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'instagram-fetch-media-graph',
        {
          body: {
            instagramAccountId,
            limit,
            forceRefresh
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to fetch media data');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch media data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch Instagram account insights
   * @param instagramAccountId - Instagram Business Account ID
   * @param period - Insights period: 'day', 'week', or 'days_28'
   * @param forceRefresh - Force fresh data (bypass cache)
   */
  const fetchInsights = async (
    instagramAccountId: string,
    period: 'day' | 'week' | 'days_28' = 'day',
    forceRefresh = false
  ): Promise<{ data: InstagramInsights; cached: boolean; fetchedAt: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'instagram-fetch-insights-graph',
        {
          body: {
            instagramAccountId,
            period,
            forceRefresh
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to fetch insights data');
      }

      if (data?.error) {
        // Handle special case: insufficient followers
        if (data.error === 'Insufficient followers') {
          return {
            data: data.data,
            cached: false,
            fetchedAt: new Date().toISOString()
          };
        }
        throw new Error(data.error);
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch insights data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh access token for Instagram account
   * @param instagramAccountId - Instagram Business Account ID (optional)
   */
  const refreshToken = async (instagramAccountId?: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'instagram-token-refresh',
        {
          body: {
            instagramAccountId
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to refresh access token');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to refresh access token');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh access token';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get connected Instagram accounts from database
   */
  const getConnectedAccounts = async (): Promise<InstagramAccount[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('instagram_business_accounts')
        .select('*')
        .order('connected_at', { ascending: false });

      if (dbError) {
        throw dbError;
      }

      return data || [];
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch connected accounts';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disconnect Instagram account
   * @param instagramAccountId - Instagram Business Account ID
   */
  const disconnectAccount = async (instagramAccountId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Delete from instagram_business_accounts (cascade will delete tokens)
      const { error: deleteError } = await supabase
        .from('instagram_business_accounts')
        .delete()
        .eq('instagram_user_id', instagramAccountId);

      if (deleteError) {
        throw deleteError;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to disconnect account';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    initiateOAuth,
    handleOAuthCallback,
    fetchProfile,
    fetchMedia,
    fetchInsights,
    refreshToken,
    getConnectedAccounts,
    disconnectAccount,
    loading,
    error
  };
};
