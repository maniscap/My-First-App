// ChatBot.jsx API Handler
// Fetches AI responses for ChatBot.jsx component
// Route: POST /api/ChatBot
// Receives: { text, imageBase64, provider, model }
// Returns: AI response from Groq/Gemini/OpenRouter/HuggingFace

export const maxDuration = 60; // Allow enough time for complex queries

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, model, text, rBase64, mType, systemInstruction } = req.body;

  // Secure Backend-Only Keys (No VITE_ prefix!)
  const GROQ_KEY = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
  const HF_KEY = process.env.HF_API_KEY || process.env.HF_KEY;
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY;

  // --- ACTION: IMAGE GENERATION ---
  if (action === 'generateImage') {
    try {
      if (!HF_KEY) throw new Error("Missing Hugging Face API Key");
      const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
        method: "POST",
        headers: { Authorization: `Bearer ${HF_KEY}`, "Content-Type": "application/json", "x-use-cache": "false" },
        body: JSON.stringify({ inputs: text }),
      });
      if (!response.ok) throw new Error(`Generation Failed: ${response.status}`);
      const buffer = await response.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString('base64');
      return res.status(200).json({ success: true, imageBase64: `data:image/jpeg;base64,${base64Image}` });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // --- ACTION: CHAT / VISION COMPLETION ---
  const hasFile = !!(rBase64 && mType);
  const isImage = mType && mType.startsWith('image/');

  try {
    if (model.provider === 'gemini') {
      if (!GEMINI_KEY) throw new Error("Gemini Key Missing");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${GEMINI_KEY}`;
      const parts = hasFile
        ? [{ text: `SYSTEM: ${systemInstruction} \nUSER REQUEST: ${text}` }, { inline_data: { mime_type: mType || "image/jpeg", data: rBase64 } }]
        : [{ text: `SYSTEM: ${systemInstruction}\nUSER REQUEST: ${text}` }];

      const payload = { contents: [{ parts: parts }] };
      if (model.id.match(/1\.5|2\.0|2\.5|3\./)) payload.tools = [{ googleSearch: {} }];

      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) { const err = await response.json(); throw new Error(`${response.status}: ${err.error?.message || 'Unknown Error'}`); }
      const data = await response.json();
      let modelResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!modelResponse) throw new Error("Empty response");

      const metadata = data.candidates?.[0]?.groundingMetadata;
      if (metadata?.webSearchQueries?.length > 0) {
        modelResponse += "\n\n---\n**🔍 Google Search Grounding:**\n";
        metadata.webSearchQueries.forEach(query => { modelResponse += `- *Searched: "${query}"*\n`; });
        if (metadata.groundingChunks) {
          const sources = [];
          metadata.groundingChunks.forEach(chunk => {
            if (chunk.web?.uri) sources.push({ title: chunk.web.title || chunk.web.uri, url: chunk.web.uri });
          });
          const uniqueSources = Array.from(new Map(sources.map(s => [s.url, s])).values());
          if (uniqueSources.length > 0) {
            modelResponse += "\n**Sources:**\n";
            uniqueSources.forEach((source, i) => {
              modelResponse += `${i + 1}. ${source.title}\n`;
            });
          }
        }
      }
      return res.status(200).json({ success: true, data: modelResponse });

    } else if (model.provider === 'groq') {
      if (!GROQ_KEY) throw new Error("Groq Key Missing");
      let payload;
      if (hasFile && model.vision && isImage) {
        const mergedContent = `${systemInstruction}\n\nUSER REQUEST: ${text}`;
        payload = [{ role: "user", content: [{ type: "text", text: mergedContent }, { type: "image_url", image_url: { url: `data:${mType};base64,${rBase64}` } }] }];
      } else if (hasFile && !isImage) {
        throw new Error("Groq does not support PDF processing.");
      } else {
        payload = [{ role: "system", content: systemInstruction }, { role: "user", content: text }];
      }
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` }, body: JSON.stringify({ model: model.id, messages: payload }) });
      const data = await response.json();
      if (data.error) throw new Error(`Groq ${data.error.message}`);
      const modelResponse = data.choices?.[0]?.message?.content;
      if (!modelResponse) throw new Error("Empty response");
      return res.status(200).json({ success: true, data: modelResponse });

    } else if (model.provider === 'openrouter') {
      if (!OPENROUTER_KEY) throw new Error("OpenRouter Key Missing");
      let payload;
      if (hasFile && model.vision && isImage) {
        const mergedContent = `${systemInstruction}\n\nUSER REQUEST: ${text}`;
        payload = [{ role: "user", content: [{ type: "text", text: mergedContent }, { type: "image_url", image_url: { url: `data:${mType};base64,${rBase64}` } }] }];
      } else if (hasFile && !isImage) {
        throw new Error("OpenRouter free models may not process raw PDFs, skipping.");
      } else {
        payload = [{ role: "system", content: systemInstruction }, { role: "user", content: text }];
      }
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_KEY}` }, body: JSON.stringify({ model: model.id, messages: payload }) });
      const data = await response.json();
      if (data.error) throw new Error(`OpenRouter ${data.error.message}`);
      const modelResponse = data.choices?.[0]?.message?.content;
      if (!modelResponse) throw new Error("Empty response");
      return res.status(200).json({ success: true, data: modelResponse });

    } else if (model.provider === 'hf') {
      if (!HF_KEY) throw new Error("HF Key Missing");
      if (!hasFile) throw new Error("HuggingFace analysis requires an uploaded image.");
      if (hasFile && !isImage) throw new Error("HuggingFace vision models require images, skipping PDF.");
      const buffer = Buffer.from(rBase64, 'base64');
      let response = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, { method: "POST", headers: { Authorization: `Bearer ${HF_KEY}` }, body: buffer });
      if (response.status === 503) {
        await new Promise(r => setTimeout(r, 5000));
        response = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, { method: "POST", headers: { Authorization: `Bearer ${HF_KEY}` }, body: buffer });
      }
      if (!response.ok) { throw new Error(`HF ${response.status}`); }
      const data = await response.json();
      if (Array.isArray(data) && data[0].label) {
        const disease = data[0].label;
        if (!text.includes("detected:")) {
          return res.status(200).json({ success: true, _isRecursive: true, payload: `Detected: "${disease}". Detailed cure?` });
        } else {
          return res.status(200).json({ success: true, data: `🔍 **Diagnosis:** ${disease}\n\n${text}` });
        }
      }
      throw new Error("Unrecognized HF response");
    } else {
      return res.status(400).json({ error: 'Unknown provider' });
    }
  } catch (error) {
    console.error("ChatBot API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
