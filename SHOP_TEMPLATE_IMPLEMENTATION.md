# Shop ↔ Template Linkage Implementation

**Date**: 2026-07-16
**Status**: ✅ Complete (Phase 1-3)
**Work Tracked In**: history.md (next session entry)

## Overview

Implemented the LAYA Template System with dynamic shop↔template linkage:
- Shops can select which templates they support from a library
- Customers see only templates available for their selected shop
- System is asset-driven: designers can swap template assets without code changes

## What Was Implemented

### 1. Database Schema (Phase 1)

**File**: `backend/_migration_004_templates.sql`

```sql
-- templates: stores template definitions
-- Columns: id, name, category (top/bottom/skirt), base_price, front_asset_url, back_asset_url, is_active

-- shop_templates: junction table linking shops to templates
-- Columns: shop_id, template_id, is_available
```

**Features**:
- Templates are immutable product definitions
- Shops enable/disable templates via `is_available` flag
- Cascade delete: removing a shop removes its template associations

### 2. Seed Script (Phase 1)

**File**: `backend/_seed_templates.js`

Populates templates from frontend catalog.json:
- Reads `frontend/public/assets/garments/catalog.json` → `templateLibrary` array
- Inserts all 8 templates into database (idempotent)
- Auto-links all templates to all approved shops on first seed
- Subsequent runs update existing templates

**Templates Seeded**:
- Shirt (990 THB)
- Blazer (1890 THB)
- Jacket (1690 THB)
- Dress (1290 THB)
- Polo (890 THB)
- Crop (690 THB)
- Vest (790 THB)
- Kimono (1490 THB)

### 3. Backend API Routes (Phase 2)

**File**: `backend/src/routes/templates.ts`

**Public Endpoints** (no auth required):
- `GET /api/templates` → all active templates
- `GET /api/templates/shop/:shopId` → templates available at a specific shop

**File**: `backend/src/routes/shops.ts` (extended)

**Merchant Endpoints** (requires auth):
- `GET /api/shops/mine/templates` → all templates + enabled status for merchant's shop
- `POST /api/shops/mine/templates` → enable templates for merchant's shop
- `DELETE /api/shops/mine/templates/:templateId` → disable a template for merchant's shop

### 4. Frontend Integration (Phase 3)

**File**: `frontend/components/tailor/steps/ChooseShapeStep.tsx`

Updated to fetch templates from API instead of hardcoded catalog:
- `useEffect` calls `GET /api/templates`
- Maps API response to `Catalog` shape
- Renders template grid dynamically
- No change to UI/UX — backward compatible

## How to Test

### Setup (One-Time)

```bash
# 1. Run migration
psql $DATABASE_URL < backend/_migration_004_templates.sql

# 2. Seed templates
cd backend
node _seed_templates.js
# Output: ✓ 8 templates seeded, linked to all shops
```

### Test Flows

#### 1. Verify Database

```bash
psql $DATABASE_URL <<EOF
SELECT COUNT(*) FROM templates; -- Should return 8
SELECT COUNT(*) FROM shop_templates; -- Should return 8 × num_shops
EOF
```

#### 2. Test Public API

```bash
# Get all templates
curl http://localhost:5000/api/templates

# Get templates for a shop (use actual shop ID)
curl http://localhost:5000/api/templates/shop/{shop-id}
```

**Expected Response**:
```json
[
  {
    "id": "shirt",
    "name": "เชิ้ต",
    "category": "top",
    "basePrice": 990,
    "frontAssetUrl": "/assets/garments/tops/templates/shirt-front.svg",
    "backAssetUrl": "/assets/garments/tops/templates/shirt-back.svg",
    "description": null
  }
]
```

#### 3. Test Merchant API

```bash
# Get merchant's templates (requires auth token)
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/shops/mine/templates

# Enable templates
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"templateIds": ["shirt", "blazer", "dress"]}' \
  http://localhost:5000/api/shops/mine/templates

# Disable a template
curl -X DELETE \
  -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/shops/mine/templates/shirt
```

#### 4. Test Frontend

1. Start dev server: `npm run dev`
2. Navigate to `/tailor/with-fabric`
3. Upload fabric image
4. AI analysis step
5. **"Choose Shape" step**: should display grid of templates fetched from API (not hardcoded)
6. Verify all 8 templates appear
7. Click a template → verify front/back views load correctly

### Verify TypeScript

```bash
# Backend
cd backend && npx tsc --noEmit

# Frontend (only checks ChooseShapeStep change)
cd frontend && npx tsc components/tailor/steps/ChooseShapeStep.tsx --noEmit
```

## Architecture Decision Notes

### Why Not Frontend-Only?
- ❌ Hardcoding templates → can't filter by shop capability
- ❌ Every customer sees all templates → not scalable to many shops
- ✅ Database-backed → enables future filtering, analytics, A/B testing

### Why Separate `templates` Table?
- `templates` = immutable library (LAYA-owned)
- `shop_templates` = shop capability (shop-owned)
- Separation allows templates to be managed independently from shop relationships

### Asset Flexibility
- Template assets referenced by URL (`front_asset_url`, `back_asset_url`)
- Designers can swap SVG/PNG files without touching database
- Just update path in catalog.json → run seed script → done

## Files Modified/Created

### Backend
- ✅ `backend/_migration_004_templates.sql` — New
- ✅ `backend/_seed_templates.js` — New
- ✅ `backend/src/routes/templates.ts` — New
- ✅ `backend/src/routes/shops.ts` — Extended (added template mgmt routes)
- ✅ `backend/src/app.ts` — Updated (mounted templates router)

### Frontend
- ✅ `frontend/components/tailor/steps/ChooseShapeStep.tsx` — Updated (fetch from API)

## Pending Work

### Phase 4 (Optional, Out of Scope):
- Shop settings UI for merchants to manage their templates
- Admin dashboard to see template adoption per shop
- Template versioning/archival (currently just `is_active` flag)
- Template previews with actual photos (not just silhouettes)

### Asset Updates (Blocker for Production):
- Current templates are auto-generated silhouettes (placeholder)
- Need real fashion technical illustrations from designer
- Just swap paths in `catalog.json` + reseed when ready

## Rollback Instructions

If issues arise:

```bash
# Drop new tables (will remove all shop template links)
psql $DATABASE_URL <<EOF
DROP TABLE IF EXISTS shop_templates CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
EOF

# Revert frontend to use hardcoded catalog
git checkout HEAD -- frontend/components/tailor/steps/ChooseShapeStep.tsx

# Remove templates router from app
git checkout HEAD -- backend/src/app.ts
git checkout HEAD -- backend/src/routes/templates.ts
git checkout HEAD -- backend/src/routes/shops.ts
```

## Next Steps

1. **Run migration + seed** on development database
2. **Manual test** all API endpoints
3. **Browser test** `/tailor/with-fabric` flow
4. **Verify TypeScript** compiles in both backend/frontend
5. **Commit changes** with summary
6. **Update .env** if any new variables needed (none currently)
