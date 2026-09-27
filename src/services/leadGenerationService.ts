export type LeadLifecycleStage = 'new' | 'engaged' | 'profile_complete' | 'comparison_active' | 'application_intent' | 'application_started';
export type EmploymentType = 'Salaried' | 'Self-employed' | 'Business owner' | 'Professional' | 'Other';

export interface LeadProfile {
  leadId: string; userId?: string; createdAt: string; updatedAt: string; source: 'ParrotMoney website';
  product: string; loanAmount: number; propertyValue: number; tenureYears: number; city: string;
  fullName: string; mobile: string; email: string; age: number; employmentType: EmploymentType;
  monthlyIncome: number; existingEmi: number; creditScore?: number;
  consent: { comparison: boolean; contact: boolean; lenderHandoff: boolean; timestamp: string; version: string };
  lifecycleStage: LeadLifecycleStage; intentSignals: string[]; profileCompleteness: number;
  comparisonContext: { ltvPercent?: number; referenceFoirPercent?: number };
}

export function createLeadId(): string {
  return `PM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function calculateProfileCompleteness(input: Partial<LeadProfile>): number {
  const checks = [
    Boolean(input.fullName?.trim()), Boolean(input.mobile?.trim()), Boolean(input.product?.trim()),
    Number(input.loanAmount) > 0, Number(input.propertyValue) > 0, Number(input.age) > 17,
    Boolean(input.city?.trim()), Boolean(input.employmentType), Number(input.monthlyIncome) > 0,
    Number(input.existingEmi) >= 0, Number(input.tenureYears) > 0
  ];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}

export function deriveIntentStage(completeness: number, signals: string[]): LeadLifecycleStage {
  const has = (s: string) => signals.includes(s);
  if (has('application_started')) return 'application_started';
  if (has('offer_requested')) return 'application_intent';
  if (has('offer_shortlisted') || has('offer_compared')) return 'comparison_active';
  if (completeness >= 90) return 'profile_complete';
  if (has('profile_started') || has('requirement_started')) return 'engaged';
  return 'new';
}

type LeadDraft = Omit<LeadProfile, 'leadId' | 'createdAt' | 'updatedAt' | 'source' | 'lifecycleStage' | 'intentSignals' | 'profileCompleteness' | 'comparisonContext'> & { signals?: string[] };

export function buildLeadProfile(input: LeadDraft): LeadProfile {
  const now = new Date().toISOString();
  const signals = Array.from(new Set(input.signals || ['requirement_started', 'profile_started']));
  const completeness = calculateProfileCompleteness(input);
  const loanAmount = Number(input.loanAmount) || 0;
  const propertyValue = Number(input.propertyValue) || 0;
  const monthlyIncome = Number(input.monthlyIncome) || 0;
  const existingEmi = Number(input.existingEmi) || 0;
  return {
    leadId: createLeadId(), createdAt: now, updatedAt: now, source: 'ParrotMoney website',
    product: input.product, loanAmount, propertyValue, tenureYears: Number(input.tenureYears) || 0,
    city: input.city.trim(), fullName: input.fullName.trim(), mobile: input.mobile.trim(), email: input.email.trim(),
    age: Number(input.age) || 0, employmentType: input.employmentType, monthlyIncome, existingEmi,
    creditScore: input.creditScore ? Number(input.creditScore) : undefined, consent: input.consent,
    lifecycleStage: deriveIntentStage(completeness, signals), intentSignals: signals, profileCompleteness: completeness,
    comparisonContext: {
      ltvPercent: propertyValue > 0 && loanAmount > 0 ? Number((loanAmount / propertyValue * 100).toFixed(1)) : undefined,
      referenceFoirPercent: monthlyIncome > 0 ? Number((existingEmi / monthlyIncome * 100).toFixed(1)) : undefined
    }
  };
}
