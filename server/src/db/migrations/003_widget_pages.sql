-- Widget Pages Table
-- Individual pages for each widget (ruleta, oferta, muro, etc.)

CREATE TABLE IF NOT EXISTS widget_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES marketing_proposals(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    
    -- Widget info
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    widget_id VARCHAR(100) NOT NULL, -- e.g. 'christmas-wheel', 'flash-offer'
    widget_type VARCHAR(50), -- 'gamification', 'promo', 'social', etc.
    
    -- Content
    html_content TEXT NOT NULL,
    
    -- Metadata
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    views INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_widget_pages_slug ON widget_pages(slug);
CREATE INDEX IF NOT EXISTS idx_widget_pages_proposal ON widget_pages(proposal_id);
CREATE INDEX IF NOT EXISTS idx_widget_pages_campaign ON widget_pages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_widget_pages_status ON widget_pages(status);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_widget_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF NEW.status = 'published' AND OLD.status != 'published' THEN
        NEW.published_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_widget_pages_timestamp
    BEFORE UPDATE ON widget_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_widget_pages_updated_at();

-- Comments
COMMENT ON TABLE widget_pages IS 'Individual functional pages for each marketing widget';
COMMENT ON COLUMN widget_pages.slug IS 'URL slug format: /w/brand-name/widget-name';
COMMENT ON COLUMN widget_pages.widget_id IS 'Unique identifier from AI generation (e.g. fortune-wheel)';
COMMENT ON COLUMN widget_pages.html_content IS 'Complete standalone HTML page with widget functionality';
