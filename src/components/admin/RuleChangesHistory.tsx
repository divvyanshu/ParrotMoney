import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  Download, 
  Search, 
  Calendar, 
  User, 
  Check, 
  SlidersHorizontal,
  ArrowRight,
  ShieldAlert,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { AlgorithmParams, RuleChangeHistoryEntry } from '../../types';

interface RuleChangesHistoryProps {
  history: RuleChangeHistoryEntry[];
  currentParams: AlgorithmParams;
  onRestoreVersion: (params: AlgorithmParams, version: string) => void;
}

export const RuleChangesHistory: React.FC<RuleChangesHistoryProps> = ({
  history,
  currentParams,
  onRestoreVersion,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.version.toLowerCase().includes(term) ||
      item.author.toLowerCase().includes(term) ||
      item.reason.toLowerCase().includes(term) ||
      (item.presetApplied && item.presetApplied.toLowerCase().includes(term))
    );
  });

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `parrot_credit_rules_audit_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleConfirmRestore = (entry: RuleChangeHistoryEntry) => {
    if (window.confirm(`Are you sure you want to rollback the underwriting rules to Version ${entry.version}? This will immediately update the live scoring model across all loan applications.`)) {
      onRestoreVersion(entry.params, entry.version);
      setRestoringId(entry.id);
      setTimeout(() => setRestoringId(null), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Rule Changes & Calibration Audit Trail</h3>
            <p className="text-xs text-slate-500 font-medium">
              Immutable ledger of credit criteria revisions, preset activations, and risk threshold adjustments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search version, author, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border-none transition-colors"
            title="Export full audit ledger as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit
          </button>
        </div>
      </div>

      {/* History Timeline Cards */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No rule revisions found</h4>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or save new parameters.</p>
          </div>
        ) : (
          filteredHistory.map((item, index) => {
            const isCurrent = index === 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border p-5 md:p-6 transition-all ${
                  isCurrent 
                    ? 'border-emerald-300 shadow-md ring-1 ring-emerald-200/50 bg-emerald-50/20' 
                    : 'border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                      {item.version}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Active Production Rules
                      </span>
                    )}
                    {item.presetApplied && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                        {item.presetApplied}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.timestamp}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.author}</span>
                    </div>

                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleConfirmRestore(item)}
                        disabled={restoringId === item.id}
                        className="ml-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border-none"
                        title={`Restore algorithm parameters to ${item.version}`}
                      >
                        {restoringId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Restored!</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore this Version</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-semibold">Revision Summary:</strong> {item.reason}
                  </p>
                </div>

                {/* Diffs / Parameter Badges */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 font-sans">
                    Configured Parameters for {item.version}:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-500 block font-sans">CIBIL Floor</span>
                      <strong className="text-slate-800">{item.params.cibilThreshold}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-500 block font-sans">CIBIL Penalty</span>
                      <strong className="text-slate-800">-{item.params.cibilPenalty} pts</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-500 block font-sans">Max FOIR</span>
                      <strong className="text-slate-800">{item.params.maxFoirRatio}%</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-500 block font-sans">Max LTV</span>
                      <strong className="text-slate-800">{item.params.maxLtvRatio}%</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-500 block font-sans">Max Age</span>
                      <strong className="text-slate-800">{item.params.maxAgeLimit} Yrs</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-500 block font-sans">Age Penalty</span>
                      <strong className="text-slate-800">-{item.params.agePenalty}/yr</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-500 block font-sans">Co-borrower</span>
                      <strong className="text-emerald-700">{item.params.coBorrowerMultiplier}x</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] text-slate-500 block font-sans">Salary Bonus</span>
                      <strong className="text-indigo-700">+{item.params.salaryMatchBonus} pts</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
