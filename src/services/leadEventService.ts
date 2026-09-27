import { db } from '../lib/firebase';
import { LeadLifecycleStage } from './leadGenerationService';

export type LeadEventType = 'comparison_viewed' | 'offer_compared' | 'offer_shortlisted' | 'offer_requested' | 'application_started' | 'staff_note' | 'contact_attempt';

export interface LeadEventRecord {
  eventId: string;
  leadId: string;
  userId: string;
  type: LeadEventType;
  occurredAt: string;
  actor: 'customer' | 'staff' | 'system';
  lenderName?: string;
  note?: string;
  metadata?: Record<string, string | number | boolean>;
}

const stageForEvent = (type: LeadEventType): LeadLifecycleStage | null => {
  if (type === 'application_started') return 'application_started';
  if (type === 'offer_requested') return 'application_intent';
  if (type === 'offer_shortlisted' || type === 'offer_compared' || type === 'comparison_viewed') return 'comparison_active';
  return null;
};

export async function recordLeadEvent(input: Omit<LeadEventRecord, 'eventId' | 'occurredAt'>) {
  const { doc, setDoc, updateDoc, arrayUnion } = await import('firebase/firestore');
  const occurredAt = new Date().toISOString();
  const eventId = `EV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  const event: LeadEventRecord = { ...input, eventId, occurredAt };
  await setDoc(doc(db, 'leads', input.leadId, 'events', eventId), event);
  const nextStage = stageForEvent(input.type);
  const update: Record<string, unknown> = { updatedAt: occurredAt, intentSignals: arrayUnion(input.type) };
  if (nextStage) update.lifecycleStage = nextStage;
  await updateDoc(doc(db, 'leads', input.leadId), update);
  return event;
}
