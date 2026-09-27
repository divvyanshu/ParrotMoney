import React, { useMemo, useState } from 'react';
import { Search, RefreshCw, Eye, Download, Phone, Mail, UserRound, IndianRupee, Activity, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { LeadLifecycleStage, LeadProfile, getLeadStageLabel } from '../../services/leadGenerationService';

interface Props { leads: LeadProfile[]; isLoading: boolean; error: string | null; }

const STAGES: LeadLifecycleStage[] = ['new','engaged','profile_complete','comparison_active','application_intent','application_started'];

const formatMoney = (n:number) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n/100000).toFixed(2)} L` : `₹${n.toLocaleString('en-IN')}`;

export function LeadCommandCenter({ leads, isLoading, error }: Props) {
  const [search,setSearch]=useState('');
  const [stage,setStage]=useState<'all'|LeadLifecycleStage>('all');
  const [selected,setSelected]=useState<LeadProfile|null>(null);
  const [updating,setUpdating]=useState<string|null>(null);

  const filtered=useMemo(()=>leads.filter(l=>{
    const q=search.toLowerCase().trim();
    const match=!q || l.fullName.toLowerCase().includes(q) || l.mobile.includes(q) || l.email.toLowerCase().includes(q) || l.leadId.toLowerCase().includes(q);
    return match && (stage==='all'||l.lifecycleStage===stage);
  }),[leads,search,stage]);

  const totalVolume=leads.reduce((a,l)=>a+(Number(l.loanAmount)||0),0);
  const highIntent=leads.filter(l=>l.lifecycleStage==='application_intent'||l.lifecycleStage==='application_started').length;
  const contactable=leads.filter(l=>l.consent?.contact).length;

  const updateStage=async(lead:LeadProfile,next:LeadLifecycleStage)=>{
    setUpdating(lead.leadId);
    try{
      const { doc, updateDoc }=await import('firebase/firestore');
      const signals=Array.from(new Set([...(lead.intentSignals||[]), next==='application_started'?'application_started':next==='application_intent'?'offer_requested':next==='comparison_active'?'offer_shortlisted':'profile_completed']));
      await updateDoc(doc(db,'leads',lead.leadId),{lifecycleStage:next,intentSignals:signals,updatedAt:new Date().toISOString()});
      if(selected?.leadId===lead.leadId)setSelected({...lead,lifecycleStage:next,intentSignals:signals,updatedAt:new Date().toISOString()});
    }catch(e){console.error('Lead stage update failed',e);}finally{setUpdating(null);}
  };

  const exportCsv=()=>{
    const headers=['Lead ID','Name','Mobile','Email','Product','Loan Amount','Property Value','City','Employment','Monthly Income','Existing EMI','Stage','Profile Complete','Contact Consent','Lender Handoff Consent','Created At'];
    const esc=(v:unknown)=>`"${String(v??'').replace(/"/g,'""')}"`;
    const rows=filtered.map(l=>[l.leadId,l.fullName,l.mobile,l.email,l.product,l.loanAmount,l.propertyValue,l.city,l.employmentType,l.monthlyIncome,l.existingEmi,getLeadStageLabel(l.lifecycleStage),`${l.profileCompleteness}%`,l.consent?.contact?'Yes':'No',l.consent?.lenderHandoff?'Yes':'No',l.createdAt].map(esc).join(','));
    const blob=new Blob([[headers.join(','),...rows].join('\n')],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`ParrotMoney_CRM_Leads_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  if(isLoading)return <div className="bg-white p-14 rounded-[2.5rem] border border-natural-border text-center"><RefreshCw className="w-7 h-7 animate-spin mx-auto text-natural-sage"/><p className="text-xs font-bold text-natural-muted mt-3">Loading customer lead pipeline…</p></div>;
  if(error)return <div className="bg-white p-10 rounded-[2.5rem] border border-red-100 text-center"><p className="font-bold text-red-700">Lead pipeline could not be loaded.</p><p className="text-xs text-red-500 mt-2">{error}</p></div>;

  return <div className="space-y-6">
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[['Captured leads',leads.length,UserRound],['Pipeline value',formatMoney(totalVolume),IndianRupee],['High intent',highIntent,Activity],['Contact consent',contactable,ShieldCheck]].map(([label,value,Icon]:any)=><div key={label} className="bg-white p-5 rounded-3xl border border-natural-border shadow-md"><div className="flex justify-between items-center"><span className="text-[10px] uppercase tracking-widest font-black text-natural-muted">{label}</span><Icon className="w-4 h-4 text-emerald-600"/></div><p className="text-2xl font-black text-natural-sage mt-2">{value}</p></div>)}
    </div>
    <div className="flex flex-col lg:flex-row gap-3 justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1"><div className="relative flex-1 max-w-xl"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-natural-muted"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search lead ID, name, mobile or email…" className="w-full pl-9 pr-4 py-3 rounded-xl border border-natural-border bg-white text-xs font-bold outline-none"/></div><select value={stage} onChange={e=>setStage(e.target.value as any)} className="px-4 py-3 rounded-xl border border-natural-border bg-white text-xs font-bold"><option value="all">All lifecycle stages</option>{STAGES.map(s=><option key={s} value={s}>{getLeadStageLabel(s)}</option>)}</select></div><button onClick={exportCsv} className="px-4 py-3 rounded-xl bg-natural-sage text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"><Download className="w-4 h-4"/>Export CRM CSV</button>
    </div>
    <div className="bg-white rounded-[2.5rem] border border-natural-border shadow-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left min-w-[1000px]"><thead><tr className="bg-slate-50 border-b border-natural-border"><th className="px-6 py-4 text-[10px] uppercase tracking-widest text-natural-muted">Customer</th><th className="px-6 py-4 text-[10px] uppercase tracking-widest text-natural-muted">Requirement</th><th className="px-6 py-4 text-[10px] uppercase tracking-widest text-natural-muted">Profile</th><th className="px-6 py-4 text-[10px] uppercase tracking-widest text-natural-muted">Lifecycle</th><th className="px-6 py-4 text-[10px] uppercase tracking-widest text-natural-muted">Consent</th><th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest text-natural-muted">Action</th></tr></thead><tbody className="divide-y divide-natural-border/40">{filtered.map(l=><tr key={l.leadId} className="hover:bg-slate-50/60"><td className="px-6 py-5"><p className="font-black text-sm text-natural-sage">{l.fullName}</p><p className="text-[10px] text-natural-muted mt-1">{l.leadId}</p><p className="text-[10px] text-natural-muted">{l.mobile}</p></td><td className="px-6 py-5"><p className="text-xs font-bold text-natural-sage">{l.product}</p><p className="text-sm font-black text-natural-terracotta mt-1">{formatMoney(l.loanAmount)}</p><p className="text-[10px] text-natural-muted">{l.city} · {l.tenureYears} yrs</p></td><td className="px-6 py-5"><p className="text-sm font-black text-natural-sage">{l.profileCompleteness}%</p><div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-emerald-500" style={{width:`${l.profileCompleteness}%`}}/></div></td><td className="px-6 py-5"><select disabled={updating===l.leadId} value={l.lifecycleStage} onChange={e=>updateStage(l,e.target.value as LeadLifecycleStage)} className="px-3 py-2 rounded-lg border border-natural-border bg-white text-[10px] font-black uppercase"><option value="new">New</option>{STAGES.slice(1).map(s=><option key={s} value={s}>{getLeadStageLabel(s)}</option>)}</select></td><td className="px-6 py-5"><div className="flex gap-1.5 flex-wrap"><span className={cn('px-2 py-1 rounded text-[9px] font-black',l.consent?.contact?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-500')}>Contact {l.consent?.contact?'✓':'—'}</span><span className={cn('px-2 py-1 rounded text-[9px] font-black',l.consent?.lenderHandoff?'bg-blue-50 text-blue-700':'bg-slate-100 text-slate-500')}>Handoff {l.consent?.lenderHandoff?'✓':'—'}</span></div></td><td className="px-6 py-5 text-right"><button onClick={()=>setSelected(l)} className="px-3 py-2 bg-slate-100 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5"/>Inspect</button></td></tr>)}{filtered.length===0&&<tr><td colSpan={6} className="py-14 text-center text-xs text-natural-muted">No leads match this view.</td></tr>}</tbody></table></div></div>
    {selected&&<div className="fixed inset-0 z-[180] bg-slate-950/35 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setSelected(null)}><div className="bg-white rounded-[2rem] shadow-2xl border border-natural-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8" onClick={e=>e.stopPropagation()}><div className="flex justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-emerald-700">{selected.leadId}</p><h3 className="text-2xl font-black text-natural-sage mt-1">{selected.fullName}</h3><p className="text-xs text-natural-muted">{selected.product} · {formatMoney(selected.loanAmount)} · {selected.city}</p></div><button onClick={()=>setSelected(null)} className="w-9 h-9 rounded-full bg-slate-100">×</button></div><div className="grid sm:grid-cols-2 gap-3 mt-6">{[['Mobile',selected.mobile],['Email',selected.email||'Not provided'],['Employment',selected.employmentType],['Monthly income',formatMoney(selected.monthlyIncome)],['Existing EMI',formatMoney(selected.existingEmi)],['Property value',formatMoney(selected.propertyValue)],['LTV reference',selected.comparisonContext?.ltvPercent?`${selected.comparisonContext.ltvPercent}%`:'—'],['Profile complete',`${selected.profileCompleteness}%`]].map(([k,v])=><div key={k} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100"><p className="text-[9px] uppercase tracking-wider font-black text-natural-muted">{k}</p><p className="text-sm font-bold text-natural-sage mt-1">{v}</p></div>)}</div><div className="mt-5 flex flex-wrap gap-2">{selected.consent?.contact&&<a href={`tel:${selected.mobile}`} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-2"><Phone className="w-4 h-4"/>Call customer</a>}{selected.consent?.contact&&selected.email&&<a href={`mailto:${selected.email}`} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-2"><Mail className="w-4 h-4"/>Email</a>} {!selected.consent?.contact&&<p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-xl">Customer has not provided contact consent.</p>}</div></div></div>}
  </div>;
}
