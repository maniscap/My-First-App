// src/Utilities/AIBrain.js
import axios from 'axios';

// 1. The Fallback Matrices (Separated by capability for robust execution)

// --- ISOLATED MODEL TIERS ---
const GEMINI_MODELS = [
    { provider: 'gemini', id: 'gemini-2.5-pro', vision: true, desc: "Gemini 2.5 Pro" },
    { provider: 'gemini', id: 'gemini-1.5-pro-latest', vision: true, desc: "Gemini 1.5 Pro" },
    { provider: 'gemini', id: 'gemini-1.5-flash-latest', vision: true, desc: "Gemini 1.5 Flash" },
    // Note: Many older experimental/versioned models returned 404s and have been removed or updated.
    // For example, 'gemini-1.5-pro' is now 'gemini-1.5-pro-latest'.
    { provider: 'gemini', id: 'gemini-pro', vision: false, desc: "Gemini 1.0 Pro" },
    { provider: 'gemini', id: 'gemini-pro-vision', vision: true, desc: "Gemini 1.0 Pro Vision" },
    { provider: 'gemini', id: 'gemini-ultra', vision: true, desc: "Gemini Ultra" },
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
    { provider: 'groq', id: 'gemma2-9b-it', vision: false, desc: "Gemma 2 9B" }
];

const OPENROUTER_MODELS = [
    // Note: Many free models on OpenRouter were returning 404s and have been replaced with more stable options.
    { provider: 'openrouter', id: 'google/gemini-flash-1.5', vision: true, desc: "OR Gemini 1.5 Flash" },
    { provider: 'openrouter', id: 'meta-llama/llama-3-8b-instruct:free', vision: false, desc: "OR Llama-3 8B" },
    { provider: 'openrouter', id: 'mistralai/mistral-7b-instruct:free', vision: false, desc: "OR Mistral 7B" },
    { provider: 'openrouter', id: 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free', vision: false, desc: "OR Hermes 2 Mixtral" },
    { provider: 'openrouter', id: 'huggingfaceh4/zephyr-7b-beta:free', vision: false, desc: "OR Zephyr 7B" },
    { provider: 'openrouter', id: 'meta-llama/llama-3-70b-instruct', vision: false, desc: "OR Llama-3 70B" },
    { provider: 'openrouter', id: 'anthropic/claude-3-haiku', vision: true, desc: "OR Claude 3 Haiku" },
    { provider: 'openrouter', id: 'microsoft/wizardlm-2-8x22b', vision: false, desc: "OR WizardLM-2 8x22B" },
];

// CORS ERROR: Hugging Face models have been removed. The HF Inference API does not support
// direct calls from a web browser due to its security policy (CORS). To use these models,
// you must create a backend proxy server to forward requests. Since you requested to avoid
// a serverless/backend solution for now, these models are disabled.
const HF_MODELS = [];

// DIRECTORS: The Top 30 Reasoning Models spanning across all 4 API providers.
// Extremely robust JSON planning outline generation.
const DIRECTOR_MODELS = [
    GEMINI_MODELS[0], // Gemini 2.5 Pro
    GROQ_MODELS[0],   // Llama 3.3 70B
    OPENROUTER_MODELS[0], // OR Gemini 1.5 Flash
    GEMINI_MODELS[1], // Gemini 1.5 Pro
    GROQ_MODELS[2],   // DeepSeek R1 70B
    OPENROUTER_MODELS[3], // OR Hermes 2 Mixtral
    GEMINI_MODELS[2], // Gemini 1.5 Flash
    GROQ_MODELS[5],   // Mixtral 8x7B
    OPENROUTER_MODELS[1], // OR Llama-3 8B
    GEMINI_MODELS[3], // Gemini 1.0 Pro
    GROQ_MODELS[6],   // Qwen 2.5 32B
    OPENROUTER_MODELS[4], // OR Zephyr 7B
    GEMINI_MODELS[4], // Gemini 1.0 Pro Vision
    GROQ_MODELS[3],   // Llama 3.2 90B Vision
    OPENROUTER_MODELS[6], // OR Claude 3 Haiku
    GROQ_MODELS[1],   // Llama 3.3 70B SpecDec
    OPENROUTER_MODELS[5], // OR Llama-3 70B
    GROQ_MODELS[7],   // Llama 3.1 8B
    OPENROUTER_MODELS[7], // OR WizardLM-2
    GROQ_MODELS[8]    // Gemma 2 9B
].filter(Boolean); // Filter out any undefined entries from removing HF

// 6 WRITER TEAMS: Explicitly structured so EACH team starts with unique models from all 4 providers,
// and then fills up to exactly 20 fallback models per team, offset to completely prevent cascades!
const WRITER_POOLS = Array.from({ length: 6 }, (_, teamIndex) => {
    const pool = [];
    const providers = [GEMINI_MODELS, GROQ_MODELS, OPENROUTER_MODELS, HF_MODELS].filter(p => p.length > 0);

    // 1. Primary: Guaranteed unique Gemini Model
    pool.push(GEMINI_MODELS[teamIndex % GEMINI_MODELS.length]);
    // 2. Secondary: Guaranteed unique Groq Model
    pool.push(GROQ_MODELS[teamIndex % GROQ_MODELS.length]);
    // 3. Tertiary: Guaranteed unique OpenRouter Model
    pool.push(OPENROUTER_MODELS[teamIndex % OPENROUTER_MODELS.length]);
    
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
    { provider: 'gemini', id: 'imagen-3.0-fast-generate-001', imageGen: true, desc: "Google Imagen 3 Fast" },
];

// GENERAL BACKUP QUEUE (Merged lists deduplicated for legacy `processWithFarmBrain` support)
// We use a Map to ensure no duplicate models appear in the general fallback loop
const GENERAL_MODELS = [...new Map(
    [...DIRECTOR_MODELS, ...WRITER_POOLS.flat()].map(model => [model.id, model])
).values()];

// 2. CORE WATERFALL ENGINE
// Keeps the fallback loop on the client, but executes the actual prompt securely on the server!
const fetchWithFallback = async (systemPrompt, userText, modelMatrix, options = {}) => {
    const { imageBase64 = null } = options;
    const requiresVision = imageBase64 !== null;
    const validModels = modelMatrix.filter(model => requiresVision ? model.vision === true : true);

    for (const model of validModels) {
        console.log(`[AIBrain Engine] 🔄 Trying ${model.provider.toUpperCase()} : ${model.id}...`);
        try {
            const response = await axios.post('/api/AIBrain', {
                action: 'fetchCompletion',
                model: model,
                systemPrompt,
                userText,
                options
            });
            
            if (response.data && response.data.success) {
                console.log(`[AIBrain Engine] ✅ SUCCESS! ${model.id} generated ${response.data.data.length} characters!`);
                return { success: true, data: response.data.data, modelUsed: model.id };
            } else {
                throw new Error(response.data.error || "Unknown backend error");
            }
        } catch (error) {
            const errMsg = error.response?.data?.error || error.message || "";
            const isRateLimit = errMsg.includes('429');
            const isDeadOrBad = errMsg.includes('404') || errMsg.includes('400');

            if (isRateLimit) {
                console.warn(`[AIBrain Engine] ⚠️ ${model.id} hit Rate Limit (429). Jumping to fallback instantly.`);
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
// 3. EDUCATIONAL BOOK TRACK (Planner - Worker Pattern)
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

        // Step 2: The Execution generated by Writers SEQUENTIALLY
        // RATE LIMIT FIX: We now generate chapters one-by-one (sequentially) instead of all at once (in parallel).
        // This is a much more stable approach that prevents API rate limits and server crashes,
        // ensuring that even very large books can be generated reliably.
        console.log(`[Writer Tier] Beginning sequential generation for ${extractedChapters.length} chapters...`);
        const chaptersResults = [];

        for (const [index, chap] of extractedChapters.entries()) {
            // Distribute the chapters evenly across the 6 writer pools to avoid rate limiting
            const writerPool = WRITER_POOLS[index % WRITER_POOLS.length];
            let attempt = 0;
            const MAX_RETRIES = 3;
            let chapterResult = null;

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
                    
                    CRITICAL LENGTH REQUIREMENT: You MUST write a lengthy, comprehensive, and highly detailed continuous text. Aim for roughly 1500 to 2500 words. Provide deep practical and theoretical details. Do NOT make it short.
                    FORMATTING RULES: Write the entire chapter as ONE single continuous flow of paragraphs. 
                    Do NOT divide the text into "Part 1", "Part 2", "Page 1", etc. 
                    Do NOT include the chapter title or "Chapter X" at the very beginning of your text. I will add the heading automatically.
                    Just write the pure, engaging content paragraphs directly without any subtitles.`;
                    
                    // Enforcing a much larger minimum length requirement of 800 chars
                    const res = await fetchWithFallback(writerPrompt, `Write ONLY the content for Chapter ${index + 1}. Keep it highly detailed and lengthy.`, writerPool, { temperature: 0.7, minLength: 800 });
                    
                    // FIRE EVENT: Let the UI know this specific chapter is fully generated!
                    if (onProgress) onProgress({ step: 'CHAPTER', index: index, title: chap.chapter_title || chap.title, content: res.data });
                    
                    chapterResult = { success: true, title: chap.chapter_title || chap.title, content: res.data, index: index };
                    break; // Success, exit the retry loop for this chapter.

                } catch (error) {
                    console.error(`[Chapter ${index + 1} Error] ❌ Attempt ${attempt}/${MAX_RETRIES} failed. Directors are re-dispatching Writer Team ${index + 1}...`);
                    if (attempt >= MAX_RETRIES) {
                        // Failsafe escape hatch so the app doesn't hang forever if the internet dies
                        const failMsg = `⚠️ Chapter ${index + 1} could not be generated after ${MAX_RETRIES} attempts due to server traffic. Please try generating this chapter again later.`;
                        if (onProgress) onProgress({ step: 'CHAPTER', index: index, title: chap.chapter_title || chap.title, content: failMsg });
                        chapterResult = { success: false, title: chap.chapter_title || chap.title, content: failMsg, index: index };
                        break; // Max retries reached, exit the loop.
                    }
                    // EXPONENTIAL BACKOFF: Wait longer after each failure to avoid hammering the API.
                    await new Promise(resolve => setTimeout(resolve, 10000 * attempt));
                }
            }
            chaptersResults.push(chapterResult);
            // Add a small, safe delay between finishing one chapter and starting the next.
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
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
// 4. STORY BOOK TRACK (Continuous One-Shot Generation)
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
// 5. LEGACY GENERAL PROCESSOR (For basic tasks & Vision)
// ======================================================================
export const processWithFarmBrain = async (systemPrompt, userText = "", imageBase64 = null) => {
    try {
        // Combine directors and writers for general fast querying
        return await fetchWithFallback(systemPrompt, userText, GENERAL_MODELS, { imageBase64: imageBase64, temperature: 0.7 });
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// Specialized wrapper for SmartLens and other direct AI analysis tasks
export const analyzeWithAIBrain = async (userText, imageBase64 = null) => {
    const systemPrompt = "You are an expert agricultural AI. Analyze the provided image or text and give precise farming advice.";
    const result = await processWithFarmBrain(systemPrompt, userText, imageBase64);
    if (result.success) return result.data;
    throw new Error(result.error || "AI Analysis failed");
}

// ======================================================================
// 6. IMAGE GENERATION ENGINE
// ======================================================================
export const generateImageWithFarmBrain = async (prompt) => {
    for (const model of IMAGE_MODELS) {
        console.log(`[AIBrain Image] Trying ${model.provider.toUpperCase()} : ${model.id}`);
        try {
            const response = await axios.post('/api/AIBrain', {
                action: 'generateImage',
                model: model,
                prompt: prompt
            });

            if (response.data && response.data.success) {
                console.log(`[AIBrain Image] Success! Generated by ${model.id}`);
                return { success: true, data: response.data.data, modelUsed: model.id };
            } else {
                throw new Error(response.data.error || "Image generation failed");
            }
        } catch (error) {
            console.warn(`[AIBrain Image] Model ${model.id} failed. Error: ${error.response?.data?.error || error.message}. Falling back...`);
            continue; 
        }
    }
    return { success: false, error: "All Image Generation AI servers are currently busy or offline. Please try again later." };
};