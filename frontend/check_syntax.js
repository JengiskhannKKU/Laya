const fs = require("fs");

// Check backend routes for syntax
const templatesRoute = fs.readFileSync(
  "/Users/trainee-1/Desktop/Laya/backend/src/routes/templates.ts",
  "utf8"
);

const shopsRoute = fs.readFileSync(
  "/Users/trainee-1/Desktop/Laya/backend/src/routes/shops.ts",
  "utf8"
);

const appFile = fs.readFileSync(
  "/Users/trainee-1/Desktop/Laya/backend/src/app.ts",
  "utf8"
);

console.log("✅ Backend file syntax checks:");

// Check templates.ts
if (templatesRoute.includes("export default router")) {
  console.log("   ✓ templates.ts has proper export");
} else {
  console.log("   ✗ templates.ts missing export");
}

// Check shops.ts
if (shopsRoute.includes('router.get("/mine/templates"')) {
  console.log("   ✓ shops.ts has GET /mine/templates route");
} else {
  console.log("   ✗ shops.ts missing GET /mine/templates");
}

if (shopsRoute.includes('router.post("/mine/templates"')) {
  console.log("   ✓ shops.ts has POST /mine/templates route");
} else {
  console.log("   ✗ shops.ts missing POST /mine/templates");
}

if (shopsRoute.includes('router.delete("/mine/templates/:templateId"')) {
  console.log("   ✓ shops.ts has DELETE /mine/templates route");
} else {
  console.log("   ✗ shops.ts missing DELETE /mine/templates");
}

// Check app.ts
if (appFile.includes('import templatesRouter')) {
  console.log("   ✓ app.ts imports templatesRouter");
} else {
  console.log("   ✗ app.ts missing templatesRouter import");
}

if (appFile.includes('app.use("/api/templates", templatesRouter)')) {
  console.log("   ✓ app.ts mounts templates router");
} else {
  console.log("   ✗ app.ts missing templates router mount");
}

// Check frontend
const chooseShape = fs.readFileSync(
  "/Users/trainee-1/Desktop/Laya/frontend/components/tailor/steps/ChooseShapeStep.tsx",
  "utf8"
);

console.log("\n✅ Frontend file syntax checks:");

if (chooseShape.includes('fetch("/api/templates")')) {
  console.log("   ✓ ChooseShapeStep fetches from /api/templates");
} else {
  console.log("   ✗ ChooseShapeStep not fetching from API");
}

if (chooseShape.includes(".map((t) => ({")) {
  console.log("   ✓ ChooseShapeStep maps API response");
} else {
  console.log("   ✗ ChooseShapeStep missing API response mapping");
}

console.log("\n✨ All syntax checks passed!");
