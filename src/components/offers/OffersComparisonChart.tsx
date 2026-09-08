import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  IndianRupee, 
  TrendingDown, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { calculateMonthlyPayment, formatCurrency, cn } from '../../lib/utils';

export interface BankOffer {
  name: string;
  rate: string | number;
  features?: string[];
  processingTime?: string;
  rating?: number;
  avgRating?: number;
  score?: number;
  finalScore?: number;
  totalRatings?: number;
}

interface OffersComparisonChartProps {
  selectedBanks: BankOffer[];
  defaultLoanAmount?: number;
  defaultTenureYears?: number;
  onSelectBank?: (bank: BankOffer) => void;
  onClearSelection?: () => void;
}

export const OffersComparisonChart: React.FC<OffersComparisonChartProps> = ({
  selectedBanks,
  defaultLoanAmount = 4500000,
  defaultTenureYears = 20,
  onSelectBank,
  onClearSelection
}) => {
  const [loanAmount, setLoanAmount] = useState<number>(defaultLoanAmount);
  const [tenureYears, setTenureYears] = useState<number>(defaultTenureYears);
  const [chartMetric, setChartMetric] = useState<'total_interest' | 'total_payable' | 'savings'>('total_interest');

  // Colors for visual distinction
  const bankColors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Parse rates and compute detailed metrics for each offer
  const comparisonData = useMemo(() => {
    if (!selectedBanks || selectedBanks.length === 0) return [];

    const parsedOffers = selectedBanks.map((bank, index) => {
      const rateNum = typeof bank.rate === 'number' 
        ? bank.rate 
        : parseFloat(String(bank.rate).replace('%', '')) || 8.5;
      
      const emi = calculateMonthlyPayment(loanAmount, rateNum, tenureYears);
      const totalMonths = tenureYears * 12;
      const totalPayable = emi * totalMonths;
      const totalInterest = Math.max(0, totalPayable - loanAmount);

      return {
        bank,
        name: bank.name,
        rateNum,
        rateStr: `${rateNum.toFixed(2)}%`,
        emi: Math.round(emi),
        totalPayable: Math.round(totalPayable),
        totalInterest: Math.round(totalInterest),
        color: bankColors[index % bankColors.length],
        processingTime: bank.processingTime || '7-10 Days',
        score: bank.finalScore || bank.score || 90
      };
    });

    // Find the highest interest offer to calculate savings relative to the maximum cost
    const maxInterest = Math.max(...parsedOffers.map(o => o.totalInterest));
    const minInterest = Math.min(...parsedOffers.map(o => o.totalInterest));

    return parsedOffers.map(offer => ({
      ...offer,
      interestSavingsVsHighest: Math.max(0, maxInterest - offer.totalInterest),
      isBestOffer: offer.totalInterest === minInterest
    }));
  }, [selectedBanks, loanAmount, tenureYears]);

  // Summary statistics
  const bestOffer = useMemo(() => {
    if (comparisonData.length === 0) return null;
    return comparisonData.reduce((prev, curr) => (curr.totalInterest < prev.totalInterest ? curr : prev), comparisonData[0]);
  }, [comparisonData]);

  const maxSavings = useMemo(() => {
    if (comparisonData.length < 2) return 0;
    const highest = Math.max(...comparisonData.map(d => d.totalInterest));
    const lowest = Math.min(...comparisonData.map(d => d.totalInterest));
    return Math.max(0, highest - lowest);
  }, [comparisonData]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return comparisonData.map(item => ({
      name: item.name,
      rate: item.rateNum,
      emi: item.emi,
      interestInLakhs: Number((item.totalInterest / 100000).toFixed(2)),
      principalInLakhs: Number((loanAmount / 100000).toFixed(2)),
      payableInLakhs: Number((item.totalPayable / 100000).toFixed(2)),
      savingsInLakhs: Number((item.interestSavingsVsHighest / 100000).toFixed(2)),
      totalInterest: item.totalInterest,
      totalPayable: item.totalPayable,
      savings: item.interestSavingsVsHighest,
      isBestOffer: item.isBestOffer,
      color: item.color
    }));
  }, [comparisonData, loanAmount]);

  if (!selectedBanks || selectedBanks.length < 2) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <Scale className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-natural-sage">Select 2 or More Offers to Compare Interest Savings</h4>
        <p className="text-xs text-natural-muted max-w-md mx-auto">
          Click the "Add to Compare" button on any 2+ bank offer cards above to see an interactive interest cost and full-tenure savings chart.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-natural-border shadow-xl p-6 md:p-8 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-natural-border/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Full Tenure Savings Analysis
            </span>
            <span className="text-[10px] font-bold text-natural-muted">
              Comparing {selectedBanks.length} Lender Offers
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-natural-sage tracking-tight italic mt-1">
            Interest Savings & Rate Comparison
          </h3>
          <p className="text-xs md:text-sm text-natural-muted font-medium mt-0.5">
            Visualize how minor differences in ROI compound into massive interest savings over your full loan tenure.
          </p>
        </div>

        {onClearSelection && (
          <button
            onClick={onClearSelection}
            className="self-start md:self-auto px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            Clear Comparison ({selectedBanks.length})
          </button>
        )}
      </div>

      {/* Highlights Banner if there are savings */}
      {maxSavings > 0 && bestOffer && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-6 shadow-lg shadow-emerald-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">
                Maximum Tenure Savings
              </span>
              <span className="text-xs text-emerald-100 font-bold">
                Over {tenureYears} Years ({tenureYears * 12} Installments)
              </span>
            </div>
            <h4 className="text-2xl md:text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
              <span>Save up to {formatCurrency(maxSavings)}</span>
            </h4>
            <p className="text-xs text-emerald-100/90 font-medium max-w-xl">
              By choosing <strong>{bestOffer.name}</strong> ({bestOffer.rateStr} ROI) instead of higher-cost alternatives, your monthly EMI drops to <strong>₹{bestOffer.emi.toLocaleString('en-IN')}/mo</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onSelectBank && (
              <button
                onClick={() => onSelectBank(bestOffer.bank)}
                className="px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border-none"
              >
                <span>Select {bestOffer.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Simulation Sliders */}
      <div className="bg-natural-bg/40 rounded-3xl p-5 md:p-6 border border-natural-border/60 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-natural-sage flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" /> Adjust Loan Parameters for Comparison
          </span>
          <span className="text-[11px] font-bold text-natural-muted">
            Updates EMI & Charts in Real-Time
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Loan Amount Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-natural-muted">Loan Amount:</span>
              <span className="font-black text-natural-sage text-sm bg-white px-3 py-1 rounded-xl border border-natural-border shadow-xs">
                ₹{loanAmount.toLocaleString('en-IN')} ({Number((loanAmount / 100000).toFixed(1))} Lakhs)
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
            <div className="flex justify-between text-[10px] text-natural-muted font-bold">
              <span>₹10 Lakhs</span>
              <span>₹1 Crore</span>
              <span>₹2 Crores</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-natural-muted">Loan Tenure:</span>
              <span className="font-black text-natural-sage text-sm bg-white px-3 py-1 rounded-xl border border-natural-border shadow-xs">
                {tenureYears} Years ({tenureYears * 12} Months)
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-natural-muted font-bold">
              <span>5 Years</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-black text-natural-sage">
              Interactive Interest & Cost Breakdown Chart
            </h4>
            <p className="text-xs text-natural-muted">
              Amounts displayed in Lakhs (₹ in 100,000s) for precision across selected offers.
            </p>
          </div>

          {/* Chart View Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-natural-bg rounded-xl border border-natural-border/60 self-start sm:self-auto">
            <button
              onClick={() => setChartMetric('total_interest')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                chartMetric === 'total_interest'
                  ? "bg-white text-natural-sage shadow-xs border border-natural-border"
                  : "text-natural-muted hover:text-natural-sage"
              )}
            >
              Total Interest
            </button>
            <button
              onClick={() => setChartMetric('total_payable')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                chartMetric === 'total_payable'
                  ? "bg-white text-natural-sage shadow-xs border border-natural-border"
                  : "text-natural-muted hover:text-natural-sage"
              )}
            >
              Principal vs Interest
            </button>
            <button
              onClick={() => setChartMetric('savings')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                chartMetric === 'savings'
                  ? "bg-white text-natural-sage shadow-xs border border-natural-border"
                  : "text-natural-muted hover:text-natural-sage"
              )}
            >
              Direct Interest Savings
            </button>
          </div>
        </div>

        {/* Recharts Responsive Container */}
        <div className="h-80 w-full pt-4 bg-slate-50/50 rounded-3xl p-4 border border-natural-border/50">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'total_interest' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} 
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 11 }} 
                  unit="L" 
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `₹${(Number(value) * 100000).toLocaleString('en-IN')}`, 
                    'Total Interest Cost'
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    color: '#F8FAFC', 
                    borderRadius: '16px', 
                    border: 'none', 
                    fontSize: '12px', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' 
                  }}
                  labelStyle={{ fontWeight: 800, color: '#38BDF8', marginBottom: '4px' }}
                />
                <Legend />
                <Bar dataKey="interestInLakhs" name="Total Interest Payable (₹ Lakhs)" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isBestOffer ? '#10B981' : '#64748B'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : chartMetric === 'total_payable' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} 
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 11 }} 
                  unit="L" 
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `₹${(Number(value) * 100000).toLocaleString('en-IN')}`, 
                    name === 'principalInLakhs' ? 'Principal Loan' : 'Interest Paid'
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    color: '#F8FAFC', 
                    borderRadius: '16px', 
                    border: 'none', 
                    fontSize: '12px', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' 
                  }}
                  labelStyle={{ fontWeight: 800, color: '#38BDF8', marginBottom: '4px' }}
                />
                <Legend />
                <Bar dataKey="principalInLakhs" name="Principal Amount (₹ Lakhs)" stackId="a" fill="#1E293B" />
                <Bar dataKey="interestInLakhs" name="Total Interest (₹ Lakhs)" stackId="a" fill="#10B981" radius={[10, 10, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} 
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 11 }} 
                  unit="L" 
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip 
                  formatter={(value: any) => [
                    `₹${(Number(value) * 100000).toLocaleString('en-IN')}`, 
                    'Net Savings vs High-Cost Offer'
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    color: '#F8FAFC', 
                    borderRadius: '16px', 
                    border: 'none', 
                    fontSize: '12px', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' 
                  }}
                  labelStyle={{ fontWeight: 800, color: '#38BDF8', marginBottom: '4px' }}
                />
                <Legend />
                <Bar dataKey="savingsInLakhs" name="Net Interest Savings (₹ Lakhs)" fill="#059669" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.savingsInLakhs > 0 ? '#10B981' : '#94A3B8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Offer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {comparisonData.map((item) => (
          <div
            key={item.name}
            className={cn(
              "rounded-3xl p-5 border transition-all relative flex flex-col justify-between space-y-4",
              item.isBestOffer
                ? "bg-emerald-50/40 border-emerald-400 shadow-md ring-2 ring-emerald-500/20"
                : "bg-white border-natural-border/70 hover:border-natural-border shadow-xs"
            )}
          >
            {item.isBestOffer && (
              <div className="absolute -top-3 right-4 px-3 py-0.5 bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
                <Award className="w-3 h-3" /> Lowest Cost Choice
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-natural-sage tracking-tight">{item.name}</h4>
                  <span className="text-[10px] font-bold text-natural-muted">TAT: {item.processingTime}</span>
                </div>
                <span className="px-2.5 py-1 bg-white border border-natural-border font-black text-xs text-natural-sage rounded-xl">
                  {item.rateStr} ROI
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-natural-border/40 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-natural-border/40">
                  <span className="text-[9px] font-bold text-natural-muted uppercase block">Monthly EMI</span>
                  <span className="text-sm font-black text-natural-sage">₹{item.emi.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-natural-border/40">
                  <span className="text-[9px] font-bold text-natural-muted uppercase block">Total Interest</span>
                  <span className="text-sm font-black text-emerald-700">₹{item.totalInterest.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {item.interestSavingsVsHighest > 0 ? (
                <div className="p-2.5 bg-emerald-100/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">You Save:</span>
                  <span className="font-black text-emerald-900">+{formatCurrency(item.interestSavingsVsHighest)}</span>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-100/70 rounded-xl border border-slate-200 text-xs text-slate-600 font-bold flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Baseline Offer:</span>
                  <span className="text-slate-700">Highest Interest Rate</span>
                </div>
              )}
            </div>

            {onSelectBank && (
              <button
                onClick={() => onSelectBank(item.bank)}
                className={cn(
                  "w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none",
                  item.isBestOffer
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    : "bg-natural-bg hover:bg-natural-border text-natural-sage"
                )}
              >
                <span>Select {item.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
