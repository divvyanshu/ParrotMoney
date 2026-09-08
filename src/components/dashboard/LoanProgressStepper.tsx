import React from 'react';
import { 
  LoanStageId, 
  LoanStageInfo, 
  LoanApplication,
  StageProgressState,
  LoanQuery
} from '../../types';
import { STAGE_CONFIGS } from '../../services/notificationService';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileCheck2, 
  Home, 
  ShieldCheck, 
  Scale, 
  Award, 
  Banknote,
  ChevronRight,
  UserCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface LoanProgressStepperProps {
  currentStageId: LoanStageId;
  selectedStageId: LoanStageId;
  onSelectStage: (stageId: LoanStageId) => void;
  onAdvanceStage?: (newStageId: LoanStageId) => void;
  openQueries?: LoanQuery[];
  loan?: Partial<LoanApplication>;
  onOpenSimulator?: () => void;
}

const STAGE_ICONS: Record<LoanStageId, React.ElementType> = {
  application_submitted: FileCheck2,
  documents_verified: UserCheck,
  technical_inspection: Home,
  legal_approval: Scale,
  sanctioned: Award,
  disbursed: Banknote
};

export const LoanProgressStepper: React.FC<LoanProgressStepperProps> = ({
  currentStageId,
  selectedStageId,
  onSelectStage,
  onAdvanceStage,
  openQueries = [],
  loan
}) => {
  const stageKeys = Object.keys(STAGE_CONFIGS) as LoanStageId[];
  const currentStageConfig = STAGE_CONFIGS[currentStageId];
  const currentOrder = currentStageConfig.order;

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-5">
      {/* Header with Title & Overall Stage Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
              Live Stage Tracker
            </span>
            <span className="text-xs font-semibold text-stone-500">
              Stage {currentOrder} of {stageKeys.length}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-stone-900 tracking-tight mt-1">
            Application Milestones
          </h3>
        </div>

        {/* Quick Testing Stage Switcher Dropdown */}
        {onAdvanceStage && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-50 p-1.5 rounded-xl border border-stone-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-1">
              Advance:
            </span>
            <select
              value={currentStageId}
              onChange={(e) => onAdvanceStage(e.target.value as LoanStageId)}
              className="bg-white text-stone-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs outline-none cursor-pointer hover:border-emerald-500 transition-all"
            >
              {stageKeys.map((key) => (
                <option key={key} value={key}>
                  {STAGE_CONFIGS[key].order}. {STAGE_CONFIGS[key].name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Vertical Stepper Timeline */}
      <div className="relative space-y-2 pl-1">
        {stageKeys.map((stageKey, idx) => {
          const config = STAGE_CONFIGS[stageKey];
          const isCurrent = stageKey === currentStageId;
          const isSelected = stageKey === selectedStageId;
          const isPassed = config.order < currentOrder;
          const isUpcoming = config.order > currentOrder;
          const stageQueries = openQueries.filter(q => q.stageId === stageKey && q.status === 'open');
          const hasQuery = stageQueries.length > 0;
          const IconComponent = STAGE_ICONS[stageKey];

          let stateColor = 'bg-stone-100 text-stone-400 border-stone-200';
          if (hasQuery) {
            stateColor = 'bg-amber-50 text-amber-600 border-amber-300 ring-2 ring-amber-200';
          } else if (isPassed) {
            stateColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          } else if (isCurrent) {
            stateColor = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
          }

          return (
            <div key={stageKey} className="relative">
              {/* Connector line between steps */}
              {idx < stageKeys.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-5 top-11 w-0.5 h-10 -ml-[1px] transition-colors duration-300",
                    config.order < currentOrder ? "bg-emerald-500" : "bg-stone-200"
                  )} 
                />
              )}

              {/* Clickable Stage Row */}
              <button
                onClick={() => onSelectStage(stageKey)}
                className={cn(
                  "w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex items-start gap-3.5 group cursor-pointer border",
                  isSelected
                    ? "bg-emerald-50/40 border-emerald-500 shadow-2xs"
                    : "bg-white border-transparent hover:bg-stone-50 hover:border-stone-200"
                )}
              >
                {/* Node Icon */}
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border font-bold transition-all relative",
                  stateColor
                )}>
                  {hasQuery ? (
                    <AlertCircle className="w-4 h-4 animate-bounce text-amber-600" />
                  ) : isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Stage {config.order}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                          Active Stage
                        </span>
                      )}
                      {isPassed && (
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                          Completed
                        </span>
                      )}
                      {hasQuery && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded flex items-center gap-1">
                          Action Required
                        </span>
                      )}
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 text-stone-400 transition-transform shrink-0",
                      isSelected ? "rotate-90 text-emerald-600" : "group-hover:translate-x-0.5"
                    )} />
                  </div>

                  <h4 className={cn(
                    "text-xs md:text-sm font-bold tracking-tight mt-0.5",
                    isCurrent ? "text-emerald-950" : isPassed ? "text-stone-800" : "text-stone-500"
                  )}>
                    {config.name}
                  </h4>
                  
                  <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                    {config.shortDesc}
                  </p>

                  {/* Micro timeline or SLA */}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-stone-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      SLA: {config.slaDays} Day{config.slaDays > 1 ? 's' : ''}
                    </span>
                    <span>•</span>
                    <span className="truncate">Desk: {config.officerRole}</span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Progress Bar Summary */}
      <div className="pt-2 border-t border-stone-100">
        <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-1.5">
          <span>Overall Progress</span>
          <span className="text-emerald-700 font-mono font-black">
            {Math.round(((currentOrder - 1) / (stageKeys.length - 1)) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentOrder - 1) / (stageKeys.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-full bg-emerald-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
