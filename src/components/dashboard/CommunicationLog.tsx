import React, { useState } from 'react';
import { 
  CommunicationLogEntry, 
  CommunicationChannel,
  LoanStageId 
} from '../../types';
import { 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Bell, 
  CheckCheck, 
  Search, 
  Clock, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Send,
  IndianRupee,
  Calendar,
  ShieldCheck,
  Zap,
  CalendarClock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getNextEmiSchedule, triggerEmiPaymentAlert } from '../../services/notificationService';

interface CommunicationLogProps {
  logs: CommunicationLogEntry[];
  onOpenSimulator: () => void;
  onRefreshLogs?: () => void;
  onClearLogs?: () => void;
  loanId?: string;
  userEmail?: string;
  userPhone?: string;
}

export const CommunicationLog: React.FC<CommunicationLogProps> = ({
  logs,
  onOpenSimulator,
  onRefreshLogs,
  onClearLogs,
  loanId = 'HL-2025-9842',
  userEmail = 'divvyanshu@gmail.com',
  userPhone = '+91 98765 43210'
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTriggeringEmiAlert, setIsTriggeringEmiAlert] = useState(false);
  const [emiAlertSuccess, setEmiAlertSuccess] = useState(false);

  const emiSchedule = getNextEmiSchedule(5);

  const filterTabs = [
    { id: 'all', label: 'All Logs', count: logs.length },
    { id: 'emi', label: 'EMI Due Alerts', icon: CalendarClock, count: logs.filter(l => l.category === 'emi_reminder' || l.title?.includes('EMI')).length },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, count: logs.filter(l => l.channel === 'whatsapp').length },
    { id: 'email', label: 'Email', icon: Mail, count: logs.filter(l => l.channel === 'email').length },
    { id: 'sms', label: 'SMS', icon: Smartphone, count: logs.filter(l => l.channel === 'sms').length },
  ];

  const filteredLogs = logs.filter(log => {
    let matchesChannel = true;
    if (selectedChannel === 'emi') {
      matchesChannel = log.category === 'emi_reminder' || (log.title && log.title.toLowerCase().includes('emi'));
    } else if (selectedChannel !== 'all') {
      matchesChannel = log.channel === selectedChannel;
    }

    const matchesSearch = 
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.subject && log.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const getChannelBadge = (channel: CommunicationChannel, category?: string) => {
    if (category === 'emi_reminder') {
      return {
        label: '5-Day EMI Due Alert',
        icon: IndianRupee,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        iconClass: 'text-amber-700',
        bgLight: 'bg-amber-50/70'
      };
    }

    switch (channel) {
      case 'whatsapp':
        return {
          label: 'WhatsApp',
          icon: MessageSquare,
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          iconClass: 'text-emerald-600',
          bgLight: 'bg-emerald-50/50'
        };
      case 'email':
        return {
          label: 'Email Alert',
          icon: Mail,
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
          iconClass: 'text-purple-600',
          bgLight: 'bg-purple-50/50'
        };
      case 'sms':
        return {
          label: 'SMS Message',
          icon: Smartphone,
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
          iconClass: 'text-blue-600',
          bgLight: 'bg-blue-50/50'
        };
      default:
        return {
          label: 'System Alert',
          icon: Bell,
          badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
          iconClass: 'text-slate-600',
          bgLight: 'bg-slate-50/50'
        };
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTriggerManualEmiAlert = () => {
    setIsTriggeringEmiAlert(true);
    try {
      triggerEmiPaymentAlert(loanId, userEmail, userPhone, 'HDFC Bank Limited', 4500000);
      setEmiAlertSuccess(true);
      if (onRefreshLogs) onRefreshLogs();
      setTimeout(() => setEmiAlertSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTriggeringEmiAlert(false);
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-natural-border shadow-2xl p-6 md:p-8 space-y-6">
      {/* Header with Title and Simulate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-natural-border/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              Audit Trail & Alerts
            </span>
            <span className="text-[10px] font-bold text-natural-muted">
              {logs.length} Total Messages Dispatched
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" /> Automated 5-Day Pre-Debit Active
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-natural-sage tracking-tight italic mt-1">
            Communication History & Alerts
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshLogs && (
            <button
              onClick={onRefreshLogs}
              title="Refresh Logs"
              className="p-2.5 rounded-xl border border-natural-border hover:bg-natural-bg text-natural-sage transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border-none"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulate Alerts</span>
          </button>
        </div>
      </div>

      {/* AUTOMATED 5-DAY EMI PAYMENT ALERT BANNER */}
      <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-100/40 rounded-2xl border border-amber-200/80 p-4 md:p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-500/20 shrink-0">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-amber-200 text-amber-950 font-black text-[10px] uppercase tracking-wider rounded-md">
                  Scheduled Payment Notice
                </span>
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" /> Due: <strong>{emiSchedule.formattedDueDate}</strong>
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                  Notice: 5 Days in Advance
                </span>
              </div>
              <h4 className="text-base font-black text-natural-sage">
                Automated 5-Day Monthly EMI Payment Reminder
              </h4>
              <p className="text-xs text-stone-600 font-medium max-w-2xl leading-relaxed">
                Borrowers are automatically notified <strong>5 days prior</strong> to the monthly EMI auto-debit date via WhatsApp, SMS, and Email. Linked NACH mandate ensures timely debits with zero ECS bounce penalties.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-center shrink-0">
            <button
              onClick={handleTriggerManualEmiAlert}
              disabled={isTriggeringEmiAlert}
              className="flex-1 md:flex-none px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-none"
            >
              <Zap className="w-3.5 h-3.5" />
              {isTriggeringEmiAlert ? 'Sending...' : 'Test 5-Day Alert'}
            </button>
            <button
              onClick={() => setSelectedChannel('emi')}
              className="flex-1 md:flex-none px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View EMI Notices</span>
            </button>
          </div>
        </div>

        {emiAlertSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Automated 5-Day EMI payment alert successfully dispatched across WhatsApp, SMS, and Email channels!</span>
          </motion.div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-amber-200/60 text-xs">
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
            <span className="text-[10px] font-bold text-natural-muted block">Monthly Installment</span>
            <span className="text-sm font-black text-amber-900">₹42,850</span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
            <span className="text-[10px] font-bold text-natural-muted block">Next Due Date</span>
            <span className="text-xs font-black text-natural-sage">{emiSchedule.formattedDueDate}</span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
            <span className="text-[10px] font-bold text-natural-muted block">Clearing Mode</span>
            <span className="text-xs font-bold text-natural-sage flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> NACH e-Mandate
            </span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
            <span className="text-[10px] font-bold text-natural-muted block">Pre-Debit Alert Timing</span>
            <span className="text-xs font-bold text-emerald-700">T-5 Days at 09:00 AM</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Channel Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedChannel(tab.id)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border",
                selectedChannel === tab.id
                  ? "bg-natural-sage text-white border-natural-sage shadow-sm"
                  : "bg-natural-bg/50 text-natural-muted border-natural-border/60 hover:bg-white hover:text-natural-sage"
              )}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-md font-mono",
                selectedChannel === tab.id ? "bg-white/20 text-white" : "bg-natural-border/50 text-natural-muted"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-natural-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records, subject, EMI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-natural-bg/40 pl-9 pr-4 py-2 rounded-xl text-xs text-natural-sage placeholder-natural-muted/60 border border-natural-border/60 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Communication Log Entries List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-natural-bg/30 rounded-2xl border border-dashed border-natural-border space-y-3">
            <Mail className="w-8 h-8 text-natural-muted/40 mx-auto" />
            <p className="text-sm font-bold text-natural-sage">No communication records found.</p>
            <p className="text-xs text-natural-muted max-w-sm mx-auto">
              {searchQuery ? "Try refining your search filter." : "Click 'Test 5-Day Alert' or 'Simulate Alerts' to trigger automated test SMS, WhatsApp, and Emails!"}
            </p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const badge = getChannelBadge(log.channel, log.category);
            const isExpanded = expandedLogId === log.id;
            const isCopied = copiedId === log.id;
            const isEmiAlert = log.category === 'emi_reminder' || log.title?.includes('EMI');

            return (
              <div 
                key={log.id}
                className={cn(
                  "rounded-2xl border transition-all duration-200 overflow-hidden",
                  isEmiAlert ? "border-amber-200/80 bg-amber-50/20" : "",
                  isExpanded 
                    ? "border-natural-sage shadow-md bg-white" 
                    : "hover:border-natural-border bg-white"
                )}
              >
                {/* Collapsed Header Bar */}
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className={cn(
                    "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors",
                    isEmiAlert ? "hover:bg-amber-50/50" : "hover:bg-natural-bg/30"
                  )}
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className={cn("p-2.5 rounded-xl border shrink-0", badge.badgeClass)}>
                      <badge.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border", badge.badgeClass)}>
                          {badge.label}
                        </span>
                        {isEmiAlert && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-300">
                            Auto 5-Day Notice
                          </span>
                        )}
                        <span className="text-[10px] text-natural-muted font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className="text-[10px] text-natural-muted font-mono bg-slate-100 px-2 py-0.5 rounded">
                          To: {log.recipient}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-natural-sage tracking-tight mt-1 truncate">
                        {log.subject || log.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{log.deliveryStatus}</span>
                    </div>
                    <span className="text-xs text-natural-muted font-bold underline">
                      {isExpanded ? 'Hide Details' : 'View Message'}
                    </span>
                  </div>
                </div>

                {/* Expanded Full Message Drawer */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-natural-border/60 bg-natural-bg/20 p-5 space-y-4"
                    >
                      {/* Subject/Meta */}
                      {log.subject && (
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted block mb-1">
                            Email Subject Line:
                          </span>
                          <p className="text-xs font-bold text-natural-sage bg-white p-3 rounded-xl border border-natural-border/60">
                            {log.subject}
                          </p>
                        </div>
                      )}

                      {/* Message Body Content */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted">
                            Message Body Dispatched:
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(log.message, log.id);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-natural-muted hover:text-natural-sage cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className={cn(
                          "p-4 rounded-xl border font-sans text-xs whitespace-pre-wrap leading-relaxed shadow-inner",
                          log.channel === 'whatsapp' 
                            ? "bg-[#EFEAE2] text-[#111B21] border-[#DAD3CC] font-mono text-[11px]" 
                            : log.channel === 'sms'
                            ? "bg-slate-900 text-emerald-400 border-slate-800 font-mono"
                            : "bg-white text-slate-800 border-natural-border/80"
                        )}>
                          {log.message}
                        </div>
                      </div>

                      {/* Footer Info & Verification details */}
                      <div className="flex items-center justify-between text-[10px] text-natural-muted pt-2 border-t border-natural-border/40 flex-wrap gap-2">
                        <span>Log ID: <span className="font-mono">{log.id}</span></span>
                        <span>Gateway: <span className="font-bold text-natural-sage">Parrot Multi-Gateway Sync</span></span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Dispatch
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
