
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Paperclip, 
  ArrowUp, 
  X, 
  Zap, 
  File as FileIcon,
  Loader2,
  RefreshCcw,
  ChevronDown,
  Trash2,
  Compass,
  Square,
  AlertCircle,
  AlertTriangle,
  Circle,
  Sparkles
} from 'lucide-react';
import { Attachment, Agent, Label, SessionStatus, SessionMode, GEMINI_MODELS, OPENROUTER_FREE_MODELS, DEEPSEEK_MODELS, MOONSHOT_MODELS } from '../types';
import { ModelSelector } from './ModelSelector';
import { StatusSelector, STATUS_CONFIG } from './StatusSelector';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[], useThinking: boolean, mode: SessionMode) => void;
  onStop?: () => void;
  isLoading: boolean;
  currentStatus: SessionStatus;
  currentLabelIds: string[];
  availableLabels: Label[];
  onUpdateStatus: (status: SessionStatus) => void;
  onUpdateLabels: (labelId: string) => void;
  onCreateLabel: (label: Label) => void;
  visibleModels: string[];
  agents: Agent[];
  currentModel: string;
  onSelectModel: (model: string) => void;
  sendKey: 'Enter' | 'Ctrl+Enter';
  hasOpenRouterKey?: boolean;
  hasDeepSeekKey?: boolean;
  hasMoonshotKey?: boolean;
  currentMode: SessionMode;
  onUpdateMode: (mode: SessionMode) => void;
  hasAnyKey?: boolean;
  onUpArrow?: () => void;
  externalValue?: string;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
    onSend, 
    onStop,
    isLoading,
    currentStatus,
    currentLabelIds,
    availableLabels,
    onUpdateStatus,
    onUpdateLabels,
    visibleModels,
    agents,
    currentModel,
    onSelectModel,
    sendKey,
    hasOpenRouterKey,
    hasDeepSeekKey,
    hasMoonshotKey,
    currentMode,
    onUpdateMode,
    hasAnyKey = true,
    onUpArrow,
    externalValue
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalValue !== undefined && externalValue !== null && externalValue !== '') {
      setInput(externalValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(externalValue.length, externalValue.length);
        }
      }, 0);
    }
  }, [externalValue]);

  const isCurrentModelValid = useMemo(() => {
    if (!currentModel) return false;
    const agent = agents.find(a => a.id === currentModel);
    const targetModelId = agent ? agent.baseModel : currentModel;
    if (GEMINI_MODELS.includes(targetModelId)) return !!process.env.API_KEY;
    if (OPENROUTER_FREE_MODELS.includes(targetModelId) || targetModelId.includes(':free')) return !!hasOpenRouterKey;
    if (DEEPSEEK_MODELS.includes(targetModelId)) return !!hasDeepSeekKey;
    if (MOONSHOT_MODELS.includes(targetModelId)) return !!hasMoonshotKey;
    return false;
  }, [currentModel, agents, hasOpenRouterKey, hasDeepSeekKey, hasMoonshotKey]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasAnyKey) return;
    if (e.key === 'ArrowUp' && input.trim() === '' && onUpArrow) {
      e.preventDefault();
      onUpArrow();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
        if (sendKey === 'Enter' && !e.ctrlKey) {
            e.preventDefault();
            handleSend();
        } else if (sendKey === 'Ctrl+Enter' && e.ctrlKey) {
            e.preventDefault();
            handleSend();
        }
    }
  };

  const handleSend = () => {
      if (!hasAnyKey) return;
      if (isLoading) {
          onStop?.();
          return;
      }
      if (!input.trim() && attachments.length === 0) return;
      onSend(input, attachments, currentMode === 'execute', currentMode);
      setInput('');
      setAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          Array.from(e.target.files).forEach((file: File) => {
              const reader = new FileReader();
              reader.onload = (readerEvent) => {
                  if (readerEvent.target?.result) {
                      setAttachments(prev => [...prev, {
                          name: file.name,
                          type: file.type,
                          data: readerEvent.target!.result as string,
                          size: file.size
                      }]);
                  }
              };
              reader.readAsDataURL(file);
          });
      }
  };

  const removeAttachment = (index: number) => setAttachments(prev => prev.filter((_, i) => i !== index));

  const activeAgent = agents.find(a => a.id === currentModel);
  const getModelNameDisplay = () => {
    if (!hasAnyKey) return "KEY REQUIRED";
    if (activeAgent) return activeAgent.name;
    const parts = currentModel.split('/');
    return parts[parts.length - 1].split(':')[0];
  };

  const StatusIcon = STATUS_CONFIG[currentStatus].icon;

  return (
    <div id="tour-input-area" className="w-full max-w-3xl floating-input-shadow rounded-[24px] bg-[var(--input-bg)] border border-[var(--border)] overflow-visible">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
            <div className="relative">
                <button 
                  onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                  className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#222] px-3 py-1.5 rounded-xl border border-white/5 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest transition-all active:scale-95 group"
                >
                  {currentMode === 'explore' ? <Compass className="w-3 h-3 group-hover:rotate-12 transition-transform" /> : <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition-transform" />}
                  <span>{currentMode}</span>
                  <ChevronDown className={`w-3 h-3 opacity-30 transition-transform duration-200 ${isModeMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isModeMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsModeMenuOpen(false)} />
                        <div className="absolute bottom-full left-0 mb-3 w-44 bg-[#141414] border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-bottom-left backdrop-blur-xl">
                            <div 
                              onClick={() => { onUpdateMode('explore'); setIsModeMenuOpen(false); }} 
                              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${currentMode === 'explore' ? 'bg-white/5 text-white' : 'text-[#555] hover:text-white hover:bg-white/5'}`}
                            >
                                <span className="text-[12px] font-black uppercase tracking-widest">Explore</span>
                                {currentMode === 'explore' && <Compass className="w-3.5 h-3.5" />}
                            </div>
                            <div 
                              onClick={() => { onUpdateMode('execute'); setIsModeMenuOpen(false); }} 
                              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${currentMode === 'execute' ? 'bg-white/5 text-white' : 'text-[#555] hover:text-white hover:bg-white/5'}`}
                            >
                                <span className="text-[12px] font-black uppercase tracking-widest">Execute</span>
                                {currentMode === 'execute' && <RefreshCcw className="w-3.5 h-3.5" />}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <button 
                onClick={() => setIsStatusMenuOpen(true)}
                className="p-1 rounded-full hover:bg-white/5 transition-all group active:scale-90"
            >
                <StatusIcon className={`w-4 h-4 ${STATUS_CONFIG[currentStatus].color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            </button>
            <StatusSelector isOpen={isStatusMenuOpen} onClose={() => setIsStatusMenuOpen(false)} currentStatus={currentStatus} onSelect={onUpdateStatus} position={{ bottom: '100%', right: 0, marginBottom: '8px' }} />
        </div>

        {attachments.length > 0 && (
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 px-1">
                {attachments.map((att, i) => (
                    <div key={i} className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl border border-white/5 overflow-hidden bg-[#1A1A1A] flex items-center justify-center group/att">
                            {att.type.startsWith('image/') ? <img src={att.data} alt={att.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/att:scale-110" /> : <FileIcon className="w-5 h-5 text-[var(--text-dim)]" />}
                        </div>
                        {/* Use the correct index variable 'i' from map instead of 'index' */}
                        <button onClick={() => removeAttachment(i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-xl hover:bg-red-600 transition-colors"><X className="w-2.5 h-2.5" /></button>
                    </div>
                ))}
            </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Generating..." : "Ask Shuper..."}
          className="w-full bg-transparent border-0 text-[var(--text-main)] placeholder-[var(--text-dim)] px-2 py-1 focus:ring-0 focus:outline-none resize-none min-h-[40px] max-h-[200px] overflow-y-auto custom-scrollbar text-[16px] font-medium leading-relaxed"
          rows={1}
        />

        <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-3">
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-xl text-[var(--text-dim)] hover:text-white hover:bg-white/5 transition-all"><Paperclip className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <button 
                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                        className="text-[11px] font-black text-[var(--text-dim)] hover:text-[var(--text-muted)] uppercase tracking-[0.15em] flex items-center gap-2 transition-all px-2 py-1 rounded-lg hover:bg-white/5"
                    >
                        <span>{getModelNameDisplay()}</span>
                        <ChevronDown className="w-3 h-3 opacity-30" />
                    </button>
                    <ModelSelector isOpen={isModelMenuOpen} onClose={() => setIsModelMenuOpen(false)} currentModel={currentModel} onSelect={onSelectModel} visibleModels={visibleModels} agents={agents} hasOpenRouterKey={hasOpenRouterKey} hasDeepSeekKey={hasDeepSeekKey} hasMoonshotKey={hasMoonshotKey} />
                </div>
                <button 
                    onClick={handleSend} 
                    disabled={(!input.trim() && attachments.length === 0 && !isLoading)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${(!input.trim() && !isLoading) ? 'bg-[#333]/50 text-[#555]' : 'bg-white text-black hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-90'}`}
                >
                    {isLoading ? <div className="w-2.5 h-2.5 bg-current rounded-[1px] animate-pulse" /> : <ArrowUp className="w-4.5 h-4.5" strokeWidth={3} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
