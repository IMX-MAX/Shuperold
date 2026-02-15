import { GoogleGenAI } from "@google/genai";
import { Attachment, OPENROUTER_FREE_MODELS, SessionMode } from "../types";

/**
 * Generates a concise title for a session using the Gemini API.
 * Adheres to the rule of using process.env.API_KEY exclusively for Gemini calls.
 */
export const generateSessionTitle = async (
  history: {role: string, parts: any[]}[], 
  currentTitle: string,
  _apiKey?: string 
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const chatHistory = history.slice(-6).map(h => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: h.parts
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...chatHistory,
        { 
          role: 'user', 
          parts: [{ text: "Summarize this conversation into a 3-5 word title. Return ONLY the title text, no quotes or punctuation." }] 
        }
      ],
      config: {
        temperature: 0.5,
      }
    });
    
    return response.text?.trim() || currentTitle;
  } catch (error) {
    console.error("Title generation error:", error);
    return currentTitle;
  }
};

/**
 * Sends a message to Gemini or an OpenAI-compatible provider.
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
  
  const trimmedModel = modelName.trim();
  const isOpenRouter = OPENROUTER_FREE_MODELS.includes(trimmedModel) || trimmedModel.includes(':free');
  const isDeepSeek = trimmedModel.startsWith('deepseek-');
  const isMoonshot = trimmedModel.startsWith('moonshot-');

  let actualModel = trimmedModel;
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
        finalSystemInstruction += "\nYou are in EXECUTE mode. Be extremely precise, thorough, and provide the most advanced technical solution possible.";
    }

    const config: any = {
        systemInstruction: finalSystemInstruction.trim() || undefined,
    };

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
      const chunkText = chunk.text || "";
      fullText += chunkText;
      if (onUpdate) onUpdate(fullText, undefined); 
    }

    return { text: fullText };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { text: `Error: ${error.message || "Failed to communicate with Gemini"}` };
  }
};

/**
 * Internal helper for OpenAI-compatible streaming chat completions (OpenRouter, DeepSeek, Moonshot).
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
    
    if (!apiKey) return { text: `API Key for ${modelName} missing. Please add it in Settings.` };

    let fullUrl = '';
    const trimmedModel = modelName.trim();
    
    if (trimmedModel.startsWith('deepseek-')) {
        fullUrl = 'https://api.deepseek.com/chat/completions';
    } else if (trimmedModel.startsWith('moonshot-')) {
        fullUrl = 'https://api.moonshot.cn/v1/chat/completions';
    } else {
        // Default to OpenRouter
        fullUrl = 'https://openrouter.ai/api/v1/chat/completions';
    }

    const messages = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });

    history.forEach(h => {
        const content = h.parts.map(p => p.text).join(' ');
        if (content.trim()) {
            messages.push({ role: h.role === 'model' ? 'assistant' : 'user', content });
        }
    });

    messages.push({ role: 'user', content: message });

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Shuper Workspace'
            },
            body: JSON.stringify({
                model: trimmedModel,
                messages: messages,
                stream: true
            })
        });

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage += ` - ${errorData.error?.message || errorData.error || 'Unknown error'}`;
            } catch (e) {
                // If it's not JSON, try text
                const text = await response.text().catch(() => '');
                if (text) errorMessage += ` - ${text.slice(0, 100)}`;
            }
            throw new Error(errorMessage);
        }
        
        if (!response.body) throw new Error("No response body received from provider.");

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
                    // Silently catch partial JSON chunks in stream
                }
            }
        }
        return { text: fullText };
    } catch (error: any) {
        console.error(`${trimmedModel} API Error:`, error);
        return { text: `${error.message || "Failed to communicate with provider API"}` };
    }
};