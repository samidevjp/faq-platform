-- Drop existing policies
DROP POLICY IF EXISTS "Enable read for site owners" ON site_categories;
DROP POLICY IF EXISTS "Enable insert for site owners" ON site_categories;
DROP POLICY IF EXISTS "Enable delete for site owners" ON site_categories;
DROP POLICY IF EXISTS "Enable update for site owners" ON site_categories;

-- サイトオーナーのみが読み取り可能
CREATE POLICY "Enable read for site owners" ON site_categories
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM faq_sites
            WHERE faq_sites.id = site_categories.site_id
            AND faq_sites.user_id = auth.uid()
        )
    );

-- サイトオーナーのみが追加可能
CREATE POLICY "Enable insert for site owners" ON site_categories
    FOR INSERT
    TO authenticated
    WITH CHECK (site_id IN (
        SELECT id FROM faq_sites WHERE user_id = auth.uid()
    ));

-- サイトオーナーのみが削除可能
CREATE POLICY "Enable delete for site owners" ON site_categories
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM faq_sites
            WHERE faq_sites.id = site_categories.site_id
            AND faq_sites.user_id = auth.uid()
        )
    );

-- サイトオーナーのみが更新可能
CREATE POLICY "Enable update for site owners" ON site_categories
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM faq_sites
            WHERE faq_sites.id = site_categories.site_id
            AND faq_sites.user_id = auth.uid()
        )
    );

-- 外部キー制約も更新
ALTER TABLE site_categories DROP CONSTRAINT site_categories_site_id_fkey;
ALTER TABLE site_categories ADD CONSTRAINT site_categories_site_id_fkey 
    FOREIGN KEY (site_id) REFERENCES faq_sites(id) ON DELETE CASCADE;
