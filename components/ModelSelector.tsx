import React from 'react';
import { Check, Bot, Sparkles, Network, Moon, Hexagon } from 'lucide-react';
import { Agent, OPENROUTER_FREE_MODELS, DEEPSEEK_MODELS, MOONSHOT_MODELS, GEMINI_MODELS } from '../types';

interface ModelSelectorProps {
  currentModel: string;
  onSelect: (model: string) => void;
  onClose: () => void;
  isOpen: boolean;
  visibleModels: string[]; // List of ALL visible model IDs across providers
  agents: Agent[];
  isThinkingEnabled: boolean;
  onToggleThinking: () => void;
  hasOpenRouterKey?: boolean;
  hasDeepSeekKey?: boolean;
  hasMoonshotKey?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
    currentModel, 
    onSelect, 
    onClose, 
    isOpen, 
    visibleModels,
    agents,
    isThinkingEnabled,
    onToggleThinking,
    hasOpenRouterKey,
    hasDeepSeekKey,
    hasMoonshotKey
}) => {
  if (!isOpen) return null;

  // Filter models based on what is in visibleModels
  const visibleGemini = GEMINI_MODELS.filter(m => visibleModels.includes(m));
  const visibleOpenRouter = OPENROUTER_FREE_MODELS.filter(m => visibleModels.includes(m));
  const visibleDeepSeek = DEEPSEEK_MODELS.filter(m => visibleModels.includes(m));
  const visibleMoonshot = MOONSHOT_MODELS.filter(m => visibleModels.includes(m));

  return (
    <>
      <div className="fixed inset-0 z-[40]" onClick={onClose} />
      <div className="absolute bottom-full right-0 mb-2 z-[50] w-[320px] bg-[#1A1A1A] border border-[#333] rounded-lg shadow-xl flex flex-col max-h-[500px] animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
        <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
          
          {/* Custom Agents Section */}
          {agents.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-[10px] font-bold text-[#525252] uppercase tracking-wider bg-[#1A1A1A] sticky top-0">Agents</div>
                {agents.map((agent) => (
                    <div
                    key={agent.id}
                    onClick={() => {
                        onSelect(agent.id); // We use ID for agents
                        onClose();
                    }}
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#262626] group"
                    >
                        <div className="flex items-center gap-2">
                            <Bot className="w-3.5 h-3.5 text-[#A78BFA]" />
                            <span className={`text-[13px] font-medium ${agent.id === currentModel ? 'text-white' : 'text-[#A1A1A1] group-hover:text-[#E5E5E5]'}`}>
                                {agent.name}
                            </span>
                        </div>
                        {agent.id === currentModel && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                ))}
                <div className="my-1 h-[1px] bg-[#262626]" />
              </>
          )}

          {/* Gemini Models */}
          {visibleGemini.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-[10px] font-bold text-[#525252] uppercase tracking-wider bg-[#1A1A1A] sticky top-0">Google Gemini</div>
                {visibleGemini.map((model) => (
                    <div
                    key={model}
                    onClick={() => {
                        onSelect(model);
                        onClose();
                    }}
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#262626] group"
                    >
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span className={`text-[13px] font-medium ${model === currentModel ? 'text-white' : 'text-[#A1A1A1] group-hover:text-[#E5E5E5]'}`}>
                            {model}
                        </span>
                    </div>
                    {model === currentModel && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                ))}
              </>
          )}

          {/* OpenRouter Models */}
          {hasOpenRouterKey && visibleOpenRouter.length > 0 && (
              <>
                  <div className="my-1 h-[1px] bg-[#262626]" />
                  <div className="px-4 py-1.5 text-[10px] font-bold text-[#525252] uppercase tracking-wider bg-[#1A1A1A] sticky top-0">OpenRouter (Free)</div>
                  {visibleOpenRouter.map((model) => (
                    <div
                      key={model}
                      onClick={() => {
                        onSelect(model);
                        onClose();
                      }}
                      className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#262626] group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Network className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                        <span className={`text-[13px] font-medium truncate ${model === currentModel ? 'text-white' : 'text-[#A1A1A1] group-hover:text-[#E5E5E5]'}`}>
                            {model.split(':')[0]}
                        </span>
                      </div>
                      {model === currentModel && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                    </div>
                  ))}
              </>
          )}

          {/* DeepSeek Models */}
          {hasDeepSeekKey && visibleDeepSeek.length > 0 && (
              <>
                  <div className="my-1 h-[1px] bg-[#262626]" />
                  <div className="px-4 py-1.5 text-[10px] font-bold text-[#525252] uppercase tracking-wider bg-[#1A1A1A] sticky top-0">DeepSeek</div>
                  {visibleDeepSeek.map((model) => (
                    <div
                      key={model}
                      onClick={() => {
                        onSelect(model);
                        onClose();
                      }}
                      className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#262626] group"
                    >
                      <div className="flex items-center gap-2">
                        <Hexagon className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span className={`text-[13px] font-medium ${model === currentModel ? 'text-white' : 'text-[#A1A1A1] group-hover:text-[#E5E5E5]'}`}>
                            {model}
                        </span>
                      </div>
                      {model === currentModel && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  ))}
              </>
          )}

          {/* Moonshot Models */}
          {hasMoonshotKey && visibleMoonshot.length > 0 && (
              <>
                  <div className="my-1 h-[1px] bg-[#262626]" />
                  <div className="px-4 py-1.5 text-[10px] font-bold text-[#525252] uppercase tracking-wider bg-[#1A1A1A] sticky top-0">Moonshot AI</div>
                  {visibleMoonshot.map((model) => (
                    <div
                      key={model}
                      onClick={() => {
                        onSelect(model);
                        onClose();
                      }}
                      className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#262626] group"
                    >
                      <div className="flex items-center gap-2">
                        <Moon className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span className={`text-[13px] font-medium ${model === currentModel ? 'text-white' : 'text-[#A1A1A1] group-hover:text-[#E5E5E5]'}`}>
                            {model}
                        </span>
                      </div>
                      {model === currentModel && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  ))}
              </>
          )}

        </div>
        
        <div className="p-3 border-t border-[#262626]">
            <div 
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleThinking();
                }}
                className="flex items-center justify-between text-[#A1A1A1] hover:text-[#E5E5E5] cursor-pointer group"
            >
                <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-[#E5E5E5]">Thinking</span>
                    <span className="text-[11px] text-[#737373]">Extended reasoning depth</span>
                </div>
                {/* Toggle switch visual */}
                <div className={`w-9 h-5 rounded-full relative border transition-colors duration-200 ${isThinkingEnabled ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[#262626] border-[#333]'}`}>
                    <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-200 ${isThinkingEnabled ? 'left-4' : 'left-0.5'}`}></div>
                </div>
            </div>
            {isThinkingEnabled && (
                <div className="mt-3 flex items-center justify-between text-[11px] text-[#525252] animate-in fade-in slide-in-from-top-1">
                    <span>Active</span>
                    <span>Reasoning enabled</span>
                </div>
            )}
        </div>
      </div>
    </>
  );
};