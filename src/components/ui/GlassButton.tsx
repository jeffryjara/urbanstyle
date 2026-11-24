import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glass' | 'ghost' | 'emerald' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'glass',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  className = '',
  loading = false,
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-xl font-semibold gap-2',
    md: 'px-5 py-2.5 text-base rounded-2xl font-semibold gap-2.5',
    lg: 'px-7 py-4 text-lg rounded-2xl font-bold gap-3',
  };

  const variantClasses = {
    primary: 'apple-btn-primary tracking-tight',
    glass: 'glass-button',
    ghost: 'text-[#86868B] hover:text-[#F5F5F7] hover:bg-white/5 active:scale-[0.97] transition-all duration-300 ease-spring',
    emerald: 'bg-[#30D158] hover:bg-[#28b84c] text-black font-bold shadow-apple-glow-emerald active:scale-[0.97] transition-all duration-300 ease-spring',
    danger: 'bg-red-500/15 hover:bg-red-500/25 text-[#FF453A] border border-red-500/20 active:scale-[0.97] transition-all duration-300 ease-spring',
  };

  return (
    <button
      className={`inline-flex items-center justify-center select-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
