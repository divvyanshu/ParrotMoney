import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Mail, Phone, ExternalLink, ShieldCheck, ScrollText } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsAndConditionsModal({ isOpen, onClose }: TermsAndConditionsModalProps) {
  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-950 font-sans tracking-tight">Terms & Conditions</h2>
                  <p className="text-xs font-semibold text-[#10B981] uppercase tracking-widest mt-0.5">Sybrate Technologies Private Limited</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrolling Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-sm leading-relaxed text-slate-600 font-sans">
              
              {/* Introduction Alert Box */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 md:p-6 space-y-3">
                <div className="flex gap-2.5 items-center">
                  <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">User Agreement</span>
                </div>
                <h4 className="text-sm font-bold text-emerald-950">Introduction</h4>
                <p className="text-emerald-900 font-medium">
                  These Terms and Conditions govern your use of our website. By using our website, you accept these Terms and Conditions in full. If you disagree with any part of these Terms and Conditions, you must not use our website.
                </p>
              </div>

              {/* Intellectual Property Rights */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">1</span>
                  Intellectual Property Rights
                </h3>
                <p>
                  Unless otherwise stated, we own the intellectual property rights in the website and material on the website. Subject to the license below, all these intellectual property rights are reserved.
                </p>
              </section>

              {/* License to Use Website */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">2</span>
                  License to Use Website
                </h3>
                <p>
                  You may view, download for caching purposes only, and print pages from the website for your own personal use, subject to the restrictions set out below and elsewhere in these Terms and Conditions.
                </p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">You must not:</p>
                <div className="bg-slate-50 rounded-xl p-5 space-y-3 text-xs text-slate-700 border border-slate-100">
                  <div className="flex gap-3 items-start">
                    <span className="text-rose-500 font-black mt-0.5">✕</span>
                    <span>Republish material from this website (including republication on another website)</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-rose-500 font-black mt-0.5">✕</span>
                    <span>Sell, rent, or sub-license material from the website</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-rose-500 font-black mt-0.5">✕</span>
                    <span>Show any material from the website in public</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-rose-500 font-black mt-0.5">✕</span>
                    <span>Reproduce, duplicate, copy, or otherwise exploit material on our website for a commercial purpose</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-rose-500 font-black mt-0.5">✕</span>
                    <span>Edit or otherwise modify any material on the website</span>
                  </div>
                </div>
              </section>

              {/* Acceptable Use */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">3</span>
                  Acceptable Use
                </h3>
                <p>
                  You must not use our website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website; or in any way which is unlawful, illegal, fraudulent, or harmful, or in connection with any unlawful, illegal, fraudulent, or harmful purpose or activity.
                </p>
              </section>

              {/* Restricted Access */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">4</span>
                  Restricted Access
                </h3>
                <p>
                  Access to certain areas of our website is restricted. We reserve the right to restrict access to other areas of our website, or indeed our whole website, at our discretion.
                </p>
              </section>

              {/* Variation */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">5</span>
                  Variation
                </h3>
                <p>
                  We may revise these Terms and Conditions from time to time. Revised Terms and Conditions will apply to the use of our website from the date of the publication of the revised Terms and Conditions on our website. Please check this page regularly to ensure you are familiar with the current version.
                </p>
              </section>

              {/* Contact Us */}
              <section className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold border border-[#10B981]/25 px-2 py-0.5 rounded-md bg-[#10B981]/5">6</span>
                  Contact Us
                </h3>
                <p>
                  If you have any questions about these Terms and Conditions, please contact us at:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="flex gap-3.5 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Mail className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">Email Inquiries</span>
                      <a href="mailto:hello@parrotmoney.in" className="text-sm font-bold text-slate-900 hover:text-[#10B981] break-all">hello@parrotmoney.in</a>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Phone className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">Phone Line</span>
                      <a href="tel:+919999657000" className="text-sm font-bold text-slate-900 hover:text-[#10B981]">+91 9999-657-000</a>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Sticky Footer */}
            <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-xs font-medium text-slate-500">
                Effective: June 2026 • © 2026 ParrotMoney
              </span>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-[#10B981] hover:bg-[#10B981]/90 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#10B981]/15 active:scale-95 transition-all text-center cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
