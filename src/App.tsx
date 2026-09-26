import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatInterface } from './components/ChatInterface';
import { MortgageCalculator as HomeLoanCalculator } from './components/MortgageCalculator';
import { Logo } from './components/Logo';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { performRiskAssessment, LoanAssessmentResult } from './services/gemini';
import { logLoanToGoogleSheets } from './lib/sheets';
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  Calculator, 
  UserCheck, 
  Settings, 
  LogOut, 
  Bell, 
  MapPin,
  Activity,
  User,
  Wallet,
  History,
  Star,
  Sparkles,
  Users,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Briefcase,
  IndianRupee,
  Loader2,
  Home,
  RefreshCw,
  Building,
  Store,
  Factory,
  Sprout,
  Users2,
  FileUp,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Database,
  Check,
  X,
  Lock,
  Layers,
  Hammer,
  Square,
  CircleEllipsis,
  House,
  Mountain,
  Map,
  ChevronDown,
  Zap,
  HardDrive,
  ArrowLeft,
  Minus,
  Info,
  Menu,
  ChevronLeft,
  ChevronRight,
  Hospital,
  Utensils,
  Warehouse,
  Snowflake,
  FileSpreadsheet,
  Calendar,
  Mic,
  Table,
  Compass,
  FolderCheck,
  Inbox,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from './lib/utils';
import { ParrotLanding } from './components/ParrotLanding';
import { CookieConsentModal } from './components/CookieConsentModal';
import { AboutUs } from './components/AboutUs';
import { CalendarBooking } from './components/CalendarBooking';
import { WorkspaceHub } from './components/WorkspaceHub';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { UserRole, LoanStatus, LoanStageId, CommunicationChannel, CommunicationLogEntry, LoanQuery } from './types';
import { LoanProgressStepper } from './components/dashboard/LoanProgressStepper';
import { CommunicationLog } from './components/dashboard/CommunicationLog';
import { StageDetailsCard } from './components/dashboard/StageDetailsCard';
import { NotificationSimulatorModal } from './components/dashboard/NotificationSimulatorModal';
import { DocumentUpload } from './components/dashboard/DocumentUpload';
import { LoanJourneyCard } from './components/dashboard/LoanJourneyCard';
import { AgenticResearchStatusCard } from './components/dashboard/AgenticResearchStatusCard';
import { AmortizationScheduleView } from './components/dashboard/AmortizationScheduleView';
import { OffersComparisonChart } from './components/offers/OffersComparisonChart';
import { OffersSortingDropdown, OfferSortOption } from './components/offers/OffersSortingDropdown';
import { OfferComparisonMatrixModal } from './components/offers/OfferComparisonMatrixModal';
import { LenderPolicyModal } from './components/offers/LenderPolicyModal';
import { BankLogo } from './components/BankLogo';
import { LoanMarketSavingsBenchmark } from './components/LoanMarketSavingsBenchmark';
import { MobileConciergeFab } from './components/dashboard/MobileConciergeFab';
import { AnimatedStatusBadge } from './components/dashboard/AnimatedStatusBadge';
import { ContextualTooltip } from './components/common/ContextualTooltip';
import { 
  compute43LenderRecommendations, 
  ALL_INDIAN_LENDERS, 
  EnrichedLenderOffer, 
  LenderCategoryGroup 
} from './services/lenderRecommendationService';
import { 
  STAGE_CONFIGS, 
  getCommunicationLogs, 
  addCommunicationLog, 
  triggerStageAlertNotification, 
  resolveQuery, 
  createQuery 
} from './services/notificationService';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 
  'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 
  'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi', 
  'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 
  'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada'
].sort();

const INDIAN_BANKS = ALL_INDIAN_LENDERS;

function CustomTooltip({ 
  message, 
  title, 
  term,
  side = 'top',
  variant = 'subtle',
  className
}: { 
  message: string; 
  title?: string; 
  term?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'subtle' | 'pill' | 'badge';
  className?: string;
}) {
  return (
    <ContextualTooltip 
      title={title} 
      message={message} 
      term={term} 
      side={side} 
      variant={variant}
      className={className}
    />
  );
}

function AutocompleteInput({ 
  options, 
  value, 
  onChange, 
  placeholder,
  label,
  icon: Icon,
  onDetectLocation
}: { 
  options: string[], 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string,
  label: string,
  icon: any,
  onDetectLocation?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="space-y-1 md:space-y-1.5 relative w-full">
      <div className="flex items-center justify-between px-1">
        <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center gap-1.5">
          <span>{label}</span>
        </label>
        {onDetectLocation && (
          <button 
            onClick={(e) => { e.preventDefault(); onDetectLocation(); }}
            className="text-[8px] font-black uppercase tracking-widest text-natural-terracotta flex items-center gap-1 hover:opacity-70 transition-all cursor-pointer"
          >
            <MapPin className="w-2.5 h-2.5" /> Auto Detect
          </button>
        )}
      </div>
      <div className="relative group">
        <Icon className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-natural-muted w-3.5 h-3.5 md:w-4 md:h-4 group-focus-within:text-natural-terracotta transition-colors" />
        <input 
          type="text"
          value={search}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-natural-bg border-none rounded-lg md:rounded-xl pl-8 md:pl-10 pr-10 py-1.5 md:py-2.5 font-bold text-xs md:text-sm tracking-wider text-natural-sage outline-none focus:ring-4 ring-[#10B981]/10 transition-all"
        />
        <ChevronDown className={cn("absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-natural-muted transition-transform w-3 md:w-3.5 h-3 md:h-3.5", isOpen && "rotate-180")} />
      </div>

      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-natural-border rounded-lg md:rounded-xl shadow-huge overflow-hidden max-h-48"
          >
            <div className="overflow-y-auto p-1.5">
              {filteredOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setSearch(opt);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    value === opt ? "bg-natural-accent text-natural-sage" : "hover:bg-natural-bg text-natural-muted hover:text-natural-sage"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}

// --- Components ---

function SideBar({ 
  activeTab, 
  setActiveTab, 
  role, 
  isExistingUser,
  isSidebarCollapsed,
  setIsSidebarCollapsed
}: { 
  activeTab: string, 
  setActiveTab: (t: string) => void, 
  role?: UserRole, 
  isExistingUser?: boolean,
  isSidebarCollapsed: boolean,
  setIsSidebarCollapsed: (b: boolean) => void
}) {
  const { logout } = useAuth();
  
  const menuItems = [
    ...(isExistingUser ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { id: 'loans', label: 'My Home Loans', icon: FileText },
    { id: 'calculator', label: 'EMI Calculator', icon: Calculator },
    { id: 'recommendations', label: 'Top Offers', icon: TrendingUp },
    { id: 'calendar', label: 'Book Consultation', icon: Calendar },
    { id: 'workspace', label: 'Workspace Hub', icon: Database },
    { id: 'about', label: 'About Us', icon: Info },
  ];

  // Always include Admin Portal to keep it easily accessible for testing/previewing
  menuItems.push({ id: 'admin', label: 'Admin Portal (🔑 Test)', icon: ShieldCheck });

  return (
    <div className={cn(
      "w-72 border-r border-natural-border h-screen flex flex-col p-8 fixed left-0 top-0 bg-white z-40 transition-all duration-300 ease-in-out hidden md:flex",
      isSidebarCollapsed ? "md:-translate-x-full" : "md:translate-x-0"
    )}>
      <div className="flex items-center justify-between mb-10 px-2 transition-all">
        <div>
          <Logo className="scale-110 origin-left" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-muted/60 mt-4 px-1">Home Loans Made Simple</p>
        </div>
        <button 
          onClick={() => setIsSidebarCollapsed(true)}
          className="p-1.5 rounded-lg border border-natural-border hover:bg-natural-bg text-natural-sage hover:text-natural-terracotta transition-all cursor-pointer shadow-sm md:block hidden shrink-0"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-2 mt-8">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all font-black text-[11px] uppercase tracking-widest group",
              activeTab === item.id 
                ? "bg-slate-100 text-natural-sage shadow-[4px_4px_10px_0_rgba(0,0,0,0.05),-4px_-4px_10px_0_rgba(255,255,255,0.8)] border border-white scale-[1.02]" 
                : "text-natural-muted hover:bg-natural-bg hover:text-natural-sage"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-all", activeTab === item.id ? "text-natural-terracotta scale-110" : "text-natural-muted/40 group-hover:text-natural-sage")} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-6">
        <div className="pt-2 space-y-1">
          <button onClick={() => setActiveTab('settings')} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-natural-muted hover:bg-natural-bg hover:text-natural-sage transition-all text-[13px] font-bold">
            <Settings className="w-5 h-5 opacity-60" /> Settings
          </button>
          <button onClick={logout} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all text-[13px] font-bold">
            <LogOut className="w-5 h-5 opacity-60" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function Header({ 
  hideProfile,
  isSidebarCollapsed,
  setIsSidebarCollapsed
}: { 
  hideProfile?: boolean;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (b: boolean) => void;
}) {
  const { profile, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={cn(
      "h-20 md:h-24 border-b border-natural-border flex items-center justify-between px-4 md:px-10 sticky top-0 bg-white/80 backdrop-blur-xl z-50 transition-all duration-300",
      isSidebarCollapsed ? "md:ml-0" : "md:ml-72"
    )}>
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button for Desktop */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex items-center justify-center p-2.5 rounded-xl border border-natural-border hover:bg-natural-bg text-natural-sage hover:text-natural-terracotta transition-all cursor-pointer shadow-sm group"
          title={isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
        >
          {isSidebarCollapsed ? (
            <Menu className="w-5 h-5 transition-transform group-hover:scale-110" />
          ) : (
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:scale-110" />
          )}
        </button>

        <div className="md:hidden mr-4">
          <Logo iconOnly className="scale-90" />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5 ml-auto relative">
        {!hideProfile && (
          <>
            <div className="text-right hidden lg:block">
              <p className="text-sm font-black text-natural-sage tracking-tight leading-none mb-1">{profile?.name}</p>
              <p className="text-[9px] text-natural-muted uppercase font-black tracking-widest opacity-60">{profile?.role}</p>
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#111827] text-white flex items-center justify-center font-medium text-lg md:text-xl shadow-lg hover:scale-105 transition-all cursor-pointer overflow-hidden relative group shrink-0"
            >
               {profile?.name?.charAt(0)}
            </button>
          </>
        )}

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-4 w-80 bg-white border border-slate-200 rounded-lg shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-[#111827] flex items-center justify-center text-white font-medium text-2xl shadow-lg shrink-0">
                      {profile?.name?.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-xl text-slate-900 truncate tracking-tight">{profile?.name}</p>
                      <p className="text-sm text-slate-500 truncate">{profile?.email}</p>
                    </div>
                  </div>
                  
                  <button className="w-full py-2.5 px-6 border border-slate-300 rounded-full font-medium text-base text-slate-800 hover:bg-slate-50 transition-all">
                    Manage My Profile
                  </button>
                </div>
                
                <div className="border-t border-slate-100">
                  <button className="w-full flex items-center gap-4 px-8 py-4 hover:bg-slate-50 transition-all text-slate-700 font-normal text-lg">
                    <Lock className="w-6 h-6 text-slate-500" /> Security center
                  </button>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-4 px-8 py-4 hover:bg-slate-50 transition-all text-slate-700 font-normal text-lg"
                  >
                    <LogOut className="w-6 h-6 text-slate-500" /> Log out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// --- Admin Components ---

function AdminCharts({ loans }: { loans: any[] }) {
  // Data for Loan Status Distribution
  const statusData = [
    { name: 'Submitted', value: loans.filter(l => l.status === 'submitted').length },
    { name: 'Reviewing', value: loans.filter(l => l.status === 'pending_review').length },
    { name: 'Approved', value: loans.filter(l => l.status === 'approved').length },
    { name: 'Rejected', value: loans.filter(l => l.status === 'rejected').length },
  ].filter(d => d.value > 0);

  const COLORS = ['#1f322d', '#d4a373', '#7c8e81', '#9e2a2b'];

  const propertyCategories = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Khasra'];
  const avgAmountData = propertyCategories.map(cat => {
    const catLoans = loans.filter(l => l.propertyCategory === cat);
    const sum = catLoans.reduce((acc, l) => acc + (l.loanAmount || 0), 0);
    return {
      name: cat,
      amount: catLoans.length > 0 ? Math.round(sum / catLoans.length) : 0
    };
  }).filter(d => d.amount > 0);

  const networkPerformanceData = [
    { name: 'Mon', value: 450 },
    { name: 'Tue', value: 380 },
    { name: 'Wed', value: 520 },
    { name: 'Thu', value: 310 },
    { name: 'Fri', value: 440 },
    { name: 'Sat', value: 290 },
    { name: 'Sun', value: 320 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
      <div className="bg-white p-10 rounded-[3.5rem] border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-8">
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-natural-muted">Application Status</h4>
          <p className="text-xs text-natural-muted font-medium italic">Current status of all applications in the system.</p>
        </div>
        <div className="h-64 relative">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                 {statusData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                 ))}
               </Pie>
               <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', padding: '16px' }} />
               <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
             </PieChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-8">
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-natural-muted">Average Loan Amount</h4>
          <p className="text-xs text-natural-muted font-medium italic">Avg loan value by property type.</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={avgAmountData}>
               <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4a373" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#d4a373" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#7c8e81' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#7c8e81' }} tickFormatter={(v) => `₹${v/100000}L`} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', padding: '16px' }} />
              <Bar dataKey="amount" fill="url(#barGradient)" radius={[10, 10, 10, 10]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-8">
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-natural-muted">Processing Time</h4>
          <p className="text-xs text-natural-muted font-medium italic">Average speed to complete applications.</p>
        </div>
        <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkPerformanceData}>
                 <defs>
                   <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#1f322d" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#1f322d" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#7c8e81' }} />
                 <YAxis hide />
                 <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', padding: '16px' }} />
                 <Area type="monotone" dataKey="value" stroke="#1f322d" strokeWidth={3} fill="url(#latencyGrad)" dot={{ r: 4, fill: '#1f322d', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


// --- Dashboard Components ---

function RatingModal({ lenderName, loanId, onClose, onSubmit }: { lenderName: string, loanId: string, onClose: () => void, onSubmit: (val: number) => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="fixed inset-0 bg-natural-sage/40 backdrop-blur-3xl z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white p-16 rounded-[4rem] shadow-huge border border-natural-border max-w-xl w-full text-center space-y-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-natural-terracotta" />
        <div className="space-y-3">
          <h3 className="text-3xl md:text-4xl font-black text-natural-sage tracking-tighter italic leading-none">{lenderName} Rating.</h3>
          <p className="text-natural-muted font-medium text-sm md:text-lg leading-relaxed">How was your experience with this bank?</p>
        </div>

        <div className="flex justify-center flex-wrap gap-2 md:gap-4 px-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="group transition-all"
            >
              <Star 
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 transition-all duration-300",
                  (hover || rating) >= star ? "fill-natural-terracotta text-natural-terracotta scale-110 md:scale-125" : "text-natural-muted/20 hover:scale-110"
                )} 
              />
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
          <button onClick={onClose} className="flex-1 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-[10px] md:text-xs uppercase tracking-widest text-natural-muted hover:bg-natural-bg transition-all">Cancel</button>
          <button 
            onClick={() => rating > 0 && onSubmit(rating)}
            disabled={rating === 0}
            className="flex-[2] py-4 md:py-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-natural-terracotta text-white font-black text-[10px] md:text-xs uppercase tracking-widest shadow-3xl shadow-natural-terracotta/20 disabled:opacity-30 hover:scale-[1.03] active:scale-95 transition-all"
          >
            Submit My Rating
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Views ---

function DashboardView({ 
  onNewLoan, 
  loans, 
  setActiveTab,
  setLoansViewMode,
  setLoanStep,
  setFormData,
  pendingNotice,
  setPendingNotice,
  isLoading = false,
  error = null
}: { 
  onNewLoan: () => void, 
  loans: any[], 
  setActiveTab: (t: string) => void,
  setLoansViewMode?: React.Dispatch<React.SetStateAction<'list' | 'apply'>>,
  setLoanStep?: React.Dispatch<React.SetStateAction<number>>,
  setFormData?: React.Dispatch<React.SetStateAction<any>>,
  pendingNotice?: string | null,
  setPendingNotice?: React.Dispatch<React.SetStateAction<string | null>>,
  isLoading?: boolean,
  error?: string | null
}) {
  const { profile, user } = useAuth();

  // Active Loan Selection
  const [selectedLoanIndex, setSelectedLoanIndex] = useState(0);
  const activeLoan = loans && loans.length > 0 ? loans[selectedLoanIndex] : null;

  // Fallback demo loan if no loan exists yet
  const effectiveLoan = useMemo(() => {
    if (activeLoan) return activeLoan;
    return {
      id: 'HL-2026-9842',
      purpose: 'New Home Loan',
      loanAmount: 4500000,
      city: 'Mumbai',
      propertyType: 'Apartment',
      selectedBank: {
        name: 'HDFC Bank',
        rate: '8.45%',
        processingTime: '7-10 Days',
        features: ['Fast Processing', 'Digital Journey', 'Max Tenure']
      },
      currentStage: 'technical_inspection' as LoanStageId,
      status: 'in_progress',
      fullName: profile?.name || 'Divyanshu Sharma',
      email: profile?.email || user?.email || 'divvyanshu@gmail.com',
      mobile: profile?.mobile || '+91 98765 43210',
      createdAt: { toDate: () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    };
  }, [activeLoan, profile, user]);

  // Stage state management
  const [currentStageId, setCurrentStageId] = useState<LoanStageId>(() => {
    const saved = localStorage.getItem(`parrot_stage_${effectiveLoan.id}`);
    if (saved && STAGE_CONFIGS[saved as LoanStageId]) return saved as LoanStageId;
    return (effectiveLoan.currentStage as LoanStageId) || 'technical_inspection';
  });

  const [selectedStageId, setSelectedStageId] = useState<LoanStageId>(currentStageId);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Real-time active user loan status state
  const [activeLoanStatus, setActiveLoanStatus] = useState<string>(() => {
    return localStorage.getItem(`parrot_status_${effectiveLoan.id}`) || effectiveLoan.status || 'submitted';
  });

  // Sync if effectiveLoan.status updates from external props or Firestore
  useEffect(() => {
    if (effectiveLoan.status && effectiveLoan.status !== activeLoanStatus) {
      setActiveLoanStatus(effectiveLoan.status);
    }
  }, [effectiveLoan.status]);

  // Toast Notification state for status changes
  const [statusToast, setStatusToast] = useState<{
    id: string;
    title: string;
    message: string;
    status: string;
    previousStatus?: string;
  } | null>(null);

  // Track previous status to detect real-time status transitions and trigger toast
  const prevStatusRef = useRef<string>(activeLoanStatus);

  useEffect(() => {
    if (prevStatusRef.current && prevStatusRef.current !== activeLoanStatus) {
      const oldStatus = prevStatusRef.current;
      const newStatus = activeLoanStatus;

      const formatStatusName = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      setStatusToast({
        id: `toast-${Date.now()}`,
        title: `Application Status: ${formatStatusName(newStatus)}`,
        message: `Loan application #${effectiveLoan.id?.slice(-8).toUpperCase()} has moved from "${formatStatusName(oldStatus)}" to "${formatStatusName(newStatus)}".`,
        status: newStatus,
        previousStatus: oldStatus,
      });

      addCommunicationLog({
        loanId: effectiveLoan.id,
        stageId: currentStageId,
        channel: 'in_app',
        category: 'stage_update',
        title: `Status Changed to ${formatStatusName(newStatus)}`,
        message: `Loan application #${effectiveLoan.id?.slice(-8).toUpperCase()} status was updated to ${formatStatusName(newStatus)}.`,
        recipient: profile?.email || user?.email || 'divvyanshu@gmail.com'
      });
    }
    prevStatusRef.current = activeLoanStatus;
  }, [activeLoanStatus, effectiveLoan.id, currentStageId, profile, user]);

  // Auto-dismiss status toast after 5 seconds
  useEffect(() => {
    if (!statusToast) return;
    const timer = setTimeout(() => {
      setStatusToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [statusToast]);

  const handleUpdateLoanStatus = async (newStatus: string) => {
    setActiveLoanStatus(newStatus);
    localStorage.setItem(`parrot_status_${effectiveLoan.id}`, newStatus);

    try {
      if (activeLoan?.id) {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'loans', activeLoan.id), {
          status: newStatus as any,
          updatedAt: serverTimestamp()
        });
      }
    } catch {
      // Local state fallback
    }

    refreshData();
  };

  // Communication logs & queries state
  const [logs, setLogs] = useState<CommunicationLogEntry[]>([]);
  const [openQueries, setOpenQueries] = useState<LoanQuery[]>([]);

  // Active Tab state for clean, unscattered organization
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'documents' | 'activity' | 'amortization'>('overview');

  // Encrypted documents state
  const [loanDocuments, setLoanDocuments] = useState<string[]>(() => {
    const saved = localStorage.getItem(`parrot_docs_${effectiveLoan.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore error
      }
    }
    return (effectiveLoan as any).documents || ['pan_card', 'form_16'];
  });

  const handleDocumentUploaded = (docId: string) => {
    setLoanDocuments((prev) => {
      if (prev.includes(docId)) return prev;
      const next = [...prev, docId];
      localStorage.setItem(`parrot_docs_${effectiveLoan.id}`, JSON.stringify(next));
      return next;
    });

    // Dispatch global event for firestore listeners
    window.dispatchEvent(new CustomEvent('loan-upload', {
      detail: { loanId: effectiveLoan.id, docId }
    }));

    // Trigger communication log alert for verified document upload
    addCommunicationLog({
      loanId: effectiveLoan.id,
      stageId: currentStageId,
      channel: 'whatsapp',
      category: 'document_request',
      title: `Document Upload Verified: ${docId.replace('_', ' ').toUpperCase()}`,
      message: `📄 *PARROT DOCUMENT UPLOAD SUCCESSFUL*\n\nApplication: *#${effectiveLoan.id?.slice(-8).toUpperCase()}*\nDocument: *${docId.replace('_', ' ').toUpperCase()}*\n\nStatus: *Verified & AES-256 Encrypted*\nYour file has been secured and dispatched to the verification desk.`,
      recipient: profile?.mobile || '+91 98765 43210'
    });

    refreshData();
  };

  const handleDocumentDeleted = (docId: string) => {
    setLoanDocuments((prev) => {
      const next = prev.filter((id) => id !== docId);
      localStorage.setItem(`parrot_docs_${effectiveLoan.id}`, JSON.stringify(next));
      return next;
    });

    // Dispatch global event for listeners
    window.dispatchEvent(new CustomEvent('loan-doc-deleted', {
      detail: { loanId: effectiveLoan.id, docId }
    }));

    // Trigger communication log alert for deleted document
    addCommunicationLog({
      loanId: effectiveLoan.id,
      stageId: currentStageId,
      channel: 'whatsapp',
      category: 'document_request',
      title: `Document Removed: ${docId.replace('_', ' ').toUpperCase()}`,
      message: `🗑️ *DOCUMENT REMOVED FROM APPLICATION*\n\nApplication: *#${effectiveLoan.id?.slice(-8).toUpperCase()}*\nDocument: *${docId.replace('_', ' ').toUpperCase()}*\n\nThe file was removed from your application vault. You may re-upload the correct scan at any time.`,
      recipient: profile?.mobile || '+91 98765 43210'
    });

    refreshData();
  };

  // Load logs & queries for active loan
  const refreshData = () => {
    const loanLogs = getCommunicationLogs(effectiveLoan.id);
    setLogs(loanLogs);

    // Queries from localStorage
    const savedQueries = localStorage.getItem(`parrot_queries_${effectiveLoan.id}`);
    if (savedQueries) {
      try {
        setOpenQueries(JSON.parse(savedQueries));
      } catch {
        setOpenQueries([]);
      }
    } else {
      // Default initial query on technical inspection stage
      const initialQueries: LoanQuery[] = [
        {
          id: 'q_init_1',
          loanId: effectiveLoan.id,
          stageId: 'technical_inspection',
          title: 'Floor Plan Verification Pending',
          description: 'Technical valuer requested a sanctioned municipal layout or approved building elevation copy to conclude property physical valuation.',
          requestedDocument: 'Municipal Approved Layout Plan',
          status: 'open',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem(`parrot_queries_${effectiveLoan.id}`, JSON.stringify(initialQueries));
      setOpenQueries(initialQueries);
    }
  };

  useEffect(() => {
    refreshData();
  }, [effectiveLoan.id, currentStageId]);

  // Handle stage advancement
  const handleAdvanceStage = (newStageId: LoanStageId) => {
    setCurrentStageId(newStageId);
    setSelectedStageId(newStageId);
    localStorage.setItem(`parrot_stage_${effectiveLoan.id}`, newStageId);

    // Trigger automated alerts across all channels
    triggerStageAlertNotification(
      effectiveLoan.id,
      newStageId,
      profile?.email || user?.email || 'divvyanshu@gmail.com',
      profile?.mobile || '+91 98765 43210',
      effectiveLoan.selectedBank?.name || 'HDFC Bank',
      effectiveLoan.loanAmount || 4500000
    );

    refreshData();
  };

  // Trigger quick alert simulation
  const handleTriggerQuickAlert = (channel: CommunicationChannel) => {
    const config = STAGE_CONFIGS[selectedStageId];
    const bank = effectiveLoan.selectedBank?.name || 'HDFC Bank';
    const amount = effectiveLoan.loanAmount ? `₹${effectiveLoan.loanAmount.toLocaleString('en-IN')}` : '₹45,00,000';
    const loanNum = effectiveLoan.id?.slice(-8).toUpperCase();

    const title = `${channel.toUpperCase()} Alert: Stage ${config.order} (${config.name})`;
    const message = `Application #${loanNum} for ${amount} at ${bank} is currently in "${config.name}". ${config.shortDesc}. SLA: ${config.slaDays} business days.`;

    addCommunicationLog({
      loanId: effectiveLoan.id,
      stageId: selectedStageId,
      channel,
      category: 'stage_update',
      title,
      message,
      recipient: channel === 'email' ? (profile?.email || 'divvyanshu@gmail.com') : (profile?.mobile || '+91 98765 43210'),
      status: 'delivered',
      read: false
    });

    refreshData();
  };

  // Raise new query simulation
  const handleRaiseQuery = (title: string, desc: string, docName?: string) => {
    createQuery(
      effectiveLoan.id,
      selectedStageId,
      title,
      desc,
      docName,
      profile?.email || 'divvyanshu@gmail.com',
      profile?.mobile || '+91 98765 43210'
    );
    refreshData();
  };

  // Resolve query
  const handleResolveQuery = (queryId: string, note: string) => {
    resolveQuery(effectiveLoan.id, queryId, note);
    refreshData();
  };

  // Handle custom simulation from modal
  const handleSendSimulation = (params: {
    channel: CommunicationChannel;
    stageId: LoanStageId;
    category: CommunicationLogEntry['category'];
    title: string;
    message: string;
    subject?: string;
  }) => {
    addCommunicationLog({
      loanId: effectiveLoan.id,
      stageId: params.stageId,
      channel: params.channel,
      category: params.category,
      title: params.title,
      subject: params.subject,
      message: params.message,
      recipient: params.channel === 'email' ? (profile?.email || 'divvyanshu@gmail.com') : (profile?.mobile || '+91 98765 43210'),
      status: 'delivered',
      read: false
    });
    refreshData();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 md:p-8 max-w-7xl mx-auto">
        <div className="h-28 bg-stone-100 rounded-3xl w-full" />
        <div className="h-44 bg-stone-100 rounded-3xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-96 bg-stone-100 rounded-3xl" />
          <div className="lg:col-span-7 h-96 bg-stone-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 bg-white rounded-3xl border border-stone-200 shadow-sm text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-lg text-stone-800">Unable to Load Loan Lifecycle</h4>
        <p className="text-xs text-stone-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Reload Dashboard
        </button>
      </div>
    );
  }

  const activeQueriesCount = openQueries.filter(q => q.status === 'open').length;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16 px-3 sm:px-6">
      
      {/* 1. CLEAN, REFINED LIGHT HEADER (No Black Background) */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 md:p-8 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/80">
                Application #{effectiveLoan.id?.slice(-8).toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                {effectiveLoan.purpose || 'New Home Loan'} • {effectiveLoan.city || 'Mumbai'}
              </span>
              {activeQueriesCount > 0 && (
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  {activeQueriesCount} Action Item
                </span>
              )}
              <AnimatedStatusBadge
                status={activeLoanStatus}
                onChangeStatus={handleUpdateLoanStatus}
                allowQuickToggle={true}
              />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              Loan Application Hub
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Track your journey from submission to bank sanction with transparent real-time alerts.
            </p>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl shadow-2xs hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Simulate Alerts</span>
            </button>
            <button
              onClick={onNewLoan}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Loan</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Strip (Refined, Highly Legible & Touch-Friendly on Mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-stone-100 text-xs">
          {/* Card 1: Lender Partner */}
          <div 
            onClick={() => window.dispatchEvent(new CustomEvent('open-parrot-chat', {
              detail: { query: `Tell me about my loan terms and institutional benefits with ${effectiveLoan.selectedBank?.name || 'HDFC Bank'}` }
            }))}
            className="bg-stone-50/90 hover:bg-emerald-50/50 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-stone-200/70 transition-all cursor-pointer select-none min-h-[72px] sm:min-h-[80px] flex flex-col justify-between active:scale-[0.98] group"
            title="Tap to ask Concierge about this lender partner"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9.5px] sm:text-[10px] uppercase font-black tracking-wider text-stone-500">Lender Partner</span>
              <BankLogo bank={effectiveLoan.selectedBank?.name || 'HDFC Bank'} size="xs" showBorder={false} className="w-5 h-5 rounded-md shadow-2xs" />
            </div>
            <span className="font-extrabold text-stone-900 text-xs sm:text-sm truncate block mt-0.5 group-hover:text-emerald-800 transition-colors" title={effectiveLoan.selectedBank?.name || 'HDFC Bank'}>
              {effectiveLoan.selectedBank?.name || 'HDFC Bank'}
            </span>
          </div>

          {/* Card 2: Loan Amount */}
          <div className="bg-stone-50/90 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-stone-200/70 min-h-[72px] sm:min-h-[80px] flex flex-col justify-between select-none">
            <span className="text-[9.5px] sm:text-[10px] uppercase font-black tracking-wider text-stone-500 block">Loan Amount</span>
            <span className="font-black text-emerald-700 text-xs sm:text-sm truncate block mt-0.5">
              ₹{effectiveLoan.loanAmount ? effectiveLoan.loanAmount.toLocaleString('en-IN') : '45,00,000'}
            </span>
          </div>

          {/* Card 3: Active Milestone */}
          <div 
            onClick={() => {
              const el = document.getElementById('active-loan-stage-details') || document.getElementById('loan-stage-roadmap');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-stone-50/90 hover:bg-stone-100/90 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-stone-200/70 transition-all cursor-pointer select-none min-h-[72px] sm:min-h-[80px] flex flex-col justify-between active:scale-[0.98]"
            title="Tap to view active milestone details"
          >
            <span className="text-[9.5px] sm:text-[10px] uppercase font-black tracking-wider text-stone-500 block">Active Milestone</span>
            <span className="font-extrabold text-stone-900 text-[11px] sm:text-xs leading-tight line-clamp-2 mt-0.5 flex items-start gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-0.5" />
              <span>{STAGE_CONFIGS[currentStageId].name}</span>
            </span>
          </div>

          {/* Card 4: Est. Completion */}
          <div className="bg-stone-50/90 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-stone-200/70 min-h-[72px] sm:min-h-[80px] flex flex-col justify-between select-none">
            <span className="text-[9.5px] sm:text-[10px] uppercase font-black tracking-wider text-stone-500 block">Est. Completion</span>
            <span className="font-extrabold text-stone-800 text-xs sm:text-sm truncate block mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400 shrink-0" />
              <span>{STAGE_CONFIGS[currentStageId].slaDays} Business Days</span>
            </span>
          </div>
        </div>

        {/* Multi-loan selector if user has more than 1 loan */}
        {loans && loans.length > 1 && (
          <div className="flex items-center gap-2 pt-2 text-xs border-t border-stone-100">
            <span className="text-stone-500 font-bold">Switch Application:</span>
            <div className="flex gap-2 flex-wrap">
              {loans.map((l, i) => (
                <button
                  key={l.id || i}
                  onClick={() => setSelectedLoanIndex(i)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                    selectedLoanIndex === i
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  )}
                >
                  {l.selectedBank?.name || 'Loan'} (#{l.id?.slice(-6) || i + 1})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. AGENTIC RESEARCH ASSISTANT STATUS & GATEWAY */}
      <AgenticResearchStatusCard 
        onOpenChat={() => window.dispatchEvent(new CustomEvent('open-parrot-chat'))} 
      />

      {/* 2.5 MARKET RATE BENCHMARK & LIFETIME SAVINGS ELEMENT */}
      <LoanMarketSavingsBenchmark loan={effectiveLoan} />

      {/* 3. THREE-PHASE STORYLINE ROADMAP CARD (Origin -> Active -> Next) */}
      <LoanJourneyCard
        currentStageId={currentStageId}
        loan={effectiveLoan}
        openQueries={openQueries}
        onSelectStage={(stageId) => {
          setSelectedStageId(stageId);
          setDashboardTab('overview');
        }}
      />

      {/* 3. ORGANIZED TAB NAVIGATION (Segmented Control) */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/80">
          <button
            onClick={() => setDashboardTab('overview')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              dashboardTab === 'overview'
                ? "bg-white text-stone-900 shadow-sm border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Overview & Stages</span>
          </button>

          <button
            onClick={() => setDashboardTab('documents')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              dashboardTab === 'documents'
                ? "bg-white text-stone-900 shadow-sm border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <FolderCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Document Vault</span>
            <span className="text-[10px] font-black bg-stone-200 px-1.5 py-0.2 rounded-md">
              {loanDocuments.length}/4
            </span>
          </button>

          <button
            onClick={() => setDashboardTab('activity')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              dashboardTab === 'activity'
                ? "bg-white text-stone-900 shadow-sm border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <Inbox className="w-3.5 h-3.5 text-emerald-600" />
            <span>Alerts & Messages</span>
            <span className="text-[10px] font-black bg-stone-200 px-1.5 py-0.2 rounded-md">
              {logs.length}
            </span>
          </button>

          <button
            onClick={() => setDashboardTab('amortization')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              dashboardTab === 'amortization'
                ? "bg-white text-stone-900 shadow-sm border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>Amortization Schedule</span>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md">
              EMI Logic
            </span>
          </button>
        </div>

        {/* Quick helper note */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bank Grade 256-bit Encrypted</span>
        </div>
      </div>

      {/* 4. TAB CONTENTS WITH ANIMATION */}
      <AnimatePresence mode="wait">
        {/* TAB 1: OVERVIEW & 6-STAGE TIMELINE */}
        {dashboardTab === 'overview' && (
          <motion.div
            key="tab-overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left: 6-Stage Interactive Stepper (5 Cols) */}
            <div className="lg:col-span-5">
              <LoanProgressStepper
                currentStageId={currentStageId}
                selectedStageId={selectedStageId}
                onSelectStage={(stageId) => setSelectedStageId(stageId)}
                openQueries={openQueries}
                onOpenSimulator={() => setIsSimulatorOpen(true)}
              />
            </div>

            {/* Right: Stage Deep Dive Card (7 Cols) */}
            <div className="lg:col-span-7">
              <StageDetailsCard
                selectedStageId={selectedStageId}
                currentStageId={currentStageId}
                loan={effectiveLoan}
                openQueries={openQueries}
                onResolveQuery={handleResolveQuery}
                onAdvanceStage={handleAdvanceStage}
                onTriggerAlert={handleTriggerQuickAlert}
                onRaiseQuery={handleRaiseQuery}
              />
            </div>
          </motion.div>
        )}

        {/* TAB 2: DOCUMENT VAULT */}
        {dashboardTab === 'documents' && (
          <motion.div
            key="tab-documents"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <DocumentUpload
              loanId={effectiveLoan.id}
              documents={loanDocuments}
              onUploadComplete={handleDocumentUploaded}
              onDeleteDocument={handleDocumentDeleted}
            />
          </motion.div>
        )}

        {/* TAB 3: ACTIVITY & AUDIT LOGS */}
        {dashboardTab === 'activity' && (
          <motion.div
            key="tab-activity"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <CommunicationLog
              logs={logs}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onClearLogs={() => {
                if (confirm("Are you sure you want to clear message audit records for this session?")) {
                  localStorage.removeItem(`parrot_comms_${effectiveLoan.id}`);
                  refreshData();
                }
              }}
            />
          </motion.div>
        )}

        {/* TAB 4: AMORTIZATION SCHEDULE */}
        {dashboardTab === 'amortization' && (
          <motion.div
            key="tab-amortization"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <AmortizationScheduleView loan={effectiveLoan} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Simulation Sandbox Modal */}
      <NotificationSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSendSimulation={handleSendSimulation}
        currentStageId={currentStageId}
        loan={effectiveLoan}
        userEmail={profile?.email || user?.email || 'divvyanshu@gmail.com'}
        userPhone={profile?.mobile || '+91 98765 43210'}
      />

      {/* Floating Action Button for Mobile: Ask Concierge for Current Loan Stage */}
      <MobileConciergeFab currentStageId={currentStageId} loan={effectiveLoan} />

      {/* Floating Toast Notification for Real-Time Loan Application Status Changes */}
      <AnimatePresence>
        {statusToast && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full p-4 rounded-2xl shadow-2xl border bg-slate-900 text-white border-slate-700 flex items-start gap-3.5 pointer-events-auto"
            role="status"
            aria-live="polite"
          >
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
              statusToast.status === 'approved' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" :
              statusToast.status === 'rejected' ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" :
              statusToast.status === 'pending_review' ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
              "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
            )}>
              {statusToast.status === 'approved' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
               statusToast.status === 'rejected' ? <AlertCircle className="w-5 h-5 text-rose-400" /> :
               <Clock className="w-5 h-5 text-amber-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 truncate">
                  {statusToast.title}
                </h4>
                <button
                  onClick={() => setStatusToast(null)}
                  className="text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {statusToast.message}
              </p>
              <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active User Dashboard Real-Time Alert</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const LOAN_CATEGORIES = [
  { id: 'New Home Loan', label: 'New Home Loan', icon: Home, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'Plot Loan', label: 'Plot Loan', icon: Mountain, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'Plot + Construction', label: 'Plot + Construction', icon: Mountain, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'Top up Loan', label: 'Step-up Loan', icon: Plus, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'Loan Transfer', label: 'Loan Transfer', icon: RefreshCw, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'Loan Against Property', label: 'Loan Against Property', icon: Building, color: 'bg-white border border-slate-100 text-slate-600' },
  { id: 'NRI Loan', label: 'NRI Loan', icon: Mountain, color: 'bg-white border border-slate-100 text-slate-600' },
];

function LandingView({ 
  onStartQuestionnaire, 
  onCookieSettingsClick,
  onLoginClick
}: { 
  onStartQuestionnaire?: (category?: string) => void, 
  onCookieSettingsClick?: () => void,
  onLoginClick?: (mode?: 'customer' | 'admin') => void
}) {
  const { user, loginWithGoogle, loginWithEmailOrMobile } = useAuth();

  const handleApply = (category?: string) => {
    if (category) {
      localStorage.setItem('pendingLoanCategory', category);
    }
    if (onStartQuestionnaire) {
      onStartQuestionnaire(category);
    } else {
      loginWithGoogle();
    }
  };

  const handleGoToDashboard = () => {
    if (onStartQuestionnaire) {
      onStartQuestionnaire();
    }
  };

  return (
    <ParrotLanding 
      onApply={handleApply} 
      loginWithGoogle={loginWithGoogle} 
      loginWithEmailOrMobile={loginWithEmailOrMobile}
      isLoggedIn={!!user}
      onGoToDashboard={handleGoToDashboard}
      onCookieSettingsClick={onCookieSettingsClick}
      onLoginClick={onLoginClick}
    />
  );
}

// --- Main App Logic ---

function AnalysisPortal({ progress }: { progress: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="max-w-md md:max-w-lg w-full text-center space-y-5 md:space-y-6 my-auto"
      >
        <div className="relative">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-[8px] md:border-[10px] border-natural-bg mx-auto flex items-center justify-center relative shadow-inner">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-[8px] md:border-[10px] border-transparent border-t-natural-terracotta rounded-full -m-[8px] md:-m-[10px]"
            />
            <div className="text-center">
              <span className="text-4xl md:text-5xl font-extrabold text-natural-sage tabular-nums tracking-tighter">{Math.round(progress)}%</span>
              <p className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.3em] text-natural-muted mt-1">Analysis Level</p>
            </div>
          </div>
          
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-6 -right-6 w-24 h-24 bg-natural-terracotta/5 rounded-full blur-2xl pointer-events-none"
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-natural-sage tracking-tight italic leading-snug px-2">
            Hold on, we are reviewing your data to best match the offer...
          </h2>
          <p className="text-xs sm:text-sm text-natural-muted font-medium max-w-sm mx-auto leading-relaxed px-2">
            Our smart protocol is scanning 40+ top-tier banks to secure your optimal interest rate and tenure.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <div className="h-3.5 w-full bg-natural-bg rounded-full overflow-hidden shadow-inner p-0.5">
            <motion.div 
              className="h-full bg-natural-terracotta rounded-full relative overflow-hidden shadow-sm shadow-natural-terracotta/20"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            >
               <motion.div 
                 animate={{ x: ['-100%', '100%'] }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
               />
            </motion.div>
          </div>
          <div className="flex justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-natural-muted px-1">
            <span className={cn("transition-colors duration-500", progress > 10 ? "text-natural-terracotta" : "opacity-40")}>Sanitizing Data</span>
            <span className={cn("transition-colors duration-500", progress > 40 ? "text-natural-terracotta" : "opacity-40")}>Bank Liquidity Check</span>
            <span className={cn("transition-colors duration-500", progress > 80 ? "text-natural-terracotta" : "opacity-40")}>Final Calibration</span>
          </div>
        </div>

        <div className="flex justify-center gap-8 md:gap-10 pt-2">
           {[Building2, ShieldCheck, Zap, Database].map((Icon, i) => (
             <motion.div
               key={i}
               animate={{ 
                 y: [0, -8, 0], 
                 opacity: [0.3, 1, 0.3],
                 scale: [0.95, 1.05, 0.95]
               }}
               transition={{ 
                 duration: 2.2, 
                 delay: i * 0.35, 
                 repeat: Infinity,
                 ease: "easeInOut"
               }}
               className="text-natural-muted"
             >
               <Icon className="w-6 h-6 md:w-8 md:h-8 text-natural-sage/70" />
             </motion.div>
           ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ApplicationProgress({ currentStep, totalSteps, onBackToLanding }: { currentStep: number, totalSteps: number, onBackToLanding?: () => void }) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="flex items-center gap-4 max-w-2xl mx-auto mb-6 md:mb-10 w-full px-2">
      {onBackToLanding && (
        <button 
          onClick={onBackToLanding}
          className="p-2.5 bg-white border border-natural-border hover:border-[#10B981] text-natural-sage hover:text-[#10B981] hover:scale-105 active:scale-95 transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm shrink-0"
          title="Back to Home"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Home</span>
        </button>
      )}
      
      <div className="flex-1">
        <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"
            transition={{ type: "spring", stiffness: 85, damping: 16 }}
          />
        </div>
      </div>
      
      <span className="text-[10px] md:text-xs font-black tracking-wider text-[#10B981] shrink-0 font-sans">
        {percentage}%
      </span>
    </div>
  );
}

function DocumentChecklist({ formData }: { formData: any }) {
  const isSalaried = formData.occupation === 'Salaried';
  const isBusiness = formData.occupation === 'Business' || formData.occupation === 'Self-Employed';
  const isRefinance = ['Loan Transfer', 'Top up Loan'].includes(formData.purpose);
  const hasCoBorrower = formData.hasCoBorrower === 'Yes';
  const hasExistingLoans = formData.activeLoans?.length > 0;

  const kyc = [
    'PAN Card (Mandatory)',
    'Aadhaar / Voter ID / Passport',
    'Passport size photographs',
    'Current Address Proof'
  ];

  const income = isSalaried ? [
    'Salary Slips (Last 3 months)',
    'Form 16 / Latest 2 years ITR',
    'Bank statement wherein salary income is coming (Mandatory)',
  ] : isBusiness ? [
    'Latest 3 years ITR & Computation',
    'CA Certified P&L / Balance Sheet',
    'GST Registration & returns',
    'Bank statement wherein business income is coming (Mandatory)'
  ] : [
    'Income proof (2 years ITR)',
    'Bank statement wherein salary/business income is coming (Mandatory)'
  ];

  const loanDocs = (hasExistingLoans || isRefinance) ? [
    isRefinance ? 'Statement of Account (SOA) of loan (Mandatory)' : 'Statement of Account (SOA)',
    isRefinance ? 'Bank statement wherein loan installment is going (Mandatory)' : 'Bank statement showing regular repayments',
    'Original Sanction Letters'
  ] : [];

  const coBorrowerDocs = hasCoBorrower ? [
    'Co-borrower KYC (PAN/Aadhaar)',
    'Income proof (if applicable)'
  ] : [];

  const propertyDocs = [
    'Draft Sale Agreement',
    'Chain of Title Deeds (30 years)',
    'Property Tax Receipt',
    formData.propertyType?.includes('Const') ? 'Approved Building Plan' : 'Society NOC',
  ].filter(Boolean);

  const categories = [
    { title: 'Personal & KYC', items: kyc, icon: User },
    { title: 'Income Stability', items: income, icon: FileText },
    { title: 'Collateral/Property', items: propertyDocs, icon: Building2 },
    ...(loanDocs.length > 0 ? [{ title: 'Existing Loans', items: loanDocs, icon: ShieldCheck }] : []),
    ...(coBorrowerDocs.length > 0 ? [{ title: 'Co-applicant', items: coBorrowerDocs, icon: Users2 }] : [])
  ];

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 shadow-huge border border-natural-border/30 space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 overflow-hidden">
      <div className="space-y-4 md:space-y-6 text-center">
        <div className="inline-flex items-center gap-3 bg-natural-terracotta/5 text-natural-terracotta px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border border-natural-terracotta/10">
           <FileText className="w-3.5 h-3.5" /> Post-Application Guide
        </div>
        <div className="space-y-3 px-4">
          <h4 className="text-3xl md:text-4xl font-bold text-natural-sage tracking-tighter italic">Document Checklist.</h4>
          <p className="text-[12px] md:text-[13px] font-medium text-natural-muted/70 max-w-xl mx-auto leading-relaxed">
            Your application is being prepared. To ensure zero-delay processing, please organize the following documents into digital folders. 
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 px-4 md:px-0">
        {categories.map((cat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            className="flex flex-col h-full"
          >
            <div className="flex-1 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-natural-border/60 transition-all bg-natural-bg/30 hover:bg-white hover:shadow-2xl hover:-translate-y-2 group overflow-hidden">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-md bg-white text-natural-terracotta group-hover:bg-natural-terracotta group-hover:text-white transition-colors">
                  <cat.icon className="w-5 h-5 md:w-6 h-6" />
                </div>
                <h5 className="font-bold text-natural-sage tracking-tight text-base md:text-lg">{cat.title}</h5>
              </div>
              <ul className="space-y-4 md:space-y-5">
                {cat.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-natural-terracotta/40" />
                    <span className="text-[12px] md:text-[13px] font-medium text-natural-sage/80 leading-snug break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-[#10B981] to-[#0e9f6e] rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
           <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 shrink-0">
              <ShieldCheck className="w-10 h-10 text-white" />
           </div>
           <div className="space-y-2">
              <h5 className="text-2xl font-bold text-white italic tracking-tight">Need help with these?</h5>
              <p className="text-white/70 text-sm font-medium max-w-sm">Use our bilingual voice assistant for detailed explanations of any document in this list.</p>
           </div>
        </div>
        <button className="relative z-10 w-full md:w-auto px-10 py-5 bg-white text-[#10B981] rounded-[1.5rem] font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer">
          Connect with Expert
        </button>
      </div>
    </div>
  );
}

function AdminPortal({ 
  users, 
  loans,
  isLoadingUsers = false,
  isLoadingLoans = false,
  usersError = null,
  loansError = null,
  banks = [],
  isLoadingBanks = false,
  isSheetsConnected = false,
  onConnectSheets,
  sheetsError = null,
  algorithmParams,
  onSaveAlgorithmParams
}: { 
  users: any[], 
  loans: any[],
  isLoadingUsers?: boolean,
  isLoadingLoans?: boolean,
  usersError?: string | null,
  loansError?: string | null,
  banks?: any[],
  isLoadingBanks?: boolean,
  isSheetsConnected?: boolean,
  onConnectSheets?: () => Promise<any> | void,
  sheetsError?: string | null,
  algorithmParams: {
    cibilThreshold: number;
    cibilPenalty: number;
    maxAgeLimit: number;
    agePenalty: number;
    maxLtvRatio: number;
    maxFoirRatio: number;
    coBorrowerMultiplier: number;
    salaryMatchBonus: number;
  },
  onSaveAlgorithmParams: (params: any) => Promise<void>
}) {
  const [view, setView] = useState<'users' | 'loans' | 'banks' | 'algorithm'>('users');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { profile } = useAuth();
  const isAdminUser = profile?.role === 'admin';

  // Algorithm configuration state
  const [localParams, setLocalParams] = useState(algorithmParams);
  const [isSavingParams, setIsSavingParams] = useState(false);

  React.useEffect(() => {
    if (algorithmParams) {
      setLocalParams(algorithmParams);
    }
  }, [algorithmParams]);

  const handleParamChange = (key: string, value: number) => {
    setLocalParams(prev => ({ ...prev, [key]: value }));
  };

  const handleResetToDefaults = () => {
    setLocalParams({
      cibilThreshold: 700,
      cibilPenalty: 20,
      maxAgeLimit: 65,
      agePenalty: 4,
      maxLtvRatio: 90,
      maxFoirRatio: 50,
      coBorrowerMultiplier: 1.45,
      salaryMatchBonus: 15
    });
  };

  const handleSaveParams = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingParams(true);
    try {
      await onSaveAlgorithmParams(localParams);
      alert("Algorithms and dynamic credit decision limits successfully updated!");
    } catch (err) {
      console.error(err);
      alert("Dynamic metrics storage failed.");
    } finally {
      setIsSavingParams(false);
    }
  };

  // Bank Form State
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [editingBank, setEditingBank] = useState<any | null>(null);
  const [bankName, setBankName] = useState('');
  const [bankRate, setBankRate] = useState('');
  const [bankProcessingTime, setBankProcessingTime] = useState('');
  const [bankFeatures, setBankFeatures] = useState('');
  const [bankScore, setBankScore] = useState(90);
  const [bankRating, setBankRating] = useState(4.5);
  const [savingBank, setSavingBank] = useState(false);

  const resetForm = () => {
    setBankName('');
    setBankRate('');
    setBankProcessingTime('');
    setBankFeatures('');
    setBankScore(90);
    setBankRating(4.5);
    setIsAddingBank(false);
    setEditingBank(null);
  };

  const handleEditBankClick = (bank: any) => {
    setEditingBank(bank);
    setBankName(bank.name);
    setBankRate(bank.rate);
    setBankProcessingTime(bank.processingTime || '');
    setBankFeatures(Array.isArray(bank.features) ? bank.features.join(', ') : '');
    setBankScore(bank.score || 90);
    setBankRating(bank.rating || 4.5);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !bankRate.trim()) {
      alert("Name and Rate are required.");
      return;
    }
    setSavingBank(true);
    try {
      const { doc, setDoc, updateDoc } = await import('firebase/firestore');
      const payload = {
        name: bankName.trim(),
        rate: bankRate.trim(),
        processingTime: bankProcessingTime.trim() || '10-15 Days',
        features: bankFeatures.split(',').map(f => f.trim()).filter(Boolean),
        rating: Number(bankRating) || 4.5,
        score: Number(bankScore) || 90
      };

      if (editingBank) {
        await updateDoc(doc(db, 'banks', editingBank.id), payload);
      } else {
        const cleanId = bankName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        await setDoc(doc(db, 'banks', cleanId), payload);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving bank:", err);
      alert("Failed to save lender Offer details.");
    } finally {
      setSavingBank(false);
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    if (!window.confirm("Are you sure you want to delete this lender data feed? It will immediately stop appearing in loan matches.")) {
      return;
    }
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'banks', bankId));
    } catch (err) {
      console.error("Error deleting bank:", err);
      alert("Failed to delete lender.");
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!isAdminUser) return;
    setUpdatingUserId(userId);
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const renderUsers = () => {
    if (isLoadingUsers) {
      return (
        <div className="bg-white rounded-[3rem] border border-natural-border shadow-2xl overflow-hidden animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-natural-border/50">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">User Name</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Email</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Current Role</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-natural-border/30">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="group transition-all">
                    <td className="px-10 py-8"><div className="h-5 bg-natural-muted/10 rounded-xl w-32 animate-pulse" /></td>
                    <td className="px-10 py-8"><div className="h-5 bg-natural-muted/5 rounded-xl w-48 animate-pulse" /></td>
                    <td className="px-10 py-8"><div className="h-6 bg-natural-muted/10 rounded-lg w-16 animate-pulse" /></td>
                    <td className="px-10 py-8 text-right"><div className="h-8 bg-natural-muted/10 rounded-xl w-36 ml-auto animate-pulse" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (usersError) {
      return (
        <div className="bg-white p-16 rounded-[3rem] border border-natural-border shadow-2xl text-center space-y-6 animate-in fade-in">
          <div className="w-20 h-20 bg-natural-terracotta/5 text-natural-terracotta rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-sm mx-auto">
            <h4 className="font-semibold text-xl text-natural-sage italic">Access Authorization Required</h4>
            <p className="text-xs text-natural-muted font-medium leading-relaxed">
              {usersError.includes("permission") || usersError.includes("insufficient")
                ? "Lacking Client/Admin credentials to view user database records."
                : `Firestore connection error: ${usersError}`}
            </p>
          </div>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="bg-white p-16 rounded-[3rem] border border-natural-border shadow-2xl text-center">
          <p className="text-xl font-bold text-natural-sage">No users found.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[3rem] border border-natural-border shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-natural-border/50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">User Name</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Email</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Current Role</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-border/30">
              {users.map(u => (
                <tr key={u.id} className="group hover:bg-natural-bg/30 transition-all">
                  <td className="px-10 py-8 font-black text-natural-sage">{u.name}</td>
                  <td className="px-10 py-8 text-sm font-medium text-natural-muted">{u.email}</td>
                  <td className="px-10 py-8">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      u.role === 'admin' ? "bg-purple-100 text-purple-700" :
                      u.role === 'staff' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {['client', 'staff', 'admin'].map((r) => (
                        <button
                          key={r}
                          disabled={updatingUserId === u.id || u.role === r || !isAdminUser}
                          onClick={() => handleRoleChange(u.id, r as UserRole)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all",
                            u.role === r 
                              ? "bg-natural-sage text-white border-natural-sage" 
                              : "bg-white text-natural-muted border-natural-border hover:border-natural-terracotta hover:text-natural-terracotta",
                            !isAdminUser && u.role !== r && "opacity-30 cursor-not-allowed hover:border-natural-border hover:text-natural-muted"
                          )}
                        >
                          {updatingUserId === u.id && u.role !== r ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : r}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderLoans = () => {
    if (isLoadingLoans) {
      return (
        <div className="bg-white rounded-[3rem] border border-natural-border shadow-2xl overflow-hidden animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-natural-border/50">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Applicant</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Amount</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Bank</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-natural-border/30">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="group transition-all">
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <div className="h-5 bg-natural-muted/10 rounded-xl w-28 animate-pulse" />
                        <div className="h-3 bg-natural-muted/5 rounded-lg w-12 animate-pulse" />
                      </div>
                    </td>
                    <td className="px-10 py-8"><div className="h-5 bg-natural-muted/10 rounded-xl w-16 animate-pulse" /></td>
                    <td className="px-10 py-8"><div className="h-5 bg-natural-muted/5 rounded-xl w-20 animate-pulse" /></td>
                    <td className="px-10 py-8"><div className="h-7 bg-natural-muted/10 rounded-lg w-16 animate-pulse" /></td>
                    <td className="px-10 py-8 text-right"><div className="h-4 bg-natural-muted/5 rounded-lg w-16 ml-auto animate-pulse" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (loansError) {
      return (
        <div className="bg-white p-16 rounded-[3rem] border border-natural-border shadow-2xl text-center space-y-6 animate-in fade-in">
          <div className="w-20 h-20 bg-natural-terracotta/5 text-natural-terracotta rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-sm mx-auto">
            <h4 className="font-semibold text-xl text-natural-sage italic">Access Authorization Required</h4>
            <p className="text-xs text-natural-muted font-medium leading-relaxed">
              {loansError.includes("permission") || loansError.includes("insufficient")
                ? "Lacking Staff/Admin credentials to view platform mortgage applications."
                : `Firestore connection error: ${loansError}`}
            </p>
          </div>
        </div>
      );
    }

    if (loans.length === 0) {
      return (
        <div className="bg-white p-16 rounded-[3rem] border border-natural-border shadow-2xl text-center">
          <p className="text-xl font-bold text-natural-sage">No active loan applications found.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[3rem] border border-natural-border shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-natural-border/50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Applicant</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Amount</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Bank</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-border/30">
              {loans.map(l => (
                <tr key={l.id} className="group hover:bg-natural-bg/30 transition-all">
                  <td className="px-10 py-8">
                     <div className="space-y-1">
                        <p className="font-black text-natural-sage">{l.fullName || 'Anonymous'}</p>
                        <p className="text-[10px] text-natural-muted font-bold tracking-wider">{l.id.substring(0, 8).toUpperCase()}</p>
                     </div>
                  </td>
                  <td className="px-10 py-8 font-black text-natural-terracotta tabular-nums">{formatCurrency(l.loanAmount || 0)}</td>
                  <td className="px-10 py-8 text-sm font-bold text-natural-sage">{l.selectedBank?.name || 'N/A'}</td>
                  <td className="px-10 py-8">
                    <select
                      value={l.status}
                      onChange={async (e) => {
                        const { doc, updateDoc } = await import('firebase/firestore');
                        await updateDoc(doc(db, 'loans', l.id), { 
                          status: e.target.value as LoanStatus,
                          updatedAt: serverTimestamp()
                        });
                      }}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest outline-none border-none cursor-pointer hover:ring-2 ring-natural-terracotta/20",
                        l.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                        l.status === 'rejected' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {['draft', 'submitted', 'pending_review', 'approved', 'rejected'].map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-10 py-8 text-right text-[10px] font-black text-natural-muted">
                    {l.createdAt?.toDate ? l.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBanks = () => {
    if (isLoadingBanks) {
      return (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-natural-sage" />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-natural-sage italic">Live Lender Data Feed</h3>
            <p className="text-xs text-natural-muted font-medium">Control ROI rates, features, and target scoring metrics for recommendation engines.</p>
          </div>
          {!isAddingBank && !editingBank && (
            <button 
              onClick={() => setIsAddingBank(true)}
              className="px-5 py-2.5 bg-natural-sage text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-natural-sage/90 shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Lender Feed
            </button>
          )}
        </div>

        {(isAddingBank || editingBank) ? (
          <form onSubmit={handleSaveBank} className="bg-white p-8 rounded-[2rem] border border-natural-border shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#10B981]">
              {editingBank ? `Editing Lender: ${editingBank.name}` : 'Create New Lender Data Feed'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-natural-muted">Lender Name</label>
                <input 
                  type="text" 
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. Chase Bank, HDFC, SBI"
                  className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-natural-sage focus:outline-none focus:ring-1 focus:ring-natural-sage transition-all text-sm font-bold text-natural-sage"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-natural-muted">ROI / Rate (e.g. 8.40%)</label>
                <input 
                  type="text" 
                  value={bankRate}
                  onChange={e => setBankRate(e.target.value)}
                  placeholder="e.g. 8.40%"
                  className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-natural-sage focus:outline-none focus:ring-1 focus:ring-natural-sage transition-all text-sm font-bold text-natural-sage"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-natural-muted">Processing Time</label>
                <input 
                  type="text" 
                  value={bankProcessingTime}
                  onChange={e => setBankProcessingTime(e.target.value)}
                  placeholder="e.g. 5-7 Days"
                  className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-natural-sage focus:outline-none focus:ring-1 focus:ring-natural-sage transition-all text-sm font-bold text-natural-sage"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-natural-muted">Internal Score (0 - 100)</label>
                <input 
                  type="number" 
                  value={bankScore}
                  onChange={e => setBankScore(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-natural-sage focus:outline-none focus:ring-1 focus:ring-natural-sage transition-all text-sm font-bold text-natural-sage"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-natural-muted">Customer Rating (1 - 5)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={bankRating}
                  onChange={e => setBankRating(Number(e.target.value))}
                  min="1"
                  max="5"
                  className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-natural-sage focus:outline-none focus:ring-1 focus:ring-natural-sage transition-all text-sm font-bold text-natural-sage"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-natural-muted">Features (Separated with commas)</label>
                <input 
                  type="text" 
                  value={bankFeatures}
                  onChange={e => setBankFeatures(e.target.value)}
                  placeholder="e.g. Lowest Rates, Instant App, Digital Journey, Zero Pre-closure Fee"
                  className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-natural-sage focus:outline-none focus:ring-1 focus:ring-natural-sage transition-all text-sm font-bold text-natural-sage"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-natural-border text-natural-muted text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-natural-bg/50 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={savingBank}
                className="px-6 py-3 bg-[#10B981] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#10B981]/90 shadow-md transition-all flex items-center gap-2"
              >
                {savingBank ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Feed'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-[3rem] border border-natural-border shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-natural-border/50">
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Lender Details</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Interest ROI</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Processing Speed</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted">Score / Rating</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-natural-muted text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-border/30">
                  {banks.map(b => (
                    <tr key={b.id || b.name} className="group hover:bg-natural-bg/30 transition-all">
                      <td className="px-10 py-8">
                        <div className="space-y-1.5 animate-in fade-in duration-250">
                          <p className="font-extrabold text-sm text-natural-sage">{b.name}</p>
                          <div className="flex flex-wrap gap-1">
                            {(b.features || []).map((f: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[8px] font-extrabold uppercase tracking-wider border border-emerald-100">{f}</span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 font-black text-sm text-natural-terracotta">{b.rate}</td>
                      <td className="px-10 py-8 font-semibold text-xs text-natural-muted">{b.processingTime || 'N/A'}</td>
                      <td className="px-10 py-8 font-mono text-xs text-natural-muted">
                        <div className="space-y-1">
                          <div>Match score: <strong className="text-natural-sage">{b.score}</strong></div>
                          <div>Customer score: ★{b.rating}</div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right space-x-2">
                        <button 
                          onClick={() => handleEditBankClick(b)}
                          className="px-4 py-2 border border-natural-border hover:border-natural-sage rounded-xl text-[9px] font-black uppercase tracking-widest text-natural-sage cursor-pointer transition-all"
                        >
                          Modify
                        </button>
                        <button 
                          onClick={() => handleDeleteBank(b.id || b.name)}
                          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {banks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-10 py-12 text-center text-xs font-semibold text-natural-muted italic">
                        No custom bank feeds found. Default static lenders are currently being used in calculators.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAlgorithm = () => {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div>
          <h3 className="text-xl font-bold text-natural-sage flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs">🛠️</span>
            Algorithmic Scoring & Credit Parameters
          </h3>
          <p className="text-xs text-natural-muted font-medium mt-1">Fine-tune the scoring multipliers, CIBIL penalties, and credit rules used across calculations in real-time.</p>
        </div>

        <form onSubmit={handleSaveParams} className="bg-white p-8 md:p-12 rounded-[2rem] border border-natural-border shadow-2xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-natural-muted">CIBIL Threshold Score</label>
              <input
                type="number"
                value={localParams.cibilThreshold}
                onChange={e => handleParamChange('cibilThreshold', Number(e.target.value))}
                min="300"
                max="900"
                className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-bold text-indigo-950"
                required
              />
              <p className="text-[9px] font-medium text-natural-muted/70">Profiles below this threshold trigger scoring deductions.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-natural-muted">CIBIL score penalty</label>
              <input
                type="number"
                value={localParams.cibilPenalty}
                onChange={e => handleParamChange('cibilPenalty', Number(e.target.value))}
                className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-bold text-indigo-950"
                required
              />
              <p className="text-[9px] font-medium text-natural-muted/70">Sub-threshold penalty subtracted from total match score.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-natural-muted">Max Age + Tenure Limit (Yrs)</label>
              <input
                type="number"
                value={localParams.maxAgeLimit}
                onChange={e => handleParamChange('maxAgeLimit', Number(e.target.value))}
                className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-bold text-indigo-950"
                required
              />
              <p className="text-[9px] font-medium text-natural-muted/70">Penalise if current Age + desired Loan Tenure exceeds this.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-natural-muted">Age Penalty coefficient</label>
              <input
                type="number"
                value={localParams.agePenalty}
                onChange={e => handleParamChange('agePenalty', Number(e.target.value))}
                className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-bold text-indigo-950"
                required
              />
              <p className="text-[9px] font-medium text-natural-muted/70">Penalty factor per single year exceeding max age.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-natural-muted">Max LTV Ratio Threshold %</label>
              <input
                type="number"
                value={localParams.maxLtvRatio}
                onChange={e => handleParamChange('maxLtvRatio', Number(e.target.value))}
                min="0"
                max="100"
                className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-bold text-indigo-950"
                required
              />
              <p className="text-[9px] font-medium text-natural-muted/70">Deduct matching score for high Loan-to-Value ratios.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-natural-muted">Max FOIR Ratio % (Debt-to-Income)</label>
              <input
                type="number"
                value={localParams.maxFoirRatio}
                onChange={e => handleParamChange('maxFoirRatio', Number(e.target.value))}
                min="0"
                max="100"
                className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-bold text-indigo-950"
                required
              />
              <p className="text-[9px] font-medium text-natural-muted/70">Threshold limit of combined income usable for EMIs.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-natural-muted">Co-borrower Income Multiplier</label>
              <input
                type="number"
                step="0.01"
                value={localParams.coBorrowerMultiplier}
                onChange={e => handleParamChange('coBorrowerMultiplier', Number(e.target.value))}
                className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-bold text-indigo-950"
                required
              />
              <p className="text-[9px] font-medium text-natural-muted/70">Discount or boost combined household co-borrower income.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-natural-muted">Salary Account Bonus Score</label>
              <input
                type="number"
                value={localParams.salaryMatchBonus}
                onChange={e => handleParamChange('salaryMatchBonus', Number(e.target.value))}
                className="w-full px-5 py-3 rounded-xl border border-natural-border hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-bold text-indigo-950"
                required
              />
              <p className="text-[9px] font-medium text-natural-muted/70">Bonus match score if applicant has an active account at named lender.</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-natural-border/50 pt-6">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-6 py-3 border border-natural-border text-natural-muted text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-natural-bg/50 transition-all"
            >
              Reset to Standard Defaults
            </button>
            <button
              type="submit"
              disabled={isSavingParams}
              className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg tracking-wider transition-all flex items-center gap-2"
            >
              {isSavingParams ? <span className="animate-spin text-sm">⏳</span> : 'Save Parameters & Apply Rules'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black text-natural-sage tracking-tighter italic">Admin Control Center.</h2>
          <p className="text-xs md:text-sm text-natural-muted font-medium">Manage platform users, dynamic role modifications, lender datasets, and live integrations.</p>
        </div>
        <div className="flex bg-natural-bg p-1.5 rounded-2xl gap-1 border border-natural-border/30 w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setView('users')}
            className={cn(
              "flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              view === 'users' ? "bg-white text-natural-sage shadow-md" : "text-natural-muted hover:text-natural-sage"
            )}
          >
            User Management
          </button>
          <button 
            onClick={() => setView('loans')}
            className={cn(
              "flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              view === 'loans' ? "bg-white text-natural-terracotta shadow-md" : "text-natural-muted hover:text-natural-sage"
            )}
          >
            Loan Oversight
          </button>
          <button 
            onClick={() => setView('banks')}
            className={cn(
              "flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              view === 'banks' ? "bg-white text-emerald-800 shadow-md" : "text-natural-muted hover:text-natural-sage"
            )}
          >
            Lender Offers Feed
          </button>
          <button 
            onClick={() => setView('algorithm')}
            className={cn(
              "flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              view === 'algorithm' ? "bg-white text-indigo-700 shadow-md animate-pulse" : "text-natural-muted hover:text-natural-sage"
            )}
          >
            Algorithm & Rules
          </button>
        </div>
      </div>

      {/* Google Sheets Synchronization Control Panel */}
      <div className="bg-gradient-to-br from-[#10B981]/5 to-emerald-600/5 p-8 rounded-[3rem] border border-emerald-500/15 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in duration-300">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner border border-emerald-100">
            <FileSpreadsheet className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-lg text-emerald-800 italic">Google Sheets Automated Log</h4>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest",
                isSheetsConnected ? "bg-emerald-100 text-emerald-700 font-black animate-pulse" : "bg-amber-100 text-amber-700"
              )}>
                {isSheetsConnected ? 'Connected & Logging ACTIVE' : 'Pending Authorization'}
              </span>
            </div>
            <p className="text-xs text-emerald-700/80 max-w-xl leading-relaxed">
              When authenticated, all workflow mortgage applications are automatically appended directly into a Google Sheet spreadsheet named 
              <strong className="font-extrabold text-emerald-950"> ParrotMoney Home Loan Leads </strong> in your connected Google Drive storage.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-center md:items-end gap-2">
          {isSheetsConnected ? (
            <div className="text-right space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#10B981] flex items-center justify-end gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" /> Connection Logged
              </div>
              <p className="text-[9px] text-natural-muted font-bold">Encrypted in-memory accessToken loaded</p>
            </div>
          ) : (
            <button 
              onClick={onConnectSheets}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer border-none"
            >
              <FileSpreadsheet className="w-4 h-4" /> Sync Google Sheets
            </button>
          )}
          {sheetsError && (
            <p className="text-[9px] font-bold text-natural-terracotta">{sheetsError}</p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'users' ? renderUsers() : view === 'loans' ? renderLoans() : view === 'banks' ? renderBanks() : renderAlgorithm()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AdminLoginShield({ onVerify }: { onVerify: (pin: string) => boolean }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onVerify(pin)) {
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto p-8 text-center bg-white border border-natural-border rounded-[3rem] shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom duration-300 my-12">
      <div className="w-20 h-20 bg-natural-sage/10 text-natural-sage rounded-full flex items-center justify-center relative shadow-inner">
        <Lock className="w-10 h-10 animate-bounce" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-natural-sage tracking-tighter italic">Administrative Portal</h3>
        <p className="text-xs text-natural-muted font-medium">This section is classified. Please authenticate with the secure administrative passcode.</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-1">
          <input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false); }}
            placeholder="Enter Admin Pin (try 'admin')"
            className={cn(
              "w-full px-5 py-3 rounded-xl border text-center font-bold tracking-widest text-sm focus:outline-none transition-all",
              error 
                ? "border-red-500 bg-red-50 text-red-700 focus:ring-1 focus:ring-red-500" 
                : "border-natural-border hover:border-natural-sage focus:ring-1 focus:ring-natural-sage"
            )}
            required
            autoFocus
          />
          {error && <p className="text-[10px] font-black uppercase text-red-500 tracking-wider animate-shake">Incorrect Passcode. Access Denied.</p>}
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-natural-sage text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-natural-sage/90 shadow-lg transition-all"
        >
          Verify Credentials
        </button>
      </form>
      <div className="pt-2 border-t border-natural-border/50 w-full">
        <p className="text-[9px] font-black uppercase text-natural-muted tracking-widest">Sandbox / testing passcode: <span className="text-natural-terracotta font-semibold">admin</span></p>
      </div>
    </div>
  );
}

function MobileNav({ activeTab, setActiveTab, role, isExistingUser }: { activeTab: string, setActiveTab: (t: string) => void, role?: UserRole, isExistingUser?: boolean }) {
  const menuItems = [
    ...(isExistingUser ? [{ id: 'dashboard', icon: LayoutDashboard }] : []),
    { id: 'loans', icon: FileText },
    { id: 'calculator', icon: Calculator },
    { id: 'recommendations', icon: Sparkles },
    { id: 'calendar', icon: Calendar },
    { id: 'workspace', icon: Database },
    { id: 'about', icon: Info },
  ];

  // Always include Admin Portal to keep it easily accessible for testing/previewing
  menuItems.push({ id: 'admin', icon: ShieldCheck });

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-natural-border px-6 flex items-center justify-between z-50 md:hidden pb-safe">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            "p-4 rounded-2xl transition-all",
            activeTab === item.id ? "bg-natural-terracotta/10 text-natural-terracotta" : "text-natural-muted"
          )}
        >
          <item.icon className="w-6 h-6" />
        </button>
      ))}
    </nav>
  );
}

const getPropertyTypesByCategory = (category: string) => {
  switch (category) {
    case 'Commercial':
      return [
        { id: 'Retail Shop', icon: Store },
        { id: 'Office Space', icon: Building },
        { id: 'Hospital', icon: Hospital },
        { id: 'Showroom', icon: Warehouse },
        { id: 'Restaurant', icon: Utensils },
        { id: 'Workshop', icon: Hammer }
      ];
    case 'Industrial':
      return [
        { id: 'Factory', icon: Factory },
        { id: 'Godown', icon: HardDrive },
        { id: 'Warehouse', icon: Warehouse },
        { id: 'Cold Storage', icon: Snowflake },
        { id: 'Manufacturing Unit', icon: Settings },
        { id: 'R & D Center', icon: Database }
      ];
    default:
      return [
        { id: 'Plot', icon: Square },
        { id: 'Apartment', icon: Layers },
        { id: 'Home', icon: House },
        { id: 'Villa', icon: Building2 },
        { id: 'Plot+Const', icon: Hammer },
        { id: 'Other', icon: CircleEllipsis }
      ];
  }
};

const getStepIcon = (step: number) => {
  switch (step) {
    case 1: return IndianRupee;
    case 2: return House;
    case 3: return Briefcase;
    case 4: return Users2;
    case 5: return Building;
    case 6: return Activity;
    case 7: return ShieldCheck;
    case 8: return User;
    default: return null;
  }
};

function AuthenticatedApp({ onBackToLanding, initialTab }: { onBackToLanding?: () => void, initialTab?: 'loans' | 'dashboard' | 'calculator' | 'recommendations' | 'admin' | 'about' | 'settings' | 'calendar' | 'workspace' }) {
  const pendingCategory = localStorage.getItem('pendingLoanCategory');
  const [activeTab, setActiveTabInternal] = useState<'loans' | 'dashboard' | 'calculator' | 'recommendations' | 'admin' | 'about' | 'settings' | 'calendar' | 'workspace'>(initialTab || 'loans');
  const setActiveTab = (tab: any) => setActiveTabInternal(tab);
  const [selectedCompareBanks, setSelectedCompareBanks] = useState<string[]>([]);
  const [offersSortBy, setOffersSortBy] = useState<OfferSortOption>('highest_match');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<LenderCategoryGroup>('All');
  const [lenderSearchQuery, setLenderSearchQuery] = useState<string>('');
  const [policyModalLender, setPolicyModalLender] = useState<EnrichedLenderOffer | null>(null);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [showAllStep9Offers, setShowAllStep9Offers] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pendingNotice, setPendingNotice] = useState<string | null>(pendingCategory);
  const [loanStep, setLoanStep] = useState(1);
  const [isDetectingCity, setIsDetectingCity] = useState(false);
  
  const [successLoginInput, setSuccessLoginInput] = useState('');
  const [successLoginError, setSuccessLoginError] = useState('');
  const [successLoginLoading, setSuccessLoginLoading] = useState(false);

  const detectCity = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingCity(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        // Using a free reverse geocoding API
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await response.json();
        const city = data.city || data.locality || data.principalSubdivision;
        if (city) {
          updateForm('city', city);
        }
      } catch (error) {
        console.error("Error detecting city:", error);
      } finally {
        setIsDetectingCity(false);
      }
    }, (error) => {
      console.error("Geolocation error:", error);
      setIsDetectingCity(false);
    });
  };
  const [loansViewMode, setLoansViewMode] = useState<'list' | 'apply'>('apply');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<LoanAssessmentResult | null>(null);

  const [overdraftSurplus, setOverdraftSurplus] = useState<number>(500000);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [hasActiveLoansSelected, setHasActiveLoansSelected] = useState<boolean | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoansLoading, setIsLoansLoading] = useState(true);
  const [loansError, setLoansError] = useState<string | null>(null);
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [isAllLoansLoading, setIsAllLoansLoading] = useState(true);
  const [allLoansError, setAllLoansError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isAllUsersLoading, setIsAllUsersLoading] = useState(true);
  const [allUsersError, setAllUsersError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [banksList, setBanksList] = useState<any[]>([]);
  const [isBanksLoading, setIsBanksLoading] = useState(true);
  const [sheetAccessToken, setSheetAccessToken] = useState<string | null>(null);
  const [isSheetsConnected, setIsSheetsConnected] = useState(false);
  const [googleSheetsError, setGoogleSheetsError] = useState<string | null>(null);
  const [algorithmParams, setAlgorithmParams] = useState({
    cibilThreshold: 700,
    cibilPenalty: 20,
    maxAgeLimit: 65,
    agePenalty: 4,
    maxLtvRatio: 90,
    maxFoirRatio: 50,
    coBorrowerMultiplier: 1.45,
    salaryMatchBonus: 15
  });
  const { profile, user, continueAsGuest } = useAuth();

  // Retrieve sheets token and algorithm params
  React.useEffect(() => {
    const cachedToken = localStorage.getItem('parrot_sheets_access_token');
    if (cachedToken) {
      setSheetAccessToken(cachedToken);
      setIsSheetsConnected(true);
    }

    const cachedParams = localStorage.getItem('parrot_algorithm_params');
    if (cachedParams) {
      try {
        setAlgorithmParams(JSON.parse(cachedParams));
      } catch (e) {
        console.error("Failed parsing cached algorithm params:", e);
      }
    }

    let unsubscribe = () => {};
    import('firebase/firestore').then(({ doc, onSnapshot }) => {
      unsubscribe = onSnapshot(doc(db, 'config', 'algorithm'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const cleanData = {
            cibilThreshold: Number(data.cibilThreshold) || 700,
            cibilPenalty: Number(data.cibilPenalty) || 20,
            maxAgeLimit: Number(data.maxAgeLimit) || 65,
            agePenalty: Number(data.agePenalty) || 4,
            maxLtvRatio: Number(data.maxLtvRatio) || 90,
            maxFoirRatio: Number(data.maxFoirRatio) || 50,
            coBorrowerMultiplier: Number(data.coBorrowerMultiplier) || 1.45,
            salaryMatchBonus: Number(data.salaryMatchBonus) || 15
          };
          setAlgorithmParams(cleanData);
          localStorage.setItem('parrot_algorithm_params', JSON.stringify(cleanData));
        }
      }, (err) => {
        console.warn("Firestore subscription to algorithm config failed (falling back to localStorage):", err);
      });
    }).catch(err => {
      console.warn("Could not import config snapshot:", err);
    });

    return () => unsubscribe();
  }, []);
  
  // Handle pending category from landing (handled inside the deep link effect below)
  React.useEffect(() => {
    // Left empty to prevent race condition with the deep linking effect below
  }, [user, pendingCategory]);

  // Fetch user loans
  React.useEffect(() => {
    const activeUserId = user ? user.uid : localStorage.getItem('parrot_guest_user_id');
    if (!activeUserId) {
      setIsLoansLoading(false);
      setLoans([]);
      return;
    }
    setIsLoansLoading(true);
    setLoansError(null);
    const q = query(
      collection(db, 'loans'),
      where('userId', '==', activeUserId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loanData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoans(loanData);
      setIsLoansLoading(false);
      setLoansError(null);
    }, (error) => {
      console.warn("Firestore error listing user loans (gracefully handled):", error);
      setIsLoansLoading(false);
      setLoansError(error instanceof Error ? error.message : String(error));
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch all loans if admin/staff
  React.useEffect(() => {
    if (!user || (profile?.role !== 'admin' && profile?.role !== 'staff')) {
      setIsAllLoansLoading(false);
      return;
    }
    setIsAllLoansLoading(true);
    setAllLoansError(null);
    const q = query(
      collection(db, 'loans'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loanData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllLoans(loanData);
      setIsAllLoansLoading(false);
      setAllLoansError(null);
    }, (error) => {
      console.warn("Firestore error listing all loans (gracefully handled):", error);
      setIsAllLoansLoading(false);
      setAllLoansError(error instanceof Error ? error.message : String(error));
    });
    return () => unsubscribe();
  }, [user, profile]);

  // Fetch all users if admin
  React.useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      setIsAllUsersLoading(false);
      return;
    }
    setIsAllUsersLoading(true);
    setAllUsersError(null);
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsAllUsersLoading(false);
      setAllUsersError(null);
    }, (error) => {
      console.warn("Firestore error listing all users (gracefully handled):", error);
      setIsAllUsersLoading(false);
      setAllUsersError(error instanceof Error ? error.message : String(error));
    });
    return () => unsubscribe();
  }, [user, profile]);

  // Fetch ratings
  React.useEffect(() => {
    const q = query(collection(db, 'lenderRatings'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRatings(snapshot.docs.map(doc => doc.data()));
    }, () => {
      // Gracefully ignore ratings permission errors to prevent application-wide crash
      console.warn("Lacking read access to lender ratings (ignored)");
    });
    return () => unsubscribe();
  }, []);

  // Fetch banks with list subscriber and auto-seeder fallbacks
  React.useEffect(() => {
    const q = query(collection(db, 'banks'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanksList(data);
      setIsBanksLoading(false);

      if (snapshot.empty) {
        console.log("Seeding default lender offers data feed...");
        try {
          const { doc: fDoc, setDoc } = await import('firebase/firestore');
          const defaults = [
            { id: 'sbi', name: 'SBI', rate: '8.40%', features: ['Lowest Rates', 'No Hidden Costs', 'Govt Trust'], processingTime: '15-20 Days', rating: 4.8, score: 95 },
            { id: 'hdfc_bank', name: 'HDFC Bank', rate: '8.45%', features: ['Fast Processing', 'Digital Journey', 'Max Tenure'], processingTime: '7-10 Days', rating: 4.7, score: 92 },
            { id: 'icici_bank', name: 'ICICI Bank', rate: '8.50%', features: ['Pre-approved Offers', 'Easy Top-up', 'Instant App'], processingTime: '5-8 Days', rating: 4.6, score: 88 },
            { id: 'axis_bank', name: 'Axis Bank', rate: '8.55%', features: ['Flexible Tenure', 'Balance Transfer', 'Gift Schemes'], processingTime: '10-12 Days', rating: 4.5, score: 82 },
            { id: 'lic_housing', name: 'LIC Housing', rate: '8.60%', features: ['Govt Trust', 'Long Tenure', 'Minimal Docs'], processingTime: '18-25 Days', rating: 4.3, score: 78 }
          ];
          for (const bank of defaults) {
            await setDoc(fDoc(db, 'banks', bank.id), {
              name: bank.name,
              rate: bank.rate,
              features: bank.features,
              processingTime: bank.processingTime,
              rating: bank.rating,
              score: bank.score
            });
          }
        } catch (seedErr) {
          console.error("Failed to seed default banks:", seedErr);
        }
      }
    }, (error) => {
      console.warn("Firestore error listing banks:", error);
      setIsBanksLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Detailed Loan Data State
  const [formData, setFormData] = useState({
    purpose: (pendingCategory || '') as any,
    intent: 'immediately', // immediately, within_a_week, next_couple_months, just_enquiring
    propertyValue: 0,
    loanAmount: 0,
    city: '',
    propertyCategory: 'Residential', // Residential, Commercial, Industrial, Agricultural, Khasra
    propertyType: 'Apartment', // Plot, Apartment, Independent Home, Villa, Plot + Const, Other
    authority: 'Development Authority', // Development Authority, Municipal, Builder, Unauthorised, Dont Know
    occupation: '' as 'Salaried' | 'Self-Employed' | 'Business' | 'Other',
    monthlySalary: 0,
    tenureInOrg: '',
    businessType: 'Sole Proprietor', 
    businessCategory: 'Trading',
    monthlyRevenue: 0,
    businessYears: 0,
    businessName: '',
    businessLocation: '',
    hasCoBorrower: 'No',
    coBorrowerRelation: 'Spouse',
    coBorrowerMonthlyIncome: 0,
    age: 0,
    householdIncome: 0,
    tenure: 0,
    bankAccount: '',
    activeLoans: [{ id: '1', type: 'Personal Loan', amount: 0, bankName: '' }] as any[],
    cibilScore: 730,
    cibilStatus: 'No Issue', // Outstanding & Defaults, No Issue, Not Sure, Prefer not to say
    gender: 'Male' as 'Male' | 'Female',
    fullName: profile?.name || '',
    email: user?.email || '',
    mobileNumber: '',
    selectedBank: null as any
  });

  // Real-time deterministic financial assessment derived directly from current formData
  const derivedAssessment = useMemo<LoanAssessmentResult>(() => {
    const reqLakhs = Math.max(5, Math.round((formData.loanAmount || 3000000) / 100000));
    const propLakhs = Math.max(reqLakhs, Math.round((formData.propertyValue || 5000000) / 100000));
    const monthlyInflow = (formData.occupation === 'Business' || formData.occupation === 'Self-Employed')
      ? (formData.monthlyRevenue || 100000)
      : (formData.monthlySalary || (formData.householdIncome ? Math.round(formData.householdIncome / 2) : 60000));
    
    // RBI Statutory LTV Cap
    const ltvCap = propLakhs <= 30 ? 0.90 : propLakhs <= 75 ? 0.80 : 0.75;
    const maxByProperty = Math.round(propLakhs * ltvCap);
    
    // FOIR capacity
    const foirPercent = monthlyInflow < 50000 ? 0.50 : monthlyInflow <= 100000 ? 0.55 : 0.65;
    const existingEmiSum = (formData.activeLoans || []).reduce((acc: number, curr: any) => acc + (Number(curr.emi) || 0), 0);
    const maxAllowableEmi = Math.max(5000, (monthlyInflow * foirPercent) - existingEmiSum);
    
    const currentTenure = Math.min(30, Math.max(5, formData.tenure || 20));
    const r = 8.50 / 12 / 100;
    const n = currentTenure * 12;
    const maxByIncome = Math.round((maxAllowableEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) / 100000);
    
    const maxEligible = Math.min(maxByProperty, Math.max(10, maxByIncome));
    
    // Points / Score calculation
    const cibil = formData.cibilScore || 750;
    const cibilPoints = cibil >= 780 ? 95 : cibil >= 750 ? 90 : cibil >= 700 ? 78 : cibil >= 650 ? 60 : 45;
    const incomePoints = monthlyInflow >= 150000 ? 95 : monthlyInflow >= 80000 ? 90 : monthlyInflow >= 45000 ? 82 : 68;
    const agePoints = (formData.age || 30) <= 38 ? 95 : (formData.age || 30) <= 48 ? 88 : (formData.age || 30) <= 55 ? 78 : 65;
    const propPoints = reqLakhs <= maxByProperty ? 92 : 72;
    const workPoints = (Number(formData.tenureInOrg) || Number(formData.businessYears) || 3) >= 3 ? 90 : 80;
    
    const avgScore = Math.round((cibilPoints * 0.35) + (incomePoints * 0.25) + (agePoints * 0.15) + (propPoints * 0.15) + (workPoints * 0.10));
    const status: 'High' | 'Medium' | 'Low' = avgScore >= 75 ? 'High' : avgScore >= 55 ? 'Medium' : 'Low';
    
    const getCatStatus = (pts: number): 'Excellent' | 'Good' | 'Average' | 'Poor' => 
      pts >= 90 ? 'Excellent' : pts >= 78 ? 'Good' : pts >= 60 ? 'Average' : 'Poor';

    return {
      score: avgScore,
      confidence: 0.95,
      status,
      maxEligibleAmount: maxEligible,
      categories: {
        income: { status: getCatStatus(incomePoints), message: `Score: ${incomePoints}/100` },
        age: { status: getCatStatus(agePoints), message: `Score: ${agePoints}/100` },
        credit: { status: getCatStatus(cibilPoints), message: `Score: ${cibilPoints}/100` },
        property: { status: getCatStatus(propPoints), message: `Score: ${propPoints}/100` },
        continuity: { status: getCatStatus(workPoints), message: `Score: ${workPoints}/100` }
      },
      recommendations: [
        cibil < 750 ? "Ensure timely credit card payments to elevate CIBIL score into prime 750+ tier" : "Your strong CIBIL score qualifies you for prime institutional interest concessions",
        "Add a co-applicant to unlock up to 35% higher debt FOIR capacity",
        "Ensure all salary slips / ITR filings and 6-month bank statements are readily validated"
      ],
      reasoning: `Calculated with an allowable FOIR limit of ${Math.round(foirPercent * 100)}% and RBI statutory property LTV ceiling of ${Math.round(ltvCap * 100)}% based on ₹${monthlyInflow.toLocaleString('en-IN')}/mo cashflow.`
    };
  }, [formData]);

  const activeAssessment: LoanAssessmentResult = useMemo(() => {
    if (!aiAssessment) return derivedAssessment;
    const normalizedMax = aiAssessment.maxEligibleAmount > 10000 
      ? Math.round(aiAssessment.maxEligibleAmount / 100000) 
      : aiAssessment.maxEligibleAmount;
    return {
      ...aiAssessment,
      maxEligibleAmount: normalizedMax || derivedAssessment.maxEligibleAmount,
    };
  }, [aiAssessment, derivedAssessment]);



  const overdraftCalculated = React.useMemo(() => {
    const loanAmount = formData?.loanAmount || 3000000;
    const currentInterestRate = 8.5; // typical active average rate
    const tenureYears = formData?.tenure || 20;
    
    // Annual interest rate fraction
    const r = (currentInterestRate / 100) / 12;
    const n = tenureYears * 12;
    
    // Base EMI
    const baseMonthlyEMI = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
    const baseInterestOnly = baseMonthlyEMI > 0 ? (baseMonthlyEMI * n) - loanAmount : 0;

    const parked = Math.min(overdraftSurplus, loanAmount * 0.9);
    
    // Compounding interest reduction
    const estimatedSavings = parked * (currentInterestRate / 100) * tenureYears * 1.35;
    const adjustedSavings = Math.min(estimatedSavings, baseInterestOnly * 0.82);

    const savedMonthsCount = Math.min(n - 12, Math.max(0, Math.round((parked / loanAmount) * n * 1.15)));
    const shavedYears = Math.floor(savedMonthsCount / 12);
    const shavedMonths = savedMonthsCount % 12;

    return {
      adjustedSavings,
      shavedYears,
      shavedMonths,
      formattedSavings: formatCurrency(Math.round(adjustedSavings))
    };
  }, [formData?.loanAmount, formData?.tenure, overdraftSurplus]);

  const isExistingUser = (loans && loans.length > 0) || 
                         (profile?.email && !profile.email.includes('@parrotmoney.com')) ||
                         localStorage.getItem('parrot_is_existing_user') === 'true';

  const [initiallyRouted, setInitiallyRouted] = useState(false);

  // Handle deep linking and initial layout routing dynamically based on whether they are guest or existing customers
  useEffect(() => {
    if (!user || isLoansLoading) return;
    if (initiallyRouted) return;

    const pendingCat = localStorage.getItem('pendingLoanCategory') || pendingCategory;
    
    // Check user profile credentials / history to determine if they are guest or existing
    const isExisting = (loans && loans.length > 0) || 
                       (profile?.email && !profile.email.includes('@parrotmoney.com')) ||
                       localStorage.getItem('parrot_is_existing_user') === 'true';

    if (pendingCat) {
      // Direct immediately to questionnaire workflow
      setLoansViewMode('apply');
      setActiveTab('loans');
      setLoanStep(1);
      setFormData(prev => ({ ...prev, purpose: pendingCat as any }));
      setPendingNotice(null);
    } else if (isExisting) {
      // Existing customer: Direct automatically to dashboard page layout
      setActiveTab('dashboard');
      setLoansViewMode('list');
    } else {
      // Guest customer: Start application workflow directly and auto-set category from landing
      setLoansViewMode('apply');
      setActiveTab('loans');
      setLoanStep(1);
    }

    if (loans && loans.length > 0) {
      localStorage.setItem('parrot_is_existing_user', 'true');
    }

    localStorage.removeItem('pendingLoanCategory');
    setInitiallyRouted(true);
  }, [user, isLoansLoading, loans, profile, initiallyRouted, pendingCategory]);

  // Ensure non-LAP loans do not retain Industrial property category
  React.useEffect(() => {
    const isLAP = ['Loan Against Property', 'LAP'].includes(formData.purpose);
    if (!isLAP && formData.propertyCategory === 'Industrial') {
      setFormData(prev => ({
        ...prev,
        propertyCategory: 'Residential',
        propertyType: 'Apartment'
      }));
    }
  }, [formData.purpose, formData.propertyCategory]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showRatingId, setShowRatingId] = useState<string | null>(null);

  // Handle document upload from the child component
  React.useEffect(() => {
    const handler = async (e: any) => {
      const { loanId, docId } = e.detail;
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return;
      
      const updatedDocs = [...(loan.documents || []), docId];
      try {
        const { doc: firestoreDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        await updateDoc(firestoreDoc(db, 'loans', loanId), {
          documents: updatedDocs,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `loans/${loanId}`);
      }
    };
    window.addEventListener('loan-upload', handler);
    return () => window.removeEventListener('loan-upload', handler);
  }, [loans]);

  // Check for newly approved loans to show rating modal
  React.useEffect(() => {
    const approvedLoan = loans.find(l => l.status === 'approved' && !l.rated);
    if (approvedLoan) {
      setShowRatingId(approvedLoan.id);
    }
  }, [loans]);

  const handleRatingSubmit = async (rating: number) => {
    if (!showRatingId || !user) return;
    const loan = loans.find(l => l.id === showRatingId);
    if (!loan) return;

    try {
      const { updateDoc, doc: firestoreDoc, setDoc, collection: firestoreCol } = await import('firebase/firestore');
      await setDoc(firestoreDoc(firestoreCol(db, 'lenderRatings')), {
        userId: user.uid,
        loanId: showRatingId,
        lenderName: loan.selectedBank?.name || 'Unknown',
        rating,
        createdAt: serverTimestamp()
      });
      await updateDoc(firestoreDoc(db, 'loans', showRatingId), { 
        rated: true,
        updatedAt: serverTimestamp()
      });
      setShowRatingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'lenderRatings');
    }
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});

  const validate = (field: string, value: any) => {
    switch (field) {
      case 'loanAmount':
        if (formData.propertyValue > 0 && value > formData.propertyValue) return 'Loan amount cannot exceed property value';
        if (value < 100000) return 'Minimum loan amount is ₹1,00,000';
        return null;
      case 'tenure':
        if (!value || value <= 0) return 'Ideal repayment term is required';
        if (value < 5) return 'Minimum repayment term is 5 years';
        if (value > 30) return 'Maximum repayment term is 30 years';
        if (formData.age && (formData.age + value > 65)) return `Age + term cannot exceed 65 years (maximum available: ${65 - formData.age} years)`;
        return null;
      case 'age':
        if (!value || value < 21) return 'Minimum applicant age is 21 years';
        if (value > 65) return 'Maximum applicant age is 65 years';
        if (formData.tenure && (value + formData.tenure > 65)) return `Age (${value}) + tenure (${formData.tenure} yrs) exceeds 65 yrs maturity limit`;
        return null;
      case 'propertyValue':
        if (value < 1000000) return 'Minimum property value should be ₹10,00,000';
        if (formData.loanAmount > value) return 'Property value must be greater than or equal to loan amount';
        return null;
      case 'monthlySalary':
        if (value <= 0) return 'Monthly income must be greater than 0';
        if (value < 15000) return 'Minimum monthly income required is ₹15,000';
        return null;
      case 'monthlyRevenue':
        if (value <= 0) return 'Monthly revenue must be greater than 0';
        if (value < 20000) return 'Minimum monthly revenue required is ₹20,000';
        return null;
      case 'mobileNumber':
        if (value && !/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit mobile number';
        if (!value) return 'Mobile number is required';
        return null;
      case 'fullName':
        if (!value || value.length < 3) return 'Full name is required';
        return null;
      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return null;
      case 'cibilScore':
        if (value < 300 || value > 900) return 'CIBIL score must be between 300 and 900';
        return null;
      case 'occupation':
        if (!value) return 'Please select your work profile (Salaried, Self-Employed, Business, or Other)';
        return null;
      case 'businessYears':
        if (formData.occupation === 'Business' && value < 1) return 'Minimum 1 year in business required';
        return null;
      default:
        return null;
    }
  };

  const handleNextStep = async () => {
    // Basic validation before step transition
    const fieldsToValidate: Record<number, string[]> = {
      1: ['loanAmount', 'tenure'],
      2: ['propertyValue'],
      3: ['occupation'],
      8: ['fullName', 'age', 'email', 'mobileNumber']
    };

    const currentFields = [...(fieldsToValidate[loanStep] || [])];
    
    // Custom logic for occupation based validation at step 3
    if (loanStep === 3) {
      if (formData.occupation === 'Salaried') {
        currentFields.push('monthlySalary');
      } else if (formData.occupation === 'Business' || formData.occupation === 'Self-Employed') {
        currentFields.push('monthlyRevenue');
      } else if (formData.occupation === 'Other') {
        currentFields.push('monthlySalary');
      }
    }

    let hasErrors = false;
    currentFields.forEach(field => {
      const error = validate(field, (formData as any)[field]);
      if (error) {
        setValidationErrors(prev => ({ ...prev, [field]: error }));
        hasErrors = true;
      }
    });

    if (hasErrors) return;

    // Step 6 custom validation for Loan Transfer
    if (loanStep === 6 && ['Loan Transfer', 'Top up Loan'].includes(formData.purpose)) {
      const hasHomeLoan = formData.activeLoans.some((l: any) => 
        (l.type === 'Home Loan' || l.type === 'Loan Transfer') && l.amount > 0
      );
      if (!hasHomeLoan) {
        setValidationErrors(prev => ({ 
          ...prev, 
          activeLoans: "Existing Home Loan details are required for Loan Transfer." 
        }));
        return;
      }
    }

    // If moving to step 9, trigger AI assessment + show analysis portal
    if (loanStep === 8) {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      
      const startTime = Date.now();
      const TOTAL_ANIM_DURATION = 4200; // ~4.2 seconds
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const next = Math.min(95, Math.round((elapsed / TOTAL_ANIM_DURATION) * 100));
        setAnalysisProgress(next);
        if (elapsed >= TOTAL_ANIM_DURATION) {
          clearInterval(interval);
        }
      }, 100);

      setIsAssessing(true);
      
      // Perform AI assessment with a 3.8s timeout race to guarantee quick resolution
      (async () => {
        try {
          const assessmentPromise = performRiskAssessment(formData);
          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3800));
          const result = await Promise.race([assessmentPromise, timeoutPromise]);
          if (result) {
            setAiAssessment(result);
          }
        } catch (err) {
          console.error("Analysis error:", err);
        }
      })();
      
      // Ensure total reviewing screen never exceeds 5 seconds (strictly under 7 seconds max)
      setTimeout(() => {
        clearInterval(interval);
        setAnalysisProgress(100);
        setTimeout(() => {
          setIsAnalyzing(false);
          setIsAssessing(false);
          setLoanStep(prev => prev + 1);
        }, 400);
      }, 4600);
      return;
    }
    setLoanStep(prev => prev + 1);
  };

  const handleConnectGoogleSheets = async () => {
    setGoogleSheetsError(null);
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setSheetAccessToken(credential.accessToken);
        setIsSheetsConnected(true);
        localStorage.setItem('parrot_sheets_access_token', credential.accessToken);
        console.log("Successfully retrieved in-memory token for Google Sheets logging!");
      } else {
        throw new Error("Ensure Google Popups are permitted and scopes are accepted.");
      }
    } catch (err: any) {
      console.error("Sheets connection error:", err);
      setGoogleSheetsError(err.message || String(err));
    }
  };

  const handleSubmit = async (chosenBank?: any) => {
    setIsSubmitting(true);
    try {
      if (!user) {
        await continueAsGuest();
      }
      const uId = auth.currentUser?.uid;
      if (!uId) {
        throw new Error('Unable to establish a secure customer session.');
      }
      const loanData = {
        userId: uId,
        ...formData,
        selectedBank: chosenBank !== undefined ? chosenBank : formData.selectedBank,
        status: 'submitted',
        aiAssessment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      let docId = 'lead_' + Math.random().toString(36).substring(2, 15);
      try {
        const docRef = await addDoc(collection(db, 'loans'), loanData);
        docId = docRef.id;
      } catch (fErr) {
        console.warn("Firestore save failed, proceeding with local fallback:", fErr);
      }
      
      if (sheetAccessToken) {
        try {
          console.log("Initiating Google Sheets lead sync...");
          const finalLoanData = { id: docId, ...loanData };
          await logLoanToGoogleSheets(sheetAccessToken, finalLoanData);
        } catch (sErr) {
          console.error("Google Sheets append failed in background:", sErr);
        }
      }

      localStorage.setItem('parrot_is_existing_user', 'true');
      setLoanStep(10); // Moved to step 10 (final success)
    } catch (error) {
      console.error("Error in handleSubmit, transitioning to success anyway:", error);
      localStorage.setItem('parrot_is_existing_user', 'true');
      setLoanStep(10); // Moved to step 10 (final success)
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validate(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const getBankRecommendations = (overrideSort?: OfferSortOption): EnrichedLenderOffer[] => {
    return compute43LenderRecommendations(
      formData,
      algorithmParams,
      overrideSort || offersSortBy
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        if (!isExistingUser) {
          return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-natural-muted">Loading Application Engine...</p>
            </div>
          );
        }
        return (
          <DashboardView 
            onNewLoan={() => { 
              setActiveTab('loans'); 
              setLoansViewMode('apply');
              setLoanStep(1); 
            }} 
            loans={loans} 
            setActiveTab={setActiveTab}
            setLoansViewMode={setLoansViewMode}
            setLoanStep={setLoanStep}
            setFormData={setFormData}
            pendingNotice={pendingNotice}
            setPendingNotice={setPendingNotice}
          />
        );
      case 'calculator': return (
        <div className="max-w-5xl mx-auto">
          <HomeLoanCalculator 
            onApply={(data) => {
              setFormData(prev => ({
                ...prev,
                propertyValue: data.homePrice,
                loanAmount: data.homePrice - data.downPayment
              }));
              setActiveTab('loans');
              setLoanStep(1);
            }} 
          />
        </div>
      );
      case 'loans': 
        if (loansViewMode === 'list') {
          return (
            <div className="space-y-8 md:space-y-12">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
                  <div className="space-y-2 text-center md:text-left">
                     <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-natural-sage italic">My Home Loans.</h2>
                     <p className="text-sm md:text-xl text-natural-muted font-medium">A simple view of all your loan applications.</p>
                  </div>
                  <button 
                    onClick={() => setLoansViewMode('apply')}
                    className="w-full md:w-auto bg-natural-terracotta text-white px-10 py-5 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-3xl shadow-natural-terracotta/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Apply for Loan <Plus className="w-5 h-5" />
                  </button>
               </div>

               <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-natural-border shadow-2xl overflow-hidden shadow-natural-sage/5 mx-2 md:mx-0">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                      <thead>
                        <tr className="bg-natural-bg/50 border-b border-natural-border">
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-natural-muted/60">ID</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-natural-muted/60">Bank</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-natural-muted/60">Loan Amount</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-natural-muted/60">Status</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-natural-muted/60">Date</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-natural-muted/60">View</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-natural-border/40">
                        {loans.length === 0 ? (
                           <tr>
                              <td colSpan={6} className="px-10 py-32 text-center">
                                 <div className="space-y-4 opacity-30">
                                    <Database className="w-16 h-16 mx-auto" />
                                    <p className="font-black text-xs uppercase tracking-[0.5em]">Network Empty</p>
                                 </div>
                              </td>
                           </tr>
                        ) : (
                          loans.map((loan, idx) => (
                            <tr key={loan.id || idx} className="hover:bg-natural-bg/30 transition-colors group">
                               <td className="px-10 py-8">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 bg-natural-bg rounded-xl flex items-center justify-center font-black text-xs text-natural-sage shadow-inner">
                                        {idx + 1}
                                     </div>
                                     <span className="font-black text-natural-terracotta text-sm italic">#{loan.id?.slice(-8).toUpperCase() || 'PND'}</span>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <div>
                                     <p className="font-black text-natural-sage text-lg tracking-tight">{loan.selectedBank?.name || 'Standard Index'}</p>
                                     <p className="text-[10px] font-black text-natural-muted/60 uppercase mt-0.5 tracking-widest">{loan.propertyType || 'Asset'} — {loan.city}</p>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <div className="tabular-nums">
                                     <p className="font-black text-natural-sage text-xl tracking-tighter">₹{loan.loanAmount?.toLocaleString('en-IN')}</p>
                                     <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest">Active Loan</p>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <div className={cn(
                                    "inline-flex px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                                    loan.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                                  )}>
                                    {loan.status?.replace('_', ' ') || 'Registered'}
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <div className="space-y-1">
                                     <p className="text-xs font-black text-natural-sage">{loan.createdAt?.toDate ? loan.createdAt.toDate().toLocaleDateString('en-GB') : 'Just Now'}</p>
                                     <div className="w-24 h-1 bg-natural-bg rounded-full overflow-hidden">
                                        <div className="h-full bg-natural-sage w-1/3" />
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-8 text-right">
                                  <button className="p-4 bg-natural-bg text-natural-sage rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-natural-sage hover:text-white shadow-inner">
                                     <ArrowRight className="w-5 h-5" />
                                  </button>
                               </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile High-Density Card View */}
                  <div className="block md:hidden p-4 space-y-4 divide-y divide-natural-border/30">
                    {loans.length === 0 ? (
                      <div className="py-16 text-center space-y-3 opacity-40">
                        <Database className="w-12 h-12 mx-auto text-natural-muted" />
                        <p className="font-black text-[11px] uppercase tracking-widest text-natural-muted">Network Empty</p>
                      </div>
                    ) : (
                      loans.map((loan, idx) => (
                        <div key={loan.id || idx} className="pt-4 first:pt-0 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-natural-bg rounded-lg flex items-center justify-center font-black text-[11px] text-natural-sage shadow-inner">
                                {idx + 1}
                              </div>
                              <span className="font-black text-natural-terracotta text-xs italic">#{loan.id?.slice(-8).toUpperCase() || 'PND'}</span>
                            </div>
                            <span className={cn(
                              "inline-flex px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border shadow-sm",
                              loan.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                            )}>
                              {loan.status?.replace('_', ' ') || 'Registered'}
                            </span>
                          </div>

                          <div className="flex items-end justify-between">
                            <div>
                              <h4 className="font-black text-natural-sage text-base leading-tight">{loan.selectedBank?.name || 'Standard Index'}</h4>
                              <p className="text-[10px] text-natural-muted mt-0.5">{loan.propertyType || 'Asset'} • {loan.city}</p>
                              <p className="text-[9px] text-natural-muted/60 uppercase tracking-wider mt-1">
                                {loan.createdAt?.toDate ? loan.createdAt.toDate().toLocaleDateString('en-GB') : 'Just Now'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-natural-sage text-lg tracking-tighter leading-none">₹{loan.loanAmount?.toLocaleString('en-IN')}</p>
                              <span className="text-[8px] text-emerald-600/70 font-black uppercase tracking-widest mt-1 block">Active Loan</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
                  <div className="bg-natural-sage p-6 md:p-10 rounded-[2.5rem] text-white flex items-center justify-center shadow-huge shadow-natural-sage/20 overflow-hidden">
                     <div className="space-y-1 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Total Portfolio</p>
                        <p className="text-2xl md:text-3xl font-black tracking-tighter italic">₹{(loans.reduce((acc, curr) => acc + (curr.loanAmount || 0), 0) / 10000000).toFixed(2)} Cr</p>
                     </div>
                  </div>
                  <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-natural-border flex items-center justify-center overflow-hidden">
                     <div className="space-y-1 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-natural-muted">Active Apps</p>
                        <p className="text-2xl md:text-3xl font-black tracking-tighter text-natural-sage italic">{loans.length}</p>
                     </div>
                  </div>
                  <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-natural-border flex items-center justify-center overflow-hidden">
                     <div className="space-y-1 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-natural-muted">Avg Processing</p>
                        <p className="text-2xl md:text-3xl font-black tracking-tighter text-natural-sage italic">4.2 Days</p>
                     </div>
                  </div>
               </div>
            </div>
          );
        }
        const StepIcon = getStepIcon(loanStep);

        return (
        <div className="w-full space-y-4 md:space-y-6 relative">
          {/* Logo, Progress Bar, and Back Button - All in a single parallel row */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-4 pb-3 border-b border-natural-border/60 w-full max-w-[1600px] mx-auto px-1 sm:px-4 md:px-8">
            <div className="min-w-[44px] sm:min-w-[150px] flex items-center justify-start shrink-0">
              <Logo iconOnly className="sm:hidden scale-90 origin-left" />
              <Logo className="hidden sm:flex scale-110 origin-left" />
            </div>

            <div className="flex-1 flex items-center justify-center text-center gap-1 sm:gap-2 px-1 min-w-0">
              {loanStep > 1 && loanStep < 10 && (
                <button 
                  onClick={() => {
                    setLoanStep(loanStep - 1);
                  }}
                  className="p-1 sm:p-1.5 bg-white border border-natural-border hover:border-[#10B981] text-natural-sage hover:text-[#10B981] rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="Go Back"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
              )}
              <h2 className="text-[10px] sm:text-xs md:text-sm font-black text-natural-sage tracking-widest uppercase whitespace-nowrap">
                {loanStep === 1 && 'Loan Requirements'}
                {loanStep === 2 && 'Property Details'}
                {loanStep === 3 && 'Employment Info'}
                {loanStep === 4 && 'Income & Family'}
                {loanStep === 5 && 'Banking Details'}
                {loanStep === 6 && 'Other Loans & EMIs'}
                {loanStep === 7 && 'Approximate CIBIL Score'}
                {loanStep === 8 && 'Profile'}
                {loanStep === 9 && 'Top Loan Offers'}
                {loanStep === 10 && 'Success!'}
              </h2>
            </div>

            <div className="min-w-[44px] sm:min-w-[150px] flex items-center justify-end shrink-0">
              {onBackToLanding && (
                <button 
                  onClick={onBackToLanding}
                  className="p-1.5 sm:p-2.5 bg-white border border-natural-border hover:border-[#10B981] text-natural-sage hover:text-[#10B981] hover:scale-105 active:scale-95 transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm shrink-0"
                  title="Back to Home"
                >
                  <Home className="w-3 sm:w-3.5 h-3 sm:h-3.5" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Back to Home</span>
                </button>
              )}
            </div>
          </div>

          <div className={cn(
            loanStep < 9 ? "max-w-lg" : "max-w-2xl",
            "w-full mx-auto space-y-4 md:space-y-5 relative px-1 sm:px-4 md:px-0"
          )}>
            {/* Transparent decorative background watermark outside the card box */}
            {loanStep < 9 && StepIcon && (
              <div className="absolute -inset-x-8 md:-inset-x-24 inset-y-0 pointer-events-none select-none -z-10 overflow-visible">
                <div className="absolute left-0 top-1/4 -translate-x-12 md:-translate-x-32 opacity-[0.035] md:opacity-[0.05] transition-all duration-700">
                  <StepIcon className="w-48 md:w-80 h-48 md:h-80 text-natural-terracotta" strokeWidth={0.6} />
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/4 translate-x-12 md:translate-x-32 opacity-[0.035] md:opacity-[0.05] transition-all duration-700">
                  <StepIcon className="w-48 md:w-80 h-48 md:h-80 text-natural-sage" strokeWidth={0.6} />
                </div>
              </div>
            )}
            
            <div className="text-center space-y-1.5">
              <p className={cn(
                loanStep < 9 ? "max-w-md" : "max-w-xl",
                "text-natural-muted font-medium mx-auto leading-relaxed text-xs"
              )}>
                {loanStep === 1 && "Welcome to ParrotMoney! Let's start with some basic details."}
                {loanStep === 2 && "Tell us about the property you're looking at."}
                {loanStep === 3 && "Help us understand your work profile."}
                {loanStep === 4 && "Add a family member to increase eligibility."}
                {loanStep === 5 && "Please specify the bank where you hold your account."}
                {loanStep === 6 && "Do you currently have any other active loans running ?"}
                {loanStep === 7 && "Thanks for your patience, we would need some more information to proceed further with your enquiry"}
                {loanStep === 8 && "Almost there! Just a few more details to create your profile."}
                {loanStep === 9 && "We've found these custom offers for your profile."}
                {loanStep === 10 && "Your basic details have been submitted successfully."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {loanStep === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] border border-natural-border shadow-huge space-y-3.5 md:space-y-5 overflow-hidden relative"
                >
                {/* 1. Requested Loan Amount */}
                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center justify-between w-full">
                    <span className="flex items-center gap-1.5">
                      <span>1. What is your estimated loan requirement?</span>
                    </span>
                    <CustomTooltip 
                      title="Estimated Loan Requirement" 
                      message="Enter your target loan financing amount. Under RBI regulatory LTV (Loan-to-Value) caps, banks can finance up to 75%-90% of property cost depending on the ticket size." 
                    />
                  </label>
                  <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-3.5 md:left-4 flex items-center pointer-events-none">
                      <span className="text-sm md:text-base font-normal text-black">₹</span>
                    </div>
                    <input 
                      type="number" 
                      value={formData.loanAmount || ''}
                      onChange={(e) => updateForm('loanAmount', e.target.value === '' ? 0 : Number(e.target.value))}
                      className={cn(
                        "w-full bg-natural-bg border-none rounded-lg md:rounded-xl pl-8 md:pl-10 pr-4 md:pr-6 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider transition-all outline-none tabular-nums",
                        validationErrors.loanAmount ? "ring-4 ring-red-500/10 text-red-500" : "text-natural-sage focus:ring-4 ring-[#10B981]/10"
                      )}
                      placeholder="Ex: 5000000"
                    />
                    {validationErrors.loanAmount && (
                      <p className="absolute -bottom-6 left-4 md:left-8 text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm border border-red-100 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> {validationErrors.loanAmount}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Urgency Timeline */}
                <div className="space-y-1 pt-2 md:pt-3 border-t border-natural-border/50">
                  <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <span>2. When do you need the loan disbursed?</span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'immediately', label: 'Immediately' },
                      { id: 'within_a_week', label: 'Within a Week' },
                      { id: 'next_couple_months', label: 'In 2-3 Months' },
                      { id: 'just_enquiring', label: 'Just Planning' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => updateForm('intent', t.id)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-md md:rounded-lg text-[8px] md:text-[8.5px] font-black uppercase tracking-widest border-2 transition-all cursor-pointer",
                          formData.intent === t.id 
                            ? "bg-[#10B981] text-white border-[#10B981] shadow-md scale-102" 
                            : "bg-white text-natural-muted border-natural-bg hover:border-[#10B981]/20"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Desired Loan Tenure */}
                <div className="space-y-1 pt-2 md:pt-3 border-t border-natural-border/50">
                  <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center justify-between w-full">
                    <span className="flex items-center gap-1.5">
                      <span>3. Your ideal repayment term?</span>
                    </span>
                    <CustomTooltip 
                      title="Repayment Tenure & FOIR" 
                      message="Repayment duration in years. A longer tenure lowers your monthly EMI outgo (giving you a healthier FOIR ratio) but increases aggregate interest liability over the life of the loan." 
                    />
                  </label>
                  <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-3.5 md:left-4 flex items-center pointer-events-none">
                      <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-natural-sage group-focus-within:text-[#10B981] transition-colors" />
                    </div>
                    <input 
                      type="number" 
                      value={formData.tenure || ''}
                      onChange={(e) => updateForm('tenure', e.target.value === '' ? 0 : Number(e.target.value))}
                      className={cn(
                        "w-full bg-natural-bg border-none rounded-lg md:rounded-xl pl-8 md:pl-10 pr-12 md:pr-6 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        validationErrors.tenure ? "ring-4 ring-red-500/10 text-red-500" : ""
                      )}
                      placeholder="Ex: 20"
                    />
                    <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 font-black text-natural-muted uppercase tracking-widest text-[8px]">Years</span>
                    {validationErrors.tenure && (
                      <p className="absolute -bottom-6 left-4 md:left-8 text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm border border-red-100 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> {validationErrors.tenure}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2.5 md:pt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-natural-border/50">
                  <div className="hidden sm:block space-y-0.5 text-center sm:text-left">
                    <h3 className="font-bold text-sm md:text-base text-[#10B981] italic tracking-tight">Step Complete.</h3>
                    <p className="text-[9px] text-natural-muted font-medium">Moving to property details</p>
                  </div>
                  <button 
                    onClick={handleNextStep}
                    className="w-full sm:w-auto bg-[#10B981] text-white px-5 py-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 hover:scale-[1.05] active:scale-95 hover:bg-[#0e9f6e] transition-all shadow-xl shadow-[#10B981]/20 group"
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {loanStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] border border-natural-border shadow-huge space-y-3.5 md:space-y-5 overflow-hidden relative"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:space-y-1.5">
                    <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] px-1 flex items-center justify-between w-full">
                      <span className="flex items-center gap-1.5">
                        <span>Property Price</span>
                      </span>
                      <CustomTooltip 
                        title="Property Price & LTV Cap" 
                        message="The registered agreement value or market valuation. Banks enforce an RBI-mandated LTV (Loan-to-Value) Cap: up to 90% for loans ≤ ₹30 Lakhs, 80% for loans between ₹30 Lakhs and ₹75 Lakhs, and 75% for loans > ₹75 Lakhs. The remaining fraction is your down payment contribution." 
                      />
                    </label>
                    <div className="relative group w-full">
                      <div className={cn("absolute inset-y-0 left-3.5 md:left-4 flex items-center pointer-events-none transition-all", validationErrors.propertyValue ? "text-red-500" : "group-focus-within:text-[#10B981]")}>
                        <IndianRupee className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </div>
                      <input 
                        type="number" 
                        value={formData.propertyValue || ''}
                        onChange={(e) => updateForm('propertyValue', e.target.value === '' ? 0 : Number(e.target.value))}
                        className={cn(
                          "w-full bg-natural-bg border-none rounded-lg md:rounded-xl pl-8 md:pl-10 pr-4 md:pr-6 py-1.5 md:py-2.5 font-bold text-xs md:text-sm tracking-wider text-natural-sage transition-all outline-none tabular-nums shadow-inner focus:ring-4 ring-[#10B981]/10",
                          validationErrors.propertyValue ? "ring-4 ring-red-500/10 text-red-500" : ""
                        )}
                        placeholder="Ex: 7500000"
                      />
                      {validationErrors.propertyValue && (
                        <p className="mt-2 ml-4 md:ml-6 text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" /> {validationErrors.propertyValue}
                        </p>
                      )}
                    </div>
                    {formData.propertyValue > 0 && formData.loanAmount > 0 && (() => {
                      const ltv = Math.round((formData.loanAmount / formData.propertyValue) * 100);
                      const statutoryCap = formData.loanAmount <= 3000000 ? 90 : formData.loanAmount <= 7500000 ? 80 : 75;
                      const isCompliant = ltv <= statutoryCap;
                      return (
                        <div className={cn(
                          "mt-1.5 p-2 rounded-lg border text-[10px] flex items-center justify-between gap-2",
                          isCompliant ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-900" : "bg-amber-50/70 border-amber-200/80 text-amber-900"
                        )}>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold">LTV Ratio:</span>
                            <span className="font-black text-xs">{ltv}%</span>
                            <span className="text-[9px] text-stone-500">
                              (Cap: {statutoryCap}% • {isCompliant ? 'Compliant' : 'Exceeds Cap'})
                            </span>
                          </div>
                          <CustomTooltip 
                            title="LTV Cap Calculation" 
                            message={`Your requested loan is ${ltv}% of the property cost. The RBI ceiling for this loan tier is ${statutoryCap}%. ${isCompliant ? 'This is within permitted lending ratios.' : 'Lenders will require additional equity or down payment.'}`} 
                          />
                        </div>
                      );
                    })()}
                  </div>
                  <AutocompleteInput 
                    label="Property Location (City)"
                    options={INDIAN_CITIES}
                    value={formData.city}
                    onChange={(val) => updateForm('city', val)}
                    placeholder="Ex: Mumbai"
                    icon={MapPin}
                  />
                </div>

                <div className="space-y-1 pt-2 md:pt-3 border-t border-natural-border/50">
                  <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex flex-wrap items-center gap-1.5 px-1">
                    <span>Property Categorization</span>
                    <CustomTooltip 
                      title="Property Categorization & LTV Cap" 
                      message="Underwriting criteria vary by asset class: Residential ready homes qualify for the lowest repo-linked rates and highest LTV ceilings (80-90%). Commercial offices and bare land plots have tighter LTV limits (typically 60-70%)." 
                    />
                    <span className="h-0.5 w-12 bg-[#10B981]/20 rounded-full" />
                  </label>
                  <div className="grid grid-flow-col auto-cols-fr gap-2 md:gap-3 w-full">
                    {[
                      { id: 'Residential', icon: Home, color: 'text-[#10B981] bg-white border border-[#10B981]/20' },
                      { id: 'Commercial', icon: Building, color: 'text-emerald-600 bg-white border border-emerald-100' },
                      ...(['Loan Against Property', 'LAP'].includes(formData.purpose) 
                        ? [{ id: 'Industrial', icon: Factory, color: 'text-amber-600 bg-white border border-amber-100' }] 
                        : []
                      ),
                      { id: 'Agricultural', icon: Sprout, color: 'text-lime-600 bg-white border border-lime-100' }
                    ].map(cat => (
                      <button 
                        key={cat.id} 
                        type="button"
                        onClick={() => {
                          updateForm('propertyCategory', cat.id);
                          const types = getPropertyTypesByCategory(cat.id);
                          if (types && types.length > 0) {
                            updateForm('propertyType', types[0].id);
                          }
                        }}
                        className={cn(
                          "p-2 md:p-2.5 rounded-lg md:rounded-xl flex flex-col items-center justify-center gap-1 md:gap-1.5 border transition-all relative group shadow-2xs cursor-pointer",
                          formData.propertyCategory === cat.id 
                            ? "bg-white border-2 border-[#10B981] text-[#10B981] shadow-sm -translate-y-0.5" 
                            : "bg-white border-slate-100 text-natural-muted hover:border-[#10B981]/35 hover:bg-slate-50/50"
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center transition-all shadow-xs shrink-0", 
                          formData.propertyCategory === cat.id ? "bg-emerald-50 text-[#10B981] border border-[#10B981]/30" : cat.color
                        )}>
                          <cat.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </div>
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider truncate max-w-full">{cat.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-2 md:pt-3 border-t border-natural-border/50">
                  <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center gap-1.5 px-1">
                    Specific Asset Type <span className="h-0.5 w-12 bg-[#10B981]/20 rounded-full" />
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                    {getPropertyTypesByCategory(formData.propertyCategory).map(type => (
                      <button 
                        key={type.id} 
                        onClick={() => updateForm('propertyType', type.id)}
                        className={cn(
                          "p-1.5 md:p-2.5 rounded-md md:rounded-lg flex flex-col items-center gap-1 md:gap-1.5 border-2 transition-all group relative cursor-pointer",
                          formData.propertyType === type.id 
                            ? "bg-[#10B981] border-[#10B981] text-white shadow-xl shadow-[#10B981]/30 -translate-y-0.5" 
                            : "bg-natural-bg border-transparent text-natural-muted hover:bg-white hover:border-[#10B981]/30 shadow-sm"
                        )}
                      >
                        <type.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4 transition-all", formData.propertyType === type.id ? "scale-110" : "opacity-60")} />
                        <span className="text-[7px] font-black uppercase tracking-tighter">{type.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-natural-border/50">
                  <button onClick={() => setLoanStep(1)} className="w-full sm:w-1/4 bg-natural-bg text-natural-muted py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide hover:bg-natural-panel transition-all cursor-pointer">Back</button>
                  <button onClick={handleNextStep} className="flex-1 bg-[#10B981] text-white py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 shadow-2xl shadow-[#10B981]/20 hover:scale-[1.02] active:scale-95 transition-all hover:bg-[#0e9f6e] cursor-pointer">
                    Next: Work Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {loanStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] border border-natural-border shadow-huge space-y-3.5 md:space-y-5 overflow-hidden relative"
              >
                <div className="space-y-3">
                  <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <span>Your Work Details</span>
                    <span className="text-red-500 font-bold">*</span>
                    <span className="h-0.5 w-12 bg-[#10B981]/20 rounded-full" />
                  </label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
                    {[
                      { id: 'Salaried', icon: User },
                      { id: 'Self-Employed', icon: Briefcase },
                      { id: 'Business', icon: Store },
                      { id: 'Other', icon: Activity }
                    ].map(opt => (
                      <button 
                        key={opt.id} 
                        type="button"
                        onClick={() => updateForm('occupation', opt.id)}
                        className={cn(
                          "p-2.5 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1.5 md:gap-2.5 group shadow-sm cursor-pointer",
                          formData.occupation === opt.id 
                            ? "bg-slate-100 border-[#10B981] text-natural-sage shadow-[4px_4px_10px_0_rgba(0,0,0,0.05),-4px_-4px_10px_0_rgba(255,255,255,0.8)] -translate-y-0.5 md:-translate-y-1" 
                            : validationErrors.occupation
                              ? "border-red-300 bg-red-50/20 text-natural-muted hover:border-red-400"
                              : "border-natural-bg bg-white text-natural-muted hover:border-natural-terracotta/20"
                        )}
                      >
                        <div className={cn("w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center transition-all shrink-0", formData.occupation === opt.id ? "bg-white shadow-inner text-[#10B981]" : "bg-natural-bg")}>
                           <opt.icon className="w-4 h-4 md:w-5.5 md:h-5.5" strokeWidth={1.5} />
                        </div>
                        <div>
                           <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest block">{opt.id}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {validationErrors.occupation && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {validationErrors.occupation}
                    </p>
                  )}
                </div>

                <div className="min-h-0">
                  {formData.occupation === 'Salaried' ? (
                    <div className="space-y-3.5 pt-4 md:pt-5 border-t border-natural-border/50 text-left">
                      <div className="space-y-1">
                        <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center justify-between w-full">
                          <span className="flex items-center gap-1">
                            <span>Monthly take-home Salary</span>
                            <span className="text-red-500 font-bold">*</span>
                          </span>
                          <CustomTooltip 
                            title="Net Salary (FOIR Baseline)" 
                            message="The net credit to your bank account each month after TDS and EPF deductions. This serves as the income baseline used by lenders to calculate your permissible FOIR debt capacity." 
                          />
                        </label>
                        <div className="relative group w-full">
                          <div className={cn("absolute inset-y-0 left-3.5 md:left-4 flex items-center pointer-events-none transition-all", validationErrors.monthlySalary ? "text-red-500" : "text-black")}>
                            <span className="text-sm md:text-base font-bold">₹</span>
                          </div>
                          <input 
                            type="number" 
                            value={formData.monthlySalary || ''} 
                            onChange={(e) => updateForm('monthlySalary', e.target.value === '' ? 0 : Number(e.target.value))} 
                            className={cn(
                              "w-full bg-natural-bg border-none rounded-lg md:rounded-xl pl-8 md:pl-10 pr-4 md:pr-6 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none tabular-nums placeholder:opacity-20",
                              validationErrors.monthlySalary ? "ring-4 ring-red-500/10 text-red-500" : ""
                            )}
                            placeholder="Ex: 150000" 
                          />
                        </div>
                        {validationErrors.monthlySalary && (
                          <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 shrink-0" /> {validationErrors.monthlySalary}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1 pt-2 md:pt-3 border-t border-natural-border/50">
                        <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center justify-between w-full">
                          <span>Current Organization tenure in years</span>
                          <CustomTooltip 
                            title="Employment Stability" 
                            message="Lenders require at least 1-2 years of overall employment history and 6+ months with your current employer to prove income stability." 
                          />
                        </label>
                        <div className="relative group w-full">
                          <div className="absolute inset-y-0 left-3.5 md:left-4 flex items-center pointer-events-none">
                            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-natural-sage group-focus-within:text-[#10B981] transition-colors" />
                          </div>
                          <input 
                            type="number" 
                            placeholder="Ex: 5"
                            value={formData.tenureInOrg || ''}
                            onChange={(e) => updateForm('tenureInOrg', e.target.value === '' ? '' : e.target.value)}
                            className="w-full bg-natural-bg border-none rounded-lg md:rounded-xl pl-8 md:pl-10 pr-12 md:pr-6 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none tabular-nums" 
                          />
                          <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 font-bold text-natural-muted tracking-wider text-[9px] md:text-xs">Years</span>
                        </div>
                      </div>
                    </div>
                  ) : (formData.occupation === 'Business' || formData.occupation === 'Self-Employed') ? (
                    <div className="space-y-3.5 pt-4 md:pt-5 border-t border-natural-border/50 text-left">
                      {/* Row 1: Business type & Industry selection in one line */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {/* Your business type */}
                        <div className="space-y-1">
                          <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center h-5">Your business type</label>
                          <div className="relative group w-full">
                            <select 
                              value={formData.businessType} 
                              onChange={(e) => updateForm('businessType', e.target.value)} 
                              className="w-full bg-natural-bg border-none rounded-lg md:rounded-xl px-3 md:px-4 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none appearance-none cursor-pointer"
                            >
                              <option>Sole Proprietor</option>
                              <option>Partnership Firm</option>
                              <option>Private Limited</option>
                              <option>LLP</option>
                            </select>
                            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-natural-sage">
                              <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Your Industry */}
                        <div className="space-y-1">
                          <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center h-5">Your Industry</label>
                          <div className="relative group w-full">
                            <select 
                              value={formData.businessCategory} 
                              onChange={(e) => updateForm('businessCategory', e.target.value)} 
                              className="w-full bg-natural-bg border-none rounded-lg md:rounded-xl px-3 md:px-4 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none appearance-none cursor-pointer"
                            >
                              <option>Manufacturing</option>
                              <option>Trading / Retail</option>
                              <option>Technology / Services</option>
                              <option>Logistics</option>
                            </select>
                            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-natural-sage">
                              <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Monthly sales & No. of years in business in one line */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-2 md:pt-3 border-t border-natural-border/50">
                        {/* Total Monthly Sales (Avg) */}
                        <div className="space-y-1">
                          <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center justify-between w-full h-5">
                            <span className="flex items-center gap-1">
                              <span>Total Monthly Sales (Avg)</span>
                              <span className="text-red-500 font-bold">*</span>
                            </span>
                            <CustomTooltip 
                              title="Business Sales & Net Margin" 
                              message="Average monthly gross revenue or turnover over the past 12 months. Lenders calculate deemed net margins (typically 10%-25%) to determine monthly debt servicing capacity (FOIR)." 
                            />
                          </label>
                          <div className="relative group w-full">
                            <div className={cn("absolute inset-y-0 left-3.5 md:left-4 flex items-center pointer-events-none transition-all", validationErrors.monthlyRevenue ? "text-red-500" : "text-black")}>
                              <span className="text-sm md:text-base font-bold">₹</span>
                            </div>
                            <input 
                              type="number" 
                              value={formData.monthlyRevenue || ''} 
                              onChange={(e) => updateForm('monthlyRevenue', e.target.value === '' ? 0 : Number(e.target.value))} 
                              className={cn(
                                "w-full bg-natural-bg border-none rounded-lg md:rounded-xl pl-8 md:pl-10 pr-4 md:pr-6 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none tabular-nums placeholder:opacity-20",
                                validationErrors.monthlyRevenue ? "ring-4 ring-red-500/10 text-red-500" : ""
                              )}
                              placeholder="Ex: 500000" 
                            />
                          </div>
                          {validationErrors.monthlyRevenue && (
                            <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                              <AlertCircle className="w-3 h-3 shrink-0" /> {validationErrors.monthlyRevenue}
                            </p>
                          )}
                        </div>

                        {/* No. of years in business */}
                        <div className="space-y-1">
                          <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center justify-between w-full h-5">
                            <span>No. of years in business</span>
                            <CustomTooltip 
                              title="Business Vintage Policy" 
                              message="Lenders typically mandate a minimum 2-3 years of continuous audited operations or GST filings to qualify for commercial or retail financing." 
                            />
                          </label>
                          <div className="relative group w-full">
                            <div className="absolute inset-y-0 left-3.5 md:left-4 flex items-center pointer-events-none">
                              <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4 text-natural-sage group-focus-within:text-[#10B981] transition-colors" />
                            </div>
                            <input 
                              type="number" 
                              value={formData.businessYears || ''} 
                              onChange={(e) => updateForm('businessYears', e.target.value === '' ? '' : Number(e.target.value))} 
                              className="w-full bg-natural-bg border-none rounded-lg md:rounded-xl pl-8 md:pl-10 pr-12 md:pr-6 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none tabular-nums" 
                              placeholder="Ex: 3" 
                            />
                            <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 font-bold text-natural-muted tracking-wider text-[9px] md:text-xs">Years</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : formData.occupation === 'Other' ? (
                    <div className="space-y-3.5 pt-4 md:pt-5 border-t border-natural-border/50 text-left">
                      <div className="space-y-1">
                        <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center justify-between w-full">
                          <span className="flex items-center gap-1">
                            <span>Estimated Monthly Income</span>
                            <span className="text-red-500 font-bold">*</span>
                          </span>
                          <CustomTooltip message="Approximate monthly net earnings from pension, freelance, rental, investments, or other income streams." />
                        </label>
                        <div className="relative group w-full">
                          <div className={cn("absolute inset-y-0 left-3.5 md:left-4 flex items-center pointer-events-none transition-all", validationErrors.monthlySalary ? "text-red-500" : "text-black")}>
                            <span className="text-sm md:text-base font-bold">₹</span>
                          </div>
                          <input 
                            type="number" 
                            value={formData.monthlySalary || ''}
                            onChange={(e) => updateForm('monthlySalary', e.target.value === '' ? 0 : Number(e.target.value))}
                            className={cn(
                              "w-full bg-natural-bg border-none rounded-lg md:rounded-xl pl-8 md:pl-10 pr-4 md:pr-6 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none tabular-nums placeholder:opacity-20",
                              validationErrors.monthlySalary ? "ring-4 ring-red-500/10 text-red-500" : ""
                            )}
                            placeholder="Ex: 50000"
                          />
                        </div>
                        {validationErrors.monthlySalary && (
                          <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 shrink-0" /> {validationErrors.monthlySalary}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-3.5 border-t border-natural-border/50">
                  <button onClick={() => setLoanStep(2)} className="w-full sm:w-1/4 bg-natural-bg text-natural-muted py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide hover:bg-natural-panel transition-all cursor-pointer">Back</button>
                  <button onClick={handleNextStep} className="flex-1 bg-[#10B981] text-white py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 shadow-2xl shadow-[#10B981]/20 hover:scale-[1.02] active:scale-95 transition-all hover:bg-[#0e9f6e] cursor-pointer">
                    Next: Add Co-borrowers <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {loanStep === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] border border-natural-border shadow-huge space-y-3.5 md:space-y-5 overflow-hidden relative"
              >
                <div className="bg-natural-bg p-3 md:p-5 rounded-xl md:rounded-2xl border border-natural-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group transition-all hover:bg-white hover:border-natural-terracotta/20 shadow-sm">
                  <div className="flex items-center gap-3 md:gap-5">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-lg md:rounded-2xl text-natural-sage shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
                      <Users2 className="w-5 h-5 md:w-7 md:h-7 text-natural-terracotta" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-sm md:text-base text-natural-sage tracking-tight">Add a Co-borrower?</h4>
                        <CustomTooltip 
                          title="Co-Borrower & FOIR Capacity" 
                          message="Adding an earning co-borrower (spouse, parent, or working child) pools your household income. This effectively cuts your combined FOIR ratio in half and increases maximum loan sanction eligibility by up to 35%-45%." 
                        />
                      </div>
                      <p className="text-[10px] md:text-xs text-natural-muted max-w-xs font-medium">Adding a co-borrower (like a spouse) can increase your loan eligibility by up to <span className="text-emerald-600 font-black">45%</span>.</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => updateForm('hasCoBorrower', formData.hasCoBorrower === 'Yes' ? 'No' : 'Yes')}
                    className={cn(
                      "w-12 h-6 md:w-16 md:h-8 rounded-full relative cursor-pointer transition-all p-0.5 shadow-inner shrink-0",
                      formData.hasCoBorrower === 'Yes' ? "bg-[#10B981] shadow-[#10B981]/30" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 md:w-7 md:h-7 bg-white rounded-full shadow-md md:shadow-2xl transition-all transform flex items-center justify-center",
                      formData.hasCoBorrower === 'Yes' ? "translate-x-6 md:translate-x-8" : "translate-x-0"
                    )}>
                       {formData.hasCoBorrower === 'Yes' ? <Check className="w-3 h-3 md:w-4 md:h-4 text-[#10B981]" /> : <div className="w-1 h-1 bg-slate-300 rounded-full" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {formData.hasCoBorrower === 'Yes' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 md:pt-6 border-t border-natural-border/50 px-1 lg:px-2 pb-2 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] px-1 flex items-center justify-between w-full">
                          <span className="flex items-center gap-1.5">
                            Relation with the Co-borrower
                            <span className="h-0.5 w-12 bg-[#10B981]/20 rounded-full" />
                          </span>
                          <CustomTooltip 
                            title="Eligible Co-Applicants" 
                            message="Under RBI and bank underwriting policies, blood relatives and spouses who share financial interest in the property can act as financial co-applicants." 
                          />
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'Spouse', label: 'Spouse' },
                            { id: 'Parent', label: 'Parent' },
                            { id: 'Sibling', label: 'Sibling' },
                            { id: 'Child', label: 'Son/Daughter' }
                          ].map(rel => (
                            <div
                              key={rel.id}
                              onClick={() => updateForm('coBorrowerRelation', rel.id)}
                              className={cn(
                                "p-2 md:p-2.5 rounded-lg text-center transition-all cursor-pointer font-bold text-[10px] uppercase tracking-wider flex items-center justify-center min-h-[40px] shadow-sm select-none",
                                formData.coBorrowerRelation === rel.id
                                  ? "bg-emerald-50/10 border border-[#10B981] text-[#10B981] shadow-[#10B981]/5 shadow-md scale-[1.02]"
                                  : "bg-white border border-natural-bg text-natural-muted hover:border-[#10B981]/25"
                              )}
                            >
                              {rel.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                           <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] px-1 flex items-center gap-1.5">
                             <span>Co-borrower's Monthly Net Income</span>
                             <CustomTooltip 
                               title="Co-Borrower Income & FOIR" 
                               message="Net monthly bank credit of the co-applicant. Lenders add this directly into your household debt service capacity (FOIR denominator)." 
                             />
                           </label>
                           <div className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest italic border border-emerald-100 self-start sm:self-auto shadow-inner">Multiplier Activated: x1.45</div>
                        </div>
                        <div className="relative group w-full">
                          <div className="absolute inset-y-0 left-3.5 md:left-4 flex items-center pointer-events-none">
                            <span className="text-sm md:text-base font-bold text-black">₹</span>
                          </div>
                          <input 
                            type="number" 
                            value={formData.coBorrowerMonthlyIncome || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              setFormData(prev => ({
                                ...prev,
                                coBorrowerMonthlyIncome: val,
                                householdIncome: val * 12
                              }));
                            }}
                            className="w-full bg-natural-bg border-none rounded-lg md:rounded-xl pl-8 md:pl-10 pr-4 md:pr-6 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none tabular-nums placeholder:opacity-20" 
                            placeholder="Ex: 85000"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-3.5 border-t border-natural-border/50">
                  <button onClick={() => setLoanStep(3)} className="w-full sm:w-1/4 bg-natural-bg text-natural-muted py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide hover:bg-natural-panel transition-all cursor-pointer">Back</button>
                  <button onClick={handleNextStep} className="flex-1 bg-[#10B981] text-white py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 shadow-2xl shadow-[#10B981]/20 hover:scale-[1.02] active:scale-95 transition-all hover:bg-[#0e9f6e] cursor-pointer">
                    Next: Bank Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {loanStep === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] border border-natural-border shadow-huge space-y-3.5 md:space-y-5 overflow-hidden relative"
              >
                <div className="space-y-4 md:space-y-6">
                  <AutocompleteInput 
                    label="Please specify the bank where you hold your account."
                    options={INDIAN_BANKS}
                    value={formData.bankAccount}
                    onChange={(val) => {
                      updateForm('bankAccount', val);
                      // Pre-fill selectedBank for results page if this bank exists in our list
                      const bankMatch = getBankRecommendations().find(b => b.name === val || b.name.includes(val));
                      if (bankMatch) {
                        updateForm('selectedBank', bankMatch);
                      }
                    }}
                    placeholder="Ex: HDFC Bank"
                    icon={Building2}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-3.5 border-t border-natural-border/50">
                  <button onClick={() => setLoanStep(4)} className="w-full sm:w-1/4 bg-natural-bg text-natural-muted py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide hover:bg-natural-panel transition-all cursor-pointer">Back</button>
                  <button onClick={handleNextStep} className="flex-1 bg-[#10B981] text-white py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 shadow-2xl shadow-[#10B981]/20 hover:scale-[1.02] active:scale-95 transition-all hover:bg-[#0e9f6e] cursor-pointer">
                    Next: Other Loans & EMIs <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {loanStep === 6 && (
              <motion.div 
                key="step6-active-loans"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] border border-natural-border shadow-huge space-y-3.5 md:space-y-5 overflow-hidden relative"
              >
                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col items-center gap-3 py-4 md:py-6 bg-natural-bg/50 rounded-xl md:rounded-2xl border border-natural-border/50 text-center space-y-1.5">
                    <div className="flex items-center justify-center gap-2 px-6">
                      <p className="text-xs md:text-sm font-bold tracking-wider text-[#0F172A]">
                        Do you currently have any other active loans running?
                      </p>
                      <CustomTooltip 
                        title="FOIR & Active Loan Obligations" 
                        message="Fixed Obligation to Income Ratio (FOIR) measures the percentage of your monthly income committed to paying existing EMIs and credit cards. Banks cap overall FOIR between 50% and 65% when sanctioning new loans." 
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setHasActiveLoansSelected(false);
                          updateForm('activeLoans', []);
                        }}
                        className={cn(
                          "px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all cursor-pointer shadow-sm",
                          hasActiveLoansSelected === false
                            ? "bg-natural-terracotta text-white shadow-lg scale-105"
                            : "bg-white text-natural-muted border border-natural-border hover:bg-natural-bg"
                        )}
                      >
                        No, I am Debt-Free
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHasActiveLoansSelected(true);
                          if (formData.activeLoans.length === 0 || (formData.activeLoans.length === 1 && formData.activeLoans[0]?.amount === 0 && !formData.activeLoans[0]?.bankName)) {
                            updateForm('activeLoans', [{ id: Date.now().toString(), bankName: '', type: 'Personal Loan', amount: 0 }]);
                          }
                        }}
                        className={cn(
                          "px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all cursor-pointer shadow-sm",
                          hasActiveLoansSelected === true
                            ? "bg-[#10B981] text-white shadow-lg scale-105"
                            : "bg-white text-natural-muted border border-natural-border hover:bg-natural-bg"
                        )}
                      >
                        Yes, I have Active Loans
                      </button>
                    </div>
                  </div>

                  {hasActiveLoansSelected === true && (
                    <div className="space-y-3 md:space-y-5 pt-3 border-t border-natural-border/20">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] md:text-xs text-slate-900 font-bold tracking-wide">
                          Select type of loan, bank and amount
                        </p>
                        <CustomTooltip 
                          title="FOIR Ratio Impact" 
                          message="Every ₹10,000 of ongoing monthly EMI obligations reduces your new loan sanction limit by approximately ₹10-12 Lakhs due to banking FOIR ceiling rules." 
                        />
                      </div>
                      
                      <AnimatePresence mode="popLayout">
                        <div className="space-y-3">
                          {formData.activeLoans.map((loan, idx) => (
                            <motion.div 
                              key={loan.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="bg-natural-bg/30 p-3 md:p-5 rounded-lg md:rounded-xl border border-natural-border/50 space-y-3 md:space-y-4 relative group/loan shadow-sm hover:shadow-md transition-all"
                            >
                              <button 
                                onClick={() => {
                                  updateForm('activeLoans', formData.activeLoans.filter((_, i) => i !== idx));
                                }}
                                className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg z-10"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] px-2 flex items-center gap-1.5">
                                    <Building2 className="w-3 h-3 text-[#10B981]" /> Bank/Lender Name
                                  </label>
                                  <div className="relative group w-full">
                                    <select 
                                      value={loan.bankName}
                                      onChange={(e) => {
                                        const newLoans = [...formData.activeLoans];
                                        newLoans[idx] = { ...newLoans[idx], bankName: e.target.value };
                                        updateForm('activeLoans', newLoans);
                                      }}
                                      className="w-full bg-natural-bg border-none rounded-lg md:rounded-xl px-3 md:px-4 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none appearance-none cursor-pointer pr-8"
                                    >
                                      <option value="">Select Bank</option>
                                      {INDIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-natural-muted pointer-events-none" />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] px-2 flex items-center gap-1.5">
                                    <CreditCard className="w-3 h-3 text-[#10B981]" /> Facility Type
                                  </label>
                                  <div className="relative group w-full">
                                    <select 
                                      value={loan.type}
                                      onChange={(e) => {
                                        const newLoans = [...formData.activeLoans];
                                        newLoans[idx] = { ...newLoans[idx], type: e.target.value };
                                        updateForm('activeLoans', newLoans);
                                      }}
                                      className="w-full bg-natural-bg border-none rounded-lg md:rounded-xl px-3 md:px-4 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none appearance-none cursor-pointer pr-8"
                                    >
                                      {['Personal Loan', 'Home Loan', 'Car Loan', 'Gold Loan', 'Education Loan', 'Credit Card EMI', 'Business Loan', 'Other'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                      ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-natural-muted pointer-events-none" />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1 pt-1.5">
                                <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] px-2 flex items-center justify-between w-full">
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-[#10B981] font-bold">₹</span> Monthly EMI Repayment
                                  </span>
                                  <CustomTooltip 
                                    title="Existing EMI Obligation" 
                                    message="Enter the precise total EMI debited each month. Any undeclared obligations will be retrieved during CIBIL / Experian bureau scrub and affect the final credit decision." 
                                  />
                                </label>
                                <div className="relative group w-full">
                                  <div className="absolute inset-y-0 left-3.5 md:left-4 flex items-center pointer-events-none">
                                    <span className="text-sm md:text-base font-bold text-black">₹</span>
                                  </div>
                                  <input 
                                    type="number"
                                    placeholder="Ex: 15000"
                                    value={loan.amount || ''}
                                    onChange={(e) => {
                                      const newLoans = [...formData.activeLoans];
                                      newLoans[idx] = { ...newLoans[idx], amount: Number(e.target.value) };
                                      updateForm('activeLoans', newLoans);
                                    }}
                                    className="w-full bg-natural-bg border-none rounded-lg md:rounded-xl pl-8 md:pl-10 pr-4 md:pr-6 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-natural-sage focus:ring-4 ring-[#10B981]/10 transition-all outline-none tabular-nums placeholder:opacity-20"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </AnimatePresence>

                      {/* Live FOIR Calculator Indicator */}
                      {(() => {
                        const totalEmi = formData.activeLoans.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
                        const primaryIncome = formData.occupation === 'Salaried' 
                          ? (formData.monthlySalary || 0) 
                          : (formData.monthlyRevenue ? formData.monthlyRevenue * 0.20 : 0);
                        const coIncome = (formData.hasCoBorrower === 'Yes' ? (formData.coBorrowerMonthlyIncome || 0) : 0);
                        const totalIncome = primaryIncome + coIncome;
                        
                        if (totalIncome > 0 && totalEmi > 0) {
                          const foirPercent = Math.round((totalEmi / totalIncome) * 100);
                          const isHealthy = foirPercent <= 40;
                          const isWarning = foirPercent > 40 && foirPercent <= 55;
                          return (
                            <div className={cn(
                              "p-3 rounded-xl border flex items-center justify-between gap-3 text-xs",
                              isHealthy 
                                ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-900" 
                                : isWarning 
                                ? "bg-amber-50/70 border-amber-200/80 text-amber-900" 
                                : "bg-red-50/70 border-red-200/80 text-red-900"
                            )}>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold">Current FOIR Ratio:</span>
                                  <span className="font-black text-sm">{foirPercent}%</span>
                                  <span className="text-[10px] opacity-80">
                                    ({isHealthy ? 'Healthy Capacity' : isWarning ? 'Moderate Commitment' : 'High Debt Burden'})
                                  </span>
                                </div>
                                <p className="text-[10px] opacity-75">
                                  ₹{totalEmi.toLocaleString('en-IN')}/mo committed out of ₹{Math.round(totalIncome).toLocaleString('en-IN')}/mo estimated net income.
                                </p>
                              </div>
                              <CustomTooltip 
                                title="Live FOIR Ratio Analysis" 
                                message={`Your current monthly commitments consume ${foirPercent}% of your net income. Banking policies permit a maximum combined FOIR of 50-60% inclusive of your requested home loan EMI.`} 
                              />
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <button 
                         onClick={() => updateForm('activeLoans', [...formData.activeLoans, { id: Date.now(), bankName: '', type: ['Loan Transfer', 'Top up Loan'].includes(formData.purpose) ? 'Home Loan' : 'Personal Loan', amount: 0 }])}
                         className="w-full py-3 md:py-4.5 border-2 border-dashed border-natural-border rounded-lg md:rounded-xl flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-natural-muted hover:border-[#10B981]/30 hover:text-[#10B981] hover:bg-[#10B981]/5 transition-all active:scale-[0.98] cursor-pointer"
                      >
                         <Plus className="w-4 h-4" /> Add Another Active Loan
                      </button>
                    </div>
                  )}
                </div>

                {validationErrors.activeLoans && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center"
                  >
                    {validationErrors.activeLoans}
                  </motion.p>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5 pt-3.5 border-t border-natural-border/50">
                  <button onClick={() => setLoanStep(5)} className="w-full sm:w-1/4 bg-natural-bg text-natural-muted py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide hover:bg-natural-panel transition-all cursor-pointer">Back</button>
                  <button onClick={handleNextStep} className="flex-1 bg-[#10B981] text-white py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 shadow-2xl shadow-[#10B981]/20 hover:scale-[1.02] active:scale-95 transition-all hover:bg-[#0e9f6e] cursor-pointer">
                    Next: Credit Score <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {loanStep === 7 && (
              <motion.div 
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] border border-natural-border shadow-huge space-y-3.5 md:space-y-5 overflow-hidden relative"
              >
                <div className="space-y-4 md:space-y-6">
                   <div className="space-y-4 md:space-y-8">
                       <div className="space-y-2">
                         <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] flex items-center gap-1.5">
                           Do you know your approximate CIBIL Score?
                           <CustomTooltip message="CIBIL score ranges from 300 to 900. Banks typically approve home loans for scores above 700." />
                           <span className="h-0.5 w-12 bg-[#10B981]/20 rounded-full" />
                         </label>
                         
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3 pt-3">
                          {[
                            { id: 'poor', label: 'Below 650 (poor)', score: 600, desc: 'May have active defaults or limited track record. We have fallback programs for you.' },
                            { id: 'fair', label: '650-700 (Fair)', score: 680, desc: 'Moderate credit history. Eligible for standard rate models and general banks.' },
                            { id: 'good', label: '700-750 (Good)', score: 730, desc: 'Good credit behavior. Eligible for swift green-channel processing and discounted rates.' },
                            { id: 'excellent', label: '750+ (Excellent)', score: 800, desc: 'Top premium tier credit! Unlocks lowest interest rates and best features.' },
                            { id: 'unknown', label: "Dont' Know", score: 700, desc: 'No problem! Our advisors will perform a safe soft check to guide you.' }
                          ].map(opt => {
                            const isSelected = (opt.id === 'poor' && formData.cibilScore < 650 && formData.cibilScore > 0) ||
                                              (opt.id === 'fair' && formData.cibilScore >= 650 && formData.cibilScore < 700) ||
                                              (opt.id === 'good' && formData.cibilScore >= 700 && formData.cibilScore <= 750) ||
                                              (opt.id === 'excellent' && formData.cibilScore > 750) ||
                                              (opt.id === 'unknown' && formData.cibilScore === 0);

                            return (
                               <button 
                                 key={opt.id} 
                                 type="button"
                                 onClick={() => {
                                   updateForm('cibilScore', opt.score);
                                   if (opt.id === 'poor') {
                                     updateForm('cibilStatus', 'Outstanding & Defaults');
                                   } else if (opt.id === 'unknown') {
                                     updateForm('cibilStatus', 'Not Sure');
                                   } else {
                                     updateForm('cibilStatus', 'No Issue');
                                   }
                                 }}
                                 className={cn(
                                   "p-3.5 rounded-xl border transition-all text-left space-y-1 relative group cursor-pointer flex flex-col justify-between min-h-[85px]",
                                   isSelected 
                                     ? "bg-white border-[#10B981] shadow-lg" 
                                     : "bg-white border-natural-bg hover:border-[#10B981]/25"
                                 )}
                               >
                                 <div className="space-y-1 w-full">
                                   <div className="flex items-center justify-between">
                                     <p className="font-extrabold text-xs md:text-sm text-natural-sage tracking-tight">{opt.label}</p>
                                     <div className={cn(
                                       "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all shrink-0",
                                       isSelected ? "border-[#10B981]" : "border-natural-muted/20"
                                     )}>
                                       {isSelected && <div className="w-2 h-2 rounded-full bg-[#10B981]" />}
                                     </div>
                                   </div>
                                   <p className="text-[8.5px] text-natural-muted font-medium leading-normal italic">{opt.desc}</p>
                                 </div>
                               </button>
                             );
                          })}
                       </div>
                   </div>
                </div>
 
                <div className="flex flex-col sm:flex-row gap-2.5 pt-3.5 border-t border-natural-border/50">
                  <button onClick={() => setLoanStep(6)} className="w-full sm:w-1/4 bg-natural-bg text-natural-muted py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide hover:bg-natural-panel transition-all cursor-pointer">Back</button>
                  <button onClick={handleNextStep} className="flex-1 bg-[#10B981] text-white py-2.5 md:py-3 rounded-lg md:rounded-[1.5rem] font-bold text-sm tracking-wide flex items-center justify-center gap-3 shadow-2xl shadow-[#10B981]/20 hover:scale-[1.02] active:scale-95 transition-all hover:bg-[#0e9f6e] cursor-pointer">
                    Next: Profile <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {loanStep === 8 && (
              <motion.div 
                key="step8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] border border-natural-border shadow-huge space-y-3.5 md:space-y-5 overflow-hidden relative"
              >
                <div className="space-y-3.5 md:space-y-4">
                   {/* Full Name */}
                   <div className="space-y-1.5">
                      <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] px-1 flex items-center justify-between w-full">
                        <span>Full Name (as on PAN)</span>
                        <CustomTooltip message="Enter your complete legal name as it appears on your identity documents." />
                      </label>
                      <input 
                        type="text" value={formData.fullName} 
                        onChange={(e) => updateForm('fullName', e.target.value)} 
                        className={cn(
                          "w-full bg-natural-bg border-none rounded-xl md:rounded-[1.2rem] px-3 md:px-4 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-[#0F172A] outline-none transition-all shadow-inner tabular-nums focus:ring-4 ring-[#10B981]/10",
                          validationErrors.fullName ? "ring-4 ring-red-500/10 text-red-500" : ""
                        )}
                        placeholder="Lead Applicant Name"
                      />
                      {validationErrors.fullName && (
                        <p className="ml-2 text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" /> {validationErrors.fullName}
                        </p>
                      )}
                   </div>

                   {/* Gender selection with Male & Female line icons and Age in parallel */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {/* Gender Option Selection (Unboxed Thin Line Icons) */}
                      <div className="space-y-1.5">
                         <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] px-1 flex items-center justify-between">
                            <span>Gender</span>
                            <CustomTooltip message="Required for demographic profiling and applicable institutional discounts (e.g. concessional interest rates for women borrowers)." />
                         </label>
                         <div className="h-[42px] md:h-[46px] flex items-center justify-around px-3">
                            {[
                              { 
                                id: 'Male', 
                                title: 'Male',
                                icon: (
                                  <svg className="w-8 h-8 md:w-9 md:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="4.8" r="2.4" />
                                    <path d="M8.5 9.5h7c.6 0 1 .4 1 1v4.5h-1.5v5.5h-2.5v-5h-1v5H9V15H7.5v-4.5c0-.6.4-1 1-1z" />
                                  </svg>
                                )
                              },
                              { 
                                id: 'Female', 
                                title: 'Female',
                                icon: (
                                  <svg className="w-8 h-8 md:w-9 md:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="4.8" r="2.4" />
                                    <path d="M9.5 9.5h5c.5 0 .95.35 1.05.85l1.95 6.15h-3v4h-2.5v-4h-1v4H8.5v-4H5.5l1.95-6.15c.1-.5.55-.85 1.05-.85z" />
                                  </svg>
                                )
                              }
                            ].map((g) => {
                              const isSelected = (formData.gender || 'Male') === g.id;
                              return (
                                <button
                                  key={g.id}
                                  type="button"
                                  title={g.title}
                                  aria-label={g.title}
                                  onClick={() => updateForm('gender', g.id)}
                                  className={cn(
                                    "relative p-1 rounded-full transition-all duration-200 cursor-pointer focus:outline-none flex flex-col items-center justify-center bg-transparent border-0 shadow-none",
                                    isSelected
                                      ? "text-[#10B981] scale-110 drop-shadow-sm"
                                      : "text-slate-400 hover:text-slate-600 hover:scale-105"
                                  )}
                                >
                                  {g.icon}
                                  {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] absolute -bottom-1" />
                                  )}
                                </button>
                              );
                            })}
                         </div>
                      </div>

                      {/* Age */}
                      <div className="space-y-1.5">
                         <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] px-1 flex items-center justify-between">
                            <span>Age</span>
                            <CustomTooltip message="Banks restrict repayment terms such that age at loan maturity is under 65 years (Age + Tenure ≤ 65)." />
                         </label>
                         <div className="relative group w-full">
                            <div className="absolute inset-y-0 left-3.5 md:left-4 flex items-center pointer-events-none">
                              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-natural-sage group-focus-within:text-[#10B981] transition-colors" />
                            </div>
                            <input 
                              type="number"
                              value={formData.age || ''}
                              onChange={(e) => updateForm('age', e.target.value === '' ? 0 : Number(e.target.value))}
                              className={cn(
                                "w-full bg-natural-bg border-none rounded-xl md:rounded-[1.2rem] pl-9 md:pl-10 pr-12 md:pr-14 py-2 md:py-2.5 font-bold text-xs md:text-sm tracking-wider text-[#0F172A] focus:ring-4 ring-[#10B981]/10 transition-all outline-none tabular-nums shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                validationErrors.age ? "ring-4 ring-red-500/10 text-red-500" : ""
                              )}
                              placeholder="Ex: 30"
                            />
                            <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 font-black text-natural-muted uppercase tracking-widest text-[8px] md:text-[9px]">Years</span>
                         </div>
                         {validationErrors.age && (
                           <p className="ml-2 text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                             <AlertCircle className="w-3 h-3" /> {validationErrors.age}
                           </p>
                         )}
                      </div>
                   </div>

                   {/* Mobile Number */}
                   <div className="space-y-1.5">
                      <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] px-1 flex items-center justify-between w-full">
                        <span>Mobile Number</span>
                        <CustomTooltip message="Required for verification and updates. We value your privacy." />
                      </label>
                      <div className="relative group w-full">
                        <span className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 font-bold text-natural-muted text-xs md:text-sm group-focus-within:text-[#10B981] transition-colors">+91</span>
                        <input 
                          type="tel" value={formData.mobileNumber} 
                          onChange={(e) => updateForm('mobileNumber', e.target.value)} 
                          className={cn(
                            "w-full bg-natural-bg border-none rounded-xl md:rounded-[1.2rem] pl-10 md:pl-11 pr-4 md:pr-6 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-[#0F172A] focus:ring-4 ring-[#10B981]/10 transition-all outline-none tabular-nums shadow-inner",
                            validationErrors.mobileNumber ? "ring-4 ring-red-500/10 text-red-500" : ""
                          )}
                          placeholder="98765 43210"
                        />
                        {validationErrors.mobileNumber && (
                          <p className="mt-2 ml-4 md:ml-6 text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> {validationErrors.mobileNumber}
                          </p>
                        )}
                      </div>
                   </div>

                   {/* Email Address */}
                   <div className="space-y-1.5">
                      <label className="text-xs md:text-sm font-semibold tracking-wider text-[#0F172A] px-1 flex items-center justify-between w-full">
                        <span>Email Address</span>
                        <CustomTooltip message="We'll send your loan assessment and bank offers to this address." />
                      </label>
                      <input 
                        type="email" value={formData.email} 
                        onChange={(e) => updateForm('email', e.target.value)} 
                        className={cn(
                          "w-full bg-natural-bg border-none rounded-xl md:rounded-[1.2rem] px-3 md:px-4 py-1.5 md:py-2 font-bold text-xs md:text-sm tracking-wider text-[#0F172A] outline-none transition-all shadow-inner regular-nums focus:ring-4 ring-[#10B981]/10",
                          validationErrors.email ? "ring-4 ring-red-500/10 text-red-500" : ""
                        )}
                        placeholder="email@example.com"
                      />
                      {validationErrors.email && (
                        <p className="ml-2 text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" /> {validationErrors.email}
                        </p>
                      )}
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-3.5 border-t border-natural-border/50">
                  <button onClick={() => setLoanStep(7)} className="w-full sm:w-1/4 bg-natural-bg text-natural-muted py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm tracking-wide hover:bg-natural-panel transition-all cursor-pointer">Back</button>
                  <button onClick={handleNextStep} className="flex-1 bg-[#10B981] text-white py-2.5 md:py-3 rounded-lg md:rounded-[1.5rem] font-bold text-sm tracking-wide flex items-center justify-center gap-3 shadow-2xl shadow-[#10B981]/20 hover:scale-[1.02] active:scale-95 transition-all hover:bg-[#0e9f6e] cursor-pointer">
                    Find Me the Best Offers <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {loanStep === 9 && (
              <motion.div 
                key="step9"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 md:space-y-12"
              >
                {/* AI Assessment Section */}
                <div className="bg-natural-bg/40 p-4 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-natural-terracotta/10 shadow-inner relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 md:p-8 flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-natural-terracotta animate-pulse" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-natural-terracotta">Smart Loan Matching</span>
                   </div>
                   
                   {isAssessing ? (
                     <div className="flex flex-col items-center justify-center py-12 md:py-20 gap-6">
                        <div className="relative">
                           <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-natural-terracotta animate-spin" />
                           <div className="absolute inset-0 bg-natural-terracotta/10 blur-xl animate-pulse rounded-full" />
                        </div>
                        <div className="text-center space-y-2">
                           <p className="text-xs md:text-sm font-black text-natural-sage uppercase tracking-[0.3em] animate-pulse">Running Financial Algorithms...</p>
                           <p className="text-[9px] md:text-[10px] text-natural-muted font-medium uppercase tracking-widest">Analyzing income, age, credit & property data</p>
                        </div>
                     </div>
                   ) : activeAssessment && (
                     <div className="space-y-6 md:space-y-12 pt-4">
                        {/* Approval Confidence & Assessment Pillars Card */}
                        <div className="bg-white rounded-3xl border border-natural-border/70 p-6 md:p-8 shadow-xs space-y-6 md:space-y-8">
                           {/* Top Section: Approval Confidence Circular Gauge & Status */}
                           <div className="flex items-center justify-center sm:justify-start gap-4 md:gap-5">
                              <div className="relative inline-block scale-95 shrink-0">
                                 <svg className="w-20 h-20 transform -rotate-90">
                                   <circle cx="40" cy="40" r="32" fill="transparent" stroke="#f1f5f9" strokeWidth="6.5" />
                                   <motion.circle 
                                     cx="40" cy="40" r="32" fill="transparent" stroke={activeAssessment.status === 'Low' ? '#ef4444' : '#10B981'} strokeWidth="6.5" 
                                     strokeDasharray={201.06}
                                     initial={{ strokeDashoffset: 201.06 }}
                                     animate={{ strokeDashoffset: 201.06 - (201.06 * activeAssessment.score) / 100 }}
                                     transition={{ duration: 1.2, ease: "easeOut" }}
                                   />
                                 </svg>
                                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={cn("text-xl font-black tabular-nums leading-none tracking-tight", activeAssessment.status === 'Low' ? 'text-red-500' : 'text-slate-900')}>{activeAssessment.score}%</span>
                                    <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-500 mt-0.5">MATCH</span>
                                 </div>
                              </div>
                              <div className="space-y-1 text-left">
                                 <p className="text-[10.5px] md:text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Approval Confidence</p>
                                 <div className="flex items-center gap-2">
                                    <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", activeAssessment.status === 'High' ? 'bg-emerald-500' : activeAssessment.status === 'Medium' ? 'bg-amber-500' : 'bg-red-500')} />
                                    <span className={cn("text-base md:text-lg font-black uppercase tracking-wide", activeAssessment.status === 'Low' ? 'text-red-500' : 'text-slate-900')}>
                                       {activeAssessment.status} Potential
                                    </span>
                                 </div>
                              </div>
                           </div>

                           {/* Bottom Section: 5 Assessment Pillars in one horizontal row across the bottom */}
                           <div className="grid grid-cols-5 gap-1 sm:gap-3 md:gap-4 items-center justify-between pt-5 border-t border-slate-100">
                              {[
                                { key: 'income', label: 'INCOME' },
                                { key: 'age', label: 'AGE' },
                                { key: 'credit', label: 'CREDIT' },
                                { key: 'continuity', label: 'WORK' },
                                { key: 'property', label: 'PROPERTY' }
                              ].map(({ key, label }, idx) => {
                                const data = (activeAssessment.categories as any)?.[key] || { status: 'Good', message: 'Ready' };
                                const starCount = data.status === 'Excellent' ? 5 : data.status === 'Good' ? 4 : data.status === 'Average' ? 3 : 2;
                                return (
                                  <div key={key} className="flex items-center justify-center relative">
                                    {idx > 0 && <div className="absolute -left-0.5 sm:-left-1.5 md:-left-2 top-1/2 -translate-y-1/2 h-7 sm:h-8 w-px bg-slate-200/80" />}
                                    <div className="text-center px-0.5 sm:px-1" title={`${label}: ${data.status} (${starCount}/5)`}>
                                      <p className="text-[10px] sm:text-xs md:text-sm font-black text-slate-800 tracking-wider uppercase">{label}</p>
                                      <div className="flex items-center justify-center gap-0.5 sm:gap-1 mt-1.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={cn(
                                              "w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 shrink-0",
                                              star <= starCount
                                                ? "fill-amber-400 text-amber-400 stroke-amber-400"
                                                : "fill-slate-100 text-slate-200 stroke-slate-200"
                                            )}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                           </div>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-3 pt-3 md:pt-4 text-left w-full">
                           <h5 className="text-[9px] md:text-[10px] font-black text-natural-muted uppercase tracking-[0.3em] flex items-center gap-3 justify-start">
                              {activeAssessment.status === 'Low' ? 'How to Become Eligible' : 'Eligibility Improvement Tips'}
                              <div className="h-px bg-natural-border flex-1" />
                           </h5>
                           <div className="flex flex-wrap justify-start gap-2 md:gap-3">
                              {activeAssessment.recommendations.map((rec, i) => (
                                <div key={i} className={cn(
                                  "flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black border shadow-sm hover:shadow-md transition-all cursor-default",
                                  activeAssessment.status === 'Low' 
                                    ? "bg-amber-50 text-amber-900 border-amber-100" 
                                    : "bg-natural-terracotta/5 text-natural-sage border-natural-terracotta/10"
                                )}>
                                   {activeAssessment.status === 'Low' ? <Zap className="w-3.5 h-3.5 text-amber-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-natural-terracotta" />} 
                                   {rec}
                                </div>
                              ))}
                           </div>
                        </div>

                        {/* Home Loan Overdraft Advisory Section (SBI MaxGain / HDFC MaxSaver) */}
                        <div className="bg-blue-50/40 border border-blue-100/60 rounded-[2rem] p-6 md:p-8 space-y-6 text-left mt-6 shadow-sm overflow-hidden relative">
                           {/* Decorative background accent */}
                           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                           
                           {/* Title block */}
                           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                             <div>
                               <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100/80 text-blue-900 border border-blue-200/30 rounded-full text-[9px] font-black uppercase tracking-widest mb-2.5">
                                 <Sparkles className="w-3 h-3 text-blue-650 animate-pulse" /> Highly Suited for Your Profile
                               </div>
                               <h4 className="text-lg md:text-xl font-black text-blue-900 tracking-tight font-sans">
                                 Home Loan Overdraft Benefit Advisory
                               </h4>
                               <p className="text-xs text-blue-700/80 font-medium mt-1 leading-relaxed">
                                 Lower your interest payout while retaining 100% liquidity of your spare cash.
                               </p>
                             </div>
                             
                             <div className="bg-white px-4 py-2 rounded-2xl border border-natural-border flex items-center gap-3 shadow-sm self-start sm:self-auto">
                               <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                 <IndianRupee className="w-4 h-4 text-blue-600" />
                               </div>
                               <div>
                                 <p className="text-[8px] font-black uppercase text-natural-muted tracking-wider">Interest Savings Rate</p>
                                 <p className="text-xs font-black text-blue-800">Variable: Daily Balance</p>
                               </div>
                             </div>
                           </div>

                           {/* Interactive slider for Overdraft simulator */}
                           <div className="bg-white p-5 rounded-3xl border border-natural-border shadow-sm space-y-5">
                             <div className="space-y-2">
                               <div className="flex justify-between items-baseline">
                                 <span className="text-[10px] md:text-xs font-black text-blue-900/80 uppercase tracking-wider">Average Spare Cash to Park:</span>
                                 <span className="text-sm md:text-base font-black text-blue-700 tabular-nums bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                                   {formatCurrency(overdraftSurplus)}
                                 </span>
                               </div>
                               <input 
                                 type="range"
                                 min={50000}
                                 max={Math.min(formData?.loanAmount || 5000000, 10000000)}
                                 step={50000}
                                 value={overdraftSurplus}
                                 onChange={(e) => setOverdraftSurplus(Number(e.target.value))}
                                 className="w-full h-1.5 bg-blue-50/70 rounded-lg appearance-none cursor-pointer accent-blue-600"
                               />
                               <div className="flex justify-between text-[8px] font-black text-blue-900/50 uppercase tracking-wider">
                                 <span>₹50,000</span>
                                 <span>₹{((Math.min(formData?.loanAmount || 3000000, 10000000)) / 100000).toFixed(0)} Lakhs (Max Cap)</span>
                               </div>
                             </div>

                             {/* Savings impact metric grid */}
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                               <div className="bg-blue-50/20 border border-blue-100/50 p-4 rounded-2xl flex items-center gap-3">
                                 <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                   <TrendingDown className="w-5 h-5 text-blue-700" />
                                 </div>
                                 <div>
                                   <span className="text-[8px] font-black uppercase text-natural-muted tracking-widest block">Estimated Total Interest Saved</span>
                                   <p className="text-base md:text-lg font-black text-blue-700 tabular-nums mt-0.5">{overdraftCalculated.formattedSavings}</p>
                                 </div>
                               </div>

                               <div className="bg-indigo-50/20 border border-indigo-100/50 p-4 rounded-2xl flex items-center gap-3">
                                 <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                   <Clock className="w-5 h-5 text-blue-700" />
                                 </div>
                                 <div>
                                   <span className="text-[8px] font-black uppercase text-natural-muted tracking-widest block">Loan Repayment Term Shaved</span>
                                   <p className="text-base md:text-lg font-black text-natural-sage tabular-nums mt-0.5">
                                     {overdraftCalculated.shavedYears > 0 ? `${overdraftCalculated.shavedYears} Yrs ` : ''}
                                     {overdraftCalculated.shavedMonths > 0 ? `${overdraftCalculated.shavedMonths} Mos` : ''}
                                     {overdraftCalculated.shavedYears === 0 && overdraftCalculated.shavedMonths === 0 ? 'No Change' : ' Earlier'}
                                   </p>
                                 </div>
                               </div>
                             </div>
                           </div>

                           {/* Educational bullets */}
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                             <div className="space-y-1">
                               <p className="font-bold text-natural-sage flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                                 <span className="w-2 h-2 bg-blue-500 rounded-full" /> Ultimate Liquidity
                               </p>
                               <p className="text-[10px] text-natural-muted leading-relaxed font-semibold pl-3.5">
                                 Unlike standard prepayments where cash is permanently locked, here you can withdraw your parked surplus whenever you need.
                               </p>
                             </div>
                             <div className="space-y-1">
                               <p className="font-bold text-natural-sage flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                                 <span className="w-2 h-2 bg-blue-500 rounded-full" /> Daily Calculations
                               </p>
                               <p className="text-[10px] text-natural-muted leading-relaxed font-semibold pl-3.5">
                                 Interest is calculated on (Outstanding Principal - Parked Funds) every single day, keeping your monthly EMI exactly the same but reducing overall interest.
                               </p>
                             </div>
                             <div className="space-y-1">
                               <p className="font-bold text-natural-sage flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                                 <span className="w-2 h-2 bg-blue-500 rounded-full" /> Zero Penalties
                               </p>
                               <p className="text-[10px] text-natural-muted leading-relaxed font-semibold pl-3.5">
                                 Lenders do not levy any prepayment fees for depositing money inside the home loan saver overdraft account.
                               </p>
                             </div>
                           </div>
                        </div>
                     </div>
                   )}
                </div>

                {activeAssessment?.status === 'Low' ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-100 p-12 rounded-[2.5rem] text-center space-y-8 shadow-xl overflow-hidden"
                  >
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                      <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-red-600 tracking-tighter italic">We're sorry, you are not eligible for a loan right now.</h3>
                      <p className="text-red-700/70 font-medium max-w-2xl mx-auto leading-relaxed">
                        Our AI matching engine has determined that your current profile does not meet the minimum criteria of our 25+ lending partners. This is often due to high debt-to-income ratio or specific age-tenure constraints.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                       <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 space-y-4 shadow-sm">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                             <Info className="w-4 h-4" /> Educational Insight
                          </h4>
                          <p className="text-sm font-bold text-natural-sage leading-relaxed">
                            To improve your eligibility, consider adding a co-borrower with stable income or try reducing your existing monthly EMIs. Most lenders look for a FOIR below 60%.
                          </p>
                       </div>
                       <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 space-y-4 shadow-sm">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                             <TrendingUp className="w-4 h-4" /> Recommended Action
                          </h4>
                          <p className="text-sm font-bold text-natural-sage leading-relaxed">
                            We recommend you "Reset and Optimize" your profile by selecting a lower loan amount or a longer tenure if possible.
                          </p>
                       </div>
                    </div>

                    <button 
                      onClick={() => { setActiveTab('dashboard'); setLoanStep(1); }}
                      className="bg-red-600 text-white px-12 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
                    >
                      Reset & Optimize Profile
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {/* Step 9 Header Bar with Quick Stats & Excel Download */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50/80 p-3.5 md:p-4 rounded-2xl border border-stone-200">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md inline-block mb-1">
                          Dynamic Algorithm Matching Active
                        </span>
                        <p className="text-xs text-stone-600 font-medium">
                          Evaluated against <strong className="text-stone-900 font-bold">{getBankRecommendations().length} Institutional Lenders</strong> (PSU Banks, Private Banks, HFCs & SFBs)
                        </p>
                      </div>
                      <a
                        href="/Bank_and_NBFC_Home_Loan_and_LAP_Guidelines.xlsx"
                        download="Bank_and_NBFC_Home_Loan_and_LAP_Guidelines.xlsx"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                        title="Download Complete 43+ Lenders Policy Matrix in Excel"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>43+ Lenders Excel</span>
                      </a>
                    </div>

                    <div className="grid gap-5">
                      {(showAllStep9Offers ? getBankRecommendations() : getBankRecommendations().slice(0, 6)).map((bank, i) => (
                        <motion.div 
                          key={bank.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white p-4 md:p-5 rounded-2xl border border-natural-border shadow-md hover:shadow-lg transition-all group relative overflow-hidden"
                        >
                          {i === 0 && (
                            <div className="absolute top-0 right-4 sm:right-16 bg-natural-terracotta text-white px-3 sm:px-4 py-0.5 rounded-b-lg text-[7.5px] sm:text-[8px] font-black uppercase tracking-[0.3em] shadow-lg">
                              Top Match
                            </div>
                          )}

                          {formData.bankAccount && (bank.name.toLowerCase().includes(formData.bankAccount.toLowerCase()) || formData.bankAccount.toLowerCase().includes(bank.name.toLowerCase())) && (
                            <div className="absolute top-0 right-4 sm:right-16 bg-natural-sage text-white px-3 sm:px-4 py-0.5 rounded-b-lg text-[7.5px] sm:text-[8px] font-black uppercase tracking-[0.3em] shadow-lg flex items-center gap-1 dynamic-preferred">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Preferred Salary Bank
                            </div>
                          )}
                          
                          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-6 pt-1 lg:pt-0">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start sm:items-center gap-3 md:gap-4">
                                <BankLogo bank={bank.name} size="md" className="md:w-12 md:h-12 group-hover:scale-105 transition-all duration-300 shrink-0" />
                                <div>
                                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1">
                                    <h3 className="text-base md:text-lg font-black text-natural-sage tracking-tight">{bank.name}</h3>
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                                      {bank.categoryGroup}
                                    </span>
                                    {bank.hasFemaleConcession && (
                                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                        Women Concession
                                      </span>
                                    )}
                                    <div className="flex items-center gap-0.5 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md text-[8.5px] font-black border border-amber-100/50">
                                      <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" /> {bank.rating}
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[8.5px] md:text-[9px] font-black text-natural-muted uppercase tracking-[0.15em]">
                                    <span className="flex items-center gap-1 text-emerald-600 font-extrabold uppercase"><Sparkles className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" /> {bank.finalScore}% Match</span>
                                    <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {bank.processingTime}</span>
                                    <span className="flex items-center gap-1"><Activity className="w-2.5 h-2.5" /> {bank.probability} Confidence</span>
                                  </div>
                                </div>
                              </div>

                              {/* Promotional Scheme Highlight */}
                              {bank.currentScheme && (
                                <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl px-3 py-1.5 text-xs text-amber-900 font-medium line-clamp-1">
                                  <strong className="font-bold text-amber-950">Offer: </strong>{bank.currentScheme}
                                </div>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-1.5">
                                {bank.features.slice(0, 3).map(f => (
                                  <span key={f} className="px-2 py-0.5 bg-white text-natural-muted rounded-md text-[8px] md:text-[9px] font-bold tracking-tight border border-natural-border shadow-2xs flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> {f}
                                  </span>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPolicyModalLender(bank);
                                    setIsPolicyModalOpen(true);
                                  }}
                                  className="px-2.5 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-[8px] md:text-[9px] font-bold transition-colors cursor-pointer border border-stone-200 flex items-center gap-1"
                                >
                                  <Info className="w-2.5 h-2.5 text-stone-500" /> View Policy Norms
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-between lg:justify-center bg-natural-bg/50 p-3 lg:p-4 rounded-xl border border-natural-border/50 text-center gap-2 lg:space-y-2 lg:min-w-[200px]">
                              <div className="text-center w-full">
                                <p className="text-xl md:text-2xl font-black text-natural-sage tracking-tighter tabular-nums">{bank.rate}</p>
                                <p className="text-[7.5px] md:text-[8px] font-black text-natural-muted uppercase tracking-[0.2em] mt-0.5">Calculated Interest Rate</p>
                              </div>
                              <div className="text-center w-full border-t lg:border-t border-slate-200/50 pt-1">
                                <p className="text-sm md:text-base font-extrabold text-natural-terracotta tracking-tight tabular-nums">₹{bank.estEMI?.toLocaleString('en-IN') || '0'}/mo</p>
                                <p className="text-[7.5px] md:text-[8px] font-black text-natural-muted uppercase tracking-[0.2em] mt-0.5">Estimated Monthly EMI</p>
                              </div>
                              <button 
                                onClick={() => {
                                  updateForm('selectedBank', bank);
                                  handleSubmit(bank);
                                }}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto lg:w-full bg-[#10B981] text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 hover:bg-[#0e9f6e] transition-all shadow-md group/btn cursor-pointer"
                              >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Apply Now <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" /></>}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Expand or Collapse all 43+ institutions toggle */}
                    {getBankRecommendations().length > 6 && (
                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAllStep9Offers(prev => !prev)}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                        >
                          {showAllStep9Offers ? (
                            <span>Collapse to Top 6 Recommendations</span>
                          ) : (
                            <span>Explore All {getBankRecommendations().length} Institutional Lenders</span>
                          )}
                          <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showAllStep9Offers && "rotate-180")} />
                        </button>
                      </div>
                    )}

                    {/* Maximum Loan Eligibility & Scenarios Matrix (Placed After Banks) */}
                    {activeAssessment && (
                      <div className={cn(
                        "p-5 md:p-7 rounded-2xl md:rounded-3xl border shadow-xs space-y-4 md:space-y-5 text-left overflow-hidden",
                        (activeAssessment.status as string) === 'Low' ? "bg-red-50/40 border-red-200" : "bg-white border-natural-border/70"
                      )}>
                        {/* Header with Calculated Limit */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-natural-border/50 pb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center">
                                <Calculator className="w-4 h-4" />
                              </div>
                              <h4 className="text-sm md:text-base font-black text-natural-sage tracking-tight">
                                Maximum Loan Eligibility & Potential Scenarios
                              </h4>
                              <span className="px-2 py-0.5 bg-natural-terracotta/10 text-natural-terracotta rounded-full text-[8px] font-black uppercase">
                                AI Underwritten
                              </span>
                            </div>
                            <p className="text-[10px] md:text-xs text-natural-muted font-medium">
                              Live policy limits calculated based on FOIR, RBI statutory LTV caps, and tenure age limits.
                            </p>
                          </div>

                          <div className="bg-natural-bg/70 px-4 py-2.5 rounded-xl border border-natural-border/60 flex items-baseline gap-2 shrink-0">
                            <div>
                              <span className="text-[8px] font-black text-natural-muted uppercase tracking-widest block">Est. Maximum Limit</span>
                              <span className={cn(
                                "text-xl md:text-2xl font-black tracking-tight tabular-nums",
                                (activeAssessment.status as string) === 'Low' ? "text-red-600" : "text-natural-sage"
                              )}>
                                ₹{activeAssessment.maxEligibleAmount >= 100 ? (activeAssessment.maxEligibleAmount / 100).toFixed(2) + ' Cr' : activeAssessment.maxEligibleAmount + ' Lakhs'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Point-by-point Underwriting Drivers */}
                        <div className="space-y-2">
                          <h5 className="text-[8.5px] md:text-[9.5px] font-black text-natural-muted uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-[#10B981]" /> Key Underwriting Drivers
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-2.5 text-xs">
                            <div className="bg-natural-bg/40 p-2.5 md:p-3 rounded-xl border border-natural-border/40 space-y-0.5">
                              <span className="text-[8px] font-black uppercase tracking-wider text-natural-muted block">Property LTV Ceiling</span>
                              <p className="font-bold text-natural-sage text-[11px]">
                                Max 80% (₹{(((formData.propertyValue || (formData.loanAmount ? formData.loanAmount / 0.8 : 5000000)) * 0.8) / 100000).toFixed(1)} L)
                              </p>
                              <span className="text-[9px] text-natural-muted block">RBI statutory cap on property valuation</span>
                            </div>

                            <div className="bg-natural-bg/40 p-2.5 md:p-3 rounded-xl border border-natural-border/40 space-y-0.5">
                              <span className="text-[8px] font-black uppercase tracking-wider text-natural-muted block">FOIR Debt Capacity</span>
                              <p className="font-bold text-natural-sage text-[11px]">
                                50% - 60% of Net Inflow
                              </p>
                              <span className="text-[9px] text-natural-muted block">Based on ₹{(formData.monthlySalary || formData.monthlyRevenue || 0).toLocaleString('en-IN')}/mo inflow</span>
                            </div>

                            <div className="bg-natural-bg/40 p-2.5 md:p-3 rounded-xl border border-natural-border/40 space-y-0.5">
                              <span className="text-[8px] font-black uppercase tracking-wider text-natural-muted block">Tenure Maturity Horizon</span>
                              <p className="font-bold text-natural-sage text-[11px]">
                                {formData.tenure || 20} Years Requested
                              </p>
                              <span className="text-[9px] text-natural-muted block">Retires before age 60/65 policy cap</span>
                            </div>

                            <div className="bg-natural-bg/40 p-2.5 md:p-3 rounded-xl border border-natural-border/40 space-y-0.5">
                              <span className="text-[8px] font-black uppercase tracking-wider text-natural-muted block">Credit Tier</span>
                              <p className="font-bold text-emerald-600 text-[11px]">
                                CIBIL: {formData.cibilScore || 750}+
                              </p>
                              <span className="text-[9px] text-natural-muted block">Qualifies for Tier-1 prime risk pricing</span>
                            </div>
                          </div>
                        </div>

                        {/* Concise Underwriting Summary */}
                        {activeAssessment.reasoning && (
                          <div className="bg-natural-bg/30 p-2.5 md:p-3 rounded-xl border-l-2 border-natural-terracotta/40 text-[10px] md:text-[11px] font-medium text-natural-muted italic leading-relaxed">
                            "{activeAssessment.reasoning}"
                          </div>
                        )}

                        {/* Possibilities & Scenarios Table */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[8.5px] md:text-[9.5px] font-black text-natural-muted uppercase tracking-[0.2em] flex items-center gap-1.5">
                              <Table className="w-3 h-3 text-natural-terracotta" /> Eligibility Scenarios & Possibilities
                            </h5>
                            <span className="text-[8.5px] font-bold text-natural-muted">Benchmark Rate: ~8.50% p.a.</span>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-natural-border">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-natural-bg/80 border-b border-natural-border text-[8px] md:text-[9px] font-black uppercase tracking-wider text-natural-muted">
                                  <th className="py-2 px-3 md:px-4">Scenario / Option</th>
                                  <th className="py-2 px-3 md:px-4">Max Loan Possibility</th>
                                  <th className="py-2 px-3 md:px-4">Est. Monthly EMI</th>
                                  <th className="py-2 px-3 md:px-4">Key Unlocking Factor</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-natural-border/50 text-[10.5px] md:text-xs">
                                {(() => {
                                  const baseMax = activeAssessment?.maxEligibleAmount || Math.round((formData.loanAmount || 3000000) / 100000);
                                  const currentT = formData.tenure || 20;
                                  const r = 8.5 / 12 / 100;
                                  
                                  const emiFor = (amtLakhs: number, yrs: number) => {
                                    const p = amtLakhs * 100000;
                                    const n = yrs * 12;
                                    if (n === 0 || r === 0) return 0;
                                    return Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
                                  };

                                  const curMax = baseMax;
                                  // Adding co-applicant combines dual income streams, expanding debt FOIR and sanction capability by +35%
                                  const coMax = Math.round(curMax * 1.35);
                                  const extYrs = Math.min(30, Math.max(currentT + 5, 65 - (formData.age || 30)));
                                  const extMax = extYrs > currentT ? Math.round(curMax * (1 + (extYrs - currentT) * 0.022)) : Math.round(curMax * 1.10);
                                  const debtFreeMax = Math.round(curMax * 1.20);

                                  const scenarios = [
                                    {
                                      title: 'Current Application Profile',
                                      tag: 'As Submitted',
                                      tagClass: 'bg-slate-100 text-slate-700',
                                      amount: curMax,
                                      tenure: `${currentT} Yrs`,
                                      emi: emiFor(curMax, currentT),
                                      factor: 'Standard income & FOIR ratio as submitted'
                                    },
                                    {
                                      title: 'Add Co-Applicant (Spouse/Family)',
                                      tag: '+35% Capacity',
                                      tagClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
                                      amount: coMax,
                                      tenure: `${currentT} Yrs`,
                                      emi: emiFor(coMax, currentT),
                                      factor: 'Combines dual household income to increase allowable FOIR cap'
                                    },
                                    {
                                      title: `Tenure Extension to ${extYrs} Years`,
                                      tag: 'Lower Monthly Outflow',
                                      tagClass: 'bg-blue-50 text-blue-700 border border-blue-200/50',
                                      amount: extMax,
                                      tenure: `${extYrs} Yrs`,
                                      emi: emiFor(extMax, extYrs),
                                      factor: 'Stretches repayment horizon to maximize eligible principal'
                                    },
                                    {
                                      title: 'Post Closure of Active Loans',
                                      tag: 'Full Disposable FOIR',
                                      tagClass: 'bg-amber-50 text-amber-700 border border-amber-200/50',
                                      amount: debtFreeMax,
                                      tenure: `${currentT} Yrs`,
                                      emi: emiFor(debtFreeMax, currentT),
                                      factor: 'Eliminates existing EMI deductions from monthly disposable income'
                                    }
                                  ];

                                  return scenarios.map((s, idx) => (
                                    <tr key={idx} className="hover:bg-natural-bg/30 transition-colors">
                                      <td className="py-2.5 px-3 md:px-4 font-bold text-natural-sage">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span>{s.title}</span>
                                          <span className={cn("text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded", s.tagClass)}>
                                            {s.tag}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-3 md:px-4 font-black text-natural-sage tabular-nums whitespace-nowrap">
                                        ₹{s.amount >= 100 ? (s.amount / 100).toFixed(2) + ' Cr' : s.amount + ' Lakhs'}
                                      </td>
                                      <td className="py-2.5 px-3 md:px-4 font-extrabold text-[#10B981] tabular-nums whitespace-nowrap">
                                        ₹{s.emi.toLocaleString('en-IN')}/mo
                                      </td>
                                      <td className="py-2.5 px-3 md:px-4 text-natural-muted font-medium text-[10px] md:text-[11px]">
                                        {s.factor}
                                      </td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center pt-8">
                  <button 
                    onClick={() => { setActiveTab('dashboard'); setLoanStep(1); }}
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-natural-muted hover:text-natural-terracotta transition-all inline-block border-b-2 border-transparent hover:border-natural-terracotta pb-2"
                  >
                    Reset Optimization Loop
                  </button>
                </div>
              </motion.div>
            )}

            {loanStep === 10 && (
              <motion.div 
                key="step10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="text-center space-y-8">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                      <Check className="w-12 h-12 text-white" />
                    </div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.2 }}
                      className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 bg-natural-bg px-8 py-4 rounded-[1.5rem] border border-natural-border/50">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-muted">Reference:</span>
                      <span className="text-sm font-bold text-natural-terracotta tracking-wider">PAR-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-3xl border border-natural-border/20 text-left space-y-8 md:space-y-10 overflow-hidden">
                  <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-natural-muted border-b border-natural-border/30 pb-6 flex items-center gap-4">
                    <Zap className="w-4 h-4 text-amber-500" /> What Happens Next?
                  </h4>
                  
                  <div className="space-y-10 md:space-y-12 relative px-2 md:px-4">
                    <div className="absolute left-[1.125rem] top-2 bottom-2 w-px bg-natural-border/40 border-dashed border-l" />
                    
                    {[
                      { 
                        title: 'Advisor Call', 
                        desc: 'A senior loan consultant will call you to confirm property details and verify your income documents.', 
                        icon: Clock, 
                        status: 'upcoming',
                        time: '15 Mins'
                      },
                      { 
                        title: 'Digital Vault', 
                        desc: 'We\'ve sent a link to your email to upload your IT Returns and Salary Slips for bank submission.', 
                        icon: FileUp, 
                        status: 'pending',
                        time: 'Self Paced'
                      },
                      { 
                        title: 'Property Audit', 
                        desc: 'Bank engineers will visit the property location for technical and legal valuation.', 
                        icon: Building2, 
                        status: 'pending',
                        time: '2-3 Days'
                      }
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-4 md:gap-8 relative group">
                        <div className={cn(
                          "w-10 h-10 rounded-xl md:rounded-2xl flex items-center justify-center z-10 shrink-0 shadow-lg transition-transform group-hover:scale-110",
                          step.status === 'upcoming' 
                            ? "bg-natural-terracotta text-white ring-4 ring-natural-terracotta/10" 
                            : "bg-white border-2 border-natural-bg text-natural-muted"
                        )}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-1 md:space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <p className="font-black text-base md:text-lg text-natural-sage tracking-tight">{step.title}</p>
                            <span className="w-fit text-[8px] md:text-[9px] font-black uppercase tracking-widest text-natural-terracotta bg-natural-terracotta/5 px-2 md:px-3 py-1 rounded-lg">
                              {step.time}
                            </span>
                          </div>
                          <p className="text-[10px] md:text-[11px] text-natural-muted leading-relaxed font-medium">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {onBackToLanding && (
                  <div className="pt-10 flex justify-center">
                    <button
                      onClick={onBackToLanding}
                      className="bg-parrot-green hover:bg-parrot-green/90 text-white rounded-2xl px-8 py-4 font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Home className="w-4 h-4" /> Back to Homepage
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
      case 'recommendations':
        return (() => {
        const allRecommendations = getBankRecommendations();
        const categoryGroups: { id: LenderCategoryGroup; label: string; count: number }[] = [
          { id: 'All', label: 'All Lenders', count: allRecommendations.length },
          { id: 'PSU Banks', label: 'PSU Banks', count: allRecommendations.filter(r => r.categoryGroup === 'PSU Banks').length },
          { id: 'Private Banks', label: 'Private Banks', count: allRecommendations.filter(r => r.categoryGroup === 'Private Banks').length },
          { id: 'HFCs & NBFCs', label: 'HFCs & NBFCs', count: allRecommendations.filter(r => r.categoryGroup === 'HFCs & NBFCs').length },
          { id: 'Small Finance Banks', label: 'Small Finance Banks', count: allRecommendations.filter(r => r.categoryGroup === 'Small Finance Banks').length },
        ];

        const filteredRecommendations = allRecommendations.filter((rec) => {
          const matchesCategory = selectedCategoryGroup === 'All' || rec.categoryGroup === selectedCategoryGroup;
          const q = lenderSearchQuery.toLowerCase().trim();
          if (!q) return matchesCategory;
          const matchesSearch = 
            rec.name.toLowerCase().includes(q) ||
            (rec.shortName && rec.shortName.toLowerCase().includes(q)) ||
            (rec.category && rec.category.toLowerCase().includes(q)) ||
            (rec.currentScheme && rec.currentScheme.toLowerCase().includes(q)) ||
            rec.features.some(f => f.toLowerCase().includes(q));
          return matchesCategory && matchesSearch;
        });

        return (
        <div className="space-y-8 md:space-y-10 relative pb-28">
           {/* Page Header */}
           <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 px-4 md:px-0">
             <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2 border border-emerald-200">
                 <Sparkles className="w-3 h-3 text-emerald-600" />
                 <span>43+ Institutional Lenders Live Dataset</span>
               </div>
               <h2 className="text-3xl md:text-4xl font-black text-natural-sage tracking-tight mb-2">Compare Best Rates.</h2>
               <p className="text-natural-muted font-medium text-sm md:text-base max-w-3xl">
                 Comprehensive institutional underwriting norms across Public Sector Banks, Private Banks, Housing Finance Companies, and SFBs with live algorithmic risk loaders.
               </p>
             </div>

             <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
               <a
                 href="/Bank_and_NBFC_Home_Loan_and_LAP_Guidelines.xlsx"
                 download="Bank_and_NBFC_Home_Loan_and_LAP_Guidelines.xlsx"
                 className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                 title="Download Complete 43+ Lenders Policy Matrix in Excel"
               >
                 <Download className="w-4 h-4 text-emerald-600" />
                 <span>Download Excel</span>
               </a>

               <OffersSortingDropdown
                 value={offersSortBy}
                 onChange={setOffersSortBy}
                 totalOffersCount={allRecommendations.length}
               />

               {selectedCompareBanks.length < 2 ? (
                 <button
                   onClick={() => {
                     const top3 = allRecommendations.slice(0, 3).map(b => b.name);
                     setSelectedCompareBanks(top3);
                   }}
                   className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                 >
                   <Sparkles className="w-4 h-4 text-emerald-600" />
                   <span>Compare Top 3</span>
                 </button>
               ) : (
                 <div className="flex items-center gap-2">
                   <button
                     onClick={() => setIsCompareOpen(true)}
                     className="flex items-center gap-2 px-4 py-2.5 bg-natural-sage hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                   >
                     <span>Side-by-Side ({selectedCompareBanks.length})</span>
                   </button>
                   <button
                     onClick={() => setSelectedCompareBanks([])}
                     className="px-3 py-2.5 text-natural-muted hover:text-red-600 text-xs font-bold transition-colors cursor-pointer"
                   >
                     Clear
                   </button>
                 </div>
               )}
             </div>
           </div>

           {/* Filter & Search Bar */}
           <div className="bg-stone-50/80 border border-stone-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 px-4 md:px-5">
             {/* Category Filter Pills */}
             <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
               {categoryGroups.map((cat) => {
                 const isSelected = selectedCategoryGroup === cat.id;
                 return (
                   <button
                     key={cat.id}
                     type="button"
                     onClick={() => setSelectedCategoryGroup(cat.id)}
                     className={cn(
                       "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                       isSelected
                         ? "bg-natural-sage text-white shadow-xs"
                         : "bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200"
                     )}
                   >
                     <span>{cat.label}</span>
                     <span className={cn(
                       "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                       isSelected ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                     )}>
                       {cat.count}
                     </span>
                   </button>
                 );
               })}
             </div>

             {/* Search Input */}
             <div className="relative min-w-[240px] md:w-72">
               <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
               <input
                 type="text"
                 value={lenderSearchQuery}
                 onChange={(e) => setLenderSearchQuery(e.target.value)}
                 placeholder="Search 43+ lenders, schemes..."
                 className="w-full pl-10 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
               />
               {lenderSearchQuery && (
                 <button
                   onClick={() => setLenderSearchQuery('')}
                   className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                 >
                   <X className="w-3.5 h-3.5" />
                 </button>
               )}
             </div>
           </div>

           {/* DYNAMIC OFFER COMPARISON BAR CHART SECTION (When 2+ offers selected) */}
           {selectedCompareBanks.length >= 2 && (
             <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3 }}
             >
               <OffersComparisonChart
                 selectedBanks={allRecommendations.filter(b => selectedCompareBanks.includes(b.name))}
                 defaultLoanAmount={formData.loanAmount || 4500000}
                 defaultTenureYears={20}
                 onSelectBank={(bank) => {
                   updateForm('selectedBank', bank);
                   setActiveTab('loans');
                   setLoansViewMode('apply');
                   if (formData.loanAmount > 0) {
                     setLoanStep(8);
                   } else {
                     setLoanStep(1);
                   }
                 }}
                 onClearSelection={() => setSelectedCompareBanks([])}
               />
             </motion.div>
           )}
           
           {/* Offers Cards Grid */}
           {filteredRecommendations.length === 0 ? (
             <div className="text-center py-16 bg-white rounded-3xl border border-natural-border/60 p-8 space-y-3">
               <Building2 className="w-12 h-12 text-stone-300 mx-auto" />
               <h4 className="text-base font-bold text-stone-700">No lenders match your search</h4>
               <p className="text-xs text-stone-500 max-w-sm mx-auto">
                 Try selecting "All Lenders" or clearing your search keywords.
               </p>
               <button
                 onClick={() => {
                   setSelectedCategoryGroup('All');
                   setLenderSearchQuery('');
                 }}
                 className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
               >
                 Reset Filters
               </button>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4 md:px-0">
                {filteredRecommendations.map((rec, i) => (
                  <div key={rec.name} className="bg-white border border-natural-border/70 hover:border-emerald-500/50 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between group overflow-hidden">
                     {/* Top Action & Badge Row */}
                     <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 mb-4">
                       <button
                         onClick={() => {
                           const isSelected = selectedCompareBanks.includes(rec.name);
                           if (isSelected) {
                             setSelectedCompareBanks(prev => prev.filter(name => name !== rec.name));
                           } else {
                             if (selectedCompareBanks.length >= 5) {
                               alert("You can compare up to 5 banks simultaneously.");
                               return;
                             }
                             setSelectedCompareBanks(prev => [...prev, rec.name]);
                           }
                         }}
                         className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer border ${
                           selectedCompareBanks.includes(rec.name)
                             ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs scale-[1.02]'
                             : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                         }`}
                       >
                         {selectedCompareBanks.includes(rec.name) ? (
                           <>
                             <Check className="w-3 h-3 stroke-[3]" /> Added to Compare
                           </>
                         ) : (
                           <>
                             <Plus className="w-3 h-3 text-[#10B981] stroke-[3]" /> Compare
                           </>
                         )}
                       </button>
                       <div className="flex items-center gap-1.5">
                         <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[9px] font-bold rounded-md border border-stone-200">
                           {rec.categoryGroup}
                         </span>
                         <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 flex items-center gap-1">
                           <Sparkles className="w-3 h-3 text-emerald-500 fill-emerald-500" /> {rec.finalScore || rec.score || 90}% Match
                         </span>
                       </div>
                     </div>

                     <div className="space-y-4">
                       {/* Bank Header Section */}
                       <div className="flex items-start gap-3.5">
                         <BankLogo bank={rec.name} size="md" className="md:w-12 md:h-12 group-hover:scale-105 transition-all duration-300 shrink-0" />
                         <div>
                           <h3 className="text-lg font-black text-natural-sage tracking-tight leading-tight">{rec.name}</h3>
                           <div className="flex flex-wrap items-center gap-2 mt-1 text-natural-muted font-bold text-[10px]">
                             <div className="flex items-center gap-1">
                               <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                               <span>{rec.rating.toFixed(1)}</span>
                             </div>
                             <span className="text-stone-300">•</span>
                             <span className="text-stone-500">{rec.processingTime} TAT</span>
                             {rec.hasFemaleConcession && (
                               <>
                                 <span className="text-stone-300">•</span>
                                 <span className="text-emerald-700 font-semibold">Women Concession</span>
                               </>
                             )}
                           </div>
                         </div>
                       </div>

                       {/* Current Scheme Banner (if any) */}
                       {rec.currentScheme && (
                         <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl px-3 py-2 text-xs text-amber-900 font-medium line-clamp-2">
                           <strong className="font-bold text-amber-950">Active Scheme: </strong>{rec.currentScheme}
                         </div>
                       )}

                       {/* Rate & Estimated EMI Box */}
                       <div className="bg-natural-bg/50 border border-natural-border/40 rounded-2xl p-3.5 flex items-center justify-between group-hover:bg-natural-bg transition-colors duration-300">
                         <div className="text-left flex-1">
                           <span className="text-[8.5px] font-black text-natural-muted uppercase tracking-wider block">Indicative Rate</span>
                           <p className="text-2xl font-black text-natural-text mt-0.5 tracking-tight tabular-nums">{rec.rate}</p>
                         </div>
                         <div className="text-right border-l border-natural-border/50 pl-3 py-0.5 flex-1">
                           <span className="text-[8.5px] font-black text-natural-muted uppercase tracking-wider block">Est. Monthly EMI</span>
                           <p className="text-base font-extrabold text-natural-terracotta mt-0.5 tabular-nums">₹{rec.estEMI?.toLocaleString('en-IN') || '0'}</p>
                         </div>
                       </div>

                       {/* Processing Fee Info */}
                       <div className="flex items-center justify-between text-[11px] px-1 text-stone-600 font-medium">
                         <span>Processing Fee:</span>
                         <span className="font-bold text-stone-800 text-right truncate max-w-[170px]" title={rec.processingFee}>
                           {rec.processingFee}
                         </span>
                       </div>

                       {/* Feature badges */}
                       <div className="flex flex-wrap gap-1 pt-1">
                         {rec.features.map(t => (
                           <span key={t} className="px-2 py-0.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-[8.5px] font-semibold tracking-tight rounded-md border border-stone-200 transition-colors">
                             ✓ {t}
                           </span>
                         ))}
                       </div>
                     </div>

                     {/* Footer CTAs */}
                     <div className="mt-5 pt-3.5 border-t border-natural-border/30 flex items-center justify-between gap-2">
                       <button
                         type="button"
                         onClick={() => {
                           setPolicyModalLender(rec);
                           setIsPolicyModalOpen(true);
                         }}
                         className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-stone-200 flex items-center gap-1.5"
                       >
                         <Info className="w-3 h-3 text-stone-500" />
                         <span>Policy Norms</span>
                       </button>

                       <button 
                         onClick={() => {
                           updateForm('selectedBank', rec);
                           setActiveTab('loans');
                           setLoansViewMode('apply');
                           if (formData.loanAmount > 0) {
                             setLoanStep(8);
                           } else {
                             setLoanStep(1);
                           }
                         }}
                         className="bg-[#10B981] hover:bg-[#0e9f6e] text-white rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 duration-200"
                       >
                         Select Offer <ArrowRight className="w-3 h-3" />
                       </button>
                     </div>
                  </div>
                ))}
             </div>
           )}

           {/* Floating Compare Docking Bar */}
           {selectedCompareBanks.length > 0 && (
             <motion.div 
               initial={{ y: 100, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-natural-sage text-white px-6 md:px-8 py-4 rounded-[2rem] shadow-huge border border-white/10 flex items-center justify-between gap-8 z-40 max-w-lg w-11/12 md:w-full group"
             >
               {/* Hover Quick Preview Tooltip */}
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-natural-sage/95 backdrop-blur-md text-white border border-white/15 p-3.5 rounded-2xl shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-300 ease-out w-64 z-50 flex flex-col gap-2">
                 <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                     Quick Preview
                   </p>
                   <span className="text-[8px] opacity-60 font-mono">
                     {selectedCompareBanks.length}/3 banks
                   </span>
                 </div>
                 <div className="space-y-1.5 font-sans">
                   {selectedCompareBanks.map((bankName) => (
                     <div key={bankName} className="flex items-center gap-2 text-[11px] font-semibold text-white/90">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                       <span className="truncate">{bankName}</span>
                     </div>
                   ))}
                 </div>
                 {/* Tooltip Chevron Indicator */}
                 <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-t-8 border-t-natural-sage/95 border-x-8 border-x-transparent w-0 h-0" />
               </div>

               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white font-black text-sm">
                   {selectedCompareBanks.length}
                 </div>
                 <div>
                   <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                     Compare Pool 
                     <span className="text-[10px] bg-white/20 text-white font-black px-2 py-0.5 rounded-full lowercase tracking-normal font-sans">
                       {selectedCompareBanks.length} {selectedCompareBanks.length === 1 ? 'bank' : 'banks'} selected
                     </span>
                   </p>
                   <p className="text-[10px] text-white/70 font-medium">
                     {selectedCompareBanks.join(', ')}
                   </p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setSelectedCompareBanks([])}
                   className="text-[10px] font-black uppercase tracking-widest text-[#10B981] hover:text-[#0e9f6e] transition-colors"
                 >
                   Clear All
                 </button>
                 <button 
                   disabled={selectedCompareBanks.length < 2}
                   onClick={() => setIsCompareOpen(true)}
                   className="bg-[#10B981] text-white px-5 py-3 rounded-[1.25rem] font-sans font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                 >
                   Compare Now
                 </button>
               </div>
             </motion.div>
           )}

           {/* Side-by-Side Comparison Matrix Modal with Total Interest Difference */}
           <OfferComparisonMatrixModal
             isOpen={isCompareOpen}
             onClose={() => setIsCompareOpen(false)}
             selectedBanks={selectedCompareBanks
               .map(bankName => getBankRecommendations().find(b => b.name === bankName))
               .filter(Boolean) as any[]
             }
             defaultLoanAmount={formData.loanAmount || 4500000}
             defaultTenureYears={Number(formData.tenure) || 20}
             onSelectBank={(bank) => {
               updateForm('selectedBank', bank);
               setIsCompareOpen(false);
               setActiveTab('loans');
               setLoansViewMode('apply');
               if (formData.loanAmount > 0) {
                 setLoanStep(8);
               } else {
                 setLoanStep(1);
               }
             }}
             onRemoveBank={(bankName) => {
               setSelectedCompareBanks(prev => prev.filter(n => n !== bankName));
             }}
           />
        </div>
      );
    })();
      case 'admin': 
        if (!isAdminAuthenticated) {
          return (
            <LoginPage 
              initialMode="admin"
              onBack={() => setActiveTab('dashboard')}
              onLoginSuccess={() => {
                setIsAdminAuthenticated(true);
                localStorage.setItem('parrot_admin_auth', 'true');
              }}
            />
          );
        }
        return (
          <AdminDashboard 
            users={allUsers} 
            loans={allLoans} 
            isLoadingUsers={isAllUsersLoading}
            isLoadingLoans={isAllLoansLoading}
            usersError={allUsersError}
            loansError={allLoansError}
            banks={banksList}
            isLoadingBanks={isBanksLoading}
            isSheetsConnected={isSheetsConnected}
            onConnectSheets={handleConnectGoogleSheets}
            sheetsError={googleSheetsError}
            algorithmParams={algorithmParams}
            onBackToApp={() => setActiveTab('dashboard')}
            onSaveAlgorithmParams={async (newParams) => {
              try {
                const { doc, setDoc } = await import('firebase/firestore');
                await setDoc(doc(db, 'config', 'algorithm'), newParams);
                setAlgorithmParams(newParams);
                localStorage.setItem('parrot_algorithm_params', JSON.stringify(newParams));
              } catch (err) {
                console.warn("Firestore save failed, saving dynamically to localStorage", err);
                setAlgorithmParams(newParams);
                localStorage.setItem('parrot_algorithm_params', JSON.stringify(newParams));
              }
            }}
          />
        );
      case 'about': return <AboutUs onBack={() => setActiveTab('dashboard')} />;
      case 'calendar': return <CalendarBooking />;
      case 'workspace': return <WorkspaceHub />;
      case 'settings': return <div className="p-20 text-center font-black text-natural-sage italic text-4xl">Platform Settings coming soon.</div>;
      default: 
        return (
          <DashboardView 
            onNewLoan={() => { setActiveTab('loans'); setLoanStep(1); }} 
            loans={loans} 
            setActiveTab={setActiveTab}
            setLoansViewMode={setLoansViewMode}
            setLoanStep={setLoanStep}
            setFormData={setFormData}
            pendingNotice={pendingNotice}
            setPendingNotice={setPendingNotice}
            isLoading={isLoansLoading}
            error={loansError}
          />
        );
    }
  };

  const isQuestionnaire = activeTab === 'loans' && loansViewMode === 'apply';

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text pb-24 md:pb-0">
      {!isQuestionnaire && (
        <SideBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          role={profile?.role} 
          isExistingUser={isExistingUser} 
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
      )}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} role={profile?.role} isExistingUser={isExistingUser} />
      {!isQuestionnaire && (
        <Header 
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
      )}
      <main className={cn(
        "max-w-screen-2xl mx-auto w-full transition-all duration-300",
        isQuestionnaire 
          ? "p-1 sm:p-3 md:p-6 md:pt-4 md:ml-0" 
          : (isSidebarCollapsed ? "md:ml-0 p-4 md:p-14" : "md:ml-72 p-4 md:p-14")
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
        {showRatingId && (
          <RatingModal 
            lenderName={loans.find(l => l.id === showRatingId)?.selectedBank?.name || 'Lender'} 
            loanId={showRatingId}
            onClose={() => setShowRatingId(null)}
            onSubmit={handleRatingSubmit}
          />
        )}

        {/* Global Institutional Credit Policy & Underwriting Norms Modal */}
        <LenderPolicyModal
          isOpen={isPolicyModalOpen}
          onClose={() => setIsPolicyModalOpen(false)}
          lender={policyModalLender}
          onApply={(lender) => {
            updateForm('selectedBank', lender);
            setIsPolicyModalOpen(false);
            setActiveTab('loans');
            setLoansViewMode('apply');
            if (formData.loanAmount > 0) {
              setLoanStep(8);
            } else {
              setLoanStep(1);
            }
          }}
        />

        <AnimatePresence>
          {isAnalyzing && <AnalysisPortal progress={analysisProgress} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function AuthErrorNotification() {
  const { error, clearError } = useAuth();

  return (
    <AnimatePresence>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-10 left-1/2 z-[200] max-w-sm w-full bg-red-600 text-white p-6 rounded-[2rem] shadow-huge flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="text-xs font-bold leading-tight">{error}</p>
          </div>
          <button onClick={clearError} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X className="w-5 h-5 cursor-pointer" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AppContent() {
  const { user, loading, loginWithGoogle, continueAsGuest } = useAuth();
  const [viewState, setViewState] = React.useState<'landing' | 'app' | 'login'>('landing');
  const [loginInitialRole, setLoginInitialRole] = React.useState<'customer' | 'admin'>('customer');
  const [initialAppTab, setInitialAppTab] = React.useState<'loans' | 'dashboard' | 'calculator' | 'recommendations' | 'admin' | 'about' | 'settings' | 'calendar' | 'workspace'>('loans');
  const [showCookieSettings, setShowCookieSettings] = React.useState(false);
  
  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center space-y-4 bg-natural-bg">
       <div className="p-4 bg-natural-sage text-white rounded-2xl animate-pulse shadow-lg">
         <Building2 className="w-10 h-10" />
       </div>
       <p className="text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse text-natural-muted">Synchronizing Security Systems</p>
    </div>
  );

  const handleStartApp = async (category?: string) => {
    if (category) {
      localStorage.setItem('pendingLoanCategory', category);
    }

    try {
      await continueAsGuest();
      setInitialAppTab('loans');
      setViewState('app');
    } catch (err) {
      console.error('Could not establish guest session:', err);
    }
  };

  const handleBackToLanding = () => {
    setViewState('landing');
  };
  
  return (
    <>
      {viewState === 'landing' ? (
        <LandingView 
          onStartQuestionnaire={handleStartApp} 
          onCookieSettingsClick={() => setShowCookieSettings(true)} 
          onLoginClick={(mode) => {
            setLoginInitialRole(mode || 'customer');
            setViewState('login');
          }}
        />
      ) : viewState === 'login' ? (
        <LoginPage 
          initialMode={loginInitialRole}
          onBack={() => setViewState('landing')}
          onCustomerLoginSuccess={async (emailOrMobile) => {
            await loginWithEmailOrMobile(emailOrMobile);
            setInitialAppTab('dashboard');
            setViewState('app');
          }}
          onGoogleSignIn={async () => {
            await loginWithGoogle();
            setInitialAppTab('dashboard');
            setViewState('app');
          }}
          onAdminLoginSuccess={() => {
            setInitialAppTab('admin');
            setViewState('app');
          }}
          onLoginSuccess={(role) => {
            if (role === 'admin') {
              setInitialAppTab('admin');
            } else {
              setInitialAppTab('dashboard');
            }
            setViewState('app');
          }}
        />
      ) : (
        <AuthenticatedApp onBackToLanding={handleBackToLanding} initialTab={initialAppTab} />
      )}
      <AuthErrorNotification />
      <CookieConsentModal forceOpen={showCookieSettings} onCloseForceOpen={() => setShowCookieSettings(false)} />
      <ChatInterface />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
