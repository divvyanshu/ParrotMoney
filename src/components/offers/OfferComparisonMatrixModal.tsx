import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Star, 
  TrendingDown, 
  CheckCircle2, 
  Sliders, 
  IndianRupee, 
  ShieldCheck,
  Scale,
  Award,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateMonthlyPayment, formatCurrency } from '../../lib/utils';
import { BankLogo } from '../BankLogo';

export interface CompareBankItem {
  name: string;
  rate: string;
  features: string[];
  processingTime: string;
  rating?: number;
  avgRating?: number;
  score?: number;
  finalScore?: number;
  totalRatings?: number;
  [key: string]: any;
}

interface OfferComparisonMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBanks: CompareBankItem[];
  defaultLoanAmount?: number;
  defaultTenureYears?: number;
  onSelectBank: (bank: CompareBankItem) => void;
  onRemoveBank?: (bankName: string) => void;
}

export const OfferComparisonMatrixModal: React.FC<OfferComparisonMatrixModalProps> = ({
  isOpen,
  onClose,
  selectedBanks,
  defaultLoanAmount = 4500000,
  defaultTenureYears = 20,
  onSelectBank,
  onRemoveBank
}) => {
  const [loanAmount, setLoanAmount] = useState<number>(defaultLoanAmount > 0 ? defaultLoanAmount : 4500000);
  const [tenureYears, setTenureYears] = useState<number>(defaultTenureYears > 0 ? defaultTenureYears : 20);
  const [showParameters, setShowParameters] = useState<boolean>(false);

  // Parse offers and calculate dynamic EMI and Total Interest Payable
  const computedOffers = useMemo(() => {
    return selectedBanks.map((bank) => {
      const rateNum = parseFloat(String(bank.rate).replace('%', '')) || 8.5;
      const emi = calculateMonthlyPayment(loanAmount, rateNum, tenureYears);
      const totalPaymentsCount = tenureYears * 12;
      const totalRepayment = emi * totalPaymentsCount;
      const totalInterest = Math.max(0, totalRepayment - loanAmount);

      return {
        ...bank,
        rateNum,
        emi: Math.round(emi),
        totalRepayment: Math.round(totalRepayment),
        totalInterest: Math.round(totalInterest),
        matchScore: bank.finalScore || bank.score || 90,
        trustScore: Number((bank.avgRating || bank.rating || 4.5).toFixed(1))
      };
    });
  }, [selectedBanks, loanAmount, tenureYears]);

  // Two-offer pairwise interest difference calculations
  const pairwiseDiff = useMemo(() => {
    if (computedOffers.length !== 2) return null;

    const offerA = computedOffers[0];
    const offerB = computedOffers[1];

    const interestDiff = Math.abs(offerA.totalInterest - offerB.totalInterest);
    const emiDiff = Math.abs(offerA.emi - offerB.emi);
    const rateDiff = Math.abs(offerA.rateNum - offerB.rateNum);

    const cheaperOffer = offerA.totalInterest <= offerB.totalInterest ? offerA : offerB;
    const costlierOffer = offerA.totalInterest > offerB.totalInterest ? offerA : offerB;

    const percentInterestSaved = costlierOffer.totalInterest > 0
      ? ((interestDiff / costlierOffer.totalInterest) * 100).toFixed(1)
      : '0.0';

    return {
      interestDiff,
      emiDiff,
      rateDiff: rateDiff.toFixed(2),
      cheaperOffer,
      costlierOffer,
      percentInterestSaved,
      isExactSameRate: offerA.rateNum === offerB.rateNum
    };
  }, [computedOffers]);

  // Minimum interest offer in selection (for multi-bank compare >= 3)
  const lowestInterestOffer = useMemo(() => {
    if (computedOffers.length === 0) return null;
    return computedOffers.reduce((prev, curr) => curr.totalInterest < prev.totalInterest ? curr : prev, computedOffers[0]);
  }, [computedOffers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-8">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative bg-white w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[32px] md:rounded-[40px] shadow-2xl flex flex-col border border-slate-100"
      >
        {/* Modal Header */}
        <div className="p-5 md:p-7 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                  Offer Comparison Matrix
                </span>
                <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                  {computedOffers.length} {computedOffers.length === 1 ? 'Lender' : 'Lenders'} Selected
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-natural-sage tracking-tight mt-0.5">
                Side-by-Side Mortgage & Interest Cost Matrix
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParameters(!showParameters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                showParameters 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Simulate</span>
              <span className="text-[11px] text-slate-400">({tenureYears}Y / ₹{(loanAmount / 100000).toFixed(0)}L)</span>
            </button>

            <button 
              onClick={onClose}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Close comparison matrix"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Simulation Sliders Bar */}
        <AnimatePresence>
          {showParameters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-emerald-50/40 border-b border-emerald-100 px-5 py-4 md:px-8 overflow-hidden shrink-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Loan Amount Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">Simulated Loan Quantum:</span>
                    <span className="font-black text-emerald-900 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                      ₹{loanAmount.toLocaleString('en-IN')} ({(loanAmount / 100000).toFixed(1)} Lakhs)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000000}
                    max={20000000}
                    step={100000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>₹10L</span>
                    <span>₹50L</span>
                    <span>₹1Cr</span>
                    <span>₹2Cr</span>
                  </div>
                </div>

                {/* Tenure Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">Loan Tenure Horizon:</span>
                    <span className="font-black text-emerald-900 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                      {tenureYears} Years ({tenureYears * 12} Installments)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[10, 15, 20, 25, 30].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setTenureYears(yr)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          tenureYears === yr
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {yr}Y
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold text-right">
                    Recalculates all EMIs & Total Interest instantly
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Matrix Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar space-y-6">

          {/* PAIRWISE COMPARISON BANNER - Specifically when 2 bank offers are selected */}
          {pairwiseDiff && (
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-3xl p-5 md:p-6 shadow-xl border border-emerald-600/30">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-200" /> Full Tenure Pairwise Differential
                    </span>
                    <span className="text-xs text-emerald-100/80 font-bold">
                      {tenureYears} Years ({tenureYears * 12} Monthly EMIs) on ₹{(loanAmount / 100000).toFixed(1)}L
                    </span>
                  </div>

                  {pairwiseDiff.isExactSameRate ? (
                    <div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">
                        Identical Total Interest Payable: ₹{formatCurrency(pairwiseDiff.cheaperOffer.totalInterest)}
                      </h3>
                      <p className="text-xs text-emerald-100/90 font-medium max-w-2xl mt-1">
                        Both <strong>{pairwiseDiff.cheaperOffer.name}</strong> and <strong>{pairwiseDiff.costlierOffer.name}</strong> offer the same {pairwiseDiff.cheaperOffer.rate} interest rate. Compare by processing turnaround time and borrower trust rating below.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-xs uppercase tracking-widest text-emerald-200 font-black">
                          Total Interest Payable Difference:
                        </span>
                        <span className="text-2xl md:text-3xl font-black tracking-tight text-white underline decoration-emerald-400 decoration-2 underline-offset-4">
                          {formatCurrency(pairwiseDiff.interestDiff)}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-200 rounded-md text-xs font-black">
                          {pairwiseDiff.percentInterestSaved}% Less Interest
                        </span>
                      </div>

                      <p className="text-xs text-emerald-100/95 font-medium max-w-2xl mt-1.5 leading-relaxed">
                        Choosing <strong className="text-white font-black">{pairwiseDiff.cheaperOffer.name}</strong> ({pairwiseDiff.cheaperOffer.rate}) over <strong className="text-white font-black">{pairwiseDiff.costlierOffer.name}</strong> ({pairwiseDiff.costlierOffer.rate}) saves <strong className="text-white font-black">{formatCurrency(pairwiseDiff.interestDiff)}</strong> in total interest payable over your full loan tenure, reducing your monthly EMI by <strong className="text-white font-black">₹{pairwiseDiff.emiDiff.toLocaleString('en-IN')}/month</strong>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick 2-Offer Visual Comparison Pills */}
                <div className="flex items-center gap-3 shrink-0 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <div className="text-center px-3 py-1">
                    <span className="text-[10px] font-bold text-emerald-200 uppercase block">{pairwiseDiff.cheaperOffer.name}</span>
                    <span className="text-sm font-black text-white">{pairwiseDiff.cheaperOffer.rate}</span>
                    <span className="text-[10px] text-emerald-200/90 block">₹{(pairwiseDiff.cheaperOffer.totalInterest / 100000).toFixed(2)}L Interest</span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="text-center px-3 py-1">
                    <span className="text-[10px] font-bold text-emerald-200 uppercase block">{pairwiseDiff.costlierOffer.name}</span>
                    <span className="text-sm font-black text-white">{pairwiseDiff.costlierOffer.rate}</span>
                    <span className="text-[10px] text-emerald-200/90 block">₹{(pairwiseDiff.costlierOffer.totalInterest / 100000).toFixed(2)}L Interest</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MULTI-OFFER BANNER - When 3 or more offers are selected */}
          {computedOffers.length > 2 && lowestInterestOffer && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black">
                    Lowest Interest Leader: {lowestInterestOffer.name} ({lowestInterestOffer.rate})
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Total Interest Payable: <strong>₹{lowestInterestOffer.totalInterest.toLocaleString('en-IN')}</strong> ({formatCurrency(lowestInterestOffer.totalInterest)}) over {tenureYears} Years.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Maximum Spread</span>
                <span className="text-sm font-black text-emerald-950">
                  Save up to {formatCurrency(Math.max(...computedOffers.map(o => o.totalInterest)) - lowestInterestOffer.totalInterest)}
                </span>
              </div>
            </div>
          )}

          {/* COMPARISON MATRIX GRID / TABLE */}
          <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-xs bg-white">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse text-left min-w-[680px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="py-4 px-5 text-xs font-black uppercase tracking-wider text-slate-500 w-1/4 min-w-[180px]">
                      Comparison Metric
                    </th>
                    {computedOffers.map((bank) => (
                      <th 
                        key={bank.name} 
                        className="py-4 px-4 text-center border-l border-slate-200 bg-slate-50/40 relative min-w-[200px]"
                      >
                        {onRemoveBank && computedOffers.length > 2 && (
                          <button
                            onClick={() => onRemoveBank(bank.name)}
                            title={`Remove ${bank.name} from comparison`}
                            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className="flex flex-col items-center justify-center gap-1.5 pt-1">
                          <BankLogo bank={bank.name} size="md" className="shadow-xs" />
                          <h4 className="text-sm font-black text-natural-sage tracking-tight mt-1">{bank.name}</h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                            <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                            <span>{bank.trustScore} / 5.0</span>
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {/* Row 1: Starting ROI */}
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700">
                      Starting Interest Rate (ROI)
                      <span className="block text-[10px] font-medium text-slate-400">Annual floating rate</span>
                    </td>
                    {computedOffers.map((bank) => (
                      <td key={bank.name} className="py-3.5 px-4 text-center border-l border-slate-100">
                        <span className="text-base font-black text-natural-sage">
                          {bank.rate}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Monthly EMI */}
                  <tr className="bg-slate-50/30 hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700">
                      Estimated Monthly EMI
                      <span className="block text-[10px] font-medium text-slate-400">On ₹{(loanAmount / 100000).toFixed(0)}L over {tenureYears} Years</span>
                    </td>
                    {computedOffers.map((bank) => (
                      <td key={bank.name} className="py-3.5 px-4 text-center border-l border-slate-100">
                        <span className="text-sm font-black text-slate-800">
                          ₹{bank.emi.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">/month</span>
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: TOTAL INTEREST PAYABLE (HIGHLIGHTED CORE METRIC) */}
                  <tr className="bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors border-y-2 border-emerald-300/60">
                    <td className="py-4 px-5 font-black text-emerald-950">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Total Interest Payable</span>
                      </div>
                      <span className="block text-[10px] font-medium text-emerald-800 mt-0.5">
                        Over full {tenureYears}-year tenure ({tenureYears * 12} installments)
                      </span>
                    </td>
                    {computedOffers.map((bank) => {
                      const isLowestInAll = lowestInterestOffer?.name === bank.name;
                      return (
                        <td key={bank.name} className="py-4 px-4 text-center border-l border-emerald-200/60">
                          <div className="space-y-0.5">
                            <span className="text-base font-black text-emerald-900 block">
                              ₹{bank.totalInterest.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 block">
                              {formatCurrency(bank.totalInterest)}
                            </span>
                            {isLowestInAll && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[9px] font-black uppercase tracking-wider shadow-2xs">
                                Lowest Interest Cost
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 4: TOTAL INTEREST DIFFERENCE (DYNAMIC DIFFERENTIAL DISPLAY) */}
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700">
                      Interest Difference vs Peers
                      <span className="block text-[10px] font-medium text-slate-400">
                        {computedOffers.length === 2 ? 'Direct pairwise difference' : 'Versus lowest interest offer'}
                      </span>
                    </td>
                    {computedOffers.map((bank) => {
                      if (computedOffers.length === 2 && pairwiseDiff) {
                        const isCheaper = pairwiseDiff.cheaperOffer.name === bank.name;
                        if (pairwiseDiff.isExactSameRate) {
                          return (
                            <td key={bank.name} className="py-3.5 px-4 text-center border-l border-slate-100">
                              <span className="text-[11px] font-bold text-slate-500">
                                Exact Same Rate
                              </span>
                            </td>
                          );
                        }
                        return (
                          <td key={bank.name} className="py-3.5 px-4 text-center border-l border-slate-100">
                            {isCheaper ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Saves {formatCurrency(pairwiseDiff.interestDiff)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-bold">
                                +{formatCurrency(pairwiseDiff.interestDiff)} Extra Interest
                              </span>
                            )}
                          </td>
                        );
                      }

                      // 3+ banks
                      const diffVsLowest = bank.totalInterest - (lowestInterestOffer?.totalInterest || 0);
                      return (
                        <td key={bank.name} className="py-3.5 px-4 text-center border-l border-slate-100">
                          {diffVsLowest === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Best (Baseline)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                              +{formatCurrency(diffVsLowest)} Interest
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 5: Total Repayment Amount (Principal + Interest) */}
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700">
                      Total Repayment Amount
                      <span className="block text-[10px] font-medium text-slate-400">Principal + Total Interest</span>
                    </td>
                    {computedOffers.map((bank) => (
                      <td key={bank.name} className="py-3.5 px-4 text-center border-l border-slate-100">
                        <span className="text-xs font-bold text-slate-800 block">
                          ₹{bank.totalRepayment.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          ({(bank.totalRepayment / 100000).toFixed(2)} Lakhs)
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row 6: Match Score */}
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700">
                      Algorithmic Match Rate
                      <span className="block text-[10px] font-medium text-slate-400">Eligibility & policy fit</span>
                    </td>
                    {computedOffers.map((bank) => (
                      <td key={bank.name} className="py-3.5 px-4 text-center border-l border-slate-100">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-100 inline-block font-sans">
                          {bank.matchScore}% Match
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row 7: Processing Time (TAT) */}
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700">
                      Sanction & Disbursal TAT
                      <span className="block text-[10px] font-medium text-slate-400">Processing turnaround</span>
                    </td>
                    {computedOffers.map((bank) => (
                      <td key={bank.name} className="py-3.5 px-4 text-center border-l border-slate-100">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {bank.processingTime}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row 8: Key Features */}
                  <tr className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-700">
                      Product Highlights
                      <span className="block text-[10px] font-medium text-slate-400">Key features & benefits</span>
                    </td>
                    {computedOffers.map((bank) => (
                      <td key={bank.name} className="py-4 px-4 text-left border-l border-slate-100 align-top">
                        <div className="flex flex-col gap-1.5">
                          {bank.features?.map((f: string) => (
                            <span 
                              key={f} 
                              className="px-2 py-0.5 bg-slate-50 text-slate-700 text-[10px] font-semibold rounded-md border border-slate-200/70 inline-block"
                            >
                              ✓ {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 9: Action CTA */}
                  <tr className="bg-slate-50/60">
                    <td className="py-4 px-5 font-bold text-slate-500">
                      Select Offer
                    </td>
                    {computedOffers.map((bank) => (
                      <td key={bank.name} className="py-4 px-4 text-center border-l border-slate-100">
                        <button
                          onClick={() => {
                            onSelectBank(bank);
                            onClose();
                          }}
                          className="w-full py-2.5 px-4 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer border-none"
                        >
                          Choose {bank.name}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Precision Financial Comparison
            </p>
            <p className="text-xs text-natural-sage font-bold italic">
              Total Interest calculated using reducing balance formula over {tenureYears} years ({tenureYears * 12} installments).
            </p>
          </div>

          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </motion.div>
    </div>
  );
};
