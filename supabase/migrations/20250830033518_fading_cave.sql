/*
  # Initial FAQ Manager Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `faq_sites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text)
      - `description` (text, nullable)
      - `domain` (text, nullable)
      - `theme` (jsonb for design customization)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `faq_items`
      - `id` (uuid, primary key)
      - `site_id` (uuid, foreign key to faq_sites)
      - `question` (text)
      - `answer` (text)
      - `category` (text, nullable)
      - `order_index` (integer)
      - `is_published` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access their own sites and FAQ items
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create faq_sites table
CREATE TABLE IF NOT EXISTS faq_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  domain text,
  theme jsonb DEFAULT '{"primaryColor": "#3b82f6", "secondaryColor": "#64748b", "backgroundColor": "#ffffff", "textColor": "#1f2937", "fontFamily": "Inter", "borderRadius": "8px", "layout": "modern"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create faq_items table
CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES faq_sites(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- FAQ Sites policies
CREATE POLICY "Users can read own sites"
  ON faq_sites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sites"
  ON faq_sites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sites"
  ON faq_sites
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sites"
  ON faq_sites
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- FAQ Items policies
CREATE POLICY "Users can read FAQ items from own sites"
  ON faq_items
  FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM faq_sites WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create FAQ items for own sites"
  ON faq_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    site_id IN (
      SELECT id FROM faq_sites WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update FAQ items from own sites"
  ON faq_items
  FOR UPDATE
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM faq_sites WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete FAQ items from own sites"
  ON faq_items
  FOR DELETE
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM faq_sites WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faq_sites_user_id ON faq_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_faq_items_site_id ON faq_items(site_id);
CREATE INDEX IF NOT EXISTS idx_faq_items_category ON faq_items(category);
CREATE INDEX IF NOT EXISTS idx_faq_items_order ON faq_items(site_id, order_index);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_sites_updated_at
  BEFORE UPDATE ON faq_sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_items_updated_at
  BEFORE UPDATE ON faq_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();