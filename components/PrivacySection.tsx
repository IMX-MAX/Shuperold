import React from 'react';
import { ShieldCheck, ServerOff, Key, ArrowRight } from 'lucide-react';
import { HandDrawnHighlight, HandDrawnArrow } from './HandDrawn';

export const PrivacySection: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 text-black relative overflow-hidden border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-3 py-1 border border-black text-xs font-mono mb-8 text-black uppercase tracking-widest bg-white">
              Architecture
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              <span className="relative inline-block">
                No Cloud Middleman.
                <HandDrawnHighlight className="bg-yellow-200/40" />
              </span>
              <br/>
              <span className="text-gray-400">Just You and the Model.</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed font-light">
              Most AI apps store your conversations on their servers. Shuper is different. 
              The application logic runs locally in your browser. When you send a message, 
              it goes directly from your device to the model provider (OpenRouter or Google) 
              using your own API key.
            </p>
            
            <div className="space-y-8 relative">
              <div className="absolute left-[-40px] top-[20px] w-8 h-8 text-gray-300 hidden md:block">
                 <HandDrawnArrow className="rotate-[-30deg]" />
              </div>

              <div className="group">
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-8 h-8 flex items-center justify-center border border-black rounded-full bg-white group-hover:bg-black group-hover:text-white transition-colors">
                     <ServerOff className="w-4 h-4" />
                   </div>
                   <h4 className="font-bold text-lg font-mono">Zero Logs</h4>
                </div>
                <p className="text-sm text-gray-500 pl-12">We don't have a backend database. Your chats are stored in your browser's IndexedDB.</p>
              </div>

              <div className="group">
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-8 h-8 flex items-center justify-center border border-black rounded-full bg-white group-hover:bg-black group-hover:text-white transition-colors">
                     <Key className="w-4 h-4" />
                   </div>
                   <h4 className="font-bold text-lg font-mono">Your Keys</h4>
                </div>
                <p className="text-sm text-gray-500 pl-12">You control the costs and rate limits. No subscription markup.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="font-mono text-xs text-black mb-6 flex items-center gap-2 uppercase tracking-wider border-b border-gray-100 pb-2">
                 <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                 Connection_Secure
              </div>
              
              <div className="space-y-6">
                {/* Diagram simulation */}
                <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-200">
                   <div className="text-center">
                     <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                       <span className="text-white font-bold text-sm">You</span>
                     </div>
                     <span className="text-xs text-gray-500 font-mono uppercase">Browser</span>
                   </div>
                   
                   <div className="flex-1 px-4 flex flex-col items-center">
                      <div className="w-full h-px bg-black/20 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-black px-3 py-1 text-[10px] font-mono text-black whitespace-nowrap">
                          ENCRYPTED
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 mt-2 animate-pulse" />
                   </div>

                   <div className="text-center">
                     <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto mb-3">
                       <ShieldCheck className="w-6 h-6 text-black" />
                     </div>
                     <span className="text-xs text-gray-500 font-mono uppercase">Provider</span>
                   </div>
                </div>

                <div className="p-4 border border-dashed border-gray-300 bg-gray-50 opacity-50 grayscale flex items-center justify-between">
                   <div className="flex items-center gap-3 text-gray-400">
                     <ServerOff className="w-5 h-5" />
                     <span className="text-sm line-through font-mono">Shuper Server</span>
                   </div>
                   <span className="text-xs text-red-500 font-mono">[BYPASSED]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};