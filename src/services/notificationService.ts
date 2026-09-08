import { 
  CommunicationLogEntry, 
  CommunicationChannel, 
  LoanStageId, 
  LoanApplication,
  LoanQuery 
} from '../types';

export const STAGE_CONFIGS: Record<LoanStageId, {
  order: number;
  name: string;
  shortDesc: string;
  detailedDesc: string;
  defaultTasks: { id: string; title: string; description: string; completed: boolean; requiredForNextStage?: boolean }[];
  officerRole: string;
  slaDays: number;
}> = {
  application_submitted: {
    order: 1,
    name: 'Application Submitted',
    shortDesc: 'Form completed, initial loan file registered & verified',
    detailedDesc: 'Your loan application has been registered with our automated underwriting system and assigned to a dedicated loan desk officer.',
    defaultTasks: [
      { id: 't1', title: 'KYC & Identity Verification', description: 'PAN and Aadhaar biometric verification', completed: true },
      { id: 't2', title: 'Eligibility Scoring', description: 'Initial credit bureau & FOIR calculation', completed: true },
      { id: 't3', title: 'Bank Selection & Product Match', description: 'Optimal interest scheme mapped to selected lender', completed: true }
    ],
    officerRole: 'Relationship Desk Lead',
    slaDays: 1
  },
  documents_verified: {
    order: 2,
    name: 'Documents Verified',
    shortDesc: 'Income proofs, bank statements & KYC authenticated',
    detailedDesc: 'Financial and employment verification is completed by the underwriting team. Salary slips, Form 16/ITRs, and 6-month banking records are approved.',
    defaultTasks: [
      { id: 't4', title: 'Income & Salary Authentication', description: '3-month salary credits & employer validation', completed: true },
      { id: 't5', title: 'Banking Statement Analysis', description: 'Average monthly balance & active EMI obligations verified', completed: true },
      { id: 't6', title: 'CIBIL Bureau Pull', description: 'Credit score 750+ authenticated with credit bureau', completed: true }
    ],
    officerRole: 'Senior Underwriter',
    slaDays: 2
  },
  technical_inspection: {
    order: 3,
    name: 'Technical Inspection & Valuation',
    shortDesc: 'Site inspection, property valuation & engineer report',
    detailedDesc: 'Certified empaneled civil engineer visits the property site to verify carpet area, stage of construction, approved building layout, and determine fair market value.',
    defaultTasks: [
      { id: 't7', title: 'Site Inspection Appointment', description: 'Valuer visit to property location', completed: true },
      { id: 't8', title: 'Measurement & Boundary Check', description: 'Verifying dimensions against building plan', completed: false, requiredForNextStage: true },
      { id: 't9', title: 'Valuation Report Submission', description: 'Fair market valuation report drafted and submitted to credit committee', completed: false }
    ],
    officerRole: 'Empaneled Technical Valuer',
    slaDays: 3
  },
  legal_approval: {
    order: 4,
    name: 'Legal Approval & Title Search',
    shortDesc: '30-year title deed verification & advocate search report',
    detailedDesc: 'Bank legal counsel examines the title chain, encumbrance certificate, municipal clearances, and property tax records to issue the Legal Title Clear Report (TCR).',
    defaultTasks: [
      { id: 't10', title: '30-Year Title Search', description: 'Sub-registrar office records search for non-encumbrance', completed: false, requiredForNextStage: true },
      { id: 't11', title: 'Chain of Title Deeds Check', description: 'Prior sale deeds, mutation records, and patta/khata check', completed: false },
      { id: 't12', title: 'Final Legal Opinion (TCR)', description: 'Advocate issuance of Title Clearance Report', completed: false }
    ],
    officerRole: 'Senior Bank Advocate',
    slaDays: 3
  },
  sanctioned: {
    order: 5,
    name: 'Sanctioned & Offer Letter',
    shortDesc: 'Credit committee approval & official Sanction Letter released',
    detailedDesc: 'Credit committee has sanctioned your home loan. The formal Sanction Letter is issued with sanctioned loan amount, interest rate (ROI), tenure, and processing fees.',
    defaultTasks: [
      { id: 't13', title: 'Credit Committee Sanction', description: 'Final financial approval with loan parameters', completed: false },
      { id: 't14', title: 'Sanction Letter Issuance', description: 'Downloadable formal offer letter with seal and signature', completed: false },
      { id: 't15', title: 'Borrower Acceptance & Fee Deposit', description: 'Acceptance of loan terms & administrative fee clearance', completed: false }
    ],
    officerRole: 'Credit Committee Manager',
    slaDays: 2
  },
  disbursed: {
    order: 6,
    name: 'Disbursed to Beneficiary',
    shortDesc: 'Agreement executed, MODT registered & funds released',
    detailedDesc: 'Loan agreement signed, Memorandum of Deposit of Title Deeds (MODT) completed, and funds successfully transferred via RTGS/Cheque directly to seller/builder.',
    defaultTasks: [
      { id: 't16', title: 'Loan Agreement & Stamp Duty', description: 'Execution of mortgage agreement and franking', completed: false },
      { id: 't17', title: 'MODT / Equitable Mortgage', description: 'Deposit of original title deeds in bank secure locker', completed: false },
      { id: 't18', title: 'Fund Release / Disbursal RTGS', description: 'Net sanctioned funds credited to seller/builder escrow account', completed: false }
    ],
    officerRole: 'Disbursement Officer',
    slaDays: 2
  }
};

const STORAGE_KEY_COMMUNICATIONS = 'parrot_loan_communications_log';
const STORAGE_KEY_QUERIES = 'parrot_loan_queries_list';
const STORAGE_KEY_STAGE = 'parrot_loan_active_stage';

export function getStoredStage(loanId?: string): LoanStageId {
  const stored = localStorage.getItem(`${STORAGE_KEY_STAGE}_${loanId || 'default'}`);
  if (stored && Object.keys(STAGE_CONFIGS).includes(stored)) {
    return stored as LoanStageId;
  }
  return 'technical_inspection'; // default illustrative stage with realistic in-progress items
}

export function setStoredStage(stageId: LoanStageId, loanId?: string): void {
  localStorage.setItem(`${STORAGE_KEY_STAGE}_${loanId || 'default'}`, stageId);
}

export function calculateEmiDetails(
  principal: number = 4500000, 
  annualInterestRate: number = 8.4, 
  tenureYears: number = 20
) {
  const r = (annualInterestRate / 12) / 100;
  const n = tenureYears * 12;
  const emi = Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;
  return { emi, totalPayment, totalInterest };
}

export function getNextEmiSchedule(dueDayOfMonth: number = 5) {
  const now = new Date();
  let targetMonth = now.getMonth();
  let targetYear = now.getFullYear();

  // If we have passed the due day in current month, look at next month
  if (now.getDate() >= dueDayOfMonth) {
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
  }

  const dueDate = new Date(targetYear, targetMonth, dueDayOfMonth);
  
  // 5 days prior to due date
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(dueDate.getDate() - 5);

  const formattedDueDate = dueDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedReminderDate = reminderDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });

  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    dueDate,
    reminderDate,
    formattedDueDate,
    formattedReminderDate,
    daysRemaining: diffDays,
    dueDayOfMonth
  };
}

export function getStoredCommunicationLogs(loanId?: string): CommunicationLogEntry[] {
  const key = `${STORAGE_KEY_COMMUNICATIONS}_${loanId || 'default'}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // Ensure existing storage gets updated if no emi reminder is present
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasEmiAlert = parsed.some(p => p.category === 'emi_reminder' || p.title?.includes('EMI Payment Due'));
        if (!hasEmiAlert) {
          const emiSchedule = getNextEmiSchedule(5);
          const emiEntry: CommunicationLogEntry = {
            id: `comm_emi_${Date.now()}`,
            loanId: loanId || 'HL-2025-9842',
            userId: 'user_active',
            channel: 'whatsapp',
            category: 'emi_reminder',
            title: `Automated Reminder: Monthly EMI Due in 5 Days (₹42,850)`,
            message: `🔔 *PARROT AUTOMATED EMI PAYMENT REMINDER*\n\nApplication / Account: *#${(loanId || 'HL-2025-9842').slice(-8).toUpperCase()}*\nLender: *HDFC Bank Limited*\nMonthly EMI Amount: *₹42,850*\nScheduled Due Date: *${emiSchedule.formattedDueDate}* (5 Days Remaining)\n\n📌 *Auto-Debit Notice (NACH / e-Mandate)*:\nYour account ending in •••• 4021 will be automatically debited on *${emiSchedule.formattedDueDate}*.\n\n💡 *Action Needed*: Please ensure your bank account has sufficient balance of at least *₹42,850* by 11:59 PM prior to debit date to avoid ECS bounce charges (₹450 + GST) and protect your 780+ CIBIL score.\n\nReply 'PAY' for manual payment gateway or 'STATEMENT' for interest tax certificate.`,
            recipient: '+91 98765 43210',
            timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
            deliveryStatus: 'read',
            metadata: {
              emiAmount: 42850,
              emiDueDate: emiSchedule.formattedDueDate,
              bankName: 'HDFC Bank'
            }
          };
          const updatedWithEmi = [emiEntry, ...parsed];
          localStorage.setItem(key, JSON.stringify(updatedWithEmi));
          return updatedWithEmi;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing stored communication logs', e);
    }
  }

  const emiSchedule = getNextEmiSchedule(5);

  // Initial rich sample audit trail with automated 5-day EMI reminder
  const sampleLogs: CommunicationLogEntry[] = [
    {
      id: 'comm_emi_1',
      loanId: loanId || 'HL-2025-9842',
      userId: 'user_active',
      channel: 'whatsapp',
      category: 'emi_reminder',
      title: `Automated Reminder: Monthly EMI Due in 5 Days (₹42,850)`,
      message: `🔔 *PARROT AUTOMATED EMI PAYMENT REMINDER*\n\nApplication / Account: *#${(loanId || 'HL-2025-9842').slice(-8).toUpperCase()}*\nLender: *HDFC Bank Limited*\nMonthly EMI Amount: *₹42,850*\nScheduled Due Date: *${emiSchedule.formattedDueDate}* (5 Days Remaining)\n\n📌 *Auto-Debit Notice (NACH / e-Mandate)*:\nYour account ending in •••• 4021 will be automatically debited on *${emiSchedule.formattedDueDate}*.\n\n💡 *Action Needed*: Please ensure your bank account has sufficient balance of at least *₹42,850* by 11:59 PM prior to debit date to avoid ECS bounce charges (₹450 + GST) and protect your 780+ CIBIL score.\n\nReply 'PAY' for manual payment gateway or 'STATEMENT' for interest tax certificate.`,
      recipient: '+91 98765 43210',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      deliveryStatus: 'read',
      metadata: {
        emiAmount: 42850,
        emiDueDate: emiSchedule.formattedDueDate,
        bankName: 'HDFC Bank'
      }
    },
    {
      id: 'comm_emi_email_1',
      loanId: loanId || 'HL-2025-9842',
      userId: 'user_active',
      channel: 'email',
      category: 'emi_reminder',
      subject: `Upcoming EMI Notice: ₹42,850 Due in 5 Days on ${emiSchedule.formattedDueDate} - Loan #${(loanId || 'HL-2025-9842').slice(-8).toUpperCase()}`,
      title: `Monthly EMI Auto-Debit Alert (5-Day Pre-Debit Notification)`,
      message: `Dear Borrower,\n\nThis is an automated reminder that your upcoming monthly Home Loan EMI is due in 5 days on ${emiSchedule.formattedDueDate}.\n\n--- LOAN ACCOUNT SUMMARY ---\nLoan Application No: #${(loanId || 'HL-2025-9842').slice(-8).toUpperCase()}\nFinancing Bank: HDFC Bank Limited\nMonthly Installment: ₹42,850\nDue Date: ${emiSchedule.formattedDueDate}\nPayment Mode: Automated NACH / e-Mandate Clearing\nBank Account: HDFC Bank A/c •••• 4021\n\n--- MANDATORY ACTION ---\nPlease ensure adequate funds are maintained in your linked bank account prior to the debit date. Prompt repayments safeguard your CIBIL score and help you qualify for annual interest rate reductions under Repo Rate Linked Lending (RLLR).\n\nNeed to update your debit bank account or make an advance part-prepayment? Visit your Parrot Customer Dashboard.\n\nWarm regards,\nRetail Loan Servicing & Collections Desk\nParrot Money AI Platform`,
      recipient: 'divvyanshu@gmail.com',
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      deliveryStatus: 'delivered',
      metadata: {
        emiAmount: 42850,
        emiDueDate: emiSchedule.formattedDueDate,
        bankName: 'HDFC Bank'
      }
    },
    {
      id: 'comm_1',
      loanId: loanId || 'HL-2025-9842',
      userId: 'user_active',
      channel: 'whatsapp',
      category: 'stage_update',
      title: 'Technical Inspection Scheduled',
      message: 'Hello! Your Property Technical Inspection for Application #HL-2025-9842 has been scheduled with Senior Valuer Mr. Rajesh Verma on Friday at 11:30 AM. Please ensure site access is available.',
      recipient: '+91 98765 43210',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      deliveryStatus: 'read',
      metadata: { stageId: 'technical_inspection' }
    },
    {
      id: 'comm_2',
      loanId: loanId || 'HL-2025-9842',
      userId: 'user_active',
      channel: 'email',
      category: 'stage_update',
      subject: 'Update: Stage 2 Documents Verified - Application #HL-2025-9842',
      title: 'Income & KYC Documents Successfully Verified',
      message: 'Dear Applicant,\n\nWe are pleased to inform you that your income documents, Form 16, and 6-month bank statements for Home Loan Application #HL-2025-9842 have been verified and approved by our underwriting team.\n\nYour file has now moved to Stage 3: Technical Inspection & Property Valuation.\n\nBest regards,\nHome Loan Credit Operations',
      recipient: 'divvyanshu@gmail.com',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      deliveryStatus: 'delivered',
      metadata: { stageId: 'documents_verified' }
    },
    {
      id: 'comm_3',
      loanId: loanId || 'HL-2025-9842',
      userId: 'user_active',
      channel: 'sms',
      category: 'reminder',
      title: 'CIBIL Score Verification Alert',
      message: 'PARROT LOANS: Your credit bureau check for Home Loan #HL-2025-9842 was successful. Score: 785 (Excellent). Track live status in your dashboard.',
      recipient: '+91 98765 43210',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      deliveryStatus: 'delivered'
    },
    {
      id: 'comm_4',
      loanId: loanId || 'HL-2025-9842',
      userId: 'user_active',
      channel: 'whatsapp',
      category: 'stage_update',
      title: 'Application Successfully Registered',
      message: 'Congratulations! Your Home Loan Application #HL-2025-9842 for ₹45,00,000 has been logged. Your dedicated desk lead is Ms. Ananya Sharma (+91 98111 22334).',
      recipient: '+91 98765 43210',
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      deliveryStatus: 'read',
      metadata: { stageId: 'application_submitted' }
    }
  ];

  localStorage.setItem(key, JSON.stringify(sampleLogs));
  return sampleLogs;
}

export function saveCommunicationLogEntry(entry: CommunicationLogEntry, loanId?: string): CommunicationLogEntry[] {
  const current = getStoredCommunicationLogs(loanId);
  const updated = [entry, ...current];
  localStorage.setItem(`${STORAGE_KEY_COMMUNICATIONS}_${loanId || 'default'}`, JSON.stringify(updated));
  
  // Dispatch custom window event for real-time reactive UI updates
  window.dispatchEvent(new CustomEvent('parrot-communication-logged', { detail: entry }));
  return updated;
}

export function getStoredQueries(loanId?: string): LoanQuery[] {
  const key = `${STORAGE_KEY_QUERIES}_${loanId || 'default'}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed parsing stored queries', e);
    }
  }

  // Initial sample open query for realistic client interaction
  const defaultQueries: LoanQuery[] = [
    {
      id: 'query_101',
      loanId: loanId || 'HL-2025-9842',
      stageId: 'technical_inspection',
      title: 'Site Plan Approval Copy Required',
      description: 'The bank technical inspection team requires a clear copy of the sanctioned building floor plan approved by the local municipal authority / gram panchayat.',
      requestedDocument: 'Approved Building Plan (Blue Print)',
      status: 'open',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ];

  localStorage.setItem(key, JSON.stringify(defaultQueries));
  return defaultQueries;
}

export function saveQuery(query: LoanQuery, loanId?: string): LoanQuery[] {
  const current = getStoredQueries(loanId);
  const existingIdx = current.findIndex(q => q.id === query.id);
  let updated: LoanQuery[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = query;
  } else {
    updated = [query, ...current];
  }
  localStorage.setItem(`${STORAGE_KEY_QUERIES}_${loanId || 'default'}`, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('parrot-query-updated', { detail: query }));
  return updated;
}

export function resolveQuery(queryId: string, resolutionNote: string, loanId?: string): LoanQuery[] {
  const current = getStoredQueries(loanId);
  const updated = current.map(q => {
    if (q.id === queryId) {
      return {
        ...q,
        status: 'resolved' as const,
        resolvedAt: new Date().toISOString(),
        resolutionNote
      };
    }
    return q;
  });
  localStorage.setItem(`${STORAGE_KEY_QUERIES}_${loanId || 'default'}`, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('parrot-query-updated', { detail: { queryId, resolved: true } }));
  return updated;
}

/**
 * Triggers multi-channel notification simulation across WhatsApp, SMS, and Email
 */
export function triggerNotificationSimulation({
  loanId,
  userId,
  recipientEmail,
  recipientPhone,
  channel,
  category,
  title,
  subject,
  message,
  stageId
}: {
  loanId: string;
  userId: string;
  recipientEmail: string;
  recipientPhone: string;
  channel: CommunicationChannel;
  category: CommunicationLogEntry['category'];
  title: string;
  subject?: string;
  message: string;
  stageId?: LoanStageId;
}): CommunicationLogEntry {
  const entry: CommunicationLogEntry = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    loanId,
    userId,
    channel,
    category,
    title,
    subject: subject || (channel === 'email' ? `Loan Update: ${title} - #${loanId}` : undefined),
    message,
    recipient: channel === 'email' ? recipientEmail : recipientPhone,
    timestamp: new Date().toISOString(),
    deliveryStatus: 'delivered',
    metadata: { stageId }
  };

  saveCommunicationLogEntry(entry, loanId);
  return entry;
}

/**
 * Helper to generate pre-formatted alert templates for a given stage change
 */
export function createStageChangeNotifications(
  loan: Partial<LoanApplication> & { id: string },
  newStage: LoanStageId,
  userEmail: string = 'divvyanshu@gmail.com',
  userPhone: string = '+91 98765 43210'
): { whatsapp: CommunicationLogEntry; sms: CommunicationLogEntry; email: CommunicationLogEntry } {
  const stageInfo = STAGE_CONFIGS[newStage];
  const loanNum = loan.id?.slice(-8).toUpperCase() || 'HL-9842';
  const amountStr = loan.loanAmount ? `₹${loan.loanAmount.toLocaleString('en-IN')}` : '₹45,00,000';
  const bankName = loan.selectedBank?.name || 'Partner Bank';

  // 1. WhatsApp
  const whatsappMsg = `🔔 *Loan Stage Milestone Update*\n\nApplication: *#${loanNum}*\nNew Status: *${stageInfo.name}*\nBank: *${bankName}*\n\n${stageInfo.shortDesc}.\n\n📌 *Next Action*: All tasks for this stage are actively being reviewed. Your designated officer is ${stageInfo.officerRole}.\n\nReply 'STATUS' anytime or log in to view real-time document progress.`;
  const whatsappEntry = triggerNotificationSimulation({
    loanId: loan.id,
    userId: loan.userId || 'user_active',
    recipientEmail: userEmail,
    recipientPhone: userPhone,
    channel: 'whatsapp',
    category: 'stage_update',
    title: `Stage Updated: ${stageInfo.name}`,
    message: whatsappMsg,
    stageId: newStage
  });

  // 2. SMS
  const smsMsg = `PARROT LOANS: Update on App #${loanNum}. Your loan has advanced to "${stageInfo.name}". Estimated SLA: ${stageInfo.slaDays} business days. Track on dashboard.`;
  const smsEntry = triggerNotificationSimulation({
    loanId: loan.id,
    userId: loan.userId || 'user_active',
    recipientEmail: userEmail,
    recipientPhone: userPhone,
    channel: 'sms',
    category: 'stage_update',
    title: `SMS Alert: ${stageInfo.name}`,
    message: smsMsg,
    stageId: newStage
  });

  // 3. Email
  const emailSubject = `Important: Loan #${loanNum} Moved to ${stageInfo.name} - ${bankName}`;
  const emailMsg = `Dear Applicant,\n\nWe would like to inform you that your Home Loan Application #${loanNum} for ${amountStr} with ${bankName} has progressed to the next milestone:\n\nSTAGE ${stageInfo.order} OF 6: ${stageInfo.name.toUpperCase()}\n\nDescription: ${stageInfo.detailedDesc}\n\nAssigned Specialist: ${stageInfo.officerRole}\nEstimated Time to Complete: ${stageInfo.slaDays} Business Days\n\nYou can review real-time checklist items, submit any requested documents, or connect directly with your dedicated desk manager via your online client dashboard.\n\nWarm regards,\nCredit & Operations Team\nParrot Lending Services`;
  const emailEntry = triggerNotificationSimulation({
    loanId: loan.id,
    userId: loan.userId || 'user_active',
    recipientEmail: userEmail,
    recipientPhone: userPhone,
    channel: 'email',
    category: 'stage_update',
    title: `Official Stage Notification: ${stageInfo.name}`,
    subject: emailSubject,
    message: emailMsg,
    stageId: newStage
  });

  return { whatsapp: whatsappEntry, sms: smsEntry, email: emailEntry };
}

// Convenience alias helpers for components and App.tsx
export const getCommunicationLogs = getStoredCommunicationLogs;

export function addCommunicationLog({
  loanId,
  stageId,
  channel,
  category,
  title,
  subject,
  message,
  recipient,
  status = 'delivered',
  read = false
}: {
  loanId: string;
  stageId?: LoanStageId;
  channel: CommunicationChannel;
  category: CommunicationLogEntry['category'];
  title: string;
  subject?: string;
  message: string;
  recipient: string;
  status?: CommunicationLogEntry['deliveryStatus'];
  read?: boolean;
}): CommunicationLogEntry {
  const entry: CommunicationLogEntry = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    loanId,
    userId: 'user_active',
    channel,
    category,
    title,
    subject: subject || (channel === 'email' ? `Loan Update: ${title} - #${loanId}` : undefined),
    message,
    recipient,
    timestamp: new Date().toISOString(),
    deliveryStatus: status,
    metadata: { stageId }
  };
  saveCommunicationLogEntry(entry, loanId);
  return entry;
}

export function triggerStageAlertNotification(
  loanId: string,
  newStageId: LoanStageId,
  userEmail: string = 'divvyanshu@gmail.com',
  userPhone: string = '+91 98765 43210',
  bankName: string = 'HDFC Bank',
  loanAmount: number = 4500000
) {
  return createStageChangeNotifications(
    { id: loanId, selectedBank: { name: bankName } as any, loanAmount },
    newStageId,
    userEmail,
    userPhone
  );
}

export function createEmiPaymentReminderNotifications(
  loan: Partial<LoanApplication> & { id: string },
  userEmail: string = 'divvyanshu@gmail.com',
  userPhone: string = '+91 98765 43210',
  customEmiAmount?: number,
  customDueDateStr?: string
): { whatsapp: CommunicationLogEntry; sms: CommunicationLogEntry; email: CommunicationLogEntry } {
  const loanNum = loan.id?.slice(-8).toUpperCase() || 'HL-9842';
  const principal = loan.loanAmount || 4500000;
  const bankName = loan.selectedBank?.name || 'HDFC Bank Limited';
  const emiCalc = calculateEmiDetails(principal, 8.4, 20);
  const emiAmount = customEmiAmount || emiCalc.emi;
  const emiSchedule = getNextEmiSchedule(5);
  const dueDateStr = customDueDateStr || emiSchedule.formattedDueDate;
  const formattedEmi = `₹${emiAmount.toLocaleString('en-IN')}`;

  // 1. WhatsApp 5-Day Alert
  const whatsappMsg = `🔔 *PARROT AUTOMATED EMI PAYMENT REMINDER (5 DAYS TO DUE DATE)*\n\nLoan Application / A/c: *#${loanNum}*\nFinancing Lender: *${bankName}*\nMonthly Installment: *${formattedEmi}*\nDebit Due Date: *${dueDateStr}* (5 Days Remaining)\n\n📌 *Automated NACH / e-Mandate Info*:\nYour primary account ending in •••• 4021 is registered for direct debit on *${dueDateStr}*.\n\n💡 *Pre-Debit Checklist*:\n1. Maintain a minimum balance of *${formattedEmi}* in your clearing account before 11:59 PM prior to debit.\n2. Timely debits ensure ZERO bounce charges (saving ₹450 + 18% GST) and continuous 780+ CIBIL score enhancement.\n\nReply 'PAY NOW' for instant UPI/NetBanking payment or 'HELP' to chat with loan servicing desk.`;
  const whatsappEntry = triggerNotificationSimulation({
    loanId: loan.id,
    userId: loan.userId || 'user_active',
    recipientEmail: userEmail,
    recipientPhone: userPhone,
    channel: 'whatsapp',
    category: 'emi_reminder',
    title: `5-Day EMI Due Alert: ${formattedEmi} due on ${dueDateStr}`,
    message: whatsappMsg
  });

  // 2. SMS 5-Day Alert
  const smsMsg = `PARROT EMI ALERT: Your monthly Home Loan EMI of ${formattedEmi} for A/c #${loanNum} (${bankName}) is scheduled for auto-debit on ${dueDateStr} (in 5 days). Please maintain sufficient funds.`;
  const smsEntry = triggerNotificationSimulation({
    loanId: loan.id,
    userId: loan.userId || 'user_active',
    recipientEmail: userEmail,
    recipientPhone: userPhone,
    channel: 'sms',
    category: 'emi_reminder',
    title: `SMS Alert: EMI ${formattedEmi} Due in 5 Days`,
    message: smsMsg
  });

  // 3. Email 5-Day Notice
  const emailSubject = `Upcoming EMI Due Notice (5 Days Remaining): ${formattedEmi} on ${dueDateStr} - Loan #${loanNum}`;
  const emailMsg = `Dear Valued Customer,\n\nThis is an automated 5-day advance notification that your monthly Home Loan EMI is scheduled for automatic clearing on ${dueDateStr}.\n\n==========================================\nLOAN REPAYMENT SCHEDULE SUMMARY\n==========================================\nLoan Application Reference: #${loanNum}\nFinancing Institution: ${bankName}\nMonthly EMI Amount: ${formattedEmi}\nScheduled Due Date: ${dueDateStr}\nRepayment Mode: National Automated Clearing House (NACH / e-Mandate)\nLinked Account: Bank A/c •••• 4021\n\n==========================================\nIMPORTANT INSTRUCTIONS\n==========================================\n- Please maintain a clear available balance of at least ${formattedEmi} in your designated bank account to avoid ECS bounce penalties.\n- Timely repayments report positively to CIBIL, Experian, Equifax, and CRIF High Mark credit bureaus.\n- For income tax deductions under Section 24(b) (Interest) and Section 80C (Principal), you can download your provisional interest certificate anytime from the customer dashboard.\n\nThank you for choosing Parrot Money.\n\nWarm regards,\nRetail Loan Servicing & Custodial Operations\nParrot Money AI Platform`;

  const emailEntry = triggerNotificationSimulation({
    loanId: loan.id,
    userId: loan.userId || 'user_active',
    recipientEmail: userEmail,
    recipientPhone: userPhone,
    channel: 'email',
    category: 'emi_reminder',
    title: `Official EMI 5-Day Pre-Debit Notice`,
    subject: emailSubject,
    message: emailMsg
  });

  return { whatsapp: whatsappEntry, sms: smsEntry, email: emailEntry };
}

export function triggerEmiPaymentAlert(
  loanId: string,
  userEmail: string = 'divvyanshu@gmail.com',
  userPhone: string = '+91 98765 43210',
  bankName: string = 'HDFC Bank',
  loanAmount: number = 4500000
) {
  return createEmiPaymentReminderNotifications(
    { id: loanId, selectedBank: { name: bankName } as any, loanAmount },
    userEmail,
    userPhone
  );
}

export function createQuery(
  loanId: string,
  stageId: LoanStageId,
  title: string,
  description: string,
  requestedDocument?: string,
  userEmail: string = 'divvyanshu@gmail.com',
  userPhone: string = '+91 98765 43210'
): LoanQuery {
  const q: LoanQuery = {
    id: `q_${Date.now()}`,
    loanId,
    stageId,
    title,
    description,
    requestedDocument,
    status: 'open',
    createdAt: new Date().toISOString()
  };
  saveQuery(q, loanId);

  // Trigger automated alerts regarding this query
  const stageName = STAGE_CONFIGS[stageId]?.name || 'Current Stage';
  addCommunicationLog({
    loanId,
    stageId,
    channel: 'whatsapp',
    category: 'query',
    title: `Action Needed: ${title}`,
    message: `⚠️ *PARROT URGENT BANK QUERY*\n\nApplication: *#${loanId.slice(-8).toUpperCase()}*\nStage: *${stageName}*\n\nQuery: *${title}*\n${description}\n\n${requestedDocument ? `📄 Document Needed: *${requestedDocument}*\n\n` : ''}Please respond in your dashboard to continue loan processing.`,
    recipient: userPhone
  });

  addCommunicationLog({
    loanId,
    stageId,
    channel: 'sms',
    category: 'query',
    title: `SMS Query Alert: ${title}`,
    message: `PARROT LOANS: Immediate action needed on App #${loanId.slice(-8).toUpperCase()} for ${stageName}. Bank query raised: ${title}. Open app to reply.`,
    recipient: userPhone
  });

  addCommunicationLog({
    loanId,
    stageId,
    channel: 'email',
    category: 'query',
    title: `Urgent Verification Query: ${title}`,
    subject: `Attention Required: Bank Inquiry on Loan Application #${loanId.slice(-8).toUpperCase()}`,
    message: `Dear Applicant,\n\nDuring review of your file for ${stageName}, the credit desk has raised the following query:\n\n${title}\n${description}\n\n${requestedDocument ? `Requested Documentation: ${requestedDocument}\n\n` : ''}Kindly upload the file or submit your clarification directly through your loan portal.\n\nThank you,\nCredit Underwriting Committee`,
    recipient: userEmail
  });

  return q;
}
