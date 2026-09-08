/**
 * Google Sheets Integration Utility for logging mortgage/loan application data.
 */

export async function logLoanToGoogleSheets(accessToken: string, loanData: any) {
  try {
    console.log("Staring Google Sheet synchronization...");
    // 1. Search if Spreadsheet already exists
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name%3D%27ParrotMoney+Home+Loan+Leads%27+and+mimeType%3D%27application%2Fvnd.google-apps.spreadsheet%27+and+trashed%3Dfalse&fields=files(id,name)`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!searchRes.ok) {
      throw new Error(`Google Drive Search failed with status: ${searchRes.status}`);
    }
    
    const searchData = await searchRes.json();
    
    let spreadsheetId = '';
    let isNew = false;
    
    if (searchData.files && searchData.files.length > 0) {
      spreadsheetId = searchData.files[0].id;
      console.log(`Found existing spreadsheet with ID: ${spreadsheetId}`);
    } else {
      console.log("No existing spreadsheet found. Creating a new spreadsheet...");
      // Create new spreadsheet
      const createRes = await fetch('https://sheets.googleapis.com/v1/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: { title: 'ParrotMoney Home Loan Leads' }
        })
      });
      
      if (!createRes.ok) {
        throw new Error(`Spreadsheet creation failed with status: ${createRes.status}`);
      }
      
      const createData = await createRes.json();
      spreadsheetId = createData.spreadsheetId;
      isNew = true;
      console.log(`Successfully created new spreadsheet with ID: ${spreadsheetId}`);
    }
    
    if (!spreadsheetId) {
      throw new Error("Could not retrieve or create Google Spreadsheet ID");
    }
    
    // Headers to write if newly created
    if (isNew) {
      const headers = [
        'Lead ID', 'Applicant Name', 'Email', 'Mobile', 'Purpose/Category', 'Loan Amount', 
        'Property Value', 'Tenure (Yrs)', 'CIBIL Score', 'CIBIL Status', 
        'Status', 'Log Timestamp', 'AI Assessment', 'Selected Bank'
      ];
      const headerRes = await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/Sheet1!A1:N1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: 'Sheet1!A1:N1',
          majorDimension: 'ROWS',
          values: [headers]
        })
      });
      if (headerRes.ok) {
        console.log("Successfully initialized sheet column headers.");
      }
    }
    
    // Formatting values properly
    const rowValues = [
      loanData.id || `lead_${Date.now()}`,
      loanData.fullName || 'N/A',
      loanData.email || 'N/A',
      loanData.mobileNumber || 'N/A',
      loanData.purpose || 'N/A',
      Number(loanData.loanAmount) || 0,
      Number(loanData.propertyValue) || 0,
      Number(loanData.tenure) || 0,
      Number(loanData.cibilScore) || 0,
      loanData.cibilStatus || 'N/A',
      loanData.status || 'submitted',
      new Date().toLocaleString(),
      loanData.aiAssessment?.riskAssess?.status || 'Passed',
      loanData.selectedBank?.name || 'N/A'
    ];
    
    // Append to sheet
    const appendUrl = `https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/Sheet1!A:N:append?valueInputOption=USER_ENTERED`;
    const appendRes = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: 'Sheet1!A:N',
        majorDimension: 'ROWS',
        values: [rowValues]
      })
    });
    
    if (appendRes.ok) {
      console.log("Successfully appended applicant data row to Google Sheets!");
      return { success: true, spreadsheetId };
    } else {
      console.warn("Failed to append row:", await appendRes.text());
      return { success: false, error: "Failed appending row" };
    }
  } catch (err: any) {
    console.error("Google sheets logging exception:", err);
    return { success: false, error: err.message || String(err) };
  }
}
