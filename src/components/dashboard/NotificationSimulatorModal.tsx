import React, { useState } from 'react';
import { 
  LoanStageId, 
  CommunicationChannel,
  LoanApplication,
  CommunicationLogEntry
} from '../../types';
import { STAGE_CONFIGS } from '../../services/notificationService';
import { 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  X, 
  Sparkles,
  SmartphoneNfc,
  CheckCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSimulation: (params: {
    channel: CommunicationChannel;
    stageId: LoanStageId;
    category: CommunicationLogEntry['category'];
    title: string;
    message: string;
    subject?: string;
  }) => void;
  currentStageId: LoanStageId;
  loan?: Partial<LoanApplication>;
  userEmail?: string;
  userPhone?: string;
}

export const NotificationSimulatorModal: React.FC<NotificationSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSendSimulation,
  currentStageId,
  loan,
  userEmail = 'divvyanshu@gmail.com',
  userPhone = '+91 98765 43210'
}) => {
  const [selectedChannel, setSelectedChannel] = useState<CommunicationChannel>('whatsapp');
  const [selectedStage, setSelectedStage] = useState<LoanStageId>(currentStageId);
  const [alertType, setAlertType] = useState<'stage_update' | 'query' | 'document_request' | 'reminder' | 'emi_reminder'>('stage_update');
  
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [lastSentEntry, setLastSentEntry] = useState<any>(null);

  const stageKeys = Object.keys(STAGE_CONFIGS) as LoanStageId[];
  const loanNum = loan?.id?.slice(-8).toUpperCase() || 'HL-9842';

  // Preset Template generator
  const getPresetTemplate = (channel: CommunicationChannel, stage: LoanStageId, type: string) => {
    const config = STAGE_CONFIGS[stage];
    const bank = loan?.selectedBank?.name || 'HDFC Bank';
    const amount = loan?.loanAmount ? `₹${loan.loanAmount.toLocaleString('en-IN')}` : '₹45,00,000';

    if (type === 'emi_reminder') {
      const formattedEmi = '₹42,850';
      const dueDate = '5th September 2026';
      if (channel === 'whatsapp') {
        return {
          title: `Automated Reminder: Monthly EMI Due in 5 Days (${formattedEmi})`,
          message: `🔔 *PARROT AUTOMATED EMI PAYMENT REMINDER (5 DAYS TO DUE DATE)*\n\nLoan Application / A/c: *#${loanNum}*\nFinancing Lender: *${bank}*\nMonthly Installment: *${formattedEmi}*\nDebit Due Date: *${dueDate}* (5 Days Remaining)\n\n📌 *Automated NACH / e-Mandate Info*:\nYour primary account ending in •••• 4021 is registered for direct debit on *${dueDate}*.\n\n💡 *Pre-Debit Checklist*:\n1. Maintain a minimum balance of *${formattedEmi}* in your clearing account before 11:59 PM prior to debit.\n2. Timely debits ensure ZERO bounce charges (saving ₹450 + 18% GST) and continuous 780+ CIBIL score enhancement.\n\nReply 'PAY NOW' for instant UPI/NetBanking payment or 'HELP' to chat with loan servicing desk.`
        };
      } else if (channel === 'sms') {
        return {
          title: `SMS Alert: EMI ${formattedEmi} Due in 5 Days`,
          message: `PARROT EMI ALERT: Your monthly Home Loan EMI of ${formattedEmi} for A/c #${loanNum} (${bank}) is scheduled for auto-debit on ${dueDate} (in 5 days). Please maintain sufficient funds.`
        };
      } else {
        return {
          title: `Official EMI 5-Day Pre-Debit Notice`,
          subject: `Upcoming EMI Notice (5 Days Remaining): ${formattedEmi} on ${dueDate} - Loan #${loanNum}`,
          message: `Dear Valued Customer,\n\nThis is an automated 5-day advance notification that your monthly Home Loan EMI is scheduled for automatic clearing on ${dueDate}.\n\n==========================================\nLOAN REPAYMENT SCHEDULE SUMMARY\n==========================================\nLoan Application Reference: #${loanNum}\nFinancing Institution: ${bank}\nMonthly EMI Amount: ${formattedEmi}\nScheduled Due Date: ${dueDate}\nRepayment Mode: National Automated Clearing House (NACH / e-Mandate)\nLinked Account: Bank A/c •••• 4021\n\n==========================================\nIMPORTANT INSTRUCTIONS\n==========================================\n- Please maintain a clear available balance of at least ${formattedEmi} in your designated bank account to avoid ECS bounce penalties.\n- Timely repayments report positively to CIBIL, Experian, Equifax, and CRIF High Mark credit bureaus.\n\nThank you for choosing Parrot Money.\n\nWarm regards,\nRetail Loan Servicing & Collections Desk\nParrot Money AI Platform`
        };
      }
    }

    if (type === 'stage_update') {
      if (channel === 'whatsapp') {
        return {
          title: `Milestone: ${config.name}`,
          message: `🔔 *PARROT LOAN NOTIFICATION*\n\nApplication: *#${loanNum}*\nStatus: *${config.name}*\nLender: *${bank}*\nAmount: *${amount}*\n\n${config.shortDesc}.\n\nYour assigned officer is ${config.officerRole}. You can monitor live document checks on your client portal.\n\nReply 'HELP' for dedicated advisor call.`
        };
      } else if (channel === 'sms') {
        return {
          title: `SMS: Stage ${config.order} Activated`,
          message: `PARROT LOANS: App #${loanNum} moved to Stage ${config.order}: ${config.name}. Turnaround SLA: ${config.slaDays} days. Login to view updates.`
        };
      } else {
        return {
          title: `Stage Update: ${config.name}`,
          subject: `Home Loan Update: #${loanNum} Moved to ${config.name}`,
          message: `Dear Client,\n\nWe are pleased to inform you that your application for ${amount} has advanced to "${config.name}".\n\nOverview:\n${config.detailedDesc}\n\nAssigned Desk: ${config.officerRole}\n\nWarm regards,\nParrot Underwriting Team`
        };
      }
    } else if (type === 'query' || type === 'document_request') {
      if (channel === 'whatsapp') {
        return {
          title: `Action Required: Document Verification`,
          message: `⚠️ *PARROT URGENT ACTION REQUIRED*\n\nApplication: *#${loanNum}*\n\nThe bank underwriting desk has raised a query regarding property documentation for Stage: *${config.name}*.\n\n📌 *Required*: Clear copy of Municipal Approved Floor Plan.\n\nPlease log in to your dashboard and upload the file to prevent processing delays.`
        };
      } else if (channel === 'sms') {
        return {
          title: `SMS: Urgent Query Raised`,
          message: `PARROT LOANS: Action needed on #${loanNum}. An approval query was raised for ${config.name}. Please upload requested document in dashboard.`
        };
      } else {
        return {
          title: `Action Required: Bank Query`,
          subject: `Immediate Attention Needed: Document Query on App #${loanNum}`,
          message: `Dear Client,\n\nDuring review of your file for ${config.name}, the credit committee has requested an additional verification item:\n\n- Municipal Sanctioned Building Plan Copy\n\nPlease submit this directly via your online tracking dashboard.\n\nThank you,\nCredit Desk`
        };
      }
    } else {
      if (channel === 'whatsapp') {
        return {
          title: `Valuation Site Visit Reminder`,
          message: `📅 *Valuation Visit Reminder*\n\nApplication: *#${loanNum}*\n\nReminder: Senior Valuer Mr. Rajesh Verma is scheduled for on-site physical appraisal on Friday at 11:30 AM. Kindly ensure premises are accessible.`
        };
      } else if (channel === 'sms') {
        return {
          title: `SMS Reminder: Inspection Scheduled`,
          message: `PARROT LOANS: Reminder for App #${loanNum}. Technical Valuer visit scheduled for Friday 11:30 AM.`
        };
      } else {
        return {
          title: `Appointment Reminder`,
          subject: `Scheduled Appointment: Technical Site Inspection for Loan #${loanNum}`,
          message: `Dear Client,\n\nThis is a friendly reminder for the upcoming property technical evaluation scheduled on Friday at 11:30 AM.\n\nContact: +91 98765 00000\nParrot Inspection Desk`
        };
      }
    }
  };

  const handleApplyPreset = () => {
    const preset = getPresetTemplate(selectedChannel, selectedStage, alertType);
    setCustomTitle(preset.title);
    setCustomMessage(preset.message);
    setCustomSubject(preset.subject || '');
  };

  React.useEffect(() => {
    handleApplyPreset();
  }, [selectedChannel, selectedStage, alertType]);

  if (!isOpen) return null;

  const handleSend = () => {
    onSendSimulation({
      channel: selectedChannel,
      stageId: selectedStage,
      category: alertType,
      title: customTitle,
      message: customMessage,
      subject: customSubject
    });
    setLastSentEntry({
      channel: selectedChannel,
      title: customTitle,
      timestamp: new Date().toLocaleTimeString()
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-natural-sage/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-[2.5rem] border border-natural-border shadow-2xl max-w-4xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-natural-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-natural-sage tracking-tight italic">
                Notification & Alert Simulation Sandbox
              </h3>
              <p className="text-xs text-natural-muted">
                Trigger real simulated alerts across WhatsApp, SMS, and Email to verify client communications.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-natural-muted font-bold cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast inside modal if just sent */}
        <AnimatePresence>
          {lastSentEntry && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-xs font-bold"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Alert simulated successfully! Added to communication audit log.
              </span>
              <span className="text-[10px] font-mono text-emerald-600">{lastSentEntry.timestamp}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls Column */}
          <div className="space-y-4">
            {/* Channel Selectors */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-natural-muted block mb-2">
                1. Select Communication Channel:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel('whatsapp')}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer",
                    selectedChannel === 'whatsapp'
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-natural-sage border-natural-border hover:bg-emerald-50"
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel('sms')}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer",
                    selectedChannel === 'sms'
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-natural-sage border-natural-border hover:bg-blue-50"
                  )}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>SMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel('email')}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer",
                    selectedChannel === 'email'
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                      : "bg-white text-natural-sage border-natural-border hover:bg-purple-50"
                  )}
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* Stage Selector */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-natural-muted block mb-2">
                2. Select Associated Loan Stage:
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as LoanStageId)}
                className="w-full p-3 rounded-xl bg-white border border-natural-border text-xs font-bold text-natural-sage focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {stageKeys.map(key => (
                  <option key={key} value={key}>
                    Stage {STAGE_CONFIGS[key].order}: {STAGE_CONFIGS[key].name}
                  </option>
                ))}
              </select>
            </div>

            {/* Trigger Event Type */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-natural-muted block mb-2">
                3. Trigger Event / Scenario:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'stage_update', label: 'Milestone Update' },
                  { id: 'query', label: 'Missing Doc Query' },
                  { id: 'reminder', label: 'Visit Reminder' },
                  { id: 'emi_reminder', label: '5-Day EMI Due Alert' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAlertType(item.id as any)}
                    className={cn(
                      "p-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer text-center",
                      alertType === item.id
                        ? "bg-natural-sage text-white border-natural-sage shadow-sm"
                        : "bg-natural-bg/50 text-natural-muted border-natural-border hover:bg-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Details Readout */}
            <div className="bg-natural-bg/40 p-3 rounded-xl border border-natural-border/60 text-xs flex justify-between">
              <span className="text-natural-muted">Simulated Recipient:</span>
              <span className="font-bold text-natural-sage font-mono">
                {selectedChannel === 'email' ? userEmail : userPhone}
              </span>
            </div>
          </div>

          {/* Live Device Preview Column */}
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <SmartphoneNfc className="w-3.5 h-3.5" />
                Live Received Device Mockup ({selectedChannel.toUpperCase()}):
              </span>

              {selectedChannel === 'whatsapp' && (
                <div className="bg-[#EFEAE2] rounded-2xl p-4 border border-[#DAD3CC] shadow-inner space-y-3 font-sans">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DAD3CC] text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        P
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Parrot Loans Verified</span>
                        <span className="text-[9px] text-emerald-600 block leading-none">Official Business Account</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">Just now</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl rounded-tl-none text-xs text-slate-800 shadow-sm whitespace-pre-wrap leading-relaxed">
                    {customMessage}
                    <div className="flex justify-end items-center gap-1 text-[9px] text-slate-400 mt-2">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCheck className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>
                </div>
              )}

              {selectedChannel === 'sms' && (
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-inner space-y-3 font-mono">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] pb-2 border-b border-slate-800">
                    <span>Sender: VK-PARROT</span>
                    <span>SMS GATEWAY</span>
                  </div>
                  <div className="bg-slate-800 p-3.5 rounded-xl text-emerald-400 text-xs shadow-inner leading-relaxed">
                    {customMessage}
                  </div>
                </div>
              )}

              {selectedChannel === 'email' && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-inner space-y-2 text-xs">
                  <div className="pb-2 border-b border-slate-100 space-y-1">
                    <div className="text-[10px] text-slate-400">
                      From: <span className="font-bold text-slate-700">Parrot Underwriting &lt;notifications@parrotloans.com&gt;</span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs">
                      Subject: {customSubject || customTitle}
                    </div>
                  </div>
                  <div className="text-slate-700 whitespace-pre-wrap leading-relaxed py-2 max-h-48 overflow-y-auto">
                    {customMessage}
                  </div>
                </div>
              )}
            </div>

            {/* Action Dispatch */}
            <div className="pt-4 mt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-natural-muted hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Simulated Alert</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
