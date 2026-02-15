import React, { useState, useRef, useEffect } from 'react';
import { Search, Inbox, X, Flag, Tag, Archive } from 'lucide-react';
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
    currentFilter
}) => {
  const [statusMenuOpenId, setStatusMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<React.CSSProperties | undefined>(undefined);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, sessionId: string } | null>(null);

  const displayedSessions = sessions.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSessions = displayedSessions.reduce((acc, session) => {
    if (!acc[session.category]) {
      acc[session.category] = [];
    }
    acc[session.category].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  const categories = ['TODAY', 'YESTERDAY', 'PREVIOUS'];

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
          // Inline renaming is handled via ChatInterface's title state or side effect
          // This call triggers the rename flow if needed
          const session = sessions.find(s => s.id === sessionId);
          if (session) {
             onRenameSession(sessionId, session.title); 
          }
      } else if (action === 'regenerate_title') {
          onRegenerateTitle(sessionId);
      } else if (action === 'update_status') {
          onUpdateSessionStatus(sessionId, payload as SessionStatus);
      } else if (action === 'toggle_label') {
          onToggleLabel(sessionId, payload as string);
      } else if (action === 'toggle_flag') {
          onToggleFlag(sessionId);
      }
  };

  const getHeaderTitle = () => {
    if (currentFilter === 'all') return 'All Sessions';
    if (currentFilter === 'flagged') return 'Flagged';
    if (currentFilter === 'archived') return 'Archived';
    if (currentFilter.startsWith('status:')) {
        const status = currentFilter.split(':')[1];
        return STATUS_CONFIG[status as SessionStatus]?.label || 'Status Filter';
    }
    if (currentFilter.startsWith('label:')) {
        const lid = currentFilter.split(':')[1];
        const label = availableLabels.find(l => l.id === lid);
        return label ? label.name : 'Label Filter';
    }
    return 'Sessions';
  };

  return (
    <div className="w-[300px] flex-shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col h-full relative z-10 transition-all duration-300">
      <div className="h-14 flex items-center px-4 border-b border-transparent relative overflow-hidden">
         <div 
            className={`absolute left-0 right-0 px-4 flex items-center justify-between transition-all duration-300 transform ${
                isSearchOpen ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
            }`}
         >
             <span className="font-medium text-[var(--text-main)] text-sm">{getHeaderTitle()}</span>
             <Search 
                className="w-4 h-4 text-[var(--text-dim)] cursor-pointer hover:text-[var(--text-main)] transition-colors" 
                onClick={() => setIsSearchOpen(true)}
            />
         </div>

         <div 
            className={`absolute left-0 right-0 px-4 flex items-center gap-2 transition-all duration-300 transform ${
                isSearchOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
         >
             <Search className="w-4 h-4 text-[var(--text-main)]" />
             <input 
                 ref={searchInputRef}
                 className="flex-1 bg-transparent text-sm text-[var(--text-main)] focus:outline-none placeholder-[var(--text-dim)]"
                 placeholder="Search sessions..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onBlur={() => !searchQuery && setIsSearchOpen(false)}
             />
             <X 
                className="w-3.5 h-3.5 text-[var(--text-dim)] cursor-pointer hover:text-[var(--text-main)]" 
                onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                }}
             />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
        <div key={currentFilter} className="h-full animate-in fade-in slide-in-from-left-2 duration-300">
            {displayedSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60%] text-center px-6">
                    <div className="w-12 h-12 mb-4 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-dim)] border border-[var(--border)]">
                        <Inbox className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-medium text-[var(--text-main)] mb-1">No sessions found</h3>
                    <p className="text-xs text-[var(--text-dim)] mb-6 leading-relaxed max-w-[200px]">
                        {searchQuery ? `No results for "${searchQuery}"` : "Create a new session to get started with your agent."}
                    </p>
                    <button 
                        onClick={onNewSession}
                        className="px-4 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--border)] border border-[var(--border)] rounded-lg text-xs font-medium text-[var(--text-main)] transition-all hover:shadow-md active:scale-95"
                    >
                        New Session
                    </button>
                </div>
            ) : (
                categories.map((category) => {
                    const categorySessions = groupedSessions[category];
                    if (!categorySessions || categorySessions.length === 0) return null;

                    return (
                        <div key={category} className="mb-6">
                            <div className="px-2 mb-2 text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider sticky top-0 bg-[var(--bg-secondary)]/95 backdrop-blur-sm py-1 z-10">
                                {category}
                            </div>
                            <div className="space-y-[2px]">
                                {categorySessions.map((session) => {
                                    const StatusIcon = STATUS_CONFIG[session.status].icon;
                                    const isLoading = sessionLoading[session.id];
                                    
                                    return (
                                        <div
                                            key={session.id}
                                            onClick={() => onSelectSession(session.id)}
                                            onContextMenu={(e) => handleContextMenu(e, session.id)}
                                            className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 relative border border-transparent ${
                                                session.id === activeSessionId
                                                    ? 'bg-[var(--bg-elevated)] border-[var(--border)] shadow-sm'
                                                    : 'hover:bg-[var(--bg-tertiary)]'
                                            } ${isLoading ? 'animate-pulse bg-[var(--bg-tertiary)]' : ''}`}
                                        >
                                            <div 
                                                className="mt-0.5 flex-shrink-0 hover:bg-[var(--border)] rounded p-0.5 -ml-1 transition-colors"
                                                onClick={(e) => handleStatusClick(e, session.id)}
                                            >
                                                <StatusIcon className={`w-3.5 h-3.5 ${STATUS_CONFIG[session.status].color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-[13px] leading-tight truncate flex items-center gap-2 ${
                                                    session.status === 'done' ? 'text-[var(--text-dim)] line-through' : 'text-[var(--text-main)]'
                                                }`}>
                                                    <span className="truncate">{session.title}</span>
                                                    {session.isFlagged && (
                                                        <Flag className="w-3 h-3 text-red-500 fill-red-500 ml-1" />
                                                    )}
                                                    {session.labelIds.length > 0 && (
                                                        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                                            {session.labelIds.map(labelId => {
                                                                const label = availableLabels.find(l => l.id === labelId);
                                                                if (!label) return null;
                                                                return (
                                                                    <div 
                                                                        key={labelId} 
                                                                        className="w-1.5 h-1.5 rounded-full" 
                                                                        style={{ backgroundColor: label.color }}
                                                                    ></div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-1.5">
                                                     <div className="flex items-center gap-2">
                                                         {session.hasNewResponse && (
                                                             <span className="text-[10px] font-bold bg-[#335C4E] text-[#6EE7B7] px-1.5 py-0.5 rounded-[4px]">
                                                                New
                                                             </span>
                                                         )}
                                                         <span className="text-[10px] bg-[var(--bg-tertiary)] text-[var(--text-muted)] px-1.5 py-0.5 rounded border border-[var(--border)] group-hover:border-[var(--text-dim)] transition-colors capitalize">{session.mode}</span>
                                                     </div>
                                                     <span className="text-[11px] text-[var(--text-dim)] font-medium">
                                                        {session.timestamp}
                                                     </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
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