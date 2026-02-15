import React, { useState, useRef, useEffect } from 'react';
import { Search, Inbox, X, Flag, Tag, Archive, Menu, Circle, MessageSquareDashed } from 'lucide-react';
import { Session, SessionStatus, Label } from '../types';
import { STATUS_CONFIG, StatusSelector } from './StatusSelector';
import { ContextMenu } from './ContextMenu';

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onUpdateSessionStatus: (id: string, status: SessionStatus) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onRegenerateTitle: (id: string) => void;
  availableLabels: Label[];
  onToggleLabel: (sessionId: string, labelId: string) => void;
  onCreateLabel: (label: Label) => void;
  sessionLoading: Record<string, boolean>;
  onNewSession: () => void;
  onToggleFlag: (sessionId: string) => void;
  currentFilter: string;
  onOpenSidebar?: () => void;
  triggerSearch?: number;
}

export const SessionList: React.FC<SessionListProps> = ({ 
    sessions, 
    activeSessionId, 
    onSelectSession, 
    onUpdateSessionStatus,
    onDeleteSession,
    onRenameSession,
    onRegenerateTitle,
    availableLabels,
    onToggleLabel,
    onCreateLabel,
    sessionLoading,
    onNewSession,
    onToggleFlag,
    currentFilter,
    onOpenSidebar,
    triggerSearch
}) => {
  const [statusMenuOpenId, setStatusMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<React.CSSProperties | undefined>(undefined);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, sessionId: string } | null>(null);

  useEffect(() => {
    if (triggerSearch && triggerSearch > 0) {
      setIsSearchOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [triggerSearch]);

  const displayedSessions = sessions.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.subtitle && s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
      if (isSearchOpen && searchInputRef.current) {
          searchInputRef.current.focus();
      }
  }, [isSearchOpen]);

  const handleStatusClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 5, left: rect.left });
    setStatusMenuOpenId(sessionId);
  };

  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, sessionId });
  };

  const handleContextAction = (action: string, payload: any, sessionId: string) => {
      if (action === 'delete') {
          onDeleteSession(sessionId);
      } else if (action === 'toggle_archive') {
          const session = sessions.find(s => s.id === sessionId);
          if (session) {
              const newStatus = session.status === 'archive' ? 'todo' : 'archive';
              onUpdateSessionStatus(sessionId, newStatus);
          }
      } else if (action === 'rename') {
          const session = sessions.find(s => s.id === sessionId);
          if (session) {
             const newTitle = window.prompt('Rename conversation:', session.title);
             if (newTitle !== null && newTitle.trim() !== '') {
                onRenameSession(sessionId, newTitle.trim());
             }
          }
      } else if (action === 'regenerate_title') {
          onRegenerateTitle(sessionId);
      } else if (action === 'update_status') {
          onUpdateSessionStatus(sessionId, payload as SessionStatus);
      } else if (action === 'toggle_label') {
          onToggleLabel(sessionId, payload as string);
      } else if (action === 'toggle_flag') {
          onToggleFlag(sessionId);
      } else if (action === 'new_session') {
          onNewSession();
      }
  };

  return (
    <div className="w-full h-full bg-[var(--bg-secondary)] flex flex-col relative z-10 transition-all duration-300">
      <div className="h-14 flex items-center px-4 border-b border-[var(--border)] relative overflow-hidden">
         <div className={`absolute left-0 right-0 px-4 flex items-center justify-between transition-all duration-300 transform ${isSearchOpen ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
             <div className="flex items-center gap-3">
                 {onOpenSidebar && (
                     <button onClick={onOpenSidebar} className="md:hidden p-1 rounded hover:bg-[var(--bg-elevated)]">
                         <Menu className="w-5 h-5 text-[var(--text-main)]" />
                     </button>
                 )}
                 <span className="font-medium text-[var(--text-main)] text-sm">All Sessions</span>
             </div>
             <Search className="w-4 h-4 text-[var(--text-dim)] cursor-pointer hover:text-[var(--text-main)] transition-colors" onClick={() => setIsSearchOpen(true)} />
         </div>

         <div className={`absolute left-0 right-0 px-4 flex items-center gap-2 transition-all duration-300 transform ${isSearchOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
             <Search className="w-4 h-4 text-[var(--text-main)]" />
             <input 
                 ref={searchInputRef}
                 className="flex-1 bg-transparent text-sm text-[var(--text-main)] focus:outline-none placeholder-[var(--text-dim)]"
                 placeholder="Search sessions..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onBlur={() => !searchQuery && setIsSearchOpen(false)}
                 onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)}
             />
             <X className="w-3.5 h-3.5 text-[var(--text-dim)] cursor-pointer hover:text-[var(--text-main)]" onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar">
        {displayedSessions.length > 0 && <div className="px-2 mb-2 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest">TODAY</div>}
        <div className="space-y-[2px]">
            {displayedSessions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 opacity-60">
                    <MessageSquareDashed className="w-10 h-10 text-[var(--text-dim)]" strokeWidth={1.5} />
                    <div>
                        <div className="text-[13px] font-semibold text-[var(--text-main)]">No sessions found</div>
                        <div className="text-[12px] text-[var(--text-dim)]">Create a new session to get started.</div>
                    </div>
                </div>
            ) : (
                displayedSessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    return (
                        <div
                            key={session.id}
                            onClick={() => onSelectSession(session.id)}
                            onContextMenu={(e) => handleContextMenu(e, session.id)}
                            className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-l-2 ${isActive ? 'bg-[var(--bg-elevated)] border-[var(--accent)]' : 'hover:bg-[var(--bg-tertiary)] border-transparent'}`}
                        >
                            <div className="mt-1 flex-shrink-0" onClick={(e) => handleStatusClick(e, session.id)}>
                                <Circle className={`w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--text-muted)]`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-[14px] font-semibold truncate ${session.status === 'done' ? 'text-[var(--text-dim)] line-through' : 'text-white'}`}>
                                    {session.title}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-[#262626] text-[var(--text-muted)] px-1.5 py-0.5 rounded uppercase tracking-tighter">Explore</span>
                                        {session.isFlagged && <Flag className="w-3 h-3 text-red-500 fill-red-500" />}
                                    </div>
                                    <span className="text-[11px] text-[var(--text-dim)]">1d</span>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>

      {statusMenuOpenId && (
        <StatusSelector
            isOpen={true}
            onClose={() => setStatusMenuOpenId(null)}
            currentStatus={sessions.find(s => s.id === statusMenuOpenId)?.status || 'todo'}
            onSelect={(status) => onUpdateSessionStatus(statusMenuOpenId, status)}
            position={menuPosition}
        />
      )}

      {contextMenu && (
          <ContextMenu 
            position={{ x: contextMenu.x, y: contextMenu.y }}
            onClose={() => setContextMenu(null)}
            onAction={(action, payload) => handleContextAction(action, payload, contextMenu.sessionId)}
            currentStatus={sessions.find(s => s.id === contextMenu.sessionId)?.status || 'todo'}
            availableLabels={availableLabels}
            currentLabelIds={sessions.find(s => s.id === contextMenu.sessionId)?.labelIds || []}
            isFlagged={sessions.find(s => s.id === contextMenu.sessionId)?.isFlagged || false}
          />
      )}
    </div>
  );
};