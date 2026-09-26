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
  const payload = {
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    name: (data.name || '').trim(),
    source: data.source || 'advisory_agent',
  };

  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Lead logging failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.lead || payload;
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
      if (response.status === 429) {
        return "Our loan advisory service is currently receiving a high volume of requests. Please wait about 15-30 seconds and ask your question again. You can also click 'Lenders Excel' above or check your eligibility in the calculator.";
      }
      const errText = await response.text();
      throw new Error(`Server returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.reply || "I'm ready to help! Please feel free to ask any question regarding home loan interest rates, balance transfers, or lender eligibility.";
  } catch (error: any) {
    console.error("Gemini API Client Error:", error);
    if (error?.message?.includes('429')) {
      return "Rate limit reached. Please wait a moment and try your query again.";
    }
    return "I'm sorry, I encountered a temporary connection issue. Please retry your query, or let me know which bank's guidelines you would like me to summarize.";
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
