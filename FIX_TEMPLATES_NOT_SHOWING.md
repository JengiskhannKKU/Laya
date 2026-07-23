# Fix: Templates Not Showing (ERROR: templates.map is not a function)

## Root Cause
The frontend is trying to map over the API response, but the response is NOT an array. This happens because:

1. **Backend server is not running** ❌
2. **API endpoint is throwing an error** ❌
3. **Response is an error object** ❌

---

## ✅ SOLUTION: Start Both Servers

### Step 1: Start Backend Server (Terminal 1)

```bash
cd /Users/trainee-1/Desktop/Laya/backend
npm run dev
```

**Expected Output:**
```
Server listening on port 5000
✓ Database connected
```

### Step 2: Start Frontend Server (Terminal 2)

```bash
cd /Users/trainee-1/Desktop/Laya/frontend
npm run dev
```

**Expected Output:**
```
▲ Next.js 16.2.9
- Local:        http://localhost:3000
- Environments: .env.local
```

### Step 3: Test in Browser

1. Open `http://localhost:3000/tailor/with-fabric`
2. Upload a fabric image
3. Complete AI analysis
4. Go to "Choose Shape" step
5. **Should see 8 template cards** ✅

---

## 🔍 DEBUG: Check Console Logs

Open DevTools (F12) → Console tab

### Look for these messages:

✅ **GOOD (Success)**:
```
API response: Array(8)
  0: {id: 'blazer', name: 'เบลเซอร์', category: 'top', basePrice: 1890, ...}
  1: {id: 'crop', ...}
  ...
  length: 8
```

❌ **BAD (Error - Template Not Array)**:
```
❌ โหลด templates ไม่สำเร็จ: templates.map is not a function
```

---

## 🔧 TROUBLESHOOTING

### Issue 1: "Cannot connect to backend"

**Check if backend is running:**
```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{"status":"ok"}
```

**If no response:**
- Terminal 1 (backend) is not running
- Or backend crashed (see errors in Terminal 1)
- **Fix:** Run `npm run dev` in backend directory

---

### Issue 2: "API returns error"

**Check the actual API response:**
```bash
curl http://localhost:5000/api/templates | jq '.'
```

**Expected:**
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
  },
  ...
]
```

**If you get an error object:**
```json
{"error": "Failed to fetch templates"}
```

Then check backend logs for the actual error

---

### Issue 3: CORS Error

**Error in console:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/templates'
has been blocked by CORS policy
```

**Fix:**
1. Make sure backend is running on port 5000
2. Make sure frontend rewrites are configured (they should be in next.config.mjs)
3. Hard refresh frontend: `Ctrl+Shift+R` or `Cmd+Shift+R`

---

### Issue 4: Empty Response (No Templates)

**API returns empty array:**
```json
[]
```

**Check database:**
```bash
node backend/verify_data.js
```

**Should output:**
```
✅ Templates (8 total):
  • blazer ...
  • crop ...
  ...
```

**If empty:**
- Run migration: `node backend/_run_migration_004.js`
- Seed data: `node backend/_seed_templates.js`

---

## ✅ VERIFICATION CHECKLIST

Run this checklist to confirm everything is working:

```bash
# Terminal 1: Backend running?
curl http://localhost:5000/api/templates | jq '.length'
# Should output: 8

# Terminal 2: Frontend running?
curl http://localhost:3000 -I | grep "200\|302"
# Should see status 200 or 302

# Database has data?
node /Users/trainee-1/Desktop/Laya/backend/verify_data.js
# Should show: ✅ Templates (8 total)
```

---

## 🎯 STEP-BY-STEP COMPLETE FLOW

### Before Starting Servers

1. **Verify database migration:**
   ```bash
   cd /Users/trainee-1/Desktop/Laya/backend
   node verify_migration.js
   ```
   Should show: ✅ tables exist

2. **Verify database data:**
   ```bash
   node verify_data.js
   ```
   Should show: ✅ 8 templates, 48 links

### Start Servers

3. **Terminal 1 - Backend:**
   ```bash
   cd /Users/trainee-1/Desktop/Laya/backend
   npm run dev
   ```

4. **Terminal 2 - Frontend:**
   ```bash
   cd /Users/trainee-1/Desktop/Laya/frontend
   npm run dev
   ```

5. **Terminal 3 - Monitor (optional):**
   ```bash
   cd /Users/trainee-1/Desktop/Laya/backend
   tail -f logs/app.log  # if log file exists
   ```

### Test in Browser

6. Open `http://localhost:3000`

7. Navigate to `/tailor/with-fabric`

8. Upload any image

9. Complete AI analysis step

10. On "Choose Shape" step → **See 8 template cards** ✅

---

## 📋 COMPLETE DEBUGGING SCRIPT

Run this in backend directory:

```bash
#!/bin/bash
echo "🔍 Complete Template System Debug"
echo ""
echo "1. Checking Database..."
node -e "
  require('dotenv').config();
  const { Pool } = require('pg');
  new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    .query('SELECT COUNT(*) FROM templates')
    .then(r => console.log('  ✅ Templates:', r.rows[0].count))
    .catch(e => console.log('  ❌ Error:', e.message));
"

echo ""
echo "2. Testing API Response..."
curl -s http://localhost:5000/api/templates | jq 'length' 2>/dev/null || echo "  ❌ API not responding"

echo ""
echo "3. Checking Frontend..."
curl -s http://localhost:3000 | head -1 | grep -q "html" && echo "  ✅ Frontend responding" || echo "  ❌ Frontend not running"

echo ""
echo "Done!"
```

---

## 🚀 FAST FIX SUMMARY

If templates still not showing:

1. **Kill all node processes:**
   ```bash
   pkill -f "node"
   ```

2. **Start backend fresh:**
   ```bash
   cd /Users/trainee-1/Desktop/Laya/backend
   npm run dev
   ```

3. **In new terminal, start frontend:**
   ```bash
   cd /Users/trainee-1/Desktop/Laya/frontend
   npm run dev
   ```

4. **Hard refresh browser:**
   - `Ctrl+Shift+R` (Windows/Linux)
   - `Cmd+Shift+R` (Mac)

5. **Navigate to `/tailor/with-fabric` again**

6. **Check console for `API response:` log** ✅

---

## 📞 Still Having Issues?

Post these in the issue:

```
1. Backend output:
   - Copy all text from "npm run dev" in backend
   
2. Frontend console:
   - Open DevTools F12
   - Go to Console tab
   - Look for "API response:" or "❌ โหลด templates"
   
3. API test:
   - Run: curl http://localhost:5000/api/templates
   - Paste the response (first 500 chars)
   
4. Process check:
   - Run: lsof -i :5000 (backend)
   - Run: lsof -i :3000 (frontend)
```

---

## ✅ EXPECTED SUCCESS

When working correctly:

1. ✅ Backend running on `http://localhost:5000`
2. ✅ Frontend running on `http://localhost:3000`
3. ✅ Console shows: `API response: Array(8)`
4. ✅ See 8 template cards on Choose Shape step
5. ✅ Click template → see preview
6. ✅ No errors in console

---

Generated: 2026-07-16
