import React from 'react';

interface BadgeProps {
  variant?: 'emerald' | 'blue' | 'neutral' | 'amber' | 'purple';
  children: React.ReactNode;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'emerald',
  children,
  icon,
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-white/[0.08] text-white border-white/15',
    blue: 'bg-white/[0.08] text-white border-white/15',
    neutral: 'bg-white/[0.06] text-[#A1A1A6] border-white/10',
    amber: 'bg-white/[0.08] text-[#D4D4D8] border-white/15',
    purple: 'bg-white/[0.08] text-white border-white/15',
  };

  const dotStyles = {
    emerald: 'bg-white',
    blue: 'bg-white',
    neutral: 'bg-[#86868B]',
    amber: 'bg-[#A1A1A6]',
    purple: 'bg-white',
  };

  return (
    <span
      className={`inline-flex items-center text-xs md:text-sm font-semibold tracking-tight px-3.5 py-1 rounded-full border ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-2 h-2 rounded-full mr-2 shrink-0 ${dotStyles[variant]}`}
        />
      )}
      {icon && <span className="mr-1.5 inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
