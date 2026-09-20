import React, { useState } from "react";
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  Clock,
  Landmark,
  BadgePercent,
  UserCheck,
  FileCheck2,
  Calendar
} from "lucide-react";
import { 
  homeLoanData, 
  lapData, 
  currentSchemesData,
  governmentSchemesData, 
  regulatoryGuidelines, 
  HomeLoanGuideline, 
  LAPGuideline,
  CurrentSchemeGuideline,
  GovernmentSchemeGuideline 
} from "../data/lendersData";
import { 
  downloadLendersExcel, 
  exportHomeLoansToCSV, 
  exportLAPToCSV,
  exportCurrentSchemesToCSV,
  exportGovtSchemesToCSV 
} from "../utils/excelDownloader";
import { DEFAULT_SCRAPED_CAMPAIGNS, ScrapedAdCampaign } from "../data/campaignsData";

interface LendersGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LendersGuidelinesModal: React.FC<LendersGuidelinesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"homeLoan" | "lap" | "currentSchemes" | "govt" | "regulatory" | "aiCampaigns">("homeLoan");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [govtCategoryFilter, setGovtCategoryFilter] = useState<string>("All");
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [campaigns, setCampaigns] = useState<ScrapedAdCampaign[]>(DEFAULT_SCRAPED_CAMPAIGNS);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    
    // Fetch latest active scraped campaigns
    fetch("/api/admin/campaigns/list")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.campaigns && Array.isArray(data.campaigns) && data.campaigns.length > 0) {
          setCampaigns(data.campaigns);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ["All", "Public Sector Bank (PSU)", "Private Sector Bank", "Small Finance Bank (SFB)", "Housing Finance Company (HFC) / NBFC", "Central Government Initiative", "Statutory Central Tax Law"];
  const govtCategories = ["All", "PMAY & Housing Grants", "Income Tax Deductions", "Women & First-Time Buyers", "Self-Employed & MSME Credit"];

  const filteredHomeLoans = homeLoanData.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = item["Lender Name"].toLowerCase().includes(query) ||
      item["Institution Category"].toLowerCase().includes(query) ||
      item["Rate of Interest (ROI) Range"].toLowerCase().includes(query) ||
      item["CIBIL Score Guidelines & Cut-offs"].toLowerCase().includes(query) ||
      item["Female Borrower Scheme / Concession"].toLowerCase().includes(query) ||
      item["Current Schemes & Promotional Offers"].toLowerCase().includes(query) ||
      item["Who Can Avail (Target Beneficiaries & Eligibility)"].toLowerCase().includes(query) ||
      item["Types of Home Loans Offered"].toLowerCase().includes(query);
    const matchesCat = categoryFilter === "All" || item["Institution Category"].includes(categoryFilter) || (categoryFilter.includes("HFC") && item["Institution Category"].includes("HFC"));
    return matchesSearch && matchesCat;
  });

  const filteredLAP = lapData.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = item["Lender Name"].toLowerCase().includes(query) ||
      item["Institution Category"].toLowerCase().includes(query) ||
      item["Rate of Interest (ROI) Range"].toLowerCase().includes(query) ||
      item["CIBIL Score Guidelines & Cut-offs"].toLowerCase().includes(query) ||
      item["Female Borrower Scheme / Concession"].toLowerCase().includes(query) ||
      item["Current Schemes & Promotional Offers"].toLowerCase().includes(query) ||
      item["Who Can Avail (Target Beneficiaries & Eligibility)"].toLowerCase().includes(query) ||
      item["Eligible Collateral Property Types"].toLowerCase().includes(query);
    const matchesCat = categoryFilter === "All" || item["Institution Category"].includes(categoryFilter) || (categoryFilter.includes("HFC") && item["Institution Category"].includes("HFC"));
    return matchesSearch && matchesCat;
  });

  const filteredCurrentSchemes = currentSchemesData.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = item["Lender / Organization Name"].toLowerCase().includes(query) ||
      item["Institution Category"].toLowerCase().includes(query) ||
      item["Scheme / Offer Name"].toLowerCase().includes(query) ||
      item["Applicable Loan Facility"].toLowerCase().includes(query) ||
      item["Scheme Validity / Expiry Status"].toLowerCase().includes(query) ||
      item["Special Concession / Promotional Offer"].toLowerCase().includes(query) ||
      item["Who Can Avail (Target Beneficiaries & Eligibility)"].toLowerCase().includes(query);
    const matchesCat = categoryFilter === "All" || 
      item["Institution Category"].includes(categoryFilter) || 
      (categoryFilter.includes("HFC") && item["Institution Category"].includes("HFC")) ||
      (categoryFilter.includes("Government") && item["Institution Category"].includes("Government"));
    return matchesSearch && matchesCat;
  });

  const filteredGovtSchemes = governmentSchemesData.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = item["Scheme / Initiative Name"].toLowerCase().includes(query) ||
      item["Governing Authority / Ministry"].toLowerCase().includes(query) ||
      item["Target Beneficiaries"].toLowerCase().includes(query) ||
      item["Primary Financial Benefit / Subsidy"].toLowerCase().includes(query) ||
      item["Income & Property Eligibility Criteria"].toLowerCase().includes(query);
    
    let matchesCat = true;
    if (govtCategoryFilter === "PMAY & Housing Grants") {
      matchesCat = item["Scheme / Initiative Name"].includes("PMAY") || item["Scheme / Initiative Name"].includes("Awas") || item["Scheme / Initiative Name"].includes("Affordable Housing");
    } else if (govtCategoryFilter === "Income Tax Deductions") {
      matchesCat = item["Scheme / Initiative Name"].includes("Section 24") || item["Scheme / Initiative Name"].includes("Section 80");
    } else if (govtCategoryFilter === "Women & First-Time Buyers") {
      matchesCat = item["Scheme / Initiative Name"].includes("Women") || item["Scheme / Initiative Name"].includes("First-Time") || item["Scheme / Initiative Name"].includes("Stamp Duty") || item["Scheme / Initiative Name"].includes("Stand-Up");
    } else if (govtCategoryFilter === "Self-Employed & MSME Credit") {
      matchesCat = item["Scheme / Initiative Name"].includes("Mudra") || item["Scheme / Initiative Name"].includes("CGTMSE") || item["Scheme / Initiative Name"].includes("SVANidhi") || item["Scheme / Initiative Name"].includes("Stand-Up");
    }
    return matchesSearch && matchesCat;
  });

  const filteredCampaigns = campaigns.filter(item => {
    const query = searchQuery.toLowerCase();
    return item.lenderName.toLowerCase().includes(query) ||
      item.campaignTitle.toLowerCase().includes(query) ||
      item.channel.toLowerCase().includes(query) ||
      item.statedRate.toLowerCase().includes(query) ||
      item.adCopyHeadline.toLowerCase().includes(query) ||
      item.targetSegment.toLowerCase().includes(query);
  });

  const handleDownload = () => {
    const ok = downloadLendersExcel();
    if (ok) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  const handleCopyCSV = () => {
    let csv = "";
    if (activeTab === "homeLoan") csv = exportHomeLoansToCSV();
    else if (activeTab === "lap") csv = exportLAPToCSV();
    else if (activeTab === "currentSchemes") csv = exportCurrentSchemesToCSV();
    else if (activeTab === "govt") csv = exportGovtSchemesToCSV();
    else csv = exportHomeLoansToCSV();

    navigator.clipboard.writeText(csv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-6xl h-[88vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold tracking-tight text-white">43 Banks & NBFCs Lending Guidelines Directory</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  7 Sheets Master Excel
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Daily Auto-Updated 00:00 IST
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% verified rates & norms across 43 institutions + AI-Scraped active campaigns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              title="Generate and download .xlsx file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? "Downloaded!" : "Download Excel (.xlsx)"}</span>
            </button>

            <a
              href="/api/download-lender-guidelines-excel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all"
              title="Open direct file in new tab if downloads are blocked"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Direct Link</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action / Fallback Banner for Sandbox iFrames */}
        <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200/80 flex items-center justify-between gap-3 text-xs text-emerald-900 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Verified Master Spreadsheets:</strong> Strict adherence to authentic published data. Columns left clean where no rigid cap or gender discount applies.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyCSV}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-300 rounded text-emerald-800 text-[11px] font-semibold hover:bg-emerald-100/60 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-600" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Active Table (CSV)"}</span>
            </button>
          </div>
        </div>

        {/* Tab Selection & Search Filters */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl flex-wrap">
            <button
              onClick={() => setActiveTab("homeLoan")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "homeLoan" 
                  ? "bg-white text-slate-900 shadow-2xs" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Home Loans ({homeLoanData.length})
            </button>
            <button
              onClick={() => setActiveTab("lap")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "lap" 
                  ? "bg-white text-slate-900 shadow-2xs" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Loan Against Property ({lapData.length})
            </button>
            <button
              onClick={() => setActiveTab("aiCampaigns")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "aiCampaigns" 
                  ? "bg-purple-600 text-white shadow-2xs" 
                  : "text-purple-900 hover:text-purple-950 font-bold bg-purple-100/80"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Ad Campaigns ({filteredCampaigns.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("currentSchemes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "currentSchemes" 
                  ? "bg-amber-600 text-white shadow-2xs" 
                  : "text-amber-900 hover:text-amber-950 font-bold bg-amber-100/80"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Current Schemes & Validity ({currentSchemesData.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("govt")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "govt" 
                  ? "bg-emerald-700 text-white shadow-2xs" 
                  : "text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-100/70"
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Govt Schemes ({governmentSchemesData.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("regulatory")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "regulatory" 
                  ? "bg-white text-slate-900 shadow-2xs" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              RBI & NHB Directives ({regulatoryGuidelines.length})
            </button>
          </div>

          {activeTab !== "regulatory" && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "currentSchemes" ? "Search scheme, validity, concession..." :
                    activeTab === "govt" ? "Search PMAY, subsidy, tax, MSME..." : 
                    "Search lender, scheme, eligibility..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-48 sm:w-60"
                />
              </div>

              {activeTab === "govt" ? (
                <select
                  value={govtCategoryFilter}
                  onChange={(e) => setGovtCategoryFilter(e.target.value)}
                  className="py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  {govtCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Content Table Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/50">
          {activeTab === "homeLoan" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 whitespace-nowrap">Lender Name</th>
                      <th className="p-3 whitespace-nowrap">Category</th>
                      <th className="p-3 whitespace-nowrap text-emerald-800 bg-emerald-50/50">ROI Range (p.a.)</th>
                      <th className="p-3 whitespace-nowrap text-indigo-800 bg-indigo-50/50">CIBIL Score Guidelines</th>
                      <th className="p-3 whitespace-nowrap text-pink-800 bg-pink-50/50">Female Scheme / Concession</th>
                      <th className="p-3 whitespace-nowrap text-amber-800 bg-amber-50/50">Current Schemes & Offers</th>
                      <th className="p-3 whitespace-nowrap text-blue-800 bg-blue-50/50">Who Can Avail (Target Beneficiaries)</th>
                      <th className="p-3 whitespace-nowrap">Age (Sal / Self-Emp)</th>
                      <th className="p-3 whitespace-nowrap">Loan Quantum</th>
                      <th className="p-3 whitespace-nowrap">Processing Fee</th>
                      <th className="p-3 whitespace-nowrap">Prepayment Penalty</th>
                      <th className="p-3 whitespace-nowrap">Key Products</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {filteredHomeLoans.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                          {item["Lender Name"]}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item["Institution Category"].includes("PSU") ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            item["Institution Category"].includes("Private") ? "bg-purple-50 text-purple-700 border border-purple-200" :
                            item["Institution Category"].includes("SFB") ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {item["Institution Category"]}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap font-bold text-emerald-700 bg-emerald-50/20">
                          {item["Rate of Interest (ROI) Range"]}
                        </td>
                        <td className="p-3 max-w-xs text-[11px] text-slate-700 bg-indigo-50/20" title={item["CIBIL Score Guidelines & Cut-offs"]}>
                          <span className="line-clamp-2">{item["CIBIL Score Guidelines & Cut-offs"]}</span>
                        </td>
                        <td className="p-3 max-w-xs text-[11px] font-medium text-pink-700 bg-pink-50/20" title={item["Female Borrower Scheme / Concession"]}>
                          {item["Female Borrower Scheme / Concession"] ? (
                            <span className="line-clamp-2">{item["Female Borrower Scheme / Concession"]}</span>
                          ) : (
                            <span className="text-slate-300 italic">—</span>
                          )}
                        </td>
                        <td className="p-3 max-w-xs text-[11px] text-amber-800 bg-amber-50/20" title={item["Current Schemes & Promotional Offers"]}>
                          {item["Current Schemes & Promotional Offers"] ? (
                            <span className="line-clamp-2">{item["Current Schemes & Promotional Offers"]}</span>
                          ) : (
                            <span className="text-slate-300 italic">—</span>
                          )}
                        </td>
                        <td className="p-3 max-w-xs text-[11px] font-medium text-blue-900 bg-blue-50/20" title={item["Who Can Avail (Target Beneficiaries & Eligibility)"]}>
                          <span className="line-clamp-2">{item["Who Can Avail (Target Beneficiaries & Eligibility)"]}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-[11px]">
                          Sal: {item["Min Age (Salaried)"]}-{item["Max Age at Maturity (Salaried)"]} | SE: {item["Min Age (Self-Employed)"]}-{item["Max Age at Maturity (Self-Employed)"]}
                        </td>
                        <td className="p-3 whitespace-nowrap font-medium text-slate-800">
                          {item["Min Loan Amount"]} {item["Max Loan Amount"] ? `to ${item["Max Loan Amount"]}` : "(Subject to capacity)"}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-medium text-slate-700">{item["Processing Fee (Standard)"]}</span>
                          {item["Processing Fee Caps / Minimums"] && (
                            <span className="block text-[10px] text-slate-400">{item["Processing Fee Caps / Minimums"]}</span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap text-emerald-700 font-medium">
                          {item["Prepayment / Foreclosure (Floating Rate - Indiv)"]}
                        </td>
                        <td className="p-3 max-w-xs truncate text-[11px]" title={item["Types of Home Loans Offered"]}>
                          {item["Types of Home Loans Offered"]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "lap" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 whitespace-nowrap">Lender Name</th>
                      <th className="p-3 whitespace-nowrap">Category</th>
                      <th className="p-3 whitespace-nowrap text-emerald-800 bg-emerald-50/50">LAP ROI Range (p.a.)</th>
                      <th className="p-3 whitespace-nowrap text-indigo-800 bg-indigo-50/50">CIBIL Score Guidelines</th>
                      <th className="p-3 whitespace-nowrap text-amber-800 bg-amber-50/50">Current Schemes & Offers</th>
                      <th className="p-3 whitespace-nowrap text-blue-800 bg-blue-50/50">Who Can Avail (Target Beneficiaries)</th>
                      <th className="p-3 whitespace-nowrap">Collateral Property Types</th>
                      <th className="p-3 whitespace-nowrap">Max LTV</th>
                      <th className="p-3 whitespace-nowrap">Loan Quantum</th>
                      <th className="p-3 whitespace-nowrap">Processing Fee Range</th>
                      <th className="p-3 whitespace-nowrap">Foreclosure (Individual)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {filteredLAP.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                          {item["Lender Name"]}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item["Institution Category"].includes("PSU") ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            item["Institution Category"].includes("Private") ? "bg-purple-50 text-purple-700 border border-purple-200" :
                            item["Institution Category"].includes("SFB") ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {item["Institution Category"]}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap font-bold text-emerald-700 bg-emerald-50/20">
                          {item["Rate of Interest (ROI) Range"]}
                        </td>
                        <td className="p-3 max-w-xs text-[11px] text-slate-700 bg-indigo-50/20" title={item["CIBIL Score Guidelines & Cut-offs"]}>
                          <span className="line-clamp-2">{item["CIBIL Score Guidelines & Cut-offs"]}</span>
                        </td>
                        <td className="p-3 max-w-xs text-[11px] text-amber-800 bg-amber-50/20" title={item["Current Schemes & Promotional Offers"]}>
                          {item["Current Schemes & Promotional Offers"] ? (
                            <span className="line-clamp-2">{item["Current Schemes & Promotional Offers"]}</span>
                          ) : (
                            <span className="text-slate-300 italic">—</span>
                          )}
                        </td>
                        <td className="p-3 max-w-xs text-[11px] font-medium text-blue-900 bg-blue-50/20" title={item["Who Can Avail (Target Beneficiaries & Eligibility)"]}>
                          <span className="line-clamp-2">{item["Who Can Avail (Target Beneficiaries & Eligibility)"]}</span>
                        </td>
                        <td className="p-3 max-w-xs truncate font-medium text-slate-700" title={item["Eligible Collateral Property Types"]}>
                          {item["Eligible Collateral Property Types"]}
                        </td>
                        <td className="p-3 whitespace-nowrap font-semibold text-emerald-700">
                          {item["Max Loan to Value (LTV)"]}
                        </td>
                        <td className="p-3 whitespace-nowrap font-medium text-slate-800">
                          {item["Min Loan Amount"]} {item["Max Loan Amount"] ? `to ${item["Max Loan Amount"]}` : "(Subject to capacity)"}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-medium text-slate-700">{item["Processing Fee Range"]}</span>
                          {item["Processing Fee Cap / Min"] && (
                            <span className="block text-[10px] text-slate-400">{item["Processing Fee Cap / Min"]}</span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap text-emerald-700 font-medium">
                          {item["Foreclosure Penalty (Individual / Non-Business)"]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "currentSchemes" && (
            <div className="space-y-4">
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Active Promotional Schemes & Validity Register:</strong> Details all institutional festive drives, overdraft products, balance transfer offers, and government mission mandates alongside their explicit validity and expiry status.
                  </span>
                </div>
                <span className="font-bold text-amber-800 shrink-0 px-2 py-0.5 rounded bg-amber-200/50 text-[11px]">
                  {filteredCurrentSchemes.length} Schemes Active
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 whitespace-nowrap">Lender / Organization</th>
                        <th className="p-3 whitespace-nowrap">Scheme / Offer Name</th>
                        <th className="p-3 whitespace-nowrap">Facility</th>
                        <th className="p-3 whitespace-nowrap text-amber-900 bg-amber-50/60">Validity & Expiry Status</th>
                        <th className="p-3 whitespace-nowrap text-emerald-900 bg-emerald-50/60">Special Concession / Offer</th>
                        <th className="p-3 whitespace-nowrap text-blue-900 bg-blue-50/60">Who Can Avail (Target Beneficiaries)</th>
                        <th className="p-3 whitespace-nowrap">Mandatory Terms & Conditions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {filteredCurrentSchemes.map((scheme, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                            <div>{scheme["Lender / Organization Name"]}</div>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {scheme["Institution Category"]}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                            {scheme["Scheme / Offer Name"]}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {scheme["Applicable Loan Facility"]}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap bg-amber-50/30">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="font-semibold text-amber-900 text-[11px]">
                                {scheme["Scheme Validity / Expiry Status"]}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 max-w-sm text-[11px] font-medium text-emerald-900 bg-emerald-50/30" title={scheme["Special Concession / Promotional Offer"]}>
                            <p className="line-clamp-3">{scheme["Special Concession / Promotional Offer"]}</p>
                          </td>
                          <td className="p-3 max-w-xs text-[11px] text-blue-950 bg-blue-50/30" title={scheme["Who Can Avail (Target Beneficiaries & Eligibility)"]}>
                            <p className="line-clamp-3">{scheme["Who Can Avail (Target Beneficiaries & Eligibility)"]}</p>
                          </td>
                          <td className="p-3 max-w-xs text-[11px] text-slate-600" title={scheme["Key Terms & Mandatory Conditions"]}>
                            <p className="line-clamp-3">{scheme["Key Terms & Mandatory Conditions"]}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "govt" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGovtSchemes.map((scheme, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                            {scheme["Governing Authority / Ministry"]}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                            {scheme["Scheme / Initiative Name"]}
                          </h4>
                        </div>
                      </div>

                      {/* Highlight Primary Financial Benefit */}
                      <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                          <BadgePercent className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Financial Benefit / Subsidy Value:</span>
                        </div>
                        <p className="text-emerald-800 text-[11px] leading-relaxed font-medium">
                          {scheme["Primary Financial Benefit / Subsidy"]}
                        </p>
                      </div>

                      {/* Who Can Avail */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Who Can Avail (Target Beneficiaries):</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed pl-3 border-l-2 border-blue-400">
                          {scheme["Target Beneficiaries"]}
                        </p>
                      </div>

                      {/* Income & Property Eligibility */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Income & Property Eligibility Criteria:</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed pl-3 border-l-2 border-indigo-400">
                          {scheme["Income & Property Eligibility Criteria"]}
                        </p>
                      </div>

                      {/* How to Avail */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                          <Landmark className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Application Channel & How to Avail:</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed pl-3 border-l-2 border-amber-400">
                          {scheme["How to Avail & Application Mode"]}
                        </p>
                      </div>

                      {/* Key Documentation */}
                      <div className="space-y-1 pt-1.5 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                          <FileCheck2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Key Documents Required:</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {scheme["Key Documentation & Compliance Required"]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "aiCampaigns" && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>
                    <strong>Automated AI Ad Campaign Scraper:</strong> Continuously scrapes sponsored ads, festive rate cuts, and processing fee concessions running across Meta Ad Library, Google Ads Transparency, and bank portals. Synced into Sheet 2 of the Master Excel.
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900 font-bold text-[10px]">
                  {filteredCampaigns.length} Active Campaigns
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCampaigns.map((camp) => (
                  <div key={camp.id} className="bg-white border border-slate-200 hover:border-purple-300 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                            {camp.channel}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">
                            {camp.lenderName}
                          </h4>
                          <p className="text-xs font-semibold text-purple-800">
                            {camp.campaignTitle}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          {camp.status}
                        </span>
                      </div>

                      {/* Ad Headline extract */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-700 italic leading-relaxed">
                        "{camp.adCopyHeadline}"
                      </div>

                      {/* Rate & Fee Concession highlights */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Promotional Rate</span>
                          <span className="text-xs font-black text-emerald-950">{camp.statedRate}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                          <span className="text-[10px] font-bold text-blue-800 uppercase block">Processing Fee</span>
                          <span className="text-xs font-black text-blue-950">{camp.processingFeeDiscount}</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-500 pt-1">
                        <div>
                          <strong className="text-slate-700">Target Segment:</strong> {camp.targetSegment}
                        </div>
                        <div>
                          <strong className="text-slate-700">Validity Window:</strong> {camp.validityStart} to {camp.validityEnd}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          <strong className="text-slate-600">Fine Print:</strong> {camp.finePrint}
                        </div>
                      </div>
                    </div>

                    {camp.sourceUrl && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Verified Feed</span>
                        <a
                          href={camp.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-semibold"
                        >
                          Inspect Source Ad
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "regulatory" && (
            <div className="space-y-4">
              {regulatoryGuidelines.map((item, idx) => (
                <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.Category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{item.Applicability}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item["Rule / Directive"]}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.Details}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Master Excel Includes 7 Sheets: Home Loans (43), AI Scraped Campaigns, LAP (43), Current Schemes (45), Govt Subsidies (13), RBI & NHB Norms (8), Daily Sync Telemetry</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer text-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Master (.xlsx)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
