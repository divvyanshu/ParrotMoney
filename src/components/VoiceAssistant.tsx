import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  CornerDownLeft, 
  ArrowRight, 
  Volume2, 
  VolumeX,
  AlertTriangle,
  Play,
  RotateCcw,
  History,
  BookOpen,
  ArrowLeftRight,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

// Standard declaration for speech recognition types in browsers
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceAssistantProps {
  formData: any;
  updateForm: (field: string, value: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  loanStep: number;
  setLoanStep: (step: number) => void;
  handleNextStep: () => void;
  validationErrors: Record<string, string>;
}

export function VoiceAssistant({
  formData,
  updateForm,
  setFormData,
  loanStep,
  setLoanStep,
  handleNextStep,
  validationErrors
}: VoiceAssistantProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechFeedback, setSpeechFeedback] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastAction, _setLastAction] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<{ id: string; text: string; action: string; timestamp: Date; success: boolean }[]>([]);
  const [toast, setToast] = useState<{ id: string; text: string; action: string; success: boolean } | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const currentSpeechTextRef = useRef<string>('');

  const setLastAction = (action: string | null) => {
    _setLastAction(action);
    if (action) {
      const text = currentSpeechTextRef.current || "Voice command";
      setCommandHistory(prev => {
        const lastItem = prev[0];
        if (lastItem && lastItem.action === action && lastItem.text === text && (Date.now() - lastItem.timestamp.getTime() < 800)) {
          return prev;
        }
        const newItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
          text: text,
          action: action,
          timestamp: new Date(),
          success: true
        };
        setToast({
          id: newItem.id,
          text: text,
          action: action,
          success: true
        });
        return [newItem, ...prev].slice(0, 10);
      });
    }
  };

  // Clear toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English accent fits well

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('Listening... Speak a command.');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const activeTranscript = finalTranscript || interimTranscript;
      if (activeTranscript.trim()) {
        setTranscript(activeTranscript);
        setSpeechFeedback('');
      }

      if (finalTranscript.trim()) {
        processCommand(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        speakText("Microphone access was denied. Please allow microphone permission in your browser.");
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [loanStep]); // Re-initialize to lock in current step closure context

  // Keep a ref to the current props so the async onresult handler doesn't use stale values
  const propsRef = useRef({ formData, loanStep, updateForm, setFormData, setLoanStep, handleNextStep });
  useEffect(() => {
    propsRef.current = { formData, loanStep, updateForm, setFormData, setLoanStep, handleNextStep };
  }, [formData, loanStep, updateForm, setFormData, setLoanStep, handleNextStep]);

  // Voice confirmation helper
  const speakText = (text: string) => {
    if (isMuted) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed', e);
    }
  };

  // Convert Indian numbers like lakhs/crores to integers
  const parseSpokenAmount = (text: string): number | null => {
    const clean = text.toLowerCase()
      .replace(/[,₹]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const wordToNum: { [key: string]: number } = {
      zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
      eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
      twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
      hundred: 100
    };

    // 1. Check for digits first (e.g., "50 lakhs", "1.5 crores", "5000000")
    const digitRegex = /(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|crore|crores|cr|thousand|k)?/gi;
    const match = digitRegex.exec(clean);
    if (match) {
      let num = parseFloat(match[1]);
      const multiplier = match[2]?.toLowerCase();
      if (multiplier) {
        if (multiplier.startsWith('l') || multiplier === 'lac' || multiplier === 'lacs') {
          num *= 100000;
        } else if (multiplier.startsWith('cr') || multiplier.startsWith('crore')) {
          num *= 10000000;
        } else if (multiplier.startsWith('thou') || multiplier === 'k') {
          num *= 1000;
        }
      }
      return num;
    }

    // 2. Parse written word numbers (e.g., "fifty lakhs")
    let parsedValue = 0;
    let tempSum = 0;
    const words = clean.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (wordToNum[w] !== undefined) {
        tempSum += wordToNum[w];
      } else if (w === 'and') {
        continue;
      } else if (w === 'lakh' || w === 'lakhs' || w === 'lac' || w === 'lacs') {
        if (tempSum === 0) tempSum = 1;
        parsedValue += tempSum * 100000;
        tempSum = 0;
      } else if (w === 'crore' || w === 'crores' || w === 'cr') {
        if (tempSum === 0) tempSum = 1;
        parsedValue += tempSum * 10000000;
        tempSum = 0;
      } else if (w === 'thousand') {
        if (tempSum === 0) tempSum = 1;
        parsedValue += tempSum * 1000;
        tempSum = 0;
      }
    }
    parsedValue += tempSum;
    return parsedValue > 0 ? parsedValue : null;
  };

  const processCommand = (speechText: string) => {
    currentSpeechTextRef.current = speechText;
    const text = speechText.toLowerCase().trim();
    const current = propsRef.current;
    
    // Global Navigation Commands
    if (text.includes('next step') || text.includes('continue') || text === 'next' || text.includes('proceed')) {
      current.handleNextStep();
      setLastAction('Navigating to next step');
      speakText("Going to the next step.");
      return;
    }

    if (text.includes('go back') || text === 'back' || text.includes('previous step') || text === 'previous') {
      if (current.loanStep > 1) {
        current.setLoanStep(current.loanStep - 1);
        setLastAction('Navigating back');
        speakText("Going back.");
      } else {
        speakText("You are already on the first step.");
      }
      return;
    }

    // Context-Aware Processing by Active Step
    let actionTriggered = false;

    switch (current.loanStep) {
      case 1: // Requirements
        // 1. Loan Amount
        if (text.includes('amount') || text.includes('loan') || text.includes('lakh') || text.includes('crore')) {
          const parsedAmount = parseSpokenAmount(text);
          if (parsedAmount && parsedAmount > 1000) {
            current.updateForm('loanAmount', parsedAmount);
            setLastAction(`Set Loan Amount to ₹${parsedAmount.toLocaleString('en-IN')}`);
            speakText(`Got it. Estimated loan requirement set to ${parsedAmount >= 100000 ? `${parsedAmount / 100000} Lakhs` : parsedAmount}.`);
            actionTriggered = true;
          }
        }

        // 2. Urgency / Intent
        if (text.includes('immediately') || text.includes('now') || text.includes('urgent')) {
          current.updateForm('intent', 'immediately');
          setLastAction('Set disbursement timeline to Immediately');
          speakText("Set disbursement to immediately.");
          actionTriggered = true;
        } else if (text.includes('week') || text.includes('seven days')) {
          current.updateForm('intent', 'within_a_week');
          setLastAction('Set disbursement to Within a week');
          speakText("Set disbursement to within a week.");
          actionTriggered = true;
        } else if (text.includes('month') || text.includes('months') || text.includes('planning')) {
          if (text.includes('just') || text.includes('plan') || text.includes('enquir')) {
            current.updateForm('intent', 'just_enquiring');
            setLastAction('Set timeline to Planning');
            speakText("Set timeline to planning.");
          } else {
            current.updateForm('intent', 'next_couple_months');
            setLastAction('Set timeline to In 2-3 months');
            speakText("Set timeline to 2-3 months.");
          }
          actionTriggered = true;
        }

        // 3. Tenure
        if (text.includes('tenure') || text.includes('years') || text.includes('term') || text.includes('time')) {
          const yearsMatch = text.match(/(\d+)\s*(?:years|year)?/);
          if (yearsMatch) {
            const yrs = parseInt(yearsMatch[1]);
            if (yrs > 0 && yrs <= 30) {
              current.updateForm('tenure', yrs);
              setLastAction(`Set tenure to ${yrs} years`);
              speakText(`Setting loan term to ${yrs} years.`);
              actionTriggered = true;
            }
          } else {
            // Check word numbers
            const numWords = ['five', 'ten', 'fifteen', 'twenty', 'twenty five', 'thirty'];
            for (const word of numWords) {
              if (text.includes(word)) {
                const map: { [k: string]: number } = { 'five': 5, 'ten': 10, 'fifteen': 15, 'twenty': 20, 'twenty five': 25, 'thirty': 30 };
                current.updateForm('tenure', map[word]);
                setLastAction(`Set tenure to ${map[word]} years`);
                speakText(`Setting loan term to ${map[word]} years.`);
                actionTriggered = true;
                break;
              }
            }
          }
        }

        // 4. Age
        if (text.includes('age') || text.includes('years old') || text.includes('am \d+')) {
          const ageMatch = text.match(/(\d+)/);
          if (ageMatch) {
            const ageVal = parseInt(ageMatch[1]);
            if (ageVal >= 18 && ageVal <= 100) {
              current.updateForm('age', ageVal);
              setLastAction(`Set age to ${ageVal}`);
              speakText(`Setting your age to ${ageVal} years old.`);
              actionTriggered = true;
            }
          }
        }
        break;

      case 2: // Property Details
        // 1. Property Price
        if (text.includes('price') || text.includes('value') || text.includes('property worth') || text.includes('worth')) {
          const parsedPrice = parseSpokenAmount(text);
          if (parsedPrice && parsedPrice > 1000) {
            current.updateForm('propertyValue', parsedPrice);
            setLastAction(`Set Property Price to ₹${parsedPrice.toLocaleString('en-IN')}`);
            speakText(`Got it. Property value set to ${parsedPrice >= 100000 ? `${parsedPrice / 100000} Lakhs` : parsedPrice}.`);
            actionTriggered = true;
          }
        }

        // 2. Location (City)
        if (text.includes('city') || text.includes('location') || text.includes('in mumba') || text.includes('in bangal') || text.includes('delhi') || text.includes('pune')) {
          const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow'];
          for (const city of cities) {
            if (text.includes(city.toLowerCase())) {
              current.updateForm('city', city);
              setLastAction(`Set location to ${city}`);
              speakText(`Setting property location to ${city}.`);
              actionTriggered = true;
              break;
            }
          }
        }

        // 3. Category
        if (text.includes('residential') || text.includes('home') || text.includes('house') || text.includes('flat') || text.includes('apartment')) {
          current.updateForm('propertyCategory', 'Residential');
          current.updateForm('propertyType', 'Flat / Apartment');
          setLastAction('Set property type to Residential Flat');
          speakText("Set property category to Residential Flat.");
          actionTriggered = true;
        } else if (text.includes('commercial') || text.includes('office') || text.includes('shop')) {
          current.updateForm('propertyCategory', 'Commercial');
          current.updateForm('propertyType', 'Commercial Shop / Office');
          setLastAction('Set property type to Commercial Shop');
          speakText("Set property category to Commercial Shop.");
          actionTriggered = true;
        } else if (text.includes('industrial') || text.includes('factory')) {
          current.updateForm('propertyCategory', 'Industrial');
          current.updateForm('propertyType', 'Industrial Land');
          setLastAction('Set property category to Industrial');
          speakText("Set property category to Industrial.");
          actionTriggered = true;
        } else if (text.includes('agricultural') || text.includes('farm') || text.includes('land')) {
          current.updateForm('propertyCategory', 'Agricultural');
          current.updateForm('propertyType', 'Agricultural Land');
          setLastAction('Set property category to Agricultural');
          speakText("Set property category to Agricultural Land.");
          actionTriggered = true;
        }
        break;

      case 3: // Work/Employment Details
        if (text.includes('salaried') || text.includes('salary') || text.includes('job') || text.includes('monthly pay')) {
          current.updateForm('occupation', 'Salaried');
          setLastAction('Set occupation to Salaried');
          speakText("Setting your work profile to Salaried.");
          actionTriggered = true;
        } else if (text.includes('self employed') || text.includes('professional') || text.includes('doctor') || text.includes('ca')) {
          current.updateForm('occupation', 'Self-Employed');
          setLastAction('Set occupation to Self-Employed');
          speakText("Setting your work profile to Self Employed Professional.");
          actionTriggered = true;
        } else if (text.includes('business') || text.includes('own enterprise') || text.includes('owner') || text.includes('shopkeeper')) {
          current.updateForm('occupation', 'Business');
          setLastAction('Set occupation to Business');
          speakText("Setting your work profile to Business Owner.");
          actionTriggered = true;
        } else if (text.includes('other') || text.includes('freelance') || text.includes('retired')) {
          current.updateForm('occupation', 'Other');
          setLastAction('Set occupation to Other');
          speakText("Setting your work profile to Other.");
          actionTriggered = true;
        }

        // Monthly income
        if (text.includes('income') || text.includes('salary of') || text.includes('earn')) {
          const parsedIncome = parseSpokenAmount(text);
          if (parsedIncome) {
            current.updateForm('monthlyIncome', parsedIncome);
            setLastAction(`Set Monthly Income to ₹${parsedIncome.toLocaleString('en-IN')}`);
            speakText(`Got it. Monthly income set to ${parsedIncome >= 100000 ? `${parsedIncome / 100000} Lakhs` : parsedIncome}.`);
            actionTriggered = true;
          }
        }
        break;

      case 4: // Co-borrower
        if (text.includes('yes') || text.includes('add co borrower') || text.includes('spouse') || text.includes('wife') || text.includes('husband') || text.includes('parent') || text.includes('with co-applicant')) {
          current.updateForm('hasCoBorrower', 'Yes');
          
          if (text.includes('spouse') || text.includes('wife') || text.includes('husband')) {
            current.updateForm('coBorrowerRelation', 'Spouse');
            speakText("Co-borrower added with Spouse relationship.");
          } else if (text.includes('parent') || text.includes('father') || text.includes('mother')) {
            current.updateForm('coBorrowerRelation', 'Parent');
            speakText("Co-borrower added with Parent relationship.");
          } else if (text.includes('sibling') || text.includes('brother') || text.includes('sister')) {
            current.updateForm('coBorrowerRelation', 'Sibling');
            speakText("Co-borrower added with Sibling relationship.");
          } else {
            speakText("Enabling co-borrower option.");
          }
          setLastAction('Enabled Co-Borrower');
          actionTriggered = true;
        } else if (text.includes('no') || text.includes('without co') || text.includes('single') || text.includes('debt free')) {
          current.updateForm('hasCoBorrower', 'No');
          setLastAction('Disabled Co-Borrower');
          speakText("Proceeding without a co-borrower.");
          actionTriggered = true;
        }

        // Co-borrower monthly income
        if (text.includes('co borrower income') || text.includes('co-borrower salary') || text.includes('earn')) {
          const parsedCoIncome = parseSpokenAmount(text);
          if (parsedCoIncome) {
            current.setFormData((prev: any) => ({
              ...prev,
              coBorrowerMonthlyIncome: parsedCoIncome,
              householdIncome: parsedCoIncome * 12
            }));
            setLastAction(`Set Co-borrower Income to ₹${parsedCoIncome.toLocaleString('en-IN')}`);
            speakText(`Setting co-borrower monthly income to ${parsedCoIncome >= 100000 ? `${parsedCoIncome / 100000} Lakhs` : parsedCoIncome}.`);
            actionTriggered = true;
          }
        }
        break;

      case 5: // Bank details
        if (text.includes('bank') || text.includes('hdfc') || text.includes('icici') || text.includes('sbi') || text.includes('axis') || text.includes('kotak')) {
          const banks = ['HDFC Bank', 'State Bank of India (SBI)', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'];
          for (const b of banks) {
            const shortName = b.toLowerCase().replace(/bank|\(sbi\)/g, '').trim();
            if (text.includes(shortName)) {
              current.updateForm('bankAccount', b);
              setLastAction(`Set salary account bank to ${b}`);
              speakText(`Setting salary account bank to ${b}.`);
              actionTriggered = true;
              break;
            }
          }
        }
        break;

      case 6: // Other active EMIs
        if (text.includes('no active loans') || text.includes('debt free') || text === 'no' || text.includes('don\'t have any loan')) {
          current.updateForm('activeLoans', []);
          setLastAction('Cleared active loans (Debt-free)');
          speakText("Marking as debt-free. No active EMIs.");
          actionTriggered = true;
        } else if (text.includes('yes') || text.includes('active loan') || text.includes('have loans') || text.includes('emi')) {
          // If EMIs are active, initialize one
          current.updateForm('activeLoans', [{ id: Date.now().toString(), bankName: '', type: 'Personal Loan', amount: 0 }]);
          setLastAction('Added an active loan field');
          speakText("Adding active loan field. Please state the EMI repayment amount.");
          actionTriggered = true;
        }

        // Set EMI amount if active loans are shown
        if (text.includes('emi of') || text.includes('paying') || text.includes('repayment')) {
          const parsedEMI = parseSpokenAmount(text);
          if (parsedEMI) {
            const currentLoans = [...current.formData.activeLoans];
            if (currentLoans.length === 0) {
              currentLoans.push({ id: Date.now().toString(), bankName: '', type: 'Personal Loan', amount: parsedEMI });
            } else {
              currentLoans[0] = { ...currentLoans[0], amount: parsedEMI };
            }
            current.updateForm('activeLoans', currentLoans);
            setLastAction(`Set active EMI to ₹${parsedEMI.toLocaleString('en-IN')}`);
            speakText(`Got it. Active monthly EMI set to ${parsedEMI}.`);
            actionTriggered = true;
          }
        }
        break;

      case 7: // CIBIL Score
        if (text.includes('poor') || text.includes('below 650') || text.includes('low')) {
          current.updateForm('cibilScore', 600);
          current.updateForm('cibilStatus', 'Outstanding & Defaults');
          setLastAction('Set CIBIL to Poor (<650)');
          speakText("Setting credit tier to Poor CIBIL score.");
          actionTriggered = true;
        } else if (text.includes('fair') || text.includes('650') || text.includes('700')) {
          if (text.includes('excellent') || text.includes('750')) {
            current.updateForm('cibilScore', 800);
            current.updateForm('cibilStatus', 'No Issue');
            setLastAction('Set CIBIL to Excellent (750+)');
            speakText("Setting credit tier to Excellent CIBIL score.");
          } else if (text.includes('good') || text.includes('730')) {
            current.updateForm('cibilScore', 730);
            current.updateForm('cibilStatus', 'No Issue');
            setLastAction('Set CIBIL to Good (700-750)');
            speakText("Setting credit tier to Good CIBIL score.");
          } else {
            current.updateForm('cibilScore', 680);
            current.updateForm('cibilStatus', 'No Issue');
            setLastAction('Set CIBIL to Fair (650-700)');
            speakText("Setting credit tier to Fair CIBIL score.");
          }
          actionTriggered = true;
        } else if (text.includes('good') || text.includes('great')) {
          current.updateForm('cibilScore', 730);
          current.updateForm('cibilStatus', 'No Issue');
          setLastAction('Set CIBIL to Good (700-750)');
          speakText("Setting credit tier to Good CIBIL score.");
          actionTriggered = true;
        } else if (text.includes('excellent') || text.includes('perfect') || text.includes('best') || text.includes('cibil 800') || text.includes('750')) {
          current.updateForm('cibilScore', 800);
          current.updateForm('cibilStatus', 'No Issue');
          setLastAction('Set CIBIL to Excellent (750+)');
          speakText("Setting credit tier to Excellent CIBIL score.");
          actionTriggered = true;
        } else if (text.includes('don\'t know') || text.includes('unknown') || text.includes('not sure')) {
          current.updateForm('cibilScore', 0);
          current.updateForm('cibilStatus', 'Not Sure');
          setLastAction('Set CIBIL to Not Sure');
          speakText("No problem, setting credit score to Not Sure.");
          actionTriggered = true;
        }
        break;

      case 8: // Basic Contact Info
        // Full Name
        if (text.includes('name is') || text.startsWith('name') || text.includes('called')) {
          const nameMatch = text.match(/(?:name is|name|called)\s+([a-zA-Z\s]+)/i);
          if (nameMatch) {
            const parsedName = nameMatch[1].replace(/\b\w/g, c => c.toUpperCase()).trim();
            current.updateForm('fullName', parsedName);
            setLastAction(`Set Full Name to ${parsedName}`);
            speakText(`Got it. Full name set to ${parsedName}.`);
            actionTriggered = true;
          }
        }

        // Email Address
        if (text.includes('email') || text.includes('at the rate') || text.includes('@')) {
          const emailMatch = text.replace(/at the rate/g, '@').replace(/\s+/g, '').match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
          if (emailMatch) {
            current.updateForm('email', emailMatch[1]);
            setLastAction(`Set Email to ${emailMatch[1]}`);
            speakText(`Got it. Email set to ${emailMatch[1]}.`);
            actionTriggered = true;
          }
        }

        // Mobile Number
        if (text.includes('phone') || text.includes('mobile') || text.includes('number') || text.match(/\d{10}/)) {
          const numMatch = text.replace(/\s+/g, '').match(/(\d{10})/);
          if (numMatch) {
            current.updateForm('mobileNumber', numMatch[1]);
            setLastAction(`Set Mobile to ${numMatch[1]}`);
            speakText(`Got it. Mobile number set to +91 ${numMatch[1].split('').join(' ')}.`);
            actionTriggered = true;
          }
        }
        break;

      default:
        break;
    }

    if (!actionTriggered) {
      setLastAction(null);
      // Let's provide some smart suggestions
      if (text.includes('help') || text.includes('how to')) {
        speakText("Tell me what you'd like to fill. For example, say: loan of fifty lakhs.");
      } else {
        const errMsg = `Unrecognized command: "${speechText}".`;
        setSpeechFeedback(errMsg);
        speakText("Sorry, I didn't recognize that command. Please try again or click the field manually.");
        
        // Log unrecognized command to history and trigger error toast
        const itemText = speechText || "Unrecognized phrase";
        setCommandHistory(prev => {
          const newItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            text: itemText,
            action: "Command not recognized",
            timestamp: new Date(),
            success: false
          };
          setToast({
            id: newItem.id,
            text: itemText,
            action: "Command not recognized",
            success: false
          });
          return [newItem, ...prev].slice(0, 10);
        });
      }
    } else {
      setSpeechFeedback('');
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      alert("Speech recognition is not supported natively in this browser window. Please try Google Chrome or Safari.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.warn(e);
      }
      setIsListening(false);
    } else {
      setIsOpen(true);
      try {
        if (!recognitionRef.current) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-IN';

          recognition.onstart = () => {
            setIsListening(true);
            setTranscript('Listening... Speak a command.');
          };

          recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }
            const activeTranscript = finalTranscript || interimTranscript;
            if (activeTranscript.trim()) {
              setTranscript(activeTranscript);
              setSpeechFeedback('');
            }
            if (finalTranscript.trim()) {
              processCommand(finalTranscript);
            }
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
              speakText("Microphone access was denied. Please allow microphone permission in your browser.");
              setIsListening(false);
            }
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = recognition;
        }

        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Speech start error, retrying:', e);
        try {
          recognitionRef.current?.stop();
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
              setIsListening(true);
            } catch (err) {
              console.error(err);
            }
          }, 150);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const getStepGuidelines = () => {
    switch (loanStep) {
      case 1:
        return [
          { cmd: '"loan of 50 Lakhs"', desc: "Sets estimated loan amount" },
          { cmd: '"tenure 20 years"', desc: "Sets desired repayment term" },
          { cmd: '"my age is 32"', desc: "Sets applicant current age" },
          { cmd: '"immediately" or "planning"', desc: "Sets urgency timeline" }
        ];
      case 2:
        return [
          { cmd: '"price 75 Lakhs"', desc: "Sets property market value" },
          { cmd: '"city Mumbai"', desc: "Sets property location" },
          { cmd: '"Residential" or "Commercial"', desc: "Selects property category" }
        ];
      case 3:
        return [
          { cmd: '"salaried" or "business"', desc: "Sets work / employment type" },
          { cmd: '"income 85 thousand"', desc: "Sets monthly net salary" }
        ];
      case 4:
        return [
          { cmd: '"add co-borrower spouse"', desc: "Add spouse co-applicant" },
          { cmd: '"spouse income 50 thousand"', desc: "Sets co-borrower income" },
          { cmd: '"no co-borrower"', desc: "Disable co-applicant profile" }
        ];
      case 5:
        return [
          { cmd: '"HDFC Bank" or "SBI"', desc: "Sets salary holding account bank" }
        ];
      case 6:
        return [
          { cmd: '"no active loans"', desc: "Clears and marks as Debt-Free" },
          { cmd: '"paying emi of 15 thousand"', desc: "Sets active loan EMI amount" }
        ];
      case 7:
        return [
          { cmd: '"excellent" or "good"', desc: "Sets approximate credit score" },
          { cmd: '"CIBIL score 730"', desc: "Sets precise score estimation" },
          { cmd: '"don\'t know"', desc: "Sets score check to Not Sure" }
        ];
      case 8:
        return [
          { cmd: '"my name is Rahul Sharma"', desc: "Fills lead applicant's full name" },
          { cmd: '"mobile is 9876543210"', desc: "Fills 10-digit mobile number" },
          { cmd: '"email amit at gmail.com"', desc: "Fills your verification email" }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="relative">
      {/* Compact space-saving trigger when closed */}
      {!isOpen && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          <button
            onClick={() => {
              setIsOpen(true);
              toggleListening();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-[#10B981] rounded-full text-[11px] font-bold transition-all shadow-2xs cursor-pointer group"
          >
            <Mic className="w-3.5 h-3.5 text-[#10B981] group-hover:scale-110 transition-transform" />
            <span>Voice Assistant</span>
            <span className="bg-[#10B981] text-white text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider">
              Start
            </span>
          </button>
          
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="text-[10.5px] font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs"
          >
            <BookOpen className="w-3 h-3 text-[#10B981]" />
            Commands Guide
          </button>
        </div>
      )}

      {/* Floating Panel Drawer Overlay when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-white border-2 border-emerald-100 rounded-3xl shadow-2xl p-5 md:p-6 mb-6 space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-16 w-16 bg-[#10B981]/5 rounded-bl-full pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-[#10B981]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-xs md:text-sm text-natural-sage uppercase tracking-wider">Voice Control Hub</h4>
                  <p className="text-[9.5px] text-natural-muted font-medium">Auto-fill questionnaire by speaking</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer text-natural-muted"
                  title={isMuted ? "Unmute feedback" : "Mute feedback"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#10B981]" />}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (isListening) {
                      try { recognitionRef.current?.stop(); } catch (e) {}
                      setIsListening(false);
                    }
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer text-natural-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mic Pulse / Live status */}
            <div className="bg-natural-bg/50 border border-natural-border/50 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3.5 text-center relative overflow-hidden min-h-[140px]">
              {isListening ? (
                <div className="space-y-3.5">
                  {/* Bouncing Audio Waveform */}
                  <div className="flex items-center justify-center gap-1.5 h-10">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                      <motion.span
                        key={val}
                        className="w-1.5 bg-[#10B981] rounded-full"
                        animate={{ height: [12, 40, 12] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.5 + Math.random() * 0.4,
                          ease: "easeInOut",
                          delay: val * 0.05
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 animate-pulse justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" /> Live Microphone Active
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    onClick={toggleListening}
                    className="w-12 h-12 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 flex items-center justify-center text-[#10B981] mx-auto hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Mic className="w-5 h-5 animate-pulse" />
                  </button>
                  <p className="text-xs font-black text-natural-muted uppercase tracking-wider">
                    Microphone is Offline
                  </p>
                </div>
              )}

              {/* Dynamic Transcript display */}
              <div className="w-full bg-white rounded-xl border border-natural-border/40 px-4 py-3 min-h-[50px] flex items-center justify-center shadow-inner">
                <p className={cn(
                  "text-xs font-semibold leading-relaxed tracking-wide",
                  isListening ? "text-slate-900" : "text-natural-muted/60"
                )}>
                  {transcript || "Click start and say commands..."}
                </p>
              </div>

              {/* Visual action feedback */}
              <AnimatePresence>
                {lastAction && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-x-0 bottom-0 bg-[#10B981] text-white py-2 px-4 text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lastAction}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Unrecognized warning block fallback */}
            <AnimatePresence>
              {speechFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 items-start text-rose-950 text-[11px] leading-relaxed relative overflow-hidden"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-extrabold uppercase tracking-wider block mb-0.5 text-rose-800 text-[10px]">Command Not Recognized</span>
                    <p className="font-semibold text-rose-700 mb-1.5">{speechFeedback}</p>
                    <span className="text-[10px] text-slate-600 block leading-normal font-medium">
                      💡 <b>Tip:</b> Check the spoken guide below for supported phrases, speak clearly, or click/tap the fields directly to input manually.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error fallback info if Web Speech API isn't supported */}
            {!isSupported && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 items-start text-amber-800 text-[10px] leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Voice Engine Limited</span>
                  <span>Speech recognition is not natively supported in your current browser container/iFrame. For full voice control, please click on <b>"Open in New Tab"</b> or use modern Chrome/Safari.</span>
                </div>
              </div>
            )}

            {/* Command History Log Section */}
            {commandHistory.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-natural-border/50">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-[10px] text-natural-sage uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#10B981]" /> Recent Command History
                  </h5>
                  <button
                    onClick={() => setCommandHistory([])}
                    className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Clear Log
                  </button>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 space-y-1.5 max-h-[140px] overflow-y-auto">
                  {commandHistory.map((item) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-[10.5px] font-bold border transition-all",
                        item.success 
                          ? "bg-white border-emerald-100/70 text-slate-700" 
                          : "bg-white border-rose-100/70 text-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn(
                          "w-5 h-5 rounded-lg flex items-center justify-center shrink-0",
                          item.success ? "bg-emerald-50 text-[#10B981]" : "bg-rose-50 text-rose-500"
                        )}>
                          {item.success ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        </div>
                        <div className="truncate text-left leading-normal">
                          <p className="text-slate-800 italic truncate max-w-[150px] sm:max-w-[280px]">"{item.text}"</p>
                          <p className={cn("text-[9px] font-bold mt-0.5 flex items-center gap-1", item.success ? "text-emerald-700" : "text-rose-600")}>
                            {item.action}
                          </p>
                        </div>
                      </div>
                      <span className="text-[8px] text-slate-400 font-mono shrink-0">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guideline recommendations for current step */}
            <div className="space-y-2 border-t border-natural-border/50 pt-3">
              <div className="flex items-center justify-between">
                <h5 className="font-extrabold text-[10px] text-natural-sage uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#10B981]" /> Spoken Command Reference for Step {loanStep}
                </h5>
                <span className="text-[8px] font-bold text-natural-muted uppercase tracking-widest bg-natural-bg px-2 py-0.5 rounded-full border border-natural-border/40">Step {loanStep} of 8</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {getStepGuidelines().map((guide, i) => (
                  <div 
                    key={i} 
                    className="p-2.5 bg-natural-bg/40 border border-natural-border/40 hover:border-emerald-100 rounded-xl flex flex-col text-left group transition-all"
                  >
                    <span className="text-[10px] font-extrabold text-slate-800 tracking-wide font-mono group-hover:text-[#10B981] transition-colors">{guide.cmd}</span>
                    <span className="text-[8.5px] text-natural-muted font-medium">{guide.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Extra Global Commands Info footer */}
            <div className="border-t border-natural-border/50 pt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 justify-start text-[8.5px] font-bold text-natural-muted uppercase tracking-widest">
              <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3 text-[#10B981]" /> Say "next step" to submit step</span>
              <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3 text-[#10B981]" /> Say "go back" to return</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification for Voice Command Feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "fixed bottom-6 right-6 z-[9999] max-w-sm rounded-2xl shadow-huge border p-4 flex gap-3 items-start backdrop-blur-md transition-all",
              toast.success 
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-950 shadow-emerald-500/10" 
                : "bg-rose-50/95 border-rose-200 text-rose-950 shadow-rose-500/10"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl shrink-0",
              toast.success ? "bg-[#10B981] text-white" : "bg-rose-500 text-white"
            )}>
              <Mic className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  {toast.success ? "Voice Auto-Filled" : "Unrecognized Speech"}
                </span>
                <button 
                  onClick={() => setToast(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs font-bold mt-1 text-slate-800 break-words italic">
                "{toast.text}"
              </p>
              <p className={cn(
                "text-[10px] font-semibold mt-1.5 flex items-center gap-1",
                toast.success ? "text-emerald-700" : "text-rose-700"
              )}>
                {toast.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{toast.action}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Voice Help Manual Modal */}
      <AnimatePresence>
        {isHelpModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-6 md:p-8 overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#10B981]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base text-slate-800 uppercase tracking-wider">Global Voice Navigation Manual</h3>
                    <p className="text-[10px] md:text-xs text-slate-500 font-semibold">Learn how to easily navigate and fill the form with your voice</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHelpModalOpen(false)}
                  className="w-9 h-9 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Scrollable commands list */}
              <div className="flex-1 overflow-y-auto py-5 pr-2 space-y-6">
                {/* Global & Navigation */}
                <div className="space-y-2.5 text-left">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#10B981] flex items-center gap-2">
                    <ArrowLeftRight className="w-3.5 h-3.5" /> 1. Global Navigation & Actions
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">These commands work on any step in the questionnaire.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="p-3 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl flex items-start gap-2.5">
                      <div className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[9px] font-bold shrink-0 mt-0.5">Nav</div>
                      <div>
                        <p className="font-mono text-xs font-bold text-slate-800">"next step" / "proceed" / "continue"</p>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Saves current entries and moves to the next section.</p>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl flex items-start gap-2.5">
                      <div className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[9px] font-bold shrink-0 mt-0.5">Nav</div>
                      <div>
                        <p className="font-mono text-xs font-bold text-slate-800">"go back" / "previous step" / "back"</p>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Navigates back to the preceding step.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categorized Steps Commands */}
                <div className="space-y-4 pt-4 border-t border-slate-100 text-left">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#10B981] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> 2. Step-by-Step Voice Commands
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Step 1 */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step 1: Requirements</span>
                      <ul className="space-y-1.5">
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"loan of fifty lakhs"</span>
                          Sets estimated amount to ₹50,00,000
                        </li>
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"tenure twenty years"</span>
                          Sets desired tenure limit
                        </li>
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"my age is thirty five"</span>
                          Sets borrower's age
                        </li>
                      </ul>
                    </div>

                    {/* Step 2 */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step 2: Property details</span>
                      <ul className="space-y-1.5">
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"price eighty lakhs" / "value 1 cr"</span>
                          Sets estimated property purchase price
                        </li>
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"city Delhi" / "city Mumbai"</span>
                          Fills property location autocomplete
                        </li>
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"Residential" / "Commercial"</span>
                          Chooses property classification
                        </li>
                      </ul>
                    </div>

                    {/* Step 3 */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step 3: Income Profile</span>
                      <ul className="space-y-1.5">
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"salaried" / "business"</span>
                          Selects primary source of livelihood
                        </li>
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"income eighty five thousand"</span>
                          Fills net monthly take-home salary
                        </li>
                      </ul>
                    </div>

                    {/* Step 4 */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step 4: Co-Borrower info</span>
                      <ul className="space-y-1.5">
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"add co-borrower spouse"</span>
                          Enables co-applicant with relationship
                        </li>
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"spouse income fifty thousand"</span>
                          Sets co-borrower net monthly income
                        </li>
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"no co-borrower"</span>
                          Disables secondary applicant
                        </li>
                      </ul>
                    </div>

                    {/* Step 5 */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step 5: Salary Account Bank</span>
                      <ul className="space-y-1.5">
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"HDFC Bank" / "SBI" / "ICICI"</span>
                          Sets salary holding bank (Boosts banking trust score!)
                        </li>
                      </ul>
                    </div>

                    {/* Step 6 */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step 6: Existing Liabilities</span>
                      <ul className="space-y-1.5">
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"no active loans" / "debt free"</span>
                          Marks profile as liabilities free
                        </li>
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"paying emi of fifteen thousand"</span>
                          Logs active monthly EMI debt volume
                        </li>
                      </ul>
                    </div>

                    {/* Step 7 */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step 7: Credit Rating (CIBIL)</span>
                      <ul className="space-y-1.5">
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"excellent" / "good" / "fair"</span>
                          Selects CIBIL range tier estimation
                        </li>
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"CIBIL score 760" / "CIBIL 800"</span>
                          Sets credit score to precise value
                        </li>
                      </ul>
                    </div>

                    {/* Step 8 */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step 8: Personal Credentials</span>
                      <ul className="space-y-1.5">
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"my name is Rahul Sharma"</span>
                          Fills full legal name
                        </li>
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"mobile is 9876543210"</span>
                          Fills primary contact cell number
                        </li>
                        <li className="text-[10.5px] font-semibold text-slate-700">
                          <span className="font-mono text-[10px] font-bold text-slate-900 block">"email amit at gmail.com"</span>
                          Fills email address
                        </li>
                      </ul>
                    </div>

                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 shrink-0 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#10B981]" /> Hint: Speak clearly & use "Voice manual" to refer to supported phrases
                </span>
                <button
                  onClick={() => setIsHelpModalOpen(false)}
                  className="px-5 py-2 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#10B981]/25 cursor-pointer"
                >
                  Got It, Let's Try!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
