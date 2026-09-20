import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Activity, 
  ChevronDown, 
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type LoanApplicationStatus = 'submitted' | 'pending_review' | 'in_progress' | 'approved' | 'rejected';

interface StatusConfig {
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  pillClass: string;
  glowClass: string;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
  accentColor: string;
}

const STATUS_CONFIGS: Record<LoanApplicationStatus, StatusConfig> = {
  submitted: {
    label: 'Application Submitted',
    shortLabel: 'Submitted',
    description: 'Initial intake complete. Documents queued for automated verification.',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-400/30',
    pillClass: 'bg-sky-100/80 text-sky-900 border-sky-200',
    glowClass: 'shadow-[0_0_12px_rgba(14,165,233,0.25)]',
    icon: Clock,
    dotColor: 'bg-sky-500',
    accentColor: '#0284c7'
  },
  pending_review: {
    label: 'Under Review',
    shortLabel: 'Pending Review',
    description: 'Credit analyst is cross-checking KYC papers and bank statements.',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/30',
    pillClass: 'bg-amber-100/80 text-amber-900 border-amber-200',
    glowClass: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    icon: AlertCircle,
    dotColor: 'bg-amber-500',
    accentColor: '#d97706'
  },
  in_progress: {
    label: 'Underwriting In-Progress',
    shortLabel: 'In Progress',
    description: 'Lender valuation, legal verification & FOIR underwriting in progress.',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300 ring-1 ring-indigo-400/30',
    pillClass: 'bg-indigo-100/80 text-indigo-900 border-indigo-200',
    glowClass: 'shadow-[0_0_12px_rgba(99,102,241,0.25)]',
    icon: Activity,
    dotColor: 'bg-indigo-500',
    accentColor: '#4f46e5'
  },
  approved: {
    label: 'Sanction Approved',
    shortLabel: 'Approved',
    description: 'Congratulations! Official sanction letter issued by lender.',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-500/30',
    pillClass: 'bg-emerald-100/80 text-emerald-900 border-emerald-200',
    glowClass: 'shadow-[0_0_14px_rgba(16,185,129,0.35)]',
    icon: CheckCircle2,
    dotColor: 'bg-emerald-500',
    accentColor: '#059669'
  },
  rejected: {
    label: 'Application Declined',
    shortLabel: 'Rejected',
    description: 'Does not meet lender threshold. Advisory team available for credit repair.',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-500/30',
    pillClass: 'bg-rose-100/80 text-rose-900 border-rose-200',
    glowClass: 'shadow-[0_0_14px_rgba(244,63,94,0.35)]',
    icon: XCircle,
    dotColor: 'bg-rose-500',
    accentColor: '#e11d48'
  }
};

interface AnimatedStatusBadgeProps {
  status: string;
  onChangeStatus?: (newStatus: string) => void;
  className?: string;
  allowQuickToggle?: boolean;
}

export const AnimatedStatusBadge: React.FC<AnimatedStatusBadgeProps> = ({
  status,
  onChangeStatus,
  className,
  allowQuickToggle = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize status string safely
  const normalizedStatus = (
    STATUS_CONFIGS[status as LoanApplicationStatus] ? status : 'submitted'
  ) as LoanApplicationStatus;

  const currentConfig = STATUS_CONFIGS[normalizedStatus];
  const Icon = currentConfig.icon;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <div className="flex items-center gap-1.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={normalizedStatus}
            initial={{ opacity: 0, scale: 0.90, y: -2 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                type: "spring",
                stiffness: 420,
                damping: 24,
                mass: 0.8
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.92, 
              y: 2,
              transition: { duration: 0.15 }
            }}
            className={cn(
              "group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs",
              currentConfig.badgeClass,
              currentConfig.glowClass,
              onChangeStatus ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : "cursor-default"
            )}
            onClick={() => onChangeStatus && setIsOpen(prev => !prev)}
            role="status"
            aria-label={`Current status: ${currentConfig.label}`}
          >
            {/* Subtle animated status icon */}
            <motion.div
              key={`icon-${normalizedStatus}`}
              initial={{ scale: 0.6, rotate: normalizedStatus === 'approved' ? -20 : normalizedStatus === 'rejected' ? 20 : 0 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="shrink-0 flex items-center justify-center"
            >
              <Icon className="w-3.5 h-3.5" />
            </motion.div>

            {/* Status text label with subtle tracking */}
            <span className="tracking-wide">
              Status: <span className="font-extrabold">{currentConfig.shortLabel}</span>
            </span>

            {/* Animated status dot */}
            <span className="relative flex h-2 w-2">
              {normalizedStatus === 'approved' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              {normalizedStatus === 'rejected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              )}
              {normalizedStatus === 'submitted' && (
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              )}
              <span className={cn("relative inline-flex rounded-full h-2 w-2", currentConfig.dotColor)} />
            </span>

            {/* Dropdown chevron if editable */}
            {onChangeStatus && (
              <ChevronDown className={cn(
                "w-3 h-3 transition-transform duration-200 text-stone-500 ml-0.5",
                isOpen && "rotate-180 text-stone-800"
              )} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Quick status cycle buttons for instant testing (Submitted -> Approved -> Rejected) */}
        {allowQuickToggle && onChangeStatus && (
          <div className="hidden sm:flex items-center gap-1 bg-stone-50 border border-stone-200/80 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => onChangeStatus('submitted')}
              title="Set status to Submitted"
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold transition-all",
                normalizedStatus === 'submitted'
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-stone-500 hover:text-sky-700 hover:bg-sky-50"
              )}
            >
              Submitted
            </button>
            <button
              type="button"
              onClick={() => onChangeStatus('approved')}
              title="Set status to Approved (triggers success animation)"
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-0.5",
                normalizedStatus === 'approved'
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-stone-500 hover:text-emerald-700 hover:bg-emerald-50"
              )}
            >
              <CheckCircle2 className="w-2.5 h-2.5" /> Approved
            </button>
            <button
              type="button"
              onClick={() => onChangeStatus('rejected')}
              title="Set status to Rejected (triggers declined animation)"
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-0.5",
                normalizedStatus === 'rejected'
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-stone-500 hover:text-rose-700 hover:bg-rose-50"
              )}
            >
              <XCircle className="w-2.5 h-2.5" /> Rejected
            </button>
          </div>
        )}
      </div>

      {/* Interactive Dropdown Menu */}
      <AnimatePresence>
        {isOpen && onChangeStatus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl p-2 z-50 overflow-hidden"
          >
            <div className="px-2.5 py-1.5 border-b border-stone-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                Change Application Status
              </span>
              <span className="text-[9px] text-stone-400 italic">Live Simulation</span>
            </div>

            <div className="space-y-1 pt-1.5">
              {(Object.keys(STATUS_CONFIGS) as LoanApplicationStatus[]).map((key) => {
                const cfg = STATUS_CONFIGS[key];
                const ItemIcon = cfg.icon;
                const isSelected = normalizedStatus === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onChangeStatus(key);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer group/item",
                      isSelected
                        ? "bg-stone-100 text-stone-900 font-bold"
                        : "hover:bg-stone-50 text-stone-600 font-medium"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110",
                      cfg.pillClass
                    )}>
                      <ItemIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800">
                          {cfg.label}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 leading-snug line-clamp-1 mt-0.5">
                        {cfg.description}
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
