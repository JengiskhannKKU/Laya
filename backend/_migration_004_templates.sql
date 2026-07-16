-- Migration 004: Add templates and shop_templates tables for LAYA Template System

-- Templates table — stores template definitions
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'skirt')),
  base_price NUMERIC(10,2) NOT NULL,
  front_asset_url TEXT NOT NULL,
  back_asset_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shop templates junction table — links shops to templates they support
CREATE TABLE IF NOT EXISTS shop_templates (
  id SERIAL PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, template_id)
);

CREATE INDEX idx_shop_templates_shop_id ON shop_templates(shop_id);
CREATE INDEX idx_shop_templates_template_id ON shop_templates(template_id);
