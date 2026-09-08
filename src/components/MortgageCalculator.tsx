import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Percent, 
  Calendar, 
  IndianRupee, 
  PieChart as PieChartIcon, 
  Calculator, 
  TableProperties, 
  Briefcase, 
  UserCheck, 
  TrendingDown,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Info,
  Clock
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { calculateMonthlyPayment, formatCurrency, cn, calculateEligibility, calculateAmortizationSchedule, calculateTenureWithGrowth } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type CalculatorTab = 'emi' | 'amortization' | 'transfer' | 'eligibility' | 'prepayment' | 'stepup';

function CustomTooltip({ message }: { message: string }) {
  return (
    <div className="group relative inline-block ml-2">
      <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center cursor-help">
        <Info className="w-2.5 h-2.5 text-slate-400" />
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-parrot-navy text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[110] shadow-2xl">
        {message}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-parrot-navy" />
      </div>
    </div>
  );
}

const InputWithCurrency = ({ value, onChange, placeholder, className }: { value: number, onChange: (val: number) => void, placeholder: string, className: string }) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value.toString());

  React.useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toString());
    }
  }, [value, isFocused]);

  return (
    <input 
      type={isFocused ? "number" : "text"}
      value={isFocused ? localValue : formatCurrency(value)}
      onChange={(e) => setLocalValue(e.target.value)}
      onFocus={() => {
        setIsFocused(true);
        setLocalValue(value.toString());
      }}
      onBlur={() => {
        setIsFocused(false);
        const num = parseFloat(localValue);
        if (!isNaN(num)) onChange(num);
      }}
      placeholder={placeholder}
      className={className}
    />
  );
};

export function MortgageCalculator({ onApply, isLap = false }: { onApply?: (data: any) => void, isLap?: boolean }) {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('emi');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportFrequency, setReportFrequency] = useState<'monthly' | 'yearly'>('yearly');
  const [mobileActiveView, setMobileActiveView] = useState<'inputs' | 'results'>('inputs');

  // EMI States
  const [emiHomePrice, setEmiHomePrice] = useState(5000000);
  const [emiInterestRate, setEmiInterestRate] = useState(8.5);
  const [emiTenureValue, setEmiTenureValue] = useState(20);
  const [emiTenureUnit, setEmiTenureUnit] = useState<'years' | 'months'>('years');

  // Amortization States
  const [amortLoanAmount, setAmortLoanAmount] = useState(5000000);
  const [amortInterestRate, setAmortInterestRate] = useState(8.5);
  const [amortTermYears, setAmortTermYears] = useState(20);

  // Balance Transfer States
  const [transferLoan, setTransferLoan] = useState(5000000);
  const [transferOldRate, setTransferOldRate] = useState(9.5);
  const [transferNewRate, setTransferNewRate] = useState(8.5);
  const [transferTermYears, setTransferTermYears] = useState(15);

  // Eligibility States
  const [eligIncome, setEligIncome] = useState(150000);
  const [eligExistingEMI, setEligExistingEMI] = useState(0);
  const [eligInterestRate, setEligInterestRate] = useState(8.5);
  const [eligTermYears, setEligTermYears] = useState(20);

  // Prepayment States
  const [prepayLoan, setPrepayLoan] = useState(5000000);
  const [prepayInterestRate, setPrepayInterestRate] = useState(8.5);
  const [prepayTermYears, setPrepayTermYears] = useState(15);
  const [prepayAmount, setPrepayAmount] = useState(500000);
  const [prepayYear, setPrepayYear] = useState(5);

  // Growth States
  const [growthLoan, setGrowthLoan] = useState(5000000);
  const [growthInterestRate, setGrowthInterestRate] = useState(8.5);
  const [growthTermYears, setGrowthTermYears] = useState(20);
  const [growthType, setGrowthType] = useState<'percentage' | 'absolute'>('percentage');
  const [growthValue, setGrowthValue] = useState(5);
  const [growthFrequency, setGrowthFrequency] = useState<'annual' | 'monthly'>('annual');

  const emiStats = useMemo(() => {
    const loanAmount = emiHomePrice;
    const termInYears = emiTenureUnit === 'years' ? emiTenureValue : emiTenureValue / 12;
    const monthlyEMI = calculateMonthlyPayment(loanAmount, emiInterestRate, termInYears);
    const totalMonths = emiTenureUnit === 'years' ? emiTenureValue * 12 : emiTenureValue;
    const totalPayable = monthlyEMI > 0 ? monthlyEMI * totalMonths : 0;
    const totalInterest = totalPayable > loanAmount ? totalPayable - loanAmount : 0;
    
    return {
      loanAmount,
      monthlyEMI,
      termInYears,
      totalPayable,
      totalInterest,
      data: [
        { name: 'Principal', value: loanAmount || 1, color: '#1A2E4A' },
        { name: 'Interest', value: totalInterest || 0, color: '#22C55E' },
      ]
    };
  }, [emiHomePrice, emiInterestRate, emiTenureValue, emiTenureUnit]);

  const eligibilityStats = useMemo(() => {
    return calculateEligibility(eligIncome, eligExistingEMI, eligInterestRate, eligTermYears);
  }, [eligIncome, eligExistingEMI, eligInterestRate, eligTermYears]);

  const reportData = useMemo(() => {
    if (activeTab === 'emi') {
      return calculateAmortizationSchedule(emiStats.loanAmount, emiInterestRate, emiStats.termInYears, reportFrequency);
    }
    if (activeTab === 'amortization') {
      return calculateAmortizationSchedule(amortLoanAmount, amortInterestRate, amortTermYears, reportFrequency);
    }
    if (activeTab === 'transfer') {
      return calculateAmortizationSchedule(transferLoan, transferNewRate, transferTermYears, reportFrequency);
    }
    if (activeTab === 'eligibility') {
      return calculateAmortizationSchedule(eligibilityStats, eligInterestRate, eligTermYears, reportFrequency);
    }
    if (activeTab === 'prepayment') {
      return calculateAmortizationSchedule(prepayLoan, prepayInterestRate, prepayTermYears, reportFrequency);
    }
    if (activeTab === 'stepup') {
      return calculateAmortizationSchedule(growthLoan, growthInterestRate, growthTermYears, reportFrequency, { type: growthType, value: growthValue, frequency: growthFrequency });
    }
    return [];
  }, [activeTab, emiStats, emiInterestRate, amortLoanAmount, amortInterestRate, amortTermYears, growthLoan, growthInterestRate, growthType, growthValue, growthTermYears, growthFrequency, reportFrequency, transferLoan, transferNewRate, transferTermYears, eligibilityStats, eligInterestRate, eligTermYears, prepayLoan, prepayInterestRate, prepayTermYears]);

  const transferStats = useMemo(() => {
    const oldEMI = calculateMonthlyPayment(transferLoan, transferOldRate, transferTermYears);
    const newEMI = calculateMonthlyPayment(transferLoan, transferNewRate, transferTermYears);
    const savingsEMI = oldEMI - newEMI;
    const totalSavings = savingsEMI * transferTermYears * 12;
    return { oldEMI, newEMI, savingsEMI, totalSavings };
  }, [transferLoan, transferOldRate, transferNewRate, transferTermYears]);

  const prepaymentStats = useMemo(() => {
    const originalMonthlyEMI = calculateMonthlyPayment(prepayLoan, prepayInterestRate, prepayTermYears);
    const originalTotalInterest = (originalMonthlyEMI * prepayTermYears * 12) - prepayLoan;

    // Simulate schedule with prepayment
    const monthlyRate = prepayInterestRate / 100 / 12;
    const prepayMonth = prepayYear * 12;
    let balance = prepayLoan;
    let totalInterestWithPrepay = 0;
    let months = 0;

    while (balance > 0 && months < 600) {
      months++;
      const interest = balance * monthlyRate;
      totalInterestWithPrepay += interest;
      
      let payment = Math.min(balance + interest, originalMonthlyEMI);
      
      // Apply prepayment at exactly the end of prepayMonth
      if (months === prepayMonth) {
        payment += Math.min(prepayAmount, balance + interest - payment);
      }
      
      balance = Math.max(0, balance + interest - payment);
    }
    
    return { 
      interestSaved: Math.max(0, originalTotalInterest - totalInterestWithPrepay),
      newTenureMonths: months
    };
  }, [prepayLoan, prepayInterestRate, prepayTermYears, prepayAmount, prepayYear]);

  const growthStats = useMemo(() => {
    const initialEMI = calculateMonthlyPayment(growthLoan, growthInterestRate, growthTermYears);
    const stats = calculateTenureWithGrowth(growthLoan, growthInterestRate, initialEMI, growthType, growthValue, growthFrequency);
    
    let nextEMI = initialEMI;
    if (growthValue > 0) {
      if (growthType === 'percentage') {
        nextEMI = initialEMI * (1 + growthValue / 100);
      } else {
        nextEMI = initialEMI + growthValue;
      }
    }
    
    return { ...stats, initialEMI, nextEMI };
  }, [growthLoan, growthInterestRate, growthTermYears, growthType, growthValue, growthFrequency]);

  const reportSummary = useMemo(() => {
    switch (activeTab) {
      case 'emi':
        return [
          { label: 'Monthly EMI', value: formatCurrency(emiStats.monthlyEMI), icon: Calculator },
          { label: 'Loan Amount', value: formatCurrency(emiStats.loanAmount), icon: IndianRupee },
          { label: 'Total Interest', value: formatCurrency(emiStats.totalInterest), icon: Percent },
          { label: 'Total Payable', value: formatCurrency(emiStats.totalPayable), icon: TrendingDown },
        ];
      case 'amortization':
        const amortPayable = calculateMonthlyPayment(amortLoanAmount, amortInterestRate, amortTermYears) * amortTermYears * 12;
        return [
          { label: 'Loan Amount', value: formatCurrency(amortLoanAmount), icon: IndianRupee },
          { label: 'Interest Rate', value: `${amortInterestRate}%`, icon: Percent },
          { label: 'Tenure', value: `${amortTermYears}Y`, icon: Calendar },
          { label: 'Total Interest', value: formatCurrency(amortPayable - amortLoanAmount), icon: TrendingDown },
        ];
      case 'transfer':
        return [
          { label: 'Total Savings', value: formatCurrency(transferStats.totalSavings), icon: TrendingDown },
          { label: 'Old EMI', value: formatCurrency(transferStats.oldEMI), icon: Calculator },
          { label: 'New EMI', value: formatCurrency(transferStats.newEMI), icon: ArrowRight },
          { label: 'Monthly Saving', value: formatCurrency(transferStats.savingsEMI), icon: Percent },
        ];
      case 'eligibility':
        return [
          { label: 'Max Loan Eligible', value: formatCurrency(eligibilityStats), icon: UserCheck },
          { label: 'Monthly Income', value: formatCurrency(eligIncome), icon: IndianRupee },
          { label: 'Existing EMIs', value: formatCurrency(eligExistingEMI), icon: Calculator },
          { label: 'Interest Rate', value: `${eligInterestRate}%`, icon: Percent },
        ];
      case 'stepup':
        return [
          { label: 'Current EMI', value: formatCurrency(growthStats.initialEMI), icon: IndianRupee },
          { label: 'Next Pre-pay', value: formatCurrency(growthStats.nextEMI), icon: TrendingUp },
          { label: 'Time Saved', value: growthStats.failed ? '0m' : `${Math.max(0, growthTermYears * 12 - growthStats.totalMonths)} months`, icon: TrendingDown },
          { label: 'Total Interest', value: growthStats.failed ? 'N/A' : formatCurrency(growthStats.totalInterest), icon: Percent },
        ];
      case 'prepayment':
        return [
          { label: 'Interest Saved', value: formatCurrency(prepaymentStats.interestSaved), icon: TrendingDown },
          { label: 'Time Saved', value: `${Math.max(0, prepayTermYears * 12 - prepaymentStats.newTenureMonths)} months`, icon: Clock },
          { label: 'Prepayment Yr', value: `Year ${prepayYear}`, icon: Calendar },
          { label: 'Principal', value: formatCurrency(prepayLoan), icon: Calculator },
        ];
      default:
        return [];
    }
  }, [activeTab, emiStats, amortLoanAmount, amortInterestRate, amortTermYears, transferStats, eligIncome, eligExistingEMI, eligInterestRate, growthStats, prepaymentStats, prepayAmount, prepayYear, prepayLoan]);

  const tabs: { id: CalculatorTab; label: string; mobileLabel?: string; icon: any }[] = [
    { id: 'emi', label: 'EMI', icon: Calculator },
    { id: 'eligibility', label: 'Eligibility', icon: UserCheck },
    { id: 'transfer', label: 'Loan Transfer', mobileLabel: 'Transfer', icon: Briefcase },
    { id: 'prepayment', label: 'Loan Pre-pay', icon: TrendingDown },
    { id: 'stepup', label: 'Pre-pay', icon: TrendingDown },
  ];

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-row overflow-x-auto whitespace-nowrap gap-2 p-1.5 bg-white rounded-full border border-slate-100 shadow-xl max-w-full lg:max-w-fit mx-auto scrollbar-none snap-x snap-mandatory">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setMobileActiveView('inputs');
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5 lg:py-2.5 rounded-full text-xs sm:text-[13px] md:text-sm font-medium font-sans transition-all w-auto shrink-0 snap-center border",
              activeTab === tab.id 
                ? "bg-white text-parrot-green border-parrot-green shadow-sm" 
                : "bg-white text-slate-400 border-slate-100/60 hover:border-slate-200 hover:text-parrot-navy"
            )}
          >
            <tab.icon 
              className={cn(
                "w-3.5 h-3.5 lg:w-4 lg:h-4 transition-colors shrink-0",
                activeTab === tab.id ? "text-parrot-green" : "text-parrot-green/60"
              )}
              strokeWidth={1.8} 
            />
            <span className="truncate sm:hidden">{tab.mobileLabel || tab.label}</span>
            <span className="truncate hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile-only Segmented Control to switch between Inputs & Results (hidden per user request) */}
      <div className="hidden max-w-[280px] mx-auto mb-2">
        <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200/60 shadow-inner">
          <button
            type="button"
            onClick={() => setMobileActiveView('inputs')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5",
              mobileActiveView === 'inputs' 
                ? "bg-white text-parrot-navy shadow-sm" 
                : "text-slate-400 hover:text-parrot-navy"
            )}
          >
            <Calculator className="w-3.5 h-3.5" />
            Inputs
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView('results')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5",
              mobileActiveView === 'results' 
                ? "bg-parrot-navy text-white shadow-sm" 
                : "text-slate-400 hover:text-parrot-navy"
            )}
          >
            <PieChartIcon className="w-3.5 h-3.5 text-parrot-green" />
            Results
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        {/* Input Column */}
        <div className={cn(
          "bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-2xl space-y-5 lg:h-[510px] overflow-y-auto custom-scrollbar",
          mobileActiveView !== 'inputs' && "hidden lg:block"
        )}>
          <AnimatePresence mode="wait">
            {activeTab === 'emi' && (
              <motion.div key="emi" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-bold text-parrot-navy mb-4">EMI Calculator</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Loan Amount Required</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <InputWithCurrency 
                          value={emiHomePrice} 
                          onChange={setEmiHomePrice} 
                          placeholder="e.g. 75,00,000"
                          className="w-full bg-slate-50 border-none rounded-xl pl-12 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Interest Rate (%) P.A.</label>
                        <div className="relative">
                          <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="number" step="0.1" placeholder="e.g. 8.75" value={emiInterestRate || ''} onChange={(e) => setEmiInterestRate(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl pl-12 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[9px] uppercase font-black text-slate-400 flex items-center tracking-widest">
                          Loan Tenure
                        </label>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg">
                          {(['years', 'months'] as const).map((unit) => (
                            <button
                              key={unit}
                              onClick={() => setEmiTenureUnit(unit)}
                              type="button"
                              className={cn(
                                "px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wider transition-all",
                                emiTenureUnit === unit ? "bg-parrot-navy text-white shadow-sm" : "text-slate-400"
                              )}
                            >
                              {unit === 'years' ? 'Yrs' : 'Mos'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="number" 
                          placeholder={emiTenureUnit === 'years' ? "e.g. 20 Years" : "e.g. 240 Months"} 
                          className="w-full bg-slate-50 border-none rounded-xl pl-12 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]"
                          value={emiTenureValue || ''}
                          onChange={(e) => setEmiTenureValue(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block mt-8 p-4 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-parrot-green/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                     <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-parrot-green/10 flex items-center justify-center">
                              <Info className="w-3 h-3 text-parrot-green" />
                           </div>
                           <p className="text-[9px] font-black uppercase tracking-widest text-[#111827]">AI Smart Insight</p>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500 font-medium italic">
                          "Even a 0.25% lower rate can save you ₹4 lakh+ over 20 years on a ₹1 crore loan."
                        </p>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'amortization' && (
              <motion.div key="amortization" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-parrot-navy mb-4">Amortization Schedule</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Loan Amount</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <InputWithCurrency 
                          value={amortLoanAmount} 
                          onChange={setAmortLoanAmount} 
                          placeholder="e.g. 60,00,000"
                          className="w-full bg-slate-50 border-none rounded-xl pl-12 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Interest Rate (%) P.A.</label>
                        <input type="number" step="0.1" placeholder="e.g. 8.75" value={amortInterestRate || ''} onChange={(e) => setAmortInterestRate(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]" />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 flex items-center mb-2 tracking-widest">
                          Tenure (Years)
                        </label>
                        <input type="number" placeholder="e.g. 20" value={amortTermYears || ''} onChange={(e) => setAmortTermYears(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'transfer' && (
              <motion.div key="transfer" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <h3 className="text-lg font-bold text-parrot-navy mb-4">Loan Transfer</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Outstanding Principal</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <InputWithCurrency 
                        value={transferLoan} 
                        onChange={setTransferLoan} 
                        placeholder="e.g. 50,00,000"
                        className="w-full bg-slate-50 border-none rounded-xl pl-12 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Current Interest Rate (%) P.A.</label>
                      <input type="number" step="0.1" placeholder="e.g. 9.5" value={transferOldRate || ''} onChange={(e) => setTransferOldRate(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]" />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Expected Interest Rate (%) P.A.</label>
                      <input type="number" step="0.1" placeholder="e.g. 8.4" value={transferNewRate || ''} onChange={(e) => setTransferNewRate(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-parrot-green text-[13px]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-black text-slate-400 flex items-center mb-2 tracking-widest">
                      Remaining Tenure (Years)
                    </label>
                    <input type="number" placeholder="e.g. 15" value={transferTermYears || ''} onChange={(e) => setTransferTermYears(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]" />
                  </div>
                  <div className="hidden sm:flex p-3 bg-parrot-green/5 rounded-xl border border-parrot-green/10 gap-3 text-[10px] text-parrot-navy font-medium">
                    <Info className="w-3.5 h-3.5 shrink-0 text-parrot-green" />
                    Lower rates can save massive interest over long tenures.
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'eligibility' && (
              <motion.div key="eligibility" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-bold text-parrot-navy mb-4">Eligibility</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Monthly Gross Income</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <InputWithCurrency 
                          value={eligIncome} 
                          onChange={setEligIncome} 
                          placeholder="e.g. 1,50,000"
                          className="w-full bg-slate-50 border-none rounded-xl pl-12 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Current Monthly EMIs</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <InputWithCurrency 
                          value={eligExistingEMI} 
                          onChange={setEligExistingEMI} 
                          placeholder="e.g. 25,000"
                          className="w-full bg-slate-50 border-none rounded-xl pl-12 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Interest Rate (%) P.A.</label>
                        <input type="number" step="0.1" placeholder="e.g. 8.75" value={eligInterestRate || ''} onChange={(e) => setEligInterestRate(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]" />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 mb-2 tracking-widest block">Tenure (Y)</label>
                        <input type="number" placeholder="e.g. 20" value={eligTermYears || ''} onChange={(e) => setEligTermYears(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-parrot-green/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                     <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-parrot-green/10 flex items-center justify-center">
                              <Info className="w-3 h-3 text-parrot-green" />
                           </div>
                           <p className="text-[9px] font-black uppercase tracking-widest text-parrot-navy">AI Smart Insight</p>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500 font-medium italic">
                          "Lenders typically cap your EMI at 50-60% of your income. Clearing small debts can boost your eligibility by 20%."
                        </p>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'prepayment' && (
              <motion.div key="prepayment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-bold text-parrot-navy mb-4">Loan Pre-pay</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Loan Balance</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <InputWithCurrency 
                          value={prepayLoan} 
                          onChange={setPrepayLoan} 
                          placeholder="e.g. 50,00,000"
                          className="w-full bg-slate-50 border-none rounded-xl pl-12 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Interest Rate (%) P.A.</label>
                        <input type="number" step="0.1" placeholder="e.g. 8.5" value={prepayInterestRate || ''} onChange={(e) => setPrepayInterestRate(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]" />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Remaining (Y)</label>
                        <input type="number" placeholder="e.g. 15" value={prepayTermYears || ''} onChange={(e) => setPrepayTermYears(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Lump-sum Amount</label>
                        <InputWithCurrency 
                          value={prepayAmount} 
                          onChange={setPrepayAmount} 
                          placeholder="e.g. 5,00,000"
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">At Year End</label>
                        <select value={prepayYear} onChange={(e) => setPrepayYear(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold appearance-none text-[13px]">
                          {Array.from({ length: Math.max(1, prepayTermYears) }, (_, i) => i + 1).map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-parrot-green/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                     <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-parrot-green/10 flex items-center justify-center">
                              <Info className="w-3 h-3 text-parrot-green" />
                           </div>
                           <p className="text-[9px] font-black uppercase tracking-widest text-parrot-navy">AI Smart Insight</p>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500 font-medium italic">
                          "Paying just one extra EMI per year can reduce your 20-year loan tenure by over 3 years."
                        </p>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'stepup' && (
              <motion.div key="stepup" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <h3 className="text-lg font-bold text-parrot-navy mb-4">Pre-pay Payment Strategy</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Current Loan</label>
                      <InputWithCurrency 
                        value={growthLoan} 
                        onChange={setGrowthLoan} 
                        placeholder="e.g. 50,0,000"
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Interest Rate (%) P.A.</label>
                      <input type="number" step="0.1" placeholder="e.g. 8.5" value={growthInterestRate || ''} onChange={(e) => setGrowthInterestRate(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Base Tenure (Years)</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number" 
                        placeholder="e.g. 20"
                        value={growthTermYears || ''} 
                        onChange={(e) => setGrowthTermYears(Number(e.target.value))} 
                        className="w-full bg-slate-50 border-none rounded-xl pl-12 py-3 focus:ring-2 ring-parrot-green/20 font-bold text-[13px]" 
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Pre-pay In</label>
                        <div className="flex bg-white p-1 rounded-lg shadow-sm">
                          {['percentage', 'absolute'].map(opt => (
                            <button
                              key={opt}
                              onClick={() => setGrowthType(opt as any)}
                              className={cn(
                                "flex-1 py-1 rounded-md text-[9px] font-bold uppercase transition-all",
                                growthType === opt ? "bg-parrot-navy text-white shadow-sm" : "text-slate-400"
                              )}
                            >
                              {opt === 'percentage' ? 'Percentage (%)' : 'Amount'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Frequency</label>
                        <div className="flex bg-white p-1 rounded-lg shadow-sm">
                          {['annual', 'monthly'].map(f => (
                            <button
                              key={f}
                              onClick={() => setGrowthFrequency(f as any)}
                              className={cn(
                                "flex-1 py-1 rounded-md text-[9px] font-bold uppercase transition-all",
                                growthFrequency === f ? "bg-parrot-navy text-white shadow-sm" : "text-slate-400"
                              )}
                            >
                              {f === 'annual' ? 'Yearly' : 'Monthly'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-widest">
                        Pre-pay {growthType === 'percentage' ? 'Percentage (%) P.A.' : '(₹)'}
                      </label>
                      {growthType === 'percentage' ? (
                        <input 
                          type="number" 
                          placeholder="Value"
                          value={growthValue || ''} 
                          onChange={(e) => setGrowthValue(Number(e.target.value))} 
                          className="w-full bg-white border border-slate-100 rounded-lg px-4 py-2.5 focus:ring-2 ring-parrot-green/20 font-bold" 
                        />
                      ) : (
                        <InputWithCurrency 
                          value={growthValue} 
                          onChange={setGrowthValue} 
                          placeholder="Value"
                          className="w-full bg-white border border-slate-100 rounded-lg px-4 py-2.5 focus:ring-2 ring-parrot-green/20 font-bold"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'amortization' && (
              <motion.div key="amort_info" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 space-y-4 text-center">
                  <div>
                    <h3 className="text-xl font-black text-parrot-navy italic">Ready for Analysis.</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 mx-auto max-w-[280px]">
                      View your full amortization schedule and balance breakdown with the AI Analysis Tool.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile-only Sticky Result Preview Banner */}
          <div className="block lg:hidden mt-6 pt-4 border-t border-slate-100 bg-white sticky bottom-0 z-20">
            <button
              type="button"
              onClick={() => setMobileActiveView('results')}
              className={cn(
                "w-full p-4 rounded-2xl flex items-center justify-between shadow-xl active:scale-[0.98] transition-all border",
                isLap
                  ? "bg-[#10B981] border-[#10B981] text-white shadow-[#10B981]/20"
                  : "bg-parrot-navy border-transparent text-white shadow-parrot-navy/20"
              )}
            >
              <div className="text-left space-y-0.5">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider",
                  isLap ? "text-white/80" : "text-white/50"
                )}>
                  {activeTab === 'emi' && 'Estimated EMI'}
                  {activeTab === 'amortization' && 'Estimated EMI'}
                  {activeTab === 'transfer' && 'Total Interest Savings'}
                  {activeTab === 'eligibility' && 'Max Loan Eligible'}
                  {activeTab === 'prepayment' && 'Total Interest Saved'}
                  {activeTab === 'stepup' && 'Time Saved'}
                </span>
                <p className={cn(
                  "text-sm font-black",
                  isLap ? "text-white" : "text-parrot-green"
                )}>
                  {activeTab === 'emi' && formatCurrency(emiStats.monthlyEMI)}
                  {activeTab === 'amortization' && formatCurrency(calculateMonthlyPayment(amortLoanAmount, amortInterestRate, amortTermYears))}
                  {activeTab === 'transfer' && formatCurrency(transferStats.totalSavings)}
                  {activeTab === 'eligibility' && formatCurrency(eligibilityStats)}
                  {activeTab === 'prepayment' && formatCurrency(prepaymentStats.interestSaved)}
                  {activeTab === 'stepup' && `${Math.max(0, growthTermYears * 12 - growthStats.totalMonths)} Months`}
                </p>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl border",
                isLap
                  ? "text-white bg-white/20 border-white/20"
                  : "text-white/90 bg-white/10 border-white/10"
              )}>
                View Charts
                <ArrowRight className={cn("w-3.5 h-3.5 animate-pulse", isLap ? "text-white" : "text-parrot-green")} />
              </div>
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div className={cn(
          isLap 
            ? "bg-[#E2E8F0] text-slate-800 p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-xl space-y-5 relative overflow-hidden flex flex-col justify-between lg:h-[510px] h-auto"
            : "bg-parrot-navy text-white p-6 md:p-8 rounded-[32px] shadow-2xl space-y-5 relative overflow-hidden flex flex-col justify-between lg:h-[510px] h-auto",
          mobileActiveView !== 'results' && "hidden lg:block"
        )}>
          <div className={cn(
            "absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none",
            isLap ? "bg-parrot-green/5" : "bg-white/5"
          )} />
          
          <div className="space-y-5 md:space-y-6">
            {/* Back to Inputs for Mobile view */}
            <button
              type="button"
              onClick={() => setMobileActiveView('inputs')}
              className={cn(
                "lg:hidden flex items-center gap-1.5 text-xs font-black uppercase tracking-wider mb-2 transition-colors cursor-pointer select-none py-1.5 px-3 rounded-xl border border-dashed",
                isLap
                  ? "text-slate-500 hover:text-slate-800 border-slate-300 hover:bg-slate-100"
                  : "text-white/60 hover:text-white border-white/20 hover:bg-white/5"
              )}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Inputs
            </button>
            {(activeTab === 'emi' || activeTab === 'amortization') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className={cn(
                  "p-4 md:p-6 rounded-[28px] border shadow-sm",
                  isLap 
                    ? "bg-white border-slate-200" 
                    : "bg-white/5 border-white/10 backdrop-blur-sm"
                )}>
                  <p className={cn(
                    "text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em] mb-2",
                    isLap ? "text-slate-400" : "text-white/60"
                  )}>Estimated Monthly EMI</p>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-parrot-green">
                      {activeTab === 'emi' ? formatCurrency(emiStats.monthlyEMI) : formatCurrency(calculateMonthlyPayment(amortLoanAmount, amortInterestRate, amortTermYears))}
                    </h2>
                    <span className={cn(
                      "text-[8px] md:text-sm font-bold",
                      isLap ? "text-slate-400" : "text-white/40"
                    )}>/ Mo</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'transfer' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="space-y-4">
                  <div className={cn(
                    "border p-4 rounded-[28px] text-center",
                    isLap 
                      ? "bg-parrot-green/5 border-parrot-green/20" 
                      : "bg-parrot-green/10 border-parrot-green/20"
                  )}>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-[0.4em] mb-1 text-center",
                      isLap ? "text-slate-500" : "text-white/60"
                    )}>Total Interest Savings</p>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-parrot-green">{formatCurrency(transferStats.totalSavings)}</h2>
                    <p className={cn(
                      "text-[10px] font-bold uppercase mt-1",
                      isLap ? "text-slate-400" : "text-white/40"
                    )}>By switching to {transferNewRate}% P.A.</p>
                  </div>
                  <div className={cn(
                    "p-3.5 rounded-[28px] border shadow-sm",
                    isLap 
                      ? "bg-white border-slate-200" 
                      : "bg-white/5 border-white/10 backdrop-blur-sm"
                  )}>
                    <p className={cn(
                      "text-[9px] font-bold uppercase tracking-[0.4em] mb-3 text-center",
                      isLap ? "text-slate-400" : "text-white/60"
                    )}>Monthly Commitment Change</p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="space-y-0.5">
                        <p className={cn(
                          "text-[8px] font-black uppercase",
                          isLap ? "text-slate-400" : "text-white/30"
                        )}>Old EMI</p>
                        <p className={cn(
                          "font-extrabold text-base line-through",
                          isLap ? "text-slate-400" : "text-white/40"
                        )}>{formatCurrency(transferStats.oldEMI)}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className={cn(
                          "text-[8px] font-black uppercase",
                          isLap ? "text-slate-400" : "text-white/30"
                        )}>New EMI</p>
                        <p className="font-extrabold text-lg text-parrot-green">{formatCurrency(transferStats.newEMI)}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "mt-3 pt-3 border-t flex justify-between items-center px-1",
                      isLap ? "border-slate-100" : "border-white/10"
                    )}>
                       <span className={cn(
                         "text-[9px] font-black uppercase",
                         isLap ? "text-slate-400" : "text-white/40"
                       )}>Monthly Saving</span>
                       <span className="text-xs font-black text-parrot-green">+{formatCurrency(transferStats.savingsEMI)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'eligibility' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-2">
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.4em]",
                    isLap ? "text-slate-400" : "text-white/60"
                  )}>Max Probable Loan</p>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-parrot-green">{formatCurrency(eligibilityStats)}</h2>
                </div>
                <div className={cn(
                  "p-5 rounded-3xl border shadow-sm space-y-4",
                  isLap 
                    ? "bg-white border-slate-200" 
                    : "bg-white/5 border-white/10 backdrop-blur-sm"
                )}>
                  <p className={cn(
                    "text-xs italic",
                    isLap ? "text-slate-500" : "text-white/70"
                  )}>"Based on 60% FOIR (Fixed Obligation to Income Ratio) and 20 year tenure."</p>
                  <div className="flex items-center gap-2 text-parrot-green font-bold text-sm">
                    <UserCheck className="w-4 h-4" /> Good Probability Area
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'prepayment' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-2">
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.4em]",
                    isLap ? "text-slate-400" : "text-white/60"
                  )}>Total Interest Saved</p>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-parrot-green">{formatCurrency(prepaymentStats.interestSaved)}</h2>
                </div>
                <div className={cn(
                  "p-5 rounded-3xl border shadow-sm space-y-3",
                  isLap 
                    ? "bg-white border-slate-200" 
                    : "bg-white/5 border-white/10 backdrop-blur-sm"
                )}>
                  <div className="flex justify-between items-center">
                    <span className={cn(
                      "text-xs uppercase font-black",
                      isLap ? "text-slate-400" : "text-white/60"
                    )}>Time Saved</span>
                    <span className="text-sm font-black text-parrot-green">{Math.max(0, prepayTermYears * 12 - prepaymentStats.newTenureMonths)} Months</span>
                  </div>
                  <p className={cn(
                    "text-xs border-t pt-3",
                    isLap ? "text-slate-600 border-slate-100" : "text-white/80 border-white/10"
                  )}>
                    Making a prepayment of <strong>{formatCurrency(prepayAmount)}</strong> at the end of <strong>Year {prepayYear}</strong> could effectively reduce your interest liability.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'stepup' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {growthStats.failed ? (
                  <div className="p-5 bg-red-500/20 rounded-3xl border border-red-500/30">
                    <p className="text-sm font-bold">Calculation Failed</p>
                    <p className="text-xs opacity-70">The EMI growth strategy resulted in an unsustainable loan structure.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1 text-center">
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.4em]",
                        isLap ? "text-slate-400" : "text-white/60"
                      )}>Revised Loan Tenure</p>
                      <div className="flex flex-wrap items-baseline gap-2 justify-center">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-parrot-green">{growthStats.years}</h2>
                        <span className={cn(
                          "text-xs md:text-base font-bold",
                          isLap ? "text-slate-500 opacity-70" : "opacity-60"
                        )}>Years</span>
                        <h2 className="text-xl md:text-3xl font-black tracking-tighter ml-1 text-parrot-green">{growthStats.months}</h2>
                        <span className={cn(
                          "text-[10px] md:text-xs font-bold",
                          isLap ? "text-slate-500 opacity-70" : "opacity-60"
                        )}>Months</span>
                      </div>
                    </div>
                    <div className={cn(
                      "p-3.5 rounded-3xl border shadow-sm space-y-2",
                      isLap 
                        ? "bg-white border-slate-200" 
                        : "bg-white/5 border-white/10 backdrop-blur-sm"
                    )}>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className={isLap ? "text-slate-500" : "text-white/60"}>Current Installment</span>
                        <span className={cn("font-bold", isLap ? "text-slate-800" : "text-white")}>{formatCurrency(growthStats.initialEMI)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className={isLap ? "text-slate-500" : "text-white/60"}>Next Pre-pay Increase ({growthFrequency === 'annual' ? 'at Month 13' : 'at Month 2'})</span>
                        <span className={cn("font-bold", isLap ? "text-slate-800" : "text-white")}>{formatCurrency(growthStats.nextEMI)}</span>
                      </div>
                      <div className={cn(
                        "pt-2 border-t space-y-1",
                        isLap ? "border-slate-100" : "border-white/10"
                      )}>
                        <div className="flex justify-between items-center">
                          <span className={cn(
                            "text-[9px] uppercase font-black",
                            isLap ? "text-slate-500" : "text-white/60"
                          )}>Time Saved</span>
                          <span className="text-xs font-black text-parrot-green">{(growthTermYears * 12 - growthStats.totalMonths)} Months</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={cn(
                            "text-[9px] uppercase font-black",
                            isLap ? "text-slate-500" : "text-white/60"
                          )}>Total Interest Paid</span>
                          <span className={cn(
                            "text-xs font-black",
                            isLap ? "text-slate-800" : "text-white"
                          )}>{formatCurrency(growthStats.totalInterest)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>

          <div className={cn(
            "pt-3 flex flex-col gap-5",
            isLap ? "border-t border-slate-200" : "border-t border-white/10"
          )}>
            <div className="space-y-1">
              <p className={cn(
                "text-[9px] font-black uppercase tracking-[0.3em]",
                isLap ? "text-slate-400" : "text-white/40"
              )}>Principal & Tenure Forecast</p>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData.length > 0 ? reportData.filter((_, i) => i % (reportFrequency === 'monthly' ? 12 : 1) === 0) : []}>
                    <defs>
                      <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke={isLap ? "#cbd5e1" : "#ffffff"} strokeOpacity={0.1} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className={cn(
                              "border p-2 rounded-xl text-[9px] shadow-2xl backdrop-blur-md",
                              isLap ? "bg-white border-slate-200 text-slate-800" : "bg-parrot-navy border-white/10 text-white"
                            )}>
                              <p className={cn(
                                "font-black mb-1",
                                isLap ? "text-slate-400" : "text-white/50"
                              )}>{payload[0].payload.label}</p>
                              <p className="text-parrot-green font-bold">Bal: {formatCurrency(Number(payload[0].value))}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="remainingBalance" 
                      stroke="#22C55E" 
                      fillOpacity={1} 
                      fill="url(#colorBal)" 
                      strokeWidth={1.5}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className={cn(
                "text-[8px] text-center uppercase font-bold tracking-[0.2em] -mt-2",
                isLap ? "text-slate-400" : "text-white/20"
              )}>Hover over chart for detailed data</p>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: isLap ? '#1A2E4A' : '#ffffff', color: isLap ? '#ffffff' : '#1A2E4A' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsReportOpen(true)}
              className={cn(
                "w-full lg:w-[75%] mx-auto py-4 rounded-[18px] font-black uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all border shadow-lg mb-4 lg:mb-5 cursor-pointer shrink-0",
                isLap 
                  ? "bg-slate-100 hover:bg-slate-800 text-slate-800 hover:text-white border-slate-200" 
                  : "bg-white/5 hover:bg-white text-white hover:text-parrot-navy border-white/10"
              )}
            >
              Get report
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Detailed Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={() => setIsReportOpen(false)}
              className="absolute inset-0 bg-parrot-navy/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col border border-slate-100"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black text-parrot-navy tracking-tight italic">Loan Analysis Report.</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Generated by ParrotMoney AI Engines</p>
                </div>
                <button 
                  onClick={() => setIsReportOpen(false)}
                  className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-parrot-navy shadow-sm"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {reportSummary.map((item, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                      <div className="p-2 bg-white rounded-xl w-fit text-parrot-green shadow-sm"><item.icon className="w-4 h-4" /></div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-xl font-black text-parrot-navy italic">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Amortization Table & Chart */}
                <div className="space-y-8">
                  <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                    <h3 className="text-lg font-black italic text-parrot-navy mb-6">Balance Visualizer</h3>
                    <div className="h-84">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData} margin={{ top: 20, right: 30, left: 60, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000000" strokeOpacity={0.1} />
                          <XAxis 
                            dataKey="period" 
                            fontSize={11} 
                            tick={{ fill: '#000000', fontWeight: 'bold' }}
                            axisLine={false} 
                            tickLine={false} 
                            label={{ value: reportFrequency === 'yearly' ? 'Years' : 'Months', position: 'bottom', offset: 20, fontSize: 11, fontWeight: 'black', fill: '#1A2E4A', textAnchor: 'middle' }}
                          />
                          <YAxis 
                            fontSize={11} 
                            tick={{ fill: '#000000', fontWeight: 'bold' }}
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(v) => v >= 10000000 ? `${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v/100000).toFixed(1)}L` : v}
                            label={{ value: 'Amount (₹)', angle: -90, position: 'left', offset: 45, fontSize: 11, fontWeight: 'black', fill: '#1A2E4A', textAnchor: 'middle' }}
                          />
                          <Tooltip 
                            formatter={(v) => formatCurrency(Number(v))} 
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px' }} 
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          />
                          <Legend verticalAlign="top" align="center" height={48} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1A2E4A', paddingBottom: '20px' }} />
                          <Bar dataKey="remainingBalance" fill="#1A2E4A" radius={[8, 8, 0, 0]} name="Principal Balance" barSize={32} />
                          <Bar dataKey="interest" fill="#22C55E" radius={[8, 8, 0, 0]} name="Interest Component" barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-black italic text-parrot-navy flex items-center gap-2">
                       <TableProperties className="w-5 h-5 text-parrot-green" /> Detailed Schedule
                    </h3>
                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                      {(['yearly', 'monthly'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setReportFrequency(f)}
                          className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            reportFrequency === f ? "bg-parrot-navy text-white shadow-lg" : "text-slate-400 hover:text-parrot-navy"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Period</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Installment</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Principal</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Interest</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-600">
                        {reportData.map((row) => (
                          <tr key={row.period} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4 font-black text-parrot-navy italic">{row.label}</td>
                            <td className="px-6 py-4">{formatCurrency(row.payment)}</td>
                            <td className="px-6 py-4 text-parrot-green">+{formatCurrency(row.principal)}</td>
                            <td className="px-6 py-4 text-orange-500">-{formatCurrency(row.interest)}</td>
                            <td className="px-6 py-4 font-black text-parrot-navy">{formatCurrency(row.remainingBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                </div>
                </div>

                {/* AI Advice */}
                <div className="p-8 bg-parrot-navy text-white rounded-[32px] shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-12" />
                   <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-parrot-green" />
                        <h4 className="font-black italic uppercase tracking-widest text-[10px]">ParrotMoney Strategy Note</h4>
                      </div>
                      <p className="text-sm leading-relaxed opacity-80 font-medium">
                        Based on your profile, we recommend a <b className="text-parrot-green italic">Hybrid Rate Model</b>. Your LTV (Loan to Value) ratio is 
                        <b> {activeTab === 'emi' ? Math.round((emiStats.loanAmount / emiHomePrice) * 100) : 'N/A'}%</b>. Keeping this below 80% ensures you get 
                        the most competitive rates in the current Indian market (RBI Repo Rate sensitive).
                      </p>
                   </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Ready to take the next step?</p>
                  <p className="text-sm text-parrot-navy font-bold italic">Transform this calculation into a formal application.</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => setIsReportOpen(false)}
                    className="flex-1 sm:flex-none px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
                  >
                    Close
                  </button>
                    <button 
                      onClick={() => {
                        if (onApply) onApply({ homePrice: emiHomePrice, downPayment: 0, interestRate: emiInterestRate, termYears: emiStats.termInYears });
                        setIsReportOpen(false);
                      }}
                      className="flex-1 sm:flex-none px-8 py-4 bg-parrot-green text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 hover:bg-parrot-green/90 transition-all shadow-xl shadow-parrot-green/20 flex items-center justify-center gap-2"
                    >
                      Start Formal App <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
