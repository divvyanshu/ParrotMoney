/**
 * Cloud Functions for Firebase / Google Cloud Functions
 * Triggered daily by Cloud Scheduler (or HTTP trigger) to fetch the latest lender data,
 * update the 'banks' collection in Firestore, and push the updated data to the
 * Excel-compatible Google Sheet for distribution.
 */

import { executeDailyLenderSyncCloudFunction, executeDailyMarketCampaignScraper } from "../server/cloudFunctionSync";

/**
 * Cloud Function triggered daily (via Cloud Scheduler or PubSub)
 * Schedule: 0 4 * * * (Every day at 04:00 AM IST)
 */
export async function dailyLenderSync(req: any, res: any) {
  try {
    const authHeader = req?.headers?.authorization;
    const googleSheetsToken = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : undefined;

    console.log("[CloudFunction] dailyLenderSync execution triggered...");
    
    // 1. Scrape latest financial portals for active campaigns and update 'MarketCampaigns' in Firestore
    const campaignResult = await executeDailyMarketCampaignScraper();

    // 2. Fetch latest lender guidelines, update 'banks' in Firestore, and generate Excel / Google Sheet
    const syncResult = await executeDailyLenderSyncCloudFunction(googleSheetsToken);

    if (res && typeof res.status === "function") {
      return res.status(200).json({
        success: true,
        message: "Daily lender data & campaign sync completed successfully.",
        campaignsScraped: campaignResult.scrapedCount,
        campaignsSavedToFirestore: campaignResult.firestoreSavedCount,
        banksUpdatedInFirestore: syncResult.banksUpdatedInFirestore,
        excelGeneratedPath: syncResult.excelGeneratedPath,
        excelFileSizeBytes: syncResult.excelFileSizeBytes,
        googleSheetsPushed: syncResult.googleSheetsPushed,
        timestamp: syncResult.timestamp
      });
    }

    return { campaignResult, syncResult };
  } catch (error: any) {
    console.error("[CloudFunction] Error executing dailyLenderSync:", error);
    if (res && typeof res.status === "function") {
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to execute daily lender sync"
      });
    }
    throw error;
  }
}
