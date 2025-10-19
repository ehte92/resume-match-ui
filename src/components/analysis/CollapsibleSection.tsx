import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: ReactNode;
}

export const CollapsibleSection = ({
  title,
  children,
  defaultOpen = true,
  className,
  icon,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border-2 border-black rounded shadow-md overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-6 w-6 text-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-6 w-6 text-foreground flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 bg-white animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
};
