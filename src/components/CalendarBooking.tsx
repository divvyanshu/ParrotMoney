import React, { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Plus, 
  Check, 
  X, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Defined Consultation Types
const CONSULTATION_TYPES = [
  { id: 'eligibility', label: 'Eligibility Assessment', duration: 30, desc: 'Calculate exact loan borrowing limit and pre-approval metrics.' },
  { id: 'negotiation', label: 'Interest Rate Negotiation', duration: 45, desc: 'Discuss strategy to bypass bank retail markups and match lowest rates.' },
  { id: 'docs', label: 'Document Prep & Verification', duration: 30, desc: 'Review IT Returns, Bank Statements, and land registry paperwork.' },
];

// Available Senior Advisors
const ADVISORS = [
  { name: 'Arjun Sharma', role: 'Senior Home Loan Underwriter', avatar: 'AS' },
  { name: 'Priyanka Patel', role: 'Banking Relationship Lead', avatar: 'PP' },
  { name: 'Vikram Singh', role: 'Commercial Property Expert', avatar: 'VS' },
];

export function CalendarBooking() {
  // Auth state
  const [googleUser, setGoogleUser] = useState<any | null>(() => {
    try {
      const stored = localStorage.getItem('parrot_google_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('parrot_google_access_token');
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Calendar events
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Form selections
  const [selectedType, setSelectedType] = useState(CONSULTATION_TYPES[0]);
  const [selectedAdvisor, setSelectedAdvisor] = useState(ADVISORS[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Overlap and Confirmation
  const [overlapEvent, setOverlapEvent] = useState<any | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Form input lists
  const availableSlots = ['10:00', '11:30', '14:00', '15:30', '16:30'];

  // Check auth on mount
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        setGoogleUser(null);
        setAccessToken(null);
        localStorage.removeItem('parrot_google_user');
        localStorage.removeItem('parrot_google_access_token');
      }
    });
    return () => unsub();
  }, []);

  // Fetch on mount if token exists
  useEffect(() => {
    if (accessToken) {
      fetchCalendarEvents(accessToken);
    }
  }, []);

  // Format date helper
  const getUpcomingDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      // Skip weekends
      if (nextDate.getDay() !== 0 && nextDate.getDay() !== 6) {
        dates.push(nextDate);
      }
    }
    return dates;
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Add Calendar, Drive, Sheets, and Forms scopes
      provider.addScope('https://www.googleapis.com/auth/calendar');
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/drive.readonly');
      provider.addScope('https://www.googleapis.com/auth/forms.body');
      provider.addScope('https://www.googleapis.com/auth/forms.body.readonly');
      provider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (!token) {
        throw new Error('Failed to retrieve Google Access Token.');
      }

      setGoogleUser(result.user);
      setAccessToken(token);
      localStorage.setItem('parrot_google_user', JSON.stringify(result.user));
      localStorage.setItem('parrot_google_access_token', token);
      
      // Fetch user's calendar schedule
      fetchCalendarEvents(token);
    } catch (err: any) {
      console.error('OAuth Error:', err);
      setAuthError(err.message || 'Authentication with Google failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Disconnect Calendar
  const handleDisconnect = async () => {
    setGoogleUser(null);
    setAccessToken(null);
    localStorage.removeItem('parrot_google_user');
    localStorage.removeItem('parrot_google_access_token');
    setEvents([]);
    setBookingSuccess(null);
    setOverlapEvent(null);
  };

  // Fetch upcoming calendar events (real API call)
  const fetchCalendarEvents = async (token: string) => {
    setIsLoadingEvents(true);
    try {
      const now = new Date().toISOString();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const timeMax = nextWeek.toISOString();

      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(now)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve schedule from Google Calendar API.');
      }

      const data = await response.json();
      setEvents(data.items || []);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Real-time double booking check helper
  useEffect(() => {
    if (!selectedDate || !selectedTimeSlot || events.length === 0) {
      setOverlapEvent(null);
      return;
    }

    // Parse chosen slot start & end
    const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
    const chosenStart = new Date(selectedDate);
    chosenStart.setHours(hours, minutes, 0, 0);

    const chosenEnd = new Date(chosenStart);
    chosenEnd.setMinutes(chosenEnd.getMinutes() + selectedType.duration);

    // Look for overlap in real events
    const conflict = events.find(event => {
      if (!event.start?.dateTime || !event.end?.dateTime) return false;
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      // Check if periods overlap
      return chosenStart < eventEnd && eventStart < chosenEnd;
    });

    setOverlapEvent(conflict || null);
  }, [selectedDate, selectedTimeSlot, selectedType, events]);

  // Handle Book Trigger
  const handleBookClick = () => {
    if (!selectedDate || !selectedTimeSlot) return;
    setShowConfirmModal(true);
  };

  // Confirm booking & write to Google Calendar
  const handleConfirmBooking = async () => {
    if (!accessToken) return;
    setIsBooking(true);
    setShowConfirmModal(false);

    try {
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + selectedType.duration);

      const eventBody = {
        summary: `🦜 ParrotMoney Consultation: ${selectedType.label}`,
        description: `Home Loan Consultation session with senior advisor ${selectedAdvisor.name}.\n\n` + 
          `Topic: ${selectedType.desc}\n` +
          `Duration: ${selectedType.duration} minutes\n\n` +
          `This event was booked directly and synced securely using Google Calendar integration.`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        conferenceData: {
          createRequest: {
            requestId: `parrot-meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      // Create event with Google Meet generation
      const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create calendar event.');
      }

      const createdEvent = await response.json();
      setBookingSuccess(createdEvent);

      // Refresh event list to show the new event
      fetchCalendarEvents(accessToken);
    } catch (err: any) {
      console.error('Booking Error:', err);
      alert(`Booking Sync Failed: ${err.message || 'Please check your connection.'}`);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-[9px] font-black uppercase tracking-wider font-mono">
            <Calendar className="w-3.5 h-3.5" /> Workspace Sync
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mt-3 text-natural-sage italic leading-tight">
            Schedule Live Underwriting.
          </h2>
          <p className="text-natural-muted font-medium text-base md:text-lg mt-1">
            Book an exclusive video consultation with an expert advisor, synced directly to your Google Calendar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Options/Form panel */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Calendar Connection banner */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 text-left">
                <h3 className="text-xl font-bold text-natural-text tracking-tight flex items-center gap-2">
                  Google Calendar Security
                </h3>
                <p className="text-xs text-natural-muted leading-relaxed max-w-md">
                  Syncing checks for scheduling conflicts on your personal schedule and logs a Google Meet appointment. No data is stored outside your account.
                </p>
              </div>

              <div>
                {!accessToken ? (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isAuthenticating}
                    className="gsi-material-button w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"
                    id="connect_calendar_btn"
                  >
                    <div className="gsi-material-button-state"></div>
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents font-bold text-xs">
                        {isAuthenticating ? 'Syncing...' : 'Connect Google Calendar'}
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <div className="text-left">
                      <p className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active & Synced
                      </p>
                      <p className="text-[10px] text-emerald-600/80 font-bold truncate max-w-[160px]">
                        {googleUser?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="p-2 rounded-lg bg-emerald-100/60 hover:bg-emerald-200 text-emerald-800 hover:text-red-600 transition-colors cursor-pointer text-xs font-black uppercase tracking-wider"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {authError && (
              <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
          </div>

          {/* Core Booking Form */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-10">
            
            {/* Step 1: Topic selection */}
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-natural-muted">
                01. Select Consultation Focus
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CONSULTATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`text-left p-6 rounded-[1.8rem] border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedType.id === type.id
                        ? 'bg-natural-sage/[0.03] border-natural-sage ring-4 ring-natural-sage/5'
                        : 'border-natural-border hover:bg-natural-bg/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-black uppercase ${
                          selectedType.id === type.id ? 'bg-natural-sage text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {type.duration} MINS
                        </span>
                        {selectedType.id === type.id && <Check className="w-4 h-4 text-natural-terracotta" />}
                      </div>
                      <h5 className="font-extrabold text-natural-text text-base tracking-tight mb-2">
                        {type.label}
                      </h5>
                      <p className="text-[11px] text-natural-muted leading-relaxed font-semibold">
                        {type.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Advisor choice */}
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-natural-muted">
                02. Choose Senior Advisor
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ADVISORS.map((advisor) => (
                  <button
                    key={advisor.name}
                    onClick={() => setSelectedAdvisor(advisor)}
                    className={`text-left p-5 rounded-[1.8rem] border-2 transition-all cursor-pointer flex items-center gap-4 ${
                      selectedAdvisor.name === advisor.name
                        ? 'bg-natural-sage/[0.03] border-natural-sage ring-4 ring-natural-sage/5'
                        : 'border-natural-border hover:bg-natural-bg/40'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md ${
                      selectedAdvisor.name === advisor.name ? 'bg-natural-terracotta' : 'bg-natural-sage/75'
                    }`}>
                      {advisor.avatar}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-natural-text text-sm tracking-tight">
                        {advisor.name}
                      </h5>
                      <p className="text-[10px] text-natural-muted font-bold uppercase mt-0.5">
                        {advisor.role}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Date and Time selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              
              {/* Date */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-natural-muted block">
                  03. Choose Available Date
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {getUpcomingDates().map((date, idx) => {
                    const dateStr = date.toDateString();
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-4 rounded-xl text-center border-2 transition-all cursor-pointer flex flex-col justify-center items-center gap-1 ${
                          isSelected
                            ? 'bg-natural-sage/[0.03] border-natural-sage ring-4 ring-natural-sage/5 font-black text-natural-text'
                            : 'border-natural-border hover:bg-natural-bg/40 font-bold text-natural-muted'
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-widest text-natural-muted">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-lg tracking-tight">
                          {date.getDate()}
                        </span>
                        <span className="text-[9px] uppercase">
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-natural-muted block">
                  04. Select Time Slot
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-4 rounded-xl text-center border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-natural-sage/[0.03] border-natural-sage ring-4 ring-natural-sage/5 font-black text-natural-text'
                            : 'border-natural-border hover:bg-natural-bg/40 font-bold text-natural-muted'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Overlap Warning Indicator */}
                <AnimatePresence>
                  {overlapEvent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1"
                    >
                      <p className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" /> Double Booking Alert
                      </p>
                      <p className="text-[11px] text-amber-800 leading-normal font-semibold">
                        You have an existing event <strong className="font-extrabold">"{overlapEvent.summary || 'Meeting'}"</strong> scheduled at this time on your Google Calendar.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Submit / Trigger Booking */}
            <div className="pt-6 border-t border-natural-border/40">
              {!accessToken ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-slate-800">Connection Required</p>
                    <p className="text-xs text-slate-500 font-semibold">Please authenticate your Google Calendar to book appointments.</p>
                  </div>
                  <button
                    onClick={handleGoogleSignIn}
                    className="px-6 py-3.5 bg-natural-sage text-white rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  >
                    Authenticate Now
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleBookClick}
                  disabled={!selectedDate || !selectedTimeSlot || isBooking}
                  className="w-full py-5 bg-natural-terracotta hover:bg-natural-terracotta/90 disabled:opacity-40 text-white rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-3xl shadow-natural-terracotta/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Scheduling consultation...
                    </>
                  ) : (
                    <>
                      Book & Sync with Google Calendar <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Right Status / Confirmation Panel */}
        <div className="space-y-10">
          
          {/* Booking Success Output */}
          <AnimatePresence mode="wait">
            {bookingSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-emerald-50/50 border-2 border-emerald-500/30 rounded-[2.5rem] p-8 md:p-10 space-y-8 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 animate-pulse" />
                
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-black text-emerald-800 tracking-tight italic">
                    Successfully Synced!
                  </h4>
                  <p className="text-xs text-emerald-600/90 font-medium">
                    Your appointment has been created and synced with your primary calendar.
                  </p>
                </div>

                <div className="bg-white/80 p-5 rounded-2xl border border-emerald-100/50 text-left space-y-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Date & Time</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">
                        {new Date(bookingSuccess.start.dateTime).toLocaleString('en-US', { 
                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Advisor</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">
                        {selectedAdvisor.name}
                      </p>
                    </div>
                  </div>

                  {bookingSuccess.conferenceData?.entryPoints?.[0]?.uri && (
                    <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                      <Video className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Google Meet Link</p>
                        <a 
                          href={bookingSuccess.conferenceData.entryPoints[0].uri} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer"
                          className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          Join Meeting <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {bookingSuccess.htmlLink && (
                    <a
                      href={bookingSuccess.htmlLink}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      View on Google Calendar <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="w-full py-3 hover:bg-emerald-100/30 text-emerald-800/80 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Schedule Another
                  </button>
                </div>

              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-6 text-left"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-natural-muted">
                    Meeting Details
                  </h4>
                  <p className="text-xs text-natural-muted italic">Review your selections prior to confirming sync.</p>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="py-4 flex items-center justify-between text-xs font-bold text-natural-text">
                    <span className="text-natural-muted">Consultation:</span>
                    <span>{selectedType.label}</span>
                  </div>
                  <div className="py-4 flex items-center justify-between text-xs font-bold text-natural-text">
                    <span className="text-natural-muted">Duration:</span>
                    <span>{selectedType.duration} mins</span>
                  </div>
                  <div className="py-4 flex items-center justify-between text-xs font-bold text-natural-text">
                    <span className="text-natural-muted">With Advisor:</span>
                    <span>{selectedAdvisor.name}</span>
                  </div>
                  <div className="py-4 flex items-center justify-between text-xs font-bold text-natural-text">
                    <span className="text-natural-muted">Proposed Date:</span>
                    <span>{selectedDate || 'Not selected'}</span>
                  </div>
                  <div className="py-4 flex items-center justify-between text-xs font-bold text-natural-text">
                    <span className="text-natural-muted">Proposed Time:</span>
                    <span>{selectedTimeSlot || 'Not selected'}</span>
                  </div>
                </div>

                <div className="p-4 bg-natural-sage/[0.02] border border-natural-border/50 rounded-2xl flex items-start gap-3">
                  <Info className="w-4 h-4 text-natural-terracotta shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-natural-muted font-semibold">
                    Upon confirmation, we will instantly book your advisor slot, auto-provision a Google Meet link, and place it in your calendar.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sync status & event list preview */}
          {accessToken && (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-6 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-natural-muted">
                  Synced Schedule
                </h4>
                <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>

              {isLoadingEvents ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-[#10B981]" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Syncing with Google...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">No events found in this window.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {events.slice(0, 5).map((event) => {
                    const eventDate = event.start?.dateTime ? new Date(event.start.dateTime) : null;
                    return (
                      <div key={event.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 text-left transition-colors">
                        <p className="text-xs font-black text-slate-800 truncate">{event.summary || 'Busy'}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {eventDate ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Mandatory Explicit Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-natural-sage/40 backdrop-blur-3xl z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-huge border border-natural-border max-w-xl w-full text-center space-y-10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-natural-terracotta" />
              
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-black text-natural-sage tracking-tighter italic leading-none">
                  Add to Google Calendar?
                </h3>
                <p className="text-natural-muted font-semibold text-xs md:text-sm leading-relaxed max-w-sm mx-auto">
                  You are about to authorize booking a consultation on your Google Calendar. This action will add a new event with Google Meet.
                </p>
              </div>

              {/* Recipient Account Details */}
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-3 text-xs font-bold text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="text-slate-800">{googleUser?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Event:</span>
                  <span className="text-slate-800">🦜 ParrotMoney Consultation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Advisor:</span>
                  <span className="text-slate-800">{selectedAdvisor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date/Time:</span>
                  <span className="text-slate-800">
                    {selectedDate} at {selectedTimeSlot}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-natural-muted hover:bg-natural-bg transition-all cursor-pointer border border-natural-border/40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-[2] py-4 rounded-[1.5rem] bg-natural-terracotta text-white font-black text-xs uppercase tracking-widest shadow-3xl shadow-natural-terracotta/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  Yes, Book & Sync
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
