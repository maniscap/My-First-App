// src/Utilities/AIBrain.js

// 1. API Keys mapped exactly to your environment variables
const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;
const HF_KEY = import.meta.env.VITE_HF_KEY;
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY;

// 2. The Fallback Matrices (Separated by capability for robust execution)

// --- ISOLATED MODEL TIERS ---
const GEMINI_MODELS = [
    { provider: 'gemini', id: 'gemini-2.5-pro', vision: true, desc: "Gemini 2.5 Pro" },
    { provider: 'gemini', id: 'gemini-2.5-flash', vision: true, desc: "Gemini 2.5 Flash" },
    { provider: 'gemini', id: 'gemini-2.5-flash-8b', vision: true, desc: "Gemini 2.5 Flash 8B" },
    { provider: 'gemini', id: 'gemini-2.0-flash', vision: true, desc: "Gemini 2.0 Flash" },
    { provider: 'gemini', id: 'gemini-2.0-flash-lite', vision: true, desc: "Gemini 2.0 Flash Lite" },
    { provider: 'gemini', id: 'gemini-2.0-pro-exp-0205', vision: true, desc: "Gemini 2.0 Pro Exp" },
    { provider: 'gemini', id: 'gemini-2.0-flash-thinking-exp-01-21', vision: true, desc: "Gemini 2.0 Flash Thinking" },
    { provider: 'gemini', id: 'gemini-1.5-pro', vision: true, desc: "Gemini 1.5 Pro" },
    { provider: 'gemini', id: 'gemini-1.5-flash', vision: true, desc: "Gemini 1.5 Flash" },
    { provider: 'gemini', id: 'gemini-1.5-flash-8b', vision: true, desc: "Gemini 1.5 Flash 8B" }
];

const GROQ_MODELS = [
    { provider: 'groq', id: 'llama-3.3-70b-versatile', vision: false, desc: "Llama 3.3 70B" },
    { provider: 'groq', id: 'llama-3.3-70b-specdec', vision: false, desc: "Llama 3.3 70B SpecDec" },
    { provider: 'groq', id: 'deepseek-r1-distill-llama-70b', vision: false, desc: "DeepSeek R1 70B" },
    { provider: 'groq', id: 'llama-3.2-90b-vision-preview', vision: true, desc: "Llama 3.2 90B Vision" },
    { provider: 'groq', id: 'llama-3.2-11b-vision-preview', vision: true, desc: "Llama 3.2 11B Vision" },
    { provider: 'groq', id: 'mixtral-8x7b-32768', vision: false, desc: "Mixtral 8x7B" },
    { provider: 'groq', id: 'qwen-2.5-32b', vision: false, desc: "Qwen 2.5 32B" },
    { provider: 'groq', id: 'llama-3.1-8b-instant', vision: false, desc: "Llama 3.1 8B" },
    { provider: 'groq', id: 'gemma2-9b-it', vision: false, desc: "Gemma 2 9B" },
    { provider: 'groq', id: 'gemma-7b-it', vision: false, desc: "Gemma 7B" }
];

const OPENROUTER_MODELS = [
    { provider: 'openrouter', id: 'google/gemini-2.5-pro:free', vision: true, desc: "OR Gemini 2.5 Pro" },
    { provider: 'openrouter', id: 'google/gemini-2.0-pro-exp-02-05:free', vision: true, desc: "OR Gemini 2.0 Pro Exp" },
    { provider: 'openrouter', id: 'meta-llama/llama-3.3-70b-instruct:free', vision: false, desc: "OR Llama 3.3 70B" },
    { provider: 'openrouter', id: 'deepseek/deepseek-r1-distill-llama-70b:free', vision: false, desc: "OR DeepSeek R1" },
    { provider: 'openrouter', id: 'google/gemini-2.0-flash-lite-preview-02-05:free', vision: true, desc: "OR Gemini 2.0 Flash Lite" },
    { provider: 'openrouter', id: 'google/gemini-2.0-flash-thinking-exp:free', vision: true, desc: "OR Gemini 2.0 Flash Thinking" },
    { provider: 'openrouter', id: 'google/gemini-1.5-pro:free', vision: true, desc: "OR Gemini 1.5 Pro" },
    { provider: 'openrouter', id: 'qwen/qwen-2.5-coder-32b-instruct:free', vision: false, desc: "OR Qwen 2.5 32B" },
    { provider: 'openrouter', id: 'qwen/qwen-2.5-72b-instruct:free', vision: false, desc: "OR Qwen 2.5 72B" },
    { provider: 'openrouter', id: 'mistralai/mistral-nemo:free', vision: false, desc: "OR Mistral Nemo" },
    { provider: 'openrouter', id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', vision: false, desc: "OR Nemotron 70B" },
    { provider: 'openrouter', id: 'meta-llama/llama-3.1-8b-instruct:free', vision: false, desc: "OR Llama 3.1 8B" },
    { provider: 'openrouter', id: 'gryphe/mythomax-l2-13b:free', vision: false, desc: "OR Mythomax L2" },
    { provider: 'openrouter', id: 'undi95/toppy-m-7b:free', vision: false, desc: "OR Toppy M" }
];

const HF_MODELS = [
    { provider: 'hf', id: 'meta-llama/Meta-Llama-3.1-8B-Instruct', vision: false, desc: "HF Llama 3.1 8B" },
    { provider: 'hf', id: 'meta-llama/Llama-2-7b-chat-hf', vision: false, desc: "HF Llama 2 7B" },
    { provider: 'hf', id: 'mistralai/Mistral-7B-Instruct-v0.3', vision: false, desc: "HF Mistral 7B" },
    { provider: 'hf', id: 'mistralai/Mistral-Nemo-Instruct-2407', vision: false, desc: "HF Mistral Nemo" },
    { provider: 'hf', id: 'Qwen/Qwen2.5-7B-Instruct', vision: false, desc: "HF Qwen 2.5 7B" },
    { provider: 'hf', id: 'Qwen/Qwen2.5-1.5B-Instruct', vision: false, desc: "HF Qwen 2.5 1.5B" },
    { provider: 'hf', id: 'google/gemma-1.1-7b-it', vision: false, desc: "HF Gemma 1.1 7B" },
    { provider: 'hf', id: 'google/gemma-2-2b-it', vision: false, desc: "HF Gemma 2 2B" },
    { provider: 'hf', id: 'google/gemma-2-9b-it', vision: false, desc: "HF Gemma 2 9B" },
    { provider: 'hf', id: 'microsoft/Phi-3.5-mini-instruct', vision: false, desc: "HF Phi-3.5 Mini" },
    { provider: 'hf', id: 'HuggingFaceH4/zephyr-7b-beta', vision: false, desc: "HF Zephyr 7B" },
    { provider: 'hf', id: 'openchat/openchat-3.5-0106', vision: false, desc: "HF OpenChat 3.5" },
    { provider: 'hf', id: 'deepseek-ai/DeepSeek-V2-Lite-Chat', vision: false, desc: "HF DeepSeek V2" }
];

// DIRECTORS: The Top 30 Reasoning Models spanning across all 4 API providers.
// Extremely robust JSON planning outline generation.
const DIRECTOR_MODELS = [
    GEMINI_MODELS[0], // Gemini 2.5 Pro
    GROQ_MODELS[0],   // Llama 3.3 70B
    OPENROUTER_MODELS[0], // OR Gemini 2.5 Pro
    HF_MODELS[0],     // HF Llama 3.1 8B
    GEMINI_MODELS[3], // Gemini 2.0 Flash
    GROQ_MODELS[2],   // DeepSeek R1 70B
    OPENROUTER_MODELS[3], // OR DeepSeek R1
    HF_MODELS[3],     // HF Mistral Nemo
    GEMINI_MODELS[7], // Gemini 1.5 Pro
    GROQ_MODELS[5],   // Mixtral 8x7B
    OPENROUTER_MODELS[2], // OR Llama 3.3 70B
    HF_MODELS[4],     // HF Qwen 2.5 7B
    GEMINI_MODELS[5], // Gemini 2.0 Pro Exp
    GROQ_MODELS[6],   // Qwen 2.5 32B
    OPENROUTER_MODELS[5], // OR Gemini 2.0 Flash Thinking
    HF_MODELS[2],     // HF Mistral 7B
    GEMINI_MODELS[1], // Gemini 2.5 Flash
    GROQ_MODELS[3],   // Llama 3.2 90B Vision
    OPENROUTER_MODELS[8], // OR Qwen 2.5 72B
    HF_MODELS[8],     // HF Gemma 2 9B
    GEMINI_MODELS[6], // Gemini 2.0 Flash Thinking
    GROQ_MODELS[1],   // Llama 3.3 70B SpecDec
    OPENROUTER_MODELS[6], // OR Gemini 1.5 Pro
    HF_MODELS[1],     // HF Llama 2 7B
    GEMINI_MODELS[8], // Gemini 1.5 Flash
    GROQ_MODELS[7],   // Llama 3.1 8B
    OPENROUTER_MODELS[10], // OR Nemotron 70B
    HF_MODELS[6],     // HF Gemma 1.1 7B
    GEMINI_MODELS[4], // Gemini 2.0 Flash Lite
    GROQ_MODELS[8]    // Gemma 2 9B
];

// 6 WRITER TEAMS: Explicitly structured so EACH team starts with unique models from all 4 providers,
// and then fills up to exactly 20 fallback models per team, offset to completely prevent cascades!
const WRITER_POOLS = Array.from({ length: 6 }, (_, teamIndex) => {
    const pool = [];
    // 1. Primary: Guaranteed unique Gemini Model
    pool.push(GEMINI_MODELS[teamIndex % GEMINI_MODELS.length]);
    // 2. Secondary: Guaranteed unique Groq Model
    pool.push(GROQ_MODELS[teamIndex % GROQ_MODELS.length]);
    // 3. Tertiary: Guaranteed unique OpenRouter Model
    pool.push(OPENROUTER_MODELS[teamIndex % OPENROUTER_MODELS.length]);
    // 4. Quaternary: Guaranteed unique Hugging Face Model
    pool.push(HF_MODELS[teamIndex % HF_MODELS.length]);
    
    // 5. Fallbacks: Fill up to exactly 20 models per team
    const remaining = [...GEMINI_MODELS, ...GROQ_MODELS, ...OPENROUTER_MODELS, ...HF_MODELS]
        .filter(m => !pool.find(p => p.id === m.id)); // Filter out the 4 already chosen
        
    const offset = teamIndex * Math.floor(remaining.length / 6);
    for(let i = 0; pool.length < 20; i++) {
        pool.push(remaining[(i + offset) % remaining.length]);
    }
    return pool;
});

// IMAGE & SPECIALTY MODELS (Deeply layered Gemini & Hugging Face engines)
const IMAGE_MODELS = [
    { provider: 'gemini', id: 'imagen-3.0-generate-002', imageGen: true, desc: "Google Imagen 3 (High Quality)" },
    { provider: 'hf', id: 'black-forest-labs/FLUX.1-schnell', imageGen: true, desc: "Flux.1 Schnell (Fast)" },
    { provider: 'gemini', id: 'imagen-3.0-fast-generate-001', imageGen: true, desc: "Google Imagen 3 Fast" },
    { provider: 'hf', id: 'black-forest-labs/FLUX.1-dev', imageGen: true, desc: "Flux.1 Dev (Detailed)" },
    { provider: 'hf', id: 'stabilityai/stable-diffusion-3.5-large', imageGen: true, desc: "Stable Diffusion 3.5" },
    { provider: 'hf', id: 'stabilityai/stable-diffusion-xl-base-1.0', imageGen: true, desc: "SDXL Base 1.0" },
    { provider: 'hf', id: 'prompthero/openjourney', imageGen: true, desc: "Openjourney (Midjourney style)" },
    { provider: 'hf', id: 'runwayml/stable-diffusion-v1-5', imageGen: true, desc: "Stable Diffusion v1.5" },
    { provider: 'hf', id: 'CompVis/stable-diffusion-v1-4', imageGen: true, desc: "Stable Diffusion v1.4" }
];

// GENERAL BACKUP QUEUE (Merged lists deduplicated for legacy `processWithFarmBrain` support)
// We use a Map to ensure no duplicate models appear in the general fallback loop
const GENERAL_MODELS = [...new Map(
    [...DIRECTOR_MODELS, ...WRITER_POOLS.flat()].map(model => [model.id, model])
).values()];

// Specialty vision models for scanning
const SPECIALTY_VISION_MODELS = [
    { provider: 'hf', id: 'linkan/plant-disease-classification-v2', vision: true, desc: "HF Plant Disease V2" },
    { provider: 'hf', id: 'nateraw/vit-base-beans', vision: true, desc: "HF Beans Disease" }
];

// Helper to clean base64 image strings for APIs
const cleanBase64 = (base64String) => base64String ? base64String.replace(/^data:image\/(png|jpeg|jpg);base64,/, '') : null;

// 3. CORE WATERFALL ENGINE
// Runs parallel logic with error trapping: if JSON fails or model crashes, jumps to next model.
const fetchWithFallback = async (systemPrompt, userText, modelMatrix, options = {}) => {
    const { imageBase64 = null, temperature = 0.7, requireJson = false, minLength = 0 } = options;
    const requiresVision = imageBase64 !== null;
    const validModels = modelMatrix.filter(model => requiresVision ? model.vision === true : true);

    for (const model of validModels) {
        console.log(`[AIBrain Engine] 🔄 Trying ${model.provider.toUpperCase()} : ${model.id}...`);
        try {
            let resultText = "";

            if (model.provider === 'gemini') {
                // Add a gentle reminder for JSON output if requested
                const enforcedPrompt = requireJson ? `${systemPrompt}\n\nYou MUST respond with ONLY a raw JSON object/array. No markdown formatting, no conversational text.` : systemPrompt;
                
                const parts = [{ text: `System Instructions: ${enforcedPrompt}\nUser: ${userText}` }];
                if (requiresVision) parts.push({ inlineData: { mimeType: "image/jpeg", data: cleanBase64(imageBase64) } });

                const reqBody = {
                    contents: [{ parts }],
                    generationConfig: { maxOutputTokens: 8192, temperature: temperature }
                };

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${GEMINI_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqBody)
                });

                if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
                const data = await response.json();
                if (!data.candidates || !data.candidates[0].content) {
                    throw new Error("Blocked by safety filters or empty return.");
                }
                resultText = data.candidates[0].content.parts[0].text;
            } 
            else if (model.provider === 'groq') {
                // Remove the strict 'json_object' format flag as it causes 400 Bad Request errors on models like DeepSeek. 
                // Rely instead on our robust regex extraction below.
                const enforcedPrompt = requireJson ? `${systemPrompt}\n\nYou MUST respond with ONLY a raw JSON object/array. No markdown formatting, no conversational text.` : systemPrompt;
                
                let messages = [{ role: "system", content: enforcedPrompt }];
                if (requiresVision) {
                    messages.push({
                        role: "user",
                        content: [
                            { type: "text", text: userText },
                            { type: "image_url", image_url: { url: imageBase64 } }
                        ]
                    });
                } else {
                    messages.push({ role: "user", content: userText });
                }
                
                // Safest max token boundary across all standard models to prevent 400 error crashes
                const reqBody = { model: model.id, messages: messages, max_tokens: 4096, temperature: temperature };

                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqBody)
                });

                if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);
                const data = await response.json();
                resultText = data.choices[0].message.content;
            }
            else if (model.provider === 'openrouter') {
                // OpenRouter uses the exact same OpenAI schema as Groq
                const enforcedPrompt = requireJson ? `${systemPrompt}\n\nYou MUST respond with ONLY a raw JSON object/array. No markdown formatting, no conversational text.` : systemPrompt;
                
                let messages = [{ role: "system", content: enforcedPrompt }];
                if (requiresVision) {
                    messages.push({
                        role: "user",
                        content: [
                            { type: "text", text: userText },
                            { type: "image_url", image_url: { url: imageBase64 } }
                        ]
                    });
                } else {
                    messages.push({ role: "user", content: userText });
                }
                
                const reqBody = { model: model.id, messages: messages, max_tokens: 4096, temperature: temperature };

                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${OPENROUTER_KEY}`, 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reqBody)
                });

                if (!response.ok) throw new Error(`OpenRouter API Error: ${response.status}`);
                const data = await response.json();
                resultText = data.choices[0].message.content;
            }
            else if (model.provider === 'hf') {
                const payload = requiresVision ? cleanBase64(imageBase64) : { inputs: `${systemPrompt}\n${userText}` };
                const response = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${HF_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`HF API Error: ${response.status}`);
                const data = await response.json();
                
                // Robust HF parsing since HF varies between arrays and flat objects
                if (Array.isArray(data) && data[0].generated_text) {
                    resultText = data[0].generated_text;
                } else if (data.generated_text) {
                    resultText = data.generated_text;
                } else {
                    resultText = typeof data === 'string' ? data : JSON.stringify(data);
                }
            }

            // Robust Auto-clean JSON format extraction
            if (requireJson) {
                try {
                    let cleanedJSON = resultText.replace(/```(?:json)?/gi, '').replace(/```/gi, '').trim();
                    // Safely extract just the JSON structure even if the model ignored our "no conversational text" rule
                    const jsonMatch = cleanedJSON.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                    if (jsonMatch) {
                        cleanedJSON = jsonMatch[0];
                    }
                    JSON.parse(cleanedJSON); // Validates string
                    resultText = cleanedJSON;
                } catch(e) {
                    throw new Error("Model failed to output valid JSON framework. Falling back.");
                }
            } else if (minLength > 0 && resultText.length < minLength) {
                throw new Error(`Output too short: Generated ${resultText.length} chars, expected ${minLength}.`);
            }

            console.log(`[AIBrain Engine] ✅ SUCCESS! ${model.id} generated ${resultText.length} characters!`);
            return { success: true, data: resultText, modelUsed: model.id };

        } catch (error) {
            const errMsg = error.message || "";
            const isRateLimit = errMsg.includes('429');
            const isDeadOrBad = errMsg.includes('404') || errMsg.includes('400');

            if (isRateLimit) {
                console.warn(`[AIBrain Engine] ⚠️ ${model.id} hit Rate Limit (429). Cooling down for 2s...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else if (isDeadOrBad) {
                console.warn(`[AIBrain Engine] ❌ ${model.id} rejected the request (404/400). Skipping instantly.`);
            } else {
                console.warn(`[AIBrain Engine] ❌ ${model.id} FAILED. Reason: ${errMsg} -> Jumping to fallback...`);
            }
            continue; 
        }
    }
    throw new Error("All AI models in the selected tier are currently unavailable.");
};


// ======================================================================
// 4. EDUCATIONAL BOOK TRACK (Planner - Worker Pattern)
// ======================================================================
export const generateEducationalBook = async (topic, numChapters, style, onProgress) => {
    try {
        // Step 1: The Blueprint generated by High-Reasoning Directors
        const directorPrompt = `You are a highly logical book Director. Your job is to structure an educational book about "${topic}". Create an outline with exactly ${numChapters} chapters. 
        Output strictly in JSON format matching this structure:
        {
            "title": "Title of the Book",
            "description": "Short description of what the book covers",
            "chapters": [
                {
                    "chapter_title": "Title",
                    "secret_prompt": "Specific instructions for the writer on what this chapter MUST contain, and strictly what NOT to discuss to avoid repeating other chapters."
                }
            ]
        }
        You MUST return ONLY valid JSON.`;

        console.log("[Director Tier] Creating Book Blueprint...");
        const outlineRes = await fetchWithFallback(directorPrompt, `Create the JSON outline. Keep the tone ${style}.`, DIRECTOR_MODELS, { temperature: 0.3, requireJson: true });
        const outline = JSON.parse(outlineRes.data);
        
        // Defensive parsing in case the LLM wraps the response (e.g. { "book": { "chapters": [...] } })
        let extractedChapters = outline.chapters;
        if (!extractedChapters && outline.book && outline.book.chapters) extractedChapters = outline.book.chapters;
        if (!extractedChapters && Array.isArray(outline)) extractedChapters = outline;
        if (!extractedChapters || !Array.isArray(extractedChapters)) {
            for (const key in outline) {
                if (Array.isArray(outline[key])) { extractedChapters = outline[key]; break; }
            }
        }
        if (!extractedChapters || !Array.isArray(extractedChapters)) throw new Error("Director failed to output a valid chapters array.");

        // FIRE EVENT: Let the UI know the Table of Contents is ready so the user doesn't have to wait!
        const fullOutlineStr = JSON.stringify(extractedChapters);
        if (onProgress) onProgress({ step: 'TOC', outline: extractedChapters, title: outline.title, description: outline.description });

        // Step 2: The Execution generated by Writers in PARALLEL
        console.log(`[Writer Tier] Firing off ${extractedChapters.length} asynchronous writer agents with staggered starts...`);
        const chapterPromises = extractedChapters.map(async (chap, index) => {
            
            // STAGGER EXECUTION: We lowered this to 10s since we are generating medium-sized chapters now.
            await new Promise(resolve => setTimeout(resolve, index * 10000));

            // Distribute the chapters evenly across the 6 writer pools to avoid rate limiting
            const writerPool = WRITER_POOLS[index % WRITER_POOLS.length];
            let attempt = 0;
            const MAX_RETRIES = 3;

            // SELF-HEALING RETRY LOOP: Keeps asking the writers until the chapter succeeds
            while (attempt < MAX_RETRIES) {
                attempt++;
                try {
                    const writerPrompt = `You are Writer Team number ${index + 1}. You are writing an engaging book about "${topic}".
                    Global Style Guide: ${style}.
                    Here is the FULL Table of Contents for the entire book so you know the global context:
                    ${fullOutlineStr}
                    
                    YOUR STRICT TASK: You need to write ONLY Chapter ${index + 1} ("${chap.chapter_title || chap.title || "Chapter"}"). 
                    Do NOT write any other chapters from the list. 
                    Director's specific instructions for your chapter: ${chap.secret_prompt}
                    
                    CRITICAL LENGTH REQUIREMENT: You MUST write a medium-sized, highly engaging continuous text. Aim for roughly 500 to 800 words. Do not make it too short, but do not write an exhaustive essay. Provide enough practical and theoretical detail to be deeply educational.
                    FORMATTING RULES: Write the entire chapter as ONE single continuous flow of paragraphs. 
                    Do NOT divide the text into "Part 1", "Part 2", "Page 1", etc. 
                    Do NOT include the chapter title or "Chapter X" at the very beginning of your text. I will add the heading automatically.
                    Just write the pure, engaging content paragraphs directly without any subtitles.`;
                    
                    // Reduced minLength to 500 so we stop throwing away perfectly good medium-sized responses!
                    const res = await fetchWithFallback(writerPrompt, `Write ONLY the content for Chapter ${index + 1}. Keep it medium-sized and detailed.`, writerPool, { temperature: 0.7, minLength: 500 });
                    
                    // FIRE EVENT: Let the UI know this specific chapter is fully generated!
                    if (onProgress) onProgress({ step: 'CHAPTER', index: index, title: chap.chapter_title || chap.title, content: res.data });
                    
                    return { success: true, title: chap.chapter_title || chap.title, content: res.data, index: index };
                } catch (error) {
                    console.error(`[Chapter ${index + 1} Error] ❌ Attempt ${attempt}/${MAX_RETRIES} failed. Directors are re-dispatching Writer Team ${index + 1}...`);
                    if (attempt >= MAX_RETRIES) {
                        // Failsafe escape hatch so the app doesn't hang forever if the internet dies
                        const failMsg = `⚠️ Chapter ${index + 1} could not be generated after ${MAX_RETRIES} attempts due to server traffic. Please try generating this chapter again later.`;
                        if (onProgress) onProgress({ step: 'CHAPTER', index: index, title: chap.chapter_title || chap.title, content: failMsg });
                        return { success: false, title: chap.chapter_title || chap.title, content: failMsg, index: index };
                    }
                    // Wait 6 seconds before retrying this specific chapter to cool down the API limits
                    await new Promise(resolve => setTimeout(resolve, 6000));
                }
            }
        });

        const chaptersResults = await Promise.all(chapterPromises);
        
        // Step 3: Stitch it all together
        console.log("\n========================================================");
        console.log("             📚 BOOK GENERATION SUMMARY                 ");
        console.log("========================================================");
        const finalChapters = chaptersResults.map(res => {
            const titleTrimmed = res.title.length > 25 ? res.title.substring(0, 22) + "..." : res.title.padEnd(25);
            const status = res.success ? "✅ GENERATED" : "❌ FAILED";
            console.log(` Chapter ${String(res.index + 1).padEnd(2)} | ${titleTrimmed} | ${status}`);
            return { title: res.title, content: res.content };
        });
        console.log("========================================================\n");

        const finalBook = { title: outline.title, description: outline.description, chapters: finalChapters };

        return { success: true, book: finalBook };
    } catch (error) {
        console.error("[Educational Book Generation Failed]: ", error);
        return { success: false, error: error.message };
    }
};

// ======================================================================
// 5. STORY BOOK TRACK (Continuous One-Shot Generation)
// ======================================================================
export const generateStoryBook = async (topic, length, style) => {
    try {
        const systemPrompt = `You are a master storyteller writing a cohesive story about "${topic}". 
        The length should be ${length}. The tone/style is ${style}.
        Write a beautiful, emotional, and well-paced narrative from start to finish. Include chapters if needed.
        Return your story wrapped in clean Markdown. Provide a # Title at the very top.`;

        console.log("[Director Tier] Generating continuous story...");
        const storyRes = await fetchWithFallback(systemPrompt, `Begin the story now.`, DIRECTOR_MODELS, { temperature: 0.8 });
        
        return { success: true, story: storyRes.data, context: storyRes.data };
    } catch(error) {
        return { success: false, error: error.message };
    }
};

// Extend Story (Rolling Summary technique to save tokens)
export const extendStory = async (previousContext, nextDirection) => {
    try {
        const systemPrompt = `You are a master storyteller extending an ongoing story. 
        Here is the previous context/story so far: 
        ---
        ${previousContext.substring(previousContext.length - 4000)}... (truncated for memory)
        ---
        Write the NEXT part of the story, picking up EXACTLY where it left off. Do not repeat the old text.
        User Direction for next part: ${nextDirection}`;

        console.log("[Director Tier] Extending story...");
        const storyRes = await fetchWithFallback(systemPrompt, `Write the next part of the story.`, DIRECTOR_MODELS, { temperature: 0.8 });
        
        return { success: true, nextPart: storyRes.data };
    } catch(error) {
        return { success: false, error: error.message };
    }
};

// ======================================================================
// 6. LEGACY GENERAL PROCESSOR (For basic tasks & Vision)
// ======================================================================
export const processWithFarmBrain = async (systemPrompt, userText = "", imageBase64 = null) => {
    try {
        // Combine directors and writers for general fast querying
        return await fetchWithFallback(systemPrompt, userText, GENERAL_MODELS, { imageBase64: imageBase64, temperature: 0.7 });
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// ======================================================================
// 7. IMAGE GENERATION ENGINE
// ======================================================================
export const generateImageWithFarmBrain = async (prompt) => {
    for (const model of IMAGE_MODELS) {
        console.log(`[AIBrain Image] Trying ${model.provider.toUpperCase()} : ${model.id}`);
        try {
            let base64Image = "";

            if (model.provider === 'hf') {
                const response = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${HF_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ inputs: prompt })
                });

                if (!response.ok) throw new Error(`HF API Error: ${response.status}`);
                const blob = await response.blob();
                
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

            console.log(`[AIBrain Image] Success! Generated by ${model.id}`);
            return { success: true, data: base64Image, modelUsed: model.id };

        } catch (error) {
            console.warn(`[AIBrain Image] Model ${model.id} failed. Error: ${error.message}. Falling back...`);
            continue; 
        }
    }
    return { success: false, error: "All Image Generation AI servers are currently busy or offline. Please try again later." };
};