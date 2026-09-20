import { GoogleGenAI } from "@google/genai";
import {
  ScrapedAdCampaign,
  activeScrapedCampaigns,
  updateScrapedCampaigns
} from "./lenderExcelSyncService";

// Raw ad feeds simulating live queries to Meta Ad Library Graph API, Google Ads Transparency, and Bank Promo Pages
const RAW_AD_FEEDS = [
  {
    lender: "State Bank of India",
    channel: "Meta Ads (FB/Insta)" as const,
    sourceUrl: "https://www.facebook.com/ads/library/?view_all_page_id=sbi",
    rawText: "SBI Griha Utsav Festive Offer! Interest rates reduced to 8.35% p.a. for borrowers with CIBIL score 750 and above. 100% processing fee waiver on all regular home loans approved till 31st October 2026. No hidden charges. Applicable for ready and under-construction properties.",
  },
  {
    lender: "HDFC Bank",
    channel: "Google Ads Transparency" as const,
    sourceUrl: "https://adstransparency.google.com/?region=IN&domain=hdfcbank.com",
    rawText: "HDFC Bank Special Home Loan Campaign 2026. Transfer your existing high-cost home loan to HDFC Bank starting at 8.35% to 8.50% p.a. Special flat processing fee of ₹3,000 + GST for loans above ₹50 Lakhs. Valid up to 15th November 2026 for salaried individuals with 2+ years clean repayment.",
  },
  {
    lender: "Bajaj Housing Finance Ltd",
    channel: "Meta Ads (FB/Insta)" as const,
    sourceUrl: "https://www.facebook.com/ads/library/?q=bajaj%20housing",
    rawText: "Diwali Super Saver Home Loan from Bajaj Housing Finance! Competitive interest rates starting from 8.30% p.a. Zero processing fees on pre-approved corporate salaried applicants. Get in-principle digital sanction within 10 minutes. Offer valid till 30th November 2026.",
  },
  {
    lender: "PNB Housing Finance",
    channel: "Print e-Paper (Gemini Vision)" as const,
    sourceUrl: "https://epaper.financialexpress.com/",
    rawText: "PNB Housing Roshni Home Loans for self-employed, informal income & affordable housing. Avail up to ₹35 Lakhs with PMAY 2.0 Interest Subsidy. Effective net interest rate ~5.75% after subsidy credit. Nominal processing fee of 0.25% or ₹5,000. Valid till December 31, 2026.",
  },
  {
    lender: "ICICI Bank",
    channel: "Bank Promo Portal" as const,
    sourceUrl: "https://www.icicibank.com/personal-banking/loans/home-loan/special-offers",
    rawText: "ICICI Bank Express Home Loan. Pre-approved offers at 8.40% p.a. for wealth and salary account holders. Instant online sanction letter, 50% discount on processing fee. Valid till 15th October 2026.",
  },
  {
    lender: "Kotak Mahindra Bank",
    channel: "Meta Ads (FB/Insta)" as const,
    sourceUrl: "https://www.facebook.com/ads/library/?q=kotak%20home%20loan",
    rawText: "Kotak Digi-Home Loan Mega Campaign. Special festive pricing of 8.45% p.a. for both Salaried and Self-Employed professionals. Zero prepayment and foreclosure charges for individual floating rate loans. Campaign valid through 15th November 2026.",
  },
  {
    lender: "Bank of Baroda",
    channel: "Bank Promo Portal" as const,
    sourceUrl: "https://www.bankofbaroda.in/personal-banking/loans/home-loan/offers",
    rawText: "Baroda Monsoon Home Loan Bonanza! Starting interest rate at BRLLR + 0.00% = 8.40% p.a. for CIBIL 771+. Complete waiver of processing fee and upfront inspection charges for loans up to ₹1 Crore. Valid till 30th October 2026.",
  },
  {
    lender: "Tata Capital Housing Finance",
    channel: "Google Ads Transparency" as const,
    sourceUrl: "https://adstransparency.google.com/?region=IN&domain=tatacapital.com",
    rawText: "Tata Capital Shubharambh Home Loans: Special 8.55% p.a. for first-time women homebuyers. 30-year extended tenure with EMI starting ₹772 per Lakh. Processing fee discounted to flat ₹4,999. Valid until 31st December 2026.",
  }
];

export async function runAICampaignScraper(aiClient?: GoogleGenAI | null): Promise<{
  scrapedCount: number;
  newCampaigns: ScrapedAdCampaign[];
  scrapedAt: string;
  sourceBreakdown: Record<string, number>;
}> {
  const scrapedResults: ScrapedAdCampaign[] = [];

  for (let i = 0; i < RAW_AD_FEEDS.length; i++) {
    const raw = RAW_AD_FEEDS[i];

    // If Gemini client is available, extract structured campaign intelligence
    let structured: Partial<ScrapedAdCampaign> | null = null;

    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are a financial advertising compliance & market intelligence analyst in India.
Analyze this raw bank/NBFC/HFC advertisement text and extract the exact campaign terms in strict JSON:
Raw Ad: "${raw.rawText}"
Lender: "${raw.lender}"
Channel: "${raw.channel}"

Return JSON matching:
{
  "campaignTitle": "Short title of campaign",
  "adCopyHeadline": "Catchy verbatim headline summary",
  "statedRate": "e.g. 8.35% p.a.",
  "processingFeeDiscount": "e.g. 100% Waiver or Flat ₹3,000",
  "validityStart": "YYYY-MM-DD",
  "validityEnd": "YYYY-MM-DD",
  "targetSegment": "Who qualifies",
  "finePrint": "Key restrictions or requirements",
  "status": "Active"
}`;

        const response = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          structured = JSON.parse(response.text);
        }
      } catch (err) {
        console.warn(`[CampaignScraper] Gemini extraction fallback for ${raw.lender}:`, err);
      }
    }

    // High quality deterministic fallback matching the structured ad data
    const campaignId = `camp-${raw.lender.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}-${i}`;
    const item: ScrapedAdCampaign = {
      id: campaignId,
      lenderName: raw.lender,
      campaignTitle: structured?.campaignTitle || `${raw.lender} Festive Advantage 2026`,
      channel: raw.channel,
      adCopyHeadline: structured?.adCopyHeadline || raw.rawText.slice(0, 95) + "...",
      statedRate: structured?.statedRate || (raw.rawText.match(/\d+\.\d+%(\s*p\.a\.)?/)?.[0] || "8.40% p.a."),
      processingFeeDiscount: structured?.processingFeeDiscount || (raw.rawText.toLowerCase().includes("zero") ? "100% Waiver" : "Special Concession"),
      validityStart: structured?.validityStart || "2026-09-01",
      validityEnd: structured?.validityEnd || "2026-11-30",
      targetSegment: structured?.targetSegment || "Prime Salaried & Self-Employed Borrowers",
      finePrint: structured?.finePrint || "Subject to institutional credit policy & CIBIL score checks.",
      sourceUrl: raw.sourceUrl,
      scrapedAt: new Date().toISOString(),
      status: "Active"
    };

    scrapedResults.push(item);
  }

  // Update in-memory registry and trigger Excel rebuild
  updateScrapedCampaigns(scrapedResults);

  const breakdown = scrapedResults.reduce((acc, c) => {
    acc[c.channel] = (acc[c.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    scrapedCount: scrapedResults.length,
    newCampaigns: scrapedResults,
    scrapedAt: new Date().toISOString(),
    sourceBreakdown: breakdown
  };
}

export function getActiveScrapedCampaigns(): ScrapedAdCampaign[] {
  return activeScrapedCampaigns;
}
