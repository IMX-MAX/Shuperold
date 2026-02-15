import React, { useRef, useEffect, useState } from 'react';
import { 
  ChevronDown, 
  Copy, 
  Brain, 
  ChevronRight, 
  Terminal, 
  Search, 
  Globe, 
  Eye, 
  Loader2, 
  AlertTriangle, 
  Settings,
  RefreshCcw,
  Compass,
  Trash2,
  Edit2,
  Bot,
  Menu,
  ChevronLeft,
  Check,
  PlusCircle,
  Key,
  CircleDot,
  ArrowDown,
  Zap
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import { Message, Session, Label, Attachment, Agent, OPENROUTER_FREE_MODELS, DEEPSEEK_MODELS, MOONSHOT_MODELS, GEMINI_MODELS, SessionMode } from '../types';
import { InputArea } from './InputArea';
import { SessionStatus } from '../types';
import { ContextMenu } from './ContextMenu';
import { StatusSelector, STATUS_CONFIG } from './StatusSelector';
import { LabelSelector } from './LabelSelector';

interface ChatInterfaceProps {
  session: Session;
  messages: Message[];
  onSendMessage: (text: string, attachments: Attachment[], useThinking: boolean, mode: SessionMode, existingId?: string) => void;
  onStopGeneration: () => void;
  isLoading: boolean;
  onUpdateStatus: (status: SessionStatus) => void;
  availableLabels: Label[];
  onUpdateLabels: (labelId: string) => void;
  onCreateLabel: (label: Label) => void;
  onDeleteSession: () => void;
  onRenameSession: (newTitle: string) => void;
  onUpdateMode: (mode: SessionMode) => void;
  onChangeView: (view: 'chat' | 'agents' | 'settings') => void;
  visibleModels: string[];
  agents: Agent[];
  currentModel: string;
  onSelectModel: (model: string) => void;
  sendKey: 'Enter' | 'Ctrl+Enter';
  onRegenerateTitle: (id: string) => void;
  onToggleFlag: () => void;
  onNewSession: () => void;
  hasOpenRouterKey?: boolean;
  hasDeepSeekKey?: boolean;
  hasMoonshotKey?: boolean;
  onBackToList?: () => void;
  onOpenSidebar?: () => void;
  hasAnyKey?: boolean;
}

const WaveLoader = () => (
  <div className="wave-container">
    {[...Array(9)].map((_, i) => <div key={i} className="wave-square" />)}
  </div>
);

const ThinkingBlock = ({ steps, isGenerating }: { steps: string[], isGenerating?: boolean }) => {
    // Collapsed by default as requested
    const [isExpanded, setIsExpanded] = useState(false);
    const [lastStepsCount, setLastStepsCount] = useState(0);

    // Auto-expand only when NEW steps arrive while generating to allow "keeping track live"
    useEffect(() => {
        if (isGenerating && steps.length > lastStepsCount) {
            setIsExpanded(true);
            setLastStepsCount(steps.length);
        }
    }, [isGenerating, steps.length, lastStepsCount]);

    if (steps.length === 0 && !isGenerating) return null;

    return (
        <div className="mb-6 animate-in fade-in slide-in-from-top-1 duration-500">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-3 text-[11px] font-bold text-[var(--text-dim)] uppercase tracking-widest hover:text-[var(--text-muted)] transition-all mb-4 group"
            >
                <div className={`p-1 rounded-md border border-[var(--border)] transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                    <ChevronDown className="w-3 h-3" />
                </div>
                <span>{isGenerating ? 'Thinking and Planning' : `Execution Plan (${steps.length} steps)`}</span>
            </button>
            
            {isExpanded && (
                <div className="relative ml-2.5 pl-6 border-l border-[var(--border)] space-y-4 py-2">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="text-[13px] text-[var(--text-muted)] leading-relaxed font-medium">
                                {step}
                            </div>
                        </div>
                    ))}
                    {isGenerating && (
                        <div className="flex items-start gap-4 text-[var(--text-dim)] py-2">
                            <div className="mt-1 flex-shrink-0">
                                <WaveLoader />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold tracking-widest uppercase text-[11px] text-[var(--text-muted)] italic">
                                   Determining next execution phase...
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    session, messages, onSendMessage, onStopGeneration, isLoading, onUpdateStatus,
    availableLabels, onUpdateLabels, onCreateLabel, onDeleteSession, onRenameSession,
    onUpdateMode, onChangeView, onNewSession, visibleModels, agents, currentModel, onSelectModel,
    sendKey, onRegenerateTitle, onToggleFlag, hasOpenRouterKey, hasDeepSeekKey, hasMoonshotKey,
    onBackToList, onOpenSidebar, hasAnyKey
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [titleMenuPosition, setTitleMenuPosition] = useState<{x: number, y: number} | null>(null);
  const [chatContextMenu, setChatContextMenu] = useState<{x: number, y: number} | null>(null);
  const [messageContextMenu, setMessageContextMenu] = useState<{x: number, y: number, messageId: string} | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleTitleClick = (e: React.MouseEvent) => {
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
      if (editedTitle.trim() && editedTitle !== session.title) onRenameSession(editedTitle.trim());
      setIsEditingTitle(false);
  };

  const handleChatContextMenu = (e: React.MouseEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      e.preventDefault();
      setChatContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleMessageContextMenu = (e: React.MouseEvent, msgId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setMessageContextMenu({ x: e.clientX, y: e.clientY, messageId: msgId });
  };

  const handleCopyText = (text: string, id: string) => {
      navigator.clipboard.writeText(text).then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
      });
  };
  
  const StatusIcon = STATUS_CONFIG[session.status].icon;

  // Helper to split model response into plan vs main content
  const processModelOutput = (content: string) => {
    const lines = content.split('\n');
    const planSteps: string[] = [];
    const mainLines: string[] = [];
    let isParsingPlan = true;

    for (let line of lines) {
      const trimmed = line.trim();
      if (isParsingPlan && trimmed.startsWith('-')) {
        planSteps.push(trimmed.replace(/^-/, '').trim());
      } else if (trimmed === '' && isParsingPlan) {
        // Just skip initial empty lines if still parsing plan
        continue;
      } else {
        isParsingPlan = false;
        mainLines.push(line);
      }
    }

    return { planSteps, mainContent: mainLines.join('\n').trim() };
  };

  return (
    <div 
        className="flex-1 flex flex-col h-full bg-[var(--bg-tertiary)] relative font-inter overflow-hidden"
        onContextMenu={handleChatContextMenu}
    >
      <div className="h-14 flex items-center justify-between px-3 md:px-6 border-b border-[var(--border)] z-30 absolute top-0 left-0 right-0 bg-[var(--bg-tertiary)]/80 backdrop-blur-md transition-all duration-300">
        <div className="flex items-center gap-2 max-w-[60%]">
            {onBackToList && (
                <button onClick={onBackToList} className="md:hidden p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-main)]">
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}
            {!onBackToList && onOpenSidebar && (
                <button onClick={onOpenSidebar} className="md:hidden p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-main)]">
                    <Menu className="w-5 h-5" />
                </button>
            )}
            
            {isEditingTitle ? (
                <input autoFocus className="bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none w-full animate-in fade-in zoom-in-95 duration-200" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} onBlur={handleTitleSave} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleTitleSave(); } }} />
            ) : (
                <div onClick={handleTitleClick} onDoubleClick={handleDoubleclickTitle} className="flex items-center gap-1 text-[var(--text-main)] font-medium text-sm cursor-pointer hover:bg-[var(--bg-elevated)] px-2 py-1 rounded transition-all max-w-full truncate select-none active:scale-[0.98]">
                  <span className="truncate">{session.title}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                </div>
            )}
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-3">
             <div className="relative">
                 <button onClick={() => setIsStatusMenuOpen(true)} className="flex items-center gap-2 px-2 py-1 md:px-2.5 md:py-1 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors text-[11px] md:text-xs font-medium text-[var(--text-dim)] hover:text-[var(--text-main)] active:scale-95">
                     <StatusIcon className={`w-3.5 h-3.5 ${STATUS_CONFIG[session.status].color}`} />
                     <span className="hidden sm:inline">{STATUS_CONFIG[session.status].label}</span>
                     <ChevronDown className="w-3 h-3 opacity-50" />
                 </button>
                 <StatusSelector isOpen={isStatusMenuOpen} onClose={() => setIsStatusMenuOpen(false)} currentStatus={session.status} onSelect={onUpdateStatus} position={{ top: 35, right: 0 }} />
             </div>
             
             <div className="relative hidden sm:block">
                 <button onClick={() => setIsLabelMenuOpen(true)} className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors text-xs font-medium text-[var(--text-dim)] hover:text-[var(--text-main)] active:scale-95">
                     {session.labelIds.length > 0 ? (
                         <>
                             <div className="flex -space-x-1.5">
                                 {session.labelIds.slice(0, 3).map(id => {
                                     const label = availableLabels.find(l => l.id === id);
                                     if(!label) return null;
                                     return <div key={id} className="w-2.5 h-2.5 rounded-full border border-[var(--bg-elevated)]" style={{ backgroundColor: label.color }}></div>;
                                 })}
                             </div>
                             <span>{session.labelIds.length > 3 ? `+${session.labelIds.length - 3}` : 'Labels'}</span>
                         </>
                     ) : <span>Add Label</span>}
                     <ChevronDown className="w-3 h-3 opacity-50" />
                 </button>
                 <LabelSelector isOpen={isLabelMenuOpen} onClose={() => setIsLabelMenuOpen(false)} availableLabels={availableLabels} selectedLabelIds={session.labelIds} onToggleLabel={onUpdateLabels} position={{ top: 35, right: 0 }} />
             </div>
        </div>
      </div>

      {chatContextMenu && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setChatContextMenu(null)} />
            <div 
                className="fixed z-[110] w-56 bg-[#1F1F1F] border border-[#333] rounded-xl shadow-2xl py-1.5 text-[13px] animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                style={{ top: chatContextMenu.y, left: chatContextMenu.x }}
            >
                <div 
                    onClick={() => {
                        onNewSession();
                        setChatContextMenu(null);
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] text-blue-400 cursor-pointer rounded-lg mx-1 transition-colors"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span className="font-semibold">New Session</span>
                </div>
                <div className="h-[1px] bg-[#2A2A2A] my-1 mx-2" />
                <div onClick={() => { onUpdateMode('explore'); setChatContextMenu(null); }} className={`flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] cursor-pointer rounded-lg mx-1 transition-colors ${session.mode === 'explore' ? 'text-white' : 'text-[#A1A1A1]'}`}><Compass className="w-4 h-4" /><span>Explore Mode</span></div>
                <div onClick={() => { onUpdateMode('execute'); setChatContextMenu(null); }} className={`flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] cursor-pointer rounded-lg mx-1 transition-colors ${session.mode === 'execute' ? 'text-white' : 'text-[#A1A1A1]'}`}><Zap className="w-4 h-4" /><span>Execute Mode</span></div>
                <div className="h-[1px] bg-[#2A2A2A] my-1 mx-2" />
                <div onClick={() => { onChangeView('settings'); setChatContextMenu(null); }} className="flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] text-[#A1A1A1] hover:text-white cursor-pointer rounded-lg mx-1 transition-colors"><Settings className="w-4 h-4" /><span>System Settings</span></div>
                <div onClick={() => { onDeleteSession(); setChatContextMenu(null); }} className="flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 text-red-400 cursor-pointer rounded-lg mx-1 transition-colors"><Trash2 className="w-4 h-4" /><span>Delete Conversation</span></div>
            </div>
          </>
      )}

      {messageContextMenu && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setMessageContextMenu(null)} />
            <div 
                className="fixed z-[110] w-48 bg-[#1F1F1F] border border-[#333] rounded-xl shadow-2xl py-1.5 text-[13px] animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                style={{ top: messageContextMenu.y, left: messageContextMenu.x }}
            >
                <div 
                    onClick={() => {
                        setEditingMessageId(messageContextMenu.messageId);
                        setMessageContextMenu(null);
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] text-[#A1A1A1] hover:text-white cursor-pointer rounded-lg mx-1 transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Message</span>
                </div>
                <div 
                    onClick={() => {
                        const content = messages.find(m => m.id === messageContextMenu.messageId)?.content;
                        if (content) handleCopyText(content, messageContextMenu.messageId);
                        setMessageContextMenu(null);
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] text-[#A1A1A1] hover:text-white cursor-pointer rounded-lg mx-1 transition-colors"
                >
                    {copiedId === messageContextMenu.messageId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId === messageContextMenu.messageId ? 'Copied!' : 'Copy Text'}</span>
                </div>
            </div>
          </>
      )}

      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-48 custom-scrollbar" ref={scrollRef}>
        {!hasAnyKey && (
            <div className="max-w-xl mx-auto mt-20 p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                    <Key className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold mb-3 text-white">No AI Providers Connected</h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8">
                    To start chatting, you need to add an API key in Settings.
                </p>
                <button 
                    onClick={() => onChangeView('settings')}
                    className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-xl"
                >
                    Add API Key in Settings
                </button>
            </div>
        )}
        
        {hasAnyKey && (
            <div className="max-w-3xl mx-auto space-y-8">
                {messages.map((msg, index) => {
                    const isLast = index === messages.length - 1;
                    const isGenerating = isLast && isLoading && msg.role === 'model';
                    const { planSteps, mainContent } = processModelOutput(msg.content);
                    const showStandaloneThinking = isGenerating && planSteps.length === 0 && !mainContent;

                    return (
                    <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}>
                        {msg.role === 'user' ? (
                            <div className="flex flex-col gap-2 max-w-[85%] items-end" onContextMenu={(e) => handleMessageContextMenu(e, msg.id)}>
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 justify-end">
                                        {msg.attachments.map((att, i) => (
                                            <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 md:p-2.5 text-[11px] md:text-xs flex items-center gap-2 text-[var(--text-main)] shadow-sm hover:shadow-md transition-shadow">
                                                <span className="opacity-70 text-[14px]">📎</span>
                                                <span className="font-medium truncate max-w-[100px]">{att.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {editingMessageId === msg.id ? (
                                    <div className="w-full min-w-[240px] md:min-w-[280px] flex flex-col gap-3 bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border)] shadow-2xl animate-in fade-in zoom-in-95">
                                        <textarea 
                                            autoFocus
                                            defaultValue={msg.content}
                                            className="w-full bg-transparent border-none text-[var(--text-main)] text-[14px] md:text-[15px] leading-relaxed resize-none focus:ring-0 outline-none min-h-[100px]"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    onSendMessage(e.currentTarget.value, msg.attachments || [], false, session.mode || 'explore', msg.id);
                                                    setEditingMessageId(null);
                                                } else if (e.key === 'Escape') setEditingMessageId(null);
                                            }}
                                        />
                                        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                                            <button onClick={() => setEditingMessageId(null)} className="text-[12px] font-medium text-[var(--text-dim)] hover:text-white px-3 py-1.5 rounded-lg transition-colors">Cancel</button>
                                            <button onClick={(e) => {
                                                const val = (e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement).value;
                                                onSendMessage(val, msg.attachments || [], false, session.mode || 'explore', msg.id);
                                                setEditingMessageId(null);
                                            }} className="text-[12px] bg-white text-black font-bold px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors shadow-lg active:scale-95">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[var(--bg-elevated)] text-[var(--text-main)] p-3 px-4 md:p-3.5 md:px-5 rounded-2xl text-[14px] md:text-[15px] shadow-sm cursor-default hover:bg-[var(--border)] transition-colors border border-transparent">
                                        {msg.content}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full text-[var(--text-main)] leading-relaxed text-[14px] md:text-[15px] flex flex-col gap-1 group/msg">
                                {showStandaloneThinking && (
                                    <div className="flex items-center gap-4 text-[var(--text-dim)] text-xs md:text-sm animate-pulse ml-1 mb-6 py-2">
                                        <WaveLoader />
                                        <span className="font-bold tracking-widest uppercase text-[11px] text-[var(--text-muted)]">Shuper is thinking...</span>
                                    </div>
                                )}
                                
                                {/* Dynamic Planning Block */}
                                {(planSteps.length > 0 || (isGenerating && session.mode === 'execute')) && (
                                    <ThinkingBlock steps={planSteps} isGenerating={isGenerating} />
                                )}
                                
                                {mainContent && (
                                    <div className="markdown-body transition-opacity duration-300 overflow-x-auto">
                                        <Markdown
                                            components={{
                                                code({node, inline, className, children, ...props}: any) {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    const codeString = String(children).replace(/\n$/, '');
                                                    const codeId = `code-${msg.id}-${node?.position?.start?.line || index}`;
                                                    
                                                    return !inline && match ? (
                                                        <div className="group/code relative my-4">
                                                            <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity z-10 flex gap-2">
                                                                <button 
                                                                    onClick={() => handleCopyText(codeString, codeId)} 
                                                                    className={`p-1.5 rounded-lg border transition-all active:scale-90 flex items-center gap-1.5 ${copiedId === codeId ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-[#2A2A2A] border-[#333] text-white/50 hover:bg-[#333] hover:text-white'}`}
                                                                >
                                                                    {copiedId === codeId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                                    {copiedId === codeId && <span className="text-[10px] font-bold uppercase">Copied</span>}
                                                                </button>
                                                            </div>
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                customStyle={{ margin: 0, padding: '1rem', borderRadius: '0.75rem', background: '#0D0D0D', border: '1px solid var(--border)', fontSize: '12px', md: '13.5px', lineHeight: '1.6' }}
                                                                {...props}
                                                            >
                                                                {codeString}
                                                            </SyntaxHighlighter>
                                                        </div>
                                                    ) : ( <code className={`${className} bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded text-[0.9em] border border-[var(--border)]`} {...props}>{children}</code> )
                                                }
                                            }}
                                        >
                                            {mainContent}
                                        </Markdown>
                                    </div>
                                )}
                                {!isGenerating && mainContent && (
                                    <div className="flex items-center gap-4 mt-2 md:mt-4 opacity-100 md:opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleCopyText(mainContent, msg.id)} 
                                            className={`flex items-center gap-1.5 transition-all group/btn ${copiedId === msg.id ? 'text-emerald-400' : 'text-[var(--text-dim)] hover:text-white'}`}
                                        >
                                            {copiedId === msg.id ? <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Copy className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover/btn:scale-110" />}
                                            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest">{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    );
                })}
                
                {isLoading && !messages[messages.length - 1]?.content && !messages[messages.length - 1]?.thoughtProcess && (
                    <div className="flex gap-4 animate-in fade-in duration-500">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
                            <WaveLoader />
                        </div>
                        <div className="space-y-2 flex-1 pt-1">
                            <div className="h-3 bg-[var(--bg-elevated)] rounded-full w-[35%] animate-pulse"></div>
                            <div className="h-3 bg-[var(--bg-elevated)] rounded-full w-[55%] animate-pulse delay-75"></div>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 bg-gradient-to-t from-[var(--bg-tertiary)] via-[var(--bg-tertiary)] to-transparent z-40">
           <InputArea 
                onSend={onSendMessage} 
                onStop={onStopGeneration}
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
                hasAnyKey={hasAnyKey}
           />
      </div>

      {titleMenuPosition && !isEditingTitle && <ContextMenu position={titleMenuPosition} onClose={() => setTitleMenuPosition(null)} onAction={() => {}} currentStatus={session.status} availableLabels={availableLabels} currentLabelIds={session.labelIds} isFlagged={session.isFlagged} />}
    </div>
  );
};