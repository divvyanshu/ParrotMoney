import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Building2, 
  Calculator, 
  TrendingUp, 
  ExternalLink,
  Edit3,
  Check,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext, logCustomerLead } from '../../services/geminiService';
import { cn } from '../../lib/utils';

interface AgenticResearchStatusCardProps {
  onOpenChat?: () => void;
  className?: string;
}

export function AgenticResearchStatusCard({ onOpenChat, className }: AgenticResearchStatusCardProps) {
  const [customer, setCustomer] = useState<UserContext | null>(() => {
    try {
      const saved = localStorage.getItem('parrot_advisory_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize customer changes across tabs or from the chat window
  useEffect(() => {
    const handleCustomerUpdate = (e: any) => {
      try {
        const saved = localStorage.getItem('parrot_advisory_customer');
        setCustomer(saved ? JSON.parse(saved) : null);
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleCustomerUpdate);
    window.addEventListener('parrot-customer-updated', handleCustomerUpdate);
    return () => {
      window.removeEventListener('storage', handleCustomerUpdate);
      window.removeEventListener('parrot-customer-updated', handleCustomerUpdate);
    };
  }, []);

  const handleStartResearch = (customQuery?: string) => {
    if (customQuery) {
      sessionStorage.setItem('pending_chat_query', customQuery);
    }
    if (onOpenChat) {
      onOpenChat();
    } else {
      window.dispatchEvent(new CustomEvent('open-parrot-chat'));
    }
  };

  const handleInlineVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    // 1. Name validation
    const cleanName = nameInput.trim();
    if (!cleanName) {
      setInputError("Please enter your full name.");
      return;
    }

    // 2. Mobile validation
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setInputError("Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
      return;
    }

    // 3. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      setInputError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const verifiedCustomer: UserContext = {
        name: cleanName,
        phone: cleanPhone,
        email: emailInput.trim().toLowerCase(),
      };

      await logCustomerLead({
        name: verifiedCustomer.name,
        phone: verifiedCustomer.phone,
        email: verifiedCustomer.email,
        source: 'dashboard_status_card'
      });

      localStorage.setItem('parrot_advisory_customer', JSON.stringify(verifiedCustomer));
      setCustomer(verifiedCustomer);
      setIsEditing(false);
      window.dispatchEvent(new CustomEvent('parrot-customer-updated', { detail: verifiedCustomer }));

      // Automatically launch the advisory agent session
      handleStartResearch();
    } catch (err: any) {
      setInputError("Failed to save verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('parrot_advisory_customer');
    setCustomer(null);
    setIsEditing(false);
    window.dispatchEvent(new CustomEvent('parrot-customer-updated', { detail: null }));
  };

  return (
    <div className={cn(
      "bg-white rounded-3xl border border-natural-border shadow-xs p-5 md:p-7 space-y-5 relative overflow-hidden",
      className
    )}>
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                AI
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Loan Guide
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Compare bank rates, calculate EMI, and check eligibility in seconds.
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="shrink-0">
          {customer ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50/80 border border-emerald-200/60 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-800">Ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200/60 rounded-full">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs font-medium text-slate-600">Available</span>
            </div>
          )}
        </div>
      </div>

      {/* Main status body */}
      {customer && !isEditing ? (
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900">{customer.name}</span>
              <span className="text-slate-300">•</span>
              <span>+91 {customer.phone}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{customer.email}</span>
            </div>
            <p className="text-[11px] text-slate-400">Personalized rates and calculations enabled</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => handleStartResearch()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Start</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      ) : isEditing ? (
        /* Inline editing form */
        <form onSubmit={handleInlineVerify} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-800">Update Details</p>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              required
              placeholder="Full Name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="Mobile (10 digits)"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="email"
              required
              placeholder="Email address"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {inputError && (
            <p className="text-xs text-rose-600 font-medium">{inputError}</p>
          )}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : (
        /* Minimalist Quick Start Form when not verified */
        <form onSubmit={handleInlineVerify} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">Enter your details to get personalized rates:</p>
            <span className="text-[11px] text-slate-400">100% private</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              required
              placeholder="Full Name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
            />
            <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <span className="px-2.5 py-2 bg-slate-50 border-r border-slate-200 text-xs text-slate-500 select-none flex items-center">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="Mobile number"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full text-xs px-2.5 py-2 outline-none bg-transparent placeholder:text-slate-400"
              />
            </div>
            <input
              type="email"
              required
              placeholder="Email address"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {inputError && (
            <p className="text-xs text-rose-600 font-medium">{inputError}</p>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{isSubmitting ? "Starting..." : "Start"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </form>
      )}

      {/* Quick Questions */}
      <div className="space-y-2 pt-1">
        <p className="text-xs font-semibold text-slate-500">
          Quick questions:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleStartResearch("Compare SBI vs HDFC Bank for a ₹75 Lakh home loan over 20 years.")}
            className="text-left p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 text-xs transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between font-semibold text-slate-800 group-hover:text-emerald-700 mb-0.5">
              <span>Compare Bank Rates</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="text-[11px] text-slate-500">SBI vs HDFC on ₹75L loan</p>
          </button>

          <button
            type="button"
            onClick={() => handleStartResearch("How much can I save by transferring my existing home loan to a lower interest rate?")}
            className="text-left p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 text-xs transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between font-semibold text-slate-800 group-hover:text-emerald-700 mb-0.5">
              <span>Lower Monthly EMI</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="text-[11px] text-slate-500">Savings from a balance transfer</p>
          </button>

          <button
            type="button"
            onClick={() => handleStartResearch("I earn ₹1,50,000 monthly with a ₹25,000 EMI. What is my maximum loan eligibility?")}
            className="text-left p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 text-xs transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between font-semibold text-slate-800 group-hover:text-emerald-700 mb-0.5">
              <span>Check Loan Limit</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="text-[11px] text-slate-500">Max loan based on your income</p>
          </button>
        </div>
      </div>
    </div>
  );
}
