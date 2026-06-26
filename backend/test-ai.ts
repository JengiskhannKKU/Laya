import dotenv from "dotenv";
dotenv.config();

async function test() {
  const apiKey = process.env.GEN_AI_KKU_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }

  // 1x1 transparent png base64
  const imageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  console.log("Fetching from KKU API...");
  const response = await fetch("https://gen.ai.kku.ac.th/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content: "You are an expert. Return ONLY a JSON object with keys: type, technique."
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      stream: false
    })
  });

  if (!response.ok) {
    console.error("Failed:", await response.text());
  } else {
    console.log("Success:", await response.json());
  }
}

test();
