import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  variant = 'primary',
  href,
  onClick,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-block';

  const variantStyles = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/50',
    secondary: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white hover:transform hover:-translate-y-0.5',
    ghost: 'text-purple-600 hover:text-purple-700 hover:underline',
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
