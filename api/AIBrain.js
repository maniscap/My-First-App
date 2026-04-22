export const maxDuration = 60; 

export const config = {
  api: {
    bodyParser: { sizeLimit: '5mb' }
  }
};

const cleanBase64 = (base64String) => {
  if (!base64String) return null;
  return base64String.replace(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/, '');
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action, model, systemPrompt, userText, options = {}, prompt } = req.body;

    // Secure Backend-Only Keys (No VITE_ prefix!)
    const GROQ_KEY = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY;

    // --- ACTION: IMAGE GENERATION ---
    if (action === 'generateImage') {
      if (model?.provider !== 'gemini') throw new Error('Image generation only supported for Gemini');
      if (!GEMINI_KEY) throw new Error('Gemini Key Missing');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.id)}:predict?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } })
        }
      );

      if (!response.ok) throw new Error('Image generation failed');
      const data = await response.json();
      
      const b64Data = data.predictions?.[0]?.bytesBase64Encoded;
      const mimeType = data.predictions?.[0]?.mimeType || 'image/jpeg';
      if (!b64Data) throw new Error('No image generated');

      return res.status(200).json({ success: true, data: `data:${mimeType};base64,${b64Data}` });
    }

    // --- ACTION: TEXT & JSON GENERATION ---
    if (action === 'fetchCompletion') {
      const { imageBase64 = null, temperature = 0.7, requireJson = false, minLength = 0 } = options;
      const requiresVision = !!imageBase64;
      const cleanedImage = cleanBase64(imageBase64);

      const enforcedPrompt = requireJson
        ? `${systemPrompt}\n\nYou MUST respond with ONLY a raw JSON object/array. No markdown formatting, no conversational text.`
        : systemPrompt;

      let resultText = '';

      if (model?.provider === 'gemini') {
        if (!GEMINI_KEY) throw new Error('Gemini Key Missing');
        
        const userParts = [{ text: userText }];
        if (requiresVision) userParts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanedImage } });

        const reqBody = {
          contents: [{ role: 'user', parts: userParts }],
          systemInstruction: { parts: [{ text: enforcedPrompt }] },
          generationConfig: { maxOutputTokens: 8192, temperature }
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.id)}:generateContent?key=${GEMINI_KEY}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reqBody) }
        );
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Gemini API Error');
        resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      } else if (model?.provider === 'groq' || model?.provider === 'openrouter') {
        const apiKey = model.provider === 'groq' ? GROQ_KEY : OPENROUTER_KEY;
        if (!apiKey) throw new Error(`${model.provider} Key Missing`);

        const url = model.provider === 'groq'
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : 'https://openrouter.ai/api/v1/chat/completions';

        let messages = [{ role: 'system', content: enforcedPrompt }];
        
        if (requiresVision) {
          messages.push({
            role: 'user',
            content: [
              { type: 'text', text: userText },
              { type: 'image_url', image_url: { url: imageBase64 } }
            ]
          });
        } else {
          messages.push({ role: 'user', content: userText });
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: model.id, messages, temperature, max_tokens: 8192 })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || `${model.provider} API Error`);
        resultText = data.choices?.[0]?.message?.content || '';
      } else {
        throw new Error('Unknown model provider');
      }

      // JSON Auto-cleaner
      if (requireJson) {
        let cleanedJSON = resultText.replace(/```(?:json)?/gi, '').replace(/```/gi, '').trim();
        const jsonMatch = cleanedJSON.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) cleanedJSON = jsonMatch[0];
        JSON.parse(cleanedJSON); // Throws automatically if the JSON is invalid
        resultText = cleanedJSON;
      }

      if (minLength > 0 && resultText.length < minLength) {
        throw new Error(`Response too short: ${resultText.length} chars, expected min ${minLength}`);
      }

      return res.status(200).json({ success: true, data: resultText });
    }

    return res.status(400).json({ error: 'Invalid action specified' });

  } catch (error) {
    console.error('[AIBrain] Error:', error.message);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}