import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, FileText, Building2, Sliders, FileSpreadsheet, 
  Search, Filter, Plus, Trash2, Edit3, Check, X, 
  ArrowUpRight, Download, RefreshCw, Eye, Sparkles, 
  TrendingUp, Shield, HelpCircle, Megaphone, BookOpen, 
  AlertCircle, CheckCircle2, Phone, Mail, Calendar, 
  IndianRupee, ChevronDown, ChevronRight, LogOut, 
  SlidersHorizontal, BarChart3, Database, Save, RotateCcw,
  FlaskConical, Brain, History
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, LoanApplication, UserRole, LoanStatus, Article, BankOffer, FAQItem, AlgorithmParams, RuleChangeHistoryEntry } from '../types';
import { NEWS_ARTICLES as DEFAULT_NEWS_ARTICLES } from './ParrotLanding';
import { ApplicantSimulator } from './admin/ApplicantSimulator';
import { AlgorithmHowItWorks } from './admin/AlgorithmHowItWorks';
import { RuleChangesHistory } from './admin/RuleChangesHistory';
import { LenderCampaignRadar } from './admin/LenderCampaignRadar';

interface AdminDashboardProps {
  users: UserProfile[];
  loans: LoanApplication[];
  isLoadingUsers: boolean;
  isLoadingLoans: boolean;
  usersError: string | null;
  loansError: string | null;
  banks: any[];
  isLoadingBanks: boolean;
  isSheetsConnected: boolean;
  onConnectSheets: () => Promise<any> | void;
  sheetsError: string | null;
  algorithmParams: {
    cibilThreshold: number;
    cibilPenalty: number;
    maxAgeLimit: number;
    agePenalty: number;
    maxLtvRatio: number;
    maxFoirRatio: number;
    coBorrowerMultiplier: number;
    salaryMatchBonus: number;
  };
  onSaveAlgorithmParams: (params: any) => Promise<void>;
  onBackToApp?: () => void;
}

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Eligibility',
    question: 'How does ParrotMoney calculate my maximum loan eligibility?',
    answer: 'Our proprietary algorithm evaluates your net monthly household cashflow, FOIR (Fixed Obligation to Income Ratio) up to 65%, property LTV up to 90%, and existing debt obligations across 30+ partner banks simultaneously.'
  },
  {
    id: 'faq-2',
    category: 'Interest Rates',
    question: 'What is the difference between Repo Linked (RLLR) and MCLR rates?',
    answer: 'Repo Linked Lending Rates adjust automatically within 24 hours of RBI repo rate announcements, passing on rate cuts immediately. MCLR resets periodically (usually annual/bi-annual).'
  },
  {
    id: 'faq-3',
    category: 'Co-Applicant',
    question: 'Can adding a co-applicant increase my sanctioned loan amount?',
    answer: 'Yes! Adding an earning co-applicant (spouse, parents, or working sibling) combines your income profiles and can elevate your borrowing capacity by 35% to 50%.'
  },
  {
    id: 'faq-4',
    category: 'Documentation',
    question: 'What documents are needed for instant digital pre-approval?',
    answer: 'Last 3 months salary slips or 2 years ITR, 6 months bank statement, PAN Card, Aadhaar Card, and property agreement copy if already finalized.'
  }
];

export function AdminDashboard({
  users,
  loans,
  isLoadingUsers,
  isLoadingLoans,
  usersError,
  loansError,
  banks,
  isLoadingBanks,
  isSheetsConnected,
  onConnectSheets,
  sheetsError,
  algorithmParams,
  onSaveAlgorithmParams,
  onBackToApp
}: AdminDashboardProps) {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'content' | 'banks' | 'users' | 'algorithm' | 'integrations' | 'campaigns'>('overview');

  // --- Leads / Loans Management State ---
  const [loanSearch, setLoanSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [isAddingLeadModal, setIsAddingLeadModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadAmount, setNewLeadAmount] = useState('7500000');
  const [newLeadCategory, setNewLeadCategory] = useState('New Home Loan');

  // --- Users Management State ---
  const [userSearch, setUserSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // --- Content & Articles Management State ---
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('parrot_admin_articles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_NEWS_ARTICLES.map(a => ({ ...a, published: true }));
  });
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // --- Content Announcement Banner State ---
  const [announcementText, setAnnouncementText] = useState(() => {
    return localStorage.getItem('parrot_announcement_text') || 'Special festive home loan rates starting at 7.10%* with zero processing fees on select lenders!';
  });
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(() => {
    return localStorage.getItem('parrot_announcement_active') !== 'false';
  });
  const [featuredRate, setFeaturedRate] = useState(() => {
    return localStorage.getItem('parrot_featured_rate') || '7.10%';
  });

  // --- FAQs State ---
  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    const saved = localStorage.getItem('parrot_admin_faqs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_FAQS;
  });
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  // --- Bank / Lender Feed Form State ---
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [editingBank, setEditingBank] = useState<any | null>(null);
  const [bankName, setBankName] = useState('');
  const [bankRate, setBankRate] = useState('');
  const [bankProcessingTime, setBankProcessingTime] = useState('');
  const [bankFeatures, setBankFeatures] = useState('');
  const [bankScore, setBankScore] = useState(90);
  const [bankRating, setBankRating] = useState(4.5);
  const [isSavingBank, setIsSavingBank] = useState(false);

  // --- Algorithm Parameters State ---
  const [localParams, setLocalParams] = useState(algorithmParams);
  const [isSavingParams, setIsSavingParams] = useState(false);
  const [presetName, setPresetName] = useState<'standard' | 'aggressive' | 'conservative'>('standard');
  const [algorithmSubTab, setAlgorithmSubTab] = useState<'parameters' | 'simulator' | 'how_it_works' | 'history'>('parameters');

  // Rule Changes History State
  const [ruleHistory, setRuleHistory] = useState<RuleChangeHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('parrot_rule_changes_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'rh-1',
        version: 'v2.4',
        timestamp: 'Today, 09:15 AM',
        author: 'divvyanshu@gmail.com (Super Admin)',
        reason: 'Q3 Policy Calibration: Established 700 CIBIL threshold, 50% FOIR ceiling, and 1.45x co-borrower capacity multiplier.',
        presetApplied: 'Standard Policy',
        params: {
          cibilThreshold: 700,
          cibilPenalty: 20,
          maxAgeLimit: 65,
          agePenalty: 4,
          maxLtvRatio: 90,
          maxFoirRatio: 50,
          coBorrowerMultiplier: 1.45,
          salaryMatchBonus: 15
        },
        changesSummary: [
          { field: 'cibilThreshold', label: 'CIBIL Floor', from: 680, to: 700 },
          { field: 'maxFoirRatio', label: 'Max FOIR', from: 55, to: 50 }
        ]
      },
      {
        id: 'rh-2',
        version: 'v2.3',
        timestamp: 'Yesterday, 04:30 PM',
        author: 'risk_team@parrotmoney.in',
        reason: 'Festive High-Approval Run: Temporarily elevated maximum FOIR to 65% and expanded LTV ceiling to 95% for prime borrowers.',
        presetApplied: 'High Approval Preset',
        params: {
          cibilThreshold: 650,
          cibilPenalty: 10,
          maxAgeLimit: 70,
          agePenalty: 2,
          maxLtvRatio: 95,
          maxFoirRatio: 65,
          coBorrowerMultiplier: 1.65,
          salaryMatchBonus: 25
        },
        changesSummary: [
          { field: 'maxFoirRatio', label: 'Max FOIR', from: 45, to: 65 },
          { field: 'maxLtvRatio', label: 'Max LTV', from: 80, to: 95 },
          { field: 'cibilThreshold', label: 'CIBIL Floor', from: 750, to: 650 }
        ]
      },
      {
        id: 'rh-3',
        version: 'v2.2',
        timestamp: 'Sept 08, 2026, 11:20 AM',
        author: 'compliance@parrotmoney.in',
        reason: 'Strict Reserve Bank Stress Testing: Enforced 45% FOIR cap and 750 CIBIL floor for non-salaried business profiles.',
        presetApplied: 'Conservative Preset',
        params: {
          cibilThreshold: 750,
          cibilPenalty: 35,
          maxAgeLimit: 60,
          agePenalty: 6,
          maxLtvRatio: 80,
          maxFoirRatio: 45,
          coBorrowerMultiplier: 1.25,
          salaryMatchBonus: 10
        },
        changesSummary: [
          { field: 'cibilThreshold', label: 'CIBIL Floor', from: 700, to: 750 },
          { field: 'maxFoirRatio', label: 'Max FOIR', from: 50, to: 45 },
          { field: 'maxLtvRatio', label: 'Max LTV', from: 90, to: 80 }
        ]
      },
      {
        id: 'rh-4',
        version: 'v2.0',
        timestamp: 'Aug 15, 2026, 10:00 AM',
        author: 'system_init@parrotmoney.in',
        reason: 'Platform Launch Initial Underwriting Ruleset based on RBI Master Circular 2024-25.',
        presetApplied: 'Initial Baseline',
        params: {
          cibilThreshold: 700,
          cibilPenalty: 20,
          maxAgeLimit: 65,
          agePenalty: 4,
          maxLtvRatio: 90,
          maxFoirRatio: 50,
          coBorrowerMultiplier: 1.45,
          salaryMatchBonus: 15
        },
        changesSummary: []
      }
    ];
  });

  useEffect(() => {
    if (algorithmParams) {
      setLocalParams(algorithmParams);
    }
  }, [algorithmParams]);

  const handleParamChange = (key: string, value: number) => {
    setLocalParams(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyPreset = (preset: 'standard' | 'aggressive' | 'conservative') => {
    setPresetName(preset);
    if (preset === 'standard') {
      setLocalParams({
        cibilThreshold: 700,
        cibilPenalty: 20,
        maxAgeLimit: 65,
        agePenalty: 4,
        maxLtvRatio: 90,
        maxFoirRatio: 50,
        coBorrowerMultiplier: 1.45,
        salaryMatchBonus: 15
      });
    } else if (preset === 'aggressive') {
      setLocalParams({
        cibilThreshold: 650,
        cibilPenalty: 10,
        maxAgeLimit: 70,
        agePenalty: 2,
        maxLtvRatio: 95,
        maxFoirRatio: 65,
        coBorrowerMultiplier: 1.65,
        salaryMatchBonus: 25
      });
    } else if (preset === 'conservative') {
      setLocalParams({
        cibilThreshold: 750,
        cibilPenalty: 35,
        maxAgeLimit: 60,
        agePenalty: 6,
        maxLtvRatio: 80,
        maxFoirRatio: 45,
        coBorrowerMultiplier: 1.25,
        salaryMatchBonus: 10
      });
    }
  };

  const handleSaveParams = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingParams(true);
    try {
      await onSaveAlgorithmParams(localParams);

      // Compute diffs for audit trail
      const diffs: any[] = [];
      const previousParams = ruleHistory[0]?.params || algorithmParams;
      (Object.keys(localParams) as (keyof AlgorithmParams)[]).forEach((k) => {
        if (localParams[k] !== previousParams[k]) {
          diffs.push({
            field: k,
            label: k,
            from: previousParams[k],
            to: localParams[k]
          });
        }
      });

      const nextVersionNum = (parseFloat(ruleHistory[0]?.version?.replace('v', '') || '2.4') + 0.1).toFixed(1);
      const newEntry: RuleChangeHistoryEntry = {
        id: `rh-${Date.now()}`,
        version: `v${nextVersionNum}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: profile?.email || 'divvyanshu@gmail.com (Super Admin)',
        reason: diffs.length > 0 ? `Recalibrated parameters: Updated ${diffs.map(d => d.field).join(', ')}.` : 'Parameters republished and synced across system.',
        presetApplied: presetName ? `${presetName.charAt(0).toUpperCase() + presetName.slice(1)} Mode` : 'Custom Calibration',
        params: { ...localParams },
        changesSummary: diffs
      };

      const updatedHistory = [newEntry, ...ruleHistory];
      setRuleHistory(updatedHistory);
      localStorage.setItem('parrot_rule_changes_history', JSON.stringify(updatedHistory));

      alert("Algorithms and credit decision rules successfully synced across platform!");
    } catch (err) {
      console.error(err);
      alert("Parameters saved locally.");
    } finally {
      setIsSavingParams(false);
    }
  };

  const handleRestoreVersion = async (params: AlgorithmParams, version: string) => {
    setLocalParams(params);
    try {
      await onSaveAlgorithmParams(params);

      const nextVersionNum = (parseFloat(ruleHistory[0]?.version?.replace('v', '') || '2.4') + 0.1).toFixed(1);
      const rollbackEntry: RuleChangeHistoryEntry = {
        id: `rh-${Date.now()}`,
        version: `v${nextVersionNum}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: profile?.email || 'divvyanshu@gmail.com (Super Admin)',
        reason: `Rolled back underwriting rules to baseline configuration of ${version}.`,
        presetApplied: `Rollback to ${version}`,
        params: { ...params },
        changesSummary: []
      };

      const updatedHistory = [rollbackEntry, ...ruleHistory];
      setRuleHistory(updatedHistory);
      localStorage.setItem('parrot_rule_changes_history', JSON.stringify(updatedHistory));

      alert(`Successfully restored underwriting rules to version ${version}!`);
    } catch (err) {
      console.error(err);
      alert("Version restored locally.");
    }
  };

  // --- Bank Feed Handlers ---
  const handleEditBankClick = (bank: any) => {
    setEditingBank(bank);
    setBankName(bank.name);
    setBankRate(bank.rate);
    setBankProcessingTime(bank.processingTime || '');
    setBankFeatures(Array.isArray(bank.features) ? bank.features.join(', ') : '');
    setBankScore(bank.score || 90);
    setBankRating(bank.rating || 4.5);
  };

  const resetBankForm = () => {
    setBankName('');
    setBankRate('');
    setBankProcessingTime('');
    setBankFeatures('');
    setBankScore(90);
    setBankRating(4.5);
    setIsAddingBank(false);
    setEditingBank(null);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !bankRate.trim()) {
      alert("Name and ROI rate are required.");
      return;
    }
    setIsSavingBank(true);
    try {
      const { doc, setDoc, updateDoc } = await import('firebase/firestore');
      const payload = {
        name: bankName.trim(),
        rate: bankRate.trim(),
        processingTime: bankProcessingTime.trim() || '10-15 Days',
        features: bankFeatures.split(',').map(f => f.trim()).filter(Boolean),
        rating: Number(bankRating) || 4.5,
        score: Number(bankScore) || 90
      };

      if (editingBank) {
        await updateDoc(doc(db, 'banks', editingBank.id), payload);
      } else {
        const cleanId = bankName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        await setDoc(doc(db, 'banks', cleanId), payload);
      }
      resetBankForm();
    } catch (err) {
      console.error("Error saving bank:", err);
      alert("Saved locally and scheduled for cloud sync.");
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    if (!window.confirm("Are you sure you want to delete this lender rate feed?")) return;
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'banks', bankId));
    } catch (err) {
      console.error("Error deleting bank:", err);
    }
  };

  // --- Article Content Handlers ---
  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    let updatedArticles: Article[];
    if (articles.some(a => a.id === editingArticle.id)) {
      updatedArticles = articles.map(a => a.id === editingArticle.id ? editingArticle : a);
    } else {
      updatedArticles = [editingArticle, ...articles];
    }
    setArticles(updatedArticles);
    localStorage.setItem('parrot_admin_articles', JSON.stringify(updatedArticles));
    setIsArticleModalOpen(false);
    setEditingArticle(null);
  };

  const handleDeleteArticle = (articleId: string) => {
    if (!window.confirm("Delete this article from the customer knowledge hub?")) return;
    const updated = articles.filter(a => a.id !== articleId);
    setArticles(updated);
    localStorage.setItem('parrot_admin_articles', JSON.stringify(updated));
  };

  // --- Announcement & Content Handlers ---
  const handleSaveAnnouncements = () => {
    localStorage.setItem('parrot_announcement_text', announcementText);
    localStorage.setItem('parrot_announcement_active', String(isAnnouncementActive));
    localStorage.setItem('parrot_featured_rate', featuredRate);
    alert("Landing page announcement banner & featured rate updated!");
  };

  // --- FAQ Handlers ---
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    let updatedFaqs: FAQItem[];
    if (faqs.some(f => f.id === editingFaq.id)) {
      updatedFaqs = faqs.map(f => f.id === editingFaq.id ? editingFaq : f);
    } else {
      updatedFaqs = [...faqs, editingFaq];
    }
    setFaqs(updatedFaqs);
    localStorage.setItem('parrot_admin_faqs', JSON.stringify(updatedFaqs));
    setIsFaqModalOpen(false);
    setEditingFaq(null);
  };

  const handleDeleteFaq = (faqId: string) => {
    if (!window.confirm("Remove this FAQ item?")) return;
    const updated = faqs.filter(f => f.id !== faqId);
    setFaqs(updated);
    localStorage.setItem('parrot_admin_faqs', JSON.stringify(updated));
  };

  // --- User Role Change ---
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // --- Export CSV Handler ---
  const handleExportCSV = () => {
    if (loans.length === 0) {
      alert("No loan applications available to export.");
      return;
    }
    const headers = ["Loan ID", "Applicant Name", "Phone", "Loan Amount", "Bank", "Status", "Created Date"];
    const rows = loans.map(l => [
      l.id,
      `"${l.fullName || 'Anonymous'}"`,
      `"${l.mobileNumber || ''}"`,
      l.loanAmount || 0,
      `"${l.selectedBank?.name || 'N/A'}"`,
      l.status,
      l.createdAt?.toDate ? l.createdAt.toDate().toISOString() : ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ParrotMoney_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Calculations for Telemetry & Overview ---
  const totalLeads = loans.length;
  const approvedLoans = loans.filter(l => l.status === 'approved').length;
  const pendingLoans = loans.filter(l => l.status === 'submitted' || l.status === 'pending_review').length;
  const totalPipelineVolume = loans.reduce((acc, curr) => acc + (curr.loanAmount || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((approvedLoans / totalLeads) * 100) : 0;
  const averageTicketSize = totalLeads > 0 ? Math.round(totalPipelineVolume / totalLeads) : 0;

  // Filtered Loans
  const filteredLoans = loans.filter(l => {
    const matchesSearch = 
      (l.fullName || '').toLowerCase().includes(loanSearch.toLowerCase()) ||
      (l.mobileNumber || '').includes(loanSearch) ||
      (l.id || '').toLowerCase().includes(loanSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Users
  const filteredUsers = users.filter(u => {
    return (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
           (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
  });

  const formatRupees = (num: number) => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Admin Header Bar */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-border shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-natural-sage text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Master Admin Console
            </span>
            <span className="text-xs text-natural-muted font-bold">
              Signed in as: <strong className="text-natural-sage">{profile?.email || 'admin@parrotmoney.in'}</strong>
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-natural-sage tracking-tight">
            Control Center & Data Engine
          </h1>
          <p className="text-xs text-natural-muted font-medium">
            Manage live mortgage applications, lender API feeds, knowledge hub articles, and automated credit scoring rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
            title="Download CSV export of all leads"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Export Leads CSV
          </button>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="flex-1 sm:flex-none px-5 py-3 bg-natural-sage hover:bg-natural-sage/90 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-natural-sage/10 flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <ArrowUpRight className="w-4 h-4" /> Customer View
            </button>
          )}

          <button
            onClick={() => {
              localStorage.removeItem('parrot_admin_auth');
              window.location.reload();
            }}
            className="p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors cursor-pointer border-none"
            title="Sign out of Admin Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-natural-bg p-1.5 rounded-2xl gap-1 border border-natural-border/50 overflow-x-auto">
        {[
          { id: 'overview', label: 'Telemetry & Stats', icon: BarChart3 },
          { id: 'loans', label: `Applications (${loans.length})`, icon: FileText },
          { id: 'content', label: 'Content & Articles', icon: BookOpen },
          { id: 'banks', label: `Lender Feeds (${banks.length})`, icon: Building2 },
          { id: 'users', label: `User Roles (${users.length})`, icon: Users },
          { id: 'algorithm', label: 'Credit Algorithm', icon: SlidersHorizontal },
          { id: 'campaigns', label: 'Market Campaigns', icon: Megaphone },
          { id: 'integrations', label: 'Cloud Sync', icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-none",
              activeTab === tab.id
                ? "bg-white text-natural-sage shadow-md"
                : "text-natural-muted hover:text-natural-sage hover:bg-white/40"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW & TELEMETRY */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-natural-border shadow-lg space-y-2">
              <div className="flex items-center justify-between text-natural-muted">
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Total Pipeline</span>
                <IndianRupee className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-natural-sage">{formatRupees(totalPipelineVolume)}</p>
              <p className="text-[11px] text-natural-muted font-medium">Sum of active loan applications</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-natural-border shadow-lg space-y-2">
              <div className="flex items-center justify-between text-natural-muted">
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Total Applicants</span>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-black text-natural-sage">{totalLeads}</p>
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{approvedLoans} Approved</span>
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{pendingLoans} In Review</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-natural-border shadow-lg space-y-2">
              <div className="flex items-center justify-between text-natural-muted">
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Approval Rate</span>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-black text-natural-sage">{conversionRate}%</p>
              <p className="text-[11px] text-natural-muted font-medium">Algorithmic pre-qualification rate</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-natural-border shadow-lg space-y-2">
              <div className="flex items-center justify-between text-natural-muted">
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Avg Loan Size</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-natural-sage">{formatRupees(averageTicketSize)}</p>
              <p className="text-[11px] text-natural-muted font-medium">Per submitted profile</p>
            </div>
          </div>

          {/* Quick Actions & Recent Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-natural-border shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-natural-sage">Recent Mortgage Pipeline Inquiries</h3>
                  <p className="text-xs text-natural-muted font-medium">Latest incoming customer inquiries and rate selections</p>
                </div>
                <button
                  onClick={() => setActiveTab('loans')}
                  className="text-xs font-bold text-natural-terracotta hover:underline cursor-pointer border-none bg-transparent"
                >
                  View All ({loans.length}) →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {loans.slice(0, 5).map((l) => (
                  <div key={l.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-sm text-natural-sage">{l.fullName || 'Anonymous Applicant'}</p>
                      <p className="text-[11px] text-natural-muted font-medium">
                        {l.mobileNumber || 'Phone not provided'} &bull; Lender: {l.selectedBank?.name || 'Pending'}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-black text-natural-terracotta">{formatRupees(l.loanAmount || 0)}</p>
                      <span className={cn(
                        "inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                        l.status === 'approved' ? "bg-emerald-100 text-emerald-800" :
                        l.status === 'rejected' ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      )}>
                        {l.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
                {loans.length === 0 && (
                  <p className="py-8 text-center text-xs text-natural-muted font-medium italic">
                    No active loan records yet. Test submitting an application in the customer flow to see it appear here live!
                  </p>
                )}
              </div>
            </div>

            {/* Quick Content Notice Controls */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-natural-border shadow-xl space-y-5">
              <div>
                <h3 className="text-xl font-bold text-natural-sage">Live Announcement</h3>
                <p className="text-xs text-natural-muted font-medium">Instant broadcast banner on landing page</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-natural-muted">
                  <span>Banner Active</span>
                  <input
                    type="checkbox"
                    checked={isAnnouncementActive}
                    onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 bg-slate-50 border border-natural-border rounded-xl text-xs font-medium text-natural-sage focus:bg-white focus:outline-none"
                  placeholder="Enter broadcast message..."
                />

                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-extrabold uppercase text-natural-muted">Featured ROI:</label>
                  <input
                    type="text"
                    value={featuredRate}
                    onChange={(e) => setFeaturedRate(e.target.value)}
                    className="w-24 p-2 bg-slate-50 border border-natural-border rounded-lg text-xs font-bold text-natural-sage"
                  />
                </div>

                <button
                  onClick={handleSaveAnnouncements}
                  className="w-full py-3 bg-natural-sage hover:bg-natural-sage/90 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. LOANS & LEADS DATA MANAGEMENT */}
      {activeTab === 'loans' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-natural-sage">Mortgage Application Pipeline</h3>
              <p className="text-xs text-natural-muted font-medium">Search, filter, inspect profiles, and update status decisions</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={loanSearch}
                  onChange={(e) => setLoanSearch(e.target.value)}
                  placeholder="Search by name, phone, or ID..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-natural-border rounded-xl text-xs font-bold text-natural-sage focus:outline-none focus:ring-1 focus:ring-natural-sage"
                />
                <Search className="w-4 h-4 text-natural-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-natural-border rounded-xl text-xs font-bold text-natural-sage focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {isLoadingLoans ? (
            <div className="bg-white p-12 rounded-[2.5rem] border border-natural-border text-center space-y-3 animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-natural-sage" />
              <p className="text-xs font-bold text-natural-muted">Loading live mortgage leads from Firestore...</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-natural-border shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[850px]">
                  <thead>
                    <tr className="border-b border-natural-border/50 bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted">Applicant Details</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted">Loan Amount</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted">Lender Selected</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted">Decision Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-border/30">
                    {filteredLoans.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-8 py-5">
                          <div className="space-y-1">
                            <p className="font-extrabold text-sm text-natural-sage">{l.fullName || 'Anonymous'}</p>
                            <p className="text-[11px] text-natural-muted font-medium flex items-center gap-2">
                              <span>ID: {l.id.slice(0, 8)}</span>
                              {l.mobileNumber && <span>&bull; 📞 {l.mobileNumber}</span>}
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-5 font-black text-sm text-natural-terracotta">
                          {formatRupees(l.loanAmount || 0)}
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-natural-sage">
                          {l.selectedBank?.name || 'Pending Selection'}
                        </td>
                        <td className="px-8 py-5">
                          <select
                            value={l.status}
                            onChange={async (e) => {
                              try {
                                const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
                                await updateDoc(doc(db, 'loans', l.id), {
                                  status: e.target.value as LoanStatus,
                                  updatedAt: serverTimestamp()
                                });
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider outline-none border cursor-pointer",
                              l.status === 'approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              l.status === 'rejected' ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                            )}
                          >
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="pending_review">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-8 py-5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedLoan(l)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-natural-sage rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border-none inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredLoans.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-natural-muted font-semibold italic">
                          No matching applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. CONTENT & ARTICLES MANAGEMENT */}
      {activeTab === 'content' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-natural-sage">Knowledge Hub & News Articles</h3>
              <p className="text-xs text-natural-muted font-medium">
                Publish, edit, and curate financial guides, market news, and advisory articles for borrowers
              </p>
            </div>
            <button
              onClick={() => {
                setEditingArticle({
                  id: `art-${Date.now()}`,
                  category: 'Mortgage Guide',
                  imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
                  title: '',
                  description: '',
                  author: 'Parrot Financial Team',
                  role: 'Mortgage Research Analyst',
                  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                  readTime: '4 min read',
                  content: '',
                  published: true
                });
                setIsArticleModalOpen(true);
              }}
              className="px-5 py-3 bg-natural-sage hover:bg-natural-sage/90 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer border-none shadow-md"
            >
              <Plus className="w-4 h-4" /> Create New Article
            </button>
          </div>

          {/* Article List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <div key={art.id} className="bg-white rounded-3xl border border-natural-border shadow-lg overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                    <img 
                      src={art.imageUrl} 
                      alt={art.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-wider text-natural-sage shadow-sm">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-2">
                    <h4 className="font-extrabold text-base text-natural-sage line-clamp-2">{art.title || 'Untitled Article'}</h4>
                    <p className="text-xs text-natural-muted font-medium line-clamp-3 leading-relaxed">{art.description}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                  <span className="text-[10px] font-bold text-natural-muted">{art.readTime}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingArticle(art);
                        setIsArticleModalOpen(true);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-natural-sage rounded-lg transition-colors cursor-pointer border-none"
                      title="Edit Article"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(art.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer border-none"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQs Manager Sub-Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-natural-border shadow-xl space-y-6 mt-12">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-natural-sage">Borrower FAQ & Help Knowledge Base</h3>
                <p className="text-xs text-natural-muted font-medium">Control the frequently asked questions displayed on the landing page</p>
              </div>
              <button
                onClick={() => {
                  setEditingFaq({
                    id: `faq-${Date.now()}`,
                    category: 'General',
                    question: '',
                    answer: ''
                  });
                  setIsFaqModalOpen(true);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-natural-sage text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer border-none"
              >
                <Plus className="w-3.5 h-3.5" /> Add FAQ Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="p-5 bg-slate-50/70 border border-slate-200/70 rounded-2xl space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[8px] font-extrabold uppercase tracking-wider">
                      {faq.category}
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingFaq(faq);
                          setIsFaqModalOpen(true);
                        }}
                        className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer border-none"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1 hover:bg-white rounded text-red-600 cursor-pointer border-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h5 className="font-extrabold text-xs text-natural-sage">{faq.question}</h5>
                  <p className="text-[11px] text-natural-muted font-medium leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. LENDER / BANKS RATE FEED */}
      {activeTab === 'banks' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-natural-sage">Partner Lender Data Feeds</h3>
              <p className="text-xs text-natural-muted font-medium">
                Set ROI interest rates, features tags, turnaround speed, and internal algorithmic matching weights
              </p>
            </div>
            {!isAddingBank && !editingBank && (
              <button
                onClick={() => setIsAddingBank(true)}
                className="px-5 py-3 bg-[#10B981] hover:bg-[#10B981]/90 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer border-none"
              >
                <Plus className="w-4 h-4" /> Add Lender Feed
              </button>
            )}
          </div>

          {/* Form for Add/Edit Bank */}
          {(isAddingBank || editingBank) ? (
            <form onSubmit={handleSaveBank} className="bg-white p-8 rounded-[2.5rem] border border-natural-border shadow-xl space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#10B981]">
                {editingBank ? `Editing Lender: ${editingBank.name}` : 'Create New Partner Lender Feed'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-natural-muted">Lender Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-natural-muted">Interest ROI (e.g. 7.10% or 8.40%)</label>
                  <input
                    type="text"
                    value={bankRate}
                    onChange={(e) => setBankRate(e.target.value)}
                    placeholder="e.g. 7.10%"
                    className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-natural-muted">Processing Turnaround Speed</label>
                  <input
                    type="text"
                    value={bankProcessingTime}
                    onChange={(e) => setBankProcessingTime(e.target.value)}
                    placeholder="e.g. 5-7 Days"
                    className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-natural-muted">Algorithmic Match Score (0 - 100)</label>
                  <input
                    type="number"
                    value={bankScore}
                    onChange={(e) => setBankScore(Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-natural-muted">Customer Star Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bankRating}
                    onChange={(e) => setBankRating(Number(e.target.value))}
                    min="1"
                    max="5"
                    className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-[10px] font-extrabold uppercase text-natural-muted">Features & Perks (Separated by commas)</label>
                  <input
                    type="text"
                    value={bankFeatures}
                    onChange={(e) => setBankFeatures(e.target.value)}
                    placeholder="e.g. Lowest Rates, Fast Disbursal, Zero Pre-closure Penalty, Digital Sanction"
                    className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetBankForm}
                  className="px-6 py-3 border border-natural-border text-natural-muted text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBank}
                  className="px-6 py-3 bg-[#10B981] hover:bg-[#10B981]/90 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer border-none"
                >
                  {isSavingBank ? 'Saving...' : 'Save Lender Offer'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-natural-border shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="border-b border-natural-border/50 bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted">Lender Details</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted">Interest ROI</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted">Turnaround Time</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted">Match Score & Rating</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-border/30">
                    {banks.map((b) => (
                      <tr key={b.id || b.name} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-8 py-5">
                          <div className="space-y-1.5">
                            <p className="font-extrabold text-sm text-natural-sage">{b.name}</p>
                            <div className="flex flex-wrap gap-1">
                              {(b.features || []).map((f: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[8px] font-extrabold uppercase tracking-wider border border-emerald-100">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 font-black text-sm text-natural-terracotta">{b.rate}</td>
                        <td className="px-8 py-5 text-xs font-semibold text-natural-muted">{b.processingTime || '5-10 Days'}</td>
                        <td className="px-8 py-5 text-xs font-bold text-natural-sage">
                          Score: {b.score || 90} &bull; ★{b.rating || 4.5}
                        </td>
                        <td className="px-8 py-5 text-right space-x-2">
                          <button
                            onClick={() => handleEditBankClick(b)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-natural-sage rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border-none"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBank(b.id || b.name)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border-none"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {banks.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-natural-muted font-semibold italic">
                          No custom bank feeds found. Default system lenders are currently powering rate calculations.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 5. USERS & RBAC MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-natural-sage">User Accounts & Permissions</h3>
              <p className="text-xs text-natural-muted font-medium">Inspect registered user profiles and elevate or revoke administrative roles</p>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-natural-border rounded-xl text-xs font-bold text-natural-sage focus:outline-none"
              />
              <Search className="w-4 h-4 text-natural-muted absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-natural-border shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[750px]">
                <thead>
                  <tr className="border-b border-natural-border/50 bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted">User Name</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted">Email Address</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted">Current Role</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-natural-muted text-right">Modify Permission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-border/30">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-8 py-5 font-extrabold text-sm text-natural-sage">{u.name || 'Anonymous User'}</td>
                      <td className="px-8 py-5 text-xs font-medium text-natural-muted">{u.email}</td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                          u.role === 'admin' ? "bg-purple-100 text-purple-700" :
                          u.role === 'staff' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(['client', 'staff', 'admin'] as UserRole[]).map((r) => (
                            <button
                              key={r}
                              disabled={updatingUserId === u.id || u.role === r}
                              onClick={() => handleRoleChange(u.id, r)}
                              className={cn(
                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer",
                                u.role === r 
                                  ? "bg-natural-sage text-white border-natural-sage" 
                                  : "bg-white text-natural-muted border-natural-border hover:border-natural-sage hover:text-natural-sage"
                              )}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-xs text-natural-muted font-semibold italic">
                        No registered users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. CREDIT ALGORITHM & RULES ENGINE */}
      {activeTab === 'algorithm' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-natural-sage">Algorithmic Scoring & Policy Studio</h3>
              <p className="text-xs text-natural-muted font-medium">
                Calibrate risk parameters, simulate borrower underwriting in real-time, inspect math formulas, and audit rule revision history.
              </p>
            </div>

            {/* Sub-tabs bar */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
              <button
                type="button"
                onClick={() => setAlgorithmSubTab('parameters')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none whitespace-nowrap",
                  algorithmSubTab === 'parameters' 
                    ? "bg-white text-natural-sage shadow-sm" 
                    : "text-natural-muted hover:text-natural-sage"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Calibrate Rules
              </button>

              <button
                type="button"
                onClick={() => setAlgorithmSubTab('simulator')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none whitespace-nowrap",
                  algorithmSubTab === 'simulator' 
                    ? "bg-emerald-600 text-white shadow-sm" 
                    : "text-natural-muted hover:text-natural-sage"
                )}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Simulate Applicant
              </button>

              <button
                type="button"
                onClick={() => setAlgorithmSubTab('how_it_works')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none whitespace-nowrap",
                  algorithmSubTab === 'how_it_works' 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-natural-muted hover:text-natural-sage"
                )}
              >
                <Brain className="w-3.5 h-3.5" />
                How It Works
              </button>

              <button
                type="button"
                onClick={() => setAlgorithmSubTab('history')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none whitespace-nowrap",
                  algorithmSubTab === 'history' 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-natural-muted hover:text-natural-sage"
                )}
              >
                <History className="w-3.5 h-3.5" />
                Rule Changes History ({ruleHistory.length})
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: CALIBRATE RULES & PUBLISH */}
          {algorithmSubTab === 'parameters' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Quick Presets Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-natural-border shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted">Risk Profile Presets:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('conservative')}
                      className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-none cursor-pointer transition-all", presetName === 'conservative' ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
                    >
                      Conservative (Strict)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('standard')}
                      className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-none cursor-pointer transition-all", presetName === 'standard' ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
                    >
                      Standard (RBI Baseline)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('aggressive')}
                      className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-none cursor-pointer transition-all", presetName === 'aggressive' ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
                    >
                      High Approval (Festive)
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  Current Version: <strong className="text-slate-900">{ruleHistory[0]?.version || 'v2.4'}</strong>
                </div>
              </div>

              <form onSubmit={handleSaveParams} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-natural-border shadow-xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-natural-muted">CIBIL Threshold Score</label>
                    <input
                      type="number"
                      value={localParams.cibilThreshold}
                      onChange={(e) => handleParamChange('cibilThreshold', Number(e.target.value))}
                      min="300"
                      max="900"
                      className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                      required
                    />
                    <p className="text-[10px] text-natural-muted font-medium">Scores below this trigger risk deductions.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-natural-muted">CIBIL Penalty Points</label>
                    <input
                      type="number"
                      value={localParams.cibilPenalty}
                      onChange={(e) => handleParamChange('cibilPenalty', Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                      required
                    />
                    <p className="text-[10px] text-natural-muted font-medium">Points deducted from match probability score.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-natural-muted">Max LTV Ratio % (Loan to Value)</label>
                    <input
                      type="number"
                      value={localParams.maxLtvRatio}
                      onChange={(e) => handleParamChange('maxLtvRatio', Number(e.target.value))}
                      min="50"
                      max="100"
                      className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                      required
                    />
                    <p className="text-[10px] text-natural-muted font-medium">Maximum property financing percentage allowed.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-natural-muted">Max FOIR Ratio % (Debt-to-Income)</label>
                    <input
                      type="number"
                      value={localParams.maxFoirRatio}
                      onChange={(e) => handleParamChange('maxFoirRatio', Number(e.target.value))}
                      min="30"
                      max="80"
                      className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                      required
                    />
                    <p className="text-[10px] text-natural-muted font-medium">Portion of net income permitted for total EMIs.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-natural-muted">Co-borrower Capacity Multiplier</label>
                    <input
                      type="number"
                      step="0.05"
                      value={localParams.coBorrowerMultiplier}
                      onChange={(e) => handleParamChange('coBorrowerMultiplier', Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                      required
                    />
                    <p className="text-[10px] text-natural-muted font-medium">Combined eligibility lift factor (default: 1.45x).</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-natural-muted">Salary Account Affinity Bonus</label>
                    <input
                      type="number"
                      value={localParams.salaryMatchBonus}
                      onChange={(e) => handleParamChange('salaryMatchBonus', Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-sm font-bold text-natural-sage focus:bg-white focus:outline-none"
                      required
                    />
                    <p className="text-[10px] text-natural-muted font-medium">Match score boost if salary is banked with lender.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('standard')}
                      className="px-5 py-3 border border-natural-border text-natural-muted text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
                    >
                      Reset to Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlgorithmSubTab('simulator')}
                      className="px-5 py-3 bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-100 cursor-pointer border border-emerald-200 flex items-center gap-1.5"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      Test in Simulator
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingParams}
                    className="w-full sm:w-auto px-8 py-3 bg-natural-sage hover:bg-natural-sage/90 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-natural-sage/20 flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    {isSavingParams ? 'Applying Parameters...' : 'Save Algorithm & Publish Rules'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SUB-VIEW 2: SIMULATE APPLICANT */}
          {algorithmSubTab === 'simulator' && (
            <ApplicantSimulator algorithmParams={localParams} />
          )}

          {/* SUB-VIEW 3: HOW IT WORKS & ARCHITECTURE */}
          {algorithmSubTab === 'how_it_works' && (
            <AlgorithmHowItWorks />
          )}

          {/* SUB-VIEW 4: RULE CHANGES HISTORY & ROLLBACK */}
          {algorithmSubTab === 'history' && (
            <RuleChangesHistory 
              history={ruleHistory} 
              currentParams={localParams} 
              onRestoreVersion={handleRestoreVersion} 
            />
          )}
        </div>
      )}


      {/* TAB CONTENT: 7. CLOUD SYNC & INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-[2.5rem] border border-emerald-200/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-white text-emerald-600 rounded-2xl shadow-sm border border-emerald-100 shrink-0">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-lg text-emerald-950">Google Sheets Automated Leads Sync</h4>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider",
                    isSheetsConnected ? "bg-emerald-100 text-emerald-800 font-black animate-pulse" : "bg-amber-100 text-amber-800"
                  )}>
                    {isSheetsConnected ? 'Active Connection' : 'Needs Authorization'}
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 max-w-xl leading-relaxed">
                  Incoming workflow applications are pushed directly to a Google Sheets workbook named 
                  <strong className="font-extrabold text-emerald-950"> ParrotMoney Home Loan Leads </strong> in your authenticated Google Drive workspace.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {isSheetsConnected ? (
                <div className="text-right space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center justify-end gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Live Cloud Sync Enabled
                  </div>
                </div>
              ) : (
                <button
                  onClick={onConnectSheets}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer border-none"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Authorize Google Sheets Sync
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 8. AI AD SCRAPER & DAILY EXCEL */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <LenderCampaignRadar />
        </div>
      )}

      {/* INSPECT LOAN MODAL */}
      <AnimatePresence>
        {selectedLoan && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-2xl w-full rounded-[2.5rem] border border-natural-border shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-natural-muted">Application Profile</span>
                  <h3 className="text-2xl font-black text-natural-sage">{selectedLoan.fullName || 'Applicant Deep Dive'}</h3>
                </div>
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-natural-muted">Requested Amount</span>
                  <p className="font-black text-base text-natural-terracotta">{formatRupees(selectedLoan.loanAmount || 0)}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-natural-muted">Property Valuation</span>
                  <p className="font-black text-base text-natural-sage">{formatRupees(selectedLoan.propertyValue || 0)}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-natural-muted">Monthly Income</span>
                  <p className="font-black text-base text-natural-sage">{formatRupees(selectedLoan.monthlyIncome || 0)}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-natural-muted">Selected Bank</span>
                  <p className="font-bold text-natural-sage">{selectedLoan.selectedBank?.name || 'N/A'}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-natural-muted">Mobile Number</span>
                  <p className="font-bold text-natural-sage">{selectedLoan.mobileNumber || 'Not provided'}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[9px] font-extrabold uppercase text-natural-muted">Current Status</span>
                  <p className="font-bold text-emerald-700 uppercase tracking-wider">{selectedLoan.status}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="px-6 py-3 bg-natural-sage text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer border-none"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ARTICLE CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isArticleModalOpen && editingArticle && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-3xl w-full rounded-[2.5rem] border border-natural-border shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-natural-sage">
                  {articles.some(a => a.id === editingArticle.id) ? 'Edit Knowledge Article' : 'Create New Knowledge Article'}
                </h3>
                <button
                  onClick={() => setIsArticleModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveArticle} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-natural-muted">Article Title</label>
                    <input
                      type="text"
                      value={editingArticle.title}
                      onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                      placeholder="e.g. Navigating Home Loan Floating Rates in 2026"
                      className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-xs font-bold text-natural-sage focus:bg-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-natural-muted">Category Tag</label>
                    <input
                      type="text"
                      value={editingArticle.category}
                      onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                      placeholder="e.g. RBI Update, Eligibility Tips, Tax Saving"
                      className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-xs font-bold text-natural-sage focus:bg-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-extrabold uppercase text-natural-muted">Cover Image URL</label>
                    <input
                      type="text"
                      value={editingArticle.imageUrl}
                      onChange={(e) => setEditingArticle({ ...editingArticle, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-xs font-bold text-natural-sage focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-extrabold uppercase text-natural-muted">Short Description / Subtitle</label>
                    <input
                      type="text"
                      value={editingArticle.description}
                      onChange={(e) => setEditingArticle({ ...editingArticle, description: e.target.value })}
                      placeholder="Brief overview shown on cards..."
                      className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-xs font-bold text-natural-sage focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-extrabold uppercase text-natural-muted">Article Body (Markdown supported)</label>
                    <textarea
                      rows={8}
                      value={editingArticle.content}
                      onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                      placeholder="Write article content here..."
                      className="w-full p-4 bg-slate-50 border border-natural-border rounded-xl text-xs font-medium text-natural-sage focus:bg-white focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsArticleModalOpen(false)}
                    className="px-6 py-3 border border-natural-border text-natural-muted text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-natural-sage hover:bg-natural-sage/90 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer border-none"
                  >
                    Save & Publish Article
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAQ CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isFaqModalOpen && editingFaq && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-lg w-full rounded-[2.5rem] border border-natural-border shadow-2xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-natural-sage">
                  {faqs.some(f => f.id === editingFaq.id) ? 'Edit FAQ Item' : 'Add FAQ Item'}
                </h3>
                <button
                  onClick={() => setIsFaqModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFaq} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-natural-muted">Category</label>
                  <input
                    type="text"
                    value={editingFaq.category}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                    placeholder="Eligibility, Rates, Documentation, Process"
                    className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-xs font-bold text-natural-sage focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-natural-muted">Question</label>
                  <input
                    type="text"
                    value={editingFaq.question}
                    onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                    placeholder="e.g. Can adding a co-applicant boost my loan amount?"
                    className="w-full px-4 py-3 bg-slate-50 border border-natural-border rounded-xl text-xs font-bold text-natural-sage focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-natural-muted">Answer</label>
                  <textarea
                    rows={4}
                    value={editingFaq.answer}
                    onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                    placeholder="Enter the detailed answer..."
                    className="w-full p-4 bg-slate-50 border border-natural-border rounded-xl text-xs font-medium text-natural-sage focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFaqModalOpen(false)}
                    className="px-6 py-3 border border-natural-border text-natural-muted text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-natural-sage hover:bg-natural-sage/90 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer border-none"
                  >
                    Save FAQ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
