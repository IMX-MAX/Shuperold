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
  Zap,
  ListTodo,
  PanelRightOpen,
  LayoutTemplate,
  PanelRight,
  Circle,
  Tag
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import { Message, Session, Label, Attachment, Agent, OPENROUTER_FREE_MODELS, DEEPSEEK_MODELS, MOONSHOT_MODELS, GEMINI_MODELS, SessionMode, Task, UserSettings } from '../types';
import { InputArea } from './InputArea';
import { SessionStatus } from '../types';
import { ContextMenu } from './ContextMenu';
import { StatusSelector, STATUS_CONFIG } from './StatusSelector';
import { LabelSelector } from './LabelSelector';
import { suggestLabels } from '../services/geminiService';
import { TaskPanel } from './TaskPanel';

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
  onUpdateTasks?: (tasks: Task[]) => void;
  userSettings?: UserSettings;
}

const WaveLoader = () => (
  <div className="wave-container">
    {[...Array(9)].map((_, i) => <div key={i} className="wave-square" />)}
  </div>
);

const ThinkingBlock = ({ steps, isGenerating }: { steps: string[], isGenerating?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [lastStepsCount, setLastStepsCount] = useState(0);

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
                <div className={`p-1 rounded-md border border-[var(--border)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-3 h-3" />
                </div>
                <span>{isGenerating ? 'Working on a plan' : `Steps Taken (${steps.length})`}</span>
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="relative ml-2.5 pl-6 border-l-2 border-[var(--text-muted)]/30 space-y-5 py-2">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="text-[14px] text-[var(--text-muted)] leading-relaxed font-semibold">{step}</div>
                        </div>
                    ))}
                    {isGenerating && (
                        <div className="flex items-start gap-4 text-[var(--text-dim)] py-2">
                            <div className="mt-1 flex-shrink-0"><WaveLoader /></div>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold tracking-widest uppercase text-[10px] text-[var(--text-main)] italic">Waiting for response...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    session, messages, onSendMessage, onStopGeneration, isLoading, onUpdateStatus,
    availableLabels, onUpdateLabels, onCreateLabel, onDeleteSession, onRenameSession,
    onUpdateMode, onChangeView, onNewSession, visibleModels, agents, currentModel, onSelectModel,
    sendKey, onRegenerateTitle, onToggleFlag, hasOpenRouterKey, hasDeepSeekKey, hasMoonshotKey,
    onBackToList, onOpenSidebar, hasAnyKey, onUpdateTasks, userSettings
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [titleMenuPosition, setTitleMenuPosition] = useState<{x: number, y: number} | null>(null);
  const [chatContextMenu, setChatContextMenu] = useState<{x: number, y: number} | null>(null);
  const [messageContextMenu, setMessageContextMenu] = useState<{x: number, y: number, messageId: string} | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [editContent, setEditContent] = useState<string>('');
  
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
        if (!(e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement)) {
            e.preventDefault();
        }
    };
    window.addEventListener('contextmenu', handleGlobalContextMenu);
    return () => window.removeEventListener('contextmenu', handleGlobalContextMenu);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      onUpdateMode(session.mode === 'execute' ? 'explore' : 'execute');
    }
    if (e.altKey && e.key.toLowerCase() === 't' && userSettings?.enableTasks) {
      e.preventDefault();
      setIsTaskPanelOpen(!isTaskPanelOpen);
    }
  };

  const handleUpArrowOnInput = () => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      const lastMsg = userMessages[userMessages.length - 1];
      setEditingMessageId(lastMsg.id);
      setEditContent(lastMsg.content);
    }
  };

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

  const handleEditMessageAction = (msgId: string) => {
      const msg = messages.find(m => m.id === msgId);
      if (msg) {
          setEditingMessageId(msgId);
          setEditContent(msg.content);
      }
      setMessageContextMenu(null);
  };

  const handleCopyText = (text: string, id: string) => {
      navigator.clipboard.writeText(text).then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
      });
  };
  
  const handleSuggestLabels = async () => {
    const history = messages.map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const suggestedIds = await suggestLabels(history, availableLabels);
    suggestedIds.forEach(id => {
      if (!session.labelIds.includes(id)) onUpdateLabels(id);
    });
  };

  const handleToggleTask = (taskId: string) => {
    if (!onUpdateTasks || !session.tasks) return;
    const newTasks = session.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    onUpdateTasks(newTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!onUpdateTasks || !session.tasks) return;
    const newTasks = session.tasks.filter(t => t.id !== taskId);
    onUpdateTasks(newTasks);
  };

  const processModelOutput = (content: string, mode: SessionMode) => {
    const lines = content.split('\n');
    const planSteps: string[] = [];
    const mainLines: string[] = [];
    
    if (mode === 'execute') {
        let isParsingPlan = true;
        for (let line of lines) {
          const trimmed = line.trim();
          if (isParsingPlan && trimmed.startsWith('-')) {
            planSteps.push(trimmed.replace(/^-/, '').trim());
          } else if (trimmed === '' && isParsingPlan) {
            continue;
          } else {
            isParsingPlan = false;
            mainLines.push(line);
          }
        }
    } else {
        mainLines.push(...lines);
    }

    return { planSteps, mainContent: mainLines.join('\n').trim() };
  };

  const StatusIcon = STATUS_CONFIG[session.status].icon;

  const headerLabelText = session.labelIds.length > 0 
    ? session.labelIds.map(id => availableLabels.find(l => l.id === id)?.name).filter(Boolean).join(', ')
    : 'No tags';

  const activeAgent = agents.find(a => a.id === currentModel);

  return (
    <div 
        className="flex-1 flex h-full bg-[var(--bg-tertiary)] relative font-inter overflow-hidden focus:outline-none"
        onContextMenu={handleChatContextMenu}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
    >
      <div className="flex-1 flex flex-col h-full relative">
        <div className="h-14 flex items-center justify-between px-6 border-b border-[var(--border)] z-30 absolute top-0 left-0 right-0 bg-[var(--bg-tertiary)]/80 backdrop-blur-md">
          <div className="flex items-center gap-2 max-w-[60%]">
              {onBackToList && (
                  <button onClick={onBackToList} className="md:hidden p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-main)]"><ChevronLeft className="w-5 h-5" /></button>
              )}
              {isEditingTitle ? (
                  <input autoFocus className="bg-[var(--bg-elevated)] text-[var(--text-main)] border border-[var(--border)] rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-[var(--text-main)] w-full" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} onBlur={handleTitleSave} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleTitleSave(); } }} />
              ) : (
                  <div onClick={handleTitleClick} onDoubleClick={handleDoubleclickTitle} className="flex items-center gap-2 text-[var(--text-main)] font-semibold text-sm cursor-pointer hover:bg-[var(--bg-elevated)] px-2.5 py-1.5 rounded-lg transition-all max-w-full select-none active:scale-[0.98]">
                    {activeAgent && (
                        activeAgent.icon ? (
                            <img src={activeAgent.icon} className="w-5 h-5 rounded-full object-cover border border-[var(--border)]" alt="" />
                        ) : (
                            <Bot className="w-5 h-5 text-[var(--text-muted)]" />
                        )
                    )}
                    <span className="truncate lowercase">{session.title}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                  </div>
              )}

              {titleMenuPosition && (
                  <>
                      <div className="fixed inset-0 z-40" onClick={() => setTitleMenuPosition(null)} />
                      <div 
                        className="absolute z-50 w-48 bg-[#1F1F1F] border border-[#333] rounded-xl shadow-2xl py-1.5 text-[13px] animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                        style={{ top: titleMenuPosition.y, left: titleMenuPosition.x }}
                      >
                          <div onClick={() => { handleDoubleclickTitle(); setTitleMenuPosition(null); }} className="flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] text-[#A1A1A1] hover:text-white cursor-pointer rounded-lg mx-1"><Edit2 className="w-4 h-4" /><span>Rename Chat</span></div>
                          <div onClick={() => { onRegenerateTitle(session.id); setTitleMenuPosition(null); }} className="flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] text-[#A1A1A1] hover:text-white cursor-pointer rounded-lg mx-1"><RefreshCcw className="w-4 h-4" /><span>Rewrite Title</span></div>
                          <div className="h-[1px] bg-[#333] my-1 mx-2" />
                          <div onClick={() => { onDeleteSession(); setTitleMenuPosition(null); }} className="flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 text-red-400 cursor-pointer rounded-lg mx-1"><Trash2 className="w-4 h-4" /><span>Delete Chat</span></div>
                      </div>
                  </>
              )}
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2">
               <button onClick={() => setIsStatusMenuOpen(true)} className="flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[#E5E5E5]/5 hover:bg-[#E5E5E5]/10 transition-all text-[11px] font-medium text-[var(--text-muted)] group">
                   <StatusIcon className={`w-3 h-3 ${STATUS_CONFIG[session.status].color} group-hover:text-white`} />
                   <span className="hidden sm:inline lowercase">{STATUS_CONFIG[session.status].label}</span>
                   <ChevronDown className="w-2.5 h-2.5 opacity-50" />
               </button>
               <StatusSelector isOpen={isStatusMenuOpen} onClose={() => setIsStatusMenuOpen(false)} currentStatus={session.status} onSelect={onUpdateStatus} position={{ top: 44, right: 100 }} />
               
               <button onClick={() => setIsLabelMenuOpen(true)} className="flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[#E5E5E5]/5 hover:bg-[#E5E5E5]/10 transition-all text-[11px] font-medium text-[var(--text-muted)] group max-w-[120px]">
                   <Tag className="w-3 h-3 text-[var(--text-dim)] group-hover:text-white flex-shrink-0" />
                   <span className="hidden sm:inline truncate lowercase">{headerLabelText}</span>
                   <ChevronDown className="w-2.5 h-2.5 opacity-50 flex-shrink-0" />
               </button>
               <LabelSelector isOpen={isLabelMenuOpen} onClose={() => setIsLabelMenuOpen(false)} availableLabels={availableLabels} selectedLabelIds={session.labelIds} onToggleLabel={onUpdateLabels} onSuggestWithAI={handleSuggestLabels} position={{ top: 44, right: 60 }} />

               <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />
               <button 
                  id="tour-tasks-toggle"
                  onClick={() => setIsTaskPanelOpen(!isTaskPanelOpen)}
                  className={`p-1.5 rounded-lg transition-all text-[var(--text-dim)] hover:text-white ${isTaskPanelOpen ? 'bg-[var(--bg-elevated)]' : ''}`}
                >
                  <PanelRight className="w-4.5 h-4.5" />
                </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-20 pb-48 custom-scrollbar" ref={scrollRef}>
          {!hasAnyKey && (
              <div className="max-w-xl mx-auto mt-20 p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] text-center animate-in fade-in zoom-in-95 duration-500 shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-500/10 flex items-center justify-center mx-auto mb-6"><Key className="w-8 h-8 text-[var(--text-main)]" /></div>
                  <h2 className="text-xl font-bold mb-3 text-white">Setup Needed</h2>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8">You need to add your API keys to start chatting. Head over to settings to connect.</p>
                  <button onClick={() => onChangeView('settings')} className="px-8 py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-xl">Set up API Keys</button>
              </div>
          )}
          
          {hasAnyKey && (
              <div className="max-w-3xl mx-auto space-y-10">
                  {messages.map((msg, index) => {
                      const isLast = index === messages.length - 1;
                      const isGenerating = isLast && isLoading && msg.role === 'model';
                      const { planSteps, mainContent } = processModelOutput(msg.content, session.mode || 'explore');
                      
                      const showInitialLoader = isGenerating && planSteps.length === 0 && !mainContent;

                      return (
                      <div key={msg.id} className={`flex flex-col gap-4 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-message`}>
                          {msg.role === 'user' ? (
                              <div className="flex flex-col gap-2 max-w-[85%] items-end" onContextMenu={(e) => handleMessageContextMenu(e, msg.id)}>
                                  {msg.attachments && msg.attachments.length > 0 && (
                                      <div className="flex flex-wrap gap-2 justify-end">
                                          {msg.attachments.map((att, i) => (
                                              <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-2.5 text-xs flex items-center gap-2.5 text-[var(--text-main)] shadow-sm font-bold">
                                                  <div className="w-5 h-5 flex items-center justify-center bg-[var(--text-main)]/10 text-[var(--text-main)] rounded-lg">📎</div>
                                                  <span className="truncate max-w-[120px]">{att.name}</span>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                                  <div className="bg-[#E5E5E5]/10 text-[var(--text-main)] p-3 px-5 rounded-[20px] text-[15px] font-medium shadow-sm transition-colors border border-transparent leading-relaxed cursor-default">{msg.content}</div>
                              </div>
                          ) : (
                              <div className="w-full text-[var(--text-main)] leading-relaxed text-[15px] flex flex-col gap-1 group/msg">
                                  {showInitialLoader && (
                                      <div className="flex items-center gap-4 text-[var(--text-main)] text-xs md:text-sm animate-pulse ml-1 mb-8 py-2">
                                          <WaveLoader />
                                          <span className="font-bold tracking-widest uppercase text-[11px] text-[var(--text-muted)] italic">
                                            Thinking...
                                          </span>
                                      </div>
                                  )}
                                  {session.mode === 'execute' && (planSteps.length > 0 || isGenerating) && <ThinkingBlock steps={planSteps} isGenerating={isGenerating} />}
                                  {mainContent && (
                                      <div className="markdown-body transition-opacity duration-300 overflow-x-auto font-medium">
                                          <Markdown components={{
                                              code({node, inline, className, children, ...props}: any) {
                                                  const match = /language-(\w+)/.exec(className || '')
                                                  const codeString = String(children).replace(/\n$/, '');
                                                  const codeId = `code-${msg.id}-${node?.position?.start?.line || index}`;
                                                  return !inline && match ? (
                                                      <div className="group/code relative my-6">
                                                          <div className="absolute right-3 top-3 opacity-0 group-hover/code:opacity-100 transition-opacity z-10 flex gap-2">
                                                              <button onClick={() => handleCopyText(codeString, codeId)} className={`p-2 rounded-xl border transition-all active:scale-90 flex items-center gap-2 ${copiedId === codeId ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-[#151515] border-[#333] text-white/50 hover:bg-[#202020] hover:text-white'}`}>
                                                                  {copiedId === codeId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                                  {copiedId === codeId && <span className="text-[11px] font-bold uppercase tracking-wider">Copied</span>}
                                                              </button>
                                                          </div>
                                                          <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, padding: '1.25rem', borderRadius: '1rem', background: '#080808', border: '1px solid var(--border)', fontSize: '13px', lineHeight: '1.7' }} {...props}>{codeString}</SyntaxHighlighter>
                                                      </div>
                                                  ) : ( <code className={`${className} bg-[var(--bg-elevated)] px-2 py-0.5 rounded-lg text-[0.9em] border border-[var(--border)] font-bold text-[var(--text-main)]`} {...props}>{children}</code> )
                                              }
                                          }}>{mainContent}</Markdown>
                                      </div>
                                  )}
                                  {!isGenerating && mainContent && (
                                      <div className="flex items-center gap-5 mt-4 opacity-100 md:opacity-0 group-hover/msg:opacity-100 transition-all">
                                          <button onClick={() => handleCopyText(mainContent, msg.id)} className={`flex items-center gap-2 transition-all group/btn font-bold ${copiedId === msg.id ? 'text-emerald-400' : 'text-[var(--text-dim)] hover:text-white'}`}>
                                              {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 group-hover/btn:scale-110" />}
                                              <span className="text-[11px] font-bold uppercase tracking-widest">{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                                          </button>
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                      );
                  })}
              </div>
          )}
        </div>

        {messageContextMenu && (
            <>
                <div className="fixed inset-0 z-[110]" onClick={() => setMessageContextMenu(null)} />
                <div 
                    className="fixed z-[120] w-44 bg-[#1F1F1F] border border-[#333] rounded-xl shadow-2xl py-1.5 text-[13px] animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                    style={{ top: messageContextMenu.y, left: messageContextMenu.x }}
                >
                    <div onClick={() => handleEditMessageAction(messageContextMenu.messageId)} className="flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] text-[#A1A1A1] hover:text-white cursor-pointer rounded-lg mx-1"><Edit2 className="w-3.5 h-3.5" /><span>Edit</span></div>
                    <div onClick={() => { handleCopyText(messages.find(m => m.id === messageContextMenu.messageId)?.content || '', messageContextMenu.messageId); setMessageContextMenu(null); }} className="flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] text-[#A1A1A1] hover:text-white cursor-pointer rounded-lg mx-1"><Copy className="w-3.5 h-3.5" /><span>Copy</span></div>
                </div>
            </>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 z-40 flex justify-center">
             <InputArea 
                  onSend={(text, atts, thinking, mode) => {
                      onSendMessage(text, atts, thinking, mode, editingMessageId || undefined);
                      setEditingMessageId(null);
                      setEditContent('');
                  }}
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
                  onUpArrow={handleUpArrowOnInput}
                  externalValue={editContent}
             />
        </div>

        {chatContextMenu && (
            <ContextMenu 
                position={chatContextMenu} 
                onClose={() => setChatContextMenu(null)}
                onAction={(action) => {
                    if (action === 'new_session') onNewSession();
                    if (action === 'rename') handleDoubleclickTitle();
                    if (action === 'delete') onDeleteSession();
                    setChatContextMenu(null);
                }}
                currentStatus={session.status}
                availableLabels={availableLabels}
                currentLabelIds={session.labelIds}
                isFlagged={session.isFlagged}
            />
        )}
      </div>

      {userSettings?.enableTasks && (
          <TaskPanel 
            tasks={session.tasks || []} 
            isOpen={isTaskPanelOpen} 
            onToggle={() => setIsTaskPanelOpen(!isTaskPanelOpen)}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
      )}
    </div>
  );
};