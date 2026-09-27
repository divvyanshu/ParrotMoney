import React, { useMemo, useState } from 'react';
import { ArrowRight, Home, ShieldCheck, UserRound, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { buildLeadProfile, EmploymentType, LeadProfile } from '../services/leadGenerationService';

const PRODUCTS = ['New Home Loan','Plot Loan','Plot + Construction','Loan Transfer','Loan Against Property','Commercial Property','NRI Home Loan'];
const CITIES = ['Delhi','Gurugram','Noida','Mumbai','Bangalore','Hyderabad','Pune','Chennai','Kolkata','Jaipur','Ahmedabad','Other'];
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10';

type Draft = {
  product:string; loanAmount:number; propertyValue:number; tenureYears:number; city:string; fullName:string;
  mobile:string; email:string; age:number; employmentType:EmploymentType; monthlyIncome:number; existingEmi:number;
  creditScore?:number; consent:LeadProfile['consent']; signals?:string[];
};

const initial: Draft = {
  product:'New Home Loan', loanAmount:5000000, propertyValue:7500000, tenureYears:20, city:'Gurugram',
  fullName:'', mobile:'', email:'', age:35, employmentType:'Salaried', monthlyIncome:150000, existingEmi:0,
  consent:{comparison:false,contact:false,lenderHandoff:false,timestamp:'',version:'v1'}, signals:['requirement_started']
};

function Field({label, children}:{label:string;children:React.ReactNode}) {
  return <label className="block space-y-1.5"><span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>{children}</label>;
}

export function LeadCaptureFlow({initialProduct,onComplete,onClose}:{initialProduct?:string;onComplete:(profile:LeadProfile)=>Promise<void>|void;onClose:()=>void}) {
  const [step,setStep]=useState(1);
  const [draft,setDraft]=useState<Draft>({...initial,product:initialProduct||initial.product});
  const [saving,setSaving]=useState(false);
  const update=<K extends keyof Draft>(k:K,v:Draft[K])=>setDraft(p=>({...p,[k]:v}));
  const valid=useMemo(()=>{
    if(step===1)return !!draft.product&&draft.loanAmount>0&&draft.propertyValue>0&&draft.tenureYears>0;
    if(step===2)return !!draft.fullName.trim()&&/^\\+?[0-9\\s-]{10,15}$/.test(draft.mobile)&&!!draft.city;
    if(step===3)return draft.age>=18&&draft.age<=75&&draft.monthlyIncome>0&&!!draft.employmentType;
    return draft.consent.comparison&&draft.consent.contact;
  },[draft,step]);
  const next=async()=>{
    if(!valid)return;
    if(step<4){setDraft(p=>({...p,signals:Array.from(new Set([...(p.signals||[]),step===1?'requirement_started':'profile_started']))}));setStep(s=>s+1);return;}
    setSaving(true);
    try{
      const profile=buildLeadProfile({...draft,signals:Array.from(new Set([...(draft.signals||[]),'profile_completed'])),consent:{...draft.consent,timestamp:new Date().toISOString()}});
      await onComplete(profile);
    }finally{setSaving(false);}
  };
  return <div className="fixed inset-0 z-[160] bg-slate-950/35 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
    <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] bg-white border border-slate-200 shadow-2xl">
      <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-5 sm:px-7 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-700">ParrotMoney</p><h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 mt-1">Build your comparison profile</h2><p className="text-xs text-slate-500 mt-1">A few details help us compare consistent loan assumptions. Final terms come from the lender.</p></div><button onClick={onClose} className="w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50">×</button></div>
        <div className="flex gap-1.5 mt-5">{[1,2,3,4].map(i=><div key={i} className={cn('h-1.5 rounded-full flex-1',i<=step?'bg-emerald-500':'bg-slate-100')}/>)}</div>
      </div>
      <div className="p-5 sm:p-7 space-y-5">
        {step===1&&<><div className="flex items-center gap-3"><Home className="w-5 h-5 text-emerald-600"/><div><h3 className="font-black text-slate-900">What are you planning?</h3><p className="text-xs text-slate-500">Start with the loan requirement.</p></div></div><Field label="Loan type"><select className={inputClass} value={draft.product} onChange={e=>update('product',e.target.value)}>{PRODUCTS.map(x=><option key={x}>{x}</option>)}</select></Field><div className="grid sm:grid-cols-2 gap-4"><Field label="Loan amount"><input className={inputClass} type="number" min="0" value={draft.loanAmount} onChange={e=>update('loanAmount',Number(e.target.value))}/></Field><Field label="Property value"><input className={inputClass} type="number" min="0" value={draft.propertyValue} onChange={e=>update('propertyValue',Number(e.target.value))}/></Field></div><Field label="Preferred tenure"><select className={inputClass} value={draft.tenureYears} onChange={e=>update('tenureYears',Number(e.target.value))}>{[10,15,20,25,30].map(x=><option key={x} value={x}>{x} years</option>)}</select></Field></>}
        {step===2&&<><div className="flex items-center gap-3"><UserRound className="w-5 h-5 text-emerald-600"/><div><h3 className="font-black text-slate-900">How can we identify you?</h3><p className="text-xs text-slate-500">Used to save your comparison and contact you only with consent.</p></div></div><Field label="Full name"><input className={inputClass} value={draft.fullName} onChange={e=>update('fullName',e.target.value.slice(0,120))} autoComplete="name" placeholder="Your name"/></Field><div className="grid sm:grid-cols-2 gap-4"><Field label="Mobile"><input className={inputClass} value={draft.mobile} onChange={e=>update('mobile',e.target.value.slice(0,15))} inputMode="tel" autoComplete="tel" placeholder="+91 98XXXXXXXX"/></Field><Field label="Email"><input className={inputClass} value={draft.email} onChange={e=>update('email',e.target.value.slice(0,180))} inputMode="email" autoComplete="email" placeholder="you@example.com"/></Field></div><Field label="City"><select className={inputClass} value={draft.city} onChange={e=>update('city',e.target.value)}>{CITIES.map(x=><option key={x}>{x}</option>)}</select></Field></>}
        {step===3&&<><div className="flex items-center gap-3"><Wallet className="w-5 h-5 text-emerald-600"/><div><h3 className="font-black text-slate-900">A little about your finances</h3><p className="text-xs text-slate-500">Comparison inputs — not a lender approval decision.</p></div></div><div className="grid sm:grid-cols-2 gap-4"><Field label="Age"><input className={inputClass} type="number" min="18" max="75" value={draft.age} onChange={e=>update('age',Number(e.target.value))}/></Field><Field label="Employment"><select className={inputClass} value={draft.employmentType} onChange={e=>update('employmentType',e.target.value as EmploymentType)}>{['Salaried','Self-employed','Business owner','Professional','Other'].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Monthly income"><input className={inputClass} type="number" min="0" value={draft.monthlyIncome} onChange={e=>update('monthlyIncome',Number(e.target.value))}/></Field><Field label="Existing EMI"><input className={inputClass} type="number" min="0" value={draft.existingEmi} onChange={e=>update('existingEmi',Number(e.target.value))}/></Field></div><Field label="Credit score (optional)"><input className={inputClass} type="number" min="300" max="900" value={draft.creditScore||''} onChange={e=>update('creditScore',e.target.value?Number(e.target.value):undefined)} placeholder="e.g. 760"/></Field></>}
        {step===4&&<><div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-emerald-600"/><div><h3 className="font-black text-slate-900">Your control & consent</h3><p className="text-xs text-slate-500">Choose what ParrotMoney can do with these details.</p></div></div><div className="space-y-3">{[['comparison','Use my details to prepare and save a loan comparison.'],['contact','Allow ParrotMoney to contact me about my loan comparison.'],['lenderHandoff','Allow sharing of selected offer details with a lender if I request an offer.']].map(([key,label])=><label key={key} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"><input type="checkbox" checked={Boolean(draft.consent[key as keyof typeof draft.consent])} onChange={e=>update('consent',{...draft.consent,[key]:e.target.checked})} className="mt-0.5 accent-emerald-600"/><span className="text-sm font-semibold text-slate-700">{label}</span></label>)}</div><div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">We collect information needed for comparison and lead handling. Lender assessment, final pricing and approval remain with the lender.</div></>}
      </div>
      <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-slate-100 px-5 sm:px-7 py-4 flex items-center justify-between"><button onClick={step===1?onClose:()=>setStep(s=>s-1)} className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500">{step===1?'Cancel':'Back'}</button><button disabled={!valid||saving} onClick={next} className="px-5 py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-40 flex items-center gap-2">{saving?'Saving…':step===4?'Create comparison':'Continue'}<ArrowRight className="w-4 h-4"/></button></div>
    </div>
  </div>;
}
