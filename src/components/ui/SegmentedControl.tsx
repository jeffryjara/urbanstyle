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
    sm: 'text-sm p-1 gap-1',
    md: 'text-sm md:text-base p-1.5 gap-1.5',
  };

  const itemSizeClasses = {
    sm: 'px-4 py-1.5',
    md: 'px-5 py-2',
  };

  return (
    <div
      role="tablist"
      className={`inline-flex items-center rounded-full bg-[#141414] border border-white/[0.08] overflow-hidden select-none isolate ${sizeClasses[size]} ${className}`}
    >
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={`relative flex items-center justify-center rounded-full transition-all duration-300 ease-spring cursor-pointer ${itemSizeClasses[size]} ${
              isActive
                ? 'bg-white text-black font-bold shadow-[0_4px_14px_rgba(0,0,0,0.45)]'
                : 'text-[#86868B] font-medium hover:text-[#F5F5F7]'
            }`}
          >
            {option.icon && <span className="mr-1.5 inline-flex shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-white/25 text-white'
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
