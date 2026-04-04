const https = require('https');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/NANO_BANANA_API_KEY=(.*)/);
const API_KEY = match ? match[1].trim() : '';

function request(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const postData = JSON.stringify({ prompt: "test picture of a cat", imageUrls: [], aspectRatio: "1:1", resolution: "1K" });
    const { status, data } = await request("https://api.nanobananaapi.ai/api/v1/nanobanana/generate-2", {
      method: "POST",
      headers: { "Authorization": "Bearer " + API_KEY, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) }
    }, postData);
    
    console.log("POST generate-2:", status, data);
    const parsed = JSON.parse(data);
    const taskId = parsed.taskId || parsed.data?.taskId || parsed.recordId || parsed.id || parsed.task_id;
    console.log("Extracted task ID:", taskId);
    
    if (!taskId) return;
    
    const get1 = await request(`https://api.nanobananaapi.ai/api/v1/nanobanana/task/${taskId}`, { method: "GET", headers: { "Authorization": "Bearer " + API_KEY }});
    console.log("GET /task/:id =>", get1.status, get1.data);

    const get2 = await request(`https://api.nanobananaapi.ai/api/v1/nanobanana/record-info?taskId=${taskId}`, { method: "GET", headers: { "Authorization": "Bearer " + API_KEY }});
    console.log("GET /record-info?taskId= =>", get2.status, get2.data);

  } catch (e) {
    console.error("Error running test:", e);
  }
})();
