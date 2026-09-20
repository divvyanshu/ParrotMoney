import React, { useState } from 'react';
import { 
  Brain, 
  ShieldCheck, 
  Calculator, 
  SlidersHorizontal, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Scale, 
  Building,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AlgorithmParams } from '../../types';

interface AlgorithmHowItWorksProps {
  currentParams?: AlgorithmParams;
  onOpenSimulator?: () => void;
}

export const AlgorithmHowItWorks: React.FC<AlgorithmHowItWorksProps> = ({ 
  currentParams,
  onOpenSimulator 
}) => {
  const [activeView, setActiveView] = useState<'pipeline' | 'formulas' | 'regulations' | 'matrix'>('pipeline');

  const defaultParams: AlgorithmParams = currentParams || {
    cibilThreshold: 700,
    cibilPenalty: 20,
    maxAgeLimit: 65,
    agePenalty: 4,
    maxLtvRatio: 90,
    maxFoirRatio: 50,
    coBorrowerMultiplier: 1.45,
    salaryMatchBonus: 15
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 md:p-8 rounded-[2rem] border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono uppercase font-bold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                Underwriting Architecture
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                ParrotScore™ v2.4
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              How the Credit Decision Engine Works
            </h3>
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
              Transparent 5-stage algorithmic pipeline evaluating borrower capacity, collateral safety, bureau risk deductions, and institutional bank matching in milliseconds.
            </p>
          </div>

          {onOpenSimulator && (
            <button
              type="button"
              onClick={onOpenSimulator}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer border-none shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Test in Applicant Simulator
            </button>
          )}
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Active CIBIL Floor</span>
            <span className="text-white font-bold text-base">{defaultParams.cibilThreshold} pts</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Max Debt-to-Income (FOIR)</span>
            <span className="text-white font-bold text-base">{defaultParams.maxFoirRatio}% Cap</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Max Loan-to-Value (LTV)</span>
            <span className="text-white font-bold text-base">{defaultParams.maxLtvRatio}% Limit</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Co-borrower Lift</span>
            <span className="text-emerald-400 font-bold text-base">{defaultParams.coBorrowerMultiplier}x Boost</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 border border-slate-200 overflow-x-auto">
        {[
          { id: 'pipeline', label: '1. 5-Stage Decision Pipeline', icon: Layers },
          { id: 'formulas', label: '2. Mathematical Formulas & Logic', icon: Calculator },
          { id: 'matrix', label: '3. ParrotScore™ Weight Matrix', icon: Scale },
          { id: 'regulations', label: '4. RBI Compliance & Lending Rules', icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveView(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-none ${
              activeView === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 5-Stage Decision Pipeline */}
      {activeView === 'pipeline' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Knockout Gates',
                badge: 'Stage 1',
                color: 'from-amber-500/10 to-amber-500/5 text-amber-700 border-amber-200',
                desc: 'Hard filter verifying age (min 21y), Indian residency, clean willful-default record, and baseline CIBIL minimum.',
                checks: ['Age >= 21 Years', 'No Active Legal Default', 'Valid KYC Documents']
              },
              {
                step: '02',
                title: 'Capacity & FOIR',
                badge: 'Stage 2',
                color: 'from-blue-500/10 to-blue-500/5 text-blue-700 border-blue-200',
                desc: `Evaluates debt obligations against monthly income. Total EMIs cannot exceed active FOIR limit (${defaultParams.maxFoirRatio}%).`,
                checks: [`FOIR <= ${defaultParams.maxFoirRatio}%`, 'Net Disposable Income', 'Co-borrower Additive']
              },
              {
                step: '03',
                title: 'Collateral & LTV',
                badge: 'Stage 3',
                color: 'from-indigo-500/10 to-indigo-500/5 text-indigo-700 border-indigo-200',
                desc: `Tests property market valuation vs requested loan. Cannot exceed active LTV cap (${defaultParams.maxLtvRatio}%).`,
                checks: [`LTV <= ${defaultParams.maxLtvRatio}%`, 'RBI Tier Slabs', 'Down Payment Cushion']
              },
              {
                step: '04',
                title: 'Scoring & Boosts',
                badge: 'Stage 4',
                color: 'from-purple-500/10 to-purple-500/5 text-purple-700 border-purple-200',
                desc: `Applies bureau deductions if CIBIL < ${defaultParams.cibilThreshold} (-${defaultParams.cibilPenalty}pts) & adds salary banking bonus (+${defaultParams.salaryMatchBonus}pts).`,
                checks: ['CIBIL Gradient Check', 'Age+Tenure Penalty', 'Bank Affinity Lift']
              },
              {
                step: '05',
                title: 'Verdict & Routing',
                badge: 'Stage 5',
                color: 'from-emerald-500/10 to-emerald-500/5 text-emerald-700 border-emerald-200',
                desc: 'Outputs final ParrotScore™ (0-100), Auto-Approval / Conditional status, and routes to matched lender feeds.',
                checks: ['Score >= 75: Approved', '55-74: Manual Review', '< 55: High Risk']
              },
            ].map((st, i) => (
              <div 
                key={i}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3 relative hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-black text-slate-300 font-mono">{st.step}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${st.color}`}>
                      {st.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{st.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                    {st.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-1">
                  {st.checks.map((c, ci) => (
                    <div key={ci} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Decision Verdict Table */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              Underwriting Outcome Matrix
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <th className="p-3.5">ParrotScore™</th>
                    <th className="p-3.5">Verdict</th>
                    <th className="p-3.5">Underwriting Action</th>
                    <th className="p-3.5">Typical Interest Rate Tier</th>
                    <th className="p-3.5">Turnaround Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-emerald-50/40">
                    <td className="p-3.5 font-mono font-bold text-emerald-700 text-sm">75 – 100</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px] uppercase">
                        Instant Approval
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      Direct digital sanction. Pre-approved offers routed directly to bank credit manager.
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">Lowest (8.35% – 8.65%)</td>
                    <td className="p-3.5 font-mono text-slate-600">24 – 48 Hours</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-3.5 font-mono font-bold text-amber-700 text-sm">55 – 74</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold text-[10px] uppercase">
                        Conditional / Review
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      Requires RM review or co-borrower addition. May require partial debt prepayment or property valuation verification.
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">Standard (8.70% – 9.25%)</td>
                    <td className="p-3.5 font-mono text-slate-600">3 – 5 Days</td>
                  </tr>
                  <tr className="hover:bg-rose-50/40">
                    <td className="p-3.5 font-mono font-bold text-rose-700 text-sm">0 – 54</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg font-bold text-[10px] uppercase">
                        High Risk / Decline
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      Exceeds FOIR limit or severe bureau penalty. Guided into credit repair & non-banking NBFC housing pool.
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">Elevated (9.50%+)</td>
                    <td className="p-3.5 font-mono text-slate-600">Credit Counseling Required</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Mathematical Formulas & Logic */}
      {activeView === 'formulas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formula 1: FOIR */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">1. Fixed Obligation to Income Ratio (FOIR)</h4>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                Cap: {defaultParams.maxFoirRatio}%
              </span>
            </div>
            <div className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
              <code>FOIR (%) = ((Total Existing EMIs + Proposed Loan EMI) / Total Net Income) × 100</code>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an applicant earns ₹1,00,000 net monthly and has existing EMIs of ₹15,000, their new proposed loan EMI cannot exceed 
              ₹{(100000 * (defaultParams.maxFoirRatio / 100) - 15000).toLocaleString('en-IN')}/month under the {defaultParams.maxFoirRatio}% limit.
            </p>
            <div className="text-[11px] bg-slate-50 p-2.5 rounded-lg text-slate-700 font-mono">
              <strong>Co-borrower effect:</strong> Total Net Income = Primary Income + (Co-borrower Income × {defaultParams.coBorrowerMultiplier})
            </div>
          </div>

          {/* Formula 2: LTV */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">2. Loan to Value Ratio (LTV)</h4>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                Cap: {defaultParams.maxLtvRatio}%
              </span>
            </div>
            <div className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
              <code>LTV (%) = (Sanctioned Loan Amount / Registered Property Value) × 100</code>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Governed by RBI master circular ceilings. For a property valued at ₹1 Crore, the maximum possible funding under a {defaultParams.maxLtvRatio}% ceiling is ₹{(10000000 * (defaultParams.maxLtvRatio / 100)).toLocaleString('en-IN')}.
            </p>
            <div className="text-[11px] bg-slate-50 p-2.5 rounded-lg text-slate-700 font-mono">
              <strong>Borrower Contribution:</strong> Must provide at least {100 - defaultParams.maxLtvRatio}% as upfront down payment / equity.
            </div>
          </div>

          {/* Formula 3: CIBIL Penalty */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">3. Bureau Score Deduction Model</h4>
              <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                Floor: {defaultParams.cibilThreshold} pts
              </span>
            </div>
            <div className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
              <code>if (CIBIL &lt; {defaultParams.cibilThreshold}) Deduction = {defaultParams.cibilPenalty} × ((Threshold - CIBIL) / 100)</code>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applicants meeting or exceeding {defaultParams.cibilThreshold} receive zero penalty and max credit points. Each 50-point drop below threshold incurs proportional risk deductions and lender interest spread markups.
            </p>
          </div>

          {/* Formula 4: Age & Tenure Cap */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">4. Age + Tenure Retirement Boundary</h4>
              <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                Limit: {defaultParams.maxAgeLimit} Yrs
              </span>
            </div>
            <div className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
              <code>Excess = Max(0, (Applicant Age + Desired Loan Tenure) - {defaultParams.maxAgeLimit})</code>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an applicant is 48 years old requesting a 20-year loan (Total = 68 years), they exceed the {defaultParams.maxAgeLimit}-year limit by 3 years, incurring a -{3 * defaultParams.agePenalty} pt deduction unless a younger co-applicant joins.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: ParrotScore™ Weight Matrix */}
      {activeView === 'matrix' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">ParrotScore™ Factor Weighting (Total: 100%)</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Relative contribution of each underwriting dimension to the match probability score.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              Deterministic + Rule-Calibrated
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                category: 'Credit Bureau & Repayment History',
                weight: 35,
                color: 'bg-emerald-500',
                factors: 'CIBIL score gradient, past default recency, unsecured debt ratio, credit inquiry frequency.',
              },
              {
                category: 'Income Stability & FOIR Cushion',
                weight: 30,
                color: 'bg-blue-500',
                factors: 'Net monthly salary/profit, debt-to-income margin, employment category (MNC/Govt vs Private/Proprietorship).',
              },
              {
                category: 'Collateral Security & LTV Cushion',
                weight: 20,
                color: 'bg-indigo-500',
                factors: 'Loan-to-value ratio, property location tier, clear legal title status, down payment size.',
              },
              {
                category: 'Banking Relationship & Profile Boosters',
                weight: 15,
                color: 'bg-purple-500',
                factors: `Salary account affinity (+${defaultParams.salaryMatchBonus} bonus), co-borrower financial strength (+${defaultParams.coBorrowerMultiplier}x), age buffer.`,
              },
            ].map((dim, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{dim.category}</span>
                  <span className="font-mono font-black text-slate-900">{dim.weight}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`${dim.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${dim.weight}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  {dim.factors}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RBI Compliance & Lending Rules */}
      {activeView === 'regulations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="text-sm font-bold text-slate-900">RBI Master LTV Ceilings</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under RBI/2014-15/121:
            </p>
            <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4 font-mono text-[11px]">
              <li>Loans &lt;= ₹30 Lakhs: Max 90% LTV</li>
              <li>Loans ₹30L to ₹75L: Max 80% LTV</li>
              <li>Loans &gt; ₹75 Lakhs: Max 75% LTV</li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="text-sm font-bold text-slate-900">Zero Prepayment Penalties</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under RBI circular RBI/2023-24/53, no scheduled commercial bank or housing finance company (HFC) can levy foreclosure charges or prepayment penalties on floating rate loans to individual borrowers.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="text-sm font-bold text-slate-900">External Benchmark (EBLR)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              All floating rate home loans must be pegged directly to an external benchmark (primarily the RBI Repo Rate at 6.50%) with a transparent fixed spread that resets automatically quarterly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
