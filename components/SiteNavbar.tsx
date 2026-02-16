import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface NavbarProps {
  onNavigate: (page: 'home' | 'docs') => void;
  currentPage: 'home' | 'docs';
}

export const SiteNavbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-8">
           <span 
             onClick={() => onNavigate('home')} 
             className="font-bold text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
           >
             Shuper
           </span>

           <div className="hidden md:flex items-center gap-6">
             <button 
               onClick={() => onNavigate('docs')}
               className={`text-sm font-medium transition-colors ${currentPage === 'docs' ? 'text-black' : 'text-gray-500 hover:text-black'}`}
             >
               Documentation
             </button>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button href="https://shuperapp.nafen.sbs" variant={scrolled ? 'primary' : 'outline'} className="px-6 py-2 text-sm">
            Launch
          </Button>
        </div>
      </div>
    </nav>
  );
};