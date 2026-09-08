import React from 'react';
import { 
  LoanStageId, 
  LoanApplication,
  LoanQuery 
} from '../../types';
import { STAGE_CONFIGS } from '../../services/notificationService';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck,
  ChevronRight,
  FileCheck2,
  Calendar,
  Building2,
  UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface LoanJourneyCardProps {
  currentStageId: LoanStageId;
  loan: Partial<LoanApplication>;
  openQueries?: LoanQuery[];
  onSelectStage?: (stageId: LoanStageId) => void;
}

export const LoanJourneyCard: React.FC<LoanJourneyCardProps> = ({
  currentStageId,
  loan,
  openQueries = [],
  onSelectStage
}) => {
  const currentConfig = STAGE_CONFIGS[currentStageId] || STAGE_CONFIGS['technical_inspection'];
  const stageKeys = Object.keys(STAGE_CONFIGS) as LoanStageId[];
  const currentIndex = stageKeys.indexOf(currentStageId);
  
  // Previous (Origin) Phase
  const prevStageKey = currentIndex > 0 ? stageKeys[0] : null;
  const prevConfig = prevStageKey ? STAGE_CONFIGS[prevStageKey] : null;

  // Next (Future) Phase
  const nextStageKey = currentIndex < stageKeys.length - 1 ? stageKeys[currentIndex + 1] : null;
  const nextConfig = nextStageKey ? STAGE_CONFIGS[nextStageKey] : null;

  const activeQueries = openQueries.filter(q => q.status === 'open');
  const hasActionRequired = activeQueries.length > 0;

  // Formatted date string for submission
  const startedDate = loan.createdAt?.toDate ? loan.createdAt.toDate().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Aug 26, 2026';

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 md:p-7 space-y-6">
      {/* Top Header Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-widest text-stone-600">
            3-Phase Journey Roadmap
          </h3>
        </div>
        <div className="text-xs text-stone-500 flex items-center gap-2">
          <span>Overall Progress:</span>
          <span className="font-bold text-emerald-700">Stage {currentConfig.order} of {stageKeys.length}</span>
          <span className="text-stone-300">•</span>
          <span className="text-stone-600 font-semibold">{Math.round((currentConfig.order / stageKeys.length) * 100)}% Complete</span>
        </div>
      </div>

      {/* 3-Step Storyline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative">
        
        {/* 1. WHERE IT STARTED */}
        <div className="bg-stone-50/70 rounded-2xl p-4 md:p-5 border border-stone-200/80 flex flex-col justify-between space-y-3 relative group">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Step 1: Origin
              </span>
              <span className="text-[11px] text-stone-500 font-medium">{startedDate}</span>
            </div>

            <h4 className="font-bold text-stone-800 text-sm md:text-base">
              Application & Documents Submitted
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your profile, income papers, and KYC documents were securely verified by our digital desk.
            </p>
          </div>

          <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
            <span className="text-stone-500">Lender: <strong className="text-stone-700">{loan.selectedBank?.name || 'HDFC Bank'}</strong></span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Complete
            </span>
          </div>
        </div>

        {/* 2. WHERE YOU ARE RIGHT NOW (ACTIVE) */}
        <div className={cn(
          "rounded-2xl p-4 md:p-5 border-2 flex flex-col justify-between space-y-3 relative shadow-xs",
          hasActionRequired 
            ? "bg-amber-50/60 border-amber-300" 
            : "bg-emerald-50/40 border-emerald-500 ring-4 ring-emerald-500/10"
        )}>
          {/* Active Phase Badge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1.5",
                hasActionRequired ? "bg-amber-200 text-amber-900" : "bg-emerald-600 text-white"
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Step 2: Active Phase
              </span>
              <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" /> SLA: {currentConfig.slaDays} Days
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-stone-900 text-base md:text-lg tracking-tight">
                {currentConfig.name}
              </h4>
              <p className="text-xs text-stone-700 leading-relaxed">
                {currentConfig.shortDesc}
              </p>
            </div>
          </div>

          {/* Current Status Note */}
          <div className={cn(
            "p-3 rounded-xl text-xs flex items-start gap-2.5 border",
            hasActionRequired 
              ? "bg-amber-100/90 text-amber-950 border-amber-300" 
              : "bg-white text-emerald-900 border-emerald-200"
          )}>
            {hasActionRequired ? (
              <>
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">1 Document Clarification Needed</strong>
                  <span className="text-[11px] text-amber-800">
                    Valuer requested municipal layout. Check active tasks below.
                  </span>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Everything on Schedule</strong>
                  <span className="text-[11px] text-emerald-800">
                    Desk review progressing smoothly. No action required from you.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. WHAT HAPPENS NEXT (DESTINATION) */}
        <div className="bg-stone-50/70 rounded-2xl p-4 md:p-5 border border-stone-200/80 flex flex-col justify-between space-y-3 relative opacity-90 hover:opacity-100 transition-opacity">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 bg-stone-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Step 3: What's Next
              </span>
              <span className="text-[11px] text-stone-500">Upcoming</span>
            </div>

            <h4 className="font-bold text-stone-800 text-sm md:text-base">
              {nextConfig ? nextConfig.name : 'Sanction Letter & Disbursal'}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {nextConfig 
                ? nextConfig.shortDesc 
                : 'Final credit approval, formal sanction letter generation, and disbursement into your account.'}
            </p>
          </div>

          <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
            <span className="text-stone-500">Next Turnaround: <strong className="text-stone-700">~{nextConfig?.slaDays || 2} Days</strong></span>
            {onSelectStage && nextStageKey && (
              <button
                onClick={() => onSelectStage(nextStageKey)}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Preview <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
