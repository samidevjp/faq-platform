-- Create site_categories table
CREATE TABLE IF NOT EXISTS site_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(site_id, name)
);

-- Add RLS policies
ALTER TABLE site_categories ENABLE ROW LEVEL SECURITY;

-- サイトオーナーのみが読み取り可能
CREATE POLICY "Enable read for site owners" ON site_categories
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM sites
            WHERE sites.id = site_categories.site_id
            AND sites.user_id = auth.uid()
        )
    );

-- サイトオーナーのみが追加可能
CREATE POLICY "Enable insert for site owners" ON site_categories
    FOR INSERT
    TO authenticated
    WITH CHECK (site_id IN (
        SELECT id FROM sites WHERE user_id = auth.uid()
    ));

-- サイトオーナーのみが削除可能
CREATE POLICY "Enable delete for site owners" ON site_categories
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM sites
            WHERE sites.id = site_categories.site_id
            AND sites.user_id = auth.uid()
        )
    );

-- サイトオーナーのみが更新可能
CREATE POLICY "Enable update for site owners" ON site_categories
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM sites
            WHERE sites.id = site_categories.site_id
            AND sites.user_id = auth.uid()
        )
    );