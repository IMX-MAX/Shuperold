import React, { useEffect, useRef, useState } from 'react';
import { 
  Circle, 
  Tag, 
  Flag, 
  Archive, 
  Mail, 
  Edit2, 
  RefreshCcw, 
  Trash2, 
  ChevronRight
} from 'lucide-react';
import { SessionStatus, Label } from '../types';
import { STATUS_CONFIG } from './StatusSelector';

interface ContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onAction: (action: string, payload?: any) => void;
  currentStatus: SessionStatus;
  availableLabels: Label[];
  currentLabelIds: string[];
  isFlagged?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ 
  position, 
  onClose, 
  onAction, 
  currentStatus,
  availableLabels,
  currentLabelIds,
  isFlagged
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position if it goes off screen
  const adjustedLeft = Math.min(position.x, window.innerWidth - 240); // 240 is approx width
  const adjustedTop = Math.min(position.y, window.innerHeight - 300);

  const style: React.CSSProperties = {
    top: adjustedTop,
    left: adjustedLeft,
  };

  return (
    <div 
      ref={menuRef}
      style={style}
      className="fixed z-[100] w-56 bg-[#262626] border border-[var(--border)] rounded-xl shadow-2xl py-1.5 text-[var(--text-main)] text-[13px] animate-in fade-in zoom-in-95 duration-150 origin-top-left"
      onClick={(e) => e.stopPropagation()} 
    >
      <div className="px-1.5 space-y-0.5">
        {/* Status Submenu Trigger */}
        <div 
           className="relative flex items-center justify-between px-3 py-2 hover:bg-[var(--accent)] hover:text-white rounded-lg cursor-pointer group transition-colors"
           onMouseEnter={() => setActiveSubmenu('status')}
           onMouseLeave={() => setActiveSubmenu(null)}
        >
           <div className="flex items-center gap-3">
             <Circle className="w-4 h-4 text-[var(--text-dim)] group-hover:text-white" />
             <span>Status</span>
           </div>
           <ChevronRight className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-white" />

           {activeSubmenu === 'status' && (
               <div className="absolute left-full top-0 ml-1.5 w-48 bg-[#262626] border border-[var(--border)] rounded-xl shadow-xl py-1.5 animate-in fade-in slide-in-from-left-2 duration-150 z-[110]">
                   {(Object.keys(STATUS_CONFIG) as SessionStatus[]).map(status => (
                       <div 
                          key={status}
                          onClick={(e) => {
                              e.stopPropagation();
                              onAction('update_status', status);
                              onClose();
                          }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--accent)] hover:text-white cursor-pointer mx-1 rounded-md"
                       >
                           <div className={`w-2 h-2 rounded-full ${status === currentStatus ? 'bg-[var(--text-main)] group-hover:bg-white' : 'bg-transparent border border-[var(--text-dim)]'}`}></div>
                           <span>{STATUS_CONFIG[status].label}</span>
                       </div>
                   ))}
               </div>
           )}
        </div>

        {/* Labels Submenu Trigger */}
        <div 
           className="relative flex items-center justify-between px-3 py-2 hover:bg-[var(--accent)] hover:text-white rounded-lg cursor-pointer group transition-colors"
           onMouseEnter={() => setActiveSubmenu('labels')}
           onMouseLeave={() => setActiveSubmenu(null)}
        >
           <div className="flex items-center gap-3">
             <Tag className="w-4 h-4 text-[var(--text-dim)] group-hover:text-white" />
             <span>Labels</span>
           </div>
           <ChevronRight className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-white" />

           {activeSubmenu === 'labels' && (
               <div className="absolute left-full top-0 ml-1.5 w-48 bg-[#262626] border border-[var(--border)] rounded-xl shadow-xl py-1.5 animate-in fade-in slide-in-from-left-2 duration-150 z-[110]">
                   {availableLabels.length === 0 ? (
                       <div className="px-3 py-2 text-[var(--text-dim)] italic">No labels created</div>
                   ) : (
                       availableLabels.map(label => {
                           const isSelected = currentLabelIds.includes(label.id);
                           return (
                               <div 
                                  key={label.id}
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      onAction('toggle_label', label.id);
                                  }}
                                  className="flex items-center justify-between px-3 py-2 hover:bg-[var(--accent)] hover:text-white cursor-pointer mx-1 rounded-md"
                               >
                                   <div className="flex items-center gap-2">
                                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: label.color }}></div>
                                       <span>{label.name}</span>
                                   </div>
                                   {isSelected && <div className="w-1.5 h-1.5 bg-current rounded-full"></div>}
                               </div>
                           )
                       })
                   )}
               </div>
           )}
        </div>

        <div 
           onClick={(e) => {
               e.stopPropagation();
               onAction('toggle_flag'); 
               onClose();
           }}
           className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--accent)] hover:text-white rounded-lg cursor-pointer group transition-colors"
        >
           <Flag className={`w-4 h-4 ${isFlagged ? 'text-red-500 fill-red-500' : 'text-[var(--text-dim)]'} group-hover:text-white group-hover:fill-transparent`} />
           <span>{isFlagged ? 'Unflag' : 'Flag'}</span>
        </div>
         <div 
            onClick={(e) => {
                e.stopPropagation();
                onAction('toggle_archive');
                onClose();
            }}
            className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--accent)] hover:text-white rounded-lg cursor-pointer group transition-colors"
         >
           <Archive className="w-4 h-4 text-[var(--text-dim)] group-hover:text-white" />
           <span>{currentStatus === 'archive' ? 'Unarchive' : 'Archive'}</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--accent)] hover:text-white rounded-lg cursor-pointer group transition-colors">
           <Mail className="w-4 h-4 text-[var(--text-dim)] group-hover:text-white" />
           <span>Mark as Unread</span>
        </div>
      </div>
      
      <div className="h-[1px] bg-[var(--border)] my-1 mx-2" />
      
      <div className="px-1.5 space-y-0.5">
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onAction('rename');
                onClose();
            }}
            className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--accent)] hover:text-white rounded-lg cursor-pointer group transition-colors"
        >
           <Edit2 className="w-4 h-4 text-[var(--text-dim)] group-hover:text-white" />
           <span>Rename</span>
        </div>
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onAction('regenerate_title');
                onClose();
            }}
            className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--accent)] hover:text-white rounded-lg cursor-pointer group transition-colors"
        >
           <RefreshCcw className="w-4 h-4 text-[var(--text-dim)] group-hover:text-white" />
           <span>Regenerate Title</span>
        </div>
      </div>
      
      <div className="h-[1px] bg-[var(--border)] my-1 mx-2" />
      
      <div className="px-1.5">
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onAction('delete');
                onClose();
            }}
            className="flex items-center gap-3 px-3 py-2 hover:bg-red-600 hover:text-white text-red-500 rounded-lg cursor-pointer group transition-colors"
        >
           <Trash2 className="w-4 h-4 group-hover:text-white" />
           <span>Delete</span>
        </div>
      </div>
    </div>
  );
};