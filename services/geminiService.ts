
import { GoogleGenAI } from "@google/genai";
import { Attachment, OPENROUTER_FREE_MODELS, SessionMode } from "../types";

/**
 * Generates a concise title for a session using the Gemini API.
 * Adheres to the rule of using process.env.API_KEY exclusively for Gemini calls.
 */
export const generateSessionTitle = async (
  history: {role: string, parts: any[]}[], 
  currentTitle: string,
  _apiKey?: string // Parameter ignored as process.env.API_KEY is mandated by instructions
): Promise<string> => {
  // Always use process.env.API_KEY directly for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.slice(-8), // use recent context to keep it efficient
        { 
          role: 'user', 
          parts: [{ text: "Based on the conversation context above, provide a very short session title (5 words max). Respond with ONLY the title." }] 
        }
      ],
      config: {
        temperature: 0.7,
      }
    });
    // Access .text property directly as per @google/genai extraction rules
    return response.text?.trim() || currentTitle;
  } catch (error) {
    console.error("Title generation error:", error);
    return currentTitle;
  }
};

/**
 * Sends a message to Gemini using the Google GenAI SDK.
 */
export const sendMessageToGemini = async (
  message: string, 
  history: {role: string, parts: any[]}[], 
  systemInstruction: string | undefined,
  attachments: Attachment[] = [],
  useThinking: boolean = false,
  onUpdate?: (content: string, thoughtProcess?: string) => void,
  apiKeyFromSettings?: string,
  modelName: string = 'gemini-3-flash-preview',
  mode: SessionMode = 'explore'
): Promise<{ text: string; thoughtProcess?: string }> => {
  
  // --- PROVIDER ROUTING LOGIC ---
  const isOpenRouter = OPENROUTER_FREE_MODELS.includes(modelName);
  const isDeepSeek = modelName.startsWith('deepseek-');
  const isMoonshot = modelName.startsWith('moonshot-');

  let actualModel = modelName;
  if (mode === 'execute' && !isOpenRouter && !isDeepSeek && !isMoonshot) {
      actualModel = 'gemini-3-pro-preview';
  }

  if (isOpenRouter || isDeepSeek || isMoonshot) {
      return sendMessageToOpenAICompatible(
          message, 
          history, 
          systemInstruction, 
          useThinking, 
          onUpdate, 
          apiKeyFromSettings, 
          actualModel
      );
  }

  // --- GOOGLE GEMINI SDK LOGIC ---
  // Mandatory: Use process.env.API_KEY for GoogleGenAI initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const currentParts: any[] = [];
    if (message && message.trim()) currentParts.push({ text: message });
    
    attachments.forEach(att => {
        const base64Data = att.data.split(',')[1] || att.data;
        currentParts.push({
            inlineData: {
                mimeType: att.type,
                data: base64Data
            }
        });
    });

    if (currentParts.length === 0) currentParts.push({ text: " " });

    let finalSystemInstruction = systemInstruction || "";
    
    if (mode === 'execute') {
        finalSystemInstruction += "\nYou are in EXECUTE mode. Be extremely precise, thorough, and provide the most advanced technical solution possible. Utilize your maximum reasoning depth.";
    }

    const config: any = {
        systemInstruction: finalSystemInstruction.trim() || undefined,
    };

    // Apply thinking config for supported Gemini 3/2.5 models
    if (mode === 'execute') {
        config.thinkingConfig = { thinkingBudget: 32768 }; 
    } else if (useThinking) {
        config.thinkingConfig = { thinkingBudget: 16000 };
    }

    const responseStream = await ai.models.generateContentStream({
      model: actualModel,
      contents: [...history, { role: 'user', parts: currentParts }],
      config: config
    });

    let fullText = "";
    
    for await (const chunk of responseStream) {
      // Access the .text property of the chunk directly (not a function call)
      const chunkText = chunk.text || "";
      fullText += chunkText;

      if (onUpdate) {
        onUpdate(fullText, undefined); 
      }
    }

    return { text: fullText };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { text: `Error: ${error.message || "Failed to communicate with Gemini"}` };
  }
};

/**
 * Internal helper for OpenAI-compatible streaming chat completions.
 * Fixes truncated implementation issue.
 */
const sendMessageToOpenAICompatible = async (
    message: string, 
    history: {role: string, parts: any[]}[], 
    systemInstruction: string | undefined,
    useThinking: boolean,
    onUpdate: ((content: string, thoughtProcess?: string) => void) | undefined,
    apiKey: string | undefined, 
    modelName: string
): Promise<{ text: string; thoughtProcess?: string }> => {
    
    if (!apiKey) return { text: `${modelName} API Key missing. Please add it in Settings.` };

    let baseUrl = '';
    if (modelName.startsWith('deepseek-')) baseUrl = 'https://api.deepseek.com';
    else if (modelName.startsWith('moonshot-')) baseUrl = 'https://api.moonshot.cn/v1';
    else baseUrl = 'https://openrouter.ai/api/v1';

    const messages = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });

    history.forEach(h => {
        const content = h.parts.map(p => p.text).join(' ');
        if (content.trim()) messages.push({ role: h.role === 'model' ? 'assistant' : 'user', content });
    });

    messages.push({ role: 'user', content: message });

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: modelName,
                messages: messages,
                stream: true
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = (buffer + chunk).split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed === 'data: [DONE]') break;
                if (!trimmed.startsWith('data: ')) continue;

                try {
                    const json = JSON.parse(trimmed.slice(6));
                    const content = json.choices[0]?.delta?.content || '';
                    if (content) {
                        fullText += content;
                        if (onUpdate) onUpdate(fullText);
                    }
                } catch (e) {
                    console.error("Error parsing stream chunk", e);
                }
            }
        }
        return { text: fullText };
    } catch (error: any) {
        console.error(`${modelName} API Error:`, error);
        return { text: `Error: ${error.message || "Failed to communicate with API"}` };
    }
};
