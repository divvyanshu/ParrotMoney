import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, User, TrendingUp, ShieldCheck, Zap, Sparkles, 
  Heart, Share2, Bookmark, Check, ChevronRight, Mail, Calculator, Info,
  Percent, Star, ThumbsUp, ArrowRight, HelpCircle, RefreshCw, Smartphone, Award,
  Linkedin, Twitter, Link
} from 'lucide-react';
import { cn } from '../lib/utils';

// Local copy of articles data to support related reading navigation directly on-page
const COMPANION_ARTICLES = [
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
    title: 'Unlocking Overdraft Benefit: SBI MaxGain vs HDFC MaxSaver Detailed Review',
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

interface ArticlePageProps {
  article: {
    id: string;
    category: string;
    imageUrl: string;
    title: string;
    description: string;
    author: string;
    role: string;
    date: string;
    readTime: string;
    accentColor: string;
    content: string;
  };
  onBack: () => void;
  onApply: () => void;
}

export function ArticlePage({ article: initialArticle, onBack, onApply }: ArticlePageProps) {
  const [article, setArticle] = useState(initialArticle);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [likes, setLikes] = useState(148);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Widget States: RBI Policy MCLR vs RLLR Migrator
  const [mclrLoanAmount, setMclrLoanAmount] = useState(7500000); // 75 L
  
  // Widget States: Overdraft Calculator
  const [odLoanAmount, setOdLoanAmount] = useState(10000000); // 1 Cr
  const [odSurplus, setOdSurplus] = useState(150000); // 1.5 L monthly avg surplus

  // Widget States: Eligibility Booster checklist
  const [boosterChecklist, setBoosterChecklist] = useState({
    coApplicant: true,
    rentalIncome: false,
    consultancy: false,
    annualBonus: false,
    agriIncome: false
  });

  // Track scroll position for header progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update active article and reset states if parent prop updates
  useEffect(() => {
    setArticle(initialArticle);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Set customized initial likes based on article ID
    if (initialArticle.id === 'rbi-policy-2026') setLikes(245);
    else if (initialArticle.id === 'overdraft-advisory') setLikes(412);
    else setLikes(189);
    setIsLiked(false);
    setIsBookmarked(false);
  }, [initialArticle]);

  const handleArticleSwitch = (nextArt: typeof COMPANION_ARTICLES[0]) => {
    setArticle(nextArt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (nextArt.id === 'rbi-policy-2026') setLikes(245);
    else if (nextArt.id === 'overdraft-advisory') setLikes(412);
    else setLikes(189);
    setIsLiked(false);
    setIsBookmarked(false);
  };

  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setIsLiked(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  // Calculations for RBI MCLR vs RLLR Widget
  const mclrRate = 9.40;
  const rllrRate = 8.65;
  const mclrEmi = Math.round((mclrLoanAmount * (mclrRate/12/100) * Math.pow(1 + (mclrRate/12/100), 240)) / (Math.pow(1 + (mclrRate/12/100), 240) - 1));
  const rllrEmi = Math.round((mclrLoanAmount * (rllrRate/12/100) * Math.pow(1 + (rllrRate/12/100), 240)) / (Math.pow(1 + (rllrRate/12/100), 240) - 1));
  const monthlySavings = mclrEmi - rllrEmi;
  const yearlySavings = monthlySavings * 12;
  const totalTenureSavings = yearlySavings * 20;

  // Calculations for Overdraft advisory Widget
  // Simplified mathematical approximation of overdraft interest offset and tenure reduction
  const odInterestSaved = Math.min(odLoanAmount * 0.22, odSurplus * 15);
  const odYearsSaved = Math.min(6.5, Math.round((odSurplus / (odLoanAmount * 0.015)) * 10) / 2);

  // Calculations for Eligibility Booster Widget
  const baseCapacity = 5000000; // Base: 50 Lakhs
  let boostPercentage = 0;
  if (boosterChecklist.coApplicant) boostPercentage += 35;
  if (boosterChecklist.rentalIncome) boostPercentage += 18;
  if (boosterChecklist.consultancy) boostPercentage += 12;
  if (boosterChecklist.annualBonus) boostPercentage += 10;
  if (boosterChecklist.agriIncome) boostPercentage += 10;
  
  const currentCapacity = baseCapacity * (1 + boostPercentage / 100);

  // Splitting paragraphs for Drop-Cap styling
  const paragraphs = article.content.split('\n\n');
  const firstParagraph = paragraphs[0];
  const remainingParagraphs = paragraphs.slice(1);

  // Helper to format currency
  const formatRupee = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(val / 100000).toFixed(1)} Lakh`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] font-sans relative selection:bg-[#10B981]/20 select-text">
      
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-[#10B981] z-[100] transition-all duration-100 ease-out" 
        style={{ width: `${scrollProgress}%` }}
      />

      {/* PREMIUM DEEP NAVY MASTHEAD (Hero Header Block inspired by Forge Global Insights) */}
      <div className="w-full bg-[#0B1426] text-white pt-32 pb-20 relative overflow-hidden border-b border-slate-800">
        {/* Subtle mesh/radial glowing background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,#10B98115,transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,#3b82f610,transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,#0B1426)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl text-left space-y-6">
            
            {/* Navigation & Category Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={onBack}
                className="group flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-[#10B981] transition-colors duration-200 cursor-pointer border-none bg-transparent"
                id="btn-article-back"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Insights Index</span>
              </button>
              <span className="text-slate-600">|</span>
              <span className="inline-block text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
                {article.category}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-slate-400 font-mono">Research Report</span>
            </div>

            {/* Massive Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-white tracking-tight leading-[1.15] font-display">
              {article.title}
            </h1>

            {/* Subtitle/Description */}
            <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed border-l-2 border-[#10B981] pl-4">
              {article.description}
            </p>

            {/* Author details, Date & Reading time */}
            <div className="flex flex-wrap items-center gap-y-4 gap-x-6 pt-6 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1e293b] text-[#10B981] flex items-center justify-center font-black border border-slate-700 uppercase text-sm">
                  {article.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="font-extrabold text-white block text-sm">{article.author}</span>
                  <span className="text-slate-400 font-medium text-xs">{article.role}</span>
                </div>
              </div>
              <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />
              <div className="flex items-center gap-2 font-mono">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4 text-[#10B981]" />
                <span className="text-slate-200 font-bold">{article.readTime}</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />
              <div className="hidden md:flex items-center gap-1.5 bg-[#10B981]/15 text-[#10B981] px-3 py-1 rounded-full border border-[#10B981]/25 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="uppercase tracking-wider text-[9px]">Verified Analysis</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BODY CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* FLOATING SOCIAL SHARING DOCK (Desktop) - Styled like Forge Global's Sticky bar */}
          <div className="hidden lg:flex flex-col items-center gap-4 absolute -left-12 xl:-left-20 top-24 z-40 bg-white border border-slate-200/85 p-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <button 
              onClick={handleLike}
              className={cn(
                "w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer",
                isLiked ? "bg-red-50 text-red-500 border border-red-100" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-transparent"
              )}
              title="Applaud Insight"
            >
              <Heart className={cn("w-4.5 h-4.5", isLiked && "fill-current")} />
              <span className="text-[9px] font-bold mt-0.5">{likes}</span>
            </button>
            
            <div className="w-6 h-[1px] bg-slate-100" />

            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                isBookmarked ? "bg-blue-50 text-blue-600 border border-blue-100" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
              title="Bookmark Bulletin"
            >
              <Bookmark className={cn("w-4.5 h-4.5", isBookmarked && "fill-current")} />
            </button>

            <button 
              onClick={handleShare}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer"
              title="Copy Article Link"
            >
              <Link className="w-4.5 h-4.5" />
            </button>

            <div className="w-6 h-[1px] bg-slate-100" />

            <a
              href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4.5 h-4.5" />
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
              title="Share on Twitter"
            >
              <Twitter className="w-4.5 h-4.5" />
            </a>
          </div>

          {/* MAIN ARTICLE WORKSPACE */}
          <article className="lg:col-span-8 bg-white border border-slate-200/50 rounded-3xl p-6 md:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.015)] relative overflow-hidden">
            
            {/* Cover Image Banner */}
            {article.imageUrl && (
              <div className="w-full aspect-[21/10] rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200/60 mb-10 relative group">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.01]"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Executive Summary Card (TL;DR) */}
            <div className="bg-[#EFF6FF]/40 border border-blue-100/60 p-6 md:p-8 rounded-2xl mb-10 text-left space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-widest font-display">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <span>Executive Summary</span>
              </div>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold">
                Home loan rates in India are highly sensitive to both central banking benchmark actions and structural presenting parameters. For borrowers seeking absolute minimized lifetime outlays, migrating out of outdated MCLR schedules to current EBLR targets and utilizing smart overdraft offsets generates massive upfront interest savings.
              </p>
            </div>

            {/* Prose Content Section */}
            <div className="text-slate-700 text-base md:text-[17px] leading-[1.8] space-y-8 text-left font-normal font-sans">
              
              {/* Drop-Cap Styled Initial Paragraph */}
              {firstParagraph && (
                <p className="first-letter:text-5xl md:first-letter:text-6xl first-letter:font-black first-letter:font-display first-letter:text-[#10B981] first-letter:mr-3 first-letter:float-left first-letter:leading-none text-slate-600 leading-relaxed text-justify">
                  {firstParagraph}
                </p>
              )}

              {/* Rendering Remaining Prose with specific interactive blocks inside */}
              {remainingParagraphs.map((para, i) => {
                if (para.startsWith('### ')) {
                  return (
                    <h3 key={i} className="text-xl md:text-[22px] font-extrabold text-[#0B1426] font-display pt-8 pb-3 border-b border-slate-100 flex items-center gap-2.5">
                      <span className="w-1 h-5 bg-[#10B981] rounded-full inline-block" />
                      {para.replace('### ', '')}
                    </h3>
                  );
                }
                if (para.startsWith('1. ') || para.startsWith('* ')) {
                  const items = para.split('\n');
                  return (
                    <div key={i} className="bg-[#FAFBFC] rounded-2xl p-6 border border-slate-200/50 my-6">
                      <ul className="space-y-4">
                        {items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-extrabold text-[11px] mt-0.5 shrink-0 font-mono">
                              {idx + 1}
                            </span>
                            <div className="text-xs md:text-[14px] text-slate-600 leading-relaxed font-medium pl-1">
                              {item.replace(/^(\*\s|1\.\s|\d\.\s)/, '')}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return (
                  <p key={i} className="font-normal text-slate-600 text-justify text-sm md:text-[15px] leading-[1.75]">
                    {para}
                  </p>
                );
              })}

              {/* DYNAMIC INTERACTIVE TOOLBOXES */}
              
              {/* Tool 1: RBI Monetary Policy: MCLR vs RLLR Migrator */}
              {article.id === 'rbi-policy-2026' && (
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 md:p-8 my-10 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-[#10B981] pointer-events-none">
                    <Calculator className="w-24 h-24" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Interactive Financial Tool</span>
                        <h4 className="text-base md:text-lg font-extrabold text-[#0B1426] font-display">
                          MCLR vs RLLR Savings Sandbox
                        </h4>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-3 py-1 rounded-full font-mono self-start sm:self-auto">Live Policy Rates</span>
                  </div>

                  {/* Slider Control */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Drag to Estimate Your Loan Amount</span>
                      <span className="text-[#10B981] font-mono text-sm">{formatRupee(mclrLoanAmount)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="2000000" 
                      max="30000000" 
                      step="500000"
                      value={mclrLoanAmount} 
                      onChange={(e) => setMclrLoanAmount(Number(e.target.value))}
                      className="w-full accent-[#10B981] h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                      <span>₹20 Lakhs</span>
                      <span>₹1.5 Crores</span>
                      <span>₹3.0 Crores</span>
                    </div>
                  </div>

                  {/* Comparisons metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1 text-center shadow-sm">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Outdated MCLR Track (9.40%)</span>
                      <div className="text-lg font-black text-slate-700 font-mono">₹{mclrEmi.toLocaleString('en-IN')}/mo</div>
                      <p className="text-[10px] text-slate-400">Indicative Monthly Payment</p>
                    </div>

                    <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 space-y-1 text-center relative overflow-hidden shadow-sm">
                      <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">Modern RLLR Track (8.65%)</span>
                      <div className="text-lg font-black text-[#10B981] font-mono">₹{rllrEmi.toLocaleString('en-IN')}/mo</div>
                      <p className="text-[10px] text-emerald-500 font-semibold">Matched Parrot Partner Rate</p>
                    </div>
                  </div>

                  {/* Dynamically calculated benefit details */}
                  <div className="bg-[#0B1426] text-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-slate-800">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[9px] uppercase font-black tracking-widest text-[#10B981]">Guaranteed Migration Advantage</span>
                      <h5 className="text-sm font-bold text-white">Secure ₹{monthlySavings.toLocaleString('en-IN')} Saved Monthly</h5>
                    </div>
                    <div className="bg-[#10B981]/10 border border-[#10B981]/25 px-4 py-2 rounded-lg text-center shrink-0">
                      <span className="text-[9px] block text-slate-400 uppercase font-black">Total Interest Reduced</span>
                      <span className="text-base font-extrabold font-mono text-[#10B981]">₹{totalTenureSavings.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal text-center italic font-medium">
                    *Calculations are based on standard monthly reducing interest equations over a 20-year schedule. Individual rates depend on active underwriter credit checks.
                  </p>
                </div>
              )}

              {/* Tool 2: Overdraft Interest Savings Simulator */}
              {article.id === 'overdraft-advisory' && (
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 md:p-8 my-10 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-blue-600 pointer-events-none">
                    <RefreshCw className="w-24 h-24" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Interactive Simulator</span>
                        <h4 className="text-base md:text-lg font-extrabold text-[#0B1426] font-display">
                          Overdraft Liquidity Optimizer
                        </h4>
                      </div>
                    </div>
                    <span className="text-[9px] bg-blue-600 text-white font-bold px-3 py-1 rounded-full font-mono self-start sm:self-auto">Sandbox Environment</span>
                  </div>

                  {/* Slide 1: Loan Amount */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Total Loan Principal</span>
                      <span className="text-slate-800 font-mono text-sm">{formatRupee(odLoanAmount)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="2000000" 
                      max="20000000" 
                      step="500000"
                      value={odLoanAmount} 
                      onChange={(e) => setOdLoanAmount(Number(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slide 2: Monthly surplus */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Surplus Emergency Funds Parked (Average Balance)</span>
                      <span className="text-blue-600 font-mono text-sm">₹{(odSurplus / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <input 
                      type="range" 
                      min="10000" 
                      max="1000000" 
                      step="10000"
                      value={odSurplus} 
                      onChange={(e) => setOdSurplus(Number(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                      <span>₹10,000</span>
                      <span>₹5.0 Lakhs</span>
                      <span>₹10.0 Lakhs</span>
                    </div>
                  </div>

                  {/* Output Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-blue-50/30 p-5 rounded-xl border border-blue-100 text-center shadow-sm">
                      <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider">Interest Savings Slashed</span>
                      <div className="text-2xl font-black text-blue-700 font-mono">₹{Math.round(odInterestSaved).toLocaleString('en-IN')}+</div>
                      <p className="text-[10px] text-slate-400">Projected Lifetime Outflow Savings</p>
                    </div>

                    <div className="bg-emerald-50/30 p-5 rounded-xl border border-emerald-100 text-center shadow-sm">
                      <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">Loan Repayment Accelerated</span>
                      <div className="text-2xl font-black text-emerald-700 font-mono">{odYearsSaved} Years</div>
                      <p className="text-[10px] text-slate-400">Tenure Reduction Approximation</p>
                    </div>
                  </div>

                  <div className="bg-[#0B1426] text-white p-5 rounded-xl space-y-2 border border-slate-800 shadow-md">
                    <h5 className="text-xs font-black uppercase tracking-widest text-[#10B981]">The Power of Overdraft Linkage</h5>
                    <p className="text-xs leading-normal font-medium text-slate-300">
                      Every single rupee placed inside your linked MaxGain or MaxSaver overdraft balance offsets the daily interest calculation base immediately. Your interest drops while retaining absolute, instant ATM withdrawal access to 100% of your money.
                    </p>
                  </div>
                </div>
              )}

              {/* Tool 3: Income Booster Multiplier Checkbox */}
              {article.id === 'eligibility-booster' && (
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 md:p-8 my-10 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-purple-600 pointer-events-none">
                    <Zap className="w-24 h-24" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Dynamic Checklist</span>
                        <h4 className="text-base md:text-lg font-extrabold text-[#0B1426] font-display">
                          Eligibility Multiplier Sandbox
                        </h4>
                      </div>
                    </div>
                    <span className="text-[9px] bg-purple-600 text-white font-bold px-3 py-1 rounded-full font-mono self-start sm:self-auto">Interactive Optimizer</span>
                  </div>

                  <p className="text-xs text-slate-500 font-semibold leading-relaxed text-center sm:text-left">
                    Select additional income factors you can present to bank underwriters to view your cumulative eligibility limit raise.
                  </p>

                  {/* Checklist Options */}
                  <div className="space-y-2.5">
                    {[
                      { key: 'coApplicant', label: 'Add working co-applicant (Spouse, Parent, or Brother)', boost: '+35% Lift' },
                      { key: 'rentalIncome', label: 'Submit verified rental receipts & registered lease deeds', boost: '+18% Lift' },
                      { key: 'consultancy', label: 'Present contracts for secondary consultancy/freelance channels', boost: '+12% Lift' },
                      { key: 'annualBonus', label: 'Incorporate 2 years Form 16 annual performance bonuses', boost: '+10% Lift' },
                      { key: 'agriIncome', label: 'Furnish official agricultural land returns certificates', boost: '+10% Lift' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setBoosterChecklist(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof boosterChecklist] }))}
                        className={cn(
                          "w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer",
                          boosterChecklist[item.key as keyof typeof boosterChecklist]
                            ? "bg-purple-50/60 border-purple-200 text-slate-800 font-semibold shadow-sm"
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                             "w-5 h-5 rounded flex items-center justify-center border transition-all",
                             boosterChecklist[item.key as keyof typeof boosterChecklist]
                               ? "bg-purple-600 border-purple-600 text-white"
                               : "border-slate-300 bg-white"
                          )}>
                            {boosterChecklist[item.key as keyof typeof boosterChecklist] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-semibold">{item.label}</span>
                        </div>
                        <span className="text-[9px] font-black uppercase text-purple-600 shrink-0 ml-2">
                          {item.boost}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Visual Progress Bar & Result */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-2">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Combined Purchasing Limit</span>
                        <div className="text-xl font-black text-slate-800 font-mono">
                          {formatRupee(currentCapacity)} <span className="text-xs text-purple-600 font-bold">({100 + boostPercentage}% Power)</span>
                        </div>
                      </div>
                      <div className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-purple-200">
                        Total Boost: +{boostPercentage}%
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-[2px]">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-purple-500 to-[#0B1426] rounded-full"
                        animate={{ width: `${Math.min(100, (boostPercentage / 85) * 100)}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* End advice block */}
              <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl space-y-3 mt-10">
                <div className="flex items-center gap-2 text-[#0B1426] font-extrabold text-xs uppercase tracking-widest font-display">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" /> 
                  <span>Underwriting Advisory Safeguards</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  These regulatory indicators and optimization guidelines are validated by active mortgage underwriter frameworks. To map your exact credentials to these optimized bank margins with zero friction, complete our responsive digital application.
                </p>
              </div>
            </div>

            {/* Engagement Controls for mobile */}
            <div className="flex lg:hidden items-center justify-between border-t border-b border-slate-100 py-4 my-8">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleLike}
                  className={cn(
                    "p-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer border-none",
                    isLiked ? "bg-red-50 text-red-500" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  )}
                >
                  <Heart className={cn("w-4.5 h-4.5", isLiked && "fill-current")} />
                  <span className="text-xs font-bold font-mono">{likes} Applauds</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={cn(
                    "p-2.5 rounded-xl transition-all cursor-pointer border-none",
                    isBookmarked ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50"
                  )}
                >
                  <Bookmark className={cn("w-4.5 h-4.5", isBookmarked && "fill-current")} />
                </button>

                <button 
                  onClick={handleShare}
                  className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 transition-all cursor-pointer border-none"
                >
                  <Share2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Author Newsletter Signature Profile Card */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 md:p-8 mt-12 text-left grid md:grid-cols-12 gap-6 items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/[0.02] rounded-full blur-2xl" />
              
              <div className="md:col-span-4 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6 gap-3">
                <div className="w-14 h-14 rounded-full bg-[#0B1426] text-[#10B981] flex items-center justify-center font-black uppercase text-lg font-display shadow border-2 border-white">
                  {article.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0B1426] text-sm">{article.author}</h4>
                  <p className="text-slate-400 text-[11px] font-semibold">{article.role}</p>
                </div>
                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-100 text-[8px] text-[#10B981] font-bold uppercase tracking-wider font-mono">
                  <Award className="w-2.5 h-2.5" /> Underwriter
                </div>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">Insights Feed</span>
                  <h5 className="text-sm font-extrabold text-[#0B1426]">Subscribe to team's Underwriting Weekly</h5>
                  <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                    Get premium insights, rate policy updates, and direct-bank loop alerts delivered once a week. Absolutely zero commercial spam.
                  </p>
                </div>

                {newsletterSubscribed ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 flex items-center gap-2.5 text-xs font-semibold shadow-sm"
                  >
                    <Check className="w-4 h-4 text-[#10B981] stroke-[3]" />
                    <span>Fantastic! You're successfully subscribed to Vikram's weekly bulletin.</span>
                  </motion.div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full max-w-md font-sans">
                    <input 
                      type="email" 
                      placeholder="Enter professional email" 
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#10B981] transition-all font-medium text-slate-700 shadow-inner"
                    />
                    <button 
                      type="submit"
                      className="bg-[#0B1426] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left space-y-1">
                <h4 className="font-extrabold text-[#0B1426] text-sm">Ready to check your optimized home loan eligibility?</h4>
                <p className="text-xs text-slate-400 font-medium">Instantly pre-underwrite and unlock exclusive, bottom-tier rates.</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto shrink-0">
                <button 
                  onClick={onBack}
                  className="w-1/2 sm:w-auto px-5 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Back to Index
                </button>
                <button 
                  onClick={onApply}
                  className="w-1/2 sm:w-auto px-6 py-3 bg-[#10B981] text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-[#0e9f6e] shadow-md transition-all cursor-pointer"
                >
                  Optimize My Profile
                </button>
              </div>
            </div>

          </article>

          {/* RIGHT SIDEBAR - High-Quality Side Panel (Matches Forge Global's Related Content Sidebar) */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Download/Action Card */}
            <div className="bg-gradient-to-br from-[#0B1426] to-[#1C2541] text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden group text-left">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10B98115,transparent_55%)] opacity-40 pointer-events-none" />
              
              <div className="relative z-10 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <Zap className="w-3 h-3 text-[#10B981] fill-current" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#10B981]">Platform Premium</span>
                </div>
                
                <h3 className="text-lg font-bold font-display leading-snug">
                  Secure Direct Corporate Underwriter Rates
                </h3>
                
                <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                  Our direct institutional relationships bypass intermediary markup, saving up to <span className="text-[#10B981] font-bold">0.25%</span> on mortgage rates.
                </p>

                <button 
                  onClick={onApply}
                  className="w-full bg-[#10B981] text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-[#0e9f6e] transition-all cursor-pointer shadow-lg shadow-[#10B981]/10"
                >
                  Get Started Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Newsletter Subscription Sidebar Widget */}
            <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-3xl shadow-sm text-left space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono">RESEARCH ALERTS</h4>
                <h3 className="text-sm font-bold text-[#0B1426] font-display">Sign Up for Private Updates</h3>
                <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                  Get proprietary analysis, underwriter indices, and interest rate forecast insights sent to your inbox.
                </p>
              </div>

              {newsletterSubscribed ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-semibold border border-emerald-100">
                  ✓ Successfully Subscribed!
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <input 
                    type="email" 
                    placeholder="name@company.com" 
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#10B981] transition-all font-medium text-slate-700"
                  />
                  <button 
                    type="submit"
                    className="w-full bg-[#0B1426] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {/* Other Bulletins Sidebar Reel */}
            <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-3xl shadow-sm text-left space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0B1426] font-display">Related Research</h3>
                <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">2 Remaining</span>
              </div>

              <div className="space-y-4">
                {COMPANION_ARTICLES.filter(art => art.id !== article.id).map((art) => (
                  <button
                    key={art.id}
                    onClick={() => handleArticleSwitch(art)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:border-[#10B981]/25 hover:shadow-lg hover:shadow-slate-100/20 transition-all duration-300 flex flex-col gap-3 group cursor-pointer"
                  >
                    <div className="w-full aspect-[21/10] rounded-lg overflow-hidden bg-slate-100 relative shrink-0">
                      <img 
                        src={art.imageUrl} 
                        alt={art.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <span className={cn(
                        "absolute top-2 left-2 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-white/90 shadow-sm",
                        art.accentColor
                      )}>
                        {art.category}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-800 leading-snug group-hover:text-[#10B981] transition-colors line-clamp-2 font-sans">
                        {art.title}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold font-mono">
                        By {art.author} · {art.readTime}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Micro FAQ Sidebar Box */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-3xl text-left space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest font-mono">
                <HelpCircle className="w-4 h-4 text-[#10B981]" />
                <span>Underwriting FAQ</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 font-sans">Q: Can I refinance an MCLR loan online?</p>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                  Yes, migrating out of MCLR represents a standard Balance Transfer request. Major banks authorize this digitally, which skips redundant legal title search checks.
                </p>
              </div>
            </div>

          </aside>

        </div>
      </div>

      {/* Share Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 right-6 bg-[#0B1426] text-white text-xs px-5 py-3 rounded-xl flex items-center gap-2.5 z-50 shadow-xl border border-white/10"
          >
            <Check className="w-4 h-4 text-[#10B981] stroke-[3]" />
            <span className="font-bold font-sans">Article URL copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
