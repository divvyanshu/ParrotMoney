import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  Folder, 
  FileSpreadsheet, 
  FileText, 
  Database, 
  Upload, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Search, 
  FileCode, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Clock,
  Send,
  Sparkles,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  TableProperties,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Defined tabs inside workspace
type SubTab = 'drive' | 'sheets' | 'forms';

export function WorkspaceHub() {
  // Authentication State
  const [googleUser, setGoogleUser] = useState<any | null>(() => {
    try {
      const stored = localStorage.getItem('parrot_google_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('parrot_google_access_token');
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // General State
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('drive');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Google Drive State
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('ParrotMoney_Underwriting_Proof.txt');
  const [uploadFileContent, setUploadFileContent] = useState('Borrower Score: 92/100\nVerified Income: ₹24,00,000 per annum\nProperty Valuation: ₹7,50,00,000\nLTV Clearance: PASSED\nPre-Approved Limit: ₹4,87,50,000');
  const [isUploading, setIsUploading] = useState(false);
  const [driveSearch, setDriveSearch] = useState('');

  // Google Sheets State
  const [sheetsList, setSheetsList] = useState<any[]>([]);
  const [activeSpreadsheetId, setActiveSpreadsheetId] = useState<string>('');
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string>('');
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [isLoadingSheetData, setIsLoadingSheetData] = useState(false);
  const [sheetRangeInput, setSheetRangeInput] = useState('Sheet1!A1:C10');

  // Google Forms State
  const [formsList, setFormsList] = useState<any[]>([]);
  const [activeFormId, setActiveFormId] = useState<string>('');
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [createdFormUrl, setCreatedFormUrl] = useState<string>('');
  const [formResponses, setFormResponses] = useState<any[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  // Helper to show custom message toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Add all necessary scopes requested
      provider.addScope('https://www.googleapis.com/auth/calendar');
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/drive.readonly');
      provider.addScope('https://www.googleapis.com/auth/forms.body');
      provider.addScope('https://www.googleapis.com/auth/forms.body.readonly');
      provider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (!token) {
        throw new Error('Failed to retrieve Google OAuth access token.');
      }

      setGoogleUser(result.user);
      setAccessToken(token);
      localStorage.setItem('parrot_google_user', JSON.stringify(result.user));
      localStorage.setItem('parrot_google_access_token', token);
      showToast('Successfully connected to Google Workspace!', 'success');
    } catch (err: any) {
      console.error('OAuth Workspace Error:', err);
      setAuthError(err.message || 'Authentication with Google failed.');
      showToast('Connection failed. Please retry.', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = () => {
    setGoogleUser(null);
    setAccessToken(null);
    localStorage.removeItem('parrot_google_user');
    localStorage.removeItem('parrot_google_access_token');
    setDriveFiles([]);
    setSheetsList([]);
    setFormsList([]);
    setSheetData([]);
    setFormResponses([]);
    showToast('Disconnected from Google account.', 'success');
  };

  // FETCH DRIVE FILES
  const fetchDriveFiles = async (tokenStr = accessToken) => {
    if (!tokenStr) return;
    setIsLoadingDrive(true);
    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?pageSize=15&fields=files(id,name,mimeType,webViewLink,iconLink,modifiedTime)&orderBy=modifiedTime%20desc',
        {
          headers: {
            'Authorization': `Bearer ${tokenStr}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to query Google Drive files.');
      }

      const data = await response.json();
      setDriveFiles(data.files || []);

      // Extract sheets and forms separately for handy lists
      const sheets = (data.files || []).filter((f: any) => f.mimeType === 'application/vnd.google-apps.spreadsheet');
      setSheetsList(sheets);
      if (sheets.length > 0 && !activeSpreadsheetId) {
        setActiveSpreadsheetId(sheets[0].id);
      }

      const forms = (data.files || []).filter((f: any) => f.mimeType === 'application/vnd.google-apps.form');
      setFormsList(forms);
      if (forms.length > 0 && !activeFormId) {
        setActiveFormId(forms[0].id);
      }

    } catch (err: any) {
      console.error('Drive listing error:', err);
      showToast('Error listing files from Google Drive.', 'error');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Fetch Drive on Mount/Login
  useEffect(() => {
    if (accessToken) {
      fetchDriveFiles(accessToken);
    }
  }, [accessToken, activeSubTab]);

  // UPLOAD FILE TO DRIVE
  const handleDriveUpload = async () => {
    if (!accessToken) return;
    if (!uploadFileName) {
      showToast('Please specify a filename.', 'error');
      return;
    }
    setIsUploading(true);

    try {
      // Step A: Create file metadata
      const metaRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: uploadFileName,
          mimeType: 'text/plain'
        })
      });

      if (!metaRes.ok) {
        throw new Error('Failed to create file container.');
      }

      const metaData = await metaRes.json();
      const fileId = metaData.id;

      // Step B: Write media content (PATCH upload)
      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'text/plain'
        },
        body: uploadFileContent
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file content payload.');
      }

      showToast(`"${uploadFileName}" created in Google Drive!`, 'success');
      setUploadFileName('ParrotMoney_Verification_' + Math.floor(Math.random() * 1000) + '.txt');
      fetchDriveFiles();
    } catch (err: any) {
      console.error('Upload Error:', err);
      showToast(err.message || 'File upload failed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // CREATE GOOGLE SHEET (With actual Underwriting structure)
  const handleCreateSheet = async () => {
    if (!accessToken) return;
    setIsCreatingSheet(true);
    setCreatedSheetUrl('');

    try {
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `ParrotMoney Loan Calculations - ${new Date().toLocaleDateString('en-IN')}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize Google Sheet.');
      }

      const sheetMeta = await response.json();
      const spreadsheetId = sheetMeta.spreadsheetId;
      setActiveSpreadsheetId(spreadsheetId);
      setCreatedSheetUrl(sheetMeta.spreadsheetUrl);

      // Populate sheet with professional amortization and metrics
      const populateRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:C10?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: 'Sheet1!A1:C10',
            majorDimension: 'ROWS',
            values: [
              ['ParrotMoney Loan Underwriting Matrix', 'System Values', 'Status Code'],
              ['Underwritten Date', new Date().toLocaleString(), 'VERIFIED'],
              ['Requested Property Loan', 50000000, 'APPROVED_MAX'],
              ['Calculated Base ROI', '8.65%', 'LOWERED_MARKUP'],
              ['Maximum LTV Rate Offered', '75.00%', 'LTV_MET'],
              ['Monthly EMI Option', 412500, 'CALCULATED'],
              ['Underwriter Assessor Rating', '95/100', 'SUPERIOR_CREDIT'],
              ['Target Commercial Tenure', '15 Years', 'LOCKED_TERM'],
              ['Total Payback Amount', 74250000, 'DISCOUNTED_TARIFF'],
            ],
          }),
        }
      );

      if (!populateRes.ok) {
        throw new Error('Created sheet but failed to write values.');
      }

      showToast('Calculations sheet created and formatted!', 'success');
      fetchDriveFiles();
      fetchSheetData(spreadsheetId);
    } catch (err: any) {
      console.error('Sheet creation error:', err);
      showToast(err.message || 'Sheet creation failed.', 'error');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // READ SHEET VALUES
  const fetchSheetData = async (spreadsheetId = activeSpreadsheetId) => {
    if (!accessToken || !spreadsheetId) return;
    setIsLoadingSheetData(true);
    setSheetData([]);

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetRangeInput)}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Could not pull values. Make sure the sheet name matches ' + sheetRangeInput);
      }

      const data = await response.json();
      setSheetData(data.values || []);
      showToast('Synced values from Sheet successfully!', 'success');
    } catch (err: any) {
      console.error('Error fetching sheet data:', err);
      showToast(err.message || 'Failed to read sheet values.', 'error');
    } finally {
      setIsLoadingSheetData(false);
    }
  };

  // CREATE GOOGLE FORM feedback
  const handleCreateForm = async () => {
    if (!accessToken) return;
    setIsCreatingForm(true);
    setCreatedFormUrl('');

    try {
      // Step A: Create the Form Container
      const response = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          info: {
            title: 'ParrotMoney Customer Support & Underwriting Feedback',
            documentTitle: 'ParrotMoney Loan Feedback Form'
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Form.');
      }

      const formMeta = await response.json();
      const formId = formMeta.formId;
      setActiveFormId(formId);
      setCreatedFormUrl(formMeta.responderUri);

      // Step B: Add high-quality questions
      const questionResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              createItem: {
                item: {
                  title: 'Rate your overall loan experience with ParrotMoney senior advisors.',
                  questionItem: {
                    question: {
                      required: true,
                      choiceQuestion: {
                        type: 'RADIO',
                        options: [
                          { value: '1 - Slow / Complicated' },
                          { value: '2 - Average Service' },
                          { value: '3 - Satisfactory Rates' },
                          { value: '4 - Fast & Secure Approval' },
                          { value: '5 - Exceptional Service' }
                        ]
                      }
                    }
                  }
                },
                location: { index: 0 }
              }
            },
            {
              createItem: {
                item: {
                  title: 'Which product page or rate structure did you apply for?',
                  questionItem: {
                    question: {
                      choiceQuestion: {
                        type: 'DROP_DOWN',
                        options: [
                          { value: 'Home Loan Balance Transfer' },
                          { value: 'Commercial Property Loan' },
                          { value: 'Pre-approved Home Loan Limit' },
                          { value: 'Loan Against Property (LAP)' }
                        ]
                      }
                    }
                  }
                },
                location: { index: 1 }
              }
            },
            {
              createItem: {
                item: {
                  title: 'Share any rates or competitive offers you would like us to match.',
                  questionItem: {
                    question: {
                      textQuestion: { paragraph: true }
                    }
                  }
                },
                location: { index: 2 }
              }
            }
          ]
        })
      });

      if (!questionResponse.ok) {
        throw new Error('Form container built but questions could not be written.');
      }

      showToast('Interactive Google Form successfully generated!', 'success');
      fetchDriveFiles();
      fetchFormResponses(formId);
    } catch (err: any) {
      console.error('Form Creation error:', err);
      showToast(err.message || 'Form generation failed.', 'error');
    } finally {
      setIsCreatingForm(false);
    }
  };

  // FETCH RESPONSES FROM FORM
  const fetchFormResponses = async (formId = activeFormId) => {
    if (!accessToken || !formId) return;
    setIsLoadingResponses(true);
    setFormResponses([]);

    try {
      const url = `https://forms.googleapis.com/v1/forms/${formId}/responses`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('No responses found or API permission restricted. Responses can only be fetched once users submit them.');
      }

      const data = await response.json();
      setFormResponses(data.responses || []);
      showToast(`Sync complete! Pulled ${data.responses?.length || 0} form submissions.`, 'success');
    } catch (err: any) {
      console.error('Error fetching form responses:', err);
      showToast('No submissions found on this Google Form yet.', 'info');
    } finally {
      setIsLoadingResponses(false);
    }
  };

  // Filter Drive files
  const filteredFiles = driveFiles.filter(file => {
    if (!driveSearch) return true;
    return file.name.toLowerCase().includes(driveSearch.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 select-text selection:bg-[#10B981]/20 pb-16">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[120] p-4 rounded-2xl shadow-huge flex items-center gap-3 border text-xs font-bold leading-normal ${
              toast.type === 'error' 
                ? 'bg-red-50 border-red-100 text-red-800' 
                : toast.type === 'info'
                ? 'bg-amber-50 border-amber-100 text-amber-800'
                : 'bg-emerald-50 border-emerald-100 text-emerald-800'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${toast.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-[9px] font-black uppercase tracking-wider font-mono">
            <Layers className="w-3.5 h-3.5" /> Workspace Hub
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mt-3 text-natural-sage italic leading-tight">
            Integrated Document Vault.
          </h2>
          <p className="text-natural-muted font-medium text-base md:text-lg mt-1">
            Browse Drive vaults, download formulas, export calculations to Sheets, and track interactive customer feedback via Forms.
          </p>
        </div>

        {/* Sync Status Banner */}
        <div>
          {!accessToken ? (
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="gsi-material-button w-full shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents font-black text-xs">
                  {isAuthenticating ? 'Connecting...' : 'Authorize Workspace Apps'}
                </span>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-3xl p-4 shadow-sm">
              <div className="text-left">
                <p className="text-[10px] font-black text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Workspace Linked
                </p>
                <p className="text-[11px] text-emerald-600/80 font-bold max-w-[180px] truncate">
                  {googleUser?.email}
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200/60 text-emerald-800 hover:text-red-600 font-black text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {!accessToken ? (
        /* Not Logged In Landing Card */
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-natural-border shadow-2xl shadow-natural-sage/5 text-center space-y-8 max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-natural-sage/5 rounded-[2rem] flex items-center justify-center mx-auto text-natural-sage">
            <Database className="w-10 h-10" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-natural-text italic">
              Access Google Workspace Securely
            </h3>
            <p className="text-natural-muted font-medium text-sm md:text-base leading-relaxed">
              Connect your account to view documents directly from Google Drive, write live calculator balances directly to Sheets, and review client intake forms automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="px-8 py-4.5 bg-natural-sage hover:bg-natural-sage/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Fetching session...
                </>
              ) : (
                <>
                  Authenticate Workspace <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-6 justify-center items-center text-left text-xs font-semibold text-natural-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Read-write spreadsheets
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe Document listings
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Real-time feedback forms
            </div>
          </div>
        </div>
      ) : (
        /* Main Dashboard Frame */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side Tabs Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-[2rem] p-4 border border-natural-border shadow-xl shadow-natural-sage/5 space-y-1">
              
              <button
                onClick={() => setActiveSubTab('drive')}
                className={`w-full text-left p-4.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                  activeSubTab === 'drive'
                    ? 'bg-[#10B981]/10 text-[#10B981]'
                    : 'text-natural-muted hover:bg-natural-bg/50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Folder className="w-4 h-4" /> Google Drive
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveSubTab('sheets')}
                className={`w-full text-left p-4.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                  activeSubTab === 'sheets'
                    ? 'bg-[#10B981]/10 text-[#10B981]'
                    : 'text-natural-muted hover:bg-natural-bg/50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4" /> Google Sheets
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveSubTab('forms')}
                className={`w-full text-left p-4.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                  activeSubTab === 'forms'
                    ? 'bg-[#10B981]/10 text-[#10B981]'
                    : 'text-natural-muted hover:bg-natural-bg/50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <FileText className="w-4 h-4" /> Google Forms
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

            </div>

            {/* Quick Summary Info */}
            <div className="bg-white rounded-[2rem] p-6 border border-natural-border shadow-xl shadow-natural-sage/5 text-left space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-natural-muted">
                System Storage info
              </h5>
              <div className="space-y-3 font-semibold text-xs text-natural-text">
                <div className="flex justify-between">
                  <span className="text-natural-muted">Vault files:</span>
                  <span>{driveFiles.length} listed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-natural-muted">Spreadsheets:</span>
                  <span>{sheetsList.length} tabs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-natural-muted">Active forms:</span>
                  <span>{formsList.length} forms</span>
                </div>
              </div>
              <button
                onClick={() => fetchDriveFiles()}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Sync Workspace
              </button>
            </div>
          </div>

          {/* Right Workspace Tab Container */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              
              {/* GOOGLE DRIVE SUBTAB */}
              {activeSubTab === 'drive' && (
                <motion.div
                  key="drive"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="space-y-8 text-left"
                >
                  {/* Upload Card */}
                  <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h3 className="text-xl font-extrabold text-natural-text flex items-center gap-2 tracking-tight">
                        <Upload className="w-5 h-5 text-natural-terracotta" /> Document Vault Uploader
                      </h3>
                      <span className="text-[9px] font-mono font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2.5 py-1 rounded">
                        SECURE TRANSFER
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-natural-muted block">
                          Document Filename
                        </label>
                        <input
                          type="text"
                          value={uploadFileName}
                          onChange={(e) => setUploadFileName(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-[#10B981] rounded-xl text-xs font-bold transition-all outline-none"
                          placeholder="document_name.txt"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-natural-muted block">
                          Quick Actions
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setUploadFileName('ParrotMoney_Amortization_Schedules.txt');
                              setUploadFileContent('ParrotMoney Loan Calculators Output\nDate: ' + new Date().toDateString() + '\nEMI calculated: ₹4.12 Lakhs\nRate Locked: 8.65%\nUnderwriter: Priyanka Patel');
                            }}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-extrabold text-slate-600 transition-all cursor-pointer"
                          >
                            Amortization Schedule
                          </button>
                          <button
                            onClick={() => {
                              setUploadFileName('ParrotMoney_Underwriting_Formulas.txt');
                              setUploadFileContent('Underwriting verification protocol list:\n1. Verify annual income exceeds 4x target EMI.\n2. LTV constraint must be under 75%.\n3. Verify property encumbrance records with land registry.');
                            }}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-extrabold text-slate-600 transition-all cursor-pointer"
                          >
                            Underwriting Template
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-natural-muted block">
                          Document Content / Verification Logs
                        </label>
                        <textarea
                          rows={4}
                          value={uploadFileContent}
                          onChange={(e) => setUploadFileContent(e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-[#10B981] rounded-xl text-xs font-semibold font-mono transition-all outline-none leading-relaxed"
                          placeholder="Write document text here..."
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleDriveUpload}
                      disabled={isUploading}
                      className="w-full py-4 bg-natural-terracotta hover:bg-natural-terracotta/90 disabled:opacity-45 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Uploading to Google Drive...
                        </>
                      ) : (
                        <>
                          Save Document to Google Drive <Upload className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Drive File List Card */}
                  <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-natural-text flex items-center gap-2 tracking-tight">
                          <Folder className="w-5 h-5 text-natural-sage" /> Your Google Drive Files
                        </h3>
                        <p className="text-xs text-natural-muted mt-0.5">Showing recent files synced from your primary folder.</p>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search files..."
                          value={driveSearch}
                          onChange={(e) => setDriveSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-[#10B981] rounded-xl text-xs font-semibold outline-none transition-all"
                        />
                      </div>
                    </div>

                    {isLoadingDrive ? (
                      <div className="flex flex-col items-center justify-center py-16 space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400">Loading files from your Google Drive...</p>
                      </div>
                    ) : filteredFiles.length === 0 ? (
                      <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-[2rem] space-y-3">
                        <Folder className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-sm font-black text-slate-400">No files found matching search criteria.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredFiles.map((file) => {
                          const isSheet = file.mimeType === 'application/vnd.google-apps.spreadsheet';
                          const isForm = file.mimeType === 'application/vnd.google-apps.form';
                          const updatedDate = new Date(file.modifiedTime).toLocaleDateString();
                          
                          return (
                            <div 
                              key={file.id} 
                              className="p-5 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-100/50 flex items-start gap-4 text-left transition-all group"
                            >
                              <div className={`p-3 rounded-xl shadow-sm ${
                                isSheet ? 'bg-emerald-100 text-emerald-800' : isForm ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {isSheet ? <FileSpreadsheet className="w-5 h-5" /> : isForm ? <FileText className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-extrabold text-natural-text text-sm truncate group-hover:text-natural-terracotta transition-colors">
                                  {file.name}
                                </h4>
                                <p className="text-[10px] text-natural-muted font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5 font-mono">
                                  <span>{updatedDate}</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[120px]">
                                    {isSheet ? 'Google Sheets' : isForm ? 'Google Form' : 'Document'}
                                  </span>
                                </p>
                              </div>
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  referrerPolicy="no-referrer"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-white rounded-lg border border-slate-200 hover:border-natural-sage text-natural-muted hover:text-natural-text transition-colors self-center cursor-pointer"
                                  title="Open in Workspace"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* GOOGLE SHEETS SUBTAB */}
              {activeSubTab === 'sheets' && (
                <motion.div
                  key="sheets"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="space-y-8 text-left"
                >
                  {/* Create Sheet Card */}
                  <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-natural-text flex items-center gap-2 tracking-tight">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Loan Underwriting Exporter
                        </h3>
                        <p className="text-xs text-natural-muted mt-0.5">Export custom calculations, amortization targets, and risk metrics directly into formatted Google Sheets.</p>
                      </div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded">
                        LIVE SYNC
                      </span>
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-4">
                      <p className="text-xs text-natural-muted font-semibold leading-relaxed">
                        Exporting initializes a pre-formatted worksheet featuring optimized offer calculations, rate markups, and interest tenure breakdowns in your Google Sheets account.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={handleCreateSheet}
                          disabled={isCreatingSheet}
                          className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          {isCreatingSheet ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Structuring Spreadsheet...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> Export New Loan Matrix
                            </>
                          )}
                        </button>
                        
                        {createdSheetUrl && (
                          <a
                            href={createdSheetUrl}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            className="flex-1 py-3.5 bg-white border-2 border-emerald-500 text-emerald-700 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:bg-emerald-50 cursor-pointer"
                          >
                            Open Google Sheet <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Read Values Card */}
                  <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-natural-text flex items-center gap-2 tracking-tight">
                        <TableProperties className="w-5 h-5 text-[#10B981]" /> Import spreadsheet data
                      </h3>
                      <p className="text-xs text-natural-muted mt-0.5">Enter spreadsheet details below to pull, analyze, and display formulas or calculations inside ParrotMoney.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      
                      <div className="space-y-2 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-natural-muted block">
                          Select Spreadsheet
                        </label>
                        <select
                          value={activeSpreadsheetId}
                          onChange={(e) => setActiveSpreadsheetId(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold transition-all outline-none"
                        >
                          {sheetsList.length === 0 ? (
                            <option value="">No Sheets found in Drive</option>
                          ) : (
                            sheetsList.map((sh) => (
                              <option key={sh.id} value={sh.id}>
                                {sh.name}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-natural-muted block">
                          Range Tab & Coordinates
                        </label>
                        <input
                          type="text"
                          value={sheetRangeInput}
                          onChange={(e) => setSheetRangeInput(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-[#10B981] rounded-xl text-xs font-bold transition-all outline-none font-mono"
                          placeholder="Sheet1!A1:C10"
                        />
                      </div>

                      <button
                        onClick={() => fetchSheetData()}
                        disabled={isLoadingSheetData || !activeSpreadsheetId}
                        className="py-3.5 bg-natural-sage hover:bg-natural-sage/95 disabled:opacity-40 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        {isLoadingSheetData ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Syncing...
                          </>
                        ) : (
                          <>
                            Fetch Live Range <RefreshCw className="w-4 h-4" />
                          </>
                        )}
                      </button>

                    </div>

                    {sheetData.length > 0 && (
                      <div className="pt-6 border-t border-slate-100 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-natural-muted">
                          Live Table Preview ({sheetRangeInput})
                        </h4>
                        
                        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                          <table className="w-full border-collapse text-left text-xs text-natural-text">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-natural-muted">
                                {sheetData[0]?.map((head, idx) => (
                                  <th key={idx} className="p-4">{head}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {sheetData.slice(1).map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="p-4 font-semibold">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              )}

              {/* GOOGLE FORMS SUBTAB */}
              {activeSubTab === 'forms' && (
                <motion.div
                  key="forms"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="space-y-8 text-left"
                >
                  {/* Create Form Card */}
                  <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-natural-text flex items-center gap-2 tracking-tight">
                          <FileText className="w-5 h-5 text-purple-600" /> Support & Feedback intake Generator
                        </h3>
                        <p className="text-xs text-natural-muted mt-0.5">Generate custom-branded intake question sheets in Google Forms and receive customer surveys instantly.</p>
                      </div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-wider bg-purple-50 text-purple-600 px-2.5 py-1 rounded">
                        FORMS CREATION
                      </span>
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                      <p className="text-xs text-natural-muted font-semibold leading-relaxed">
                        Creates an active external feedback questionnaire with 3 targeted underwriting evaluation questions: Experience ratings, loan-tier preference, and custom rate requests.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={handleCreateForm}
                          disabled={isCreatingForm}
                          className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          {isCreatingForm ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Provisioning Form items...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> Provision Feedback Survey
                            </>
                          )}
                        </button>

                        {createdFormUrl && (
                          <a
                            href={createdFormUrl}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            className="flex-1 py-3.5 bg-white border-2 border-purple-500 text-purple-700 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:bg-purple-50 cursor-pointer"
                          >
                            Fill Form Out (Submit Test) <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Responses Card */}
                  <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-natural-border shadow-2xl shadow-natural-sage/5 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-natural-text flex items-center gap-2 tracking-tight">
                          <Clock className="w-5 h-5 text-natural-terracotta" /> Live survey tracker
                        </h3>
                        <p className="text-xs text-natural-muted mt-0.5">Pick any form created in your account to sync and visualize responder answers in real-time.</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={activeFormId}
                          onChange={(e) => setActiveFormId(e.target.value)}
                          className="px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold transition-all outline-none"
                        >
                          {formsList.length === 0 ? (
                            <option value="">No Forms found in Drive</option>
                          ) : (
                            formsList.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))
                          )}
                        </select>

                        <button
                          onClick={() => fetchFormResponses()}
                          disabled={isLoadingResponses || !activeFormId}
                          className="p-3 bg-natural-sage hover:bg-natural-sage/90 text-white rounded-xl transition-all cursor-pointer shadow-sm"
                          title="Fetch responses"
                        >
                          {isLoadingResponses ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {formResponses.length === 0 ? (
                      <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-[2rem] space-y-3 bg-slate-50/20">
                        <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="text-sm font-extrabold text-slate-500">No responses recorded yet</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-semibold">
                          Forms responses are pulled dynamically. Click "Fill Form Out" above to submit a test response, then click reload!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-natural-muted">
                          Submissions Dashboard ({formResponses.length} recorded)
                        </h4>

                        <div className="space-y-3">
                          {formResponses.map((resp, idx) => {
                            const answers = resp.answers ? Object.values(resp.answers) : [];
                            return (
                              <div key={resp.responseId || idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-3 shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                                  <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">
                                    Response ID: {resp.responseId?.slice(-6) || idx + 1}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold">
                                    {new Date(resp.lastSubmittedTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                
                                <div className="space-y-2 font-semibold text-xs text-natural-text">
                                  {answers.map((ans: any, ansIdx) => (
                                    <div key={ansIdx} className="space-y-0.5">
                                      <span className="text-natural-muted block font-bold text-[10px] uppercase tracking-wider">Answer {ansIdx + 1}:</span>
                                      <p className="font-extrabold text-slate-800">{ans.textAnswers?.answers?.[0]?.value || 'No Answer'}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      )}

    </div>
  );
}
