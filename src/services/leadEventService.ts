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

const STAGE_RANK: Record<LeadLifecycleStage, number> = {
  new: 0,
  engaged: 1,
  profile_complete: 2,
  comparison_active: 3,
  application_intent: 4,
  application_started: 5
};

const stageForEvent = (type: LeadEventType): LeadLifecycleStage | null => {
  if (type === 'application_started') return 'application_started';
  if (type === 'offer_requested') return 'application_intent';
  if (type === 'offer_shortlisted' || type === 'offer_compared' || type === 'comparison_viewed') return 'comparison_active';
  return null;
};

export async function recordLeadEvent(input: Omit<LeadEventRecord, 'eventId' | 'occurredAt'>) {
  const { doc, getDoc, setDoc, updateDoc, arrayUnion } = await import('firebase/firestore');
  const occurredAt = new Date().toISOString();
  const eventId = `EV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  const event: LeadEventRecord = { ...input, eventId, occurredAt };
  const leadRef = doc(db, 'leads', input.leadId);

  await setDoc(doc(db, 'leads', input.leadId, 'events', eventId), event);

  const nextStage = stageForEvent(input.type);
  const update: Record<string, unknown> = { updatedAt: occurredAt, intentSignals: arrayUnion(input.type) };
  if (nextStage) {
    const leadSnapshot = await getDoc(leadRef);
    const currentStage = leadSnapshot.exists() ? leadSnapshot.data().lifecycleStage as LeadLifecycleStage : 'new';
    if ((STAGE_RANK[nextStage] ?? 0) > (STAGE_RANK[currentStage] ?? 0)) update.lifecycleStage = nextStage;
  }
  await updateDoc(leadRef, update);
  return event;
}

export async function addStaffNote(leadId: string, userId: string, note: string) {
  const cleanNote = note.trim().slice(0, 1000);
  if (!cleanNote) throw new Error('A note is required.');
  return recordLeadEvent({ leadId, userId, type: 'staff_note', actor: 'staff', note: cleanNote });
}

export async function logContactAttempt(leadId: string, userId: string, channel: 'phone' | 'email' | 'whatsapp', note?: string) {
  return recordLeadEvent({
    leadId,
    userId,
    type: 'contact_attempt',
    actor: 'staff',
    note: note?.trim().slice(0, 1000),
    metadata: { channel }
  });
}
