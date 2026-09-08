import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, ShieldCheck, Sparkles, 
  Users, Heart, Brain, Target, 
  Zap, ArrowRight, MessageSquare,
  Globe, Award, Scale, Eye,
  CheckCircle2, Rocket, Flag,
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '../lib/utils';

export function AboutUs({ onBack }: { onBack?: () => void }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white text-parrot-navy selection:bg-parrot-green selection:text-white font-sans overflow-x-hidden">
      {/* GLOSSY NAV-LIKE TOP SPACER (For Fixed Nav) */}
      <div className="h-24" />

      {/* LUXURY HERO SECTION */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-24">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 100, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-parrot-green/5 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0], y: [0, 100, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-parrot-navy/5 rounded-full blur-[120px]"
          />
        </div>

        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
              <span className="w-2 h-2 rounded-full bg-parrot-green animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-parrot-navy/60">Founded 2021 • Built for India</span>
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-parrot-navy italic max-w-5xl mx-auto mb-10"
          >
            Rewriting the <span className="text-parrot-green">DNA</span> of Modern Assets.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed mb-12"
          >
            ParrotMoney is a tech-first mortgage ecosystem. We don’t just find loans; we engineer financial certainty using AI-driven match logic.
          </motion.p>
        </div>
      </section>

      {/* DUAL-TONE VISION & MISSION BOXES */}
      <section className="py-24 relative">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-px bg-slate-100 rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl">
            {/* Vision Page */}
            <div className="bg-white p-12 md:p-20 relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 transform translate-x-12 -translate-y-12">
                  <Eye className="w-64 h-64 text-parrot-navy" />
               </div>
               <div className="relative z-10 space-y-8">
                  <div className="w-16 h-16 rounded-2xl bg-parrot-navy/5 flex items-center justify-center text-parrot-navy">
                    <Eye className="w-8 h-8" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black italic text-parrot-navy">The Vision.</h3>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-md">
                      To build India's definitive digital infrastructure for mortgage liquidity, enabling homeownership for the next billion.
                    </p>
                  </div>
               </div>
            </div>

            {/* Mission Page */}
            <div className="bg-parrot-navy p-12 md:p-20 relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-10 scale-150 transform translate-x-12 -translate-y-12">
                  <Target className="w-64 h-64 text-parrot-green" />
               </div>
               <div className="relative z-10 space-y-8">
                  <div className="w-16 h-16 rounded-2xl bg-parrot-green/20 flex items-center justify-center text-parrot-green">
                    <Target className="w-8 h-8" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black italic text-white">The Mission.</h3>
                    <p className="text-xl text-white/60 font-medium leading-relaxed max-w-md">
                      To empower borrowers with real-time institutional data, eliminating brokerage bias and reducing loan processing TAT by 70%.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE ARE: BENTO STORY */}
      <section className="py-24 md:py-32 bg-slate-50/50">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Main Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7 space-y-12"
            >
              <div className="space-y-4">
                <h4 className="text-parrot-green font-black uppercase tracking-[0.2em] text-xs">Who We Are</h4>
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.95]">Precision in a World of <span className="text-slate-300">Estimates.</span></h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <p className="text-lg text-parrot-navy/80 font-bold leading-relaxed italic">
                    "We are fintech architects, data scientists, and mortgage experts unified by a single frustration: Complexity."
                  </p>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Founded in Gurugram, Parrot FinTech was born from the need to solve India's opaque lending market. We believe transparency shouldn't be a premium service.
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="text-slate-500 font-medium leading-relaxed">
                    By distilling 25+ lender algorithms into the ParrotScore™ engine, we've enabled homeowners to bypass the "agent economy" and deal directly with data-driven reality.
                  </p>
                  <div className="pt-6 flex items-center gap-4">
                    <div className="flex -space-x-3">
                       {[1,2,3,4].map(i => <img key={i} src={`https://i.pravatar.cc/150?u=${i+20}`} className="w-10 h-10 rounded-full border-2 border-white" alt="Team" />)}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">150+ Parrot Experts</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Side Image / Stats Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-5 relative"
            >
              <div className="h-full bg-parrot-navy rounded-[3.5rem] overflow-hidden relative group shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1000&auto=format&fit=crop" 
                  className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700" 
                  alt="Team Collaboration" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-parrot-navy via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-12 w-full space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-parrot-green rounded-xl flex items-center justify-center text-parrot-navy">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-white font-black italic text-xl tracking-tight">Market Disruptor 2024</span>
                  </div>
                  <p className="text-white/50 text-sm font-medium leading-relaxed italic">
                    "Ranked TOP-3 Emerging Fintech for Borrower Experience by Global Finance Review."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW WE WORK: THE BENTO INFOGRAPHIC */}
      <section className="py-24 md:py-32">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="text-center max-w-4xl mx-auto mb-20 space-y-4">
            <h4 className="text-parrot-green font-black uppercase tracking-[0.2em] text-xs">The Mechanism</h4>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-tight">Engineered for Transparency.</h2>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-white border border-slate-100 p-12 rounded-[3rem] shadow-xl space-y-8 relative overflow-hidden group">
               <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <Brain className="w-80 h-80 text-parrot-navy" />
               </div>
               <div className="w-16 h-16 bg-parrot-green/10 rounded-2xl flex items-center justify-center text-parrot-green">
                  <Brain className="w-8 h-8" />
               </div>
               <div className="space-y-4 max-w-md">
                  <h3 className="text-2xl font-black italic">The ParrotScore™ Match Engine</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Our core technology cross-references your profile against 25+ lender policy matrices. It doesn't just check credit score; it analyzes property location, occupation stability, and banking behavior to find your "Path of Least Resistance."
                  </p>
               </div>
               <div className="flex gap-4 items-center pt-8">
                  <div className="bg-slate-50 px-4 py-2 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest">200+ Parameters</div>
                  <div className="bg-slate-50 px-4 py-2 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest">&lt; 3ms Latency</div>
               </div>
            </div>

            <div className="md:col-span-4 bg-parrot-green p-12 rounded-[3rem] shadow-xl space-y-8 flex flex-col justify-between">
               <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                  <Globe className="w-8 h-8" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-2xl font-black italic text-parrot-navy">Institutional Access</h3>
                  <p className="text-parrot-navy/70 font-medium leading-relaxed">
                    Direct board-level integrations with Top-Tier Banks for faster appraisal and lower processing fees.
                  </p>
               </div>
               <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-white rounded-full animate-marquee" />
               </div>
            </div>

            <div className="md:col-span-4 bg-parrot-navy p-12 rounded-[3rem] shadow-xl space-y-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldCheck className="w-20 h-20" />
               </div>
               <div className="w-16 h-16 bg-parrot-green/20 rounded-2xl flex items-center justify-center text-parrot-green">
                  <ShieldCheck className="w-8 h-8" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-2xl font-black italic">Data Vault</h3>
                  <p className="text-white/50 font-medium leading-relaxed text-sm">
                    Bank-grade AES-256 encryption. Your privacy is our non-negotiable standard.
                  </p>
               </div>
            </div>

            <div className="md:col-span-8 bg-slate-50 border border-slate-200 p-12 rounded-[3rem] space-y-8 flex items-center gap-12 group">
               <div className="hidden lg:block w-40 h-40 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-inner overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=advisor" className="w-full h-full object-cover scale-110" alt="Advisor" />
               </div>
               <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-parrot-green" />
                    <h3 className="text-2xl font-black italic text-parrot-navy">The Human Advocate</h3>
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm">
                    Technology finds the deal; humans close it. Your dedicated Relationship Manager negotiates with lenders to shave off those extra decimal points from your ROI.
                  </p>
                  <button className="text-parrot-green font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform">
                    Meet the Team <ArrowUpRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* MILESTONES: STICKY VERTICAL TIMELINE */}
      <section className="py-24 md:py-32 bg-parrot-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            <pattern id="grid-white" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid-white)" />
          </svg>
        </div>

        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 relative z-10 flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/3 lg:sticky lg:top-32 h-fit space-y-8">
            <h4 className="text-parrot-green font-black uppercase tracking-[0.2em] text-xs">Progress</h4>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-tight text-white italic">The Parrot <br />Timeline.</h2>
            <p className="text-white/40 font-medium max-w-sm">From a single office in Gurugram to a nationwide digital marketplace.</p>
            <div className="pt-10">
               <div className="w-20 h-1 bg-parrot-green rounded-full" />
            </div>
          </div>

          <div className="lg:w-2/3 space-y-24">
            {[
              { year: "2021", event: "The Genesis", desc: "Parrot FinTech founded with a core team of 5, dedicated to solving mortgage opaque systems.", icon: Rocket },
              { year: "2022", event: "Algorithmic Breakthrough", desc: "ParrotScore™ v1.0 goes live, successfully matching the first 1,000 homeowners with 0.5% lower ROI.", icon: Zap },
              { year: "2023", event: "Scaling Confidence", desc: "Achieved 10,000+ successful disbursement assistances. Expanded lender network to 25+ institutions.", icon: Flag },
              { year: "2024", event: "National Expansion", desc: "Now serving 40+ cities. Launching automated document digital custody for zero-friction closing.", icon: Building2 }
            ].map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group relative pl-20"
              >
                <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-parrot-green group-hover:bg-parrot-green group-hover:text-parrot-navy transition-all duration-500 shadow-xl">
                  <m.icon className="w-5 h-5" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <span className="text-5xl font-black italic tracking-tighter text-white inline-block">{m.year}</span>
                     <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <h3 className="text-2xl font-black italic text-white">{m.event}</h3>
                  <p className="text-lg text-white/50 font-medium leading-relaxed max-w-xl italic">
                    "{m.desc}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS: DATA GRID */}
      <section className="py-24 bg-white">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              {[
                { val: "18k+", label: "Verified Homeowners", icon: Heart },
                { val: "₹4,200Cr", label: "Loan Disbursements Assisted", icon: Scale },
                { val: "25+", label: "Lender Integrations", icon: Building2 },
                { val: "4.8/5", label: "Platform Trust Score", icon: Award }
              ].map((s, i) => (
                <div key={i} className="space-y-4 group">
                   <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center text-parrot-navy group-hover:bg-parrot-green/10 transition-colors">
                      <s.icon className="w-7 h-7 group-hover:text-parrot-green transition-colors" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-4xl font-black text-parrot-navy italic">{s.val}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* GLOBAL CTA: HIGH CONTRAST */}
      <section className="py-24 relative overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="bg-parrot-navy rounded-[4rem] p-12 md:p-32 text-center text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.15),transparent)]" />
            <motion.div 
               animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }} 
               transition={{ duration: 10, repeat: Infinity }}
               className="absolute top-0 right-0 opacity-10 p-20"
            >
               <Logo />
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-12 relative z-10">
              <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-[0.9] italic">
                Build Your Future on <span className="text-parrot-green">Precision.</span> Not Promises.
              </h2>
              <p className="text-xl text-white/50 font-medium max-w-2xl mx-auto italic">
                Join 18,000+ Indians who've reclaimed control over their mortgage journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button 
                  onClick={() => window.scrollTo(0, 0)}
                  className="w-full sm:w-auto px-12 py-6 bg-parrot-green text-parrot-navy rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-parrot-green/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  Start My Journey <ChevronRight className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4 text-white/40 px-6">
                  <ShieldCheck className="w-6 h-6 text-parrot-green" />
                  <span className="text-xs font-black uppercase tracking-widest">ISO 27001 Certified System</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SIGN-OFF */}
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-12">
        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">ParrotMoney (Brand of Parrot FinTech Pvt. Ltd.)</p>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <button onClick={onBack} className="hover:text-parrot-navy transition-colors">Back to Home</button>
             <span className="w-1 h-1 rounded-full bg-slate-200" />
             <span className="text-parrot-green">Active Marketplace</span>
          </div>
        </div>
      </div>
    </div>
  );
}
