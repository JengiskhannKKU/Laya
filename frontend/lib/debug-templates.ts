/**
 * Debug utility to test template API response
 * Run in browser console: import { testTemplateAPI } from '@/lib/debug-templates'; testTemplateAPI();
 */

export async function testTemplateAPI() {
  console.log("🧪 Testing Template API...\n");

  try {
    console.log("📍 Fetching from: /api/templates");
    const res = await fetch("/api/templates");

    console.log(`📊 Response status: ${res.status} ${res.statusText}`);
    console.log(`📊 Response headers:`, {
      contentType: res.headers.get("content-type"),
      contentLength: res.headers.get("content-length"),
    });

    const data = await res.json();

    console.log("\n📋 Response type:", typeof data, Array.isArray(data) ? "ARRAY" : "OBJECT");
    console.log("📋 Response content:", JSON.stringify(data, null, 2).substring(0, 500));

    if (Array.isArray(data)) {
      console.log(`\n✅ API returns array with ${data.length} items`);
      if (data.length > 0) {
        console.log("First item structure:", Object.keys(data[0]));
        console.log("First item:", data[0]);
      }
    } else if (data && typeof data === "object") {
      console.log("\n⚠️ API returns OBJECT, not array:");
      console.log("Keys:", Object.keys(data));
      if (data.error) {
        console.log("❌ Error:", data.error);
      }
      if (data.data && Array.isArray(data.data)) {
        console.log("⚠️ Found data.data array with", data.data.length, "items");
      }
    } else {
      console.log("\n❌ Unexpected response type:", typeof data);
    }

  } catch (err: any) {
    console.error("\n❌ Error:", err.message);
    console.error("Stack:", err.stack);
  }

  console.log("\n---\nTo test, run in browser console:");
  console.log('fetch("/api/templates").then(r => r.json()).then(d => console.log(d))');
}
