import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zkqpimisftlwehwixgev.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcXBpbWlzZnRsd2Vod2l4Z2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzMyMDAsImV4cCI6MjA3NzUwOTIwMH0.CMurJ9aym8YugrOLKbE8gB4AJ31j0ZtpoaMt9hqoM9Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
      };
      instagram_accounts: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          user_instagram_id: string | null;
          bio: string | null;
          followers_count: number;
          following_count: number;
          posts_count: number;
          profile_picture_url: string | null;
          is_verified: boolean;
          is_active: boolean;
          api_key: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      analytics_snapshots: {
        Row: {
          id: string;
          account_id: string;
          snapshot_date: string;
          followers_count: number;
          following_count: number;
          posts_count: number;
          engagement_rate: number;
          average_likes: number;
          average_comments: number;
          reach: number;
          impressions: number;
          profile_views: number;
          website_clicks: number;
          created_at: string;
        };
      };
      media_insights: {
        Row: {
          id: string;
          account_id: string;
          media_id: string;
          media_type: string | null;
          shortcode: string | null;
          caption: string | null;
          thumbnail_url: string | null;
          permalink: string | null;
          likes_count: number;
          comments_count: number;
          shares_count: number;
          saves_count: number;
          reach: number;
          impressions: number;
          engagement_rate: number;
          posted_at: string | null;
          created_at: string;
        };
      };
      hashtag_performance: {
        Row: {
          id: string;
          account_id: string;
          hashtag: string;
          usage_count: number;
          total_reach: number;
          total_impressions: number;
          average_engagement_rate: number;
          last_used_at: string | null;
          popularity_score: number;
          related_hashtags: string[] | null;
          created_at: string;
          updated_at: string;
        };
      };
      content_discoveries: {
        Row: {
          id: string;
          account_id: string;
          discovery_type: string;
          content_data: any;
          hashtags: string[] | null;
          location: string | null;
          engagement_score: number;
          is_saved: boolean;
          notes: string | null;
          discovered_at: string;
          created_at: string;
        };
      };
      growth_recommendations: {
        Row: {
          id: string;
          account_id: string;
          recommendation_type: string;
          title: string;
          description: string | null;
          priority: string;
          status: string;
          data: any;
          created_at: string;
          updated_at: string;
        };
      };
      competitors: {
        Row: {
          id: string;
          account_id: string;
          competitor_username: string;
          competitor_user_id: string | null;
          followers_count: number;
          engagement_rate: number;
          posts_count: number;
          last_analyzed_at: string;
          created_at: string;
        };
      };
    };
  };
};
