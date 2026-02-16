import React, { useEffect, useState } from 'react';
import { Search, Cpu } from 'lucide-react';
import { Button } from './Button';
import { FloatingCard } from './FloatingCard';
import { HandDrawnStrike, HandDrawnUnderline, HandDrawnCheck } from './HandDrawn';

export const LandingHero: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 4 ? prev + 1 : 4));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white pt-20 pb-20">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6 lg:px-8">
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

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button href="https://shuperapp.nafen.sbs" arrow className="text-lg px-10 py-4 shadow-2xl shadow-black/20 hover:shadow-black/40">
            Try it today
          </Button>
          <p className="text-xs text-gray-400 mt-2 sm:mt-0 font-mono">
            shuperapp.nafen.sbs
          </p>
        </div>
      </div>

      {/* Decorative Elements mimicking the poster collage */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Right - Explore Pill */}
        <FloatingCard className="top-[15%] right-[10%] animate-float rotate-12" delay="1s">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Search className="w-4 h-4" />
            <span>Explore</span>
          </div>
        </FloatingCard>

        {/* Bottom Left - Message Bubble */}
        <FloatingCard className="bottom-[15%] left-[5%] md:left-[15%] animate-float-delayed -rotate-6 w-64">
           <div className="flex flex-col gap-2">
             <div className="bg-gray-100 rounded-lg p-2 rounded-tl-none text-sm text-gray-800">
               Hello, Nathan. What would you like to build today?
             </div>
             <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
               <Cpu className="w-3 h-3" />
               <span>Claude 3.5 Sonnet</span>
             </div>
           </div>
        </FloatingCard>

        {/* Bottom Right - API Key Config */}
        <FloatingCard className="bottom-[20%] right-[5%] md:right-[15%] animate-float rotate-3 w-56 opacity-80">
          <div className="space-y-2">
             <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">API Keys</span>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
             </div>
             <div className="h-2 bg-gray-100 rounded w-3/4"></div>
             <div className="h-2 bg-gray-100 rounded w-1/2"></div>
          </div>
        </FloatingCard>

        {/* Random geometric shapes */}
        <div className="absolute top-1/4 left-10 w-24 h-24 border-2 border-black rounded-full opacity-5"></div>
        <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-black rounded-lg opacity-5 rotate-45"></div>
      </div>
    </div>
  );
};