import React, { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Label } from '../types';

interface LabelSelectorProps {
  availableLabels: Label[];
  selectedLabelIds: string[];
  onToggleLabel: (labelId: string) => void;
  // onCreateLabel removed as per request
  onClose: () => void;
  isOpen: boolean;
  position?: { top: number; left: number };
}

export const LabelSelector: React.FC<LabelSelectorProps> = ({ 
  availableLabels, 
  selectedLabelIds, 
  onToggleLabel, 
  onClose,
  isOpen,
  position 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              onClose();
          }
      };
      if (isOpen) {
          document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const style: React.CSSProperties = position 
    ? { top: position.top, left: position.left } 
    : { bottom: '100%', right: 0, marginBottom: '8px', transformOrigin: 'bottom right' };

  return (
    <div 
        ref={menuRef}
        className="absolute z-[60] w-56 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150 origin-top-left"
        style={style}
    >
      <div className="px-3 py-2 border-b border-[#262626]">
         <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">Labels</span>
      </div>
      
      <div className="max-h-[200px] overflow-y-auto py-1">
        {availableLabels.length === 0 && (
            <div className="px-4 py-2 text-xs text-[#525252] italic">No labels available. Add in Settings.</div>
        )}
        
        {availableLabels.map(label => {
            const isSelected = selectedLabelIds.includes(label.id);
            return (
                <div 
                    key={label.id}
                    onClick={() => onToggleLabel(label.id)}
                    className="flex items-center justify-between px-3 py-1.5 hover:bg-[#262626] cursor-pointer group transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: label.color }}></div>
                        <span className="text-[13px] text-[#E5E5E5]">{label.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
            );
        })}
      </div>
    </div>
  );
};