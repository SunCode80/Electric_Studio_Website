import React from 'react';

interface StudioCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function StudioCard({ children, className = '', hover = false }: StudioCardProps) {
  const hoverStyles = hover ? 'hover:transform hover:-translate-y-2 hover:shadow-studio transition-all duration-300' : '';

  return (
    <div className={`bg-white rounded-2xl shadow-2xl p-8 ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
