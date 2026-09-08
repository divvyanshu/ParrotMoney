import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User as UserIcon, Bot, X, MessageSquare, Mic, MicOff, 
  Volume2, VolumeX, Loader2, Paperclip, Lock, Shield, FileText, 
  Download, UploadCloud, ArrowRight, CheckCircle2, Sparkles,
  Search, ShieldCheck, Edit3, ChevronRight, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatResponse, logCustomerLead, UserContext } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  thoughtStages?: string[];
}

const RESEARCH_STEPS = [
  "Scanning 25+ lender rate cards & benchmark EBLR/RLLR spreads...",
  "Validating borrower FOIR thresholds and loan-to-value (LTV) limits...",
  "Auditing hidden charges (Legal, technical, MODTD, CERSAI & stamp duty)...",
  "Synthesizing executive underwriting report & product recommendations..."
];

export function getContextualChips(messages: Message[]): { label: string; query: string }[] {
  if (messages.length === 0) {
    return [
      { label: "Compare SBI vs HDFC", query: "Compare SBI vs HDFC Bank for a ₹75 Lakh home loan over 20 years. Include interest rates, processing fees, and key terms." },
      { label: "Balance Transfer Savings", query: "How much can I save by transferring my existing ₹50L home loan to an 8.40% lender?" },
      { label: "Check Loan Eligibility", query: "I earn ₹1,50,000 net monthly with an existing ₹25,000 car EMI. Calculate my maximum eligible home loan." },
      { label: "Plot + Construction Loan", query: "How does a composite loan for plot purchase and home construction work?" }
    ];
  }

  const recentText = messages.slice(-3).map(m => m.content.toLowerCase()).join(' ');

  if (recentText.includes('transfer') || recentText.includes('balance') || recentText.includes('refinance') || recentText.includes('switch') || recentText.includes('foreclosure')) {
    return [
      { label: "Net Interest Savings", query: "Calculate total interest saved over 15 years by moving ₹50 Lakh loan from 9.35% to 8.40%." },
      { label: "Zero Prepayment Rules", query: "Can my existing bank charge prepayment penalty on a floating rate home loan under RBI norms?" },
      { label: "Top-Up Loan Options", query: "How much Top-Up can I get along with my Balance Transfer, and what is the interest rate?" },
      { label: "Switching Costs", query: "What are the typical switching costs for a balance transfer?" }
    ];
  }

  if (recentText.includes('foir') || recentText.includes('salary') || recentText.includes('income') || recentText.includes('emi') || recentText.includes('eligible') || recentText.includes('eligibility') || recentText.includes('obligation')) {
    return [
      { label: "Add Co-applicant", query: "How does adding a co-applicant increase my sanction amount and FOIR limit?" },
      { label: "20 vs 30-Year Tenure", query: "Compare maximum loan eligibility between a 20-year and 30-year tenure on ₹1.5L salary." },
      { label: "Existing Car EMI Impact", query: "How much does a ₹15,000 existing EMI reduce my home loan borrowing capacity?" },
      { label: "Women Borrower Concession", query: "What is the interest rate concession for female co-owners, and which banks provide it?" }
    ];
  }

  if (recentText.includes('sbi') || recentText.includes('hdfc') || recentText.includes('icici') || recentText.includes('kotak') || recentText.includes('bank') || recentText.includes('rate') || recentText.includes('eblr')) {
    return [
      { label: "Compare Processing Fees", query: "Compare processing fees and other charges between SBI, HDFC, and ICICI." },
      { label: "SBI MaxGain vs Regular", query: "Explain how SBI MaxGain home loan overdraft saves interest compared to a standard term loan." },
      { label: "EBLR vs NBFC Rates", query: "What is the difference in repo rate transmission between bank EBLR and NBFC PLR loans?" },
      { label: "Sanction Turnaround Time", query: "What is the typical sanction turnaround time for HDFC, ICICI, SBI, and Kotak?" }
    ];
  }

  return [
    { label: "Compare Bank Rates", query: "Compare SBI vs HDFC Bank for a ₹75 Lakh home loan over 20 years with all fees." },
    { label: "Calculate Loan Limit", query: "Calculate my maximum eligible loan based on my monthly salary and obligations." },
    { label: "Balance Transfer", query: "How much can I save by doing a balance transfer on my existing home loan?" },
    { label: "Required Documents", query: "What basic documents do I need for home loan approval?" }
  ];
}

export function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);

  // Customer Contact Gatekeeping State
  const [customer, setCustomer] = useState<UserContext | null>(() => {
    try {
      const saved = localStorage.getItem('parrot_advisory_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);
  const [isSubmittingGate, setIsSubmittingGate] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);

  // Chat conversation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeResearchStep, setActiveResearchStep] = useState(0);

  // Voice & Language state
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [recognitionLanguage, setRecognitionLanguage] = useState('en-IN');

  // Secure Documents Upload States
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState('paystub');
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize welcome message when customer is verified
  useEffect(() => {
    if (customer && messages.length === 0) {
      const greeting = `Hello${customer.name ? ` ${customer.name}` : ''}! 👋\n\nI'm your personal loan advisor. Ask me anything about home loans — whether you'd like to compare bank rates, calculate your EMI, or check your borrowing eligibility.\n\nWhat can I help you with today?`;
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [customer, messages.length]);

  // Load uploaded documents list on launch / open
  useEffect(() => {
    if (isOpen) {
      fetchUploadedDocs();
    }
  }, [isOpen]);

  // Global event listener to trigger chatbot from other components & synchronize customer
  useEffect(() => {
    const handleOpenChat = (e?: any) => {
      setIsOpen(true);
      const pending = e?.detail?.query || sessionStorage.getItem('pending_chat_query');
      if (pending) {
        sessionStorage.removeItem('pending_chat_query');
        setTimeout(() => {
          const saved = localStorage.getItem('parrot_advisory_customer');
          if (saved) {
            handleSend(undefined, pending);
          } else {
            setInput(pending);
          }
        }, 200);
      }
    };

    const handleCustomerSync = () => {
      try {
        const saved = localStorage.getItem('parrot_advisory_customer');
        setCustomer(saved ? JSON.parse(saved) : null);
      } catch {
        // ignore
      }
    };

    window.addEventListener('open-parrot-chat', handleOpenChat);
    window.addEventListener('storage', handleCustomerSync);
    window.addEventListener('parrot-customer-updated', handleCustomerSync);

    return () => {
      window.removeEventListener('open-parrot-chat', handleOpenChat);
      window.removeEventListener('storage', handleCustomerSync);
      window.removeEventListener('parrot-customer-updated', handleCustomerSync);
    };
  }, [customer]);

  // Cycle research steps when waiting for AI response
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setActiveResearchStep(0);
      interval = setInterval(() => {
        setActiveResearchStep((prev) => (prev < RESEARCH_STEPS.length - 1 ? prev + 1 : prev));
      }, 900);
    } else {
      setActiveResearchStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, activeResearchStep]);

  const fetchUploadedDocs = async () => {
    try {
      const response = await fetch('/api/documents/list');
      if (response.ok) {
        const data = await response.json();
        setUploadedDocs(data);
      }
    } catch (e) {
      console.error("Failed to load secure document metadata:", e);
    }
  };

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);

    // 1. Name validation
    const name = nameInput.trim();
    if (!name) {
      setGateError("Please enter your name.");
      return;
    }

    // 2. 10-digit Indian phone validation (starts with 6, 7, 8, or 9)
    const phone = phoneInput.trim().replace(/\D/g, ''); // strip non-digits
    if (!phone || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      setGateError("Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
      return;
    }

    // 3. Email regex validation
    const email = emailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setGateError("Please enter a valid work or personal email address.");
      return;
    }

    setIsSubmittingGate(true);
    try {
      const userPayload: UserContext = {
        name,
        phone,
        email,
      };

      // Log lead to server endpoint and Firestore
      await logCustomerLead({
        name: userPayload.name,
        phone: userPayload.phone,
        email: userPayload.email,
        source: 'advisory_agent_gate'
      });

      localStorage.setItem('parrot_advisory_customer', JSON.stringify(userPayload));
      setCustomer(userPayload);
      setShowEditCustomer(false);
      window.dispatchEvent(new CustomEvent('parrot-customer-updated', { detail: userPayload }));

      // Set welcome message
      const greeting = `Hello ${userPayload.name}! 👋\n\nGreat to connect with you. I'm your personal loan guide. Ask me anything about home loans — whether you'd like to compare bank rates, calculate your EMI, or check how much you can borrow.\n\nWhat can I help you check first?`;
      setMessages([{ role: 'assistant', content: greeting }]);

      // Check if there was a pending input or query
      const pendingQuery = sessionStorage.getItem('pending_chat_query') || input;
      if (pendingQuery && pendingQuery.trim()) {
        sessionStorage.removeItem('pending_chat_query');
        setTimeout(() => {
          handleSend(undefined, pendingQuery.trim());
        }, 300);
      }
    } catch (err: any) {
      console.error("Gate verification error:", err);
      setGateError("Unable to initialize advisory session. Please check connection and retry.");
    } finally {
      setIsSubmittingGate(false);
    }
  };

  const handleResetCustomer = () => {
    localStorage.removeItem('parrot_advisory_customer');
    setCustomer(null);
    setMessages([]);
    setEmailInput('');
    setPhoneInput('');
    setNameInput('');
    setShowEditCustomer(false);
    window.dispatchEvent(new CustomEvent('parrot-customer-updated', { detail: null }));
  };

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const messageToSend = (overrideInput || input).trim();
    if (!messageToSend || isLoading || !customer) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ 
        role: m.role === 'user' ? 'user' : 'model', 
        content: m.content 
      }));

      const aiResponse = await getChatResponse(messageToSend, history, customer);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse,
        thoughtStages: [...RESEARCH_STEPS]
      }]);
      
      if (voiceEnabled) {
        speak(aiResponse);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I encountered an error while synthesizing lender policies. Please retry your question or rephrase your specific parameters."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (mediaRecorderRef.current) {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = recognitionLanguage || 'en-IN';

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setInput(transcript);
          }
        };
        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error);
          setIsRecording(false);
        };
        recognition.onend = () => setIsRecording(false);

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition fallback:', err);
      }
    }

    // MediaRecorder fallback
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('language_code', recognitionLanguage);

        setIsLoading(true);
        try {
          const response = await fetch('/api/voice/stt', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) throw new Error(`STT failed with ${response.status}`);
          const data = await response.json();
          if (data.transcript) {
            setInput(data.transcript);
            setTimeout(() => {
              handleSend(undefined, data.transcript);
            }, 400);
          }
        } catch (error: any) {
          console.error('STT Error:', error);
        } finally {
          setIsLoading(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Could not access microphone. Please check browser microphone permissions.');
    }
  };

  const speak = async (text: string) => {
    if (!voiceEnabled) return;
    setIsSpeaking(true);
    const cleanText = text.replace(/[*_#`]/g, '').slice(0, 500); // Read first concise overview

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
      }
    }

    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, language_code: recognitionLanguage }),
      });
      if (!response.ok) throw new Error('TTS failed');
      const data = await response.json();
      if (data.audios && data.audios[0]) {
        const audio = new Audio(`data:audio/wav;base64,${data.audios[0]}`);
        audioPlayerRef.current = audio;
        audio.play();
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Document file size exceeds the 10MB limit.");
      return;
    }

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', docType);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      const data = await response.json();
      if (data.success && data.document) {
        await fetchUploadedDocs();
        setShowUploadPanel(false);

        const docTypeName = 
          docType === 'paystub' ? 'Pay Stub (Salary Slip)' :
          docType === 'bank_statement' ? 'Bank Statement' :
          docType === 'identification' ? 'Identification (PAN/Aadhaar)' : 'Supporting Document';

        const confirmationMsg = `🔒 **[Secure Document Received]**\n\nYour **${docTypeName}** (\`${data.document.originalName}\`) has been uploaded to the AES-256 encrypted locker.\n- **Checksum:** \`${data.document.checksum.slice(0, 20)}...\`\n- **Status:** Verified in Vault\n- **Size:** ${(data.document.size / 1024).toFixed(1)} KB`;

        setMessages(prev => [...prev, { role: 'assistant', content: confirmationMsg }]);

        if (customer) {
          setIsLoading(true);
          try {
            const systemContext = `[User uploaded secure document "${docType}" named "${data.document.originalName}". Acknowledge receipt professionally and outline how underwriters assess this document for Indian home loans.]`;
            const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content }));
            const aiResponse = await getChatResponse(systemContext, history, customer);
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
            if (voiceEnabled) speak(aiResponse);
          } catch (chatErr) {
            console.error("Chat feedback error:", chatErr);
          } finally {
            setIsLoading(false);
          }
        }
      }
    } catch (err: any) {
      console.error("Secure upload error:", err);
      alert(`Secure upload failed: ${err.message}`);
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const contextualChips = getContextualChips(messages);

  return (
    <>
      {/* Sleek Minimalist Launcher Button (Visible when drawer is closed) */}
      {!isOpen && (
        <button
          id="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 px-4 py-3 bg-[#0F172A] text-white rounded-full shadow-lg hover:bg-[#1E293B] hover:shadow-xl active:scale-95 transition-all z-[999] flex items-center gap-2.5 border border-slate-700/60 cursor-pointer"
          aria-label="Open AI"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-white">AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>
      )}

      {/* Main Advisory Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed bottom-6 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-3.5rem)] bg-white rounded-2xl shadow-2xl z-[1000] flex flex-col border border-slate-200/80 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-white">AI</h3>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded-md font-medium">Online</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-normal truncate max-w-[200px]">
                    {customer ? `${customer.name} • +91 ${customer.phone}` : "Personal Loan Guide"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {customer && (
                  <button
                    type="button"
                    title="Edit Contact Info"
                    onClick={() => setShowEditCustomer(!showEditCustomer)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  type="button"
                  title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all cursor-pointer",
                    voiceEnabled ? "text-emerald-400 hover:bg-white/10" : "text-slate-400 hover:bg-white/10"
                  )}
                >
                  {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PRE-REQUISITE GATE: Customer Name, Mobile & Email Required */}
            {(!customer || showEditCustomer) ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between bg-slate-50">
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-slate-900 tracking-tight">
                      Welcome 👋
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Please share your details to get personalized bank rates and loan recommendations.
                    </p>
                  </div>

                  <form onSubmit={handleGateSubmit} className="space-y-3.5">
                    {/* 1. Name comes first */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 block">
                        Full Name
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="Your name"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    {/* 2. Mobile No. comes second */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 block">
                        Mobile Number
                      </label>
                      <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                        <span className="px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-xs text-slate-500 select-none flex items-center font-medium">
                          +91
                        </span>
                        <input 
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="10-digit mobile number"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 outline-none bg-transparent text-slate-900 placeholder:text-slate-400 tracking-wide"
                        />
                      </div>
                    </div>

                    {/* 3. Email ID comes third */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 block">
                        Email Address
                      </label>
                      <input 
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    {gateError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                        {gateError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingGate}
                      className="w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-60 cursor-pointer mt-2"
                    >
                      {isSubmittingGate ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                          <span>Starting...</span>
                        </>
                      ) : (
                        <>
                          <span>Start</span>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-[11px] text-slate-400 text-center">
                    Your information is secure and private.
                  </p>
                </div>

                {customer && showEditCustomer && (
                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setShowEditCustomer(false)}
                      className="text-xs text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ACTIVE ADVISORY CHAT VIEW */
              <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
                {/* Messages Stream */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth">
                  {messages.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-2.5 max-w-[88%]",
                        m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg shrink-0 mt-0.5 flex items-center justify-center text-xs font-medium shadow-2xs",
                        m.role === 'user' 
                          ? "bg-[#0F172A] text-white" 
                          : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                      )}>
                        {m.role === 'user' ? <UserIcon className="w-3 h-3" /> : <Sparkles className="w-3 h-3 text-emerald-600" />}
                      </div>

                      <div className={cn(
                        "p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs",
                        m.role === 'user' 
                          ? "bg-[#0F172A] text-white rounded-tr-none" 
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-200/80"
                      )}>
                        <div className="markdown-body">
                          <ReactMarkdown>
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Clean Loading Indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2.5 max-w-[85%]"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                      </div>
                      
                      <div className="bg-white border border-slate-200/80 py-2.5 px-3.5 rounded-2xl rounded-tl-none shadow-2xs flex items-center gap-2.5 text-xs text-slate-600">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-slate-600 font-medium">Checking options for you...</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Minimalist Contextual Suggestions */}
                {!isLoading && contextualChips.length > 0 && (
                  <div className="px-3 py-2 bg-slate-50/80 border-t border-slate-200/60">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {contextualChips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleSend(undefined, chip.query)}
                          className="px-2.5 py-1 bg-white border border-slate-200/80 hover:border-emerald-500 hover:text-emerald-700 text-slate-600 rounded-full text-[11px] font-medium whitespace-nowrap transition-all shadow-2xs shrink-0 cursor-pointer"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents Upload Panel */}
                <AnimatePresence>
                  {showUploadPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: "100%" }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="absolute inset-x-0 bottom-0 top-[20%] bg-white border-t border-slate-200 z-40 rounded-t-2xl shadow-2xl flex flex-col p-4 space-y-3 font-sans"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-emerald-600" />
                          <h4 className="font-semibold text-xs text-slate-800">Upload Documents</h4>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setShowUploadPanel(false)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Upload your salary slips, bank statements, or KYC for instant eligibility verification.
                      </p>

                      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-slate-600">Document Type</label>
                          <select 
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="paystub">Salary Slip (Last 3 Months)</option>
                            <option value="bank_statement">Bank Statement (Last 6 Months)</option>
                            <option value="identification">KYC (PAN, Aadhaar)</option>
                            <option value="other">Property / ITR / Form 16</option>
                          </select>
                        </div>

                        <div 
                          onClick={() => !uploadingDoc && fileInputRef.current?.click()}
                          className={cn(
                            "border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-slate-50 p-4 rounded-xl cursor-pointer text-center space-y-1.5 transition-all flex flex-col items-center justify-center",
                            uploadingDoc && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          {uploadingDoc ? (
                            <>
                              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                              <p className="text-xs font-medium text-emerald-700">Uploading securely...</p>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-5 h-5 text-slate-400" />
                              <p className="text-xs font-medium text-slate-700">Select file or drag here</p>
                              <p className="text-[10px] text-slate-400">PDF, PNG, JPG (Max 10MB)</p>
                            </>
                          )}
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            accept=".pdf,.png,.jpg,.jpeg" 
                            disabled={uploadingDoc}
                          />
                        </div>

                        {uploadedDocs.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-medium text-slate-500 block">
                              Uploaded Documents ({uploadedDocs.length})
                            </span>
                            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                              {uploadedDocs.map((doc: any) => (
                                <div key={doc.id} className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs gap-2">
                                  <div className="truncate">
                                    <p className="text-xs font-medium text-slate-800 truncate">{doc.originalName}</p>
                                    <p className="text-[10px] text-slate-400">{(doc.size / 1024).toFixed(0)} KB</p>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => window.open(`/api/documents/download/${doc.id}`, '_blank')}
                                    className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                                    title="Download"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Minimalist Input Console */}
                <div className="p-3 bg-white border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <button 
                      type="button"
                      onClick={() => setRecognitionLanguage(recognitionLanguage === 'en-IN' ? 'hi-IN' : 'en-IN')}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-md text-[10px] font-medium text-slate-600 transition-colors"
                    >
                      {recognitionLanguage === 'en-IN' ? 'English' : 'हिंदी (Hindi)'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUploadPanel(!showUploadPanel)}
                      className={cn(
                        "text-[11px] font-medium flex items-center gap-1 transition-colors",
                        showUploadPanel ? "text-emerald-700" : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>Documents ({uploadedDocs.length})</span>
                    </button>
                  </div>

                  <form onSubmit={handleSend} className="flex gap-2 items-center">
                    <div className="flex-1 relative flex items-center">
                      <input
                        id="chat-input"
                        placeholder={isRecording ? "Listening..." : "Ask anything about home loans..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className={cn(
                          "w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-900 placeholder:text-slate-400",
                          isRecording && "ring-2 ring-rose-400 bg-rose-50/30"
                        )}
                      />
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={cn(
                          "absolute right-2 p-1 rounded-lg transition-colors cursor-pointer",
                          isRecording ? "text-rose-600" : "text-slate-400 hover:text-slate-700"
                        )}
                        title={isRecording ? "Stop Recording" : "Voice input"}
                      >
                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      id="chat-send-btn"
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="p-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl disabled:opacity-30 transition-all active:scale-95 shadow-xs cursor-pointer shrink-0"
                      title="Send"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
