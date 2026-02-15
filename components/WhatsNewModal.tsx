import React from 'react';
import { X, Check, RefreshCcw, Layout, MessageSquare } from 'lucide-react';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                <span className="text-lg">✨</span>
             </div>
             <h2 className="text-lg font-semibold text-[var(--text-main)]">What's New</h2>
          </div>
          <button 
             onClick={onClose}
             className="text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
          >
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
             <div className="flex-shrink-0 mt-1">
                 <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border)]">
                     <RefreshCcw className="w-4 h-4 text-[#A78BFA]" />
                 </div>
             </div>
             <div>
                 <h3 className="text-sm font-medium text-[var(--text-main)] mb-1">Title Regeneration</h3>
                 <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                     Right-click any session to instantly regenerate a concise title using Gemini based on the conversation context.
                 </p>
             </div>
          </div>

          <div className="flex gap-4">
             <div className="flex-shrink-0 mt-1">
                 <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border)]">
                     <Layout className="w-4 h-4 text-[#3B82F6]" />
                 </div>
             </div>
             <div>
                 <h3 className="text-sm font-medium text-[var(--text-main)] mb-1">Empty States</h3>
                 <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                     Improved guidance when filtering sessions by status, labels, or archives returns no results.
                 </p>
             </div>
          </div>

          <div className="flex gap-4">
             <div className="flex-shrink-0 mt-1">
                 <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border)]">
                     <MessageSquare className="w-4 h-4 text-[#10B981]" />
                 </div>
             </div>
             <div>
                 <h3 className="text-sm font-medium text-[var(--text-main)] mb-1">Inline Renaming</h3>
                 <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                     Double-click or use the context menu to rename sessions directly in the sidebar without popups.
                 </p>
             </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-end">
           <button 
              onClick={onClose}
              className="px-4 py-2 bg-[var(--text-main)] text-[var(--bg-primary)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
           >
               Got it
           </button>
        </div>
      </div>
    </>
  );
};