import React from 'react';
import { ChevronDown, Paperclip, ArrowUp, Zap, Copy } from 'lucide-react';

export const AppShowcase: React.FC = () => {
  return (
    <section className="bg-white pt-0 pb-24 flex justify-center overflow-hidden">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-xl border border-gray-200 bg-gray-900 shadow-2xl overflow-hidden animate-float" style={{ animationDuration: '8s' }}>
          
          {/* Window Controls */}
          <div className="bg-[#1e1e24] border-b border-white/5 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>

          {/* App Interface Mockup */}
          <div className="flex h-[800px] text-gray-300 font-sans text-sm bg-[#18181b]">
            
            {/* Main Content - Full Width (Sidebar Removed) */}
            <div className="flex-1 bg-[#18181b] flex flex-col relative font-sans">
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-8 pt-4">
                 <div className="flex items-center gap-2 text-gray-200 font-medium text-sm">
                   <span className="truncate max-w-[200px] md:max-w-none">help me plan research on the asian carp</span>
                   <ChevronDown className="w-3 h-3 text-gray-500" />
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400">
                     <div className="w-2 h-2 rounded-full border border-gray-500"></div>
                     <span>todo</span>
                     <ChevronDown className="w-3 h-3 ml-1" />
                   </div>
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400">
                     <span className="w-3 h-3">🏷️</span>
                     <span>no tags</span>
                     <ChevronDown className="w-3 h-3 ml-1" />
                   </div>
                 </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-8 md:px-24 overflow-y-auto space-y-8">
                 {/* User Message */}
                 <div className="flex justify-end">
                   <div className="bg-[#3f3f46] text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-lg text-[15px] leading-relaxed shadow-sm">
                     help me plan research on the asian carp
                   </div>
                 </div>
                 
                 {/* AI Response */}
                 <div className="flex flex-col items-start gap-2 max-w-2xl">
                    <div className="text-gray-200 text-[15px] leading-7 space-y-4">
                        <p>Nathan, what's your research goal? Academic paper, management plan, or something else?</p>
                        
                        <p>Key areas to cover:</p>
                        
                        <ul className="list-none space-y-1">
                            <li><strong className="text-gray-100">Invasion pathways</strong> – How they spread (live bait, aquaculture escapes, flooding).</li>
                            <li><strong className="text-gray-100">Ecological impact</strong> – Competition with native species, habitat disruption, DNA evidence of spread.</li>
                            <li><strong className="text-gray-100">Control methods</strong> – Barriers (electric, acoustic), targeted fishing, biocontrol research, genetic approaches (e.g., daughterless tech).</li>
                            <li><strong className="text-gray-100">Policy/regulation</strong> – Current laws (Lacey Act, CARES Act), interstate compacts, international coordination.</li>
                            <li><strong className="text-gray-100">Socioeconomics</strong> – Fishing industry effects, commercial use attempts (e.g., carp as food), public perception.</li>
                        </ul>

                        <p>Need regional focus? Great Lakes vs. Mississippi Basin? Recent tech? Let me know and I'll narrow it.</p>
                    </div>
                    
                    <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mt-2 font-mono uppercase tracking-wider">
                        <Copy className="w-3 h-3" />
                        COPY
                    </button>
                 </div>
              </div>

              {/* Input Area */}
              <div className="pb-8 px-8 md:px-24">
                <div className="bg-[#202024] border border-white/10 rounded-2xl p-4 shadow-lg relative">
                   <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 bg-[#2f2f35] px-2.5 py-1 rounded-md text-xs text-gray-300 border border-white/5">
                        <Zap className="w-3 h-3 fill-gray-300" />
                        Explore
                        <ChevronDown className="w-3 h-3 text-gray-500 ml-1" />
                      </div>
                   </div>
                   <div className="text-gray-500 text-lg mb-8 font-light">What's on your mind?</div>
                   <div className="flex justify-between items-center">
                      <Paperclip className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer" />
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider font-bold">STEP-3.5-FLASH</span>
                        <ChevronDown className="w-3 h-3 text-gray-500" />
                        <div className="w-8 h-8 rounded-full bg-[#2f2f35] flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors border border-white/5">
                           <ArrowUp className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};