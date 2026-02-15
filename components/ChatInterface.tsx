import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown, Copy, Brain, ChevronRight, Terminal, Search, Globe, Eye, Loader2, AlertTriangle, Settings } from 'lucide-react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message, Session, Label, Attachment, Agent, OPENROUTER_FREE_MODELS, DEEPSEEK_MODELS, MOONSHOT_MODELS, GEMINI_MODELS, SessionMode } from '../types';
import { InputArea } from './InputArea';
import { SessionStatus } from '../types';
import { ContextMenu } from './ContextMenu';
import { StatusSelector, STATUS_CONFIG } from './StatusSelector';
import { LabelSelector } from './LabelSelector';

interface ChatInterfaceProps {
  session: Session;
  messages: Message[];
  onSendMessage: (text: string, attachments: Attachment[], useThinking: boolean, mode: SessionMode) => void;
  isLoading: boolean;
  onUpdateStatus: (status: SessionStatus) => void;
  availableLabels: Label[];
  onUpdateLabels: (labelId: string) => void;
  onCreateLabel: (label: Label) => void;
  onDeleteSession: () => void;
  onRenameSession: (newTitle: string) => void;
  onUpdateMode: (mode: SessionMode) => void;
  
  // New props for InputArea state
  visibleModels: string[];
  agents: Agent[];
  currentModel: string;
  onSelectModel: (model: string) => void;
  sendKey: 'Enter' | 'Ctrl+Enter';
  onRegenerateTitle: (id: string) => void;
  onToggleFlag: () => void;
  // Key props for model visibility
  hasOpenRouterKey?: boolean;
  hasDeepSeekKey?: boolean;
  hasMoonshotKey?: boolean;
}

const ThinkingBlock = ({ thoughtProcess, isGenerating }: { thoughtProcess: string, isGenerating?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Extract first line as summary, then parse the rest as steps
    const lines = thoughtProcess.split('\n').map(l => l.trim()).filter(l => l);
    const summary = lines.length > 0 ? lines[0].replace(/^-/, '').trim() : "Thinking...";
    const steps = lines.slice(1);

    return (
        <div className="mb-4 rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#262626] font-inter">
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#151515] transition-colors select-none group"
            >
                <div className={`p-1.5 rounded-full ${isGenerating ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[#262626] text-[var(--text-muted)]'}`}>
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                </div>
                <div className="flex flex-col">
                    <span className="text-[13px] text-[var(--text-main)] font-medium leading-tight">
                        {isGenerating ? "Thinking..." : "Finished Thinking"}
                    </span>
                    <span className="text-[11px] text-[var(--text-dim)] truncate max-w-[300px]">
                        {lines.length > 0 ? lines[lines.length-1] : "Initializing..."}
                    </span>
                </div>
                <div className="flex-1" />
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[var(--text-dim)]" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--text-dim)]" />
                )}
            </div>
            
            {isExpanded && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-1 fade-in duration-200">
                    <div className="h-[1px] bg-[#262626] mb-3" />
                    <p className="text-[13px] text-[var(--text-muted)] mb-4 pl-1">{summary}</p>
                    
                    <div className="space-y-2">
                        {steps.map((step, idx) => {
                            let Icon = Search;
                            let label = "Searching";
                            
                            // Simple heuristic to change icons/labels based on text content
                            const lower = step.toLowerCase();
                            if (lower.includes('analyz') || lower.includes('review')) {
                                Icon = Eye;
                                label = "Reviewing";
                            } else if (lower.includes('web') || lower.includes('site') || lower.includes('http')) {
                                Icon = Globe;
                                label = "Browsing";
                            }

                            return (
                                <div key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#333]"></div>
                                    </div>
                                    <div className="flex-1">
                                         <div className="flex items-center gap-2 mb-1">
                                             <Icon className="w-3 h-3 text-[var(--text-dim)]" />
                                             <span className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider font-semibold">{label}</span>
                                         </div>
                                         <div className="bg-[#151515] border border-[#262626] rounded-lg px-3 py-2 text-[13px] text-[var(--text-muted)] hover:border-[#404040] hover:text-[var(--text-main)] transition-colors cursor-default">
                                             {step.replace(/^-/, '').trim()}
                                         </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {isGenerating && (
                            <div className="flex items-center gap-3 pl-1 opacity-50">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></div>
                                <span className="text-[12px] text-[var(--text-dim)] italic">Processing...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    session, 
    messages, 
    onSendMessage, 
    isLoading, 
    onUpdateStatus,
    availableLabels,
    onUpdateLabels,
    onCreateLabel,
    onDeleteSession,
    onRenameSession,
    onUpdateMode,
    visibleModels,
    agents,
    currentModel,
    onSelectModel,
    sendKey,
    onRegenerateTitle,
    onToggleFlag,
    hasOpenRouterKey,
    hasDeepSeekKey,
    hasMoonshotKey
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [titleMenuPosition, setTitleMenuPosition] = useState<{x: number, y: number} | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  // Header Menu States
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, messages[messages.length - 1]?.thoughtProcess]);

  const handleTitleClick = (e: React.MouseEvent) => {
      // If editing, don't open menu
      if (isEditingTitle) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTitleMenuPosition({ x: rect.left, y: rect.bottom + 5 });
  };

  const handleDoubleclickTitle = () => {
      setEditedTitle(session.title);
      setIsEditingTitle(true);
      setTitleMenuPosition(null);
  };

  const handleTitleSave = () => {
      if (editedTitle.trim() && editedTitle !== session.title) {
          onRenameSession(editedTitle.trim());
      }
      setIsEditingTitle(false);
  };

  const handleTitleMenuAction = (action: string, payload: any) => {
      if (action === 'delete') {
          onDeleteSession();
      } else if (action === 'rename') {
          handleDoubleclickTitle();
      } else if (action === 'regenerate_title') {
          onRegenerateTitle(session.id);
      } else if (action === 'update_status') {
          onUpdateStatus(payload);
      } else if (action === 'toggle_label') {
          onUpdateLabels(payload);
      } else if (action === 'create_label') {
          const newLabel: Label = { id: Date.now().toString(), name: payload.name, color: payload.color };
          onCreateLabel(newLabel);
          onUpdateLabels(newLabel.id);
      } else if (action === 'toggle_archive') {
          const newStatus = session.status === 'archive' ? 'todo' : 'archive';
          onUpdateStatus(newStatus);
      } else if (action === 'toggle_flag') {
          onToggleFlag();
      }
  };
  
  const StatusIcon = STATUS_CONFIG[session.status].icon;

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-tertiary)] relative font-inter transition-all duration-300 animate-in fade-in zoom-in-95">
      <div className="h-14 flex items-center justify-between px-6 border-b border-transparent z-10 absolute top-0 left-0 right-0 bg-[var(--bg-tertiary)]">
        {isEditingTitle ? (
            <input 
                autoFocus
                className="bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none w-[60%]"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTitleSave();
                    }
                }}
            />
        ) : (
            <div 
                onClick={handleTitleClick}
                onDoubleClick={handleDoubleclickTitle}
                className="flex items-center gap-1 text-[var(--text-main)] font-medium text-sm cursor-pointer hover:bg-[var(--bg-elevated)] px-2 py-1 rounded transition-colors max-w-[50%] truncate select-none"
            >
              <span className="truncate">{session.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)]" />
            </div>
        )}
        
        <div className="flex items-center gap-3">
             {/* Status Selector in Header */}
             <div className="relative">
                 <button 
                     onClick={() => setIsStatusMenuOpen(true)}
                     className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors text-xs font-medium text-[var(--text-dim)] hover:text-[var(--text-main)]"
                 >
                     <StatusIcon className={`w-3.5 h-3.5 ${STATUS_CONFIG[session.status].color}`} />
                     <span>{STATUS_CONFIG[session.status].label}</span>
                     <ChevronDown className="w-3 h-3 opacity-50" />
                 </button>
                 <StatusSelector 
                     isOpen={isStatusMenuOpen}
                     onClose={() => setIsStatusMenuOpen(false)}
                     currentStatus={session.status}
                     onSelect={onUpdateStatus}
                     position={{ top: 35, left: -80 }}
                 />
             </div>
             
             {/* Label Selector in Header */}
             <div className="relative">
                 <button 
                     onClick={() => setIsLabelMenuOpen(true)}
                     className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors text-xs font-medium text-[var(--text-dim)] hover:text-[var(--text-main)]"
                 >
                     {session.labelIds.length > 0 ? (
                         <>
                             <div className="flex -space-x-1.5">
                                 {session.labelIds.slice(0, 3).map(id => {
                                     const label = availableLabels.find(l => l.id === id);
                                     if(!label) return null;
                                     return (
                                         <div key={id} className="w-2.5 h-2.5 rounded-full border border-[var(--bg-elevated)]" style={{ backgroundColor: label.color }}></div>
                                     );
                                 })}
                             </div>
                             <span>{session.labelIds.length > 3 ? `+${session.labelIds.length - 3}` : 'Labels'}</span>
                         </>
                     ) : (
                         <span>Add Label</span>
                     )}
                     <ChevronDown className="w-3 h-3 opacity-50" />
                 </button>
                 <LabelSelector 
                     isOpen={isLabelMenuOpen}
                     onClose={() => setIsLabelMenuOpen(false)}
                     availableLabels={availableLabels}
                     selectedLabelIds={session.labelIds}
                     onToggleLabel={onUpdateLabels}
                     position={{ top: 35, left: -100 }}
                 />
             </div>
        </div>
      </div>

      {titleMenuPosition && !isEditingTitle && (
          <ContextMenu 
              position={titleMenuPosition}
              onClose={() => setTitleMenuPosition(null)}
              onAction={handleTitleMenuAction}
              currentStatus={session.status}
              availableLabels={availableLabels}
              currentLabelIds={session.labelIds}
              isFlagged={session.isFlagged}
          />
      )}

      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-48" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => {
                const isLast = index === messages.length - 1;
                const isGenerating = isLast && isLoading && msg.role === 'model';
                const showProcessing = isGenerating && !msg.content && !msg.thoughtProcess;
                const isQuotaError = msg.role === 'model' && msg.content.includes("Quota Exceeded");

                return (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    {msg.role === 'user' ? (
                         <div className="flex flex-col gap-2 max-w-[85%] items-end">
                             {msg.attachments && msg.attachments.length > 0 && (
                                 <div className="flex flex-wrap gap-2 justify-end">
                                     {msg.attachments.map((att, i) => (
                                         <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-2 text-xs flex items-center gap-2 text-[var(--text-main)]">
                                             <span>📎 {att.name}</span>
                                         </div>
                                     ))}
                                 </div>
                             )}
                             <div className="bg-[var(--bg-elevated)] text-[var(--text-main)] p-3 px-4 rounded-xl text-[15px] shadow-sm">
                                {msg.content}
                             </div>
                         </div>
                    ) : (
                        <div className="w-full text-[var(--text-main)] leading-7 text-[15px]">
                            {/* Processing Indicator for initial wait (OpenRouter cold start etc) */}
                            {showProcessing && (
                                <div className="flex items-center gap-2 text-[var(--text-dim)] text-sm animate-pulse ml-1 mb-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Processing request...</span>
                                </div>
                            )}

                            {msg.thoughtProcess && (
                                <ThinkingBlock thoughtProcess={msg.thoughtProcess} isGenerating={isGenerating} />
                            )}
                            
                            {isQuotaError ? (
                                <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 flex items-start gap-3 text-red-200">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium mb-1">API Quota Exceeded</h4>
                                        <p className="text-sm opacity-80 mb-3">The free request limit for the shared API key has been reached. To continue chatting, please add your own API key in settings.</p>
                                        <div className="flex items-center gap-2 text-xs font-mono bg-black/30 p-2 rounded mb-3">
                                            <span>Settings &gt; AI Providers &gt; Google Gemini API Key</span>
                                        </div>
                                    </div>
                                </div>
                            ) : msg.content && (
                                <div className="markdown-body">
                                    <Markdown
                                        components={{
                                            code({node, inline, className, children, ...props}: any) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        customStyle={{
                                                            margin: 0,
                                                            borderRadius: '0.5rem',
                                                            background: '#1e1e1e', // Match VS Code dark
                                                            border: '1px solid var(--border)'
                                                        }}
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {msg.content}
                                    </Markdown>
                                </div>
                            )}
                            
                            {/* Actions - hidden while generating */}
                            {!isGenerating && msg.content && !isQuotaError && (
                                <div className="flex items-center gap-4 mt-2">
                                     <button className="text-[var(--text-dim)] hover:text-[var(--text-muted)] transition-colors">
                                        <Copy className="w-3.5 h-3.5" />
                                     </button>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
                );
            })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--bg-tertiary)] via-[var(--bg-tertiary)] to-transparent z-20">
           <InputArea 
                onSend={onSendMessage} 
                isLoading={isLoading} 
                currentStatus={session.status}
                currentLabelIds={session.labelIds}
                availableLabels={availableLabels}
                onUpdateStatus={onUpdateStatus}
                onUpdateLabels={onUpdateLabels}
                onCreateLabel={onCreateLabel}
                visibleModels={visibleModels}
                agents={agents}
                currentModel={currentModel}
                onSelectModel={onSelectModel}
                sendKey={sendKey}
                hasOpenRouterKey={hasOpenRouterKey}
                hasDeepSeekKey={hasDeepSeekKey}
                hasMoonshotKey={hasMoonshotKey}
                currentMode={session.mode || 'explore'}
                onUpdateMode={onUpdateMode}
           />
      </div>
    </div>
  );
};