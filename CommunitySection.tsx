import React from 'react';
import { Github, Heart, MessageCircle } from 'lucide-react';
import { HandDrawnArrow } from './HandDrawn';

export const CommunitySection: React.FC = () => {
  return (
    <section className="py-24 bg-white text-black border-t border-black/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
          Join the Movement
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-16">
          Shuper isn't just a tool; it's a statement. We are building the future of local-first AI together. 
          Open source, community-driven, and always private.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <a href="https://github.com/IMX-MAX/Shuper" target="_blank" rel="noopener noreferrer" className="group p-8 rounded-2xl bg-gray-50 border border-black/5 hover:border-black transition-all duration-300 hover:shadow-lg relative">
             {/* Decorative arrow pointing to Github Icon */}
             <div className="absolute top-4 right-8 w-12 text-gray-400 hidden group-hover:block transition-all">
                <HandDrawnArrow className="-rotate-12 scale-75" />
             </div>

             <div className="w-12 h-12 mx-auto bg-black rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <Github className="w-6 h-6 text-white" />
             </div>
             <h3 className="font-bold text-xl mb-2">Contribute Code</h3>
             <p className="text-sm text-gray-500 group-hover:text-gray-800 transition-colors">Help us squash bugs and build new features on GitHub.</p>
          </a>

          <div className="group p-8 rounded-2xl bg-gray-50 border border-black/5 hover:border-black transition-all duration-300 cursor-default hover:shadow-lg">
             <div className="w-12 h-12 mx-auto bg-black rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <Heart className="w-6 h-6 text-white" />
             </div>
             <h3 className="font-bold text-xl mb-2">Support Us</h3>
             <p className="text-sm text-gray-500 group-hover:text-gray-800 transition-colors">Star the repo and share Shuper with your friends.</p>
          </div>

          <div className="group p-8 rounded-2xl bg-gray-50 border border-black/5 hover:border-black transition-all duration-300 cursor-default hover:shadow-lg">
             <div className="w-12 h-12 mx-auto bg-black rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <MessageCircle className="w-6 h-6 text-white" />
             </div>
             <h3 className="font-bold text-xl mb-2">Give Feedback</h3>
             <p className="text-sm text-gray-500 group-hover:text-gray-800 transition-colors">Your ideas shape the roadmap. Let us know what you need.</p>
          </div>
        </div>
      </div>
    </section>
  );
};