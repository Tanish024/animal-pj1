import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  onRemove?: () => void;
}

export function Chip({ selected = false, onRemove, className, children, ...props }: ChipProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ease-out theme-transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? 'bg-primary text-white'
          : 'bg-surface border border-border text-foreground hover:bg-background',
        className,
      )}
      tabIndex={0}
      role="button"
      {...props}
    >
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
          aria-label="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
