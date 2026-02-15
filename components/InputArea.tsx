import React, { useState, useRef, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { Attachment, Agent, Label, SessionStatus, SessionMode } from '../types';
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
}

const WaveLoaderSmall = () => (
  <div className="wave-container scale-[0.6] origin-center">
    {[...Array(9)].map((_, i) => <div key={i} className="wave-square" />)}
  </div>
);

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
    hasAnyKey = true
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  
  const [activeLabelId, setActiveLabelId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasAnyKey) return;
    if (e.key === 'Enter' && !e.shiftKey) {
        if (!currentModel && input.trim()) {
            e.preventDefault();
            setIsModelMenuOpen(true);
            return;
        }
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
      if (!currentModel) {
          setIsModelMenuOpen(true);
          return;
      }
      if ((!input.trim() && attachments.length === 0)) return;
      onSend(input, attachments, currentMode === 'execute', currentMode);
      setInput('');
      setAttachments([]);
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
      }
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

  const removeAttachment = (index: number) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const activeAgent = agents.find(a => a.id === currentModel);
  const StatusIcon = STATUS_CONFIG[currentStatus].icon;

  const MODE_CONFIG = {
    explore: { label: 'Explore', icon: Compass, description: 'Standard AI conversation mode' },
    execute: { label: 'Execute', icon: Zap, description: 'Advanced task execution mode' }
  };

  const getModelNameDisplay = () => {
    if (!hasAnyKey) return "Key Required";
    if (!currentModel) return "Select AI";
    if (activeAgent) return activeAgent.name;
    const parts = currentModel.split('/');
    return parts[parts.length - 1].split(':')[0];
  };

  return (
    <div className={`max-w-4xl mx-auto w-full px-1 md:px-4 mb-2 ${!hasAnyKey ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      <div className={`relative bg-[var(--input-bg)] border rounded-2xl shadow-2xl flex flex-col overflow-visible transition-all duration-300 border-[var(--border)]`}>
        
        <div className="flex items-center justify-between px-2.5 pt-2.5 pb-0.5 bg-transparent">
            <div className="relative">
                <button 
                    onClick={() => hasAnyKey && setIsModeMenuOpen(!isModeMenuOpen)}
                    disabled={!hasAnyKey}
                    className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] text-[10px] md:text-[11px] font-bold uppercase tracking-wider bg-[var(--bg-elevated)] px-2 py-1 rounded-lg border border-[var(--border)] transition-all hover:border-[var(--text-dim)] disabled:cursor-not-allowed"
                >
                    {currentMode === 'execute' && isLoading ? <WaveLoaderSmall /> : React.createElement(MODE_CONFIG[currentMode].icon, { className: "w-3 h-3" })}
                    <span>{MODE_CONFIG[currentMode].label}</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                </button>

                {isModeMenuOpen && hasAnyKey && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsModeMenuOpen(false)} />
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-bottom-left">
                            {(Object.keys(MODE_CONFIG) as SessionMode[]).map((mode) => (
                                <div
                                    key={mode}
                                    onClick={() => {
                                        onUpdateMode(mode);
                                        setIsModeMenuOpen(false);
                                    }}
                                    className={`flex flex-col px-3 py-2 cursor-pointer transition-colors ${
                                        currentMode === mode ? 'bg-[var(--bg-elevated)]' : 'hover:bg-[var(--bg-elevated)]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {mode === 'execute' && isLoading && currentMode === mode ? <WaveLoaderSmall /> : React.createElement(MODE_CONFIG[mode].icon, { className: `w-3 h-3 ${currentMode === mode ? 'text-[var(--text-main)]' : 'text-[var(--text-dim)]'}` })}
                                        <span className={`text-[12px] font-bold uppercase tracking-wide ${currentMode === mode ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{MODE_CONFIG[mode].label}</span>
                                    </div>
                                    <span className="text-[10px] text-[var(--text-dim)] font-medium">{MODE_CONFIG[mode].description}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-1.5">
                <div className="hidden sm:flex items-center gap-1.5">
                    {currentLabelIds.map(labelId => {
                        const label = availableLabels.find(l => l.id === labelId);
                        if (!label) return null;
                        return (
                            <div key={label.id} className="relative">
                                {activeLabelId === label.id && (
                                    <>
                                    <div className="fixed inset-0 z-40" onClick={() => setActiveLabelId(null)} />
                                    <div className="absolute bottom-full left-0 mb-2 w-28 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                        <div 
                                            onClick={() => {
                                                onUpdateLabels(label.id);
                                                setActiveLabelId(null);
                                            }}
                                            className="flex items-center gap-2 px-3 py-1.5 text-[#EF4444] hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span className="text-[11px] font-bold">Remove</span>
                                        </div>
                                    </div>
                                    </>
                                )}
                                
                                <button 
                                    onClick={() => setActiveLabelId(activeLabelId === label.id ? null : label.id)}
                                    className="flex items-center gap-2 text-[var(--text-main)] text-[11px] font-bold bg-[var(--bg-elevated)] px-2.5 py-1 rounded-lg border border-[var(--border)] transition-all hover:border-[var(--text-dim)] shadow-sm"
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }}></div>
                                    <span>{label.name}</span>
                                    <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                        className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] text-[10px] md:text-[11px] font-bold uppercase tracking-wider bg-[var(--bg-elevated)] px-2 py-1 rounded-lg border border-[var(--border)] transition-all hover:border-[var(--text-dim)]"
                    >
                        <StatusIcon className={`w-3.5 h-3.5 ${STATUS_CONFIG[currentStatus].color}`} />
                        <span className="hidden xs:inline">{STATUS_CONFIG[currentStatus].label}</span>
                        <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                    </button>
                    <StatusSelector 
                        isOpen={isStatusMenuOpen}
                        onClose={() => setIsStatusMenuOpen(false)}
                        currentStatus={currentStatus}
                        onSelect={onUpdateStatus}
                        position={{ bottom: 'calc(100% + 10px)', right: 0 }}
                    />
                </div>
            </div>
        </div>

        {attachments.length > 0 && (
            <div className="px-4 pt-2.5 flex gap-2.5 overflow-x-auto custom-scrollbar pb-1">
                {attachments.map((att, i) => (
                    <div key={i} className="relative group flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] flex items-center justify-center transition-transform hover:scale-105 shadow-md">
                            {att.type.startsWith('image/') ? (
                                <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                            ) : (
                                <FileIcon className="w-5 h-5 text-[var(--text-dim)]" />
                            )}
                        </div>
                        <button 
                            onClick={() => removeAttachment(i)}
                            className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-white rounded-full p-1 shadow-lg hover:bg-red-500 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!hasAnyKey}
          placeholder={!hasAnyKey ? "Add a key to unlock..." : (isLoading ? "Synthesizing response..." : (!currentModel ? "Select a model..." : "Ask Shuper..."))}
          className="w-full bg-transparent border-0 text-[var(--text-main)] placeholder-[var(--text-dim)] px-4 py-3 md:py-2 focus:ring-0 focus:outline-none resize-none min-h-[44px] max-h-[220px] overflow-y-auto custom-scrollbar text-[15px] font-medium disabled:cursor-not-allowed"
          rows={1}
        />

        <div className="flex items-center justify-between px-3 pb-3 pt-0 bg-transparent">
            <div className="flex items-center gap-2 px-1">
                <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!hasAnyKey}
                    className="text-[var(--text-dim)] hover:text-[var(--text-main)] transition-all p-2 rounded-xl hover:bg-[var(--bg-elevated)] disabled:cursor-not-allowed"
                    title="Attach file"
                >
                    <Paperclip className="w-4.5 h-4.5" />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative">
                    <button 
                        onClick={() => hasAnyKey && setIsModelMenuOpen(!isModelMenuOpen)}
                        className={`flex items-center gap-1.5 transition-all px-2.5 py-1.5 rounded-xl border font-bold uppercase tracking-wider text-[10px] md:text-[11px] ${!hasAnyKey ? 'bg-red-500/10 text-red-400 border-red-500/20' : (!currentModel && input.trim() ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent hover:bg-[var(--bg-elevated)] hover:border-[var(--border)]')}`}
                    >
                        {!hasAnyKey ? <AlertTriangle className="w-3.5 h-3.5" /> : (!currentModel && input.trim() && <AlertCircle className="w-3.5 h-3.5" />)}
                        <span className="truncate max-w-[90px] md:max-w-none uppercase">
                            {getModelNameDisplay()}
                        </span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    {hasAnyKey && (
                        <ModelSelector 
                            isOpen={isModelMenuOpen}
                            onClose={() => setIsModelMenuOpen(false)}
                            currentModel={currentModel}
                            onSelect={onSelectModel}
                            visibleModels={visibleModels}
                            agents={agents}
                            hasOpenRouterKey={hasOpenRouterKey}
                            hasDeepSeekKey={hasDeepSeekKey}
                            hasMoonshotKey={hasMoonshotKey}
                        />
                    )}
                </div>

                <button 
                    onClick={handleSend}
                    disabled={!hasAnyKey || ((!input.trim() && attachments.length === 0 && !isLoading) || (!currentModel && !isLoading))}
                    className={`w-9 h-9 md:w-8 md:h-8 rounded-xl transition-all duration-300 flex items-center justify-center ${
                        (!hasAnyKey || ((!input.trim() && attachments.length === 0 && !isLoading) || (!currentModel && !isLoading)))
                            ? 'bg-[var(--bg-elevated)] text-[var(--text-dim)] cursor-not-allowed opacity-50'
                            : isLoading 
                                ? 'bg-[var(--text-main)] text-[var(--bg-primary)] hover:scale-105 shadow-xl' 
                                : 'bg-[var(--text-main)] text-[var(--bg-primary)] hover:scale-105 shadow-lg'
                    }`}
                >
                    {isLoading ? <Square className="w-3 h-3 fill-current" /> : <ArrowUp className="w-5 h-5 md:w-4 md:h-4" strokeWidth={3} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};