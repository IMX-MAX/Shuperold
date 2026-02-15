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
  AlertCircle
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
    onUpdateMode
}) => {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
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
      if (isLoading) {
          onStop?.();
          return;
      }
      if (!currentModel) {
          setIsModelMenuOpen(true);
          return;
      }
      if ((!input.trim() && attachments.length === 0)) return;
      onSend(input, attachments, isThinking, currentMode);
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

  const handlePaste = (e: React.ClipboardEvent) => {
      if (e.clipboardData.files.length > 0) {
          e.preventDefault();
          Array.from(e.clipboardData.files).forEach((file: File) => {
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
    explore: { label: 'Explore', icon: Compass, description: 'Normal AI response mode' },
    execute: { label: 'Execute', icon: RefreshCcw, description: 'Advanced AI execution mode' }
  };

  const getModelNameDisplay = () => {
    if (!currentModel) return "Select AI";
    if (activeAgent) return activeAgent.name;
    const parts = currentModel.split('/');
    return parts[parts.length - 1].split(':')[0];
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-1 md:px-4 mb-2">
      <div className={`relative bg-[#1A1A1A] border rounded-xl shadow-2xl flex flex-col overflow-visible transition-all duration-200 ${!currentModel && input.trim() ? 'border-amber-500/50 bg-amber-500/5' : 'border-[#2A2A2A]'}`}>
        
        <div className="flex items-center justify-between px-2 pt-2 pb-0.5 bg-transparent">
            <div className="relative">
                <button 
                    onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                    className="flex items-center gap-1 md:gap-1.5 text-[#888] hover:text-[#E5E5E5] text-[10px] md:text-[11px] font-medium bg-[#242424] px-1.5 py-1 md:px-2 md:py-1 rounded-md border border-[#2A2A2A] transition-colors hover:border-[#333]"
                >
                    {React.createElement(MODE_CONFIG[currentMode].icon, { className: "w-3 h-3" })}
                    <span>{MODE_CONFIG[currentMode].label}</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                </button>

                {isModeMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsModeMenuOpen(false)} />
                        <div className="absolute bottom-full left-0 mb-1 w-44 bg-[#1F1F1F] border border-[#333] rounded-lg shadow-2xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-bottom-left">
                            {(Object.keys(MODE_CONFIG) as SessionMode[]).map((mode) => (
                                <div
                                    key={mode}
                                    onClick={() => {
                                        onUpdateMode(mode);
                                        setIsModeMenuOpen(false);
                                    }}
                                    className={`flex flex-col px-3 py-1.5 cursor-pointer transition-colors ${
                                        currentMode === mode ? 'bg-[#2A2A2A]' : 'hover:bg-[#2A2A2A]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {React.createElement(MODE_CONFIG[mode].icon, { className: `w-3 h-3 ${currentMode === mode ? 'text-white' : 'text-[#737373]'}` })}
                                        <span className={`text-[11px] font-medium ${currentMode === mode ? 'text-white' : 'text-[#A1A1A1]'}`}>{MODE_CONFIG[mode].label}</span>
                                    </div>
                                    <span className="text-[9px] text-[#525252]">{MODE_CONFIG[mode].description}</span>
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
                                    <div className="absolute bottom-full left-0 mb-1 w-28 bg-[#1F1F1F] border border-[#333] rounded-lg shadow-xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                        <div 
                                            onClick={() => {
                                                onUpdateLabels(label.id);
                                                setActiveLabelId(null);
                                            }}
                                            className="flex items-center gap-2 px-2 py-1 text-[#EF4444] hover:bg-[#2A2A2A] cursor-pointer"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">Remove</span>
                                        </div>
                                    </div>
                                    </>
                                )}
                                
                                <button 
                                    onClick={() => setActiveLabelId(activeLabelId === label.id ? null : label.id)}
                                    className="flex items-center gap-1.5 text-[#E5E5E5] text-[11px] font-medium bg-[#242424] px-2 py-1 rounded-md border border-[#2A2A2A] transition-colors hover:border-[#333]"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: label.color }}></div>
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
                        className="flex items-center gap-1 md:gap-1.5 text-[#888] hover:text-[#E5E5E5] text-[10px] md:text-[11px] font-medium bg-[#242424] px-1.5 py-1 md:px-2 md:py-1 rounded-md border border-[#2A2A2A] transition-colors hover:border-[#333]"
                    >
                        <StatusIcon className={`w-3 h-3 ${STATUS_CONFIG[currentStatus].color}`} />
                        <span className="hidden xs:inline">{STATUS_CONFIG[currentStatus].label}</span>
                        <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                    </button>
                    <StatusSelector 
                        isOpen={isStatusMenuOpen}
                        onClose={() => setIsStatusMenuOpen(false)}
                        currentStatus={currentStatus}
                        onSelect={onUpdateStatus}
                        position={{ bottom: 'calc(100% + 8px)', right: 0 }}
                    />
                </div>
            </div>
        </div>

        {attachments.length > 0 && (
            <div className="px-3 pt-1.5 flex gap-2 overflow-x-auto custom-scrollbar">
                {attachments.map((att, i) => (
                    <div key={i} className="relative group flex-shrink-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border border-[#2A2A2A] overflow-hidden bg-[#242424] flex items-center justify-center">
                            {att.type.startsWith('image/') ? (
                                <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                            ) : (
                                <FileIcon className="w-4 h-4 text-[#737373]" />
                            )}
                        </div>
                        <button 
                            onClick={() => removeAttachment(i)}
                            className="absolute -top-1 -right-1 bg-[#EF4444] text-white rounded-full p-0.5 opacity-100 transition-opacity"
                        >
                            <X className="w-2.5 h-2.5" />
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
          onPaste={handlePaste}
          placeholder={isLoading ? "AI is thinking..." : (!currentModel ? "Select an AI model..." : "Ask Shuper...")}
          className="w-full bg-transparent border-0 text-[#E5E5E5] placeholder-[#444] px-3.5 py-2 md:py-1.5 focus:ring-0 focus:outline-none resize-none min-h-[40px] max-h-[200px] overflow-y-auto custom-scrollbar text-[14px]"
          rows={1}
        />

        <div className="flex items-center justify-between px-2 pb-2 pt-0 bg-transparent">
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
                    className="text-[#666] hover:text-[#E5E5E5] transition-colors p-1.5 rounded hover:bg-[#2A2A2A]"
                    title="Attach file"
                >
                    <Paperclip className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-2">
                {isThinking && (
                    <div className="hidden xs:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#2A2A2A]/50 border border-[#333] text-[#F59E0B]">
                        <Zap className="w-2.5 h-2.5 fill-[#F59E0B]" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Think</span>
                    </div>
                )}
                
                <div className="relative">
                    <button 
                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                        className={`flex items-center gap-1 transition-colors px-1.5 py-1 md:px-2 md:py-1 rounded border ${!currentModel && input.trim() ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse' : 'text-[#777] hover:text-[#E5E5E5] border-transparent hover:bg-[#242424]'}`}
                    >
                        {!currentModel && input.trim() && <AlertCircle className="w-3 h-3" />}
                        <span className="text-[11px] md:text-[12px] font-medium truncate max-w-[80px] md:max-w-none">
                            {getModelNameDisplay()}
                        </span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    <ModelSelector 
                        isOpen={isModelMenuOpen}
                        onClose={() => setIsModelMenuOpen(false)}
                        currentModel={currentModel}
                        onSelect={onSelectModel}
                        visibleModels={visibleModels}
                        agents={agents}
                        isThinkingEnabled={isThinking}
                        onToggleThinking={() => setIsThinking(!isThinking)}
                        hasOpenRouterKey={hasOpenRouterKey}
                        hasDeepSeekKey={hasDeepSeekKey}
                        hasMoonshotKey={hasMoonshotKey}
                    />
                </div>

                <button 
                    onClick={handleSend}
                    disabled={(!input.trim() && attachments.length === 0 && !isLoading) || (!currentModel && !isLoading)}
                    className={`w-8 h-8 md:w-7 md:h-7 rounded-lg transition-all duration-200 flex items-center justify-center ${
                        ((!input.trim() && attachments.length === 0 && !isLoading) || (!currentModel && !isLoading))
                            ? 'bg-[#2A2A2A] text-[#444] cursor-not-allowed'
                            : isLoading 
                                ? 'bg-white text-black hover:bg-gray-100 shadow-lg scale-105' 
                                : 'bg-[#EEE] text-[#000] hover:bg-white shadow-md'
                    }`}
                >
                    {isLoading ? <Square className="w-3 h-3 fill-current" /> : <ArrowUp className="w-4 h-4 md:w-3.5 md:h-3.5" strokeWidth={3} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};