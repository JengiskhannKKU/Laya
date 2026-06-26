import fs from 'fs';
import path from 'path';

async function testLargeUpload() {
  // Create a fake base64 string of ~2.5MB
  const buffer = Buffer.alloc(2 * 1024 * 1024); // 2MB raw data -> ~2.6MB base64
  const base64Str = "data:image/jpeg;base64," + buffer.toString('base64');

  console.log(`Sending payload of length: ${base64Str.length}`);

  try {
    const res = await fetch("http://localhost:5000/api/ai/analyze-fabric", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64Str })
    });

    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Response:", data);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testLargeUpload();
