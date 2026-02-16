import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: 'home' | 'docs') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-bold text-xl tracking-tighter">Shuper</span>
          <span className="text-sm text-gray-400">© {new Date().getFullYear()} Nafen.sbs</span>
        </div>

        <div className="flex items-center gap-8">
          <button 
            onClick={() => {
              onNavigate('docs');
              window.scrollTo(0, 0);
            }} 
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            Documentation
          </button>
          <a 
            href="https://github.com/IMX-MAX/Shuper" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            GitHub
          </a>
          <a href="https://shuperapp.nafen.sbs" className="text-sm font-bold flex items-center gap-1 hover:underline">
            Launch App <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};