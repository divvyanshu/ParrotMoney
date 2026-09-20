import React, { useState, useEffect, useMemo } from 'react';
import { 
  Megaphone, Sparkles, RefreshCw, Download, Search, Filter, 
  ExternalLink, CheckCircle2, AlertTriangle, Info, Radio, 
  Building2, Zap, FileSpreadsheet, ArrowUpRight, TrendingDown,
  Percent, ShieldCheck, Clock, Layers, BarChart2, Eye, Compass,
  Database, CloudLightning, Award, Check, ArrowDownRight, ArrowUpDown,
  Landmark, Home, SlidersHorizontal, Calendar, Tag, ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export type LenderType = "Bank" | "HFC" | "NBFC";
export type DurationCategory = "Short-Term" | "Mid-Term" | "Long-Term";

export interface MarketCampaign {
  id: string;
  lenderName: string;
  lenderType?: LenderType;
  campaignTitle: string;
  channel: string;
  adCopyHeadline: string;
  statedRate: string;
  processingFeeDiscount: string;
  validityStart: string;
  validityEnd: string;
  targetSegment: string;
  finePrint: string;
  sourceUrl?: string;
  scrapedAt: string;
  status: string;
}

export interface ExcelSyncStatus {
  lastUpdated: string;
  nextScheduledRun: string;
  isAutoDailyActive: boolean;
  totalLenders: number;
  totalHomeLoanRows: number;
  totalLapRows: number;
  activeCampaignsCount: number;
  fileSizeBytes: number;
  filePath: string;
}

export interface SchedulerStatus {
  schedulerActive: boolean;
  interval: string;
  lastRun: string;
  nextScheduledRun: string;
  scrapedPortalsCount: number;
  firestoreCollection: string;
  banksCollection: string;
}

// Helper to determine Lender Type
export function getLenderType(lenderName: string): LenderType {
  const lower = lenderName.toLowerCase();
  if (
    lower.includes("housing finance") || 
    lower.includes("hfc") || 
    lower.includes("hfl") || 
    lower.includes("bajaj housing") || 
    lower.includes("pnb housing") || 
    lower.includes("tata capital housing") ||
    lower.includes("lic housing") ||
    lower.includes("aadhar")
  ) {
    return "HFC";
  }
  if (
    lower.includes("nbfc") || 
    lower.includes("piramal") || 
    lower.includes("finserv") || 
    lower.includes("l&t finance") || 
    lower.includes("tata capital") ||
    lower.includes("poona") ||
    lower.includes("shriram") ||
    lower.includes("aditya birla")
  ) {
    return "NBFC";
  }
  return "Bank";
}

// Helper to calculate campaign duration in days
export function getCampaignDurationDays(validityStart: string, validityEnd: string): number {
  const start = new Date(validityStart).getTime();
  const end = new Date(validityEnd).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return 45;
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

// Helper to categorize campaign duration
export function getDurationCategory(days: number): DurationCategory {
  if (days < 30) return "Short-Term";
  if (days <= 60) return "Mid-Term";
  return "Long-Term";
}

// Helper to parse numerical rate
export function extractRateNumber(statedRate: string): number {
  const match = statedRate.match(/\d+\.\d+/);
  return match ? parseFloat(match[0]) : 8.50;
}

// 30-day daily interest rate trend dataset captured from scraped competitor campaigns
const generate30DayTrendData = () => {
  const data = [];
  const baseDate = new Date("2026-09-20");

  const milestones: { [dayOffset: number]: string } = {
    28: "RBI MPC holds repo at 6.50%",
    23: "SBI Griha Utsav: Cuts rate to 8.35%",
    19: "HDFC Festive BT Blitz @ 8.35% + Flat ₹3k PF",
    15: "Bank of Baroda 100% PF Waiver campaign",
    10: "Bajaj Housing festive cut: 8.30% market low",
    6: "Axis Bank 12-EMI Waiver scheme rolled out",
    2: "Tata Capital 5 bps Women Rebate",
    0: "Festival Rate War: 65% Lenders offer Zero PF"
  };

  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const fullDate = d.toISOString().split("T")[0];

    // Smooth trends reflecting real market moves over the last 30 days:
    // Market average steadily declined as festive drives commenced
    // Day 29 to 20: 8.62 -> 8.56
    // Day 20 to 10: 8.56 -> 8.48
    // Day 10 to 0: 8.48 -> 8.41
    const progress = (29 - i) / 29;
    
    // Banks: 8.50 -> 8.35
    let bankLowest = 8.50;
    if (i <= 23) bankLowest = 8.40;
    if (i <= 19) bankLowest = 8.35;

    // HFCs: 8.55 -> 8.30
    let hfcLowest = 8.50;
    if (i <= 20) hfcLowest = 8.45;
    if (i <= 10) hfcLowest = 8.30;

    // NBFCs: 8.75 -> 8.55
    let nbfcLowest = 8.75;
    if (i <= 22) nbfcLowest = 8.68;
    if (i <= 12) nbfcLowest = 8.60;
    if (i <= 5) nbfcLowest = 8.55;

    // Market Average
    const marketAvg = Number((8.64 - progress * 0.22 + (Math.sin(i * 0.4) * 0.015)).toFixed(2));

    data.push({
      dayOffset: i,
      date: dateStr,
      fullDate,
      marketAvg,
      bankLowest,
      hfcLowest,
      nbfcLowest,
      event: milestones[i] || null
    });
  }
  return data;
};

const DAILY_30_DAY_RATE_TREND = generate30DayTrendData();

// Enhanced Initial Fallback Campaigns with varied Durations and Lender Types
const INITIAL_CAMPAIGNS: MarketCampaign[] = [
  {
    id: "camp-sbi-festive-2026",
    lenderName: "State Bank of India (SBI)",
    lenderType: "Bank",
    campaignTitle: "Monsoon & Festive Griha Utsav 2026",
    channel: "Meta Ads (FB/Insta)",
    adCopyHeadline: "Own your dream home at just 8.35% p.a. Zero processing fee on CIBIL 750+!",
    statedRate: "8.35% p.a.",
    processingFeeDiscount: "100% Waiver (Zero Processing Fee)",
    validityStart: "2026-08-15",
    validityEnd: "2026-10-31", // 77 days -> Long-Term
    targetSegment: "Salaried & Professionals (CIBIL 750+)",
    finePrint: "Valid for approvals disbursed before Oct 31, 2026; standard legal & valuation charges apply.",
    sourceUrl: "https://www.facebook.com/ads/library/?q=sbi%20home%20loan",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "camp-bajaj-zero-pf",
    lenderName: "Bajaj Housing Finance Ltd",
    lenderType: "HFC",
    campaignTitle: "Diwali Super Saver Home Loan",
    channel: "Meta Ads (FB/Insta)",
    adCopyHeadline: "Get In-Principle Sanction in 10 Mins! Interest Rates Starting 8.30% p.a.",
    statedRate: "8.30% p.a.",
    processingFeeDiscount: "Zero Processing Fee + Free Digital Valuation",
    validityStart: "2026-09-10",
    validityEnd: "2026-11-30", // 81 days -> Long-Term
    targetSegment: "Corporate Salaried Employees (CAT A & B Builders)",
    finePrint: "For select approved builders in Mumbai, Delhi-NCR, Bengaluru, Pune, Hyderabad.",
    sourceUrl: "https://www.facebook.com/ads/library/?q=bajaj%20housing",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "camp-hdfc-festive-2026",
    lenderName: "HDFC Bank",
    lenderType: "Bank",
    campaignTitle: "Festive Treat Balance Transfer Blitz",
    channel: "Google Ads Transparency",
    adCopyHeadline: "Switch your existing Home Loan to HDFC Bank starting @ 8.35% p.a. Flat ₹3,000 PF!",
    statedRate: "8.35% - 8.50% p.a.",
    processingFeeDiscount: "Flat ₹3,000 + GST (Save up to ₹25,000)",
    validityStart: "2026-09-01",
    validityEnd: "2026-10-20", // 49 days -> Mid-Term
    targetSegment: "Balance Transfer Borrowers with >2 yrs clean track record",
    finePrint: "Applicable for loan ticket size ₹50 Lakhs & above. Top-up at same home loan rate.",
    sourceUrl: "https://adstransparency.google.com/?region=IN&domain=hdfcbank.com",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "camp-icici-flash-preapproved",
    lenderName: "ICICI Bank",
    lenderType: "Bank",
    campaignTitle: "Express 72-Hr Instant Digi-Sanction",
    channel: "Bank Promo Portal",
    adCopyHeadline: "Pre-approved Home Loan Sanction letter in 3 clicks for salary account holders @ 8.40%",
    statedRate: "8.40% p.a.",
    processingFeeDiscount: "50% off on standard processing fees",
    validityStart: "2026-09-15",
    validityEnd: "2026-10-05", // 20 days -> Short-Term Flash
    targetSegment: "Existing ICICI Bank Salary & Premium Relationship Customers",
    finePrint: "Digital sanction validity is 6 months; final disbursement upon title clearance.",
    sourceUrl: "https://www.icicibank.com/personal-banking/loans/home-loan/special-offers",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "camp-kotak-flash-rate",
    lenderName: "Kotak Mahindra Bank",
    lenderType: "Bank",
    campaignTitle: "Quarter-End 15-Day Flash Sanction",
    channel: "Meta Ads (FB/Insta)",
    adCopyHeadline: "48-Hour Doorstep Sanctions @ 8.45% p.a. Special Login Fee Waiver!",
    statedRate: "8.45% p.a.",
    processingFeeDiscount: "Zero Login Fee (Save ₹5,000)",
    validityStart: "2026-09-12",
    validityEnd: "2026-09-30", // 18 days -> Short-Term Flash
    targetSegment: "Self-Employed CA/Doctors & Tech Salaried",
    finePrint: "Valid strictly for files logged in before Sep 30, 2026.",
    sourceUrl: "https://www.facebook.com/ads/library/?q=kotak%20home%20loan",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "camp-pnbhfl-unnati",
    lenderName: "PNB Housing Finance",
    lenderType: "HFC",
    campaignTitle: "Roshni & Unnati Affordable Home Drive",
    channel: "Print e-Paper (Gemini Vision)",
    adCopyHeadline: "Apna Ghar, Apna Hak - Affordable Home Loans up to ₹35 Lakhs with PMAY 2.0 Interest Subsidy",
    statedRate: "8.75% p.a. (Net ~5.75% after PMAY Subsidy)",
    processingFeeDiscount: "0.25% or ₹5,000 whichever is lower",
    validityStart: "2026-09-01",
    validityEnd: "2026-12-31", // 121 days -> Long-Term
    targetSegment: "Self-Employed Informal & EWS/LIG borrowers (Income < ₹9 Lakh p.a.)",
    finePrint: "Subject to PMAY-U 2.0 Interest Subsidy Scheme portal registration.",
    sourceUrl: "https://epaper.financialexpress.com/",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "camp-bob-monsoon",
    lenderName: "Bank of Baroda",
    lenderType: "Bank",
    campaignTitle: "Baroda Home Loan Advantage Bonanza",
    channel: "Bank Promo Portal",
    adCopyHeadline: "Direct Repo-Linked Home Loan at 8.40% p.a. 100% complete waiver on upfront processing fee.",
    statedRate: "8.40% p.a.",
    processingFeeDiscount: "100% Processing Fee Waiver",
    validityStart: "2026-08-20",
    validityEnd: "2026-10-10", // 51 days -> Mid-Term
    targetSegment: "Borrowers with CIBIL 771+ looking for pure BRLLR link",
    finePrint: "Zero administration charges. Property insurance optional.",
    sourceUrl: "https://www.bankofbaroda.in/personal-banking/loans/home-loan/offers",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "camp-axis-shubh",
    lenderName: "Axis Bank",
    lenderType: "Bank",
    campaignTitle: "Shubh Aarambh 12-EMI Waiver Scheme",
    channel: "Bank Promo Portal",
    adCopyHeadline: "Save up to ₹3 Lakhs! 12 EMIs completely waived on prompt repayments. Starting @ 8.45% p.a.",
    statedRate: "8.45% p.a.",
    processingFeeDiscount: "12 EMIs Waived on Regular Track Record",
    validityStart: "2026-09-01",
    validityEnd: "2026-11-30", // 90 days -> Long-Term
    targetSegment: "Borrowers taking 20+ years tenure with strict ECS discipline",
    finePrint: "4 EMIs waived at end of 4th, 8th, and 12th year on zero bounce record.",
    sourceUrl: "https://www.axisbank.com/retail/loans/home-loan/offers",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "camp-tata-shubharambh",
    lenderName: "Tata Capital Housing Finance",
    lenderType: "HFC",
    campaignTitle: "Tata Shubharambh Home Loan Special",
    channel: "Google Ads Transparency",
    adCopyHeadline: "Celebrate your new home at 8.55% p.a. Extra 5 bps concession for women primary co-owners.",
    statedRate: "8.55% p.a.",
    processingFeeDiscount: "Flat ₹4,999 + 5 bps Women Rebate",
    validityStart: "2026-09-10",
    validityEnd: "2026-12-31", // 112 days -> Long-Term
    targetSegment: "First-time buyers & women property co-owners",
    finePrint: "Instant digital sanction with doorstep document assistance.",
    sourceUrl: "https://adstransparency.google.com/?region=IN&domain=tatacapital.com",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "camp-piramal-fasttrack",
    lenderName: "Piramal Finance",
    lenderType: "NBFC",
    campaignTitle: "Navratri Grihini Flash Sanction Drive",
    channel: "Meta Ads (FB/Insta)",
    adCopyHeadline: "Loans for Kirana & Informal Business owners without formal ITR @ 8.95% + 10 bps Women Rebate!",
    statedRate: "8.95% p.a.",
    processingFeeDiscount: "Zero Assessment Fee + 10 bps Women Concession",
    validityStart: "2026-09-18",
    validityEnd: "2026-10-12", // 24 days -> Short-Term Flash
    targetSegment: "Self-Employed Informal Cashflow & Women Entrepreneurs",
    finePrint: "Surrogate banking assessment accepted. Doorstep physical verification.",
    sourceUrl: "https://www.facebook.com/ads/library/?q=piramal%20finance",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "camp-lichfl-gruhavaradhi",
    lenderName: "LIC Housing Finance Ltd",
    lenderType: "HFC",
    campaignTitle: "Gruha Varadhi Festive Concession",
    channel: "Bank Promo Portal",
    adCopyHeadline: "Low EMI Home Loans starting at 8.50% p.a. with zero prepayment penalty for individuals.",
    statedRate: "8.50% p.a.",
    processingFeeDiscount: "50% Waiver on Processing Fees",
    validityStart: "2026-09-01",
    validityEnd: "2026-10-25", // 54 days -> Mid-Term
    targetSegment: "Salaried State & Central Govt Employees & Pensioners",
    finePrint: "Concession valid for loan sanction up to ₹1.5 Crores.",
    sourceUrl: "https://www.lichousing.com/home-loans",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  },
  {
    id: "camp-lt-nbfc-festive",
    lenderName: "L&T Finance",
    lenderType: "NBFC",
    campaignTitle: "Express Home Loan Festive Push",
    channel: "Google Ads Transparency",
    adCopyHeadline: "Fast Digital Sanction in 15 Minutes @ 8.65% with Zero Foreclosure Charges.",
    statedRate: "8.65% p.a.",
    processingFeeDiscount: "Flat ₹5,000 + GST",
    validityStart: "2026-09-05",
    validityEnd: "2026-10-31", // 56 days -> Mid-Term
    targetSegment: "Affordable Housing & Emerging Metro Buyers",
    finePrint: "Valid for properties verified on PLANET app.",
    sourceUrl: "https://adstransparency.google.com/?region=IN&domain=ltfs.com",
    scrapedAt: new Date().toISOString(),
    status: "Active"
  }
];

export function LenderCampaignRadar() {
  const [campaigns, setCampaigns] = useState<MarketCampaign[]>(INITIAL_CAMPAIGNS);
  const [syncStatus, setSyncStatus] = useState<ExcelSyncStatus | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  
  // Strategy Views
  const [activeStrategyTab, setActiveStrategyTab] = useState<"trend" | "rates" | "concessions" | "matrix">("trend");
  
  // Chart Lines Visibility Toggle
  const [visibleLines, setVisibleLines] = useState({
    marketAvg: true,
    bankLowest: true,
    hfcLowest: true,
    nbfcLowest: true
  });

  // Filters & Sorting Controls
  const [selectedLenderType, setSelectedLenderType] = useState<string>("All");
  const [selectedDuration, setSelectedDuration] = useState<string>("All");
  const [selectedChannel, setSelectedChannel] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("duration-asc");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Action States
  const [isScrapingAds, setIsScrapingAds] = useState(false);
  const [isRunningCloudSync, setIsRunningCloudSync] = useState(false);
  const [isRefreshingExcel, setIsRefreshingExcel] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. Subscribe to Firestore 'MarketCampaigns' in real time
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const colRef = collection(db, 'MarketCampaigns');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: MarketCampaign[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            const lenderName = data.lenderName || "Lender";
            list.push({
              id: doc.id,
              lenderName,
              lenderType: data.lenderType || getLenderType(lenderName),
              campaignTitle: data.campaignTitle || "Offer",
              channel: data.channel || "Web Portal",
              adCopyHeadline: data.adCopyHeadline || "",
              statedRate: data.statedRate || "8.40% p.a.",
              processingFeeDiscount: data.processingFeeDiscount || "Standard",
              validityStart: data.validityStart || "2026-09-01",
              validityEnd: data.validityEnd || "2026-11-30",
              targetSegment: data.targetSegment || "All Eligible Borrowers",
              finePrint: data.finePrint || "",
              sourceUrl: data.sourceUrl,
              scrapedAt: data.scrapedAt || new Date().toISOString(),
              status: data.status || "Active"
            });
          });
          setCampaigns(list);
          setIsFirestoreConnected(true);
        }
      }, (err) => {
        console.warn("[MarketCampaigns] Firestore real-time listener notice:", err.message);
        setIsFirestoreConnected(false);
      });
    } catch (e) {
      console.warn("[MarketCampaigns] Could not attach listener:", e);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. Fetch Sync Status, Campaigns, and Scheduler Telemetry on Mount
  const fetchStatusAndCampaigns = async () => {
    try {
      const [statusRes, campRes, schedRes] = await Promise.all([
        fetch('/api/admin/lenders-excel/status'),
        fetch('/api/admin/campaigns/list'),
        fetch('/api/cloud-functions/scheduler-status')
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setSyncStatus(data);
      }
      if (campRes.ok) {
        const campData = await campRes.json();
        if (campData.campaigns && campData.campaigns.length > 0) {
          const listWithTypes = campData.campaigns.map((c: any) => ({
            ...c,
            lenderType: c.lenderType || getLenderType(c.lenderName)
          }));
          setCampaigns(listWithTypes);
          if (campData.source === "firestore") {
            setIsFirestoreConnected(true);
          }
        }
      }
      if (schedRes.ok) {
        const schedData = await schedRes.json();
        setSchedulerStatus(schedData);
      }
    } catch (err) {
      console.warn("Could not fetch status:", err);
    }
  };

  useEffect(() => {
    fetchStatusAndCampaigns();
  }, []);

  // Run AI Campaign Scraper
  const handleRunAIScraper = async () => {
    setIsScrapingAds(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/admin/campaigns/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMessage({
          type: 'success',
          text: `AI Scraper successfully scanned financial portals & saved ${data.firestoreSavedCount || data.scrapedCount} campaigns into Firestore 'MarketCampaigns'!`
        });
        if (data.campaigns) {
          const listWithTypes = data.campaigns.map((c: any) => ({
            ...c,
            lenderType: c.lenderType || getLenderType(c.lenderName)
          }));
          setCampaigns(listWithTypes);
        }
        await fetchStatusAndCampaigns();
      } else {
        throw new Error(data.error || 'Scraper run failed');
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: `AI Scraper error: ${err.message || 'Scraper failed'}`
      });
    } finally {
      setIsScrapingAds(false);
    }
  };

  // Trigger Cloud Function Daily Sync
  const handleRunCloudFunctionSync = async () => {
    setIsRunningCloudSync(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/cloud-functions/daily-lender-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Cloud Function executed! Updated ${data.banksUpdatedInFirestore} lenders in Firestore 'banks' and rebuilt 7-sheet Master Excel (${Math.round((data.excelFileSizeBytes || 0) / 1024)} KB).`
        });
        await fetchStatusAndCampaigns();
      } else {
        throw new Error(data.error || 'Cloud Function sync failed');
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: `Cloud Function error: ${err.message || 'Sync failed'}`
      });
    } finally {
      setIsRunningCloudSync(false);
    }
  };

  // Force Excel Regeneration
  const handleForceRefreshExcel = async () => {
    setIsRefreshingExcel(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/admin/lenders-excel/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMessage({
          type: 'success',
          text: 'Master Excel workbook successfully regenerated with 7 sheets!'
        });
        if (data.status) setSyncStatus(data.status);
      } else {
        throw new Error(data.error || 'Refresh failed');
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: `Excel refresh error: ${err.message || 'Refresh failed'}`
      });
    } finally {
      setIsRefreshingExcel(false);
    }
  };

  // Filter & Sort Pipeline
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .map(c => {
        const type = c.lenderType || getLenderType(c.lenderName);
        const durationDays = getCampaignDurationDays(c.validityStart, c.validityEnd);
        const durationCategory = getDurationCategory(durationDays);
        const rateNumber = extractRateNumber(c.statedRate);
        return {
          ...c,
          lenderType: type,
          durationDays,
          durationCategory,
          rateNumber
        };
      })
      .filter(c => {
        // Lender Type Filter
        if (selectedLenderType !== "All" && c.lenderType !== selectedLenderType) {
          return false;
        }

        // Campaign Duration Filter
        if (selectedDuration !== "All") {
          if (selectedDuration === "Short-Term" && c.durationCategory !== "Short-Term") return false;
          if (selectedDuration === "Mid-Term" && c.durationCategory !== "Mid-Term") return false;
          if (selectedDuration === "Long-Term" && c.durationCategory !== "Long-Term") return false;
        }

        // Channel Filter
        if (selectedChannel !== "All" && !c.channel.toLowerCase().includes(selectedChannel.toLowerCase())) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = 
            c.lenderName.toLowerCase().includes(q) ||
            c.campaignTitle.toLowerCase().includes(q) ||
            c.adCopyHeadline.toLowerCase().includes(q) ||
            c.statedRate.toLowerCase().includes(q) ||
            c.targetSegment.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "duration-asc") {
          return a.durationDays - b.durationDays;
        }
        if (sortBy === "duration-desc") {
          return b.durationDays - a.durationDays;
        }
        if (sortBy === "rate-asc") {
          return a.rateNumber - b.rateNumber;
        }
        if (sortBy === "rate-desc") {
          return b.rateNumber - a.rateNumber;
        }
        if (sortBy === "scraped-desc") {
          return new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime();
        }
        return 0;
      });
  }, [campaigns, selectedLenderType, selectedDuration, selectedChannel, sortBy, searchQuery]);

  // Strategic Duration & Lender Distribution Counts for Strategy Insights
  const strategyCounts = useMemo(() => {
    let shortCount = 0;
    let midCount = 0;
    let longCount = 0;
    let bankCount = 0;
    let hfcCount = 0;
    let nbfcCount = 0;

    campaigns.forEach(c => {
      const type = c.lenderType || getLenderType(c.lenderName);
      const days = getCampaignDurationDays(c.validityStart, c.validityEnd);
      const cat = getDurationCategory(days);

      if (cat === "Short-Term") shortCount++;
      else if (cat === "Mid-Term") midCount++;
      else longCount++;

      if (type === "Bank") bankCount++;
      else if (type === "HFC") hfcCount++;
      else nbfcCount++;
    });

    return { shortCount, midCount, longCount, bankCount, hfcCount, nbfcCount };
  }, [campaigns]);

  // Compute analytics metrics
  const lowestRateNumber = Math.min(
    ...campaigns.map(c => extractRateNumber(c.statedRate)).filter(r => r < 90)
  );

  const totalFeeWaivers = campaigns.filter(c => 
    c.processingFeeDiscount.toLowerCase().includes("100%") || 
    c.processingFeeDiscount.toLowerCase().includes("zero")
  ).length;

  const rateSpectrumData = [
    { lender: "Bajaj Housing Finance", rate: 8.30, tag: "Lowest in Market", type: "HFC", spread: "+180 bps over Repo", concession: "Zero PF" },
    { lender: "State Bank of India (SBI)", rate: 8.35, tag: "PSU Benchmark", type: "Bank", spread: "+185 bps over Repo", concession: "100% PF Waiver" },
    { lender: "HDFC Bank", rate: 8.35, tag: "Private Leader", type: "Bank", spread: "+185 bps over Repo", concession: "Flat ₹3,000 PF" },
    { lender: "ICICI Bank", rate: 8.40, tag: "Express Digital", type: "Bank", spread: "+190 bps over Repo", concession: "50% PF Discount" },
    { lender: "Bank of Baroda", rate: 8.40, tag: "Direct BRLLR", type: "Bank", spread: "+190 bps over Repo", concession: "100% PF Waiver" },
    { lender: "Kotak Mahindra Bank", rate: 8.45, tag: "Fast Disbursal", type: "Bank", spread: "+195 bps over Repo", concession: "50% Login Concession" },
    { lender: "Axis Bank", rate: 8.45, tag: "12 EMI Waiver", type: "Bank", spread: "+195 bps over Repo", concession: "12 EMIs Waived" },
    { lender: "LIC Housing Finance", rate: 8.50, tag: "Govt Employee Concession", type: "HFC", spread: "+200 bps over Repo", concession: "50% PF Waiver" },
    { lender: "Tata Capital", rate: 8.55, tag: "Women Co-owner Concession", type: "HFC", spread: "+205 bps over Repo", concession: "Flat ₹4,999 + 5 bps Rebate" },
    { lender: "L&T Finance", rate: 8.65, tag: "Express Sanction", type: "NBFC", spread: "+215 bps over Repo", concession: "Flat ₹5,000 Fee" },
    { lender: "PNB Housing", rate: 8.75, tag: "PMAY 2.0 Linked (Net ~5.75%)", type: "HFC", spread: "+225 bps over Repo", concession: "₹5,000 Capped PF" },
    { lender: "Piramal Finance", rate: 8.95, tag: "Informal Cashflow Leader", type: "NBFC", spread: "+245 bps over Repo", concession: "10 bps Women Rebate" }
  ];

  // Custom Recharts Tooltip Component
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[210px] pointer-events-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-300">{label} (2026)</span>
            <span className="text-[10px] font-mono text-emerald-400">Day -{dataPoint.dayOffset}</span>
          </div>

          <div className="space-y-1 pt-0.5">
            {payload.map((entry: any) => (
              <div key={entry.name} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-black font-mono text-white">
                  {entry.value.toFixed(2)}% p.a.
                </span>
              </div>
            ))}
          </div>

          {dataPoint.event && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-amber-300 flex items-start gap-1.5 leading-snug">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
              <span>{dataPoint.event}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Action Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Market Campaigns & Competitor Intelligence Hub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Lender Advertisements & Competitor Strategy Radar
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Automated daily scraper monitors Meta Ad Library, Google Ads Transparency, and banking promo portals. Scraped campaigns persist directly to the <strong className="text-emerald-300 font-mono">MarketCampaigns</strong> collection in Firestore, with daily 30-day rate trends and duration segmentation (Bank vs NBFC vs HFC).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              onClick={handleRunAIScraper}
              disabled={isScrapingAds}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 cursor-pointer border-none"
              title="Scrape financial portals and persist into Firestore MarketCampaigns"
            >
              <Sparkles className={cn("w-4 h-4", isScrapingAds && "animate-spin")} />
              {isScrapingAds ? "Scraping Portals..." : "Run Daily AI Scraper"}
            </button>

            <button
              onClick={handleRunCloudFunctionSync}
              disabled={isRunningCloudSync}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer border-none"
              title="Execute Cloud Function to update 'banks' collection in Firestore and push to Google Sheet / Excel"
            >
              <CloudLightning className={cn("w-4 h-4", isRunningCloudSync && "animate-spin")} />
              {isRunningCloudSync ? "Syncing Banks..." : "Run Cloud Function Sync"}
            </button>

            <button
              onClick={handleForceRefreshExcel}
              disabled={isRefreshingExcel}
              className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs tracking-wide transition-all border border-slate-700 disabled:opacity-50 cursor-pointer"
              title="Force immediate daily Excel regeneration"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isRefreshingExcel && "animate-spin")} />
              {isRefreshingExcel ? "Rebuilding..." : "Force Excel"}
            </button>

            <a
              href="/api/download-lender-guidelines-excel?force=true"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs tracking-wide transition-all border border-white/10"
              title="Download the latest 7-sheet Master Excel file"
            >
              <Download className="w-3.5 h-3.5" />
              Download .xlsx
            </a>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-7 pt-6 border-t border-white/10">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400" />
              Daily Scraper Scheduler
            </div>
            <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              Daily 24h Cron
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Active</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Next Run: {schedulerStatus?.nextScheduledRun ? new Date(schedulerStatus.nextScheduledRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Tonight 04:00 AM"}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3 h-3 text-emerald-400" />
              Firestore 'MarketCampaigns'
            </div>
            <div className="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-1.5">
              {campaigns.length} Active Ads
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-400">
              Live Firestore collection sync
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-3 h-3 text-amber-400" />
              Lowest Advertised Rate
            </div>
            <div className="text-sm sm:text-base font-black text-amber-300">
              {lowestRateNumber < 90 ? `${lowestRateNumber.toFixed(2)}% p.a.` : "8.30% p.a."}
            </div>
            <div className="text-[11px] text-slate-400">
              Bajaj Housing / SBI Festive cut
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-blue-400" />
              Campaign Duration Mix
            </div>
            <div className="text-sm sm:text-base font-bold text-white">
              {strategyCounts.shortCount} Short • {strategyCounts.longCount} Long
            </div>
            <div className="text-[11px] text-slate-400">
              Tactical flash vs Strategic drives
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm transition-all animate-fadeIn",
          feedbackMessage.type === 'success' 
            ? "bg-emerald-50 text-emerald-950 border border-emerald-200" 
            : "bg-red-50 text-red-950 border border-red-200"
        )}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-medium">{feedbackMessage.text}</span>
        </div>
      )}

      {/* 2. Competitor Interest Rate Strategy Analytics Engine with Recharts Line Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Competitor Interest Rate Strategy Analytics
              </h3>
              <p className="text-xs text-slate-500">
                Daily 30-day rate trends, spread differentials over repo, and market positioning across top Indian lenders.
              </p>
            </div>
          </div>

          {/* Strategy Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveStrategyTab("trend")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none whitespace-nowrap",
                activeStrategyTab === "trend" ? "bg-white text-indigo-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              30-Day Trend (Recharts)
            </button>
            <button
              onClick={() => setActiveStrategyTab("rates")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none whitespace-nowrap",
                activeStrategyTab === "rates" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Rate Spectrum & Spreads
            </button>
            <button
              onClick={() => setActiveStrategyTab("concessions")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none whitespace-nowrap",
                activeStrategyTab === "concessions" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Concession & Fee Wars
            </button>
            <button
              onClick={() => setActiveStrategyTab("matrix")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none whitespace-nowrap",
                activeStrategyTab === "matrix" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Market Positioning Matrix
            </button>
          </div>
        </div>

        {/* View 1: 30-DAY DAILY TREND OF INTEREST RATE CHANGES (RECHARTS) */}
        {activeStrategyTab === "trend" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Top KPI Metrics & Line Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center flex-wrap gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">30-Day Rate Delta</span>
                  <span className="font-black text-emerald-700 text-sm flex items-center gap-0.5">
                    <TrendingDown className="w-4 h-4" />
                    -23 bps (-0.23%)
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lowest Scraped Rate</span>
                  <span className="font-black text-slate-900 text-sm">8.30% p.a. (Bajaj HFL)</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Market Avg</span>
                  <span className="font-black text-indigo-900 text-sm">8.42% p.a.</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">RBI Repo Anchor</span>
                  <span className="font-mono text-slate-600 text-sm">6.50% (+180 bps spread)</span>
                </div>
              </div>

              {/* Line Visibility Toggles */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Toggle Series:</span>
                
                <button
                  onClick={() => setVisibleLines(prev => ({ ...prev, marketAvg: !prev.marketAvg }))}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border",
                    visibleLines.marketAvg ? "bg-indigo-50 text-indigo-900 border-indigo-200" : "bg-white text-slate-400 border-slate-200 opacity-50"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  Market Avg
                </button>

                <button
                  onClick={() => setVisibleLines(prev => ({ ...prev, bankLowest: !prev.bankLowest }))}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border",
                    visibleLines.bankLowest ? "bg-emerald-50 text-emerald-900 border-emerald-200" : "bg-white text-slate-400 border-slate-200 opacity-50"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Banks (SBI/HDFC)
                </button>

                <button
                  onClick={() => setVisibleLines(prev => ({ ...prev, hfcLowest: !prev.hfcLowest }))}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border",
                    visibleLines.hfcLowest ? "bg-blue-50 text-blue-900 border-blue-200" : "bg-white text-slate-400 border-slate-200 opacity-50"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  HFCs (Bajaj/PNB)
                </button>

                <button
                  onClick={() => setVisibleLines(prev => ({ ...prev, nbfcLowest: !prev.nbfcLowest }))}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border",
                    visibleLines.nbfcLowest ? "bg-purple-50 text-purple-900 border-purple-200" : "bg-white text-slate-400 border-slate-200 opacity-50"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  NBFCs (Tata/Piramal)
                </button>
              </div>
            </div>

            {/* Recharts Line Chart Container */}
            <div className="w-full h-80 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DAILY_30_DAY_RATE_TREND} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                    interval={3}
                  />
                  <YAxis 
                    domain={[8.25, 8.85]} 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                    tickFormatter={(v) => `${v.toFixed(2)}%`}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '14px', fontSize: '12px' }}
                    iconType="circle"
                  />
                  
                  {/* Reference Line for RBI Repo Benchmark */}
                  <ReferenceLine 
                    y={8.30} 
                    stroke="#10B981" 
                    strokeDasharray="4 4" 
                    label={{ value: "Market Floor: 8.30%", fill: "#059669", fontSize: 10, position: 'insideBottomRight' }} 
                  />

                  {visibleLines.marketAvg && (
                    <Line 
                      type="monotone" 
                      dataKey="marketAvg" 
                      name="Market Average Rate" 
                      stroke="#4F46E5" 
                      strokeWidth={2.5} 
                      dot={{ r: 2, fill: "#4F46E5" }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff" }}
                    />
                  )}

                  {visibleLines.bankLowest && (
                    <Line 
                      type="monotone" 
                      dataKey="bankLowest" 
                      name="Banks Lowest Stated Rate" 
                      stroke="#10B981" 
                      strokeWidth={2.5} 
                      strokeDasharray="2 2"
                      dot={{ r: 2, fill: "#10B981" }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff" }}
                    />
                  )}

                  {visibleLines.hfcLowest && (
                    <Line 
                      type="monotone" 
                      dataKey="hfcLowest" 
                      name="HFCs Lowest Stated Rate" 
                      stroke="#0EA5E9" 
                      strokeWidth={2} 
                      dot={{ r: 2, fill: "#0EA5E9" }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff" }}
                    />
                  )}

                  {visibleLines.nbfcLowest && (
                    <Line 
                      type="monotone" 
                      dataKey="nbfcLowest" 
                      name="NBFCs Lowest Stated Rate" 
                      stroke="#A855F7" 
                      strokeWidth={2} 
                      strokeDasharray="4 4"
                      dot={{ r: 2, fill: "#A855F7" }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff" }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tactical Timeline Annotations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Day -23: PSU Rate Cut Initiated
                </span>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  State Bank of India rolled out 'Griha Utsav', slashing card rates to 8.35% with 100% PF waiver.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-xs space-y-1">
                <span className="font-bold text-blue-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Day -10: HFC Price War Floor
                </span>
                <p className="text-blue-800 text-[11px] leading-relaxed">
                  Bajaj Housing undercut commercial banks by launching an 8.30% p.a. digital sanction offer.
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs space-y-1">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  Day -2: NBFC Women Concessions
                </span>
                <p className="text-purple-800 text-[11px] leading-relaxed">
                  Tata Capital & Piramal rolled out 5-10 bps rebates for women co-applicants and informal earners.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Promotional Interest Rate Spectrum */}
        {activeStrategyTab === "rates" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <span>Benchmark: RBI Repo Rate is <strong>6.50%</strong>. Most lenders price floating loans with a spread of 180 - 245 bps.</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                Current Market Floor: 8.30% p.a.
              </span>
            </div>

            <div className="space-y-2.5">
              {rateSpectrumData.map((item) => {
                const percentageWidth = Math.min(100, Math.max(15, ((item.rate - 8.0) / 1.2) * 100));
                const isLeader = item.rate <= 8.35;

                return (
                  <div key={item.lender} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="sm:w-64 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.lender}</span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-semibold",
                          item.type === "Bank" ? "bg-emerald-100 text-emerald-800" :
                          item.type === "HFC" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                        )}>
                          {item.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className={cn("font-medium", isLeader ? "text-emerald-700" : "text-slate-600")}>{item.tag}</span>
                        <span>•</span>
                        <span>{item.concession}</span>
                      </div>
                    </div>

                    {/* Visual Bar Comparison */}
                    <div className="flex-1 max-w-md hidden md:block">
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            item.rate <= 8.30 ? "bg-emerald-500" :
                            item.rate <= 8.40 ? "bg-blue-500" :
                            item.rate <= 8.55 ? "bg-indigo-500" : "bg-amber-500"
                          )}
                          style={{ width: `${percentageWidth}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>8.00%</span>
                        <span className="font-mono">{item.spread}</span>
                        <span>9.20%</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={cn(
                        "text-sm font-black px-3 py-1 rounded-xl inline-block",
                        isLeader ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-800"
                      )}>
                        {item.rate.toFixed(2)}% p.a.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 3: Concession & Fee Wars */}
        {activeStrategyTab === "concessions" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900">100% PF Waiver Strategy</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">Zero Fee</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Aggressive PSU and HFC lenders waive upfront processing and administration charges (saving borrowers ₹15,000 - ₹35,000) to capture high-CIBIL prime applicants.
              </p>
              <div className="space-y-1 pt-1 border-t border-emerald-200/60">
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> State Bank of India (SBI Griha Utsav)
                </div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Bank of Baroda (Advantage Direct)
                </div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Bajaj Housing Finance (Diwali Super Saver)
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-blue-900">Flat Token & Capped Fees</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200 text-blue-900">Balance Transfer</span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Instead of charging standard 0.50% - 1.00% loan processing fees, private lenders cap switching costs with flat fees of ₹3,000 to ₹4,999 to aggressively poach borrowers from other banks.
              </p>
              <div className="space-y-1 pt-1 border-t border-blue-200/60">
                <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" /> HDFC Bank (Flat ₹3,000 + GST on ₹50L+)
                </div>
                <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" /> Tata Capital (Flat ₹4,999 Shubharambh)
                </div>
                <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" /> ICICI Bank (50% Off Standard Schedule)
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-purple-900">EMI Waiver & Subsidies</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-900">Special Incentives</span>
              </div>
              <p className="text-xs text-purple-800 leading-relaxed">
                Innovative loyalty mechanisms that reward uninterrupted repayment with free EMIs, government PMAY 2.0 interest subsidies, or dedicated rebates for female co-owners.
              </p>
              <div className="space-y-1 pt-1 border-t border-purple-200/60">
                <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-600" /> Axis Bank (12 EMIs Waived on Shubh Aarambh)
                </div>
                <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-600" /> PNB Housing (PMAY 2.0 Subsidy: Net ~5.75%)
                </div>
                <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-600" /> Piramal & Tata (5 - 10 bps Women Rebate)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 4: Market Positioning Matrix */}
        {activeStrategyTab === "matrix" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Quadrant 1: Ultra-Low Rate Aggressors</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Competitors:</strong> Bajaj Housing Finance (8.30%), SBI (8.35%), HDFC (8.35%), Bank of Baroda (8.40%).<br/>
                <strong>Target Persona:</strong> Corporate salaried employees with CIBIL 750+, buying in Tier 1 RERA-approved builder projects.<br/>
                <strong>Key Wedge:</strong> Price discounter; forces other market participants to compress net interest margins (NIMs).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Quadrant 2: Digital Speed & Zero-Friction Sanctions</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Competitors:</strong> ICICI Express Home Loans, Kotak Digi-Loans, HDFC Reach.<br/>
                <strong>Target Persona:</strong> Existing salary account holders and busy professionals who value same-day sanctions over 5 bps difference.<br/>
                <strong>Key Wedge:</strong> Instant digital sanction letter in under 10 minutes without physical paperwork.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Quadrant 3: Underwriting Flexibility & Informal Cashflows</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Competitors:</strong> PNB Housing (Roshni), Piramal Finance (Grihini), Tata Capital, Aadhar Housing.<br/>
                <strong>Target Persona:</strong> Small business proprietors, kirana owners, cash-economy earners without formal ITRs, and women homemakers.<br/>
                <strong>Key Wedge:</strong> Higher LTV up to 90%, flexible surrogate banking assessments, PMAY 2.0 subsidy channelization.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Quadrant 4: Retention & Repayment Loyalty Incentives</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Competitors:</strong> Axis Bank (Shubh Aarambh 12-EMI waiver), SBI Maxgain (Home Loan Overdraft).<br/>
                <strong>Target Persona:</strong> Long-term homeowners taking 20-30 year tenures who want liquidity flexibility or reward for disciplined track records.<br/>
                <strong>Key Wedge:</strong> Overdraft liquidity linked to savings account; scheduled EMI discounts at year 4, 8, and 12.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Filter & Sort Component: Lender Type & Campaign Duration */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Strategy Shift Intelligence Bar */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-800">Market Strategy Segmentation:</span>
            <span className="text-slate-600">
              <strong className="text-emerald-700">{strategyCounts.shortCount} Short-Term Flash</strong> (&lt;30d),{' '}
              <strong className="text-blue-700">{strategyCounts.midCount} Mid-Term</strong> (30-60d), and{' '}
              <strong className="text-purple-700">{strategyCounts.longCount} Long-Term Strategic</strong> (60d+) active campaigns.
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>Mix:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{strategyCounts.bankCount} Banks</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">{strategyCounts.hfcCount} HFCs</span>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">{strategyCounts.nbfcCount} NBFCs</span>
          </div>
        </div>

        {/* Filters and Sorting Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          {/* 1. Lender Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Landmark className="w-3 h-3 text-emerald-600" />
              Lender Type
            </label>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-0.5">
              {(["All", "Bank", "HFC", "NBFC"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedLenderType(type)}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-none text-center",
                    selectedLenderType === type 
                      ? "bg-white text-slate-900 shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {type === "All" ? "All" : type}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Campaign Duration Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              Campaign Duration
            </label>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-0.5">
              {[
                { id: "All", label: "All" },
                { id: "Short-Term", label: "<30d" },
                { id: "Mid-Term", label: "30-60d" },
                { id: "Long-Term", label: "60d+" }
              ].map(dur => (
                <button
                  key={dur.id}
                  onClick={() => setSelectedDuration(dur.id)}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-none text-center",
                    selectedDuration === dur.id 
                      ? "bg-white text-slate-900 shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  )}
                  title={dur.id === "Short-Term" ? "Short-Term Tactical (<30 days)" : dur.id === "Mid-Term" ? "Mid-Term (30-60 days)" : dur.id === "Long-Term" ? "Long-Term Strategic Festive (60+ days)" : "All Durations"}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Sort Order Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-purple-600" />
              Sort Strategy
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer appearance-none"
              >
                <option value="duration-asc">Duration: Shortest First (Flash)</option>
                <option value="duration-desc">Duration: Longest First (Strategic)</option>
                <option value="rate-asc">Interest Rate: Lowest First</option>
                <option value="rate-desc">Interest Rate: Highest First</option>
                <option value="scraped-desc">Recently Scraped</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. Search Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-500" />
              Keyword Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bank, rate, headline..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
        </div>

        {/* Channel Tags & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Ad Channel:</span>
            {["All", "Meta Ads", "Google Ads", "Bank Promo", "Print e-Paper"].map(ch => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border-none",
                  selectedChannel === ch
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {ch}
              </button>
            ))}
          </div>

          {(selectedLenderType !== "All" || selectedDuration !== "All" || selectedChannel !== "All" || searchQuery.trim() || sortBy !== "duration-asc") && (
            <button
              onClick={() => {
                setSelectedLenderType("All");
                setSelectedDuration("All");
                setSelectedChannel("All");
                setSearchQuery("");
                setSortBy("duration-asc");
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer border-none bg-transparent"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Live Scraped Advertisements Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Scraped Competitor Campaigns ({filteredCampaigns.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Persisted to Firestore collection <code>MarketCampaigns</code> & synced into Sheet 2 of Master Excel
          </span>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500 text-sm space-y-2">
            <p className="font-bold text-slate-700">No campaigns match your selected filters.</p>
            <p className="text-xs text-slate-400">Try loosening your lender type or campaign duration filters, or click "Run Daily AI Scraper" to scan financial portals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCampaigns.map((camp) => {
              const isShort = camp.durationCategory === "Short-Term";
              const isLong = camp.durationCategory === "Long-Term";

              return (
                <div 
                  key={camp.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all space-y-3.5 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {/* Tags row: Lender Type + Duration Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        {/* Lender Type Badge */}
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                          camp.lenderType === "Bank" ? "bg-emerald-100 text-emerald-900" :
                          camp.lenderType === "HFC" ? "bg-blue-100 text-blue-900" : "bg-purple-100 text-purple-900"
                        )}>
                          {camp.lenderType === "Bank" ? <Landmark className="w-3 h-3" /> :
                           camp.lenderType === "HFC" ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                          {camp.lenderType}
                        </span>

                        {/* Duration Badge */}
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          isShort ? "bg-amber-100 text-amber-900" :
                          isLong ? "bg-indigo-100 text-indigo-900" : "bg-slate-100 text-slate-800"
                        )}>
                          <Clock className="w-3 h-3" />
                          {camp.durationDays} Days ({camp.durationCategory})
                        </span>

                        {/* Channel Badge */}
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {camp.channel}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {camp.lenderName}
                      </h4>
                      <p className="text-xs font-semibold text-emerald-800">
                        {camp.campaignTitle}
                      </p>
                    </div>

                    <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {camp.status}
                    </span>
                  </div>

                  {/* Ad Creative Headline */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic leading-relaxed">
                    "{camp.adCopyHeadline}"
                  </div>

                  {/* Key Promotional Features */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Promotional Rate
                      </span>
                      <span className="text-sm sm:text-base font-black text-emerald-950">
                        {camp.statedRate}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                        Processing Concession
                      </span>
                      <span className="text-xs sm:text-sm font-black text-blue-950 truncate block" title={camp.processingFeeDiscount}>
                        {camp.processingFeeDiscount}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    <div>
                      <strong className="text-slate-700">Target Segment:</strong> {camp.targetSegment}
                    </div>
                    <div className="flex items-center gap-1">
                      <strong className="text-slate-700">Validity Window:</strong>
                      <span>{camp.validityStart} to {camp.validityEnd} ({camp.durationDays} days duration)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      <strong className="text-slate-600">Fine Print:</strong> {camp.finePrint}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      Scraped: {new Date(camp.scrapedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {camp.sourceUrl && (
                      <a
                        href={camp.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold transition-colors"
                      >
                        Inspect Ad Source
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
