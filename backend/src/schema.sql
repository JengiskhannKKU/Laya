-- ============================================================
-- Laya — PostgreSQL Schema (idempotent: drop + recreate)
-- ============================================================

-- Drop in reverse dependency order
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS communities CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Categories
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL
);

-- Banners
CREATE TABLE banners (
  id       TEXT PRIMARY KEY,
  image    TEXT NOT NULL,
  title    TEXT NOT NULL,
  subtitle TEXT NOT NULL
);

-- Communities
CREATE TABLE communities (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  province      TEXT NOT NULL,
  image         TEXT NOT NULL,
  member_count  INT NOT NULL DEFAULT 0,
  product_count INT NOT NULL DEFAULT 0
);

-- Products
CREATE TABLE products (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  community        TEXT NOT NULL,
  province         TEXT NOT NULL,
  price            NUMERIC(10,2) NOT NULL,
  price_unit       TEXT NOT NULL DEFAULT 'เมตร',
  rating           NUMERIC(3,1) NOT NULL DEFAULT 0,
  review_count     INT NOT NULL DEFAULT 0,
  images           TEXT[] NOT NULL DEFAULT '{}',
  has_gi           BOOLEAN NOT NULL DEFAULT FALSE,
  production_time  TEXT NOT NULL,
  available_length INT NOT NULL DEFAULT 0,
  fabric_type      TEXT NOT NULL,
  story            TEXT,
  weaver_name      TEXT,
  certificate_id   TEXT,
  passport         JSONB
);

-- Orders
CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  product_id  TEXT NOT NULL REFERENCES products(id),
  quantity    INT NOT NULL DEFAULT 1,
  total_price NUMERIC(10,2) NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX orders_user_idx ON orders(user_id);
CREATE INDEX orders_product_idx ON orders(product_id);

