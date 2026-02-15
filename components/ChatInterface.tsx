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
  PlusCircle
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
}

const ThinkingBlock = ({ thoughtProcess, isGenerating }: { thoughtProcess: string, isGenerating?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const lines = thoughtProcess.split('\n').map(l => l.trim()).filter(l => l);
    const summary = lines.length > 0 ? lines[0].replace(/^-/, '').trim() : "Thinking...";
    const steps = lines.slice(1);

    return (
        <div className="mb-4 rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#262626] font-inter shadow-inner animate-in fade-in slide-in-from-top-1 duration-500">
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#151515] transition-all select-none group"
            >
                <div className={`p-1.5 rounded-full transition-all duration-500 ${isGenerating ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[#262626] text-[var(--text-muted)]'}`}>
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] text-[var(--text-main)] font-medium leading-tight">
                        {isGenerating ? "Thinking..." : "Finished Thinking"}
                    </span>
                    <span className="text-[11px] text-[var(--text-dim)] truncate max-w-[180px] md:max-w-[240px] transition-opacity duration-300">
                        {lines.length > 0 ? lines[lines.length-1] : "Initializing..."}
                    </span>
                </div>
                <div className="flex-1" />
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                    <ChevronDown className="w-4 h-4 text-[var(--text-dim)]" />
                </div>
            </div>
            
            <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="px-4 pb-4">
                    <div className="h-[1px] bg-[#262626] mb-3" />
                    <p className="text-[13px] text-[var(--text-muted)] mb-4 pl-1 border-l-2 border-[var(--accent)]/30 leading-relaxed">{summary}</p>
                    
                    <div className="space-y-3">
                        {steps.map((step, idx) => {
                            let Icon = Search;
                            let label = "Searching";
                            const lower = step.toLowerCase();
                            if (lower.includes('analyz') || lower.includes('review')) { Icon = Eye; label = "Reviewing"; }
                            else if (lower.includes('web') || lower.includes('site') || lower.includes('http')) { Icon = Globe; label = "Browsing"; }

                            return (
                                <div key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <div className="mt-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#333]"></div></div>
                                    <div className="flex-1">
                                         <div className="flex items-center gap-2 mb-1">
                                             <Icon className="w-3 h-3 text-[var(--text-dim)]" />
                                             <span className="text-[11px] text-[var(--text-dim)] uppercase tracking-widest font-bold">{label}</span>
                                         </div>
                                         <div className="bg-[#151515]/50 border border-[#262626] rounded-lg px-3 py-2 text-[13px] text-[var(--text-muted)] hover:border-[#404040] hover:text-[var(--text-main)] transition-colors cursor-default">
                                             {step.replace(/^-/, '').trim()}
                                         </div>
                                    </div>
                                </div>
                            );
                        })}
                        {isGenerating && (
                            <div className="flex items-center gap-3 pl-1 animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div>
                                <span className="text-[12px] text-[var(--text-dim)] italic">Synthesizing...</span>
                            </div>
                        )}
                    </div>
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
    onBackToList, onOpenSidebar
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
  }, [messages, isLoading, messages[messages.length - 1]?.thoughtProcess]);

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

  const handleTitleMenuAction = (action: string, payload: any) => {
      if (action === 'delete') onDeleteSession();
      else if (action === 'rename') handleDoubleclickTitle();
      else if (action === 'regenerate_title') onRegenerateTitle(session.id);
      else if (action === 'update_status') onUpdateStatus(payload);
      else if (action === 'toggle_label') onUpdateLabels(payload);
      else if (action === 'create_label') {
          const newLabel: Label = { id: Date.now().toString(), name: payload.name, color: payload.color };
          onCreateLabel(newLabel);
          onUpdateLabels(newLabel.id);
      } else if (action === 'toggle_archive') {
          const newStatus = session.status === 'archive' ? 'todo' : 'archive';
          onUpdateStatus(newStatus);
      } else if (action === 'toggle_flag') onToggleFlag();
      else if (action === 'new_session') onNewSession();
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

  return (
    <div 
        className="flex-1 flex flex-col h-full bg-[var(--bg-tertiary)] relative font-inter overflow-hidden"
        onContextMenu={handleChatContextMenu}
    >
      {/* Absolute Header Overlay */}
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
                <div className="px-2 pb-1.5 mb-1 border-b border-[#2A2A2A]">
                    <span className="px-2 text-[10px] font-bold text-[#525252] uppercase tracking-wider">Chat Settings</span>
                </div>
                <div onClick={() => { onUpdateMode('explore'); setChatContextMenu(null); }} className={`flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] cursor-pointer rounded-lg mx-1 transition-colors ${session.mode === 'explore' ? 'text-white' : 'text-[#A1A1A1]'}`}><Compass className="w-4 h-4" /><span>Explore Mode</span></div>
                <div onClick={() => { onUpdateMode('execute'); setChatContextMenu(null); }} className={`flex items-center gap-3 px-3 py-2 hover:bg-[#2A2A2A] cursor-pointer rounded-lg mx-1 transition-colors ${session.mode === 'execute' ? 'text-white' : 'text-[#A1A1A1]'}`}><RefreshCcw className="w-4 h-4" /><span>Execute Mode</span></div>
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
        <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg, index) => {
                const isLast = index === messages.length - 1;
                const isGenerating = isLast && isLoading && msg.role === 'model';
                const showProcessing = isGenerating && !msg.content && !msg.thoughtProcess;
                const isQuotaError = msg.role === 'model' && msg.content.includes("Quota Exceeded");

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
                                <div className="bg-[var(--bg-elevated)] text-[var(--text-main)] p-3 px-4 md:p-3.5 md:px-5 rounded-2xl text-[14px] md:text-[15px] leading-relaxed shadow-sm cursor-default hover:bg-[var(--border)] transition-colors border border-transparent hover:border-[var(--accent)]/10">
                                    {msg.content}
                                </div>
                             )}
                         </div>
                    ) : (
                        <div className="w-full text-[var(--text-main)] leading-relaxed text-[14px] md:text-[15px] flex flex-col gap-1 group/msg">
                            {showProcessing && (
                                <div className="flex items-center gap-3 text-[var(--text-dim)] text-xs md:text-sm animate-pulse ml-1 mb-4 bg-[var(--bg-elevated)]/50 w-fit px-4 py-2 rounded-full border border-[var(--border)]">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span className="font-medium">Shuper is analyzing...</span>
                                </div>
                            )}
                            {msg.thoughtProcess && <ThinkingBlock thoughtProcess={msg.thoughtProcess} isGenerating={isGenerating} />}
                            {isQuotaError ? (
                                <div className="bg-red-900/10 border border-red-900/40 rounded-2xl p-4 md:p-5 flex items-start gap-3 md:gap-4 text-red-200 animate-in fade-in slide-in-from-top-1 duration-500">
                                    <div className="p-2 bg-red-900/20 rounded-full">
                                        <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1 text-[15px] md:text-[16px]">API Quota Exceeded</h4>
                                        <p className="text-[13px] md:text-sm text-red-200/70 leading-relaxed mb-4">Limit reached. Integrate your own API key in Settings to continue.</p>
                                        <button onClick={() => onChangeView('settings')} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-xl text-[11px] md:text-xs transition-all shadow-lg active:scale-95">Go to Settings</button>
                                    </div>
                                </div>
                            ) : msg.content && (
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
                                        {msg.content}
                                    </Markdown>
                                </div>
                            )}
                            {!isGenerating && msg.content && !isQuotaError && (
                                <div className="flex items-center gap-4 mt-2 md:mt-4 opacity-100 md:opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleCopyText(msg.content, msg.id)} 
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
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center animate-pulse">
                        <Bot className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-[var(--bg-elevated)] rounded-full w-[40%] animate-pulse"></div>
                        <div className="h-4 bg-[var(--bg-elevated)] rounded-full w-[60%] animate-pulse delay-75"></div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Input Area Overlay */}
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
           />
      </div>

      {titleMenuPosition && !isEditingTitle && <ContextMenu position={titleMenuPosition} onClose={() => setTitleMenuPosition(null)} onAction={handleTitleMenuAction} currentStatus={session.status} availableLabels={availableLabels} currentLabelIds={session.labelIds} isFlagged={session.isFlagged} />}
    </div>
  );
};