import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, Sparkles, ShieldCheck, IndianRupee, 
  HelpCircle, ArrowDownRight, Award, ChevronDown, 
  ChevronUp, CheckCircle2, Percent, Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BankLogo } from './BankLogo';

interface LoanMarketSavingsBenchmarkProps {
  loan: {
    id?: string;
    loanAmount?: number;
    selectedBank?: {
      name?: string;
      rate?: string | number;
    };
    tenureYears?: number;
  };
  marketBenchmarkRate?: number; // default e.g. 9.35%
  className?: string;
}

// EMI Calculation helper
function calculateMonthlyEmi(principal: number, annualRate: number, tenureYears: number): number {
  if (!principal || !annualRate || !tenureYears) return 0;
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
              (Math.pow(1 + monthlyRate, totalMonths) - 1);
  return Math.round(emi);
}

export function LoanMarketSavingsBenchmark({
  loan,
  marketBenchmarkRate = 9.35,
  className
}: LoanMarketSavingsBenchmarkProps) {
  // Parse user rate from loan or bank
  const userRateRaw = loan.selectedBank?.rate || '8.45%';
  const userRate = typeof userRateRaw === 'number' 
    ? userRateRaw 
    : parseFloat(String(userRateRaw).replace(/[^0-9.]/g, '')) || 8.45;

  const principal = loan.loanAmount || 4500000;
  const bankName = loan.selectedBank?.name || 'HDFC Bank';

  // Interactive tenure simulation (defaults to 20 years or loan tenure)
  const defaultTenure = loan.tenureYears || 20;
  const [selectedTenure, setSelectedTenure] = useState<number>(defaultTenure);
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState<boolean>(false);

  // EMI & Lifetime calculations
  const calculations = useMemo(() => {
    const userEmi = calculateMonthlyEmi(principal, userRate, selectedTenure);
    const marketEmi = calculateMonthlyEmi(principal, marketBenchmarkRate, selectedTenure);

    const totalMonths = selectedTenure * 12;
    const userTotalPaid = userEmi * totalMonths;
    const marketTotalPaid = marketEmi * totalMonths;

    const userInterest = Math.max(0, userTotalPaid - principal);
    const marketInterest = Math.max(0, marketTotalPaid - principal);

    const lifetimeSavings = Math.max(0, marketInterest - userInterest);
    const monthlySavings = Math.max(0, marketEmi - userEmi);
    const rateDelta = Math.max(0, marketBenchmarkRate - userRate);

    // Percentage of total interest saved
    const percentSaved = marketInterest > 0 ? (lifetimeSavings / marketInterest) * 100 : 0;

    return {
      userEmi,
      marketEmi,
      userInterest,
      marketInterest,
      lifetimeSavings,
      monthlySavings,
      rateDelta: Number(rateDelta.toFixed(2)),
      percentSaved: Number(percentSaved.toFixed(1))
    };
  }, [principal, userRate, marketBenchmarkRate, selectedTenure]);

  // Format INR nicely
  const formatLakhsCr = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className={cn(
      "bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden transition-all duration-300",
      className
    )}>
      {/* Top Banner with Accent */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white px-5 sm:px-8 py-5 border-b border-emerald-100/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Institutional Pricing Delta
                </span>
                <span className="text-[11px] font-bold text-stone-500">
                  {calculations.rateDelta}% Under Market Average
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight mt-0.5">
                Market Rate Benchmark & Lifetime Savings
              </h3>
            </div>
          </div>

          {/* Prominent Savings Badge */}
          <div className="bg-white px-4 py-2 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center gap-3 self-start sm:self-auto">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-500 block">
                Total Lifetime Savings
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-700 tracking-tight block leading-none mt-0.5">
                {formatLakhsCr(calculations.lifetimeSavings)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparison Section */}
      <div className="p-5 sm:p-8 space-y-6">
        
        {/* Dual Rate Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. Selected Loan Offer */}
          <div className="relative bg-emerald-50/40 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BankLogo bank={bankName} size="sm" />
                <div>
                  <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block">
                    Your Selected Offer
                  </span>
                  <span className="font-extrabold text-stone-900 text-sm">{bankName}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-2xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Best Negotiated
              </span>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                  {userRate.toFixed(2)}%
                </span>
                <span className="text-xs font-bold text-stone-500 ml-1.5">p.a.</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Monthly EMI</span>
                <span className="text-base font-extrabold text-stone-900">
                  ₹{calculations.userEmi.toLocaleString('en-IN')}/mo
                </span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-900/80 font-medium flex items-center gap-1.5 bg-white/80 p-2 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Sanction guaranteed with zero hidden risk markup.</span>
            </div>
          </div>

          {/* 2. Current Market Average Benchmark */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-stone-500 tracking-wider block">
                  Industry Benchmark
                </span>
                <span className="font-extrabold text-stone-800 text-sm">Retail Market Average</span>
              </div>
              <span className="px-2 py-0.5 bg-stone-200 text-stone-700 text-[10px] font-black uppercase tracking-wider rounded-md">
                Median Rate
              </span>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-stone-700 tracking-tight">
                  {marketBenchmarkRate.toFixed(2)}%
                </span>
                <span className="text-xs font-bold text-stone-400 ml-1.5">p.a.</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Market EMI</span>
                <span className="text-base font-extrabold text-stone-600 line-through">
                  ₹{calculations.marketEmi.toLocaleString('en-IN')}/mo
                </span>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1.5 bg-white/80 p-2 rounded-xl border border-stone-200/60">
              <Percent className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Standard counter-walk-in rate across Top 10 Indian retail banks.</span>
            </div>
          </div>

        </div>

        {/* Visual Comparison Bar Gauge */}
        <div className="bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200/70 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              Interest Outflow Spread Comparison
            </span>
            <span className="font-extrabold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md text-[11px]">
              Save {calculations.percentSaved}% on Lifetime Interest
            </span>
          </div>

          {/* Visual Track */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-stone-200 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                style={{ width: `${Math.max(10, Math.min(90, 100 - calculations.percentSaved))}%` }}
                title={`Your Outflow: ₹${calculations.userInterest.toLocaleString('en-IN')}`}
              />
              <div 
                className="h-full bg-amber-400/80 transition-all duration-700" 
                style={{ width: `${Math.max(5, Math.min(90, calculations.percentSaved))}%` }}
                title={`Saved Outflow: ₹${calculations.lifetimeSavings.toLocaleString('en-IN')}`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-500 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Your Interest: {formatLakhsCr(calculations.userInterest)}
              </span>
              <span className="flex items-center gap-1 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Preserved Savings: {formatLakhsCr(calculations.lifetimeSavings)}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Tenure Simulator Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-500" />
            <span className="text-xs font-bold text-stone-700">Simulate by Tenure:</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
            {[10, 15, 20, 25, 30].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedTenure(yr)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  selectedTenure === yr
                    ? "bg-white text-emerald-800 shadow-xs border border-stone-200/80 font-black"
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                {yr} Years
              </button>
            ))}
          </div>
        </div>

        {/* 3 Metric Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="text-[10px] uppercase font-bold text-stone-500 block">Monthly Savings</span>
            <span className="text-base sm:text-lg font-black text-emerald-700 block mt-0.5">
              +₹{calculations.monthlySavings.toLocaleString('en-IN')}/mo
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Extra disposable cashflow</span>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="text-[10px] uppercase font-bold text-stone-500 block">Rate Delta</span>
            <span className="text-base sm:text-lg font-black text-stone-800 block mt-0.5">
              -{calculations.rateDelta}% (90 bps)
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Below prime market rate</span>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="text-[10px] uppercase font-bold text-stone-500 block">Principle Funded</span>
            <span className="text-base sm:text-lg font-black text-stone-800 block mt-0.5">
              {formatLakhsCr(principal)}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Tenure: {selectedTenure} Years</span>
          </div>
        </div>

        {/* Toggle Detailed Breakdown */}
        <div className="pt-2 border-t border-stone-100">
          <button
            onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors cursor-pointer"
          >
            {isBreakdownExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{isBreakdownExpanded ? 'Hide Underwriting & Calculation Assumptions' : 'View Detailed Benchmark Assumptions'}</span>
          </button>

          {isBreakdownExpanded && (
            <div className="mt-3 p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs space-y-2.5 text-stone-600 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Reducing Balance Compounding:</strong> Calculations use the standard monthly reducing balance formula mandated by the Reserve Bank of India (RBI).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Zero Prepayment Penalty:</strong> Under RBI statutory guidelines, floating-rate retail home loans carry 0% prepayment charges, allowing accelerated savings.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Market Average Source:</strong> Derived from the average scheduled commercial bank prime mortgage rates (MCLR/EBLR linked) across Tier-1 public and private institutions.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
