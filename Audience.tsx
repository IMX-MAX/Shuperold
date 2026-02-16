import React from 'react';

const audiences = [
  {
    label: "Students",
    desc: "Get help with research and writing without fear of school surveillance or data collection."
  },
  {
    label: "Developers",
    desc: "Test prompt performance across GPT-4, Claude 3, and Gemini Pro instantly in one tab."
  },
  {
    label: "Privacy Advocates",
    desc: "Finally, an AI interface that respects data sovereignty. Your prompts stay yours."
  },
  {
    label: "Teams",
    desc: "Orchestrate complex workflows without getting locked into a single ecosystem vendor."
  }
];

export const Audience: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-black/5">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-3xl font-bold tracking-tight">Built for those who care.</h2>
            <p className="text-gray-500 max-w-md text-right">Join thousands of users reclaiming their AI workflow.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-black/10">
            {audiences.map((item, idx) => (
               <div key={idx} className="p-8 border-r border-b border-black/10 hover:bg-gray-50 transition-colors">
                  <span className="block text-xs font-mono text-gray-400 mb-4">0{idx + 1}</span>
                  <h3 className="font-bold text-lg mb-3 font-mono">{item.label}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
               </div>
            ))}
          </div>
       </div>
    </section>
  );
};