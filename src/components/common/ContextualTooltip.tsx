import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ContextualTooltipProps {
  title?: string;
  message: string;
  term?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'subtle' | 'pill' | 'badge';
  className?: string;
}

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  title,
  message,
  term,
  side = 'top',
  variant = 'subtle',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside on mobile or desktop
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as any);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, [isOpen]);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-stone-900 border-x-transparent border-b-transparent border-t-[6px] border-x-[5px]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-stone-900 border-x-transparent border-t-transparent border-b-[6px] border-x-[5px]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-stone-900 border-y-transparent border-r-transparent border-l-[6px] border-y-[5px]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-stone-900 border-y-transparent border-l-transparent border-r-[6px] border-y-[5px]'
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center align-middle select-none", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label={title || "Contextual help information"}
        aria-expanded={isOpen}
        className={cn(
          "inline-flex items-center justify-center transition-all cursor-help focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-full",
          variant === 'subtle' && "w-4 h-4 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95",
          variant === 'pill' && "px-1.5 py-0.5 text-[10px] font-bold text-stone-600 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-md border border-stone-200 gap-1",
          variant === 'badge' && "w-4 h-4 bg-stone-200/80 hover:bg-emerald-600 hover:text-white text-stone-600 text-[10px] font-black"
        )}
      >
        {term ? (
          <>
            <span>{term}</span>
            <HelpCircle className="w-3 h-3 text-stone-400 shrink-0" />
          </>
        ) : (
          <HelpCircle className="w-3.5 h-3.5" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: side === 'top' ? 4 : side === 'bottom' ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: side === 'top' ? 2 : -2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="tooltip"
            className={cn(
              "absolute z-50 w-64 max-w-[calc(100vw-32px)] p-3.5 bg-stone-900 text-stone-100 rounded-2xl shadow-xl text-left border border-stone-800 pointer-events-auto",
              sideClasses[side]
            )}
          >
            {title && (
              <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-stone-800 text-emerald-400 text-xs font-bold tracking-tight">
                <Info className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>{title}</span>
              </div>
            )}
            <p className="text-[11px] leading-relaxed text-stone-200 font-normal">
              {message}
            </p>
            {/* Arrow pointer */}
            <div className={cn("absolute w-0 h-0 border-solid", arrowClasses[side])} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
