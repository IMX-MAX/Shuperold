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
  Circle
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
    <div className="w-full max-w-3xl floating-input-shadow rounded-[24px] bg-[var(--input-bg)] border border-[var(--border)] overflow-visible">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
            <div className="relative">
                <button 
                  onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                  className="flex items-center gap-1.5 bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] px-2.5 py-1 rounded-lg border border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight transition-all"
                >
                  <Compass className="w-3 h-3" />
                  <span>{currentMode}</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-40" />
                </button>
                {isModeMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsModeMenuOpen(false)} />
                        <div className="absolute bottom-full left-0 mb-2 w-40 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-bottom-left">
                            {['explore', 'execute'].map((mode) => (
                                <div key={mode} onClick={() => { onUpdateMode(mode as SessionMode); setIsModeMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-[12px] font-bold uppercase ${currentMode === mode ? 'bg-[var(--bg-elevated)] text-white' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>
                                    <span>{mode}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
            <button 
                onClick={() => setIsStatusMenuOpen(true)}
                className="p-1 rounded hover:bg-[var(--bg-elevated)] transition-all group"
            >
                <StatusIcon className={`w-3.5 h-3.5 ${STATUS_CONFIG[currentStatus].color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            </button>
            <StatusSelector isOpen={isStatusMenuOpen} onClose={() => setIsStatusMenuOpen(false)} currentStatus={currentStatus} onSelect={onUpdateStatus} position={{ bottom: '100%', right: 0, marginBottom: '8px' }} />
        </div>

        {attachments.length > 0 && (
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 px-1">
                {attachments.map((att, i) => (
                    <div key={i} className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] flex items-center justify-center">
                            {att.type.startsWith('image/') ? <img src={att.data} alt={att.name} className="w-full h-full object-cover" /> : <FileIcon className="w-4 h-4 text-[var(--text-dim)]" />}
                        </div>
                        <button onClick={() => removeAttachment(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg"><X className="w-2 h-2" /></button>
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
          className="w-full bg-transparent border-0 text-[var(--text-main)] placeholder-[var(--text-dim)] px-2 py-1 focus:ring-0 focus:outline-none resize-none min-h-[40px] max-h-[200px] overflow-y-auto custom-scrollbar text-[15px] font-medium"
          rows={1}
        />

        <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-3">
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                <button onClick={() => fileInputRef.current?.click()} className="text-[var(--text-dim)] hover:text-white transition-all"><Paperclip className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <button 
                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                        className="text-[11px] font-bold text-[var(--text-dim)] hover:text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1 transition-all"
                    >
                        <span>{getModelNameDisplay()}</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    <ModelSelector isOpen={isModelMenuOpen} onClose={() => setIsModelMenuOpen(false)} currentModel={currentModel} onSelect={onSelectModel} visibleModels={visibleModels} agents={agents} hasOpenRouterKey={hasOpenRouterKey} hasDeepSeekKey={hasDeepSeekKey} hasMoonshotKey={hasMoonshotKey} />
                </div>
                <button 
                    onClick={handleSend} 
                    disabled={(!input.trim() && attachments.length === 0 && !isLoading)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${(!input.trim() && !isLoading) ? 'bg-[#8E8E93]/20 text-[#8E8E93]/40' : 'bg-[#8E8E93] text-[#1E1E1E] hover:bg-white hover:scale-105'}`}
                >
                    {isLoading ? <Square className="w-2.5 h-2.5 fill-current" /> : <ArrowUp className="w-4 h-4" strokeWidth={3} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};