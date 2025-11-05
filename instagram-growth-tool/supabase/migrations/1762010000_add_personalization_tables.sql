-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_context table
CREATE TABLE IF NOT EXISTS user_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_context
CREATE POLICY "Users can view their own context" ON user_context
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own context" ON user_context
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own context" ON user_context
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_context_user_id ON user_context(user_id);

-- Add personalization_fields column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'personalization_fields'
  ) THEN
    ALTER TABLE profiles ADD COLUMN personalization_fields JSONB DEFAULT '{}';
  END IF;
END $$;

-- Update profiles table policies if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    -- Grant users access to their own personalization fields
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'profiles' AND policyname = 'Users can update own personalization fields'
    ) THEN
      CREATE POLICY "Users can update own personalization fields" ON profiles
        FOR UPDATE USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
  END IF;
END $$;