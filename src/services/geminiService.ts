import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserContext {
  email: string;
  phone: string;
  name?: string;
}

export async function logCustomerLead(data: { email: string; phone: string; name?: string; source?: string }) {
  const leadId = "lead_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const payload = {
    id: leadId,
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    name: (data.name || '').trim(),
    source: data.source || 'advisory_agent',
    createdAt: new Date().toISOString()
  };

  // 1. Log to server endpoint
  try {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn("Server lead logging error:", err);
  }

  // 2. Persist to Firestore collection
  try {
    const leadRef = doc(collection(db, 'leads'), leadId);
    await setDoc(leadRef, payload);
  } catch (err) {
    console.warn("Firestore lead logging error (non-fatal):", err);
  }

  return payload;
}

export async function getChatResponse(
  message: string, 
  history: { role: string; content: string }[],
  userContext?: UserContext
) {
  try {
    const fullHistory = [
      ...history,
      { role: 'user', content: message }
    ];

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages: fullHistory,
        userContext
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Gemini API Client Error:", error);
    return "I'm sorry, I encountered a temporary connection issue. Please try submitting your query again, or let me know if you would like me to analyze a specific loan requirement.";
  }
}

export interface LoanRecommendationRequest {
  income: number;
  creditScore: number;
  downPayment: number;
  isFirstTimeBuyer: boolean;
}

export async function getLoanRecommendations(data: LoanRecommendationRequest) {
  // Graceful stub for any unused legacy loan recommendation tools
  return null;
}
