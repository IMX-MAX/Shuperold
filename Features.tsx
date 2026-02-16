import React from 'react';
import { Compass, Zap, Users, Lock, Database, Layout } from 'lucide-react';
import { HandDrawnArrow, HandDrawnCircle, HandDrawnUnderline } from './HandDrawn';

const modes = [
  {
    icon: <Compass className="w-6 h-6" />,
    title: "Explore",
    desc: "Single-model conversational AI. Instant model switching.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Execute",
    desc: "Task-oriented AI workflows designed for speed.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Council",
    desc: "Orchestrate multi-agent deliberations and critiques.",
  }
];

const capabilities = [
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Local & Private",
    desc: "Zero server logs. Your chat history lives in your browser's local storage."
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "BYO Keys",
    desc: "Connect directly to OpenRouter & Google Gemini. Pay only for what you use."
  },
  {
    icon: <Layout className="w-5 h-5" />,
    title: "Organized",
    desc: "Label, Archive, Flag, and search your sessions with a pro-grade interface."
  }
];

export const Features: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-black/5 relative overflow-hidden">
       {/* Background Grid Pattern */}
       <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl relative">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-6 relative z-10">
              One Interface. <br/>
              <span className="relative inline-block">
                Infinite Intelligence.
                <HandDrawnUnderline className="text-black/30" />
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Shuper unifies the world's best AI models into a privacy-focused workspace that runs entirely on your device.
            </p>
            
            {/* Decorative arrow pointing to modes */}
            <div className="hidden md:block absolute -right-32 top-24 w-24 text-gray-300">
               <HandDrawnArrow className="rotate-45" />
            </div>
          </div>
          <div className="hidden md:block w-32 h-[1px] bg-black mb-8"></div>
        </div>

        {/* Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-black/10">
          {modes.map((mode, idx) => (
            <div key={idx} className="bg-white p-10 border-r border-b border-black/10 hover:bg-gray-50 transition-colors duration-300 group relative">
              <div className="mb-6 text-black group-hover:scale-110 transition-transform duration-300 relative inline-block">
                {mode.icon}
                {/* Add a circle around the icon for the Council mode to highlight it */}
                {idx === 2 && <HandDrawnCircle className="text-blue-500/20 scale-150" />}
              </div>
              <h3 className="text-xl font-bold text-black mb-3 font-mono uppercase tracking-wider">{mode.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{mode.desc}</p>
            </div>
          ))}
        </div>

        {/* Feature List */}
        <div className="mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="flex flex-col items-start pl-4 border-l-2 border-black/5 hover:border-black transition-colors duration-300 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-black relative z-10">
                    {cap.icon}
                  </div>
                  <h4 className="font-bold text-lg relative z-10">{cap.title}</h4>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};