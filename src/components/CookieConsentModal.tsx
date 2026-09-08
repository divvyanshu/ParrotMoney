import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cookie, 
  ShieldCheck, 
  X, 
  ChevronRight, 
  Check, 
  Lock, 
  BarChart3, 
  SlidersHorizontal, 
  ExternalLink,
  Sparkles,
  Info,
  Globe
} from 'lucide-react';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  consentGiven: boolean;
  timestamp?: string;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: true,
  analytics: true,
  marketing: false,
  consentGiven: false,
};

const LOCAL_STORAGE_KEY = 'parrotmoney_cookie_consent_v2';

interface CookieConsentModalProps {
  onOpenPrivacyPolicy?: () => void;
  forceOpen?: boolean;
  onCloseForceOpen?: () => void;
}

export function CookieConsentModal({ 
  onOpenPrivacyPolicy,
  forceOpen = false,
  onCloseForceOpen
}: CookieConsentModalProps) {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [saveSuccessNotification, setSaveSuccessNotification] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
        if (!parsed.consentGiven) {
          // Timer delay for high quality entrance
          const timer = setTimeout(() => setShowBanner(true), 800);
          return () => clearTimeout(timer);
        }
      } else {
        const timer = setTimeout(() => setShowBanner(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setShowBanner(true);
      if (onCloseForceOpen) onCloseForceOpen();
    }
  }, [forceOpen, onCloseForceOpen]);

  const saveConsent = (updated: CookiePreferences) => {
    const finalPref: CookiePreferences = {
      ...updated,
      necessary: true, // Always true
      consentGiven: true,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalPref));
    } catch (e) {
      console.error('Failed to save cookie preferences:', e);
    }
    setPreferences(finalPref);
    setShowBanner(false);
    setShowSettingsModal(false);
    if (onCloseForceOpen) onCloseForceOpen();

    setSaveSuccessNotification(true);
    setTimeout(() => setSaveSuccessNotification(false), 3000);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      consentGiven: true,
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      consentGiven: true,
    });
  };

  const handleSaveCustomPreferences = () => {
    saveConsent(preferences);
  };

  return (
    <>
      {/* SUCCESS NOTIFICATION TOAST */}
      <AnimatePresence>
        {saveSuccessNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[120] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Cookie Preferences Updated</p>
              <p className="text-[10px] text-slate-400 font-medium">Your privacy choices have been securely saved.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINIMALIST FULL PAGE-LENGTH LIGHT COOKIE BANNER */}
      <AnimatePresence>
        {showBanner && !showSettingsModal && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 w-full z-[100] bg-white/95 backdrop-blur-md border-t border-slate-200 text-slate-800 shadow-xl py-3 px-4 sm:px-6 md:px-8"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
              {/* Text Notice */}
              <div className="flex items-start sm:items-center gap-3 flex-1 pr-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5 sm:mt-0">
                  <Cookie className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  We use cookies to enhance your digital banking experience. By browsing this site, you agree to our use of cookies.{' '}
                  <button
                    onClick={() => {
                      setShowPrivacyPolicyModal(true);
                      if (onOpenPrivacyPolicy) onOpenPrivacyPolicy();
                    }}
                    className="text-emerald-600 underline underline-offset-2 font-semibold hover:text-emerald-700 transition-colors cursor-pointer inline"
                  >
                    View Cookie Policy
                  </button>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={handleRejectNonEssential}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-all cursor-pointer"
                >
                  Essential Only
                </button>

                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
                >
                  Accept All
                </button>

                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer ml-1"
                  aria-label="Close cookie banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PrivacyPolicyModal 
        isOpen={showPrivacyPolicyModal} 
        onClose={() => setShowPrivacyPolicyModal(false)} 
      />
    </>
  );
}
