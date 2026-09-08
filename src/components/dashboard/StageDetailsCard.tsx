import React, { useState } from 'react';
import { 
  LoanStageId, 
  LoanApplication,
  LoanQuery,
  CommunicationLogEntry
} from '../../types';
import { STAGE_CONFIGS } from '../../services/notificationService';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Phone, 
  Mail, 
  FileUp, 
  ArrowRight, 
  ShieldCheck, 
  Download, 
  Send, 
  MessageSquare, 
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface StageDetailsCardProps {
  selectedStageId: LoanStageId;
  currentStageId: LoanStageId;
  loan?: Partial<LoanApplication>;
  openQueries: LoanQuery[];
  onResolveQuery: (queryId: string, note: string) => void;
  onAdvanceStage: (newStageId: LoanStageId) => void;
  onTriggerAlert: (channel: 'whatsapp' | 'sms' | 'email') => void;
  onRaiseQuery: (title: string, desc: string, docName?: string) => void;
}

export const StageDetailsCard: React.FC<StageDetailsCardProps> = ({
  selectedStageId,
  currentStageId,
  loan,
  openQueries,
  onResolveQuery,
  onAdvanceStage,
  onTriggerAlert,
  onRaiseQuery
}) => {
  const stageConfig = STAGE_CONFIGS[selectedStageId];
  const stageKeys = Object.keys(STAGE_CONFIGS) as LoanStageId[];
  const currentIndex = stageKeys.indexOf(currentStageId);
  const selectedIndex = stageKeys.indexOf(selectedStageId);

  const isCurrent = selectedStageId === currentStageId;
  const isPassed = selectedIndex < currentIndex;
  const isUpcoming = selectedIndex > currentIndex;

  const activeStageQueries = openQueries.filter(q => q.stageId === selectedStageId && q.status === 'open');

  // Query creation state
  const [isAddingQuery, setIsAddingQuery] = useState(false);
  const [queryTitle, setQueryTitle] = useState('');
  const [queryDesc, setQueryDesc] = useState('');
  const [queryDoc, setQueryDoc] = useState('');

  // Query resolution state
  const [resolvingQueryId, setResolvingQueryId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Sanction letter modal/download state
  const [isSanctionLetterOpen, setIsSanctionLetterOpen] = useState(false);

  const handleCreateQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryTitle.trim()) return;
    onRaiseQuery(queryTitle, queryDesc, queryDoc);
    setQueryTitle('');
    setQueryDesc('');
    setQueryDoc('');
    setIsAddingQuery(false);
  };

  const handleResolve = (queryId: string) => {
    if (!resolutionText.trim()) return;
    onResolveQuery(queryId, resolutionText);
    setResolvingQueryId(null);
    setResolutionText('');
  };

  const loanAmountFormatted = loan?.loanAmount 
    ? `₹${loan.loanAmount.toLocaleString('en-IN')}` 
    : '₹45,00,000';
  const bankName = loan?.selectedBank?.name || 'HDFC Bank';
  const roi = loan?.selectedBank?.rate || '8.45%';

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 md:p-7 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md border border-stone-200">
              Stage {stageConfig.order} of 6
            </span>
            {isCurrent && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                In Active Progress
              </span>
            )}
            {isPassed && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                Milestone Complete
              </span>
            )}
            {isUpcoming && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-stone-50 text-stone-400 px-2 py-0.5 rounded-md border border-stone-200">
                Upcoming Phase
              </span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
            {stageConfig.name}
          </h3>
          <p className="text-xs md:text-sm text-stone-600 leading-relaxed max-w-2xl">
            {stageConfig.detailedDesc}
          </p>
        </div>

        {/* Quick Trigger Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-1.5 shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 text-left md:text-right">
            Instant Alert Simulator
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerAlert('whatsapp')}
              title="Simulate WhatsApp Notification"
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => onTriggerAlert('sms')}
              title="Simulate SMS Alert"
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>SMS</span>
            </button>
            <button
              onClick={() => onTriggerAlert('email')}
              title="Simulate Email Notification"
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span>Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* Open Queries / Action Alert Banner */}
      {activeStageQueries.length > 0 && (
        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 space-y-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                  Client Action Required
                </span>
                <span className="text-xs text-amber-700 font-bold">
                  {activeStageQueries.length} Open Query
                </span>
              </div>
              <h4 className="text-base font-bold text-amber-900">
                {activeStageQueries[0].title}
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                {activeStageQueries[0].description}
              </p>
              {activeStageQueries[0].requestedDocument && (
                <div className="flex items-center gap-2 pt-2 text-xs font-bold text-amber-900">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Requested File: <span className="underline">{activeStageQueries[0].requestedDocument}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Resolution Box */}
          {resolvingQueryId === activeStageQueries[0].id ? (
            <div className="bg-white p-4 rounded-xl border border-amber-300 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-natural-muted block">
                Provide Upload Confirmation or Explanation:
              </label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="E.g., Uploaded municipal approved copy in Document Center or sent via email..."
                rows={2}
                className="w-full p-3 rounded-xl border border-natural-border text-xs focus:outline-none focus:border-amber-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setResolvingQueryId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-natural-muted hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResolve(activeStageQueries[0].id)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Submit & Resolve Query
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-200/80">
              <span className="text-xs text-amber-800 font-medium">
                Client received automated alerts on WhatsApp & SMS regarding this inquiry.
              </span>
              <button
                onClick={() => setResolvingQueryId(activeStageQueries[0].id)}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Upload Document / Respond</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stage Checklist & Verification Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-natural-sage tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verification Tasks & Audit Criteria</span>
          </h4>
          <span className="text-[10px] font-bold text-natural-muted uppercase tracking-wider">
            {stageConfig.defaultTasks.filter(t => t.completed).length} of {stageConfig.defaultTasks.length} Completed
          </span>
        </div>

        <div className="grid gap-3">
          {stageConfig.defaultTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all",
                isPassed || (isCurrent && task.completed)
                  ? "bg-emerald-50/30 border-emerald-200 text-natural-sage"
                  : "bg-natural-bg/30 border-natural-border/60 text-slate-600"
              )}
            >
              <div className="flex items-start gap-3.5">
                <div className={cn(
                  "p-1.5 rounded-lg shrink-0 mt-0.5",
                  isPassed || (isCurrent && task.completed)
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-500"
                )}>
                  {isPassed || (isCurrent && task.completed) ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h5 className="text-xs md:text-sm font-bold tracking-tight">
                    {task.title}
                  </h5>
                  <p className="text-xs text-natural-muted mt-0.5">
                    {task.description}
                  </p>
                </div>
              </div>

              <span className={cn(
                "text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0",
                isPassed || (isCurrent && task.completed)
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-500"
              )}>
                {isPassed || (isCurrent && task.completed) ? 'Verified' : 'In Review'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Officer Desk & SLA Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-natural-bg/40 p-4 rounded-2xl border border-natural-border/60 space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-natural-muted block">
            Assigned Specialist
          </span>
          <p className="text-xs font-bold text-natural-sage">
            {stageConfig.officerRole}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Available Mon-Sat</span>
        </div>

        <div className="bg-natural-bg/40 p-4 rounded-2xl border border-natural-border/60 space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-natural-muted block">
            Expected Timeline (SLA)
          </span>
          <p className="text-xs font-bold text-natural-sage">
            {stageConfig.slaDays} Business Days
          </p>
          <span className="text-[10px] text-natural-muted">Bank Direct Channel</span>
        </div>

        <div className="bg-natural-bg/40 p-4 rounded-2xl border border-natural-border/60 space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-natural-muted block">
            Selected Lender
          </span>
          <p className="text-xs font-bold text-natural-sage">
            {bankName} ({roi})
          </p>
          <span className="text-[10px] text-natural-muted">Amount: {loanAmountFormatted}</span>
        </div>
      </div>

      {/* Stage Specific Actions & Special Features */}
      <div className="pt-4 border-t border-natural-border/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Query Creator Trigger */}
          {!isAddingQuery ? (
            <button
              onClick={() => setIsAddingQuery(true)}
              className="text-xs font-bold text-natural-sage hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Simulate Raising a Bank Query / Document Request</span>
            </button>
          ) : null}

          {/* Special Sanction Letter Button if on Sanction Stage */}
          {selectedStageId === 'sanctioned' && (
            <button
              onClick={() => setIsSanctionLetterOpen(true)}
              className="px-5 py-3 bg-natural-sage hover:bg-natural-sage/90 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Formal Sanction Letter</span>
            </button>
          )}

          {/* Next Stage Progression Button */}
          {selectedIndex < stageKeys.length - 1 && isCurrent && (
            <button
              onClick={() => onAdvanceStage(stageKeys[selectedIndex + 1])}
              className="ml-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Advance to Next Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Inline Query Add Form */}
        <AnimatePresence>
          {isAddingQuery && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateQuery}
              className="bg-natural-bg/40 p-5 rounded-2xl border border-natural-border space-y-4"
            >
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase tracking-wider text-natural-sage">
                  Simulate Document / Verification Query
                </h5>
                <button
                  type="button"
                  onClick={() => setIsAddingQuery(false)}
                  className="text-xs text-natural-muted hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Query Title (e.g. Electric Bill Required for Address)"
                  value={queryTitle}
                  onChange={(e) => setQueryTitle(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-natural-border text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Requested Document Name (e.g. Latest Utility Bill)"
                  value={queryDoc}
                  onChange={(e) => setQueryDoc(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-natural-border text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <textarea
                placeholder="Inquiry Description / Guidance to client..."
                value={queryDesc}
                onChange={(e) => setQueryDesc(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl bg-white border border-natural-border text-xs focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQuery(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-natural-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Trigger Query & Send Alerts
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Sanction Letter Modal */}
      <AnimatePresence>
        {isSanctionLetterOpen && (
          <div className="fixed inset-0 bg-natural-sage/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] border border-natural-border shadow-2xl max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-natural-border pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    Official Approval Document
                  </span>
                  <h4 className="text-xl font-bold text-natural-sage italic">
                    Loan Sanction Letter
                  </h4>
                </div>
                <button
                  onClick={() => setIsSanctionLetterOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-natural-muted font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-serif text-xs space-y-4 text-slate-800 leading-relaxed">
                <div className="text-center pb-4 border-b border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 tracking-wide">
                    {bankName.toUpperCase()} RETAIL ASSETS DESK
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Credit Approval Committee • Ref No: SANCT-{loan?.id?.slice(-6) || '9842'}
                  </p>
                </div>

                <p>Dear {loan?.fullName || 'Valued Customer'},</p>
                <p>
                  We are pleased to convey the sanction of your Home Loan application as per the approved parameters detailed below:
                </p>

                <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200 font-sans text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Sanctioned Amount:</span>
                    <span className="font-black text-emerald-600 text-sm">{loanAmountFormatted}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Applicable Interest Rate:</span>
                    <span className="font-bold text-slate-800 text-sm">{roi} p.a. (Floating)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Approved Tenure:</span>
                    <span className="font-bold text-slate-800">240 Months (20 Years)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Administrative Fee:</span>
                    <span className="font-bold text-slate-800">₹4,999 + GST</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600">
                  This sanction is subject to final title search verification, property inspection, and execution of legal loan agreements prior to disbursement.
                </p>

                <div className="flex justify-between pt-4 border-t border-slate-200 text-[10px] text-slate-500 font-sans">
                  <div>Authorized Signatory<br /><span className="font-bold text-slate-800">Parrot Credit Operations</span></div>
                  <div className="text-right">Date of Issuance<br /><span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-IN')}</span></div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsSanctionLetterOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-natural-border text-xs font-bold text-natural-muted hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert("Sanction Letter PDF downloaded successfully.");
                    setIsSanctionLetterOpen(false);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700"
                >
                  Download PDF Copy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
