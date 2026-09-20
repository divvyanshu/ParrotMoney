import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUpDown, 
  Percent, 
  Sparkles, 
  Clock, 
  Check, 
  ChevronDown,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type OfferSortOption = 'lowest_rate' | 'highest_match' | 'fastest_time' | 'lowest_fee';

export interface SortOptionItem {
  id: OfferSortOption;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const SORT_OPTIONS: SortOptionItem[] = [
  {
    id: 'highest_match',
    label: 'Highest Match Score',
    shortLabel: 'Best Match',
    description: 'Optimized algorithmic eligibility & approval odds',
    icon: Sparkles,
    badge: 'Fit'
  },
  {
    id: 'lowest_rate',
    label: 'Lowest Interest Rate',
    shortLabel: 'Lowest Rate',
    description: 'Cheapest monthly EMI & lifetime interest cost',
    icon: Percent,
    badge: 'ROI'
  },
  {
    id: 'fastest_time',
    label: 'Fastest Processing Time',
    shortLabel: 'Fastest TAT',
    description: 'Quickest sanction & disbursal turnaround time',
    icon: Clock,
    badge: 'Speed'
  },
  {
    id: 'lowest_fee',
    label: 'Lowest Processing Fee',
    shortLabel: 'Low Fees',
    description: 'Zero processing fee campaigns & lowest cap charges',
    icon: Coins,
    badge: 'Fee'
  }
];

interface OffersSortingDropdownProps {
  value: OfferSortOption;
  onChange: (value: OfferSortOption) => void;
  totalOffersCount?: number;
  className?: string;
}

export const OffersSortingDropdown: React.FC<OffersSortingDropdownProps> = ({
  value,
  onChange,
  totalOffersCount,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = SORT_OPTIONS.find(opt => opt.id === value) || SORT_OPTIONS[1];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id="offers-sorting-dropdown-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-natural-border/80 hover:border-emerald-500/50 rounded-2xl text-xs font-bold text-natural-sage shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
          <ArrowUpDown className="w-3.5 h-3.5" />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[9px] uppercase tracking-wider text-natural-muted font-bold leading-none">
            Sort Offers By
          </span>
          <span className="text-xs font-black text-natural-sage mt-0.5 whitespace-nowrap">
            {selectedOption.label}
          </span>
        </div>

        <ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ml-1 ${
            isOpen ? 'rotate-180 text-emerald-600' : 'group-hover:text-slate-600'
          }`} 
        />
      </button>

      {/* Floating Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="listbox"
            id="offers-sorting-menu"
            aria-label="Sort options"
            className="absolute right-0 z-50 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 focus:outline-hidden"
          >
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Sort Preferences
              </span>
              {totalOffersCount !== undefined && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {totalOffersCount} Offers Available
                </span>
              )}
            </div>

            <div className="py-1 space-y-1">
              {SORT_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = opt.id === value;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    id={`sort-option-${opt.id}`}
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-2xs'
                        : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold leading-tight ${isSelected ? 'font-black text-emerald-900' : 'text-slate-800'}`}>
                          {opt.label}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5 line-clamp-2">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
