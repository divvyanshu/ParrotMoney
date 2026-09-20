import React, { useState, useMemo } from 'react';
import { 
  FlaskConical, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  IndianRupee, 
  Sliders, 
  TrendingUp, 
  Sparkles, 
  RotateCcw,
  Building,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { AlgorithmParams } from '../../types';

interface ApplicantSimulatorProps {
  algorithmParams: AlgorithmParams;
}

interface ApplicantProfile {
  name: string;
  personaTitle: string;
  monthlyIncome: number;
  existingEmis: number;
  propertyValue: number;
  loanAmount: number;
  tenureYears: number;
  age: number;
  cibilScore: number;
  hasCoBorrower: boolean;
  coBorrowerIncome: number;
  hasSalaryAccount: boolean;
}

const PRESET_PERSONAS: ApplicantProfile[] = [
  {
    name: 'Arjun Sharma',
    personaTitle: 'Prime Salaried IT Lead',
    monthlyIncome: 180000,
    existingEmis: 15000,
    propertyValue: 9000000,
    loanAmount: 6500000,
    tenureYears: 20,
    age: 31,
    cibilScore: 795,
    hasCoBorrower: false,
    coBorrowerIncome: 0,
    hasSalaryAccount: true,
  },
  {
    name: 'Vikram & Neha',
    personaTitle: 'Dual Income Tech Couple (Joint)',
    monthlyIncome: 125000,
    existingEmis: 20000,
    propertyValue: 14000000,
    loanAmount: 9500000,
    tenureYears: 25,
    age: 29,
    cibilScore: 760,
    hasCoBorrower: true,
    coBorrowerIncome: 95000,
    hasSalaryAccount: true,
  },
  {
    name: 'Rajesh Gupta',
    personaTitle: 'Self-Employed SME Retailer',
    monthlyIncome: 150000,
    existingEmis: 42000,
    propertyValue: 7500000,
    loanAmount: 5000000,
    tenureYears: 15,
    age: 46,
    cibilScore: 715,
    hasCoBorrower: false,
    coBorrowerIncome: 0,
    hasSalaryAccount: false,
  },
  {
    name: 'Suresh Nair',
    personaTitle: 'Subprime / Credit Builder',
    monthlyIncome: 75000,
    existingEmis: 25000,
    propertyValue: 4500000,
    loanAmount: 3600000,
    tenureYears: 20,
    age: 35,
    cibilScore: 645,
    hasCoBorrower: false,
    coBorrowerIncome: 0,
    hasSalaryAccount: false,
  },
  {
    name: 'Deepak Varma',
    personaTitle: 'Senior Overleveraged Profile',
    monthlyIncome: 110000,
    existingEmis: 62000,
    propertyValue: 6000000,
    loanAmount: 4800000,
    tenureYears: 20,
    age: 52,
    cibilScore: 730,
    hasCoBorrower: false,
    coBorrowerIncome: 0,
    hasSalaryAccount: true,
  }
];

export const ApplicantSimulator: React.FC<ApplicantSimulatorProps> = ({ algorithmParams }) => {
  const [profile, setProfile] = useState<ApplicantProfile>(PRESET_PERSONAS[0]);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  // Formatting helpers
  const formatRupees = (amt: number) => {
    if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(2)} Cr`;
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(2)} L`;
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setProfile(PRESET_PERSONAS[index]);
  };

  // Underwriting calculation engine against active algorithmParams
  const simulationResults = useMemo(() => {
    // 1. Effective Monthly Income with Co-borrower lift
    const coBorrowerEffectiveIncome = profile.hasCoBorrower 
      ? profile.coBorrowerIncome * algorithmParams.coBorrowerMultiplier 
      : 0;
    const totalEffectiveIncome = profile.monthlyIncome + coBorrowerEffectiveIncome;

    // 2. Loan EMI calculation (at benchmark 8.50% p.a.)
    const monthlyRate = 8.50 / 12 / 100;
    const numMonths = profile.tenureYears * 12;
    const proposedEmi = Math.round(
      (profile.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numMonths)) /
      (Math.pow(1 + monthlyRate, numMonths) - 1)
    );

    // 3. FOIR (Fixed Obligation to Income Ratio)
    const totalObligations = profile.existingEmis + proposedEmi;
    const calculatedFoir = totalEffectiveIncome > 0 
      ? Math.round((totalObligations / totalEffectiveIncome) * 100) 
      : 100;
    const isFoirPassed = calculatedFoir <= algorithmParams.maxFoirRatio;

    // 4. LTV (Loan to Value)
    const calculatedLtv = profile.propertyValue > 0 
      ? Math.round((profile.loanAmount / profile.propertyValue) * 100) 
      : 100;
    const isLtvPassed = calculatedLtv <= algorithmParams.maxLtvRatio;

    // 5. CIBIL score checks & deductions
    const isCibilPassed = profile.cibilScore >= algorithmParams.cibilThreshold;
    const cibilShortfall = Math.max(0, algorithmParams.cibilThreshold - profile.cibilScore);
    const cibilPenaltyDeduction = cibilShortfall > 0 
      ? Math.round((cibilShortfall / 50) * algorithmParams.cibilPenalty) 
      : 0;

    // 6. Age + Tenure Retirement Boundary check
    const ageAtMaturity = profile.age + profile.tenureYears;
    const excessYears = Math.max(0, ageAtMaturity - algorithmParams.maxAgeLimit);
    const agePenaltyDeduction = excessYears * algorithmParams.agePenalty;

    // 7. Salary Account bonus points
    const salaryBonus = profile.hasSalaryAccount ? algorithmParams.salaryMatchBonus : 0;

    // 8. Composite ParrotScore™ computation
    let score = 80; // Baseline healthy score
    // FOIR adjustment
    if (calculatedFoir < 35) score += 10;
    else if (calculatedFoir <= algorithmParams.maxFoirRatio) score += 4;
    else score -= Math.min(30, (calculatedFoir - algorithmParams.maxFoirRatio) * 2);

    // LTV adjustment
    if (calculatedLtv <= 70) score += 8;
    else if (calculatedLtv > algorithmParams.maxLtvRatio) score -= 15;

    // Apply CIBIL penalties
    score -= cibilPenaltyDeduction;

    // Apply Age penalties
    score -= agePenaltyDeduction;

    // Add Salary Bonus
    score += salaryBonus;

    // Clamp score
    const finalScore = Math.max(20, Math.min(98, score));

    // 9. Final Underwriting Verdict
    let verdict: 'APPROVED' | 'CONDITIONAL' | 'DECLINED';
    let verdictReason = '';

    if (!isLtvPassed) {
      verdict = 'DECLINED';
      verdictReason = `LTV of ${calculatedLtv}% exceeds maximum ceiling of ${algorithmParams.maxLtvRatio}%. Increase down payment.`;
    } else if (calculatedFoir > algorithmParams.maxFoirRatio + 10) {
      verdict = 'DECLINED';
      verdictReason = `FOIR of ${calculatedFoir}% severely exceeds active limit of ${algorithmParams.maxFoirRatio}%. Heavy debt burden.`;
    } else if (finalScore >= 75 && isFoirPassed && isLtvPassed && isCibilPassed) {
      verdict = 'APPROVED';
      verdictReason = `Prime candidate. Strong credit bureau score (${profile.cibilScore}) and safe FOIR (${calculatedFoir}%). Auto-sanction qualified.`;
    } else if (finalScore >= 55) {
      verdict = 'CONDITIONAL';
      verdictReason = `Marginal risk profile. Subject to manual underwriter inspection or co-borrower addition.`;
    } else {
      verdict = 'DECLINED';
      verdictReason = `High risk profile. Sub-threshold CIBIL score and overextended debt obligations.`;
    }

    // 10. Maximum Eligible Loan Capacity
    const maxPermittedEmi = Math.max(0, (totalEffectiveIncome * (algorithmParams.maxFoirRatio / 100)) - profile.existingEmis);
    const maxLoanByFoir = Math.round(
      (maxPermittedEmi * (Math.pow(1 + monthlyRate, numMonths) - 1)) /
      (monthlyRate * Math.pow(1 + monthlyRate, numMonths))
    );
    const maxLoanByLtv = Math.round(profile.propertyValue * (algorithmParams.maxLtvRatio / 100));
    const maxEligibleLoan = Math.max(0, Math.min(maxLoanByFoir, maxLoanByLtv));

    return {
      proposedEmi,
      totalEffectiveIncome,
      calculatedFoir,
      isFoirPassed,
      calculatedLtv,
      isLtvPassed,
      isCibilPassed,
      cibilPenaltyDeduction,
      ageAtMaturity,
      excessYears,
      agePenaltyDeduction,
      salaryBonus,
      finalScore,
      verdict,
      verdictReason,
      maxEligibleLoan
    };
  }, [profile, algorithmParams]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header and Persona Switcher */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Live Applicant Underwriting Simulator</h3>
              <p className="text-xs text-slate-500 font-medium">
                Stress-test borrower profiles against active algorithmic rules & policy parameters in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Rules in effect:</span>
            <span className="px-2 py-1 rounded bg-slate-100 font-bold text-slate-700">
              CIBIL: {algorithmParams.cibilThreshold}+ | FOIR: {algorithmParams.maxFoirRatio}% | LTV: {algorithmParams.maxLtvRatio}%
            </span>
          </div>
        </div>

        {/* Presets Row */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2.5 font-sans">
            Load Tested Borrower Persona:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {PRESET_PERSONAS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPresetIndex === idx
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 truncate">{preset.name}</span>
                  <span className="font-mono text-[10px] font-bold text-slate-500">{preset.cibilScore} CIBIL</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 truncate">{preset.personaTitle}</p>
                <div className="mt-2 text-[10px] font-mono text-emerald-700 font-bold">
                  {formatRupees(preset.loanAmount)} Req.
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Live Decision Engine on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Sliders & Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Adjust Applicant Parameters
            </h4>
            <button
              type="button"
              onClick={() => handleSelectPreset(selectedPresetIndex)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer border-none bg-transparent"
            >
              <RotateCcw className="w-3 h-3" /> Reset Persona
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Monthly Net Income */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Primary Net Monthly Income
                </label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatRupees(profile.monthlyIncome)}
                </span>
              </div>
              <input
                type="range"
                min="25000"
                max="500000"
                step="5000"
                value={profile.monthlyIncome}
                onChange={(e) => setProfile(p => ({ ...p, monthlyIncome: Number(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Existing EMIs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Existing Monthly EMIs
                </label>
                <span className="text-xs font-mono font-bold text-rose-700">
                  {formatRupees(profile.existingEmis)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="150000"
                step="2000"
                value={profile.existingEmis}
                onChange={(e) => setProfile(p => ({ ...p, existingEmis: Number(e.target.value) }))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            {/* Requested Loan Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Desired Loan Amount
                </label>
                <span className="text-xs font-mono font-bold text-indigo-700">
                  {formatRupees(profile.loanAmount)}
                </span>
              </div>
              <input
                type="range"
                min="1000000"
                max="25000000"
                step="200000"
                value={profile.loanAmount}
                onChange={(e) => setProfile(p => ({ ...p, loanAmount: Number(e.target.value) }))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Property Valuation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Property Market Value
                </label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatRupees(profile.propertyValue)}
                </span>
              </div>
              <input
                type="range"
                min="1500000"
                max="30000000"
                step="250000"
                value={profile.propertyValue}
                onChange={(e) => setProfile(p => ({ ...p, propertyValue: Number(e.target.value) }))}
                className="w-full accent-slate-700 cursor-pointer"
              />
            </div>

            {/* CIBIL Score */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Credit Bureau (CIBIL) Score
                </label>
                <span className={`text-xs font-mono font-bold ${
                  profile.cibilScore >= algorithmParams.cibilThreshold ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {profile.cibilScore}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="850"
                step="5"
                value={profile.cibilScore}
                onChange={(e) => setProfile(p => ({ ...p, cibilScore: Number(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Tenure Years */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Loan Tenure (Years)
                </label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {profile.tenureYears} Years
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={profile.tenureYears}
                onChange={(e) => setProfile(p => ({ ...p, tenureYears: Number(e.target.value) }))}
                className="w-full accent-slate-700 cursor-pointer"
              />
            </div>

            {/* Applicant Age */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Applicant Age
                </label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {profile.age} Yrs (Matures at {profile.age + profile.tenureYears})
                </span>
              </div>
              <input
                type="range"
                min="21"
                max="62"
                step="1"
                value={profile.age}
                onChange={(e) => setProfile(p => ({ ...p, age: Number(e.target.value) }))}
                className="w-full accent-slate-700 cursor-pointer"
              />
            </div>

            {/* Co-Borrower Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Co-Borrower Financial Support
                </label>
                <input
                  type="checkbox"
                  checked={profile.hasCoBorrower}
                  onChange={(e) => setProfile(p => ({ ...p, hasCoBorrower: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                />
              </div>

              {profile.hasCoBorrower && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-900 font-medium">Co-borrower Monthly Net:</span>
                    <strong className="font-mono text-emerald-800">{formatRupees(profile.coBorrowerIncome)}</strong>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="200000"
                    step="5000"
                    value={profile.coBorrowerIncome}
                    onChange={(e) => setProfile(p => ({ ...p, coBorrowerIncome: Number(e.target.value) }))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <p className="text-[9px] text-emerald-700">
                    Boosted by {algorithmParams.coBorrowerMultiplier}x co-borrower rule multiplier.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Checkbox: Salary Account */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={profile.hasSalaryAccount}
                onChange={(e) => setProfile(p => ({ ...p, hasSalaryAccount: e.target.checked }))}
                className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
              />
              <span>Applicant maintains primary salary account with target lender (+{algorithmParams.salaryMatchBonus} pts affinity bonus)</span>
            </label>
          </div>
        </div>

        {/* Right Column: Live Underwriting Verdict & Step-by-Step Checks (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Verdict Card */}
          <div className={`p-6 md:p-8 rounded-[2.5rem] border shadow-xl transition-all ${
            simulationResults.verdict === 'APPROVED'
              ? 'bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white border-emerald-500/40'
              : simulationResults.verdict === 'CONDITIONAL'
              ? 'bg-gradient-to-br from-amber-900 via-amber-950 to-slate-950 text-white border-amber-500/40'
              : 'bg-gradient-to-br from-rose-950 via-slate-950 to-black text-white border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                Underwriting Verdict
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono ${
                simulationResults.verdict === 'APPROVED' ? 'bg-emerald-400 text-slate-950' :
                simulationResults.verdict === 'CONDITIONAL' ? 'bg-amber-400 text-slate-950' :
                'bg-rose-500 text-white'
              }`}>
                {simulationResults.verdict}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-black tracking-tight font-mono">
                {simulationResults.finalScore}
              </span>
              <span className="text-slate-400 text-xs font-mono font-medium">/ 100 ParrotScore™</span>
            </div>

            <p className="text-xs text-slate-200 mt-2 leading-relaxed">
              {simulationResults.verdictReason}
            </p>

            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated New EMI</span>
                <span className="text-white font-bold text-sm">₹{simulationResults.proposedEmi.toLocaleString('en-IN')}/mo</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Max Eligible Quantum</span>
                <span className="text-emerald-400 font-bold text-sm">{formatRupees(simulationResults.maxEligibleLoan)}</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Rule Audit Checklist */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-3.5">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Active Rule Compliance Audit
            </h5>

            <div className="space-y-2.5 text-xs">
              {/* FOIR Check */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                simulationResults.isFoirPassed 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50/60 border-rose-200 text-rose-900'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    {simulationResults.isFoirPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                    <span>FOIR (Debt-to-Income)</span>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Calculated: <strong className="font-mono">{simulationResults.calculatedFoir}%</strong> vs Limit: <strong className="font-mono">{algorithmParams.maxFoirRatio}%</strong>
                  </p>
                </div>
                <span className="font-mono font-bold text-xs">
                  {simulationResults.isFoirPassed ? 'PASS' : 'EXCEEDED'}
                </span>
              </div>

              {/* LTV Check */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                simulationResults.isLtvPassed 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50/60 border-rose-200 text-rose-900'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    {simulationResults.isLtvPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                    <span>LTV (Loan-to-Value)</span>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Calculated: <strong className="font-mono">{simulationResults.calculatedLtv}%</strong> vs Limit: <strong className="font-mono">{algorithmParams.maxLtvRatio}%</strong>
                  </p>
                </div>
                <span className="font-mono font-bold text-xs">
                  {simulationResults.isLtvPassed ? 'PASS' : 'EXCEEDED'}
                </span>
              </div>

              {/* CIBIL Check */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                simulationResults.isCibilPassed 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50/60 border-amber-200 text-amber-900'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    {simulationResults.isCibilPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                    <span>Credit Bureau Floor</span>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Score: <strong className="font-mono">{profile.cibilScore}</strong> vs Floor: <strong className="font-mono">{algorithmParams.cibilThreshold}</strong>
                  </p>
                </div>
                <span className="font-mono font-bold text-xs">
                  {simulationResults.cibilPenaltyDeduction > 0 ? `-${simulationResults.cibilPenaltyDeduction} pts` : 'CLEAN'}
                </span>
              </div>

              {/* Age + Tenure Check */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                simulationResults.excessYears === 0 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50/60 border-amber-200 text-amber-900'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    {simulationResults.excessYears === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                    <span>Age at Maturity</span>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Matures at: <strong className="font-mono">{simulationResults.ageAtMaturity} Yrs</strong> vs Cap: <strong className="font-mono">{algorithmParams.maxAgeLimit} Yrs</strong>
                  </p>
                </div>
                <span className="font-mono font-bold text-xs">
                  {simulationResults.agePenaltyDeduction > 0 ? `-${simulationResults.agePenaltyDeduction} pts` : 'PASS'}
                </span>
              </div>

              {/* Boosters Row */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-700">
                <span>Relationship & Co-borrower Boosts:</span>
                <div className="flex items-center gap-2 font-mono font-bold">
                  {profile.hasSalaryAccount && <span className="text-indigo-700">+{algorithmParams.salaryMatchBonus} Salary</span>}
                  {profile.hasCoBorrower && <span className="text-emerald-700">+{algorithmParams.coBorrowerMultiplier}x Co-borrower</span>}
                  {!profile.hasSalaryAccount && !profile.hasCoBorrower && <span className="text-slate-400">None</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
