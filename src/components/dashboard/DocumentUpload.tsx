import React, { useState, useRef, useMemo } from 'react';
import { 
  FileText, 
  Check, 
  CheckCircle2, 
  FileUp, 
  Loader2, 
  ShieldCheck, 
  Info, 
  Eye, 
  X, 
  UploadCloud, 
  AlertTriangle, 
  Sparkles, 
  Lock, 
  FileCheck, 
  RefreshCw, 
  Trash2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  Clock,
  ChevronRight,
  Briefcase,
  Building2,
  Users,
  Home,
  Landmark,
  BadgeCheck,
  Receipt,
  Scale,
  CreditCard,
  Layers,
  ArrowUpRight,
  Scan,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export type ApplicantType = 'salaried' | 'self_employed_business';

export interface SecurityScanInfo {
  status: 'scanning' | 'clean';
  scannedAt: string;
  threatsFound: number;
  engine: string;
  signatureHash: string;
  fileSanitized: boolean;
}

export interface DocumentItem {
  id: string;
  label: string;
  category: 'Primary KYC' | 'Income & Financials' | 'Joint Applicant' | 'Property & Legal';
  desc: string;
  mandatory: boolean;
  applicableFor: ('salaried' | 'self_employed_business' | 'all')[];
  isCoApplicantDoc?: boolean;
  guidelines: {
    format: string;
    maxSize: string;
    dos: string[];
    donts: string[];
    acceptedFormats: string[];
    sampleName: string;
  };
}

export const ALL_DOCUMENTS: DocumentItem[] = [
  // 1. PRIMARY KYC
  {
    id: 'pan_card',
    label: 'Primary Applicant PAN Card',
    category: 'Primary KYC',
    desc: 'Government of India issued Permanent Account Number identity & tax card',
    mandatory: true,
    applicableFor: ['all'],
    guidelines: {
      format: 'PDF, High-Res Color JPG/PNG',
      maxSize: '5 MB',
      dos: [
        'Place on a clean flat background with all 4 card corners visible',
        'Ensure name, PAN number, date of birth, and signature are crystal clear',
        'e-PAN download or laminated physical card scans are fully accepted'
      ],
      donts: [
        'Avoid flash reflections/glare over the laminated photo or signature',
        'Do not crop edges or submit low-resolution black-and-white photocopies',
        'Do not submit expired or damaged cards'
      ],
      acceptedFormats: ['PDF', 'JPEG', 'PNG'],
      sampleName: 'PAN_Primary_Applicant.pdf'
    }
  },
  {
    id: 'aadhaar_card',
    label: 'Aadhaar Card (Front & Back / e-Aadhaar)',
    category: 'Primary KYC',
    desc: 'UIDAI issued Aadhaar card or masked e-Aadhaar with verified QR code',
    mandatory: true,
    applicableFor: ['all'],
    guidelines: {
      format: 'UIDAI e-Aadhaar PDF or Color Scan',
      maxSize: '5 MB',
      dos: [
        'Both Front (Photo/Name/DOB) and Back (Permanent Address) must be scanned',
        'Masked Aadhaar (showing only last 4 digits) is accepted and encouraged',
        'Ensure UIDAI digital signature verification tick mark is visible'
      ],
      donts: [
        'Do not submit password-protected e-Aadhaar without removing the PIN',
        'Do not submit only front side where address verification is missing',
        'Ensure residential address matches current communications'
      ],
      acceptedFormats: ['PDF', 'JPEG', 'PNG'],
      sampleName: 'Aadhaar_Front_Back.pdf'
    }
  },

  // 2. SALARIED: INCOME & FINANCIALS
  {
    id: 'form_16',
    label: 'Form 16 (Part A & Part B - Last 2 FYs)',
    category: 'Income & Financials',
    desc: 'Issued by employer for FY 2024-25 & FY 2023-24 with official TRACES watermark',
    mandatory: true,
    applicableFor: ['salaried'],
    guidelines: {
      format: 'Official TRACES Generated PDF',
      maxSize: '10 MB',
      dos: [
        'Must include both Part A (TDS summary) & Part B (Salary breakdown annexure)',
        'Ensure official TRACES watermark is intact on all pages',
        'Must carry digital or physical stamp of authorized employer signatory'
      ],
      donts: [
        'Do not submit password-protected PDF files without unlocking',
        'Avoid submitting only Part A without the detailed Part B Annexure',
        'Do not alter or edit the digital employer salary amounts'
      ],
      acceptedFormats: ['PDF'],
      sampleName: 'Form16_FY24_25_PartA_B.pdf'
    }
  },
  {
    id: 'salary_slips',
    label: 'Salary Slips (Last 3 Consecutive Months)',
    category: 'Income & Financials',
    desc: 'Monthly pay slips reflecting gross salary, statutory deductions (PF/PT), and net take-home',
    mandatory: true,
    applicableFor: ['salaried'],
    guidelines: {
      format: 'Official Company Payslips (PDF)',
      maxSize: '8 MB',
      dos: [
        'Include latest 3 consecutive calendar months',
        'Must show company logo, employee code, UAN, and designation',
        'Net take-home pay must match salary credits in bank statement'
      ],
      donts: [
        'Do not submit handwritten slips or unverified email draft text',
        'Do not crop off employer company header or deduction columns'
      ],
      acceptedFormats: ['PDF', 'JPEG'],
      sampleName: 'SalarySlips_Last3Months.pdf'
    }
  },
  {
    id: 'salary_bank_statement',
    label: 'Salary Bank Account Statement (6 Months)',
    category: 'Income & Financials',
    desc: 'Continuous statement showing 6 consecutive monthly salary credit entries',
    mandatory: true,
    applicableFor: ['salaried'],
    guidelines: {
      format: 'Original NetBanking e-Statement PDF',
      maxSize: '15 MB',
      dos: [
        'Download official consolidated PDF statement from online netbanking',
        'Verify Account Number, IFSC code, customer name & address are clear',
        'Must reflect last 6 consecutive salary credits without date gaps'
      ],
      donts: [
        'Do not take mobile camera photos of desktop screens or passbooks',
        'Avoid cropped statements that omit running balances or bank headers',
        'Password-protected statements must have passwords removed'
      ],
      acceptedFormats: ['PDF'],
      sampleName: 'Salary_Bank_Statement_6M.pdf'
    }
  },

  // 3. SELF-EMPLOYED / BUSINESS: FINANCIALS, TAX & REGISTRATIONS
  {
    id: 'business_itr',
    label: 'ITR-V & Computation of Income (Last 3 FYs)',
    category: 'Income & Financials',
    desc: 'Income Tax Returns for AY 2025-26, 2024-25 & 2023-24 with full CA computation',
    mandatory: true,
    applicableFor: ['self_employed_business'],
    guidelines: {
      format: 'ITD e-Filing Acknowledgement & CA Computation PDF',
      maxSize: '15 MB',
      dos: [
        'Include official ITD acknowledgement receipt (ITR-V) with e-verification barcode',
        'Attach complete CA Computation of Total Income sheet for all 3 assessment years',
        'Include Tax Audit Report (Form 3CD/3CB) if turnover exceeds statutory limits'
      ],
      donts: [
        'Do not submit draft computation sheets without ITD e-filing acknowledgement',
        'Avoid submitting returns marked as "Defective" or "Verification Pending"',
        'Ensure PAN matches business proprietor / entity'
      ],
      acceptedFormats: ['PDF'],
      sampleName: 'ITR_Computation_3Years.pdf'
    }
  },
  {
    id: 'audited_financials',
    label: 'Audited Balance Sheet & Profit & Loss Statement (3 Yrs)',
    category: 'Income & Financials',
    desc: 'Audited financials signed by Chartered Accountant with valid UDIN seal & schedule notes',
    mandatory: true,
    applicableFor: ['self_employed_business'],
    guidelines: {
      format: 'Audited Financials PDF with CA UDIN',
      maxSize: '20 MB',
      dos: [
        'Must include Balance Sheet, Profit & Loss Account, Depreciation Schedule & Notes to Accounts',
        'Ensure valid ICAI UDIN number is printed and verifiable on CA certificate',
        'Must cover last 3 financial years'
      ],
      donts: [
        'Do not submit provisional estimates without CA certification',
        'Do not omit depreciation or loan liability schedules'
      ],
      acceptedFormats: ['PDF'],
      sampleName: 'Audited_Financials_3Years_UDIN.pdf'
    }
  },
  {
    id: 'gst_returns_cert',
    label: 'GST Registration Certificate & 12 Months GST Returns (GSTR-3B / 1)',
    category: 'Income & Financials',
    desc: 'GST REG-06 Certificate along with monthly/quarterly filed returns for turnover verification',
    mandatory: true,
    applicableFor: ['self_employed_business'],
    guidelines: {
      format: 'GST Portal Official Downloads PDF',
      maxSize: '15 MB',
      dos: [
        'Provide full 3-page GST REG-06 Certificate showing principal place of business',
        'Include last 12 continuous months of GSTR-3B & GSTR-1 filed returns',
        'Turnover on GST portal must align with bank account turnover'
      ],
      donts: [
        'Do not submit cancelled or suspended GST registrations',
        'Do not omit recent filing acknowledgements'
      ],
      acceptedFormats: ['PDF'],
      sampleName: 'GST_Returns_12Months_REG06.pdf'
    }
  },
  {
    id: 'business_banking',
    label: 'Business Current & Savings Account Statements (12 Months)',
    category: 'Income & Financials',
    desc: '12 months continuous bank statements for all primary business and operating accounts',
    mandatory: true,
    applicableFor: ['self_employed_business'],
    guidelines: {
      format: 'Original NetBanking e-Statement PDF',
      maxSize: '20 MB',
      dos: [
        'Download official e-statements for the last 12 months without date interruptions',
        'Statements should reflect customer transactions, CC/OD limits, and business inflows',
        'Include both Primary Current Account and Individual Savings Account'
      ],
      donts: [
        'Do not take mobile screen photos or submit incomplete page ranges',
        'Ensure password encryption is removed before uploading'
      ],
      acceptedFormats: ['PDF'],
      sampleName: 'Current_Account_Statement_12M.pdf'
    }
  },
  {
    id: 'business_proof',
    label: 'Business Proof & Establishment Registration',
    category: 'Income & Financials',
    desc: 'Udyam Aadhaar / Shop & Establishment Act / Certificate of Incorporation / Partnership Deed',
    mandatory: false,
    applicableFor: ['self_employed_business'],
    guidelines: {
      format: 'Government Certificate PDF / Color Scan',
      maxSize: '10 MB',
      dos: [
        'Submit active MSME Udyam Registration, Gumasta License, or MCA Incorporation',
        'Ensure registered trade name and business address are up-to-date',
        'Include Partnership Deed or MOA/AOA for corporate entities'
      ],
      donts: [
        'Do not submit expired municipal trade licenses'
      ],
      acceptedFormats: ['PDF', 'JPEG', 'PNG'],
      sampleName: 'Udyam_MSME_Certificate.pdf'
    }
  },

  // 4. JOINT / CO-APPLICANT DOCUMENTS
  {
    id: 'co_app_pan',
    label: 'Co-Applicant PAN Card',
    category: 'Joint Applicant',
    desc: 'Identity & tax card for spouse, parent, or joint property co-borrower',
    mandatory: false,
    isCoApplicantDoc: true,
    applicableFor: ['all'],
    guidelines: {
      format: 'PDF, High-Res Color JPG/PNG',
      maxSize: '5 MB',
      dos: [
        'Ensure co-applicant full name matches relationship declaration',
        'High-resolution color scan with all 4 corners visible'
      ],
      donts: [
        'Avoid flash glare over the photo or signature'
      ],
      acceptedFormats: ['PDF', 'JPEG', 'PNG'],
      sampleName: 'CoApplicant_PAN.pdf'
    }
  },
  {
    id: 'co_app_aadhaar',
    label: 'Co-Applicant Aadhaar Card (Front & Back)',
    category: 'Joint Applicant',
    desc: 'UIDAI address and KYC proof for joint borrower',
    mandatory: false,
    isCoApplicantDoc: true,
    applicableFor: ['all'],
    guidelines: {
      format: 'UIDAI e-Aadhaar PDF or Color Scan',
      maxSize: '5 MB',
      dos: [
        'Include front & back with permanent address clearly visible',
        'Masked Aadhaar is accepted'
      ],
      donts: [
        'Do not upload password locked documents'
      ],
      acceptedFormats: ['PDF', 'JPEG', 'PNG'],
      sampleName: 'CoApplicant_Aadhaar.pdf'
    }
  },
  {
    id: 'co_app_income',
    label: 'Co-Applicant Income Proof (Form 16 / Salary Slips / ITR)',
    category: 'Joint Applicant',
    desc: 'Income documents if co-applicant’s income is being clubbed for higher loan eligibility',
    mandatory: false,
    isCoApplicantDoc: true,
    applicableFor: ['all'],
    guidelines: {
      format: 'Official PDF (Form 16, Salary Slips or ITR-V)',
      maxSize: '10 MB',
      dos: [
        'Submit latest 3 months salary slips or Form 16 Part A & B for salaried co-borrowers',
        'Submit last 2 years ITR for self-employed co-borrowers'
      ],
      donts: [
        'Do not submit illegible or cropped pay records'
      ],
      acceptedFormats: ['PDF'],
      sampleName: 'CoApplicant_Income_Records.pdf'
    }
  },
  {
    id: 'co_app_bank_statement',
    label: 'Co-Applicant Bank Statement (6 Months)',
    category: 'Joint Applicant',
    desc: '6 months bank statement showing income credits for joint borrower',
    mandatory: false,
    isCoApplicantDoc: true,
    applicableFor: ['all'],
    guidelines: {
      format: 'Original NetBanking e-Statement PDF',
      maxSize: '15 MB',
      dos: [
        'Consolidated netbanking statement for the last 6 months'
      ],
      donts: [
        'Do not upload password locked statements'
      ],
      acceptedFormats: ['PDF'],
      sampleName: 'CoApplicant_Bank_Statement.pdf'
    }
  },

  // 5. PROPERTY & LEGAL COLLATERAL DOCUMENTS
  {
    id: 'property_sale_agreement',
    label: 'Registered Agreement for Sale / Sale Deed / Allotment Letter',
    category: 'Property & Legal',
    desc: 'Executed buyer-builder agreement or registered sale deed carrying sub-registrar stamp & index-II',
    mandatory: true,
    applicableFor: ['all'],
    guidelines: {
      format: 'Registered Agreement PDF / Scan',
      maxSize: '25 MB',
      dos: [
        'Include all pages from page 1 to the final registration execution & sub-registrar stamp page',
        'Attach Index-II copy and stamp duty payment receipt',
        'Must reflect unit number, carpet area, survey/khasra number, and total consideration value'
      ],
      donts: [
        'Do not upload draft agreements without official registration number & stamps',
        'Ensure no missing middle annexure pages or schedule sheets'
      ],
      acceptedFormats: ['PDF'],
      sampleName: 'Registered_Sale_Agreement_IndexII.pdf'
    }
  },
  {
    id: 'property_approved_layout',
    label: 'Approved Building Layout Plan & Municipal Sanction Letter',
    category: 'Property & Legal',
    desc: 'Sanction letter from local municipal authority (e.g. BMC, BBMP, HMDA, DTCP, CMDA) with approved floor map',
    mandatory: true,
    applicableFor: ['all'],
    guidelines: {
      format: 'Town Planning Sanction Order & Map PDF',
      maxSize: '15 MB',
      dos: [
        'Include town planning approval letter with validity dates and sanctioned floor count',
        'Building floor plan highlighting your specific apartment / plot location'
      ],
      donts: [
        'Do not submit conceptual marketing brochures instead of statutory approvals'
      ],
      acceptedFormats: ['PDF', 'JPEG'],
      sampleName: 'Municipal_Sanction_Plan_Approval.pdf'
    }
  },
  {
    id: 'property_chain_title',
    label: 'Chain of Title Deeds / Mother Deed (13–30 Years)',
    category: 'Property & Legal',
    desc: 'Historical ownership trail establishing clear, marketable, and unencumbered title rights',
    mandatory: false,
    applicableFor: ['all'],
    guidelines: {
      format: 'Prior Title Deeds Consolidated PDF',
      maxSize: '30 MB',
      dos: [
        'Include prior transfer deeds, conveyance deeds, development agreements, and GPA if applicable',
        'Essential for legal verification report by bank empaneled advocate'
      ],
      donts: [
        'Do not omit intermediate ownership transfer links'
      ],
      acceptedFormats: ['PDF'],
      sampleName: 'Chain_Of_Title_MotherDeed_30Y.pdf'
    }
  },
  {
    id: 'property_tax_oc_ec',
    label: 'Latest Property Tax Receipt / Occupancy Certificate (OC) / Encumbrance Certificate (EC)',
    category: 'Property & Legal',
    desc: 'Latest municipal property tax payment receipt, Form 15 Encumbrance Certificate & OC',
    mandatory: true,
    applicableFor: ['all'],
    guidelines: {
      format: 'Government Receipts & Sub-Registrar EC PDF',
      maxSize: '10 MB',
      dos: [
        'Recent property tax paid challan/receipt for the current assessment year',
        'Encumbrance Certificate (Form 15) covering last 13 to 30 years from Sub-Registrar',
        'Occupancy Certificate (OC) or Possession Letter for ready-to-move properties'
      ],
      donts: [
        'Do not submit outdated tax receipts from previous years'
      ],
      acceptedFormats: ['PDF', 'JPEG', 'PNG'],
      sampleName: 'PropertyTax_Receipt_EC_OC.pdf'
    }
  }
];

export const CATEGORY_TO_TYPE_LABEL: Record<string, string> = {
  'Primary KYC': 'ID Proof',
  'Income & Financials': 'Income Proof',
  'Property & Legal': 'Property Deed',
  'Joint Applicant': 'Joint Applicant Proof'
};

export interface DocumentUploadProps {
  loanId: string;
  documents: string[];
  onUploadComplete: (docId: string) => void;
  onDeleteDocument?: (docId: string) => void;
  className?: string;
}

interface QueuedFile {
  file: File;
  targetDocId: string;
  previewUrl: string;
  sizeFormatted: string;
  id: string;
}

export function DocumentUpload({
  loanId,
  documents,
  onUploadComplete,
  onDeleteDocument,
  className
}: DocumentUploadProps) {
  // Sync internal document state for instant local and parent reactivity
  const [internalDocs, setInternalDocs] = useState<string[]>(documents);
  React.useEffect(() => {
    setInternalDocs(documents);
  }, [documents]);
  const activeDocs = internalDocs;

  const [applicantType, setApplicantType] = useState<ApplicantType>('salaried');
  const [includeCoApplicant, setIncludeCoApplicant] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Pre-Upload Document Type Specification State
  const [specifiedDocType, setSpecifiedDocType] = useState<string>('auto'); // 'auto' | 'ID Proof' | 'Income Proof' | 'Property Deed' | 'Joint Applicant Proof'
  const [specifiedDocId, setSpecifiedDocId] = useState<string>('auto');

  // Deletion Confirmation Dialog State
  const [documentToDelete, setDocumentToDelete] = useState<DocumentItem | null>(null);
  const [deleteToastMessage, setDeleteToastMessage] = useState<string | null>(null);
  
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [activeProgress, setActiveProgress] = useState<number>(0);
  const [activeTooltipDocId, setActiveTooltipDocId] = useState<string | null>(null);
  
  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{
    docItem: DocumentItem;
    fileObj?: File | null;
    mockUrl?: string;
    fileName: string;
    fileSize: string;
    isPreUpload: boolean;
  } | null>(null);

  // Zoom level in preview modal
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  // Bulk Upload State
  const [isDragOver, setIsDragOver] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const [activeSingleUploadTarget, setActiveSingleUploadTarget] = useState<string | null>(null);

  // Security & Antivirus simulated scan state per document
  const [securityScans, setSecurityScans] = useState<Record<string, SecurityScanInfo>>({});

  // Helper to retrieve scan status or default to validated
  const getSecurityScan = (docId: string): SecurityScanInfo => {
    if (securityScans[docId]) {
      return securityScans[docId];
    }
    return {
      status: 'clean',
      scannedAt: 'Verified on upload',
      threatsFound: 0,
      engine: 'ClamAV 1.4 & Parrot ThreatGuard AI',
      signatureHash: `SHA-256:${docId.slice(0, 4).toUpperCase()}8F1...92E`,
      fileSanitized: true
    };
  };

  // Trigger simulated antivirus & security scanning lifecycle
  const triggerSimulatedScan = (docId: string, durationMs: number = 2200) => {
    setSecurityScans(prev => ({
      ...prev,
      [docId]: {
        status: 'scanning',
        scannedAt: 'Scanning in progress...',
        threatsFound: 0,
        engine: 'ClamAV 1.4 & Parrot ThreatGuard AI',
        signatureHash: 'SHA-256:CALCULATING...',
        fileSanitized: false
      }
    }));

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      setSecurityScans(prev => ({
        ...prev,
        [docId]: {
          status: 'clean',
          scannedAt: `Today at ${timeStr}`,
          threatsFound: 0,
          engine: 'ClamAV 1.4 & Parrot ThreatGuard AI',
          signatureHash: `SHA-256:${Math.random().toString(36).substring(2, 8).toUpperCase()}9c4a${docId.slice(0, 3).toUpperCase()}`,
          fileSanitized: true
        }
      }));
    }, durationMs);
  };

  // Filter applicable documents based on applicant profile and co-applicant toggle
  const applicableDocuments = useMemo(() => {
    return ALL_DOCUMENTS.filter(doc => {
      // Co-applicant filter
      if (doc.isCoApplicantDoc && !includeCoApplicant) {
        return false;
      }
      // Employment / entity profile filter
      if (doc.applicableFor.includes('all')) {
        return true;
      }
      return doc.applicableFor.includes(applicantType);
    });
  }, [applicantType, includeCoApplicant]);

  // Filter by category tab
  const displayedDocuments = useMemo(() => {
    if (selectedCategory === 'All') return applicableDocuments;
    return applicableDocuments.filter(doc => doc.category === selectedCategory);
  }, [applicableDocuments, selectedCategory]);

  // Format bytes helper
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Smart heuristic to match file name to document ID
  const guessDocumentId = (filename: string): string => {
    const lower = filename.toLowerCase();
    
    // Co-applicant matching first
    if (lower.includes('co_app') || lower.includes('coapp') || lower.includes('joint') || lower.includes('spouse') || lower.includes('co_applicant')) {
      if (lower.includes('pan')) return 'co_app_pan';
      if (lower.includes('aadhaar') || lower.includes('aadhar')) return 'co_app_aadhaar';
      if (lower.includes('bank') || lower.includes('statement')) return 'co_app_bank_statement';
      return 'co_app_income';
    }

    // Primary KYC
    if (lower.includes('pan')) return 'pan_card';
    if (lower.includes('aadhaar') || lower.includes('aadhar') || lower.includes('uidai')) return 'aadhaar_card';

    // Salaried documents
    if (lower.includes('form16') || lower.includes('form 16') || lower.includes('form_16') || lower.includes('tds')) return 'form_16';
    if (lower.includes('salary') && (lower.includes('slip') || lower.includes('payslip') || lower.includes('pay_slip'))) return 'salary_slips';
    if (lower.includes('salary') && (lower.includes('bank') || lower.includes('stmt') || lower.includes('statement'))) return 'salary_bank_statement';

    // Self-Employed / Business documents
    if (lower.includes('gst') || lower.includes('gstr') || lower.includes('reg06')) return 'gst_returns_cert';
    if (lower.includes('audit') || lower.includes('balance') || lower.includes('p&l') || lower.includes('profit') || lower.includes('udin')) return 'audited_financials';
    if (lower.includes('current') && (lower.includes('bank') || lower.includes('statement') || lower.includes('account'))) return 'business_banking';
    if (lower.includes('udyam') || lower.includes('msme') || lower.includes('shop') || lower.includes('gumasta') || lower.includes('incorporation')) return 'business_proof';
    if (lower.includes('itr') || lower.includes('tax') || lower.includes('computation')) return applicantType === 'salaried' ? 'form_16' : 'business_itr';

    // Property documents
    if (lower.includes('sale') || lower.includes('agreement') || lower.includes('deed') || lower.includes('allotment') || lower.includes('index')) return 'property_sale_agreement';
    if (lower.includes('layout') || lower.includes('sanction') || lower.includes('municipal') || lower.includes('plan')) return 'property_approved_layout';
    if (lower.includes('mother') || lower.includes('chain') || lower.includes('title')) return 'property_chain_title';
    if (lower.includes('property_tax') || lower.includes('tax_receipt') || lower.includes('oc') || lower.includes('ec') || lower.includes('encumbrance')) return 'property_tax_oc_ec';

    // Default fallback to first unuploaded applicable document
    const pending = applicableDocuments.find(d => !activeDocs.includes(d.id));
    return pending ? pending.id : 'pan_card';
  };

  // Filtered target documents matching the selected document type
  const filteredTargetOptions = useMemo(() => {
    if (specifiedDocType === 'auto') {
      return applicableDocuments;
    }
    return applicableDocuments.filter(
      doc => CATEGORY_TO_TYPE_LABEL[doc.category] === specifiedDocType
    );
  }, [specifiedDocType, applicableDocuments]);

  // When doc type changes, update the target slot to first available of that type
  const handleDocTypeChange = (newType: string) => {
    setSpecifiedDocType(newType);
    if (newType === 'auto') {
      setSpecifiedDocId('auto');
    } else {
      const matching = applicableDocuments.filter(
        doc => CATEGORY_TO_TYPE_LABEL[doc.category] === newType
      );
      const firstUnuploaded = matching.find(d => !activeDocs.includes(d.id));
      setSpecifiedDocId(firstUnuploaded ? firstUnuploaded.id : (matching[0]?.id || 'auto'));
    }
  };

  // Trigger file upload targeted to the specified document slot
  const handleUploadForSpecifiedType = () => {
    if (specifiedDocId !== 'auto') {
      setActiveSingleUploadTarget(specifiedDocId);
      singleFileInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  // Switch target document in pre-upload preview modal
  const updatePreviewDocTarget = (newDocId: string) => {
    const newTarget = ALL_DOCUMENTS.find(d => d.id === newDocId);
    if (newTarget && previewDoc) {
      setPreviewDoc({
        ...previewDoc,
        docItem: newTarget
      });
    }
  };

  // Execute deletion of an incorrectly uploaded document
  const confirmDeleteDocument = (docId: string) => {
    setInternalDocs(prev => prev.filter(id => id !== docId));
    onDeleteDocument?.(docId);
    setSecurityScans(prev => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
    if (previewDoc && previewDoc.docItem.id === docId) {
      setPreviewDoc(null);
    }
    const target = ALL_DOCUMENTS.find(d => d.id === docId);
    setDeleteToastMessage(`Removed "${target?.label || docId}" from application vault.`);
    setTimeout(() => {
      setDeleteToastMessage(null);
    }, 4000);
    setDocumentToDelete(null);
  };

  // Handle Drag & Drop Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(Array.from(e.target.files));
    }
  };

  const processIncomingFiles = (files: File[]) => {
    const newQueued: QueuedFile[] = files.map((file, index) => {
      let targetDocId = specifiedDocId !== 'auto' && index === 0
        ? specifiedDocId
        : guessDocumentId(file.name);

      if (specifiedDocType !== 'auto' && specifiedDocId === 'auto') {
        const matchingDoc = applicableDocuments.find(
          d => CATEGORY_TO_TYPE_LABEL[d.category] === specifiedDocType && !activeDocs.includes(d.id)
        );
        if (matchingDoc) {
          targetDocId = matchingDoc.id;
        }
      }

      return {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        file,
        targetDocId,
        previewUrl: URL.createObjectURL(file),
        sizeFormatted: formatFileSize(file.size)
      };
    });

    setQueuedFiles(prev => [...prev, ...newQueued]);
  };

  const removeQueuedFile = (id: string) => {
    setQueuedFiles(prev => prev.filter(item => item.id !== id));
  };

  const updateQueueTarget = (fileId: string, newTargetDocId: string) => {
    setQueuedFiles(prev => prev.map(item => item.id === fileId ? { ...item, targetDocId: newTargetDocId } : item));
  };

  // Launch Pre-Upload Preview Modal
  const openPreUploadPreview = (docItem: DocumentItem, file?: File) => {
    setPreviewZoom(100);
    setPreviewDoc({
      docItem,
      fileObj: file || null,
      fileName: file ? file.name : docItem.guidelines.sampleName,
      fileSize: file ? formatFileSize(file.size) : '1.85 MB',
      isPreUpload: true
    });
  };

  // Launch Verified Preview Modal
  const openVerifiedPreview = (docItem: DocumentItem) => {
    setPreviewZoom(100);
    setPreviewDoc({
      docItem,
      fileObj: null,
      fileName: docItem.guidelines.sampleName,
      fileSize: '2.40 MB',
      isPreUpload: false
    });
  };

  // Execute Encryption & Upload for Single Document
  const finalizeSingleUpload = (docId: string) => {
    setPreviewDoc(null);
    setUploadingDocId(docId);
    setActiveProgress(0);

    const interval = setInterval(() => {
      setActiveProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 12;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setInternalDocs(prev => prev.includes(docId) ? prev : [...prev, docId]);
      onUploadComplete(docId);
      triggerSimulatedScan(docId, 2200);
      
      // Remove from queued list if present
      setQueuedFiles(prev => prev.filter(q => q.targetDocId !== docId));
      
      setUploadingDocId(null);
      setActiveProgress(0);
    }, 1200);
  };

  // Execute Batch Encryption & Upload
  const executeBatchUpload = () => {
    if (queuedFiles.length === 0) return;
    setIsBatchUploading(true);
    setBatchProgress(10);

    let step = 0;
    const total = queuedFiles.length;

    const interval = setInterval(() => {
      step += 1;
      const pct = Math.min(Math.round((step / (total * 3)) * 100), 95);
      setBatchProgress(pct);
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setBatchProgress(100);

      const uploadedDocIds = queuedFiles.map(q => q.targetDocId);
      setInternalDocs(prev => Array.from(new Set([...prev, ...uploadedDocIds])));

      queuedFiles.forEach((q, idx) => {
        onUploadComplete(q.targetDocId);
        triggerSimulatedScan(q.targetDocId, 1800 + idx * 400);
      });

      setTimeout(() => {
        setQueuedFiles([]);
        setIsBatchUploading(false);
        setBatchProgress(0);
      }, 500);
    }, total * 750);
  };

  // Verification timestamp helper
  const getVerificationTimestamp = (docId: string) => {
    const hoursAgo = docId.includes('pan') ? 48 : docId.includes('16') || docId.includes('itr') ? 24 : 12;
    const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    return {
      exactTime: date.toLocaleString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }),
      relative: `${hoursAgo} hrs ago`,
      auditId: `NSDL-KYC-${docId.slice(0, 4).toUpperCase()}-9842`,
      hash: 'SHA-256 Validated'
    };
  };

  const verifiedCount = applicableDocuments.filter(d => activeDocs.includes(d.id)).length;
  const progressPercent = Math.round((verifiedCount / Math.max(applicableDocuments.length, 1)) * 100);

  // Category counts
  const categories = ['All', 'Primary KYC', 'Income & Financials', 'Joint Applicant', 'Property & Legal'];

  return (
    <div 
      id="document-upload-section" 
      className={cn("DocumentUpload bg-white rounded-[2.5rem] border border-natural-border shadow-xl p-6 md:p-8 space-y-8 relative", className)}
    >
      {/* Top Header & Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-natural-border/60">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-2xl font-black text-natural-sage tracking-tight">Loan Documentation & Underwriting Vault</h3>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              AES-256 Military Grade Encryption
            </span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              Live Antivirus & Threat Sandbox Active
            </span>
          </div>
          <p className="text-natural-muted text-xs md:text-sm mt-1">
            Compliant with RBI digital lending directives for Home Loans & LAP (Application #{loanId?.slice(-6) || '9842'}).
          </p>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-4 bg-natural-panel/80 p-3.5 rounded-2xl border border-natural-border self-start lg:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted block">Verification Progress</span>
            <span className="text-sm font-bold text-natural-sage">{verifiedCount} of {applicableDocuments.length} Verified</span>
          </div>
          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-natural-sage">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Profile Selector Controls: Salaried vs Business / Self-Employed & Joint Applicant Switch */}
      <div className="bg-gradient-to-r from-natural-panel/80 via-white to-natural-panel/80 p-4 md:p-5 rounded-2xl border border-natural-border/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Profile Switcher */}
        <div className="space-y-1.5 w-full md:w-auto">
          <label className="text-[11px] font-black uppercase tracking-wider text-natural-sage flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-natural-terracotta" />
            Borrower Profile Type
          </label>
          <div className="inline-flex p-1 bg-natural-panel rounded-xl border border-natural-border w-full md:w-auto">
            <button
              type="button"
              onClick={() => setApplicantType('salaried')}
              className={cn(
                "flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                applicantType === 'salaried'
                  ? "bg-white text-natural-sage shadow-sm border border-natural-border/80"
                  : "text-natural-muted hover:text-natural-sage"
              )}
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Salaried Professional</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold border border-emerald-200">Form 16 + Slips</span>
            </button>
            <button
              type="button"
              onClick={() => setApplicantType('self_employed_business')}
              className={cn(
                "flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                applicantType === 'self_employed_business'
                  ? "bg-white text-natural-sage shadow-sm border border-natural-border/80"
                  : "text-natural-muted hover:text-natural-sage"
              )}
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Self-Employed / Businessman</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-md font-semibold border border-amber-200">ITR + GST + Audit</span>
            </button>
          </div>
        </div>

        {/* Joint / Co-Applicant Toggle */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-natural-border shadow-2xs w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              includeCoApplicant ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
            )}>
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-natural-sage">Joint / Co-Applicant</p>
              <p className="text-[10px] text-natural-muted">Include co-borrower KYC & income proofs</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={includeCoApplicant}
            onClick={() => setIncludeCoApplicant(prev => !prev)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
              includeCoApplicant ? "bg-emerald-500" : "bg-slate-300"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                includeCoApplicant ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const count = cat === 'All' 
            ? applicableDocuments.length 
            : applicableDocuments.filter(d => d.category === cat).length;
          
          if (cat === 'Joint Applicant' && !includeCoApplicant) {
            return null;
          }

          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0",
                isSelected 
                  ? "bg-natural-sage text-white shadow-md shadow-natural-sage/15" 
                  : "bg-natural-panel text-natural-muted hover:bg-natural-accent hover:text-natural-sage border border-natural-border/60"
              )}
            >
              {cat === 'Primary KYC' && <CreditCard className="w-3.5 h-3.5" />}
              {cat === 'Income & Financials' && <Landmark className="w-3.5 h-3.5" />}
              {cat === 'Joint Applicant' && <Users className="w-3.5 h-3.5" />}
              {cat === 'Property & Legal' && <Home className="w-3.5 h-3.5" />}
              <span>{cat}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-black",
                isSelected ? "bg-white/20 text-white" : "bg-natural-border text-natural-sage"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 1. Pre-Upload Document Type Specification & Bulk Drag-and-Drop Zone */}
      <div className="space-y-4">
        {/* Pre-Upload Document Type Dropdown Selector Bar */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Specify Document Type Before Upload</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Pre-Upload Setting
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Select document category (e.g. ID Proof, Income Proof, Property Deed) to target your upload
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            {/* Document Type Dropdown Menu */}
            <div className="relative sm:w-52">
              <label htmlFor="doc-type-dropdown" className="sr-only">Specify Document Type</label>
              <select
                id="doc-type-dropdown"
                value={specifiedDocType}
                onChange={(e) => handleDocTypeChange(e.target.value)}
                className="w-full text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:border-slate-400 focus:border-emerald-600 rounded-xl px-3 py-2.5 outline-hidden cursor-pointer shadow-2xs transition-colors"
              >
                <option value="auto">✨ Auto-Detect (AI Classification)</option>
                <option value="ID Proof">🪪 ID Proof (Identity & KYC)</option>
                <option value="Income Proof">💼 Income Proof (Financials)</option>
                <option value="Property Deed">📜 Property Deed (Legal & Title)</option>
                {includeCoApplicant && (
                  <option value="Joint Applicant Proof">👥 Joint Applicant Proof</option>
                )}
              </select>
            </div>

            {/* Target Document Requirement Dropdown Menu */}
            <div className="relative sm:w-64">
              <label htmlFor="doc-slot-dropdown" className="sr-only">Target Document Slot</label>
              <select
                id="doc-slot-dropdown"
                value={specifiedDocId}
                onChange={(e) => setSpecifiedDocId(e.target.value)}
                className="w-full text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:border-slate-400 focus:border-emerald-600 rounded-xl px-3 py-2.5 outline-hidden cursor-pointer shadow-2xs transition-colors truncate"
              >
                {specifiedDocType === 'auto' ? (
                  <option value="auto">All Requirements (AI Smart Route)</option>
                ) : null}
                {filteredTargetOptions.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.label} {activeDocs.includes(doc.id) ? '(Uploaded)' : '(Pending)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Select File Button for this Type */}
            <button
              type="button"
              onClick={handleUploadForSpecifiedType}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition-colors cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>
                {specifiedDocType !== 'auto' ? `Upload ${specifiedDocType}` : 'Browse File'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-natural-terracotta" />
            <span className="text-xs font-black uppercase tracking-wider text-natural-sage">Smart AI Auto-Tagger & Bulk Drag Zone</span>
          </div>
          {specifiedDocType !== 'auto' ? (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Targeting: {specifiedDocType} ({applicableDocuments.find(d => d.id === specifiedDocId)?.label || 'All'})
            </span>
          ) : (
            <span className="text-[11px] text-natural-muted">Upload multi-page PDFs, JPGs, or PNGs up to 25MB each</span>
          )}
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-3xl p-8 transition-all duration-200 text-center cursor-pointer flex flex-col items-center justify-center gap-3 relative overflow-hidden group",
            isDragOver 
              ? "border-emerald-500 bg-emerald-50/50 scale-[1.005]" 
              : "border-natural-border hover:border-emerald-500/60 bg-gradient-to-b from-natural-panel/40 to-white hover:bg-emerald-50/20"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
            isDragOver ? "bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20" : "bg-natural-accent text-natural-sage group-hover:scale-110 group-hover:bg-emerald-100 group-hover:text-emerald-700"
          )}>
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-natural-sage">
              <span className="text-emerald-700 underline underline-offset-2">Click to browse</span> or drag & drop all borrower & property documents here
            </p>
            <p className="text-xs text-natural-muted max-w-lg mx-auto">
              Our intelligent pipeline auto-classifies PAN, Aadhaar, {applicantType === 'salaried' ? 'Form 16, Salary Slips & Bank Statements' : 'ITR, Audited Financials, GST Returns & Current Account'} and Property Deeds with AES-256 encryption.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {applicantType === 'salaried' ? (
              ['PAN Card', 'Aadhaar (UIDAI)', 'Form 16 (Part A/B)', 'Salary Slips (3M)', 'Salary Stmt (6M)', 'Sale Deed / Agreement', 'Municipal Sanction Plan'].map((tag) => (
                <span key={tag} className="text-[10px] font-semibold bg-white border border-natural-border px-2.5 py-1 rounded-full text-natural-muted">
                  {tag}
                </span>
              ))
            ) : (
              ['PAN Card', 'Aadhaar (UIDAI)', '3 Yrs ITR + Computation', 'Audited Balance Sheet (UDIN)', '12M GST Returns', '12M Current A/c', 'Property Documents'].map((tag) => (
                <span key={tag} className="text-[10px] font-semibold bg-white border border-natural-border px-2.5 py-1 rounded-full text-natural-muted">
                  {tag}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Queued Bulk Files Tray */}
        {queuedFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-natural-panel rounded-2xl p-5 border border-natural-border space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-natural-sage">{queuedFiles.length} Document(s) Ready in Queue</span>
              </div>
              <button
                onClick={() => setQueuedFiles([])}
                className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Queue
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {queuedFiles.map((item) => {
                const targetDoc = ALL_DOCUMENTS.find(d => d.id === item.targetDocId);
                return (
                  <div key={item.id} className="bg-white p-3.5 rounded-xl border border-natural-border flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-natural-text truncate">{item.file.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-natural-muted">
                          <span>{item.sizeFormatted}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold truncate">Target: {targetDoc?.label.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Document Type and Slot selector dropdown */}
                      <select
                        value={item.targetDocId}
                        onChange={(e) => updateQueueTarget(item.id, e.target.value)}
                        className="text-[10px] font-bold bg-natural-panel border border-natural-border rounded-lg px-2 py-1 text-natural-sage cursor-pointer outline-hidden max-w-[150px]"
                        title="Specify document type or slot"
                      >
                        <optgroup label="🪪 ID Proof">
                          {applicableDocuments.filter(d => d.category === 'Primary KYC').map(d => (
                            <option key={d.id} value={d.id}>{d.label}</option>
                          ))}
                        </optgroup>
                        <optgroup label="💼 Income Proof">
                          {applicableDocuments.filter(d => d.category === 'Income & Financials').map(d => (
                            <option key={d.id} value={d.id}>{d.label}</option>
                          ))}
                        </optgroup>
                        <optgroup label="📜 Property Deed">
                          {applicableDocuments.filter(d => d.category === 'Property & Legal').map(d => (
                            <option key={d.id} value={d.id}>{d.label}</option>
                          ))}
                        </optgroup>
                        {includeCoApplicant && (
                          <optgroup label="👥 Joint Applicant Proof">
                            {applicableDocuments.filter(d => d.category === 'Joint Applicant').map(d => (
                              <option key={d.id} value={d.id}>{d.label}</option>
                            ))}
                          </optgroup>
                        )}
                      </select>

                      {/* Quick Preview Button */}
                      <button
                        onClick={() => targetDoc && openPreUploadPreview(targetDoc, item.file)}
                        title="Inspect PDF Preview"
                        className="p-1.5 hover:bg-natural-accent text-natural-muted hover:text-natural-sage rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Delete / Remove Button with Trash Can */}
                      <button
                        onClick={() => removeQueuedFile(item.id)}
                        title="Remove file from queue"
                        aria-label="Remove file from queue"
                        className="p-1.5 hover:bg-red-50 text-natural-muted hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Batch Upload Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-natural-muted">
                All files will be verified and stored in your encrypted application vault.
              </div>
              <button
                disabled={isBatchUploading}
                onClick={executeBatchUpload}
                className="w-full sm:w-auto bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#10B981]/20 cursor-pointer disabled:opacity-50"
              >
                {isBatchUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Encrypting Batch ({batchProgress}%)...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Confirm & Encrypt All ({queuedFiles.length})
                  </>
                )}
              </button>
            </div>

            {/* Batch Progress Bar */}
            {isBatchUploading && (
              <div className="w-full space-y-1 pt-1">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${batchProgress}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Hidden single file input for individual upload buttons */}
      <input
        ref={singleFileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0] && activeSingleUploadTarget) {
            const file = e.target.files[0];
            const docItem = ALL_DOCUMENTS.find(d => d.id === activeSingleUploadTarget);
            if (docItem) {
              openPreUploadPreview(docItem, file);
            }
          }
        }}
      />

      {/* 2. Specific Documents Checklist Segmented by Category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-natural-sage">
            Required Documents Checklist ({displayedDocuments.length} items)
          </span>
          <span className="text-[11px] text-natural-muted">Hover (i) for scanning guidelines or badges for audit timestamps</span>
        </div>

        <div className="grid gap-4">
          {displayedDocuments.map((doc) => {
            const isUploaded = activeDocs.includes(doc.id);
            const isCurrentUploading = uploadingDocId === doc.id;
            const isTooltipOpen = activeTooltipDocId === doc.id;
            const vData = getVerificationTimestamp(doc.id);
            const scanInfo = getSecurityScan(doc.id);

            return (
              <div 
                key={doc.id} 
                className={cn(
                  "bg-white p-5 md:p-6 rounded-[2rem] border transition-all duration-200 flex flex-col gap-4 group relative",
                  isUploaded ? "border-emerald-100 hover:border-emerald-300 shadow-2xs" : "border-natural-border hover:border-natural-sage/30 shadow-xs"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                  <div className="flex items-start sm:items-center gap-4 md:gap-5">
                    {/* Icon */}
                    <div className={cn(
                      "p-3.5 md:p-4 rounded-2xl transition-all shrink-0 mt-0.5 sm:mt-0",
                      isUploaded 
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" 
                        : "bg-natural-panel text-natural-muted group-hover:bg-natural-accent group-hover:text-natural-sage"
                    )}>
                      {isUploaded ? (
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                      ) : doc.category === 'Primary KYC' ? (
                        <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                      ) : doc.category === 'Income & Financials' ? (
                        <Landmark className="w-5 h-5 md:w-6 md:h-6" />
                      ) : doc.category === 'Joint Applicant' ? (
                        <Users className="w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <Home className="w-5 h-5 md:w-6 md:h-6" />
                      )}
                    </div>

                    {/* Title, Category & Interactive Info Tooltip */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-natural-panel text-natural-sage border border-natural-border">
                          {doc.category}
                        </span>
                        {doc.mandatory && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Mandatory
                          </span>
                        )}
                        <h4 className="font-bold text-natural-text text-sm md:text-base leading-tight">{doc.label}</h4>
                        
                        {/* Info Tooltip Trigger */}
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTooltipDocId(isTooltipOpen ? null : doc.id);
                            }}
                            onMouseEnter={() => setActiveTooltipDocId(doc.id)}
                            className="p-1 rounded-full text-natural-muted hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            aria-label={`Formatting guidelines for ${doc.label}`}
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>

                          {/* Tooltip Content Popover */}
                          <AnimatePresence>
                            {isTooltipOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 6 }}
                                onMouseLeave={() => setActiveTooltipDocId(null)}
                                className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-80 md:w-96 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl z-50 text-left border border-slate-700 space-y-3 pointer-events-auto"
                              >
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Scanning & Submission Standards</span>
                                  </div>
                                  <button
                                    onClick={() => setActiveTooltipDocId(null)}
                                    className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="text-[11px] text-slate-300 space-y-1">
                                  <p><strong className="text-white">Format:</strong> {doc.guidelines.format} (Max {doc.guidelines.maxSize})</p>
                                </div>

                                {/* DOs */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Best Practices (DO)
                                  </span>
                                  <ul className="text-[11px] text-slate-300 space-y-1 pl-1">
                                    {doc.guidelines.dos.map((item, i) => (
                                      <li key={i} className="flex items-start gap-1.5">
                                        <span className="text-emerald-400 leading-none">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* DON'Ts / Common Mistakes */}
                                <div className="space-y-1 pt-1 border-t border-slate-800">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Mistakes to Avoid (DON'T)
                                  </span>
                                  <ul className="text-[11px] text-slate-300 space-y-1 pl-1">
                                    {doc.guidelines.donts.map((item, i) => (
                                      <li key={i} className="flex items-start gap-1.5">
                                        <span className="text-amber-400 leading-none">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <p className="text-xs text-natural-muted">{doc.desc}</p>
                    </div>
                  </div>
                  
                  {/* Status Actions */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 flex-wrap sm:flex-nowrap">
                    {isUploaded ? (
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {/* Preview Verified Button */}
                        <button
                          onClick={() => openVerifiedPreview(doc)}
                          className="flex items-center gap-1.5 text-xs font-bold text-natural-sage hover:text-emerald-700 bg-natural-panel hover:bg-natural-accent px-3 py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View PDF
                        </button>

                        {/* Visual Antivirus / Security Scan Status Badge */}
                        <div className="relative group/scan">
                          {scanInfo.status === 'scanning' ? (
                            <div className="flex items-center gap-2 bg-blue-50/90 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-xl shadow-2xs animate-pulse">
                              <div className="relative flex items-center justify-center">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[10px] font-black uppercase tracking-wider leading-none text-blue-900 flex items-center gap-1">
                                  <Scan className="w-3 h-3 text-blue-600" /> Security Scan
                                </span>
                                <span className="text-[9px] font-semibold text-blue-600 tracking-tight mt-0.5">
                                  Checking for threats...
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200/90 px-3 py-1.5 rounded-xl transition-all duration-200 group-hover/scan:bg-emerald-100/90 group-hover/scan:border-emerald-300 shadow-2xs cursor-help">
                              <div className="relative flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white"></span>
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[10px] font-black uppercase tracking-wider leading-none text-emerald-950 flex items-center gap-1">
                                  Antivirus Safe
                                </span>
                                <span className="text-[9px] font-bold text-emerald-700 tracking-tight mt-0.5">
                                  0 Threats Detected
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Hover Popover Audit Info */}
                          {scanInfo.status === 'clean' && (
                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover/scan:flex flex-col w-68 p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl z-30 border border-slate-700 pointer-events-auto animate-in fade-in zoom-in-95 duration-200 text-left space-y-2.5">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Antivirus & Threat Defense</span>
                                </div>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                                  PASSED
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50">
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Threats Found</span>
                                  <span className="text-emerald-400 font-bold text-xs mt-0.5 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> 0 / 100
                                  </span>
                                </div>
                                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50">
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Macro Sandbox</span>
                                  <span className="text-emerald-400 font-bold text-xs mt-0.5">
                                    Clean (Sanitized)
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1 text-[10px] text-slate-300 font-sans">
                                <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                                  <span className="text-slate-400">Scanner Engine:</span>
                                  <span className="font-semibold text-slate-200 truncate max-w-[140px] text-right">{scanInfo.engine}</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                                  <span className="text-slate-400">Digest Hash:</span>
                                  <span className="font-mono text-[9px] text-emerald-400">{scanInfo.signatureHash}</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-400">Scanned At:</span>
                                  <span className="text-slate-300">{scanInfo.scannedAt}</span>
                                </div>
                              </div>

                              {/* Interactive Re-scan simulation button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerSimulatedScan(doc.id, 2000);
                                }}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-[10px] font-bold transition-all border border-slate-700 cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" /> Re-scan for Threats
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Enhanced 'Verified' Status Badge with Pulse & Hover Timestamp */}
                        <div className="relative group/badge">
                          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3.5 py-2 rounded-xl transition-all duration-300 group-hover/badge:bg-emerald-100/90 group-hover/badge:border-emerald-300 shadow-2xs cursor-help">
                            {/* Micro-interaction Pulse Animation */}
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider">Verified</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>

                          {/* Hover Timestamp Floating Popover */}
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover/badge:flex flex-col w-56 p-3 bg-slate-900 text-white rounded-xl shadow-xl z-30 border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 duration-200 text-left">
                            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold border-b border-slate-800 pb-1 mb-1.5">
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> OCR Verified
                              </span>
                              <span className="text-slate-400 font-mono">{vData.relative}</span>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> {vData.exactTime}
                            </p>
                            <p className="text-[9px] font-mono text-slate-400 mt-1">Audit: {vData.auditId}</p>
                            <span className="text-[9px] text-emerald-400/90 font-mono mt-0.5">{vData.hash}</span>
                          </div>
                        </div>

                        {/* Delete / Remove Incorrectly Uploaded Document Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDocumentToDelete(doc);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200/90 hover:border-red-200 px-2.5 py-2 rounded-xl transition-all cursor-pointer group/del shadow-2xs"
                          title={`Remove incorrectly uploaded ${doc.label}`}
                          aria-label={`Remove incorrectly uploaded ${doc.label}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover/del:text-red-600 transition-colors" />
                          <span className="hidden sm:inline text-[11px] text-slate-500 group-hover/del:text-red-600 font-semibold">Delete</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* Direct PDF Preview Mock Button */}
                        <button
                          onClick={() => openPreUploadPreview(doc)}
                          className="flex items-center gap-1.5 text-xs font-bold text-natural-muted hover:text-natural-sage bg-natural-panel hover:bg-natural-accent px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Sample Format
                        </button>

                        {/* Upload Button */}
                        <button 
                          onClick={() => {
                            setActiveSingleUploadTarget(doc.id);
                            singleFileInputRef.current?.click();
                          }}
                          disabled={!!uploadingDocId}
                          className="flex items-center gap-2 bg-[#10B981] hover:bg-[#10B981]/90 text-white px-4 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer shadow-xs shadow-[#10B981]/15"
                        >
                          {isCurrentUploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <FileUp className="w-4 h-4" />}
                          {isCurrentUploading ? 'Encrypting...' : 'Upload Scan'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Single Progress Bar Animation */}
                {isCurrentUploading && (
                  <div className="w-full space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-natural-border/60">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-black uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 animate-pulse text-emerald-600" /> AES-256 Quantum Shield Encryption Active
                      </span>
                      <span className="font-mono font-black text-slate-600">{activeProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${activeProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive PDF Preview Modal (Before / After Finalizing Encryption) */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl border border-natural-border w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 md:p-6 bg-slate-900 text-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base md:text-lg">{previewDoc.docItem.label}</h4>
                      <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                        {previewDoc.isPreUpload ? 'Pre-Upload Preview' : 'Encrypted Document'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{previewDoc.fileName}</span>
                      <span>•</span>
                      <span>{previewDoc.fileSize}</span>
                      <span>•</span>
                      <span className="text-emerald-400">OCR Ready (99.2% Legibility)</span>
                    </p>
                    {previewDoc.isPreUpload && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold">Document Type:</span>
                        <select
                          value={previewDoc.docItem.id}
                          onChange={(e) => updatePreviewDocTarget(e.target.value)}
                          className="text-[11px] font-bold bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg px-2 py-0.5 cursor-pointer outline-hidden"
                          title="Change target document type"
                        >
                          <optgroup label="🪪 ID Proof">
                            {applicableDocuments.filter(d => d.category === 'Primary KYC').map(d => (
                              <option key={d.id} value={d.id}>{d.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="💼 Income Proof">
                            {applicableDocuments.filter(d => d.category === 'Income & Financials').map(d => (
                              <option key={d.id} value={d.id}>{d.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="📜 Property Deed">
                            {applicableDocuments.filter(d => d.category === 'Property & Legal').map(d => (
                              <option key={d.id} value={d.id}>{d.label}</option>
                            ))}
                          </optgroup>
                          {includeCoApplicant && (
                            <optgroup label="👥 Joint Applicant Proof">
                              {applicableDocuments.filter(d => d.category === 'Joint Applicant').map(d => (
                                <option key={d.id} value={d.id}>{d.label}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Header Controls */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
                    <button
                      onClick={() => setPreviewZoom(z => Math.max(z - 25, 50))}
                      title="Zoom Out"
                      className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold px-2 text-slate-300">{previewZoom}%</span>
                    <button
                      onClick={() => setPreviewZoom(z => Math.min(z + 25, 175))}
                      title="Zoom In"
                      className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Interactive PDF Canvas Container */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex flex-col items-center justify-start min-h-[380px] max-h-[550px]">
                <div 
                  className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-2xl p-8 md:p-12 space-y-8 relative overflow-hidden transition-transform duration-200"
                  style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
                >
                  {/* Confidential Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg]">
                    <span className="text-6xl font-black text-slate-900 uppercase tracking-widest text-center">
                      PARROT SECURE UNDERWRITING
                    </span>
                  </div>

                  {/* Top Document Header Banner inside PDF preview */}
                  <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        OFFICIAL VERIFICATION DRAFT • {previewDoc.docItem.category.toUpperCase()}
                      </span>
                      <h2 className="text-xl font-black text-slate-900">{previewDoc.docItem.label}</h2>
                      <p className="text-xs text-slate-500 font-mono">Reference Application: #{loanId?.slice(-8) || 'HL-2026-9842'}</p>
                    </div>
                    <div className="text-right">
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center ml-auto text-emerald-700">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-mono text-emerald-700 block mt-1">ANTIVIRUS SCAN: CLEAN</span>
                    </div>
                  </div>

                  {/* Document Content Simulation Mockup */}
                  <div className="space-y-6 text-xs text-slate-700">
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {previewDoc.docItem.isCoApplicantDoc ? 'Joint / Co-Borrower' : 'Primary Applicant'}
                        </span>
                        <p className="font-bold text-slate-900 text-sm">
                          {previewDoc.docItem.isCoApplicantDoc ? 'Ananya Sharma (Co-Applicant)' : 'Divyanshu Sharma'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {previewDoc.docItem.isCoApplicantDoc ? 'Relationship: Spouse / Co-Owner' : 'divvyanshu@gmail.com'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Document Identifier</span>
                        <p className="font-mono font-bold text-slate-900 text-sm">{previewDoc.docItem.id.toUpperCase()}-2026-XXXX</p>
                        <p className="text-[11px] text-slate-500">Authority: Government of India / State Sub-Registrar</p>
                      </div>
                    </div>

                    {/* Category specific details */}
                    {previewDoc.docItem.category === 'Primary KYC' && (
                      <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold">
                          <BadgeCheck className="w-4 h-4 text-emerald-600" />
                          <span>UIDAI & NSDL Live Verification Hook</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 leading-relaxed">
                          Identity token matches Aadhaar XML hash and NSDL PAN active status. Full name, Date of Birth, and Father's name are 100% consistent across CIBIL records.
                        </p>
                      </div>
                    )}

                    {previewDoc.docItem.category === 'Income & Financials' && (
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                        <div className="flex items-center gap-2 text-blue-800 font-bold">
                          <Receipt className="w-4 h-4 text-blue-600" />
                          <span>Financial Solvency & Income Computation</span>
                        </div>
                        <p className="text-[11px] text-blue-700 leading-relaxed">
                          Salary credit entries, Form 16 Part A/B TRACES TDS deductions, and bank balance trends verify debt-to-income (FOIR) comfort for up to ₹85,00,000 sanction.
                        </p>
                      </div>
                    )}

                    {previewDoc.docItem.category === 'Property & Legal' && (
                      <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 space-y-2">
                        <div className="flex items-center gap-2 text-amber-800 font-bold">
                          <Scale className="w-4 h-4 text-amber-600" />
                          <span>Title Search & Legal Encumbrance Verification</span>
                        </div>
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                          Registered Sale Deed with Index-II, 30-year mother deed continuity, Form 15 Encumbrance Certificate, and Municipal building layout sanction meet clean legal clearance criteria.
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Pre-Upload Automated Scan Inspection</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-800 block">DPI Resolution</span>
                          <span className="text-sm font-black text-emerald-700">300 DPI (High)</span>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-800 block">Name Verification</span>
                          <span className="text-sm font-black text-emerald-700">100% Match</span>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-800 block">Tamper Check</span>
                          <span className="text-sm font-black text-emerald-700">Zero Artifacts</span>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-800 block">Antivirus & Security</span>
                          <span className="text-sm font-black text-emerald-700 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Clean (0 Threats)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                      <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>Document Structure Verification</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        All mandatory metadata attributes, barcode/QR timestamps, and applicant signature placements were successfully parsed. Ready for zero-knowledge AES-256 cloud vault encryption.
                      </p>
                    </div>
                  </div>

                  {/* Document Footer */}
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>Page 1 of 1</span>
                    <span>Parrot Money Digital Underwriting Engine v2.6</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-5 md:p-6 bg-white border-t border-natural-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-natural-muted">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Files are permanently encrypted before transmission to credit underwriters.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Delete / Remove button if document is already uploaded and user is previewing */}
                  {!previewDoc.isPreUpload && activeDocs.includes(previewDoc.docItem.id) && (
                    <button
                      type="button"
                      onClick={() => setDocumentToDelete(previewDoc.docItem)}
                      className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Remove incorrectly uploaded file"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Remove Document</span>
                    </button>
                  )}

                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-natural-border text-xs font-bold text-natural-muted hover:bg-natural-panel transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>

                  {previewDoc.isPreUpload && (
                    <button
                      onClick={() => finalizeSingleUpload(previewDoc.docItem.id)}
                      className="flex-1 sm:flex-none bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#10B981]/20 transition-all cursor-pointer"
                    >
                      <Lock className="w-4 h-4" /> Confirm & Encrypt Upload
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Delete Confirmation Dialog Modal */}
      <AnimatePresence>
        {documentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-red-200 shadow-2xl w-full max-w-md p-6 space-y-5 text-left relative overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 id="delete-dialog-title" className="text-base font-black text-slate-900">
                    Remove Incorrect Document?
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to remove <span className="font-bold text-slate-800">"{documentToDelete.label}"</span>?
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Document Type:</span>
                  <span className="font-bold text-slate-800">{CATEGORY_TO_TYPE_LABEL[documentToDelete.category] || 'Document'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Category:</span>
                  <span className="text-slate-700">{documentToDelete.category}</span>
                </div>
                <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200/60 mt-1">
                  ⚠️ This file will be unlinked from your loan application vault. You can upload the corrected document at any time.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDocumentToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel / Keep
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteDocument(documentToDelete.id)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Remove File</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Delete Action Feedback Toast */}
      <AnimatePresence>
        {deleteToastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold"
          >
            <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
            <span>{deleteToastMessage}</span>
            <button
              onClick={() => setDeleteToastMessage(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
