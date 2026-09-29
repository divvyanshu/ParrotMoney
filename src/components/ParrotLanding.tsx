import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  { label: 'Process', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const faqs = [
  {
    q: 'Does ParrotMoney charge borrowers?',
    a: 'ParrotMoney does not charge a platform fee for comparison. Lender processing, legal or valuation fees should be reviewed before proceeding.',
  },
  {
    q: 'Will checking an indicative comparison affect my credit score?',
    a: 'The basic preview uses self-declared inputs. Bureau checks may happen later during a formal lender process, with consent.',
  },
  {
    q: 'Are the offers guaranteed?',
    a: 'No. Rows are indicative. Final pricing, eligibility, sanction and disbursement remain with the lender.',
  },
  {
    q: 'How does ParrotMoney make money?',
    a: 'ParrotMoney may receive a referral or distribution commission from a lender when a loan is successfully processed.',
  },
  {
    q: 'When is my data shared with a lender?',
    a: 'Only after you request follow-up or lender handoff and provide consent.',
  },
  {
    q: 'How fresh is the lender data?',
    a: 'The preview uses the current dataset available inside ParrotMoney. Final quotes should be verified because rates and fees can change.',
  },
  {
    q: 'Who approves the loan?',
    a: 'The selected bank, housing finance company or NBFC approves, sanctions and disburses the loan.',
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

function formatFitStatus(status: EnrichedLenderOffer['fitStatus']) {
  if (status === 'Within stated criteria') return 'Within criteria';
  if (status === 'Review required') return 'Review';
  return 'Outside criteria';
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

function PremiumHeroPanel({
  offers,
  ltv,
}: {
  offers: EnrichedLenderOffer[];
  ltv: number;
}) {
  const previewOffers = offers.slice(0, 3);

  return (
    <motion.div
      variants={reveal}
      className="relative min-w-0 overflow-hidden rounded-lg border border-white/10 bg-[#0d1c17] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.36)]"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent"
        animate={{ opacity: [0.18, 0.38, 0.18] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-emerald-200">
            Borrower decision desk
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-white">
            Cost visibility before contact
          </h2>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-right">
          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-white/45">
            LTV
          </p>
          <p className="mt-1 text-lg font-black tabular-nums text-white">
            {formatPercent(ltv)}
          </p>
        </div>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative mt-4 space-y-3"
      >
        {previewOffers.map((offer, index) => (
          <motion.div
            key={offer.id}
            variants={reveal}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="group grid gap-3 rounded-md border border-white/10 bg-white/[0.07] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/45 hover:bg-white/[0.1] sm:grid-cols-[1fr_auto]"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-300 text-[0.65rem] font-black text-[#071410]">
                  {index + 1}
                </span>
                <p className="font-black text-white">{offer.shortName}</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/55">{offer.rawRateRange}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-white/45">
                Est. EMI
              </p>
              <p className="mt-1 text-lg font-black tabular-nums text-emerald-200">
                {formatCompactCurrency(offer.estEMI)}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="relative mt-4 flex flex-wrap gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-white/58">
        {['Rate', 'EMI', 'Fees', 'Fit'].map((item) => (
          <span key={item} className="rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1.5">
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function ComparisonTable({ offers }: { offers: EnrichedLenderOffer[] }) {
  return (
    <div className="w-full max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <table className="min-w-[700px] w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-800 bg-[#0b1613] text-[0.68rem] uppercase tracking-[0.14em] text-white/58">
            <th className="px-4 py-3 font-extrabold">Lender</th>
            <th className="px-4 py-3 font-extrabold">Indicative rate</th>
            <th className="px-4 py-3 font-extrabold">Est. EMI</th>
            <th className="px-4 py-3 font-extrabold">Processing fee</th>
            <th className="px-4 py-3 font-extrabold">Fit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {offers.map((offer, index) => (
            <motion.tr
              key={offer.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: index * 0.035 }}
              className="align-top transition-colors duration-200 hover:bg-emerald-50/35"
            >
              <td className="px-4 py-4">
                <div className="font-black text-slate-950">{offer.shortName}</div>
              </td>
              <td className="px-4 py-4 font-bold text-slate-900">{offer.rawRateRange}</td>
              <td className="px-4 py-4 font-black tabular-nums text-slate-950">
                {formatCompactCurrency(offer.estEMI)}
              </td>
              <td className="max-w-[220px] px-4 py-4 text-sm text-slate-600">
                {offer.processingFee}
              </td>
              <td className="px-4 py-4">
                <span className={cn(
                  'inline-flex rounded-md px-2.5 py-1 text-xs font-extrabold',
                  offer.fitStatus === 'Within stated criteria' && 'bg-emerald-50 text-emerald-700',
                  offer.fitStatus === 'Review required' && 'bg-amber-50 text-amber-700',
                  offer.fitStatus === 'Outside stated criteria' && 'bg-rose-50 text-rose-700',
                )}>
                  {formatFitStatus(offer.fitStatus)}
                </span>
              </td>
            </motion.tr>
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
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const offers = useMemo(() => {
    return compute43LenderRecommendations(
      toRecommendationInput(requirement),
      DEFAULT_ALGORITHM_PARAMS,
      'lowest_rate',
    ).slice(0, 4);
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
    <div className="min-h-screen overflow-x-hidden bg-[#f4f6f2] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/94 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl">
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
              className="rounded-md px-4 py-2 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-white hover:text-slate-950 hover:shadow-sm"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={isLoggedIn && onGoToDashboard ? onGoToDashboard : startPersonalizedFlow}
              className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_18px_36px_rgba(15,23,42,0.2)]"
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
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden bg-[#071410] text-white"
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
            animate={{ backgroundPosition: ['0px 0px', '72px 72px'] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f4f6f2] via-[#f4f6f2]/35 to-transparent" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-28 pt-12 sm:px-6 md:pb-36 md:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
            <motion.div variants={reveal} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="max-w-4xl">
              <p className="inline-flex rounded-md border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-200 shadow-sm">
                Private home-loan comparison
              </p>
              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl [font-family:'Space_Grotesk',Inter,sans-serif]">
                Compare the cost of credit before the sales call.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/68">
                Four inputs. One indicative lender table. Personal details only when you continue.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#compare"
                  className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-bold text-[#071410] shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50"
                >
                  Start comparison <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a
                  href="#disclosures"
                  className="inline-flex items-center justify-center rounded-md border border-white/18 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.1]"
                >
                  Review disclosures
                </a>
              </div>
            </motion.div>

            <PremiumHeroPanel offers={offers} ltv={ltv} />
          </div>
        </motion.section>

        <motion.section
          id="compare"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 -mt-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_32px_120px_rgba(15,23,42,0.12)]">
            <div className="grid gap-8 border-b border-slate-200 bg-[#fbfcfa] px-4 py-7 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">
                  Basic requirement
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  See the comparison first.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
                  Product, amount, property value and tenure. Nothing more to see the first view.
                </p>
              </div>

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className="grid gap-4 md:grid-cols-2"
              >
                <RequirementField label="Product">
                  <select
                    value={requirement.product}
                    onChange={(event) => updateRequirement('product', event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-950 shadow-sm outline-none transition-all duration-200 hover:border-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
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
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-950 shadow-sm outline-none transition-all duration-200 hover:border-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  />
                </RequirementField>
                <RequirementField label="Property value">
                  <input
                    type="number"
                    min={100000}
                    step={100000}
                    value={requirement.propertyValue}
                    onChange={(event) => updateRequirement('propertyValue', Number(event.target.value))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-950 shadow-sm outline-none transition-all duration-200 hover:border-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  />
                </RequirementField>
                <RequirementField label="Tenure">
                  <select
                    value={requirement.tenureYears}
                    onChange={(event) => updateRequirement('tenureYears', Number(event.target.value))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-slate-950 shadow-sm outline-none transition-all duration-200 hover:border-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  >
                    {[10, 15, 20, 25, 30].map((year) => (
                      <option key={year} value={year}>{year} years</option>
                    ))}
                  </select>
                </RequirementField>
              </motion.div>
            </div>

            <div className="min-w-0 px-4 py-7 sm:px-6 lg:px-8">
              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                    Indicative lender preview
                  </p>
                  <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                    Rate, EMI and fees
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={startPersonalizedFlow}
                  className="inline-flex items-center justify-center rounded-md bg-[#0b1613] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_38px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#123028]"
                >
                  Personalize comparison <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
              <ComparisonTable offers={offers} />

              <div className="mt-5 grid gap-3 text-xs text-slate-500 sm:grid-cols-3">
                <div className="border-t border-slate-200 pt-3">
                  <span className="block font-black text-slate-950">{formatPercent(ltv)}</span>
                  Indicative loan-to-value
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <span className="block font-black text-slate-950">{summary.rateAvailable}/{summary.totalOffers}</span>
                  Rows with rate data
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <span className="block font-black text-slate-950">Not an approval</span>
                  Lender review required
                </div>
              </div>
              <p className="mt-5 text-xs leading-6 text-slate-500">
                Indicative only. Final terms stay with the lender.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="how-it-works"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="border-b border-slate-200 pb-12">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                A shorter path to clarity.
              </h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                ['01', 'Enter basics', 'No phone number for the preview.'],
                ['02', 'Compare table', 'Rate, EMI, fees and fit together.'],
                ['03', 'Continue with consent', 'Personalize only when ready.'],
              ].map(([step, title, body]) => (
                <motion.div
                  key={step}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-slate-200 pt-5"
                >
                  <span className="text-sm font-black text-emerald-700">{step}</span>
                  <h3 className="mt-4 text-xl font-black text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="disclosures"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
        >
          <div className="grid gap-8 rounded-lg border border-slate-200 bg-white px-5 py-7 shadow-[0_18px_70px_rgba(15,23,42,0.05)] sm:px-7 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">
                Guardrails
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Clear boundaries.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Marketplace', 'ParrotMoney compares; lenders sanction.'],
                ['Indicative', 'Preview rows are not guaranteed offers.'],
                ['Consent', 'Data sharing starts after your request.'],
                ['Freshness', 'Final lender quotes must be verified.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-md border border-slate-200 bg-[#fbfcfa] p-4">
                  <h3 className="text-sm font-black text-slate-950">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="faq"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="border-y border-slate-200 bg-white"
        >
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">
              FAQ
            </p>
            <h2 className="mt-3 text-center text-3xl font-black tracking-tight text-slate-950">
              Important, not hidden.
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
        </motion.section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-lg bg-[#071410] px-5 py-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.16)] sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white">
                Make it personal when ready.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
                Add details with consent to move from indicative view to lender selection.
              </p>
            </div>
            <button
              type="button"
              onClick={startPersonalizedFlow}
              className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-bold text-[#071410] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white text-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <Logo />
              <p className="mt-4 max-w-xl text-xs leading-6 text-slate-500">
                Loan marketplace and facilitator. Indicative comparisons only; final terms and approval remain with the selected lender.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <button type="button" onClick={() => setShowPrivacyModal(true)} className="hover:text-slate-950">
                Privacy
              </button>
              <button type="button" onClick={() => setShowTermsModal(true)} className="hover:text-slate-950">
                Terms
              </button>
              <button type="button" onClick={onCookieSettingsClick || (() => setShowPrivacyModal(true))} className="hover:text-slate-950">
                Cookies
              </button>
              {onLoginClick && (
                <button type="button" onClick={() => onLoginClick('admin')} className="hover:text-slate-950">
                  Admin
                </button>
              )}
            </div>
          </div>
          <p className="mt-10 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400">
            © 2026 ParrotMoney. All rights reserved.
          </p>
        </div>
      </footer>

      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <TermsAndConditionsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
}
