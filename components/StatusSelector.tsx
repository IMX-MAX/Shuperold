import React from 'react';
import { 
  CircleDashed, 
  Circle, 
  CheckCircle2, 
  XCircle, 
  Archive, 
  CircleDot
} from 'lucide-react';
import { SessionStatus } from '../types';

interface StatusSelectorProps {
  currentStatus: SessionStatus;
  onSelect: (status: SessionStatus) => void;
  onClose: () => void;
  isOpen: boolean;
  position?: { top: number; left: number };
}

export const STATUS_CONFIG: Record<SessionStatus, { label: string; icon: React.ElementType; color: string }> = {
  backlog: { label: 'Backlog', icon: CircleDashed, color: 'text-[#737373]' },
  todo: { label: 'Todo', icon: Circle, color: 'text-[#A1A1A1]' },
  needs_review: { label: 'Needs Review', icon: CircleDot, color: 'text-[#F59E0B]' }, // Yellow/Orange Target
  done: { label: 'Done', icon: CheckCircle2, color: 'text-[#10B981]' }, // Green
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-[#737373]' },
  archive: { label: 'Archive', icon: Archive, color: 'text-[#737373]' },
};

export const StatusSelector: React.FC<StatusSelectorProps> = ({ currentStatus, onSelect, onClose, isOpen, position }) => {
  if (!isOpen) return null;

  const statuses: SessionStatus[] = ['backlog', 'todo', 'needs_review', 'done', 'cancelled'];

  return (
    <>
      <div className="fixed inset-0 z-[40]" onClick={onClose} />
      <div 
        className="absolute z-[50] w-[180px] bg-[#1F1F1F] border border-[#333] rounded-xl shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-150 origin-top-right overflow-hidden"
        style={position ? { top: position.top, left: position.left } : { bottom: '100%', right: 0, marginBottom: '8px', transformOrigin: 'bottom right' }}
      >
        <div className="px-2 py-1.5 border-b border-[#2A2A2A] mb-1">
            <input 
                type="text" 
                placeholder="Filter statuses..." 
                className="w-full bg-transparent text-[13px] text-[#E5E5E5] placeholder-[#525252] focus:outline-none px-1"
                autoFocus
            />
        </div>
        {statuses.map((status) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const isSelected = currentStatus === status;
          
          return (
            <div
              key={status}
              onClick={() => {
                onSelect(status);
                onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                isSelected ? 'bg-[#2A2A2A]' : 'hover:bg-[#2A2A2A]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              <span className={`text-[13px] font-medium ${isSelected ? 'text-[#E5E5E5]' : 'text-[#A1A1A1]'}`}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};