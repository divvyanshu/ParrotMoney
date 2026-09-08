import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted}/-`;
}

export function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  if (!principal || !years) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  if (monthlyRate === 0) return principal / numberOfPayments;
  const common = Math.pow(1 + monthlyRate, numberOfPayments);
  if (common === 1) return principal / numberOfPayments;
  return (principal * monthlyRate * common) / (common - 1);
}

export function calculateEligibility(monthlyIncome: number, existingEMI: number, rate: number, years: number) {
  if (!monthlyIncome || !years) return 0;
  // FOIR - Fixed Obligation to Income Ratio (usually 50-60%)
  const FOIR = 0.6;
  const maxEMIAllowed = (monthlyIncome * FOIR) - existingEMI;
  
  if (maxEMIAllowed <= 0) return 0;
  
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) return maxEMIAllowed * numberOfPayments;

  // Principal = EMI / [r * (1 + r)^n / ((1 + r)^n - 1)]
  const common = Math.pow(1 + monthlyRate, numberOfPayments);
  const principal = maxEMIAllowed / ((monthlyRate * common) / (common - 1));
  
  return Math.max(0, principal);
}

export function calculateAmortizationSchedule(
  principal: number, 
  annualRate: number, 
  years: number, 
  frequency: 'monthly' | 'yearly' = 'yearly', 
  growthConfig?: { type: 'percentage' | 'absolute', value: number, frequency: 'monthly' | 'annual' }
) {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = (years || 1) * 12;
  const initialEMI = calculateMonthlyPayment(principal, annualRate, years || 1);
  
  let balance = principal;
  let currentEMI = initialEMI;
  const schedule = [];
  
  let periodInterest = 0;
  let periodPrincipal = 0;
  let periodPayment = 0;

  for (let i = 1; i <= 600; i++) { // Max 50 years
    if (balance <= 0) break;

    const interest = balance * monthlyRate;
    
    // Apply growth strategy
    if (growthConfig && growthConfig.value > 0 && i > 1) {
      let isIncrementTime = false;
      if (growthConfig.frequency === 'monthly') {
        isIncrementTime = true;
      } else {
        // Annual Step-up: occurs at 13th, 25th, 37th installment...
        isIncrementTime = (i - 1) % 12 === 0;
      }

      if (isIncrementTime) {
        if (growthConfig.type === 'percentage') {
          currentEMI = currentEMI * (1 + growthConfig.value / 100);
        } else {
          currentEMI = currentEMI + growthConfig.value;
        }
      }
    }

    const principalPaid = Math.min(balance, currentEMI - interest);
    if (principalPaid <= 0 && balance > 0 && i > 120) break; // Quit if no progress after 10 years

    balance -= principalPaid;
    periodInterest += interest;
    periodPrincipal += principalPaid;
    periodPayment += (principalPaid + interest); // Standard payment for the installment

    if (frequency === 'monthly') {
      schedule.push({
        period: i,
        label: `Month ${i}`,
        payment: principalPaid + interest,
        principal: principalPaid,
        interest: interest,
        remainingBalance: Math.max(0, balance)
      });
    } else if (i % 12 === 0 || balance <= 0) {
      schedule.push({
        period: Math.ceil(i/12),
        label: `Year ${Math.ceil(i/12)}`,
        payment: periodPayment,
        principal: periodPrincipal,
        interest: periodInterest,
        remainingBalance: Math.max(0, balance)
      });
      periodInterest = 0;
      periodPrincipal = 0;
      periodPayment = 0;
    }
  }
  return schedule;
}

export function calculateTenureWithGrowth(
  principal: number, 
  annualRate: number, 
  initialEMI: number, 
  growthType: 'percentage' | 'absolute', 
  growthValue: number,
  growthFrequency: 'monthly' | 'annual' = 'annual'
) {
  const monthlyRate = annualRate / 100 / 12;
  let balance = principal;
  let months = 0;
  let currentEMI = initialEMI;
  let totalInterest = 0;
  let totalPaid = 0;
  const maxMonths = 600;

  while (balance > 0 && months < maxMonths) {
    months++;
    
    // Increment logic
    if (growthValue > 0 && months > 1) {
      let isIncrementTime = false;
      if (growthFrequency === 'monthly') {
        isIncrementTime = true;
      } else {
        // Annual Step-up: increment every 12 months (start of year 2, 3...)
        isIncrementTime = (months - 1) % 12 === 0;
      }

      if (isIncrementTime) {
        if (growthType === 'percentage') {
          currentEMI = currentEMI * (1 + growthValue / 100);
        } else {
          currentEMI = currentEMI + growthValue;
        }
      }
    }

    const interest = balance * monthlyRate;
    const principalPaid = Math.min(balance, currentEMI - interest);
    
    if (principalPaid <= 0 && balance > 0 && months > 120) {
      return { years: 0, months: 0, totalInterest: 0, totalPaid: 0, failed: true };
    }

    totalInterest += interest;
    totalPaid += (principalPaid + interest);
    balance -= principalPaid;
  }

  return {
    years: Math.floor(months / 12),
    months: months % 12,
    totalMonths: months,
    totalInterest,
    totalPaid,
    failed: balance > 0
  };
}
