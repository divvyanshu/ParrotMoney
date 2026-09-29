import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Logo } from './Logo';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';
import {
  compute43LenderRecommendations,
  EnrichedLenderOffer,
  getLenderComparisonSummary,
} from '../services/lenderRecommendationService';

export const NEWS_ARTICLES = [
  {
    id: 'home-loan-total-cost',
    category: 'Home loan guide',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    title: 'How to compare a home loan beyond the headline interest rate',
    description: 'A concise guide to reading rate ranges, processing fees, tenure and total repayment together before selecting a lender.',
    author: 'ParrotMoney Research',
    role: 'Marketplace education',
    date: 'September 28, 2026',
    readTime: '4 min read',
    accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    content: `A useful home-loan comparison should show more than one attractive rate. Borrowers should review the rate type, estimated EMI, total interest across the selected tenure, processing fee, prepayment terms and lender eligibility notes together.

ParrotMoney treats a displayed comparison as indicative until the lender completes its own review. Final pricing, sanction and disbursement remain subject to the lender's credit policy, document verification and property due diligence.`
  },
  {
    id: 'loan-transfer-checklist',
    category: 'Loan transfer',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    title: 'When a home-loan transfer is worth reviewing',
    description: 'A practical checklist for comparing current loan cost with alternative lender terms, including fees and remaining tenure.',
    author: 'ParrotMoney Research',
    role: 'Marketplace education',
    date: 'September 28, 2026',
    readTime: '3 min read',
    accentColor: 'text-slate-700 bg-slate-50 border-slate-200',
    content: `A transfer can make sense when the total savings over the remaining tenure are higher than the switching costs. Compare the current outstanding balance, current rate, new indicative rate, processing fee, legal and valuation charges, foreclosure terms and remaining tenure before acting.`
  },
  {
    id: 'credit-score-soft-checks',
    category: 'Credit score',
    imageUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80',
    title: 'What changes before and after a lender application',
    description: 'Understand the difference between self-declared comparison inputs and lender credit checks during formal application review.',
    author: 'ParrotMoney Research',
    role: 'Marketplace education',
    date: 'September 28, 2026',
    readTime: '3 min read',
    accentColor: 'text-amber-700 bg-amber-50 border-amber-100',
    content: `A marketplace comparison can begin from self-declared details. A formal lender application may involve credit bureau checks, document verification and property due diligence. Borrowers should review and consent before any selected offer details are shared for lender follow-up.`
  }
];

type BasicRequirement = {
  product: string;
  loanAmount: number;
  propertyValue: number;
  tenureYears: number;
};

interface SectionProps {
  onApply: (category?: string, requirement?: BasicRequirement) => void;
  loginWithGoogle: () => void;
  loginWithEmailOrMobile?: (emailOrMobile: string) => Promise<void>;
  isLoggedIn?: boolean;
  onGoToDashboard?: () => void;
  onCookieSettingsClick?: () => void;
  onLoginClick?: (mode?: 'customer' | 'admin') => void;
}

const PRODUCTS = [
  'New Home Loan',
  'Loan Transfer',
  'Loan Against Property',
  'Plot Loan',
  'Plot + Construction',
  'Commercial Property',
  'NRI Home Loan',
];

const DEFAULT_REQUIREMENT: BasicRequirement = {
  product: 'New Home Loan',
  loanAmount: 5000000,
  propertyValue: 7500000,
  tenureYears: 20,
};

const DEFAULT_ALGORITHM_PARAMS = {
  cibilThreshold: 750,
  cibilPenalty: 0,
  maxFoirRatio: 0.55,
  maxAgeLimit: 70,
  agePenalty: 0,
  maxLtvRatio: 0.8,
  salaryMatchBonus: 0,
  coBorrowerMultiplier: 1,
};

const navItems = [
  { label: 'Compare', href: '#compare' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Disclosures', href: '#disclosures' },
  { label: 'FAQ', href: '#faq' },
];

const faqs = [
  {
    q: 'Does ParrotMoney charge borrowers?',
    a: 'ParrotMoney does not charge a platform fee for creating a comparison. Lenders may charge processing, legal, valuation or other product fees, which should be reviewed before proceeding.',
  },
  {
    q: 'Will checking an indicative comparison affect my credit score?',
    a: 'The basic comparison starts from self-declared inputs. A credit bureau check may happen only during a formal lender process, subject to the lender process and your consent.',
  },
  {
    q: 'Are the offers guaranteed?',
    a: 'No. Displayed rows are indicative comparisons from available lender data. Final eligibility, pricing, sanction and disbursement remain with the lender.',
  },
  {
    q: 'How does ParrotMoney make money?',
    a: 'ParrotMoney may receive a referral or distribution commission from a lender when a loan is successfully processed. We should not add a hidden markup to your rate.',
  },
  {
    q: 'When is my data shared with a lender?',
    a: 'Basic comparison inputs stay within the marketplace flow. Selected offer details or personal information should be shared with a lender only after you request follow-up and provide consent.',
  },
  {
    q: 'How fresh is the lender data?',
    a: 'The preview uses the current lender dataset available inside ParrotMoney. Any final lender quote should be verified before acceptance because rates and fees can change.',
  },
  {
    q: 'Who approves the loan?',
    a: 'The selected bank, housing finance company or NBFC approves, sanctions and disburses the loan under its own policies and regulatory obligations.',
  },
];

function toRecommendationInput(requirement: BasicRequirement) {
  const isLap =
    requirement.product === 'Loan Against Property' ||
    requirement.product === 'Commercial Property';
  const isPlot =
    requirement.product === 'Plot Loan' ||
    requirement.product === 'Plot + Construction';

  return {
    loanPurpose: isLap ? 'Loan Against Property (LAP)' : requirement.product,
    propertyType: isLap ? 'Commercial' : isPlot ? 'Plot / Land Only' : 'Residential',
    loanAmount: requirement.loanAmount,
    propertyValue: requirement.propertyValue,
    tenure: requirement.tenureYears,
    age: 35,
    occupation: 'Salaried',
  };
}

function formatPercent(value?: number) {
  if (!value || Number.isNaN(value)) return 'Not available';
  return `${value.toFixed(2)}%`;
}

function formatCompactCurrency(value: number) {
  if (!value) return 'Not available';
  return formatCurrency(value).replace('/-', '');
}

function RequirementField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function ComparisonTable({ offers }: { offers: EnrichedLenderOffer[] }) {
  return (
    <div className="w-full max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-[760px] w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-[0.68rem] uppercase tracking-[0.14em] text-slate-500">
            <th className="px-4 py-3 font-extrabold">Lender</th>
            <th className="px-4 py-3 font-extrabold">Indicative rate</th>
            <th className="px-4 py-3 font-extrabold">Est. EMI</th>
            <th className="px-4 py-3 font-extrabold">Processing fee</th>
            <th className="px-4 py-3 font-extrabold">Fit note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {offers.map((offer) => (
            <tr key={offer.id} className="align-top">
              <td className="px-4 py-4">
                <div className="font-bold text-slate-950">{offer.shortName}</div>
                <div className="mt-1 text-xs text-slate-500">{offer.categoryGroup}</div>
              </td>
              <td className="px-4 py-4 font-semibold text-slate-900">{offer.rawRateRange}</td>
              <td className="px-4 py-4 font-semibold tabular-nums text-slate-900">
                {formatCompactCurrency(offer.estEMI)}
              </td>
              <td className="max-w-[220px] px-4 py-4 text-sm text-slate-600">
                {offer.processingFee}
              </td>
              <td className="px-4 py-4">
                <span className={cn(
                  'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                  offer.fitStatus === 'Within stated criteria' && 'bg-emerald-50 text-emerald-700',
                  offer.fitStatus === 'Review required' && 'bg-amber-50 text-amber-700',
                  offer.fitStatus === 'Outside stated criteria' && 'bg-rose-50 text-rose-700',
                )}>
                  {offer.fitStatus}
                </span>
                <p className="mt-2 max-w-[260px] text-xs leading-relaxed text-slate-500">
                  {(offer.matchFactors[0] || offer.cautionPoints[0] || 'Review lender terms before proceeding.')}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ParrotLanding({
  onApply,
  isLoggedIn,
  onGoToDashboard,
  onCookieSettingsClick,
  onLoginClick,
}: SectionProps) {
  const [requirement, setRequirement] = useState<BasicRequirement>(DEFAULT_REQUIREMENT);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const offers = useMemo(() => {
    return compute43LenderRecommendations(
      toRecommendationInput(requirement),
      DEFAULT_ALGORITHM_PARAMS,
      'lowest_rate',
    ).slice(0, 5);
  }, [requirement]);

  const summary = useMemo(() => getLenderComparisonSummary(offers), [offers]);
  const ltv = requirement.propertyValue > 0
    ? (requirement.loanAmount / requirement.propertyValue) * 100
    : 0;

  const updateRequirement = <K extends keyof BasicRequirement>(key: K, value: BasicRequirement[K]) => {
    setRequirement((current) => ({ ...current, [key]: value }));
  };

  const startPersonalizedFlow = () => {
    onApply(requirement.product, requirement);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7faf7] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#f7faf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="rounded-md focus-visible:outline-emerald-700">
            <Logo />
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => onLoginClick?.('customer')}
              className="rounded-md px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-white hover:text-slate-950"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={isLoggedIn && onGoToDashboard ? onGoToDashboard : startPersonalizedFlow}
              className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              {isLoggedIn ? 'Go to dashboard' : 'Compare now'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 md:hidden"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {item.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => onLoginClick?.('customer')}
                className="mt-2 rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-bold text-slate-700"
              >
                Sign in
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 md:pb-16 md:pt-20 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">
              Home-loan marketplace
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Compare home-loan cost before sharing personal details.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Start with loan amount, property value and tenure. ParrotMoney shows an indicative lender comparison first, then asks for progressive details only when you want a personalized view.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#compare"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                Start comparison <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a
                href="#disclosures"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-400"
              >
                Review disclosures
              </a>
            </div>
          </div>
        </section>

        <section id="compare" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">
                Basic requirement
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                See the comparison first.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Four inputs create an indicative table. Personal details, credit information and lender handoff come later with consent.
              </p>
            </div>

            <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-[#fbfdfb] p-4 md:grid-cols-2 xl:grid-cols-4">
                <RequirementField label="Product">
                  <select
                    value={requirement.product}
                    onChange={(event) => updateRequirement('product', event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  >
                    {PRODUCTS.map((product) => (
                      <option key={product} value={product}>{product}</option>
                    ))}
                  </select>
                </RequirementField>
                <RequirementField label="Loan amount">
                  <input
                    type="number"
                    min={100000}
                    step={100000}
                    value={requirement.loanAmount}
                    onChange={(event) => updateRequirement('loanAmount', Number(event.target.value))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  />
                </RequirementField>
                <RequirementField label="Property value">
                  <input
                    type="number"
                    min={100000}
                    step={100000}
                    value={requirement.propertyValue}
                    onChange={(event) => updateRequirement('propertyValue', Number(event.target.value))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  />
                </RequirementField>
                <RequirementField label="Tenure">
                  <select
                    value={requirement.tenureYears}
                    onChange={(event) => updateRequirement('tenureYears', Number(event.target.value))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  >
                    {[10, 15, 20, 25, 30].map((year) => (
                      <option key={year} value={year}>{year} years</option>
                    ))}
                  </select>
                </RequirementField>
            </div>

            <div className="mt-10 min-w-0">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
                    Indicative lender preview
                  </p>
                  <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                    Rate, EMI and fees in one table
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={startPersonalizedFlow}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
                >
                  Personalize comparison <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
              <ComparisonTable offers={offers} />

              <div className="mt-5 grid gap-3 text-xs text-slate-500 sm:grid-cols-3">
                <div>
                  <span className="block font-extrabold text-slate-950">{formatPercent(ltv)}</span>
                  Indicative loan-to-value
                </div>
                <div>
                  <span className="block font-extrabold text-slate-950">{summary.rateAvailable}/{summary.totalOffers}</span>
                  Rows with rate data
                </div>
                <div>
                  <span className="block font-extrabold text-slate-950">Not an approval</span>
                  Lender review required
                </div>
              </div>
              <p className="mt-5 text-xs leading-6 text-slate-500">
                Preview rows are generated from ParrotMoney's available lender dataset using your basic assumptions. They are not approvals, guarantees or final lender quotes.
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="border-b border-slate-200 pb-12">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                From basic requirement to application intent.
              </h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                ['01', 'Enter the basics', 'Choose product, loan amount, property value and tenure before sharing personal data.'],
                ['02', 'Compare indicative options', 'Review lender rows across rate range, EMI, fees and stated fit notes.'],
                ['03', 'Personalize and consent', 'Add profile details, authorize contact or lender handoff, then select the lender you want to continue with.'],
              ].map(([step, title, body]) => (
                <div key={step} className="border-t border-slate-200 pt-5">
                  <span className="text-sm font-black text-emerald-700">{step}</span>
                  <h3 className="mt-4 text-xl font-black text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="disclosures" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">
                Disclosures
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Clear limits, stated upfront.
              </h2>
            </div>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {[
                ['Marketplace role', 'ParrotMoney helps compare and facilitate. It is not the lender sanctioning your loan.'],
                ['Indicative numbers', 'Displayed EMI and total cost depend on selected assumptions and source data availability.'],
                ['Consent-led sharing', 'Selected offer details are shared for lender follow-up only when you request that next step.'],
                ['Security posture', 'The app keeps existing lead, consent and CRM infrastructure instead of duplicating sensitive flows.'],
              ].map(([title, body]) => (
                <div key={title} className="border-t border-slate-200 pt-4">
                  <h3 className="font-black text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">
              FAQ
            </p>
            <h2 className="mt-3 text-center text-3xl font-black tracking-tight text-slate-950">
              The questions borrowers should ask.
            </h2>
            <div className="mt-10 divide-y divide-slate-200">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIdx === index;
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left font-bold text-slate-950"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-500 transition-transform', isOpen && 'rotate-180')} />
                    </button>
                    {isOpen && (
                      <p className="pb-5 text-sm leading-7 text-slate-600">{faq.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 border-t border-slate-200 pt-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">
                Ready to make the comparison personal?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Continue with identity, income basics and consent so ParrotMoney can prepare a saved comparison and lender-selection path.
              </p>
            </div>
            <button
              type="button"
              onClick={startPersonalizedFlow}
              className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <Logo />
              <p className="mt-4 max-w-xl text-xs leading-6 text-white/50">
                ParrotMoney is a loan marketplace and facilitator. Comparisons are indicative and based on available data and user assumptions. Final terms, approval and disbursement remain with the selected lender.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-[0.16em] text-white/50">
              <button type="button" onClick={() => setShowPrivacyModal(true)} className="hover:text-white">
                Privacy
              </button>
              <button type="button" onClick={() => setShowTermsModal(true)} className="hover:text-white">
                Terms
              </button>
              <button type="button" onClick={onCookieSettingsClick || (() => setShowPrivacyModal(true))} className="hover:text-white">
                Cookies
              </button>
              {onLoginClick && (
                <button type="button" onClick={() => onLoginClick('admin')} className="hover:text-white">
                  Admin
                </button>
              )}
            </div>
          </div>
          <p className="mt-10 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/30">
            © 2026 ParrotMoney. All rights reserved.
          </p>
        </div>
      </footer>

      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <TermsAndConditionsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
}
