// src/Utilities/AIBrain.js

// 1. API Keys mapped exactly to your environment variables
const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;
const HF_KEY = import.meta.env.VITE_HF_KEY;

// 2. The 42-Model Unbreakable Grid (Unwrapped for pure JS performance)
const MODEL_QUEUE = [
    // --- LATEST GEMINI 3 & 2.5 SERIES (2026) ---
    { provider: 'gemini', id: 'gemini-3.1-pro-preview', vision: true, desc: "Gemini 3.1 Pro (Advanced Reasoning)" },
    { provider: 'gemini', id: 'gemini-3-flash-preview', vision: true, desc: "Gemini 3 Flash (Fast Agentic)" },
    { provider: 'gemini', id: 'gemini-2.5-pro', vision: true, desc: "Gemini 2.5 Pro" },
    { provider: 'gemini', id: 'gemini-2.5-flash', vision: true, desc: "Gemini 2.5 Flash" },
    { provider: 'gemini', id: 'gemini-1.5-flash', vision: true, desc: "Gemini 1.5 Flash" },
    { provider: 'gemini', id: 'gemini-1.5-pro', vision: true, desc: "Gemini 1.5 Pro" },
    // --- LATEST GROQ / DEEPSEEK / META SERIES (2026) ---
    { provider: 'groq', id: 'deepseek-r1-distill-llama-70b', vision: false, desc: "DeepSeek R1 (Elite Reasoning)" },
    { provider: 'groq', id: 'llama-3.3-70b-versatile', vision: false, desc: "Llama 3.3 70B" },
    { provider: 'groq', id: 'qwen-2.5-32b', vision: false, desc: "Qwen 2.5 32B" },
    { provider: 'groq', id: 'llama-3.2-11b-vision-preview', vision: true, desc: "Llama 3.2 11B Vision" },
    { provider: 'groq', id: 'llama-3.2-90b-vision-preview', vision: true, desc: "Llama 3.2 90B Vision" },
    // --- HUGGING FACE SPECIALTY MODELS ---
    { provider: 'hf', id: 'linkan/plant-disease-classification-v2', vision: true, desc: "HF Plant Disease V2" },
    { provider: 'hf', id: 'google/vit-base-patch16-224', vision: true, desc: "Google ViT" },
    { provider: 'hf', id: 'microsoft/resnet-50', vision: true, desc: "ResNet-50" },
    { provider: 'hf', id: 'facebook/detr-resnet-50', vision: true, desc: "Facebook DETR" },
    { provider: 'hf', id: 'google/vit-large-patch16-224', vision: true, desc: "Google ViT Large" },
    { provider: 'hf', id: 'nateraw/vit-base-beans', vision: true, desc: "HF Beans Disease" },
    { provider: 'hf', id: 'jazmys/vit-base-patch16-224-in21k-finetuned-lora-food', vision: true, desc: "HF Food Analysis" },
    // --- LATEST IMAGE GENERATION MODELS (2026) ---
    { provider: 'gemini', id: 'imagen-3.0-generate-002', imageGen: true, desc: "Google Imagen 3 (High Quality)" },
    { provider: 'gemini', id: 'imagen-3.0-fast-generate-001', imageGen: true, desc: "Google Imagen 3 Fast" },
    { provider: 'hf', id: 'black-forest-labs/FLUX.1-schnell', imageGen: true, desc: "Flux.1 Schnell (Fast)" },
    { provider: 'hf', id: 'black-forest-labs/FLUX.1-dev', imageGen: true, desc: "Flux.1 Dev (Detailed)" },
    { provider: 'hf', id: 'stabilityai/stable-diffusion-3.5-large', imageGen: true, desc: "Stable Diffusion 3.5" },
    // --- FALLBACK MODELS ---
    { provider: 'gemini', id: 'gemini-2.0-flash-exp', vision: true, desc: "Gemini 2.0 Exp" },
    { provider: 'gemini', id: 'gemini-pro-vision', vision: true, desc: "Gemini 1.0 Vision" },
    { provider: 'gemini', id: 'gemini-1.5-flash-8b', vision: true, desc: "Gemini 1.5 Flash 8B" },
    { provider: 'groq', id: 'llama-3.1-70b-versatile', vision: false },
    { provider: 'groq', id: 'llama-3.1-8b-instant', vision: false },
    { provider: 'groq', id: 'llama3-70b-8192', vision: false },
    { provider: 'groq', id: 'llama3-8b-8192', vision: false },
    { provider: 'groq', id: 'mixtral-8x7b-32768', vision: false },
    { provider: 'groq', id: 'gemma2-9b-it', vision: false },
    { provider: 'groq', id: 'gemma-7b-it', vision: false },
    { provider: 'gemini', id: 'gemini-1.0-pro', vision: false },
    { provider: 'gemini', id: 'gemini-pro', vision: false },
    { provider: 'gemini', id: 'text-bison-001', vision: false },
    { provider: 'gemini', id: 'chat-bison-001', vision: false },
    { provider: 'groq', id: 'llama3-groq-70b-8192-tool-use-preview', vision: false },
    { provider: 'groq', id: 'llama3-groq-8b-8192-tool-use-preview', vision: false }
];

// Helper to clean base64 image strings for APIs
const cleanBase64 = (base64String) => base64String ? base64String.replace(/^data:image\/(png|jpeg|jpg);base64,/, '') : null;

// 3. The Universal Brain Function
export const processWithFarmBrain = async (systemPrompt, userText = "", imageBase64 = null) => {
    const requiresVision = imageBase64 !== null;
    const validModels = MODEL_QUEUE.filter(model => requiresVision ? model.vision === true : true);

    for (const model of validModels) {
        console.log(`[FarmBrain] Attempting request with ${model.provider} : ${model.id}`);
        try {
            let resultText = "";

            // ==========================================
            // PROVIDER 1: GEMINI ROUTING
            // ==========================================
            if (model.provider === 'gemini') {
                const parts = [{ text: `System Instructions: ${systemPrompt}\nUser: ${userText}` }];
                
                if (requiresVision) {
                    parts.push({
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: cleanBase64(imageBase64)
                        }
                    });
                }

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${GEMINI_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts }] })
                });

                if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
                const data = await response.json();
                resultText = data.candidates[0].content.parts[0].text;
            } 
            
            // ==========================================
            // PROVIDER 2: GROQ ROUTING
            // ==========================================
            else if (model.provider === 'groq') {
                let messages = [
                    { role: "system", content: systemPrompt }
                ];

                if (requiresVision) {
                    messages.push({
                        role: "user",
                        content: [
                            { type: "text", text: userText || "Analyze this image." },
                            { type: "image_url", image_url: { url: imageBase64 } }
                        ]
                    });
                } else {
                    messages.push({ role: "user", content: userText });
                }

                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ model: model.id, messages })
                });

                if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);
                const data = await response.json();
                resultText = data.choices[0].message.content;
            }

            // ==========================================
            // PROVIDER 3: HUGGING FACE ROUTING
            // ==========================================
            else if (model.provider === 'hf') {
                const payload = requiresVision ? cleanBase64(imageBase64) : { inputs: `${systemPrompt}\n${userText}` };
                
                const response = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${HF_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`HF API Error: ${response.status}`);
                const data = await response.json();
                resultText = Array.isArray(data) ? JSON.stringify(data[0]) : data.generated_text;
            }

            console.log(`[FarmBrain] Success! Answered by ${model.id}`);
            return {
                success: true,
                data: resultText,
                modelUsed: model.id
            };

        } catch (error) {
            console.warn(`[FarmBrain] Model ${model.id} failed. Error: ${error.message}. Switching to next backup...`);
            continue; 
        }
    }

    return {
        success: false,
        error: "All AI analysis servers are currently busy or offline. Please try again in a few moments."
    };
};

// 4. Image Generation Brain Function (Text-to-Image)
export const generateImageWithFarmBrain = async (prompt) => {
    // Extract only the models capable of image generation
    const imageModels = MODEL_QUEUE.filter(model => model.imageGen === true);

    for (const model of imageModels) {
        console.log(`[FarmBrain] Attempting image generation with ${model.provider} : ${model.id}`);
        try {
            let base64Image = "";

            if (model.provider === 'hf') {
                const response = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${HF_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ inputs: prompt })
                });

                if (!response.ok) throw new Error(`HF API Error: ${response.status}`);
                const blob = await response.blob();
                
                // Convert blob to base64 so it can be easily consumed by the frontend <img src={...} /> attributes
                base64Image = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } else if (model.provider === 'gemini') {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:predict?key=${GEMINI_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt: prompt }],
                        parameters: { sampleCount: 1 }
                    })
                });

                if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
                const data = await response.json();
                
                if (data.predictions && data.predictions.length > 0) {
                    const b64Data = data.predictions[0].bytesBase64Encoded;
                    const mimeType = data.predictions[0].mimeType || 'image/jpeg';
                    base64Image = `data:${mimeType};base64,${b64Data}`;
                } else {
                     throw new Error(`Gemini API Error: No image returned`);
                }
            }

            console.log(`[FarmBrain] Image Success! Generated by ${model.id}`);
            return {
                success: true,
                data: base64Image,
                modelUsed: model.id
            };

        } catch (error) {
            console.warn(`[FarmBrain] Image Model ${model.id} failed. Error: ${error.message}. Switching to next backup...`);
            continue; 
        }
    }

    return {
        success: false,
        error: "All Image Generation AI servers are currently busy or offline. Please try again later."
    };
};