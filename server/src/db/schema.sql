-- Foto Fachada Database Schema
-- ==============================
-- PostgreSQL schema for clients and brand analysis

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Clients Table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    expiration_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer ON clients(stripe_customer_id);

-- ─────────────────────────────────────────────────────────────
-- Brand Analysis Table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    style VARCHAR(100),
    target_audience TEXT,
    description TEXT,
    niche VARCHAR(100),
    analysis_data JSONB,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for client lookups
CREATE INDEX IF NOT EXISTS idx_brand_analysis_client ON brand_analysis(client_id);
CREATE INDEX IF NOT EXISTS idx_brand_analysis_business_type ON brand_analysis(business_type);

-- ─────────────────────────────────────────────────────────────
-- Trigger for updated_at
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_analysis_updated_at
    BEFORE UPDATE ON brand_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────
-- Campaigns Table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    brand_analysis_id UUID REFERENCES brand_analysis(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    deploy_status VARCHAR(50) DEFAULT 'pending' CHECK (deploy_status IN ('pending', 'deployed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_client ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created ON campaigns(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- Landings Table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS landings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    html_content TEXT,
    style_config JSONB,
    seo_meta JSONB,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    views INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for landings
CREATE INDEX IF NOT EXISTS idx_landings_campaign ON landings(campaign_id);
CREATE INDEX IF NOT EXISTS idx_landings_slug ON landings(slug);
CREATE INDEX IF NOT EXISTS idx_landings_status ON landings(status);

-- ─────────────────────────────────────────────────────────────
-- Triggers for new tables
-- ─────────────────────────────────────────────────────────────
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landings_updated_at
    BEFORE UPDATE ON landings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- Marketing Proposals Table (Dynamic Configurator)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketing_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    strategy_id TEXT NOT NULL,
    title TEXT,
    description TEXT,
    visual_mechanic TEXT,
    ui_config JSONB,
    code_template TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'saved', 'implemented')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for proposals
CREATE INDEX IF NOT EXISTS idx_proposals_campaign ON marketing_proposals(campaign_id);

    EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────
-- Analytics Events Table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_id UUID REFERENCES landings(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'click', 'scan', 'conversion')),
    device_type VARCHAR(50) DEFAULT 'unknown',
    source VARCHAR(50) DEFAULT 'direct',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_landing ON analytics_events(landing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
