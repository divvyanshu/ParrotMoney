import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowRight, Check, 
  Home, Mountain, Hammer, RefreshCw, Plus, 
  Building, Globe, ShieldCheck,
  Zap, TrendingUp, FileText, ChevronRight, ChevronLeft,
  Sparkles, Clock, MapPin, Gauge, Target,
  DollarSign, PieChart as PieChartIcon,
  ChevronDown, HelpCircle, AlertCircle, Sparkle,
  ArrowRightCircle, UserCheck,
  Award, Star, ListChecks, CheckCircle2, CircleDot,
  X, ArrowUpRight, TrendingDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MortgageCalculator } from './MortgageCalculator';
import { NEWS_ARTICLES } from './ParrotLanding';
import { BankLogo } from './BankLogo';

interface ProductDetail {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: any;
  features: string[];
  documents: { category: string; docs: string[] }[];
  infographics: { label: string; value: string; sub: string }[];
  baseRoi: number; // Specific rate for the sandbox
  marketRoi: number; // Comparable standard bank rate
  imageUrl: string;
}

const PRODUCT_DATA: Record<string, ProductDetail> = {
  'New Home Loan': {
    id: 'New Home Loan',
    title: 'New Home Loan',
    description: 'Get your dream home with the lowest interest rates and flexible tenures.',
    longDescription: 'Our New Home Loan product is designed for first-time buyers and those looking to move into their next residence. We provide institutional access to 25+ lenders, ensuring you get the most competitive ROI and maximal LTV (Loan to Value) ratios available in the market.',
    icon: Home,
    features: ['Lowest Interest Rates starting from 7.10%*', 'Tenure up to 30 Years', 'Max LTV up to 90%', 'Zero Processing Fee on selected banks'],
    documents: [
      { category: 'Identity & Address', docs: ['PAN Card', 'Aadhaar Card', 'Voter Id/Passport'] },
      { category: 'Income (Salaried)', docs: ['Last 3 months salary slips', 'Form 16 for last 2 years', 'Last 6 months bank statement'] },
      { category: 'Property Docs', docs: ['Sale Deed', 'Allotment Letter', 'No Objection Certificate (NOC)'] }
    ],
    infographics: [
      { label: 'Market ROI', value: '7.10%-9.5%', sub: 'Competitive Range*' },
      { label: 'Max Tenure', value: '30Y', sub: 'Flexible Repayment' },
      { label: 'Processing', value: '0-0.5%', sub: 'Low Entry Cost' }
    ],
    baseRoi: 7.10,
    marketRoi: 8.55,
    imageUrl: '/src/assets/images/new_home_loan_real_1783043030009.jpg'
  },
  'Loan Transfer': {
    id: 'Loan Transfer',
    title: 'Home Loan Balance Transfer',
    description: 'Reduce your EMI by transferring your existing home loan to a lower ROI bank.',
    longDescription: 'Is your current home loan interest rate too high? Switch to a better lender with ParrotMoney. Our AI engine identifies lenders offering the best "Switch Incentives," often including zero processing fees and additional top-up amounts at the same low home loan rates.',
    icon: RefreshCw,
    features: ['Save up to ₹15 Lakhs in interest', 'Top-up loan facility available', 'Minimal documentation for switch', 'Instant eligibility check'],
    documents: [
      { category: 'Existing Loan', docs: ['Statement of Account (SOA) of loan (Mandatory)', 'Bank statement wherein loan installment is going (Mandatory)', 'Latest Outstanding Statement', 'List of Documents (LOD)', 'Sanction Letter from existing bank'] },
      { category: 'Income Docs', docs: ['Bank statement wherein salary income is coming (Mandatory for Salaried)', 'Bank statement wherein business income is coming (Mandatory for Self-Employed)', 'Last 3 months salary slips', 'Form 16'] }
    ],
    infographics: [
      { label: 'Potential Savings', value: '₹12L+', sub: 'Average Interest Saved' },
      { label: 'TAT', value: '10 Days', sub: 'Switch Completion' },
      { label: 'Top-up Rate', value: '8.50%', sub: 'Low Cost Liquidity' }
    ],
    baseRoi: 7.15,
    marketRoi: 8.70,
    imageUrl: '/src/assets/images/loan_transfer_real_1783043045569.jpg'
  },
  'Plot + Construction': {
    id: 'Plot + Construction',
    title: 'Plot + Construction Loan',
    description: 'Finance both the land purchase and the construction of your custom home.',
    longDescription: 'Building your own home requires a specialized loan that covers both the land acquisition and the phased construction. We help you navigate the complex technical and legal requirements required for composite loans.',
    icon: Mountain,
    features: ['Composite financing for plot & building', 'Tranche-based disbursement', 'Moratorium period during construction', 'Extended tenure options'],
    documents: [
      { category: 'Plot Docs', docs: ['Allotment Letter', 'Possession Certificate', 'Sale Agreement'] },
      { category: 'Construction', docs: ['Approved Map/Plan', 'Detailed Estimate from Architect', 'NOC from local authorities'] }
    ],
    infographics: [
      { label: 'LTV (Plot)', value: '75%', sub: 'Land Financing' },
      { label: 'LTV (Cons)', value: '90%', sub: 'Phased Funding' },
      { label: 'Moratorium', value: '18M', sub: 'Interest-only period' }
    ],
    baseRoi: 7.60,
    marketRoi: 8.95,
    imageUrl: '/src/assets/images/plot_construction_real_1783043056991.jpg'
  },
  'Home Renovation': {
    id: 'Home Renovation',
    title: 'Home Renovation Loan',
    description: 'Upgrade your living space with quick, low-interest renovation financing.',
    longDescription: 'Breathe new life into your home. Whether it is a kitchen upgrade, a new floor, or structural repairs, our home improvement loans offer much lower interest rates than personal loans, with tenures matching your home loan.',
    icon: Hammer,
    features: ['Low ROI (Matching Home Loans)', 'Tenure up to 15 years', 'Funding up to 100% of estimate', 'Quick approval pulse'],
    documents: [
      { category: 'Basic', docs: ['KYC Documents', 'Ownership Proof'] },
      { category: 'Renovation', docs: ['Detailed Cost Estimate', 'Before-photos (sometimes required)', 'Architect certificate'] }
    ],
    infographics: [
      { label: 'ROI Savings', value: '4-5%', sub: 'Vs Personal Loans' },
      { label: 'Approval Speed', value: '48H', sub: 'Rapid Processing' },
      { label: 'Max Amount', value: '₹50L', sub: 'Depending on Estimate' }
    ],
    baseRoi: 8.20,
    marketRoi: 10.50,
    imageUrl: '/src/assets/images/home_renovation_real_1783043067512.jpg'
  },
  'Top up Loan': {
    id: 'Top up Loan',
    title: 'Step-up / Top-up Loan',
    description: 'Access additional funds on your existing home loan for any personal or business need.',
    longDescription: 'Unlock the equity in your home. A top-up loan is the cheapest way to get multi-purpose funding. Use it for weddings, education, business expansion, or debt consolidation at rates significantly lower than any other unsecured loan.',
    icon: Plus,
    features: ['No usage restrictions', 'Cheapest multipurpose loan', 'Matches base home loan tenure', 'Zero technical check in same bank'],
    documents: [
      { category: 'Existing Loan', docs: ['Statement of Account (SOA) of loan (Mandatory)', 'Bank statement wherein loan installment is going (Mandatory)', 'Last 6 months repayment track record'] },
      { category: 'Income Docs', docs: ['Bank statement wherein salary income is coming (Mandatory for Salaried)', 'Bank statement wherein business income is coming (Mandatory for Self-Employed)', 'Recent Bank Statement', 'Updated ITR/Form 16'] }
    ],
    infographics: [
      { label: 'ROI Gap', value: '2%', sub: 'Above Home Loan Rate' },
      { label: 'Max Amount', value: '100%', sub: 'Of Original Sanction' },
      { label: 'Process', value: 'Paperless', sub: 'For existing customers' }
    ],
    baseRoi: 8.40,
    marketRoi: 9.80,
    imageUrl: '/src/assets/images/top_up_loan_real_1783043081197.jpg'
  },
  'Loan Against Property': {
    id: 'Loan Against Property',
    title: 'Loan Against Property (LAP)',
    description: 'Leverage your residential or commercial property to get high-value funding.',
    longDescription: 'Turn your property into working capital. LAP offers high-value loans for long tenures, making it ideal for business expansion, child education abroad, or large medical contingencies.',
    icon: Building,
    features: ['Funding for residential & commercial assets', 'LTV up to 65%', 'Tenure up to 20 years', 'Overdraft facility available'],
    documents: [
      { category: 'Property', docs: ['Original Title Deeds', 'Property Tax Receipts', 'Approved Plan'] },
      { category: 'Business (if self-emp)', docs: ['3 Year ITR with Audit Report', 'GST Returns', 'Business Continuity Proof'] }
    ],
    infographics: [
      { label: 'Interest Rate', value: '9%-11%', sub: 'Variable/Fixed' },
      { label: 'Max LTV', value: '65%', sub: 'Market Value' },
      { label: 'Repayment', value: 'Flexible', sub: 'EMI or Overdraft' }
    ],
    baseRoi: 9.00,
    marketRoi: 10.75,
    imageUrl: '/src/assets/images/loan_against_prop_real_1783043091943.jpg'
  },
  'Commercial Loan': {
    id: 'Commercial Loan',
    title: 'Commercial Property Loan',
    description: 'Finance your office, shop, or showroom with ease.',
    longDescription: 'Establish your business headquarters or invest in high-yield commercial real estate. Our specialized commercial team handles the complex due diligence required for commercial assets, ensuring smooth funding for shops, showrooms, and office spaces.',
    icon: Building2,
    features: ['High-value commercial funding', 'Funding for under-construction units', 'Lease Rental Discounting (LRD) options', 'Special rates for professionals'],
    documents: [
      { category: 'Commercial Docs', docs: ['Sale Agreement', 'NOC from Builder', 'Occupancy Certificate'] },
      { category: 'Financials', docs: ['3 Years audited financial statements', 'Bank statements for 12 months'] }
    ],
    infographics: [
      { label: 'LTV (Office)', value: '55%', sub: 'Standard Margin' },
      { label: 'LRD Rate', value: '8.75%', sub: 'Revenue Backed' },
      { label: 'Max Tenure', value: '15Y', sub: 'Business Focus' }
    ],
    baseRoi: 8.75,
    marketRoi: 10.25,
    imageUrl: '/src/assets/images/commercial_loan_real_1783043102682.jpg'
  },
  'NRI Loan': {
    id: 'NRI Loan',
    title: 'NRI Home Loan',
    description: 'Tailored home loan solutions for NRIs looking to invest in India.',
    longDescription: 'Buying a home in India while living abroad should be simple. We offer specialized NRI desks to manage remote documentation, power of attorney (POA) requirements, and NRE/NRO account linkages for seamless EMI payments.',
    icon: Globe,
    features: ['Specialized NRI support desk', 'POA based processing', 'Remote documentation assistance', 'Digital-first appraisal'],
    documents: [
      { category: 'Visa & Passport', docs: ['Valid Passport & Visa copy', 'Overseas address proof', 'Entry/Exit stamps'] },
      { category: 'Overseas Income', docs: ['Last 6 months salary account statement', 'Employment Contract', 'CPA/Tax returns in country of residence'] }
    ],
    infographics: [
      { label: 'Tenure (NRI)', value: '20Y', sub: 'Age Bound' },
      { label: 'Self-POA', value: 'Yes', sub: 'Remote Support' },
      { label: 'Repayment', value: 'NRE/NRO', sub: 'Auto-Debit' }
    ],
    baseRoi: 7.50,
    marketRoi: 9.10,
    imageUrl: '/src/assets/images/nri_loan_real_1783043114804.jpg'
  }
};

export function ProductPage({ productId: initialProductId, onBack, onApply, onArticleClick }: { productId: string, onBack: () => void, onApply: (cat?: string) => void, onArticleClick?: (article: any) => void }) {
  const [activeProductId, setActiveProductId] = useState(initialProductId);
  const data = PRODUCT_DATA[activeProductId] || PRODUCT_DATA['New Home Loan'];

  const newsScrollRef = useRef<HTMLDivElement>(null);

  const scrollNews = (direction: 'left' | 'right') => {
    if (newsScrollRef.current) {
      const scrollAmount = 340;
      newsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const [activeTab, setActiveTab] = useState<'docs' | 'eligibility' | 'repayment'>('docs');
  const [activeFaqTab, setActiveFaqTab] = useState<'general' | 'eligibility' | 'documents' | 'fees' | 'repayment'>('general');
  
  // Specific states for the Loan Against Property custom calculator
  const [lapPropertyType, setLapPropertyType] = useState<'residential' | 'commercial'>('residential');
  const [lapAmount, setLapAmount] = useState(10000000); // Default 1 Crore (10,000,000)
  const [lapTermUnit, setLapTermUnit] = useState<'years' | 'months'>('years');
  const [lapTerm, setLapTerm] = useState(15); // Default 15 years
  const [lapInterestRate, setLapInterestRate] = useState(9.0); // Default 9.0%

  // Inline edit states for LAP calculator
  const [isEditingLapAmount, setIsEditingLapAmount] = useState(false);
  const [isEditingLapTerm, setIsEditingLapTerm] = useState(false);
  const [isEditingLapInterestRate, setIsEditingLapInterestRate] = useState(false);

  // States for interactive comparison tool
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Reusable official bank logo component using high-fidelity vector graphics
  const renderLogo = (bank: any) => {
    return <BankLogo bank={bank} size="md" />;
  };

  const productBaseRoi = data.baseRoi || 8.95;
  const maxProductTenure = data.title.includes('Home') ? 30 : data.title.includes('Property') ? 20 : data.title.includes('Car') ? 7 : 5;

  const lapBanks = [
    {
      id: 'sbi-lap',
      name: 'State Bank of India',
      baseRoi: Number(productBaseRoi.toFixed(2)),
      maxRoi: Number((productBaseRoi + 1.45).toFixed(2)),
      pfPercent: 0.35,
      pfMin: 5000,
      pfMax: 25000,
      pfLabel: '0.35% or ₹25k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 150000000,
      fallbackColor: 'bg-[#0072bc]',
      fallbackText: 'SBI'
    },
    {
      id: 'hdfc-lap',
      name: 'HDFC Bank Ltd',
      baseRoi: Number((productBaseRoi + 0.15).toFixed(2)),
      maxRoi: Number((productBaseRoi + 1.75).toFixed(2)),
      pfPercent: 0.50,
      pfMin: 7500,
      pfMax: 50000,
      pfLabel: '0.50% or ₹50k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 250000000,
      fallbackColor: 'bg-[#004C8F]',
      fallbackText: 'HDFC'
    },
    {
      id: 'icici-lap',
      name: 'ICICI Bank Ltd',
      baseRoi: Number((productBaseRoi + 0.20).toFixed(2)),
      maxRoi: Number((productBaseRoi + 1.95).toFixed(2)),
      pfPercent: 0.50,
      pfMin: 10000,
      pfMax: 100000,
      pfLabel: '0.50% or ₹100k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 100000000,
      fallbackColor: 'bg-[#B02A30]',
      fallbackText: 'ICICI'
    },
    {
      id: 'axis-lap',
      name: 'Axis Bank Ltd',
      baseRoi: Number((productBaseRoi + 0.20).toFixed(2)),
      maxRoi: Number((productBaseRoi + 2.10).toFixed(2)),
      pfPercent: 0.75,
      pfMin: 8000,
      pfMax: 75000,
      pfLabel: '0.75% or ₹75k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 120000000,
      fallbackColor: 'bg-[#97144D]',
      fallbackText: 'AXIS'
    },
    {
      id: 'kotak-lap',
      name: 'Kotak Mahindra Bank',
      baseRoi: Number((productBaseRoi + 0.05).toFixed(2)),
      maxRoi: Number((productBaseRoi + 1.65).toFixed(2)),
      pfPercent: 0.50,
      pfMin: 6000,
      pfMax: 40000,
      pfLabel: '0.50% or ₹40k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 80000000,
      fallbackColor: 'bg-[#003974]',
      fallbackText: 'KOTAK'
    },
    {
      id: 'bob-lap',
      name: 'Bank of Baroda',
      baseRoi: Number((productBaseRoi + 0.10).toFixed(2)),
      maxRoi: Number((productBaseRoi + 1.50).toFixed(2)),
      pfPercent: 0.35,
      pfMin: 5000,
      pfMax: 20000,
      pfLabel: '0.35% or ₹20k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 100000000,
      fallbackColor: 'bg-[#F26522]',
      fallbackText: 'BOB'
    },
    {
      id: 'federal-lap',
      name: 'Federal Bank',
      baseRoi: Number((productBaseRoi + 0.25).toFixed(2)),
      maxRoi: Number((productBaseRoi + 1.80).toFixed(2)),
      pfPercent: 0.50,
      pfMin: 5000,
      pfMax: 30000,
      pfLabel: '0.50% or ₹30k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 75000000,
      fallbackColor: 'bg-[#004cbe]',
      fallbackText: 'FED'
    },
    {
      id: 'union-lap',
      name: 'Union Bank of India',
      baseRoi: Number((productBaseRoi + 0.15).toFixed(2)),
      maxRoi: Number((productBaseRoi + 1.60).toFixed(2)),
      pfPercent: 0.35,
      pfMin: 5000,
      pfMax: 25000,
      pfLabel: '0.35% or ₹25k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 90000000,
      fallbackColor: 'bg-[#00579c]',
      fallbackText: 'UBI'
    },
    {
      id: 'pnb-lap',
      name: 'PNB Housing Finance',
      baseRoi: Number((productBaseRoi + 0.40).toFixed(2)),
      maxRoi: Number((productBaseRoi + 2.20).toFixed(2)),
      pfPercent: 0.50,
      pfMin: 7500,
      pfMax: 50000,
      pfLabel: '0.50% or ₹50k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 100000000,
      fallbackColor: 'bg-[#A21D21]',
      fallbackText: 'PNB'
    },
    {
      id: 'lic-lap',
      name: 'LIC Housing Finance',
      baseRoi: Number((productBaseRoi + 0.20).toFixed(2)),
      maxRoi: Number((productBaseRoi + 1.70).toFixed(2)),
      pfPercent: 0.35,
      pfMin: 5000,
      pfMax: 30000,
      pfLabel: '0.35% or ₹30k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 150000000,
      fallbackColor: 'bg-[#004A8F]',
      fallbackText: 'LIC'
    },
    {
      id: 'bajaj-lap',
      name: 'Bajaj Housing Finance',
      baseRoi: Number((productBaseRoi + 0.25).toFixed(2)),
      maxRoi: Number((productBaseRoi + 1.85).toFixed(2)),
      pfPercent: 0.50,
      pfMin: 6000,
      pfMax: 45000,
      pfLabel: '0.50% or ₹45k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 120000000,
      fallbackColor: 'bg-[#004C97]',
      fallbackText: 'BAJAJ'
    },
    {
      id: 'tata-lap',
      name: 'Tata Capital',
      baseRoi: Number((productBaseRoi + 0.30).toFixed(2)),
      maxRoi: Number((productBaseRoi + 1.90).toFixed(2)),
      pfPercent: 0.50,
      pfMin: 7500,
      pfMax: 50000,
      pfLabel: '0.50% or ₹50k',
      pfSub: 'whichever is lower',
      maxTenure: maxProductTenure,
      maxAmount: 85000000,
      fallbackColor: 'bg-[#005696]',
      fallbackText: 'TATA'
    }
  ];

  // Update default rate when asset type changes
  useEffect(() => {
    setLapInterestRate(lapPropertyType === 'residential' ? 9.0 : 9.5);
  }, [lapPropertyType]);

  // Reset states when product changes
  useEffect(() => {
    setActiveProductId(initialProductId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialProductId]);

  const handleProductToggle = (id: string) => {
    setActiveProductId(id);
  };

  const renderTitle = (title: string) => {
    const parts = title.trim().split(' ');
    if (parts.length <= 1) {
      return <span className="text-[#10B981] font-black italic">{title}</span>;
    }
    const lastWord = parts.pop();
    return (
      <>
        {parts.join(' ')}{' '}
        <span className="text-[#10B981] font-black italic">{lastWord}</span>
      </>
    );
  };

  // Comparative Sandbox math
  const calculateEmi = (principal: number, annualRate: number, years: number) => {
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;
    return Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));
  };

  // Math for LAP specific custom calculator
  const lapTermInYears = lapTermUnit === 'years' ? lapTerm : Math.max(1, Math.round(lapTerm / 12));
  const lapTermInMonths = lapTermUnit === 'months' ? lapTerm : lapTerm * 12;
  const lapEmiVal = calculateEmi(lapAmount, lapInterestRate, lapTermInYears);
  const lapTotalInterestVal = Math.max(0, (lapEmiVal * lapTermInMonths) - lapAmount);
  const lapTotalVal = lapAmount + lapTotalInterestVal;

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const faqTabs = [
    { id: 'general', label: 'Generals' },
    { id: 'eligibility', label: 'Eligibility Criteria' },
    { id: 'documents', label: 'Required Documents' },
    { id: 'fees', label: 'Fees & Interest' },
    { id: 'repayment', label: 'Repayment Terms' }
  ] as const;

  const currentFaqs = {
    general: [
      {
        q: `What exactly is a ${data.title}?`,
        a: `A ${data.title} is a customized property financing solution designed specifically for your needs. ParrotMoney helps you secure this with a starting rate of ${data.baseRoi.toFixed(2)}% with highly flexible terms.`
      },
      {
        q: "How does ParrotMoney help me get a better rate?",
        a: "We act as your digital advocate. Our platform matches your financial profile with the exact credit policies of 25+ major lenders, forcing them to compete for your loan and offer their absolute lowest possible rates."
      },
      {
        q: "Is ParrotMoney a bank or an independent direct lender?",
        a: "ParrotMoney is India's premium digital loan facilitation platform and advisory. We partner directly with 25+ top-tier institutional banks and NBFCs to ensure seamless digital integration and direct processing."
      },
      {
        q: "What is the turnaround time for loan approval?",
        a: "With our direct API integrations, we deliver a digital pre-sanction letter in under 24 hours. The entire disbursement process, including final legal and technical approvals, takes just 5 to 7 business days."
      },
      {
        q: "Does using ParrotMoney cost me any service fee?",
        a: "Not at all. ParrotMoney's services are 100% free for all borrowers. We do not charge any upfront advisory, brokerage, or service markup. You only pay official statutory fees directly to the chosen bank."
      },
      {
        q: "Can I apply for this loan online from anywhere?",
        a: "Yes, the entire end-to-end journey is fully digitized. You can check eligibility, upload documents, choose lenders, and get your digital sanction letter from the comfort of your home or office."
      }
    ],
    eligibility: [
      {
        q: "What are the core age requirements for this loan?",
        a: "The minimum age requirement is 21 years at the time of application, and the maximum is 60 to 65 years at the time of loan maturity, depending on whether you are salaried or self-employed."
      },
      {
        q: "What is the minimum monthly income requirement?",
        a: "Lenders typically require a minimum net monthly income of ₹15,000 for salaried applicants in tier-2 cities, and ₹25,000 or above for tier-1 metro cities."
      },
      {
        q: "What is the minimum credit score needed for instant sanction?",
        a: "Most partners require a credit score of 650 or higher. A score of 750 or above is ideal and qualifies you for pre-approved corporate interest offers, higher LTV ratios, and expedited disbursal."
      },
      {
        q: "Can a co-applicant's income be combined to boost eligibility?",
        a: "Absolutely. Adding an immediate family member (spouse, parent, or sibling) as a co-applicant allows you to pool incomes, significantly enhancing your overall eligibility and maximum loan amount."
      },
      {
        q: "Are self-employed individuals eligible for this loan?",
        a: "Yes, self-employed professionals and business owners are fully eligible. They need to show a stable business vintage of at least 2 to 3 years with audited financial statements."
      },
      {
        q: "How do lenders assess my repayment capability?",
        a: "Lenders use the Fixed Obligation to Income Ratio (FOIR). Generally, your total monthly debt obligations, including the proposed EMI, should not exceed 50% to 60% of your net monthly income."
      }
    ],
    documents: [
      {
        q: "What identity and address proofs do I need to prepare?",
        a: "You need to provide your PAN card (mandatory for tax purposes) paired with any one official valid document like Aadhaar card, valid passport, voter ID, or driving license."
      },
      {
        q: "Which income documents are required for salaried applicants?",
        a: "Salaried applicants should provide salary slips for the last 3 months, Form 16 for the past 2 financial years, and the last 6 months of bank statements showing regular salary credits."
      },
      {
        q: "What documentation does a self-employed applicant need?",
        a: "Self-employed individuals must provide Income Tax Returns (ITR) with complete computation sheets for the last 2 to 3 years, audited Balance Sheets, and 6 to 12 months of active business bank statements."
      },
      {
        q: "Do I need to submit original property documents immediately?",
        a: "No, only clear scanned copies are needed for legal appraisal and initial sanctioning. Original documents are securely deposited with the lending bank only at the time of signing the final loan agreement."
      },
      {
        q: "What property documents are required for a home loan?",
        a: "Key property documents include the registered Sale Agreement, Title Deeds establishing clear chain of ownership, approved building layout plan, and a current tax receipt."
      },
      {
        q: "How does ParrotMoney protect my uploaded documents?",
        a: "We employ banking-grade 256-bit SSL encryption. Your documents are shared exclusively with authorized lenders through secure APIs only after you explicitly grant permission."
      }
    ],
    fees: [
      {
        q: `What is the actual starting interest rate for a ${data.title}?`,
        a: `The starting interest rate begins at an ultra-low ${data.baseRoi.toFixed(2)}% per annum, calculated on a monthly reducing balance basis. The final offered rate is based on your credit score and profile.`
      },
      {
        q: "What is the typical processing fee charged by banks?",
        a: "Processing fees range from 0% to 0.50% of the total loan amount. ParrotMoney frequently negotiates complete processing fee waivers with specific partner banks for our customers."
      },
      {
        q: "Are there any hidden charges or administrative markups?",
        a: "None. We believe in absolute transparency. All charges—including legal verification fees, property valuation fees, stamp duty, and CERSAI charges—are itemized clearly in your digital sanction letter."
      },
      {
        q: "Is there a difference between fixed and floating interest rates?",
        a: "Yes. Fixed rates remain constant throughout the tenure but are usually 1% to 2% higher. Floating rates fluctuate based on market benchmarks and are typically cheaper over the long run."
      },
      {
        q: "Are there any annual maintenance or account keeping fees?",
        a: "No. Standard retail home loans do not carry any monthly or annual maintenance charges. The interest and principal amortization are the only ongoing obligations."
      },
      {
        q: "How is interest calculated—on daily or monthly reducing balance?",
        a: "Almost all modern institutional banks calculate interest on a monthly reducing balance. This ensures that every EMI paid immediately reduces the principal on which subsequent interest is computed."
      }
    ],
    repayment: [
      {
        q: "What repayment tenures can I choose for my loan?",
        a: "We offer highly flexible repayment tenures starting from 5 years up to 30 years, letting you balance your monthly EMI budget with the total interest payout."
      },
      {
        q: "Are there any charges for making prepayments on my loan?",
        a: "Under RBI guidelines, individual borrowers pay absolutely zero prepayment or foreclosure charges on any floating-rate home loans, regardless of when or how much they prepay."
      },
      {
        q: "How is my monthly EMI amount calculated?",
        a: "EMIs are calculated using standard formula: [P x R x (1+R)^N]/[(1+R)^N-1], where P is principal, R is monthly interest rate, and N is the total number of monthly installments."
      },
      {
        q: "What is the standard procedure for EMI repayment?",
        a: "Repayment is automated via standard Electronic Clearing Service (ECS) or NACH debit mandates linked to your primary salary or active business bank account."
      },
      {
        q: "Can I increase my EMI payment or tenure later?",
        a: "Yes, you can request an EMI restructure or make part-payments to reduce your outstanding principal, which will automatically shorten your tenure or lower subsequent EMIs."
      },
      {
        q: "What happens if my auto-debit bounces or fails?",
        a: "A failed debit triggers standard bounce charges from both banks (usually ₹250 to ₹500) and incurs overdue panel interest. Promptly clear any missed EMIs to safeguard your CIBIL score."
      }
    ]
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#1E293B] selection:bg-[#10B981]/20 selection:text-[#0F172A] font-sans pb-0">
      
      {/* Product Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-slate-200">
        
        {/* Abstract blueprint style vector background */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-prod-hero" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-prod-hero)" />
          </svg>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10 text-left">
          
          {/* Breadcrumb back */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={onBack}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-[#10B981] transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1.5 transition-transform" /> Back to Home
            </button>
          </div>

          {/* Product Hero Banner matching landing page style & color theme */}
          <div className="w-full relative mb-12 animate-fade-in">
            <div className={`w-full bg-gradient-to-br from-[#EEF2F6] via-white to-[#F1F5F9] border border-slate-200/60 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.03)] relative overflow-hidden px-6 sm:px-10 lg:px-14 ${data.id === 'Loan Against Property' ? 'py-7 md:py-11' : 'py-10 md:py-16'}`}>
              
              {/* Ambient light glow spots */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/[0.22] rounded-full filter blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#10B981]/[0.05] rounded-full filter blur-[100px] pointer-events-none" />

              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 text-left">
                
                {/* Left Content Column */}
                <motion.div 
                  key={`content-${data.id}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="lg:col-span-7 space-y-6 sm:space-y-8"
                >
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200/60 rounded-full shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                        {data.id}
                      </span>
                    </motion.div>
                    
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-slate-900 leading-[1.05]">
                      {renderTitle(data.title)}
                    </h1>
                    
                    <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl leading-relaxed">
                      {data.description}
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                    <button 
                      onClick={() => onApply(data.id)}
                      className="bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold px-8 py-4 rounded-full text-xs uppercase tracking-widest shadow-lg shadow-[#10B981]/15 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Apply Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-8 pt-6 border-t border-slate-200/60 max-w-lg">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Zero Credit Score Impact</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-[#10B981]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">25+ Direct Lenders</span>
                    </div>
                  </div>
                </motion.div>

                {/* Right Graphic/Token Cluster Column - Expanded Hero Card Box */}
                <motion.div 
                  key={`token-cluster-${data.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="lg:col-span-5 relative flex items-center justify-center min-h-[420px] sm:min-h-[460px] lg:min-h-[500px] w-full"
                >
                  {/* Subtle ambient backdrop aura */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-slate-500/10 rounded-3xl blur-2xl pointer-events-none" />

                  {/* 1. NEW HOME LOAN GRAPHIC: Glassmorphism House Blueprint & Sanction Pass */}
                  {data.id === 'New Home Loan' && (
                    <div className="relative w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] flex items-center justify-center">
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_30px_70px_-15px_rgba(16,185,129,0.15)] rounded-[2.5rem] p-6 sm:p-7 md:p-8 text-left relative overflow-hidden text-slate-900"
                      >
                        {/* Decorative Top Accent Bar */}
                        <div className="h-2 w-28 bg-gradient-to-r from-[#10B981] to-emerald-300 rounded-full mb-5" />
                        
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-[#10B981]">
                              <Home className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] block">Sanction Pass</span>
                              <span className="text-base font-extrabold text-slate-900">Dream Home Pass</span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                            Pre-Approved
                          </span>
                        </div>

                        {/* Interactive Blueprint Grid Box */}
                        <div className="bg-gradient-to-br from-emerald-50/90 via-slate-50 to-white rounded-2xl p-5 text-slate-900 relative overflow-hidden mb-4 border border-emerald-200/80 shadow-xs">
                          <div className="absolute right-0 top-0 w-36 h-36 bg-[#10B981]/10 rounded-full blur-xl pointer-events-none" />
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Sanction Ceiling</span>
                            <span className="text-xs font-black text-[#10B981] bg-emerald-100/80 px-3 py-1 rounded-md border border-emerald-200">{data.baseRoi}% p.a.</span>
                          </div>
                          
                          <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 italic mb-4">₹75,00,000</div>

                          {/* LTV Funding Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                              <span>Max Funding LTV</span>
                              <span className="text-[#10B981] font-black">90% Sanctioned</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/60">
                              <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "90%" }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="bg-gradient-to-r from-emerald-400 to-[#10B981] h-full rounded-full" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Features Row */}
                        <div className="grid grid-cols-2 gap-3 text-slate-600">
                          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center gap-2.5">
                            <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0" />
                            <div>
                              <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Processing</span>
                              <span className="text-xs font-bold text-slate-800">₹0 Fee</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5">
                            <Award className="w-5 h-5 text-[#10B981] shrink-0" />
                            <div>
                              <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Govt Subsidy</span>
                              <span className="text-xs font-bold text-slate-800">PMAY Ready</span>
                            </div>
                          </div>
                        </div>

                        {/* Floating Pill Badge */}
                        <motion.div 
                          animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
                          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-3 -right-2 bg-gradient-to-r from-emerald-600 to-[#10B981] text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>30 Yrs Tenure</span>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}

                  {/* 2. LOAN TRANSFER GRAPHIC: Interactive Rate Comparison & Savings Engine */}
                  {data.id === 'Loan Transfer' && (
                    <div className="relative w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] flex items-center justify-center">
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_30px_70px_-15px_rgba(16,185,129,0.15)] rounded-[2.5rem] p-6 sm:p-7 md:p-8 text-left relative overflow-hidden text-slate-900"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-[#10B981]">
                              <RefreshCw className="w-6 h-6 animate-spin-slow" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] block">Balance Transfer</span>
                              <span className="text-base font-extrabold text-slate-900">Rate Switch Engine</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1.5 rounded-full">
                            Express 72 Hrs
                          </span>
                        </div>

                        {/* Comparative Rate Switch Cards */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {/* Current Bank */}
                          <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3.5 text-center">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Existing Bank</span>
                            <span className="text-xl font-black text-slate-500 line-through">8.85%</span>
                            <span className="text-[9px] font-bold text-slate-500 block mt-0.5">High EMI Burden</span>
                          </div>

                          {/* Parrot ROI */}
                          <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 text-center relative overflow-hidden shadow-xs">
                            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block mb-1">Parrot Best Rate</span>
                            <span className="text-2xl font-black text-[#10B981] italic">7.15%</span>
                            <span className="text-[9px] font-extrabold text-emerald-700 block mt-0.5">1.70% Rate Drop</span>
                          </div>
                        </div>

                        {/* Total Net Savings Display */}
                        <div className="bg-gradient-to-br from-emerald-50/80 via-slate-50 to-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 text-center relative mb-4 shadow-xs">
                          <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest block mb-1">Net Interest Saved Over Tenure</span>
                          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight italic">
                            ₹14,20,000
                          </span>
                        </div>

                        {/* Top-up tag */}
                        <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5">
                          <span className="text-xs font-bold text-slate-600">Top-Up Cash Bonus</span>
                          <span className="text-sm font-black text-[#10B981]">+ ₹25 Lakhs</span>
                        </div>

                        {/* Floating Badge */}
                        <motion.div 
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-3 -right-2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5"
                        >
                          <TrendingDown className="w-4 h-4" />
                          <span>0 Penalty Switch</span>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}

                  {/* 3. PLOT + CONSTRUCTION GRAPHIC: Stage Milestone Construction Roadmap */}
                  {data.id === 'Plot + Construction' && (
                    <div className="relative w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] flex items-center justify-center">
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_30px_70px_-15px_rgba(16,185,129,0.15)] rounded-[2.5rem] p-6 sm:p-7 md:p-8 text-left relative overflow-hidden text-slate-900"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700">
                              <Mountain className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] block">Composite Loan</span>
                              <span className="text-base font-extrabold text-slate-900">Plot + Build Roadmap</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-full">
                            80% LTV Limit
                          </span>
                        </div>

                        {/* Milestone Roadmap Stepper */}
                        <div className="space-y-2.5 mb-4 relative z-10">
                          {/* Step 1 */}
                          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#10B981] text-white font-black text-xs flex items-center justify-center">✓</div>
                              <div>
                                <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider block">Stage 1: Plot Purchase</span>
                                <span className="text-xs font-bold text-slate-800">100% Disbursed</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded border border-emerald-200">Cleared</span>
                          </div>

                          {/* Step 2 */}
                          <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-black text-xs flex items-center justify-center">2</div>
                              <div>
                                <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-wider block">Stage 2: Structure Build</span>
                                <span className="text-xs font-bold text-slate-800">Tranche 1 Disbursed</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 bg-slate-200/80 px-2.5 py-0.5 rounded border border-slate-300">Active</span>
                          </div>

                          {/* Step 3 */}
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between opacity-80">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">3</div>
                              <div>
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Stage 3: Finishing</span>
                                <span className="text-xs font-bold text-slate-600">Final Tranche Ready</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-500">Pending</span>
                          </div>
                        </div>

                        {/* Moratorium Badge */}
                        <div className="flex items-center justify-between text-xs bg-emerald-50/60 border border-emerald-200/60 rounded-xl px-4 py-2.5">
                          <span className="text-xs font-bold text-slate-800">3-Yr Construction Moratorium</span>
                          <span className="text-xs font-black text-emerald-700 uppercase">Interest Only</span>
                        </div>

                        {/* Title stamp pill */}
                        <motion.div 
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-3 -right-2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Title Vetted</span>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}

                  {/* 4. HOME RENOVATION GRAPHIC: Home Upgrade Pass & Scope Financer */}
                  {data.id === 'Home Renovation' && (
                    <div className="relative w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] flex items-center justify-center">
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 5.3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_30px_70px_-15px_rgba(16,185,129,0.15)] rounded-[2.5rem] p-6 sm:p-7 md:p-8 text-left relative overflow-hidden text-slate-900"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700">
                              <Hammer className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] block">Renovation Capital</span>
                              <span className="text-base font-extrabold text-slate-900">Home Upgrade Pass</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-full">
                            48H Quick Sanction
                          </span>
                        </div>

                        {/* Upgrade Budget Box */}
                        <div className="bg-gradient-to-br from-emerald-50/90 via-slate-50/30 to-white rounded-2xl p-5 text-slate-900 relative overflow-hidden mb-4 border border-emerald-200/80 shadow-xs">
                          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider block mb-1">Max Renovation Limit</span>
                          <div className="text-3xl sm:text-4xl font-black text-slate-900 italic tracking-tight mb-3">Up to ₹50,00,000</div>
                          
                          <div className="flex items-center justify-between pt-2.5 border-t border-emerald-200/60 text-xs">
                            <span className="text-xs font-bold text-slate-600">Renovation Rate</span>
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">{data.baseRoi}% p.a.</span>
                          </div>
                        </div>

                        {/* Renovation Scope Grid */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold mb-4">
                          <div className="bg-slate-50 border border-slate-200/80 py-2.5 rounded-xl text-slate-700">Kitchen & Bath</div>
                          <div className="bg-slate-50 border border-slate-200/80 py-2.5 rounded-xl text-slate-700">Roof & Structure</div>
                          <div className="bg-slate-50 border border-slate-200/80 py-2.5 rounded-xl text-slate-700">Interior Styling</div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div 
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 4.3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-3 -right-2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>100% Estimate Funded</span>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}

                  {/* 5. TOP UP LOAN GRAPHIC: Instant Cash Boost & Multi-Purpose Capital */}
                  {data.id === 'Top up Loan' && (
                    <div className="relative w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] flex items-center justify-center">
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_30px_70px_-15px_rgba(16,185,129,0.15)] rounded-[2.5rem] p-6 sm:p-7 md:p-8 text-left relative overflow-hidden text-slate-900"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-[#10B981]">
                              <Plus className="w-6 h-6 stroke-[3]" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] block">Cash Liquidity</span>
                              <span className="text-base font-extrabold text-slate-900">Instant Top-Up Boost</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-full">
                            Zero Re-Verification
                          </span>
                        </div>

                        {/* Top-up Cash Release Box */}
                        <div className="bg-gradient-to-br from-emerald-50/90 via-slate-50 to-white rounded-2xl p-5 text-slate-900 relative overflow-hidden mb-4 border border-emerald-200/80 shadow-xs">
                          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider block mb-1">Pre-Approved Liquidity Limit</span>
                          <div className="text-3xl sm:text-4xl font-black text-slate-900 italic tracking-tight mb-3">₹25,00,000</div>
                          
                          <div className="flex items-center justify-between pt-2.5 border-t border-emerald-200/60 text-xs">
                            <span className="text-xs font-bold text-slate-600">Top-Up Interest Rate</span>
                            <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded border border-emerald-200">{data.baseRoi}% p.a.</span>
                          </div>
                        </div>

                        {/* Multi Purpose List */}
                        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs text-slate-700 font-bold flex items-center justify-between mb-1">
                          <span className="text-xs uppercase text-slate-400 font-extrabold">Allowed Usage</span>
                          <span className="text-slate-800 font-black">100% Flexible Cash</span>
                        </div>

                        {/* Floating Badge */}
                        <motion.div 
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-3 -right-2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Paperless Sanction</span>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}

                  {/* 6. LOAN AGAINST PROPERTY (LAP): Property Equity Unlock Scale */}
                  {data.id === 'Loan Against Property' && (
                    <div className="relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[490px] flex items-center justify-center">
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(16,185,129,0.15)] rounded-[2rem] p-4 sm:p-5 md:p-5.5 text-left relative overflow-hidden text-slate-900"
                      >
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700">
                              <Building className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[9px] font-black uppercase text-emerald-600 tracking-[0.2em] block">Mortgage Capital</span>
                              <span className="text-sm font-extrabold text-slate-900">Equity Unlock Engine</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                            75% Max LTV
                          </span>
                        </div>

                        {/* Equity Unlock Flow Graphic */}
                        <div className="bg-gradient-to-br from-emerald-50/90 via-slate-50/30 to-white border border-emerald-200/80 rounded-xl p-3 mb-3 relative shadow-xs">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <div>
                              <span className="text-[8.5px] font-extrabold uppercase text-slate-500 block">Property Valuation</span>
                              <span className="text-sm font-black text-slate-900">₹2.50 Crores</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-emerald-600" />
                            <div className="text-right">
                              <span className="text-[8.5px] font-extrabold uppercase text-emerald-700 block">Cash Unlocked</span>
                              <span className="text-sm font-black text-emerald-600">₹1.85 Crores</span>
                            </div>
                          </div>

                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden p-0.5 border border-slate-200">
                            <div className="bg-gradient-to-r from-slate-700 to-emerald-500 h-full rounded-full w-[75%]" />
                          </div>
                        </div>

                        {/* ROI Comparison vs Personal Loan */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-lg">
                            <span className="text-[8.5px] font-bold text-slate-500 uppercase block">LAP Rate</span>
                            <span className="text-sm font-black text-emerald-600">{data.baseRoi}% p.a.</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-lg">
                            <span className="text-[8.5px] font-bold text-slate-500 uppercase block">Personal Loan</span>
                            <span className="text-sm font-black text-slate-400 line-through">14.50%</span>
                          </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div 
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-3 -right-2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Multi-Purpose Cash</span>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}

                  {/* 7. COMMERCIAL LOAN GRAPHIC: Executive Corporate Yield & LRD Widget */}
                  {data.id === 'Commercial Loan' && (
                    <div className="relative w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] flex items-center justify-center">
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_30px_70px_-15px_rgba(16,185,129,0.15)] rounded-[2.5rem] p-6 sm:p-7 md:p-8 text-left relative overflow-hidden text-slate-900"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] block">Institutional Desk</span>
                              <span className="text-base font-extrabold text-slate-900">Commercial & LRD Portal</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-full">
                            75% LTV Cap
                          </span>
                        </div>

                        {/* Main Sanction Display */}
                        <div className="bg-gradient-to-br from-emerald-50/90 via-slate-50 to-white border border-emerald-200/80 rounded-2xl p-5 mb-4 relative overflow-hidden shadow-xs">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Sanction Limit Up To</span>
                          <div className="text-3xl sm:text-4xl font-black text-slate-900 italic tracking-tight mb-3">₹15,00,00,000</div>
                          
                          {/* Rent Discounting Meter */}
                          <div className="space-y-2 pt-2.5 border-t border-emerald-200/60">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                              <span>Lease Rental Discounting (LRD)</span>
                              <span className="text-emerald-700 font-black">100% Cashflow Linked</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                              <div className="bg-gradient-to-r from-emerald-400 to-[#10B981] h-full rounded-full w-full" />
                            </div>
                          </div>
                        </div>

                        {/* Property Types Row */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold mb-1">
                          <div className="bg-slate-50 border border-slate-200/80 py-2.5 rounded-xl text-slate-700">Office Spaces</div>
                          <div className="bg-slate-50 border border-slate-200/80 py-2.5 rounded-xl text-slate-700">Retail Outlets</div>
                          <div className="bg-slate-50 border border-slate-200/80 py-2.5 rounded-xl text-slate-700">Warehouses</div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div 
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-3 -right-2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5"
                        >
                          <Zap className="w-4 h-4" />
                          <span>15 Yrs Term</span>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}

                  {/* 8. NRI LOAN GRAPHIC: Global Flight Passport & FX Desk */}
                  {data.id === 'NRI Loan' && (
                    <div className="relative w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] flex items-center justify-center">
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_30px_70px_-15px_rgba(16,185,129,0.15)] rounded-[2.5rem] p-6 sm:p-7 md:p-8 text-left relative overflow-hidden text-slate-900"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700">
                              <Globe className="w-6 h-6 animate-spin-slow" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] block">Global Desk</span>
                              <span className="text-base font-extrabold text-slate-900">NRI Fast-Track Pass</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-full">
                            0 Physical Visits
                          </span>
                        </div>

                        {/* Currency FX Strip */}
                        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 mb-4">
                          <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-2.5">Supported Foreign Currencies</span>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="bg-white text-slate-800 border border-slate-200 text-xs font-black px-3 py-1.5 rounded-lg shadow-2xs">USD $</span>
                            <span className="bg-white text-slate-800 border border-slate-200 text-xs font-black px-3 py-1.5 rounded-lg shadow-2xs">AED د.إ</span>
                            <span className="bg-white text-slate-800 border border-slate-200 text-xs font-black px-3 py-1.5 rounded-lg shadow-2xs">GBP £</span>
                            <span className="bg-white text-slate-800 border border-slate-200 text-xs font-black px-3 py-1.5 rounded-lg shadow-2xs">SGD $</span>
                          </div>
                        </div>

                        {/* Features List */}
                        <div className="space-y-1.5 mb-2">
                          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200/60 p-2 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                            <span className="text-[11px] font-bold text-slate-700">Power of Attorney (POA) Online Support</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200/60 p-2 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                            <span className="text-[11px] font-bold text-slate-700">Direct NRE / NRO Account Auto-Debit</span>
                          </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div 
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-3 -right-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>48H Remote Approval</span>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Bottom Feature Strip spanning the bottom of the hero banner */}
              <div className={`${data.id === 'Loan Against Property' ? 'mt-4 sm:mt-5 pt-3.5' : 'mt-8 sm:mt-10 pt-6'} border-t border-slate-200/80 relative z-10 flex flex-wrap items-center justify-start gap-x-8 gap-y-3`}>
                {data.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-[#10B981] shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-700">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

            {/* Properties Qualified for LAP - Just green icons and Names below the hero banner, no boxes */}
            {activeProductId === 'Loan Against Property' && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12 bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200/50"
              >
                <div className="mb-6 text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981] font-mono block mb-1">ELIGIBLE COLLATERAL</span>
                  <h3 className="text-lg md:text-xl font-extrabold text-[#0F172A] tracking-tight font-display">
                    Properties Qualified for Loan Against Property
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 mt-2">
                  {/* Property 1 */}
                  <motion.div 
                    whileHover={{ scale: 1.05, x: 2 }}
                    className="flex items-center gap-2.5 text-left transition-all duration-200 cursor-default"
                  >
                    <Home className="w-5 h-5 text-[#10B981] shrink-0" strokeWidth={1.5} />
                    <span className="text-xs md:text-sm font-bold text-slate-700 leading-tight">Residential Properties</span>
                  </motion.div>

                  {/* Property 2 */}
                  <motion.div 
                    whileHover={{ scale: 1.05, x: 2 }}
                    className="flex items-center gap-2.5 text-left transition-all duration-200 cursor-default"
                  >
                    <Building2 className="w-5 h-5 text-[#10B981] shrink-0" strokeWidth={1.5} />
                    <span className="text-xs md:text-sm font-bold text-slate-700 leading-tight">Commercial Spaces</span>
                  </motion.div>

                  {/* Property 3 */}
                  <motion.div 
                    whileHover={{ scale: 1.05, x: 2 }}
                    className="flex items-center gap-2.5 text-left transition-all duration-200 cursor-default"
                  >
                    <Building className="w-5 h-5 text-[#10B981] shrink-0" strokeWidth={1.5} />
                    <span className="text-xs md:text-sm font-bold text-slate-700 leading-tight">Industrial Assets</span>
                  </motion.div>

                  {/* Property 4 */}
                  <motion.div 
                    whileHover={{ scale: 1.05, x: 2 }}
                    className="flex items-center gap-2.5 text-left transition-all duration-200 cursor-default"
                  >
                    <Building2 className="w-5 h-5 text-[#10B981] shrink-0" strokeWidth={1.5} />
                    <span className="text-xs md:text-sm font-bold text-slate-700 leading-tight">Mixed-Use Buildings</span>
                  </motion.div>

                  {/* Property 5 */}
                  <motion.div 
                    whileHover={{ scale: 1.05, x: 2 }}
                    className="flex items-center gap-2.5 text-left transition-all duration-200 cursor-default"
                  >
                    <Mountain className="w-5 h-5 text-[#10B981] shrink-0" strokeWidth={1.5} />
                    <span className="text-xs md:text-sm font-bold text-slate-700 leading-tight">Approved Land Plots</span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Rest of the content (Title, description, highlights & CTAs) positioned dynamically below the image */}
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start mt-8">
              
              {/* Product Info, Description & CTAs Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-none text-[#0F172A] font-display">
                    {data.title}. <span className="text-[#10B981] font-bold">Optimized.</span>
                  </h1>

                  <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
                    {data.longDescription}
                  </p>
                </div>

                {/* Core CTA Actions */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <button 
                    onClick={() => onApply(data.id)}
                    className="group bg-[#10B981] text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-[#0e9f6e] transition-all shadow-lg shadow-[#10B981]/20 active:scale-95 cursor-pointer"
                  >
                    Start Loan Application <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                  {activeProductId === 'Loan Against Property' && (
                    <a 
                      href="#sandbox-calc" 
                      className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-800 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] text-slate-600 text-center hover:bg-slate-50 transition-all cursor-pointer text-center"
                    >
                      Compare Rates
                    </a>
                  )}
                </div>
              </div>

              {/* Highlights List Column */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981] font-mono block">Premium Advantages</span>
                <div className="grid grid-cols-1 gap-3">
                  {data.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50 hover:border-[#10B981]/35 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          {/* Supplementary Information Row with Infographics & Direct Underwriting Callout */}
          <div className="grid lg:grid-cols-12 gap-8 mt-12 pt-12 border-t border-slate-100/85">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.infographics.map((info, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 group hover:border-[#10B981]/30 transition-all text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full blur-xl pointer-events-none group-hover:bg-[#10B981]/5 transition-all" />
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto text-slate-800 group-hover:bg-[#10B981] group-hover:text-white transition-all transform group-hover:rotate-3 shadow-inner">
                    {i === 0 ? <TrendingUp className="w-5 h-5" /> : i === 1 ? <Clock className="w-5 h-5" /> : <Gauge className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">{info.label}</p>
                    <p className="text-xl font-extrabold text-slate-800 tracking-tight font-display">{info.value}</p>
                    <p className="text-[9px] font-extrabold text-[#10B981] uppercase tracking-wider">{info.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 bg-[#0F172A] p-6 md:p-8 rounded-3xl text-white relative overflow-hidden group shadow-xl border border-white/5 text-left flex flex-col justify-between">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <svg width="100%" height="100%">
                  <pattern id="card-blueprint" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect width="20" height="20" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#card-blueprint)" />
                </svg>
              </div>
              <div className="absolute -bottom-8 -right-8 opacity-[0.12] text-[#10B981] pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-32 h-32" />
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                  <Zap className="w-3 h-3 text-[#10B981]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#10B981]">Direct Corporate Desk</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold font-display italic text-white">Bypass Standard Retail Markup</h3>
                <p className="text-white/60 text-[11px] font-semibold leading-relaxed">
                  Our optimized direct desks negotiate directly with top-tier treasury divisions, shaving an extra <span className="text-[#10B981] font-bold">0.15% to 0.25%</span> off typical branch-level rates for {data.title} files.
                </p>
                <button 
                  onClick={() => onApply(data.id)} 
                  className="text-[#10B981] font-black uppercase text-[10px] tracking-widest flex items-center gap-2 group/btn cursor-pointer bg-transparent border-none p-0 mt-1"
                >
                  Lock My Corporate Rate <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO SHOULD TAKE IT & BENEFITS - Specific for Loan Against Property */}
      {activeProductId === 'Loan Against Property' && (
        <section className="py-20 bg-slate-50 border-b border-slate-200 overflow-hidden">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 text-left">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              
              {/* Who Should Take It Column */}
              <motion.div 
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-5 space-y-6"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981] font-mono block mb-1">TARGET AUDIENCE</span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
                    Who Should Take a Loan Against Property?
                  </h3>
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                    A Loan Against Property (LAP) is one of the most cost-effective borrowing options available, ideal for individuals and businesses seeking high-value financing with low interest rates and extended repayment timelines.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Profile 1 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:border-[#10B981]/15"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center shrink-0 text-[#10B981]">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Business Owners & Entrepreneurs</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        To fund capital expenditures, business expansions, inventory acquisition, or manage short-term working capital needs securely.
                      </p>
                    </div>
                  </motion.div>

                  {/* Profile 2 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:border-[#10B981]/15"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center shrink-0 text-[#10B981]">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Salaried & Self-Employed Professionals</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        To consolidate high-interest debts, finance higher education abroad for children, or cover major medical emergencies with minimal burden.
                      </p>
                    </div>
                  </motion.div>

                  {/* Profile 3 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:border-[#10B981]/15"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center shrink-0 text-[#10B981]">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Property Investors & Asset Owners</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        To monetize idle real estate assets without selling them, unlocking immediate liquidity while retaining ownership and potential asset appreciation.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* 5 Benefits Column */}
              <motion.div 
                initial={{ opacity: 0, x: 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-7 space-y-6"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981] font-mono block mb-1">KEY ADVANTAGES</span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
                    5 Major Benefits of Loan Against Property
                  </h3>
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                    By pledging residential or commercial collateral, you gain access to institutional features and loan terms that unsecured personal or business loans cannot offer.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  
                  {/* Benefit 1 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    whileHover={{ y: -4, borderLeft: "4px solid #10B981", transition: { duration: 0.2 } }}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 group hover:border-[#10B981]/30 transition-all flex gap-4 items-start duration-200 hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-[#10B981]/10 text-[#10B981] rounded-xl flex items-center justify-center shrink-0 font-extrabold text-lg">
                      1
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">LAP Overdraft (LAP OD) Facility</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Secure a flexible overdraft line where you only pay interest on the amount utilized, not the entire sanctioned loan. It provides immediate working capital cushion with zero idle interest costs.
                      </p>
                    </div>
                  </motion.div>

                  {/* Benefit 2 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ y: -4, borderLeft: "4px solid #10B981", transition: { duration: 0.2 } }}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 group hover:border-[#10B981]/30 transition-all flex gap-4 items-start duration-200 hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-[#10B981]/10 text-[#10B981] rounded-xl flex items-center justify-center shrink-0 font-extrabold text-lg">
                      2
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">Significantly Lower Interest Rates</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Since the loan is fully secured by physical real estate, lenders offer interest rates that are up to 40% to 50% cheaper compared to unsecured personal or business loans.
                      </p>
                    </div>
                  </motion.div>

                  {/* Benefit 3 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    whileHover={{ y: -4, borderLeft: "4px solid #10B981", transition: { duration: 0.2 } }}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 group hover:border-[#10B981]/30 transition-all flex gap-4 items-start duration-200 hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-[#10B981]/10 text-[#10B981] rounded-xl flex items-center justify-center shrink-0 font-extrabold text-lg">
                      3
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">Extended Repayment Tenures</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Enjoy long repayment horizons of up to 15 to 20 years. This dramatically lowers your monthly EMI burden compared to short 3-to-5 year tenures of standard business loans.
                      </p>
                    </div>
                  </motion.div>

                  {/* Benefit 4 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    whileHover={{ y: -4, borderLeft: "4px solid #10B981", transition: { duration: 0.2 } }}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 group hover:border-[#10B981]/30 transition-all flex gap-4 items-start duration-200 hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-[#10B981]/10 text-[#10B981] rounded-xl flex items-center justify-center shrink-0 font-extrabold text-lg">
                      4
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">High-Value Loan Sanctions</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Unlock up to 60%-70% of your property's current market value, securing multi-crore sanctions that are impossible to obtain via unsecured lines of credit.
                      </p>
                    </div>
                  </motion.div>

                  {/* Benefit 5 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    whileHover={{ y: -4, borderLeft: "4px solid #10B981", transition: { duration: 0.2 } }}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 group hover:border-[#10B981]/30 transition-all flex gap-4 items-start duration-200 hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-[#10B981]/10 text-[#10B981] rounded-xl flex items-center justify-center shrink-0 font-extrabold text-lg">
                      5
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">Retain Property Ownership & Capital Growth</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Continue to use, occupy, rent out, or benefit from the capital appreciation of your commercial or residential property while utilizing its locked equity to generate high yields elsewhere.
                      </p>
                    </div>
                  </motion.div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>
      )}

      {/* COMPARATIVE ROI LIVE SANDBOX - Masterpiece Tool */}
      <section className="py-20 bg-white border-b border-slate-200" id="sandbox-calc">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 text-left">
          {/* Custom Lender Offers Comparison Table */}
          <div className="w-full">
            <div className="text-left">
              <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A] tracking-tight font-display">
                    Compare {data.title} Offers Across Premium Lenders
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Select two or more lenders to compare interest rates, processing fees, and EMIs side-by-side.
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/50">
                  Live rates for {data.title}
                </div>
              </div>

                {/* Table Card */}
                <div className="bg-white border border-slate-200/80 rounded-[24px] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70">
                          <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-24">COMPARE</th>
                          <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">BANK / NBFC / HFC</th>
                          <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                            INTEREST RATE<br/>FLOATING
                          </th>
                          <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">PROCESSING FEE</th>
                          <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                            EST. MONTHLY EMI<br/>- ({lapTerm} {lapTermUnit === 'years' ? 'YEARS' : 'MONTHS'})
                          </th>
                          <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                            MAXIMUM LOAN<br/>& TENURE
                          </th>
                          <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lapBanks.map((bank) => {
                          const bankEmiVal = calculateEmi(lapAmount, bank.baseRoi, lapTermInYears);
                          const isChecked = selectedBanks.includes(bank.name);

                          return (
                            <tr key={bank.name} className={cn("hover:bg-slate-50/50 transition-colors", isChecked && "bg-emerald-50/20")}>
                              {/* Selection checkbox */}
                              <td className="py-2 px-4 text-center w-24">
                                <input
                                  type="checkbox"
                                  id={`chk-compare-${bank.id}`}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBanks([...selectedBanks, bank.name]);
                                    } else {
                                      setSelectedBanks(selectedBanks.filter(n => n !== bank.name));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-[#10B981] focus:ring-[#10B981] cursor-pointer"
                                />
                              </td>

                              {/* Lender info */}
                              <td className="py-2 px-4">
                                <div className="flex items-center gap-2.5">
                                  {renderLogo(bank)}
                                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{bank.name}</span>
                                </div>
                              </td>

                              {/* Interest Rate */}
                              <td className="py-2 px-4">
                                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{bank.baseRoi.toFixed(2)}% - {bank.maxRoi.toFixed(2)}%</span>
                              </td>

                              {/* Processing Fee */}
                              <td className="py-2 px-4">
                                <div className="flex flex-col items-start justify-center">
                                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{bank.pfLabel}</span>
                                  <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap leading-none mt-0.5">{bank.pfSub}</span>
                                </div>
                              </td>

                              {/* EMI */}
                              <td className="py-2 px-4">
                                <span className="text-xs font-medium text-slate-700 whitespace-nowrap">₹{Math.round(bankEmiVal).toLocaleString('en-IN')}/mo</span>
                              </td>

                              {/* Size and Tenure in one single line as requested */}
                              <td className="py-2 px-4">
                                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                                  {bank.maxAmount >= 10000000 ? `${bank.maxAmount / 10000000} Cr` : `${bank.maxAmount / 100000} L`} / {bank.maxTenure} Years
                                </span>
                              </td>

                              {/* Action */}
                              <td className="py-2 px-4 text-right">
                                <button
                                  id={`btn-lap-compare-enquire-${bank.id}`}
                                  onClick={() => onApply(`${data.title} - ${bank.name}`)}
                                  className="text-xs font-normal text-[#10B981] hover:text-[#0e9f6e] hover:underline cursor-pointer bg-transparent border-none p-0 transition-all"
                                >
                                  Enquire
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sticky Bottom Comparison Panel */}
                <AnimatePresence>
                  {selectedBanks.length > 0 && (
                    <motion.div
                      initial={{ y: 80, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 80, opacity: 0 }}
                      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[40] bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center justify-between gap-6 border border-slate-800 backdrop-blur-md max-w-xl w-[90%]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#10B981] text-slate-950 flex items-center justify-center font-black text-xs">
                          {selectedBanks.length}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Selected for comparison</span>
                          <span className="text-[10px] text-slate-400 hidden sm:inline">Compare side-by-side in real-time</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setSelectedBanks([])}
                          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none py-1.5 px-3"
                        >
                          Clear
                        </button>
                        <button
                          disabled={selectedBanks.length < 2}
                          onClick={() => setIsCompareModalOpen(true)}
                          className={cn(
                            "text-xs font-black uppercase tracking-wider py-2.5 px-5 rounded-full transition-all cursor-pointer border-none shadow-md",
                            selectedBanks.length >= 2 
                              ? "bg-[#10B981] hover:bg-[#0e9f6e] text-slate-950 active:scale-95" 
                              : "bg-slate-800 text-slate-500 cursor-not-allowed"
                          )}
                        >
                          {selectedBanks.length < 2 ? "Select 2+ Lenders" : "Compare Side-by-Side"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Compare Side-by-Side Modal */}
                <AnimatePresence>
                  {isCompareModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCompareModalOpen(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                      />

                      {/* Modal Content container */}
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[32px] shadow-3xl overflow-hidden flex flex-col border border-slate-200"
                      >
                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                          <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-[9px] font-black uppercase tracking-wider mb-2">
                              <Sparkles className="w-3.5 h-3.5" /> Side-by-Side Analysis
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
                              Lender Comparison Matrix
                            </h3>
                            <p className="text-slate-500 text-xs mt-1">
                              Calculated on custom parameters: <strong className="text-slate-800">₹{(lapAmount).toLocaleString('en-IN')}</strong> for <strong className="text-slate-800">{lapTerm} {lapTermUnit}</strong>.
                            </p>
                          </div>
                          <button
                            onClick={() => setIsCompareModalOpen(false)}
                            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-800 transition-all cursor-pointer border-none bg-transparent"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Comparative Matrix - Scrollable Area */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                          {/* Pairwise Interest Difference Banner when exactly 2 banks selected */}
                          {(() => {
                            const comparedLapBanks = lapBanks.filter((bank) => selectedBanks.includes(bank.name));
                            if (comparedLapBanks.length !== 2) return null;
                            const b1 = comparedLapBanks[0];
                            const b2 = comparedLapBanks[1];
                            const emi1 = calculateEmi(lapAmount, b1.baseRoi, lapTermInYears);
                            const emi2 = calculateEmi(lapAmount, b2.baseRoi, lapTermInYears);
                            const int1 = Math.max(0, (emi1 * lapTermInMonths) - lapAmount);
                            const int2 = Math.max(0, (emi2 * lapTermInMonths) - lapAmount);
                            const diff = Math.abs(int1 - int2);
                            const isSame = diff === 0;
                            const cheaper = int1 < int2 ? b1 : b2;
                            const costlier = int1 < int2 ? b2 : b1;
                            const maxInt = Math.max(int1, int2);
                            const pct = maxInt > 0 ? ((diff / maxInt) * 100).toFixed(1) : '0.0';

                            return (
                              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                                    ₹
                                  </div>
                                  <div>
                                    <div className="text-xs font-black uppercase tracking-wider text-emerald-800">
                                      Total Interest Payable Difference Over Tenure
                                    </div>
                                    <div className="text-sm font-semibold text-slate-800 mt-0.5">
                                      {isSame ? (
                                        <span>Both lenders incur identical total interest charges over {lapTerm} {lapTermUnit}.</span>
                                      ) : (
                                        <span>
                                          Choosing <strong className="text-emerald-700 font-black">{cheaper.name}</strong> over {costlier.name} saves{' '}
                                          <strong className="text-emerald-700 font-black">₹{Math.round(diff).toLocaleString('en-IN')}</strong> ({pct}%) in total interest over {lapTerm} {lapTermUnit}.
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {!isSame && (
                                  <div className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black self-start sm:self-auto shrink-0 shadow-xs">
                                    Save ₹{Math.round(diff).toLocaleString('en-IN')}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left min-w-[700px]">
                              <thead>
                                <tr className="border-b border-slate-200">
                                  <th className="py-4 pr-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/4">Key Metrics</th>
                                  {lapBanks
                                    .filter((bank) => selectedBanks.includes(bank.name))
                                    .map((bank) => (
                                      <th key={bank.name} className="py-4 px-4 text-center w-[25%] border-l border-slate-100 bg-slate-50/30">
                                        <div className="flex flex-col items-center justify-center gap-2 pb-2">
                                          {renderLogo(bank)}
                                          <span className="text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">{bank.name}</span>
                                        </div>
                                      </th>
                                    ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {/* Interest Rate row */}
                                <tr>
                                  <td className="py-4.5 pr-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Interest Rate (ROI) Floating</td>
                                  {lapBanks
                                    .filter((bank) => selectedBanks.includes(bank.name))
                                    .map((bank) => (
                                      <td key={bank.name} className="py-4.5 px-4 text-center border-l border-slate-100">
                                        <div className="text-sm font-medium text-slate-700 whitespace-nowrap">{bank.baseRoi.toFixed(2)}% - {bank.maxRoi.toFixed(2)}%</div>
                                      </td>
                                    ))}
                                </tr>

                                {/* Monthly EMI Row */}
                                <tr className="bg-slate-50/30">
                                  <td className="py-4.5 pr-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Est. Monthly EMI - ({lapTerm} {lapTermUnit === 'years' ? 'Years' : 'Months'})</td>
                                  {lapBanks
                                    .filter((bank) => selectedBanks.includes(bank.name))
                                    .map((bank) => {
                                      const bankEmiVal = calculateEmi(lapAmount, bank.baseRoi, lapTermInYears);
                                      return (
                                        <td key={bank.name} className="py-4.5 px-4 text-center border-l border-slate-100">
                                          <div className="text-sm font-medium text-slate-700 whitespace-nowrap">₹{Math.round(bankEmiVal).toLocaleString('en-IN')}</div>
                                        </td>
                                      );
                                    })}
                                </tr>

                                {/* Dynamic Processing Fee row */}
                                <tr>
                                  <td className="py-4.5 pr-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Processing Fee</td>
                                  {lapBanks
                                    .filter((bank) => selectedBanks.includes(bank.name))
                                    .map((bank) => (
                                      <td key={bank.name} className="py-4.5 px-4 text-center border-l border-slate-100">
                                        <div className="flex flex-col items-center justify-center">
                                          <div className="text-sm font-semibold text-slate-700 whitespace-nowrap">{bank.pfLabel}</div>
                                          <div className="text-[10px] text-slate-400 font-normal whitespace-nowrap mt-0.5">{bank.pfSub}</div>
                                        </div>
                                      </td>
                                    ))}
                                </tr>

                                {/* Total Interest Payable Row */}
                                <tr>
                                  <td className="py-4.5 pr-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Total Interest Payable</td>
                                  {lapBanks
                                    .filter((bank) => selectedBanks.includes(bank.name))
                                    .map((bank) => {
                                      const bankEmiVal = calculateEmi(lapAmount, bank.baseRoi, lapTermInYears);
                                      const bankTotalInterest = Math.max(0, (bankEmiVal * lapTermInMonths) - lapAmount);
                                      return (
                                        <td key={bank.name} className="py-4.5 px-4 text-center border-l border-slate-100">
                                          <div className="text-sm font-medium text-slate-700 whitespace-nowrap">₹{Math.round(bankTotalInterest).toLocaleString('en-IN')}</div>
                                        </td>
                                      );
                                    })}
                                </tr>

                                {/* Pairwise Total Interest Difference Row (When 2 banks selected) */}
                                {lapBanks.filter((bank) => selectedBanks.includes(bank.name)).length === 2 && (
                                  <tr className="bg-emerald-50/60">
                                    <td className="py-4.5 pr-4 font-bold text-emerald-900 text-xs uppercase tracking-wider">
                                      <div className="flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Total Interest Difference</span>
                                      </div>
                                    </td>
                                    {(() => {
                                      const cBanks = lapBanks.filter((bank) => selectedBanks.includes(bank.name));
                                      const emi0 = calculateEmi(lapAmount, cBanks[0].baseRoi, lapTermInYears);
                                      const emi1 = calculateEmi(lapAmount, cBanks[1].baseRoi, lapTermInYears);
                                      const int0 = Math.max(0, (emi0 * lapTermInMonths) - lapAmount);
                                      const int1 = Math.max(0, (emi1 * lapTermInMonths) - lapAmount);
                                      const diff = Math.abs(int0 - int1);
                                      const isSame = diff === 0;

                                      return cBanks.map((bank, idx) => {
                                        const thisInt = idx === 0 ? int0 : int1;
                                        const otherInt = idx === 0 ? int1 : int0;
                                        const isCheaper = thisInt < otherInt;

                                        return (
                                          <td key={bank.name} className="py-4.5 px-4 text-center border-l border-emerald-100">
                                            {isSame ? (
                                              <span className="text-xs font-semibold text-slate-500">Same Rate</span>
                                            ) : isCheaper ? (
                                              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-xl">
                                                Saves ₹{Math.round(diff).toLocaleString('en-IN')}
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-xl">
                                                +₹{Math.round(diff).toLocaleString('en-IN')} Extra
                                              </span>
                                            )}
                                          </td>
                                        );
                                      });
                                    })()}
                                  </tr>
                                )}

                                {/* Total Repayment Row */}
                                <tr>
                                  <td className="py-4.5 pr-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Total Repayment Amount</td>
                                  {lapBanks
                                    .filter((bank) => selectedBanks.includes(bank.name))
                                    .map((bank) => {
                                      const bankEmiVal = calculateEmi(lapAmount, bank.baseRoi, lapTermInYears);
                                      const bankTotalRepayment = bankEmiVal * lapTermInMonths;
                                      return (
                                        <td key={bank.name} className="py-4.5 px-4 text-center border-l border-slate-100">
                                          <div className="text-sm font-medium text-slate-700 whitespace-nowrap">₹{Math.round(bankTotalRepayment).toLocaleString('en-IN')}</div>
                                        </td>
                                      );
                                    })}
                                </tr>

                                {/* Max Tenure Row */}
                                <tr>
                                  <td className="py-4.5 pr-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Max Allowed Tenure</td>
                                  {lapBanks
                                    .filter((bank) => selectedBanks.includes(bank.name))
                                    .map((bank) => (
                                      <td key={bank.name} className="py-4.5 px-4 text-center border-l border-slate-100">
                                        <div className="text-sm font-medium text-slate-700 whitespace-nowrap">{bank.maxTenure} Years</div>
                                      </td>
                                    ))}
                                </tr>

                                {/* Max Amount Row */}
                                <tr>
                                  <td className="py-4.5 pr-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">Max Loan Size limit</td>
                                  {lapBanks
                                    .filter((bank) => selectedBanks.includes(bank.name))
                                    .map((bank) => (
                                      <td key={bank.name} className="py-4.5 px-4 text-center border-l border-slate-100">
                                        <div className="text-sm font-medium text-slate-700 whitespace-nowrap">{bank.maxAmount >= 10000000 ? `₹${bank.maxAmount / 10000000} Cr` : `₹${bank.maxAmount / 100000} L`}</div>
                                      </td>
                                    ))}
                                </tr>

                                {/* Enquire / Apply Row */}
                                <tr>
                                  <td className="py-6 pr-6"></td>
                                  {lapBanks
                                    .filter((bank) => selectedBanks.includes(bank.name))
                                    .map((bank) => (
                                      <td key={bank.name} className="py-6 px-6 text-center border-l border-slate-100 bg-slate-50/20">
                                        <button
                                          onClick={() => {
                                            setIsCompareModalOpen(false);
                                            onApply(`${data.title} - ${bank.name}`);
                                          }}
                                          className="w-full py-2.5 px-4 bg-[#10B981] hover:bg-[#0e9f6e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 border-none cursor-pointer shadow"
                                        >
                                          Select & Enquire
                                        </button>
                                      </td>
                                    ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          <span>*Calculations are indicative and exclude local statutory taxes</span>
                          <button
                            onClick={() => setIsCompareModalOpen(false)}
                            className="text-[#10B981] hover:underline cursor-pointer bg-transparent border-none font-bold"
                          >
                            Close Matrix
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
      {/* ELIGIBILITY, DOCUMENTS ASSISTANT & TERMS */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 text-left">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="inline-block px-3 py-1 bg-[#10B981]/10 text-[#10B981] font-black uppercase tracking-widest text-[9px] rounded-full">
              Frictionless Preparation
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
              Requirements & Smart Terms
            </h2>
            <p className="text-slate-500 font-medium text-xs md:text-sm">
              Fully transparent, zero-surprise parameters prepared for your straightforward review.
            </p>
          </div>

          <div className="flex flex-col items-center">
            
            {/* Tab Swapper */}
            <div className="flex justify-center mb-10 w-full overflow-x-auto custom-scrollbar-thin pb-2 whitespace-nowrap">
              <div className="inline-flex items-center p-1 bg-white border border-gray-200 shadow-sm rounded-full">
                {[
                  { id: 'docs', label: 'Require Documents' },
                  { id: 'eligibility', label: 'Eligibility Criteria' },
                  { id: 'repayment', label: 'Repayment Terms' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "px-6 py-2.5 text-xs font-medium transition-all rounded-full cursor-pointer border-none",
                      activeTab === tab.id 
                        ? "bg-[#10B981] text-white shadow-sm" 
                        : "text-slate-600 hover:text-slate-800 bg-transparent"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="w-full">
              
              {/* Tab 1: Require Documents */}
              {activeTab === 'docs' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full max-w-6xl mx-auto"
                >
                  {[
                    {
                      id: 1,
                      title: "Identity Proof (Any One)",
                      desc: "Used to verify your identity. Examples: Aadhaar Card, PAN Card, Passport, Voter ID, Driving License"
                    },
                    {
                      id: 2,
                      title: "Address Proof (Any One)",
                      desc: "Confirms your residence. Examples: Utility bills, Aadhaar Card, Passport, Rental Agreement, Voter ID"
                    },
                    {
                      id: 3,
                      title: "Income Proof",
                      desc: "For Salaried: 3-6 months salary slips, Form 16. For Self-Employed: ITR for the last 2-3 years, Balance Sheet"
                    },
                    {
                      id: 4,
                      title: "Bank Statements",
                      desc: "Verifies income flow. Typically last 3-6 months of salary or primary business bank statements"
                    },
                    {
                      id: 5,
                      title: "Employment Proof",
                      desc: "Required for salaried applicants. Employee ID card, Appointment letter, or HR offer letter"
                    },
                    {
                      id: 6,
                      title: "Photographs",
                      desc: "Used for application and KYC processing. 2-4 standard passport-size photos required"
                    }
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="bg-white px-5 py-7 md:px-6 md:py-8 min-h-[185px] rounded-lg border border-[#10B981]/25 shadow-[0_2px_8px_rgba(16,185,129,0.01)] flex flex-col items-center justify-center text-center hover:shadow-[0_8px_24px_rgba(16,185,129,0.06)] hover:border-[#10B981]/55 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out"
                    >
                      <div className="w-9 h-9 rounded-full border border-dashed border-[#10B981] flex items-center justify-center mb-3.5 shrink-0 bg-transparent">
                        <span className="text-xs font-semibold text-[#1F2937]">{item.id}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#1F2937] tracking-tight mb-1.5">{item.title}</h3>
                      <p className="text-[11px] md:text-xs text-slate-500 leading-normal font-normal">{item.desc}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Tab 2: Eligibility Criteria */}
              {activeTab === 'eligibility' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full max-w-6xl mx-auto"
                >
                  {[
                    {
                      id: 1,
                      title: "Age Criteria",
                      desc: "Minimum age of 21 years and maximum of 60 years at the time of loan maturity"
                    },
                    {
                      id: 2,
                      title: "Employment Status",
                      desc: "Must be salaried at a reputed organization or self-employed with a stable business history"
                    },
                    {
                      id: 3,
                      title: "Minimum Income",
                      desc: "Minimum monthly net income ranging from ₹15,000 to ₹25,000 (varies by lender and city)"
                    },
                    {
                      id: 4,
                      title: "Credit Score (CIBIL Score)",
                      desc: "An ideal score of 750 or higher based on previous loan or credit card repayment records"
                    },
                    {
                      id: 5,
                      title: "Work Experience / Business Vintage",
                      desc: "Salaried: Minimum 6-12 months at current job. Self-employed: Minimum 2 years in current line of business"
                    },
                    {
                      id: 6,
                      title: "Documentation",
                      desc: "Requires complete sets of identity proof, address proof, bank statements, and income documents"
                    }
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="bg-white px-5 py-7 md:px-6 md:py-8 min-h-[185px] rounded-lg border border-[#10B981]/25 shadow-[0_2px_8px_rgba(16,185,129,0.01)] flex flex-col items-center justify-center text-center hover:shadow-[0_8px_24px_rgba(16,185,129,0.06)] hover:border-[#10B981]/55 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out"
                    >
                      <div className="w-9 h-9 rounded-full border border-dashed border-[#10B981] flex items-center justify-center mb-3.5 shrink-0 bg-transparent">
                        <span className="text-xs font-semibold text-[#1F2937]">{item.id}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#1F2937] tracking-tight mb-1.5">{item.title}</h3>
                      <p className="text-[11px] md:text-xs text-slate-500 leading-normal font-normal">{item.desc}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Tab 3: Repayment Terms */}
              {activeTab === 'repayment' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full max-w-6xl mx-auto"
                >
                  {[
                    {
                      id: 1,
                      title: "Loan Tenure (Repayment Period)",
                      desc: "Typically ranges from 12 to 60 months. Longer tenure yields lower EMI but increases total interest paid"
                    },
                    {
                      id: 2,
                      title: "EMI",
                      desc: "Fixed monthly payment containing principal and interest components, determined by rate and tenure"
                    },
                    {
                      id: 3,
                      title: "Interest Rate Type",
                      desc: "Fixed Rate (stays constant throughout the tenure) or Floating Rate (varies based on market interest benchmarks)"
                    },
                    {
                      id: 4,
                      title: "Prepayment / Foreclosure Terms",
                      desc: "Allows partial prepayment or early closure of the loan account, subject to individual lender terms and fees"
                    },
                    {
                      id: 5,
                      title: "Repayment Frequency",
                      desc: "Standard monthly EMI payment automated via standing instructions or auto-debit bank mandates"
                    },
                    {
                      id: 6,
                      title: "Late Payment Penalties",
                      desc: "Delayed EMI payments incur penal interest charges (2% to 5%) and negatively impact your CIBIL score"
                    }
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="bg-white px-5 py-7 md:px-6 md:py-8 min-h-[185px] rounded-lg border border-[#10B981]/25 shadow-[0_2px_8px_rgba(16,185,129,0.01)] flex flex-col items-center justify-center text-center hover:shadow-[0_8px_24px_rgba(16,185,129,0.06)] hover:border-[#10B981]/55 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out"
                    >
                      <div className="w-9 h-9 rounded-full border border-dashed border-[#10B981] flex items-center justify-center mb-3.5 shrink-0 bg-transparent">
                        <span className="text-xs font-semibold text-[#1F2937]">{item.id}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#1F2937] tracking-tight mb-1.5">{item.title}</h3>
                      <p className="text-[11px] md:text-xs text-slate-500 leading-normal font-normal">{item.desc}</p>
                    </div>
                  ))}
                </motion.div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Advice Console / Pro-tips */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 text-left">
          <div className="bg-[#EFF6FF]/60 rounded-[2.5rem] p-8 md:p-12 border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[#10B981] pointer-events-none">
              <Sparkles className="w-24 h-24 animate-pulse" />
            </div>
            
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-[9px] font-black uppercase tracking-wider font-mono">
                  Expert Advice Console
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
                  Maximizing Your File Quality Score
                </h2>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                  Our system evaluates application files against multiple banking risk parameters. Adjusting these elements beforehand decreases turnaround delays.
                </p>
                
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                  <span className="text-[9px] font-black text-[#10B981] uppercase tracking-widest font-mono">
                    Underwriting Pro-Tip
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <UserCheck className="w-4 h-4 text-[#10B981]" />
                    <span>Adding a verified co-applicant raises limits by up to 45%.</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 grid sm:grid-cols-3 gap-4">
                {[
                  {
                    title: "Co-Applicant Shield",
                    desc: "Inject family joint incomes (spouse, parents) as co-applicants. This drastically elevates overall loan underwritten limits.",
                    benefit: "+45% Limit Raise"
                  },
                  {
                    title: "AA Consent Routing",
                    desc: "Authorize Account Aggregator pipelines. Fully digital statement indexing cuts manual underwriter review by up to 3 days.",
                    benefit: "-72h TAT Savings"
                  },
                  {
                    title: "Mortgage Coverage",
                    desc: "Bundling a home insurance policy reduces lender risk indices, which prompts major banks to waive standard processing fees.",
                    benefit: "PF Waivers Offered"
                  }
                ].map((tip, index) => (
                  <div key={index} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#10B981] transition-colors text-left">
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-800">
                        <Sparkle className="w-4 h-4" />
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-800 font-display">{tip.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold leading-normal">{tip.desc}</p>
                    </div>
                    <span className="text-[9px] font-black text-[#10B981] uppercase tracking-wider bg-[#10B981]/5 px-2.5 py-1 rounded-md text-center">
                      {tip.benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Mortgage Calculator */}
      <section className="py-20 bg-white" id="product-calculators">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
           <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
             <span className="inline-block px-3 py-1 bg-[#10B981]/10 text-[#10B981] font-black uppercase tracking-widest text-[9px] rounded-full font-mono">
               Full Simulation
             </span>
             <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
               Plan Your {data.title}
             </h2>
             <p className="text-slate-500 font-medium text-xs md:text-sm">
               Simulate variables below to view EMI distribution charts, amortization tables, and real-time interest trends.
             </p>
           </div>
           <MortgageCalculator onApply={onApply} isLap={activeProductId === 'Loan Against Property'} />
         </div>
      </section>

      {/* FAQ Section */}
      <section className="pt-16 pb-24 md:pt-20 md:pb-32 bg-[#F9F9F9] relative overflow-hidden border-t border-b border-gray-100">
         <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 text-center">
            {/* Minimalist FAQ Header inspired by screenshot */}
            <div className="flex flex-col items-center justify-center space-y-2 mb-10 text-center">
               <div className="flex items-center gap-2 justify-center mb-1">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#10B981] uppercase font-mono">FAQ</span>
                  <div className="h-[1.5px] w-12 bg-slate-900"></div>
               </div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight">Have any questions?</h2>
            </div>

            {/* Custom minimalist tabs with thin green bottom line upon selection */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-12 border-b border-gray-200/50 pb-px max-w-4xl mx-auto">
               {faqTabs.map((tab) => {
                  const isActive = activeFaqTab === tab.id;
                  return (
                     <button
                        key={tab.id}
                        onClick={() => setActiveFaqTab(tab.id)}
                        className={cn(
                           "relative py-3.5 px-3 text-xs md:text-sm font-medium transition-all cursor-pointer border-none bg-transparent hover:text-slate-800",
                           isActive 
                              ? "text-[#10B981] font-semibold" 
                              : "text-slate-400 font-normal hover:text-slate-600"
                        )}
                     >
                        {tab.label}
                        {isActive && (
                           <motion.div 
                              layoutId="activeFaqLine"
                              className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#10B981] rounded-full"
                           />
                        )}
                     </button>
                  );
               })}
            </div>

            {/* Premium Two-Column Grid layout, exactly matching the screenshot format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 max-w-5xl mx-auto px-2">
               {currentFaqs[activeFaqTab].map((faq, idx) => (
                  <div key={idx} className="space-y-2.5 text-left">
                     <h3 className="text-sm md:text-[15px] font-medium text-[#1F2937] leading-snug">
                        {faq.q}
                     </h3>
                     <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-normal">
                        {faq.a}
                     </p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ARTICLES AND NEWS SECTION - Conditionally shown for Loan Against Property */}
      {activeProductId === 'Loan Against Property' && (
        <section className="py-16 md:py-24 bg-white border-t border-b border-gray-100" id="news">
          <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="text-left">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#10B981] mb-2.5 block font-mono">Market Intelligence</span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937] tracking-tight font-display">
                  Insights & News
                </h2>
                <p className="text-sm md:text-base text-slate-500 max-w-2xl mt-2 font-normal">
                  Stay updated with live interest rate shifts, RBI guidelines, tax savings updates, and premium advisory columns from our veteran underwriters.
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button 
                   onClick={() => scrollNews('left')}
                   className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all cursor-pointer shadow-sm hover:border-[#10B981]/30 active:scale-95"
                   aria-label="Scroll news left"
                >
                   <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                   onClick={() => scrollNews('right')}
                   className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all cursor-pointer shadow-sm hover:border-[#10B981]/30 active:scale-95"
                   aria-label="Scroll news right"
                >
                   <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className="text-xs font-bold text-slate-400 italic ml-2 hidden sm:inline">3 Live Bulletins</span>
              </div>
            </div>

            <div ref={newsScrollRef} className="flex flex-row overflow-x-auto md:grid md:grid-cols-3 gap-6 md:gap-8 pb-6 md:pb-0 scrollbar-none snap-x snap-mandatory">
              {NEWS_ARTICLES.map((art) => (
                <motion.div 
                  key={art.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="w-[85vw] sm:w-[450px] md:w-auto shrink-0 snap-center bg-[#EFF6FF]/40 border border-slate-100 rounded-2xl md:rounded-[2rem] p-5 flex flex-col justify-between h-full hover:shadow-xl hover:shadow-[#EFF6FF]/30 hover:border-[#10B981]/20 transition-all cursor-pointer group"
                  onClick={() => {
                    if (onArticleClick) {
                      onArticleClick(art);
                    }
                  }}
                >
                  <div className="space-y-4 text-left">
                    {/* Card Image */}
                    {art.imageUrl && (
                      <div className="w-full aspect-[16/10] rounded-xl md:rounded-[1.5rem] overflow-hidden bg-slate-100 relative">
                        <img 
                          src={art.imageUrl} 
                          alt={art.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-sm backdrop-blur-md bg-white/90", art.accentColor)}>
                            {art.category}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>By {art.author}</span>
                        <span>{art.readTime}</span>
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-[#0F172A] leading-snug font-sans group-hover:text-[#10B981] transition-colors line-clamp-2">
                        {art.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-normal line-clamp-2">
                        {art.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/50 flex items-center justify-between text-left">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{art.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{art.date}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10B981] group-hover:gap-2 transition-all mt-1">
                        Read Article <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CREATIVITY & TRUST HERO BANNER - Compact 30% reduced strip */}
      <section className="py-7 sm:py-9 bg-gradient-to-r from-slate-100 via-[#EFF2F6] to-emerald-50/30 relative overflow-hidden border-t border-b border-slate-200/80">
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 md:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[150px]">
            
            {/* Left Headline & Contact Button */}
            <div className="lg:col-span-8 space-y-3.5 text-left">
              <h2 className="text-xl sm:text-2xl md:text-[28px] font-extrabold text-[#0F172A] tracking-tight leading-snug font-display max-w-xl">
                Building trust through creative & tailored loan solutions.
              </h2>

              <div>
                <button 
                  onClick={() => onApply(data.id)}
                  className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-5 py-2 rounded-full transition-all cursor-pointer shadow-sm hover:shadow-md group"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Graphic Column - Synchronized Chevron Wing & Back to Top */}
            <div className="lg:col-span-4 relative flex items-center justify-center lg:justify-end h-full">
              <div className="w-full max-w-[180px] sm:max-w-[210px] lg:max-w-[230px] flex items-center justify-center lg:justify-end">
                <svg viewBox="0 0 380 300" className="w-full h-auto drop-shadow-2xs overflow-visible" fill="none">
                  {/* Top Navy Chevron Wing */}
                  <polygon points="120,0 260,0 380,150 240,150" fill="#0F172A" />
                  {/* Bottom Emerald Chevron Wing */}
                  <polygon points="240,150 380,150 260,300 120,300" fill="#10B981" />
                </svg>
              </div>

              {/* Vertical BACK TOP button on the far right */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hidden xl:flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer absolute -right-6 top-1/2 -translate-y-1/2 rotate-90 origin-right"
              >
                <span>BACK TOP</span>
                <span className="w-3.5 h-[2px] bg-slate-900" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Immersive Dark Bottom Strip */}
      <section className="bg-[#0F172A] text-white py-16 relative overflow-hidden border-t border-white/5 text-left">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="footer-blueprint" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#footer-blueprint)" />
          </svg>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center justify-between">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#10B981] border border-white/10 shadow-lg shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base md:text-lg font-display text-white">Bank-Grade Confidentiality</h4>
                  <p className="text-xs text-white/50 font-bold">Secure SSL transmission safe-guards all documentation assets.</p>
                </div>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-bold max-w-xl">
                *Interest rates shown are indicative card rates from partner banks and are subject to dynamic credit appraisal guidelines. Standard regulatory GST charges applicable on separate processing fees.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
              <button 
                onClick={() => onApply(data.id)}
                className="group bg-[#10B981] text-white px-8 py-4.5 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:bg-[#0e9f6e] transition-all cursor-pointer shadow-lg shadow-[#10B981]/10 border-none"
              >
                Apply for {data.title} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onBack}
                className="px-8 py-4.5 bg-white/5 border border-white/10 hover:border-white/30 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] text-white text-center hover:bg-white/10 transition-all cursor-pointer"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
