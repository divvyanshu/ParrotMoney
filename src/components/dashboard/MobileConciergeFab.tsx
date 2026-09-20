import React, { useState } from 'react';
import { MessageSquare, Sparkles, X, ChevronRight, HelpCircle, FileText, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoanStageId } from '../../types';
import { STAGE_CONFIGS } from '../../services/notificationService';

interface MobileConciergeFabProps {
  currentStageId: LoanStageId;
  loan: {
    id?: string;
    selectedBank?: { name?: string };
    loanAmount?: number;
  };
}

export function MobileConciergeFab({ currentStageId, loan }: MobileConciergeFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const stage = STAGE_CONFIGS[currentStageId] || STAGE_CONFIGS.technical_inspection;
  const bankName = loan.selectedBank?.name || 'HDFC Bank';
  const loanNumber = loan.id?.slice(-8).toUpperCase() || 'CURRENT';

  const triggerConciergeChat = (customPrompt?: string) => {
    setIsOpen(false);
    const query = customPrompt || 
      `I need assistance regarding my loan stage: "${stage.name}" (Application #${loanNumber} with ${bankName}). What are the immediate next steps, required documents, and timeline?`;
    
    window.dispatchEvent(new CustomEvent('open-parrot-chat', {
      detail: { query }
    }));
  };

  return (
    <div className="md:hidden fixed bottom-24 right-4 z-40 flex flex-col items-end">
      {/* Quick contextual popup when user taps or holds */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to dismiss */}
            <div 
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-xs z-30 animate-in fade-in"
            />

            {/* Quick Menu Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative z-40 mb-3 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900">Parrot Concierge</h4>
                    <p className="text-[10px] text-stone-500 font-bold truncate max-w-[150px]">
                      {stage.name}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => triggerConciergeChat(`What documents are required for the "${stage.name}" stage of my loan with ${bankName}?`)}
                  className="w-full text-left p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 text-xs font-bold transition-colors flex items-center justify-between group border border-stone-200/60"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Documents Needed?</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => triggerConciergeChat(`What is the expected timeline and SLA for completing the "${stage.name}" stage with ${bankName}?`)}
                  className="w-full text-left p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 text-xs font-bold transition-colors flex items-center justify-between group border border-stone-200/60"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Stage SLA & Timeline</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => triggerConciergeChat()}
                  className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all"
                >
                  Chat with Concierge Now
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* The Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            // Direct single tap opens concierge directly, or secondary tap
            triggerConciergeChat();
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-3 rounded-full shadow-lg shadow-emerald-700/30 border border-white/20 transition-all cursor-pointer relative"
        title="Ask Concierge for current stage"
      >
        {/* Pulse beacon for attention */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-white" />
        </span>

        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>

        <span className="text-xs font-black tracking-wide pr-1">
          Ask Concierge
        </span>
      </motion.button>
    </div>
  );
}
