import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  id?: string;
}

export function Section({ children, className = '', gradient = false, id }: SectionProps) {
  const bgClass = gradient ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-white';

  return (
    <section id={id} className={`py-16 md:py-24 ${bgClass} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
