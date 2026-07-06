-- =============================================================
--  LAYA Platform — PostgreSQL Database Schema
--  Version: 1.0  |  June 2025
--  Services: สั่งตัด (มีผ้าเอง), สั่งตัด (ผ้าร้าน), สั่งทอผ้า
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- optional: for map/location features


-- =============================================================
--  ENUMS
-- =============================================================

CREATE TYPE user_role AS ENUM ('customer', 'shop', 'admin');

CREATE TYPE shop_service AS ENUM ('cut_own_fabric', 'cut_shop_fabric', 'weave', 'all');

CREATE TYPE order_status AS ENUM (
  'draft',
  'pending_confirm',
  'confirmed',
  'in_progress',
  'ready',
  'shipped',
  'delivered',
  'cancelled'
);

CREATE TYPE weaving_order_status AS ENUM (
  'pending_confirm',
  'confirmed',
  'weaving',
  'ready',
  'shipped',
  'delivered',
  'cancelled'
);

CREATE TYPE fabric_source AS ENUM ('own', 'shop');

CREATE TYPE shipment_direction AS ENUM ('customer_to_shop', 'shop_to_customer');

CREATE TYPE shipment_status AS ENUM ('pending', 'in_transit', 'delivered', 'failed');

CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

CREATE TYPE payment_method_type AS ENUM ('bank_transfer', 'promptpay', 'credit_card', 'cash_on_delivery');

CREATE TYPE notification_type AS ENUM ('order_update', 'shop_confirm', 'shipment_update', 'system');

CREATE TYPE brief_neck_type AS ENUM ('round', 'v_neck', 'collar', 'boat', 'halter', 'other');

CREATE TYPE brief_sleeve_type AS ENUM ('sleeveless', 'short', 'elbow', 'long', 'puff', 'other');

CREATE TYPE brief_style AS ENUM ('casual', 'formal', 'ceremony', 'traditional', 'contemporary', 'other');

CREATE TYPE brief_garment_type AS ENUM ('top', 'skirt', 'dress', 'pants', 'jacket', 'set', 'other');

CREATE TYPE shop_status AS ENUM ('pending', 'approved', 'suspended');

CREATE TYPE post_type AS ENUM ('showcase', 'story', 'info');


-- =============================================================
--  1. USERS & AUTH
-- =============================================================

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(20),
  password_hash VARCHAR(255),                          -- null if social login
  role          user_role NOT NULL DEFAULT 'customer',
  display_name  VARCHAR(100),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social login providers (Google, Facebook, Line, etc.)
CREATE TABLE user_social_accounts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    VARCHAR(50) NOT NULL,                    -- 'google', 'facebook', 'line'
  provider_id VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);


-- =============================================================
--  2. CUSTOMER PROFILES & MEASUREMENTS
-- =============================================================

CREATE TABLE customer_profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name   VARCHAR(100),
  last_name    VARCHAR(100),
  birth_date   DATE,
  address      TEXT,
  province     VARCHAR(100),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE body_measurements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label           VARCHAR(100) NOT NULL DEFAULT 'ขนาดตัวหลัก',  -- ชื่อชุดวัด (ลูกค้าอาจมีหลายชุด)
  height_cm       NUMERIC(5,1),
  weight_kg       NUMERIC(5,1),
  chest_cm        NUMERIC(5,1),
  waist_cm        NUMERIC(5,1),
  hip_cm          NUMERIC(5,1),
  shoulder_cm     NUMERIC(5,1),
  arm_length_cm   NUMERIC(5,1),
  dress_length_cm NUMERIC(5,1),
  notes           TEXT,
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,          -- ภาพที่ใช้งานอยู่
  metadata      JSONB,                                  -- width, height, pose detection data
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_body_measurements_user ON body_measurements(user_id);
CREATE INDEX idx_customer_photos_user ON customer_photos(user_id);


-- =============================================================
--  3. SHOPS (ร้านค้า / ชุมชนทอผ้า)
-- =============================================================

CREATE TABLE shops (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  province          VARCHAR(100),
  address           TEXT,
  lat               NUMERIC(10,7),
  lng               NUMERIC(10,7),
  phone             VARCHAR(20),
  line_id           VARCHAR(100),
  profile_image_url TEXT,
  cover_image_url   TEXT,
  status            shop_status NOT NULL DEFAULT 'pending',
  approved_at       TIMESTAMPTZ,
  rating            NUMERIC(3,2) DEFAULT 0,             -- avg rating 0.00–5.00
  review_count      INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- บริการที่ร้านรับ (ตัด, ทอ, หรือทั้งคู่)
CREATE TABLE shop_services (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id      UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  service_type shop_service NOT NULL,
  UNIQUE (shop_id, service_type)
);

-- ความเชี่ยวชาญลายผ้าของร้าน (เช่น ลายสกลนคร, ลายขิด)
CREATE TABLE shop_specialties (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  pattern_tag VARCHAR(100) NOT NULL,                    -- 'ลายสกลนคร', 'ผ้าขิด', 'ผ้ามัดหมี่'
  UNIQUE (shop_id, pattern_tag)
);

CREATE INDEX idx_shops_province ON shops(province);
CREATE INDEX idx_shops_status ON shops(status);
CREATE INDEX idx_shops_rating ON shops(rating DESC);


-- =============================================================
--  4. FABRIC CATALOG
-- =============================================================

-- ลายผ้าพื้นฐานในระบบ (สำหรับสั่งทอ)
CREATE TABLE weave_patterns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  origin_province VARCHAR(100),
  thumbnail_url   TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- โทนสีต่าง ๆ ของแต่ละลาย
CREATE TABLE weave_color_variants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_id      UUID NOT NULL REFERENCES weave_patterns(id) ON DELETE CASCADE,
  color_name      VARCHAR(100) NOT NULL,                -- 'ครามเข้ม', 'แดงอิฐ'
  color_hex       VARCHAR(7),                           -- '#1a2b3c' approximate
  preview_url     TEXT NOT NULL,
  is_natural_dye  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ผ้าสต็อกของร้าน
CREATE TABLE shop_fabrics (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id          UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  pattern_tag      VARCHAR(100),                        -- ลาย (free text or ref)
  color_name       VARCHAR(100),
  color_hex        VARCHAR(7),
  width_cm         NUMERIC(6,1),
  price_per_meter  NUMERIC(10,2) NOT NULL,
  stock_meters     NUMERIC(8,2) NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shop_fabric_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_id  UUID NOT NULL REFERENCES shop_fabrics(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- Tags สำหรับ filter ผ้าของร้าน
CREATE TABLE fabric_tags (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_id UUID NOT NULL REFERENCES shop_fabrics(id) ON DELETE CASCADE,
  tag       VARCHAR(100) NOT NULL,
  UNIQUE (fabric_id, tag)
);

CREATE INDEX idx_shop_fabrics_shop ON shop_fabrics(shop_id);
CREATE INDEX idx_shop_fabrics_active ON shop_fabrics(is_active);
CREATE INDEX idx_weave_color_variants_pattern ON weave_color_variants(pattern_id);


-- =============================================================
--  5. FABRIC UPLOADS (ผ้าของลูกค้า)
-- =============================================================

CREATE TABLE fabric_uploads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  thumbnail_url TEXT,
  name          VARCHAR(255),                           -- ชื่อที่ลูกค้าตั้ง
  color_data    JSONB,                                  -- extracted dominant colors
  texture_data  JSONB,                                  -- AI texture metadata
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fabric_uploads_user ON fabric_uploads(user_id);


-- =============================================================
--  6. DESIGN SYSTEM (รูปทรงและการบรีฟ)
-- =============================================================

-- รูปทรงพื้นฐานที่ระบบมี
CREATE TABLE base_styles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  garment_type  brief_garment_type NOT NULL,
  preview_url   TEXT,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- การบรีฟรายละเอียดทรงจากลูกค้า
CREATE TABLE design_briefs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  base_style_id  UUID REFERENCES base_styles(id),
  garment_type   brief_garment_type NOT NULL,
  neck_type      brief_neck_type,
  sleeve_type    brief_sleeve_type,
  style          brief_style,
  length_cm      NUMERIC(5,1),                          -- ความยาวชุด/กระโปรง
  occasion       VARCHAR(255),                          -- ประเภทงาน (งานแต่ง, ออกงาน, ประจำวัน)
  additional_notes TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ตัวเลือกเพิ่มเติมแบบ key-value (extensible options)
CREATE TABLE design_brief_options (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id  UUID NOT NULL REFERENCES design_briefs(id) ON DELETE CASCADE,
  option_key   VARCHAR(100) NOT NULL,                   -- 'waist_detail', 'hem_style', 'lining'
  option_value VARCHAR(255) NOT NULL
);

-- ภาพทรงที่ AI สร้างจากการบรีฟ
CREATE TABLE generated_designs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id        UUID NOT NULL REFERENCES design_briefs(id),
  fabric_upload_id UUID REFERENCES fabric_uploads(id),  -- null ถ้าใช้ผ้าร้าน
  shop_fabric_id  UUID REFERENCES shop_fabrics(id),     -- null ถ้าใช้ผ้าตัวเอง
  design_image_url TEXT NOT NULL,                       -- ภาพทรงเปล่า
  preview_image_url TEXT,                               -- ภาพทรง + ลายผ้า mapped
  ai_model_version VARCHAR(50),
  generation_params JSONB,                              -- prompt, seed, etc.
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ผลการจำลองชุดบนร่างกายลูกค้า (Virtual Try-On)
CREATE TABLE tryon_results (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generated_design_id UUID NOT NULL REFERENCES generated_designs(id),
  customer_photo_id UUID NOT NULL REFERENCES customer_photos(id),
  result_image_url  TEXT NOT NULL,
  is_saved          BOOLEAN NOT NULL DEFAULT FALSE,
  ai_model_version  VARCHAR(50),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_design_briefs_user ON design_briefs(user_id);
CREATE INDEX idx_generated_designs_brief ON generated_designs(brief_id);
CREATE INDEX idx_tryon_results_user ON tryon_results(user_id);
CREATE INDEX idx_tryon_results_saved ON tryon_results(user_id, is_saved);


-- =============================================================
--  7. ORDERS — สั่งตัด (มีผ้าเอง / ผ้าร้าน)
-- =============================================================

CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id         UUID NOT NULL REFERENCES users(id),
  shop_id             UUID NOT NULL REFERENCES shops(id),
  tryon_result_id     UUID REFERENCES tryon_results(id),  -- ภาพจำลองที่ลูกค้าเลือก
  measurement_id      UUID REFERENCES body_measurements(id),
  fabric_source       fabric_source NOT NULL,             -- 'own' | 'shop'
  fabric_upload_id    UUID REFERENCES fabric_uploads(id), -- กรณีมีผ้าเอง
  shop_fabric_id      UUID REFERENCES shop_fabrics(id),   -- กรณีเลือกผ้าจากร้าน
  fabric_meters_used  NUMERIC(6,2),
  status              order_status NOT NULL DEFAULT 'draft',
  special_instructions TEXT,
  estimated_price     NUMERIC(10,2),
  final_price         NUMERIC(10,2),
  confirmed_at        TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ป้องกัน: ต้องมี fabric_upload_id หรือ shop_fabric_id อย่างน้อย 1
  CONSTRAINT chk_fabric_source CHECK (
    (fabric_source = 'own'  AND fabric_upload_id IS NOT NULL) OR
    (fabric_source = 'shop' AND shop_fabric_id IS NOT NULL)
  )
);

-- log การเปลี่ยนสถานะออเดอร์
CREATE TABLE order_status_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status NOT NULL,
  changed_by UUID REFERENCES users(id),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_shop ON orders(shop_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_status_logs_order ON order_status_logs(order_id);


-- =============================================================
--  8. WEAVING ORDERS — สั่งทอผ้า
-- =============================================================

CREATE TABLE weaving_orders (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id            UUID NOT NULL REFERENCES users(id),
  shop_id                UUID NOT NULL REFERENCES shops(id),
  pattern_id             UUID NOT NULL REFERENCES weave_patterns(id),
  color_variant_id       UUID REFERENCES weave_color_variants(id),
  custom_color_note      TEXT,                          -- กรณีต้องการสีที่ไม่มีในระบบ
  meters_requested       NUMERIC(6,2) NOT NULL,
  width_cm               NUMERIC(6,1),
  status                 weaving_order_status NOT NULL DEFAULT 'pending_confirm',
  color_disclaimer_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  estimated_price        NUMERIC(10,2),
  final_price            NUMERIC(10,2),
  special_instructions   TEXT,
  estimated_weeks        INT,                           -- ระยะเวลาประมาณ (สัปดาห์)
  confirmed_at           TIMESTAMPTZ,
  completed_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE weaving_order_status_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES weaving_orders(id) ON DELETE CASCADE,
  old_status weaving_order_status,
  new_status weaving_order_status NOT NULL,
  changed_by UUID REFERENCES users(id),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weaving_orders_customer ON weaving_orders(customer_id);
CREATE INDEX idx_weaving_orders_shop ON weaving_orders(shop_id);
CREATE INDEX idx_weaving_orders_status ON weaving_orders(status);


-- =============================================================
--  9. SHIPMENTS (การจัดส่งผ้า)
-- =============================================================

CREATE TABLE shipments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID REFERENCES orders(id),
  weaving_order_id UUID REFERENCES weaving_orders(id),
  direction     shipment_direction NOT NULL,
  carrier       VARCHAR(100),                           -- 'Kerry', 'Flash', 'ไปรษณีย์ไทย'
  tracking_no   VARCHAR(100),
  status        shipment_status NOT NULL DEFAULT 'pending',
  shipped_at    TIMESTAMPTZ,
  delivered_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_shipment_order CHECK (
    (order_id IS NOT NULL) OR (weaving_order_id IS NOT NULL)
  )
);

CREATE TABLE shipment_status_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id  UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  old_status   shipment_status,
  new_status   shipment_status NOT NULL,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_weaving_order ON shipments(weaving_order_id);


-- =============================================================
--  10. PAYMENTS
-- =============================================================

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID REFERENCES orders(id),
  weaving_order_id UUID REFERENCES weaving_orders(id),
  payer_id        UUID NOT NULL REFERENCES users(id),
  amount          NUMERIC(10,2) NOT NULL,
  platform_fee    NUMERIC(10,2) NOT NULL DEFAULT 0,     -- ค่า service fee ของ LAYA
  shop_payout     NUMERIC(10,2) NOT NULL,               -- amount - platform_fee
  method          payment_method_type NOT NULL,
  status          payment_status NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(255),                         -- ref จาก payment gateway
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_payment_order CHECK (
    (order_id IS NOT NULL) OR (weaving_order_id IS NOT NULL)
  ),
  CONSTRAINT chk_payout_calc CHECK (
    shop_payout = amount - platform_fee
  )
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_weaving_order ON payments(weaving_order_id);
CREATE INDEX idx_payments_status ON payments(status);


-- =============================================================
--  11. NOTIFICATIONS
-- =============================================================

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  data        JSONB,                                    -- payload (order_id, etc.)
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);


-- =============================================================
--  12. COMMUNITY
-- =============================================================

-- ข้อมูลผ้าไทยแต่ละจังหวัด
CREATE TABLE fabric_origins (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province    VARCHAR(100) NOT NULL UNIQUE,
  title       VARCHAR(255) NOT NULL,
  content     TEXT,
  cover_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- โพสต์ในคอมมิวนิตี้
CREATE TABLE community_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_type    post_type NOT NULL DEFAULT 'showcase',
  title        VARCHAR(255),
  content      TEXT,
  fabric_origin_id UUID REFERENCES fabric_origins(id),
  order_id     UUID REFERENCES orders(id),              -- โพสต์ที่ link กับออเดอร์จริง
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  like_count   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE post_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE post_likes (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_community_posts_user ON community_posts(user_id);
CREATE INDEX idx_community_posts_published ON community_posts(is_published, created_at DESC);
CREATE INDEX idx_community_posts_origin ON community_posts(fabric_origin_id);


-- =============================================================
--  13. SHOP REVIEWS
-- =============================================================

CREATE TABLE shop_reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  order_id    UUID REFERENCES orders(id),
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reviewer_id, order_id)               -- 1 review ต่อ 1 order
);

CREATE INDEX idx_shop_reviews_shop ON shop_reviews(shop_id);

-- Trigger อัปเดต rating ใน shops อัตโนมัติ
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shops
  SET
    rating       = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM shop_reviews WHERE shop_id = NEW.shop_id),
    review_count = (SELECT COUNT(*) FROM shop_reviews WHERE shop_id = NEW.shop_id),
    updated_at   = NOW()
  WHERE id = NEW.shop_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_shop_rating
AFTER INSERT OR UPDATE ON shop_reviews
FOR EACH ROW EXECUTE FUNCTION update_shop_rating();


-- =============================================================
--  14. UPDATED_AT TRIGGER (auto-update timestamps)
-- =============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'users', 'customer_profiles', 'body_measurements',
    'shops', 'shop_fabrics', 'orders', 'weaving_orders',
    'shipments', 'payments', 'community_posts', 'fabric_origins'
  ]) LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t
    );
  END LOOP;
END;
$$;


-- =============================================================
--  SEED DATA — Base Styles (รูปทรงพื้นฐาน)
-- =============================================================

INSERT INTO base_styles (name, garment_type, description, sort_order) VALUES
('เสื้อคอกลม', 'top', 'เสื้อทรงตรงคอกลม แขนสั้น/ยาว', 1),
('เสื้อคอวี', 'top', 'เสื้อทรงตรงคอวี', 2),
('เสื้อคอปกจีน', 'top', 'เสื้อคอปกทรงจีน/เชิ้ต', 3),
('กระโปรงทรง A', 'skirt', 'กระโปรงทรง A-line ความยาวปรับได้', 4),
('กระโปรงทรงดินสอ', 'skirt', 'กระโปรงทรงดินสอ (pencil skirt)', 5),
('กระโปรงผ้าถุง', 'skirt', 'กระโปรงสไตล์ผ้าถุงพื้นเมือง', 6),
('ชุดเดรสทรงตรง', 'dress', 'ชุดเดรสทรงตรงความยาวต่าง ๆ', 7),
('ชุดเดรส wrap', 'dress', 'ชุดเดรสสไตล์ wrap ปรับไซส์ได้', 8),
('เสื้อ + กระโปรง (เซ็ต)', 'set', 'ชุดสองชิ้นเข้าชุด', 9);


-- =============================================================
--  SEED DATA — Sample Weave Patterns
-- =============================================================

INSERT INTO weave_patterns (name, description, origin_province) VALUES
('ลายขิด', 'ลวดลายทอด้วยการยกลำ สร้างลวดลายนูน', 'สกลนคร'),
('ลายมัดหมี่', 'การย้อมเส้นด้ายก่อนทอเพื่อสร้างลวดลาย', 'อุดรธานี'),
('ลายจก', 'ลวดลายที่เกิดจากการจกด้าย สร้างลวดลายพิเศษ', 'แพร่'),
('ลายดอกพิกุล', 'ลายดอกไม้แบบไทยโบราณ', 'ลำพูน'),
('ลายนกยูง', 'ลายรูปนกยูงแบบดั้งเดิม', 'เชียงใหม่'),
('ลายขอ', 'ลายขอแบบโบราณ สัญลักษณ์มงคล', 'นครราชสีมา');
