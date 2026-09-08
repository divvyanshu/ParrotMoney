import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, ArrowLeft, ArrowRight, ArrowRightCircle, Sparkles, 
  ShieldCheck, Calculator, Smartphone, Check, 
  Home, Mountain, Hammer, RefreshCw, Plus, 
  Building, ChevronDown, UserCheck, Zap, 
  TrendingUp, Star, Phone, MessageSquare, 
  ArrowUpRight, Info, FileText, MousePointer2,
  Scale, Users, Heart, Brain,
  PieChart as PieChartIcon, Clock, ChevronRight, ChevronLeft,
  TrendingDown, Globe, HelpCircle, Shield
} from 'lucide-react';
import { cn } from '../lib/utils';

import { Logo } from './Logo';
import { MortgageCalculator } from './MortgageCalculator';
import { AboutUs } from './AboutUs';
import { ProductPage } from './ProductPage';
import { ArticlePage } from './ArticlePage';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';
import { CareersSection } from './CareersSection';

interface SectionProps {
  onApply: (category?: string) => void;
  loginWithGoogle: () => void;
  loginWithEmailOrMobile?: (emailOrMobile: string) => Promise<void>;
  isLoggedIn?: boolean;
  onGoToDashboard?: () => void;
  onCookieSettingsClick?: () => void;
  onLoginClick?: (mode?: 'customer' | 'admin') => void;
}

export const NEWS_ARTICLES = [
  {
    id: 'rbi-policy-2026',
    category: 'RBI Update',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    title: 'RBI Monetary Policy: How Latest Rate Stands Impact Floating-Rate Mortgages',
    description: "An expert analysis of the Reserve Bank of India's latest committee decisions and what they mean for home loan interest margins and upcoming monthly EMIs.",
    author: 'Vikram Mehta',
    role: 'Lead Financial Underwriter',
    date: 'June 28, 2026',
    readTime: '4 min read',
    accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    content: `The Reserve Bank of India (RBI) Monetary Policy Committee (MPC) recently concluded its bi-monthly review, choosing to maintain its benchmark repo rate. For home loan applicants and existing borrowers in India, this decision signals stability but demands strategic alignment.

### Key Highlights & Mortgage Takeaways:
1. **Repo Rate Anchored:** The benchmark repo rate remains unchanged, meaning external benchmark-linked lending rates (EBLR) of major banks like SBI, HDFC, and ICICI will see minimal immediate upward movement.
2. **Liquid Capital Influx:** Banks are experiencing high credit demand, prompting them to offer special micro-campaigns with low margin spreads for high-credit profile borrowers (CIBIL > 760).
3. **Calibrating Your Spread:** Now is the optimal window to review your active loan's spread markup. Many banks charge a spread ranging from 2.0% to 2.5% over the repo rate.

### Strategic Recommendation:
If your current home loan is under an old base rate or MCLR system, migrating to the modern Repo Linked Lending Rate (RLLR) could instantly slash your annual interest outflow by up to **0.65% to 0.90%**.`
  },
  {
    id: 'overdraft-advisory',
    category: 'Overdraft Guide',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    title: 'Unlocking Overdraft Benefit: A Direct SBI MaxGain vs HDFC MaxSaver Review',
    description: 'Learn how to utilize excess monthly liquidity to offset home loan interest rates while retaining 100% emergency withdrawal access to your hard-earned cash.',
    author: 'Anjali Sharma',
    role: 'Senior Mortgage Specialist',
    date: 'June 15, 2026',
    readTime: '6 min read',
    accentColor: 'text-blue-600 bg-blue-50 border-blue-100',
    content: `Choosing between a standard home loan and an overdraft home loan product is one of the most critical decisions during property acquisition. Products like **SBI MaxGain** or **HDFC MaxSaver** allow you to deposit surplus funds into a linked bank account to shave off interest.

### How It Operates:
1. **Linked Account Integration:** You receive an overdraft account linked directly to your active mortgage principal ledger.
2. **Daily Balances Calculations:** Interest is computed daily on **(Outstanding Principal - Parked Funds)**. Your EMI remains constant, but a much larger fraction goes toward principal repayment.
3. **Infinite Liquidity:** Unlike typical prepayments, money parked in the overdraft account can be withdrawn at any time using a debit card or online transfer—no lock-ins or administrative penalties!

### Numerical Case Study:
On a ₹1.0 Crore loan at 8.50%, parking a consistent surplus of ₹15 Lakhs can save you over **₹22,40,000 in total interest** and shorten your repayment schedule by **3.8 years**.`
  },
  {
    id: 'eligibility-booster',
    category: 'Eligibility Tips',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    title: 'Top 5 Overlooked Income Sources to Instantly Lift Eligibility by 35%',
    description: 'From co-borrower bonus schedules and verified rental returns to professional consulting contracts—how to present files to bank credit managers.',
    author: 'Rajesh Kumar',
    role: 'Chief Underwriter',
    date: 'May 22, 2026',
    readTime: '5 min read',
    accentColor: 'text-purple-600 bg-purple-50 border-purple-100',
    content: `Many home loan applications are rejected or restricted in funding capacity not due to bad credit, but because of poor presentation of net monthly inflows. Credit managers at leading institutions look for stable, multi-faceted income streams.

### Top 5 Income Sources Bank Managers Value:
1. **Rental Income (Even Non-Standard):** Rent from pre-existing properties, verified through bank statements or registered lease deeds, is counted at 70% of gross value toward your FOIR.
2. **Annual Bonuses or Perks:** Averaging your last 2 years of performance bonuses and submitting Form 16 allows banks to treat this as regular salary.
3. **Stable Professional Consultancy Fees:** Freelance or consultancy agreements that have a history of at least 12 months of consistent bank credits.
4. **Co-Borrower Income Structuring:** Adding a working spouse, parent, or sibling can instantly double your eligible principal limit.
5. **Agricultural Income:** Tax-exempt agricultural income can be used to augment overall family earnings if supported by land ownership certificates.

### Presenting Your Case:
To guarantee fast-track approval, compile these extra streams with clear indexing before submission. Using an automated pre-underwriting optimizer like ParrotMoney ensures your file meets strict bank criteria on day one.`
  }
];

const CATEGORIES = [
  { id: 'New Home Loan', label: 'New Home Loan', icon: Home, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'Plot Loan', label: 'Plot Loan', icon: Mountain, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'Plot + Construction', label: 'Plot + Construction', icon: Mountain, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'Top up Loan', label: 'Step-up Loan', icon: Plus, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'Loan Transfer', label: 'Loan Transfer', icon: RefreshCw, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'Loan Against Property', label: 'Loan Against Property', icon: Building, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'Commercial Loan', label: 'Commercial Property', icon: Building2, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'NRI Loan', label: 'NRI Home Loan', icon: Globe, color: 'bg-white border border-slate-100 text-slate-600' },
];

const FACTORS_DATA = [
  {
    title: "ROI Savings",
    desc: "Save ₹4L+ over tenure",
    badgeLeft: "Comparison on ₹1.0 Crore",
    badgeRight: "20 Year Tenure",
    banks: [
      { name: "Bank Alpha", value: "8.65%", status: "Standard Rate", isBest: false, isWorst: false },
      { name: "Bank Beta (Parrot Rate)", value: "7.10%", status: "Guaranteed Min*", isBest: true, isWorst: false },
      { name: "Bank Gamma", value: "8.80%", status: "Insurance Bundled", isBest: false, isWorst: false },
      { name: "Bank Delta", value: "9.25%", status: "Base Retail Pricing", isBest: false, isWorst: true }
    ],
    highlight: "Saves ₹16,40,000+ in total interest over your tenure!"
  },
  {
    title: "Loan to Value",
    desc: "Max upfront downpayment",
    badgeLeft: "Property Value ₹1.2 Crore",
    badgeRight: "Downpayment Burden",
    banks: [
      { name: "Bank Alpha", value: "80% LTV", status: "₹24L Downpayment Required", isBest: false, isWorst: false },
      { name: "Bank Beta (Parrot Rate)", value: "90% LTV", status: "₹12L Downpayment Required", isBest: true, isWorst: false },
      { name: "Bank Gamma", value: "85% LTV", status: "₹18L Downpayment Required", isBest: false, isWorst: false },
      { name: "Bank Delta", value: "75% LTV", status: "₹30L Downpayment Required", isBest: false, isWorst: true }
    ],
    highlight: "Bank Beta reduces your critical upfront cash burden by 50%!"
  },
  {
    title: "Tenure Burden",
    desc: "Reduces monthly EMI cost",
    badgeLeft: "Based on ₹1.0 Crore Loan",
    badgeRight: "Age Boundary 65 Eligible",
    banks: [
      { name: "Bank Alpha", value: "20 Years", status: "EMI: ₹88,370/mo", isBest: false, isWorst: false },
      { name: "Bank Beta (Parrot Rate)", value: "30 Years", status: "EMI: ₹76,180/mo (Max Savings)", isBest: true, isWorst: false },
      { name: "Bank Gamma", value: "25 Years", status: "EMI: ₹83,050/mo", isBest: false, isWorst: false },
      { name: "Bank Delta", value: "20 Years", status: "EMI: ₹91,590/mo", isBest: false, isWorst: true }
    ],
    highlight: "Lowers monthly cashout load by ₹12,190 with optimized tenure elongation!"
  },
  {
    title: "PF & Charges",
    desc: "Zero hidden fee markup",
    badgeLeft: "Incurred Overheads",
    badgeRight: "Administration Fees",
    banks: [
      { name: "Bank Alpha", value: "0.50% fee", status: "₹50,000 + GST", isBest: false, isWorst: false },
      { name: "Bank Beta (Parrot Rate)", value: "Flat ₹4,999", status: "Zero markups/hidden pricing", isBest: true, isWorst: false },
      { name: "Bank Gamma", value: "1.00% fee", status: "₹1,00,000 + GST", isBest: false, isWorst: true },
      { name: "Bank Delta", value: "0.40% fee", status: "₹40,000 + GST", isBest: false, isWorst: false }
    ],
    highlight: "Saves up to ₹95,000 immediately in non-refundable up-front charges!"
  },
  {
    title: "Smart Overdraft",
    desc: "Slash interest on surplus",
    badgeLeft: "Liquidity Linkage",
    badgeRight: "Balance Offsets",
    banks: [
      { name: "Bank Alpha", value: "Unavailable", status: "Standard terms only (No OD)", isBest: false, isWorst: true },
      { name: "Bank Beta (Parrot Rate)", value: "Smart Link", status: "Park & withdraw at zero cost", isBest: true, isWorst: false },
      { name: "Bank Gamma", value: "Premium OD", status: "Requires +0.45% markup key rate", isBest: false, isWorst: false },
      { name: "Bank Delta", value: "Inactive", status: "Strict flat lock-in rules", isBest: false, isWorst: false }
    ],
    highlight: "Earn effective yield by parking savings, slicing years off interest!"
  },
  {
    title: "Digital Flow",
    desc: "100% paperless validation",
    badgeLeft: "Digital Paperwork SLA",
    badgeRight: "Branch touchpoints",
    banks: [
      { name: "Bank Alpha", value: "Semi-Digital", status: "Requires wet sign at end", isBest: false, isWorst: false },
      { name: "Bank Beta (Parrot Rate)", value: "100% Paperless", status: "Video KYC & 1-tap eSign", isBest: true, isWorst: false },
      { name: "Bank Gamma", value: "Paper-based", status: "Requires 3 branch visits", isBest: false, isWorst: true },
      { name: "Bank Delta", value: "Semi-Digital", status: "Wet stamp mandates require courier", isBest: false, isWorst: false }
    ],
    highlight: "Skip repetitive ink signing sessions and physical banking hall cues!"
  },
  {
    title: "CIBIL Thresholds",
    desc: "Pre-checked safety margin",
    badgeLeft: "Required Rating Range",
    badgeRight: "Credit score guidelines",
    banks: [
      { name: "Bank Alpha", value: "750+ score", status: "Unforgiving hard limits", isBest: false, isWorst: false },
      { name: "Bank Beta (Parrot Rate)", value: "650+ score", status: "Algorithmic custom fits", isBest: true, isWorst: false },
      { name: "Bank Gamma", value: "700+ score", status: "Standard retail assessment", isBest: false, isWorst: false },
      { name: "Bank Delta", value: "720+ score", status: "Strict automated rejection", isBest: false, isWorst: true }
    ],
    highlight: "Highly-inclusive underwriting ensures rates correspond and do not reject!"
  },
  {
    title: "Disbursal Speed",
    desc: "Algorithmic TAT matching",
    badgeLeft: "Turnaround Duration",
    badgeRight: "Milestone to Bank Cash",
    banks: [
      { name: "Bank Alpha", value: "8 Days TAT", status: "Manual document transit", isBest: false, isWorst: false },
      { name: "Bank Beta (Parrot Rate)", value: "3 Days SLA", status: "Instant API checks", isBest: true, isWorst: false },
      { name: "Bank Gamma", value: "11 Days TAT", status: "Bulk legal notary queues", isBest: false, isWorst: false },
      { name: "Bank Delta", value: "14 Days TAT", status: "Heavy offline validation checks", isBest: false, isWorst: true }
    ],
    highlight: "Get funds disbursed 4 to 11 working days quicker than traditional flow!"
  }
];

const BANK_OFFERS_LIST = [
  { bank: "HDFC Bank", offer: "7.15% ROI Special*" },
  { bank: "SBI", offer: "7.10% ROI Min Rate*" },
  { bank: "ICICI Bank", offer: "Zero Processing Fees" },
  { bank: "Kotak Mahindra Bank", offer: "Super-fast Approval" },
  { bank: "Axis Bank", offer: "100% Digital eSign" },
  { bank: "Federal Bank", offer: "Instant Digital In-Principle" },
  { bank: "Bajaj Housing", offer: "High LTV & Quick Sanction" },
  { bank: "Tata Capital", offer: "Pre-approved Home Loan" },
  { bank: "LIC HFL", offer: "Affordable Long-term Rates" },
  { bank: "Piramal Finance", offer: "Flexible Income Assessment" }
];

const getBankLogo = (name: string): string => {
  const customLogos: Record<string, string> = {
    "SBI": "/logos/sbi.svg",
    "State Bank of India": "/logos/sbi.svg",
    "Union Bank": "/logos/unionbank.svg",
    "Union Bank of India": "/logos/unionbank.svg",
    "Kotak Mahindra": "/logos/kotak_icon.svg",
    "Kotak Mahindra Bank": "/logos/kotak_icon.svg",
    "Kotak Bank": "/logos/kotak_icon.svg",
    "Federal Bank": "/logos/federal_icon.svg",
    "Federal": "/logos/federal_icon.svg"
  };
  if (customLogos[name]) {
    return customLogos[name];
  }
  const bankDomains: Record<string, string> = {
    "SBI": "sbi.co.in",
    "HDFC Bank": "hdfcbank.com",
    "ICICI Bank": "icicibank.com",
    "Kotak Mahindra": "kotak.com",
    "Kotak Mahindra Bank": "kotak.com",
    "Kotak Bank": "kotak.com",
    "Axis Bank": "axisbank.com",
    "LIC HFL": "lichousing.com",
    "LIC Housing Finance": "lichousing.com",
    "PNB HFL": "pnbhousing.com",
    "PNB Housing Finance": "pnbhousing.com",
    "Bajaj Housing": "bajajhousingfinance.in",
    "Bajaj Housing Finance": "bajajhousingfinance.in",
    "Tata Capital": "tatacapital.com",
    "L&T Finance": "ltfs.com",
    "Federal Bank": "federalbank.co.in",
    "IDFC First Bank": "idfcfirstbank.com",
    "Standard Chartered": "sc.com",
    "HSBC": "hsbc.com",
    "Union Bank": "unionbankofindia.co.in",
    "Union Bank of India": "unionbankofindia.co.in",
    "Bank of Baroda": "bankofbaroda.in",
    "Piramal Finance": "piramalfinance.com",
    "Aditya Birla Capital": "adityabirlacapital.com",
    "Godrej Housing Finance": "godrejcapital.com",
    "Godrej Housing": "godrejcapital.com",
    "Shriram Finance": "shriramfinance.in",
    "Chola Finance": "cholainsurance.com",
    "Home First Finance": "homefirstindia.com",
    "Aavas Financiers": "aavas.in",
    "Muthoot Finance": "muthootfinance.com"
  };
  const domain = bankDomains[name] || "sbi.co.in";
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};

function MarqueeBankLogo({ bank }: { bank: string }) {
  if (bank === "SBI" || bank === "State Bank of India") {
    return (
      <svg viewBox="33.78 175.84 34.28 34.35" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m 50.918349,175.84129 c -9.463306,0 -17.134866,7.68936 -17.134866,17.17438 0,8.89234 6.742566,16.20584 15.381364,17.08514 v -12.47584 c -1.856724,-0.70824 -3.1795,-2.50666 -3.1795,-4.6093 0,-2.72076 2.212264,-4.93432 4.933002,-4.93432 2.719454,0 4.934266,2.21356 4.934266,4.93432 0,2.10264 -1.325316,3.90072 -3.18204,4.6093 v 12.47584 c 8.640066,-0.8793 15.382632,-8.1928 15.382632,-17.08514 0,-9.48502 -7.671564,-17.17438 -17.134858,-17.17438" fill="#0072bc" fillRule="nonzero" />
      </svg>
    );
  }
  if (bank === "Union Bank" || bank === "Union Bank of India") {
    return (
      <svg viewBox="0 0 1085 975" className="w-full h-full p-0.5" xmlns="http://www.w3.org/2000/svg">
        <path d="m 772.82,0 51.35,0 c 4.3,1.32 8.86,0.74 13.25,1.51 58.41,5.68 116.33,23.22 165.79,55.27 19.93,12.88 38.1,28.39 54.55,45.46 12.61,14.27 24.68,29.15 34.48,45.53 6.34,9.7 11.24,20.22 16.44,30.56 15.04,32.25 24.03,67.17 27.58,102.53 0.98,5.71 0.53,11.55 1.55,17.26 0.54,6.94 0.07,13.92 0.22,20.89 -0.19,8.04 0.58,16.15 -0.77,24.12 -0.81,20.61 -3.97,41.05 -7.81,61.3 -2.12,12.07 -5.85,23.77 -8.25,35.78 -24.31,97.33 -48.66,194.66 -72.99,291.99 -3.99,18.03 -8.85,35.86 -13.19,53.81 -3,11.52 -5.91,23.37 -12.59,33.41 -4.9,7.87 -11.33,14.66 -18.4,20.61 -16.89,13.5 -38.66,19.82 -60.08,20.02 -9.11,-0.81 -18.29,-1.99 -26.96,-5.03 -9.06,-3.56 -18.18,-7.86 -24.77,-15.25 -9.56,-8.41 -14.74,-21.08 -15.52,-33.64 -1.05,-7.88 1.14,-15.75 3.09,-23.33 11.54,-46.14 23.06,-92.27 34.61,-138.4 5.03,-19.48 9.37,-39.12 14.38,-58.6 16.79,-67.2 33.62,-134.39 50.39,-201.59 4.07,-16.46 6.6,-33.27 7.79,-50.17 -0.3,-13.02 0.74,-26.1 -0.95,-39.04 -1.73,-16.18 -5.38,-32.25 -11.72,-47.29 -5.55,-14.6 -14.1,-27.92 -24.39,-39.63 -2.91,-4.41 -7.64,-6.99 -11.17,-10.81 -1.66,-1.68 -3.38,-3.31 -5.28,-4.7 -10.85,-8.26 -22.43,-15.8 -35.11,-20.93 -11.03,-5.43 -22.8,-9.24 -34.68,-12.31 -16.46,-4.71 -33.43,-7.76 -50.54,-8.55 -7.64,-1.38 -15.41,-0.52 -23.11,-0.81 -6.06,-0.29 -11.98,1.32 -18.03,1.14 -28.28,2.7 -56.27,9 -82.86,19.02 -17.61,6.13 -34.28,14.52 -50.68,23.3 -19.52,11.61 -38.47,24.4 -55.2,39.82 -5.78,5.88 -11.69,11.64 -17.48,17.52 -11.27,13.16 -21.88,27.25 -28.57,43.36 -7.22,23.52 -13.32,47.38 -19.95,71.07 -8.05,30.66 -16.32,61.25 -24.02,92 -9.29,34.78 -17.73,69.79 -27.57,104.43 -4.44,14.53 -8.92,29.06 -13.42,43.57 -2.06,7.95 -3.72,16.13 -7.53,23.48 -11.96,26.21 -37.93,44.95 -66.11,49.86 -19.19,3.73 -40.03,1.15 -56.74,-9.37 -4.86,-3.75 -10.14,-7.22 -13.67,-12.35 -7.4,-8.65 -11.58,-19.67 -13.09,-30.87 -0.21,-5.28 -2.29,-10.74 -0.01,-15.86 22.95,-75.21 41.18,-151.74 61.24,-227.75 11.16,-42.86 22.28,-85.74 34.77,-128.24 2.75,-10.41 7.29,-20.24 12.24,-29.77 13.48,-28.26 32.07,-53.84 52.92,-77.1 8.17,-8.15 16.31,-16.34 24.5,-24.48 13,-11.06 25.84,-22.39 39.96,-32.04 7.07,-5.82 15.18,-10.11 22.68,-15.33 29.97,-19 62.12,-34.44 95.48,-46.51 8.24,-2.74 16.26,-6.19 24.7,-8.34 17.73,-5.24 35.64,-9.96 53.86,-13.16 14.09,-2.95 28.44,-4.25 42.7,-6.2 4.22,-0.48 8.58,0.19 12.69,-1.17 z" fill="#00579c" />
        <path d="m 176.12,146.24 c 4.99,-0.17 9.9,-1.35 14.9,-1.28 13.04,1.19 26.29,3.11 38.23,8.82 8.16,4.39 16.32,9.6 21.35,17.63 7.21,9.14 7.71,21.65 5.43,32.62 -6.44,24.96 -12.28,50.09 -19.04,74.97 -7.5,30.14 -15.06,60.26 -22.58,90.39 -5.6,22.93 -11.9,45.67 -17.41,68.61 -6.51,26.14 -13.11,52.26 -19.59,78.41 -5.61,20.64 -10.58,41.45 -15.8,62.2 -5.91,22.3 -10.55,45.12 -10.88,68.26 -1.1,6.02 -0.84,12.13 0.06,18.16 0.37,24.2 5.81,48.3 15.88,70.31 4.89,8.89 9.7,17.91 16.21,25.77 5.02,5.63 9.58,11.75 15.55,16.45 6.61,5.09 12.78,10.84 20.14,14.89 7.7,4.9 15.9,8.92 24.15,12.81 18.59,7.31 37.84,13.02 57.53,16.44 18.35,2.63 36.95,4.43 55.48,2.95 46.44,-2.8 92.07,-16.13 133.27,-37.65 24.43,-12.38 46.83,-28.55 67.27,-46.72 11.57,-11.19 22.66,-22.99 31.55,-36.47 5.42,-8.24 11.24,-16.54 13.75,-26.22 24.4,-84.3 45.07,-169.61 67.67,-254.39 4.65,-16.73 10.25,-33.17 15.15,-49.83 4.66,-15.38 11.92,-30.22 22.68,-42.27 5.72,-7.67 13.59,-13.35 21.53,-18.51 17.06,-10.94 37.94,-15.1 57.99,-13.18 9.61,1.16 19.23,3.51 27.76,8.22 10.64,4.97 19.93,13.2 25.37,23.67 5.36,9.87 5.47,21.77 3.11,32.5 -15.23,50.71 -28.76,101.91 -41.82,153.21 -18.02,69.03 -35.35,138.25 -55.22,206.79 -1.71,6.2 -4.29,12.12 -7.03,17.93 -4.74,11.42 -10.94,22.15 -17.32,32.72 -11.33,18.5 -24.26,36.06 -39.08,51.92 -6.04,7.58 -13.48,13.87 -20.11,20.91 -13.27,12.13 -26.98,23.85 -41.54,34.44 -22.89,16.92 -47.59,31.26 -73.03,43.95 -11.8,5.27 -23.44,10.92 -35.54,15.48 -10.53,4.56 -21.6,7.65 -32.36,11.58 -16.64,5.4 -33.63,9.53 -50.68,13.35 -6.49,1.27 -13.05,2.09 -19.51,3.48 -9.94,1.78 -20.02,2.52 -29.99,4.06 -5.11,0.91 -10.42,-0.23 -15.41,1.38 l -51.36,0 c -1.91,-0.53 -3.85,-0.9 -5.82,-0.94 -7.35,-0.13 -14.55,-1.87 -21.88,-2.28 -22.18,-3 -44.2,-7.48 -65.51,-14.39 -24,-6.94 -46.87,-17.33 -68.82,-29.18 -15.82,-9.06 -30.74,-19.61 -44.89,-31.1 -4.37,-3.97 -9.17,-7.47 -13.17,-11.85 C 86.41,878.6 79.36,872.6 73.64,865.37 35.4,821.95 11.39,766.74 3.44,709.56 1.86,700.5 1.59,691.26 0,682.22 L 0,629.8 c 0.94,-3.49 0.85,-7.11 1.22,-10.66 2.68,-25.71 6.52,-51.43 13.56,-76.35 10.89,-42.84 21.17,-85.85 32.44,-128.59 8.57,-34.41 17.18,-68.81 25.8,-103.21 8.1,-30.21 15.25,-60.68 22.99,-90.99 2.04,-7.49 3.2,-15.31 6.64,-22.34 3.91,-8.03 8.09,-16.19 14.61,-22.44 3.22,-3.1 6.22,-6.42 9.6,-9.34 13.91,-11.38 31.51,-17.73 49.26,-19.64 z" fill="#da251c" />
      </svg>
    );
  }
  if (bank === "Kotak Mahindra" || bank === "Kotak Mahindra Bank" || bank === "Kotak Bank") {
    return (
      <svg viewBox="0 0 34 30" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.28,14.5C2.28,7.43,8.94,1.7,17.16,1.7s14.88,5.73,14.88,12.8-6.66,12.8-14.88,12.8S2.28,21.57,2.28,14.5Z" fill="#003974"/>
        <polygon points="15.35 5.83 18.81 4.69 18.83 23.38 15.34 24.55 15.35 5.83" fill="#ec1c24"/>
        <path d="M17.4,17.47c-1.5,1.81-2.95,3.66-5.67,3.66-3.84,0-5.66-3.71-5.66-6.82s1.42-6.51,5.17-6.51c1.62,0,3.19.99,4.12,2.04v2.53c-.78-.52-2.52-1.04-3.66-1.06-2.37-.04-4.47.99-4.43,3.33.03,1.61,1.62,2.71,3.21,2.71,2.44,0,3.91-2.22,5.14-3.91.34-.44,1.31-1.74,1.47-1.95,1.37-1.91,2.95-3.66,5.67-3.66,3.2,0,5,2.58,5.51,5.24h-1.44c-.58-.86-1.7-1.39-2.8-1.39-2.52,0-4.02,2.32-5.28,4.02,0,0-.98,1.33-1.33,1.76ZM28.35,15.79c-.32,2.67-1.82,5.37-5.1,5.38-1.91,0-3.4-1.31-4.44-2.91v-1.85c1.29.64,2.5,1.33,3.97,1.35,1.81.03,3.44-.67,4.12-1.97h1.45Z" fill="#ffffff"/>
      </svg>
    );
  }
  if (bank === "Federal Bank" || bank === "Federal") {
    return (
      <svg viewBox="0 0 44 63" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(-0.38, -115.46)">
          <path d="m 3.41,161.93 8.54,-43.96 h 5.15 5.02 18.31 l -1.76,8.92 H 20.39 l -1.88,8.91 h 13.91 l -1.76,8.92 H 16.78 l -3.2,16.45 H 3.41 Z" fill="#004cbe" />
          <path d="m 45.0,177.54 1.16,-5.94 H 1.54 l -1.16,5.94 z" fill="#ff9c00" />
        </g>
      </svg>
    );
  }
  if (bank === "HDFC Bank") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#004C8F" />
        <rect x="7" y="7" width="22" height="22" fill="#ED1C24" />
        <rect x="11" y="11" width="14" height="14" fill="#FFFFFF" />
        <rect x="14" y="7" width="8" height="22" fill="#004C8F" />
        <rect x="7" y="14" width="22" height="8" fill="#004C8F" />
        <rect x="15" y="15" width="6" height="6" fill="#ED1C24" />
      </svg>
    );
  }
  if (bank === "ICICI Bank") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#B02A30" />
        <circle cx="18" cy="18" r="11" stroke="#F58220" strokeWidth="2.5" fill="none" />
        <circle cx="18" cy="12" r="2" fill="#F58220" />
        <path d="M18 16V24" stroke="#F58220" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (bank === "Axis Bank") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#97144D" />
        <path d="M18 7L27 27H20L18 21L16 27H9L18 7Z" fill="#FFFFFF" />
        <path d="M18 13L22 23H14L18 13Z" fill="#97144D" />
      </svg>
    );
  }
  if (bank === "IDFC First Bank") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#9E1B32" />
        <path d="M18 8L27 13V22L18 28L9 22V13L18 8Z" fill="#EAAA00" />
        <text x="18" y="21" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="9" fontFamily="sans-serif">1ST</text>
      </svg>
    );
  }
  if (bank === "Bank of Baroda") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#F26522" />
        <circle cx="18" cy="18" r="10" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
        <path d="M18 11C21.87 11 25 14.13 25 18H18V11Z" fill="#FFFFFF" />
      </svg>
    );
  }
  if (bank === "Standard Chartered") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#005EB8" />
        <path d="M10 20C10 14 15 11 20 11C23 11 26 13 26 16C26 21 16 19 16 23C16 25 18 26 21 26C24 26 26 24 26 24" stroke="#00A54F" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  if (bank === "HSBC") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#DB0011" />
        <rect x="6" y="6" width="24" height="24" fill="#FFFFFF" />
        <polygon points="6,6 18,18 6,30" fill="#DB0011" />
        <polygon points="30,6 18,18 30,30" fill="#DB0011" />
      </svg>
    );
  }
  if (bank === "LIC HFL" || bank === "LIC Housing Finance") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#004A8F" />
        <circle cx="18" cy="18" r="10" fill="#FFD200" />
        <path d="M18 11C18 11 15 15 15 17C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17C21 15 18 11 18 11Z" fill="#D32F2F" />
      </svg>
    );
  }
  if (bank === "Bajaj Housing" || bank === "Bajaj Housing Finance") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#004C97" />
        <path d="M10 24L16 12H20L14 24H10Z" fill="#FFFFFF" />
        <path d="M17 24L23 12H27L21 24H17Z" fill="#00A3E0" />
      </svg>
    );
  }
  if (bank === "Tata Capital") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#005696" />
        <path d="M11 12H25M18 12V25" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (bank === "PNB HFL" || bank === "PNB Housing Finance") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#A21D21" />
        <circle cx="18" cy="18" r="10" stroke="#FFC20E" strokeWidth="2.5" fill="none" />
        <text x="18" y="22" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="10" fontFamily="sans-serif">PNB</text>
      </svg>
    );
  }
  if (bank === "L&T Finance") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#005DAA" />
        <circle cx="18" cy="18" r="11" fill="#FFFFFF" />
        <text x="18" y="22" textAnchor="middle" fill="#005DAA" fontWeight="900" fontSize="9" fontFamily="sans-serif">L&amp;T</text>
      </svg>
    );
  }
  if (bank === "Piramal Finance" || bank === "Piramal Capital") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#BE2026" />
        <circle cx="18" cy="12" r="3.5" fill="#FFFFFF" />
        <circle cx="24" cy="18" r="3.5" fill="#FFFFFF" />
        <circle cx="18" cy="24" r="3.5" fill="#FFFFFF" />
        <circle cx="12" cy="18" r="3.5" fill="#FFFFFF" />
        <circle cx="18" cy="18" r="2" fill="#BE2026" />
      </svg>
    );
  }
  if (bank === "Aditya Birla Capital" || bank === "Aditya Birla Finance") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#C32026" />
        <path d="M8 25C9.5 20 13.5 16 18 16C22.5 16 26.5 20 28 25H8Z" fill="#F48120" />
        <path d="M11 25C12.5 21.5 15 19 18 19C21 19 23.5 21.5 25 25H11Z" fill="#FFC20E" />
        <circle cx="18" cy="12" r="3" fill="#FFC20E" />
      </svg>
    );
  }
  if (bank === "Godrej Housing Finance" || bank === "Godrej Housing" || bank === "Godrej Capital") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#9E1B32" />
        <text x="18" y="25" textAnchor="middle" fill="#FFFFFF" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="bold" fontSize="20">G</text>
      </svg>
    );
  }
  if (bank === "Shriram Finance" || bank === "Shriram Housing") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#0A387E" />
        <circle cx="18" cy="18" r="11" fill="#E62B25" />
        <path d="M18 9L21 16H15L18 9Z" fill="#FFD700" />
        <path d="M13 14L15 20H11L13 14Z" fill="#FFD700" />
        <path d="M23 14L25 20H21L23 14Z" fill="#FFD700" />
      </svg>
    );
  }
  if (bank === "Chola Finance" || bank === "Chola" || bank === "Cholamandalam") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#C4161C" />
        <path d="M18 6L21 15L30 18L21 21L18 30L15 21L6 18L15 15Z" fill="#FBB03B" />
        <circle cx="18" cy="18" r="3" fill="#FFFFFF" />
      </svg>
    );
  }
  if (bank === "Home First Finance" || bank === "HomeFirst") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#0D2E5C" />
        <path d="M18 8L7 18H12V28H24V18H29L18 8Z" fill="#F37023" />
        <path d="M15 28V20H21V28H15Z" fill="#FFFFFF" />
      </svg>
    );
  }
  if (bank === "Aavas Financiers" || bank === "Aavas") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#00796B" />
        <path d="M18 8L9 16V26H15V21H21V26H27V16L18 8Z" fill="#FF9800" />
      </svg>
    );
  }
  if (bank === "Muthoot Finance" || bank === "Muthoot") {
    return (
      <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="6" fill="#D32F2F" />
        <circle cx="18" cy="14" r="5" fill="#FFD700" />
        <path d="M11 26C11 21 14 18 18 18C22 18 25 21 25 26H11Z" fill="#FFFFFF" />
      </svg>
    );
  }
  return (
    <>
      <img 
        src={getBankLogo(bank)} 
        alt={`${bank} Logo`} 
        className="w-full h-full object-contain p-0.5 absolute inset-0 bg-white"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <Building2 className="w-3 h-3 text-slate-400" />
    </>
  );
}

export function ParrotLanding({ onApply, loginWithGoogle, loginWithEmailOrMobile, isLoggedIn, onGoToDashboard, onCookieSettingsClick, onLoginClick }: SectionProps) {
  const [view, setView] = useState<'landing' | 'about' | 'product' | 'article'>('landing');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCareersModal, setShowCareersModal] = useState(false);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const [selectedFactorIdx, setSelectedFactorIdx] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const [currentOfferIdx, setCurrentOfferIdx] = useState(0);

  const newsScrollRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollNews = (direction: 'left' | 'right') => {
    if (newsScrollRef.current) {
      const scrollAmount = 340;
      newsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOfferIdx((prev) => (prev + 1) % BANK_OFFERS_LIST.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      setLoginError("Please enter your registered Email or Mobile number");
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      if (loginWithEmailOrMobile) {
        await loginWithEmailOrMobile(loginInput.trim());
        setShowLoginModal(false);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please type a valid registered email/phone.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleProductSelect = (id: string) => {
    setSelectedProduct(id);
    setView('product');
    setShowProductDropdown(false);
  };

  if (view === 'article' && selectedArticle) {
    return (
      <div className="relative">
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-natural-border animate-in fade-in">
          <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button onClick={() => setView('landing')} className="cursor-pointer border-none bg-transparent">
                <Logo />
              </button>
              <div className="hidden md:flex items-center gap-8">
                <button onClick={() => setView('landing')} className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-sage hover:text-natural-terracotta transition-colors border-none bg-transparent cursor-pointer">Home</button>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-terracotta">Article Insight</span>
              </div>
            </div>
            {isLoggedIn ? (
              <button 
                onClick={onGoToDashboard}
                className="hidden sm:block bg-natural-sage text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10B981] transition-all cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <button 
                onClick={() => onLoginClick ? onLoginClick('customer') : setShowLoginModal(true)}
                className="hidden sm:block bg-[#10B981] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10B981]/95 transition-all cursor-pointer"
              >
                Existing User
              </button>
            )}
          </div>
        </nav>
        <ArticlePage 
          article={selectedArticle} 
          onBack={() => setView('landing')} 
          onApply={() => onApply()} 
        />
        <Footer onAboutClick={() => setView('about')} onProductClick={handleProductSelect} onPrivacyClick={() => setShowPrivacyModal(true)} onTermsClick={() => setShowTermsModal(true)} onCareersClick={() => setShowCareersModal(true)} />
      </div>
    );
  }

  if (view === 'about') {
    return (
      <div className="relative">
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-natural-border animate-in fade-in">
          <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button onClick={() => setView('landing')} className="cursor-pointer">
                <Logo />
              </button>
              <div className="hidden md:flex items-center gap-8">
                <button onClick={() => setView('landing')} className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-sage hover:text-natural-terracotta transition-colors">Home</button>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-terracotta">About Us</span>
              </div>
            </div>
            {isLoggedIn ? (
              <button 
                onClick={onGoToDashboard}
                className="hidden sm:block bg-natural-sage text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10B981] transition-all cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <button 
                onClick={() => onLoginClick ? onLoginClick('customer') : setShowLoginModal(true)}
                className="hidden sm:block bg-[#10B981] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10B981]/95 transition-all cursor-pointer"
              >
                Existing User
              </button>
            )}
          </div>
        </nav>
        <AboutUs onBack={() => setView('landing')} />
        <Footer onAboutClick={() => setView('about')} onProductClick={handleProductSelect} onPrivacyClick={() => setShowPrivacyModal(true)} onTermsClick={() => setShowTermsModal(true)} onCareersClick={() => setShowCareersModal(true)} />
      </div>
    );
  }

  if (view === 'product' && selectedProduct) {
    return (
      <div className="relative">
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-natural-border animate-in fade-in">
          <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button onClick={() => setView('landing')} className="cursor-pointer">
                <Logo />
              </button>
              <div className="hidden md:flex items-center gap-8">
                <button onClick={() => setView('landing')} className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-sage hover:text-natural-terracotta transition-colors">Home</button>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                
                {/* Product Dropdown in Subpage */}
                <div 
                  ref={productDropdownRef}
                  className="relative"
                  onMouseLeave={() => setShowProductDropdown(false)}
                >
                  <button 
                    onMouseEnter={() => setShowProductDropdown(true)}
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-natural-terracotta transition-colors py-1 cursor-pointer"
                  >
                    Product <ChevronDown className={cn("w-3 h-3 transition-transform", showProductDropdown && "rotate-180")} />
                  </button>

                  {showProductDropdown && (
                    <div 
                      className="absolute top-full left-0 pt-1 w-64 bg-white border border-natural-border rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="p-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleProductSelect(cat.id)}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer",
                              selectedProduct === cat.id ? "bg-natural-terracotta/5 text-natural-terracotta" : "hover:bg-slate-50 text-natural-sage"
                            )}
                          >
                            <cat.icon className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <button onClick={() => setView('about')} className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-sage hover:text-natural-terracotta transition-colors">About Us</button>
              </div>
            </div>
            {isLoggedIn ? (
              <button 
                onClick={onGoToDashboard}
                className="hidden sm:block bg-natural-sage text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10B981] transition-all cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <button 
                onClick={() => onLoginClick ? onLoginClick('customer') : setShowLoginModal(true)}
                className="hidden sm:block bg-[#10B981] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10B981]/95 transition-all cursor-pointer"
              >
                Existing User
              </button>
            )}
          </div>
        </nav>
        <ProductPage 
          productId={selectedProduct} 
          onBack={() => setView('landing')} 
          onApply={onApply} 
          onArticleClick={(art) => {
            setSelectedArticle(art);
            setView('article');
          }}
        />
        <Footer onAboutClick={() => setView('about')} onProductClick={handleProductSelect} onPrivacyClick={() => setShowPrivacyModal(true)} onTermsClick={() => setShowTermsModal(true)} onCareersClick={() => setShowCareersModal(true)} />
      </div>
    );
  }

  return (
    <div className="bg-natural-bg text-natural-text selection:bg-natural-terracotta/20 selection:text-natural-sage">
      {/* TOP NAVIGATION STRIP */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-natural-border">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => setView('landing')} className="cursor-pointer">
              <Logo />
            </button>
            <div className="hidden md:flex items-center gap-8">
              {/* Product Dropdown */}
              <div 
                ref={productDropdownRef}
                className="relative"
                onMouseLeave={() => setShowProductDropdown(false)}
              >
                <button 
                  onMouseEnter={() => setShowProductDropdown(true)}
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-natural-sage hover:text-natural-terracotta transition-colors py-1 cursor-pointer"
                >
                  Product <ChevronDown className={cn("w-3 h-3 transition-transform", showProductDropdown && "rotate-180")} />
                </button>

                {showProductDropdown && (
                  <div 
                    className="absolute top-full left-0 pt-1 w-64 bg-white border border-natural-border rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="p-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleProductSelect(cat.id)}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-natural-bg flex items-center gap-3 transition-all group cursor-pointer"
                        >
                          <cat.icon className="w-4 h-4 text-natural-muted group-hover:text-natural-terracotta" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-natural-sage group-hover:text-natural-terracotta">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <a href="#calculators" className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-sage hover:text-natural-terracotta transition-colors">Calculators</a>
              <button 
                onClick={() => setView('about')}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-sage hover:text-natural-terracotta transition-colors"
                id="header-about-us"
              >
                About Us
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button 
                onClick={onGoToDashboard}
                className="hidden sm:block bg-natural-sage text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10B981] hover:scale-105 active:scale-95 transition-all shadow-md shadow-natural-sage/10 cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <button 
                onClick={() => onLoginClick ? onLoginClick('customer') : setShowLoginModal(true)}
                className="hidden sm:block bg-[#10B981] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10B981]/90 hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#10B981]/10 cursor-pointer"
              >
                Existing User
              </button>
            )}
            
            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-natural-sage hover:text-natural-terracotta transition-all"
              aria-label="Toggle Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-natural-border bg-white p-6 space-y-6 shadow-xl animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black tracking-widest uppercase text-natural-muted">Loan Products</span>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleProductSelect(cat.id);
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-natural-bg hover:bg-natural-terracotta/5 text-natural-sage hover:text-natural-terracotta transition-colors text-left"
                  >
                    <cat.icon className="w-4 h-4 text-natural-muted shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-tight truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
              
              <hr className="border-natural-border" />
              
              <a 
                href="#calculators" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-natural-sage hover:text-natural-terracotta transition-colors flex items-center justify-between"
              >
                <span>Calculator Suite</span>
                <ChevronRight className="w-4 h-4 text-natural-muted" />
              </a>
              
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setView('about');
                }}
                className="py-2 text-left text-[10px] font-black uppercase tracking-[0.2em] text-natural-sage hover:text-natural-terracotta transition-colors flex items-center justify-between"
              >
                <span>About Our Firm</span>
                <ChevronRight className="w-4 h-4 text-natural-muted" />
              </button>

              <hr className="border-natural-border" />

              {isLoggedIn ? (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onGoToDashboard) onGoToDashboard();
                  }}
                  className="w-full py-3 bg-natural-sage text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-center"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onLoginClick) onLoginClick('customer');
                    else setShowLoginModal(true);
                  }}
                  className="w-full py-3 bg-[#10B981] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-center shadow-md shadow-[#10B981]/20"
                >
                  Existing User
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* SECTION 1: HERO BANNER */}
      <section className="relative bg-white pt-24 pb-12 overflow-hidden px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-16 py-14 md:py-20 bg-gradient-to-br from-[#EEF2F6] via-white to-[#F1F5F9] border border-slate-200/60 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.03)] relative overflow-hidden">
          {/* Ambient light glow spots */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/[0.22] rounded-full filter blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#10B981]/[0.05] rounded-full filter blur-[100px] pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Content Column */}
            <motion.div 
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
                  <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">India's Smartest Mortgage Engine</span>
                </motion.div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-slate-900 leading-[1.05]">
                  Compare & secure <br />
                  your home loan <span className="text-[#10B981] font-black italic">securely.</span>
                </h1>
                
                <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl leading-relaxed">
                  Start your mortgage journey on India's trusted platform. Get matched with top-tier lenders in minutes using <span className="text-slate-900 font-semibold">ParrotScore™</span>.
                </p>
              </div>

              <div className="hidden sm:flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                {isLoggedIn ? (
                  <button 
                    onClick={onGoToDashboard}
                    className="bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold px-8 py-4 rounded-full text-xs uppercase tracking-widest shadow-lg shadow-[#10B981]/15 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => onApply()}
                    className="bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold px-8 py-4 rounded-full text-xs uppercase tracking-widest shadow-lg shadow-[#10B981]/15 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </button>
                )}
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

            {/* Right Graphic/Token Cluster Column */}
            <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center h-[380px] lg:h-[450px]">
              {/* Spinning orbiting ring */}
              <div className="absolute w-[320px] h-[320px] xl:w-[380px] xl:h-[380px] border border-slate-200/50 rounded-full pointer-events-none animate-[spin_50s_linear_infinite]" />
              <div className="absolute w-[220px] h-[220px] xl:w-[260px] xl:h-[260px] border border-slate-200/80 border-dashed rounded-full pointer-events-none" />

              {/* Central Premium Token (ParrotScore) */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute z-10 w-44 h-44 xl:w-52 xl:h-52 rounded-full bg-gradient-to-br from-[#10B981]/5 via-white to-slate-100 border-4 border-white shadow-[0_24px_60px_rgba(16,185,129,0.08),inset_0_-10px_20px_rgba(0,0,0,0.03),inset_0_10px_20px_rgba(255,255,255,0.85)] flex flex-col items-center justify-center p-4"
              >
                {/* Concept 3: Concentric Pulse Rings radiating outward (Modern & Minimal) */}
                <div className="absolute w-[230px] h-[230px] xl:w-[270px] xl:h-[270px] rounded-full border border-[#10B981]/15 pointer-events-none z-0 flex items-center justify-center select-none">
                  {/* Inner pulse circle */}
                  <motion.div 
                    animate={{ scale: [0.93, 1.08, 0.93], opacity: [0.15, 0.45, 0.15] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-[#10B981]/10"
                  />
                  
                  {/* Outer pulse circle */}
                  <motion.div 
                    animate={{ scale: [1, 1.25, 1], opacity: [0.08, 0.28, 0.08] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-[290px] h-[290px] xl:w-[340px] xl:h-[340px] rounded-full border border-[#10B981]/5"
                  />

                  {/* Elegant floating live offer banner nestled on the ring */}
                  <div className="absolute -top-4 bg-white/95 border border-[#10B981]/25 rounded-full px-3 py-1 bg-gradient-to-r from-emerald-50/45 to-white shadow-[0_6px_20px_rgba(16,185,129,0.1)] flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-700 font-sans">
                      LIVE Offer: <span className="text-[#10B981]">{BANK_OFFERS_LIST[currentOfferIdx].bank}</span> <span className="text-slate-400 font-semibold px-0.5">•</span> {BANK_OFFERS_LIST[currentOfferIdx].offer}
                    </span>
                  </div>
                </div>

                <div className="w-full h-full border-2 border-dashed border-[#10B981]/25 rounded-full flex flex-col items-center justify-center p-3 relative bg-gradient-to-b from-white to-slate-50/40 z-10">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.25em] mb-1">ParrotScore™</span>
                  <span className="text-4xl xl:text-5.5xl font-black text-slate-900 tracking-tighter italic leading-none">842</span>
                  <div className="absolute -bottom-2.5 px-3 py-1 bg-[#10B981] text-white rounded-full text-[9px] font-bold uppercase tracking-widest shadow-md shadow-[#10B981]/20">
                    Excellent
                  </div>
                </div>
              </motion.div>

              {/* Floating Token 1: 7.10%* ROI (Top Right) */}
              <motion.div 
                animate={{ y: [0, 16, 0], x: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-10 right-10 xl:top-14 xl:right-14 z-20 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-50 to-white hover:from-white border-2 border-white shadow-[0_15px_30px_rgba(79,70,229,0.08),inset_0_-5px_10px_rgba(0,0,0,0.02)] flex items-center justify-center flex-col cursor-default"
              >
                <TrendingDown className="w-5 h-5 text-[#10B981] mb-1" />
                <span className="text-sm font-bold text-slate-800 leading-none">7.10%*</span>
                <span className="text-[7.5px] font-extrabold text-[#10B981] uppercase tracking-wide mt-1">Min Rate</span>
              </motion.div>

              {/* Floating Token 2: Savings Tag (Bottom Left) */}
              <motion.div 
                animate={{ y: [0, -12, 0], x: [0, -8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 left-10 xl:bottom-16 xl:left-14 z-20 w-22 h-22 rounded-full bg-gradient-to-br from-[#10B981]/5 via-white to-slate-50 border-2 border-white shadow-[0_15px_30px_rgba(0,0,0,0.05),inset_0_-5px_10px_rgba(0,0,0,0.02)] flex items-center justify-center flex-col cursor-default"
              >
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Savings</span>
                <span className="text-base font-black text-slate-800 italic mt-0.5">₹15.2L</span>
                <span className="text-[7px] font-extrabold text-[#10B981] uppercase tracking-widest mt-1">Direct ROI</span>
              </motion.div>

              {/* Floating Token 3: LTV Stat (Top Left) */}
              <motion.div 
                animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute top-16 left-8 xl:top-24 xl:left-12 z-20 w-16 h-16 rounded-full bg-gradient-to-br from-[#EEF2F6] to-white border-2 border-white shadow-[0_10px_20px_rgba(0,0,0,0.04)] flex items-center justify-center flex-col cursor-default"
              >
                <span className="text-sm font-black text-slate-800">80%</span>
                <span className="text-[7px] font-bold text-slate-450 uppercase tracking-wide">LTV Max</span>
              </motion.div>

              {/* Floating Token 4: Verified Badge (Bottom Right) */}
              <motion.div 
                animate={{ y: [0, -15, 0], x: [0, 6, 0] }}
                transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-12 right-12 xl:bottom-18 xl:right-16 z-20 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-50 to-white border-2 border-white shadow-[0_12px_24px_rgba(16,185,129,0.06)] flex items-center justify-center flex-col cursor-default"
              >
                <ShieldCheck className="w-5 h-5 text-[#10B981] mb-0.5" />
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">Instant</span>
                <span className="text-[9px] font-black text-[#10B981] uppercase tracking-wider">Sanction</span>
              </motion.div>
            </div>
          </div>


        </div>
      </section>

      {/* SECTION 1B: WHAT YOU UNLOCK WITH PARROTMONEY */}
      <section className="hidden md:block relative bg-white py-16 md:py-20 overflow-hidden border-b border-slate-100">
        {/* Subtle pale blueprint grid overlay to match exact design */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="unlocked-blueprint-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#003366" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#unlocked-blueprint-grid)" />
          </svg>
        </div>

        <div className="w-full max-w-[1240px] mx-auto px-4 md:px-8 relative z-10 space-y-12">
          {/* Header text with exact font weights and tracking */}
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937] tracking-tight">
              What you unlock with ParrotMoney
            </h2>
          </div>

          {/* Core Unlocked Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10 items-stretch">
            {/* Stat Item 1 */}
            <div className="border-l-2 border-[#10B981]/50 pl-6 flex flex-col justify-start space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Time to Go Live</p>
                <h3 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-[#1F2937] tracking-tight leading-none">
                  48 hours
                </h3>
              </div>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-[260px]">
                Launch a fully compliant mortgage operation in as little as two days.
              </p>
            </div>

            {/* Stat Item 2 */}
            <div className="border-l-2 border-[#10B981]/50 pl-6 flex flex-col justify-start space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Lenders Accessible</p>
                <h3 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-[#1F2937] tracking-tight leading-none">
                  25+
                </h3>
              </div>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-[260px]">
                Available through ParrotMoney's integrated lender network.
              </p>
            </div>

            {/* Stat Item 3 */}
            <div className="border-l-2 border-[#10B981]/50 pl-6 flex flex-col justify-start space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Cost to Originate</p>
                <h3 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-[#1F2937] tracking-tight leading-none">
                  90% less
                </h3>
              </div>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-[260px]">
                Our infrastructure produces loans at a fraction of traditional cost.
              </p>
            </div>

            {/* Stat Item 4 */}
            <div className="border-l-2 border-[#10B981]/50 pl-6 flex flex-col justify-start space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Ops Hires Required</p>
                <h3 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-[#1F2937] tracking-tight leading-none">
                  Zero
                </h3>
              </div>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-[260px]">
                We handle licensing, disclosures, and back office from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CATEGORY SELECTOR - MATCHES DASHBOARD DESIGN */}
      <section className="bg-slate-50/50 py-10 md:py-14 relative overflow-hidden border-b border-natural-border">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            <defs>
              <pattern id="grid-categories" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-categories)" />
          </svg>
        </div>

        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 relative z-10 animate-in fade-in">
          <div className="text-center max-w-5xl mx-auto space-y-4 mb-12 md:mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-500 font-sans text-center"
            >
              Select Loan Purpose
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937] tracking-tight">
              Find Your Best Deal
            </h2>
            <p className="hidden md:block text-natural-muted text-sm font-medium leading-relaxed max-w-2xl mx-auto">
              Our matching algorithms map your profile parameters directly across 25+ major lending systems. Select an option to check rates instantly.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3.5 max-w-6xl mx-auto">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onApply(cat.id)}
                className="p-3.5 sm:p-5 md:p-8 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-100 bg-white transition-all text-left flex items-center gap-2.5 sm:gap-4 md:gap-6 relative group shadow-sm hover:border-[#10B981]/25 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 bg-white border border-slate-100/50 group-hover:border-[#10B981]/30 group-hover:bg-[#10B981]/5">
                  <cat.icon className="w-5 h-5 md:w-7 md:h-7 text-[#10B981]/80 group-hover:text-[#10B981] transition-colors" strokeWidth={1.2} />
                </div>
                <div className="space-y-1">
                  <p className="font-sans font-bold text-xs sm:text-sm md:text-base text-slate-800 transition-colors leading-tight">
                    {cat.label === 'Loan Against Property' ? (
                      <>
                        <span className="block sm:inline">Loan Against</span>{' '}
                        <span className="block sm:inline">Property</span>
                      </>
                    ) : cat.label === 'Plot + Construction' ? (
                      <>
                        <span className="block sm:inline">Plot +</span>{' '}
                        <span className="block sm:inline">Construction</span>
                      </>
                    ) : cat.label === 'Commercial Property' ? (
                      <>
                        <span className="block sm:inline">Commercial</span>{' '}
                        <span className="block sm:inline">Property</span>
                      </>
                    ) : (
                      cat.label
                    )}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4B: WHY COMPARE FIRST? */}
      <section className="bg-slate-50 py-20 md:py-28 text-natural-text relative overflow-hidden border-y border-slate-200/50" id="calculators">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start lg:items-end">
            
            {/* Left Side: Content & Factors Grid */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <span className="w-8 h-[1px] bg-slate-200"></span>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-500 font-sans">Interactive Evaluator</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937] tracking-tight">
                Why Compare First?
              </h2>
              
              <p className="font-sans text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-semibold max-w-xl">
                Home loan features vary significantly across retail lenders. Click on any critical parameter below to inspect our real-time market comparison dashboard.
              </p>

              {/* 2x4 Grid of exactly 8 core reasons that act as interactive state tabs */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:gap-y-4 pt-4 mt-5 border-t border-slate-200/80">
                {FACTORS_DATA.map((item, idx) => {
                  const isSelected = selectedFactorIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedFactorIdx(idx)}
                      className={cn(
                        "text-left py-1.5 px-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 border select-none group flex flex-col justify-start items-start outline-none",
                        isSelected 
                          ? "bg-emerald-50/50 border-[#10B981]/35 shadow-[0_2px_12px_rgba(16,185,129,0.04)] translate-x-1" 
                          : "bg-transparent border-transparent hover:bg-slate-100/60 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-300 shrink-0",
                          isSelected ? "bg-[#10B981] scale-125" : "bg-slate-300 group-hover:bg-[#10B981]"
                        )} />
                        <h4 className={cn(
                          "font-sans font-bold text-xs sm:text-sm md:text-base transition-colors",
                          isSelected ? "text-[#10B981]" : "text-slate-800 group-hover:text-slate-900"
                        )}>
                          {item.title}
                        </h4>
                      </div>
                      <p className="hidden md:block text-xs text-slate-400 font-medium pl-3 mt-1 group-hover:text-slate-500 transition-colors">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Interactive Comparison Card that dynamically updates */}
            <div className="lg:col-span-6 w-full max-w-xl mx-auto lg:mx-0">
               <motion.div 
                 key={selectedFactorIdx}
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.3 }}
                 className="bg-white border border-slate-200/80 rounded-3xl pt-5 md:pt-6 pb-6 px-6 md:px-8 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col text-left relative"
               >
                 {/* Card Header row */}
                 <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                   <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
                     {FACTORS_DATA[selectedFactorIdx].badgeLeft}
                   </span>
                   <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-[#10B981]/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-sans">
                     {FACTORS_DATA[selectedFactorIdx].badgeRight}
                   </span>
                 </div>

                 {/* Banks List */}
                 <div className="space-y-2">
                   {FACTORS_DATA[selectedFactorIdx].banks.map((bank, bIdx) => {
                     if (bank.isBest) {
                       return (
                         <div 
                           key={bIdx} 
                           className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-emerald-50/70 to-emerald-50/5 border border-[#10B981]/20 rounded-2xl relative shadow-sm"
                         >
                           <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 md:gap-3">
                             <span className="font-sans font-bold text-xs sm:text-sm md:text-base text-emerald-950 leading-tight flex items-center gap-1.5">
                               {bank.name.replace(" (Parrot Rate)", "")}
                               {bank.name.includes("(Parrot Rate)") && <Check className="w-4 h-4 text-[#10B981] shrink-0 stroke-[3]" />}
                             </span>
                             <span className="inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#10B981] text-white leading-none scale-90 sm:scale-100 origin-left font-sans">
                               Best Deal
                             </span>
                           </div>
                           <div className="flex flex-col items-end">
                             <span className="font-sans font-bold text-xs sm:text-sm md:text-base text-emerald-700">
                               {bank.value}
                             </span>
                             <span className="text-[9px] text-[#10B981] font-semibold tracking-tight mt-0.5 font-sans">
                               {bank.status}
                             </span>
                           </div>
                         </div>
                       );
                     }

                     return (
                       <div 
                         key={bIdx} 
                         className="flex items-center justify-between py-2 md:py-2.5 border-b border-slate-100/60 hover:bg-slate-50/50 px-3 rounded-xl transition-colors"
                       >
                         <div className="flex items-center gap-3">
                           <span className={cn(
                             "font-bold text-xs sm:text-sm md:text-base font-sans",
                             bank.isWorst ? "text-slate-400" : "text-slate-600"
                           )}>
                             {bank.name}
                           </span>
                           {bank.isWorst && (
                             <span className="inline-block text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100/40 leading-none scale-90 font-sans font-bold">
                               Stricter Rules
                             </span>
                           )}
                         </div>
                         <div className="flex flex-col items-end">
                           <span className={cn(
                             "font-sans font-bold text-xs sm:text-sm md:text-base",
                             bank.isWorst ? "text-slate-400" : "text-slate-700"
                           )}>
                             {bank.value}
                           </span>
                           <span className="text-[10px] text-slate-400 font-medium font-sans">
                             {bank.status}
                           </span>
                         </div>
                       </div>
                     );
                   })}
                 </div>

                 {/* Premium dynamic outcome insight banner at the bottom */}
                 <div className="hidden sm:flex mt-4 pt-4 border-t border-slate-100/80 items-start gap-2.5 bg-emerald-50/45 p-3 md:p-3.5 rounded-2xl border border-emerald-100/30">
                   <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 fill-emerald-100" />
                   <div className="space-y-0.5">
                     <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 font-sans block">
                       PARROT INSIGHT VALUE
                     </span>
                     <p className="text-xs text-emerald-800 font-semibold leading-relaxed font-sans">
                       {FACTORS_DATA[selectedFactorIdx].highlight}
                     </p>
                   </div>
                 </div>

               </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS JOURNEY */}
      <section className="bg-[#fbfcff] py-10 md:py-14 relative overflow-hidden border-y border-natural-border" id="how-it-works-journey">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            <defs>
              <pattern id="grid-journey" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-journey)" />
          </svg>
        </div>
        
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6 mb-10 md:mb-14">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-500 font-sans text-center"
             >
               Transparent Process
             </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937] tracking-tight">
              How it works. <span className="text-[#10B981]">Full Visibility.</span>
            </h2>
            <p className="hidden sm:block text-sm md:text-base text-natural-muted font-medium leading-relaxed max-w-2xl mx-auto">
              From your first input to loan disbursement — a clear, transparent 5-step journey.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="absolute top-10 left-0 w-full h-[2px] bg-[#10B981]/10 hidden lg:block" />
            
            <div className="grid grid-cols-5 gap-1.5 sm:gap-6 md:grid-cols-3 lg:grid-cols-5 md:gap-8 md:overflow-visible md:pb-0">
              {[
                { icon: Users, title: "Share Profile", text: "Fill the form or chat on WhatsApp in under 3 minutes." },
                { icon: Brain, title: "AI Scanning", text: "ParrotScore™ maps your profile to bank-specific filters." },
                { icon: Zap, title: "Indicative Deals", text: "Get 5 matched offers with probability scores." },
                { icon: UserCheck, title: "RM Review", text: "Your RM validates details and reaches out within 4 hours." },
                { icon: FileText, title: "Submit & Track", text: "Submit online and monitor status in real time." }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center text-center space-y-2 sm:space-y-6 relative group w-full md:w-auto"
                >
                  <div className="w-10 h-10 min-[375px]:w-12 min-[375px]:h-12 sm:w-16 md:w-20 sm:h-16 md:h-20 rounded-[0.75rem] min-[375px]:rounded-[1rem] sm:rounded-[1.5rem] md:rounded-[2rem] bg-white border border-natural-border text-natural-sage flex items-center justify-center relative z-10 shadow-lg sm:shadow-xl group-hover:scale-110 group-hover:border-[#10B981]/30 transition-all duration-500">
                    <step.icon className="w-4.5 h-4.5 sm:w-6 sm:h-6 md:w-8 md:h-8 stroke-1 text-[#10B981] transition-colors" />
                    
                    <div className="absolute -top-1 -right-1 w-4 h-4 min-[375px]:w-5 min-[375px]:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[8px] min-[375px]:text-[9px] sm:text-[10px] md:text-[11px] font-black text-natural-sage shadow-sm">
                      0{i + 1}
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2 px-1 sm:px-2">
                    <h3 className="font-sans font-bold text-[9px] min-[375px]:text-[10px] min-[400px]:text-[11px] sm:text-sm md:text-base text-slate-800 group-hover:text-[#10B981] transition-colors leading-tight">{step.title}</h3>
                    {i === 1 && (
                      <span className="block sm:hidden text-[7.5px] min-[375px]:text-[8px] font-bold text-[#10B981] mt-0.5 whitespace-nowrap">ParrotScore™</span>
                    )}
                    <p className="hidden sm:block text-[11px] md:text-sm text-natural-muted font-medium leading-relaxed">{step.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: THE ParrotScore™ AI ENGINE */}
      <section className="py-10 md:py-14 bg-natural-sage relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            <defs>
              <pattern id="grid-ai" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-ai)" />
          </svg>
        </div>

        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-4 mb-10 md:mb-14">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#10B981]/35 bg-[#10B981]/10 text-[#10B981] rounded-full font-black text-[9px] uppercase tracking-[0.2em] mx-auto"
            >
              <Brain className="w-3.5 h-3.5 animate-pulse" />
              PARROTSCORE™ AI ENGINE
            </motion.div>
            
            <h2 className="text-base min-[360px]:text-lg min-[400px]:text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight whitespace-nowrap sm:whitespace-normal">
              Decision-Making, <span className="text-[#10B981]">Powered by AI.</span>
            </h2>
            
            <p className="hidden sm:block text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
              Powered by data from 25+ lenders. Guided by bank-defined criteria.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-12">
              <div className="grid grid-cols-3 gap-6 md:gap-12">
                {[
                  { val: "14", label: "Params", sub: "Borrower profile" },
                  { val: "<3 min", label: "Time", sub: "Instant match" },
                  { val: "25+", label: "Lenders", sub: "Banks & NBFCs" },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center text-center space-y-4 font-display"
                  >
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-[#10B981] p-[6px] md:p-[8px] bg-[#10B981] flex items-center justify-center transition-all duration-300 shadow-lg shadow-[#10B981]/10 hover:shadow-[#10B981]/20">
                      <div className="w-full h-full rounded-full border border-[#10B981] bg-natural-sage flex items-center justify-center transition-colors duration-300 group-hover:bg-[#10B981]/15">
                        <span className="text-lg md:text-xl font-black text-white italic">{item.val}</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-normal text-white uppercase tracking-tight">{item.label}</p>
                      <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="hidden sm:block bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="flex gap-4 items-start">
                  <div className="bg-orange-500/20 p-2 rounded-lg shrink-0">
                    <Info className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-xs font-medium text-[#10B981]/95 leading-relaxed italic">
                    AI suggestions are indicative; final eligibility is subject to lender's discretion.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-6 space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-8 bg-[#10B981]" />
                <h4 className="text-[#10B981] font-black uppercase tracking-[0.2em] text-[10px]">
                  Analysis Parameters
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  "Monthly Income", "Employment",
                  "CIBIL Score", "Age & Tenure",
                  "Existing Obligations", "Loan Amount",
                  "Property Type", "Property Location",
                  "LTV Requirement", "Co-Applicant",
                  "Income Profile", "Resident Status",
                  "Offer Eligibility", "Docs Type"
                ].map((name, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-xl hover:bg-white/10 transition-all group overflow-hidden"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                       <span className="text-[8px] font-black text-white">{i + 1}</span>
                    </div>
                    <span className="text-white text-[10px] font-normal tracking-[0.05em] leading-tight truncate">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: CALCULATOR SUITE */}
      <section className="py-10 md:py-14 bg-white border-b border-natural-border" id="calculators">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
            <div className="text-center max-w-5xl mx-auto space-y-6 mb-10 md:mb-14">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-500 font-sans text-center"
               >
                 Precision Planning
               </motion.div>
               <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937] tracking-tight">Universal Calculator Suite.</h2>
               <p className="hidden sm:block text-sm md:text-base text-natural-muted font-medium max-w-xl mx-auto">
                 Optimize every rupee of your loan journey.
               </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <MortgageCalculator onApply={onApply} />
            </div>
        </div>
      </section>



      {/* SUCCESS STORIES (PREMIUM LIGHT THEME CAROUSEL) */}
      <section className="pt-24 pb-14 md:pt-32 md:pb-20 bg-[#F8FAFC] text-slate-900 relative overflow-hidden border-t border-b border-slate-200/60" id="success-stories">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full filter blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-emerald-500/[0.02] rounded-full filter blur-[120px] pointer-events-none" />
         
         <div className="w-full max-w-[1240px] mx-auto px-4 md:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
               {/* Left Column: Heading */}
               <div className="md:col-span-5 lg:col-span-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937] tracking-tight select-none leading-tight">
                     What our clients say
                     <br />
                     <span className="text-slate-400">about us?</span>
                  </h2>
               </div>

               {/* Right Column: Testimonial content & controls */}
               <div className="md:col-span-7 lg:col-span-8 space-y-8">
                  {/* Side-by-side Slide Controls */}
                  <div className="flex justify-end gap-3">
                     <button 
                        onClick={() => setActiveTestimonialIdx((prev) => (prev - 1 + 4) % 4)}
                        className="w-12 h-12 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-sm hover:shadow transition-all cursor-pointer select-none active:scale-95"
                        aria-label="Previous testimonial"
                      >
                        <ArrowLeft className="w-5 h-5" />
                     </button>
                     <button 
                        onClick={() => setActiveTestimonialIdx((prev) => (prev + 1) % 4)}
                        className="w-12 h-12 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-sm hover:shadow transition-all cursor-pointer select-none active:scale-95"
                        aria-label="Next testimonial"
                      >
                        <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
  
                  {/* Testimonial Active Slide Frame */}
                  <div className="w-full text-left">
                     {[
                       {
                         name: "Aditya Vardhan",
                         title: "Product Manager, Tech Unicorn",
                         avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200",
                         fragments: [
                           { text: "Our ", highlight: false },
                           { text: "composite SBI plot and construction loan", highlight: true },
                           { text: " was approved with synchronized disbursements. We ", highlight: false },
                           { text: "beat standard bank branch rates by 45 basis points", highlight: true },
                           { text: ", saving an estimated ", highlight: false },
                           { text: "₹18 Lakhs in total interest payouts", highlight: true },
                           { text: ".", highlight: false }
                         ]
                       },
                       {
                         name: "Meera Krishnan",
                         title: "Co-Founder, Design Agency",
                         avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
                         fragments: [
                           { text: "After multiple retail bank executives ", highlight: false },
                           { text: "rejected my home loan application", highlight: true },
                           { text: " due to non-salaried freelance cashflows, Parrot verified our company accounts and got us ", highlight: false },
                           { text: "sanctioned within 48 hours", highlight: true },
                           { text: " with HDFC at absolute minimum premiums.", highlight: false }
                         ]
                       },
                       {
                         name: "Abhishek Sen",
                         title: "Senior Director, Logistics Corp",
                         avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200",
                         fragments: [
                           { text: "As an NRI residing in Dubai, ", highlight: false },
                           { text: "coordinating Indian registry and developer APFs", highlight: true },
                           { text: " seemed impossible. ParrotMoney’s zero-flight validation pipeline got our construction finances ", highlight: false },
                           { text: "fully disbursed with 100% digital remote signature approvals", highlight: true },
                           { text: ".", highlight: false }
                         ]
                       },
                       {
                         name: "Gurpreet Singh",
                         title: "Agriculturalist & Landowner",
                         avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
                         fragments: [
                           { text: "Other mortgage platforms ", highlight: false },
                           { text: "outright refused our village Khasra property plots", highlight: true },
                           { text: ", but Parrot analyzed local registry maps instantly and unlocked ", highlight: false },
                           { text: "pre-approved cooperative lending funds", highlight: true },
                           { text: " in under four working days with zero hidden agent markups.", highlight: false }
                         ]
                       }
                     ].map((test, idx) => {
                       const isActive = activeTestimonialIdx === idx;
                       if (!isActive) return null;
                       
                       return (
                         <div key={idx} className="space-y-7 animate-fade-in">
                           {/* The Giant Quote Text Block */}
                           <div className="min-h-[130px] md:min-h-[100px] flex items-center justify-start relative w-full overflow-visible">
                              {/* Giant transparent background quotation mark */}
                              <span className="absolute -top-20 md:-top-24 -left-4 md:-left-8 text-[10rem] md:text-[12rem] font-serif leading-none text-slate-200/45 pointer-events-none select-none z-0">
                                 “
                              </span>
                              <p className="text-base md:text-lg lg:text-xl font-sans font-medium tracking-normal text-left leading-relaxed select-none relative z-10 pl-2">
                                 <span className="text-slate-300 font-light">"</span>
                                 {test.fragments.map((frag, fIdx) => (
                                   <span 
                                      key={fIdx} 
                                      className={frag.highlight ? "text-slate-900 font-bold" : "text-slate-500/90 font-normal"}
                                   >
                                      {frag.text}
                                   </span>
                                 ))}
                                 <span className="text-slate-300 font-light">"</span>
                              </p>
                           </div>
       
                           {/* Profile Bar */}
                           <div className="pt-6 border-t border-slate-200 w-full animate-fade-in">
                              <img 
                                 src={test.avatar} 
                                 alt={test.name}
                                 referrerPolicy="no-referrer"
                                 className="hidden"
                              />
                              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 text-left">
                                 <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-sans font-bold text-lg text-slate-900 tracking-tight">{test.name}</span>
                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/30">
                                       <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                                       Verified Customer
                                    </span>
                                 </div>
                                 <span className="hidden sm:inline text-slate-300">|</span>
                                 <span className="text-slate-500 text-sm md:text-base font-normal font-sans">{test.title}</span>
                              </div>
                           </div>
                         </div>
                       );
                     })}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* PARROTMONEY FAQ SECTION */}
      <section className="pt-12 pb-20 md:pt-16 md:pb-28 bg-[#F9F9F9] relative overflow-hidden border-t border-b border-gray-100" id="faqs">
         <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-2 mb-16 text-center">
               <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937] tracking-tight">Frequently asked questions</h2>
            </div>
 
            <div className="max-w-4xl mx-auto border-t border-gray-200 divide-y divide-gray-200">
               {[
                 {
                   q: "What is ParrotMoney and how does it help home loan applicants?",
                   a: "ParrotMoney is a premium digital home loan eligibility optimizer and financial distributor. We work as a direct matchmaker between property buyers and top commercial banks. Our matching engine analyzes factors such as co-borrower eligibility, credit scores, regional land categories, and income structures to identify perfect loan pairings, ensuring applicants secure highly competitive optimized interest rates with zero hidden platform markups."
                 },
                 {
                   q: "Is ParrotMoney a direct lender, or do you act as a licensed intermediary?",
                   a: "ParrotMoney is a licensed corporate financial intermediary and channel partner. We partner directly with India's largest regulated institutions—including State Bank of India (SBI), HDFC Bank, ICICI Bank, Axis Bank, LIC Housing Finance, and many more. Your mortgage loan is governed, approved, and disbursed directly by the selected licensed institution under standard Reserve Bank of India (RBI) rules."
                 },
                 {
                   q: "Does using ParrotMoney cost me anything?",
                   a: "No, the entire suite of ParrotMoney optimization, bank matchmaking, document checklists, and underwriting consultation is 100% free for applicants. We receive standard distributor commission fees directly from the partner banking institutions upon a successful disbursement. We never pass any administrative fees or hidden advisory costs to our users."
                 },
                 {
                   q: "Who is eligible to apply, and which property types do you support?",
                   a: "We support Salaried, Self-Employed professionals, NRIs, and registered Business owners. Unlike regular portals, we specialize in high-complexity files—including composite land & construction loans, independent builder homes, non-traditional freelance incomes, NRI remote sanctions, cooperative local bank matches, and special agrarian/village plot loans."
                 },
                 {
                   q: "How does the home building/buying process flow work on the portal?",
                   a: "In under 3 minutes: (1) Complete our responsive profile questionnaire. (2) Receive matched, calibrated bank offers tailored to your exact property city. (3) Proceed to sync your digital verification records. Our dedicated-channel team coordinates all file indexing and direct interactions with bank underwriters to ensure fast-tracked processing."
                 },
                 {
                   q: "How secure is my personal and financial documentation?",
                   a: "Data privacy is our absolute priority. All document transmissions are highly encrypted, protected under strict Firestore database rule policies, and shared solely with the specific partner banks you explicitly authorize. We do not license, rent, or lease your profile metadata or contact information to any third-party marketing networks."
                 }
               ].map((faq, idx) => {
                 const isOpen = openFaqIdx === idx;
                 return (
                   <div key={idx} className="w-full">
                     <button
                       onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                       className="w-full text-left py-6 flex items-center justify-between gap-4 font-normal text-sm md:text-base text-slate-800 hover:text-slate-900 transition-colors border-none bg-transparent cursor-pointer"
                     >
                       <span>{faq.q}</span>
                       <ChevronDown 
                         className={cn(
                           "w-4 h-4 shrink-0 text-slate-400 transition-transform duration-300", 
                           isOpen && "rotate-180"
                         )} 
                       />
                     </button>
                     <div
                       className={cn(
                         "overflow-hidden transition-all duration-300 ease-in-out",
                         isOpen ? "max-h-[300px] pb-6" : "max-h-0"
                       )}
                     >
                       <div className="text-xs md:text-sm text-slate-500 leading-relaxed font-normal">
                         {faq.a}
                       </div>
                     </div>
                   </div>
                 );
               })}
            </div>
         </div>
      </section>

      {/* ARTICLES AND NEWS SECTION */}
      <section className="py-16 md:py-24 bg-white border-t border-b border-gray-100" id="news">
         <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
               <div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#10B981] mb-2.5 block">Market Intelligence</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937] tracking-tight">
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
                        setSelectedArticle(art);
                        setView('article');
                     }}
                  >
                     <div className="space-y-4">
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

                     <div className="pt-4 mt-4 border-t border-slate-200/50 flex items-center justify-between">
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



      {/* LENDER PARTNER MARQUEE */}
      <section className="py-3.5 bg-slate-50/90 overflow-hidden border-y border-slate-200/60">
        <div className="w-full overflow-hidden">
          <div className="flex w-fit whitespace-nowrap animate-marquee animate-infinite" style={{ animationDuration: '90s' }}>
             {[
               "SBI", "HDFC Bank", "ICICI Bank", "Kotak Mahindra Bank", "Axis Bank", 
               "Federal Bank", "Bank of Baroda", "Union Bank of India", "IDFC First Bank",
               "Standard Chartered", "HSBC",
               "LIC Housing Finance", "Bajaj Housing Finance", "Tata Capital", 
               "PNB Housing Finance", "Piramal Finance", "Aditya Birla Capital", 
               "Godrej Housing Finance", "L&T Finance", "Shriram Finance", 
               "Chola Finance", "Home First Finance", "Aavas Financiers", "Muthoot Finance",
               "SBI", "HDFC Bank", "ICICI Bank", "Kotak Mahindra Bank", "Axis Bank", 
               "Federal Bank", "Bank of Baroda", "Union Bank of India", "IDFC First Bank",
               "Standard Chartered", "HSBC",
               "LIC Housing Finance", "Bajaj Housing Finance", "Tata Capital", 
               "PNB Housing Finance", "Piramal Finance", "Aditya Birla Capital", 
               "Godrej Housing Finance", "L&T Finance", "Shriram Finance", 
               "Chola Finance", "Home First Finance", "Aavas Financiers", "Muthoot Finance"
             ].map((bank, i) => (
                <div key={i} className="inline-flex items-center gap-2 px-5 group transition-all opacity-90 hover:opacity-100">
                  <div className="w-5 h-5 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 group-hover:border-[#10B981]/40 group-hover:text-[#10B981] transition-all shadow-2xs relative overflow-hidden shrink-0">
                    <MarqueeBankLogo bank={bank} />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-slate-700 group-hover:text-[#10B981] transition-colors tracking-tight">
                    {bank}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </section>

      <Footer 
        onAboutClick={() => setView('about')} 
        onProductClick={handleProductSelect} 
        onPrivacyClick={() => setShowPrivacyModal(true)} 
        onTermsClick={() => setShowTermsModal(true)} 
        onCareersClick={() => setShowCareersModal(true)} 
        onCookieClick={onCookieSettingsClick}
        onLoginClick={onLoginClick}
      />

      {/* Privacy, Disclosures and Legal terms modal */}
      <CareersSection isOpen={showCareersModal} onClose={() => setShowCareersModal(false)} />
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <TermsAndConditionsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
}

function Footer({ 
  onAboutClick, 
  onProductClick, 
  onPrivacyClick, 
  onTermsClick, 
  onCareersClick, 
  onCookieClick,
  onLoginClick
}: { 
  onAboutClick: () => void, 
  onProductClick: (id: string) => void, 
  onPrivacyClick: () => void, 
  onTermsClick: () => void, 
  onCareersClick: () => void, 
  onCookieClick?: () => void,
  onLoginClick?: (mode?: 'customer' | 'admin') => void
}) {
  return (
    <footer className="bg-natural-sage pt-20 pb-12 text-white border-t border-white/5 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <defs>
            <pattern id="grid-footer" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-footer)" />
        </svg>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24">
            <div className="space-y-8">
               <Logo />
               <p className="text-sm font-medium text-white/40 leading-relaxed max-w-xs">
                  India's AI-assisted Home Loan marketplace. We provide smart suggestions from 25+ banks.
               </p>
               {onLoginClick && (
                 <div className="pt-2">
                   <button
                     onClick={() => onLoginClick('admin')}
                     className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[10px] font-black uppercase tracking-wider transition-colors border border-white/10 cursor-pointer"
                   >
                     <Shield className="w-3.5 h-3.5 text-emerald-400" /> Admin Portal Access
                   </button>
                 </div>
               )}
            </div>

            <div>
               <h4 className="font-black text-[10px] uppercase tracking-widest mb-4 text-natural-terracotta">Quick Links</h4>
               <div className="flex flex-col gap-2 text-sm font-normal text-white/60">
                  <a href="#how-it-works-journey" className="hover:text-white transition-colors">Compare Banks</a>
                  <a href="#calculators" className="hover:text-white transition-colors">Calculators</a>
                  <button onClick={onAboutClick} className="text-left hover:text-white transition-colors">About Us</button>
                  <button onClick={onCareersClick} className="text-left hover:text-white transition-colors flex items-center gap-1.5">
                     Careers
                     <span className="bg-orange-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full animate-pulse">Hiring</span>
                  </button>
                  {onLoginClick && (
                    <button onClick={() => onLoginClick('customer')} className="text-left hover:text-white transition-colors">
                      Borrower Sign In
                    </button>
                  )}
                  <a href="#" className="hover:text-white transition-colors">Partner with Us</a>
               </div>
            </div>

            <div>
               <h4 className="font-black text-[10px] uppercase tracking-widest mb-4 text-natural-terracotta">Loan Types</h4>
               <div className="flex flex-col gap-2 text-sm font-normal text-white/60">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => onProductClick(cat.id)}
                      className="text-left hover:text-white cursor-pointer"
                    >
                      {cat.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="font-black text-[10px] uppercase tracking-widest text-natural-terracotta">Contact Us</h4>
               <div className="space-y-2">
                  <div className="flex gap-3 items-center">
                     <Phone className="w-4 h-4 text-natural-terracotta" />
                     <span className="text-sm font-normal text-white/60">1800-PARROT-ML</span>
                  </div>
                  <div className="flex gap-3 items-center text-white/60">
                     <MessageSquare className="w-4 h-4 text-natural-terracotta" />
                     <span className="text-sm font-normal">WhatsApp Polly AI</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="pt-20 border-t border-white/5 space-y-12">
            <p className="text-[9px] font-medium leading-relaxed text-white/30 text-center max-w-5xl mx-auto italic">
              ParrotMoney (Brand of Parrot FinTech Pvt. Ltd.) is a loan marketplace and facilitator. Results shown are indicative only, based on self-declared information. These suggestions do not constitute a loan approval, offer, or guarantee. Final loan eligibility, sanction, and disbursement are at the sole discretion of the respective bank or NBFC, subject to their internal credit policies, document verification, legal due diligence and regulatory guidelines.
            </p>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">© 2026 ParrotMoney | All Rights Reserved</p>
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-white/20">
                  <button onClick={onPrivacyClick} className="hover:text-white cursor-pointer transition-colors duration-200">Privacy</button>
                  <button onClick={onTermsClick} className="hover:text-white cursor-pointer transition-colors duration-200">Terms</button>
                  <button onClick={onCookieClick || onPrivacyClick} className="hover:text-white cursor-pointer transition-colors duration-200">Cookies</button>
                </div>
            </div>
         </div>
      </div>
    </footer>
  );
}
