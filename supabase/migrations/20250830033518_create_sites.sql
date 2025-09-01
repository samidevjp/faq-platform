-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON sites
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Enable insert access for authenticated users" ON sites
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update access for site owners" ON sites
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Enable delete access for site owners" ON sites
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
