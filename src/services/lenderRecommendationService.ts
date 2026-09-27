import {
  homeLoanData,
  lapData,
  currentSchemesData,
  HomeLoanGuideline,
  LAPGuideline,
  CurrentSchemeGuideline
} from '../data/lendersData';

export type LenderCategoryGroup = 'All' | 'PSU Banks' | 'Private Banks' | 'HFCs & NBFCs' | 'Small Finance Banks';

export interface EnrichedLenderOffer {
  id: string;
  name: string;
  shortName: string;
  category: string;
  categoryGroup: LenderCategoryGroup;
  baseRateNum: number;
  rate: string;
  rawRateRange: string;
  estEMI: number;
  features: string[];
  processingTime: string;
  processingFee: string;
  processingFeeCaps: string;
  /** @deprecated No longer generated. Kept only for backwards compatibility. */
  score?: number;
  /** @deprecated No longer generated. Kept only for backwards compatibility. */
  finalScore?: number;
  /** @deprecated No longer generated. Kept only for backwards compatibility. */
  probability?: 'Very High' | 'High' | 'Moderate' | 'Low';
  rateType: 'Indicative lender range';
  totalRepayment: number;
  totalInterest: number;
  matchFactors: string[];
  fitStatus: 'Within stated criteria' | 'Review required' | 'Outside stated criteria';
  femaleConcession: string;
  hasFemaleConcession: boolean;
  cibilGuidelines: string;
  targetBeneficiaries: string;
  currentScheme: string;
  hasOverdraft: boolean;
  minAgeSalaried: number;
  maxAgeMaturitySalaried: number;
  minAgeSelfEmployed: number;
  maxAgeMaturitySelfEmployed: number;
  minLoanAmountText: string;
  maxLoanAmountText: string;
  minLoanAmountNum: number;
  maxLoanAmountNum: number;
  prepaymentTerms: string;
  penalCharges: string;
  typesOffered: string;
  kycDocs: string;
  incomeDocsSalaried: string;
  incomeDocsSelfEmployed: string;
  propertyDocs: string;
  matchReasons: string[];
  cautionPoints: string[];
  isSalaryBankMatch: boolean;
  loanType: 'Home Loan' | 'Loan Against Property (LAP)';
}

// Map institutional categories to filter groups
export function mapCategoryToGroup(cat: string): LenderCategoryGroup {
  const c = cat.toLowerCase();
  if (c.includes('public') || c.includes('psu')) return 'PSU Banks';
  if (c.includes('small finance') || c.includes('sfb')) return 'Small Finance Banks';
  if (c.includes('housing finance') || c.includes('hfc') || c.includes('nbfc') || c.includes('affordable')) return 'HFCs & NBFCs';
  if (c.includes('private')) return 'Private Banks';
  return 'Private Banks';
}

// Helper to extract a short friendly name from lender name string
export function getShortLenderName(fullName: string): string {
  if (fullName.includes('(') && fullName.includes(')')) {
    const match = fullName.match(/\(([^)]+)\)/);
    if (match && match[1] && match[1].length <= 10) return match[1];
  }
  return fullName
    .replace(' Ltd', '')
    .replace(' Limited', '')
    .replace(' Housing Finance', ' Housing')
    .replace(' Company', '');
}

// Extract base minimum numeric rate from ROI string like "8.50% - 9.65% p.a."
export function parseBaseInterestRate(roiStr: string): number {
  if (!roiStr) return 8.50;
  const match = roiStr.match(/(\d+(\.\d+)?)\s*%/);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    if (val >= 6.0 && val <= 22.0) return val;
  }
  return 8.50;
}

// Parse minimum and maximum loan limits from text
export function parseLoanLimits(minText: string, maxText: string): { min: number; max: number } {
  let min = 100000;
  let max = 100000000;

  if (minText) {
    const lMin = minText.toLowerCase();
    if (lMin.includes('50,000') || lMin.includes('50 thousand')) min = 50000;
    else if (lMin.includes('1 lakh') || lMin.includes('1,00,000')) min = 100000;
    else if (lMin.includes('3 lakh') || lMin.includes('3,00,000')) min = 300000;
    else if (lMin.includes('5 lakh') || lMin.includes('5,00,000')) min = 500000;
    else if (lMin.includes('10 lakh') || lMin.includes('10,00,000')) min = 1000000;
    else if (lMin.includes('25 lakh') || lMin.includes('25,00,000')) min = 2500000;
    else if (lMin.includes('35 lakh') || lMin.includes('35,00,000')) min = 3500000;
  }

  if (maxText) {
    const lMax = maxText.toLowerCase();
    if (lMax.includes('no upper limit') || lMax.includes('no cap') || lMax.includes('as per eligibility')) max = 1000000000; // 100 Cr
    else if (lMax.includes('100 cr')) max = 1000000000;
    else if (lMax.includes('50 cr')) max = 500000000;
    else if (lMax.includes('20 cr')) max = 200000000;
    else if (lMax.includes('10 cr')) max = 100000000;
    else if (lMax.includes('5 cr')) max = 50000000;
    else if (lMax.includes('3 cr')) max = 30000000;
    else if (lMax.includes('1 cr') || lMax.includes('100 lakh')) max = 10000000;
    else if (lMax.includes('50 lakh')) max = 5000000;
    else if (lMax.includes('35 lakh')) max = 3500000;
  }

  return { min, max };
}

// Generate intelligent feature tags from guideline data
export function extractLenderFeatures(
  lender: HomeLoanGuideline | LAPGuideline,
  schemeMatch?: CurrentSchemeGuideline
): string[] {
  const feats: string[] = [];
  const feeStr = String(
    lender['Processing Fee (Standard)'] ||
    (lender as any)['Processing Fee Range'] ||
    ''
  ).trim();
  const femaleStr = String(lender['Female Borrower Scheme / Concession'] || '').trim();
  const catStr = String(lender['Institution Category'] || '').trim();

  if (feeStr) feats.push('Processing fee disclosed');
  if (femaleStr) feats.push('Female-borrower terms disclosed');
  if (/psu|public/i.test(catStr)) feats.push('Public-sector lender');
  if (/private/i.test(catStr)) feats.push('Private-sector lender');
  if (/housing finance|hfc|nbfc|affordable/i.test(catStr)) feats.push('Housing finance / NBFC');
  if (/small finance|sfb/i.test(catStr)) feats.push('Small finance bank');

  if (schemeMatch && schemeMatch['Scheme / Offer Name']) {
    feats.push('Scheme: ' + String(schemeMatch['Scheme / Offer Name']).trim().slice(0, 40));
  }

  return Array.from(new Set(feats)).slice(0, 5);
}

// Export list of all 43+ lender names directly derived from datasets
export const ALL_INDIAN_LENDERS: string[] = Array.from(
  new Set([
    ...homeLoanData.map(l => l['Lender Name']),
    ...lapData.map(l => l['Lender Name'])
  ])
).sort((a, b) => a.localeCompare(b));

// Core Recommendation Algorithm taking applicant form data and matching against all 43+ lenders
/**
 * Transparent offer comparison.
 *
 * Product rules:
 * - Rates are read directly from the lender dataset.
 * - ParrotMoney never adds CIBIL/LTV/gender/default "loaders" to a lender rate.
 * - No approval probability, lender rating, hidden score, or synthetic processing time is generated.
 * - Explanations are based only on submitted inputs and fields present in the dataset.
 *
 * algorithmParams remains in the signature so existing callers do not break.
 * The legacy scoring parameters are intentionally ignored.
 */
export function compute43LenderRecommendations(
  formData: any,
  _algorithmParams: {
    cibilThreshold: number;
    cibilPenalty: number;
    maxFoirRatio: number;
    maxAgeLimit: number;
    agePenalty: number;
    maxLtvRatio: number;
    salaryMatchBonus: number;
    coBorrowerMultiplier: number;
  },
  sortBy: 'highest_match' | 'lowest_rate' | 'fastest_time' | 'lowest_fee' = 'highest_match'
): EnrichedLenderOffer[] {
  const isLAP =
    formData.loanPurpose === 'Loan Against Property (LAP)' ||
    formData.propertyType === 'Commercial' ||
    formData.propertyType === 'Plot / Land Only';

  const dataset = isLAP ? lapData : homeLoanData;
  const loanType: 'Home Loan' | 'Loan Against Property (LAP)' =
    isLAP ? 'Loan Against Property (LAP)' : 'Home Loan';

  const loanAmount = Number(formData.loanAmount) || 0;
  const propertyValue = Number(formData.propertyValue) || 0;
  const tenureYears = Number(formData.tenure) || 0;
  const applicantAge = Number(formData.age) || 0;
  const occupation = String(formData.occupation || 'Salaried');
  const salaryBank = String(formData.bankAccount || '').trim().toLowerCase();

  const parseAmount = (text: string): number | null => {
    if (!text) return null;
    const normalized = text.toLowerCase().replace(/,/g, '');
    if (/no upper limit|no cap|as per eligibility/.test(normalized)) return Number.MAX_SAFE_INTEGER;
    const crore = normalized.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore)/);
    if (crore) return Number(crore[1]) * 10000000;
    const lakh = normalized.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/);
    if (lakh) return Number(lakh[1]) * 100000;
    const thousand = normalized.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k)\b/);
    if (thousand) return Number(thousand[1]) * 1000;
    const plain = normalized.match(/(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)/);
    return plain ? Number(plain[1]) : null;
  };

  const parseLimits = (minText: string, maxText: string) => ({
    min: parseAmount(minText) ?? 0,
    max: parseAmount(maxText) ?? Number.MAX_SAFE_INTEGER
  });

  const calculateEmi = (principal: number, annualRate: number, years: number) => {
    if (!principal || !annualRate || !years) return 0;
    const months = Math.max(1, Math.round(years * 12));
    const monthlyRate = annualRate / 100 / 12;
    const factor = Math.pow(1 + monthlyRate, months);
    return Math.round((principal * monthlyRate * factor) / (factor - 1));
  };

  const results: EnrichedLenderOffer[] = dataset.map((lenderRecord, index) => {
    const lenderName = String(lenderRecord['Lender Name'] || 'Lender');
    const shortName = getShortLenderName(lenderName);
    const category = String(lenderRecord['Institution Category'] || 'Lender');
    const categoryGroup = mapCategoryToGroup(category);

    const schemeMatch = currentSchemesData.find((scheme) => {
      const schemeName = String(scheme['Lender / Organization Name'] || '').toLowerCase();
      return (
        (shortName && schemeName.includes(shortName.toLowerCase())) ||
        lenderName.toLowerCase().includes(schemeName)
      );
    });

    const rawRoi = String(lenderRecord['Rate of Interest (ROI) Range'] || '').trim();
    const rateNum = parseBaseInterestRate(rawRoi);
    const emi = calculateEmi(loanAmount, rateNum, tenureYears);
    const months = tenureYears ? Math.round(tenureYears * 12) : 0;
    const totalRepayment = emi && months ? emi * months : 0;
    const totalInterest = totalRepayment ? Math.max(0, totalRepayment - loanAmount) : 0;

    const minLoanText = String((lenderRecord as any)['Min Loan Amount'] || '').trim();
    const maxLoanText = String((lenderRecord as any)['Max Loan Amount'] || '').trim();
    const limits = parseLimits(minLoanText, maxLoanText);

    const minAgeSal = Number.parseInt(String((lenderRecord as any)['Min Age (Salaried)'] || ''), 10);
    const maxAgeSal = Number.parseInt(String((lenderRecord as any)['Max Age at Maturity (Salaried)'] || ''), 10);
    const minAgeSelf = Number.parseInt(String((lenderRecord as any)['Min Age (Self-Employed)'] || ''), 10);
    const maxAgeSelf = Number.parseInt(String((lenderRecord as any)['Max Age at Maturity (Self-Employed)'] || ''), 10);

    const minAge = occupation === 'Salaried' ? minAgeSal : minAgeSelf;
    const maxAge = occupation === 'Salaried' ? maxAgeSal : maxAgeSelf;

    const matchReasons: string[] = [];
    const cautionPoints: string[] = [];
    const matchFactors: string[] = [];

    if (rawRoi) matchReasons.push('Lender rate range is available for comparison.');

    const isSalaryBankMatch = Boolean(
      salaryBank &&
      (
        lenderName.toLowerCase().includes(salaryBank) ||
        salaryBank.includes(lenderName.toLowerCase()) ||
        shortName.toLowerCase().includes(salaryBank) ||
        salaryBank.includes(shortName.toLowerCase())
      )
    );
    if (isSalaryBankMatch) {
      matchFactors.push(
        'Your existing ' + shortName +
        ' relationship may be relevant; confirm any relationship pricing directly with the lender.'
      );
    }

    if (loanAmount > 0 && (limits.min > 0 || limits.max < Number.MAX_SAFE_INTEGER)) {
      if (loanAmount < limits.min) {
        cautionPoints.push('Requested loan amount is below the stated minimum of ' + (minLoanText || 'the lender range') + '.');
      } else if (loanAmount > limits.max) {
        cautionPoints.push('Requested loan amount is above the stated maximum of ' + (maxLoanText || 'the lender range') + '.');
      } else {
        matchFactors.push('Requested loan amount is within the stated lender range.');
      }
    }

    if (applicantAge > 0 && minAge > 0) {
      if (applicantAge < minAge) {
        cautionPoints.push('Applicant age is below the stated minimum of ' + minAge + ' years.');
      } else {
        matchFactors.push('Applicant age is within the stated minimum age.');
      }
    }

    if (applicantAge > 0 && tenureYears > 0 && maxAge > 0 &&
        applicantAge + tenureYears > maxAge) {
      cautionPoints.push(
        'Requested tenure would take maturity beyond the stated maximum age of ' + maxAge + ' years.'
      );
    }

    if (propertyValue > 0 && loanAmount > 0) {
      const ltv = (loanAmount / propertyValue) * 100;
      matchFactors.push(
        'Illustrative LTV is ' + ltv.toFixed(1) +
        '%; confirm the lender’s applicable LTV policy.'
      );
    }

    const cibilTerms = String(lenderRecord['CIBIL Score Guidelines & Cut-offs'] || '').trim();
    const targetBeneficiaries = String(
      lenderRecord['Who Can Avail (Target Beneficiaries & Eligibility)'] || ''
    ).trim();
    const femaleTerms = String(lenderRecord['Female Borrower Scheme / Concession'] || '').trim();

    if (cibilTerms) {
      matchFactors.push('Credit-score criteria are disclosed; lender underwriting still applies.');
    } else {
      cautionPoints.push('Credit-score criteria are not available in the comparison dataset.');
    }
    if (targetBeneficiaries) matchReasons.push('Eligibility / target-borrower information is available.');
    if (femaleTerms) matchReasons.push('Female-borrower terms are disclosed in the lender dataset.');

    const fitStatus =
      cautionPoints.some((item) => /below the stated minimum|above the stated maximum|beyond the stated maximum age/i.test(item))
        ? 'Outside stated criteria' as const
        : cautionPoints.length > 0
          ? 'Review required' as const
          : 'Within stated criteria' as const;

    const feeRaw = String(
      (lenderRecord as any)['Processing Fee (Standard)'] ||
      (lenderRecord as any)['Processing Fee Range'] ||
      ''
    ).trim();

    const feeCap = String(
      (lenderRecord as any)['Processing Fee Caps / Minimums'] ||
      (lenderRecord as any)['Processing Fee Cap / Min'] ||
      ''
    ).trim();

    const promoText = String(lenderRecord['Current Schemes & Promotional Offers'] || '').trim();
    const hasFemaleConcession = Boolean(femaleTerms);
    const hasOverdraft = /overdraft|maxgain/i.test(promoText);

    return {
      id: 'lender_' + index + '_' + shortName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: lenderName,
      shortName,
      category,
      categoryGroup,
      baseRateNum: rateNum,
      rate: rawRoi || 'Not disclosed',
      rawRateRange: rawRoi || 'Not disclosed',
      rateType: 'Indicative lender range',
      estEMI: emi,
      totalRepayment,
      totalInterest,
      features: extractLenderFeatures(lenderRecord, schemeMatch),
      processingTime: '',
      processingFee: feeRaw || 'Not disclosed',
      processingFeeCaps: feeCap || 'Not disclosed',

      // Deliberately absent: no synthetic lender score or approval probability.
      score: undefined,
      finalScore: undefined,
      probability: undefined,

      femaleConcession: femaleTerms || 'Not disclosed',
      hasFemaleConcession,
      cibilGuidelines: cibilTerms || 'Not disclosed',
      targetBeneficiaries: targetBeneficiaries || 'Not disclosed',
      currentScheme: promoText || 'No current scheme disclosed in dataset',
      hasOverdraft,

      minAgeSalaried: Number.isFinite(minAgeSal) ? minAgeSal : 0,
      maxAgeMaturitySalaried: Number.isFinite(maxAgeSal) ? maxAgeSal : 0,
      minAgeSelfEmployed: Number.isFinite(minAgeSelf) ? minAgeSelf : 0,
      maxAgeMaturitySelfEmployed: Number.isFinite(maxAgeSelf) ? maxAgeSelf : 0,

      minLoanAmountText: minLoanText || 'Not disclosed',
      maxLoanAmountText: maxLoanText || 'Not disclosed',
      minLoanAmountNum: limits.min,
      maxLoanAmountNum: limits.max,

      prepaymentTerms: String(
        (lenderRecord as any)['Prepayment / Foreclosure (Floating Rate - Indiv)'] ||
        (lenderRecord as any)['Foreclosure Penalty (Individual / Non-Business)'] ||
        ''
      ).trim() || 'Not disclosed',

      penalCharges: String(
        (lenderRecord as any)['Penal Clause (Delayed EMI / Bounce)'] ||
        (lenderRecord as any)['Penal Charges / Bounce Charges'] ||
        ''
      ).trim() || 'Not disclosed',

      typesOffered: String(
        (lenderRecord as any)['Types of Home Loans Offered'] ||
        (lenderRecord as any)['Types of LAP Products'] ||
        ''
      ).trim() || 'Not disclosed',

      kycDocs: String(
        (lenderRecord as any)['Mandatory KYC Documents'] ||
        (lenderRecord as any)['Mandatory KYC'] ||
        ''
      ).trim() || 'Not disclosed',

      incomeDocsSalaried: String((lenderRecord as any)['Income Documents (Salaried)'] || '').trim() || 'Not disclosed',
      incomeDocsSelfEmployed: String((lenderRecord as any)['Income Documents (Self-Employed)'] || '').trim() || 'Not disclosed',
      propertyDocs: String((lenderRecord as any)['Property Documents'] || '').trim() || 'Not disclosed',

      matchReasons: Array.from(new Set(matchReasons)),
      cautionPoints: Array.from(new Set(cautionPoints)),
      matchFactors: Array.from(new Set(matchFactors)),
      fitStatus,
      isSalaryBankMatch,
      loanType
    } satisfies EnrichedLenderOffer;
  });

  // User-controlled sorting only. "highest_match" is intentionally source order:
  // there is no hidden score or approval probability behind the ordering.
  if (sortBy === 'lowest_rate') {
    return [...results].sort((a, b) => {
      if (!a.baseRateNum) return 1;
      if (!b.baseRateNum) return -1;
      return a.baseRateNum - b.baseRateNum;
    });
  }

  if (sortBy === 'lowest_fee') {
    const feeValue = (fee: string) => {
      const match = fee.match(/(\d+(?:\.\d+)?)\s*%/);
      return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
    };
    return [...results].sort((a, b) => feeValue(a.processingFee) - feeValue(b.processingFee));
  }

  // fastest_time cannot be truthfully sorted without lender-sourced processing times.
  return results;
}

export function getLenderComparisonSummary(offers: EnrichedLenderOffer[]) {
  return {
    totalOffers: offers.length,
    rateAvailable: offers.filter((offer) => offer.baseRateNum > 0).length,
    feeAvailable: offers.filter((offer) => offer.processingFee !== 'Not disclosed').length,
    withinStatedCriteria: offers.filter((offer) => offer.fitStatus === 'Within stated criteria').length,
    reviewRequired: offers.filter((offer) => offer.fitStatus === 'Review required').length,
    outsideStatedCriteria: offers.filter((offer) => offer.fitStatus === 'Outside stated criteria').length,
  };
}
