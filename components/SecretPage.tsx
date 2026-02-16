import React, { useEffect, useState } from 'react';
import { HandDrawnStrike, HandDrawnUnderline, HandDrawnCheck } from './HandDrawn';

export const SecretPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Reset animation when page opens
    setStep(0);
    const timer = setInterval(() => {
      setStep((prev) => (prev < 4 ? prev + 1 : 4));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              onClose();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center overflow-hidden" onClick={onClose}>
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6 lg:px-8 pointer-events-none select-none">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-12">
          Introducing <br className="hidden md:block"/>
          <span className="text-black">Shuper</span>
        </h1>

        <div className="text-4xl md:text-6xl font-medium flex flex-col items-center gap-4 mb-16">
          <p className="text-gray-400 text-lg md:text-xl font-mono mb-6 uppercase tracking-widest">Shuper is...</p>
          
          <div className="relative">
            <span className={`transition-colors duration-300 font-bold ${step >= 1 ? 'text-gray-400' : 'text-gray-300'}`}>fast</span>
            <HandDrawnStrike visible={step >= 1} />
          </div>
          
          <div className="relative">
            <span className={`transition-colors duration-300 font-bold ${step >= 2 ? 'text-gray-400' : 'text-gray-300'}`}>private</span>
            <HandDrawnStrike visible={step >= 2} />
          </div>
          
          <div className="relative">
            <span className={`transition-colors duration-300 font-bold ${step >= 3 ? 'text-gray-400' : 'text-gray-300'}`}>intelligent</span>
            <HandDrawnStrike visible={step >= 3} />
          </div>
          
          <div className={`relative mt-8 transform transition-all duration-500 ${step >= 4 ? 'opacity-100 translate-y-0 scale-110' : 'opacity-0 translate-y-4'}`}>
            <span className="font-bold text-black relative inline-block">
              all the above
              <HandDrawnUnderline />
              {/* Checkmark positioned absolutely to the right to maintain center alignment of text */}
              <div className="absolute left-[110%] top-1/2 -translate-y-1/2">
                <HandDrawnCheck />
              </div>
            </span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-gray-400 text-xs font-mono animate-pulse">
        Press ESC or Click to return
      </div>
    </div>
  );
};