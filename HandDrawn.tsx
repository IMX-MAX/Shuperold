import React from 'react';

export const HandDrawnStrike = ({ visible }: { visible: boolean }) => (
  <svg 
    className={`absolute top-1/2 left-[-5%] w-[110%] h-[12px] -translate-y-1/2 pointer-events-none overflow-visible transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    viewBox="0 0 100 10" 
    preserveAspectRatio="none"
  >
    <path 
      d="M0 6 Q 50 0, 100 4" 
      stroke="currentColor" 
      strokeWidth="3" 
      fill="none"
      className="text-gray-500 opacity-80"
      strokeLinecap="round"
    />
  </svg>
);

export const HandDrawnUnderline = ({ className = "text-black" }: { className?: string }) => (
  <svg 
    className={`absolute bottom-[-8px] left-[-5%] w-[110%] h-[15px] pointer-events-none overflow-visible ${className}`}
    viewBox="0 0 100 15" 
    preserveAspectRatio="none"
  >
    <path 
      d="M0 5 Q 50 15, 100 2" 
      stroke="currentColor" 
      strokeWidth="4" 
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export const HandDrawnCheck = ({ className = "text-black" }: { className?: string }) => (
  <svg 
    width="60" 
    height="60" 
    viewBox="0 0 60 60" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 30 L 25 45 L 50 10" />
  </svg>
);

export const HandDrawnArrow = ({ className = "" }: { className?: string }) => (
  <svg 
    className={`pointer-events-none ${className}`} 
    viewBox="0 0 100 60" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M10 30 Q 50 10, 90 30" />
    <path d="M80 20 L 90 30 L 80 40" />
  </svg>
);

export const HandDrawnCircle = ({ className = "" }: { className?: string }) => (
  <svg 
    className={`pointer-events-none absolute inset-0 w-full h-full -z-10 ${className}`} 
    viewBox="0 0 200 100" 
    preserveAspectRatio="none"
  >
    <path 
      d="M20,50 Q50,5 180,50 Q150,95 20,50" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeDasharray="400"
      strokeDashoffset="0"
      className="opacity-80"
    />
  </svg>
);

export const HandDrawnHighlight = ({ className = "bg-yellow-200/50" }: { className?: string }) => (
    <div className={`absolute inset-0 -skew-y-2 rounded-sm -z-10 ${className}`}></div>
);