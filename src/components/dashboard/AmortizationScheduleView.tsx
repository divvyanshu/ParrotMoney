import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calculator, 
  Calendar, 
  IndianRupee, 
  Download, 
  Sliders, 
  Sparkles, 
  TrendingDown, 
  TrendingUp,
  Activity,
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Search,
  Filter,
  ArrowDownRight,
  PieChart as PieIcon,
  TableProperties,
  Zap,
  Printer,
  Layers,
  Info,
  Check
} from 'lucide-react';
import { calculateMonthlyPayment, calculateAmortizationSchedule, formatCurrency, cn } from '../../lib/utils';
import { LoanApplication } from '../../types';

interface AmortizationScheduleViewProps {
  loan: Partial<LoanApplication> & {
    id: string;
    loanAmount?: number;
    selectedBank?: { name: string; rate?: string | number; features?: string[] };
    fullName?: string;
  };
}

export const AmortizationScheduleView: React.FC<AmortizationScheduleViewProps> = ({ loan }) => {
  // Extract initial values from the selected loan application
  const initialPrincipal = loan.loanAmount || 4500000;
  const initialRate = typeof loan.selectedBank?.rate === 'number'
    ? loan.selectedBank.rate
    : parseFloat(String(loan.selectedBank?.rate || '8.45').replace('%', '')) || 8.45;

  // State for user interactions / what-if scenarios
  const [principal, setPrincipal] = useState<number>(initialPrincipal);
  const [annualRate, setAnnualRate] = useState<number>(initialRate);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [frequency, setFrequency] = useState<'yearly' | 'monthly'>('yearly');
  const [tableSearch, setTableSearch] = useState('');
  
  // Extra prepayment simulation
  const [enablePrepayment, setEnablePrepayment] = useState<boolean>(false);
  const [prepayAnnualAmount, setPrepayAnnualAmount] = useState<number>(50000);

  // Sync state if loan changes
  React.useEffect(() => {
    if (loan.loanAmount) setPrincipal(loan.loanAmount);
    if (loan.selectedBank?.rate) {
      const parsed = typeof loan.selectedBank.rate === 'number' 
        ? loan.selectedBank.rate 
        : parseFloat(String(loan.selectedBank.rate).replace('%', '')) || 8.45;
      setAnnualRate(parsed);
    }
  }, [loan.id, loan.loanAmount, loan.selectedBank?.rate]);

  // Calculations
  const emi = useMemo(() => {
    return calculateMonthlyPayment(principal, annualRate, tenureYears);
  }, [principal, annualRate, tenureYears]);

  const standardSchedule = useMemo(() => {
    return calculateAmortizationSchedule(principal, annualRate, tenureYears, frequency);
  }, [principal, annualRate, tenureYears, frequency]);

  // Prepayment accelerated schedule
  const prepaySchedule = useMemo(() => {
    if (!enablePrepayment || prepayAnnualAmount <= 0) return null;
    return calculateAmortizationSchedule(
      principal, 
      annualRate, 
      tenureYears, 
      frequency, 
      { type: 'absolute', value: prepayAnnualAmount, frequency: 'annual' }
    );
  }, [principal, annualRate, tenureYears, frequency, enablePrepayment, prepayAnnualAmount]);

  const activeSchedule = (enablePrepayment && prepaySchedule) ? prepaySchedule : standardSchedule;

  // High-level statistics
  const stats = useMemo(() => {
    const totalPaymentsCount = activeSchedule.length;
    const totalInterest = activeSchedule.reduce((acc, row) => acc + row.interest, 0);
    const totalPrincipal = activeSchedule.reduce((acc, row) => acc + row.principal, 0);
    const totalPayable = totalPrincipal + totalInterest;

    // Standard total without prepayment for comparison
    const standardInterest = standardSchedule.reduce((acc, row) => acc + row.interest, 0);
    const interestSaved = Math.max(0, standardInterest - totalInterest);

    const payoffYears = frequency === 'yearly' 
      ? totalPaymentsCount 
      : Math.ceil(totalPaymentsCount / 12);

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPrincipal: Math.round(totalPrincipal),
      totalPayable: Math.round(totalPayable),
      interestSaved: Math.round(interestSaved),
      payoffYears,
      yearsReduced: Math.max(0, tenureYears - payoffYears),
      pieData: [
        { name: 'Principal Loan', value: totalPrincipal, color: '#0F172A' },
        { name: 'Total Interest', value: totalInterest, color: '#10B981' }
      ]
    };
  }, [activeSchedule, standardSchedule, emi, frequency, tenureYears]);

  // Filtered table rows
  const filteredSchedule = useMemo(() => {
    if (!tableSearch) return activeSchedule;
    return activeSchedule.filter(row => 
      row.label.toLowerCase().includes(tableSearch.toLowerCase()) ||
      row.period.toString().includes(tableSearch)
    );
  }, [activeSchedule, tableSearch]);

  // Interactive LineChart controls & calculations
  const [chartViewMode, setChartViewMode] = useState<'line' | 'area'>('line');
  const [showBalanceLine, setShowBalanceLine] = useState<boolean>(true);
  const [showRatioLine, setShowRatioLine] = useState<boolean>(true);
  const [showBreakdownLines, setShowBreakdownLines] = useState<boolean>(false);

  // Enriched chart data with interest-to-principal ratio and payment proportions
  const chartData = useMemo(() => {
    return activeSchedule.map((row) => {
      const principalPaid = Math.max(0, row.principal);
      const interestPaid = Math.max(0, row.interest);
      const totalPeriodPayment = principalPaid + interestPaid;

      // Interest-to-Principal Ratio: (Interest Paid / Principal Paid)
      const ratio = principalPaid > 0 
        ? Number((interestPaid / principalPaid).toFixed(2)) 
        : 0;

      const interestPercent = totalPeriodPayment > 0 
        ? Number(((interestPaid / totalPeriodPayment) * 100).toFixed(1)) 
        : 0;
      const principalPercent = totalPeriodPayment > 0 
        ? Number(((principalPaid / totalPeriodPayment) * 100).toFixed(1)) 
        : 0;

      return {
        ...row,
        ratio,
        interestPercent,
        principalPercent,
        remainingBalance: Math.round(row.remainingBalance),
        principal: Math.round(principalPaid),
        interest: Math.round(interestPaid),
        payment: Math.round(totalPeriodPayment)
      };
    });
  }, [activeSchedule]);

  // Crossover Point: The period where Principal repayment surpasses Interest (Ratio <= 1.0)
  const crossoverPoint = useMemo(() => {
    return chartData.find(item => item.principal >= item.interest);
  }, [chartData]);

  // Initial and ending ratio dynamics
  const initialRatio = chartData.length > 0 ? chartData[0].ratio : 0;
  const finalRatio = chartData.length > 0 ? chartData[chartData.length - 1].ratio : 0;
  const midPointData = chartData.length > 0 ? chartData[Math.floor(chartData.length / 2)] : null;

  // Print Amortization Schedule formatted specifically for the loan table
  const handlePrintSchedule = () => {
    try {
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(printIframe);

      const frameDoc = printIframe.contentWindow?.document;
      if (!frameDoc) {
        window.print();
        return;
      }

      const rowsToPrint = filteredSchedule.length > 0 ? filteredSchedule : activeSchedule;
      const rowsHtml = rowsToPrint.map((row) => {
        const paidPercent = Math.min(100, Math.max(0, ((principal - row.remainingBalance) / principal) * 100));
        return `
          <tr>
            <td style="padding: 6px 10px; font-weight: 600; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${row.label}</td>
            <td style="padding: 6px 10px; text-align: right; border-bottom: 1px solid #e2e8f0; font-family: monospace, sans-serif;">₹${Math.round(row.payment).toLocaleString('en-IN')}</td>
            <td style="padding: 6px 10px; text-align: right; font-weight: 600; border-bottom: 1px solid #e2e8f0; font-family: monospace, sans-serif; color: #0f172a;">₹${Math.round(row.principal).toLocaleString('en-IN')}</td>
            <td style="padding: 6px 10px; text-align: right; font-weight: 600; border-bottom: 1px solid #e2e8f0; font-family: monospace, sans-serif; color: #047857;">₹${Math.round(row.interest).toLocaleString('en-IN')}</td>
            <td style="padding: 6px 10px; text-align: right; font-weight: 700; border-bottom: 1px solid #e2e8f0; font-family: monospace, sans-serif; color: #0f172a;">₹${Math.round(row.remainingBalance).toLocaleString('en-IN')}</td>
            <td style="padding: 6px 10px; text-align: center; border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #475569;">${paidPercent.toFixed(0)}%</td>
          </tr>
        `;
      }).join('');

      const printHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Loan Amortization Schedule - #${loan.id?.slice(-8).toUpperCase() || 'HL-9842'}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 6px 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .brand-name {
              font-size: 22px;
              font-weight: 900;
              letter-spacing: -0.5px;
              margin: 0;
              color: #0f172a;
            }
            .brand-name span {
              color: #10b981;
            }
            .brand-sub {
              font-size: 10px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              margin-top: 2px;
            }
            .header-meta {
              text-align: right;
              font-size: 10px;
              color: #475569;
              line-height: 1.4;
            }
            .meta-id {
              font-size: 12px;
              font-weight: 800;
              color: #0f172a;
            }
            .title-section {
              margin-bottom: 12px;
            }
            .doc-title {
              font-size: 15px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .doc-subtitle {
              font-size: 10.5px;
              color: #64748b;
              margin: 2px 0 0 0;
            }
            .summary-box {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 6px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px 12px;
              margin-bottom: 14px;
            }
            .kpi-item {
              display: flex;
              flex-direction: column;
            }
            .kpi-label {
              font-size: 8.5px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748b;
              margin-bottom: 1px;
            }
            .kpi-value {
              font-size: 12px;
              font-weight: 800;
              color: #0f172a;
            }
            .kpi-value.accent {
              color: #047857;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
              page-break-inside: auto;
            }
            thead {
              display: table-header-group;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            tbody tr:nth-child(even) {
              background-color: #f8fafc;
            }
            th {
              background-color: #0f172a;
              color: #ffffff;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-size: 8.5px;
              font-weight: 700;
              padding: 7px 10px;
            }
            .footer-section {
              margin-top: 16px;
              padding-top: 8px;
              border-top: 1px solid #e2e8f0;
              font-size: 8.5px;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <h1 class="brand-name">PARROT<span>MONEY</span></h1>
              <div class="brand-sub">AI Home Loan Marketplace • Official Loan Schedule</div>
            </div>
            <div class="header-meta">
              <div class="meta-id">Application Ref: #${loan.id?.slice(-8).toUpperCase() || 'HL-9842'}</div>
              <div>Applicant: ${loan.fullName || 'Registered Applicant'}</div>
              <div>Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <div class="title-section">
            <h2 class="doc-title">Loan Amortization & Repayment Schedule</h2>
            <p class="doc-subtitle">Schedule Breakdown (${frequency === 'yearly' ? `Yearly Summary (${tenureYears} Years)` : `Monthly Detail (${tenureYears * 12} Months)`}, Rate: ${annualRate}% P.A.)</p>
          </div>

          <div class="summary-box">
            <div class="kpi-item">
              <span class="kpi-label">Lending Bank</span>
              <span class="kpi-value">${loan.selectedBank?.name || 'HDFC Bank'}</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-label">Principal Amount</span>
              <span class="kpi-value">₹${principal.toLocaleString('en-IN')}</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-label">Interest Rate</span>
              <span class="kpi-value">${annualRate}% P.A.</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-label">Monthly EMI</span>
              <span class="kpi-value accent">₹${stats.monthlyEmi.toLocaleString('en-IN')}</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-label">Tenure</span>
              <span class="kpi-value">${tenureYears} Years (${tenureYears * 12} Mos)</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-label">Total Interest</span>
              <span class="kpi-value">₹${stats.totalInterest.toLocaleString('en-IN')}</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-label">Total Outflow</span>
              <span class="kpi-value">₹${stats.totalPayable.toLocaleString('en-IN')}</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-label">Prepayment Status</span>
              <span class="kpi-value" style="font-size: 10px;">
                ${enablePrepayment ? `₹${prepayAnnualAmount.toLocaleString('en-IN')}/yr (Saved ₹${stats.interestSaved.toLocaleString('en-IN')})` : 'Standard'}
              </span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Period</th>
                <th style="text-align: right;">Installment Payment</th>
                <th style="text-align: right;">Principal Paid</th>
                <th style="text-align: right;">Interest Paid</th>
                <th style="text-align: right;">Ending Balance</th>
                <th style="text-align: center;">% Repaid</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer-section">
            <span>Indicative schedule based on standard reducing balance amortization. Actual figures may differ slightly based on bank calendar conventions.</span>
            <span>ParrotMoney Technologies Pvt Ltd • www.parrotmoney.in</span>
          </div>
        </body>
        </html>
      `;

      frameDoc.open();
      frameDoc.write(printHtml);
      frameDoc.close();

      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
        } catch (e) {
          console.error("Iframe print error, invoking window.print():", e);
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(printIframe)) {
              document.body.removeChild(printIframe);
            }
          }, 3000);
        }
      }, 300);
    } catch (err) {
      console.error("Print execution failed:", err);
      window.print();
    }
  };

  // Export Amortization Table to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['Period', 'Payment (₹)', 'Principal Component (₹)', 'Interest Component (₹)', 'Remaining Balance (₹)'];
      const rows = activeSchedule.map(row => [
        `"${row.label}"`,
        Math.round(row.payment),
        Math.round(row.principal),
        Math.round(row.interest),
        Math.round(row.remainingBalance)
      ]);

      const csvContent = [
        `"Loan Amortization Schedule - Application #${loan.id?.slice(-8).toUpperCase() || 'DEMO'}"`,
        `"Bank Partner: ${loan.selectedBank?.name || 'HDFC Bank'}"`,
        `"Principal: ₹${principal}"`,
        `"Interest Rate: ${annualRate}% P.A."`,
        `"Tenure: ${tenureYears} Years"`,
        `"Monthly EMI: ₹${stats.monthlyEmi}"`,
        '',
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Amortization_Schedule_${loan.id?.slice(-8).toUpperCase() || 'Loan'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header with Application Context */}
      <div className="bg-white rounded-[2.5rem] border border-natural-border shadow-xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-natural-border/60">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-emerald-600" /> EMI Calculator Engine
              </span>
              <span className="text-[10px] font-mono font-bold text-natural-muted bg-slate-100 px-2 py-0.5 rounded">
                Application #{loan.id?.slice(-8).toUpperCase() || 'HL-9842'}
              </span>
              <span className="text-[10px] font-bold text-natural-sage bg-natural-bg px-2.5 py-0.5 rounded-md border border-natural-border/60">
                Lender: {loan.selectedBank?.name || 'HDFC Bank'}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-natural-sage tracking-tight italic mt-1">
              Loan Amortization & Repayment Schedule
            </h3>
            <p className="text-xs md:text-sm text-natural-muted font-medium mt-0.5">
              Comprehensive month-by-month and year-by-year breakdown of principal repayment and interest amortization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              onClick={handlePrintSchedule}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border-none"
              title="Print Amortization Schedule formatted specifically for the loan table"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Amortization Schedule</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-natural-sage hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border-none"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 2. KPI Summary Banner Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-natural-bg/50 p-4 rounded-2xl border border-natural-border/60 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted block">
              Monthly Installment (EMI)
            </span>
            <p className="text-2xl font-black text-natural-sage tracking-tight">
              ₹{stats.monthlyEmi.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Fixed Monthly Debit
            </span>
          </div>

          <div className="bg-natural-bg/50 p-4 rounded-2xl border border-natural-border/60 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted block">
              Principal Loan Amount
            </span>
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              ₹{stats.totalPrincipal.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-natural-muted font-medium">
              100% Disbursed Capital
            </span>
          </div>

          <div className="bg-natural-bg/50 p-4 rounded-2xl border border-natural-border/60 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted block">
              Total Interest Payable
            </span>
            <p className="text-2xl font-black text-emerald-700 tracking-tight">
              ₹{stats.totalInterest.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-natural-muted font-medium">
              Over {stats.payoffYears} Years Tenure
            </span>
          </div>

          <div className="bg-natural-bg/50 p-4 rounded-2xl border border-natural-border/60 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted block">
              Total Amount Payable
            </span>
            <p className="text-2xl font-black text-indigo-900 tracking-tight">
              ₹{stats.totalPayable.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-indigo-700 font-bold">
              Principal + Total Interest
            </span>
          </div>
        </div>

        {/* Prepayment Savings Alert if active */}
        {enablePrepayment && stats.interestSaved > 0 && (
          <div className="p-4 bg-emerald-100/80 border border-emerald-300 text-emerald-950 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black uppercase tracking-wide">
                  Prepayment Acceleration Benefit Active
                </h5>
                <p className="text-xs text-emerald-900 font-medium">
                  By prepaying <strong>₹{prepayAnnualAmount.toLocaleString('en-IN')}/year</strong>, you save <strong>{formatCurrency(stats.interestSaved)}</strong> in total interest and close your loan <strong>{stats.yearsReduced} years early</strong>!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Interactive Scenario Sliders */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-natural-sage flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" /> Interactive Schedule Adjusters
            </span>
            <span className="text-[10px] font-bold text-natural-muted">
              Dynamically Recalculates Schedule
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Principal Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-natural-muted">Loan Amount:</span>
                <span className="font-black text-natural-sage bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  ₹{principal.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={1000000}
                max={20000000}
                step={100000}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[9px] text-natural-muted font-bold">
                <span>₹10L</span>
                <span>₹1Cr</span>
                <span>₹2Cr</span>
              </div>
            </div>

            {/* Interest Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-natural-muted">Interest Rate (ROI):</span>
                <span className="font-black text-natural-sage bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {annualRate.toFixed(2)}% P.A.
                </span>
              </div>
              <input
                type="range"
                min={7.0}
                max={15.0}
                step={0.05}
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[9px] text-natural-muted font-bold">
                <span>7.0%</span>
                <span>10.0%</span>
                <span>15.0%</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-natural-muted">Tenure:</span>
                <span className="font-black text-natural-sage bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {tenureYears} Years ({tenureYears * 12} Mos)
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[9px] text-natural-muted font-bold">
                <span>5 Yrs</span>
                <span>15 Yrs</span>
                <span>30 Yrs</span>
              </div>
            </div>
          </div>

          {/* Prepayment Toggle Sub-bar */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enablePrepayment}
                onChange={(e) => setEnablePrepayment(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-natural-sage">
                Simulate Annual Prepayment (Accelerate Payoff)
              </span>
            </label>

            {enablePrepayment && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-natural-muted">Annual Prepayment:</span>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step={10000}
                    min={10000}
                    value={prepayAnnualAmount}
                    onChange={(e) => setPrepayAnnualAmount(Number(e.target.value))}
                    className="w-24 text-xs font-black text-natural-sage focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Graphical Amortization Trajectory Chart (Interactive LineChart & Progression) */}
      <div className="bg-white rounded-[2.5rem] border border-natural-border shadow-xl p-6 md:p-8 space-y-6 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-natural-border/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600" /> Interactive Recharts Visualizer
              </span>
              {crossoverPoint && (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-indigo-600" /> Crossover: {crossoverPoint.label}
                </span>
              )}
            </div>
            <h4 className="text-xl md:text-2xl font-black text-natural-sage tracking-tight">
              Declining Principal Balance & Payment Ratio Dynamics
            </h4>
            <p className="text-xs md:text-sm text-natural-muted font-medium mt-0.5">
              Interactive visualization tracking the declining loan balance and the shifting interest-to-principal payment ratio over time.
            </p>
          </div>

          {/* Interactive Chart Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle: LineChart vs Area */}
            <div className="flex items-center gap-1 p-1 bg-natural-bg rounded-xl border border-natural-border/60">
              <button
                type="button"
                onClick={() => setChartViewMode('line')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  chartViewMode === 'line'
                    ? "bg-white text-natural-sage shadow-xs border border-natural-border"
                    : "text-natural-muted hover:text-natural-sage"
                )}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>LineChart (Ratio & Balance)</span>
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('area')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  chartViewMode === 'area'
                    ? "bg-white text-natural-sage shadow-xs border border-natural-border"
                    : "text-natural-muted hover:text-natural-sage"
                )}
              >
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>Area Progression</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Line Filters and Quick Legend */}
        {chartViewMode === 'line' && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-natural-muted mr-1">
                Toggle Series:
              </span>

              {/* Declining Balance Line Toggle */}
              <button
                type="button"
                onClick={() => setShowBalanceLine(!showBalanceLine)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                  showBalanceLine
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs"
                    : "bg-white text-slate-400 border-slate-200 opacity-60"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full", showBalanceLine ? "bg-emerald-500" : "bg-slate-300")} />
                <span>Declining Principal Balance (Left Y-Axis)</span>
                {showBalanceLine && <Check className="w-3 h-3 text-emerald-600 ml-0.5" />}
              </button>

              {/* Interest-to-Principal Ratio Line Toggle */}
              <button
                type="button"
                onClick={() => setShowRatioLine(!showRatioLine)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                  showRatioLine
                    ? "bg-indigo-50 text-indigo-900 border-indigo-300 shadow-2xs"
                    : "bg-white text-slate-400 border-slate-200 opacity-60"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full", showRatioLine ? "bg-indigo-500" : "bg-slate-300")} />
                <span>Interest-to-Principal Ratio (Right Y-Axis)</span>
                {showRatioLine && <Check className="w-3 h-3 text-indigo-600 ml-0.5" />}
              </button>

              {/* Breakdown Lines Toggle */}
              <button
                type="button"
                onClick={() => setShowBreakdownLines(!showBreakdownLines)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                  showBreakdownLines
                    ? "bg-amber-50 text-amber-900 border-amber-300 shadow-2xs"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Show Principal & Interest Components</span>
                {showBreakdownLines && <Check className="w-3 h-3 text-amber-600 ml-0.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-natural-muted font-medium">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Hover anywhere to inspect payment composition</span>
            </div>
          </div>
        )}

        {/* 4A. Recharts LineChart Visualization */}
        {chartViewMode === 'line' ? (
          <div className="h-80 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                margin={{ top: 15, right: 35, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                
                <XAxis 
                  dataKey="label" 
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  interval={frequency === 'monthly' ? Math.max(12, Math.floor(chartData.length / 10)) : Math.max(1, Math.floor(chartData.length / 10))}
                />

                {/* Left Y-Axis: Outstanding Balance */}
                <YAxis 
                  yAxisId="balance"
                  orientation="left"
                  tick={{ fill: '#047857', fontSize: 11 }} 
                  tickFormatter={(val) => {
                    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
                    return `₹${Math.round(val / 100000)}L`;
                  }}
                  domain={[0, 'auto']}
                  label={{ 
                    value: 'Remaining Principal (₹)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    fill: '#047857', 
                    fontSize: 10, 
                    fontWeight: 700 
                  }}
                />

                {/* Right Y-Axis: Interest-to-Principal Payment Ratio */}
                <YAxis 
                  yAxisId="ratio"
                  orientation="right"
                  tick={{ fill: '#4F46E5', fontSize: 11 }}
                  tickFormatter={(val) => `${Number(val).toFixed(1)}x`}
                  domain={[0, 'auto']}
                  label={{ 
                    value: 'Interest / Principal Ratio', 
                    angle: 90, 
                    position: 'insideRight', 
                    fill: '#4F46E5', 
                    fontSize: 10, 
                    fontWeight: 700 
                  }}
                />

                {/* Reference Line for 1.0x Ratio Parity */}
                {showRatioLine && (
                  <ReferenceLine 
                    yAxisId="ratio"
                    y={1.0} 
                    stroke="#6366F1" 
                    strokeDasharray="4 4" 
                    strokeOpacity={0.6}
                    label={{ 
                      value: '1.0x Parity (50/50 Split)', 
                      position: 'insideTopRight', 
                      fill: '#4F46E5', 
                      fontSize: 10, 
                      fontWeight: 700 
                    }}
                  />
                )}

                {/* Reference Line for Crossover Milestone */}
                {crossoverPoint && (
                  <ReferenceLine 
                    yAxisId="balance"
                    x={crossoverPoint.label} 
                    stroke="#10B981" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: `Crossover: ${crossoverPoint.label}`, 
                      position: 'top', 
                      fill: '#047857', 
                      fontSize: 10, 
                      fontWeight: 700 
                    }}
                  />
                )}

                {/* Interactive Tooltip with Rich Payment Ratio Breakdown */}
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0]?.payload;
                      if (!data) return null;

                      const remainingBal = data.remainingBalance ?? 0;
                      const ratio = data.ratio ?? 0;
                      const principalPaid = data.principal ?? 0;
                      const interestPaid = data.interest ?? 0;
                      const percentRepaid = Math.min(100, Math.max(0, ((principal - remainingBal) / principal) * 100));

                      return (
                        <div className="bg-[#0F172A] text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 text-xs space-y-3 min-w-[270px] pointer-events-none">
                          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="font-bold text-white text-sm">{label}</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              {percentRepaid.toFixed(1)}% Repaid
                            </span>
                          </div>

                          <div className="space-y-2 font-mono">
                            <div className="flex items-center justify-between text-emerald-400">
                              <span className="flex items-center gap-1.5 text-[11px] text-slate-300 font-sans">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                                Declining Principal:
                              </span>
                              <span className="font-bold text-white">₹{remainingBal.toLocaleString('en-IN')}</span>
                            </div>

                            <div className="flex items-center justify-between text-indigo-300">
                              <span className="flex items-center gap-1.5 text-[11px] text-slate-300 font-sans">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                                Interest/Principal Ratio:
                              </span>
                              <span className="font-bold text-white bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-500/30">
                                {ratio}x
                              </span>
                            </div>

                            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-sans">
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Principal Paid</span>
                                <span className="font-bold text-white">₹{principalPaid.toLocaleString('en-IN')}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Interest Cost</span>
                                <span className="font-bold text-amber-400">₹{interestPaid.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Visual Payment Composition Ratio Bar */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-800">
                            <div className="flex justify-between text-[10px] text-slate-300 font-sans font-medium">
                              <span className="text-amber-300">Interest: {data.interestPercent}%</span>
                              <span className="text-emerald-300">Principal: {data.principalPercent}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700">
                              <div 
                                className="bg-amber-400 h-full transition-all duration-300" 
                                style={{ width: `${data.interestPercent}%` }} 
                              />
                              <div 
                                className="bg-emerald-500 h-full transition-all duration-300" 
                                style={{ width: `${data.principalPercent}%` }} 
                              />
                            </div>
                            <p className="text-[9.5px] text-slate-400 text-center font-sans pt-0.5">
                              {ratio > 1 
                                ? `Early phase: ₹${ratio.toFixed(2)} interest per ₹1.00 principal debt.`
                                : ratio === 1
                                ? `Parity point: 50% interest, 50% principal.`
                                : `Principal dominant: Only ₹${ratio.toFixed(2)} interest per ₹1.00 principal.`}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend />

                {/* Line 1: Declining Principal Balance */}
                {showBalanceLine && (
                  <Line 
                    yAxisId="balance"
                    type="monotone" 
                    dataKey="remainingBalance" 
                    name="Declining Principal Balance" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    dot={{ r: 2.5, fill: '#10B981', strokeWidth: 1, stroke: '#FFFFFF' }}
                    activeDot={{ r: 6, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                )}

                {/* Line 2: Interest-to-Principal Payment Ratio */}
                {showRatioLine && (
                  <Line 
                    yAxisId="ratio"
                    type="monotone" 
                    dataKey="ratio" 
                    name="Interest-to-Principal Ratio" 
                    stroke="#6366F1" 
                    strokeWidth={2.5} 
                    strokeDasharray="4 4"
                    dot={{ r: 2.5, fill: '#6366F1', strokeWidth: 1, stroke: '#FFFFFF' }}
                    activeDot={{ r: 6, fill: '#6366F1', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                )}

                {/* Optional Component Lines */}
                {showBreakdownLines && (
                  <>
                    <Line 
                      yAxisId="balance"
                      type="monotone" 
                      dataKey="principal" 
                      name="Principal Component" 
                      stroke="#0F172A" 
                      strokeWidth={1.5} 
                      dot={false}
                    />
                    <Line 
                      yAxisId="balance"
                      type="monotone" 
                      dataKey="interest" 
                      name="Interest Component" 
                      stroke="#F59E0B" 
                      strokeWidth={1.5} 
                      dot={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* 4B. Area Progression Fallback View */
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeSchedule} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  interval={frequency === 'monthly' ? 24 : 2}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 11 }} 
                  tickFormatter={(val) => `₹${Number((val / 100000).toFixed(0))}L`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    formatCurrency(Number(value)),
                    name === 'remainingBalance' ? 'Outstanding Loan Balance' : name === 'principal' ? 'Principal Repaid' : 'Interest Paid'
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    color: '#F8FAFC', 
                    borderRadius: '16px', 
                    border: 'none', 
                    fontSize: '12px' 
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="remainingBalance" 
                  name="Remaining Loan Balance" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#balanceGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="principal" 
                  name="Principal Component" 
                  stroke="#0F172A" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#principalGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 4C. Interactive Ratio & Paydown Milestone Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-2 border-t border-natural-border/60">
          <div className="p-3.5 bg-natural-bg/60 rounded-2xl border border-natural-border/60">
            <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted block">
              Initial Phase Ratio
            </span>
            <p className="text-xl font-black text-indigo-950 mt-0.5">
              {initialRatio.toFixed(2)}x
            </p>
            <span className="text-[10px] text-natural-muted font-medium">
              ₹{initialRatio.toFixed(2)} interest per ₹1 principal
            </span>
          </div>

          <div className="p-3.5 bg-natural-bg/60 rounded-2xl border border-natural-border/60">
            <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted block">
              Crossover Tipping Point
            </span>
            <p className="text-xl font-black text-emerald-700 mt-0.5">
              {crossoverPoint ? crossoverPoint.label : 'None'}
            </p>
            <span className="text-[10px] text-emerald-800 font-bold">
              {crossoverPoint ? 'Principal surpasses interest' : 'Standard schedule'}
            </span>
          </div>

          <div className="p-3.5 bg-natural-bg/60 rounded-2xl border border-natural-border/60">
            <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted block">
              Mid-Tenure Remaining
            </span>
            <p className="text-xl font-black text-slate-800 mt-0.5">
              {midPointData ? `₹${(midPointData.remainingBalance / 100000).toFixed(1)}L` : '—'}
            </p>
            <span className="text-[10px] text-natural-muted font-medium">
              {midPointData ? `${Math.round((midPointData.remainingBalance / principal) * 100)}% of principal remains` : 'At 50% tenure'}
            </span>
          </div>

          <div className="p-3.5 bg-natural-bg/60 rounded-2xl border border-natural-border/60">
            <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted block">
              Maturity Phase Ratio
            </span>
            <p className="text-xl font-black text-emerald-900 mt-0.5">
              {finalRatio.toFixed(2)}x
            </p>
            <span className="text-[10px] text-emerald-700 font-bold">
              {finalRatio < 0.1 ? '>90% clears principal' : 'Final installment'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Comprehensive Amortization Table */}
      <div className="bg-white rounded-[2.5rem] border border-natural-border shadow-xl p-6 md:p-8 space-y-6 print:shadow-none print:border-none print:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-natural-border/60">
          <div>
            <h4 className="text-xl font-black text-natural-sage tracking-tight flex items-center gap-2">
              <TableProperties className="w-5 h-5 text-emerald-600" />
              Amortization Payment Breakdown Table
            </h4>
            <p className="text-xs text-natural-muted">
              Scheduled installment dates, principal allocation, interest cost, and ending balance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 print:hidden">
            {/* Quick Print Table Button */}
            <button
              onClick={handlePrintSchedule}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Print Amortization Schedule formatted specifically for the loan table"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              <span>Print Schedule</span>
            </button>

            {/* Yearly / Monthly Toggle */}
            <div className="flex items-center gap-1 p-1 bg-natural-bg rounded-xl border border-natural-border/60">
              <button
                onClick={() => setFrequency('yearly')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  frequency === 'yearly'
                    ? "bg-white text-natural-sage shadow-xs border border-natural-border"
                    : "text-natural-muted hover:text-natural-sage"
                )}
              >
                Yearly View ({tenureYears} Years)
              </button>
              <button
                onClick={() => setFrequency('monthly')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  frequency === 'monthly'
                    ? "bg-white text-natural-sage shadow-xs border border-natural-border"
                    : "text-natural-muted hover:text-natural-sage"
                )}
              >
                Monthly View ({tenureYears * 12} Months)
              </button>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-natural-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search year / month..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="bg-natural-bg/40 pl-8 pr-3 py-1.5 rounded-xl text-xs text-natural-sage placeholder-natural-muted/60 border border-natural-border/60 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto max-h-[500px] custom-scrollbar border border-natural-border/60 rounded-2xl print:max-h-none print:overflow-visible print:border-slate-300 print:rounded-none">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-natural-border text-natural-muted uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4 text-right">Payment</th>
                <th className="py-3.5 px-4 text-right text-slate-900">Principal</th>
                <th className="py-3.5 px-4 text-right text-emerald-700">Interest</th>
                <th className="py-3.5 px-4 text-right">Ending Balance</th>
                <th className="py-3.5 px-4 text-center">Paid %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-border/50 font-sans">
              {filteredSchedule.map((row) => {
                const paidPercent = Math.min(100, Math.max(0, ((principal - row.remainingBalance) / principal) * 100));
                
                return (
                  <tr key={row.period} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-natural-sage">
                      {row.label}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600">
                      ₹{Math.round(row.payment).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{Math.round(row.principal).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      ₹{Math.round(row.interest).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-natural-sage">
                      ₹{Math.round(row.remainingBalance).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${paidPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-natural-muted">
                          {paidPercent.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
