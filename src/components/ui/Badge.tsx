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
    emerald: 'bg-[#30D158]/12 text-[#30D158] border-[#30D158]/25',
    blue: 'bg-[#007AFF]/12 text-[#58A6FF] border-[#007AFF]/25',
    neutral: 'bg-white/[0.06] text-[#A1A1A6] border-white/10',
    amber: 'bg-[#FF9F0A]/12 text-[#FF9F0A] border-[#FF9F0A]/25',
    purple: 'bg-[#BF5AF2]/12 text-[#BF5AF2] border-[#BF5AF2]/25',
  };

  const dotStyles = {
    emerald: 'bg-[#30D158] shadow-[0_0_8px_#30D158]',
    blue: 'bg-[#007AFF] shadow-[0_0_8px_#007AFF]',
    neutral: 'bg-[#86868B]',
    amber: 'bg-[#FF9F0A] shadow-[0_0_8px_#FF9F0A]',
    purple: 'bg-[#BF5AF2] shadow-[0_0_8px_#BF5AF2]',
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
