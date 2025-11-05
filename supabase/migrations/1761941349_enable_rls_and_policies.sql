-- Migration: enable_rls_and_policies
-- Created at: 1761941349

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- Instagram accounts policies
CREATE POLICY "Users can view own accounts"
  ON instagram_accounts FOR SELECT
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can insert own accounts"
  ON instagram_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own accounts"
  ON instagram_accounts FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can delete own accounts"
  ON instagram_accounts FOR DELETE
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- Analytics snapshots policies
CREATE POLICY "Users can view analytics for own accounts"
  ON analytics_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = analytics_snapshots.account_id
      AND instagram_accounts.user_id = auth.uid()
    ) OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Allow insert analytics"
  ON analytics_snapshots FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Media insights policies
CREATE POLICY "Users can view media insights for own accounts"
  ON media_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = media_insights.account_id
      AND instagram_accounts.user_id = auth.uid()
    ) OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Allow insert media insights"
  ON media_insights FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Hashtag performance policies
CREATE POLICY "Users can view hashtags for own accounts"
  ON hashtag_performance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = hashtag_performance.account_id
      AND instagram_accounts.user_id = auth.uid()
    ) OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Allow insert hashtag performance"
  ON hashtag_performance FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Allow update hashtag performance"
  ON hashtag_performance FOR UPDATE
  USING (auth.role() IN ('anon', 'service_role'));

-- Content discoveries policies
CREATE POLICY "Users can view discoveries for own accounts"
  ON content_discoveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = content_discoveries.account_id
      AND instagram_accounts.user_id = auth.uid()
    ) OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Allow insert discoveries"
  ON content_discoveries FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Allow update discoveries"
  ON content_discoveries FOR UPDATE
  USING (auth.role() IN ('anon', 'service_role'));

-- Growth recommendations policies
CREATE POLICY "Users can view recommendations for own accounts"
  ON growth_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = growth_recommendations.account_id
      AND instagram_accounts.user_id = auth.uid()
    ) OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Allow insert recommendations"
  ON growth_recommendations FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Allow update recommendations"
  ON growth_recommendations FOR UPDATE
  USING (auth.role() IN ('anon', 'service_role'));

-- Competitors policies
CREATE POLICY "Users can view competitors for own accounts"
  ON competitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = competitors.account_id
      AND instagram_accounts.user_id = auth.uid()
    ) OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Allow insert competitors"
  ON competitors FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Allow delete competitors"
  ON competitors FOR DELETE
  USING (auth.role() IN ('anon', 'service_role'));;