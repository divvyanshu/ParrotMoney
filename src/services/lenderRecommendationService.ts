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
  score: number;
  finalScore: number;
  probability: 'Very High' | 'High' | 'Moderate' | 'Low';
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
  const feeStr = (lender['Processing Fee (Standard)'] || (lender as any)['Processing Fee Range'] || '').toLowerCase();
  const promoStr = (lender['Current Schemes & Promotional Offers'] || '').toLowerCase();
  const femaleStr = (lender['Female Borrower Scheme / Concession'] || '').toLowerCase();
  const catStr = (lender['Institution Category'] || '').toLowerCase();
  const nameStr = (lender['Lender Name'] || '').toLowerCase();

  // 1. Fee benefits
  if (feeStr.includes('zero') || feeStr.includes('nil') || promoStr.includes('100% waiver') || promoStr.includes('zero fee')) {
    feats.push('Zero Processing Fee');
  } else if (feeStr.includes('0.25%') || feeStr.includes('0.35%') || feeStr.includes('0.50%')) {
    feats.push('Low Processing Fee');
  }

  // 2. Overdraft capability
  if (promoStr.includes('overdraft') || promoStr.includes('maxgain') || promoStr.includes('advantage') || nameStr.includes('sbi') || nameStr.includes('hdfc') || nameStr.includes('baroda')) {
    feats.push('Overdraft Facility');
  }

  // 3. Concessions
  if (femaleStr.includes('5 bps') || femaleStr.includes('0.05%') || femaleStr.includes('concession') || femaleStr.includes('discount')) {
    feats.push('Women Concession');
  }

  // 4. Institutional strength
  if (catStr.includes('psu') || catStr.includes('public')) {
    feats.push('PSU / public-sector lender');
  } else if (nameStr.includes('hdfc') || nameStr.includes('icici') || nameStr.includes('axis') || nameStr.includes('kotak')) {
    feats.push('Digital application may be available');
  } else if (catStr.includes('affordable') || nameStr.includes('aadhar') || nameStr.includes('aavas') || nameStr.includes('home first')) {
    feats.push('Eligibility criteria may vary');
  } else if (catStr.includes('sfb') || catStr.includes('small finance')) {
    feats.push('Service model varies by location');
  }

  // 5. Active scheme highlight
  if (schemeMatch && schemeMatch['Scheme / Offer Name']) {
    feats.push(schemeMatch['Scheme / Offer Name'].substring(0, 24));
  }

  return Array.from(new Set(feats)).slice(0, 4);
}

// Export list of all 43+ lender names directly derived from datasets
export const ALL_INDIAN_LENDERS: string[] = Array.from(
  new Set([
    ...homeLoanData.map(l => l['Lender Name']),
    ...lapData.map(l => l['Lender Name'])
  ])
).sort((a, b) => a.localeCompare(b));

// Core Recommendation Algorithm taking applicant form data and matching against all 43+ lenders
export function compute43LenderRecommendations(
  formData: any,
  algorithmParams: {
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
  const loanTypeStr: 'Home Loan' | 'Loan Against Property (LAP)' = isLAP ? 'Loan Against Property (LAP)' : 'Home Loan';

  // Applicant inputs
  const loanAmt = Number(formData.loanAmount) || 4500000;
  const propertyVal = Number(formData.propertyValue) || 6000000;
  const tenureYears = Number(formData.tenure) || 20;
  const applicantAge = Number(formData.age) || 30;
  const applicantGender = formData.gender || 'Male';
  const cibilVal = Number(formData.cibilScore) || 750;
  const hasDefaults = formData.cibilStatus === 'Outstanding & Defaults';
  const occupation = formData.occupation || 'Salaried';
  const salaryBank = (formData.bankAccount || '').toLowerCase().trim();

  // Monthly income & FOIR calculations
  const monthlySalary = Number(formData.monthlySalary) || 0;
  const monthlyRevenue = Number(formData.monthlyRevenue) || 0;
  const baseMonthlyIncome = occupation === 'Salaried' 
    ? monthlySalary 
    : (monthlyRevenue > 0 ? (monthlyRevenue * 0.20) : monthlySalary || 75000);

  const coBorrowerIncome = (formData.hasCoBorrower === 'Yes' && Number(formData.householdIncome || 0) > 0)
    ? (Number(formData.householdIncome) / 12)
    : 0;

  const combinedMonthlyIncome = baseMonthlyIncome + (algorithmParams.coBorrowerMultiplier * coBorrowerIncome);
  const totalExistingEMIs = (formData.activeLoans || []).reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0);
  const calculatedLtv = propertyVal > 0 ? (loanAmt / propertyVal) * 100 : 75;

  const results: EnrichedLenderOffer[] = dataset.map((lenderRecord, index) => {
    const rawLenderName = lenderRecord['Lender Name'];
    const shortName = getShortLenderName(rawLenderName);
    const category = lenderRecord['Institution Category'] || 'Commercial Bank';
    const categoryGroup = mapCategoryToGroup(category);

    // Current Schemes match
    const schemeMatch = currentSchemesData.find(s => 
      s['Lender / Organization Name'].toLowerCase().includes(shortName.toLowerCase()) ||
      rawLenderName.toLowerCase().includes(s['Lender / Organization Name'].toLowerCase())
    );

    // Rate parsing
    const rawRoi = lenderRecord['Rate of Interest (ROI) Range'] || '8.50% - 9.50% p.a.';
    let baseRate = parseBaseInterestRate(rawRoi);

    // 1. Female Borrower Concession (-0.05% if female and scheme supports it)
    const femaleSchemeStr = lenderRecord['Female Borrower Scheme / Concession'] || '';
    const hasFemaleConcession = 
      femaleSchemeStr.toLowerCase().includes('5 bps') || 
      femaleSchemeStr.toLowerCase().includes('0.05%') || 
      femaleSchemeStr.toLowerCase().includes('concession');
    
    if (applicantGender === 'Female' && hasFemaleConcession) {
      baseRate = Math.max(7.80, baseRate - 0.05);
    }

    // 2. Risk Premium Loader based on CIBIL
    let cibilLoader = 0;
    if (cibilVal < 650) {
      cibilLoader = categoryGroup === 'HFCs & NBFCs' ? 0.75 : 1.25;
    } else if (cibilVal < 700) {
      cibilLoader = 0.45;
    } else if (cibilVal < 750) {
      cibilLoader = 0.15;
    }

    // 3. Defaults Loader
    if (hasDefaults) {
      cibilLoader += 1.50;
    }

    // 4. High LTV Loader (RBI norm for LTV > 80%)
    let ltvLoader = 0;
    if (calculatedLtv > 80) {
      ltvLoader = 0.10;
    }

    const dynamicRateNum = parseFloat((baseRate + cibilLoader + ltvLoader).toFixed(2));
    const dynamicRateStr = dynamicRateNum.toFixed(2) + '%';

    // Monthly EMI Calculation for this lender
    const monthlyRate = (dynamicRateNum / 100) / 12;
    const nMonths = tenureYears * 12;
    const estEMI = (monthlyRate > 0 && nMonths > 0)
      ? Math.round((loanAmt * monthlyRate * Math.pow(1 + monthlyRate, nMonths)) / (Math.pow(1 + monthlyRate, nMonths) - 1))
      : 0;

    // --- Scoring Algorithm (Target: 0 to 99) ---
    let matchScore = 86; // Strong baseline
    const matchReasons: string[] = [];
    const cautionPoints: string[] = [];

    // Category / Occupation Fit
    if (occupation === 'Salaried') {
      if (categoryGroup === 'PSU Banks') {
        matchScore += 8;
        matchReasons.push('Applicant occupation aligns with this lender category.');
      } else if (categoryGroup === 'Private Banks') {
        matchScore += 7;
        matchReasons.push('Applicant occupation aligns with this lender category.');
      }
    } else { // Business / Self-Employed
      if (categoryGroup === 'HFCs & NBFCs') {
        matchScore += 10;
        matchReasons.push('Lender category may support this applicant profile; confirm criteria with the lender.');
      } else if (categoryGroup === 'Small Finance Banks') {
        matchScore += 8;
        matchReasons.push('Lender category may support this applicant profile; confirm criteria with the lender.');
      } else if (categoryGroup === 'PSU Banks') {
        matchScore -= 6;
        cautionPoints.push('Strict 3-year audited ITR and vintage requirements for self-employed applicants.');
      }
    }

    // Salary Bank Match Bonus
    const isSalaryBankMatch = Boolean(
      salaryBank && (
        rawLenderName.toLowerCase().includes(salaryBank) ||
        salaryBank.includes(rawLenderName.toLowerCase()) ||
        shortName.toLowerCase().includes(salaryBank) ||
        salaryBank.includes(shortName.toLowerCase())
      )
    );

    if (isSalaryBankMatch) {
      matchScore += algorithmParams.salaryMatchBonus;
      matchReasons.push(`Internal relationship pricing & pre-cleared KYC via your active ${shortName} account.`);
    }

    // CIBIL Evaluation
    if (cibilVal >= 780) {
      matchScore += 6;
      matchReasons.push('Credit profile is above the configured comparison threshold.');
    } else if (cibilVal < algorithmParams.cibilThreshold) {
      if (categoryGroup === 'HFCs & NBFCs' && (category.includes('Affordable') || shortName.includes('Aadhar') || shortName.includes('Aavas') || shortName.includes('Home First'))) {
        matchScore += 4; // Affordable HFCs specialize in credit-challenged applicants
        matchReasons.push('Specialized credit repair & non-standard score assessment desk available.');
      } else {
        matchScore -= algorithmParams.cibilPenalty;
        cautionPoints.push(`Score below preferred benchmark (${algorithmParams.cibilThreshold}); additional co-borrower recommended.`);
      }
    }

    if (hasDefaults) {
      matchScore -= 30;
      cautionPoints.push('Past defaults trigger senior underwriter manual credit committee scrutiny.');
    }

    // FOIR & Affordability Check
    const maxAllowedEMI = combinedMonthlyIncome * (algorithmParams.maxFoirRatio / 100);
    const totalCommittedEMI = estEMI + totalExistingEMIs;
    if (totalCommittedEMI > maxAllowedEMI) {
      const excess = totalCommittedEMI - maxAllowedEMI;
      matchScore -= Math.min(25, Math.round((excess / maxAllowedEMI) * 30));
      cautionPoints.push(`Debt-to-income (FOIR) ratio exceeds banking guideline of ${algorithmParams.maxFoirRatio}%.`);
    } else {
      matchScore += 4;
      matchReasons.push('Estimated EMI is within the configured affordability threshold.');
    }

    // Age at Maturity Check
    const hlRecord = lenderRecord as HomeLoanGuideline;
    const maxAgeSal = parseInt(hlRecord['Max Age at Maturity (Salaried)'] || '70', 10) || 70;
    const maxAgeSelf = parseInt(hlRecord['Max Age at Maturity (Self-Employed)'] || '70', 10) || 70;
    const allowedMaxAge = occupation === 'Salaried' ? maxAgeSal : maxAgeSelf;

    if (applicantAge + tenureYears > allowedMaxAge) {
      const overage = (applicantAge + tenureYears) - allowedMaxAge;
      matchScore -= (overage * algorithmParams.agePenalty);
      cautionPoints.push(`Loan maturity exceeds lender's maximum retirement age (${allowedMaxAge} years).`);
    }

    // Loan Amount Limits Check
    const minLoanStr = (lenderRecord as any)['Min Loan Amount'] || '';
    const maxLoanStr = (lenderRecord as any)['Max Loan Amount'] || '';
    const { min: minL, max: maxL } = parseLoanLimits(minLoanStr, maxLoanStr);

    if (loanAmt < minL) {
      matchScore -= 20;
      cautionPoints.push(`Requested amount below minimum ticket size (${minLoanStr}).`);
    } else if (loanAmt > maxL) {
      matchScore -= 25;
      cautionPoints.push(`Requested amount exceeds institutional ceiling (${maxLoanStr}).`);
    } else if (loanAmt >= 10000000 && (categoryGroup === 'Private Banks' || shortName.includes('SBI'))) {
      matchScore += 5; // HNI priority desk
      matchReasons.push('Requested loan amount falls within the dataset range.');
    }

    // LTV Check
    if (calculatedLtv > algorithmParams.maxLtvRatio) {
      matchScore -= 18;
      cautionPoints.push(`Requested LTV (${calculatedLtv.toFixed(0)}%) exceeds institutional limit.`);
    }

    // Promotional copy does not alter applicant fit.

    // Clamp score safely
    const finalScore = Math.min(99, Math.max(30, Math.round(matchScore)));
    const probability: 'Very High' | 'High' | 'Moderate' | 'Low' = 
      finalScore >= 88 ? 'Very High' : finalScore >= 72 ? 'High' : finalScore >= 56 ? 'Moderate' : 'Low';

    // Processing Fee, Caps & Terms
    const feeRaw = (lenderRecord as any)['Processing Fee (Standard)'] || (lenderRecord as any)['Processing Fee Range'] || '0.35% - 0.50% + GST';
    const feeCap = (lenderRecord as any)['Processing Fee Caps / Minimums'] || (lenderRecord as any)['Processing Fee Cap / Min'] || 'Min ₹2,500, Max ₹15,000 + GST';

    // Check Overdraft
    const hasOverdraft = 
      promoText.toLowerCase().includes('overdraft') || 
      promoText.toLowerCase().includes('maxgain') || 
      promoText.toLowerCase().includes('advantage') ||
      rawLenderName.toLowerCase().includes('sbi') ||
      rawLenderName.toLowerCase().includes('baroda');

    return {
      id: `lender_${index}_${shortName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: rawLenderName,
      shortName,
      category,
      categoryGroup,
      baseRateNum: dynamicRateNum,
      rate: dynamicRateStr,
      rawRateRange: rawRoi,
      estEMI,
      features: extractLenderFeatures(lenderRecord, schemeMatch),
      processingTime: '',
      processingFee: feeRaw,
      processingFeeCaps: feeCap,
      score: finalScore,
      finalScore,
      probability,
      femaleConcession: femaleSchemeStr || 'Standard card rate applicable',
      hasFemaleConcession,
      cibilGuidelines: lenderRecord['CIBIL Score Guidelines & Cut-offs'] || 'Minimum 700 score preferred',
      targetBeneficiaries: lenderRecord['Who Can Avail (Target Beneficiaries & Eligibility)'] || 'Indian residents & NRIs',
      currentScheme: promoText || (schemeMatch ? schemeMatch['Special Concession / Promotional Offer'] : 'Standard retail housing facility'),
      hasOverdraft,
      minAgeSalaried: parseInt(hlRecord['Min Age (Salaried)'] || '21', 10) || 21,
      maxAgeMaturitySalaried: maxAgeSal,
      minAgeSelfEmployed: parseInt(hlRecord['Min Age (Self-Employed)'] || '23', 10) || 23,
      maxAgeMaturitySelfEmployed: maxAgeSelf,
      minLoanAmountText: minLoanStr || '₹1,00,000',
      maxLoanAmountText: maxLoanStr || '₹10,00,00,000',
      minLoanAmountNum: minL,
      maxLoanAmountNum: maxL,
      prepaymentTerms: (lenderRecord as any)['Prepayment / Foreclosure (Floating Rate - Indiv)'] || (lenderRecord as any)['Foreclosure Penalty (Individual / Non-Business)'] || 'Zero charges on floating rate home loans for individuals.',
      penalCharges: (lenderRecord as any)['Penal Clause (Delayed EMI / Bounce)'] || (lenderRecord as any)['Penal Charges / Bounce Charges'] || '18% to 24% p.a. on overdue EMI amount.',
      typesOffered: (lenderRecord as any)['Types of Home Loans Offered'] || (lenderRecord as any)['Types of LAP Products'] || 'Home Purchase, Construction, Balance Transfer, Top-up.',
      kycDocs: (lenderRecord as any)['Mandatory KYC Documents'] || (lenderRecord as any)['Mandatory KYC'] || 'PAN, Aadhaar, Passport, Proof of address.',
      incomeDocsSalaried: (lenderRecord as any)['Income Documents (Salaried)'] || 'Salary slips (3 mos), Bank statements (6 mos), Form 16 (2 yrs).',
      incomeDocsSelfEmployed: (lenderRecord as any)['Income Documents (Self-Employed)'] || (lenderRecord as any)['Financial Documents (Salaried & Self-Employed)'] || 'ITR (3 yrs), P&L balance sheet, operative bank statement (12 mos).',
      propertyDocs: (lenderRecord as any)['Property & Title Documents Required'] || (lenderRecord as any)['Property Collateral Documents Required'] || 'Title deed chain, approved plan, tax receipts, EC, OC/CC.',
      matchReasons,
      cautionPoints,
      isSalaryBankMatch,
      loanType: loanTypeStr
    };
  });

  // Sorting
  return results.sort((a, b) => {
    if (sortBy === 'lowest_rate') {
      if (a.baseRateNum !== b.baseRateNum) return a.baseRateNum - b.baseRateNum;
      return b.finalScore - a.finalScore;
    }
    if (sortBy === 'fastest_time') {
      const getDays = (str: string) => {
        const m = str.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 99;
      };
      const dA = getDays(a.processingTime);
      const dB = getDays(b.processingTime);
      if (dA !== dB) return dA - dB;
      return b.finalScore - a.finalScore;
    }
    if (sortBy === 'lowest_fee') {
      const isFreeA = a.processingFee.toLowerCase().includes('nil') || a.processingFee.toLowerCase().includes('zero');
      const isFreeB = b.processingFee.toLowerCase().includes('nil') || b.processingFee.toLowerCase().includes('zero');
      if (isFreeA && !isFreeB) return -1;
      if (!isFreeA && isFreeB) return 1;
      return b.finalScore - a.finalScore;
    }
    // 'highest_match' (default)
    return b.finalScore - a.finalScore;
  });
}
