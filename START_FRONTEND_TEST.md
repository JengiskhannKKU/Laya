# Frontend Test Instructions

## Quick Start (2 Terminal Windows)

### Terminal 1: Start Backend API
```bash
cd /Users/trainee-1/Desktop/Laya/backend
npm run dev
# or: npm start
# Should run on http://localhost:5000
```

### Terminal 2: Start Frontend Dev Server
```bash
cd /Users/trainee-1/Desktop/Laya/frontend
npm run dev
# Should run on http://localhost:3000
```

## Test Steps

1. **Open Browser**
   - Navigate to `http://localhost:3000`

2. **Go to Tailor Flow**
   - Click on "สั่งตัดด้วยผ้าของคุณเอง" (with your own fabric)
   - Or navigate directly to: `http://localhost:3000/tailor/with-fabric`

3. **Upload Fabric Image**
   - Upload any image in the first step

4. **AI Analysis**
   - Complete the AI analysis step

5. **Choose Shape Step** ⭐ (THIS IS WHERE TEMPLATES SHOW)
   - You should now see a grid of 8 templates
   - Each template is a card with thumbnail image
   - Templates: Shirt, Blazer, Jacket, Dress, Polo, Crop, Vest, Kimono

## Expected Behavior

✅ **Templates Load from API**
- Should fetch from `GET /api/templates`
- Display 8 template cards in a 2-column grid
- Each card shows template name and thumbnail

✅ **Click Template**
- Shows front/back toggle
- Shows larger preview
- Shows Design Visualization disclaimer
- Shows "ยืนยันเทมเพลตนี้" (Confirm Template) button

## Debug: Check Browser Console

Open DevTools (F12) → Console tab

### Should NOT see errors like:
```
❌ โหลด templates ไม่สำเร็จ: Failed to fetch
❌ TypeError: Cannot read property 'map' of undefined
❌ CORS error
```

### Should see:
```
✅ API responds with 8 templates
✅ Templates render in the grid
✅ No errors in console
```

## If Templates Don't Show

### Issue 1: API Not Running
```bash
# Check if backend is running
curl http://localhost:5000/api/templates

# If empty response, backend isn't running
# See "Terminal 1: Start Backend API" above
```

### Issue 2: Frontend Not Refreshed
```bash
# Backend needs to be running first
# Then restart frontend dev server
cd frontend
npm run dev
```

### Issue 3: Check Network Tab
1. Open DevTools → Network tab
2. Go to `/tailor/with-fabric`
3. Look for `templates?` request
4. Should see response with 8 template objects

### Issue 4: CORS Error
- Make sure backend is running on port 5000
- Frontend should proxy correctly in next.config.js

## Test the API Directly

While both servers are running:

```bash
# Test 1: Get all templates
curl http://localhost:5000/api/templates | jq '.[0]'

# Expected output:
# {
#   "id": "shirt",
#   "name": "เชิ้ต",
#   "category": "top",
#   "basePrice": "990.00",
#   ...
# }

# Test 2: Get templates for a shop (use actual shop ID)
SHOP_ID="35f610f5-64dc-406a-8ad3-fd6c9c77e7c7"
curl http://localhost:5000/api/templates/shop/$SHOP_ID | jq '.length'

# Expected output: 8
```

## Success Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Navigated to `/tailor/with-fabric`
- [ ] Uploaded fabric image
- [ ] Completed AI analysis step
- [ ] See 8 template cards on "Choose Shape" step
- [ ] Can click template and see preview
- [ ] No errors in browser console
- [ ] Network tab shows successful template fetch

## Still Having Issues?

1. **Check for typos in template IDs** - Should be: shirt, blazer, jacket, dress, polo, crop, vest, kimono
2. **Verify database has data** - Run: `node backend/verify_data.js`
3. **Check backend logs** - Look for any errors in Terminal 1
4. **Check frontend logs** - Look for any errors in Terminal 2 + Browser Console
5. **Hard refresh frontend** - Ctrl+Shift+R or Cmd+Shift+R (clear cache)

## Backend Check Script

Run in backend directory to verify API is ready:
```bash
node verify_data.js
```

Should output:
```
✅ Templates (8 total):
✅ Shop-Template linkages (6 shops):
✅ Total shop-template links: 48
🧪 Testing data retrieval...
✨ Data verification complete!
```

---

Need help? Check:
1. Terminal 1 & 2 output for errors
2. Browser Console (F12)
3. Network tab in DevTools
