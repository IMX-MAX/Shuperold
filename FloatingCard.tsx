import React from 'react';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({ children, className = '', delay = '0s' }) => {
  return (
    <div 
      className={`absolute bg-white border border-gray-200 shadow-xl rounded-xl p-4 transform transition-transform hover:scale-105 cursor-default select-none backdrop-blur-sm bg-opacity-90 ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
};