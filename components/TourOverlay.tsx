import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronLeft, X, Rocket, Zap, Sparkles, Settings } from 'lucide-react';

interface TourStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    targetId: '', // Center
    title: 'Welcome to Shuper',
    description: "Shuper is your high-performance AI execution workspace. Let's take a quick look around.",
    icon: Rocket
  },
  {
    id: 'sidebar',
    targetId: 'tour-sidebar',
    title: 'Your Command Center',
    description: 'Switch between active chats, specialized AI agents, and workspace settings here.',
    icon: Zap
  },
  {
    id: 'new-chat',
    targetId: 'tour-new-chat',
    title: 'Instant Sessions',
    description: 'Create a new conversation anytime. Shuper organizes them by status and category automatically.',
    icon: Sparkles
  },
  {
    id: 'mode',
    targetId: 'tour-mode-selector',
    title: 'Choose Your Mode',
    description: 'Explore mode is for standard talk. Execute mode provides advanced technical planning and reasoning.',
    icon: Zap
  },
  {
    id: 'model',
    targetId: 'tour-model-selector',
    title: 'AI Providers',
    description: 'Switch between Gemini, DeepSeek, or your own custom agents on the fly.',
    icon: Sparkles
  },
  {
    id: 'settings',
    targetId: 'tour-settings',
    title: 'Connect Your Keys',
    description: "Don't forget to add your API keys in Settings to unlock the full power of Shuper.",
    icon: Settings
  }
];

interface TourOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({ onComplete, onSkip }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const currentStep = TOUR_STEPS[currentStepIndex];

  useEffect(() => {
    const updateHighlight = () => {
      if (!currentStep.targetId) {
        setHighlightRect(null);
        return;
      }
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        setHighlightRect(el.getBoundingClientRect());
      }
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight, true);
    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight, true);
    };
  }, [currentStepIndex, currentStep.targetId]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const spotlightStyle = useMemo(() => {
    if (!highlightRect) return { display: 'none' };
    const padding = 8;
    return {
      top: highlightRect.top - padding,
      left: highlightRect.left - padding,
      width: highlightRect.width + padding * 2,
      height: highlightRect.height + padding * 2,
    };
  }, [highlightRect]);

  const cardPosition = useMemo(() => {
    // If no target (Welcome step), center it
    if (!highlightRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const margin = 24;
    const cardWidth = 320;
    const cardHeight = 240; // Estimated max height
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let top = highlightRect.bottom + margin;
    let left = highlightRect.left + highlightRect.width / 2;

    // Vertical Positioning Check: If card goes off bottom, move to top
    if (top + cardHeight > screenHeight - margin) {
      top = highlightRect.top - cardHeight - margin;
    }

    // Horizontal Positioning Check: Ensure left alignment stays within screen
    const halfWidth = cardWidth / 2;
    if (left - halfWidth < margin) {
      left = halfWidth + margin;
    } else if (left + halfWidth > screenWidth - margin) {
      left = screenWidth - halfWidth - margin;
    }

    // Final safety clamp for top
    top = Math.max(margin, Math.min(top, screenHeight - cardHeight - margin));

    return { 
        top: `${top}px`, 
        left: `${left}px`, 
        transform: 'translateX(-50%)',
        maxHeight: `${screenHeight - margin * 2}px`
    };
  }, [highlightRect]);

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-auto">
      {/* Backdrop with spotlight cutout */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-all duration-500"
        style={{
          clipPath: highlightRect 
            ? `polygon(0% 0%, 0% 100%, ${highlightRect.left - 8}px 100%, ${highlightRect.left - 8}px ${highlightRect.top - 8}px, ${highlightRect.right + 8}px ${highlightRect.top - 8}px, ${highlightRect.right + 8}px ${highlightRect.bottom + 8}px, ${highlightRect.left - 8}px ${highlightRect.bottom + 8}px, ${highlightRect.left - 8}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
      />

      {/* Spotlight Glow */}
      {highlightRect && (
        <div 
          className="absolute border-2 border-blue-500/50 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500 pointer-events-none"
          style={spotlightStyle}
        />
      )}

      {/* Descriptive Card */}
      <div 
        className="absolute w-[320px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 overflow-hidden flex flex-col"
        style={cardPosition}
      >
        <button 
          onClick={onSkip}
          className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 mb-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            {React.createElement(currentStep.icon, { className: "w-5 h-5 text-blue-400" })}
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-tight">{currentStep.title}</h3>
            <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold">Step {currentStepIndex + 1} of {TOUR_STEPS.length}</p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8 overflow-y-auto">
          {currentStep.description}
        </p>

        <div className="flex items-center justify-between mt-auto flex-shrink-0">
          <button 
            onClick={onSkip}
            className="text-xs font-bold text-[var(--text-dim)] hover:text-white uppercase tracking-wider"
          >
            Skip Tour
          </button>
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
                <button 
                    onClick={handleBack}
                    className="p-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl text-white hover:bg-[var(--bg-primary)] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}
            <button 
              onClick={handleNext}
              className="px-5 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};