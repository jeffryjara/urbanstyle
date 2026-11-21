import React from 'react';

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    sm: 'text-xs p-1 gap-1',
    md: 'text-xs md:text-sm p-1 md:p-1.5 gap-1 md:gap-1.5',
  };

  const itemSizeClasses = {
    sm: 'px-3 py-1',
    md: 'px-4 py-1.5',
  };

  return (
    <div
      role="tablist"
      className={`inline-flex items-center rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl ${sizeClasses[size]} ${className}`}
    >
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={`relative flex items-center justify-center font-medium rounded-full transition-all duration-300 ease-out select-none cursor-pointer ${itemSizeClasses[size]} ${
              isActive
                ? 'bg-white/15 text-white shadow-[0_2px_10px_rgba(0,0,0,0.5),0_0.5px_1px_rgba(255,255,255,0.3)_inset] font-semibold'
                : 'text-[#86868B] hover:text-[#F5F5F7] hover:bg-white/[0.04]'
            }`}
          >
            {option.icon && <span className="mr-1.5 inline-flex shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-[#86868B]'
                }`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
