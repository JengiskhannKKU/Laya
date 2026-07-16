-- Migration 016: Add generated_patterns and weaving_requests tables
--
-- ทั้งสองตารางถูกอ้างอิงจริงใน backend/src/routes/patterns.ts และ
-- backend/src/routes/weaving-requests.ts มาตั้งแต่แรก แต่ไม่เคยมี migration
-- สร้างตารางจริงเลยในโปรเจกต์นี้ — ทำให้ POST /api/patterns/generate และ
-- /api/weaving-requests/* พังด้วย "relation ... does not exist" ทุกครั้งที่เรียกจริง

-- generated_patterns — ลายผ้าที่ AI สร้างให้ผู้ใช้จาก /custom (Guided/Prompt Custom)
CREATE TABLE IF NOT EXISTS generated_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  style TEXT,
  color_palette JSONB NOT NULL DEFAULT '[]'::jsonb,
  inspiration JSONB NOT NULL DEFAULT '[]'::jsonb,
  advanced_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  preview_image_url TEXT,
  full_image_url TEXT NOT NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_mock BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_patterns_user_id ON generated_patterns(user_id);

-- weaving_requests — คำขอสั่งทออย่างไม่เป็นทางการ (ยังไม่ชำระเงิน) จับคู่ลูกค้ากับช่างทอ
CREATE TABLE IF NOT EXISTS weaving_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES generated_patterns(id) ON DELETE SET NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weaving_requests_user_id ON weaving_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_weaving_requests_shop_id ON weaving_requests(shop_id);
