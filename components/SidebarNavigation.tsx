import React, { useState } from 'react';
import { 
  SquarePen, 
  Inbox, 
  Flag, 
  CheckCircle2, 
  Tag, 
  Archive, 
  Zap, 
  Settings, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Cpu,
  X
} from 'lucide-react';
import { STATUS_CONFIG } from './StatusSelector';
import { SessionStatus, Label } from '../types';

interface SidebarNavigationProps {
    currentFilter: string;
    onSetFilter: (filter: string) => void;
    onNewSession: () => void;
    onBack?: () => void;
    onForward?: () => void;
    canBack: boolean;
    canForward: boolean;
    statusCounts: Record<SessionStatus, number>;
    availableLabels: Label[];
    currentView: 'chat' | 'agents' | 'settings';
    onChangeView: (view: 'chat' | 'agents' | 'settings') => void;
    workspaceName: string;
    onShowWhatsNew: () => void;
    onCloseMobile?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ 
    currentFilter, 
    onSetFilter, 
    onNewSession,
    onBack,
    onForward,
    canBack,
    canForward,
    statusCounts,
    availableLabels,
    currentView,
    onChangeView,
    workspaceName,
    onShowWhatsNew,
    onCloseMobile
}) => {
  const [isStatusExpanded, setIsStatusExpanded] = useState(false);
  const [isLabelsExpanded, setIsLabelsExpanded] = useState(false);

  const navItems = [
    { id: 'all', label: 'All Sessions', icon: Inbox },
    { id: 'flagged', label: 'Flagged', icon: Flag },
  ];

  return (
    <div className="w-[280px] md:w-[260px] flex-shrink-0 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-r border-[var(--border)] flex flex-col h-full text-[var(--text-muted)] text-sm z-20 transition-all duration-300">
      {/* Top Header / Logo / History */}
      <div className="h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onChangeView('chat')}>
            <span className="font-semibold text-[var(--text-main)] text-base tracking-tight">Shuper</span>
        </div>
        <div className="flex gap-1 items-center">
          <button 
            disabled={!canBack}
            onClick={onBack}
            className={`p-1 rounded hover:bg-[var(--bg-elevated)] transition-colors hidden md:block ${canBack ? 'text-[var(--text-main)] cursor-pointer' : 'text-[var(--text-dim)] cursor-default'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
             disabled={!canForward}
             onClick={onForward}
             className={`p-1 rounded hover:bg-[var(--bg-elevated)] transition-colors hidden md:block ${canForward ? 'text-[var(--text-main)] cursor-pointer' : 'text-[var(--text-dim)] cursor-default'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {onCloseMobile && (
              <button 
                onClick={onCloseMobile}
                className="p-1 rounded hover:bg-[var(--bg-elevated)] md:hidden text-[var(--text-main)]"
              >
                <X className="w-5 h-5" />
              </button>
          )}
        </div>
      </div>

      <div className="px-3 pb-4 overflow-y-auto custom-scrollbar">
        <button 
            onClick={() => {
                onChangeView('chat');
                onNewSession();
            }}
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-[var(--bg-elevated)] text-[var(--text-main)] transition-all duration-200 mb-4 border border-[var(--border)] shadow-sm bg-[var(--bg-tertiary)] hover:shadow-md hover:border-[var(--text-dim)]"
        >
          <SquarePen className="w-4 h-4" />
          <span className="font-medium">New Session</span>
        </button>

        <nav className="space-y-[1px]">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                  onChangeView('chat');
                  onSetFilter(item.id);
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                currentView === 'chat' && currentFilter === item.id 
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] shadow-sm' 
                    : 'hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
          ))}

          {/* Status Item with Expansion */}
          <div>
            <div
                onClick={() => setIsStatusExpanded(!isStatusExpanded)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                    currentView === 'chat' && currentFilter.startsWith('status') 
                        ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] shadow-sm' 
                        : 'hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]'
                }`}
            >
                <CheckCircle2 className="w-4 h-4" />
                <span>Status</span>
            </div>
            
            {isStatusExpanded && (
                <div className="ml-4 pl-3 border-l border-[var(--border)] mt-1 space-y-[1px] animate-in slide-in-from-top-2 fade-in duration-200">
                    {(Object.keys(STATUS_CONFIG) as SessionStatus[]).map(status => {
                        const config = STATUS_CONFIG[status];
                        const Icon = config.icon;
                        const filterKey = `status:${status}`;
                        const isActive = currentView === 'chat' && currentFilter === filterKey;

                        return (
                            <div
                                key={status}
                                onClick={() => {
                                    onChangeView('chat');
                                    onSetFilter(filterKey);
                                }}
                                className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                                    isActive 
                                        ? 'bg-[var(--bg-elevated)] text-[var(--text-main)]' 
                                        : 'hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)] text-[var(--text-dim)]'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-dim)]'}`} />
                                    <span className="text-[13px]">{config.label}</span>
                                </div>
                                <span className="text-[11px] text-[var(--text-dim)]">{statusCounts[status] || 0}</span>
                            </div>
                        )
                    })}
                </div>
            )}
          </div>

           <div>
              <div
                onClick={() => setIsLabelsExpanded(!isLabelsExpanded)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                  currentView === 'chat' && currentFilter.startsWith('label:') 
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] shadow-sm' 
                    : 'hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Labels</span>
              </div>

               {isLabelsExpanded && (
                  <div className="ml-4 pl-3 border-l border-[var(--border)] mt-1 space-y-[1px] animate-in slide-in-from-top-2 fade-in duration-200">
                      {availableLabels.length === 0 ? (
                          <div className="px-3 py-2 text-[12px] text-[var(--text-dim)] italic">No labels</div>
                      ) : (
                          availableLabels.map(label => {
                              const filterKey = `label:${label.id}`;
                              const isActive = currentView === 'chat' && currentFilter === filterKey;
                              return (
                                  <div
                                      key={label.id}
                                      onClick={() => {
                                          onChangeView('chat');
                                          onSetFilter(filterKey);
                                      }}
                                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                                          isActive 
                                            ? 'bg-[var(--bg-elevated)] text-[var(--text-main)]' 
                                            : 'hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)] text-[var(--text-dim)]'
                                      }`}
                                  >
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }}></div>
                                      <span className="text-[13px]">{label.name}</span>
                                  </div>
                              );
                          })
                      )}
                  </div>
              )}
            </div>

             <div
              onClick={() => {
                  onChangeView('chat');
                  onSetFilter('archived');
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                currentView === 'chat' && currentFilter === 'archived' 
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] shadow-sm' 
                    : 'hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>Archived</span>
            </div>
        </nav>

        <div className="my-4 h-[1px] bg-[var(--bg-elevated)]" />

        <nav className="space-y-[1px]">
          <div 
             onClick={() => onChangeView('agents')}
             className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                currentView === 'agents' 
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] shadow-sm' 
                    : 'hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]'
             }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Agents</span>
          </div>
        </nav>

        <div className="my-4 h-[1px] bg-[var(--bg-elevated)]" />

        <nav className="space-y-[1px]">
          <div 
             onClick={() => onChangeView('settings')}
             className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                currentView === 'settings' 
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] shadow-sm' 
                    : 'hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]'
             }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </div>
          <div 
            onClick={onShowWhatsNew}
            className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>What's New</span>
          </div>
        </nav>
      </div>

      <div className="mt-auto px-3 pb-4">
        <div className="flex items-center justify-between px-2 py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors rounded-md hover:bg-[var(--bg-elevated)]">
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[var(--text-muted)] rounded-full text-[var(--bg-primary)] flex items-center justify-center text-[10px] font-bold uppercase">
                    {workspaceName.substring(0, 1)}
                </div>
                <span className="text-sm truncate max-w-[140px]">{workspaceName}</span>
            </div>
            <HelpCircle className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};