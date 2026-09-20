import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  writeBatch,
  Timestamp 
} from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

// Load configuration
let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
} catch (err) {
  console.warn("[FirebaseServer] Could not read firebase-applet-config.json:", err);
}

const app = getApps().length > 0 
  ? getApp() 
  : (firebaseConfig ? initializeApp(firebaseConfig) : null);

export const serverDb = app 
  ? getFirestore(app, firebaseConfig?.firestoreDatabaseId || "(default)") 
  : null;

export interface MarketCampaignDoc {
  id: string;
  lenderName: string;
  campaignTitle: string;
  channel: string;
  adCopyHeadline: string;
  statedRate: string;
  processingFeeDiscount: string;
  validityStart: string;
  validityEnd: string;
  targetSegment: string;
  finePrint: string;
  sourceUrl?: string;
  scrapedAt: string;
  status: string;
}

/**
 * Persists an array of scraped ad campaigns to the Firestore 'MarketCampaigns' collection
 */
export async function persistMarketCampaignsToFirestore(campaigns: MarketCampaignDoc[]): Promise<{ saved: number; errors: number }> {
  if (!serverDb) {
    console.warn("[FirebaseServer] Firestore not initialized on server, saving in local fallback cache.");
    return { saved: 0, errors: 0 };
  }

  let saved = 0;
  let errors = 0;

  for (const camp of campaigns) {
    try {
      const cleanId = (camp.id || `camp_${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, "_");
      const docRef = doc(serverDb, "MarketCampaigns", cleanId);
      
      const payload = {
        lenderName: String(camp.lenderName || "Lender").substring(0, 150),
        campaignTitle: String(camp.campaignTitle || "Home Loan Offer").substring(0, 200),
        channel: String(camp.channel || "Portal").substring(0, 80),
        adCopyHeadline: String(camp.adCopyHeadline || "").substring(0, 300),
        statedRate: String(camp.statedRate || "8.40% p.a.").substring(0, 60),
        processingFeeDiscount: String(camp.processingFeeDiscount || "Standard").substring(0, 100),
        validityStart: String(camp.validityStart || "2026-09-01").substring(0, 30),
        validityEnd: String(camp.validityEnd || "2026-11-30").substring(0, 30),
        targetSegment: String(camp.targetSegment || "All Eligible Borrowers").substring(0, 150),
        finePrint: String(camp.finePrint || "Subject to institutional credit policy.").substring(0, 300),
        sourceUrl: String(camp.sourceUrl || "https://parrotmoney.in").substring(0, 250),
        scrapedAt: String(camp.scrapedAt || new Date().toISOString()).substring(0, 60),
        status: String(camp.status || "Active").substring(0, 40),
      };

      await setDoc(docRef, payload, { merge: true });
      saved++;
    } catch (err: any) {
      console.error(`[FirebaseServer] Error saving campaign ${camp.id} to Firestore:`, err.message);
      errors++;
    }
  }

  console.log(`[FirebaseServer] Persisted ${saved} campaigns to Firestore 'MarketCampaigns' (${errors} errors).`);
  return { saved, errors };
}

/**
 * Retrieves all campaigns from Firestore 'MarketCampaigns' collection
 */
export async function getMarketCampaignsFromFirestore(): Promise<MarketCampaignDoc[]> {
  if (!serverDb) {
    return [];
  }

  try {
    const colRef = collection(serverDb, "MarketCampaigns");
    const snapshot = await getDocs(colRef);
    const results: MarketCampaignDoc[] = [];

    snapshot.forEach((d) => {
      const data = d.data();
      results.push({
        id: d.id,
        lenderName: data.lenderName || "Lender",
        campaignTitle: data.campaignTitle || "Offer",
        channel: data.channel || "Web Portal",
        adCopyHeadline: data.adCopyHeadline || "",
        statedRate: data.statedRate || "8.40% p.a.",
        processingFeeDiscount: data.processingFeeDiscount || "Standard",
        validityStart: data.validityStart || "2026-09-01",
        validityEnd: data.validityEnd || "2026-11-30",
        targetSegment: data.targetSegment || "All Eligible Borrowers",
        finePrint: data.finePrint || "",
        sourceUrl: data.sourceUrl || "",
        scrapedAt: data.scrapedAt || new Date().toISOString(),
        status: data.status || "Active"
      });
    });

    return results;
  } catch (err: any) {
    console.warn("[FirebaseServer] Could not read from MarketCampaigns collection:", err.message);
    return [];
  }
}

/**
 * Updates the 'banks' collection in Firestore with the freshest lender data
 */
export async function updateBanksCollectionInFirestore(bankOffers: any[]): Promise<{ updated: number; errors: number }> {
  if (!serverDb) {
    return { updated: 0, errors: 0 };
  }

  let updated = 0;
  let errors = 0;

  for (const bank of bankOffers) {
    try {
      const cleanId = (bank.id || bank.name).toLowerCase().replace(/[^a-z0-9_\-]/g, "_").substring(0, 80);
      const docRef = doc(serverDb, "banks", cleanId);
      
      const payload = {
        name: String(bank.name).substring(0, 100),
        rate: String(bank.rate).substring(0, 20),
        processingTime: String(bank.processingTime || "8-12 Days").substring(0, 100),
        rating: Math.min(5, Math.max(1, Number(bank.rating) || 4.5)),
        score: Math.min(100, Math.max(0, Number(bank.score) || 90)),
        features: Array.isArray(bank.features) ? bank.features.map((f: any) => String(f).substring(0, 80)).slice(0, 5) : []
      };

      await setDoc(docRef, payload, { merge: true });
      updated++;
    } catch (err: any) {
      console.error(`[FirebaseServer] Error updating bank ${bank.name} in Firestore:`, err.message);
      errors++;
    }
  }

  console.log(`[FirebaseServer] Successfully updated ${updated} banks in Firestore 'banks' collection (${errors} errors).`);
  return { updated, errors };
}
