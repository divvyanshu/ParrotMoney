import React from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee,
  Clock,
  Building2,
  Calendar,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EnrichedLenderOffer } from '../../services/lenderRecommendationService';
import { BankLogo } from '../BankLogo';

interface LenderPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lender: EnrichedLenderOffer | null;
  onApply: (lender: EnrichedLenderOffer) => void;
}

export const LenderPolicyModal: React.FC<LenderPolicyModalProps> = ({
  isOpen,
  onClose,
  lender,
  onApply
}) => {
  if (!isOpen || !lender) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 md:p-6 border-b border-stone-100 bg-stone-50/70">
            <div className="flex items-center gap-3.5">
              <BankLogo bank={lender.name} size="lg" className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl shadow-xs" />
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-stone-200/80 text-stone-700">
                    {lender.category}
                  </span>
                  {lender.hasOverdraft && (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-blue-600" /> Overdraft Facility
                    </span>
                  )}
                  {lender.hasFemaleConcession && (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      Women Concession
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
                  {lender.name}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Official Institutional Credit Policy & Underwriting Norms
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-all cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 md:p-6 space-y-6 overflow-y-auto flex-1 text-sm text-stone-700">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/60 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">Dynamic Rate</span>
                <span className="text-xl font-black text-emerald-700">{lender.rate}</span>
                <span className="text-[9px] text-stone-400 block mt-0.5">{lender.rawRateRange}</span>
              </div>
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/60 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">Estimated EMI</span>
                <span className="text-xl font-black text-stone-900">₹{lender.estEMI.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-stone-400 block mt-0.5">per month</span>
              </div>
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/60 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">Match Fit</span>
                <span className="text-xl font-black text-emerald-600">{lender.finalScore}%</span>
                <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">{lender.probability} Odds</span>
              </div>
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/60 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">Typical TAT</span>
                <span className="text-xl font-black text-stone-900">{lender.processingTime}</span>
                <span className="text-[9px] text-stone-400 block mt-0.5">from submission</span>
              </div>
            </div>

            {/* Promotional Scheme Highlight */}
            {lender.currentScheme && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Current Promotional Scheme & Concessions</span>
                </div>
                <p className="text-xs md:text-sm text-amber-900/90 leading-relaxed font-medium">
                  {lender.currentScheme}
                </p>
              </div>
            )}

            {/* Underwriting Guidelines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Credit & CIBIL */}
              <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/70 space-y-2">
                <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>CIBIL & Score Cut-offs</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  {lender.cibilGuidelines}
                </p>
              </div>

              {/* Processing Fee */}
              <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/70 space-y-2">
                <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
                  <IndianRupee className="w-4 h-4 text-stone-700" />
                  <span>Processing Fee & Caps</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  <strong className="text-stone-800">Fee:</strong> {lender.processingFee}<br />
                  <strong className="text-stone-800">Caps:</strong> {lender.processingFeeCaps}
                </p>
              </div>

              {/* Age Limits & Maturity */}
              <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/70 space-y-2">
                <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Age Limits & Max Maturity</span>
                </div>
                <div className="text-xs text-stone-600 space-y-1">
                  <p><strong className="text-stone-800">Salaried:</strong> Min {lender.minAgeSalaried} yrs; Max at maturity: {lender.maxAgeMaturitySalaried} yrs</p>
                  <p><strong className="text-stone-800">Self-Employed:</strong> Min {lender.minAgeSelfEmployed} yrs; Max at maturity: {lender.maxAgeMaturitySelfEmployed} yrs</p>
                </div>
              </div>

              {/* Loan Amount Ticket Size */}
              <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/70 space-y-2">
                <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Loan Ticket Boundaries</span>
                </div>
                <div className="text-xs text-stone-600 space-y-1">
                  <p><strong className="text-stone-800">Min Amount:</strong> {lender.minLoanAmountText}</p>
                  <p><strong className="text-stone-800">Max Amount:</strong> {lender.maxLoanAmountText}</p>
                </div>
              </div>
            </div>

            {/* Prepayment & Foreclosure Terms */}
            <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/70 space-y-1.5">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>Prepayment / Foreclosure Policy</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                {lender.prepaymentTerms}
              </p>
            </div>

            {/* Document Checklist required for this lender */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Underwriting Documentation Matrix</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-stone-500 block">Mandatory KYC</span>
                  <p className="text-stone-700 leading-relaxed">{lender.kycDocs}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-stone-500 block">Income Papers</span>
                  <p className="text-stone-700 leading-relaxed">{lender.incomeDocsSalaried}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-stone-500 block">Property Chain</span>
                  <p className="text-stone-700 leading-relaxed">{lender.propertyDocs}</p>
                </div>
              </div>
            </div>

            {/* Why This Match */}
            {lender.matchReasons.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Algorithm Fit Reasons</span>
                </h4>
                <div className="space-y-1.5">
                  {lender.matchReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 md:p-5 border-t border-stone-100 bg-stone-50/70">
            <a
              href="/Bank_and_NBFC_Home_Loan_and_LAP_Guidelines.xlsx"
              download="Bank_and_NBFC_Home_Loan_and_LAP_Guidelines.xlsx"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download 43+ Lenders Excel</span>
            </a>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 text-stone-600 hover:text-stone-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onApply(lender);
                  onClose();
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10B981] hover:bg-[#0e9f6e] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
              >
                <span>Select & Proceed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
