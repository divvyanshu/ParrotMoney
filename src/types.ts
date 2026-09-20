export type UserRole = 'client' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mobile?: string;
  phoneNumber?: string;
  createdAt: string;
}

export type LoanStatus = 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';

export interface LoanApplication {
  id: string;
  userId: string;
  propertyValue: number;
  loanAmount: number;
  state: string;
  scheme: string;
  employmentType: string;
  employerCategory: string;
  monthlyIncome: number;
  currentBanker: string;
  cibilScore: number;
  hasDefault: string;
  existingEMIs: number;
  isJointLoan: string;
  coApplicantIncome: number;
  fullName: string;
  mobileNumber: string;
  selectedBank?: {
    name: string;
    rate: string;
  };
  status: LoanStatus;
  createdAt: any;
  updatedAt: any;
}

export interface ClosingCosts {
  originationFee: number;
  appraisalFee: number;
  titleInsurance: number;
  escrowPrepaid: number;
  total: number;
}

export interface LoanDocument {
  id: string;
  loanId: string;
  name: string;
  type: string;
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
}

export interface Article {
  id: string;
  category: string;
  imageUrl: string;
  title: string;
  description: string;
  author: string;
  role: string;
  date: string;
  readTime: string;
  accentColor?: string;
  content: string;
  published?: boolean;
}

export interface AnnouncementBanner {
  id: string;
  text: string;
  active: boolean;
  type: 'info' | 'promo' | 'alert';
  linkUrl?: string;
}

export interface BankOffer {
  id?: string;
  name: string;
  rate: string;
  processingTime: string;
  features: string[];
  rating: number;
  score: number;
  featured?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'milestone' | 'alert' | 'info';
  read: boolean;
  createdAt: string;
}

export type LoanStageId = 
  | 'application_submitted'
  | 'documents_verified'
  | 'technical_inspection'
  | 'legal_approval'
  | 'sanctioned'
  | 'disbursed';

export type StageProgressState = 'completed' | 'in_progress' | 'pending' | 'action_required' | 'rejected';

export interface StageTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  requiredForNextStage?: boolean;
}

export interface LoanStageInfo {
  id: LoanStageId;
  order: number;
  name: string;
  shortDesc: string;
  detailedDesc: string;
  status: StageProgressState;
  completedAt?: string;
  estimatedDate?: string;
  officerName?: string;
  officerRole?: string;
  officerContact?: string;
  tasks: StageTask[];
  actionRequiredText?: string;
}

export type CommunicationChannel = 'whatsapp' | 'sms' | 'email' | 'in_app';

export interface CommunicationLogEntry {
  id: string;
  loanId: string;
  userId: string;
  channel: CommunicationChannel;
  category: 'stage_update' | 'query' | 'document_request' | 'reminder' | 'sanction_alert' | 'emi_reminder';
  title: string;
  subject?: string;
  message: string;
  recipient: string;
  timestamp: string;
  deliveryStatus: 'delivered' | 'read' | 'sent' | 'pending';
  metadata?: {
    stageId?: LoanStageId;
    queryId?: string;
    documentType?: string;
    actionUrl?: string;
    emiAmount?: number;
    emiDueDate?: string;
    bankName?: string;
  };
}

export interface LoanQuery {
  id: string;
  loanId: string;
  stageId: LoanStageId;
  title: string;
  description: string;
  requestedDocument?: string;
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface AlgorithmParams {
  cibilThreshold: number;
  cibilPenalty: number;
  maxAgeLimit: number;
  agePenalty: number;
  maxLtvRatio: number;
  maxFoirRatio: number;
  coBorrowerMultiplier: number;
  salaryMatchBonus: number;
}

export interface RuleChangeHistoryEntry {
  id: string;
  version: string;
  timestamp: string;
  author: string;
  reason: string;
  presetApplied?: string;
  params: AlgorithmParams;
  changesSummary: {
    field: keyof AlgorithmParams;
    label: string;
    from: number;
    to: number;
  }[];
}



