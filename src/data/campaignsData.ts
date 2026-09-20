export interface ScrapedAdCampaign {
  id: string;
  lenderName: string;
  campaignTitle: string;
  channel: "Meta Ads (FB/Insta)" | "Google Ads Transparency" | "Bank Promo Portal" | "Print e-Paper (Gemini Vision)";
  adCopyHeadline: string;
  statedRate: string;
  processingFeeDiscount: string;
  validityStart: string;
  validityEnd: string;
  targetSegment: string;
  finePrint: string;
  sourceUrl?: string;
  scrapedAt: string;
  status: "Active" | "Expiring Soon" | "Verified";
}

export const DEFAULT_SCRAPED_CAMPAIGNS: ScrapedAdCampaign[] = [
  {
    id: "camp-sbi-griha-utsav",
    lenderName: "State Bank of India (SBI)",
    campaignTitle: "SBI Griha Utsav Festive Bonanza",
    channel: "Meta Ads (FB/Insta)",
    adCopyHeadline: "Celebrate Diwali with SBI Griha Utsav! Special Home Loan rates starting 8.35% with 100% processing fee waiver.",
    statedRate: "8.35% - 8.65% p.a.",
    processingFeeDiscount: "100% Processing Fee Waiver",
    validityStart: "2026-09-01",
    validityEnd: "2026-10-31",
    targetSegment: "Salaried & Professionals with CIBIL >= 750",
    finePrint: "Special concession applicable on card rate for loans with credit score 750+. Waiver covers regular processing charges; property title and valuation fees apply at actuals.",
    sourceUrl: "https://www.facebook.com/ads/library/?view_all_page_id=sbi",
    scrapedAt: "2026-09-20T00:05:00Z",
    status: "Active"
  },
  {
    id: "camp-hdfc-balance-transfer",
    lenderName: "HDFC Bank",
    campaignTitle: "HDFC Festive Balance Transfer Express",
    channel: "Google Ads Transparency",
    adCopyHeadline: "Switch your high-EMI home loan to HDFC Bank starting at 8.35% p.a. Flat ₹3,000 processing fee!",
    statedRate: "8.35% - 8.50% p.a.",
    processingFeeDiscount: "Flat ₹3,000 + GST (Reduced from standard 0.50%)",
    validityStart: "2026-09-10",
    validityEnd: "2026-11-15",
    targetSegment: "Salaried borrowers transferring loan balance > ₹50 Lakhs",
    finePrint: "Valid for balance transfers with at least 12 on-time EMIs in the track record. Top-up home loan available at same preferential rate.",
    sourceUrl: "https://adstransparency.google.com/?region=IN&domain=hdfcbank.com",
    scrapedAt: "2026-09-20T00:05:00Z",
    status: "Active"
  },
  {
    id: "camp-bajaj-diwali-super",
    lenderName: "Bajaj Housing Finance Ltd",
    campaignTitle: "Bajaj Super Saver Festive Home Loan",
    channel: "Meta Ads (FB/Insta)",
    adCopyHeadline: "Own your dream home sooner with Bajaj Housing Finance! Rates starting 8.30% p.a. + Zero processing fee for corporate salaried.",
    statedRate: "8.30% - 8.55% p.a.",
    processingFeeDiscount: "Zero Processing Fee (Select Corporate Category)",
    validityStart: "2026-09-15",
    validityEnd: "2026-11-30",
    targetSegment: "Corporate Salaried employees (Cat A & B employers)",
    finePrint: "Applicable on digital applications initiated via official portal. In-principle digital sanction within 10 minutes.",
    sourceUrl: "https://www.facebook.com/ads/library/?q=bajaj%20housing",
    scrapedAt: "2026-09-20T00:05:00Z",
    status: "Active"
  },
  {
    id: "camp-pnbhfl-roshni",
    lenderName: "PNB Housing Finance",
    campaignTitle: "PNB Housing Roshni Affordable Housing Scheme",
    channel: "Print e-Paper (Gemini Vision)",
    adCopyHeadline: "Apna Ghar, Apna Haq: PNB Housing Roshni Home Loans with PMAY 2.0 Interest Subsidy Benefit up to ₹35 Lakhs.",
    statedRate: "8.75% - 9.25% p.a. (Effective ~5.75% after PMAY subsidy)",
    processingFeeDiscount: "50% Discount (Capped at ₹5,000)",
    validityStart: "2026-08-01",
    validityEnd: "2026-12-31",
    targetSegment: "Informal income earners, self-employed & first-time buyers",
    finePrint: "Subject to central ministry PMAY-U 2.0 beneficiary eligibility and valid Aadhaar seeding. Covers loans in Tier 2/3/4 towns.",
    sourceUrl: "https://epaper.financialexpress.com/",
    scrapedAt: "2026-09-20T00:05:00Z",
    status: "Active"
  },
  {
    id: "camp-bob-monsoon",
    lenderName: "Bank of Baroda",
    campaignTitle: "Baroda Home Loan Monsoon Bonanza",
    channel: "Bank Promo Portal",
    adCopyHeadline: "Zero processing fee on home loans! Starting at BRLLR (8.40% p.a.) for prime credit scores.",
    statedRate: "8.40% - 8.90% p.a.",
    processingFeeDiscount: "100% Waiver of Processing Fee & Valuation Charges",
    validityStart: "2026-09-01",
    validityEnd: "2026-10-30",
    targetSegment: "Salaried and Self-employed with CIBIL >= 771",
    finePrint: "Applicable on takeover of existing home loans and new purchases. NIL prepayment charges on floating rate options.",
    sourceUrl: "https://www.bankofbaroda.in/personal-banking/loans/home-loan/offers",
    scrapedAt: "2026-09-20T00:05:00Z",
    status: "Active"
  },
  {
    id: "camp-icici-express",
    lenderName: "ICICI Bank",
    campaignTitle: "ICICI Bank Express Home Loan Instant Sanction",
    channel: "Bank Promo Portal",
    adCopyHeadline: "Pre-approved home loans for salary account holders at 8.40% p.a. Get your instant digital sanction letter in 5 clicks.",
    statedRate: "8.40% - 8.85% p.a.",
    processingFeeDiscount: "50% Concession on Processing Fee",
    validityStart: "2026-09-05",
    validityEnd: "2026-10-15",
    targetSegment: "ICICI Bank Salary & Wealth Account Holders",
    finePrint: "Pre-approved limit calculated based on automated banking transaction flow. Final sanction subject to property legal & technical verification.",
    sourceUrl: "https://www.icicibank.com/personal-banking/loans/home-loan/special-offers",
    scrapedAt: "2026-09-20T00:05:00Z",
    status: "Expiring Soon"
  },
  {
    id: "camp-tata-shubharambh",
    lenderName: "Tata Capital Housing Finance",
    campaignTitle: "Tata Capital Shubharambh First Home Campaign",
    channel: "Google Ads Transparency",
    adCopyHeadline: "Celebrate your first home with Tata Capital. Special 8.55% p.a. for women co-applicants with EMI starting ₹772/Lakh.",
    statedRate: "8.55% - 9.10% p.a.",
    processingFeeDiscount: "Flat ₹4,999 Special Processing Fee",
    validityStart: "2026-09-01",
    validityEnd: "2026-12-31",
    targetSegment: "First-time buyers with women primary or co-applicant",
    finePrint: "Tenure up to 30 years. Complimentary property legal vetting on registered developer projects.",
    sourceUrl: "https://adstransparency.google.com/?region=IN&domain=tatacapital.com",
    scrapedAt: "2026-09-20T00:05:00Z",
    status: "Active"
  }
];
